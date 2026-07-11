/* TENET5 hybrid documentary player v2
 * Film + LIRIL narration + on-screen text + interactive chapter navigation.
 * Matches site structure: acts / stages / sources. Atmosphere is not proof.
 *
 * data-doc-video, data-doc-audio?, data-doc-manifest?, data-doc-vtt?,
 * data-doc-poster?, data-doc-title?, data-doc-caption?, data-doc-loop, data-force-play
 */
(function () {
  'use strict';
  if (window.TENET5DocPlayer && window.TENET5DocPlayer.__v >= 2) return;

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function clean(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (!n || s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }

  function parseVtt(text) {
    var cues = [];
    if (!text) return cues;
    var blocks = String(text).replace(/\r/g, '').split(/\n\n+/);
    for (var i = 0; i < blocks.length; i++) {
      var lines = blocks[i].split('\n').filter(function (l) { return l && l.indexOf('WEBVTT') !== 0 && !/^\d+$/.test(l.trim()); });
      if (!lines.length) continue;
      var timeLine = null;
      var body = [];
      for (var j = 0; j < lines.length; j++) {
        if (lines[j].indexOf('-->') >= 0) timeLine = lines[j];
        else body.push(lines[j]);
      }
      if (!timeLine || !body.length) continue;
      var m = timeLine.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
      if (!m) {
        m = timeLine.match(/(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2})\.(\d{3})/);
        if (m) {
          cues.push({
            start: (+m[1]) * 60 + (+m[2]) + (+m[3]) / 1000,
            end: (+m[4]) * 60 + (+m[5]) + (+m[6]) / 1000,
            text: body.join(' ')
          });
        }
        continue;
      }
      cues.push({
        start: (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000,
        end: (+m[5]) * 3600 + (+m[6]) * 60 + (+m[7]) + (+m[8]) / 1000,
        text: body.join(' ')
      });
    }
    return cues;
  }

  function fetchText(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .catch(function () { return ''; });
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function armVideo(v) {
    if (!v) return;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload = 'auto';
    if (!v.dataset.userUnmuted) {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
    }
  }

  function speakLiril(text, force) {
    if (!text) return false;
    if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.speak !== 'function') return false;
    if (window.__LIRIL_MUTED === true && !force) return false;
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) { /* */ }
    return !!window.LIRIL_VOICE.speak(text, {});
  }

  function stopSpeak() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) { /* */ }
  }

  function mount(root) {
    if (!root || root.dataset.docMounted) return;
    root.dataset.docMounted = '1';
    root.classList.add('doc-hybrid');

    var videoSrc = root.getAttribute('data-doc-video') || '';
    var audioSrc = root.getAttribute('data-doc-audio') || '';
    var manifestUrl = root.getAttribute('data-doc-manifest') || '';
    var vttUrl = root.getAttribute('data-doc-vtt') || '';
    var poster = root.getAttribute('data-doc-poster') || '';
    var title = root.getAttribute('data-doc-title') || 'Documentary stage';
    var caption = root.getAttribute('data-doc-caption') ||
      'Film atmosphere. Primary sources remain in the text and links. Powered by LIRIL AI — you verify.';

    var state = {
      beats: [],
      cues: [],
      beatIndex: -1,
      soundOn: false,
      narrateBeats: true,
      lastSpokenBeat: -1
    };

    /* ── DOM ── */
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

    /* On-screen lower third */
    var lower = document.createElement('div');
    lower.className = 'doc-stage-lower';
    lower.setAttribute('aria-live', 'polite');
    lower.innerHTML =
      '<span class="doc-lower-kicker"></span>' +
      '<strong class="doc-lower-title"></strong>' +
      '<p class="doc-lower-text"></p>';

    var badge = document.createElement('span');
    badge.className = 'doc-stage-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = 'Hybrid documentary';

    var controls = document.createElement('div');
    controls.className = 'doc-stage-bar';

    var btnPlay = document.createElement('button');
    btnPlay.type = 'button';
    btnPlay.className = 'doc-stage-btn';
    btnPlay.textContent = 'Play film';

    var btnSound = document.createElement('button');
    btnSound.type = 'button';
    btnSound.className = 'doc-stage-btn doc-stage-btn-ghost';
    btnSound.textContent = 'Narration · Off';
    btnSound.title = 'LIRIL narration + page audio when available';

    var btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.className = 'doc-stage-btn doc-stage-btn-ghost';
    btnPrev.textContent = '← Chapter';
    btnPrev.disabled = true;

    var btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.className = 'doc-stage-btn doc-stage-btn-ghost';
    btnNext.textContent = 'Chapter →';
    btnNext.disabled = true;

    var status = document.createElement('span');
    status.className = 'doc-stage-status';
    status.textContent = title;

    var openLink = document.createElement('a');
    openLink.className = 'doc-stage-open';
    openLink.href = '#';
    openLink.hidden = true;
    openLink.textContent = 'Open sources →';

    var chapters = document.createElement('nav');
    chapters.className = 'doc-stage-chapters';
    chapters.setAttribute('aria-label', 'Documentary chapters');

    var audio = null;
    if (audioSrc) {
      audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = audioSrc;
      audio.setAttribute('playsinline', '');
      root.appendChild(audio);
    }

    var cap = document.createElement('p');
    cap.className = 'doc-stage-cap';
    cap.textContent = caption;

    function setPlaying(on) {
      badge.textContent = on ? (state.soundOn ? 'On air · hybrid' : 'Playing · silent film') : 'Hybrid documentary';
      badge.setAttribute('data-state', on ? 'play' : 'wait');
      btnPlay.textContent = on ? 'Pause' : 'Play film';
    }

    function paintLower(titleT, textT, kicker) {
      var k = lower.querySelector('.doc-lower-kicker');
      var t = lower.querySelector('.doc-lower-title');
      var p = lower.querySelector('.doc-lower-text');
      if (k) k.textContent = kicker || 'LIRIL · on screen';
      if (t) t.textContent = titleT || '';
      if (p) p.textContent = textT || '';
      lower.classList.toggle('empty', !titleT && !textT);
    }

    function paintChapters() {
      chapters.innerHTML = '';
      if (!state.beats.length) {
        chapters.hidden = true;
        btnPrev.disabled = true;
        btnNext.disabled = true;
        return;
      }
      chapters.hidden = false;
      btnPrev.disabled = false;
      btnNext.disabled = false;
      state.beats.forEach(function (b, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'doc-ch-chip' + (idx === state.beatIndex ? ' on' : '');
        btn.textContent = b.label || b.title || ('Ch ' + (idx + 1));
        btn.setAttribute('data-idx', String(idx));
        btn.addEventListener('click', function () { seekBeat(idx, true); });
        chapters.appendChild(btn);
      });
    }

    function activeBeatAt(t) {
      for (var i = 0; i < state.beats.length; i++) {
        var b = state.beats[i];
        var a = typeof b.start === 'number' ? b.start : 0;
        var e = typeof b.end === 'number' ? b.end : 1e9;
        if (t >= a && t < e) return i;
      }
      if (state.beats.length && t >= (state.beats[state.beats.length - 1].start || 0)) {
        return state.beats.length - 1;
      }
      return -1;
    }

    function cueAt(t) {
      for (var i = 0; i < state.cues.length; i++) {
        if (t >= state.cues[i].start && t < state.cues[i].end) return state.cues[i];
      }
      return null;
    }

    function speakBeat(idx, force) {
      if (!state.soundOn || !state.narrateBeats) return;
      if (idx < 0 || idx >= state.beats.length) return;
      if (!force && idx === state.lastSpokenBeat) return;
      var b = state.beats[idx];
      var line = b.narration || b.text || b.title || '';
      if (!line) return;
      state.lastSpokenBeat = idx;
      /* Page audio (LIRIL mp3) owns the bed while it lasts — avoid double talk. */
      if (audio && audio.error == null) {
        var ad = audio.duration;
        var t = v.currentTime || 0;
        if (isFinite(ad) && ad > 1 && t <= ad + 0.35) return;
        /* Past the end of the bed: LIRIL continues chapter narration over remaining film. */
      }
      speakLiril(line, true);
    }

    function applyBeat(idx, fromUser) {
      if (idx < 0 || idx >= state.beats.length) {
        paintLower(title, caption, 'Documentary');
        openLink.hidden = true;
        return;
      }
      state.beatIndex = idx;
      var b = state.beats[idx];
      paintLower(b.title || b.label, b.text, b.label || 'Chapter');
      paintChapters();
      status.textContent = (b.label || title) + (b.href ? ' · navigable' : '');
      if (b.href) {
        openLink.hidden = false;
        openLink.href = b.href;
        openLink.textContent = (b.href.charAt(0) === '#' ? 'Jump to stage →' : 'Open ' + (b.label || 'file') + ' →');
      } else {
        openLink.hidden = true;
      }
      if (fromUser || state.soundOn) speakBeat(idx, !!fromUser);
    }

    function seekBeat(idx, fromUser) {
      if (idx < 0 || idx >= state.beats.length) return;
      var b = state.beats[idx];
      var t = typeof b.start === 'number' ? b.start : 0;
      try { v.currentTime = Math.max(0, t + 0.05); } catch (e) { /* */ }
      if (audio && state.soundOn) {
        try { audio.currentTime = Math.min(t, audio.duration || t); } catch (e2) { /* */ }
      }
      state.lastSpokenBeat = -1;
      applyBeat(idx, fromUser);
      if (v.paused) playAll();
    }

    function syncOverlay() {
      var t = v.currentTime || 0;
      var bi = activeBeatAt(t);
      if (bi !== state.beatIndex && bi >= 0) {
        applyBeat(bi, false);
        if (state.soundOn && !audio) speakBeat(bi, false);
      }
      var cue = cueAt(t);
      if (cue && cue.text) {
        /* VTT supersedes beat body while cue active — keeps on-screen text live */
        var b = state.beats[state.beatIndex] || {};
        paintLower(b.title || title, cue.text, b.label || 'LIRIL · captions');
      }
    }

    function playAll() {
      armVideo(v);
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      if (state.soundOn && audio) {
        try {
          audio.currentTime = Math.min(audio.currentTime || 0, v.currentTime || 0);
          var ap = audio.play();
          if (ap && ap.catch) ap.catch(function () {});
        } catch (e) { /* */ }
      }
      if (state.soundOn && !audio) {
        var bi = activeBeatAt(v.currentTime || 0);
        if (bi >= 0) speakBeat(bi, true);
      }
      setPlaying(true);
    }

    function pauseAll() {
      try { v.pause(); } catch (e) { /* */ }
      if (audio) try { audio.pause(); } catch (e2) { /* */ }
      stopSpeak();
      setPlaying(false);
    }

    btnPlay.addEventListener('click', function () {
      if (v.paused) playAll();
      else pauseAll();
    });

    btnSound.addEventListener('click', function () {
      state.soundOn = !state.soundOn;
      btnSound.textContent = state.soundOn ? 'Narration · On' : 'Narration · Off';
      btnSound.classList.toggle('on', state.soundOn);
      if (state.soundOn) {
        /* enable hybrid audio */
        if (audio) {
          try {
            var ap = audio.play();
            if (ap && ap.catch) ap.catch(function () {});
          } catch (e) { /* */ }
        } else {
          v.dataset.userUnmuted = '1';
          /* film files are silent Ken Burns — use LIRIL voice */
          var bi = activeBeatAt(v.currentTime || 0);
          speakBeat(bi >= 0 ? bi : 0, true);
        }
        if (v.paused) playAll();
        else if (!audio) {
          var b2 = activeBeatAt(v.currentTime || 0);
          if (b2 >= 0) speakBeat(b2, true);
        }
      } else {
        if (audio) try { audio.pause(); } catch (e2) { /* */ }
        stopSpeak();
        v.dataset.userUnmuted = '';
        v.muted = true;
      }
    });

    btnPrev.addEventListener('click', function () {
      var i = state.beatIndex <= 0 ? 0 : state.beatIndex - 1;
      seekBeat(i, true);
    });
    btnNext.addEventListener('click', function () {
      var i = state.beatIndex < 0 ? 0 : Math.min(state.beats.length - 1, state.beatIndex + 1);
      if (state.beatIndex >= 0 && state.beatIndex < state.beats.length - 1) i = state.beatIndex + 1;
      seekBeat(i, true);
    });

    v.addEventListener('play', function () { setPlaying(true); });
    v.addEventListener('pause', function () {
      if (audio) try { audio.pause(); } catch (e) { /* */ }
      setPlaying(false);
    });
    v.addEventListener('timeupdate', function () {
      if (audio && state.soundOn && Math.abs((audio.currentTime || 0) - (v.currentTime || 0)) > 0.45) {
        try { audio.currentTime = v.currentTime; } catch (e) { /* */ }
      }
      syncOverlay();
    });
    v.addEventListener('ended', function () {
      if (!v.loop) {
        stopSpeak();
        setPlaying(false);
        status.textContent = 'End of film · open a chapter or source';
      }
    });

    frame.appendChild(v);
    frame.appendChild(lower);
    frame.appendChild(badge);
    controls.appendChild(btnPlay);
    controls.appendChild(btnSound);
    controls.appendChild(btnPrev);
    controls.appendChild(btnNext);
    controls.appendChild(status);
    controls.appendChild(openLink);

    root.appendChild(frame);
    root.appendChild(chapters);
    root.appendChild(controls);
    root.appendChild(cap);

    paintLower(title, caption, 'Loading hybrid…');

    /* Load manifest + VTT */
    var jobs = [];
    if (manifestUrl) jobs.push(fetchJson(manifestUrl).then(function (m) {
      if (!m) return;
      if (m.beats && m.beats.length) state.beats = m.beats;
      if (m.captions_vtt && !vttUrl) vttUrl = m.captions_vtt;
      if (m.audio && !audioSrc) {
        audioSrc = m.audio;
        audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.src = audioSrc;
        root.appendChild(audio);
      }
      if (m.title) {
        title = m.title;
        status.textContent = title;
      }
      if (m.doctrine) cap.textContent = m.doctrine + ' ' + caption;
    }));
    /* Fallback beats from data attributes if no manifest */
    if (!manifestUrl) {
      state.beats = [{
        id: 'whole',
        label: 'Film',
        start: 0,
        end: 9999,
        title: title,
        text: caption,
        narration: caption,
        href: root.getAttribute('data-doc-href') || ''
      }];
    }

    Promise.all(jobs).then(function () {
      paintChapters();
      var loadVtt = vttUrl || root.getAttribute('data-doc-vtt') || '';
      if (loadVtt) {
        return fetchText(loadVtt).then(function (txt) {
          state.cues = parseVtt(txt);
        });
      }
    }).then(function () {
      paintLower(title, caption, 'Hybrid ready · Narration for LIRIL');
      applyBeat(0, false);
      /* Auto-start muted film in view */
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
              if (!en.isIntersecting) stopSpeak();
            }
          });
        }, { threshold: 0.35 });
        io.observe(root);
      } else if (root.hasAttribute('data-force-play') && !reduced()) {
        playAll();
      }
    });
  }

  function boot() {
    document.querySelectorAll('[data-doc-video]').forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.TENET5DocPlayer = { mount: mount, boot: boot, __v: 2 };
})();
