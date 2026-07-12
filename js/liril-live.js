/* LIRIL Live — human desk persona + live needs on the public site.
 * Loads data/liril_reporter_persona.json, paints dock avatar + status,
 * Listen live / Guide me hooks. No internals. Powered by LIRIL AI.
 */
(function () {
  'use strict';
  if (window.LIRIL_LIVE && window.LIRIL_LIVE.__v >= 1) return;

  var persona = null;
  var liveOn = false;
  var pollTimer = null;
  var hourTimer = null;
  var lastWireKey = '';

  function $(id) { return document.getElementById(id); }

  function greeting() {
    var h = new Date().getHours();
    var g = (persona && persona.greetings) || {};
    if (h >= 5 && h < 12) return g.morning || 'Good morning.';
    if (h >= 12 && h < 17) return g.afternoon || 'Good afternoon.';
    if (h >= 17 && h < 22) return g.evening || 'Good evening.';
    return g.night || "You're with TENET5 after hours.";
  }

  function fillTemplate(s) {
    if (!s) return '';
    return String(s)
      .replace(/\{greeting\}/g, greeting())
      .replace(/\{powered_by\}/g, (persona && persona.powered_by) || 'Powered by LIRIL AI')
      .replace(/\{time_et\}/g, new Date().toLocaleTimeString('en-CA', {
        timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit'
      }));
  }

  function speak(text, force) {
    if (!text) return;
    if (window.__LIRIL_MUTED === true && !force) return;
    if (window.LIRIL_VOICE && typeof window.LIRIL_VOICE.speak === 'function') {
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* */ }
      window.LIRIL_VOICE.speak(text, {});
    }
  }

  function setLine(t) {
    var el = $('liril-line');
    if (el && t) el.textContent = t;
  }

  function setStatus(t) {
    var el = $('liril-status');
    if (!el) return;
    el.textContent = t;
    el.classList.add('show');
  }

  function setAir(on) {
    var pill = $('liril-air-pill') || document.querySelector('.pres-air');
    if (!pill) return;
    var onLab = (persona && persona.on_air_label) || 'ON AIR';
    var offLab = (persona && persona.off_air_label) || 'DESK READY';
    pill.textContent = on ? onLab : offLab;
    pill.classList.toggle('on-air', !!on);
  }

  function paintAvatar() {
    var dock = $('dock');
    if (!dock || !persona) return;
    var av = persona.human_persona && persona.human_persona.appearance;
    var src = av && av.avatar;
    if (!src) return;
    var host = dock.querySelector('.dock-in') || dock;
    var existing = host.querySelector('.liril-avatar');
    if (existing) return;
    var img = document.createElement('img');
    img.className = 'liril-avatar';
    img.src = src;
    img.alt = 'LIRIL — desk reporter';
    img.width = 44;
    img.height = 44;
    img.loading = 'lazy';
    img.decoding = 'async';
    host.insertBefore(img, host.firstChild);
  }

  function paintKick() {
    var kick = document.querySelector('#liril-presentation .kick, .pres-byline .kick');
    if (kick && persona && persona.ui && persona.ui.kick) {
      kick.textContent = persona.ui.kick;
    }
    var def = persona && persona.ui && persona.ui.dock_default;
    if (def) setLine(def);
  }

  function stopLive() {
    liveOn = false;
    setAir(false);
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (hourTimer) { clearInterval(hourTimer); hourTimer = null; }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* */ }
    setStatus('Desk ready');
    var btn = $('liril-pres-live');
    if (btn && persona && persona.ui) btn.textContent = persona.ui.live_label || 'Listen live';
  }

  function wireTick() {
    if (!liveOn) return;
    fetch('data/home_wire.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (doc) {
        if (!doc || !liveOn) return;
        var items = doc.items || doc.stories || [];
        if (!items.length) {
          speak(fillTemplate(persona.live_idle || 'Desk is live.'), false);
          return;
        }
        var it = items[0];
        var title = (it && (it.title || it.headline)) || '';
        var key = title.slice(0, 120);
        if (!title || key === lastWireKey) return;
        lastWireKey = key;
        var line = (persona.new_wire_prefix || 'On the wire —') + ' ' + title;
        setLine(line);
        setStatus('Wire update');
        speak(line, false);
      });
  }

  function startLive() {
    if (!persona) return;
    liveOn = true;
    setAir(true);
    setStatus('On air');
    speak(fillTemplate(persona.sign_on), true);
    var refresh = (persona.refresh) || {};
    var poll = refresh.poll_ms || 90000;
    var hour = refresh.hour_tick_ms || 3600000;
    if (pollTimer) clearInterval(pollTimer);
    if (hourTimer) clearInterval(hourTimer);
    pollTimer = setInterval(wireTick, poll);
    hourTimer = setInterval(function () {
      if (!liveOn) return;
      speak(fillTemplate(persona.hour_tick || ''), false);
    }, hour);
    setTimeout(wireTick, 4000);
    var btn = $('liril-pres-live');
    if (btn && persona.ui) btn.textContent = persona.ui.stop_live_label || 'Stop live';
  }

  function bindHome() {
    var liveBtn = $('liril-pres-live');
    if (liveBtn) {
      liveBtn.addEventListener('click', function () {
        if (liveOn) stopLive();
        else startLive();
      });
    }
    var startBtn = $('liril-pres-start');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        setAir(true);
        speak(fillTemplate(persona.sign_on), true);
      });
    }
  }

  function bindDock() {
    var guide = $('liril-guide-btn');
    if (guide && !guide.dataset.lirilLiveBound) {
      guide.dataset.lirilLiveBound = '1';
      // do not steal guide — only ensure status after click
      guide.addEventListener('click', function () {
        setAir(true);
        setStatus('Guiding page');
      });
    }
  }

  function init(p) {
    persona = p || null;
    if (!persona || persona.ok === false) return;
    window.LIRIL_PERSONA = persona;
    paintAvatar();
    paintKick();
    bindHome();
    bindDock();
    setAir(false);
    setStatus((persona.off_air_label) || 'Desk ready');
  }

  window.LIRIL_LIVE = {
    __v: 1,
    startLive: startLive,
    stopLive: stopLive,
    speak: speak,
    getPersona: function () { return persona; },
    isLive: function () { return liveOn; }
  };

  fetch('data/liril_reporter_persona.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (p) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(p); });
      } else {
        init(p);
      }
    })
    .catch(function () { /* silent */ });
})();
