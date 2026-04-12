/* ═══════════════════════════════════════════════════════
   LIRIL Walkthrough — Guided narration through every page
   Auto-detects sections and provides sequential walk-through
   with subtitle display and section highlighting.
   TENET5 — Powered by LIRIL AI | SEED 118400
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var page = window.location.pathname.split('/').pop() || '';
    if (page === 'index.html' || page === '') return;

    // ── Collect all narration points ──────────────────
    var points = [];

    // 1. Find sections with data-narrate attribute
    document.querySelectorAll('[data-narrate]').forEach(function(el) {
      points.push({ el: el, text: el.getAttribute('data-narrate') });
    });

    // 2. Auto-generate narration for sections without data-narrate
    if (points.length < 3) {
      var selectors = ['section', '.timeline-section', '[data-chapter]', '.glass-panel'];
      selectors.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(el) {
          if (el.getAttribute('data-narrate')) return;
          if (el.closest('nav, header, footer, #hud-controls')) return;

          // Extract heading text for auto-narration
          var h = el.querySelector('h1, h2, h3');
          var p = el.querySelector('p');
          if (h) {
            var text = h.textContent.trim();
            if (p) text += '. ' + p.textContent.trim().substring(0, 150);
            if (text.length > 20) {
              points.push({ el: el, text: text, auto: true });
            }
          }
        });
      });
    }

    if (points.length < 2) return;

    // ── Create walkthrough UI ────────────────────────
    var currentPoint = -1;
    var isActive = false;

    // Subtitle bar
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

    // LIRIL badge on subtitle
    var badge = document.createElement('span');
    badge.style.cssText = 'display:block;font-size:0.65rem;color:rgba(185,28,28,0.6);' +
      'margin-bottom:6px;font-family:JetBrains Mono,monospace;letter-spacing:1px;';
    badge.textContent = 'LIRIL NARRATION';

    // Start walkthrough button
    var startBtn = document.createElement('button');
    startBtn.id = 'liril-start-walkthrough';
    startBtn.innerHTML = '&#9654; LIRIL Walkthrough';
    startBtn.style.cssText = 'position:fixed;bottom:56px;right:24px;z-index:9998;' +
      'background:rgba(185,28,28,0.9);color:white;border:none;border-radius:6px;' +
      'padding:8px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;' +
      'font-family:Inter,sans-serif;transition:all 0.2s;' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    document.body.appendChild(startBtn);

    // ── Walkthrough controls ─────────────────────────
    function showPoint(idx) {
      if (idx < 0 || idx >= points.length) return;

      currentPoint = idx;
      var point = points[idx];

      // Scroll to section
      point.el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight section
      points.forEach(function(p) {
        p.el.style.transition = 'outline 0.3s, outline-offset 0.3s';
        p.el.style.outline = 'none';
        p.el.style.outlineOffset = '0px';
      });
      point.el.style.outline = '2px solid rgba(185,28,28,0.3)';
      point.el.style.outlineOffset = '8px';

      // Show subtitle
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

      // Update button
      startBtn.innerHTML = (idx + 1) + '/' + points.length + ' &#9654;';

      // Use Web Speech API for voice narration if available
      if ('speechSynthesis' in window && isActive) {
        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(point.text);
        utterance.lang = 'en-GB';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        // Try to find a British female voice
        var voices = window.speechSynthesis.getVoices();
        var britishFemale = voices.find(function(v) {
          return v.lang.startsWith('en-GB') && v.name.toLowerCase().includes('female');
        }) || voices.find(function(v) {
          return v.lang.startsWith('en-GB');
        }) || voices.find(function(v) {
          return v.lang.startsWith('en');
        });
        if (britishFemale) utterance.voice = britishFemale;

        utterance.onend = function() {
          // Auto-advance after narration finishes
          if (currentPoint < points.length - 1) {
            setTimeout(function() { showPoint(currentPoint + 1); }, 1500);
          } else {
            endWalkthrough();
          }
        };

        window.speechSynthesis.speak(utterance);
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
      window.speechSynthesis && window.speechSynthesis.cancel();
      subtitleBar.style.opacity = '0';
      subtitleBar.style.pointerEvents = 'none';
      startBtn.innerHTML = '&#9654; LIRIL Walkthrough';
      startBtn.style.background = 'rgba(185,28,28,0.9)';
      points.forEach(function(p) {
        p.el.style.outline = 'none';
      });
      currentPoint = -1;
    }

    // ── Event listeners ──────────────────────────────
    startBtn.addEventListener('click', function() {
      if (isActive) {
        endWalkthrough();
      } else {
        startWalkthrough();
      }
    });

    // Click subtitle to advance
    subtitleBar.addEventListener('click', function() {
      if (currentPoint < points.length - 1) {
        showPoint(currentPoint + 1);
      } else {
        endWalkthrough();
      }
    });

    // Keyboard: right arrow to advance, escape to stop
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
        window.speechSynthesis.getVoices();
      };
    }
  });
})();
