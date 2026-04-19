/* TENET5 slate-motion.js — awwwards-style motion wiring.
   Modified: 2026-04-19
   Pairs with style-slate-motion.css. Auto-initialises on pages that
   have .ts-motion on <body> (or any ancestor of the content).

   What this file wires:
     - IntersectionObserver on .ts-reveal / .ts-reveal-x / .ts-reveal-scale
       → adds .ts-in when element enters viewport (once, not repeat)
     - Scroll-triggered .ts-scan to fire its sweep on first viewport entry
     - .ts-split-chars auto-splits heading text into per-character spans
       with staggered --i delay
     - Cursor tracker sets --ts-cursor-x / --ts-cursor-y CSS vars on body
     - Magnetic button hook on .ts-magnetic elements
     - Number roll-up on .ts-rollup .ts-n elements (count 0 → data-target)

   Everything is progressive enhancement: if JS doesn't run, pages still
   render correctly (opacity defaults to 1 where CSS has no animation
   trigger).
*/
(function () {
  'use strict';

  // Respect reduced motion — don't wire any animation hooks.
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('.ts-reveal,.ts-reveal-x,.ts-reveal-scale').forEach(function (el) {
      el.classList.add('ts-in');
    });
    return;
  }

  // ── 1. Auto-split headings marked .ts-split-chars ─────────────
  function splitChars() {
    document.querySelectorAll('.ts-split-chars').forEach(function (el) {
      if (el.dataset.split === 'done') return;
      var text = el.textContent;
      el.textContent = '';
      [].forEach.call(text, function (ch, i) {
        var span = document.createElement('span');
        span.style.setProperty('--i', i);
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
      });
      el.dataset.split = 'done';
    });
  }

  // ── 2. IntersectionObserver for reveals ──────────────────────
  function setupReveals() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.ts-reveal,.ts-reveal-x,.ts-reveal-scale,.ts-scan').forEach(function (el) {
        el.classList.add('ts-in');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('ts-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.ts-reveal,.ts-reveal-x,.ts-reveal-scale,.ts-scan').forEach(function (el) {
      io.observe(el);
    });
  }

  // ── 3. Cursor tracking — sets --ts-cursor-x / --ts-cursor-y ──
  function setupCursor() {
    var body = document.body;
    // Use rAF throttle for smoothness
    var raf = null, last = {x: 0, y: 0};
    window.addEventListener('pointermove', function (e) {
      last.x = e.clientX; last.y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        body.style.setProperty('--ts-cursor-x', last.x + 'px');
        body.style.setProperty('--ts-cursor-y', last.y + 'px');
        raf = null;
      });
    }, { passive: true });
  }

  // ── 4. Magnetic buttons — content shifts toward cursor on hover ──
  function setupMagnetic() {
    document.querySelectorAll('.ts-magnetic').forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic || '0.15');
      var max = 10;   // cap in px
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width/2)) * strength;
        var dy = (e.clientY - (r.top + r.height/2)) * strength;
        dx = Math.max(-max, Math.min(max, dx));
        dy = Math.max(-max, Math.min(max, dy));
        el.style.setProperty('--ts-mx', dx.toFixed(1) + 'px');
        el.style.setProperty('--ts-my', dy.toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--ts-mx', '0px');
        el.style.setProperty('--ts-my', '0px');
      });
    });
  }

  // ── 5. Number roll-up — count from 0 to data-target ──────────
  function setupRollups() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.dataset.target || el.textContent.replace(/[^0-9.]/g,'')) || 0;
        var decimals = (el.dataset.decimals !== undefined) ? parseInt(el.dataset.decimals, 10) : 0;
        var duration = parseInt(el.dataset.duration || '1400', 10);
        var start = performance.now();
        function step(now) {
          var p = Math.min(1, (now - start) / duration);
          // ease-out cubic
          var eased = 1 - Math.pow(1 - p, 3);
          var cur = target * eased;
          el.textContent = decimals > 0 ? cur.toFixed(decimals) : Math.round(cur).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = decimals > 0 ? target.toFixed(decimals) : Math.round(target).toLocaleString();
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.ts-rollup .ts-n').forEach(function (el) { io.observe(el); });
  }

  // ── Boot ─────────────────────────────────────────────────────
  function boot() {
    splitChars();
    setupReveals();
    setupCursor();
    setupMagnetic();
    setupRollups();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
