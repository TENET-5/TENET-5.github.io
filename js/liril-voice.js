/* RETIRED 2026-07-12 — public LIRIL TTS guide stack removed.
   Safe no-op stubs so residual callers do not throw. */
(function () {
  'use strict';
  window.__LIRIL_GUIDE_RETIRED = true;
  window.LIRIL_VOICE = {
    speak: function () { return Promise.resolve(); },
    stop: function () {},
    muted: true,
    ready: false
  };
})();
