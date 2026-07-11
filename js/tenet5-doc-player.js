/* TENET5 hybrid documentary player — video + optional page narration audio.
 * Primary product surface for MAID argument / report hybrid experiences.
 * Atmosphere film is not proof. Audio is page guide (LIRIL-compatible).
 * v1
 */
(function () {
  'use strict';
  if (window.TENET5DocPlayer && window.TENET5DocPlayer.__v >= 1) return;

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function armVideo(v) {
    if (!v) return;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload = 'auto';
    /* default muted for autoplay policy; user can unmute for hybrid */
    if (!v.dataset.userUnmuted) {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
    }
  }

  function mount(root) {
    if (!root || root.dataset.docMounted) return;
    root.dataset.docMounted = '1';

    var videoSrc = root.getAttribute('data-doc-video') || '';
    var audioSrc = root.getAttribute('data-doc-audio') || '';
    var poster = root.getAttribute('data-doc-poster') || '';
    var title = root.getAttribute('data-doc-title') || 'Documentary stage';
    var caption = root.getAttribute('data-doc-caption') ||
      'Film atmosphere stitched for this record. Primary sources remain in the text and links.';

    var frame = document.createElement('div');
    frame.className = 'doc-stage-frame';

    var v = document.createElement('video');
    v.className = 'doc-stage-video';
    v.setAttribute('controls', '');
    v.controls = true;
    v.loop = root.hasAttribute('data-doc-loop');
    if (poster) v.setAttribute('poster', poster);
    if (videoSrc) {
      v.src = videoSrc;
      var s = document.createElement('source');
      s.src = videoSrc;
      s.type = 'video/mp4';
      v.appendChild(s);
    }
    armVideo(v);

    var badge = document.createElement('span');
    badge.className = 'doc-stage-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = 'Documentary';

    var controls = document.createElement('div');
    controls.className = 'doc-stage-bar';

    var btnPlay = document.createElement('button');
    btnPlay.type = 'button';
    btnPlay.className = 'doc-stage-btn';
    btnPlay.textContent = 'Play film';

    var btnSound = document.createElement('button');
    btnSound.type = 'button';
    btnSound.className = 'doc-stage-btn';
    btnSound.textContent = audioSrc ? 'Sound · Off' : 'Unmute film';
    btnSound.disabled = !audioSrc && true;

    var status = document.createElement('span');
    status.className = 'doc-stage-status';
    status.textContent = title;

    var audio = null;
    if (audioSrc) {
      audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = audioSrc;
      audio.setAttribute('playsinline', '');
      root.appendChild(audio);
      btnSound.disabled = false;
    }

    var soundOn = false;

    function setPlaying(on) {
      badge.textContent = on ? 'Playing' : 'Documentary';
      badge.setAttribute('data-state', on ? 'play' : 'wait');
      btnPlay.textContent = on ? 'Pause' : 'Play film';
    }

    function playAll() {
      armVideo(v);
      if (reduced() && !root.hasAttribute('data-force-play')) {
        /* stills-only path: leave poster, allow manual play */
      }
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      if (soundOn && audio) {
        try {
          audio.currentTime = Math.min(audio.currentTime || 0, v.currentTime || 0);
          var ap = audio.play();
          if (ap && ap.catch) ap.catch(function () {});
        } catch (e) { /* */ }
      }
      setPlaying(true);
    }

    function pauseAll() {
      try { v.pause(); } catch (e) { /* */ }
      if (audio) try { audio.pause(); } catch (e2) { /* */ }
      setPlaying(false);
    }

    btnPlay.addEventListener('click', function () {
      if (v.paused) playAll();
      else pauseAll();
    });

    btnSound.addEventListener('click', function () {
      soundOn = !soundOn;
      if (audio) {
        btnSound.textContent = soundOn ? 'Sound · On' : 'Sound · Off';
        if (soundOn && !v.paused) {
          try {
            var ap = audio.play();
            if (ap && ap.catch) ap.catch(function () {});
          } catch (e) { /* */ }
        } else if (audio) {
          try { audio.pause(); } catch (e2) { /* */ }
        }
      } else {
        /* unmute the film itself */
        v.dataset.userUnmuted = soundOn ? '1' : '';
        v.muted = !soundOn;
        btnSound.textContent = soundOn ? 'Film audio · On' : 'Unmute film';
      }
    });

    v.addEventListener('play', function () { setPlaying(true); });
    v.addEventListener('pause', function () {
      if (audio) try { audio.pause(); } catch (e) { /* */ }
      setPlaying(false);
    });
    v.addEventListener('timeupdate', function () {
      if (audio && soundOn && Math.abs((audio.currentTime || 0) - (v.currentTime || 0)) > 0.45) {
        try { audio.currentTime = v.currentTime; } catch (e) { /* */ }
      }
    });

    frame.appendChild(v);
    frame.appendChild(badge);
    controls.appendChild(btnPlay);
    controls.appendChild(btnSound);
    controls.appendChild(status);

    var cap = document.createElement('p');
    cap.className = 'doc-stage-cap';
    cap.textContent = caption;

    root.appendChild(frame);
    root.appendChild(controls);
    root.appendChild(cap);

    /* Auto-start muted film when in view (hybrid sound stays user-gated) */
    if ('IntersectionObserver' in window && !reduced()) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            armVideo(v);
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } else {
            try { v.pause(); } catch (e) { /* */ }
            if (audio) try { audio.pause(); } catch (e2) { /* */ }
          }
        });
      }, { threshold: 0.35 });
      io.observe(root);
    }
  }

  function boot() {
    document.querySelectorAll('[data-doc-video]').forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.TENET5DocPlayer = { mount: mount, boot: boot, __v: 1 };
})();
