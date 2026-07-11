/* LIRIL home guide v9 — DESK REPORTER persona + live news.
 * LIRIL is an AI reporter who reads TENET5 news as time moves.
 * Uses js/liril-reporter.js for persona, live rebuild, continuous wire poll.
 * Requires js/liril-voice.js + js/liril-reporter.js.
 */
(function () {
  'use strict';
  if (window.__LIRIL_HOME_GUIDE_V >= 9) return;
  window.__LIRIL_HOME_GUIDE_V = 9;

  document.documentElement.classList.add('js');

  var presentation = null;
  var presentationReady = false;
  var articlesDoc = null;
  var persona = null;
  var bundle = null;

  function $(id) { return document.getElementById(id); }

  function clean(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (!n || s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ui(key, fallback) {
    var u = (persona && persona.ui) || {};
    return u[key] || fallback;
  }

  function loadPresentation() {
    if (window.LIRIL_REPORTER && typeof window.LIRIL_REPORTER.load === 'function') {
      return window.LIRIL_REPORTER.load().then(function (b) {
        bundle = b;
        persona = b.persona;
        presentation = b.presentation;
        articlesDoc = b.articles;
        presentationReady = true;
        return presentation;
      });
    }
    /* Fallback without reporter module */
    return Promise.all([
      fetch('data/liril_news_presentation.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('data/liril_news_articles.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('data/liril_reporter_persona.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (pair) {
      persona = pair[2];
      articlesDoc = pair[1];
      if (pair[0] && pair[0].segments && pair[0].segments.length) {
        presentation = pair[0];
        if (!presentation.articles && articlesDoc && articlesDoc.articles) {
          presentation.articles = articlesDoc.articles;
          presentation.article_count = articlesDoc.article_count || articlesDoc.articles.length;
        }
      } else {
        presentation = {
          segments: [{
            id: 'open', wait_ms: 14000, scroll: 'top',
            text: 'I am LIRIL, desk reporter for TENET5. Open the daily briefing for today\'s sheet. Powered by LIRIL AI.'
          }],
          one_line: 'The public record is open.',
          article_count: 0
        };
      }
      presentationReady = true;
      return presentation;
    });
  }

  function setDateline() {
    var el = $('dateline');
    if (!el) return;
    try {
      el.textContent = new Date().toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      el.textContent = new Date().toDateString();
    }
  }

  function initReveal() {
    var io = ('IntersectionObserver' in window)
      ? new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
          });
        }, { threshold: 0.1 })
      : null;
    document.querySelectorAll('.rv').forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  function canSpeak() {
    if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.speak !== 'function') return false;
    if (typeof window.LIRIL_VOICE.get === 'function') return !!window.LIRIL_VOICE.get();
    return true;
  }

  function scrollToId(id) {
    if (!id || id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function rundownHtml(pres) {
    var arts = (pres && pres.articles) || (articlesDoc && articlesDoc.articles) || [];
    if (!arts.length) return '';
    var items = [];
    var n = Math.min(5, arts.length);
    for (var i = 0; i < n; i++) {
      var a = arts[i] || {};
      var href = a.href || 'daily-briefing.html';
      var lab = a.epistemic || (a.type === 'wire' ? 'EXTERNAL SOURCE' : 'TENET5');
      var tag = a.is_daily_package ? 'TODAY' : (a.type === 'wire' ? 'WIRE' : 'FILE');
      items.push(
        '<li class="pres-run-item">' +
          '<span class="pres-run-tag">' + esc(tag) + '</span>' +
          '<a href="' + esc(href) + '">' + esc(clean(a.title, 96)) + '</a>' +
          '<span class="pres-run-ep">' + esc(lab) + '</span>' +
        '</li>'
      );
    }
    return '<ol class="pres-rundown" aria-label="Today\'s AI desk rundown">' + items.join('') + '</ol>';
  }

  function paintPresentationCard(pres) {
    var host = document.getElementById('liril-presentation');
    if (!host || !pres) return;
    var one = clean(pres.one_line || '', 200);
    var n = (pres.segments && pres.segments.length) || 0;
    var ac = pres.article_count || ((pres.articles && pres.articles.length) || 0);
    var threat = pres.threat_level || '';
    var clock = (window.LIRIL_REPORTER && window.LIRIL_REPORTER.etClock)
      ? window.LIRIL_REPORTER.etClock()
      : '';
    var arts = (pres && pres.articles) || (articlesDoc && articlesDoc.articles) || [];
    var pkgHref = 'daily-briefing.html';
    for (var pi = 0; pi < arts.length; pi++) {
      if (arts[pi].is_daily_package && arts[pi].href) { pkgHref = arts[pi].href; break; }
    }
    if (pkgHref === 'daily-briefing.html' && arts[0] && arts[0].href && arts[0].type === 'feature') {
      pkgHref = arts[0].href;
    }
    var onAir = window.LIRIL_REPORTER && window.LIRIL_REPORTER.isLive && window.LIRIL_REPORTER.isLive();
    var airLab = onAir
      ? ((persona && persona.on_air_label) || 'ON AIR')
      : ((persona && persona.off_air_label) || 'DESK READY');
    host.innerHTML =
      '<div class="pres-byline">' +
        '<span class="pres-air' + (onAir ? ' on' : '') + '" id="liril-air-pill">' + esc(airLab) + '</span>' +
        '<span class="kick">' + esc(ui('kick', 'LIRIL · desk reporter')) + '</span>' +
        (clock ? '<span class="pres-clock" id="liril-pres-clock">' + esc(clock) + ' ET</span>' : '') +
      '</div>' +
      '<h2 class="thesis-title" style="margin-top:0.6em">What is going on <em>today.</em></h2>' +
      '<p class="pres-lede">' + esc(one || 'Live desk — briefing and multi-source wire, sources first.') + '</p>' +
      '<p class="pres-meta">' + n + ' beats · ' + ac + ' AI desk pieces · ' +
        (threat ? ('posture ' + esc(threat) + ' · ') : '') +
        'news moves with time · external wire labeled</p>' +
      rundownHtml(pres) +
      '<div class="pres-actions">' +
      '<button type="button" class="guide-cta" id="liril-pres-start">' +
        esc(ui('start_label', 'Start news presentation')) + '</button>' +
      '<button type="button" class="guide-cta guide-cta-live" id="liril-pres-live">' +
        esc(onAir ? ui('stop_live_label', 'Stop live') : ui('live_label', 'Listen live')) +
      '</button>' +
      '<a class="begin begin-quiet" href="' + esc(pkgHref) + '"><span>Today\'s package</span></a>' +
      '<a class="begin begin-quiet" href="daily-briefing.html"><span>Full briefing</span></a>' +
      '</div>';
  }

  function tickClock() {
    var el = $('liril-pres-clock');
    if (!el || !window.LIRIL_REPORTER || !window.LIRIL_REPORTER.etClock) return;
    el.textContent = window.LIRIL_REPORTER.etClock() + ' ET';
  }

  function initGuide() {
    var dock = $('dock');
    var lineEl = $('liril-line');
    var voiceBtn = $('voice-btn');
    var guideBtn = $('liril-guide-btn');
    var guideBtnCover = $('liril-guide-btn-cover');
    var statusEl = $('liril-status');
    var voiceOn = false;
    var lastCh = null;
    var presenting = false;
    var presTimer = null;
    var presIndex = 0;
    var bulletinQueue = [];
    var bulletinBusy = false;

    if (dock) dock.classList.add('up', 'guide-ready');

    /* Reporter byline in dock */
    if (dock) {
      var sayB = dock.querySelector('.say b');
      if (sayB) sayB.textContent = 'LIRIL · Reporter';
    }

    var statusTimer = null;
    function setStatus(msg) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.add('show');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(function () { statusEl.classList.remove('show'); }, 5000);
    }

    function setLine(text) {
      if (lineEl && text) lineEl.textContent = text;
    }

    function speak(text, force) {
      if (!text) return;
      setLine(text);
      if (!(voiceOn || force)) return;
      if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.speak !== 'function') {
        setStatus('Text presentation · voice engine not loaded');
        return;
      }
      if (dock) dock.classList.add('speaking');
      var ok = window.LIRIL_VOICE.speak(text, {
        onend: function () { if (dock) dock.classList.remove('speaking'); },
        onerror: function (e) {
          if (dock) dock.classList.remove('speaking');
          var kind = (e && e.error) || '';
          if (kind === 'interrupted' || kind === 'canceled') return;
          setStatus('Voice error · text continues');
        }
      });
      if (!ok) {
        if (dock) dock.classList.remove('speaking');
        setStatus('No suitable voice · reading text only');
      } else {
        setStatus(presenting ? 'LIRIL on air · desk reporter' : 'LIRIL speaking');
      }
      setTimeout(function () {
        if (dock) dock.classList.remove('speaking');
      }, Math.min(20000, 70 * text.length + 900));
    }

    function stopPresentation() {
      presenting = false;
      if (presTimer) { clearTimeout(presTimer); presTimer = null; }
      if (guideBtn) {
        guideBtn.classList.remove('on');
        guideBtn.textContent = 'Guide me';
      }
    }

    function stepPresentation() {
      if (!presentation || !presentation.segments) return;
      var segs = presentation.segments;
      if (presIndex >= segs.length) {
        presenting = false;
        if (guideBtn) { guideBtn.classList.remove('on'); guideBtn.textContent = 'Guide me'; }
        /* After full package, auto-enter live if user started presentation with voice */
        if (voiceOn && window.LIRIL_REPORTER && !window.LIRIL_REPORTER.isLive()) {
          window.LIRIL_REPORTER.startLive();
          setStatus('Live desk · new wire items will be read as they arrive');
          paintPresentationCard(presentation);
          speak(
            (persona && persona.live_idle) ||
              'Desk is live. I will read new wire items as they arrive.',
            false
          );
        } else {
          setStatus('Presentation complete · Listen live keeps the desk open');
          speak(
            (window.LIRIL_REPORTER && window.LIRIL_REPORTER.fill && persona)
              ? window.LIRIL_REPORTER.fill(persona.sign_off || 'That is the desk for now.')
              : 'End of presentation. Tap Listen live to stay with the wire.',
            false
          );
        }
        return;
      }
      var seg = segs[presIndex];
      presIndex++;
      if (seg.scroll) scrollToId(seg.scroll);
      speak(seg.text, true);
      setStatus('On air ' + presIndex + ' / ' + segs.length + ' · ' + (seg.role || seg.id || 'beat'));
      var wait = seg.wait_ms || Math.min(18000, 55 * (seg.text || '').length + 4000);
      presTimer = setTimeout(stepPresentation, wait);
    }

    function drainBulletins() {
      if (bulletinBusy || presenting || !bulletinQueue.length) return;
      bulletinBusy = true;
      var item = bulletinQueue.shift();
      if (item.scroll) scrollToId(item.scroll);
      speak(item.text, true);
      setStatus('Live bulletin · ' + (item.label || item.role || 'wire'));
      var wait = item.wait_ms || 11000;
      setTimeout(function () {
        bulletinBusy = false;
        drainBulletins();
      }, wait);
    }

    function startPresentation() {
      voiceOn = true;
      if (voiceBtn) {
        voiceBtn.textContent = 'Voice · On';
        voiceBtn.classList.add('on');
        voiceBtn.setAttribute('aria-pressed', 'true');
      }
      if (guideBtn) {
        guideBtn.classList.add('on');
        guideBtn.textContent = ui('presenting_label', 'On air…');
      }
      presenting = true;
      presIndex = 0;
      if (presTimer) clearTimeout(presTimer);

      function go() {
        /* Always rebuild from live data so news is current */
        if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.load) {
          window.LIRIL_REPORTER.load().then(function (b) {
            bundle = b;
            persona = b.persona;
            presentation = b.presentation;
            articlesDoc = b.articles;
            paintPresentationCard(presentation);
            if (!presentation.segments || !presentation.segments.length) {
              speak('TENET5 desk is open. Open the daily briefing.', true);
              return;
            }
            setStatus('LIRIL desk reporter · news presentation');
            stepPresentation();
          });
          return;
        }
        if (!presentation || !presentation.segments || !presentation.segments.length) {
          speak('TENET5 is the Canadian public-record newsroom. Open the daily briefing.', true);
          return;
        }
        setStatus('Starting news presentation');
        stepPresentation();
      }

      if (presentationReady) go();
      else loadPresentation().then(go);
    }

    function toggleLive() {
      if (!window.LIRIL_REPORTER) {
        setStatus('Reporter module not loaded');
        return;
      }
      if (window.LIRIL_REPORTER.isLive()) {
        window.LIRIL_REPORTER.stopLive();
        setStatus('Live desk stopped');
        paintPresentationCard(presentation);
        return;
      }
      voiceOn = true;
      if (voiceBtn) {
        voiceBtn.textContent = 'Voice · On';
        voiceBtn.classList.add('on');
        voiceBtn.setAttribute('aria-pressed', 'true');
      }
      /* Fresh package then stay live */
      startPresentation();
      /* startLive is also called when package ends; start early so poll is armed */
      setTimeout(function () {
        if (window.LIRIL_REPORTER && !window.LIRIL_REPORTER.isLive()) {
          window.LIRIL_REPORTER.startLive();
          paintPresentationCard(presentation);
        }
      }, 2000);
    }

    function disableVoice() {
      voiceOn = false;
      stopPresentation();
      if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.isLive()) {
        window.LIRIL_REPORTER.stopLive();
      }
      if (voiceBtn) {
        voiceBtn.textContent = 'Voice · Off';
        voiceBtn.classList.remove('on');
        voiceBtn.setAttribute('aria-pressed', 'false');
      }
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      if (dock) dock.classList.remove('speaking');
      setStatus('Text on · voice off');
      paintPresentationCard(presentation);
    }

    if (voiceBtn) {
      voiceBtn.setAttribute('aria-pressed', 'false');
      voiceBtn.addEventListener('click', function () {
        if (voiceOn) disableVoice();
        else startPresentation();
      });
    }

    function onGuideClick(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (presenting) {
        stopPresentation();
        if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (err) {}
        setStatus('Presentation stopped');
        return;
      }
      startPresentation();
    }
    if (guideBtn) guideBtn.addEventListener('click', onGuideClick);
    if (guideBtnCover) guideBtnCover.addEventListener('click', onGuideClick);

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'liril-pres-start') {
        e.preventDefault();
        startPresentation();
      }
      if (t.id === 'liril-pres-live') {
        e.preventDefault();
        if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.isLive()) {
          window.LIRIL_REPORTER.stopLive();
          stopPresentation();
          if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (err) {}
          setStatus('Live desk stopped');
          paintPresentationCard(presentation);
        } else {
          toggleLive();
        }
      }
    });

    /* Reporter live events */
    if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.on) {
      window.LIRIL_REPORTER.on(function (event, payload) {
        if (event === 'bulletin' && payload && payload.items) {
          for (var i = 0; i < payload.items.length; i++) {
            bulletinQueue.push(payload.items[i]);
          }
          if (voiceOn && !presenting) drainBulletins();
          else if (payload.items[0]) setLine(payload.items[0].text);
        }
        if (event === 'hour_tick' && payload && payload.text) {
          if (voiceOn && !presenting) {
            bulletinQueue.push({ text: payload.text, wait_ms: 10000, role: 'hour_tick', scroll: 'now' });
            drainBulletins();
          } else {
            setLine(payload.text);
          }
        }
        if (event === 'poll' && payload && payload.presentation) {
          presentation = payload.presentation;
          if (!presenting) paintPresentationCard(presentation);
        }
        if (event === 'live') {
          paintPresentationCard(presentation);
          var pill = $('liril-air-pill');
          if (pill) {
            var on = payload && payload.on;
            pill.textContent = on
              ? ((persona && persona.on_air_label) || 'ON AIR')
              : ((persona && persona.off_air_label) || 'DESK READY');
            pill.classList.toggle('on', !!on);
          }
        }
      });
    }

    function getChapters() {
      return document.querySelectorAll(
        'section#newsdesk, section#enter, section#thesis, section#scale, section#now, section#week, section#month, section#year, section#doc-stage, section#stills, section#cinema, section#era, section#book, section.field[id][data-line], section.ch[id]'
      );
    }

    if ('IntersectionObserver' in window) {
      var segs = {};
      document.querySelectorAll('.rail .seg').forEach(function (s) {
        segs[s.getAttribute('data-ch')] = s;
      });
      var chIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting || presenting) return;
          if (window.LIRIL_REPORTER && window.LIRIL_REPORTER.isLive()) return;
          var id = e.target.id;
          if (id === lastCh) return;
          lastCh = id;
          document.querySelectorAll('.rail .seg').forEach(function (s) { s.classList.remove('on'); });
          var key = id === 'doc-stage' ? 'doc' : id;
          if (segs[key]) segs[key].classList.add('on');
          var line = e.target.getAttribute('data-line') || '';
          if (line) speak(line, false);
        });
      }, { threshold: 0.22, rootMargin: '0px 0px -12% 0px' });
      getChapters().forEach(function (c) { if (c && c.id) chIO.observe(c); });
    }

    document.querySelectorAll('a.enter-card[href], a.newsdesk-card[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        var title = (a.querySelector('h3') && a.querySelector('h3').textContent) || 'that file';
        setLine('Opening ' + title.trim() + '. Check the sources on the page.');
      });
    });

    var tries = 0;
    function pollVoice() {
      tries++;
      if (canSpeak()) {
        setStatus(voiceOn ? 'LIRIL on air' : 'LIRIL desk reporter ready · Guide me or Listen live');
        return;
      }
      if (tries < 40) setTimeout(pollVoice, 250);
      else setStatus('Text desk ready · voice unavailable on this device');
    }
    setStatus('LIRIL desk reporter loading…');
    pollVoice();

    loadPresentation().then(function (pres) {
      paintPresentationCard(pres);
      var dockDefault = ui('dock_default',
        'I am LIRIL, your desk reporter. Tap Guide me or Listen live — the news moves with time.');
      if (!voiceOn) setLine(dockDefault);
      var teaser = clean((pres && pres.one_line) || '', 140);
      if (teaser) {
        setLine('Today: ' + teaser + ' · Guide me for the full package, or Listen live.');
      }
      setStatus('Desk loaded · news stays current as time moves');
    });

    setInterval(tickClock, 30000);

    window.LIRIL_HOME_GUIDE = {
      start: startPresentation,
      stop: stopPresentation,
      live: toggleLive,
      presentation: function () { return presentation; },
      persona: function () { return persona; },
      articles: function () { return articlesDoc; },
      reload: loadPresentation
    };
  }

  function boot() {
    setDateline();
    initReveal();
    initGuide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
