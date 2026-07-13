/* TENET5 hybrid documentary player v5 — VIDEO ONLY audio
 *
 * Daniel 2026-07-12: one mic. Sound comes only from the <video> the user plays.
 * - No separate data-doc-audio MP3 dual-play
 * - No browser TTS / LIRIL_VOICE narrate beats
 * - Prefer *_mux.mp4 (VO baked in); otherwise silent film until user unmutes
 * - Requires user Play; no force-play with sound
 */
(function () {
  'use strict';
  if (window.TENET5DocPlayer && window.TENET5DocPlayer.__v >= 5) return;

  var PLAYERS = [];

  function bus() {
    if (!window.TENET5AudioBus) {
      window.TENET5AudioBus = {
        owner: null,
        docPlaying: false,
        claim: function (who) {
          this.owner = who || null;
          this.docPlaying = who === 'doc';
          window.__TENET5_DOC_ON_AIR = this.docPlaying;
        },
        release: function (who) {
          if (!who || this.owner === who) {
            this.owner = null;
            this.docPlaying = false;
            window.__TENET5_DOC_ON_AIR = false;
          }
        },
        stopNonDoc: function () {
          try {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
          } catch (e) { /* */ }
        },
        pauseAllDocs: function () {
          for (var i = 0; i < PLAYERS.length; i++) {
            try {
              if (PLAYERS[i] && PLAYERS[i].pauseQuiet) PLAYERS[i].pauseQuiet();
            } catch (e) { /* */ }
          }
          this.release('doc');
        }
      };
    }
    return window.TENET5AudioBus;
  }

  function clean(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (!n || s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }

  function isMuxSrc(src) {
    return !!(src && /_mux\.mp4/i.test(String(src)));
  }

  function mount(root) {
    if (!root || root.dataset.docMounted) return;
    root.dataset.docMounted = '1';
    root.classList.add('doc-hybrid');

    var videoSrc = root.getAttribute('data-doc-video') || '';
    // IGNORED by design — no dual MP3 VO
    // var audioSrc = root.getAttribute('data-doc-audio') || '';
    var vttUrl = root.getAttribute('data-doc-vtt') || '';
    var poster = root.getAttribute('data-doc-poster') || '';
    var title = root.getAttribute('data-doc-title') || 'Documentary stage';
    var caption =
      root.getAttribute('data-doc-caption') ||
      'Film. Sound is in the video file when you press play. Powered by LIRIL AI — you verify.';

    var muxed = isMuxSrc(videoSrc);
    var state = {
      soundOn: false,
      userPlayed: false,
      productMux: muxed
    };

    var frame = document.createElement('div');
    frame.className = 'doc-stage-frame';

    var v = document.createElement('video');
    v.className = 'doc-stage-video';
    v.setAttribute('controls', '');
    v.controls = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'metadata';
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.loop = root.hasAttribute('data-doc-loop');
    if (poster) v.setAttribute('poster', poster);
    if (videoSrc) {
      v.src = videoSrc;
      var s = document.createElement('source');
      s.src = videoSrc;
      s.type = 'video/mp4';
      v.appendChild(s);
    }
    if (vttUrl) {
      var tr = document.createElement('track');
      tr.kind = 'captions';
      tr.srclang = 'en-CA';
      tr.label = 'Captions';
      tr.src = vttUrl;
      tr.default = true;
      v.appendChild(tr);
    }

    var chrome = document.createElement('div');
    chrome.className = 'doc-stage-chrome';
    var btnPlay = document.createElement('button');
    btnPlay.type = 'button';
    btnPlay.className = 'doc-btn doc-btn-play';
    btnPlay.textContent = 'Play';
    var btnSound = document.createElement('button');
    btnSound.type = 'button';
    btnSound.className = 'doc-btn doc-btn-sound';
    btnSound.textContent = muxed ? 'Sound · Off (tap after play)' : 'Sound · Off';
    var cap = document.createElement('p');
    cap.className = 'doc-stage-caption';
    cap.textContent = caption;

    chrome.appendChild(btnPlay);
    chrome.appendChild(btnSound);
    frame.appendChild(v);
    frame.appendChild(chrome);
    root.appendChild(frame);
    root.appendChild(cap);

    function setPlaying(on) {
      btnPlay.textContent = on ? 'Pause' : 'Play';
      root.classList.toggle('is-playing', on);
    }

    function unmuteProduct() {
      v.dataset.userUnmuted = '1';
      try {
        v.muted = false;
        v.defaultMuted = false;
        v.removeAttribute('muted');
        v.volume = 1;
      } catch (e0) { /* */ }
    }

    function playAll() {
      state.userPlayed = true;
      bus().stopNonDoc();
      bus().claim('doc');
      // Stay muted until user explicitly hits Sound
      if (state.soundOn) unmuteProduct();
      else {
        v.muted = true;
        v.setAttribute('muted', '');
      }
      var p = v.play();
      if (p && p.catch) {
        p.catch(function () {
          v.muted = true;
          setPlaying(false);
        });
      }
      setPlaying(true);
    }

    function pauseQuiet() {
      try { v.pause(); } catch (e) { /* */ }
      setPlaying(false);
    }

    function pauseAll() {
      pauseQuiet();
      bus().release('doc');
    }

    btnPlay.addEventListener('click', function () {
      if (v.paused) playAll();
      else pauseAll();
    });

    btnSound.addEventListener('click', function () {
      if (!state.userPlayed && v.paused) {
        // Require play first — sound alone shouldn't auto-start VO stack
        state.soundOn = true;
        playAll();
      } else {
        state.soundOn = !state.soundOn;
      }
      btnSound.textContent = state.soundOn
        ? (muxed ? 'Sound · On (video VO)' : 'Sound · On')
        : 'Sound · Off';
      btnSound.classList.toggle('on', state.soundOn);
      if (state.soundOn) {
        bus().stopNonDoc();
        unmuteProduct();
        bus().claim('doc');
        if (v.paused) playAll();
      } else {
        v.muted = true;
        v.setAttribute('muted', '');
        v.dataset.userUnmuted = '';
      }
    });

    v.addEventListener('play', function () {
      state.userPlayed = true;
      bus().claim('doc');
      bus().stopNonDoc();
      setPlaying(true);
    });
    v.addEventListener('pause', function () {
      if (!v.ended) setPlaying(false);
    });
    v.addEventListener('ended', function () {
      if (!v.loop) {
        pauseAll();
      }
    });

    // Never honor data-force-play with sound
    root.removeAttribute('data-force-play');

    var api = {
      pauseQuiet: pauseQuiet,
      play: playAll,
      pause: pauseAll,
      video: v,
      title: title
    };
    PLAYERS.push(api);
    root._tenet5Doc = api;
  }

  function scan() {
    var nodes = document.querySelectorAll(
      '.doc-stage[data-doc-video], [data-doc-video].doc-stage, section.doc-stage'
    );
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getAttribute('data-doc-video')) mount(nodes[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  window.TENET5DocPlayer = {
    __v: 5,
    scan: scan,
    pauseAll: function () {
      bus().pauseAllDocs();
    }
  };
})();
