/* ═══════════════════════════════════════════════════════
   UX Enhancements — Reading progress, back-to-top, mobile nav
   Canadian Accountability Project
   ═══════════════════════════════════════════════════════ */

(function() {
  document.addEventListener('DOMContentLoaded', function() {

    // ── Reading Progress Bar ────────────────────────────
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', function() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(progress, 100) + '%';
    }, { passive: true });

    // ── Back to Top Button ──────────────────────────────
    const topBtn = document.createElement('button');
    topBtn.className = 'back-to-top';
    topBtn.innerHTML = '&#8593;';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.title = 'Back to top';
    document.body.appendChild(topBtn);

    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    }, { passive: true });

    topBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── Mobile Nav Toggle ───────────────────────────────
    // Works with the menu-toggle button in nav.js
    const menuBtn = document.getElementById('menu-toggle');
    const siteNav = document.querySelector('.site-header .site-nav, nav.site-nav');
    if (menuBtn && siteNav) {
      menuBtn.addEventListener('click', function() {
        siteNav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded',
          siteNav.classList.contains('open') ? 'true' : 'false');
      });

      // Close nav when clicking a link (mobile)
      siteNav.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          if (window.innerWidth <= 900) {
            siteNav.classList.remove('open');
          }
        });
      });
    }

    // ── Smooth scroll for anchor links ──────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ── Lazy load images ────────────────────────────────
    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imgObserver.unobserve(img);
          }
        });
      });
      document.querySelectorAll('img[data-src]').forEach(function(img) {
        imgObserver.observe(img);
      });
    }
  });
})();
