/* ═══════════════════════════════════════════════════════════════════════
   CAP Page Shell v1.0 — Single Entry Point for All Shared Components
   ═══════════════════════════════════════════════════════════════════════
   Every page includes ONE script:  <script src="shell.js?v=1"></script>
   Shell detects context and loads appropriate components:

   TOP-LEVEL (index.html frame shell):
     1. nav.js     → header bar      → #site-header-frame
     (footer hidden by frame shell CSS)

   INSIDE IFRAME (content pages):
     1. share.js   → share buttons
     2. readnext.js→ read-next cards → #read-next

   DIRECT ACCESS (no iframe, not index.html — fallback):
     1. nav.js     → header bar      → #site-header-frame
     2. main.js    → scroll/effects
     3. share.js   → share buttons
     4. readnext.js→ read-next cards → #read-next
     5. footer.js  → site footer     → #site-footer-frame
   ═══════════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // Guard: prevent double execution
  if (window.__TENET5_SHELL_LOADED) return;
  window.__TENET5_SHELL_LOADED = true;

  var SHELL_VERSION = 1;
  var BASE = '';

  // Detect context
  var isInIframe = (window !== window.top);
  var isFrameShell = document.getElementById('content_frame') !== null;

  // ── Frame Slots ─────────────────────────────────────────────────────────
  function ensureFrame(id, tag, position) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag || 'div');
      el.id = id;
      if (position === 'prepend') {
        document.body.insertBefore(el, document.body.firstChild);
      } else {
        document.body.appendChild(el);
      }
    }
    return el;
  }

  // ── Script Loader ───────────────────────────────────────────────────────
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var baseName = src.split('?')[0];
      var existing = document.querySelector('script[src^="' + baseName + '"]');
      if (existing && existing.dataset.shellLoaded) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.dataset.shellLoaded = 'true';
      s.onload = resolve;
      s.onerror = function() {
        console.warn('[shell] Failed to load: ' + src);
        resolve();
      };
      document.body.appendChild(s);
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    if (isFrameShell) {
      // INDEX.HTML — frame shell: only load nav for the top bar
      ensureFrame('site-header-frame', 'div', 'prepend');
      loadScript(BASE + 'nav.js?v=12');

    } else if (isInIframe) {
      // INSIDE IFRAME — content page: only load content-level components
      // (no header/footer — parent frame provides those)
      Promise.all([
        loadScript(BASE + 'js/timeline.js?v=1'),
        loadScript(BASE + 'js/liril-narrator.js?v=1'),
        loadScript(BASE + 'share.js?v=2')
      ]).then(function() {
        return loadScript(BASE + 'js/presentation.js?v=1');
      }).then(function() { return loadScript(BASE + 'readnext.js?v=3'); });

    } else {
      // DIRECT ACCESS fallback — full standalone page
      // (frame buster normally prevents this, but just in case)
      ensureFrame('site-header-frame', 'div', 'prepend');
      ensureFrame('site-footer-frame', 'div', null);

      loadScript(BASE + 'nav.js?v=12')
        .then(function() { return loadScript(BASE + 'js/main.js?v=3'); })
        .then(function() { return loadScript(BASE + 'js/timeline.js?v=1'); })
        .then(function() { return loadScript(BASE + 'js/liril-narrator.js?v=1'); })
        .then(function() { return loadScript(BASE + 'js/presentation.js?v=1'); })
        .then(function() { return loadScript(BASE + 'share.js?v=2'); })
        .then(function() { return loadScript(BASE + 'readnext.js?v=3'); })
        .then(function() { return loadScript(BASE + 'footer.js?v=3'); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
