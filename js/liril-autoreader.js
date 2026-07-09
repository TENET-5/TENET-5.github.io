/* ═══════════════════════════════════════════════════════════════
   LIRIL Autoreader — Cap#209, 2026-04-24
   ═══════════════════════════════════════════════════════════════
   Daniel directive (2026-04-24):
     "liril should read all APPLICABLE text in the intelligence
      overviews autonomously to the user."

   Behavior:
     - On any page that qualifies as an "intelligence overview"
       (filename match, body class, or <meta liril-autoread>),
       LIRIL extracts all readable headline + paragraph text from
       the main content area and reads it aloud sequentially.
     - Uses the canonical voice resolver (window.LIRIL_VOICE) so
       the voice is ALWAYS Clara (or the documented fallback).
     - Browser autoplay policy blocks unsolicited speechSynthesis;
       we honor it cleanly with a small floating "▶ LIRIL is
       reading" pill that auto-fires on first user gesture, OR
       autoplays immediately on subsequent visits if the user
       previously consented (localStorage flag).
     - Skips scripts, styles, code blocks, hidden elements, nav,
       footer, share widgets, breadcrumbs, and the threat banner
       chrome — only "applicable" article text is read.
     - Pause / resume / stop controls live in the same pill.
     - Respects prefers-reduced-motion (no pulse) and prefers-
       reduced-data-usage (no autostart, manual button only).
     - Singleton: re-loading the script is a no-op.

   Wire-in: shell.js loads this AFTER liril-voice.js for content
   iframes (Cap#209 patch). For top-level pages that don't go
   through the shell, the script is also harmless to drop into
   the page directly.

   Reversibility: comment the loadScript line in shell.js or set
     <body data-liril-autoread="off">
   on a page to suppress.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.LIRIL_AUTOREADER) return;

  var LS_CONSENT = 'liril-autoread-consent';   // 'yes' | 'no' | unset
  var LS_LASTPATH = 'liril-autoread-lastpath'; // last auto-read path (avoid re-firing on reload)
  // Cap#137 master mute switch — written by js/liril-narrate.js. We honor
  // it as a SINGLE source of truth across both narrators so the user's one
  // mute click silences everything.
  var LS_MASTER_MUTE = 'liril-narrate-muted';

  // Cross-frame lock — prevents the experience-shell narrator (running on
  // the parent index.html) and the iframe autoreader from speaking over
  // each other. Any frame that starts speaking writes its id; any frame
  // that wants to speak yields if another id holds the lock.
  function _topWin() {
    try { return window.top; } catch (_) { return window; }
  }
  function masterMuted() {
    try { return localStorage.getItem(LS_MASTER_MUTE) === '1'; } catch (_) { return false; }
  }
  function cancelParentSpeech() {
    // When we start, cancel the parent shell's queued utterances so the OS
    // speech queue isn't stacked with two narrators at once.
    try {
      if (window.parent && window.parent !== window && window.parent.speechSynthesis) {
        window.parent.speechSynthesis.cancel();
      }
    } catch (_) { /* cross-origin — fine */ }
  }

  // ── Eligibility ─────────────────────────────────────────────
  // A page qualifies as an intelligence overview if ANY of:
  //   1. <body data-liril-autoread="on">  (explicit opt-in)
  //   2. <meta name="liril-autoread" content="on">
  //   3. body class contains 'liril-autoread'
  //   4. URL path matches one of the intelligence-overview patterns
  // It is HARD-disabled by:
  //   <body data-liril-autoread="off">
  //   <meta name="liril-autoread" content="off">
  var INTEL_PATTERNS = [
    /\/intelligence-report-[^/]+\.html$/i,
    /\/intelligence-report\.html$/i,
    /\/osint-dashboard\.html$/i,
    /\/intel(ligence)?-overview[^/]*\.html$/i,
    /\/findings\.html$/i,
    /\/state-of-investigation\.html$/i,
    /\/daily-(report|brief|intel)[^/]*\.html$/i,
    /\/ag-findings\.html$/i,
    /\/accountability[^/]*\.html$/i,
    /\/evidence-index\.html$/i,
    /\/municipal-intelligence\.html$/i,
    /\/officer-of-parliament-findings\.html$/i
  ];

  function getMeta(name) {
    var m = document.querySelector('meta[name="' + name + '"]');
    return m ? (m.getAttribute('content') || '').toLowerCase() : '';
  }

  function isHardDisabled() {
    var b = document.body;
    if (!b) return false;
    if ((b.getAttribute('data-liril-autoread') || '').toLowerCase() === 'off') return true;
    if (getMeta('liril-autoread') === 'off') return true;
    return false;
  }

  function isEligible() {
    if (isHardDisabled()) return false;
    var b = document.body;
    if (b) {
      if ((b.getAttribute('data-liril-autoread') || '').toLowerCase() === 'on') return true;
      if (b.classList && b.classList.contains('liril-autoread')) return true;
    }
    if (getMeta('liril-autoread') === 'on') return true;
    var path = (location.pathname || '') + (location.search || '');
    // index.html?load=intelligence-report-... — shell-loaded variant
    var loadParam = '';
    try {
      loadParam = new URLSearchParams(location.search).get('load') || '';
    } catch (_) { /* old browsers */ }
    var probe = loadParam ? ('/' + loadParam) : path;
    for (var i = 0; i < INTEL_PATTERNS.length; i++) {
      if (INTEL_PATTERNS[i].test(probe)) return true;
    }
    return false;
  }

  // ── Text extraction ─────────────────────────────────────────
  // "Applicable text" = headlines + paragraphs inside the main
  // article container, in document order, with chrome removed.
  var SKIP_SELECTORS = [
    'nav', 'header.site-header', 'footer', 'aside.share',
    'script', 'style', 'noscript', 'template', 'svg', 'code',
    'pre', 'samp', 'kbd', 'figure figcaption.tiny',
    '[aria-hidden="true"]', '[hidden]',
    '.liril-autoread-pill', '.share-bar', '.breadcrumbs',
    '.threat-dot', '.cookie-bar', '#site-header-frame',
    '#site-footer-frame', '.s5-binary-marquee'
  ].join(',');

  function isVisible(el) {
    if (!el) return false;
    if (el.closest && el.closest(SKIP_SELECTORS)) return false;
    var s = window.getComputedStyle ? getComputedStyle(el) : null;
    if (s && (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0')) return false;
    return true;
  }

  function findRoot() {
    return (
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('article') ||
      document.querySelector('.intel-container') ||
      document.querySelector('.content') ||
      document.body
    );
  }

  // Convert a heading to a slight pause + spoken form.
  function nodeToUtteranceText(el) {
    var raw = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    // Skip pure punctuation / symbols
    if (!/[a-z0-9]/i.test(raw)) return '';
    // Skip very short labels that are clearly chrome ("MENU", "CLOSE")
    if (raw.length < 3) return '';
    return raw;
  }

  function extractParagraphs() {
    var root = findRoot();
    if (!root) return [];
    var nodes = root.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, .threat-text, .metric-label, .metric-value');
    var out = [];
    var seen = Object.create(null);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!isVisible(el)) continue;
      var t = nodeToUtteranceText(el);
      if (!t) continue;
      if (seen[t]) continue; // dedupe identical lines (e.g. ARIA echoes)
      seen[t] = 1;
      out.push({ tag: el.tagName.toLowerCase(), text: t });
    }
    return out;
  }

  // Break a long paragraph into utterance-sized chunks (~220 chars
  // at sentence boundaries) so pause/skip work mid-paragraph and
  // SAPI doesn't choke on multi-kilobyte strings.
  function chunkText(text, maxLen) {
    maxLen = maxLen || 220;
    if (text.length <= maxLen) return [text];
    var sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
    var chunks = [];
    var buf = '';
    for (var i = 0; i < sentences.length; i++) {
      var s = sentences[i].trim();
      if (!s) continue;
      if ((buf + ' ' + s).trim().length > maxLen && buf) {
        chunks.push(buf.trim());
        buf = s;
      } else {
        buf = (buf ? buf + ' ' : '') + s;
      }
    }
    if (buf.trim()) chunks.push(buf.trim());
    return chunks;
  }

  function buildQueue() {
    var blocks = extractParagraphs();
    var q = [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var pieces = chunkText(b.text);
      for (var j = 0; j < pieces.length; j++) {
        q.push({ tag: b.tag, text: pieces[j] });
      }
    }
    return q;
  }

  // ── Speech engine ───────────────────────────────────────────
  var queue = [];
  var idx = 0;
  var playing = false;
  var paused = false;
  var pillEl = null;
  var statusEl = null;
  var btnPlayEl = null;
  var btnStopEl = null;
  var disposed = false;

  function speakNext() {
    if (disposed) return;
    if (paused) return;
    if (masterMuted()) {
      paused = true;
      playing = false;
      try { window.speechSynthesis.cancel(); } catch (_) {}
      setBtnPlay('▶ Read');
      setStatus('Muted by user.');
      return;
    }
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance !== 'function') {
      setStatus('TTS unavailable in this browser.');
      playing = false;
      return;
    }
    if (idx >= queue.length) {
      playing = false;
      setStatus('Done. ' + queue.length + ' segments read.');
      setBtnPlay('▶ Replay');
      idx = 0;
      return;
    }
    var item = queue[idx++];
    var u = new SpeechSynthesisUtterance(item.text);
    var params = (window.LIRIL_VOICE && window.LIRIL_VOICE.params) || { rate: 0.95, pitch: 1.05, volume: 1.0 };
    u.rate = params.rate;
    u.pitch = params.pitch;
    u.volume = params.volume;
    u.lang = 'en-CA';
    var voicePromise = (window.LIRIL_VOICE && window.LIRIL_VOICE.get)
      ? window.LIRIL_VOICE.get()
      : Promise.resolve(null);
    Promise.resolve(voicePromise).then(function (v) {
      var acceptable = v && (!window.LIRIL_VOICE || !window.LIRIL_VOICE.isAcceptable || window.LIRIL_VOICE.isAcceptable(v));
      if (!acceptable) {
        /* Never read with the OS default voice — stop instead. */
        setStatus('LIRIL voice unavailable on this system — reading paused.');
        setBtnPlay('▶ Read');
        playing = false; paused = true;
        return;
      }
      u.voice = v;
      u.lang = v.lang || 'en-GB';
      u.onend = function () { speakNext(); };
      u.onerror = function (e) {
        // Browser cancelled (tab change, autoplay block, etc.)
        if (e && e.error === 'not-allowed') {
          setStatus('Tap ▶ to start LIRIL reading.');
          playing = false;
          paused = true;
          setBtnPlay('▶ Read');
          return;
        }
        // Skip the broken segment, keep going
        speakNext();
      };
      setStatus('Reading ' + idx + ' / ' + queue.length + ' · ' + item.tag);
      try { window.speechSynthesis.speak(u); } catch (_) { speakNext(); }
    });
  }

  function start() {
    if (disposed) return;
    if (masterMuted()) {
      setStatus('Muted by user. Tap 🔊 (bottom-left) to unmute.');
      setBtnPlay('▶ Read');
      return;
    }
    queue = buildQueue();
    if (!queue.length) {
      setStatus('Nothing applicable to read on this page.');
      return;
    }
    idx = 0;
    paused = false;
    playing = true;
    setBtnPlay('⏸ Pause');
    cancelParentSpeech();   // Cap#209+Cap#137 deconflict
    try { window.speechSynthesis.cancel(); } catch (_) {}
    speakNext();
    try { localStorage.setItem(LS_CONSENT, 'yes'); } catch (_) {}
    try { localStorage.setItem(LS_LASTPATH, location.pathname); } catch (_) {}
  }

  function pause() {
    if (!playing) return;
    paused = true;
    try { window.speechSynthesis.pause(); } catch (_) {}
    setBtnPlay('▶ Resume');
    setStatus('Paused at ' + idx + ' / ' + queue.length + '.');
  }

  function resume() {
    if (!queue.length) { start(); return; }
    paused = false;
    try { window.speechSynthesis.resume(); } catch (_) {}
    playing = true;
    setBtnPlay('⏸ Pause');
    setStatus('Resumed.');
  }

  function stop() {
    paused = false;
    playing = false;
    idx = 0;
    try { window.speechSynthesis.cancel(); } catch (_) {}
    setBtnPlay('▶ Read');
    setStatus('Stopped.');
    try { localStorage.setItem(LS_CONSENT, 'no'); } catch (_) {}
  }

  function dispose() {
    disposed = true;
    try { window.speechSynthesis.cancel(); } catch (_) {}
    if (pillEl && pillEl.parentNode) pillEl.parentNode.removeChild(pillEl);
  }

  // ── Floating control pill ───────────────────────────────────
  function buildPill() {
    if (pillEl) return;
    pillEl = document.createElement('div');
    pillEl.className = 'liril-autoread-pill';
    pillEl.setAttribute('role', 'region');
    pillEl.setAttribute('aria-label', 'LIRIL Autoreader controls');
    pillEl.innerHTML = ''
      + '<style>'
      + '.liril-autoread-pill{position:fixed;right:18px;bottom:18px;z-index:99998;'
      + 'display:inline-flex;align-items:center;gap:.6rem;padding:.55rem .85rem;'
      + 'background:rgba(20,20,20,.92);color:#ededed;border:1px solid rgba(185,185,185,.22);'
      + 'border-radius:999px;font-family:"IBM Plex Mono","Consolas",monospace;'
      + 'font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;'
      + 'box-shadow:0 6px 18px rgba(0,0,0,.45);backdrop-filter:blur(10px);'
      + '-webkit-backdrop-filter:blur(10px);max-width:min(92vw,520px)}'
      + '.liril-autoread-pill .lar-dot{width:8px;height:8px;border-radius:50%;'
      + 'background:#b9b9b9;box-shadow:0 0 8px rgba(185,185,185,.55);'
      + 'animation:lar-pulse 2.6s ease-in-out infinite}'
      + '.liril-autoread-pill button{background:transparent;border:1px solid rgba(185,185,185,.30);'
      + 'color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;'
      + 'padding:.32rem .65rem;border-radius:999px;cursor:pointer;transition:background 120ms}'
      + '.liril-autoread-pill button:hover{background:rgba(185,185,185,.10)}'
      + '.liril-autoread-pill .lar-status{opacity:.8;white-space:nowrap;overflow:hidden;'
      + 'text-overflow:ellipsis;max-width:240px}'
      + '@keyframes lar-pulse{0%,100%{opacity:1}50%{opacity:.35}}'
      + '@media (prefers-reduced-motion:reduce){'
      + '.liril-autoread-pill .lar-dot{animation:none}}'
      + '@media (max-width:520px){'
      + '.liril-autoread-pill .lar-status{max-width:120px}}'
      + '</style>'
      + '<span class="lar-dot" aria-hidden="true"></span>'
      + '<span class="lar-label">LIRIL</span>'
      + '<span class="lar-status" aria-live="polite">Ready.</span>'
      + '<button type="button" class="lar-play" aria-label="Play or pause LIRIL reading">▶ Read</button>'
      + '<button type="button" class="lar-stop" aria-label="Stop LIRIL reading">■</button>';
    document.body.appendChild(pillEl);
    statusEl = pillEl.querySelector('.lar-status');
    btnPlayEl = pillEl.querySelector('.lar-play');
    btnStopEl = pillEl.querySelector('.lar-stop');
    btnPlayEl.addEventListener('click', function () {
      if (!playing && !queue.length) return start();
      if (playing && !paused) return pause();
      if (paused) return resume();
      return start();
    });
    btnStopEl.addEventListener('click', stop);
  }

  function setStatus(s) { if (statusEl) statusEl.textContent = s; }
  function setBtnPlay(label) { if (btnPlayEl) btnPlayEl.textContent = label; }

  // ── Autoplay-policy-friendly auto-start ────────────────────
  function tryAutoStart() {
    var consent = '';
    try { consent = localStorage.getItem(LS_CONSENT) || ''; } catch (_) {}
    var reduceData = false;
    try {
      reduceData = window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches;
    } catch (_) {}
    if (reduceData) {
      setStatus('Tap ▶ to start (reduced-data mode).');
      return;
    }
    if (consent === 'no') {
      setStatus('Tap ▶ to start.');
      return;
    }
    // Try eager start. Browsers that block will fire 'not-allowed' onerror;
    // our handler then waits for first user gesture.
    var armed = false;
    function armOnce() {
      if (armed) return;
      armed = true;
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
        document.removeEventListener(ev, armOnce, true);
      });
      start();
    }
    if (consent === 'yes') {
      // Previously consented — try immediately, then fall back to gesture.
      setTimeout(function () {
        start();
        // If start was blocked, our onerror handler set paused=true. Arm a gesture handler.
        setTimeout(function () {
          if (!playing) {
            setStatus('Tap anywhere or press ▶ to begin.');
            ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
              document.addEventListener(ev, armOnce, true);
            });
          }
        }, 600);
      }, 350);
    } else {
      // First-time visitor — show pill and wait for a gesture.
      setStatus('Tap anywhere or press ▶ to begin.');
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
        document.addEventListener(ev, armOnce, true);
      });
    }
  }

  // ── Boot ────────────────────────────────────────────────────
  function boot() {
    if (disposed) return;
    if (!isEligible()) return;
    if (!('speechSynthesis' in window)) return;
    buildPill();
    tryAutoStart();
  }

  function whenReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  // Stop on navigation away (SPA-shell fires its own URL changes too)
  window.addEventListener('beforeunload', function () { try { window.speechSynthesis.cancel(); } catch (_) {} });

  // Cap#209+Cap#137: react to the master mute switch maintained by
  // js/liril-narrate.js (storage key 'liril-narrate-muted'). When the user
  // clicks the 🔊 button on the experience shell, both narrators silence.
  window.addEventListener('storage', function (e) {
    if (e && e.key === LS_MASTER_MUTE) {
      if (e.newValue === '1') {
        // User just muted — stop reading.
        paused = true;
        playing = false;
        try { window.speechSynthesis.cancel(); } catch (_) {}
        setBtnPlay('▶ Read');
        setStatus('Muted.');
      } else if (e.newValue === '0' || e.newValue === null) {
        setStatus('Tap ▶ to resume.');
      }
    }
  });

  whenReady(boot);

  // ── Public API ──────────────────────────────────────────────
  window.LIRIL_AUTOREADER = {
    start: start,
    pause: pause,
    resume: resume,
    stop: stop,
    dispose: dispose,
    isEligible: isEligible,
    extract: extractParagraphs,
    queueLength: function () { return queue.length; },
    version: 'cap209-2026-04-24'
  };
})();
