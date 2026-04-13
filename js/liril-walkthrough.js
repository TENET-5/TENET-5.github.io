/* ═══════════════════════════════════════════════════════
   LIRIL Walkthrough — Guided narration through every page
   Auto-detects sections and provides sequential walk-through
   with subtitle display and section highlighting.
   TENET5 — Powered by LIRIL AI | SEED 118400
   v2.1 — Fixes: Chrome speech cutoff, text sanitization,
          sentence chunking, keepalive timer
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Guard: prevent double-init when shell.js AND <script> both load this ──
  if (window.__LIRIL_WALKTHROUGH_LOADED) return;
  window.__LIRIL_WALKTHROUGH_LOADED = true;

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
  // Strips HTML entities, gear/product lists, error messages,
  // leading punctuation, and caps narration length.
  var JUNK_PATTERNS = [
    /Could not load \S+/gi,              // error messages from failed fetches
    /\b[A-Z0-9]{2,}[\s\-]+[A-Z0-9]{2,}[\s\-]+[A-Z0-9]/g, // product model codes (3+ consecutive)
    /&#\d+;/g,                           // numeric HTML entities
    /&[a-z]+;/g,                         // named HTML entities
    /\b(SRPE|AOR|MOE|RATH|SIG|MSAR|SYLI|LV119)\b[^.;]*/gi // specific gear model noise
  ];

  function sanitiseNarration(raw) {
    if (!raw) return '';
    var text = raw;

    // Decode common HTML entities first
    var entityMap = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&mdash;':' — ','&ndash;':' – '};
    Object.keys(entityMap).forEach(function(ent) {
      text = text.split(ent).join(entityMap[ent]);
    });

    // Strip remaining HTML entities
    JUNK_PATTERNS.forEach(function(rx) { text = text.replace(rx, ''); });

    // Strip leading punctuation / whitespace
    text = text.replace(/^[\s.,;:!?\-—–]+/, '');

    // Collapse whitespace
    text = text.replace(/\s{2,}/g, ' ').trim();

    // If text looks like a product/gear list (>40% uppercase words), truncate to first sentence
    var words = text.split(/\s+/);
    var upperCount = words.filter(function(w) { return w === w.toUpperCase() && w.length > 2; }).length;
    if (words.length > 5 && upperCount / words.length > 0.4) {
      var firstSentence = text.match(/^[^.!?]+[.!?]/);
      if (firstSentence) text = firstSentence[0];
      else text = words.slice(0, 15).join(' ') + '.';
    }

    // Cap at 500 chars, ending at sentence boundary if possible
    if (text.length > 500) {
      var cut = text.substring(0, 500);
      var lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
      if (lastStop > 200) text = cut.substring(0, lastStop + 1);
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

  function initWalkthrough() {
    var page = window.location.pathname.split('/').pop() || '';
    if (page === 'index.html' || page === '') return;

    // ── Collect all narration points ──────────────────
    var points = [];

    function collectPoints() {
      points.length = 0;

      // 1. Sections with data-narrate
      document.querySelectorAll('[data-narrate]').forEach(function(el) {
        var clean = sanitiseNarration(el.getAttribute('data-narrate'));
        if (clean.length > 15) points.push({ el: el, text: clean });
      });

      // 2. Auto-generate for sparse pages
      if (points.length < 3) {
        var selectors = [
          'section', '.timeline-section', '[data-chapter]', '.glass-panel',
          '.evidence-block', '.timeline-node', '.thesis-statement',
          '.card', '.report-block', '.panel', 'article'
        ];
        selectors.forEach(function(sel) {
          document.querySelectorAll(sel).forEach(function(el) {
            if (el.getAttribute('data-narrate')) return;
            if (el.closest('nav, header, footer, #hud-controls')) return;

            var h = el.querySelector('h1, h2, h3');
            var p = el.querySelector('p');
            if (h) {
              var raw = h.textContent.trim();
              if (p) raw += '. ' + p.textContent.trim().substring(0, 200);
              var clean = sanitiseNarration(raw);
              if (clean.length > 20) {
                points.push({ el: el, text: clean, auto: true });
              }
            }
          });
        });
      }
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
      var norm = normalizeForMatch(text).substring(0, 60);
      if (!norm || !audioCues.length) return -1;
      var bestIdx = -1, bestScore = 0;
      for (var i = 0; i < audioCues.length; i++) {
        var cn = normalizeForMatch(audioCues[i].text);
        var overlap = 0;
        var limit = Math.min(norm.length, cn.length);
        for (var j = 0; j < limit; j++) {
          if (norm[j] === cn[j]) overlap++; else break;
        }
        if (overlap > bestScore && overlap > 8) {
          bestScore = overlap; bestIdx = i;
        }
      }
      return bestIdx;
    }

    function tryLoadAudio() {
      var slug = (window.location.pathname.split('/').pop() || '').replace(/\.html$/, '');
      if (!slug) return;
      var mp3 = 'audio/' + slug + '.mp3';
      var vtt = 'audio/' + slug + '.vtt';

      fetch(mp3, { method: 'HEAD' }).then(function(r) {
        if (!r.ok) return;
        return fetch(vtt).then(function(r2) { return r2.ok ? r2.text() : ''; });
      }).then(function(vttText) {
        if (!vttText) return;
        audioCues = parseVTT(vttText);
        audioElement = new Audio(mp3);
        audioElement.preload = 'auto';

        points.forEach(function(p) {
          var ci = findCueIndexForPoint(p.text);
          p.audioStart = ci >= 0 ? audioCues[ci].start : -1;
        });
        for (var i = 0; i < points.length; i++) {
          if (points[i].audioStart < 0) continue;
          var next = -1;
          for (var j = i + 1; j < points.length; j++) {
            if (points[j].audioStart >= 0) { next = points[j].audioStart; break; }
          }
          points[i].audioEnd = next > 0 ? next : -1;
        }
        audioMode = true;
        console.log('[LIRIL] Audio mode:', mp3, audioCues.length, 'cues,',
          points.filter(function(p) { return p.audioStart >= 0; }).length + '/' + points.length, 'mapped');
      }).catch(function() { console.log('[LIRIL] No audio for page, using speech'); });
    }

    // ── Create walkthrough UI ────────────────────────

    // Inject Responsive Subtitle CSS
    if (!document.getElementById('liril-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'liril-styles';
      styleEl.innerHTML = `
        .liril-subtitle-bar {
          position: fixed; bottom: 56px; left: 50%; transform: translateX(-50%);
          width: 90%; max-width: 800px; text-align: center;
          z-index: 9997; pointer-events: none;
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
          position: fixed; bottom: 56px; right: 24px; z-index: 9998;
          background: rgba(14, 165, 233, 0.85); color: white;
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 4px; padding: 8px 18px;
          font-size: 0.75rem; font-weight: 600; cursor: pointer;
          font-family: 'Rajdhani', Inter, sans-serif; letter-spacing: 0.08em;
          text-transform: uppercase; transition: all 0.25s;
          box-shadow: 0 2px 12px rgba(14,165,233,0.25);
        }
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
        /* Active narration point highlight */
        .liril-narrating-point {
          outline: 2px solid rgba(14,165,233,0.3) !important;
          outline-offset: 8px !important;
          box-shadow: 0 0 30px rgba(14,165,233,0.06);
          transition: outline 0.4s ease, box-shadow 0.4s ease;
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .liril-subtitle-bar { bottom: 64px; width: 95%; }
          .liril-subtitle-text { padding: 10px 16px; font-size: 0.85rem; line-height: 1.4; }
          .liril-start-btn { bottom: 16px; right: 16px; padding: 6px 12px; font-size: 0.75rem; }
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
    // Workaround: pause + resume every 10s keeps it alive.
    function startKeepalive() {
      stopKeepalive();
      keepaliveTimer = setInterval(function() {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
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
        var u = new SpeechSynthesisUtterance(chunk);
        u.lang = 'en-GB'; // LIRIL is always British — never drift
        u.rate = 0.9;
        u.pitch = 1.1;
        if (voice) u.voice = voice;
        u.onend = function() { setTimeout(next, 150); };
        u.onerror = function() { setTimeout(next, 150); };
        window.speechSynthesis.speak(u);
      }

      next();
    }

    // ── Voice selection (cached) ─────────────────────
    var cachedVoice = null;
    var voiceResolved = false;
    var VOICE_STORAGE_KEY = 'liril-voice-name';

    // LIRIL voice: British female ONLY. Hardcoded names for Windows 11 + Chrome + Edge.
    var FEMALE_VOICES = [
      'hazel', 'susan', 'libby', 'sonia', 'maisie', 'martha', 'kate',
      'karen', 'moira', 'fiona', 'serena', 'samantha', 'victoria',
      'zira', 'jenny', 'aria', 'sara', 'emily', 'emma',
      'google uk english female', 'google us english female'
    ];
    var MALE_VOICES = [
      'david', 'mark', 'james', 'george', 'daniel', 'ryan', 'guy',
      'thomas', 'richard', 'rishi', 'sean', 'oliver', 'liam',
      'christopher', 'eric', 'andrew', 'brian', 'roger', 'malcolm',
      'connor', 'freddie', 'alfie', 'ethan', 'noah'
    ];

    function isEnGB(v) {
      var l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === 'en-gb' || l.indexOf('en-gb') === 0;
    }
    function isEn(v) {
      var l = (v.lang || '').toLowerCase().replace('_', '-');
      return l.indexOf('en') === 0;
    }
    function nameOf(v) { return (v.name || '').toLowerCase(); }
    function isFemale(v) { return FEMALE_VOICES.some(function(f) { return nameOf(v).indexOf(f) >= 0; }); }
    function isMale(v) { return MALE_VOICES.some(function(m) { return nameOf(v).indexOf(m) >= 0; }); }

    function resolveVoice() {
      if (voiceResolved && cachedVoice) return cachedVoice;
      var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      if (voices.length === 0) return null;

      // P0: Restore the exact voice persisted by presentation.js or a prior page
      try {
        var saved = sessionStorage.getItem(VOICE_STORAGE_KEY);
        if (saved) {
          var restored = voices.find(function(v) { return v.name === saved; });
          if (restored && !isMale(restored)) {
            cachedVoice = restored;
            voiceResolved = true;
            console.log('[LIRIL] Restored voice from session:', cachedVoice.name);
            return cachedVoice;
          }
        }
      } catch(e) {}

      // P0.5: STRICT PRIORITY for High-Quality 'Natural' / 'Online' Neural Voices (Matches Simple Guide MP3 Profile)
      var naturalVoice = voices.find(function(v) {
        return isEnGB(v) && isFemale(v) && /(natural|online|neural)/i.test(v.name);
      });
      if (naturalVoice) {
        cachedVoice = naturalVoice;
      } else {
        // P1: Known female + en-GB (LIRIL is British first)
        cachedVoice = voices.find(function(v) { return isEnGB(v) && isFemale(v); });
        // P2: Any en-GB that is NOT male
        if (!cachedVoice) cachedVoice = voices.find(function(v) { return isEnGB(v) && !isMale(v); });
        // P3: High Quality English (Natural/Online) even if not GB
        if (!cachedVoice) cachedVoice = voices.find(function(v) { return isEn(v) && isFemale(v) && /(natural|online|neural)/i.test(v.name); });
        // P4: Known female + any English
        if (!cachedVoice) cachedVoice = voices.find(function(v) { return isEn(v) && isFemale(v); });
        // P5: Any English NOT male
        if (!cachedVoice) cachedVoice = voices.find(function(v) { return isEn(v) && !isMale(v); });
        // P6: Absolute last resort
        if (!cachedVoice) cachedVoice = voices.find(function(v) { return isEn(v); }) || null;
      }

      if (cachedVoice) {
        // Store so presentation.js and future pages get the same voice
        try { sessionStorage.setItem(VOICE_STORAGE_KEY, cachedVoice.name); } catch(e) {}
        console.log('[LIRIL] Selected High-Quality voice:', cachedVoice.name, '(' + cachedVoice.lang + ')');
      } else {
        console.warn('[LIRIL] No suitable voice found!');
      }
      voiceResolved = true;
      return cachedVoice;
    }

    // Re-resolve when Chrome finishes loading voices async
    // CRITICAL: Chrome/Edge load voices LATE — we must retry until we get a female voice
    var voiceRetryCount = 0;
    function retryVoiceResolution() {
      cachedVoice = null;
      voiceResolved = false;
      var v = resolveVoice();
      if (v && !isMale(v)) {
        console.log('[LIRIL] Voice locked:', v.name, '(' + v.lang + ') after', voiceRetryCount, 'retries');
        return; // Got a good voice
      }
      voiceRetryCount++;
      if (voiceRetryCount < 20) {
        setTimeout(retryVoiceResolution, 250); // Retry every 250ms for up to 5 seconds
      } else {
        console.warn('[LIRIL] Could not find female voice after 20 retries. Using:', v ? v.name : 'none');
      }
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', function() {
        cachedVoice = null;
        voiceResolved = false;
        resolveVoice();
      });
      // Start retry loop immediately — don't wait for voiceschanged event
      retryVoiceResolution();
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

      // Highlight via CSS class
      points.forEach(function(p) {
        p.el.classList.remove('liril-narrating-point');
      });
      point.el.classList.add('liril-narrating-point');

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

      // Try MP3 audio first (AvaMultilingual neural voice)
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
        audioElement.play().catch(function(e) { console.error('[LIRIL] Audio error:', e); });
        return;
      }

      // Fallback: speechSynthesis with chunking
      if ('speechSynthesis' in window) {
        var chunks = chunkText(point.text);
        var voice = resolveVoice();

        if (!voice && !voiceResolved) {
          var waited = 0;
          var poll = setInterval(function() {
            waited += 100;
            voice = resolveVoice();
            if (voice || waited >= 2000) {
              clearInterval(poll);
              if (!isActive) return;
              speakChunks(chunks, voice, function() {
                if (isActive && currentPoint < points.length - 1) {
                  setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
                } else if (isActive) {
                  advanceToNextPageWalkthrough();
                }
              });
            }
          }, 100);
        } else {
          speakChunks(chunks, voice, function() {
            if (isActive && currentPoint < points.length - 1) {
              setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
            } else if (isActive) {
              advanceToNextPageWalkthrough();
            }
          });
        }
      }
    }

    function startWalkthrough() {
      isActive = true;
      startBtn.innerHTML = getI18nStr('stop');
      startBtn.style.background = 'rgba(100,100,100,0.9)';
      startBtn.setAttribute('aria-expanded', 'true');

      // Activate autopilot on first manual start
      if (!getAutopilotState()) {
        setAutopilotState({ autostart: true });
        console.log('[LIRIL] Autopilot activated — full site walkthrough via PAGE_SEQUENCE');
      }
      showTourProgress();

      showPoint(0);
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

    // Load voices — Chrome/Edge load asynchronously, MUST wait for onvoiceschanged
    if ('speechSynthesis' in window) {
      var initVoices = function() {
        voiceResolved = false;
        cachedVoice = null;
        resolveVoice(); // pre-resolve so first click is instant
      };
      window.speechSynthesis.onvoiceschanged = initVoices;
      // Also try immediately (Firefox loads sync)
      if (window.speechSynthesis.getVoices().length > 0) initVoices();
    }

    // ── Rescan hook for dynamic pages ────────────────
    window.lirilRescan = function() {
      if (isActive) endWalkthrough();
      collectPoints();
      if (points.length >= 2) startBtn.style.display = '';
      else startBtn.style.display = 'none';
    };

    // Auto-start if arriving via autopilot cross-page flow
    var autopilotState = getAutopilotState();
    var path = window.location.pathname;
    
    // Auto-initialize autopilot if on the first page and it hasn't been set
    if (!autopilotState && (path === '/' || path.endsWith('index.html') || path.endsWith('home.html'))) {
      autopilotState = { autostart: true };
      setAutopilotState(autopilotState);
    }

    if (autopilotState && autopilotState.autostart) {
      setTimeout(function() {
        if (!isActive && points.length >= 2) {
          console.log('[LIRIL] Autopilot auto-starting walkthrough');
          startWalkthrough();
        }
      }, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalkthrough);
  } else {
    initWalkthrough();
  }
})();
