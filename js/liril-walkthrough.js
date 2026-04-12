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
        var selectors = ['section', '.timeline-section', '[data-chapter]', '.glass-panel'];
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
    if (points.length < 2) return;

    // ── State ────────────────────────────────────────
    var currentPoint = -1;
    var isActive = false;
    var keepaliveTimer = null;
    var chunkQueue = [];
    var speakingChunks = false;

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

      // Cancel any in-flight speech
      speakingChunks = false;
      chunkQueue.length = 0;
      if (window.speechSynthesis) window.speechSynthesis.cancel();

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
      counter.textContent = (idx + 1) + ' / ' + points.length + '  \u2502  ' + getI18nStr('advance');
      subtitleText.appendChild(counter);

      subtitleBar.style.opacity = '1';
      subtitleBar.style.pointerEvents = 'auto';

      startBtn.innerHTML = (idx + 1) + '/' + points.length + ' &#9654;';

      // Speak with chunking
      if ('speechSynthesis' in window && isActive) {
        var chunks = chunkText(point.text);
        var voice = resolveVoice();

        // If voices haven't loaded yet (Chrome async), wait up to 2s
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
                  endWalkthrough();
                }
              });
            }
          }, 100);
        } else {
          speakChunks(chunks, voice, function() {
            // Auto-advance after all chunks finish
            if (isActive && currentPoint < points.length - 1) {
              setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
            } else if (isActive) {
              endWalkthrough();
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
      showPoint(0);
    }

    function endWalkthrough() {
      isActive = false;
      speakingChunks = false;
      chunkQueue.length = 0;
      stopKeepalive();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      subtitleBar.style.opacity = '0';
      subtitleBar.style.pointerEvents = 'none';
      startBtn.innerHTML = getI18nStr('start');
      startBtn.style.background = '';
      startBtn.setAttribute('aria-expanded', 'false');
      points.forEach(function(p) { p.el.classList.remove('liril-narrating-point'); });
      currentPoint = -1;
    }

    // ── Event listeners ──────────────────────────────
    startBtn.addEventListener('click', function() {
      if (isActive) endWalkthrough();
      else startWalkthrough();
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalkthrough);
  } else {
    initWalkthrough();
  }
})();
