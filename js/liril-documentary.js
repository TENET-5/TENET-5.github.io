/* ═══════════════════════════════════════════════════════════════════════════
   LIRIL DOCUMENTARY ENGINE v4.0
   Multi-hour Canada public-record film — entire history → this hour.
   Loads data/documentary_chapters.json; eras + hours + localStorage progress.
   QUANTANIUM ice HUD via css/documentary-tour.css
   Full film surface: /liril-film.html
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__LIRIL_DOCUMENTARY_LOADED) return;
  window.__LIRIL_DOCUMENTARY_LOADED = true;

  var CHAPTERS_URL = '/data/documentary_chapters.json';
  var CSS_HREF = '/css/documentary-tour.css?v=4';
  var FULL_FILM_URL = '/liril-film.html';
  var STORAGE_DEFAULT = 'liril_film_progress_v4';
  var state = {
    data: null,
    index: 0,
    mode: 'watch', /* watch | navigate | research */
    playing: false,
    advanceTimer: null,
    root: null,
    lastHighlight: null,
    storageKey: STORAGE_DEFAULT
  };

  function fmtHours(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    if (h <= 0) return m + 'm';
    return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
  }

  function totalDurationS(data) {
    if (!data || !data.chapters) return 0;
    if (data.totals && data.totals.duration_s) return data.totals.duration_s;
    var t = 0;
    for (var i = 0; i < data.chapters.length; i++) t += (data.chapters[i].duration_s || 30);
    return t;
  }

  function elapsedToIndex(data, idx) {
    if (!data || !data.chapters) return 0;
    var t = 0;
    var max = Math.min(idx, data.chapters.length);
    for (var i = 0; i < max; i++) t += (data.chapters[i].duration_s || 30);
    return t;
  }

  function saveProgress() {
    try {
      var key = (state.data && state.data.storage_key) || state.storageKey;
      localStorage.setItem(key, JSON.stringify({
        index: state.index,
        ts: Date.now(),
        version: (state.data && state.data.version) || '4.0.0'
      }));
    } catch (e) {}
  }

  function loadProgress() {
    try {
      var key = (state.data && state.data.storage_key) || state.storageKey;
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function injectCss() {
    if (document.getElementById('liril-doc-css')) return;
    var l = document.createElement('link');
    l.id = 'liril-doc-css';
    l.rel = 'stylesheet';
    l.href = CSS_HREF;
    document.head.appendChild(l);
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function currentPageBase() {
    try {
      var p = (window.location.pathname || '').split('/').pop() || 'home.html';
      if (!p || p === '' || p === 'index.html') {
        var q = new URLSearchParams(window.location.search || '');
        var load = q.get('load');
        if (load) return load.split('#')[0];
        return 'home.html';
      }
      return p.split('?')[0];
    } catch (e) {
      return 'home.html';
    }
  }

  function goToPage(page) {
    if (!page) return;
    var base = page.split('#')[0];
    var hash = page.indexOf('#') >= 0 ? page.substring(page.indexOf('#')) : '';
    var cur = currentPageBase();
    if (cur === base || cur === 'index.html' && base === 'home.html') {
      if (hash) {
        try {
          var t = document.querySelector(hash);
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {}
      }
      return;
    }
    /* Prefer shell frame navigation */
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = '/index.html?load=' + encodeURIComponent(base) + hash +
          (state.playing ? '&doc=1&ch=' + state.index : '');
        return;
      }
    } catch (e) {}
    var target = '/index.html?load=' + encodeURIComponent(base) + hash +
      (state.playing ? '&doc=1&ch=' + state.index : '');
    window.location.href = target;
  }

  function clearHighlight() {
    if (state.lastHighlight) {
      try {
        document.querySelectorAll('.doc-highlight-target').forEach(function (n) {
          n.classList.remove('doc-highlight-target');
        });
      } catch (e) {}
      state.lastHighlight = null;
    }
  }

  function applyHighlight(sel) {
    clearHighlight();
    if (!sel) return;
    try {
      var nodes = document.querySelectorAll(sel);
      var max = Math.min(nodes.length, 6);
      for (var i = 0; i < max; i++) {
        nodes[i].classList.add('doc-highlight-target');
      }
      if (nodes[0]) {
        nodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        state.lastHighlight = sel;
      }
    } catch (e) {}
  }

  function stopSpeech() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
    try {
      if (window.__LIRIL_WALKTHROUGH_STOP) window.__LIRIL_WALKTHROUGH_STOP();
    } catch (e) {}
  }

  function speak(text, onend) {
    stopSpeech();
    if (!text) {
      if (onend) setTimeout(onend, 400);
      return;
    }
    try {
      if (window.LIRIL_VOICE && window.LIRIL_VOICE.speak) {
        var ok = window.LIRIL_VOICE.speak(text, {
          rate: 1.05,
          pitch: 0.94,
          onend: function () { if (onend) onend(); },
          onerror: function () { if (onend) setTimeout(onend, 800); }
        });
        if (ok) return;
      }
    } catch (e) {}
    /* No voice — still advance after readable pause proportional to length */
    var ms = Math.min(28000, Math.max(8000, String(text).length * 45));
    state.advanceTimer = setTimeout(function () {
      if (onend) onend();
    }, ms);
  }

  function clearAdvance() {
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
    }
  }

  function renderHud() {
    injectCss();
    if (state.root) return;
    var root = el('div', '');
    root.id = 'liril-doc-root';
    root.setAttribute('aria-live', 'polite');

    var bar = el('div', 'doc-filmbar');
    bar.innerHTML =
      '<span class="doc-brand">LIRIL · CANADA RECORD</span>' +
      '<div class="doc-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" title="Time progress">' +
      '<div class="doc-fill"></div></div>' +
      '<span class="doc-count">—</span>' +
      '<span class="doc-time" title="Elapsed / total film time">—</span>' +
      '<button type="button" class="doc-mode is-watch" data-act="mode">WATCH</button>' +
      '<button type="button" class="doc-ctrl" data-act="prev">PREV</button>' +
      '<button type="button" class="doc-ctrl" data-act="play">PLAY</button>' +
      '<button type="button" class="doc-ctrl" data-act="next">NEXT</button>' +
      '<button type="button" class="doc-ctrl danger" data-act="exit">EXIT</button>';

    var eraRail = el('div', 'doc-era-rail');
    eraRail.setAttribute('aria-label', 'Documentary eras / acts');

    var rail = el('div', 'doc-chapter-rail');
    rail.setAttribute('aria-label', 'Documentary chapters in current era');

    var cap = el('div', 'doc-caption');
    cap.innerHTML =
      '<div class="doc-kicker">—</div>' +
      '<h2 class="doc-title">—</h2>' +
      '<p class="doc-sub"></p>' +
      '<div class="doc-sources" aria-label="Open government and social sources"></div>' +
      '<div class="doc-nav">' +
      '<button type="button" data-act="prev">← Beat</button>' +
      '<button type="button" data-act="play">Play / Pause</button>' +
      '<button type="button" data-act="next">Beat →</button>' +
      '</div>';

    root.appendChild(bar);
    root.appendChild(eraRail);
    root.appendChild(rail);
    root.appendChild(cap);
    document.body.appendChild(root);
    state.root = root;

    root.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-act]');
      if (!t) return;
      var act = t.getAttribute('data-act');
      if (act === 'prev') prev();
      else if (act === 'next') next();
      else if (act === 'play') togglePlay();
      else if (act === 'exit') exit();
      else if (act === 'mode') toggleMode();
      else if (act === 'goto') {
        var i = parseInt(t.getAttribute('data-i'), 10);
        if (!isNaN(i)) goChapter(i, true);
      } else if (act === 'goto-act') {
        var a = parseInt(t.getAttribute('data-act-n'), 10);
        if (!isNaN(a) && state.data) {
          for (var j = 0; j < state.data.chapters.length; j++) {
            if ((state.data.chapters[j].act|0) === a) { goChapter(j, true); break; }
          }
        }
      }
    });

    bar.querySelector('.doc-track').addEventListener('click', function (ev) {
      if (!state.data || !state.data.chapters.length) return;
      var r = ev.currentTarget.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      /* scrub by time, not chapter index — multi-hour film */
      var totalS = totalDurationS(state.data);
      var targetS = pct * totalS;
      var acc = 0;
      var i = 0;
      for (; i < state.data.chapters.length; i++) {
        acc += (state.data.chapters[i].duration_s || 30);
        if (acc >= targetS) break;
      }
      goChapter(Math.min(i, state.data.chapters.length - 1), true);
    });
  }

  function updateHud() {
    if (!state.root || !state.data) return;
    var ch = state.data.chapters[state.index];
    var total = state.data.chapters.length;
    var totalS = totalDurationS(state.data);
    var elap = elapsedToIndex(state.data, state.index);
    var pct = totalS ? Math.round((elap / totalS) * 100) : 0;
    var fill = state.root.querySelector('.doc-fill');
    var count = state.root.querySelector('.doc-count');
    var timeEl = state.root.querySelector('.doc-time');
    var track = state.root.querySelector('.doc-track');
    if (fill) fill.style.width = pct + '%';
    if (count) count.textContent = (state.index + 1) + ' / ' + total;
    if (timeEl) {
      var totLabel = (state.data.totals && state.data.totals.duration_label) || fmtHours(totalS);
      timeEl.textContent = fmtHours(elap) + ' / ' + totLabel;
    }
    if (track) track.setAttribute('aria-valuenow', String(pct));

    var kick = state.root.querySelector('.doc-kicker');
    var title = state.root.querySelector('.doc-title');
    var sub = state.root.querySelector('.doc-sub');
    if (kick) {
      var era = ch.era ? String(ch.era).toUpperCase() : '';
      var years = ch.years ? ' · ' + ch.years : '';
      kick.textContent = (ch.kicker || ('ACT ' + (ch.act != null ? ch.act : ''))) +
        (era ? ' · ' + era : '') + years;
    }
    if (title) title.textContent = ch.title || '';
    if (sub) sub.textContent = ch.narration || '';

    /* sources + public social */
    var srcBox = state.root.querySelector('.doc-sources');
    if (srcBox) {
      srcBox.innerHTML = '';
      var all = [];
      (ch.sources || []).forEach(function (s) {
        all.push({ kind: 'GOV', label: s.label || s.url, url: s.url });
      });
      (ch.social || []).forEach(function (s) {
        all.push({ kind: 'SOCIAL', label: s.label || s.url, url: s.url });
      });
      all.slice(0, 8).forEach(function (s) {
        var a = el('a', 'doc-src-chip');
        a.href = s.url || '#';
        if (s.url && /^https?:/i.test(s.url)) a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = '<span class="doc-src-k">' + s.kind + '</span> ' + (s.label || '');
        srcBox.appendChild(a);
      });
      if (!all.length) {
        srcBox.innerHTML = '<span class="doc-src-empty">Primary sources attached at site destination</span>';
      }
    }

    var modeBtn = state.root.querySelector('.doc-mode');
    if (modeBtn) {
      modeBtn.textContent = state.mode === 'watch' ? 'WATCH' : (state.mode === 'research' ? 'RESEARCH' : 'NAVIGATE');
      modeBtn.classList.toggle('is-watch', state.mode === 'watch');
    }
    state.root.classList.toggle('doc-live', state.playing);
    state.root.classList.toggle('doc-navigate', state.mode !== 'watch');

    var playBtn = state.root.querySelectorAll('[data-act="play"]');
    playBtn.forEach(function (b) {
      b.textContent = state.playing ? 'PAUSE' : 'PLAY';
    });

    /* era rail */
    var eraRail = state.root.querySelector('.doc-era-rail');
    if (eraRail) {
      eraRail.innerHTML = '';
      var actsSeen = {};
      var actOrder = [];
      state.data.chapters.forEach(function (c) {
        var a = c.act != null ? (c.act|0) : 0;
        if (actsSeen[a] == null) {
          actsSeen[a] = c.kicker || ('ACT ' + a);
          actOrder.push(a);
        }
      });
      var curAct = ch.act != null ? (ch.act|0) : 0;
      actOrder.forEach(function (a) {
        var b = el('button', 'era-item' + (a === curAct ? ' is-current' : ''));
        b.type = 'button';
        b.setAttribute('data-act', 'goto-act');
        b.setAttribute('data-act-n', String(a));
        b.textContent = 'A' + a;
        b.title = actsSeen[a] || ('Act ' + a);
        eraRail.appendChild(b);
      });
    }

    /* chapter rail — only current act for multi-hour readability */
    var rail = state.root.querySelector('.doc-chapter-rail');
    if (rail) {
      rail.innerHTML = '';
      var curA = ch.act != null ? (ch.act|0) : 0;
      state.data.chapters.forEach(function (c, i) {
        if ((c.act|0) !== curA) return;
        var b = el('button', 'ch-item' + (i === state.index ? ' is-current' : ''));
        b.type = 'button';
        b.setAttribute('data-act', 'goto');
        b.setAttribute('data-i', String(i));
        b.innerHTML = '<span class="ch-k">' + (c.years || c.kicker || '') + '</span>' +
          '<span class="ch-t">' + (c.title || '') + '</span>';
        rail.appendChild(b);
      });
    }
    saveProgress();
  }

  function playChapter() {
    clearAdvance();
    if (!state.data) return;
    var ch = state.data.chapters[state.index];
    if (!ch) return;
    updateHud();
    goToPage(ch.page);
    /* slight delay for page paint when same-page */
    setTimeout(function () {
      applyHighlight(ch.highlight);
    }, 350);

    if (!state.playing) return;

    var text = ch.narration || ch.title || '';
    var duration = (ch.duration_s || 30) * 1000;
    var advanced = false;
    var advance = function () {
      if (advanced || !state.playing) return;
      advanced = true;
      if (state.index >= state.data.chapters.length - 1) {
        state.playing = false;
        updateHud();
        return;
      }
      state.index += 1;
      playChapter();
    };

    speak(text, function () {
      if (state.mode === 'watch' && state.playing) {
        state.advanceTimer = setTimeout(advance, 1200);
      }
    });
    /* hard ceiling so silent TTS cannot freeze film */
    state.advanceTimer = setTimeout(advance, duration + 4000);
  }

  function goChapter(i, user) {
    if (!state.data) return;
    clearAdvance();
    stopSpeech();
    state.index = Math.max(0, Math.min(state.data.chapters.length - 1, i));
    if (user && state.mode === 'navigate') {
      state.playing = false;
    }
    playChapter();
  }

  function next() { goChapter(state.index + 1, true); }
  function prev() { goChapter(state.index - 1, true); }

  function togglePlay() {
    if (!state.data) return;
    state.playing = !state.playing;
    if (state.playing) {
      playChapter();
    } else {
      clearAdvance();
      stopSpeech();
      updateHud();
    }
  }

  function toggleMode() {
    /* watch → navigate → research → watch */
    if (state.mode === 'watch') state.mode = 'navigate';
    else if (state.mode === 'navigate') state.mode = 'research';
    else state.mode = 'watch';
    updateHud();
  }

  function exit() {
    state.playing = false;
    clearAdvance();
    stopSpeech();
    clearHighlight();
    if (state.root) {
      state.root.classList.remove('doc-live', 'doc-navigate');
      try { state.root.remove(); } catch (e) {}
      state.root = null;
    }
  }

  function ensureStartButton() {
    /* No floating chrome on product pages — film lives at /liril-film.html */
    if (document.getElementById('liril-doc-start')) return;
    var path = (window.location.pathname || '');
    if (path.indexOf('liril-film') >= 0 || path.indexOf('index.html') >= 0 || path === '/' || path.endsWith('/')) {
      return;
    }
    /* Only show on experience / about when explicitly wanted */
    if (path.indexOf('experience') < 0 && path.indexOf('about') < 0) return;
    injectCss();
    var btn = el('button', 'liril-doc-start');
    btn.id = 'liril-doc-start';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open multi-hour LIRIL film of Canada');
    btn.innerHTML = 'Full film';
    btn.title = 'Multi-hour LIRIL film — origins to now';
    btn.addEventListener('click', function (ev) {
      if (!ev.shiftKey) {
        ev.preventDefault();
        ev.stopPropagation();
        window.location.href = FULL_FILM_URL;
      }
    }, true);
    btn.setAttribute('title', 'Watchable + navigable guided tour of the record');
    btn.addEventListener('click', function () {
      start(true);
    });
    /* Avoid double CTA on pages that already ship their own documentary button */
    if (!document.getElementById('btn-doc') && !document.querySelector('.doc-cta')) {
      document.body.appendChild(btn);
    }
  }

  function start(fromUser) {
    renderHud();
    function run() {
      state.playing = true;
      state.mode = 'watch';
      /* resume chapter from query if present, else localStorage */
      try {
        var q = new URLSearchParams(window.location.search || '');
        if (q.get('ch') != null) {
          var ci = parseInt(q.get('ch'), 10);
          if (!isNaN(ci)) state.index = ci;
        } else {
          var prog = loadProgress();
          if (prog && typeof prog.index === 'number') state.index = prog.index;
        }
      } catch (e) {}
      updateHud();
      playChapter();
    }
    if (state.data) {
      run();
      return;
    }
    fetch(CHAPTERS_URL, { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.data = data;
        if (data.storage_key) state.storageKey = data.storage_key;
        if (data.default_mode) state.mode = data.default_mode;
        if (fromUser && data.voice_intro) {
          /* intro then resume index */
          state.playing = true;
          renderHud();
          var startIdx = 0;
          try {
            var prog = loadProgress();
            if (prog && typeof prog.index === 'number') startIdx = prog.index;
          } catch (e2) {}
          updateHud();
          speak(data.voice_intro, function () {
            state.index = startIdx;
            playChapter();
          });
        } else {
          run();
        }
      })
      .catch(function () {
        state.data = {
          chapters: [{
            id: 'fallback',
            title: 'Daily briefing',
            kicker: 'LIRIL',
            page: 'daily-briefing.html',
            duration_s: 20,
            narration: 'Open the daily briefing to see what the Canadian government is doing and the future plans map.',
            highlight: 'main'
          }]
        };
        run();
      });
  }

  function onKey(ev) {
    if (!state.root || !state.playing && ev.key !== 'd') return;
    if (ev.key === 'Escape') { exit(); return; }
    if (ev.key === ' ' || ev.code === 'Space') {
      ev.preventDefault();
      togglePlay();
    } else if (ev.key === 'ArrowRight') next();
    else if (ev.key === 'ArrowLeft') prev();
    else if (ev.key === 'm' || ev.key === 'M') toggleMode();
  }

  function boot() {
    injectCss();
    ensureStartButton();
    document.addEventListener('keydown', onKey);

    /* Auto-resume if shell navigated with ?doc=1 */
    try {
      var q = new URLSearchParams(window.location.search || '');
      if (q.get('doc') === '1') {
        setTimeout(function () { start(false); }, 600);
      }
    } catch (e) {}

    /* Public API */
    window.LIRIL_DOCUMENTARY = {
      start: function () { start(true); },
      stop: exit,
      next: next,
      prev: prev,
      go: goChapter,
      toggleMode: toggleMode,
      getState: function () {
        var tot = state.data ? totalDurationS(state.data) : 0;
        var elap = state.data ? elapsedToIndex(state.data, state.index) : 0;
        return {
          index: state.index,
          playing: state.playing,
          mode: state.mode,
          total: state.data ? state.data.chapters.length : 0,
          duration_s: tot,
          elapsed_s: elap,
          duration_label: state.data && state.data.totals ? state.data.totals.duration_label : fmtHours(tot),
          hours: tot / 3600
        };
      }
    };

    if (window.LIRIL) {
      window.LIRIL.startDocumentary = function () { start(true); };
      window.LIRIL.stopDocumentary = exit;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
