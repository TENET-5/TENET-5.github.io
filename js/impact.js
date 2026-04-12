/* ═══════════════════════════════════════════════════════
   TENET5 Impact Engine — Human-scale data presentation
   Makes statistics visceral through comparison and time
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Live death counter ──────────────────────────────
  // MAID started June 17, 2016. 76,707 deaths through Dec 31, 2024.
  // That's 3,119 days. 76,707 / 3,119 = 24.6 deaths per day.
  // 24.6 / 24 = 1.025 per hour. One death every 58.5 minutes.

  var MAID_START = new Date('2016-06-17T00:00:00Z').getTime();
  var KNOWN_DEATHS = 76707;
  var KNOWN_DATE = new Date('2024-12-31T23:59:59Z').getTime();
  var DAYS_ELAPSED = (KNOWN_DATE - MAID_START) / (1000 * 60 * 60 * 24);
  var RATE_PER_DAY = KNOWN_DEATHS / DAYS_ELAPSED;  // ~24.6
  var RATE_PER_SECOND = RATE_PER_DAY / 86400;

  document.addEventListener('DOMContentLoaded', function() {
    // Find all live counter elements
    var counters = document.querySelectorAll('.live-death-counter');
    if (counters.length === 0) return;

    function updateCounters() {
      var now = Date.now();
      var daysSinceStart = (now - MAID_START) / (1000 * 60 * 60 * 24);
      var estimated = Math.floor(KNOWN_DEATHS + (daysSinceStart - DAYS_ELAPSED) * RATE_PER_DAY);

      counters.forEach(function(el) {
        var numEl = el.querySelector('.counter-value');
        if (numEl) {
          numEl.textContent = estimated.toLocaleString();
        }
      });
    }

    updateCounters();
    setInterval(updateCounters, 60000); // Update every minute
  });
})();
