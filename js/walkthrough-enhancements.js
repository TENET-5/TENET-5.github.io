/* ═══════════════════════════════════════════════════════════════════════
   walkthrough-enhancements.js — NEUTRALIZED (no-op shim)
   Modified: 2026-04-18
   ═══════════════════════════════════════════════════════════════════════

   Previously this file rendered its own floating control bar (.wt-enhance-bar)
   with purple borders (#a855f7) at bottom:74px, stacked directly over the
   presentation.js page indicator at bottom:16px. The result was a visible
   duplicate walkthrough UI — the user rightly called it "two walkthroughs".

   The unified walkthrough is now:
     • presentation.js  → page indicator (bottom-center pill)
     • liril-walkthrough.js → subtitle bar + start button + narration engine
     • Both bridged via window.__LIRIL_WALKTHROUGH_LOADED /
       window.__TENET5_PRESENTATION_LOADED detection.

   Features that previously lived here (speed control, autoplay, closed
   captions toggle, transcript panel, session resume, keyboard shortcut
   help card) will be migrated INTO liril-walkthrough.js directly in a
   follow-up. localStorage keys are preserved below so prior user
   preferences don't get lost when the features land in their new home.

   DO NOT re-enable this file's UI. If you add features, add them to
   liril-walkthrough.js, not here.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Prevent any downstream code from re-loading this module
  if (window.__LIRIL_WT_ENHANCEMENTS_LOADED) return;
  window.__LIRIL_WT_ENHANCEMENTS_LOADED = true;
  window.__LIRIL_WT_ENHANCEMENTS_NEUTRALIZED = true;

  // Preserve preference keys so feature migration can read them
  window.__LIRIL_WT_PREF_KEYS = {
    position:    'tenet5_walkthrough_position',
    speed:       'tenet5_narration_speed',
    hintShown:   'tenet5_wt_hint_shown',
    transcript:  'tenet5_wt_transcript_open',
    captions:    'tenet5_wt_cc_on',
    autoplay:    'tenet5_wt_autoplay',
    scrollPause: 'tenet5_wt_scrollpause',
    volume:      'tenet5_wt_volume'
  };

  // Clean up any DOM elements the old implementation may have left behind
  // (in case a cached copy rendered before this shim loaded).
  function cleanupLegacyUI() {
    var legacySelectors = [
      '.wt-enhance-bar',
      '.wt-help-card',
      '.wt-help-backdrop',
      '.wt-transcript-panel',
      '.wt-caption-bar'
    ];
    legacySelectors.forEach(function (sel) {
      var nodes = document.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) {
        try { nodes[i].parentNode && nodes[i].parentNode.removeChild(nodes[i]); } catch (e) {}
      }
    });
    // Also drop the legacy injected <style id="wt-enhance-styles">.
    var legacyStyle = document.getElementById('wt-enhance-styles');
    if (legacyStyle && legacyStyle.parentNode) {
      legacyStyle.parentNode.removeChild(legacyStyle);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupLegacyUI);
  } else {
    cleanupLegacyUI();
  }
  // Run once more after other scripts finish settling, to catch late renders
  setTimeout(cleanupLegacyUI, 1500);

  console.log('[WT-ENHANCE] neutralized — unified walkthrough is liril-walkthrough.js + presentation.js');
})();
