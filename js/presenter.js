/* ═══════════════════════════════════════════════════════════════════════
   TENET5 presenter.js — DEPRECATED NO-OP SHIM (2026-04-18)
   ─────────────────────────────────────────────────────────────────────
   Previously provided a fixed bottom toolbar with presentation controls.
   Duties now served by:
     • presentation.js         (bottom progress + keyhint via shell.js)
     • liril-walkthrough.js    (walkthrough button)
     • walkthrough-enhancements.js (CC, transcript, autoplay, etc.)

   The legacy presenter.js built its own #presenter-toolbar element
   that competed with presentation.js's .pres-progress bar, producing
   the "multiple liril read throughs" visible duplication.

   References to this file have been stripped from all 259 pages that
   previously double-loaded it (via _fix_duplicate_script_loads.py).
   The file is kept as a shim in case any cached page still points here.
   ═══════════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  if (window.__TENET5_PRESENTER_SHIM) return;
  window.__TENET5_PRESENTER_SHIM = true;

  // Best-effort cleanup of any #presenter-toolbar from a previous session's
  // cached version of this file.
  function cleanup() {
    try {
      var legacy = document.getElementById('presenter-toolbar');
      if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
    } catch (e) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanup);
  } else {
    cleanup();
  }
})();
