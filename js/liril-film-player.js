/* ═══════════════════════════════════════════════════════════════════════════
   LIRIL FILM PLAYER v6 — multi-hour entire Canada open-record history
   Prefers data/documentary_chapters.json (full spine); falls back to film acts.
   B-roll: real media/film/video/film_* clips (min size) + LTX act pool; ignore 1-byte stubs.
   Speak + source dwell. Progress localStorage v4. Press theme (css/press-theme.css).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__LIRIL_FILM_PLAYER) return;
  window.__LIRIL_FILM_PLAYER = true;

  var MANIFEST_URL = 'data/film/manifest.json';
  var CHAPTERS_URL = 'data/documentary_chapters.json';
  var MIN_VIDEO_BYTES = 80000;
  /* Act → atmospheric LTX / cinema when beat file missing */
  var ACT_BROLL = {
    0: 'media/film/hall_of_record.mp4',
    1: 'media/film/ledger_turn.mp4',
    2: 'media/film/chamber_dawn.mp4',
    3: 'media/film/empty_committee.mp4',
    4: 'media/film/vault_door.mp4',
    5: 'media/film/paper_trail.mp4',
    6: 'media/film/corridor_power.mp4',
    7: 'media/film/waiting_room.mp4',
    8: 'media/film/hall_of_record.mp4',
    9: 'media/film/empty_committee.mp4',
    10: 'media/film/chamber_dawn.mp4'
  };
  var BROLL_POOL = [
    'media/film/hall_of_record.mp4',
    'media/film/corridor_power.mp4',
    'media/film/empty_committee.mp4',
    'media/film/ledger_turn.mp4',
    'media/film/paper_trail.mp4',
    'media/film/chamber_dawn.mp4',
    'media/film/vault_door.mp4',
    'media/film/waiting_room.mp4',
    'media/film/ltx/ltx_waiting_room.mp4',
    'media/film/ltx/ltx_hall_of_record.mp4'
  ];
  var state = {
    manifest: null,
    acts: [],
    flat: [],
    index: 0,
    playing: false,
    mode: 'watch',
    phase: 'narration', /* narration | source | social */
    phaseI: 0,
    timer: null,
    speakEnd: null,
    root: null,
    startedAt: null,
    elapsedOffset: 0
  };

  function $(sel, el) { return (el || document).querySelector(sel); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    return m + ':' + String(sec).padStart(2, '0');
  }
  function storageKey() {
    return (state.manifest && state.manifest.storage_key) || 'liril_film_progress_v4';
  }
  function saveProgress() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify({
        index: state.index,
        mode: state.mode,
        at: new Date().toISOString()
      }));
    } catch (e) {}
  }
  function loadProgress() {
    try {
      var raw = localStorage.getItem(storageKey());
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function stopSpeech() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }
  function speak(text, onend) {
    stopSpeech();
    if (!text) { if (onend) onend(); return; }
    if (window.LIRIL_VOICE && typeof window.LIRIL_VOICE.speak === 'function') {
      try {
        window.LIRIL_VOICE.speak(text, { onend: onend });
        return;
      } catch (e) {}
    }
    try {
      if (!window.speechSynthesis) { if (onend) setTimeout(onend, 800); return; }
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.onend = function () { if (onend) onend(); };
      u.onerror = function () { if (onend) onend(); };
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (onend) setTimeout(onend, 800);
    }
  }

  function clearTimer() {
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
  }

  function totalDuration() {
    return state.flat.reduce(function (a, s) { return a + (s.duration_s || 0); }, 0);
  }
  function elapsedBefore(i) {
    var t = 0;
    for (var k = 0; k < i && k < state.flat.length; k++) t += state.flat[k].duration_s || 0;
    return t;
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('fetch ' + url);
      return r.json();
    });
  }

  function headOk(url) {
    return fetch(url, { method: 'HEAD', cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) return false;
        var len = parseInt(r.headers.get('content-length') || '0', 10);
        /* GitHub Pages may omit content-length; probe range if missing */
        if (!len || isNaN(len)) {
          return fetch(url, {
            method: 'GET',
            headers: { Range: 'bytes=0-1' },
            cache: 'no-cache'
          }).then(function (r2) {
            return r2.ok || r2.status === 206;
          }).catch(function () { return false; });
        }
        return len >= MIN_VIDEO_BYTES;
      })
      .catch(function () { return false; });
  }

  function candidateVideos(seg) {
    var id = (seg && seg.id) || '';
    var act = (seg && seg.act != null) ? seg.act : 0;
    var list = [];
    if (id) {
      list.push('media/film/video/film_' + id + '_mux.mp4');
      list.push('media/film/video/film_' + id + '.mp4');
      list.push('media/film/docs/film_' + id + '_documentary.mp4');
    }
    if (ACT_BROLL[act]) list.push(ACT_BROLL[act]);
    list.push(BROLL_POOL[act % BROLL_POOL.length]);
    list.push('media/film/reel.mp4');
    /* de-dupe */
    var seen = {};
    return list.filter(function (u) {
      if (!u || seen[u]) return false;
      seen[u] = true;
      return true;
    });
  }

  function resolveBroll(seg) {
    var cands = candidateVideos(seg);
    var i = 0;
    function next() {
      if (i >= cands.length) return Promise.resolve('media/film/reel.mp4');
      var u = cands[i++];
      return headOk(u).then(function (ok) {
        return ok ? u : next();
      });
    }
    return next();
  }

  function loadAll() {
    /* Primary: full rebuilt catalog (history spine + long dwell = multi-hour) */
    return fetchJson(CHAPTERS_URL).then(function (doc) {
      return fetchJson(MANIFEST_URL).catch(function () { return {}; }).then(function (man) {
        state.manifest = Object.assign({}, man, {
          version: doc.version || man.version || '4.0.0',
          title: doc.title || man.title,
          storage_key: doc.storage_key || man.storage_key || 'liril_film_progress_v4',
          totals: doc.totals || man.totals,
          runtime_model: man.runtime_model || {
            speak_wpm: 145,
            source_dwell_s: 90,
            social_dwell_s: 45
          },
          acts: man.acts || []
        });
        var actMeta = {};
        (state.manifest.acts || []).forEach(function (a) {
          actMeta[a.act] = a;
        });
        state.flat = [];
        (doc.chapters || []).forEach(function (s) {
          var meta = actMeta[s.act] || {};
          s._actTitle = meta.title || ('Act ' + s.act);
          s._actYears = meta.years || s.years || '';
          s._actColor = meta.color || '#a8bcc8';
          state.flat.push(s);
        });
        /* rebuild act list from flat if manifest acts incomplete */
        if (!state.manifest.acts || !state.manifest.acts.length) {
          var seen = {};
          state.manifest.acts = [];
          state.flat.forEach(function (s) {
            if (seen[s.act] != null) return;
            seen[s.act] = true;
            state.manifest.acts.push({
              act: s.act,
              title: s._actTitle,
              years: s._actYears,
              color: s._actColor,
              segment_count: 0,
              duration_label: ''
            });
          });
        }
        if (!state.flat.length) throw new Error('empty_chapters');
        return state.manifest;
      });
    }).catch(function () {
      /* Fallback: classic act files only */
      return fetchJson(MANIFEST_URL).then(function (man) {
        state.manifest = man;
        var files = (man.acts || []).map(function (a) {
          var url = a.file || '';
          /* relative paths for GitHub Pages */
          if (url.charAt(0) === '/') url = url.slice(1);
          return fetchJson(url);
        });
        return Promise.all(files).then(function (acts) {
          state.acts = acts;
          state.flat = [];
          acts.forEach(function (a) {
            (a.segments || []).forEach(function (s) {
              s._actTitle = a.title;
              s._actYears = a.years;
              s._actColor = a.color;
              state.flat.push(s);
            });
          });
          if (!state.flat.length) throw new Error('empty_acts');
          return man;
        });
      });
    });
  }

  function buildShell() {
    var mount = document.getElementById('liril-film-app');
    if (!mount) return;
    mount.innerHTML = '';
    var root = el('div', 'lf-root');
    root.id = 'liril-film-root';
    root.innerHTML =
      '<header class="lf-top">' +
        '<div class="lf-brand">LIRIL · THE GUIDED RECORD</div>' +
        '<div class="lf-runtime" id="lf-runtime">—</div>' +
        '<div class="lf-track" id="lf-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Film progress">' +
          '<div class="lf-fill" id="lf-fill"></div>' +
        '</div>' +
        '<div class="lf-clock" id="lf-clock">0:00 / 0:00</div>' +
        '<button type="button" class="lf-btn" data-act="mode" id="lf-mode">WATCH</button>' +
        '<button type="button" class="lf-btn" data-act="prev">PREV</button>' +
        '<button type="button" class="lf-btn primary" data-act="play" id="lf-play">PLAY</button>' +
        '<button type="button" class="lf-btn" data-act="next">NEXT</button>' +
      '</header>' +
      '<aside class="lf-acts" id="lf-acts" aria-label="Acts"></aside>' +
      '<main class="lf-stage">' +
        '<div class="lf-cinema" id="lf-cinema" aria-hidden="true">' +
          '<video class="lf-cinema-video" id="lf-cinema-video" playsinline preload="auto" poster="media/landing/parliament_ice.jpg"></video>' +
          '<div class="lf-cinema-veil" aria-hidden="true"></div>' +
        '</div>' +
        '<div class="lf-kicker" id="lf-kicker">—</div>' +
        '<h1 class="lf-title" id="lf-title">Loading film…</h1>' +
        '<p class="lf-years" id="lf-years"></p>' +
        '<p class="lf-narration" id="lf-narration"></p>' +
        '<div class="lf-phase" id="lf-phase"></div>' +
        '<div class="lf-sources" id="lf-sources"></div>' +
        '<div class="lf-social" id="lf-social"></div>' +
        '<div class="lf-links" id="lf-links"></div>' +
      '</main>' +
      '<aside class="lf-rail" id="lf-rail" aria-label="Segments in act"></aside>' +
      '<footer class="lf-foot">' +
        '<span id="lf-status">Primary sources · claim levels labeled · atmosphere is not the proof</span>' +
        '<a class="lf-foot-a" href="daily-briefing.html">Daily briefing</a>' +
        '<a class="lf-foot-a" href="argument.html">Five-act case</a>' +
        '<a class="lf-foot-a" href="evidence-index.html">Evidence shelf</a>' +
      '</footer>';
    mount.appendChild(root);
    state.root = root;
    state.cinema = root.querySelector('#lf-cinema-video');

    root.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-act]');
      if (!t) return;
      var act = t.getAttribute('data-act');
      if (act === 'play') togglePlay();
      else if (act === 'next') go(state.index + 1, true);
      else if (act === 'prev') go(state.index - 1, true);
      else if (act === 'mode') {
        state.mode = state.mode === 'watch' ? 'navigate' : 'watch';
        $('#lf-mode').textContent = state.mode.toUpperCase();
        saveProgress();
      } else if (act === 'goto') {
        var i = parseInt(t.getAttribute('data-i'), 10);
        if (!isNaN(i)) go(i, true);
      } else if (act === 'act') {
        var aid = t.getAttribute('data-act-id');
        var idx = state.flat.findIndex(function (s) { return String(s.act) === aid || s._actTitle === aid; });
        /* data-act-id is act number */
        idx = state.flat.findIndex(function (s) { return String(s.act) === String(t.getAttribute('data-act-id')); });
        if (idx >= 0) go(idx, true);
      }
    });

    $('#lf-track').addEventListener('click', function (ev) {
      if (!state.flat.length) return;
      var r = ev.currentTarget.getBoundingClientRect();
      var pct = (ev.clientX - r.left) / Math.max(1, r.width);
      var targetT = pct * totalDuration();
      var acc = 0;
      for (var i = 0; i < state.flat.length; i++) {
        acc += state.flat[i].duration_s || 0;
        if (acc >= targetT) { go(i, true); return; }
      }
      go(state.flat.length - 1, true);
    });
  }

  function renderActs() {
    var box = $('#lf-acts');
    if (!box || !state.manifest) return;
    box.innerHTML = '<div class="lf-acts-h">ACTS</div>';
    (state.manifest.acts || []).forEach(function (a) {
      var b = el('button', 'lf-act');
      b.type = 'button';
      b.setAttribute('data-act', 'act');
      b.setAttribute('data-act-id', String(a.act));
      b.innerHTML =
        '<span class="lf-act-n">ACT ' + a.act + '</span>' +
        '<span class="lf-act-t">' + a.title + '</span>' +
        '<span class="lf-act-d">' + a.duration_label + ' · ' + a.segment_count + ' beats</span>';
      box.appendChild(b);
    });
  }

  function renderRail() {
    var box = $('#lf-rail');
    if (!box) return;
    var cur = state.flat[state.index];
    if (!cur) return;
    var actN = cur.act;
    box.innerHTML = '<div class="lf-rail-h">THIS ACT</div>';
    state.flat.forEach(function (s, i) {
      if (s.act !== actN) return;
      var b = el('button', 'lf-seg' + (i === state.index ? ' is-on' : ''));
      b.type = 'button';
      b.setAttribute('data-act', 'goto');
      b.setAttribute('data-i', String(i));
      b.innerHTML = '<span class="y">' + (s.years || '') + '</span><span class="t">' + (s.title || '') + '</span>';
      box.appendChild(b);
    });
  }

  function renderSegment() {
    var s = state.flat[state.index];
    if (!s) return;
    $('#lf-kicker').textContent = s.kicker || ('ACT ' + s.act);
    $('#lf-title').textContent = s.title || '';
    $('#lf-years').textContent = (s.years || '') + (s._actTitle ? '  ·  ' + s._actTitle : '');
    $('#lf-narration').textContent = s.narration || '';

    var srcBox = $('#lf-sources');
    srcBox.innerHTML = '<div class="lf-h">OPEN GOVERNMENT / PRIMARY</div>';
    (s.sources || []).forEach(function (src, i) {
      var a = el('a', 'lf-src' + (state.phase === 'source' && state.phaseI === i ? ' is-dwell' : ''));
      a.href = src.url || '#';
      if (src.url && src.url.indexOf('http') === 0) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.innerHTML = '<span class="ty">' + (src.type || 'source') + '</span><span class="lb">' + (src.label || src.url) + '</span>';
      srcBox.appendChild(a);
    });
    if (!(s.sources || []).length) {
      srcBox.innerHTML += '<p class="lf-empty">No discrete source cards — see linked page.</p>';
    }

    var soc = $('#lf-social');
    soc.innerHTML = '<div class="lf-h">PUBLIC SOCIAL / OSINT</div>';
    (s.social || []).forEach(function (src, i) {
      var a = el('a', 'lf-src social' + (state.phase === 'social' && state.phaseI === i ? ' is-dwell' : ''));
      a.href = src.url || '#';
      if (src.url && src.url.indexOf('http') === 0) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.innerHTML = '<span class="ty">' + (src.type || 'social') + '</span><span class="lb">' + (src.label || src.url) + '</span>';
      soc.appendChild(a);
    });
    if (!(s.social || []).length) {
      soc.innerHTML += '<p class="lf-empty">No social cards on this beat.</p>';
    }

    var links = $('#lf-links');
    links.innerHTML = '';
    if (s.page) {
      var deep = el('a', 'lf-deep');
      deep.href = s.page;
      deep.textContent = 'Open full dossier page →';
      links.appendChild(deep);
    }

    var tot = totalDuration();
    var elap = elapsedBefore(state.index);
    $('#lf-clock').textContent = fmt(elap) + ' / ' + fmt(tot);
    $('#lf-fill').style.width = (tot ? Math.round((elap / tot) * 100) : 0) + '%';
    $('#lf-runtime').textContent =
      (state.manifest.totals && state.manifest.totals.duration_label) || fmt(tot);
    $('#lf-phase').textContent =
      'Beat ' + (state.index + 1) + ' / ' + state.flat.length +
      ' · phase: ' + state.phase +
      ' · speak ' + (s.speak_s || '—') + 's · dwell ' + (s.dwell_s || 0) + 's';

    document.querySelectorAll('.lf-act').forEach(function (b) {
      b.classList.toggle('is-on', String(b.getAttribute('data-act-id')) === String(s.act));
    });
    renderRail();
    saveProgress();
  }

  function advancePhase() {
    if (!state.playing || state.mode !== 'watch') return;
    var s = state.flat[state.index];
    if (!s) return;
    clearTimer();

    if (state.phase === 'narration') {
      var srcs = s.sources || [];
      if (srcs.length) {
        state.phase = 'source';
        state.phaseI = 0;
        renderSegment();
        /* Cap dwell so broken long catalogs don't feel frozen; full runtime still hours */
        var sd = (state.manifest.runtime_model && state.manifest.runtime_model.source_dwell_s) || 90;
        state.timer = setTimeout(advancePhase, Math.min(120, sd) * 1000);
        return;
      }
      var socs = s.social || [];
      if (socs.length) {
        state.phase = 'social';
        state.phaseI = 0;
        renderSegment();
        var sod = (state.manifest.runtime_model && state.manifest.runtime_model.social_dwell_s) || 45;
        state.timer = setTimeout(advancePhase, Math.min(75, sod) * 1000);
        return;
      }
      nextSegmentAuto();
      return;
    }

    if (state.phase === 'source') {
      var srcs2 = s.sources || [];
      if (state.phaseI < srcs2.length - 1) {
        state.phaseI += 1;
        renderSegment();
        /* Cap dwell so broken long catalogs don't feel frozen; full runtime still hours */
        var sd = (state.manifest.runtime_model && state.manifest.runtime_model.source_dwell_s) || 90;
        state.timer = setTimeout(advancePhase, Math.min(120, sd) * 1000);
        return;
      }
      var socs2 = s.social || [];
      if (socs2.length) {
        state.phase = 'social';
        state.phaseI = 0;
        renderSegment();
        var sod = (state.manifest.runtime_model && state.manifest.runtime_model.social_dwell_s) || 45;
        state.timer = setTimeout(advancePhase, Math.min(75, sod) * 1000);
        return;
      }
      nextSegmentAuto();
      return;
    }

    if (state.phase === 'social') {
      var socs3 = s.social || [];
      if (state.phaseI < socs3.length - 1) {
        state.phaseI += 1;
        renderSegment();
        var sod = (state.manifest.runtime_model && state.manifest.runtime_model.social_dwell_s) || 45;
        state.timer = setTimeout(advancePhase, Math.min(75, sod) * 1000);
        return;
      }
      nextSegmentAuto();
    }
  }

  function nextSegmentAuto() {
    if (state.index >= state.flat.length - 1) {
      state.playing = false;
      $('#lf-play').textContent = 'PLAY';
      $('#lf-status').textContent = 'Film complete — return to daily briefing for continuous record.';
      return;
    }
    state.index += 1;
    playCurrent();
  }

  function playCurrent() {
    clearTimer();
    stopSpeech();
    state.phase = 'narration';
    state.phaseI = 0;
    renderSegment();
    if (!state.playing) return;
    var s = state.flat[state.index];
    var advanced = false;
    var afterSpeak = function () {
      if (advanced || !state.playing) return;
      advanced = true;
      advancePhase();
    };

    var stageVid = state.cinema || document.getElementById('lf-cinema-video');
    var pageBroll = document.querySelector('.film-broll');

    function setBroll(path, opts) {
      opts = opts || {};
      var vids = [stageVid, pageBroll].filter(Boolean);
      vids.forEach(function (v) {
        try {
          v.muted = opts.muted !== false; /* default muted for autoplay policy */
          v.loop = !!opts.loop;
          v.onended = opts.onended || null;
          if (v.getAttribute('src') !== path && v.src.indexOf(path) < 0) {
            v.src = path;
            try { v.load(); } catch (e1) {}
          }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } catch (e) {}
      });
    }

    resolveBroll(s).then(function (path) {
      var isBeatClip = path.indexOf('/video/film_') >= 0 || path.indexOf('film_' + (s.id || '')) >= 0;
      /* Atmosphere b-roll loops under VO; dedicated beat clips can drive timing if short */
      setBroll(path, {
        muted: true,
        loop: true,
        onended: null
      });
      var text = (s && s.narration) || '';
      var speakMs = ((s && s.speak_s) || 40) * 1000;
      speak(text, afterSpeak);
      state.timer = setTimeout(afterSpeak, speakMs + 2500);
      if (isBeatClip && stageVid) {
        /* optional: keep stage video visible for beat identity */
        try { stageVid.setAttribute('data-beat', s.id || ''); } catch (e2) {}
      }
    }).catch(function () {
      setBroll('media/film/reel.mp4', { muted: true, loop: true });
      var text = (s && s.narration) || '';
      var speakMs = ((s && s.speak_s) || 40) * 1000;
      speak(text, afterSpeak);
      state.timer = setTimeout(afterSpeak, speakMs + 2500);
    });
  }

  function go(i, user) {
    if (!state.flat.length) return;
    clearTimer();
    stopSpeech();
    state.index = Math.max(0, Math.min(state.flat.length - 1, i));
    state.phase = 'narration';
    state.phaseI = 0;
    if (user && state.mode === 'navigate') state.playing = false;
    if (state.playing) playCurrent();
    else renderSegment();
    $('#lf-play').textContent = state.playing ? 'PAUSE' : 'PLAY';
  }

  function togglePlay() {
    state.playing = !state.playing;
    $('#lf-play').textContent = state.playing ? 'PAUSE' : 'PLAY';
    if (state.playing) playCurrent();
    else { clearTimer(); stopSpeech(); }
  }

  function boot() {
    buildShell();
    loadAll().then(function () {
      var tot = state.manifest.totals || {};
      var beats = tot.segments || state.flat.length;
      var actsN = (state.manifest.acts && state.manifest.acts.length) || state.acts.length;
      var dur = tot.duration_label || fmt(totalDuration());
      $('#lf-runtime').textContent = dur;
      $('#lf-status').textContent =
        beats + ' beats · ' + actsN + ' acts · ' + dur + ' complete playthrough';
      var stats = document.getElementById('lf-stats');
      if (stats) stats.textContent = actsN + ' acts · ' + beats + ' beats · ' + dur;
      var hours = document.getElementById('lf-hours');
      if (hours) hours.textContent = dur;
      renderActs();
      var prog = loadProgress();
      if (prog && typeof prog.index === 'number') state.index = prog.index;
      if (prog && prog.mode) state.mode = prog.mode;
      $('#lf-mode').textContent = state.mode.toUpperCase();
      renderSegment();
      document.body.classList.add('is-playing', 'lf-ready');
      var mount = document.getElementById('liril-film-app');
      if (mount) {
        mount.hidden = false;
        mount.classList.remove('hidden-until-start');
      }
      var fb = document.getElementById('lf-fallback');
      if (fb) fb.hidden = true;
      /* auto-start watch unless user prefers navigate */
      try {
        var q = new URLSearchParams(window.location.search || '');
        var auto = q.get('auto') === '1' || q.get('play') === '1' || q.get('auto') !== '0';
        if (auto && state.mode === 'watch') {
          state.playing = true;
          $('#lf-play').textContent = 'PAUSE';
          playCurrent();
        }
      } catch (e) {
        state.playing = true;
        $('#lf-play').textContent = 'PAUSE';
        playCurrent();
      }
      if (typeof window.__LIRIL_FILM_ON_READY === 'function') {
        try { window.__LIRIL_FILM_ON_READY(state); } catch (e2) {}
      }
    }).catch(function (err) {
      $('#lf-title').textContent = 'Film catalog failed to load';
      $('#lf-narration').textContent = String(err && err.message ? err.message : err);
      var fb = document.getElementById('lf-fallback');
      if (fb) fb.hidden = false;
      var stats = document.getElementById('lf-stats');
      if (stats) stats.textContent = 'Film temporarily unavailable';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
