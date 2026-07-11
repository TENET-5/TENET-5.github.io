/* LIRIL home guide — chapter rail + dock guide for index.html
   Requires js/liril-voice.js (window.LIRIL_VOICE). Text guide always works;
   voice only when a British-female-acceptable voice is available. */
(function () {
  'use strict';
  if (window.__LIRIL_HOME_GUIDE__) return;
  window.__LIRIL_HOME_GUIDE__ = true;

  document.documentElement.classList.add('js');

  var COVER_GREET_PAST =
    'I am LIRIL, your guide through the public record of Canada. ' +
    'We begin at this hour and walk backwards — week, month, year, then the full era. ' +
    'Every line carries a source. Bring your skepticism.';
  var COVER_GREET_FUTURE =
    'We pivot to the horizon. Tracking predictive modeling and anticipated policy fallout. ' +
    'Let us look forward.';

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

    var statusTimer = null;
    function setStatus(msg) {
      if (statusEl) {
        statusEl.textContent = msg;
        statusEl.classList.add('show');
        clearTimeout(statusTimer);
        statusTimer = setTimeout(function() { statusEl.classList.remove('show'); }, 4000);
      }
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
        onerror: function (e) {
          if (dock) dock.classList.remove('speaking');
          // 'interrupted' / 'canceled' fire every time a new line preempts the
          // current one — normal during the auto-walk, not a failure. Only a
          // real synthesis failure warrants surfacing an error to the reader.
          var kind = (e && e.error) || '';
          if (kind === 'interrupted' || kind === 'canceled') return;
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

    function enableGuide(fromUser, customMessage) {
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
      if (!greeted || customMessage) {
        greeted = true;
        speak(customMessage || (isFuture ? COVER_GREET_FUTURE : COVER_GREET_PAST), true);
      } else if (fromUser) {
        speak('Guide on. Walking the record automatically.', true);
      }
      setStatus('LIRIL guiding · Voice on');
      startAutoScroll();
    }

    function disableGuide() {
      voiceOn = false;
      stopAutoScroll();
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
    }
    if (guideBtn) guideBtn.addEventListener('click', startGuideAndScroll);
    if (guideBtnCover) guideBtnCover.addEventListener('click', startGuideAndScroll);

    // Auto-scroll logic
    var autoScrollTimer = null;
    var autoScrollIndex = 0;
    var isFuture = false;

    function getActiveChapters() {
      if (isFuture) {
        var fut = document.querySelectorAll('section.future-track');
        if (fut.length) return fut;
      }
      /* Home book: enter → wire chapters → stills/cinema → era → catalog */
      var home = document.querySelectorAll(
        'section#enter, section#thesis, section#now, section#week, section#month, section#year, section#stills, section#cinema, section#era, section#book'
      );
      if (home.length) return home;
      var past = document.querySelectorAll('section.past-track');
      if (past.length) return past;
      return document.querySelectorAll('section.field[id][data-line], section.ch[id]');
    }

    function stopAutoScroll() {
      if (autoScrollTimer) clearTimeout(autoScrollTimer);
      autoScrollTimer = null;
    }

    function stepAutoScroll() {
      var chapters = getActiveChapters();
      if (autoScrollIndex >= chapters.length) return;
      var el = chapters[autoScrollIndex];
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      autoScrollIndex++;
      autoScrollTimer = setTimeout(stepAutoScroll, 15000); // Wait 15 seconds per chapter
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollIndex = 0;
      stepAutoScroll();
    }

    // Toggle Past vs Future
    var togglePastBtn = $('toggle-past');
    var toggleFutureBtn = $('toggle-future');
    var pastRail = document.querySelector('.past-rail');
    var futureRail = document.querySelector('.future-rail');
    
    function switchTimeline(toFuture) {
      isFuture = toFuture;
      if (togglePastBtn) togglePastBtn.classList.toggle('active', !isFuture);
      if (togglePastBtn) togglePastBtn.style.background = isFuture ? 'transparent' : 'var(--ice)';
      if (togglePastBtn) togglePastBtn.style.color = isFuture ? 'var(--ice)' : 'var(--void)';
      
      if (toggleFutureBtn) toggleFutureBtn.classList.toggle('active', isFuture);
      if (toggleFutureBtn) toggleFutureBtn.style.background = isFuture ? 'var(--ice)' : 'transparent';
      if (toggleFutureBtn) toggleFutureBtn.style.color = isFuture ? 'var(--void)' : 'var(--ice)';

      if (pastRail) pastRail.style.display = isFuture ? 'none' : '';
      if (futureRail) futureRail.style.display = isFuture ? '' : 'none';

      document.getElementById('timeline-past').style.display = isFuture ? 'none' : '';
      document.getElementById('timeline-future').style.display = isFuture ? '' : 'none';

      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      
      if (voiceOn) {
        enableGuide(true, isFuture ? COVER_GREET_FUTURE : COVER_GREET_PAST);
      } else {
        autoScrollIndex = 0;
        var chapters = getActiveChapters();
        if (chapters.length) chapters[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (togglePastBtn) togglePastBtn.addEventListener('click', function() { switchTimeline(false); });
    if (toggleFutureBtn) toggleFutureBtn.addEventListener('click', function() { switchTimeline(true); });

    // Stop auto-scroll on manual wheel/touch
    window.addEventListener('wheel', stopAutoScroll, {passive: true});
    window.addEventListener('touchstart', stopAutoScroll, {passive: true});

    // BEGIN also offers guide if user has not started
    var begin = document.getElementById('begin-record') || document.querySelector('a.begin');
    if (begin) {
      begin.addEventListener('click', function () {
        setLine('Four doors, then this hour. Scroll to walk the record backwards.');
        if (!greeted) {
          setStatus('Tap “Guide me” or Voice · On to hear LIRIL');
        }
      });
    }
    /* Cover path shortcuts — LIRIL narrates the door you chose */
    document.querySelectorAll('a.enter-card[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        var title = (a.querySelector('h3') && a.querySelector('h3').textContent) || 'that door';
        setLine('Opening ' + title.trim() + '. Every claim there still carries a source.');
      });
    });

    // Chapters: text always updates; voice when on
    var chIO = null;
    function observeChapters() {
      if (!('IntersectionObserver' in window)) return;
      if (chIO) chIO.disconnect();
      
      var segs = {};
      var railSel = isFuture && document.querySelector('.future-rail')
        ? '.future-rail .seg'
        : (document.querySelector('.past-rail') ? '.past-rail .seg' : '.rail .seg');
      document.querySelectorAll(railSel).forEach(function (s) {
        segs[s.getAttribute('data-ch')] = s;
      });
      /* always index main .rail for home enter/stills/cinema */
      document.querySelectorAll('.rail .seg').forEach(function (s) {
        var k = s.getAttribute('data-ch');
        if (k && !segs[k]) segs[k] = s;
      });

      chIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id;
          if (id === lastCh) return;
          lastCh = id;
          document.querySelectorAll('.rail .seg').forEach(function(s){ s.classList.remove('on'); });
          if (segs[id]) segs[id].classList.add('on');
          var line = e.target.getAttribute('data-line') || '';
          if (line) speak(line, false);
        });
      }, { threshold: 0.22, rootMargin: '0px 0px -12% 0px' });
      
      getActiveChapters().forEach(function (c) { if (c && c.id) chIO.observe(c); });
    }
    observeChapters();

    // Re-observe when switching
    if (togglePastBtn) togglePastBtn.addEventListener('click', observeChapters);
    if (toggleFutureBtn) toggleFutureBtn.addEventListener('click', observeChapters);

    // Hash deep-links (#week etc.) — guide narrates that chapter
    function hashGuide() {
      var h = (location.hash || '').replace(/^#/, '');
      if (!h) return;
      var sec = document.getElementById(h);
      if (!sec) return;
      var line = sec.getAttribute('data-line') || '';
      lastCh = h;
      document.querySelectorAll('.rail .seg').forEach(function(s) {
        s.classList.toggle('on', s.getAttribute('data-ch') === h);
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

    // Auto-play immediately
    // Browsers heavily restrict this, so we hook 'click' on document body as fallback
    if (window.LIRIL_HOME_GUIDE && !window.LIRIL_HOME_GUIDE.isOn()) {
      var started = false;
      function autoStart() {
        if (started) return;
        started = true;
        window.LIRIL_HOME_GUIDE.enable();
        document.body.removeEventListener('click', autoStart);
      }
      setTimeout(function() {
        if (!started) window.LIRIL_HOME_GUIDE.enable();
      }, 500); // Wait for voice async load
      document.body.addEventListener('click', autoStart);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
