/**
 * TENET5 Share Bar — Extracted from inline handlers
 */
(function() {
  'use strict';
  const URL = window.location.href;
  const TITLE = document.title;

  window.shareFacebook = function() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(URL), '_blank', 'width=600,height=400');
  };
  window.shareReddit = function() {
    window.open('https://reddit.com/submit?url=' + encodeURIComponent(URL) + '&title=' + encodeURIComponent(TITLE), '_blank', 'width=600,height=400');
  };
  window.copyLink = function() {
    navigator.clipboard.writeText(URL).then(function() {
      var btn = document.getElementById('copy-btn');
      if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function() { btn.innerHTML = '&#128203; Copy Link'; }, 2000); }
    });
  };

  // Live MAID counter — 45 per day since Jan 1 2024
  function updateCounter() {
    var start = new Date('2024-01-01T00:00:00-05:00');
    var now = new Date();
    var days = (now - start) / 86400000;
    var count = Math.floor(days * 45);
    var el = document.getElementById('live-counter');
    if (el) el.textContent = count.toLocaleString();
    var elapsed = document.getElementById('elapsed-time');
    if (elapsed) elapsed.textContent = Math.floor(days) + ' days';
  }
  updateCounter();
  setInterval(updateCounter, 60000);
})();
