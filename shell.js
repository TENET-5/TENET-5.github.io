/* ═══════════════════════════════════════════════════════════════════════
   TENET5 Page Shell v1.0 — Single Entry Point for All Shared Components
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
      loadScript(BASE + 'nav.js?v=23')
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
        loadScript(BASE + 'js/breadcrumbs.js?v=1'),
        loadScript(BASE + 'js/error-reporter.js?v=2')
      ]).then(function() {
        return loadScript(BASE + 'js/presentation.js?v=11');
      }).then(function() {
        return loadScript(BASE + 'js/perception.js?v=2');
      }).then(function() {
        return loadScript(BASE + 'js/liril-walkthrough.js?v=12');
      // walkthrough-enhancements.js was a purple duplicate bar at bottom:74px
      // that rendered alongside the presentation.js indicator at bottom:16px,
      // producing two visible walkthrough UIs. The file is now a no-op shim.
      // Speed/autoplay/captions/transcript controls will be migrated into
      // liril-walkthrough.js itself in a follow-up so there is ONE unified UI.
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
      loadScript(BASE + 'nav.js?v=23')
        .then(function() { return loadScript(BASE + 'js/theme-slider.js?v=1'); })
        .then(function() { return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'); })
        .then(function() { return loadScript(BASE + 'js/config.js?v=2'); })
        .then(function() { return loadScript(BASE + 'js/auth-nav.js?v=1'); })
        .then(function() { return loadScript(BASE + 'js/main.js?v=4'); })
        .then(function() { return loadScript(BASE + 'js/reveal.js?v=2'); })
        .then(function() { return loadScript(BASE + 'js/timeline.js?v=1'); })
        .then(function() { return loadScript(BASE + 'js/liril-voice.js?v=6'); })
        .then(function() { return loadScript(BASE + 'js/presentation.js?v=11'); })
        .then(function() { return loadScript(BASE + 'js/perception.js?v=2'); })
        .then(function() { return loadScript(BASE + 'js/liril-walkthrough.js?v=12'); })
        // walkthrough-enhancements.js neutralized — see comment above
        .then(function() { return loadScript(BASE + 'js/breadcrumbs.js?v=1'); })
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

/* ═══════════════════════════════════════════════════════════════════════
   BUG FLAG — one-click page reporting with automatic validation
   No text input. Just flag. LIRIL validates via quantum pipeline.
   ═══════════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var FLAG_STORAGE_KEY = 'tenet5_flagged_pages';
  var FLAG_COOLDOWN_MS = 30000; // 30s cooldown per page
  var _lastFlag = 0;

  function getPageSlug() {
    return (window.location.pathname.split('/').pop() || 'index.html');
  }

  function getFlaggedPages() {
    try {
      return JSON.parse(localStorage.getItem(FLAG_STORAGE_KEY) || '{}');
    } catch(e) { return {}; }
  }

  function saveFlaggedPages(flags) {
    try { localStorage.setItem(FLAG_STORAGE_KEY, JSON.stringify(flags)); } catch(e) {}
  }

  window.__TENET5_FLAG_BUG = function() {
    var now = Date.now();
    if (now - _lastFlag < FLAG_COOLDOWN_MS) {
      showFlagFeedback('Already flagged — cooldown active', '#facc15');
      return;
    }

    var page = getPageSlug();
    var flags = getFlaggedPages();
    var count = (flags[page] || 0) + 1;
    flags[page] = count;
    saveFlaggedPages(flags);
    _lastFlag = now;

    // Collect automatic diagnostics (no user input needed)
    var diagnostic = {
      page: page,
      flag_count: count,
      timestamp: new Date().toISOString(),
      viewport: window.innerWidth + 'x' + window.innerHeight,
      scroll_y: Math.round(window.scrollY),
      user_agent: navigator.userAgent.substring(0, 100),
      errors: (window.__TENET5_JS_ERRORS || []).slice(-5),
      narration_active: !!(window.__TENET5_PRESENTATION_LOADED || window.__LIRIL_WALKTHROUGH_LOADED),
      speech_available: !!window.speechSynthesis,
    };

    // Store in localStorage for LIRIL to pick up
    try {
      var queue = JSON.parse(localStorage.getItem('tenet5_bug_queue') || '[]');
      queue.push(diagnostic);
      if (queue.length > 50) queue = queue.slice(-50);
      localStorage.setItem('tenet5_bug_queue', JSON.stringify(queue));
    } catch(e) {}

    // Also send to data endpoint if available
    try {
      var beacon = new Blob([JSON.stringify(diagnostic)], {type: 'application/json'});
      navigator.sendBeacon && navigator.sendBeacon('data:application/json,' + encodeURIComponent(JSON.stringify(diagnostic)));
    } catch(e) {}

    showFlagFeedback('Page flagged for review (' + count + ')', '#22d3ee');
    console.log('[TENET5] Bug flagged:', diagnostic);
  };

  function showFlagFeedback(msg, color) {
    var el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;top:80px;right:20px;z-index:99999;' +
      'background:rgba(0,0,0,0.9);color:' + color + ';padding:0.8rem 1.2rem;' +
      'border-radius:8px;font-size:0.8rem;font-weight:700;border:1px solid ' + color + ';' +
      'transition:opacity 0.5s;pointer-events:none;';
    document.body.appendChild(el);
    setTimeout(function() { el.style.opacity = '0'; }, 2000);
    setTimeout(function() { el.remove(); }, 3000);
  }

  // Track JS errors for automatic diagnostics
  window.__TENET5_JS_ERRORS = [];
  window.addEventListener('error', function(ev) {
    window.__TENET5_JS_ERRORS.push({
      msg: (ev.message || '').substring(0, 100),
      file: (ev.filename || '').split('/').pop(),
      line: ev.lineno,
      ts: Date.now(),
    });
    if (window.__TENET5_JS_ERRORS.length > 20) window.__TENET5_JS_ERRORS.shift();
  });
})();
