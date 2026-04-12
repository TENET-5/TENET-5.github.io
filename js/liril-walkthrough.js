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
    var subtitleBar = document.createElement('div');
    subtitleBar.id = 'liril-subtitle';
    subtitleBar.style.cssText = 'position:fixed;bottom:56px;left:50%;transform:translateX(-50%);' +
      'width:90%;max-width:800px;text-align:center;z-index:9997;pointer-events:none;' +
      'opacity:0;transition:opacity 0.4s;';

    var subtitleText = document.createElement('div');
    subtitleText.style.cssText = 'display:inline-block;background:rgba(9,9,11,0.92);' +
      'color:#e8e4dc;padding:12px 24px;border-radius:6px;font-size:1rem;line-height:1.6;' +
      'border:1px solid rgba(185,28,28,0.2);backdrop-filter:blur(8px);' +
      'font-family:Inter,-apple-system,sans-serif;max-width:100%;text-align:left;';
    subtitleBar.appendChild(subtitleText);
    document.body.appendChild(subtitleBar);

    var badge = document.createElement('span');
    badge.style.cssText = 'display:block;font-size:0.65rem;color:rgba(185,28,28,0.6);' +
      'margin-bottom:6px;font-family:JetBrains Mono,monospace;letter-spacing:1px;';
    badge.textContent = 'LIRIL NARRATION';

    var startBtn = document.createElement('button');
    startBtn.id = 'liril-start-walkthrough';
    startBtn.innerHTML = '&#9654; LIRIL Walkthrough';
    startBtn.style.cssText = 'position:fixed;bottom:56px;right:24px;z-index:9998;' +
      'background:rgba(185,28,28,0.9);color:white;border:none;border-radius:6px;' +
      'padding:8px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;' +
      'font-family:Inter,sans-serif;transition:all 0.2s;' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.3);';
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
        u.lang = 'en-GB';
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

    function resolveVoice() {
      if (voiceResolved) return cachedVoice;
      var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      cachedVoice = voices.find(function(v) {
        return v.lang.startsWith('en-GB') && v.name.toLowerCase().includes('female');
      }) || voices.find(function(v) {
        return v.lang.startsWith('en-GB');
      }) || voices.find(function(v) {
        return v.lang.startsWith('en');
      }) || null;
      if (voices.length > 0) voiceResolved = true;
      return cachedVoice;
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

      // Highlight
      points.forEach(function(p) {
        p.el.style.transition = 'outline 0.3s, outline-offset 0.3s';
        p.el.style.outline = 'none';
        p.el.style.outlineOffset = '0px';
      });
      point.el.style.outline = '2px solid rgba(185,28,28,0.3)';
      point.el.style.outlineOffset = '8px';

      // Subtitle
      subtitleText.innerHTML = '';
      subtitleText.appendChild(badge.cloneNode(true));

      var textNode = document.createElement('span');
      textNode.textContent = point.text;
      subtitleText.appendChild(textNode);

      var counter = document.createElement('div');
      counter.style.cssText = 'font-size:0.65rem;color:rgba(255,255,255,0.3);margin-top:8px;text-align:right;';
      counter.textContent = (idx + 1) + ' / ' + points.length + '  |  Click to advance';
      subtitleText.appendChild(counter);

      subtitleBar.style.opacity = '1';
      subtitleBar.style.pointerEvents = 'auto';

      startBtn.innerHTML = (idx + 1) + '/' + points.length + ' &#9654;';

      // Speak with chunking
      if ('speechSynthesis' in window && isActive) {
        var chunks = chunkText(point.text);
        var voice = resolveVoice();

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

    function startWalkthrough() {
      isActive = true;
      startBtn.innerHTML = '&#9632; Stop';
      startBtn.style.background = 'rgba(100,100,100,0.9)';
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
      startBtn.innerHTML = '&#9654; LIRIL Walkthrough';
      startBtn.style.background = 'rgba(185,28,28,0.9)';
      points.forEach(function(p) { p.el.style.outline = 'none'; });
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

    // Load voices (Chrome needs this)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = function() {
        voiceResolved = false;
        window.speechSynthesis.getVoices();
      };
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
