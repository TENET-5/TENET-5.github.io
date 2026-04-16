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

  function injectFilmEffects() {
    return;
  }

  // Inject polish.css on all pages (shell + content)
  function injectPolishCSS() {
    if (document.querySelector('link[href*="polish"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    // Use root-relative path so it works in both shell and iframe contexts
    link.href = '/css/polish.css?v=1';
    (document.head || document.documentElement).appendChild(link);
  }

  function injectBackdrop() {
    if (!document.body || isFrameShell) return;
    document.body.classList.add('theme-1950s');
    if (document.querySelector('.retro-film-bg')) return;

    var wrap = document.createElement('div');
    wrap.className = 'retro-film-bg';
    wrap.setAttribute('aria-hidden', 'true');

    var spriteStrip = document.createElement('div');
    spriteStrip.className = 'sprite-strip sprite-strip--evidence';

    var courtLayer = document.createElement('div');
    courtLayer.className = 'sprite-layer sprite-layer--court';

    var parliamentLayer = document.createElement('div');
    parliamentLayer.className = 'sprite-layer sprite-layer--parliament';

    var networkLayer = document.createElement('div');
    networkLayer.className = 'sprite-layer sprite-layer--network';

    var overlay = document.createElement('div');
    overlay.className = 'retro-film-overlay';

    wrap.appendChild(spriteStrip);
    wrap.appendChild(courtLayer);
    wrap.appendChild(parliamentLayer);
    wrap.appendChild(networkLayer);
    wrap.appendChild(overlay);
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    injectBackdrop();
    injectPolishCSS();
    if (isFrameShell) {
      // INDEX.HTML — frame shell: only load nav for the top bar
      ensureFrame('site-header-frame', 'div', 'prepend');
      loadScript(BASE + 'nav.js?v=16')
        .then(function() { return loadScript(BASE + 'js/theme-slider.js?v=1'); })
        .then(function() { return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'); })
        .then(function() { return loadScript(BASE + 'js/config.js?v=2'); })
        .then(function() { return loadScript(BASE + 'js/auth-nav.js?v=1'); });

    } else if (isInIframe) {
      // INSIDE IFRAME — content page: only load content-level components
      // (no header/footer — parent frame provides those)
      loadScript(BASE + 'js/theme-slider.js?v=1');
      loadScript(BASE + 'js/video-bg.js?v=2');
      Promise.all([
        loadScript(BASE + 'js/reveal.js?v=2'),
        loadScript(BASE + 'js/timeline.js?v=1'),
        loadScript(BASE + 'share.js?v=2'),
        loadScript(BASE + 'js/share-actions.js?v=2'),
        loadScript(BASE + 'js/liril-voice.js?v=6'),
        loadScript(BASE + 'js/figures.js?v=1'),
        loadScript(BASE + 'js/error-reporter.js?v=2')
      ]).then(function() {
        return loadScript(BASE + 'js/presentation.js?v=6');
      }).then(function() {
        return loadScript(BASE + 'js/liril-walkthrough.js?v=7');
      }).then(function() { return loadScript(BASE + 'js/lang-switcher.js?v=1'); })
      .then(function() { return loadScript(BASE + 'js/metaverse.js?v=1'); })
      .then(function() { return loadScript(BASE + 'readnext.js?v=3'); })
      .then(function() { return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'); })
      .then(function() { return loadScript(BASE + 'js/config.js?v=2'); })
      .then(function() { return loadScript(BASE + 'js/my-mp.js?v=2'); })
      .then(function() { return loadScript(BASE + 'js/mp-scorecard.js?v=1'); })
      .then(function() { return loadScript(BASE + 'js/impact-tracker.js?v=2'); });

    } else {
      // DIRECT ACCESS fallback — full standalone page
      // (frame buster normally prevents this, but just in case)
      ensureFrame('site-header-frame', 'div', 'prepend');
      ensureFrame('site-footer-frame', 'div', null);

      loadScript(BASE + 'js/video-bg.js?v=2');
      loadScript(BASE + 'nav.js?v=16')
        .then(function() { return loadScript(BASE + 'js/theme-slider.js?v=1'); })
        .then(function() { return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'); })
        .then(function() { return loadScript(BASE + 'js/config.js?v=2'); })
        .then(function() { return loadScript(BASE + 'js/auth-nav.js?v=1'); })
        .then(function() { return loadScript(BASE + 'js/main.js?v=3'); })
        .then(function() { return loadScript(BASE + 'js/reveal.js?v=2'); })
        .then(function() { return loadScript(BASE + 'js/timeline.js?v=1'); })
        .then(function() { return loadScript(BASE + 'js/liril-voice.js?v=6'); })
        .then(function() { return loadScript(BASE + 'js/presentation.js?v=6'); })
        .then(function() { return loadScript(BASE + 'js/liril-walkthrough.js?v=7'); })
        .then(function() { return loadScript(BASE + 'js/lang-switcher.js?v=1'); })
        .then(function() { return loadScript(BASE + 'js/metaverse.js?v=1'); })
        .then(function() { return loadScript(BASE + 'share.js?v=2'); })
        .then(function() { return loadScript(BASE + 'js/share-actions.js?v=2'); })
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
