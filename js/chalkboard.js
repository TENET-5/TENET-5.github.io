/* Chalkboard — LIRIL speak + quick signal chips (canvas/auth in scene-template) */
(function () {
  'use strict';

  function speakText(text) {
    if (!text || !('speechSynthesis' in window)) return;
    /* Guarded path only: LIRIL_VOICE.speak refuses to emit without an
       acceptable voice — never the OS default. */
    if (!(window.LIRIL_VOICE && window.LIRIL_VOICE.speak)) return;
    window.speechSynthesis.cancel();
    window.LIRIL_VOICE.speak(text.slice(0, 400));
  }

  function heroText() {
    var h = document.querySelector('.chalk-hero h1');
    var p = document.querySelector('.chalk-hero p');
    return [h && h.textContent.trim(), p && p.textContent.trim()].filter(Boolean).join('. ');
  }

  var SEEDS = {
    'liril-seed-witness': 'Witness note. Mark what you observed on the chalkboard.',
    'liril-seed-question': 'Ask a question. What accountability gap should TENET5 investigate next?',
    'liril-seed-evidence': 'Evidence call. Cite a primary source and place it on the board.'
  };

  document.addEventListener('DOMContentLoaded', function () {
    var speakBtn = document.getElementById('liril-speak');
    if (speakBtn) {
      speakBtn.addEventListener('click', function () {
        window.LIRIL_VOICE_ON = true;
        var msg = heroText() || 'Welcome to the TENET5 public chalkboard.';
        speakText('LIRIL says. ' + msg);
        speakBtn.classList.add('active');
        setTimeout(function () { speakBtn.classList.remove('active'); }, 1200);
      });
    }

    Object.keys(SEEDS).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', function () {
        var input = document.getElementById('chalk-text-input');
        if (input) {
          input.value = SEEDS[id];
          input.focus();
        }
        speakText(SEEDS[id]);
      });
    });

    if (window.LIRIL_FEEDBACK && window.LIRIL_FEEDBACK.initTooltips) {
      window.LIRIL_FEEDBACK.initTooltips(document);
    }
  });
})();