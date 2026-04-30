/* ═══════════════════════════════════════════════════════
   TENET5 MP Scorecard — Individual MP Rating Display
   Injects scorecard badges for MPs with data-mp attributes.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_MP_SCORECARD_LOADED) return;
  window.__TENET5_MP_SCORECARD_LOADED = true;

  function gradeColor(grade) {
    if (grade >= 80) return 'var(--slate-verified, #22c55e)';
    if (grade >= 60) return 'var(--slate-info, #22d3ee)';
    if (grade >= 40) return 'var(--slate-warning, #facc15)';
    return 'var(--slate-critical, #ef4444)';
  }

  function initScorecards() {
    document.querySelectorAll('[data-mp-score]').forEach(function(el) {
      var score = parseInt(el.getAttribute('data-mp-score'), 10);
      if (isNaN(score)) return;

      var badge = document.createElement('span');
      badge.className = 'mp-score-badge';
      badge.textContent = score + '%';
      badge.style.cssText =
        'display:inline-block;padding:2px 8px;border-radius:3px;' +
        'font-family:var(--slate-font-mono);font-size:0.75rem;font-weight:700;' +
        'color:var(--slate-bg,#1e2328);background:' + gradeColor(score) + ';' +
        'margin-left:8px;vertical-align:middle;';
      el.appendChild(badge);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScorecards);
  } else {
    initScorecards();
  }

  console.log('[mp-scorecard] Scorecard badges initialised.');
})();
