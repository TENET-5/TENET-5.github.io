/* LIRIL home guide — chapter rail + dock guide for index.html
   Requires js/liril-voice.js (window.LIRIL_VOICE). Text guide always works;
   voice only when a British-female-acceptable voice is available. */
(function () {
  'use strict';
  if (window.__LIRIL_HOME_GUIDE__) return;
  window.__LIRIL_HOME_GUIDE__ = true;

  document.documentElement.classList.add('js');

  var COVER_GREET =
    'I am LIRIL, your guide through the public record of Canada. ' +
    'We begin at this hour and walk backwards — week, month, year, then the full era. ' +
    'Every line carries a source. Bring your skepticism.';

  function $(id) { return document.getElementById(id); }

  function setDateline() {
    var el = $('dateline');
    if (!el) return;
    var d = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var mons = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    el.textContent = days[d.getDay()] + ', ' + mons[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function initReveal() {
    var io = ('IntersectionObserver' in window)
      ? new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        }, { threshold: 0.1 })
      : null;
    document.querySelectorAll('.rv').forEach(function (el) {
      if (io) io.observe(el);
      else el.classList.add('in');
    });
  }

  function voiceReady() {
    if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.get !== 'function') return false;
    var v = window.LIRIL_VOICE.get();
    return !!(v && window.LIRIL_VOICE);
  }

  function canSpeak() {
    if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.speak !== 'function') return false;
    // Probe without speaking if API exposes get
    if (typeof window.LIRIL_VOICE.get === 'function') {
      var v = window.LIRIL_VOICE.get();
      return !!v;
    }
    return true;
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
    var greeted = false;

    // Always show dock as the system guide chrome
    if (dock) dock.classList.add('up', 'guide-ready');

    function setStatus(msg) {
      if (statusEl) statusEl.textContent = msg;
    }

    function setLine(text) {
      if (lineEl && text) lineEl.textContent = text;
    }

    function speak(text, force) {
      if (!text) return;
      setLine(text);
      if (!(voiceOn || force)) return;
      if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.speak !== 'function') {
        setStatus('Text guide active · voice engine not loaded');
        return;
      }
      if (dock) dock.classList.add('speaking');
      var ok = window.LIRIL_VOICE.speak(text, {
        onend: function () {
          if (dock) dock.classList.remove('speaking');
        },
        onerror: function () {
          if (dock) dock.classList.remove('speaking');
          setStatus('Voice error · text guide still active');
        }
      });
      if (!ok) {
        if (dock) dock.classList.remove('speaking');
        setStatus('No British female voice on this device · reading text only');
      } else {
        setStatus(voiceOn ? 'LIRIL speaking · scroll the record' : 'LIRIL ready');
      }
      // Fallback clear speaking class
      setTimeout(function () {
        if (dock) dock.classList.remove('speaking');
      }, Math.min(12000, 80 * text.length + 800));
    }

    function enableGuide(fromUser) {
      voiceOn = true;
      if (voiceBtn) {
        voiceBtn.textContent = 'Voice · On';
        voiceBtn.classList.add('on');
        voiceBtn.setAttribute('aria-pressed', 'true');
      }
      if (guideBtn) {
        guideBtn.classList.add('on');
        guideBtn.textContent = 'Guiding…';
      }
      if (!greeted) {
        greeted = true;
        speak(COVER_GREET, true);
      } else if (fromUser) {
        speak('Guide on. Continue scrolling — I will narrate each chapter.', true);
      }
      setStatus('LIRIL guiding · Voice on');
    }

    function disableGuide() {
      voiceOn = false;
      if (voiceBtn) {
        voiceBtn.textContent = 'Voice · Off';
        voiceBtn.classList.remove('on');
        voiceBtn.setAttribute('aria-pressed', 'false');
      }
      if (guideBtn) {
        guideBtn.classList.remove('on');
        guideBtn.textContent = 'Guide me';
      }
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      if (dock) dock.classList.remove('speaking');
      setStatus('Text guide on · voice off');
    }

    if (voiceBtn) {
      voiceBtn.setAttribute('aria-pressed', 'false');
      voiceBtn.addEventListener('click', function () {
        if (voiceOn) disableGuide();
        else enableGuide(true);
      });
    }

    function startGuideAndScroll(e) {
      if (e && e.preventDefault) e.preventDefault();
      enableGuide(true);
      var now = document.getElementById('now');
      if (now && now.scrollIntoView) {
        setTimeout(function () {
          now.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    }
    if (guideBtn) guideBtn.addEventListener('click', startGuideAndScroll);
    if (guideBtnCover) guideBtnCover.addEventListener('click', startGuideAndScroll);

    // BEGIN also offers guide if user has not started
    var begin = document.getElementById('begin-record') || document.querySelector('a.begin');
    if (begin) {
      begin.addEventListener('click', function () {
        setLine('We enter this hour. Scroll to walk the record backwards.');
        if (!greeted) {
          // Soft prompt in dock without forcing voice (browser autoplay policies)
          setStatus('Tap “Guide me” or Voice · On to hear LIRIL');
        }
      });
    }

    // Chapters: text always updates; voice when on
    var chapters = document.querySelectorAll('section.ch');
    var segs = {};
    document.querySelectorAll('.rail .seg').forEach(function (s) {
      segs[s.getAttribute('data-ch')] = s;
    });

    if ('IntersectionObserver' in window && chapters.length) {
      var chIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id;
          if (id === lastCh) return;
          lastCh = id;
          Object.keys(segs).forEach(function (k) {
            segs[k].classList.toggle('on', k === id);
          });
          var line = e.target.getAttribute('data-line') || '';
          if (line) speak(line, false);
        });
      }, { threshold: 0.28, rootMargin: '0px 0px -10% 0px' });
      chapters.forEach(function (c) { chIO.observe(c); });
    }

    // Hash deep-links (#week etc.) — guide narrates that chapter
    function hashGuide() {
      var h = (location.hash || '').replace(/^#/, '');
      if (!h) return;
      var sec = document.getElementById(h);
      if (!sec) return;
      var line = sec.getAttribute('data-line') || '';
      lastCh = h;
      Object.keys(segs).forEach(function (k) {
        segs[k].classList.toggle('on', k === h);
      });
      if (line) {
        setLine(line);
        setStatus(voiceOn ? 'LIRIL on chapter · ' + h : 'Chapter ' + h + ' · enable voice to hear LIRIL');
      }
    }
    window.addEventListener('hashchange', hashGuide);
    setTimeout(hashGuide, 300);

    // Voice readiness polling (Chrome loads voices async)
    var tries = 0;
    function pollVoice() {
      tries++;
      if (canSpeak()) {
        setStatus(voiceOn ? 'LIRIL guiding · Voice on' : 'LIRIL ready · tap Guide me or Voice · On');
        if (guideBtn) guideBtn.disabled = false;
        if (guideBtnCover) guideBtnCover.disabled = false;
        return;
      }
      if (tries < 40) setTimeout(pollVoice, 250);
      else {
        setStatus('Text guide active · no suitable British female voice on this device');
        if (guideBtn) guideBtn.title = 'Voice unavailable — text guide still works';
        if (guideBtnCover) guideBtnCover.title = 'Voice unavailable — text guide still works';
      }
    }
    setStatus('LIRIL loading…');
    pollVoice();

    // Film stats optional
    var fs = $('film-stats');
    if (fs) {
      fetch('data/film/manifest.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (m) {
          var t = m.totals || {};
          fs.textContent = (t.acts || '—') + ' acts · ' + (t.segments || '—') + ' beats · ' +
            (t.duration_label || 'multi-hour') + ' · narrated by LIRIL';
        })
        .catch(function () {});
    }

    // Public API for other scripts / visual tests
    window.LIRIL_HOME_GUIDE = {
      enable: function () { enableGuide(true); },
      disable: disableGuide,
      say: function (t) { speak(t, true); },
      isOn: function () { return voiceOn; }
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
