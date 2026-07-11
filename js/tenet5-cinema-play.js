/* TENET5 cinema force-play — sitewide atmospheric LTX / gallery video.
 * Muted + loop + playsinline. Retries after load, visibility, and first gesture.
 * Reduced-motion: keep posters, pause loops (still frames remain).
 */
(function () {
  'use strict';
  if (window.TENET5CinemaPlay && window.TENET5CinemaPlay.__v >= 1) return;

  var SEL = [
    'video.act-page-bg',
    'video.act-page-fg-video',
    '.act-page-fg video',
    'video.home-broll',
    'video.film-broll',
    'video[data-act-cine]',
    'video[data-home-cine]',
    '.enter-card video',
    '.media-frame video',
    '.cinema-cell video',
    '.tunw-media-bg',
    'video.tunw-media-bg'
  ].join(',');

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function arm(v) {
    if (!v || v.nodeName !== 'VIDEO') return;
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('autoplay', '');
    if (!v.getAttribute('preload') || v.getAttribute('preload') === 'none') {
      v.setAttribute('preload', 'auto');
    }
    /* Prefer direct src so play() does not race empty <source> children */
    if (!v.getAttribute('src')) {
      var s = v.querySelector('source[src]');
      if (s && s.getAttribute('src')) {
        v.src = s.getAttribute('src');
      }
    }
  }

  function tryPlay(v) {
    if (!v || v.nodeName !== 'VIDEO') return;
    arm(v);
    if (reduced()) {
      try { v.pause(); } catch (e) { /* */ }
      return;
    }
    try {
      var p = v.play();
      if (p && typeof p.then === 'function') {
        p.catch(function () {
          /* Autoplay blocked until gesture — armed; gesture handler retries */
          v.dataset.playPending = '1';
        });
      }
    } catch (e) {
      v.dataset.playPending = '1';
    }
  }

  function allCinema() {
    return document.querySelectorAll(SEL);
  }

  function playAll() {
    allCinema().forEach(tryPlay);
  }

  function boot() {
    playAll();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) tryPlay(v);
          else if (v.classList.contains('act-page-bg') || v.classList.contains('home-broll') ||
                   v.classList.contains('film-broll') || v.classList.contains('act-page-fg-video')) {
            /* Keep page-level atmosphere running when still on page */
            tryPlay(v);
          } else {
            try { if (!v.classList.contains('act-page-bg')) v.pause(); } catch (e) { /* */ }
          }
        });
      }, { rootMargin: '120px', threshold: 0.05 });
      allCinema().forEach(function (v) { io.observe(v); });
    }

    /* First user gesture unlocks autoplay on strict browsers */
    function unlock() {
      playAll();
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    }
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);
    document.addEventListener('touchstart', unlock, { capture: true, passive: true });

    /* Walkthrough injects videos after start — re-arm periodically briefly */
    var n = 0;
    var t = setInterval(function () {
      playAll();
      n += 1;
      if (n > 12) clearInterval(t);
    }, 1500);

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) playAll();
    });

    window.addEventListener('tunw:manifest', function () {
      setTimeout(playAll, 50);
      setTimeout(playAll, 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.TENET5CinemaPlay = { playAll: playAll, arm: arm, tryPlay: tryPlay, __v: 1 };
})();
