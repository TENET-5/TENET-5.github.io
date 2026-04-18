/* ════════════════════════════════════════════════════════════════════
   TENET5 breadcrumbs — shared IA-Pillar-5 location component
   Modified: 2026-04-18
   ════════════════════════════════════════════════════════════════════

   Implements Morville & Rosenfeld information-architecture Pillar 5
   (Location cues) across the investigation's long analysis pages.
   Loaded opt-in: any page that wants a breadcrumb just adds

       <div id="breadcrumb-mount" data-breadcrumb='["Home","Investigation","Officer findings"]'></div>

   before the hero, and includes this script. The data-breadcrumb
   attribute is a JSON array of crumb labels, innermost last. The
   component maps labels to known page URLs where possible; unknown
   labels render as inert text.

   Keyboard / screen-reader support: the crumbs are a <nav aria-label>
   with an ordered list and aria-current="page" on the final item.

   Zero external CSS — injected inline with a unique ID so repeat loads
   don't re-inject. Respects prefers-color-scheme dark.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__TENET5_BREADCRUMBS_LOADED) return;
  window.__TENET5_BREADCRUMBS_LOADED = true;

  // Map crumb label → canonical URL. Unknown labels render as inert text.
  // Case-insensitive lookup; extend as new pages land.
  var URL_MAP = {
    'home':                        'index.html',
    'investigation':               'state-of-investigation.html',
    'state of investigation':      'state-of-investigation.html',
    'reading path':                'reading-path.html',
    'axes index':                  'axes-index.html',
    'all 19 axes':                 'axes-index.html',
    'information architecture':    'information-architecture.html',
    'limitations':                 'limitations-and-critiques.html',
    'meta-grover':                 'quantum-meta-grover.html',
    'meta grover':                 'quantum-meta-grover.html',
    'temporal overlap':            'temporal-overlap.html',
    'accountability inflections':  'accountability-inflections.html',
    'inflections':                 'accountability-inflections.html',
    'officer findings':            'officer-of-parliament-findings.html',
    'officer of parliament findings': 'officer-of-parliament-findings.html',
    'enforcement follow-through':  'enforcement-followthrough.html',
    'enforcement followthrough':   'enforcement-followthrough.html',
    'liril dev team':              'liril-dev-team.html',
    'liril live':                  'liril-live.html',
    'liril roadmap':               'liril-roadmap.html',
    'press kit':                   'press-kit.html',
    'family connections':          'family-connections.html',
    'political business influence':'political-business-influence.html',
    'wilson-raybould dual axis':   'wilson-raybould-dual-axis.html',
    'instagram draft assist':      'instagram-draft-assist.html'
  };

  // Inject styles once.
  if (!document.getElementById('tenet5-breadcrumb-styles')) {
    var style = document.createElement('style');
    style.id = 'tenet5-breadcrumb-styles';
    style.textContent = [
      '.t5-breadcrumb{',
      '  max-width:1200px;margin:0.8rem auto 0;padding:0.35rem 1.4rem;',
      '  font-family:"JetBrains Mono","IBM Plex Mono",monospace;font-size:0.72rem;',
      '  color:#6b7280;letter-spacing:0.5px;',
      '}',
      '.t5-breadcrumb ol{',
      '  list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;',
      '  align-items:center;gap:0.35rem;',
      '}',
      '.t5-breadcrumb li{display:inline-flex;align-items:center;}',
      '.t5-breadcrumb a{color:#0369a1;text-decoration:none;font-weight:700;}',
      '.t5-breadcrumb a:hover{text-decoration:underline;color:#075985;}',
      '.t5-breadcrumb a:focus-visible{outline:2px solid #0369a1;outline-offset:2px;border-radius:3px;}',
      '.t5-breadcrumb .sep{color:#9ca3af;padding:0 0.1rem;user-select:none;}',
      '.t5-breadcrumb [aria-current="page"]{color:#1a1f36;font-weight:700;}',
      '@media (prefers-color-scheme: dark){',
      '  .t5-breadcrumb{color:#9ca3af;}',
      '  .t5-breadcrumb a{color:#67e8f9;}',
      '  .t5-breadcrumb a:hover{color:#a5f3fc;}',
      '  .t5-breadcrumb .sep{color:#4b5563;}',
      '  .t5-breadcrumb [aria-current="page"]{color:#e5e7eb;}',
      '}',
      // When page has a dark hero, the breadcrumb typically sits directly
      // above it — allow pages to opt into a dark variant explicitly.
      '.t5-breadcrumb.dark{color:#c4b5fd;}',
      '.t5-breadcrumb.dark a{color:#a5b4fc;}',
      '.t5-breadcrumb.dark a:hover{color:#ddd6fe;}',
      '.t5-breadcrumb.dark .sep{color:#6b7280;}',
      '.t5-breadcrumb.dark [aria-current="page"]{color:#f9fafb;}'
    ].join('');
    document.head.appendChild(style);
  }

  function urlForLabel(label) {
    var key = String(label || '').trim().toLowerCase();
    return URL_MAP[key] || null;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function renderCrumbs(crumbs, dark) {
    if (!Array.isArray(crumbs) || crumbs.length === 0) return '';
    var html = '<nav class="t5-breadcrumb' + (dark ? ' dark' : '') + '" aria-label="Breadcrumb"><ol>';
    for (var i = 0; i < crumbs.length; i++) {
      var label = String(crumbs[i] || '').trim();
      if (!label) continue;
      var isLast = (i === crumbs.length - 1);
      if (i > 0) html += '<li class="sep" aria-hidden="true">&rsaquo;</li>';
      if (isLast) {
        html += '<li aria-current="page">' + esc(label) + '</li>';
      } else {
        var url = urlForLabel(label);
        if (url) {
          html += '<li><a href="' + esc(url) + '">' + esc(label) + '</a></li>';
        } else {
          html += '<li>' + esc(label) + '</li>';
        }
      }
    }
    html += '</ol></nav>';
    return html;
  }

  function mount() {
    var els = document.querySelectorAll('[data-breadcrumb]');
    if (!els.length) {
      // Fallback: if there's a #breadcrumb-mount element without an attribute,
      // do nothing — pages must explicitly opt in with a JSON crumb list.
      return;
    }
    els.forEach(function (el) {
      if (el.getAttribute('data-breadcrumb-rendered') === '1') return;
      var raw = el.getAttribute('data-breadcrumb');
      var dark = el.hasAttribute('data-breadcrumb-dark');
      var crumbs;
      try { crumbs = JSON.parse(raw); } catch (e) {
        console.warn('[breadcrumbs] invalid JSON on', el, raw);
        return;
      }
      el.innerHTML = renderCrumbs(crumbs, dark);
      el.setAttribute('data-breadcrumb-rendered', '1');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  // Re-mount after a tick in case pages inject crumbs post-load.
  setTimeout(mount, 200);
})();
