/**
 * Legacy stub — NOT the public product entry.
 * Public product: index.html (ops intelligence) + daily-briefing.html (A→B default).
 * Any accidental load of this script redirects operators to the daily briefing.
 */
(function () {
  'use strict';
  try {
    if (document.body && document.body.classList.contains('abracadabra-root')) {
      window.location.replace('/index.html?load=daily-briefing.html');
    }
  } catch (e) { /* ignore */ }
})();
