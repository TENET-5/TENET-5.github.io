/* ═══════════════════════════════════════════════════════════════════════
   TENET⁵ Presentation Engine v1 — Auto-Slide + Sprite Animation System
   
   Auto-detects section boundaries in any page, wraps them into
   full-viewport slides with scroll-snap, dot indicators, keyboard nav,
   and data-driven sprite animations.
   
   Loaded via shell.js inside iframe context.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__TENET5_PRESENTATION_LOADED) return;
  window.__TENET5_PRESENTATION_LOADED = true;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 1: Auto-detect slide boundaries
     ═══════════════════════════════════════════════════════════════════ */

  // Selectors for elements that become individual slides (priority order)
  var SLIDE_SELECTORS = [
    '.tl-hero',             // home hero
    '.page-hero',           // content page heroes
    '.stat-hero-banner',    // stat banners
    '.narrative-intro',     // narrative sections
    '.credibility-card',    // author card
    '.tl-timeline',         // entire timeline block (not individual nodes)
    '.tl-quicknav',         // quick nav grid
    '.timeline-section',    // content page sections
    '.inv-stat-grid',       // stat grids
    '.media-grid',          // evidence grids
    '[data-narration]',     // any narrated section
    'section',              // generic sections
  ];

  // Selectors too short for a full slide
  var COMPACT_SELECTORS = [
    '.source-cite',
    '.tnt-style-356',       // metadata bar
    '.skip-link',
    '#site-header-frame',
  ];

  function isCompact(el) {
    for (var i = 0; i < COMPACT_SELECTORS.length; i++) {
      if (el.matches && el.matches(COMPACT_SELECTORS[i])) return true;
    }
    // Very short content = compact
    if (el.textContent && el.textContent.trim().length < 60 &&
        !el.querySelector('img, svg, table, canvas')) return true;
    return false;
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 2: Slide wrapping engine
     ═══════════════════════════════════════════════════════════════════ */

  function detectSlides() {
    var slides = [];
    var seen = new Set();

    // Collect all candidate elements in DOM order
    var allSel = SLIDE_SELECTORS.join(',');
    var candidates = document.querySelectorAll(allSel);

    candidates.forEach(function (el) {
      // Skip if already part of a slide (ancestor matched first)
      if (seen.has(el)) return;
      var dominated = false;
      seen.forEach(function (s) {
        if (s.contains(el) && s !== el) dominated = true;
      });
      if (dominated) return;

      seen.add(el);
      slides.push(el);
    });

    // If no sections found, treat top-level children of .content or body as slides
    if (slides.length < 2) {
      var container = document.querySelector('.content') || document.body;
      var children = container.children;
      slides = [];
      for (var i = 0; i < children.length; i++) {
        if (children[i].id === 'site-header-frame' ||
            children[i].id === 'site-footer-frame' ||
            children[i].tagName === 'SCRIPT' ||
            children[i].tagName === 'LINK') continue;
        slides.push(children[i]);
      }
    }

    return slides;
  }

  function wrapSlides(elements) {
    var slides = [];
    var fragment;

    elements.forEach(function (el, idx) {
      // Don't re-wrap if already a slide
      if (el.classList.contains('pres-slide')) {
        slides.push(el);
        return;
      }

      var compact = isCompact(el);

      // Add presentation classes directly to the element
      el.classList.add('pres-slide');
      if (compact) el.classList.add('pres-slide--compact');
      el.setAttribute('data-slide-num', 'SLIDE ' + (idx + 1) + ' / ' + elements.length);
      el.setAttribute('data-slide-idx', idx);

      slides.push(el);
    });

    return slides;
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 3: Slide label extractor (for dot nav)
     ═══════════════════════════════════════════════════════════════════ */

  function getSlideLabel(el) {
    // Try heading
    var h = el.querySelector('h1, h2, h3');
    if (h) {
      var text = h.textContent.trim();
      return text.length > 30 ? text.substring(0, 30) + '\u2026' : text;
    }
    // Try data-narration attr
    var narr = el.getAttribute('data-narration');
    if (narr) return narr.charAt(0).toUpperCase() + narr.slice(1);
    // Try class
    if (el.classList.contains('stat-hero-banner')) return 'Key Statistics';
    if (el.classList.contains('inv-stat-grid')) return 'Statistics';
    if (el.classList.contains('media-grid')) return 'Evidence Grid';
    if (el.classList.contains('tl-quicknav')) return 'Navigation';
    if (el.classList.contains('credibility-card')) return 'Investigator';
    // Fallback
    return 'Slide ' + ((parseInt(el.getAttribute('data-slide-idx'), 10) || 0) + 1);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4: Dot indicator rail
     ═══════════════════════════════════════════════════════════════════ */

  function buildIndicator(slides) {
    var rail = document.createElement('div');
    rail.className = 'pres-indicator';

    slides.forEach(function (sl, i) {
      if (sl.classList.contains('pres-slide--compact')) return;
      var dot = document.createElement('div');
      dot.className = 'pres-dot';
      dot.setAttribute('data-label', getSlideLabel(sl));
      dot.setAttribute('data-idx', i);
      dot.addEventListener('click', function () {
        sl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      rail.appendChild(dot);
    });

    document.body.appendChild(rail);

    // Progress bar
    var progress = document.createElement('div');
    progress.className = 'pres-progress';
    document.body.appendChild(progress);

    // Keyboard hint
    var hint = document.createElement('div');
    hint.className = 'pres-keyhint';
    hint.textContent = '\u2191\u2193 arrows \u00b7 space \u00b7 scroll';
    document.body.appendChild(hint);
    setTimeout(function () { hint.classList.add('pres-keyhint-fade'); }, 6000);

    return { rail: rail, progress: progress, dots: rail.querySelectorAll('.pres-dot') };
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 5: Scroll observation + active slide tracking
     ═══════════════════════════════════════════════════════════════════ */

  function observeSlides(slides, ui) {
    var activeIdx = 0;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var idx = parseInt(entry.target.getAttribute('data-slide-idx'), 10);

        // Reveal animation
        if (entry.isIntersecting) {
          entry.target.classList.add('pres-visible');
          triggerSprites(entry.target);
        }

        // Track active
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          activeIdx = idx;
          updateIndicator(ui, slides, idx);
        }
      });
    }, {
      threshold: [0.1, 0.3, 0.5],
      rootMargin: '-5% 0px -5% 0px'
    });

    slides.forEach(function (sl) {
      observer.observe(sl);
    });

    // Also track scroll position for progress bar
    var scrollEl = document;
    var getScrollPct = function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    };

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          ui.progress.style.width = getScrollPct() + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    return { getActive: function () { return activeIdx; } };
  }

  function updateIndicator(ui, slides, activeIdx) {
    ui.dots.forEach(function (dot) {
      var dotIdx = parseInt(dot.getAttribute('data-idx'), 10);
      dot.classList.toggle('pres-dot-active', dotIdx === activeIdx);
    });
    // Show rail after first scroll
    ui.rail.classList.add('pres-indicator-visible');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 6: Keyboard + touch navigation
     ═══════════════════════════════════════════════════════════════════ */

  function initKeyboardNav(slides, tracker) {
    document.addEventListener('keydown', function (e) {
      var cur = tracker.getActive();
      var target = null;

      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        target = slides[Math.min(cur + 1, slides.length - 1)];
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        target = slides[Math.max(cur - 1, 0)];
      } else if (e.key === 'Home') {
        e.preventDefault();
        target = slides[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        target = slides[slides.length - 1];
      }

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 7: SPRITE ANIMATION ENGINE
     Detects content type and spawns appropriate sprite effects
     ═══════════════════════════════════════════════════════════════════ */

  function triggerSprites(slideEl) {
    // Don't re-trigger
    if (slideEl.dataset.spriteTriggered) return;
    slideEl.dataset.spriteTriggered = 'true';

    var type = detectSpriteType(slideEl);
    if (!type) return;

    var container = document.createElement('div');
    container.className = 'pres-sprite';
    slideEl.insertBefore(container, slideEl.firstChild);

    switch (type) {
      case 'death':    spawnDeathRain(container); break;
      case 'money':    spawnMoneyFlow(container); break;
      case 'network':  spawnNetwork(container); break;
      case 'bars':     spawnBars(container, slideEl); break;
      case 'danger':   spawnDanger(container); break;
      case 'scan':     spawnScan(container); break;
    }
  }

  function detectSpriteType(el) {
    // Explicit override
    var explicit = el.getAttribute('data-sprite');
    if (explicit) return explicit;

    var text = (el.textContent || '').toLowerCase();
    var hasTable = el.querySelector('table');
    var hasStats = el.querySelector('.inv-stat-grid, .inv-stat, .stat-hero-item');

    // MAID / death keywords → death rain
    if (/\b(death|killed|maid|dead|die[ds]?|76.?475|60.?167|15.?343|16.?265|genocide)\b/.test(text)) {
      return 'death';
    }
    // Money keywords → money flow
    if (/\b(\$|billion|million|1\.2b|donation|lobbying|money|finance|contract|procurement)\b/.test(text)) {
      return 'money';
    }
    // Connection/network keywords → network pulse
    if (/\b(connection|network|lobby|contact|350.?000|pipeline|entity|cija)\b/.test(text)) {
      return 'network';
    }
    // Tables with numbers → bar growth
    if (hasTable || hasStats) {
      return 'bars';
    }
    // Findings / warnings → danger
    if (/\b(finding|warning|concern|oversight|gap|failure|misconduct|tampering)\b/.test(text)) {
      return 'danger';
    }
    // Evidence / investigation → scan
    if (/\b(evidence|investigation|cross-reference|source|data|record|database)\b/.test(text)) {
      return 'scan';
    }
    return null;
  }

  /* ── Individual sprite spawners ──────────────────────────────────── */

  function spawnDeathRain(container) {
    container.classList.add('sprite-death-rain');
    for (var i = 0; i < 30; i++) {
      var drop = document.createElement('div');
      drop.className = 'spr-drop';
      drop.style.left = (Math.random() * 100) + '%';
      drop.style.animationDuration = (3 + Math.random() * 5) + 's';
      drop.style.animationDelay = (Math.random() * 4) + 's';
      drop.style.width = (2 + Math.random() * 3) + 'px';
      drop.style.height = drop.style.width;
      container.appendChild(drop);
    }
  }

  function spawnMoneyFlow(container) {
    container.classList.add('sprite-money-flow');
    for (var i = 0; i < 20; i++) {
      var coin = document.createElement('div');
      coin.className = 'spr-coin';
      coin.style.top = (10 + Math.random() * 80) + '%';
      coin.style.left = '-20px';
      coin.style.animationDuration = (4 + Math.random() * 6) + 's';
      coin.style.animationDelay = (Math.random() * 5) + 's';
      coin.style.width = (4 + Math.random() * 5) + 'px';
      coin.style.height = coin.style.width;
      container.appendChild(coin);
    }
  }

  function spawnNetwork(container) {
    container.classList.add('sprite-network');
    // Rings
    for (var i = 0; i < 5; i++) {
      var ring = document.createElement('div');
      ring.className = 'spr-ring';
      ring.style.left = (15 + Math.random() * 70) + '%';
      ring.style.top = (15 + Math.random() * 70) + '%';
      ring.style.animationDelay = (i * 0.8) + 's';
      container.appendChild(ring);
    }
    // Lines
    for (var j = 0; j < 8; j++) {
      var line = document.createElement('div');
      line.className = 'spr-line';
      line.style.top = (10 + Math.random() * 80) + '%';
      line.style.left = (Math.random() * 40) + '%';
      line.style.width = (20 + Math.random() * 40) + '%';
      line.style.transform = 'rotate(' + (-15 + Math.random() * 30) + 'deg)';
      line.style.animationDelay = (0.5 + j * 0.3) + 's';
      container.appendChild(line);
    }
  }

  function spawnBars(container, slideEl) {
    container.classList.add('sprite-bars');
    // Determine bar count from table rows or stat items
    var rows = slideEl.querySelectorAll('tr, .inv-stat, .stat-hero-item');
    var count = Math.min(Math.max(rows.length || 6, 4), 12);
    var colors = ['#dc2626', '#c9a84c', '#3b82f6', '#a855f7', '#22c55e', '#f97316'];

    for (var i = 0; i < count; i++) {
      var bar = document.createElement('div');
      bar.className = 'spr-bar';
      var h = (15 + Math.random() * 60);
      bar.style.height = h + '%';
      bar.style.background = colors[i % colors.length];
      bar.style.animationDelay = (i * 0.1) + 's';
      container.appendChild(bar);
    }
  }

  function spawnDanger(container) {
    container.classList.add('sprite-danger');
    for (var i = 0; i < 3; i++) {
      var pulse = document.createElement('div');
      pulse.className = 'spr-pulse';
      pulse.style.left = (20 + Math.random() * 60) + '%';
      pulse.style.top = (20 + Math.random() * 60) + '%';
      pulse.style.animationDelay = (i * 0.8) + 's';
      container.appendChild(pulse);
    }
  }

  function spawnScan(container) {
    container.classList.add('sprite-scan');
    var line = document.createElement('div');
    line.className = 'spr-scanline';
    container.appendChild(line);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 8: Load CSS dependency
     ═══════════════════════════════════════════════════════════════════ */

  function loadCSS(href) {
    if (document.querySelector('link[href*="' + href.split('?')[0] + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 9: Init
     ═══════════════════════════════════════════════════════════════════ */

  function init() {
    // Load presentation CSS
    loadCSS('css/presentation.css?v=1');

    // Wait a tick for other scripts (timeline.js etc.) to run first
    requestAnimationFrame(function () {
      // Detect slide boundaries
      var elements = detectSlides();
      if (elements.length < 2) return; // Not enough content to present

      // Wrap into slides
      var slides = wrapSlides(elements);

      // Activate presentation mode
      document.body.classList.add('pres-active');

      // Build indicator UI
      var ui = buildIndicator(slides);

      // Start observation
      var tracker = observeSlides(slides, ui);

      // Keyboard nav
      initKeyboardNav(slides, tracker);

      // Mark first slide visible immediately
      if (slides[0]) {
        slides[0].classList.add('pres-visible');
        triggerSprites(slides[0]);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
