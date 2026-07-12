/* TENET5 LIVE — continuous news station player.
 * Wall-clock join + auto-advance + always-on broadcast chrome.
 * Like flipping to a channel mid-air — not a clip gallery.
 */
(function () {
  'use strict';
  if (window.TENET5_LIVE && window.TENET5_LIVE.__v >= 1) return;

  var schedule = null;
  var idx = 0;
  var playing = false;
  var joined = false;
  var seekPending = 0;

  function $(id) { return document.getElementById(id); }
  function video() { return $('tls-video'); }

  function etClock() {
    try {
      return new Date().toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' ET';
    } catch (e) {
      return new Date().toLocaleTimeString();
    }
  }

  function etSeconds() {
    try {
      var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
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

  function items() {
    return (schedule && schedule.linear) || [];
  }

  function totalDur() {
    return (schedule && schedule.total_duration_s) || 0;
  }

  function findJoinIndex() {
    var list = items();
    if (!list.length) return { index: 0, offset: 0 };
    var T = totalDur();
    if (T <= 0) return { index: 0, offset: 0 };
    var pos = etSeconds() % T;
    for (var i = 0; i < list.length; i++) {
      var a = list[i].start_s || 0;
      var b = list[i].end_s || (a + (list[i].duration_s || 0));
      if (pos >= a && pos < b) {
        return { index: i, offset: Math.max(0, pos - a) };
      }
    }
    return { index: 0, offset: 0 };
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
    if (clock) clock.textContent = etClock();
    if (!item) return;
    if (live) live.classList.toggle('on', !!playing);
    if (desk) desk.textContent = 'TENET5 · ' + (item.desk || 'DESK');
    if (block) {
      var bl = (item.block || item.kind || 'desk').toUpperCase();
      if (bl === 'DESK') bl = 'DESK HITS';
      if (bl === 'REPORTS') bl = 'REPORT BLOCK';
      if (bl === 'CASE') bl = 'CASE FILM';
      block.textContent = bl;
    }
    if (title) title.textContent = item.title || '';
    if (lede) lede.textContent = item.lede || schedule.one_line || '';
    if (prog) prog.textContent = (idx + 1) + ' / ' + items().length;
    if (nowNext) {
      var list = items();
      var next = list[(idx + 1) % list.length];
      nowNext.innerHTML =
        '<div><span class="tls-nn-lab">NOW</span> ' + esc(item.title || '') + '</div>' +
        (next ? '<div><span class="tls-nn-lab">NEXT</span> ' + esc(next.title || '') + '</div>' : '');
    }
    // highlight playlist
    document.querySelectorAll('.tls-pl-item').forEach(function (el) {
      el.classList.toggle('is-on', el.getAttribute('data-id') === item.id);
    });
    var st = $('tls-status');
    if (st) st.textContent = status || (playing ? 'ON AIR' : 'STANDBY');
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function paintPlaylist() {
    var host = $('tls-playlist');
    if (!host) return;
    var list = items();
    var html = '';
    var lastBlock = '';
    list.forEach(function (it, i) {
      if (it.block !== lastBlock) {
        lastBlock = it.block;
        var lab = lastBlock === 'desk' ? 'DESK HITS' : lastBlock === 'reports' ? 'REPORT BLOCK' : 'CASE FILM';
        html += '<div class="tls-pl-head">' + esc(lab) + '</div>';
      }
      var mm = Math.floor((it.duration_s || 0) / 60);
      var ss = Math.floor((it.duration_s || 0) % 60);
      html +=
        '<button type="button" class="tls-pl-item" data-id="' + esc(it.id) + '" data-idx="' + i + '">' +
        '<span class="tls-pl-desk">' + esc(it.desk || '') + '</span>' +
        '<span class="tls-pl-title">' + esc(it.title || '') + '</span>' +
        '<span class="tls-pl-dur">' + mm + ':' + (ss < 10 ? '0' : '') + ss + '</span>' +
        '</button>';
    });
    host.innerHTML = html;
    host.querySelectorAll('.tls-pl-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-idx'), 10);
        playAt(i, 0, true);
      });
    });
  }

  function loadSrc(item) {
    var v = video();
    if (!v || !item) return;
    var src = item.video;
    var s = v.querySelector('source') || document.createElement('source');
    s.src = src;
    s.type = 'video/mp4';
    if (!s.parentNode) v.appendChild(s);
    // captions
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

  function playAt(i, offset, user) {
    var list = items();
    if (!list.length) return;
    idx = ((i % list.length) + list.length) % list.length;
    var item = list[idx];
    loadSrc(item);
    setHud(item, user ? 'ON AIR · MANUAL' : 'ON AIR');
    var v = video();
    if (!v) return;
    seekPending = offset || 0;
    var onMeta = function () {
      v.removeEventListener('loadedmetadata', onMeta);
      if (seekPending > 0.5 && seekPending < (item.duration_s || 999) - 1) {
        try { v.currentTime = seekPending; } catch (e) { /* */ }
      }
      seekPending = 0;
      v.muted = false;
      var p = v.play();
      if (p && p.catch) {
        p.catch(function () {
          v.muted = true;
          v.play().catch(function () {});
          var st = $('tls-status');
          if (st) st.textContent = 'ON AIR · TAP TO UNMUTE';
        });
      }
      playing = true;
      joined = true;
      setHud(item, 'ON AIR');
    };
    if (v.readyState >= 1) onMeta();
    else v.addEventListener('loadedmetadata', onMeta);
  }

  function advance() {
    var list = items();
    if (!list.length) return;
    playAt(idx + 1, 0, false);
  }

  function joinLive() {
    var j = findJoinIndex();
    playAt(j.index, j.offset, false);
    var st = $('tls-status');
    if (st) st.textContent = 'JOINED LIVE';
  }

  function bindVideo() {
    var v = video();
    if (!v) return;
    v.addEventListener('ended', function () {
      advance();
    });
    v.addEventListener('play', function () {
      playing = true;
      var item = items()[idx];
      if (item) setHud(item, 'ON AIR');
    });
    v.addEventListener('pause', function () {
      if (!v.ended) {
        var st = $('tls-status');
        if (st) st.textContent = 'PAUSED';
      }
    });
  }

  function bindControls() {
    var go = $('tls-join');
    if (go) go.addEventListener('click', function () { joinLive(); });
    var next = $('tls-next');
    if (next) next.addEventListener('click', function () { advance(); });
    var prev = $('tls-prev');
    if (prev) prev.addEventListener('click', function () {
      playAt(idx - 1, 0, true);
    });
    var mute = $('tls-unmute');
    if (mute) mute.addEventListener('click', function () {
      var v = video();
      if (!v) return;
      v.muted = false;
      v.play().catch(function () {});
    });
  }

  function tick() {
    var clock = $('tls-clock');
    if (clock) clock.textContent = etClock();
    // progress within item
    var v = video();
    var bar = $('tls-bar');
    if (v && bar && v.duration) {
      var pct = Math.min(100, (v.currentTime / v.duration) * 100);
      bar.style.width = pct + '%';
    }
  }

  function boot(sched) {
    schedule = sched;
    paintPlaylist();
    bindVideo();
    bindControls();
    setInterval(tick, 250);
    // auto-join live shortly after load (user gesture may still force mute)
    setTimeout(function () {
      if (!joined) joinLive();
    }, 400);
    var one = $('tls-oneline');
    if (one && schedule.one_line) one.textContent = schedule.one_line;
    var tag = $('tls-tagline');
    if (tag && schedule.tagline) tag.textContent = schedule.tagline;
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
    __v: 1,
    join: joinLive,
    next: advance,
    playAt: playAt,
    load: load,
    getSchedule: function () { return schedule; }
  };

  // Compatibility: news-air playAll drives station if present
  window.TENET5_NEWS_AIR = window.TENET5_NEWS_AIR || {};
  window.TENET5_NEWS_AIR.playAll = function () { joinLive(); };
  window.TENET5_NEWS_AIR.playId = function (id) {
    var list = items();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { playAt(i, 0, true); return; }
    }
  };
})();
