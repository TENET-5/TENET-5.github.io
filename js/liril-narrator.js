/* ═══════════════════════════════════════════════════════════════════════
   LIRIL Narrator v2 — Scroll-Triggered Section + Single File Narration
   TENET⁵ Documentary Voice System
   ═══════════════════════════════════════════════════════════════════════
   SECTION MODE: Pages with [data-narration] elements get per-section
   audio triggered by scroll. Click ▶ to start, then auto on scroll.
   SINGLE MODE: Pages without sections use audio/{slug}.mp3 as before.
   Waveform turns RED in section mode — LIRIL is angry.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__LIRIL_NARRATOR_LOADED) return;
  window.__LIRIL_NARRATOR_LOADED = true;

  var MANIFEST_URL = 'audio/manifest.json';
  var SECTION_BASE = 'audio/sections/';
  var FADE_MS = 400;

  function getSlug() {
    var path = window.location.pathname.split('/').pop() || 'home.html';
    return path.replace('.html', '') || 'home';
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ── Create narrator DOM ───────────────────────────────────────── */
  function buildNarrator() {
    var c = document.createElement('div');
    c.id = 'liril-narrator';
    c.className = 'liril-narrator';
    c.innerHTML =
      '<div class="liril-narrator-inner">' +
        '<canvas class="liril-waveform" id="liril-waveform" width="120" height="40"></canvas>' +
        '<div class="liril-narrator-identity">' +
          '<span class="liril-narrator-name">LIRIL</span>' +
          '<span class="liril-narrator-status" id="liril-status">Ready</span>' +
        '</div>' +
        '<button class="liril-play-btn" id="liril-play" aria-label="Play narration">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
            '<path id="liril-play-icon" d="M8 5v14l11-7z"/>' +
          '</svg>' +
        '</button>' +
        '<div class="liril-progress-wrap" id="liril-progress-wrap">' +
          '<div class="liril-progress-bar" id="liril-progress-bar"></div>' +
        '</div>' +
        '<span class="liril-time" id="liril-time">0:00</span>' +
        '<button class="liril-close-btn" id="liril-close" aria-label="Close narrator">&times;</button>' +
      '</div>' +
      '<div class="liril-subtitle-overlay" id="liril-subtitle"></div>';
    document.body.appendChild(c);
    return c;
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION MODE — Scroll-triggered per-section angry narration
     ═══════════════════════════════════════════════════════════════════ */
  function initSectionMode(slug) {
    var sections = document.querySelectorAll('[data-narration]');
    var el = buildNarrator();
    var audio = new Audio();
    audio.preload = 'auto';

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

    var currentId = null;
    var completed = {};
    var isPlaying = false;
    var userPaused = false;
    var hasInteracted = false;
    var pendingSection = null;
    var audioCtx, analyser, sourceNode, dataArray;

    /* AudioContext for waveform — RED bars when angry */
    function initAudioCtx() {
      if (audioCtx) return;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        sourceNode = audioCtx.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        renderWaveform();
      } catch (e) { canvas.style.display = 'none'; }
    }

    function renderWaveform() {
      requestAnimationFrame(renderWaveform);
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var barW = canvas.width / dataArray.length;
      var midY = canvas.height / 2;
      for (var i = 0; i < dataArray.length; i++) {
        var v = dataArray[i] / 255;
        var barH = v * midY;
        /* RED waveform — LIRIL is angry */
        ctx.fillStyle = isPlaying
          ? 'rgba(191, 97, 106, ' + (0.4 + v * 0.6) + ')'
          : 'rgba(136, 192, 208, 0.2)';
        ctx.fillRect(i * barW, midY - barH, barW - 1, barH * 2);
      }
    }

    /* Subtitle sync — fires on each new audio load */
    audio.addEventListener('loadedmetadata', function () {
      if (!audio.textTracks || !audio.textTracks.length) return;
      for (var i = 0; i < audio.textTracks.length; i++)
        audio.textTracks[i].mode = 'hidden';
      var tt = audio.textTracks[audio.textTracks.length - 1];
      tt.oncuechange = function () {
        var cues = tt.activeCues;
        if (cues && cues.length > 0) {
          subtitleEl.textContent = cues[0].text;
          subtitleEl.classList.add('liril-subtitle-visible');
        } else {
          subtitleEl.classList.remove('liril-subtitle-visible');
        }
      };
    });

    /* Play a specific section's narration */
    function playSection(id) {
      if (currentId === id || userPaused || completed[id]) return;

      /* Remove narrating class from previous (interrupted — not completed) */
      if (currentId) {
        var prev = document.querySelector('[data-narration="' + currentId + '"]');
        if (prev) prev.classList.remove('tl-narrating');
      }

      audio.pause();
      while (audio.firstChild) audio.removeChild(audio.firstChild);

      currentId = id;
      var section = document.querySelector('[data-narration="' + id + '"]');
      if (section) section.classList.add('tl-narrating');

      /* Set audio source */
      audio.src = SECTION_BASE + slug + '-' + id + '.mp3';
      var track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = SECTION_BASE + slug + '-' + id + '.vtt';
      track.srclang = 'en';
      track.default = true;
      audio.appendChild(track);
      audio.load();

      initAudioCtx();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

      audio.play().then(function () {
        isPlaying = true;
        playIcon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
        statusEl.textContent = 'Listen.';
        el.classList.add('liril-narrator-playing', 'liril-narrator-angry');
      }).catch(function () {
        statusEl.textContent = 'Click \u25b6 to hear the truth';
      });
    }

    /* Progress bar */
    audio.addEventListener('timeupdate', function () {
      if (audio.duration) {
        progressBar.style.width = (audio.currentTime / audio.duration * 100) + '%';
        timeEl.textContent = formatTime(audio.currentTime);
      }
    });

    /* Seek */
    progressWrap.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progressWrap.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    /* Audio completed — mark section as heard */
    audio.addEventListener('ended', function () {
      if (currentId) {
        completed[currentId] = true;
        var sec = document.querySelector('[data-narration="' + currentId + '"]');
        if (sec) { sec.classList.remove('tl-narrating'); sec.classList.add('tl-narrated'); }
      }
      isPlaying = false;
      currentId = null;
      playIcon.setAttribute('d', 'M8 5v14l11-7z');
      statusEl.textContent = 'Keep scrolling.';
      el.classList.remove('liril-narrator-playing');
      subtitleEl.classList.remove('liril-subtitle-visible');
    });

    /* Audio error — degrade gracefully */
    audio.addEventListener('error', function () {
      if (currentId) {
        var sec = document.querySelector('[data-narration="' + currentId + '"]');
        if (sec) sec.classList.remove('tl-narrating');
      }
      currentId = null;
      isPlaying = false;
    });

    /* Play / Pause toggle */
    playBtn.addEventListener('click', function () {
      /* First click unlocks autoplay */
      if (!hasInteracted) {
        hasInteracted = true;
        userPaused = false;
        if (pendingSection && !completed[pendingSection]) {
          playSection(pendingSection);
        }
        return;
      }
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        userPaused = true;
        playIcon.setAttribute('d', 'M8 5v14l11-7z');
        statusEl.textContent = 'Paused';
        el.classList.remove('liril-narrator-playing');
      } else if (userPaused) {
        userPaused = false;
        if (currentId) {
          audio.play();
          isPlaying = true;
          playIcon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
          statusEl.textContent = 'Listen.';
          el.classList.add('liril-narrator-playing');
        } else {
          statusEl.textContent = 'Keep scrolling.';
        }
      }
    });

    /* Close */
    closeBtn.addEventListener('click', function () {
      audio.pause();
      observer.disconnect();
      el.classList.add('liril-narrator-hidden');
      setTimeout(function () { el.remove(); }, FADE_MS);
    });

    /* Scroll observer — triggers narration when sections enter viewport */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('data-narration');
          if (hasInteracted && !completed[id] && !userPaused) {
            playSection(id);
          } else if (!hasInteracted) {
            pendingSection = id;
          }
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -15% 0px' });

    sections.forEach(function (s) { observer.observe(s); });

    /* Entrance animation */
    requestAnimationFrame(function () { el.classList.add('liril-narrator-visible'); });
    statusEl.textContent = 'Press \u25b6 to hear the truth';
  }

  /* ═══════════════════════════════════════════════════════════════════
     SINGLE FILE MODE — one audio per page (existing behavior)
     ═══════════════════════════════════════════════════════════════════ */
  function initSingleMode(slug, manifest) {
    var entry = manifest[slug];
    if (!entry) return;

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

    var track = document.createElement('track');
    track.kind = 'subtitles';
    track.src = entry.vtt;
    track.srclang = 'en';
    track.default = true;
    audio.appendChild(track);

    audio.addEventListener('loadedmetadata', function () {
      if (audio.textTracks && audio.textTracks.length > 0) {
        var tt = audio.textTracks[0];
        tt.mode = 'hidden';
        tt.addEventListener('cuechange', function () {
          var cues = tt.activeCues;
          if (cues && cues.length > 0) {
            subtitleEl.textContent = cues[0].text;
            subtitleEl.classList.add('liril-subtitle-visible');
          } else {
            subtitleEl.classList.remove('liril-subtitle-visible');
          }
        });
      }
    });

    playBtn.addEventListener('click', function () {
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
          statusEl.textContent = 'Listen.';
          el.classList.add('liril-narrator-playing');
        }).catch(function () { statusEl.textContent = 'Click to play'; });
      }
    });

    audio.addEventListener('timeupdate', function () {
      if (audio.duration) {
        progressBar.style.width = (audio.currentTime / audio.duration) * 100 + '%';
        timeEl.textContent = formatTime(audio.currentTime);
      }
    });

    progressWrap.addEventListener('click', function (e) {
      var rect = progressWrap.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    audio.addEventListener('ended', function () {
      isPlaying = false;
      playIcon.setAttribute('d', 'M8 5v14l11-7z');
      statusEl.textContent = 'Now you know.';
      el.classList.remove('liril-narrator-playing');
      subtitleEl.classList.remove('liril-subtitle-visible');
    });

    closeBtn.addEventListener('click', function () {
      audio.pause();
      el.classList.add('liril-narrator-hidden');
      setTimeout(function () { el.remove(); }, FADE_MS);
    });

    var audioCtx, analyser, dataArray;
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
      } catch (e) { canvas.style.display = 'none'; }
    }
    function drawWaveform() {
      requestAnimationFrame(drawWaveform);
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var barW = canvas.width / dataArray.length;
      var midY = canvas.height / 2;
      for (var i = 0; i < dataArray.length; i++) {
        var v = dataArray[i] / 255;
        var barH = v * midY;
        ctx.fillStyle = isPlaying
          ? 'rgba(136, 192, 208, ' + (0.4 + v * 0.6) + ')'
          : 'rgba(136, 192, 208, 0.2)';
        ctx.fillRect(i * barW, midY - barH, barW - 1, barH * 2);
      }
    }
    audio.addEventListener('play', function () { if (!audioCtx) initWaveform(); });

    requestAnimationFrame(function () { el.classList.add('liril-narrator-visible'); });
    statusEl.textContent = entry.title || 'Ready';
  }

  /* ── Init: detect mode and set up ────────────────────────────────── */
  function init() {
    var slug = getSlug();
    if (document.querySelectorAll('[data-narration]').length > 0) {
      initSectionMode(slug);
    } else {
      fetch(MANIFEST_URL)
        .then(function (r) { return r.json(); })
        .then(function (manifest) { if (manifest[slug]) initSingleMode(slug, manifest); })
        .catch(function () {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
