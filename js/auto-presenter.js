/* ═══════════════════════════════════════════════════════════════════════
   TENET5 auto-presenter.js — DEPRECATED NO-OP SHIM (2026-04-18)
   ─────────────────────────────────────────────────────────────────────
   Previously provided TTS playback + VTT subtitles + scroll-snapping
   slideshow. Duties now served by:
     • liril-voice.js          (voice params, TTS defaults)
     • presentation.js         (playback engine + subtitle overlay)
     • liril-walkthrough.js    (walkthrough button + auto-narrate)
     • walkthrough-enhancements.js (CC overlay, transcript, autoplay)

   The legacy auto-presenter built its own play button and subtitle
   overlay, which competed with the canonical #liril-start-walkthrough
   button and the .wt-cc closed-captions overlay.

   Currently referenced by 0 pages (grep confirmed 2026-04-18) but kept
   as a shim in case any cached page or third-party index still points here.
   ═══════════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  if (window.__TENET5_AUTO_PRESENTER_SHIM) return;
  window.__TENET5_AUTO_PRESENTER_SHIM = true;

  // The original __TENET5_AUTO_PRESENTER flag is kept set so any page-level
  // code that checks it sees truthy and skips its own fallback.
  window.__TENET5_AUTO_PRESENTER = true;

  function cleanup() {
    try {
      var legacyOverlay = document.querySelector('.cinematic-subs');
      if (legacyOverlay && legacyOverlay.parentNode) {
        legacyOverlay.parentNode.removeChild(legacyOverlay);
      }
      var legacyBtn = document.querySelector('.global-play-toggle');
      if (legacyBtn && legacyBtn.parentNode) {
        legacyBtn.parentNode.removeChild(legacyBtn);
      }
    } catch (e) { /* best-effort cleanup only */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanup);
  } else {
    cleanup();
  }
})();
