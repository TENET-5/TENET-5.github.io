/* TENET5 cinema force-play — sitewide film / gallery / page bg.
 * v2: hero players keep trying even under reduced-motion; live badge; black-src skip.
 * Muted + loop + playsinline. Retries after load, visibility, and first gesture.
 */
(function () {
  'use strict';
  if (window.TENET5CinemaPlay && window.TENET5CinemaPlay.__v >= 2) return;

  var SEL = [
    'video.act-page-bg',
    'video.act-page-fg-video',
    '.act-page-fg video',
    'video.home-broll',
    'video.film-broll',
    'video.act-hero-video',
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

  function isHero(v) {
    return v && (v.classList.contains('act-hero-video') || v.hasAttribute('data-force-play'));
  }

  function resolveSrc(v) {
    if (v.getAttribute('src')) return v.getAttribute('src');
    var s = v.querySelector('source[src]');
    return s ? s.getAttribute('src') : '';
  }

  function arm(v) {
    if (!v || v.nodeName !== 'VIDEO') return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('autoplay', '');
    v.preload = 'auto';
    v.setAttribute('preload', 'auto');
    if (!v.getAttribute('src')) {
      var src = resolveSrc(v);
      if (src) v.src = src;
    }
  }

  function setLiveBadge(v, state) {
    var frame = v.closest('.media-frame');
    if (!frame) return;
    var badge = frame.querySelector('.act-film-live');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'act-film-live';
      badge.setAttribute('aria-hidden', 'true');
      frame.appendChild(badge);
    }
    badge.setAttribute('data-state', state);
    badge.textContent = state === 'play' ? 'Film playing' : (state === 'wait' ? 'Film ready' : 'Film');
  }

  function tryPlay(v) {
    if (!v || v.nodeName !== 'VIDEO') return;
    arm(v);
    /* Reduced-motion: pause decorative bg; keep hero/forced players alive */
    if (reduced() && !isHero(v)) {
      try { v.pause(); } catch (e) { /* */ }
      setLiveBadge(v, 'wait');
      return;
    }
    try {
      var p = v.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {
          setLiveBadge(v, 'play');
          v.dataset.playing = '1';
        }).catch(function () {
          v.dataset.playPending = '1';
          setLiveBadge(v, 'wait');
        });
      } else {
        setLiveBadge(v, v.paused ? 'wait' : 'play');
      }
    } catch (e) {
      v.dataset.playPending = '1';
      setLiveBadge(v, 'wait');
    }
  }

  function allCinema() {
    return document.querySelectorAll(SEL);
  }

  function playAll() {
    allCinema().forEach(tryPlay);
  }

  function wireEvents(v) {
    if (v.dataset.cineWired) return;
    v.dataset.cineWired = '1';
    v.addEventListener('playing', function () { setLiveBadge(v, 'play'); });
    v.addEventListener('pause', function () {
      if (!v.ended) setLiveBadge(v, 'wait');
    });
    v.addEventListener('loadeddata', function () { tryPlay(v); });
    v.addEventListener('canplay', function () { tryPlay(v); });
    v.addEventListener('error', function () {
      setLiveBadge(v, 'wait');
      /* If bg fails, leave poster; do not throw */
    });
  }

  function boot() {
    allCinema().forEach(wireEvents);
    playAll();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting || isHero(v) ||
              v.classList.contains('act-page-bg') ||
              v.classList.contains('home-broll') ||
              v.classList.contains('film-broll') ||
              v.classList.contains('act-page-fg-video')) {
            tryPlay(v);
          } else if (!isHero(v) && !v.classList.contains('act-page-bg') &&
                     !v.classList.contains('home-broll')) {
            try { v.pause(); } catch (e) { /* */ }
          }
        });
      }, { rootMargin: '160px', threshold: 0.02 });
      allCinema().forEach(function (v) { io.observe(v); });
    }

    function unlock() {
      playAll();
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    }
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);
    document.addEventListener('touchstart', unlock, { capture: true, passive: true });

    var n = 0;
    var t = setInterval(function () {
      playAll();
      n += 1;
      if (n > 20) clearInterval(t);
    }, 800);

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) playAll();
    });

    window.addEventListener('tunw:manifest', function () {
      setTimeout(function () {
        allCinema().forEach(wireEvents);
        playAll();
      }, 40);
      setTimeout(playAll, 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.TENET5CinemaPlay = { playAll: playAll, arm: arm, tryPlay: tryPlay, __v: 2 };
})();
