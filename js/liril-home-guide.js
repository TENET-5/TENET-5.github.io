/* LIRIL home guide v7 — NEWS PRESENTATION mode for TENET5 front page.
 * Explains the website, today's desk, time continuum, external wire vs TENET5 analysis.
 * Loads data/liril_news_presentation.json (built by tools/build_liril_news_presentation.py)
 * with fallback client assembly from briefing + home_wire.
 * Requires js/liril-voice.js. Text always works; voice when available.
 */
(function () {
  'use strict';
  if (window.__LIRIL_HOME_GUIDE_V >= 7) return;
  window.__LIRIL_HOME_GUIDE_V = 7;

  document.documentElement.classList.add('js');

  var presentation = null;
  var presentationReady = false;

  function $(id) { return document.getElementById(id); }

  function clean(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (!n || s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }

  /* ── Build fallback presentation in the browser if JSON missing ── */
  function buildClientPresentation(brief, wire) {
    var date = (brief && brief.date) || new Date().toISOString().slice(0, 10);
    var one = clean((brief && brief.one_line) || 'The public record is open.', 240);
    var threat = (brief && brief.threat_level) || 'WATCH';
    var segs = [];
    segs.push({
      id: 'open', scroll: 'top', wait_ms: 16000,
      text: 'Good day. I am LIRIL, your guide on TENET5 — an independent Canadian investigative newsroom and government-analysis desk. We read the public record: statutes, Hansard, contracts, Health Canada tables, and multi-source wires. Every TENET5 claim is meant to open a source you can check. Powered by LIRIL AI. You verify.'
    });
    segs.push({
      id: 'how', scroll: 'newsdesk', wait_ms: 15000,
      text: 'TENET5 is structured on time. The submarine dial marks second, minute, hour, day, week, month, year, and era. Day is the news desk: daily briefing, investigations, five-act argument, and the MAID file. Hour is the live wire. Week holds investigations. Month checks claims against documents. Film is memorial atmosphere — not proof.'
    });
    segs.push({
      id: 'today', scroll: 'newsdesk', wait_ms: 14000,
      text: 'Today is ' + date + '. Desk posture: ' + threat + '. Lead: ' + one
    });
    var hn = (brief && brief.happening_now) || [];
    for (var i = 0; i < Math.min(3, hn.length); i++) {
      var h = hn[i] || {};
      segs.push({
        id: 'story' + i, scroll: i ? 'now' : 'newsdesk', wait_ms: 13000,
        text: 'Active file, ' + (h.domain || 'FILE') + '. ' + clean(h.headline, 140) + '. ' + clean(h.body, 180) + ' This is TENET5 analysis against primary sources.'
      });
    }
    var ext = (wire && wire.wire) || [];
    if (ext.length) {
      var heads = [];
      for (var j = 0; j < Math.min(3, ext.length); j++) heads.push(clean(ext[j].title, 80));
      segs.push({
        id: 'rss', scroll: 'now', wait_ms: 14000,
        text: 'On the multi-source external wire — labeled external source, not a TENET5 verdict — recent intake includes: ' + heads.join('; ') + '. Case claims still require primary documents.'
      });
    }
    segs.push({
      id: 'arg', scroll: 'doc-stage', wait_ms: 12000,
      text: 'The long package is the five-act argument under Rome Statute Article 6, filed from Canadian public records. Play the documentary for atmosphere, then walk each act for sources.'
    });
    segs.push({
      id: 'close', scroll: 'now', wait_ms: 12000,
      text: 'I will walk the time continuum with you. Toggle Voice for narration. Bring skepticism. TENET5 — Canadian public record, read with care. Powered by LIRIL AI.'
    });
    return { segments: segs, one_line: one, date: date, title: 'TENET5 desk presentation' };
  }

  function loadPresentation() {
    return fetch('data/liril_news_presentation.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (doc) {
        if (doc && doc.segments && doc.segments.length) {
          presentation = doc;
          presentationReady = true;
          return doc;
        }
        throw 0;
      })
      .catch(function () {
        return Promise.all([
          fetch('data/govt_daily_briefing.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }),
          fetch('data/home_wire.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
        ]).then(function (pair) {
          presentation = buildClientPresentation(pair[0], pair[1]);
          presentationReady = true;
          return presentation;
        });
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
      var d = new Date();
      el.textContent = d.toDateString();
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

  function paintPresentationCard(pres) {
    var host = document.getElementById('liril-presentation');
    if (!host || !pres) return;
    var one = clean(pres.one_line || '', 180);
    var n = (pres.segments && pres.segments.length) || 0;
    host.innerHTML =
      '<span class="kick">LIRIL · live desk presentation</span>' +
      '<h2 class="thesis-title" style="margin-top:0.6em">What is going on <em>today.</em></h2>' +
      '<p class="pres-lede">' + (one || 'Daily briefing and multi-source wire — sources first.') + '</p>' +
      '<p class="pres-meta">' + n + ' beats · explain the desk · time continuum · external wire labeled</p>' +
      '<div class="pres-actions">' +
      '<button type="button" class="guide-cta" id="liril-pres-start">Start news presentation</button>' +
      '<a class="begin begin-quiet" href="daily-briefing.html"><span>Full briefing</span></a>' +
      '<a class="begin begin-quiet" href="#now"><span>Hour wire</span></a>' +
      '</div>';
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

    if (dock) dock.classList.add('up', 'guide-ready');

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
          setStatus('Voice error · text presentation continues');
        }
      });
      if (!ok) {
        if (dock) dock.classList.remove('speaking');
        setStatus('No suitable voice · reading text only');
      } else {
        setStatus(presenting ? 'LIRIL presenting · news desk' : 'LIRIL speaking');
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
        setStatus('Presentation complete · scroll any chapter');
        if (guideBtn) { guideBtn.classList.remove('on'); guideBtn.textContent = 'Guide me'; }
        speak('End of desk presentation. Scroll any chapter for more, or open the daily briefing.', false);
        return;
      }
      var seg = segs[presIndex];
      presIndex++;
      if (seg.scroll) scrollToId(seg.scroll);
      speak(seg.text, true);
      setStatus('Presentation ' + presIndex + ' / ' + segs.length + ' · ' + (seg.role || seg.id || 'beat'));
      var wait = seg.wait_ms || Math.min(18000, 55 * (seg.text || '').length + 4000);
      presTimer = setTimeout(stepPresentation, wait);
    }

    function startPresentation(fromUser) {
      voiceOn = true;
      if (voiceBtn) {
        voiceBtn.textContent = 'Voice · On';
        voiceBtn.classList.add('on');
        voiceBtn.setAttribute('aria-pressed', 'true');
      }
      if (guideBtn) {
        guideBtn.classList.add('on');
        guideBtn.textContent = 'Presenting…';
      }
      presenting = true;
      presIndex = 0;
      if (presTimer) clearTimeout(presTimer);

      function go() {
        if (!presentation || !presentation.segments || !presentation.segments.length) {
          speak('TENET5 is the Canadian public-record newsroom. Open the daily briefing for today\'s sheet.', true);
          return;
        }
        setStatus('Starting news presentation');
        stepPresentation();
      }

      if (presentationReady) go();
      else loadPresentation().then(go);
    }

    function disableVoice() {
      voiceOn = false;
      stopPresentation();
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
    }

    if (voiceBtn) {
      voiceBtn.setAttribute('aria-pressed', 'false');
      voiceBtn.addEventListener('click', function () {
        if (voiceOn) disableVoice();
        else startPresentation(true);
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
      startPresentation(true);
    }
    if (guideBtn) guideBtn.addEventListener('click', onGuideClick);
    if (guideBtnCover) guideBtnCover.addEventListener('click', onGuideClick);

    /* Presentation card button (injected after load) */
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.id === 'liril-pres-start') {
        e.preventDefault();
        startPresentation(true);
      }
    });

    /* Chapter observation — narrate data-line when not in full presentation */
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

    window.addEventListener('wheel', function () {
      if (presenting) {
        /* allow user to take over — stop auto-advance only on deliberate stop via button */
      }
    }, { passive: true });

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
        setStatus(voiceOn ? 'LIRIL presenting' : 'LIRIL ready · tap Guide me for today\'s presentation');
        return;
      }
      if (tries < 40) setTimeout(pollVoice, 250);
      else setStatus('Text presentation ready · voice unavailable on this device');
    }
    setStatus('LIRIL loading today\'s desk…');
    pollVoice();

    /* Prefetch presentation + paint card */
    loadPresentation().then(function (pres) {
      paintPresentationCard(pres);
      var teaser = clean((pres && pres.one_line) || '', 160);
      if (teaser && !voiceOn) {
        setLine('Today: ' + teaser + ' · Tap Guide me for the full desk presentation.');
      }
      setStatus('Desk loaded · Guide me starts the news presentation');
    });

    window.LIRIL_HOME_GUIDE = {
      start: startPresentation,
      stop: stopPresentation,
      presentation: function () { return presentation; },
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
