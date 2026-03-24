// TENET-5 GitHub Pages — Interactive Enhancements
// Scroll progress, animated counters, reveal-on-scroll, mobile nav, back-to-top

(function () {
  'use strict';

  // ── Scroll Progress Bar ──────────────────────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // ── Back to Top Button ───────────────────────────────────────────────────
  const topBtn = document.createElement('button');
  topBtn.className = 'back-to-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '&#8593;';
  document.body.appendChild(topBtn);

  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function updateTopBtn() {
    topBtn.classList.toggle('visible', window.scrollY > 400);
  }

  // ── Scroll handler (throttled) ───────────────────────────────────────────
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgress();
        updateTopBtn();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── Scroll Reveal ────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll(
    'section, .stat-callout, .formula-box, .cta-card, .chart-container'
  );
  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }

  // ── Animated Counters ────────────────────────────────────────────────────
  var counterEls = document.querySelectorAll('.big-number, [data-count]');
  function animateCounter(el) {
    var text = el.textContent.trim();
    // Match numbers like 76,475 or 1 in 20 or 6
    var match = text.match(/^([\d,]+)/);
    if (!match) return;
    var target = parseInt(match[1].replace(/,/g, ''), 10);
    if (isNaN(target) || target === 0) return;
    var suffix = text.slice(match[0].length);
    var duration = Math.min(2000, Math.max(800, target / 20));
    var start = null;
    el.dataset.animated = '1';

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { counterObs.observe(el); });
  }

  // ── Mobile Navigation ────────────────────────────────────────────────────
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.setAttribute('aria-label', 'Toggle navigation');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    nav.prepend(hamburger);

    // Wrap all non-brand, non-hamburger links
    var links = nav.querySelectorAll('a:not(.brand)');
    var linkWrap = document.createElement('div');
    linkWrap.className = 'nav-links';
    links.forEach(function (a) { linkWrap.appendChild(a); });
    nav.appendChild(linkWrap);

    hamburger.addEventListener('click', function () {
      nav.classList.toggle('open');
      hamburger.classList.toggle('active');
    });

    // Close on link click (mobile)
    linkWrap.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  }

  // ── Sticky Nav Shadow ────────────────────────────────────────────────────
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Table Row Hover Enhancement (subtle highlight) ──────────────────────
  document.querySelectorAll('.data-table tbody tr').forEach(function (row) {
    row.addEventListener('mouseenter', function () {
      this.style.transition = 'background 0.2s';
    });
  });

  // ── Init ─────────────────────────────────────────────────────────────────
  updateProgress();
  updateTopBtn();
})();
