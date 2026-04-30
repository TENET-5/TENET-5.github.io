/* ═══════════════════════════════════════════════════════
   TENET5 Main.js — Scroll Effects & Page Polish
   Loaded in DIRECT ACCESS mode (no iframe).
   Handles smooth scrolling, intersection observers,
   and ambient page effects.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_MAIN_LOADED) return;
  window.__TENET5_MAIN_LOADED = true;

  /* ── Smooth scroll for anchor links ────────────────────── */
  document.addEventListener('click', function(e) {
    var target = e.target.closest('a[href^="#"]');
    if (!target) return;
    var id = target.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ── Intersection Observer — fade-in sections ──────────── */
  var observer = null;
  try {
    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('section, .card, .news-item, .step, .insight-item, article').forEach(function(el) {
      el.classList.add('fade-observe');
      observer.observe(el);
    });
  } catch(e) {
    /* IE/old browser fallback — just show everything */
    document.querySelectorAll('.fade-observe').forEach(function(el) {
      el.classList.add('is-visible');
    });
  }

  /* ── Scroll progress bar ───────────────────────────────── */
  var progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText =
    'position:fixed;top:0;left:0;height:2px;background:var(--slate-accent,#c89a76);' +
    'z-index:99999;transition:width 0.1s linear;width:0;pointer-events:none;';
  document.body.appendChild(progressBar);

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  console.log('[main] TENET5 main effects initialised.');
})();
