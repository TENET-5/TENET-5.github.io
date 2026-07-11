/* TENET5 reveal — fades in .rv sections on scroll.
 *
 * liril-home-guide.js sets <html class="js">, which activates the CSS rule
 * `.js .rv{opacity:0}`. Something MUST add `.in` back or the content is
 * invisible forever. This is that something — and it is defensive: any .rv
 * still hidden after a short grace period is force-revealed, so a missed
 * observer callback can never blank the page again.
 */
(function () {
  'use strict';
  if (window.__TENET5_RV_REVEAL) return;
  window.__TENET5_RV_REVEAL = true;

  function run() {
    var els = [].slice.call(document.querySelectorAll('.rv, .glass:not(.rv)'));
    if (!els.length) return;

    function reveal(el) { el.classList.add('in'); }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { reveal(e.target); obs.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el) {
        // already in view on load → reveal immediately (no scroll needed)
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) reveal(el);
        else obs.observe(el);
      });
    } else {
      els.forEach(reveal);
    }

    // Safety net: nothing stays invisible. After 2.5s force-reveal any laggards,
    // and on full page load reveal anything above the current scroll position.
    setTimeout(function () { els.forEach(reveal); }, 2500);
    window.addEventListener('load', function () {
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.2) reveal(el);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else { run(); }
})();
