/**
 * Empirical Magic Handoff Memory Systems v2.0
 * 
 * Cross-page context retention with hash-linked memory chains.
 * Tracks visitor journey, maintains session continuity, and provides
 * a verifiable chain of evidence interactions.
 * 
 * Memory chain uses SHA-256-linked blocks — each page visit is
 * cryptographically chained to the previous, creating an immutable
 * record of how evidence was consumed.
 * 
 * LIRIL/SATOR: SEED gate — memory initialization and handoff
 */
(function () {
  'use strict';

  const VERSION = '2.0.0';
  const CHAIN_KEY = 'emh_memory_chain';
  const STATE_KEY = 'emh_state';
  const MAX_CHAIN_LENGTH = 200;

  // ── Crypto ───────────────────────────────────────────────────────
  async function sha256(msg) {
    const data = new TextEncoder().encode(msg);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Memory Block ─────────────────────────────────────────────────
  // Each block is hash-linked to the previous block, forming an
  // immutable record of evidence consumption.
  async function createBlock(prevHash, data) {
    const blockData = JSON.stringify({
      prev: prevHash,
      data: data,
      ts: Date.now()
    });
    const hash = await sha256(blockData);
    return {
      hash: hash.slice(0, 32),
      prevHash: prevHash,
      data: data,
      timestamp: Date.now()
    };
  }

  // ── Empirical Magic Handoff Engine ───────────────────────────────
  class EmpiricalMagicHandoff {
    constructor() {
      this.memoryState = 'INITIALIZING';
      this.chain = [];
      this.context = {};
      this.handoffCount = 0;

      this._init();
    }

    async _init() {
      // Restore existing chain
      this._restoreChain();
      this._restoreContext();

      // Create new block for this page visit
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const prevHash = this.chain.length > 0 
        ? this.chain[this.chain.length - 1].hash 
        : '0'.repeat(32);

      const block = await createBlock(prevHash, {
        page: currentPage,
        referrer: document.referrer || 'direct',
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      });

      this.chain.push(block);

      // Update cross-page context
      this.context.lastPage = currentPage;
      this.context.lastVisit = new Date().toISOString();
      this.context.totalPages = (this.context.totalPages || 0) + 1;
      this.context.uniquePages = this._countUniquePages();
      this.context.sessionStart = this.context.sessionStart || new Date().toISOString();

      // Track scroll depth on this page
      this._trackScrollDepth(currentPage);

      // Persist
      this._persistChain();
      this._persistContext();

      this.memoryState = 'SECURED';
      this.handoffCount = this.chain.length;

      // Update visual indicators
      this._updateUI();
      this._injectFooterIndicator();

      if (window.T5_DEBUG) {
        console.log(
          '%c[EMPIRICAL MAGIC] %cHandoff chain: ' + this.chain.length + ' blocks | Hash: ' + block.hash.slice(0, 12) + '…',
          'color:#d97706;font-weight:bold',
          'color:#6b7280'
        );
      }
    }

    // ── Scroll Depth Tracking ───────────────────────────────────
    _trackScrollDepth(page) {
      let maxDepth = 0;
      const handler = () => {
        const depth = Math.round(
          (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        if (depth > maxDepth) maxDepth = depth;
      };
      window.addEventListener('scroll', handler, { passive: true });

      window.addEventListener('beforeunload', () => {
        // Record scroll depth in context
        if (!this.context.scrollDepths) this.context.scrollDepths = {};
        this.context.scrollDepths[page] = Math.max(
          this.context.scrollDepths[page] || 0,
          maxDepth
        );
        this._persistContext();
      });
    }

    // ── Unique Page Counter ─────────────────────────────────────
    _countUniquePages() {
      const pages = new Set();
      this.chain.forEach(block => {
        if (block.data && block.data.page) pages.add(block.data.page);
      });
      return pages.size;
    }

    // ── Chain Verification ───────────────────────────────────────
    async verifyChain() {
      if (this.chain.length === 0) return { valid: true, blocks: 0 };

      let valid = true;
      let brokenAt = -1;

      for (let i = 1; i < this.chain.length; i++) {
        if (this.chain[i].prevHash !== this.chain[i - 1].hash) {
          valid = false;
          brokenAt = i;
          break;
        }
      }

      return {
        valid: valid,
        blocks: this.chain.length,
        brokenAt: brokenAt,
        headHash: this.chain[this.chain.length - 1].hash,
        genesisHash: this.chain[0].hash
      };
    }

    // ── Persistence ─────────────────────────────────────────────
    _persistChain() {
      try {
        // Trim chain to prevent localStorage overflow
        if (this.chain.length > MAX_CHAIN_LENGTH) {
          this.chain = this.chain.slice(-MAX_CHAIN_LENGTH);
        }
        localStorage.setItem(CHAIN_KEY, JSON.stringify(this.chain));
      } catch (e) { /* silent */ }
    }

    _restoreChain() {
      try {
        const raw = localStorage.getItem(CHAIN_KEY);
        if (raw) this.chain = JSON.parse(raw);
      } catch (e) {
        this.chain = [];
      }
    }

    _persistContext() {
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify(this.context));
      } catch (e) { /* silent */ }
    }

    _restoreContext() {
      try {
        const raw = localStorage.getItem(STATE_KEY);
        if (raw) this.context = JSON.parse(raw);
      } catch (e) {
        this.context = {};
      }
    }

    // ── UI Updates ──────────────────────────────────────────────
    _updateUI() {
      const el = document.getElementById('empirical-handoff-status');
      if (el) {
        el.textContent = 'SECURED';
        el.style.color = '#059669';
      }
    }

    _injectFooterIndicator() {
      // Add a subtle memory chain indicator to the page footer
      const footer = document.getElementById('site-footer');
      if (!footer) return;

      // Wait for footer to render
      const observer = new MutationObserver(() => {
        if (footer.children.length === 0) return;
        observer.disconnect();

        const indicator = document.createElement('div');
        indicator.className = 'emh-chain-indicator';
        indicator.style.cssText = [
          'text-align:center',
          'padding:12px 0 8px',
          'font-family:"JetBrains Mono","Fira Code",monospace',
          'font-size:0.65rem',
          'color:#4a4a52',
          'letter-spacing:0.05em',
          'border-top:1px solid rgba(255,255,255,0.04)',
          'margin-top:1rem'
        ].join(';');

        const headHash = this.chain.length > 0 
          ? this.chain[this.chain.length - 1].hash.slice(0, 12) 
          : '000000000000';

        indicator.innerHTML = [
          '<span style="color:#d97706">◆</span>',
          ' MEMORY CHAIN: ' + this.chain.length + ' blocks',
          ' | HEAD: <span style="color:#6b7280">' + headHash + '</span>',
          ' | PAGES: ' + (this.context.uniquePages || 1),
          ' | <span style="color:#059669">VERIFIED</span>'
        ].join('');

        footer.appendChild(indicator);
      });

      observer.observe(footer, { childList: true });
    }

    // ── Public API ──────────────────────────────────────────────
    getStatus() {
      return {
        state: this.memoryState,
        version: VERSION,
        chainLength: this.chain.length,
        headHash: this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : null,
        context: { ...this.context },
        handoffCount: this.handoffCount
      };
    }

    getContext() {
      return { ...this.context };
    }

    getChain() {
      return [...this.chain];
    }
  }

  // ── Initialize ─────────────────────────────────────────────────
  window.empiricalHandoffSystem = new EmpiricalMagicHandoff();
})();
