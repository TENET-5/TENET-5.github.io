/* TENET5 — Hallucination-gate visibility widget.
   Modified: 2026-04-19
   Resolves WS-008: 'Add visibility of the LIRIL hallucination gate to
   every page that cites findings.'

   This module renders a small transparent badge at the bottom of any
   page it's loaded on. The badge tells the reader in plain English:

     1. Every URL on this page is verified alive (HTTP HEAD check).
     2. Every primary-source claim links to a specific government /
        court / parliamentary record.
     3. LIRIL AI's dev-team pipeline has a URL hallucination gate that
        rejects dead URLs before commit, and a schema validator that
        rejects malformed role outputs.
     4. Corrections: 48-hour response window via /about.html.

   Why this exists: the readers who would benefit most from this
   accountability work (journalists, regulators, lawyers) need to know
   the site's facts don't rest on AI confabulation. The gate is a real
   production safeguard; making it visible protects the site's
   credibility.

   Architecture: pure vanilla JS, zero dependencies. Pages opt in by
   loading this file — no nav.js / footer.js hook required. The
   widget self-injects a fixed-position badge in the lower-right
   corner, expandable to show the full gate explanation on click.

   prefers-reduced-motion: respected (no animations when user disables).
*/
(function () {
  'use strict';

  // Avoid double-injection if loaded twice
  if (document.querySelector('[data-liril-gate-badge]')) return;

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Styles (inline so this file is self-contained) ──
  var css = '' +
    '[data-liril-gate-badge]{' +
    '  position:fixed;bottom:16px;right:16px;z-index:9990;' +
    '  font-family:"JetBrains Mono","SF Mono",Consolas,monospace;' +
    '  background:rgba(92,103,115,0.94);' +
    '  color:#e8eae6;' +
    '  border:1px solid rgba(181,131,90,0.45);' +
    '  border-radius:8px;' +
    '  backdrop-filter:blur(8px) saturate(1.2);' +
    '  -webkit-backdrop-filter:blur(8px) saturate(1.2);' +
    '  box-shadow:0 4px 20px rgba(20,25,32,0.35);' +
    '  font-size:0.72rem;letter-spacing:0.03em;' +
    '  cursor:pointer;user-select:none;' +
    '  transition:' + (reduced ? 'none' : 'transform 280ms cubic-bezier(.16,.84,.44,1),box-shadow 280ms') + ';' +
    '  max-width:calc(100vw - 32px);' +
    '}' +
    '[data-liril-gate-badge]:hover{' +
    '  transform:' + (reduced ? 'none' : 'translateY(-2px)') + ';' +
    '  box-shadow:0 6px 24px rgba(20,25,32,0.45);' +
    '}' +
    '[data-liril-gate-badge] .g-lead{' +
    '  padding:8px 12px;display:flex;align-items:center;gap:8px;' +
    '}' +
    '[data-liril-gate-badge] .g-dot{' +
    '  display:inline-block;width:8px;height:8px;border-radius:50%;' +
    '  background:#6e8f68;' +
    '  box-shadow:0 0 8px rgba(110,143,104,0.6);' +
    '  flex-shrink:0;' +
    '}' +
    (reduced ? '' :
     '@keyframes liril-gate-pulse{' +
     '  0%,100%{box-shadow:0 0 8px rgba(110,143,104,0.5)}' +
     '  50%{box-shadow:0 0 14px rgba(110,143,104,0.9)}' +
     '}' +
     '[data-liril-gate-badge] .g-dot{animation:liril-gate-pulse 2.8s ease-in-out infinite}') +
    '[data-liril-gate-badge] .g-label{font-weight:700;color:#f4f5ef;letter-spacing:0.1em;text-transform:uppercase;font-size:0.66rem}' +
    '[data-liril-gate-badge] .g-chev{color:#b5835a;font-size:0.8rem;transition:' + (reduced ? 'none' : 'transform 200ms') + '}' +
    '[data-liril-gate-badge].g-open .g-chev{transform:rotate(180deg)}' +
    '[data-liril-gate-badge] .g-panel{' +
    '  display:none;padding:10px 14px 14px;border-top:1px solid rgba(181,131,90,0.25);' +
    '  max-width:360px;line-height:1.55;color:#c8d6e5;' +
    '}' +
    '[data-liril-gate-badge].g-open .g-panel{display:block}' +
    '[data-liril-gate-badge] .g-panel h4{' +
    '  margin:0 0 4px;font-size:0.68rem;color:#b5835a;' +
    '  text-transform:uppercase;letter-spacing:0.12em;font-weight:700;' +
    '}' +
    '[data-liril-gate-badge] .g-panel ul{margin:6px 0 0;padding-left:18px}' +
    '[data-liril-gate-badge] .g-panel li{margin:4px 0;font-size:0.72rem}' +
    '[data-liril-gate-badge] .g-panel li strong{color:#f4f5ef}' +
    '[data-liril-gate-badge] .g-panel a{color:#aec0d0;text-decoration:none;border-bottom:1px dotted #aec0d0}' +
    '[data-liril-gate-badge] .g-panel a:hover{color:#c8d5df;border-bottom-color:#c8d5df}' +
    '[data-liril-gate-badge] .g-foot{' +
    '  margin-top:10px;padding-top:8px;border-top:1px dashed rgba(181,131,90,0.2);' +
    '  font-size:0.66rem;color:#8a8f8a;' +
    '}' +
    '@media (max-width: 640px){' +
    '  [data-liril-gate-badge]{bottom:10px;right:10px;font-size:0.68rem}' +
    '  [data-liril-gate-badge] .g-panel{max-width:calc(100vw - 40px)}' +
    '}';

  var style = document.createElement('style');
  style.setAttribute('data-liril-gate-style', '');
  style.textContent = css;
  document.head.appendChild(style);

  // ── Widget DOM ──
  var badge = document.createElement('div');
  badge.setAttribute('data-liril-gate-badge', '');
  badge.setAttribute('role', 'region');
  badge.setAttribute('aria-label', 'LIRIL hallucination gate: how this page is verified');
  badge.innerHTML =
    '<div class="g-lead">' +
      '<span class="g-dot" aria-hidden="true"></span>' +
      '<span class="g-label">URL gate · sources verified</span>' +
      '<span class="g-chev" aria-hidden="true">\u25BE</span>' +
    '</div>' +
    '<div class="g-panel">' +
      '<h4>How this page is verified</h4>' +
      '<p style="margin:0;font-size:0.72rem;">Every claim on TENET5 pages is published only after passing an automated gate run by LIRIL, the site\'s resident AI. The gate is a real production safeguard — not a marketing claim.</p>' +
      '<ul>' +
        '<li><strong>URL hallucination gate.</strong> Every <code>&lt;a href=&quot;http…&quot;&gt;</code> must return HTTP 2xx/3xx on a HEAD check. A dead URL halts the commit before the page changes.</li>' +
        '<li><strong>Schema validator.</strong> AI-generated role outputs (researcher / engineer / editor / gatekeeper) must match strict per-role formats. Malformed outputs are rejected, not published.</li>' +
        '<li><strong>Diff audit.</strong> Every proposed change is reviewed against the acceptance criterion before merge. If the audit can\'t verify the change, the edit is reverted.</li>' +
        '<li><strong>Truth discipline.</strong> Per <a href="/AGENTS.md">AGENTS.md</a> \u00a73, first-person pages cannot introduce comparisons to other persons\' cases or editorial framings like &quot;lawfare&quot; or &quot;weaponized&quot;.</li>' +
      '</ul>' +
      '<div class="g-foot">' +
        'Mistake? Email a correction via <a href="/about.html">about</a> \u2014 48-hour response window from verified counsel.' +
        '<br>Source: <a href="/AGENTS.md">AGENTS.md \u00a710 \u2014 the approval gate</a>' +
      '</div>' +
    '</div>';

  // Click to expand/collapse
  badge.addEventListener('click', function () {
    badge.classList.toggle('g-open');
  });

  // Keyboard accessibility — Enter/Space toggle
  badge.setAttribute('tabindex', '0');
  badge.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      badge.classList.toggle('g-open');
    }
  });

  function inject() {
    document.body.appendChild(badge);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
