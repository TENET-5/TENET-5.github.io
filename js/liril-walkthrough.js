/* ═══════════════════════════════════════════════════════
   LIRIL Walkthrough — Guided narration through every page
   Auto-detects sections and provides sequential walk-through
   with subtitle display and section highlighting.
   TENET5 — Powered by LIRIL AI | SEED 118400
   v3.0 — FULL PAGE READING: cap raised to 200 sections, 2000 chars/section
          LIRIL reads the entire page and presentation, not just summaries
          Fixes: Chrome speech cutoff, text sanitization, sentence chunking
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Guard: prevent double-init when shell.js AND <script> both load this ──
  if (window.__LIRIL_WALKTHROUGH_LOADED) return;
  window.__LIRIL_WALKTHROUGH_LOADED = true;

  window.__LIRIL_WALKTHROUGH_STOP = function() {
    if (window.__LIRIL_WALKTHROUGH_STOP_INTERNAL) window.__LIRIL_WALKTHROUGH_STOP_INTERNAL();
  };

  // ── Internationalization (I18N) ──────────────────
  window.LIRIL_I18N_LOCALE = document.documentElement.lang || 'en-GB';
  window.LIRIL_I18N_STRINGS = {
    'en': { 'badge': 'LIRIL NARRATION', 'start': '▶ LIRIL Walkthrough', 'stop': '■ Stop', 'advance': 'Click to advance' },
    'fr': { 'badge': 'NARRATION LIRIL', 'start': '▶ Visite Guidée LIRIL', 'stop': '■ Arrêter', 'advance': 'Cliquez pour avancer' },
    'es': { 'badge': 'NARRACIÓN LIRIL', 'start': '▶ Recorrido LIRIL', 'stop': '■ Detener', 'advance': 'Haz clic para avanzar' }
  };

  function getI18nStr(key) {
    var langCode = window.LIRIL_I18N_LOCALE.split('-')[0];
    var dict = window.LIRIL_I18N_STRINGS[langCode] || window.LIRIL_I18N_STRINGS['en'];
    return dict[key] || window.LIRIL_I18N_STRINGS['en'][key];
  }

  // ── Text sanitisation ────────────────────────────
  // 2026-04-18: relaxed. Previous version over-matched on any 3
  // consecutive uppercase-acronyms-with-spaces (killing legitimate
  // text like "NDA s.83 s.124" and "CFNIS MPCC CAEFISS") and had a
  // 40% uppercase truncation rule that chopped military/government
  // content to a single sentence. Now: just decode entities, strip
  // error messages, cap at 6000 chars.
  var JUNK_PATTERNS = [
    /Could not load \S+/gi,              // error messages from failed fetches
    /&#\d+;/g,                           // numeric HTML entities
    /&[a-z]+;/g                          // named HTML entities
  ];

  function sanitiseNarration(raw) {
    if (!raw) return '';
    var text = raw;

    // Decode common HTML entities first
    var entityMap = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&mdash;':' — ','&ndash;':' – ','&hellip;':'…','&nbsp;':' '};
    Object.keys(entityMap).forEach(function(ent) {
      text = text.split(ent).join(entityMap[ent]);
    });

    // Strip remaining HTML entities + error strings
    JUNK_PATTERNS.forEach(function(rx) { text = text.replace(rx, ''); });

    // Strip leading punctuation / whitespace
    text = text.replace(/^[\s.,;:!?\-—–]+/, '');

    // Collapse whitespace
    text = text.replace(/\s{2,}/g, ' ').trim();

    // Cap at 6000 chars (~10 minutes speech) per slide. Previous 2000
    // cap cut most investigation sections mid-sentence. 6k allows the
    // full content to be read while still protecting against
    // runaway narration on malformed pages.
    if (text.length > 6000) {
      var cut = text.substring(0, 6000);
      var lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
      if (lastStop > 1500) text = cut.substring(0, lastStop + 1);
      else text = cut + '…';
    }

    return text;
  }

  // ── Sentence chunking for Chrome TTS ─────────────
  // Chrome silently stops speaking after ~15 seconds.
  // We split into ≤180-char chunks on sentence boundaries.
  function chunkText(text) {
    if (text.length <= 180) return [text];

    var sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
    var chunks = [];
    var current = '';

    sentences.forEach(function(s) {
      s = s.trim();
      if (!s) return;
      if (current.length + s.length + 1 <= 180) {
        current += (current ? ' ' : '') + s;
      } else {
        if (current) chunks.push(current);
        // If a single sentence is over 180 chars, split on commas
        if (s.length > 180) {
          var parts = s.split(/,\s*/);
          var sub = '';
          parts.forEach(function(p) {
            if (sub.length + p.length + 2 <= 180) {
              sub += (sub ? ', ' : '') + p;
            } else {
              if (sub) chunks.push(sub);
              sub = p;
            }
          });
          if (sub) chunks.push(sub);
          current = '';
        } else {
          current = s;
        }
      }
    });
    if (current) chunks.push(current);
    return chunks.length ? chunks : [text.substring(0, 180)];
  }

  // ── Presentation Bridge ────────────────────────────
  // When presentation.js owns narration, this bridge creates the visible
  // LIRIL Walkthrough button and wires it to __TENET5_LIRIL_NARRATE_ALL.
  // Users see the blue pill, click it, and get the full-site narrated tour.
  function _createPresentationBridge() {
    // Inject styles if not already present
    if (!document.getElementById('liril-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'liril-styles';
      styleEl.textContent =
        '.liril-start-btn {' +
        '  position: fixed !important; top: 84px !important; right: 20px !important; bottom: auto !important;' +
        '  z-index: 10002 !important;' +
        '  background: rgba(14, 165, 233, 0.92); color: white;' +
        '  border: 1px solid rgba(34, 211, 238, 0.38);' +
        '  border-radius: 999px; padding: 10px 16px;' +
        '  font-size: 0.75rem; font-weight: 700; cursor: pointer;' +
        '  font-family: Rajdhani, Inter, sans-serif; letter-spacing: 0.08em;' +
        '  text-transform: uppercase; transition: background 0.25s, box-shadow 0.25s, border-color 0.25s;' +
        '  box-shadow: 0 6px 18px rgba(14,165,233,0.28);' +
        '}' +
        '.liril-start-btn:hover {' +
        '  background: rgba(14, 165, 233, 1); border-color: #22d3ee;' +
        '  box-shadow: 0 0 24px rgba(14,165,233,0.5);' +
        '  transform: translateY(-1px);' +
        '}' +
        '.liril-start-btn.liril-active {' +
        '  background: rgba(100,100,100,0.9);' +
        '}' +
        '.liril-tour-progress {' +
        '  position: fixed; top: 0; left: 0; right: 0; z-index: 9999;' +
        '  background: rgba(5, 5, 10, 0.92);' +
        '  padding: 6px 20px; display: flex; align-items: center; gap: 12px;' +
        '  border-bottom: 1px solid rgba(139, 92, 246, 0.2);' +
        '  backdrop-filter: blur(12px);' +
        '  box-shadow: 0 2px 12px rgba(0,0,0,0.4);' +
        '  font-family: IBM Plex Mono, monospace;' +
        '}' +
        '.liril-tour-label {' +
        '  font-size: 0.6rem; color: #8b5cf6;' +
        '  letter-spacing: 2px; text-transform: uppercase; white-space: nowrap;' +
        '}' +
        '.liril-tour-track {' +
        '  flex: 1; height: 3px; background: rgba(139, 92, 246, 0.12);' +
        '  border-radius: 2px; overflow: hidden;' +
        '}' +
        '.liril-tour-fill {' +
        '  height: 100%; background: linear-gradient(90deg, #8b5cf6, #a78bfa);' +
        '  border-radius: 2px; transition: width 0.8s ease;' +
        '}' +
        '.liril-tour-count {' +
        '  font-size: 0.6rem; color: rgba(139, 92, 246, 0.6);' +
        '  letter-spacing: 1px; white-space: nowrap;' +
        '}' +
        '.liril-tour-stop {' +
        '  background: none; border: 1px solid rgba(139, 92, 246, 0.3);' +
        '  color: #a78bfa; padding: 2px 10px; border-radius: 3px;' +
        '  font-size: 0.55rem; cursor: pointer; font-family: inherit;' +
        '  letter-spacing: 1px; text-transform: uppercase; transition: all 0.2s;' +
        '}' +
        '.liril-tour-stop:hover {' +
        '  background: rgba(139, 92, 246, 0.15); border-color: #8b5cf6;' +
        '}' +
        '@media (max-width: 768px) {' +
        '  .liril-start-btn { top: 72px !important; right: 12px !important; padding: 7px 12px; font-size: 0.72rem; }' +
        '  .liril-tour-progress { padding: 4px 12px; gap: 8px; }' +
        '  .liril-tour-label { font-size: 0.5rem; }' +
        '}';
      document.head.appendChild(styleEl);
    }

    var bridgeActive = false;
    var tourProgressEl = null;

    // Create the walkthrough button
    var startBtn = document.createElement('button');
    startBtn.id = 'liril-start-walkthrough';
    startBtn.className = 'liril-start-btn';
    startBtn.innerHTML = '&#9654; LIRIL Walkthrough';
    startBtn.setAttribute('aria-label', 'Start LIRIL Full-Site Narrated Walkthrough');
    document.body.appendChild(startBtn);

    function updateTourProgress() {
      if (!tourProgressEl) return;
      var prog = window.__TENET5_PAGE_PROGRESS ? window.__TENET5_PAGE_PROGRESS() : null;
      if (!prog) return;
      var fill = tourProgressEl.querySelector('.liril-tour-fill');
      var count = tourProgressEl.querySelector('.liril-tour-count');
      if (fill) fill.style.width = Math.round((prog.current / prog.total) * 100) + '%';
      if (count) count.textContent = 'PAGE ' + prog.current + ' / ' + prog.total;
    }

    function showTourProgress() {
      if (tourProgressEl) return;
      var prog = window.__TENET5_PAGE_PROGRESS ? window.__TENET5_PAGE_PROGRESS() : null;
      if (!prog) return;

      tourProgressEl = document.createElement('div');
      tourProgressEl.className = 'liril-tour-progress';
      tourProgressEl.innerHTML =
        '<span class="liril-tour-label">LIRIL FULL SITE TOUR</span>' +
        '<div class="liril-tour-track"><div class="liril-tour-fill"></div></div>' +
        '<span class="liril-tour-count"></span>' +
        '<button class="liril-tour-stop">STOP TOUR</button>';
      document.body.appendChild(tourProgressEl);

      tourProgressEl.querySelector('.liril-tour-stop').addEventListener('click', function() {
        stopBridge();
      });
      updateTourProgress();
    }

    function hideTourProgress() {
      if (tourProgressEl) { tourProgressEl.remove(); tourProgressEl = null; }
    }

    function stopBridge() {
      bridgeActive = false;
      // Stop presentation narration
      if (window.__TENET5_LIRIL_STOP) window.__TENET5_LIRIL_STOP();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      // Clear autopilot
      try { sessionStorage.removeItem('liril_autopilot'); } catch(e) {}
      // Reset button
      startBtn.innerHTML = '&#9654; LIRIL Walkthrough';
      startBtn.classList.remove('liril-active');
      hideTourProgress();
    }

    function startBridge() {
      bridgeActive = true;
      startBtn.innerHTML = '&#9632; Stop';
      startBtn.classList.add('liril-active');

      // Set autopilot for cross-page navigation
      try {
        sessionStorage.setItem('liril_autopilot', JSON.stringify({
          autostart: true,
          startedAt: Date.now()
        }));
      } catch(e) {}

      showTourProgress();

      // Trigger presentation engine's Narrate All
      // Wait briefly for presentation to initialise if it hasn't yet
      var attempts = 0;
      var tryNarrate = setInterval(function() {
        attempts++;
        if (window.__TENET5_LIRIL_NARRATE_ALL) {
          clearInterval(tryNarrate);
          window.__TENET5_LIRIL_NARRATE_ALL();
        } else if (attempts > 20) {
          // Fallback: if Narrate All isn't available, try single-slide narrate
          clearInterval(tryNarrate);
          if (window.__TENET5_LIRIL_NARRATE) window.__TENET5_LIRIL_NARRATE();
        }
      }, 250);
    }

    startBtn.addEventListener('click', function() {
      if (bridgeActive) {
        stopBridge();
      } else {
        startBridge();
      }
    });

    // Expose stop function for external callers
    window.__LIRIL_WALKTHROUGH_STOP_INTERNAL = stopBridge;
    window.__LIRIL_WALKTHROUGH_STOP = function() {
      if (window.__LIRIL_WALKTHROUGH_STOP_INTERNAL) window.__LIRIL_WALKTHROUGH_STOP_INTERNAL();
    };

    // Auto-start if arriving via cross-page autopilot
    try {
      var autopilot = JSON.parse(sessionStorage.getItem('liril_autopilot') || 'null');
      if (autopilot && autopilot.autostart) {
        var age = Date.now() - (autopilot.startedAt || 0);
        if (age < 30 * 60 * 1000) {
          console.log('[LIRIL-WALK] Bridge: autopilot continuing from previous page');
          // Delay to let presentation.js fully initialise
          setTimeout(function() { startBridge(); }, 2500);
        } else {
          sessionStorage.removeItem('liril_autopilot');
        }
      }
    } catch(e) {}
  }

  function initWalkthrough() {
    var page = window.location.pathname.split('/').pop() || '';
    // Pages with their own inline scene engines — walkthrough must not clash
    if (page === 'index.html' || page === 'home.html' || page === 'kids-guide.html' || page === '') return;

    // DELEGATION: presentation.js may be loading asynchronously via shell.js.
    // Poll for it, and only fall back to the local loop if we are SURE it isn't coming.
    var maxChecks = 40; // 4s timeout
    var checks = 0;

    function checkBridge() {
      if (window.__TENET5_PRESENTATION_LOADED) {
        console.log('[LIRIL-WALK] Presentation engine active — creating delegation bridge');
        _createPresentationBridge();
      } else if (checks < maxChecks && window.__TENET5_SHELL_LOADED) {
        // Wait for shell.js to finish injecting presentation.js
        checks++;
        setTimeout(checkBridge, 100);
      } else {
        console.log('[LIRIL-WALK] No presentation engine detected. Executing local narration loop.');
        _initLocalWalkthrough();
      }
    }
    checkBridge();
  }

  function _initLocalWalkthrough() {
    // ── 2026-04-18 REWRITE ────────────────────────────────────────────
    // User complaint: "doesn't read the full slides, out of sorts,
    // hallucinated garbage." Root causes of the previous version:
    //   1. TWO-PASS collection (all data-narrate first, then auto-gen
    //      only if < 3 points) broke chronological order — hero
    //      data-narrate attributes from anywhere on the page were
    //      collected first, then section headings, so the user heard
    //      summaries, then random headings out of context.
    //   2. Jaccard-similarity dedup at 0.6 threshold silently dropped
    //      whole sections on topic-focused investigation pages where
    //      sections share vocabulary (MAID, vaccine, Brookfield, etc.).
    //   3. Auto-generated points took heading + first 200 chars of
    //      first paragraph only — the rest of every section was never
    //      read aloud.
    //   4. Sections WITH data-narrate were narrated using ONLY the
    //      short curated summary — the actual body text never read.
    //
    // New behaviour: SINGLE-PASS, DOCUMENT-ORDER, FULL-CONTENT.
    // Each slide = one narratable section, text = full visible text in
    // document order, optionally prefixed by the data-narrate summary
    // as a lead-in sentence. Exact-dedup only (no jaccard).
    // ────────────────────────────────────────────────────────────────
    var MAX_POINTS_PER_PAGE = 200;

    function normalizeForDedup(text) {
      return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    }

    // Tags whose text is narrated (leaves).
    var NARRATE_TAGS = {H1:1, H2:1, H3:1, H4:1, H5:1, H6:1, P:1, LI:1,
                        BLOCKQUOTE:1, FIGCAPTION:1, CAPTION:1, DT:1, DD:1,
                        TH:1, TD:1, SUMMARY:1};
    // Tags whose subtree we never read.
    var SKIP_TAGS = {SCRIPT:1, STYLE:1, NAV:1, HEADER:1, FOOTER:1,
                     BUTTON:1, FORM:1, INPUT:1, SELECT:1, TEXTAREA:1,
                     IFRAME:1, SVG:1, CANVAS:1, TEMPLATE:1};
    var SKIP_CLASSES = {
      'skip-link':1, 'pres-indicator':1, 'pres-narration-badge':1,
      'liril-subtitle-bar':1, 'liril-tour-progress':1, 'liril-counter':1,
      'liril-start-btn':1, 'source-cite':1
    };

    function extractSlideText(slide) {
      var parts = [];
      function visit(n) {
        if (!n || n.nodeType !== 1) return;
        if (SKIP_TAGS[n.tagName]) return;
        if (n.classList) {
          for (var ci = 0; ci < n.classList.length; ci++) {
            if (SKIP_CLASSES[n.classList[ci]]) return;
          }
        }
        var view = n.ownerDocument && n.ownerDocument.defaultView;
        if (view && view.getComputedStyle) {
          var st = view.getComputedStyle(n);
          if (st.display === 'none' || st.visibility === 'hidden') return;
        }
        if (NARRATE_TAGS[n.tagName]) {
          var t = (n.textContent || '').replace(/\s+/g, ' ').trim();
          if (t.length >= 2) parts.push(t);
          return;
        }
        var ch = n.children;
        for (var i = 0; i < ch.length; i++) visit(ch[i]);
      }
      visit(slide);
      return parts.join('. ').replace(/\.\.+/g, '.').replace(/\s+\./g, '.');
    }

    // Slide = a narratable section of content. Outer-wins for nesting
    // EXCEPT for explicit card patterns (ALWAYS_INDEPENDENT) which
    // stay independent even when inside a dominating section. This
    // handles pages like charges-sheet.html that have ONE wrapping
    // <section> containing 40+ individual .person-card entries each
    // of which should be its own slide.
    var ALWAYS_INDEPENDENT = [
      '.person-card', '.charge-card', '.case-card',
      '.program-card', '.node-card', '.record',
      '.dossier', '.intel-card', '.investigation-card',
      '.stat-card', '.finding-box', '.evidence-block',
      '.verdict-box', '.callout', '.call-out'
    ];
    // Comprehensive selector list covers the ~30+ card/section patterns
    // used across different investigation pages on TENET5.
    var SLIDE_SELECTORS = [
      // Explicit data-narrate — always a slide, regardless of tag
      '[data-narrate]',
      // Semantic sections
      'section', 'article',
      // Hero variants
      '.page-hero', '.hero', '.tl-hero', '.stat-hero-banner',
      '.bloggins-hero', '.cca-hero', '.cm-hero', '.conv-hero',
      '.cra-hero', '.crown-hero', '.debt-hero', '.ge-hero',
      '.imm-hero', '.infra-hero', '.news-hero', '.pattern-hero',
      '.pdd-hero', '.prov-hero', '.records-hero', '.ta-hero', '.vr-hero',
      // Timeline variants
      '.timeline-section', '.tl-timeline', '.timeline', '.timeline-item',
      '.timeline-entry', '.timeline-node',
      // Card patterns (vast majority of investigation-page content)
      '.finding-box', '.case-card', '.evidence-block', '.program-card',
      '.stat-card', '.stat-row', '.source-block',
      '.callout', '.call-out', '.callout-box',
      '.person-card', '.country-card', '.credibility-card',
      '.purchase-callout', '.record', '.crpd-card',
      '.evidence-box', '.finding-card', '.verdict-box',
      '.alert-card', '.anomaly-card',
      // Named page sections
      '.narrative-intro', '.hero-section',
      '.dnd-section', '.cc-section', '.cg-section', '.ge-section',
      '.ph-section', '.se-section', '.ta-section', '.war-section',
      '.charge-section', '.corp-section', '.data-section',
      '.entity-section', '.networks-section', '.pattern-section',
      '.section-block', '.section-head', '.section-title',
      // Page-specific content blocks (ADDED 2026-04-18 after E2E test
      // caught bloggins / charges-sheet / s504-tracker under-collecting
      // because they invented their own class names)
      '.dossier', '.bloggins-intro',
      '.charge-card',
      '.node-card',
      '.intel-card', '.investigation-card',
      // Loop / diagram blocks
      '.loop-diagram', '.loop-step'
    ];

    var points = [];

    function collectPoints() {
      points.length = 0;
      var seenNorms = {};
      var seenEls = new Set();
      var nodes = document.querySelectorAll(SLIDE_SELECTORS.join(','));

      // Iterate in document order (querySelectorAll preserves it).
      // For nested matches, keep OUTER and skip INNER (prevents reading
      // the same content twice once-as-section, once-as-timeline-node).
      // Helper: does this element match one of the always-independent
      // card patterns? If so, it stays a slide even when nested.
      function isAlwaysIndependent(el) {
        for (var i = 0; i < ALWAYS_INDEPENDENT.length; i++) {
          if (el.matches && el.matches(ALWAYS_INDEPENDENT[i])) return true;
        }
        return false;
      }

      nodes.forEach(function(el) {
        if (points.length >= MAX_POINTS_PER_PAGE) return;
        if (seenEls.has(el)) return;
        var independent = isAlwaysIndependent(el);
        var anc = el.parentElement, dominated = false;
        while (anc) {
          if (seenEls.has(anc)) { dominated = true; break; }
          anc = anc.parentElement;
        }
        // Card patterns (person-card, charge-card, record, etc.) stay
        // independent even when inside a dominating section.
        if (dominated && !independent) return;
        if (el.closest('nav, header, footer, #site-header-frame, #site-footer-frame, #hud-controls')) return;
        if (el.closest('[style*="grid-template-columns"]') &&
            !el.matches('section, article, main') &&
            !el.closest('main, article')) return;

        var body = extractSlideText(el);
        var lead = ((el.getAttribute && (
          el.getAttribute('data-narrate') || el.getAttribute('data-narration')
        )) || '').trim();
        if (lead === 'connected-intelligence') lead = '';

        var raw = '';
        if (lead && body && body.toLowerCase().indexOf(lead.toLowerCase().substring(0, 40)) < 0) {
          raw = lead + (/[.!?]$/.test(lead) ? ' ' : '. ') + body;
        } else {
          raw = body || lead;
        }
        var clean = sanitiseNarration(raw);
        if (clean.length < 15) return;

        // Exact-duplicate only — do NOT jaccard-reject similar sections.
        var norm = normalizeForDedup(clean);
        if (seenNorms[norm]) return;
        seenNorms[norm] = true;
        seenEls.add(el);

        points.push({ el: el, text: clean });
      });

      console.log('[LIRIL-WALK] Collected ' + points.length +
                  ' slides in document order (' +
                  points.reduce(function(s,p){return s+p.text.length;}, 0) +
                  ' total chars).');
    }

    collectPoints();
    tryLoadAudio();
    if (points.length < 2) {
      // In auto-walk mode, skip to next page if this page has no walkthrough points
      try {
        var _ap = JSON.parse(sessionStorage.getItem('liril_autopilot') || 'null');
        if (_ap && _ap.autostart && window.__TENET5_NEXT_PAGE) {
          setTimeout(function() { window.__TENET5_NEXT_PAGE(); }, 2000);
        }
      } catch(e) {}
      return;
    }

    // ── State ────────────────────────────────────────
    var currentPoint = -1;
    var isActive = false;
    var keepaliveTimer = null;
    var chunkQueue = [];
    var speakingChunks = false;

    // ── MP3 Audio Support (AvaMultilingual neural voice) ──
    var audioElement = null;
    var audioCues = [];
    var audioMode = false;
    var _audioTimeHandler = null;
    var _audioEndHandler = null;
    var _audioFetchPending = false;

    function parseVTT(vttText) {
      var cues = [];
      var blocks = vttText.split(/\n\n+/);
      blocks.forEach(function(block) {
        var lines = block.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
          var m = lines[i].match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
          if (m) {
            var start = +m[1]*3600 + +m[2]*60 + +m[3] + +m[4]/1000;
            var end = +m[5]*3600 + +m[6]*60 + +m[7] + +m[8]/1000;
            var text = lines.slice(i + 1).join(' ').trim();
            if (text) cues.push({ start: start, end: end, text: text });
            break;
          }
        }
      });
      return cues;
    }

    function normalizeForMatch(t) {
      return (t || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    }

    function findCueIndexForPoint(text) {
      var norm = normalizeForMatch(text).substring(0, 120);
      if (!norm || !audioCues.length) return -1;
      var normWords = norm.split(' ').filter(function(w) { return w.length > 2; });
      var bestIdx = -1, bestScore = 0;
      for (var i = 0; i < audioCues.length; i++) {
        var cn = normalizeForMatch(audioCues[i].text);
        // 1. Prefix char overlap (original method)
        var prefixOverlap = 0;
        var limit = Math.min(norm.length, cn.length);
        for (var j = 0; j < limit; j++) {
          if (norm[j] === cn[j]) prefixOverlap++; else break;
        }
        // 2. Word overlap — count shared significant words
        var cueWords = cn.split(' ').filter(function(w) { return w.length > 2; });
        var wordHits = 0;
        normWords.forEach(function(w) {
          if (cueWords.indexOf(w) >= 0) wordHits++;
        });
        // Combined score: prefix chars + word matches * 5
        var score = prefixOverlap + (wordHits * 5);
        if (score > bestScore && (prefixOverlap > 8 || wordHits >= 3)) {
          bestScore = score; bestIdx = i;
        }
      }
      return bestIdx;
    }

    function tryLoadAudio() {
      _audioFetchPending = true;
      var pageName = (window.location.pathname.split('/').pop() || '').toLowerCase();
      // Shell fallback
      if (!pageName || pageName === 'index.html') {
        try {
          var loadParam = new URLSearchParams(window.location.search).get('load');
          if (loadParam) pageName = loadParam.split('?')[0].split('#')[0].split('/').pop().toLowerCase();
        } catch(e) {}
      }
      var slug = pageName.replace(/\.html$/, '');
      if (!slug) { _audioFetchPending = false; return; }
      var mp3 = 'audio/' + slug + '.mp3';
      var vtt = 'audio/' + slug + '.vtt';

      // Always create the audio element so we can unlock autoplay synchronously later
      audioElement = new Audio(mp3);
      audioElement.preload = 'auto';

      // Use GET on the lightweight VTT instead of HEAD on MP3, which GH Pages can block
      fetch(vtt).then(function(r) {
        if (!r.ok) throw new Error('No VTT');
        return r.text();
      }).then(function(vttText) {
        _audioFetchPending = false;
        if (!vttText) return;
        audioCues = parseVTT(vttText);

        points.forEach(function(p) {
          var ci = findCueIndexForPoint(p.text);
          p.audioStart = ci >= 0 ? audioCues[ci].start : -1;
          p.audioCueIdx = ci;
        });
        
        var mappedStarts = points
          .filter(function(p) { return p.audioStart >= 0; })
          .map(function(p) { return p.audioStart; })
          .sort(function(a, b) { return a - b; });
          
        for (var i = 0; i < points.length; i++) {
          if (points[i].audioStart < 0) continue;
          var next = -1;
          for (var k = 0; k < mappedStarts.length; k++) {
            if (mappedStarts[k] > points[i].audioStart + 0.1) { next = mappedStarts[k]; break; }
          }
          points[i].audioEnd = next > 0 ? next : -1;
        }
        audioMode = true;
        console.log('[LIRIL] Audio mode:', mp3, audioCues.length, 'cues,',
          points.filter(function(p) { return p.audioStart >= 0; }).length + '/' + points.length, 'mapped');
        
        // If we were already playing fallback speech because of a race condition, switch to audio!
        if (isActive && !speakingChunks && audioElement) {
            // we let the current speech chunk finish, then the next point will pick up the Audio!
        }
      }).catch(function() { 
        _audioFetchPending = false;
        console.log('[LIRIL] No audio for page, using speech fallback'); 
      });
    }

    // ── Create walkthrough UI ────────────────────────

    // Inject Responsive Subtitle CSS
    if (!document.getElementById('liril-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'liril-styles';
      styleEl.innerHTML = `
        .liril-subtitle-bar {
          position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%);
          width: 90%; max-width: 800px; text-align: center;
          z-index: 10000; pointer-events: none;
          opacity: 0; transition: opacity 0.4s ease;
        }
        .liril-subtitle-text {
          display: inline-block; position: relative; overflow: hidden;
          background: rgba(5, 5, 10, 0.95);
          color: #e0ddd6; padding: 16px 28px 14px; border-radius: 4px;
          font-size: 1rem; line-height: 1.65;
          border: 1px solid rgba(14, 165, 233, 0.18);
          backdrop-filter: blur(16px); font-family: Inter, -apple-system, sans-serif;
          max-width: 100%; text-align: left;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5), inset 0 0 40px rgba(14,165,233,0.015);
        }
        /* HUD corner brackets */
        .liril-subtitle-text::before, .liril-subtitle-text::after {
          content: ''; position: absolute; width: 12px; height: 12px;
          border-color: rgba(34, 211, 238, 0.4); border-style: solid;
          pointer-events: none;
        }
        .liril-subtitle-text::before {
          top: 4px; left: 4px; border-width: 1px 0 0 1px;
        }
        .liril-subtitle-text::after {
          bottom: 4px; right: 4px; border-width: 0 1px 1px 0;
        }
        /* Scan line animation inside subtitle */
        .liril-subtitle-text .liril-scan {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent);
          animation: lirilScanSweep 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes lirilScanSweep {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .liril-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.6rem; color: rgba(14, 165, 233, 0.55);
          margin-bottom: 8px; font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 2.5px; text-transform: uppercase;
        }
        .liril-badge::before {
          content: ''; display: inline-block; width: 5px; height: 5px;
          background: #0ea5e9; border-radius: 50%;
          animation: lirilBadgeDot 2s ease-in-out infinite;
        }
        @keyframes lirilBadgeDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(14,165,233,0.6); }
          50% { opacity: 0.3; box-shadow: none; }
        }
        .liril-start-btn {
          position: fixed !important; top: 84px !important; right: 20px !important; bottom: auto !important;
          z-index: 10002 !important;
          background: rgba(14, 165, 233, 0.92); color: white;
          border: 1px solid rgba(34, 211, 238, 0.38);
          border-radius: 999px; padding: 10px 16px;
          font-size: 0.75rem; font-weight: 700; cursor: pointer;
          font-family: 'Rajdhani', Inter, sans-serif; letter-spacing: 0.08em;
          text-transform: uppercase; transition: background 0.25s, box-shadow 0.25s, border-color 0.25s;
          box-shadow: 0 6px 18px rgba(14,165,233,0.28);
        }
        .pres-page-indicator { pointer-events: none; }
        .pres-page-indicator .pres-page-nav { pointer-events: auto; }
        .pres-page-info, .pres-narration-badge { pointer-events: none; }
        .liril-start-btn:hover {
          background: rgba(14, 165, 233, 1); border-color: #22d3ee;
          box-shadow: 0 0 24px rgba(14,165,233,0.5);
          transform: translateY(-1px);
        }
        .liril-counter {
          font-size: 0.6rem; color: rgba(255, 255, 255, 0.25);
          margin-top: 10px; text-align: right;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.5px;
        }
        /* Active narration point highlight — Jurassic-Park style:
           brass aperture + directional arrow + mild pulse. The
           element being read gets a scoped spotlight; everything
           else fades slightly so the reader's eye is drawn to
           the current text, the way the fossil dig sequence in
           the 1993 film pulls the viewer through reconstruction
           stage by stage. */
        .liril-narrating-point {
          position: relative;
          outline: 2px solid rgba(181,131,90,0.7) !important;
          outline-offset: 6px !important;
          box-shadow:
            0 0 0 4px rgba(181,131,90,0.10),
            0 0 42px rgba(181,131,90,0.18),
            inset 0 0 0 1px rgba(255,255,255,0.04);
          border-radius: 6px;
          transition: outline 0.35s ease, box-shadow 0.6s ease, transform 0.5s ease;
          animation: liril-aperture-pulse 3.2s ease-in-out infinite;
        }
        .liril-narrating-point::before {
          content: '';
          position: absolute;
          left: -22px;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 12px solid #b5835a;
          opacity: 0.85;
          pointer-events: none;
          animation: liril-arrow-bob 1.6s ease-in-out infinite;
        }
        @keyframes liril-aperture-pulse {
          0%, 100% {
            outline-color: rgba(181,131,90,0.7);
            box-shadow: 0 0 0 4px rgba(181,131,90,0.10), 0 0 42px rgba(181,131,90,0.18), inset 0 0 0 1px rgba(255,255,255,0.04);
          }
          50% {
            outline-color: rgba(181,131,90,0.95);
            box-shadow: 0 0 0 5px rgba(181,131,90,0.15), 0 0 62px rgba(181,131,90,0.28), inset 0 0 0 1px rgba(255,255,255,0.06);
          }
        }
        @keyframes liril-arrow-bob {
          0%, 100% { transform: translate(0, -50%); }
          50%      { transform: translate(3px, -50%); }
        }
        /* Defocus everything else during narration */
        body.liril-narrating .liril-narrating-point { opacity: 1; filter: none; }
        body.liril-narrating .content > section:not(:has(.liril-narrating-point)) {
          opacity: 0.35;
          filter: saturate(0.75);
          transition: opacity 0.8s ease, filter 0.8s ease;
        }
        /* Reader-respect: skip animations if user has reduced-motion on */
        @media (prefers-reduced-motion: reduce) {
          .liril-narrating-point, .liril-narrating-point::before { animation: none !important; }
          body.liril-narrating .content > section { opacity: 1 !important; filter: none !important; }
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .liril-subtitle-bar { bottom: 78px; width: 95%; }
          .liril-subtitle-text { padding: 10px 16px; font-size: 0.85rem; line-height: 1.4; }
          .liril-start-btn { top: 72px !important; right: 12px !important; bottom: auto !important; padding: 7px 12px; font-size: 0.72rem; }
        }

        /* Auto-tour progress bar */
        .liril-tour-progress {
          position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
          background: rgba(5, 5, 10, 0.92);
          padding: 6px 20px; display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          font-family: 'IBM Plex Mono', monospace;
        }
        .liril-tour-label {
          font-size: 0.6rem; color: #8b5cf6;
          letter-spacing: 2px; text-transform: uppercase;
          white-space: nowrap;
        }
        .liril-tour-track {
          flex: 1; height: 3px; background: rgba(139, 92, 246, 0.12);
          border-radius: 2px; overflow: hidden;
        }
        .liril-tour-fill {
          height: 100%; background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          border-radius: 2px; transition: width 0.8s ease;
        }
        .liril-tour-count {
          font-size: 0.6rem; color: rgba(139, 92, 246, 0.6);
          letter-spacing: 1px; white-space: nowrap;
        }
        .liril-tour-stop {
          background: none; border: 1px solid rgba(139, 92, 246, 0.3);
          color: #a78bfa; padding: 2px 10px; border-radius: 3px;
          font-size: 0.55rem; cursor: pointer; font-family: inherit;
          letter-spacing: 1px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .liril-tour-stop:hover {
          background: rgba(139, 92, 246, 0.15); border-color: #8b5cf6;
        }
        @media (max-width: 768px) {
          .liril-tour-progress { padding: 4px 12px; gap: 8px; }
          .liril-tour-label { font-size: 0.5rem; }
        }
      `;
      document.head.appendChild(styleEl);
    }

    var subtitleBar = document.createElement('div');
    subtitleBar.id = 'liril-subtitle';
    subtitleBar.className = 'liril-subtitle-bar';
    subtitleBar.setAttribute('aria-live', 'polite');
    subtitleBar.setAttribute('aria-atomic', 'true');
    subtitleBar.setAttribute('role', 'region');
    subtitleBar.setAttribute('aria-label', 'LIRIL Walkthrough Subtitles');

    var subtitleText = document.createElement('div');
    subtitleText.className = 'liril-subtitle-text';
    subtitleBar.appendChild(subtitleText);
    document.body.appendChild(subtitleBar);

    var badge = document.createElement('span');
    badge.className = 'liril-badge';
    badge.textContent = getI18nStr('badge');

    var startBtn = document.createElement('button');
    startBtn.id = 'liril-start-walkthrough';
    startBtn.className = 'liril-start-btn';
    startBtn.innerHTML = getI18nStr('start');
    startBtn.setAttribute('aria-label', 'Start LIRIL Walkthrough Presentation');
    startBtn.setAttribute('aria-controls', 'liril-subtitle');
    document.body.appendChild(startBtn);

    // ── Auto-tour progress bar ───────────────────────
    var tourProgressEl = null;
    var tourFillEl = null;
    var tourCountEl = null;

    function showTourProgress() {
      if (tourProgressEl) return; // already showing
      var prog = window.__TENET5_PAGE_PROGRESS ? window.__TENET5_PAGE_PROGRESS() : null;
      if (!prog) return;

      tourProgressEl = document.createElement('div');
      tourProgressEl.className = 'liril-tour-progress';
      tourProgressEl.innerHTML =
        '<span class="liril-tour-label">LIRIL FULL SITE TOUR</span>' +
        '<div class="liril-tour-track"><div class="liril-tour-fill"></div></div>' +
        '<span class="liril-tour-count"></span>' +
        '<button class="liril-tour-stop">STOP TOUR</button>';
      document.body.appendChild(tourProgressEl);

      tourFillEl = tourProgressEl.querySelector('.liril-tour-fill');
      tourCountEl = tourProgressEl.querySelector('.liril-tour-count');

      var stopBtn = tourProgressEl.querySelector('.liril-tour-stop');
      stopBtn.addEventListener('click', function() {
        clearAutopilot();
        hideTourProgress();
        endWalkthrough();
      });

      updateTourProgress();
    }

    function updateTourProgress() {
      var prog = window.__TENET5_PAGE_PROGRESS ? window.__TENET5_PAGE_PROGRESS() : null;
      if (!prog || !tourFillEl) return;
      var pct = Math.round((prog.current / prog.total) * 100);
      tourFillEl.style.width = pct + '%';
      tourCountEl.textContent = 'PAGE ' + prog.current + ' / ' + prog.total;
    }

    function hideTourProgress() {
      if (tourProgressEl) { tourProgressEl.remove(); tourProgressEl = null; tourFillEl = null; tourCountEl = null; }
    }

    // ── Chrome keepalive ─────────────────────────────
    // Chrome/Chromium bug: speechSynthesis silently stops after ~15s.
    // Workaround: pause + resume every 12s keeps it alive.
    // Using 12s (not 10s) to avoid collision with chunk transitions.
    function startKeepalive() {
      stopKeepalive();
      keepaliveTimer = setInterval(function() {
        if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.pause();
            setTimeout(function() { window.speechSynthesis.resume(); }, 50);
          } catch(e) { /* ignore keepalive errors */ }
        }
      }, 12000);
    }

    function stopKeepalive() {
      if (keepaliveTimer) { clearInterval(keepaliveTimer); keepaliveTimer = null; }
    }

    // ── Chunked speech engine ────────────────────────
    // Speaks an array of text chunks sequentially, then calls onDone.
    function speakChunks(chunks, voice, onDone) {
      chunkQueue = chunks.slice();
      speakingChunks = true;
      startKeepalive();

      function next() {
        if (!isActive || !speakingChunks) { stopKeepalive(); return; }
        if (chunkQueue.length === 0) {
          speakingChunks = false;
          stopKeepalive();
          if (onDone) onDone();
          return;
        }
        var chunk = chunkQueue.shift();
        // Re-resolve voice EVERY chunk to prevent Chrome voice drift
        var currentVoice = resolveVoice() || voice;
        var params = (window.LIRIL_VOICE && window.LIRIL_VOICE.params) || { rate: 1.08, pitch: 0.92, volume: 1.0 };
        var u = new SpeechSynthesisUtterance(chunk);
        u.lang = 'en-CA'; // LIRIL is Canadian — angry Canadian woman
        u.rate = params.rate;
        u.pitch = params.pitch;
        u.volume = params.volume;
        if (currentVoice) u.voice = currentVoice;
        u.onend = function() { setTimeout(next, 150); };
        u.onerror = function() { setTimeout(next, 150); };
        // Cancel any lingering speech to force Chrome to re-apply voice
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        window.speechSynthesis.speak(u);
      }

      next();
    }

    // ── Voice selection — delegates to LIRIL_VOICE (single source of truth) ──
    // All voice resolution, caching, retry, and voiceschanged handling lives
    // in liril-voice.js. DO NOT duplicate logic here — that causes drift.
    //
    // 2026-04-18 FIX: previous version hard-rejected any non-Clara voice and
    // returned null, which meant the walkthrough went SILENT on every system
    // without Microsoft Clara installed (most Windows/Mac/Linux defaults).
    // liril-voice.js already has proper fallback ranking (jenny, sonia, aria,
    // hazel, libby) — we must NOT throw that fallback away. If Clara is
    // absent, use the best-ranked female English neural voice available.
    function resolveVoice() {
      if (!window.LIRIL_VOICE) return null;
      var v = window.LIRIL_VOICE.get();
      if (!v) return null;
      if (!window.LIRIL_VOICE.isTargetVoice(v)) {
        // Accept the fallback voice liril-voice.js already selected.
        // This is a legitimate female English neural voice — safe to use.
        console.log('[LIRIL-WALK] Using fallback voice (Clara unavailable):', v.name);
      }
      return v;
    }

    // Wait until ANY acceptable voice is available (up to 2.5 seconds).
    // Previous version waited 4 seconds specifically for Clara; with the
    // fallback fix above, we just need the voice engine ready at all.
    function waitForClara(cb) {
      var waited = 0;
      var poll = setInterval(function() {
        waited += 200;
        var v = window.LIRIL_VOICE ? window.LIRIL_VOICE.get() : null;
        if (v || waited >= 2500) {
          clearInterval(poll);
          if (v && window.LIRIL_VOICE.isTargetVoice(v)) {
            console.log('[LIRIL-WALK] ★ Clara ready:', v.name);
          } else if (v) {
            console.log('[LIRIL-WALK] Voice ready (fallback):', v.name);
          } else {
            console.warn('[LIRIL-WALK] No voice after 2.5s — speech disabled');
          }
          cb(v);
        }
      }, 200);
    }

    // ── Walkthrough controls ─────────────────────────
    function showPoint(idx) {
      if (idx < 0 || idx >= points.length) return;

      // Cancel any in-flight speech/audio
      speakingChunks = false;
      chunkQueue.length = 0;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioElement) {
        if (_audioTimeHandler) audioElement.removeEventListener('timeupdate', _audioTimeHandler);
        if (_audioEndHandler) audioElement.removeEventListener('ended', _audioEndHandler);
        audioElement.pause();
      }

      currentPoint = idx;
      var point = points[idx];

      point.el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight via CSS class — also toggle body.liril-narrating so
      // the surrounding sections dim (Jurassic-Park-style attention
      // draw). Cleared when narration stops (below + in hideSubtitle).
      points.forEach(function(p) {
        p.el.classList.remove('liril-narrating-point');
      });
      point.el.classList.add('liril-narrating-point');
      document.body.classList.add('liril-narrating');

      // Subtitle
      subtitleText.innerHTML = '';

      // Scan line effect
      var scanLine = document.createElement('div');
      scanLine.className = 'liril-scan';
      subtitleText.appendChild(scanLine);

      subtitleText.appendChild(badge.cloneNode(true));

      var textNode = document.createElement('span');
      textNode.textContent = point.text;
      subtitleText.appendChild(textNode);

      var counter = document.createElement('div');
      counter.className = 'liril-counter';
      var counterText = (idx + 1) + ' / ' + points.length;
      try {
        var _ap = getAutopilotState();
        if (_ap && _ap.autostart) {
          var prog = window.__TENET5_PAGE_PROGRESS ? window.__TENET5_PAGE_PROGRESS() : null;
          if (prog) counterText += '  \u2502  PAGE ' + prog.current + ' / ' + prog.total;
        }
      } catch(e) {}
      counterText += '  \u2502  ' + getI18nStr('advance');
      counter.textContent = counterText;
      subtitleText.appendChild(counter);

      subtitleBar.style.opacity = '1';
      subtitleBar.style.pointerEvents = 'auto';

      startBtn.innerHTML = (idx + 1) + '/' + points.length + ' &#9654;';

      // ── Play audio or speak ──────────────────────
      if (!isActive) return;

      // MP3 audio is HIGHEST QUALITY — always prefer pre-rendered neural TTS
      if (audioMode && audioElement && point.audioStart >= 0) {
        audioElement.currentTime = point.audioStart;

        var endTime = point.audioEnd;
        _audioTimeHandler = function() {
          if (endTime > 0 && audioElement.currentTime >= endTime - 0.05) {
            audioElement.removeEventListener('timeupdate', _audioTimeHandler);
            audioElement.pause();
            if (isActive && currentPoint < points.length - 1) {
              setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
            } else if (isActive) {
              advanceToNextPageWalkthrough();
            }
          }
        };
        _audioEndHandler = function() {
          audioElement.removeEventListener('timeupdate', _audioTimeHandler);
          audioElement.removeEventListener('ended', _audioEndHandler);
          if (isActive && currentPoint < points.length - 1) {
            setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
          } else if (isActive) {
            advanceToNextPageWalkthrough();
          }
        };
        audioElement.addEventListener('timeupdate', _audioTimeHandler);
        audioElement.addEventListener('ended', _audioEndHandler);
        audioElement.play().catch(function(e) {
          console.warn('[LIRIL] MP3 play failed (autoplay policy?) — falling back to speech:', e);
          audioElement.removeEventListener('timeupdate', _audioTimeHandler);
          audioElement.removeEventListener('ended', _audioEndHandler);
          // Fall through to speechSynthesis
          if ('speechSynthesis' in window) {
            var fbChunks = chunkText(point.text);
            var fbVoice = resolveVoice();
            speakChunks(fbChunks, fbVoice, function() {
              if (isActive && currentPoint < points.length - 1) {
                setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
              } else if (isActive) {
                advanceToNextPageWalkthrough();
              }
            });
          }
        });
        return;
      }

      // Fallback: speechSynthesis with chunking.
      // 2026-04-18 FIX: previously only started speaking if Clara was loaded,
      // which meant 4+ second delays on every point and total silence when
      // Clara wasn't installed. Now: speak IMMEDIATELY with whatever voice
      // resolveVoice() returns (Clara if available, best female fallback
      // otherwise). Only wait if speechSynthesis has returned no voices at
      // all yet (cold browser start).
      if ('speechSynthesis' in window) {
        var chunks = chunkText(point.text);
        var voice = resolveVoice();

        if (voice) {
          // Voice ready (Clara or fallback) — speak immediately
          speakChunks(chunks, voice, function() {
            if (isActive && currentPoint < points.length - 1) {
              setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
            } else if (isActive) {
              advanceToNextPageWalkthrough();
            }
          });
        } else {
          // No voice available yet — wait briefly for engine to populate
          waitForClara(function(anyVoice) {
            if (!isActive) return;
            speakChunks(chunks, anyVoice, function() {
              if (isActive && currentPoint < points.length - 1) {
                setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
              } else if (isActive) {
                advanceToNextPageWalkthrough();
              }
            });
          });
        }
      }
    }

    // 2026-04-18: auto-rescan on DOM mutations so pages that fetch
    // their content async (charges-sheet.html, any data-driven page)
    // get their new content included in the walkthrough. Debounced
    // so we don't thrash on small DOM changes.
    var _rescanTimer = null;
    function _scheduleRescan() {
      if (_rescanTimer) return;
      _rescanTimer = setTimeout(function() {
        _rescanTimer = null;
        var before = points.length;
        if (isActive) return;  // never change points mid-walkthrough
        collectPoints();
        if (points.length !== before) {
          console.log('[LIRIL-WALK] Auto-rescan after DOM change: ' +
                      before + ' → ' + points.length + ' slides.');
          if (points.length >= 2) startBtn.style.display = '';
        }
      }, 1200);
    }
    if (typeof MutationObserver !== 'undefined') {
      try {
        var contentRoot = document.querySelector('.content, main, #main') || document.body;
        var mo = new MutationObserver(function(muts) {
          // Only react to substantive additions (> 30 chars of new text)
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type !== 'childList' || !m.addedNodes.length) continue;
            for (var j = 0; j < m.addedNodes.length; j++) {
              var node = m.addedNodes[j];
              if (node.nodeType === 1 &&
                  (node.textContent || '').trim().length > 30) {
                _scheduleRescan();
                return;
              }
            }
          }
        });
        mo.observe(contentRoot, { childList: true, subtree: true });
      } catch (e) {
        console.warn('[LIRIL-WALK] MutationObserver setup failed:', e);
      }
    }

    function startWalkthrough() {
      // Always re-collect on click — picks up any content that loaded
      // after initial page render (async fetches, etc.).
      collectPoints();


      if (window.__TENET5_LIRIL_STOP) {
        window.__TENET5_LIRIL_STOP();
      }

      isActive = true;
      startBtn.innerHTML = getI18nStr('stop');
      startBtn.style.background = 'rgba(100,100,100,0.9)';
      startBtn.setAttribute('aria-expanded', 'true');

      // UNLOCK AUTOPLAY: browsers require audio.play() to be called synchronously
      // during a user click event to authorize background audio later.
      if (audioElement) {
        // Attempt a silent play/pause to unlock the element
        var p = audioElement.play();
        if (p !== undefined) {
          p.then(function() { audioElement.pause(); }).catch(function(){});
        }
      }

      setAutopilotState({ autostart: true, startedAt: Date.now() });
      showTourProgress();

      // Delay start if audio is still fetching to prevent SpeechSynthesis race condition
      if (!audioMode && _audioFetchPending) {
        console.log('[LIRIL] Waiting for audio fetch before starting...');
        startBtn.innerHTML = 'SYNCING QUANTUM AUDIO...';
        var checkInterval = setInterval(function() {
          if (!isActive) { clearInterval(checkInterval); return; }
          if (!_audioFetchPending) {
            clearInterval(checkInterval);
            startBtn.innerHTML = getI18nStr('stop');
            showPoint(0);
          }
        }, 100);
      } else {
        showPoint(0);
      }
    }

    // ── Cross-page autopilot state ──────────────────
    // Uses PAGE_SEQUENCE from presentation.js via __TENET5_NEXT_PAGE.
    // When LIRIL finishes narrating a page, she automatically navigates
    // to the next investigation page and continues the walkthrough.
    var AUTOPILOT_KEY = 'liril_autopilot';

    function getAutopilotState() {
      try { return JSON.parse(sessionStorage.getItem(AUTOPILOT_KEY) || 'null'); } catch(e) { return null; }
    }
    function setAutopilotState(state) {
      try { sessionStorage.setItem(AUTOPILOT_KEY, JSON.stringify(state)); } catch(e) {}
    }
    function clearAutopilot() {
      try { sessionStorage.removeItem(AUTOPILOT_KEY); } catch(e) {}
    }

    function endWalkthrough() {
      isActive = false;
      speakingChunks = false;
      chunkQueue.length = 0;
      stopKeepalive();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioElement) {
        if (_audioTimeHandler) { audioElement.removeEventListener('timeupdate', _audioTimeHandler); _audioTimeHandler = null; }
        if (_audioEndHandler) { audioElement.removeEventListener('ended', _audioEndHandler); _audioEndHandler = null; }
        audioElement.pause(); audioElement.currentTime = 0;
      }
      subtitleBar.style.opacity = '0';
      subtitleBar.style.pointerEvents = 'none';
      startBtn.innerHTML = getI18nStr('start');
      startBtn.style.background = '';
      startBtn.setAttribute('aria-expanded', 'false');
      points.forEach(function(p) { p.el.classList.remove('liril-narrating-point'); });
      document.body.classList.remove('liril-narrating');
      currentPoint = -1;
      hideTourProgress();
    }

    function advanceToNextPageWalkthrough() {
      // Clean up current page walkthrough state
      endWalkthrough();
      // Navigate to next page if autopilot is active
      var state = getAutopilotState();
      if (state && state.autostart && window.__TENET5_NEXT_PAGE) {
        var prog = window.__TENET5_PAGE_PROGRESS ? window.__TENET5_PAGE_PROGRESS() : null;
        if (prog && prog.current >= prog.total) {
          // Last page — tour complete
          clearAutopilot();
          showTourComplete();
          console.log('[LIRIL] Autopilot complete — full site walkthrough finished');
        } else {
          console.log('[LIRIL] Autopilot: advancing to next page', prog ? (prog.current + 1) + '/' + prog.total : '');
          setTimeout(function() { window.__TENET5_NEXT_PAGE(); }, 2000);
        }
        return;
      }
    }

    function showTourComplete() {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,5,10,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;';
      overlay.innerHTML =
        '<div style="color:#8b5cf6;font-size:1.8rem;font-family:Rajdhani,sans-serif;letter-spacing:4px;margin-bottom:12px;text-transform:uppercase;">TOUR COMPLETE</div>' +
        '<div style="color:#a1a1aa;font-size:0.85rem;font-family:Inter,sans-serif;max-width:400px;text-align:center;line-height:1.6;">LIRIL has guided you through the entire investigation. Click anywhere to dismiss.</div>';
      overlay.addEventListener('click', function() { overlay.remove(); });
      document.body.appendChild(overlay);
      setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 12000);
    }

    // ── Event listeners ──────────────────────────────
    startBtn.addEventListener('click', function() {
      if (isActive) {
        clearAutopilot(); // User manually stopped — disable cross-page nav
        endWalkthrough();
      } else {
        startWalkthrough();
      }
    });

    subtitleBar.addEventListener('click', function() {
      if (currentPoint < points.length - 1) showPoint(currentPoint + 1);
      else endWalkthrough();
    });

    document.addEventListener('keydown', function(e) {
      if (!isActive) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentPoint < points.length - 1) showPoint(currentPoint + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentPoint > 0) showPoint(currentPoint - 1);
      } else if (e.key === 'Escape') {
        clearAutopilot();
        endWalkthrough();
      }
    });

    // Voice pre-warm handled by liril-voice.js — no duplicate listeners needed

    window.__LIRIL_WALKTHROUGH_STOP_INTERNAL = endWalkthrough;

    // ── Rescan hook for dynamic pages ────────────────
    window.lirilRescan = function() {
      if (isActive) endWalkthrough();
      collectPoints();
      if (points.length >= 2) startBtn.style.display = '';
      else startBtn.style.display = 'none';
    };

    // Auto-start if arriving via autopilot cross-page flow.
    // Autopilot state is ONLY set when the user manually clicks the walkthrough
    // button (startWalkthrough). It is never set on initial page load.
    // This prevents "hallucinations" while still allowing full site tours.
    var autopilotState = getAutopilotState();
    if (autopilotState && autopilotState.autostart && points.length >= 2) {
      // Expire autopilot after 30 minutes to prevent stale sessions
      var age = Date.now() - (autopilotState.startedAt || 0);
      if (age > 30 * 60 * 1000) {
        clearAutopilot();
        console.log('[LIRIL] Autopilot expired (>30min)');
      } else {
        // Arriving from a previous page's walkthrough — auto-continue
        console.log('[LIRIL] Autopilot: continuing walkthrough from previous page');
        setTimeout(function() { startWalkthrough(); }, 1500);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalkthrough);
  } else {
    initWalkthrough();
  }
})();
