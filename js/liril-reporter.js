/* LIRIL Desk Reporter — AI persona for reading TENET5 news as time moves.
 * Public product only: Powered by LIRIL AI. No internals.
 *
 * Loads data/liril_reporter_persona.json
 * Builds live bulletins from briefing + home_wire (+ optional articles)
 * Continuous "Listen live" mode polls for new wire items so news stays new.
 *
 * API: window.LIRIL_REPORTER
 */
(function () {
  'use strict';
  if (window.LIRIL_REPORTER) return;

  var PERSONA_URL = 'data/liril_reporter_persona.json';
  var BRIEF_URL = 'data/govt_daily_briefing.json';
  var WIRE_URL = 'data/home_wire.json';
  var ARTS_URL = 'data/liril_news_articles.json';
  var PRES_URL = 'data/liril_news_presentation.json';

  var persona = null;
  var lastWireIds = {};
  var lastBriefHash = '';
  var pollTimer = null;
  var hourTimer = null;
  var live = false;
  var listeners = [];

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

  function etParts() {
    try {
      var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: (persona && persona.time_zone) || 'America/Toronto',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { if (p.type !== 'literal') map[p.type] = p.value; });
      return map;
    } catch (e) {
      var d = new Date();
      return { hour: String(d.getHours()), minute: '00', dayPeriod: '', weekday: '', month: '', day: '', year: '' };
    }
  }

  function etClock() {
    var p = etParts();
    var h = p.hour || '';
    var m = p.minute || '00';
    var ap = p.dayPeriod || '';
    return (h + ':' + m + (ap ? ' ' + ap : '')).trim();
  }

  function etDateLong() {
    var p = etParts();
    if (p.weekday && p.month && p.day && p.year) {
      return p.weekday + ', ' + p.month + ' ' + p.day + ', ' + p.year;
    }
    try {
      return new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'full' });
    } catch (e) {
      return new Date().toDateString();
    }
  }

  function dayPart() {
    var hour = 12;
    try {
      hour = parseInt(
        new Intl.DateTimeFormat('en-CA', {
          timeZone: (persona && persona.time_zone) || 'America/Toronto',
          hour: 'numeric',
          hour12: false
        }).format(new Date()),
        10
      );
    } catch (e) {
      hour = new Date().getHours();
    }
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  function fill(tpl, extra) {
    var g = (persona && persona.greetings) || {};
    var map = {
      greeting: g[dayPart()] || 'Good day.',
      powered_by: (persona && persona.powered_by) || 'Powered by LIRIL AI',
      time_et: etClock(),
      date_et: etDateLong()
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) { map[k] = extra[k]; });
    }
    var s = String(tpl || '');
    Object.keys(map).forEach(function (k) {
      s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), map[k]);
    });
    return s;
  }

  function defaultPersona() {
    return {
      public_name: 'LIRIL',
      role: 'Desk reporter',
      outlet: 'TENET5',
      powered_by: 'Powered by LIRIL AI',
      on_air_label: 'ON AIR',
      off_air_label: 'DESK READY',
      time_zone: 'America/Toronto',
      greetings: {
        morning: 'Good morning.',
        afternoon: 'Good afternoon.',
        evening: 'Good evening.',
        night: "You're with TENET5 after hours."
      },
      sign_on:
        '{greeting} I am LIRIL, desk reporter for TENET5 — an independent Canadian investigative newsroom. I read the public record as it moves. {powered_by}. You verify.',
      sign_off: 'That is the desk for now. The wire keeps moving. {powered_by}.',
      live_idle: 'Desk is live. I will read new wire items as they arrive.',
      new_wire_prefix: 'On the multi-source wire — labeled external source, not a TENET5 verdict —',
      new_desk_prefix: 'From the TENET5 desk — analysis against primary sources —',
      hour_tick:
        'It is {time_et} Eastern. The news desk is still open. Time is the spine of this site.',
      site_tour_short:
        'TENET5 is structured on time. Day is the news desk. Hour is the live wire. Week holds investigations. Month checks claims against documents. Year holds case files. Film is not proof.',
      refresh: { poll_ms: 90000, hour_tick_ms: 3600000, min_bulletin_gap_ms: 25000, max_new_items_per_cycle: 3 },
      ui: {
        kick: 'LIRIL · desk reporter',
        start_label: 'Start news presentation',
        live_label: 'Listen live',
        stop_live_label: 'Stop live',
        presenting_label: 'On air…',
        dock_default: 'I am LIRIL, your desk reporter. Tap Guide me or Listen live.'
      }
    };
  }

  function briefHash(brief) {
    if (!brief) return '';
    return String(brief.date || '') + '|' + String(brief.one_line || '') + '|' +
      String((brief.happening_now || []).length);
  }

  function wireId(item) {
    return item.id || item.source_url || item.link || item.title || JSON.stringify(item).slice(0, 80);
  }

  /** Build a full news presentation from live data + persona (always fresh clock). */
  function buildLivePresentation(brief, wire, arts) {
    brief = brief || {};
    wire = wire || {};
    arts = arts || {};
    var p = persona || defaultPersona();
    var one = clean(brief.one_line || arts.one_line || 'The public record is open.', 240);
    var threat = brief.threat_level || arts.threat_level || 'WATCH';
    var date = brief.date || arts.date || etDateLong();
    var segs = [];

    segs.push({
      id: 'sign_on',
      role: 'anchor_open',
      scroll: 'top',
      wait_ms: 16000,
      text: fill(p.sign_on)
    });
    segs.push({
      id: 'site',
      role: 'desk_tour',
      scroll: 'newsdesk',
      wait_ms: 14000,
      text: p.site_tour_short
    });
    segs.push({
      id: 'today',
      role: 'bulletin',
      scroll: 'newsdesk',
      wait_ms: 14000,
      text:
        'Today is ' + date + ' — ' + etClock() + ' Eastern. Desk posture: ' + threat +
        '. Lead for this hour: ' + one
    });

    var artList = arts.articles || [];
    var daily = null;
    var features = [];
    for (var i = 0; i < artList.length; i++) {
      if (artList[i].type === 'feature') features.push(artList[i]);
      if (artList[i].is_daily_package) daily = artList[i];
    }
    if (!daily && features[0]) daily = features[0];
    if (daily) {
      segs.push({
        id: 'ai_pkg',
        role: 'desk_package',
        scroll: 'newsdesk',
        wait_ms: 14000,
        text:
          'Our AI desk package is current. ' + clean(daily.title, 120) + '. ' +
          clean(daily.dek || one, 140) +
          ' TENET5 analysis is labeled. External wire is labeled external source.',
        href: daily.href
      });
    }

    var hn = brief.happening_now || [];
    for (var h = 0; h < Math.min(4, hn.length); h++) {
      var item = hn[h] || {};
      segs.push({
        id: 'desk_' + h,
        role: 'story',
        scroll: h ? 'now' : 'newsdesk',
        wait_ms: 13000,
        text:
          (p.new_desk_prefix || '') + ' ' +
          clean(item.domain || 'FILE', 40) + '. ' +
          clean(item.headline, 140) + '. ' +
          clean(item.body, 160),
        href: item.page,
        label: 'TENET5'
      });
    }

    var ext = wire.wire || [];
    if (ext.length) {
      var heads = [];
      for (var j = 0; j < Math.min(3, ext.length); j++) {
        heads.push(clean(ext[j].title, 80));
      }
      segs.push({
        id: 'wire_block',
        role: 'wire',
        scroll: 'now',
        wait_ms: 14000,
        text:
          (p.new_wire_prefix || '') + ' recent intake includes: ' + heads.join('; ') +
          '. Case claims still require primary documents.',
        label: 'EXTERNAL SOURCE'
      });
    }

    segs.push({
      id: 'live_hand',
      role: 'live_handoff',
      scroll: 'now',
      wait_ms: 12000,
      text: fill(p.live_idle) + ' ' + fill(p.sign_off)
    });

    return {
      ts: new Date().toISOString(),
      doctrine: 'liril_live_reporter',
      persona: p.public_name,
      role: p.role,
      date: date,
      threat_level: threat,
      one_line: one,
      time_et: etClock(),
      segments: segs,
      segment_count: segs.length,
      articles: artList,
      article_count: artList.length,
      live: true
    };
  }

  function emit(event, payload) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](event, payload); } catch (e) { /* ignore */ }
    }
  }

  function markSeen(wire, brief) {
    var list = (wire && wire.wire) || [];
    lastWireIds = {};
    for (var i = 0; i < list.length; i++) {
      lastWireIds[wireId(list[i])] = true;
    }
    lastBriefHash = briefHash(brief);
  }

  function findNewWire(wire) {
    var list = (wire && wire.wire) || [];
    var news = [];
    var maxN = ((persona && persona.refresh) || {}).max_new_items_per_cycle || 3;
    for (var i = 0; i < list.length; i++) {
      var id = wireId(list[i]);
      if (!lastWireIds[id]) {
        news.push(list[i]);
        if (news.length >= maxN) break;
      }
    }
    return news;
  }

  var lastBulletinAt = 0;

  function pollOnce() {
    if (!live) return Promise.resolve(null);
    return Promise.all([fetchJson(BRIEF_URL), fetchJson(WIRE_URL), fetchJson(ARTS_URL)])
      .then(function (pair) {
        var brief = pair[0] || {};
        var wire = pair[1] || {};
        var arts = pair[2] || {};
        var fresh = buildLivePresentation(brief, wire, arts);
        var newItems = findNewWire(wire);
        var briefChanged = briefHash(brief) !== lastBriefHash && lastBriefHash !== '';
        var minGap = ((persona && persona.refresh) || {}).min_bulletin_gap_ms || 25000;
        var now = Date.now();
        var bulletins = [];

        if (now - lastBulletinAt >= minGap) {
          if (briefChanged && brief.one_line) {
            bulletins.push({
              id: 'brief_update',
              role: 'bulletin',
              scroll: 'newsdesk',
              wait_ms: 12000,
              text:
                (persona.new_desk_prefix || 'Desk update.') + ' ' +
                'Lead is now: ' + clean(brief.one_line, 200),
              label: 'TENET5'
            });
          }
          for (var i = 0; i < newItems.length; i++) {
            var w = newItems[i];
            bulletins.push({
              id: 'wire_' + wireId(w),
              role: 'wire_flash',
              scroll: 'now',
              wait_ms: 11000,
              text:
                (persona.new_wire_prefix || '') + ' ' +
                clean(w.source || 'Outlet', 40) + ' reports: ' +
                clean(w.title, 140) + '. ' +
                clean(w.summary, 100) +
                ' Not a TENET5 verdict.',
              label: 'EXTERNAL SOURCE',
              href: w.source_url
            });
          }
        }

        markSeen(wire, brief);
        if (bulletins.length) lastBulletinAt = now;

        emit('poll', { presentation: fresh, bulletins: bulletins, new_count: newItems.length });
        if (bulletins.length) emit('bulletin', { items: bulletins });
        return { presentation: fresh, bulletins: bulletins };
      });
  }

  function startLive() {
    live = true;
    emit('live', { on: true });
    var pollMs = ((persona && persona.refresh) || {}).poll_ms || 90000;
    var hourMs = ((persona && persona.refresh) || {}).hour_tick_ms || 3600000;
    if (pollTimer) clearInterval(pollTimer);
    if (hourTimer) clearInterval(hourTimer);
    // First seed of seen IDs without speaking
    Promise.all([fetchJson(BRIEF_URL), fetchJson(WIRE_URL)]).then(function (pair) {
      markSeen(pair[1] || {}, pair[0] || {});
    });
    pollTimer = setInterval(function () { pollOnce(); }, pollMs);
    hourTimer = setInterval(function () {
      if (!live) return;
      emit('hour_tick', {
        text: fill((persona && persona.hour_tick) || 'It is {time_et} Eastern. Desk still open.'),
        time_et: etClock()
      });
    }, hourMs);
  }

  function stopLive() {
    live = false;
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (hourTimer) { clearInterval(hourTimer); hourTimer = null; }
    emit('live', { on: false });
  }

  function loadPersona() {
    return fetchJson(PERSONA_URL).then(function (doc) {
      persona = doc && doc.public_name ? doc : defaultPersona();
      return persona;
    });
  }

  function loadBundle() {
    return Promise.all([
      loadPersona(),
      fetchJson(BRIEF_URL),
      fetchJson(WIRE_URL),
      fetchJson(ARTS_URL),
      fetchJson(PRES_URL)
    ]).then(function (all) {
      var brief = all[1] || {};
      var wire = all[2] || {};
      var arts = all[3] || {};
      var serverPres = all[4];
      // Prefer live rebuild so clock + wire are always current; merge article list from server if needed
      var livePres = buildLivePresentation(brief, wire, arts);
      if (serverPres && serverPres.articles && !livePres.articles.length) {
        livePres.articles = serverPres.articles;
        livePres.article_count = serverPres.article_count || serverPres.articles.length;
      }
      markSeen(wire, brief);
      return {
        persona: persona,
        presentation: livePres,
        brief: brief,
        wire: wire,
        articles: arts
      };
    });
  }

  function on(fn) {
    if (typeof fn === 'function') listeners.push(fn);
    return function off() {
      listeners = listeners.filter(function (x) { return x !== fn; });
    };
  }

  window.LIRIL_REPORTER = {
    load: loadBundle,
    loadPersona: loadPersona,
    buildLivePresentation: buildLivePresentation,
    startLive: startLive,
    stopLive: stopLive,
    pollOnce: pollOnce,
    isLive: function () { return live; },
    persona: function () { return persona || defaultPersona(); },
    etClock: etClock,
    etDateLong: etDateLong,
    fill: fill,
    on: on
  };
})();
