/* ═══════════════════════════════════════════════════════════════════════
   TENET5 Page Shell v1.0 — Single Entry Point for All Shared Components
   ═══════════════════════════════════════════════════════════════════════
   Every page includes ONE script:  <script src="shell.js?v=42"></script>
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

  // QUANTANIUM-first: ensure tokens + brand-lock win on every content page,
  // even when HTML head forgot load order (agentic website maintenance).
  function injectQuantaniumContract() {
    var head = document.head || document.documentElement;
    if (!head) return;
    if (!document.querySelector('link[href*="tokens.css"]')) {
      var t = document.createElement('link');
      t.rel = 'stylesheet';
      t.href = '/css/tokens.css?v=48-quantum';
      t.setAttribute('data-quantanium', 'tokens');
      head.insertBefore(t, head.firstChild);
    }
    if (!document.querySelector('link[href*="brand-lock.css"]')) {
      var b = document.createElement('link');
      b.rel = 'stylesheet';
      b.href = '/css/brand-lock.css?v=48-quantum';
      b.setAttribute('data-quantanium', 'brand-lock');
      head.appendChild(b);
    }
    // Signal active palette for agents / diagnostics
    try {
      document.documentElement.setAttribute('data-quantanium', 'pristine-ice-lake');
      document.documentElement.setAttribute('data-theme', 'quantanium');
    } catch (e) { /* ignore */ }
  }

  // Inject polish.css on all pages (shell + content)
  function injectPolishCSS() {
    if (document.querySelector('link[href*="polish"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    // Use root-relative path so it works in both shell and iframe contexts
    link.href = '/css/polish.css?v=2';
    (document.head || document.documentElement).appendChild(link);
  }

  // Shared report presentation (ice report sheets) for dashboard + dossiers
  function injectReportPresentationCSS() {
    if (document.querySelector('link[href*="report-presentation"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/report-presentation.css?v=2';
    link.setAttribute('data-quantanium', 'report-presentation');
    (document.head || document.documentElement).appendChild(link);
  }

  // Awwwards-informed cinematic display system + documentary HUD
  function injectCinematicCSS() {
    var head = document.head || document.documentElement;
    if (!document.querySelector('link[href*="cinematic-slate"]')) {
      var c = document.createElement('link');
      c.rel = 'stylesheet';
      c.href = '/css/cinematic-slate.css?v=1';
      c.setAttribute('data-quantanium', 'cinematic-slate');
      head.appendChild(c);
    }
    if (!document.querySelector('link[href*="documentary-tour"]')) {
      var d = document.createElement('link');
      d.rel = 'stylesheet';
      d.href = '/css/documentary-tour.css?v=1';
      d.setAttribute('data-quantanium', 'documentary-tour');
      head.appendChild(d);
    }
  }

  function injectBackdrop() {
    if (!document.body || isFrameShell) return;
    // SHAKE FIX (2026-07-10): DISABLED. This loaded Three.js + a WebGL
    // animated-background engine (v2-engine.js) that rendered every frame
    // behind the content — continuous background motion read as viewport
    // "shake" and burned the GPU. The ice-lake CSS ground IS the background;
    // no WebGL scene, no video-bg, no frame-loop. Static and still.
    document.body.classList.add('theme-quantanium-ice');
    document.body.classList.remove('theme-v2-data-science');
    return;
  }

  // Product surface = clean pages that own their chrome (gateway, briefing, film, cases).
  // Do NOT inject dual nav / theme-slider / documentary / supabase soup.
  function isProductSurface() {
    try {
      var html = document.documentElement;
      if (html && html.getAttribute('data-product') === '1') return true;
      if (document.body && document.body.getAttribute('data-product') === '1') return true;
      var p = (window.location.pathname || '').toLowerCase();
      var clean = [
        'index.html', 'daily-briefing.html', 'liril-film.html', 'experience.html',
        'osint-dashboard.html', 'cbc-social-amplification.html', 'cbc-5gw-media-vector.html',
        'accountability.html', 'evidence-index.html', 'gateway'
      ];
      if (p === '/' || p.endsWith('/')) return true;
      for (var i = 0; i < clean.length; i++) {
        if (p.indexOf(clean[i]) >= 0) return true;
      }
    } catch (e) {}
    return false;
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    // PRODUCT MODE — zero chrome injection. Page CSS is the product.
    if (isProductSurface()) {
      try {
        document.documentElement.setAttribute('data-quantanium', 'pristine-ice-lake');
        document.documentElement.setAttribute('data-theme', 'quantanium');
        document.documentElement.setAttribute('data-product', '1');
      } catch (e) {}
      return;
    }

    injectQuantaniumContract();
    // Archive pages only: tokens + light polish. No theme-slider, no documentary auto-tour,
    // no supabase, no dual nav stack, no readnext spam.
    if (isFrameShell) {
      ensureFrame('site-header-frame', 'div', 'prepend');
      loadScript(BASE + 'nav.js?v=51');
      return;
    }
    if (isInIframe) {
      // Minimal content helpers only
      loadScript(BASE + 'js/figures.js?v=1');
      return;
    }
    // Direct archive page — single nav, no junk pile
    ensureFrame('site-header-frame', 'div', 'prepend');
    ensureFrame('site-footer-frame', 'div', null);
    loadScript(BASE + 'nav.js?v=51')
      .then(function () { return loadScript(BASE + 'footer.js?v=41'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── CAP230 POSTER — Graceful Degradation ──────────────────────────── */
  /* When walkthrough video/poster assets are missing (404), hide the
     broken <video> and insert a clean branded fallback message. */
  function patchPosters() {
    document.querySelectorAll('.cap230-poster video').forEach(function(video) {
      var source = video.querySelector('source');
      if (!source) return;

      function handleError() {
        video.classList.add('poster-error');
        var fig = video.closest('figure');
        if (fig && !fig.querySelector('.poster-fallback')) {
          var fb = document.createElement('div');
          fb.className = 'poster-fallback';
          fb.innerHTML = '<span class="fb-icon">📋</span> Walkthrough preview — generating';
          fig.insertBefore(fb, video);
        }
      }

      source.addEventListener('error', handleError);
      video.addEventListener('error', handleError);

      /* If video already errored before listener attached */
      if (video.error || video.networkState === 3) {
        handleError();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchPosters);
  } else {
    setTimeout(patchPosters, 100);
  }
})();

/* ═══════════════════════════════════════════════════════════════════════
   BUG FLAG — one-click page reporting with automatic validation
   No text input. Just flag. Flags are queued for automated review.
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

  // ── Self-healing "Last updated" stamp ────────────────────────────────
  // The visible stamp is baked in statically at publish time, but the
  // process that refreshes it can stall (as it did April–July 2026),
  // leaving every page reading a frozen date. Re-derive it at runtime from
  // the server's Last-Modified header (document.lastModified) so the stamp
  // always reflects the actual deploy date and can never silently freeze.
  function healLastUpdated() {
    try {
      var els = document.querySelectorAll('[data-t5-last-updated]');
      if (!els.length) return;
      var lm = document.lastModified ? new Date(document.lastModified) : null;
      if (!lm || isNaN(lm.getTime()) || lm.getFullYear() < 2020) return; // keep static fallback
      var iso = lm.getFullYear() + '-' +
        ('0' + (lm.getMonth() + 1)).slice(-2) + '-' + ('0' + lm.getDate()).slice(-2);
      for (var i = 0; i < els.length; i++) {
        var t = els[i].querySelector('time');
        if (t) { t.setAttribute('datetime', iso); t.textContent = iso; }
        else { els[i].textContent = 'Last updated: ' + iso; }
      }
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', healLastUpdated);
  else healLastUpdated();
})();
