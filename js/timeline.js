/* ═══════════════════════════════════════════════════════════════════════
   TENET⁵ Timeline Engine — Scroll-Driven Reveal + Animated Counters
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__TENET5_TIMELINE_LOADED) return;
  window.__TENET5_TIMELINE_LOADED = true;

  /* ── IntersectionObserver for scroll reveals ─────────────────────── */
  function initScrollReveal() {
    var targets = document.querySelectorAll('.tl-node, .tl-section-fade');
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('tl-visible');
          /* Once visible, stop observing (one-shot animation) */
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Animated number counters ────────────────────────────────────── */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var end = parseInt(el.getAttribute('data-count-to'), 10);
    var duration = parseInt(el.getAttribute('data-count-duration') || '2000', 10);
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      /* Ease-out cubic */
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(start + (end - start) * ease);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* ── Parallax subtle drift on hero ───────────────────────────────── */
  function initParallax() {
    var hero = document.querySelector('.tl-hero');
    if (!hero) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scroll = window.pageYOffset || document.documentElement.scrollTop;
          var heroH = hero.offsetHeight;
          if (scroll < heroH * 1.5) {
            var pct = scroll / heroH;
            hero.style.opacity = Math.max(1 - pct * 0.7, 0);
            hero.style.transform = 'translateY(' + (scroll * 0.25) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  function init() {
    initScrollReveal();
    initCounters();
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
