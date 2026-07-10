/* ═══════════════════════════════════════════════════════════════════════
   QUANTANIUM.JS — v1.5 motion controller (2026-07-10)
   ═══════════════════════════════════════════════════════════════════════
   Progressive enhancement only: every page reads fully with JS off.
   - A3 reveal observer: .reveal / .q-rise get .is-inview at 30% visible
   - A4 count-up: [data-countup] and .stat__num animate 1600ms outCubic
     from the REAL value already authored in the HTML
   - .redact gets .is-revealed on scroll-into-view (touch/keyboard parity)
   - auto-enhance: headings/cards/plates on content pages get .q-rise so
     every page inherits editorial motion with zero markup changes
   - reading progress rail injected (CSS scroll-driven where supported)
   Zero animation under prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__QUANTANIUM_MOTION__) return;
  window.__QUANTANIUM_MOTION__ = true;

  var rm = false;
  try { rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ── A4 · count-up (vanilla canonical: 1600ms outCubic, real HTML value) */
  var fmt;
  try { fmt = new Intl.NumberFormat('en-CA'); } catch (e) { fmt = { format: function (n) { return String(n); } }; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function countUp(el) {
    var raw = (el.getAttribute('data-value') || el.textContent || '').replace(/[^0-9.\-]/g, '');
    var target = parseFloat(raw);
    if (!isFinite(target) || rm) return;               // HTML already shows the truth
    var prefix = (el.textContent.match(/^[^\d\-]*/) || [''])[0];
    var suffix = (el.textContent.match(/[^\d,.\s]*\s*$/) || [''])[0];
    var t0 = performance.now(), D = 1600;
    (function tick(t) {
      var p = Math.min((t - t0) / D, 1);
      el.textContent = prefix + fmt.format(Math.round(target * easeOutCubic(p))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  onReady(function () {
    /* ── auto-enhance: give content blocks editorial rise without markup ── */
    if (!rm) {
      var autoSel = [
        'main h2', '.content h2', 'article h2',
        '.card', '.data-card', '.evidence-box', '.finding-card', '.metric-card',
        '.stat-card', '.sm-cat', '.plate', 'figure.stat', '.info-box', '.panel'
      ].join(',');
      var nodes = document.querySelectorAll(autoSel);
      /* cap: never enhance more than 160 nodes per page (perf) */
      for (var i = 0; i < nodes.length && i < 160; i++) {
        if (!nodes[i].closest('nav, header, footer, .ldoc-bar, #liril-doc-root')) {
          nodes[i].classList.add('q-rise');
        }
      }
    }

    /* ── one observer for reveals, redactions, and count-ups ───────────── */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          io.unobserve(el);
          if (el.classList.contains('reveal') || el.classList.contains('q-rise')) {
            el.classList.add('is-inview');
          }
          if (el.classList.contains('redact')) el.classList.add('is-revealed');
          if (el.hasAttribute('data-countup') || el.classList.contains('stat__num') ||
              el.classList.contains('metric-value') || el.classList.contains('stat-value')) {
            countUp(el);
          }
        });
      }, { threshold: 0.3 });

      document.querySelectorAll(
        '.reveal, .q-rise, .redact, [data-countup], .stat__num, .metric-value, .stat-value'
      ).forEach(function (el) { io.observe(el); });
    } else {
      /* ancient browser: show everything */
      document.querySelectorAll('.reveal, .q-rise').forEach(function (el) { el.classList.add('is-inview'); });
    }

    /* ── reading progress rail (content pages only, not the shell) ─────── */
    try {
      var isShell = /(^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname === '/';
      if (!isShell && !document.querySelector('.q-progress')) {
        var rail = document.createElement('div');
        rail.className = 'q-progress';
        rail.setAttribute('aria-hidden', 'true');
        document.body.appendChild(rail);
      }
    } catch (e) {}
  });
})();
