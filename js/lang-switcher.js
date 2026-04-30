/* ═══════════════════════════════════════════════════════
   TENET5 Language Switcher — i18n Toggle
   Handles switching between EN-CA and FR-CA content.
   Currently a no-op shim — full i18n deferred.
   See CLAUDE.md: site is READ-ONLY, no user interactions.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_LANG_SWITCHER_LOADED) return;
  window.__TENET5_LANG_SWITCHER_LOADED = true;

  /* No-op: language switching is deferred per CLAUDE.md directive.
     The stub exists so shell.js doesn't generate 404 console errors. */
  window.setSiteLanguage = window.setSiteLanguage || function(lang) {
    console.log('[lang-switcher] Language set to:', lang || 'en-CA', '(deferred — i18n not yet active)');
    return false;
  };

  console.log('[lang-switcher] Shim loaded — i18n deferred.');
})();
