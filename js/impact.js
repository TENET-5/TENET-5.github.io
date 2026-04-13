/* ═══════════════════════════════════════════════════════
   TENET5 Impact Engine — Human-scale data presentation
   Makes statistics visceral through comparison and time
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Live death counter ──────────────────────────────
  // MAID started June 17, 2016. 76,475 deaths through Dec 31, 2024.
  // 2024 had 16,499 deaths in 365 days = 45.2 deaths per day.
  // Using 2024 rate for projection (most recent, most accurate).
  // 45.2 / 24 = 1.88 per hour. One death every 31.9 minutes.
  // 5.1% of all Canadian deaths in 2024 — one in twenty.

  var MAID_START = new Date('2016-06-17T00:00:00Z').getTime();
  var KNOWN_DEATHS = 76707;
  var KNOWN_DATE = new Date('2024-12-31T23:59:59Z').getTime();
  var DAYS_ELAPSED = (KNOWN_DATE - MAID_START) / (1000 * 60 * 60 * 24);
  var RATE_PER_DAY = 45.2;  // 2024 Health Canada: 16,499 / 365
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
