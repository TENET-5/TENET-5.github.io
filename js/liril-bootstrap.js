/* RETIRED 2026-07-12 — no longer loads the voice/walkthrough stack. */
(function () {
  'use strict';
  window.__LIRIL_GUIDE_RETIRED = true;
  window.LIRIL = window.LIRIL || {};
  window.LIRIL.speak = function () { return false; };
})();
