(function () {
  'use strict';

  // Guard: prevent double execution
  if (window.__TENET5_REVEAL_LOADED) return;
  window.__TENET5_REVEAL_LOADED = true;

  // Add .reveal class to standard blocks that should animate in
  const revealEls = document.querySelectorAll(
    'section, .stat-callout, .formula-box, .cta-card, .chart-container, ' +
    '.corruption-entry, .record, .verdict-box, .purchase-callout, ' +
    '.meme-card, .hero-section, .section-title, .media-stat, ' +
    '.door-card, .indie-card, .cmp-row, h2, p, .flag, h1'
  );

  revealEls.forEach(function (el) {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
      el.classList.add('visible');
    });
  }
})();
