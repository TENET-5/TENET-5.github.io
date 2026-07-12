/**
 * TENET5 broadcast ticker ↔ video phase lock
 *
 * Doctrine: web ticker must perfectly overlap the ticker burned into desk video.
 * Scroll physics match ffmpeg burn: x = w - mod(t * SCROLL_PX_PER_S, w + tw)
 * Web uses translateX(-(t * SPEED) % loopW) on a doubled string (loopW = half width).
 *
 * Desync of text hash or scroll phase = first hallucination indicator.
 *
 * Data: data/broadcast_ticker_slate.json
 * Constants MUST match tools/broadcast_ticker_slate.py SCROLL_PX_PER_S
 */
(function () {
  'use strict';
  if (window.TENET5_TICKER_SYNC && window.TENET5_TICKER_SYNC.__v >= 2) return;

  var SPEED = 80; /* px/s — LOCKED with Python / ffmpeg */
  var slate = null;
  var loopW = 0;
  var raf = 0;
  var lastHashOk = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function tickerRoot() {
    return document.querySelector('.broadcast-ticker[data-ticker-sync]')
      || document.querySelector('#broadcast-ticker')
      || document.querySelector('.broadcast-ticker');
  }

  function tickerSpan(root) {
    if (!root) return null;
    return root.querySelector('span') || root;
  }

  function videoEl() {
    return document.getElementById('tls-video')
      || document.getElementById('news-air-video')
      || document.querySelector('.tls-frame video')
      || document.querySelector('#news-air video');
  }

  function setStatus(ok, detail) {
    var root = tickerRoot();
    if (!root) return;
    root.classList.toggle('is-locked', !!ok);
    root.classList.toggle('is-desync', ok === false);
    root.setAttribute('data-sync-state', ok === true ? 'LOCK' : ok === false ? 'DESYNC' : 'STANDBY');
    if (detail) root.setAttribute('data-sync-detail', detail);
    lastHashOk = ok;
    try {
      window.dispatchEvent(new CustomEvent('tenet5-ticker-sync', {
        detail: { ok: ok, detail: detail, hash: slate && slate.hash }
      }));
    } catch (e) { /* */ }
  }

  function measureLoop(span) {
    if (!span) return 0;
    /* full_line is doubled unit — one cycle is half scrollWidth */
    var w = span.scrollWidth || span.offsetWidth || 0;
    return w > 0 ? w / 2 : 0;
  }

  function applyText(root, span, fullLine) {
    if (!span || !fullLine) return;
    if (span.textContent !== fullLine) {
      span.textContent = fullLine;
    }
    root.setAttribute('data-ticker-hash', (slate && slate.hash) || '');
    root.setAttribute('data-scroll-px-s', String(SPEED));
    /* kill CSS free-run animation — JS owns phase */
    span.style.animation = 'none';
    loopW = measureLoop(span);
  }

  function phaseTime() {
    var v = videoEl();
    if (v && isFinite(v.currentTime) && v.readyState >= 1) {
      /* Prefer video clock whenever media has a timeline (playing or paused on a frame) */
      if (!v.paused || v.currentTime > 0.05) {
        return v.currentTime;
      }
    }
    /* Free-run only when no active desk video — still same speed so join is smooth */
    return (performance.now() / 1000);
  }

  function paint() {
    var root = tickerRoot();
    var span = tickerSpan(root);
    if (!root || !span) {
      raf = requestAnimationFrame(paint);
      return;
    }
    /* Full content width (doubled line) — matches ffmpeg text_w (tw) for one draw string */
    var tw = span.scrollWidth || 0;
    var w = root.clientWidth || 0;
    if (!tw || !w) {
      raf = requestAnimationFrame(paint);
      return;
    }
    loopW = tw / 2; /* one cycle of unit content (full_line is doubled) */
    var t = phaseTime();
    /*
     * ffmpeg: x = w - mod(t * SPEED, w + tw)
     * Web equivalent on a left-origin span: shift so the same glyphs track the burn-in.
     * Using half-width loop (seamless doubled string):
     *   x = -((t * SPEED) % loopW)
     * Phase zero: t=0 → x=0; burn-in at t=0 has text entering from right — close enough
     * for continuous scroll; hash equality is the hard gate, phase is visual.
     */
    var period = loopW > 0 ? loopW : (w + tw);
    var x = -((t * SPEED) % period);
    if (!isFinite(x)) x = 0;
    span.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    span.style.willChange = 'transform';

    /* Hallucination cue: if slate hash present on DOM mismatches loaded slate */
    var domHash = root.getAttribute('data-ticker-hash') || '';
    if (slate && slate.hash && domHash && domHash !== slate.hash) {
      setStatus(false, 'hash_mismatch');
    } else if (slate && slate.hash) {
      setStatus(true, 'phase_lock');
    }

    raf = requestAnimationFrame(paint);
  }

  function loadSlate(cb) {
    var root = tickerRoot();
    var url = (root && root.getAttribute('data-ticker-slate')) || 'data/broadcast_ticker_slate.json';
    /* relative to page */
    fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.full_line) {
          slate = j;
          if (typeof j.scroll_px_per_s === 'number' && j.scroll_px_per_s > 0) {
            SPEED = j.scroll_px_per_s;
          }
          var root2 = tickerRoot();
          var span = tickerSpan(root2);
          if (root2 && span) applyText(root2, span, j.full_line);
          setStatus(true, 'slate_loaded');
        } else {
          /* Use existing DOM text; still phase-lock scroll */
          var r = tickerRoot();
          var s = tickerSpan(r);
          if (r && s) {
            s.style.animation = 'none';
            loopW = measureLoop(s);
          }
          setStatus(null, 'slate_missing');
        }
        if (cb) cb();
      })
      .catch(function () {
        setStatus(null, 'slate_fetch_fail');
        if (cb) cb();
      });
  }

  function bindVideoHashCheck() {
    var v = videoEl();
    if (!v) return;
    /* Optional: video elements may carry data-ticker-hash from build */
    function check() {
      var vh = v.getAttribute('data-ticker-hash') || '';
      if (vh && slate && slate.hash && vh !== slate.hash) {
        setStatus(false, 'video_hash_desync');
      }
    }
    v.addEventListener('loadedmetadata', check);
    v.addEventListener('play', check);
    check();
  }

  function mountOverlay() {
    /* Ensure ticker sits on the video frame bottom so it overlaps burn-in */
    var frame = document.querySelector('.tls-frame');
    var root = tickerRoot();
    if (!frame || !root) return;
    if (root.parentElement !== frame) {
      frame.appendChild(root);
    }
    root.classList.add('is-overlay', 'is-sync');
    root.removeAttribute('aria-hidden');
    root.setAttribute('aria-label', 'Desk ticker — phase-locked to video');
  }

  function start() {
    mountOverlay();
    loadSlate(function () {
      bindVideoHashCheck();
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.TENET5_TICKER_SYNC = {
    __v: 2,
    speed: function () { return SPEED; },
    slate: function () { return slate; },
    ok: function () { return lastHashOk; },
    reload: loadSlate,
    /** Hallucination probe: compare slate hash to video data-ticker-hash */
    probe: function () {
      var v = videoEl();
      var vh = v ? (v.getAttribute('data-ticker-hash') || '') : '';
      var sh = slate && slate.hash ? slate.hash : '';
      return {
        locked: lastHashOk === true,
        slate_hash: sh,
        video_hash: vh,
        match: !!(sh && vh && sh === vh),
        speed: SPEED
      };
    }
  };
})();
