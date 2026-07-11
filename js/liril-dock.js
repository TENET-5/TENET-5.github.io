/* LIRIL interior dock v2 — page-matched voice guide + walkthrough bridge.

   - "Guide me" prefers LIRIL_PAGE_VOICE (page-matched VO) then walkthrough engine
   - "Voice" toggles window.__LIRIL_MUTED (honoured by liril-voice.js)
   - Dock line reflects the open page title/kick/lede when page-voice is loaded

   Homepage keeps liril-home-guide.js and does NOT load this.
*/
(function () {
  'use strict';
  if (window.__LIRIL_DOCK_LOADED_V2) return;
  window.__LIRIL_DOCK_LOADED_V2 = true;
  window.__LIRIL_DOCK_LOADED = true;

  function $(id) {
    return document.getElementById(id);
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var dock = $('dock');
    if (!dock) return;
    var guideBtn = $('liril-guide-btn');
    var voiceBtn = $('voice-btn');
    var lineEl = $('liril-line');
    var statusEl = $('liril-status');
    var guiding = false;

    var statusTimer = null;
    function setStatus(t) {
      if (statusEl) {
        statusEl.textContent = t;
        statusEl.classList.add('show');
        clearTimeout(statusTimer);
        statusTimer = setTimeout(function () {
          statusEl.classList.remove('show');
        }, 5000);
      }
    }
    function setLine(t) {
      if (lineEl && t) lineEl.textContent = t;
    }

    function walkBtn() {
      return $('liril-start-walkthrough') || document.querySelector('.liril-start-btn');
    }

    function paintFromPageVoice() {
      if (!window.LIRIL_PAGE_VOICE) return;
      try {
        if (typeof window.LIRIL_PAGE_VOICE.paintDock === 'function') {
          window.LIRIL_PAGE_VOICE.paintDock();
        }
        var rep = window.LIRIL_PAGE_VOICE.getReport && window.LIRIL_PAGE_VOICE.getReport();
        if (rep && rep.score != null) {
          setStatus(
            'Page guide ready · voice match ' + Math.round(rep.score * 100) + '%'
          );
        }
      } catch (e) { /* */ }
    }

    var tries = 0;
    (function waitReady() {
      // Wait for page-voice and/or walkthrough
      if (window.LIRIL_PAGE_VOICE || walkBtn() || tries > 50) {
        onReady();
        return;
      }
      tries++;
      setTimeout(waitReady, 120);
    })();

    function onReady() {
      dock.classList.add('guide-ready');
      paintFromPageVoice();
      if (!lineEl || !lineEl.textContent || lineEl.textContent.indexOf('I can read') === 0) {
        setLine('I can guide this page — voice matches what is on the record here.');
      }
      setStatus(
        window.LIRIL_PAGE_VOICE
          ? 'LIRIL page guide ready'
          : walkBtn()
            ? 'LIRIL walkthrough ready'
            : 'Text guide ready'
      );

      if (guideBtn) {
        guideBtn.addEventListener('click', function () {
          // Prefer page-matched guide (matches h1/lede/sections on this URL)
          if (window.LIRIL_PAGE_VOICE && typeof window.LIRIL_PAGE_VOICE.runGuide === 'function') {
            if (guiding || window.LIRIL_PAGE_VOICE.isGuiding()) {
              window.LIRIL_PAGE_VOICE.stopGuide();
              guiding = false;
              guideBtn.textContent = 'Guide me';
              setStatus('Guide stopped');
              paintFromPageVoice();
              return;
            }
            var res = window.LIRIL_PAGE_VOICE.runGuide({ force: false });
            guiding = !!(res && res.ok);
            if (guiding) {
              guideBtn.textContent = 'Stop';
              setStatus(
                'Guiding this page · ' +
                  (res.beats || '?') +
                  ' beats · match ' +
                  Math.round((res.score || 0) * 100) +
                  '%'
              );
            } else {
              setStatus('Could not start page guide');
            }
            return;
          }

          // Fallback: legacy walkthrough engine
          var b = walkBtn();
          if (b) {
            b.click();
            var on = /stop|■/i.test(b.textContent || '');
            guiding = on;
            setStatus(on ? 'LIRIL reading · scroll the record' : 'LIRIL paused');
            guideBtn.textContent = on ? 'Stop' : 'Guide me';
          } else {
            setStatus('Text guide only on this page');
          }
        });
      }

      if (voiceBtn) {
        var muted = window.__LIRIL_MUTED === true;
        var paint = function () {
          voiceBtn.textContent = muted ? 'Voice · Off' : 'Voice · On';
          voiceBtn.setAttribute('aria-pressed', String(!muted));
          voiceBtn.classList.toggle('on', !muted);
        };
        paint();
        voiceBtn.addEventListener('click', function () {
          muted = !muted;
          window.__LIRIL_MUTED = muted;
          if (muted && window.speechSynthesis) {
            try {
              window.speechSynthesis.cancel();
            } catch (e) { /* */ }
            if (window.LIRIL_PAGE_VOICE) window.LIRIL_PAGE_VOICE.stopGuide();
            guiding = false;
            if (guideBtn) guideBtn.textContent = 'Guide me';
          }
          paint();
          setStatus(muted ? 'Voice off · reading text only' : 'Voice on · page-matched');
        });
      }

      // Re-paint when page-voice pack finishes loading
      setTimeout(paintFromPageVoice, 400);
      setTimeout(paintFromPageVoice, 1200);
    }
  });
})();
