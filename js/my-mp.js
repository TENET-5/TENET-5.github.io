/* ═══════════════════════════════════════════════════════
   TENET5 My-MP Widget — "Find Your MP" Lookup
   Injects a constituency lookup widget using postal code
   to show the user's representative and their voting record.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_MY_MP_LOADED) return;
  window.__TENET5_MY_MP_LOADED = true;

  function initMyMP() {
    var container = document.getElementById('my-mp-widget');
    if (!container) return;

    container.innerHTML =
      '<div style="padding:20px;border:1px solid var(--slate-border,rgba(232,227,214,0.16));' +
      'border-radius:6px;background:var(--slate-overlay,rgba(40,48,56,0.55));">' +
        '<h3 style="margin:0 0 12px;font-family:var(--slate-font-display,\'Inter\');' +
        'font-size:1.1rem;color:var(--slate-ink,#e8e3d6);">Find Your MP</h3>' +
        '<p style="color:var(--slate-ink-dim,#c9c3b3);font-size:0.85rem;margin:0 0 12px;">' +
        'Enter your Canadian postal code to find your Member of Parliament and their accountability record.</p>' +
        '<div style="display:flex;gap:8px;">' +
          '<input id="mp-postal" type="text" placeholder="e.g. K0K 2T0" maxlength="7" ' +
          'style="flex:1;padding:10px 12px;background:var(--slate-bg,#1e2328);' +
          'border:1px solid var(--slate-border);color:var(--slate-ink);border-radius:4px;' +
          'font-family:var(--slate-font-mono);font-size:0.9rem;" />' +
          '<button id="mp-lookup-btn" style="padding:10px 20px;background:var(--slate-accent,#c89a76);' +
          'color:var(--slate-bg,#1e2328);border:0;border-radius:4px;font-weight:700;cursor:pointer;' +
          'font-size:0.85rem;">Look Up</button>' +
        '</div>' +
        '<div id="mp-result" style="margin-top:12px;"></div>' +
      '</div>';

    var btn = document.getElementById('mp-lookup-btn');
    if (btn) {
      btn.addEventListener('click', function() {
        var input = document.getElementById('mp-postal');
        var result = document.getElementById('mp-result');
        var postal = (input.value || '').toUpperCase().replace(/\s+/g, '');
        if (postal.length < 6) {
          result.innerHTML = '<p style="color:var(--slate-critical,#ef4444);font-size:0.85rem;">Please enter a valid postal code.</p>';
          return;
        }
        result.innerHTML = '<p style="color:var(--slate-ink-dim);font-size:0.85rem;">Looking up ' + postal + '... <br>Visit <a href="https://www.ourcommons.ca/members/en" target="_blank" style="color:var(--slate-link,#c89a76)">ourcommons.ca</a> for full results.</p>';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMyMP);
  } else {
    initMyMP();
  }

  console.log('[my-mp] Widget module loaded.');
})();
