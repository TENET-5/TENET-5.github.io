/* TENET5 submarine time dial — horizontal continuum of time on the homepage.
 * Seconds tick. Needle marks "now". Ticks jump to temporal chapters.
 * Memorial ice-lake, not cyber HUD. v1
 */
(function () {
  'use strict';
  if (window.TENET5TimeDial && window.TENET5TimeDial.__v >= 1) return;

  var TICKS = [
    { id: 'sec', label: 'Sec', href: null, live: 's' },
    { id: 'min', label: 'Min', href: null, live: 'm' },
    { id: 'hour', label: 'Hour', href: '#now', chapter: 'now' },
    { id: 'day', label: 'Day', href: '#newsdesk', chapter: 'newsdesk' },
    { id: 'week', label: 'Week', href: '#week', chapter: 'week' },
    { id: 'month', label: 'Month', href: '#month', chapter: 'month' },
    { id: 'year', label: 'Year', href: '#year', chapter: 'year' },
    { id: 'era', label: 'Era', href: '#era', chapter: 'era' }
  ];

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function fmtLive(d) {
    return {
      s: pad(d.getSeconds()),
      m: pad(d.getMinutes()),
      h: pad(d.getHours()) + ':' + pad(d.getMinutes())
    };
  }

  function etStamp(d) {
    try {
      return d.toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' ET';
    } catch (e) {
      return d.toISOString();
    }
  }

  function activeChapter() {
    var keys = ['era', 'year', 'month', 'week', 'now', 'newsdesk', 'doc-stage', 'enter'];
    var y = window.scrollY || 0;
    var mid = y + window.innerHeight * 0.35;
    var best = 'newsdesk';
    var bestDist = Infinity;
    keys.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var top = el.getBoundingClientRect().top + y;
      var dist = Math.abs(top - mid);
      if (top <= mid + 80 && dist < bestDist) {
        bestDist = dist;
        best = id === 'doc-stage' ? 'day' : id;
      }
    });
    return best;
  }

  function mount(root) {
    if (!root || root.dataset.dialMounted) return;
    root.dataset.dialMounted = '1';

    var shell = document.createElement('div');
    shell.className = 'time-dial-shell';
    shell.setAttribute('role', 'navigation');
    shell.setAttribute('aria-label', 'Time continuum — second through era');

    var read = document.createElement('div');
    read.className = 'time-dial-readout';
    read.innerHTML =
      '<span class="time-dial-kicker">Time continuum</span>' +
      '<span class="time-dial-clock" id="time-dial-clock" aria-live="polite">—</span>' +
      '<span class="time-dial-mode">Walk backwards · primary sources</span>';

    var track = document.createElement('div');
    track.className = 'time-dial-track';
    track.setAttribute('aria-hidden', 'false');

    var rail = document.createElement('div');
    rail.className = 'time-dial-rail';

    var needle = document.createElement('div');
    needle.className = 'time-dial-needle';
    needle.setAttribute('aria-hidden', 'true');

    var ticks = document.createElement('div');
    ticks.className = 'time-dial-ticks';

    var tickEls = [];
    TICKS.forEach(function (t, i) {
      var btn = document.createElement(t.href ? 'a' : 'button');
      btn.className = 'time-dial-tick';
      btn.dataset.tick = t.id;
      if (t.chapter) btn.dataset.chapter = t.chapter;
      if (t.href) {
        btn.href = t.href;
      } else {
        btn.type = 'button';
        btn.setAttribute('aria-label', t.label + ' (live clock)');
      }
      btn.innerHTML =
        '<span class="time-dial-mark" aria-hidden="true"></span>' +
        '<span class="time-dial-lab">' + t.label + '</span>' +
        '<span class="time-dial-val" data-live="' + (t.live || '') + '">—</span>';
      ticks.appendChild(btn);
      tickEls.push({ el: btn, meta: t, i: i });
    });

    rail.appendChild(needle);
    track.appendChild(rail);
    track.appendChild(ticks);
    shell.appendChild(read);
    shell.appendChild(track);
    root.appendChild(shell);

    var clockEl = read.querySelector('#time-dial-clock');

    function placeNeedle(index) {
      var n = TICKS.length;
      var pct = n <= 1 ? 0 : (index / (n - 1)) * 100;
      needle.style.left = pct + '%';
    }

    function paint() {
      var d = new Date();
      var live = fmtLive(d);
      if (clockEl) clockEl.textContent = etStamp(d);
      tickEls.forEach(function (t) {
        var val = t.el.querySelector('.time-dial-val');
        if (!val) return;
        var k = val.getAttribute('data-live');
        if (k === 's') val.textContent = live.s;
        else if (k === 'm') val.textContent = live.m;
        else if (k === 'h') val.textContent = live.h;
        else if (!k) {
          /* static labels for structural ticks — leave chapter cue */
          if (t.meta.id === 'hour') val.textContent = 'wire';
          else if (t.meta.id === 'day') val.textContent = 'desk';
          else if (t.meta.id === 'week') val.textContent = 'invest.';
          else if (t.meta.id === 'month') val.textContent = 'claims';
          else if (t.meta.id === 'year') val.textContent = 'files';
          else if (t.meta.id === 'era') val.textContent = 'depth';
        }
      });

      var ch = activeChapter();
      var idx = 2; /* default hour */
      tickEls.forEach(function (t, i) {
        var on = false;
        if (t.meta.chapter && (t.meta.chapter === ch || (ch === 'now' && t.meta.id === 'hour'))) on = true;
        if (ch === 'newsdesk' && t.meta.id === 'day') on = true;
        if (ch === 'era' && t.meta.id === 'era') on = true;
        if (ch === 'year' && t.meta.id === 'year') on = true;
        if (ch === 'month' && t.meta.id === 'month') on = true;
        if (ch === 'week' && t.meta.id === 'week') on = true;
        t.el.classList.toggle('is-on', on);
        if (on) idx = i;
      });
      /* seconds always pulse the first tick */
      tickEls[0].el.classList.add('is-live');
      placeNeedle(idx);
    }

    paint();
    setInterval(paint, 1000);
    window.addEventListener('scroll', function () {
      window.requestAnimationFrame(paint);
    }, { passive: true });

    /* dateline in cover-bar */
    var dl = document.getElementById('dateline');
    if (dl) {
      setInterval(function () {
        dl.textContent = etStamp(new Date());
      }, 1000);
      dl.textContent = etStamp(new Date());
    }
  }

  function boot() {
    document.querySelectorAll('[data-time-dial]').forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.TENET5TimeDial = { boot: boot, mount: mount, __v: 1 };
})();
