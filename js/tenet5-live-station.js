/* TENET5 LIVE v4 — live news station + real-time time/topic navigation.
 *
 * HARD RULE (Daniel 2026-07-12): NOTHING plays until the user hits play / Join live / Unmute.
 * No auto-join, no auto-play, no LIRIL mux VO on page load.
 * Explore = navigate by time rail + topic chips without leaving the station.
 * Join live snaps to wall-clock position — still requires that user click.
 */
(function () {
  'use strict';
  if (window.TENET5_LIVE && window.TENET5_LIVE.__v >= 4) return;

  var schedule = null;
  var idx = 0;
  var playing = false;
  var joined = false;
  var userArmed = false; /* true only after explicit user activation */
  var seekPending = 0;
  var mode = 'live'; /* live | explore */
  var topicFilter = 'ALL';
  var followLive = true; /* when true, periodically re-sync to wall clock if drifted */

  function $(id) { return document.getElementById(id); }
  function video() { return $('tls-video'); }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function etClock() {
    try {
      return new Date().toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' ET';
    } catch (e) {
      return new Date().toLocaleString();
    }
  }

  function etSeconds() {
    try {
      var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
      }).formatToParts(new Date());
      var h = 0, m = 0, s = 0;
      parts.forEach(function (p) {
        if (p.type === 'hour') h = parseInt(p.value, 10) || 0;
        if (p.type === 'minute') m = parseInt(p.value, 10) || 0;
        if (p.type === 'second') s = parseInt(p.value, 10) || 0;
      });
      return h * 3600 + m * 60 + s;
    } catch (e) {
      var d = new Date();
      return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
    }
  }

  function items() { return (schedule && schedule.linear) || []; }
  function totalDur() { return (schedule && schedule.total_duration_s) || 0; }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function wallPos() {
    var T = totalDur();
    if (T <= 0) return 0;
    return etSeconds() % T;
  }

  function findAtPackageTime(pos) {
    var list = items();
    if (!list.length) return { index: 0, offset: 0 };
    var T = totalDur();
    pos = Math.max(0, Math.min(T - 0.05, pos));
    for (var i = 0; i < list.length; i++) {
      var a = list[i].start_s || 0;
      var b = list[i].end_s || (a + (list[i].duration_s || 0));
      if (pos >= a && pos < b) {
        return { index: i, offset: Math.max(0, pos - a) };
      }
    }
    return { index: list.length - 1, offset: 0 };
  }

  function findJoinIndex() {
    return findAtPackageTime(wallPos());
  }

  function topics() {
    var set = {};
    var order = [];
    items().forEach(function (it) {
      var d = (it.desk || 'DESK').toUpperCase();
      if (!set[d]) { set[d] = true; order.push(d); }
    });
    return order;
  }

  function setMode(m) {
    mode = m === 'explore' ? 'explore' : 'live';
    followLive = mode === 'live';
    var root = $('tls-root');
    if (root) {
      root.setAttribute('data-mode', mode);
      root.classList.toggle('is-explore', mode === 'explore');
      root.classList.toggle('is-live', mode === 'live');
    }
    document.querySelectorAll('[data-tls-mode]').forEach(function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute('data-tls-mode') === mode);
    });
    var badge = $('tls-mode-badge');
    if (badge) {
      badge.textContent = mode === 'live' ? 'LIVE FEED' : 'TIME / TOPIC NAV';
      badge.className = 'tls-mode-badge ' + (mode === 'live' ? 'live' : 'explore');
    }
  }

  function setHud(item, status) {
    var live = $('tls-live');
    var desk = $('tls-desk');
    var block = $('tls-block');
    var title = $('tls-title');
    var lede = $('tls-lede');
    var nowNext = $('tls-now-next');
    var prog = $('tls-prog');
    var clock = $('tls-clock');
    var st = $('tls-status');
    var open = $('tls-open-source');
    if (clock) clock.textContent = etClock();
    if (!item) return;
    if (live) {
      live.classList.toggle('on', mode === 'live' && playing);
      live.innerHTML = mode === 'live'
        ? '<i></i> LIVE'
        : '<i></i> NAV';
    }
    if (desk) desk.textContent = 'TENET5 · ' + (item.desk || 'DESK');
    if (block) {
      var bl = (item.block || item.kind || 'desk').toUpperCase();
      if (bl === 'DESK') bl = 'DESK HITS';
      if (bl === 'REPORTS') bl = 'REPORT BLOCK';
      if (bl === 'CASE') bl = 'CASE FILM';
      block.textContent = bl;
    }
    if (title) title.textContent = item.title || '';
    if (lede) lede.textContent = item.lede || (schedule && schedule.one_line) || '';
    if (prog) prog.textContent = (idx + 1) + ' / ' + items().length;
    if (open) {
      open.href = item.href || 'daily-briefing.html';
      open.style.display = '';
    }
    if (nowNext) {
      var list = items();
      var next = list[(idx + 1) % list.length];
      nowNext.innerHTML =
        '<div><span class="tls-nn-lab">NOW</span> ' + esc(item.title || '') + '</div>' +
        (next ? '<div><span class="tls-nn-lab">NEXT</span> ' + esc(next.title || '') + '</div>' : '');
    }
    if (st) {
      if (status) st.textContent = status;
      else if (mode === 'explore') st.textContent = 'NAVIGATING · NOT LIVE';
      else st.textContent = playing ? 'ON AIR' : 'STANDBY';
    }
    document.querySelectorAll('.tls-pl-item').forEach(function (el) {
      el.classList.toggle('is-on', el.getAttribute('data-id') === item.id);
    });
    document.querySelectorAll('.tls-topic').forEach(function (el) {
      var t = el.getAttribute('data-topic');
      el.classList.toggle('is-on', t === topicFilter || (topicFilter === 'ALL' && t === 'ALL'));
    });
    paintTimeRail();
  }

  function paintTopics() {
    var host = $('tls-topics');
    if (!host) return;
    var html = '<button type="button" class="tls-topic is-on" data-topic="ALL">ALL</button>';
    html += '<button type="button" class="tls-topic" data-topic="desk" data-block="desk">DESK</button>';
    html += '<button type="button" class="tls-topic" data-topic="reports" data-block="reports">REPORTS</button>';
    html += '<button type="button" class="tls-topic" data-topic="case" data-block="case">CASE</button>';
    topics().forEach(function (t) {
      html += '<button type="button" class="tls-topic" data-topic="' + esc(t) + '">' + esc(t) + '</button>';
    });
    host.innerHTML = html;
    host.querySelectorAll('.tls-topic').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-topic');
        var block = btn.getAttribute('data-block');
        if (block) {
          /* jump to first item of daypart block */
          setMode('explore');
          topicFilter = 'ALL';
          var list = items();
          for (var i = 0; i < list.length; i++) {
            if (list[i].block === block) {
              playAt(i, 0, true);
              paintPlaylist();
              return;
            }
          }
          return;
        }
        topicFilter = t || 'ALL';
        setMode('explore');
        paintPlaylist();
        /* jump to first matching topic */
        if (topicFilter !== 'ALL') {
          var list2 = items();
          for (var j = 0; j < list2.length; j++) {
            if ((list2[j].desk || '').toUpperCase() === topicFilter) {
              playAt(j, 0, true);
              return;
            }
          }
        }
      });
    });
  }

  function paintPlaylist() {
    var host = $('tls-playlist');
    if (!host) return;
    var list = items();
    var html = '';
    var lastBlock = '';
    list.forEach(function (it, i) {
      if (topicFilter !== 'ALL' && (it.desk || '').toUpperCase() !== topicFilter) return;
      if (it.block !== lastBlock) {
        lastBlock = it.block;
        var lab = lastBlock === 'desk' ? 'DESK HITS' : lastBlock === 'reports' ? 'REPORT BLOCK' : 'CASE FILM';
        html += '<div class="tls-pl-head">' + esc(lab) + '</div>';
      }
      html +=
        '<button type="button" class="tls-pl-item" data-id="' + esc(it.id) + '" data-idx="' + i + '">' +
        '<span class="tls-pl-desk">' + esc(it.desk || '') + '</span>' +
        '<span class="tls-pl-title">' + esc(it.title || '') + '</span>' +
        '<span class="tls-pl-dur">' + fmtTime(it.duration_s) + '</span>' +
        '</button>';
    });
    if (!html) html = '<div class="tls-pl-empty">No hits for this topic.</div>';
    host.innerHTML = html;
    host.querySelectorAll('.tls-pl-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode('explore');
        var i = parseInt(btn.getAttribute('data-idx'), 10);
        playAt(i, 0, true);
      });
    });
  }

  function paintTimeRail() {
    var rail = $('tls-time-rail');
    var fill = $('tls-time-fill');
    var liveMark = $('tls-live-mark');
    var packLab = $('tls-pack-time');
    var wallLab = $('tls-wall-time');
    var T = totalDur();
    if (!T) return;
    var list = items();
    var item = list[idx];
    var v = video();
    var cur = 0;
    if (item) {
      cur = (item.start_s || 0) + (v && !isNaN(v.currentTime) ? v.currentTime : 0);
    }
    var pct = Math.min(100, (cur / T) * 100);
    var livePct = Math.min(100, (wallPos() / T) * 100);
    if (fill) fill.style.width = pct + '%';
    if (liveMark) liveMark.style.left = livePct + '%';
    if (packLab) packLab.textContent = fmtTime(cur) + ' / ' + fmtTime(T);
    if (wallLab) wallLab.textContent = 'LIVE @ ' + fmtTime(wallPos());
    /* daypart segments on rail */
    var segs = $('tls-time-segs');
    if (segs && !segs.dataset.built) {
      var html = '';
      list.forEach(function (it) {
        var left = ((it.start_s || 0) / T) * 100;
        var w = ((it.duration_s || 0) / T) * 100;
        var cls = 'tls-tseg tls-tseg-' + (it.block || 'desk');
        html += '<button type="button" class="' + cls + '" style="left:' + left + '%;width:' + Math.max(w, 0.4) + '%" data-idx="' +
          items().indexOf(it) + '" title="' + esc(it.title) + '"></button>';
      });
      segs.innerHTML = html;
      segs.dataset.built = '1';
      segs.querySelectorAll('.tls-tseg').forEach(function (b) {
        b.addEventListener('click', function (ev) {
          ev.stopPropagation();
          userArmed = true;
          setMode('explore');
          playAt(parseInt(b.getAttribute('data-idx'), 10) || 0, 0, true, { muted: true });
        });
      });
    }
  }

  function loadSrc(item) {
    var v = video();
    if (!v || !item) return;
    var s = v.querySelector('source') || document.createElement('source');
    s.src = item.video;
    s.type = 'video/mp4';
    if (!s.parentNode) v.appendChild(s);
    v.querySelectorAll('track').forEach(function (t) { t.remove(); });
    if (item.vtt) {
      var tr = document.createElement('track');
      tr.kind = 'captions';
      tr.srclang = 'en-CA';
      tr.label = 'LIRIL';
      tr.src = item.vtt;
      tr.default = true;
      v.appendChild(tr);
    }
    v.load();
  }

  function killOtherVoice() {
    try {
      if (window.LIRIL_VOICE && window.LIRIL_VOICE.stopAll) window.LIRIL_VOICE.stopAll();
      else if (window.LIRIL_VOICE && window.LIRIL_VOICE.stop) window.LIRIL_VOICE.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (window.LIRIL_STATION && window.LIRIL_STATION.stop) window.LIRIL_STATION.stop();
      if (window.LIRIL_HOME_GUIDE && window.LIRIL_HOME_GUIDE.stop) window.LIRIL_HOME_GUIDE.stop();
      if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.stopLive) window.LIRIL_REPORTER.stopLive();
    } catch (eKill) { /* */ }
  }

  function playAt(i, offset, user, opts) {
    opts = opts || {};
    var forceMuted = opts.muted === true;
    var list = items();
    if (!list.length) return;
    /* HARD: never start media without user arming the station */
    if (!userArmed && !user && opts.force !== true) {
      cueAt(i, offset, 'STANDBY · TAP JOIN LIVE OR PLAY');
      return;
    }
    if (user) userArmed = true;
    idx = ((i % list.length) + list.length) % list.length;
    var item = list[idx];
    if (user) setMode('explore');
    loadSrc(item);
    setHud(item, user ? 'NAVIGATING' : (mode === 'live' ? 'ON AIR' : 'NAVIGATING'));
    var v = video();
    if (!v) return;
    seekPending = offset || 0;
    var onMeta = function () {
      v.removeEventListener('loadedmetadata', onMeta);
      if (seekPending > 0.4 && seekPending < (item.duration_s || 999) - 0.5) {
        try { v.currentTime = seekPending; } catch (e) { /* */ }
      }
      seekPending = 0;
      /* Default MUTED until user taps Unmute — mux files carry LIRIL VO audio */
      if (!forceMuted && user && opts.sound === true) {
        killOtherVoice();
        v.muted = false;
      } else {
        v.muted = true;
        v.setAttribute('muted', '');
      }
      if (!userArmed) {
        v.pause();
        playing = false;
        setHud(item, 'STANDBY · TAP PLAY');
        return;
      }
      var p = v.play();
      if (p && p.catch) {
        p.catch(function () {
          /* Do NOT retry-play. User must hit the control again. */
          v.pause();
          playing = false;
          var st = $('tls-status');
          if (st) st.textContent = 'TAP PLAY TO START';
        });
      }
      playing = true;
      joined = true;
      setHud(item);
      if (v.muted) {
        var st2 = $('tls-status');
        if (st2 && st2.textContent.indexOf('UNMUTE') < 0) {
          st2.textContent = (mode === 'live' ? 'ON AIR' : 'NAV') + ' · MUTED · TAP UNMUTE FOR SOUND';
        }
      }
    };
    if (v.readyState >= 1) onMeta();
    else v.addEventListener('loadedmetadata', onMeta);
  }

  /** Cue item + HUD without playing (standby). */
  function cueAt(i, offset, statusText) {
    var list = items();
    if (!list.length) return;
    idx = ((i % list.length) + list.length) % list.length;
    var item = list[idx];
    loadSrc(item);
    setHud(item, statusText || 'STANDBY · TAP JOIN LIVE OR PLAY');
    var v = video();
    if (!v) return;
    v.muted = true;
    v.setAttribute('muted', '');
    seekPending = offset || 0;
    var onMeta = function () {
      v.removeEventListener('loadedmetadata', onMeta);
      if (seekPending > 0.4 && seekPending < (item.duration_s || 999) - 0.5) {
        try { v.currentTime = seekPending; } catch (e) { /* */ }
      }
      seekPending = 0;
      try { v.pause(); } catch (e2) { /* */ }
      playing = false;
    };
    if (v.readyState >= 1) onMeta();
    else v.addEventListener('loadedmetadata', onMeta);
  }

  function advance() {
    if (!userArmed) return;
    var list = items();
    if (!list.length) return;
    /* In live mode after end of package, re-join wall clock; else next item */
    if (mode === 'live' && idx >= list.length - 1) {
      joinLive(true);
      return;
    }
    playAt(idx + 1, 0, true);
  }

  function joinLive(fromUser) {
    /* Only play when user armed the station (click / key). fromUser=true arms. */
    if (fromUser) userArmed = true;
    if (!userArmed) {
      setMode('live');
      topicFilter = 'ALL';
      paintPlaylist();
      var j0 = findJoinIndex();
      cueAt(j0.index, j0.offset, 'STANDBY · TAP JOIN LIVE OR PLAY');
      return;
    }
    setMode('live');
    topicFilter = 'ALL';
    paintPlaylist();
    var j = findJoinIndex();
    playAt(j.index, j.offset, true, { muted: true });
    var st = $('tls-status');
    if (st) st.textContent = 'JOINED LIVE · MUTED · TAP UNMUTE FOR SOUND';
  }

  function seekPackageTime(pos) {
    setMode('explore');
    var j = findAtPackageTime(pos);
    playAt(j.index, j.offset, true);
  }

  function bindVideo() {
    var v = video();
    if (!v) return;
    v.addEventListener('ended', function () { advance(); });
    v.addEventListener('play', function () {
      playing = true;
      var item = items()[idx];
      if (item) setHud(item);
    });
    v.addEventListener('pause', function () {
      if (!v.ended) {
        var st = $('tls-status');
        if (st) st.textContent = 'PAUSED';
      }
    });
    v.addEventListener('timeupdate', function () {
      paintTimeRail();
      var bar = $('tls-bar');
      if (bar && v.duration) {
        bar.style.width = Math.min(100, (v.currentTime / v.duration) * 100) + '%';
      }
    });
  }

  function bindControls() {
    var go = $('tls-join');
    if (go) go.addEventListener('click', function () { joinLive(true); });
    var next = $('tls-next');
    if (next) next.addEventListener('click', function () {
      userArmed = true;
      setMode('explore');
      advance();
    });
    var prev = $('tls-prev');
    if (prev) prev.addEventListener('click', function () {
      userArmed = true;
      setMode('explore');
      playAt(idx - 1, 0, true);
    });
    var mute = $('tls-unmute');
    if (mute) mute.addEventListener('click', function () {
      var v = video();
      if (!v) return;
      userArmed = true;
      killOtherVoice();
      v.muted = false;
      v.removeAttribute('muted');
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* need gesture */ });
      var st = $('tls-status');
      if (st) st.textContent = 'ON AIR · SOUND ON';
    });
    document.querySelectorAll('[data-tls-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var m = btn.getAttribute('data-tls-mode');
        if (m === 'live') joinLive(true);
        else setMode('explore');
      });
    });
    var rail = $('tls-time-rail');
    if (rail) {
      rail.addEventListener('click', function (ev) {
        userArmed = true;
        var rect = rail.getBoundingClientRect();
        var x = (ev.clientX - rect.left) / Math.max(1, rect.width);
        seekPackageTime(x * totalDur());
      });
    }
    /* Native video controls: first play is user activation */
    var v = video();
    if (v) {
      v.addEventListener('play', function () {
        userArmed = true;
        playing = true;
        joined = true;
      });
      /* Block programmatic autoplay before arm: if something else calls play, re-pause */
      v.addEventListener('playing', function () {
        if (!userArmed) {
          try { v.pause(); v.muted = true; } catch (eP) { /* */ }
          playing = false;
          var st = $('tls-status');
          if (st) st.textContent = 'STANDBY · TAP PLAY TO START';
        }
      });
    }
    /* keyboard: arrows = prev/next, L = live, T = explore — only after user focus on page is a gesture */
    document.addEventListener('keydown', function (ev) {
      if (!document.getElementById('tls-root')) return;
      var tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (ev.key === 'ArrowRight') { userArmed = true; setMode('explore'); advance(); }
      if (ev.key === 'ArrowLeft') { userArmed = true; setMode('explore'); playAt(idx - 1, 0, true); }
      if (ev.key === 'l' || ev.key === 'L') joinLive(true);
      if (ev.key === 't' || ev.key === 'T') setMode('explore');
    });
  }

  function tick() {
    var clock = $('tls-clock');
    if (clock) clock.textContent = etClock();
    paintTimeRail();
    /* gentle live follow: if user is in live mode and drifted >12s, rejoin */
    if (mode === 'live' && followLive && playing) {
      var list = items();
      var item = list[idx];
      var v = video();
      if (item && v && !v.paused) {
        var cur = (item.start_s || 0) + (v.currentTime || 0);
        var live = wallPos();
        if (Math.abs(cur - live) > 18) {
          var j = findJoinIndex();
          if (j.index !== idx || Math.abs((v.currentTime || 0) - j.offset) > 8) {
            playAt(j.index, j.offset, false);
          }
        }
      }
    }
  }

  function boot(sched) {
    schedule = sched;
    paintTopics();
    paintPlaylist();
    bindVideo();
    bindControls();
    setMode('live');
    setInterval(tick, 400);
    /* NO auto-join. Cue wall-clock slot muted+paused until user hits Join live / Play. */
    userArmed = false;
    joined = false;
    playing = false;
    var j = findJoinIndex();
    cueAt(j.index, j.offset, 'STANDBY · TAP JOIN LIVE OR PLAY');
    killOtherVoice();
    var one = $('tls-oneline');
    if (one && schedule.one_line) one.textContent = schedule.one_line;
    var tag = $('tls-tagline');
    if (tag && schedule.tagline) tag.textContent = schedule.tagline;
    var n = $('tls-count');
    if (n) n.textContent = schedule.item_count + ' hits · ' + fmtTime(schedule.total_duration_s) + ' loop · silent until you play';
  }

  function load() {
    return fetch('data/tenet5_live_schedule.json?v=' + Date.now(), { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.linear || !d.linear.length) {
          var st = $('tls-status');
          if (st) st.textContent = 'SCHEDULE OFF AIR';
          return null;
        }
        boot(d);
        return d;
      })
      .catch(function () {
        var st = $('tls-status');
        if (st) st.textContent = 'SCHEDULE OFF AIR';
        return null;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }

  window.TENET5_LIVE = {
    __v: 4,
    join: function () { joinLive(true); },
    next: advance,
    playAt: function (i, o, u, opts) {
      if (u) userArmed = true;
      return playAt(i, o, !!u, opts || {});
    },
    seekTime: function (pos) {
      userArmed = true;
      return seekPackageTime(pos);
    },
    setTopic: function (t) {
      topicFilter = t || 'ALL';
      setMode('explore');
      paintPlaylist();
    },
    load: load,
    getSchedule: function () { return schedule; },
    getMode: function () { return mode; },
    isArmed: function () { return userArmed; }
  };

  window.TENET5_NEWS_AIR = window.TENET5_NEWS_AIR || {};
  window.TENET5_NEWS_AIR.playAll = function () { joinLive(true); };
  window.TENET5_NEWS_AIR.playId = function (id) {
    userArmed = true;
    var list = items();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { playAt(i, 0, true); return; }
    }
  };
})();
