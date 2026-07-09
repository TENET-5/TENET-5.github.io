/* LIRIL site feedback — tooltips + optional voice on alerts */
(function () {
  'use strict';
  function speak(text) {
    if (!text || !window.LIRIL_VOICE_ON) return;
    /* Delegate to the guarded resolver ONLY. No local voice picking, no
       voices[0] fallback — that fell back to the OS default male voice. */
    if (window.LIRIL_VOICE && window.LIRIL_VOICE.speak) {
      window.LIRIL_VOICE.speak(text.slice(0, 400));
    }
  }
  function initTooltips(root) {
    (root || document).querySelectorAll('[title]:not([data-tip])').forEach(function (el) {
      var t = el.getAttribute('title');
      if (!t) return;
      el.setAttribute('data-tip', t);
      el.removeAttribute('title');
      el.classList.add('prism-tip');
    });
  }
  window.LIRIL_FEEDBACK = { speak: speak, initTooltips: initTooltips };
  window.LIRIL_VOICE_ON = false;
  if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = function () {};
  document.addEventListener('DOMContentLoaded', function () { initTooltips(document); });
})();