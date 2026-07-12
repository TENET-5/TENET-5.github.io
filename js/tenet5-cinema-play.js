/* TENET5 cinema force-play — sitewide film / gallery / page bg.
 * v4: Ken Burns class on still-frame encodes; direct src + load(); hero force-play;
 *      click-to-play gate; absolute root-relative media paths; reduced-motion race kill.
 * Muted + loop + playsinline. Retries after load, visibility, and first gesture.
 */
(function () {
  'use strict';
  if (window.TENET5CinemaPlay && window.TENET5CinemaPlay.__v >= 4) return;

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

  /** Tag likely still-frame encodes so CSS Ken Burns always drifts the picture. */
  function markStillRisk(v) {
    if (!v) return;
    try {
      var dur = Number(v.duration);
      // Frozen stills were shipped as long durations with almost no bitrate;
      // after load, tiny decoded frame rate or zero seekable change → still risk.
      if (isFinite(dur) && dur > 8 && v.videoWidth > 0) {
        // Sample: if current frame never changes, browser still advances time.
        // Heuristic: very short buffered ranges after canplay often = static encode.
        var br = 0;
        try {
          if (v.buffered && v.buffered.length) {
            br = v.buffered.end(0) - v.buffered.start(0);
          }
        } catch (e0) { /* */ }
        if (br > 0 && br < 0.05 && dur > 20) {
          v.classList.add('is-still-encode');
          v.dataset.stillEncode = '1';
        }
      }
      // Always apply motion class for decorative cinema (CSS handles animation)
      if (isDecorativeBg(v) || isHero(v) || v.hasAttribute('data-force-play')) {
        v.classList.add('tenet5-ken-burns');
      }
    } catch (e) { /* */ }
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
    markStillRisk(v);
    /* Hero / forced: native controls so user can always start playback */
    if (isHero(v) && !v.hasAttribute('data-no-controls')) {
      v.setAttribute('controls', '');
      v.controls = true;
    }
  }

  function setLiveBadge(v, state) {
    // Disabled per user request (no reason to show film playing)
    return;
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
    v.addEventListener('loadeddata', function () { markStillRisk(v); tryPlay(v); });
    v.addEventListener('canplay', function () { markStillRisk(v); tryPlay(v); });
    v.addEventListener('loadedmetadata', function () { markStillRisk(v); });
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
    markStillRisk: markStillRisk,
    __v: 4
  };
})();
