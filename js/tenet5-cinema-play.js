/* TENET5 cinema force-play — sitewide film / gallery / page bg.
 * v3: direct src + load(); hero never paused; click-to-play gate; controls fallback;
 *      absolute root-relative media paths; unmute-safe volume 0; kill reduced-motion race.
 * Muted + loop + playsinline. Retries after load, visibility, and first gesture.
 */
(function () {
  'use strict';
  if (window.TENET5CinemaPlay && window.TENET5CinemaPlay.__v >= 3) return;

  var SEL = [
    'video.act-page-bg',
    'video.act-page-fg-video',
    '.act-page-fg video',
    'video.home-broll',
    'video.film-broll',
    'video.act-hero-video',
    'video[data-act-cine]',
    'video[data-home-cine]',
    'video[data-force-play]',
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
    return !!(v && (
      v.classList.contains('act-hero-video') ||
      v.hasAttribute('data-force-play') ||
      v.classList.contains('home-broll')
    ));
  }

  function isDecorativeBg(v) {
    return !!(v && (
      v.classList.contains('act-page-bg') ||
      v.classList.contains('act-page-fg-video') ||
      v.classList.contains('film-broll')
    ));
  }

  /** Root-relative absolute path so nested routes still resolve on GitHub Pages. */
  function absolutize(src) {
    if (!src) return '';
    if (/^(https?:|data:|blob:|\/)/i.test(src)) return src;
    try {
      return new URL(src, document.baseURI || (window.location.origin + '/')).pathname +
        (src.indexOf('?') >= 0 ? src.slice(src.indexOf('?')) : '');
    } catch (e) {
      return src;
    }
  }

  function resolveSrc(v) {
    var a = v.getAttribute('src') || v.getAttribute('data-src') || '';
    if (a) return a;
    var s = v.querySelector('source[src]');
    return s ? (s.getAttribute('src') || '') : '';
  }

  function ensureSrc(v) {
    var raw = resolveSrc(v);
    if (!raw) return '';
    var abs = absolutize(raw);
    /* Prefer root-relative for same-origin GH Pages (avoids odd baseURI edges). */
    var finalSrc = abs.indexOf('http') === 0 ? abs : (abs.charAt(0) === '/' ? abs : '/' + abs.replace(/^\.\//, ''));
    if (raw.indexOf('media/') === 0) finalSrc = '/' + raw;
    if (raw.charAt(0) === '/') finalSrc = raw;

    var cur = v.getAttribute('src') || '';
    if (cur !== finalSrc && cur !== raw) {
      v.setAttribute('src', finalSrc);
      v.src = finalSrc;
      try { v.load(); } catch (e) { /* */ }
    } else if (!cur) {
      v.setAttribute('src', finalSrc || raw);
      v.src = finalSrc || raw;
      try { v.load(); } catch (e2) { /* */ }
    }
    /* Mirror onto <source> for parsers that prefer children */
    var source = v.querySelector('source');
    if (source && !source.getAttribute('src')) {
      source.setAttribute('src', finalSrc || raw);
    }
    return finalSrc || raw;
  }

  function arm(v) {
    if (!v || v.nodeName !== 'VIDEO') return;
    try {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      v.loop = true;
      v.playsInline = true;
      if ('webkitPlaysInline' in v) v.webkitPlaysInline = true;
    } catch (e) { /* */ }
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('autoplay', '');
    v.preload = 'auto';
    v.setAttribute('preload', 'auto');
    ensureSrc(v);
    /* Hero / forced: native controls so user can always start playback */
    if (isHero(v) && !v.hasAttribute('data-no-controls')) {
      v.setAttribute('controls', '');
      v.controls = true;
    }
  }

  function setLiveBadge(v, state) {
    var frame = v.closest('.media-frame') || v.closest('.act-hero-still') || v.parentElement;
    if (!frame) return;
    var badge = frame.querySelector('.act-film-live');
    if (!badge && frame.classList && frame.classList.contains('media-frame')) {
      badge = document.createElement('span');
      badge.className = 'act-film-live';
      badge.setAttribute('aria-hidden', 'true');
      frame.appendChild(badge);
    }
    if (!badge) return;
    badge.setAttribute('data-state', state);
    badge.textContent = state === 'play' ? 'Film playing' : (state === 'wait' ? 'Tap to play' : 'Film');
  }

  function ensurePlayGate(v) {
    if (!isHero(v) && !v.closest('.media-frame.is-cine')) return;
    var frame = v.closest('.media-frame');
    if (!frame) return;
    var gate = frame.querySelector('.act-play-gate');
    if (gate) return gate;
    gate = document.createElement('button');
    gate.type = 'button';
    gate.className = 'act-play-gate';
    gate.setAttribute('aria-label', 'Play film');
    gate.innerHTML = '<span class="act-play-gate-ico" aria-hidden="true"></span><span class="act-play-gate-txt">Play film</span>';
    gate.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      arm(v);
      try {
        var p = v.play();
        if (p && p.then) {
          p.then(function () {
            gate.hidden = true;
            setLiveBadge(v, 'play');
          }).catch(function () {
            setLiveBadge(v, 'wait');
          });
        }
      } catch (e) { /* */ }
    });
    frame.appendChild(gate);
    return gate;
  }

  function showGate(v, show) {
    var frame = v.closest('.media-frame');
    if (!frame) return;
    var gate = frame.querySelector('.act-play-gate') || ensurePlayGate(v);
    if (!gate) return;
    gate.hidden = !show;
  }

  function tryPlay(v) {
    if (!v || v.nodeName !== 'VIDEO') return;
    arm(v);
    ensurePlayGate(v);

    /* Reduced-motion: pause only pure decorative page layers; keep heroes + gallery playable */
    if (reduced() && isDecorativeBg(v) && !isHero(v)) {
      try { v.pause(); } catch (e) { /* */ }
      setLiveBadge(v, 'wait');
      showGate(v, false);
      return;
    }

    try {
      var p = v.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {
          setLiveBadge(v, 'play');
          showGate(v, false);
          v.dataset.playing = '1';
          delete v.dataset.playPending;
        }).catch(function () {
          v.dataset.playPending = '1';
          setLiveBadge(v, 'wait');
          showGate(v, true);
        });
      } else {
        var ok = !v.paused;
        setLiveBadge(v, ok ? 'play' : 'wait');
        showGate(v, !ok && isHero(v));
      }
    } catch (e) {
      v.dataset.playPending = '1';
      setLiveBadge(v, 'wait');
      showGate(v, true);
    }
  }

  function allCinema() {
    return document.querySelectorAll(SEL);
  }

  function playAll() {
    allCinema().forEach(tryPlay);
  }

  function wireEvents(v) {
    if (v.dataset.cineWired === '3') return;
    v.dataset.cineWired = '3';
    v.addEventListener('playing', function () {
      setLiveBadge(v, 'play');
      showGate(v, false);
    });
    v.addEventListener('pause', function () {
      if (v.ended) return;
      /* Do not stay paused if something else paused a force-play hero */
      if (isHero(v) && !reduced()) {
        setTimeout(function () { tryPlay(v); }, 120);
      }
      setLiveBadge(v, 'wait');
      if (isHero(v) || v.closest('.media-frame.is-cine')) showGate(v, true);
    });
    v.addEventListener('loadeddata', function () { tryPlay(v); });
    v.addEventListener('canplay', function () { tryPlay(v); });
    v.addEventListener('error', function () {
      setLiveBadge(v, 'wait');
      showGate(v, true);
      var code = (v.error && v.error.code) ? String(v.error.code) : '?';
      v.dataset.cineError = code;
    });
    /* Click video itself to play */
    v.addEventListener('click', function () {
      if (v.paused) tryPlay(v);
    });
  }

  function boot() {
    allCinema().forEach(wireEvents);
    playAll();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting || isHero(v) || isDecorativeBg(v) ||
              v.classList.contains('home-broll') ||
              v.classList.contains('film-broll')) {
            tryPlay(v);
          } else if (!isHero(v) && !isDecorativeBg(v) && !v.classList.contains('home-broll')) {
            try { v.pause(); } catch (e) { /* */ }
          }
        });
      }, { rootMargin: '200px', threshold: 0.01 });
      allCinema().forEach(function (v) { io.observe(v); });
    }

    function unlock() {
      playAll();
    }
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);
    document.addEventListener('touchstart', unlock, { capture: true, passive: true });
    document.addEventListener('click', unlock, true);

    var n = 0;
    var t = setInterval(function () {
      playAll();
      n += 1;
      if (n > 30) clearInterval(t);
    }, 600);

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

    /* After late scripts that pause cinema (reduced-motion blocks on act pages) */
    setTimeout(playAll, 50);
    setTimeout(playAll, 400);
    setTimeout(playAll, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.TENET5CinemaPlay = {
    playAll: playAll,
    arm: arm,
    tryPlay: tryPlay,
    ensureSrc: ensureSrc,
    __v: 3
  };
})();
