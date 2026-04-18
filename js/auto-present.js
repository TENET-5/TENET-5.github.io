/* ═══════════════════════════════════════════════════════════════════════
   TENET5 auto-present.js — DEPRECATED NO-OP SHIM (2026-04-18)
   ─────────────────────────────────────────────────────────────────────
   Previously provided scroll-reveal animations + chapter navigation.
   These duties are now served by presentation.js + liril-walkthrough.js +
   walkthrough-enhancements.js, all loaded via shell.js.

   Kept as a no-op so 258 legacy <script src="js/auto-present.js"> tags
   across the site don't 404. When the canonical walkthrough stack is
   loaded, this shim yields immediately.

   Conflict resolution: the legacy script installed its own progress bar
   + scroll reveal logic that competed with presentation.js's engine,
   causing duplicate UI and conflicting scroll handlers.
   ═══════════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  if (window.__TENET5_AUTO_PRESENT_SHIM) return;
  window.__TENET5_AUTO_PRESENT_SHIM = true;

  function modernStackPresent() {
    return !!(
      window.__TENET5_PRESENTATION_LOADED ||
      window.__LIRIL_WALKTHROUGH_LOADED ||
      window.__LIRIL_WT_ENHANCEMENTS_LOADED ||
      document.getElementById('liril-start-walkthrough')
    );
  }

  function cleanup() {
    // Remove any legacy progress bar that an older cached copy may have
    // injected on a previous visit before this shim deployed.
    try {
      var legacy = document.querySelector('.investigation-progress');
      if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
    } catch (e) { /* best-effort */ }
  }

  function check() {
    cleanup();
    if (modernStackPresent()) return;
    // Modern stack will arrive via shell.js — this shim is intentionally
    // passive. A page that loads without shell.js won't get animations
    // from this file any more; that is deliberate, to end the conflict.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check);
  } else {
    check();
  }
})();
