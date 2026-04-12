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

  /* ── Verify current page content ──────────────────────────── */
  function verifyPage() {
    var pagePath = location.pathname.replace(/^\//, '') || 'index.html';
    return loadManifest().then(function (m) {
      var expected = m.pages[pagePath];
      if (!expected) return { path: pagePath, status: 'not-in-manifest' };
      return sha256Text(extractBodyText()).then(function (actual) {
        return {
          path: pagePath,
          status: actual === expected ? 'verified' : 'modified',
          expected: expected,
          actual: actual
        };
      });
    });
  }

  /* ── Verify a specific asset by URL ───────────────────────── */
  function verifyAsset(url) {
    var assetPath = url.replace(/^(https?:\/\/[^/]+)?\//, '');
    return loadManifest().then(function (m) {
      var expected = m.assets[assetPath];
      if (!expected) return { path: assetPath, status: 'not-in-manifest' };
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('Asset fetch failed: ' + url);
        return r.arrayBuffer();
      }).then(function (buf) {
        return sha256ArrayBuffer(buf);
      }).then(function (actual) {
        return {
          path: assetPath,
          status: actual === expected ? 'verified' : 'modified',
          expected: expected,
          actual: actual
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

  /* ── Expose API for programmatic use ──────────────────────── */
  window.TENET5Integrity = {
    verifyPage: verifyPage,
    verifyAsset: verifyAsset,
    loadManifest: loadManifest
  };

  /* ── Init ─────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntegrityButton);
  } else {
    initIntegrityButton();
  }
})();
