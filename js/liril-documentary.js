/* RETIRED 2026-07-12 — documentary TTS removed. Video-only audio. */
(function () {
  'use strict';
  window.__LIRIL_GUIDE_RETIRED = true;
  window.LIRIL_DOCUMENTARY = { start: function () {}, stop: function () {} };
  if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {}
})();
