/* LIRIL interior dock — the same persistent guide bar the homepage carries,
   for every content page. Bridges the dock controls to the existing
   liril-walkthrough.js engine; does not reimplement narration.

   - "Guide me"  -> clicks the walkthrough start button (#liril-start-walkthrough)
   - "Voice"     -> toggles window.__LIRIL_MUTED (honoured by liril-voice.js)
   - line/status -> reflects walkthrough state

   Homepage keeps liril-home-guide.js and does NOT load this. */
(function () {
  'use strict';
  if (window.__LIRIL_DOCK_LOADED) return;
  window.__LIRIL_DOCK_LOADED = true;

  function $(id) { return document.getElementById(id); }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  ready(function () {
    var dock = $('dock');
    if (!dock) return;
    var guideBtn = $('liril-guide-btn');
    var voiceBtn = $('voice-btn');
    var lineEl = $('liril-line');
    var statusEl = $('liril-status');

    function setStatus(t) { if (statusEl) statusEl.textContent = t; }
    function setLine(t) { if (lineEl && t) lineEl.textContent = t; }

    // The walkthrough button is created asynchronously; poll briefly for it.
    function walkBtn() { return $('liril-start-walkthrough') || document.querySelector('.liril-start-btn'); }

    var tries = 0;
    (function waitForEngine() {
      if (walkBtn() || tries > 40) { onReady(); return; }
      tries++; setTimeout(waitForEngine, 150);
    })();

    function onReady() {
      var wb = walkBtn();
      dock.classList.add('guide-ready');
      setStatus(wb ? 'LIRIL ready' : 'Text guide ready');
      setLine('I can read this page with you.');

      if (guideBtn) {
        guideBtn.addEventListener('click', function () {
          var b = walkBtn();
          if (b) {
            b.click();                         // start/stop the narrated walkthrough
            var on = /stop|■/i.test(b.textContent || '');
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
          if (muted && window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
          paint();
          setStatus(muted ? 'Voice off · reading text only' : 'Voice on');
        });
      }
    }
  });
})();
