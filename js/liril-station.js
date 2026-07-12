/* LIRIL News Station — always-on automated presentation for TENET5 home.
 * Like leaving a TV on a news channel: the desk presents itself if you leave
 * the page open. You can still scroll, click, and navigate anytime.
 *
 * Visual station works without a gesture (scroll + dock text + muted film).
 * Voice unlocks on first user gesture (browser autoplay policy).
 *
 * data/liril_station_playlist.json · requires liril-reporter + liril-voice (optional)
 */
(function () {
  'use strict';
  if (window.LIRIL_STATION && window.LIRIL_STATION.__v >= 1) return;

  var PLAYLIST_URL = 'data/liril_station_playlist.json';
  var HOME = !!(document.querySelector('header.cover') || document.getElementById('newsdesk'));
  if (!HOME) {
    window.LIRIL_STATION = { __v: 1, home: false, isOn: function () { return false; } };
    return;
  }

  var playlist = null;
  var on = false;
  var paused = false;
  var voiceAllowed = false;
  var voiceWanted = true;
  var blockIndex = 0;
  var subIndex = 0;
  var timer = null;
  var userBusyUntil = 0;
  var segs = [];
  var docBeats = [];

  function $(id) { return document.getElementById(id); }

  function clean(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (!n || s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function setStatus(msg) {
    var el = $('liril-status');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  }

  function setLine(text) {
    var el = $('liril-line');
    if (el && text) el.textContent = text;
  }

  function paintAir(onAir) {
    var pill = $('liril-air-pill');
    if (pill) {
      pill.textContent = onAir ? 'STATION ON' : 'DESK READY';
      pill.classList.toggle('on', !!onAir);
    }
    var btn = $('liril-station-btn');
    if (btn) {
      btn.textContent = onAir ? (paused ? 'Station · Paused' : 'Station · On') : 'Station · Off';
      btn.classList.toggle('on', !!onAir);
      btn.setAttribute('aria-pressed', onAir ? 'true' : 'false');
    }
    var dock = $('dock');
    if (dock) dock.classList.toggle('station-on', !!onAir);
    document.documentElement.classList.toggle('liril-station-on', !!onAir);
  }

  function scrollToId(id) {
    if (!id || id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function highlight(id) {
    document.querySelectorAll('.active-narration').forEach(function (el) {
      el.classList.remove('active-narration');
    });
    if (!id || id === 'top') return;
    var el = document.getElementById(id);
    if (el) el.classList.add('active-narration');
  }

  function speak(text, force) {
    if (!text) return;
    setLine(text);
    if (!voiceWanted && !force) return;
    if (!voiceAllowed && !force) return;
    if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.speak !== 'function') return;
    if (window.__LIRIL_MUTED === true) return;
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) { /* */ }
    var dock = $('dock');
    if (dock) dock.classList.add('speaking');
    window.LIRIL_VOICE.speak(text, {
      onend: function () { if (dock) dock.classList.remove('speaking'); },
      onerror: function () { if (dock) dock.classList.remove('speaking'); }
    });
    setTimeout(function () {
      if (dock) dock.classList.remove('speaking');
    }, Math.min(18000, 65 * text.length + 800));
  }

  function stopSpeak() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) { /* */ }
  }

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function schedule(fn, ms) {
    clearTimer();
    timer = setTimeout(fn, ms);
  }

  function waitMsForText(text, fallback) {
    var base = fallback || 10000;
    var n = (text || '').length;
    return Math.min(20000, Math.max(base, 55 * n + 3500));
  }

  function loadSegs() {
    if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.load) {
      return window.LIRIL_REPORTER.load().then(function (b) {
        segs = (b.presentation && b.presentation.segments) || [];
        return segs;
      });
    }
    return fetchJson('data/liril_news_presentation.json').then(function (d) {
      segs = (d && d.segments) || [];
      return segs;
    });
  }

  function loadDocBeats(url) {
    return fetchJson(url || 'data/film/hybrid_maid_argument.json').then(function (m) {
      docBeats = (m && m.beats) || [];
      return docBeats;
    });
  }

  function playMutedFilm() {
    var root = document.getElementById('doc-stage');
    if (!root) return;
    var v = root.querySelector('video.doc-stage-video') || root.querySelector('video');
    if (!v) return;
    try {
      v.muted = true;
      v.loop = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* */ }
  }

  function seekDocBeat(i) {
    var root = document.getElementById('doc-stage');
    if (!root || !docBeats[i]) return;
    var b = docBeats[i];
    var v = root.querySelector('video.doc-stage-video') || root.querySelector('video');
    if (v && typeof b.start === 'number') {
      try { v.currentTime = Math.max(0, b.start + 0.05); } catch (e) { /* */ }
      playMutedFilm();
    }
    /* lower third if present */
    var title = root.querySelector('.doc-lower-title');
    var text = root.querySelector('.doc-lower-text');
    var kick = root.querySelector('.doc-lower-kicker');
    if (kick) kick.textContent = b.label || 'Station · documentary';
    if (title) title.textContent = b.title || '';
    if (text) text.textContent = b.text || '';
  }

  function nextBlock() {
    if (!on || paused) return;
    if (Date.now() < userBusyUntil) {
      schedule(nextBlock, 1500);
      return;
    }
    if (!playlist || !playlist.blocks || !playlist.blocks.length) return;
    if (blockIndex >= playlist.blocks.length) {
      if (playlist.loop !== false) {
        blockIndex = 0;
        subIndex = 0;
        setStatus('Station loop · starting desk again');
      } else {
        stopStation();
        return;
      }
    }
    var block = playlist.blocks[blockIndex];
    runBlock(block);
  }

  function runBlock(block) {
    if (!block) { blockIndex++; nextBlock(); return; }
    setStatus('Station · ' + (block.label || block.id || 'block'));

    if (block.kind === 'presentation') {
      loadSegs().then(function () {
        subIndex = 0;
        stepPresentationSeg();
      });
      return;
    }

    if (block.kind === 'hybrid_doc') {
      scrollToId(block.scroll || 'doc-stage');
      highlight(block.scroll || 'doc-stage');
      loadDocBeats(block.manifest).then(function () {
        subIndex = 0;
        stepDocBeat(block);
      });
      return;
    }

    if (block.kind === 'tour') {
      scrollToId(block.scroll);
      highlight(block.scroll);
      var lines = block.lines || [];
      subIndex = 0;
      stepLines(lines, block.wait_ms || 11000, function () {
        blockIndex++;
        nextBlock();
      });
      return;
    }

    if (block.kind === 'line') {
      scrollToId(block.scroll || 'top');
      highlight(block.scroll);
      speak(block.text || '', false);
      schedule(function () {
        blockIndex++;
        nextBlock();
      }, block.wait_ms || waitMsForText(block.text, 9000));
      return;
    }

    blockIndex++;
    nextBlock();
  }

  function stepPresentationSeg() {
    if (!on || paused) return;
    if (Date.now() < userBusyUntil) {
      schedule(stepPresentationSeg, 1200);
      return;
    }
    if (subIndex >= segs.length) {
      blockIndex++;
      nextBlock();
      return;
    }
    var seg = segs[subIndex++];
    if (seg.scroll) {
      scrollToId(seg.scroll);
      highlight(seg.scroll);
    }
    speak(seg.text || '', false);
    setStatus('Station desk ' + subIndex + ' / ' + segs.length);
    var wait = seg.wait_ms || waitMsForText(seg.text, 12000);
    schedule(stepPresentationSeg, wait);
  }

  function stepDocBeat(block) {
    if (!on || paused) return;
    if (Date.now() < userBusyUntil) {
      schedule(function () { stepDocBeat(block); }, 1200);
      return;
    }
    if (subIndex >= docBeats.length) {
      blockIndex++;
      nextBlock();
      return;
    }
    var i = subIndex++;
    seekDocBeat(i);
    var b = docBeats[i] || {};
    var line = b.narration || b.text || b.title || '';
    speak(line, false);
    setStatus('Station film · ' + (b.label || ('beat ' + (i + 1))));
    var wait = block.dwell_ms || waitMsForText(line, 12000);
    schedule(function () { stepDocBeat(block); }, wait);
  }

  function stepLines(lines, waitEach, done) {
    if (!on || paused) return;
    if (subIndex >= lines.length) {
      if (done) done();
      return;
    }
    var line = lines[subIndex++];
    speak(line, false);
    schedule(function () { stepLines(lines, waitEach, done); }, waitEach || waitMsForText(line, 10000));
  }

  function startStation(opts) {
    opts = opts || {};
    on = true;
    paused = false;
    blockIndex = 0;
    subIndex = 0;
    paintAir(true);
    setStatus('Station on · news desk loop');
    setLine('TENET5 station on. The desk presents while you browse. Navigate anytime.');
    if (opts.voice) voiceAllowed = true;
    // Start live wire poll if reporter available
    if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.startLive) {
      try { window.LIRIL_REPORTER.startLive(); } catch (e) { /* */ }
    }
    // Load playlist then go
    var p = playlist
      ? Promise.resolve(playlist)
      : fetchJson(PLAYLIST_URL).then(function (d) {
          playlist = d || defaultPlaylist();
          return playlist;
        });
    p.then(function () {
      if (!playlist) playlist = defaultPlaylist();
      nextBlock();
    });
  }

  function defaultPlaylist() {
    return {
      loop: true,
      blocks: [
        { id: 'desk', kind: 'presentation', label: 'Desk' },
        {
          id: 'doc',
          kind: 'hybrid_doc',
          label: 'Documentary',
          scroll: 'doc-stage',
          manifest: 'data/film/hybrid_maid_argument.json',
          dwell_ms: 13000
        },
        {
          id: 'now',
          kind: 'tour',
          scroll: 'now',
          lines: ['This hour: TENET5 desk and multi-source wire. External sources are labeled.'],
          wait_ms: 11000
        },
        {
          id: 'loop',
          kind: 'line',
          scroll: 'top',
          text: 'Station looping. Powered by LIRIL AI. You verify.',
          wait_ms: 8000
        }
      ]
    };
  }

  function stopStation() {
    on = false;
    paused = false;
    clearTimer();
    stopSpeak();
    highlight(null);
    paintAir(false);
    setStatus('Station off · Guide me or leave page open for auto station');
    if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.stopLive) {
      try { window.LIRIL_REPORTER.stopLive(); } catch (e) { /* */ }
    }
  }

  function toggleStation() {
    if (on) stopStation();
    else startStation({ voice: voiceAllowed });
  }

  function pauseStation(temp) {
    if (!on) return;
    paused = true;
    clearTimer();
    stopSpeak();
    paintAir(true);
    setStatus('Station paused' + (temp ? ' · resumes after idle' : ''));
  }

  function resumeStation() {
    if (!on) return;
    paused = false;
    paintAir(true);
    setStatus('Station resumed');
    nextBlock();
  }

  function noteUserActivity() {
    // Soft pause auto-advance while user navigates; resume after idle
    if (!on) return;
    userBusyUntil = Date.now() + ((playlist && playlist.idle_resume_ms) || 12000);
    if (!paused) {
      setStatus('Station standing by · you are navigating');
    }
  }

  function unlockVoice() {
    voiceAllowed = true;
    if (on && voiceWanted) {
      setStatus('Station voice unlocked');
    }
  }

  function ensureDockButton() {
    var dockIn = document.querySelector('#dock .dock-in');
    if (!dockIn || $('liril-station-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'liril-station-btn';
    btn.type = 'button';
    btn.className = 'dock-station-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Leave the news station on — auto-presents while you browse';
    btn.textContent = 'Station · Off';
    var voice = $('voice-btn');
    if (voice && voice.parentNode === dockIn) {
      dockIn.insertBefore(btn, voice);
    } else {
      dockIn.appendChild(btn);
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      unlockVoice();
      toggleStation();
    });
  }

  function ensureCardButton() {
    var host = document.getElementById('liril-presentation');
    if (!host) return;
    // Re-inject after paint if needed via MutationObserver-lite
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.id === 'liril-station-start') {
        e.preventDefault();
        unlockVoice();
        if (!on) startStation({ voice: true });
        else stopStation();
      }
    });
  }

  function boot() {
    ensureDockButton();
    ensureCardButton();
    paintAir(false);

    // Pause station if user plays media manually
    document.addEventListener('play', function (e) {
      if (e.target && (e.target.tagName === 'VIDEO' || e.target.tagName === 'AUDIO')) {
        // Ignore the background ambient station loop itself
        if (e.target.muted && (e.target.hasAttribute('loop') || e.target.classList.contains('doc-stage-video'))) return;
        pauseStation(true);
      }
    }, true);

    document.addEventListener('pause', function (e) {
      if (e.target && (e.target.tagName === 'VIDEO' || e.target.tagName === 'AUDIO')) {
        if (e.target.muted && (e.target.hasAttribute('loop') || e.target.classList.contains('doc-stage-video'))) return;
        noteUserActivity(); // soft resume after idle
      }
    }, true);

    // Gesture unlock for voice (TV still runs visual without it)
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, function () {
        unlockVoice();
      }, { once: false, passive: true });
    });

    // Soft user activity
    ['wheel', 'scroll', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, noteUserActivity, { passive: true });
    });

    fetchJson(PLAYLIST_URL).then(function (d) {
      playlist = d || defaultPlaylist();
      var delay = (playlist.auto_start_ms != null) ? playlist.auto_start_ms : 3500;
      setStatus('Station ready · auto-on in ' + Math.round(delay / 1000) + 's (or tap Station)');
      setLine(
        (playlist.tagline) ||
          'Leave this page open — TENET5 presents the desk like a news station. Navigate anytime.'
      );
      // Auto-start station (visual first; voice after gesture)
      schedule(function () {
        if (!on) startStation({ voice: voiceAllowed });
      }, delay);
    });

    // Resume after long idle if paused by navigation soft-busy only — handled in nextBlock

    window.LIRIL_STATION = {
      __v: 1,
      home: true,
      start: startStation,
      stop: stopStation,
      toggle: toggleStation,
      pause: pauseStation,
      resume: resumeStation,
      isOn: function () { return on; },
      isPaused: function () { return paused; },
      unlockVoice: unlockVoice
    };
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
