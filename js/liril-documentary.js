/* ═══════════════════════════════════════════════════════════════════════════
   LIRIL DOCUMENTARY ENGINE v1.0
   Fully guided website tour — watchable film + navigable chapters.
   Loads data/documentary_chapters.json; uses LIRIL_VOICE when available.
   QUANTANIUM ice HUD via css/documentary-tour.css
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__LIRIL_DOCUMENTARY_LOADED) return;
  window.__LIRIL_DOCUMENTARY_LOADED = true;

  var CHAPTERS_URL = '/data/documentary_chapters.json';
  var CSS_HREF = '/css/documentary-tour.css?v=1';
  var state = {
    data: null,
    index: 0,
    mode: 'watch', /* watch | navigate */
    playing: false,
    advanceTimer: null,
    root: null,
    lastHighlight: null
  };

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
      '<span class="doc-brand">LIRIL · DOCUMENTARY</span>' +
      '<div class="doc-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      '<div class="doc-fill"></div></div>' +
      '<span class="doc-count">—</span>' +
      '<button type="button" class="doc-mode is-watch" data-act="mode">WATCH</button>' +
      '<button type="button" class="doc-ctrl" data-act="prev">PREV</button>' +
      '<button type="button" class="doc-ctrl" data-act="play">PLAY</button>' +
      '<button type="button" class="doc-ctrl" data-act="next">NEXT</button>' +
      '<button type="button" class="doc-ctrl danger" data-act="exit">EXIT</button>';

    var rail = el('div', 'doc-chapter-rail');
    rail.setAttribute('aria-label', 'Documentary chapters');

    var cap = el('div', 'doc-caption');
    cap.innerHTML =
      '<div class="doc-kicker">—</div>' +
      '<h2 class="doc-title">—</h2>' +
      '<p class="doc-sub"></p>' +
      '<div class="doc-nav">' +
      '<button type="button" data-act="prev">← Chapter</button>' +
      '<button type="button" data-act="play">Play / Pause</button>' +
      '<button type="button" data-act="next">Chapter →</button>' +
      '</div>';

    root.appendChild(bar);
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
      }
    });

    bar.querySelector('.doc-track').addEventListener('click', function (ev) {
      if (!state.data || !state.data.chapters.length) return;
      var r = ev.currentTarget.getBoundingClientRect();
      var pct = (ev.clientX - r.left) / r.width;
      var i = Math.min(state.data.chapters.length - 1,
        Math.max(0, Math.floor(pct * state.data.chapters.length)));
      goChapter(i, true);
    });
  }

  function updateHud() {
    if (!state.root || !state.data) return;
    var ch = state.data.chapters[state.index];
    var total = state.data.chapters.length;
    var pct = total ? Math.round(((state.index + 1) / total) * 100) : 0;
    var fill = state.root.querySelector('.doc-fill');
    var count = state.root.querySelector('.doc-count');
    var track = state.root.querySelector('.doc-track');
    if (fill) fill.style.width = pct + '%';
    if (count) count.textContent = (state.index + 1) + ' / ' + total;
    if (track) track.setAttribute('aria-valuenow', String(pct));

    var kick = state.root.querySelector('.doc-kicker');
    var title = state.root.querySelector('.doc-title');
    var sub = state.root.querySelector('.doc-sub');
    if (kick) kick.textContent = ch.kicker || ('CHAPTER ' + (state.index + 1));
    if (title) title.textContent = ch.title || '';
    if (sub) sub.textContent = ch.narration || '';

    var modeBtn = state.root.querySelector('.doc-mode');
    if (modeBtn) {
      modeBtn.textContent = state.mode === 'watch' ? 'WATCH' : 'NAVIGATE';
      modeBtn.classList.toggle('is-watch', state.mode === 'watch');
    }
    state.root.classList.toggle('doc-live', state.playing);
    state.root.classList.toggle('doc-navigate', state.mode === 'navigate');

    var playBtn = state.root.querySelectorAll('[data-act="play"]');
    playBtn.forEach(function (b) {
      b.textContent = state.playing ? 'PAUSE' : 'PLAY';
    });

    /* rail */
    var rail = state.root.querySelector('.doc-chapter-rail');
    if (rail) {
      rail.innerHTML = '';
      state.data.chapters.forEach(function (c, i) {
        var b = el('button', 'ch-item' + (i === state.index ? ' is-current' : ''));
        b.type = 'button';
        b.setAttribute('data-act', 'goto');
        b.setAttribute('data-i', String(i));
        b.innerHTML = '<span class="ch-k">' + (c.kicker || '') + '</span>' +
          '<span class="ch-t">' + (c.title || '') + '</span>';
        rail.appendChild(b);
      });
    }
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
    state.mode = state.mode === 'watch' ? 'navigate' : 'watch';
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
    if (document.getElementById('liril-doc-start')) return;
    injectCss();
    var btn = el('button', 'liril-doc-start');
    btn.id = 'liril-doc-start';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Start LIRIL documentary tour of the website');
    btn.innerHTML = '▶ Documentary';
    btn.addEventListener('click', function () {
      start(true);
    });
    document.body.appendChild(btn);
  }

  function start(fromUser) {
    renderHud();
    function run() {
      state.playing = true;
      state.mode = 'watch';
      /* resume chapter from query if present */
      try {
        var q = new URLSearchParams(window.location.search || '');
        if (q.get('ch') != null) {
          var ci = parseInt(q.get('ch'), 10);
          if (!isNaN(ci)) state.index = ci;
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
        if (data.default_mode) state.mode = data.default_mode;
        if (fromUser && data.voice_intro) {
          /* intro then chapter 0 */
          state.playing = true;
          renderHud();
          updateHud();
          speak(data.voice_intro, function () {
            state.index = 0;
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
        return {
          index: state.index,
          playing: state.playing,
          mode: state.mode,
          total: state.data ? state.data.chapters.length : 0
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
