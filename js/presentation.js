/* RETIRED 2026-07-12 — multi-voice presentation engine removed from public site.
   Audio is video-only via tenet5-single-mic.js + user-started <video>. */
(function () {
  'use strict';
  window.__LIRIL_GUIDE_RETIRED = true;
  if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {}
})();
