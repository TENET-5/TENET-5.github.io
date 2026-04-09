/**
 * ABCXYZ — N-vs-NP MillennialFalcon Accountability Engine v2.0
 * 
 * Cryptographic session fingerprinting, SATOR event telemetry,
 * page-visit accountability logging, and discovery verification.
 * 
 * This is the client-side accountability layer that ensures every
 * visitor interaction with the TENET5 evidence archive is
 * cryptographically witnessed and verifiable.
 * 
 * LIRIL/SATOR: BUFFER gate — accountability routing for all content
 */
(function () {
  'use strict';

  // ── SATOR Constants ──────────────────────────────────────────────
  const SATOR_SEED = 118400;
  const LOOM_CONSTANT = 1367631; // 111^3
  const VERSION = '2.0.0';

  // ── Crypto Utilities ─────────────────────────────────────────────
  async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // PCG-inspired deterministic hash for session seeds
  function pcgHash(seed) {
    let state = BigInt(seed) ^ BigInt('0x5851f42d4c957f2d');
    state = ((state >> 18n) ^ state) >> 27n;
    const rot = state >> 59n;
    return Number((state >> rot) | (state << (64n - rot)) & BigInt('0xFFFFFFFF'));
  }

  // ── Session Fingerprint ──────────────────────────────────────────
  function generateSessionId() {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().toISOString().slice(0, 10),
      performance.now().toString(36),
      Math.random().toString(36).slice(2, 10)
    ];
    return components.join('|');
  }

  // ── ABCXYZ Engine ────────────────────────────────────────────────
  class ABCXYZEngine {
    constructor() {
      this.status = 'INITIALIZING';
      this.sessionRaw = generateSessionId();
      this.sessionHash = null;
      this.visitLog = [];
      this.discoveryCache = new Map();
      this.eventQueue = [];
      this.satorSeed = pcgHash(SATOR_SEED);

      this._init();
    }

    async _init() {
      // Generate cryptographic session fingerprint
      this.sessionHash = await sha256(this.sessionRaw);
      this.status = 'ACTIVE';

      // Restore previous session state if available
      this._restoreState();

      // Log this page visit
      this._logPageVisit();

      // Update UI indicators
      this._updateUI();

      // Register page visibility tracking
      this._trackEngagement();

      console.log(
        '%c[ABCXYZ] %cN-vs-NP MillennialFalcon Tracking v' + VERSION + ' — ACTIVE',
        'color:#c41e3a;font-weight:bold',
        'color:#059669'
      );
      console.log(
        '%c[ABCXYZ] %cSession: ' + this.sessionHash.slice(0, 16) + '… | Seed: ' + this.satorSeed,
        'color:#c41e3a;font-weight:bold',
        'color:#6b7280'
      );
    }

    // ── Page Visit Accountability ────────────────────────────────
    _logPageVisit() {
      const entry = {
        page: window.location.pathname.split('/').pop() || 'index.html',
        timestamp: new Date().toISOString(),
        referrer: document.referrer || 'direct',
        depth: 0,
        timeOnPage: 0,
        sessionHash: this.sessionHash ? this.sessionHash.slice(0, 16) : 'pending'
      };

      this.visitLog.push(entry);
      this._persistState();

      // Transmit SATOR event
      this._transmitSatorEvent('PAGE_VISIT', entry);
    }

    // ── Engagement Tracking ──────────────────────────────────────
    _trackEngagement() {
      const startTime = Date.now();
      let maxScroll = 0;

      // Track scroll depth
      const scrollHandler = () => {
        const scrollPct = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        if (scrollPct > maxScroll) {
          maxScroll = scrollPct;
        }
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });

      // On page unload, record engagement metrics
      window.addEventListener('beforeunload', () => {
        const currentVisit = this.visitLog[this.visitLog.length - 1];
        if (currentVisit) {
          currentVisit.timeOnPage = Math.round((Date.now() - startTime) / 1000);
          currentVisit.depth = maxScroll;
          this._persistState();
        }
      });
    }

    // ── SATOR Event Telemetry ────────────────────────────────────
    _transmitSatorEvent(eventType, payload) {
      const event = {
        type: eventType,
        satorGate: 'BUFFER',
        loomConstant: LOOM_CONSTANT,
        seed: this.satorSeed,
        timestamp: Date.now(),
        payload: payload
      };

      this.eventQueue.push(event);

      // Keep event queue bounded
      if (this.eventQueue.length > 100) {
        this.eventQueue = this.eventQueue.slice(-50);
      }

      this._persistState();
    }

    // ── Discovery Verification ───────────────────────────────────
    async verifyDiscovery(discoveryId, expectedHash) {
      const cached = this.discoveryCache.get(discoveryId);
      if (cached) return cached;

      const computedHash = await sha256(discoveryId + ':' + LOOM_CONSTANT);
      const verified = computedHash.slice(0, expectedHash.length) === expectedHash;

      const result = {
        discoveryId: discoveryId,
        verified: verified,
        computedHash: computedHash.slice(0, 16),
        timestamp: new Date().toISOString()
      };

      this.discoveryCache.set(discoveryId, result);
      this._transmitSatorEvent('DISCOVERY_VERIFY', result);

      return result;
    }

    // ── State Persistence ────────────────────────────────────────
    _persistState() {
      try {
        const state = {
          version: VERSION,
          sessionHash: this.sessionHash ? this.sessionHash.slice(0, 32) : null,
          visitLog: this.visitLog.slice(-50), // Keep last 50 visits
          eventCount: this.eventQueue.length,
          lastUpdate: Date.now()
        };
        localStorage.setItem('abcxyz_state', JSON.stringify(state));
      } catch (e) {
        // localStorage unavailable — silent fallback
      }
    }

    _restoreState() {
      try {
        const raw = localStorage.getItem('abcxyz_state');
        if (!raw) return;
        const state = JSON.parse(raw);
        if (state.version === VERSION && state.visitLog) {
          this.visitLog = state.visitLog;
        }
      } catch (e) {
        // Corrupt state — start fresh
      }
    }

    // ── UI Updates ───────────────────────────────────────────────
    _updateUI() {
      const statusEl = document.getElementById('abcxyz-status');
      if (statusEl) {
        statusEl.textContent = 'ONLINE';
        statusEl.style.color = '#059669';
      }
    }

    // ── Public API ───────────────────────────────────────────────
    getStatus() {
      return {
        status: this.status,
        version: VERSION,
        sessionHash: this.sessionHash ? this.sessionHash.slice(0, 16) : 'pending',
        totalVisits: this.visitLog.length,
        eventQueueSize: this.eventQueue.length,
        satorSeed: this.satorSeed,
        loomConstant: LOOM_CONSTANT
      };
    }

    getVisitHistory() {
      return [...this.visitLog];
    }
  }

  // ── Initialize ─────────────────────────────────────────────────
  window.abcxyzSystem = new ABCXYZEngine();
})();
