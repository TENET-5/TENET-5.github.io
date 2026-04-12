/* ═══════════════════════════════════════════════════════════════════════
   LIRIL Narrator — Cinematic Voice Narration + Synchronized Subtitles
   TENET⁵ Multimedia Documentary System
   ═══════════════════════════════════════════════════════════════════════
   Loads per-page voiceover from audio/{slug}.mp3 + audio/{slug}.vtt
   Floating player with waveform visualizer, subtitle overlay, play/pause.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__LIRIL_NARRATOR_LOADED) return;
  window.__LIRIL_NARRATOR_LOADED = true;

  /* ── Config ──────────────────────────────────────────────────────── */
  var AUDIO_BASE = 'audio/';
  var MANIFEST_URL = 'audio/manifest.json';
  var FADE_MS = 400;

  /* ── Detect page slug from filename ──────────────────────────────── */
  function getSlug() {
    var path = window.location.pathname.split('/').pop() || 'home.html';
    return path.replace('.html', '') || 'home';
  }

  /* ── Create narrator DOM ─────────────────────────────────────────── */
  function buildNarrator() {
    var container = document.createElement('div');
    container.id = 'liril-narrator';
    container.className = 'liril-narrator';
    container.innerHTML =
      '<div class="liril-narrator-inner">' +
        /* Waveform canvas */
        '<canvas class="liril-waveform" id="liril-waveform" width="120" height="40"></canvas>' +
        /* Identity */
        '<div class="liril-narrator-identity">' +
          '<span class="liril-narrator-name">LIRIL</span>' +
          '<span class="liril-narrator-status" id="liril-status">Ready</span>' +
        '</div>' +
        /* Play/Pause button */
        '<button class="liril-play-btn" id="liril-play" aria-label="Play narration">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
            '<path id="liril-play-icon" d="M8 5v14l11-7z"/>' +
          '</svg>' +
        '</button>' +
        /* Progress */
        '<div class="liril-progress-wrap" id="liril-progress-wrap">' +
          '<div class="liril-progress-bar" id="liril-progress-bar"></div>' +
        '</div>' +
        /* Time */
        '<span class="liril-time" id="liril-time">0:00</span>' +
        /* Close */
        '<button class="liril-close-btn" id="liril-close" aria-label="Close narrator">&times;</button>' +
      '</div>' +
      /* Subtitle overlay */
      '<div class="liril-subtitle-overlay" id="liril-subtitle"></div>';

    document.body.appendChild(container);
    return container;
  }

  /* ── Audio + Subtitle Engine ─────────────────────────────────────── */
  function initNarrator(slug, manifest) {
    var entry = manifest[slug];
    if (!entry) return; // No narration for this page

    var el = buildNarrator();
    var audio = new Audio(entry.mp3);
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';

    var playBtn = document.getElementById('liril-play');
    var playIcon = document.getElementById('liril-play-icon');
    var progressBar = document.getElementById('liril-progress-bar');
    var progressWrap = document.getElementById('liril-progress-wrap');
    var timeEl = document.getElementById('liril-time');
    var statusEl = document.getElementById('liril-status');
    var subtitleEl = document.getElementById('liril-subtitle');
    var closeBtn = document.getElementById('liril-close');
    var canvas = document.getElementById('liril-waveform');
    var ctx = canvas.getContext('2d');

    var isPlaying = false;
    var track = null;
    var cues = [];

    /* Load VTT track for subtitles */
    track = document.createElement('track');
    track.kind = 'subtitles';
    track.src = entry.vtt;
    track.srclang = 'en';
    track.label = 'LIRIL Narration';
    track.default = true;
    audio.appendChild(track);

    audio.addEventListener('loadedmetadata', function () {
      if (audio.textTracks && audio.textTracks.length > 0) {
        var textTrack = audio.textTracks[0];
        textTrack.mode = 'hidden'; // We render our own subtitles
        textTrack.addEventListener('cuechange', function () {
          var activeCues = textTrack.activeCues;
          if (activeCues && activeCues.length > 0) {
            subtitleEl.textContent = activeCues[0].text;
            subtitleEl.classList.add('liril-subtitle-visible');
          } else {
            subtitleEl.classList.remove('liril-subtitle-visible');
          }
        });
      }
    });

    /* Play / Pause */
    function togglePlay() {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playIcon.setAttribute('d', 'M8 5v14l11-7z');
        statusEl.textContent = 'Paused';
        el.classList.remove('liril-narrator-playing');
      } else {
        audio.play().then(function () {
          isPlaying = true;
          playIcon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
          statusEl.textContent = 'Narrating';
          el.classList.add('liril-narrator-playing');
        }).catch(function () {
          statusEl.textContent = 'Click to play';
        });
      }
    }

    playBtn.addEventListener('click', togglePlay);

    /* Progress bar update */
    audio.addEventListener('timeupdate', function () {
      if (audio.duration) {
        var pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';
        timeEl.textContent = formatTime(audio.currentTime);
      }
    });

    /* Seek via progress bar click */
    progressWrap.addEventListener('click', function (e) {
      var rect = progressWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    /* Audio ended */
    audio.addEventListener('ended', function () {
      isPlaying = false;
      playIcon.setAttribute('d', 'M8 5v14l11-7z');
      statusEl.textContent = 'Complete';
      el.classList.remove('liril-narrator-playing');
      subtitleEl.classList.remove('liril-subtitle-visible');
    });

    /* Close button */
    closeBtn.addEventListener('click', function () {
      audio.pause();
      el.classList.add('liril-narrator-hidden');
      setTimeout(function () { el.remove(); }, FADE_MS);
    });

    /* Waveform visualizer */
    var audioCtx = null;
    var analyser = null;
    var dataArray = null;
    var animFrameId = null;

    function initWaveform() {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        drawWaveform();
      } catch (e) {
        // AudioContext not available — hide canvas
        canvas.style.display = 'none';
      }
    }

    function drawWaveform() {
      animFrameId = requestAnimationFrame(drawWaveform);
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var barW = canvas.width / dataArray.length;
      var midY = canvas.height / 2;

      for (var i = 0; i < dataArray.length; i++) {
        var v = dataArray[i] / 255;
        var barH = v * midY;
        // Frost cyan gradient
        ctx.fillStyle = isPlaying
          ? 'rgba(136, 192, 208, ' + (0.4 + v * 0.6) + ')'
          : 'rgba(136, 192, 208, 0.2)';
        ctx.fillRect(i * barW, midY - barH, barW - 1, barH * 2);
      }
    }

    /* Auto-init waveform on first play */
    audio.addEventListener('play', function () {
      if (!audioCtx) initWaveform();
    });

    /* Entrance animation */
    requestAnimationFrame(function () {
      el.classList.add('liril-narrator-visible');
    });

    statusEl.textContent = entry.title || 'Ready';
  }

  /* ── Utility ─────────────────────────────────────────────────────── */
  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ── Init: fetch manifest and set up narrator ────────────────────── */
  function init() {
    var slug = getSlug();

    fetch(MANIFEST_URL)
      .then(function (r) { return r.json(); })
      .then(function (manifest) {
        if (manifest[slug]) {
          initNarrator(slug, manifest);
        }
      })
      .catch(function () {
        // No manifest or fetch failed — narrator won't appear
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
