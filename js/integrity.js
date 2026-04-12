/* ═══════════════════════════════════════════════════════════════
   TENET5 Evidence Integrity Verification
   Client-side SHA-256 verification against integrity-manifest.json
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MANIFEST_URL = 'integrity-manifest.json';
  var manifest = null;
  var verifyBtn = null;

  /* ── SHA-256 via SubtleCrypto ─────────────────────────────── */
  function sha256ArrayBuffer(buffer) {
    return crypto.subtle.digest('SHA-256', buffer).then(function (hash) {
      var bytes = new Uint8Array(hash);
      var hex = '';
      for (var i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return hex;
    });
  }

  function sha256Text(text) {
    var enc = new TextEncoder();
    return sha256ArrayBuffer(enc.encode(text));
  }

  /* ── Load manifest ────────────────────────────────────────── */
  function loadManifest() {
    if (manifest) return Promise.resolve(manifest);
    return fetch(MANIFEST_URL).then(function (r) {
      if (!r.ok) throw new Error('Manifest not found');
      return r.json();
    }).then(function (data) {
      manifest = data;
      return data;
    });
  }

  /* ── Extract body text (mirrors Python build script logic) ── */
  function extractBodyText() {
    var clone = document.body.cloneNode(true);
    var remove = clone.querySelectorAll('script, style, nav, .pres-indicator, ' +
      '.pres-progress, .pres-keyhint, .pres-page-indicator, .pres-keyboard-help, ' +
      '.pres-toc-overlay, .pres-goto-overlay, .pres-narration-badge, .pres-subtitle, ' +
      '.grain-overlay, .integrity-panel');
    for (var i = 0; i < remove.length; i++) remove[i].remove();
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* ── Resolve manifest entry (supports v1 flat hash and v2 custody) */
  function resolveEntry(entry) {
    if (!entry) return null;
    if (typeof entry === 'string') return { hash: entry };
    return entry;
  }

  /* ── Verify current page content ──────────────────────────── */
  function verifyPage() {
    var pagePath = location.pathname.replace(/^\//, '') || 'index.html';
    return loadManifest().then(function (m) {
      var raw = m.pages[pagePath];
      var entry = resolveEntry(raw);
      if (!entry) return { path: pagePath, status: 'not-in-manifest' };
      return sha256Text(extractBodyText()).then(function (actual) {
        return {
          path: pagePath,
          status: actual === entry.hash ? 'verified' : 'modified',
          expected: entry.hash,
          actual: actual,
          firstSeen: entry.first_seen || null,
          lastVerified: entry.last_verified || null,
          revisions: entry.revisions || null
        };
      });
    });
  }

  /* ── Verify a specific asset by URL ───────────────────────── */
  function verifyAsset(url) {
    var assetPath = url.replace(/^(https?:\/\/[^/]+)?\//, '');
    return loadManifest().then(function (m) {
      var raw = m.assets[assetPath];
      var entry = resolveEntry(raw);
      if (!entry) return { path: assetPath, status: 'not-in-manifest' };
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('Asset fetch failed: ' + url);
        return r.arrayBuffer();
      }).then(function (buf) {
        return sha256ArrayBuffer(buf);
      }).then(function (actual) {
        return {
          path: assetPath,
          status: actual === entry.hash ? 'verified' : 'modified',
          expected: entry.hash,
          actual: actual,
          firstSeen: entry.first_seen || null,
          lastVerified: entry.last_verified || null,
          revisions: entry.revisions || null
        };
      });
    });
  }

  /* ── UI: Verification panel ───────────────────────────────── */
  function showVerificationResult(result) {
    var panel = document.querySelector('.integrity-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'integrity-panel';
      panel.setAttribute('role', 'status');
      panel.setAttribute('aria-live', 'polite');
      document.body.appendChild(panel);
    }

    var icon = result.status === 'verified' ? '\u2705' : result.status === 'modified' ? '\u26A0\uFE0F' : '\u2753';
    var label = result.status === 'verified'
      ? 'Content integrity verified'
      : result.status === 'modified'
        ? 'Content differs from signed manifest'
        : 'Page not in integrity manifest';

    var custodyHtml = '';
    if (result.firstSeen || result.lastVerified) {
      custodyHtml = '<div class="integrity-custody">' +
        '<div class="integrity-custody-title">\uD83D\uDD17 Chain of Custody</div>' +
        (result.firstSeen ? '<div>First recorded: <time datetime="' + result.firstSeen + '">' + formatCustodyDate(result.firstSeen) + '</time></div>' : '') +
        (result.lastVerified ? '<div>Last verified: <time datetime="' + result.lastVerified + '">' + formatCustodyDate(result.lastVerified) + '</time></div>' : '') +
        (result.revisions ? '<div>Revisions: <strong>' + result.revisions + '</strong></div>' : '') +
      '</div>';
    }

    panel.innerHTML =
      '<div class="integrity-header">' +
        '<span class="integrity-icon">' + icon + '</span>' +
        '<strong>' + label + '</strong>' +
        '<button class="integrity-close" aria-label="Close verification panel">&times;</button>' +
      '</div>' +
      '<div class="integrity-details">' +
        '<div>Page: <code>' + result.path + '</code></div>' +
        '<div>Algorithm: SHA-256</div>' +
        (result.expected ? '<div>Expected: <code class="integrity-hash">' + result.expected.substring(0, 16) + '\u2026</code></div>' : '') +
        (result.actual ? '<div>Computed: <code class="integrity-hash">' + result.actual.substring(0, 16) + '\u2026</code></div>' : '') +
        '<div>Manifest: <code>' + (manifest ? manifest.generated : 'N/A') + '</code></div>' +
        custodyHtml +
      '</div>';

    panel.style.display = 'block';
    panel.querySelector('.integrity-close').addEventListener('click', function () {
      panel.style.display = 'none';
    });
  }

  /* ── Build verify button ──────────────────────────────────── */
  function initIntegrityButton() {
    if (verifyBtn) return;
    verifyBtn = document.createElement('button');
    verifyBtn.className = 'integrity-verify-btn';
    verifyBtn.setAttribute('aria-label', 'Verify page integrity');
    verifyBtn.setAttribute('title', 'Verify evidence integrity (SHA-256)');
    verifyBtn.textContent = '\uD83D\uDD12';
    verifyBtn.addEventListener('click', function () {
      verifyBtn.disabled = true;
      verifyBtn.textContent = '\u23F3';
      verifyPage().then(function (result) {
        showVerificationResult(result);
        verifyBtn.textContent = result.status === 'verified' ? '\u2705' : '\u26A0\uFE0F';
        verifyBtn.disabled = false;
      }).catch(function (err) {
        verifyBtn.textContent = '\u274C';
        verifyBtn.disabled = false;
        console.error('[integrity]', err);
      });
    });
    document.body.appendChild(verifyBtn);
  }

  /* ── Format custody date ──────────────────────────────────── */
  function formatCustodyDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) +
        ' ' + d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';
    } catch (_) { return iso; }
  }

  /* ── Chain-of-custody badge (visible on every page) ───────── */
  function initCustodyBadge() {
    loadManifest().then(function (m) {
      var pagePath = location.pathname.replace(/^\//, '') || 'index.html';
      var raw = m.pages[pagePath];
      var entry = resolveEntry(raw);
      if (!entry || !entry.first_seen) return;

      var badge = document.createElement('div');
      badge.className = 'custody-badge';
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-label', 'Evidence custody record');
      badge.innerHTML =
        '<span class="custody-badge-icon">\uD83D\uDD17</span>' +
        '<span class="custody-badge-text">' +
          'Recorded ' + formatCustodyDate(entry.first_seen) +
          (entry.revisions > 1 ? ' \u00B7 Rev ' + entry.revisions : '') +
        '</span>';
      badge.addEventListener('click', function () {
        if (verifyBtn) verifyBtn.click();
      });
      document.body.appendChild(badge);
    }).catch(function () { /* silent — badge is non-critical */ });
  }

  /* ── Expose API for programmatic use ──────────────────────── */
  window.TENET5Integrity = {
    verifyPage: verifyPage,
    verifyAsset: verifyAsset,
    loadManifest: loadManifest
  };

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    initIntegrityButton();
    initCustodyBadge();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
