/* LIRIL page-voice match v1
 * Builds voice-over that matches the open page (title, kick, lede, sections).
 * Swarm audit writes optional packs to data/liril_page_voice/<slug>.json
 * Dock + walkthrough consume window.LIRIL_PAGE_VOICE.
 *
 * Hard: newsroom English only. No internals. Film/atmosphere ≠ proof.
 */
(function () {
  'use strict';
  if (window.LIRIL_PAGE_VOICE && window.LIRIL_PAGE_VOICE.__v >= 1) return;

  var MAX_BEATS = 24;
  var MAX_BEAT_CHARS = 420;
  var pack = null;
  var spine = null;

  function clean(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (!n || s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }

  function pageSlug() {
    var p = (window.location.pathname || '').replace(/\\/g, '/');
    var parts = p.split('/').filter(Boolean);
    if (!parts.length) return 'home';
    var last = parts[parts.length - 1];
    // directory URL → treat as that folder's index
    if (last.indexOf('.') < 0) {
      return last.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() || 'home';
    }
    // nested …/section/index.html → slug = section (matches pack generator)
    if (/^index\.html?$/i.test(last)) {
      if (parts.length === 1) return 'home';
      return (parts[parts.length - 2] || 'home')
        .replace(/[^a-z0-9_-]+/gi, '-')
        .toLowerCase();
    }
    return last
      .replace(/\.html?$/i, '')
      .replace(/[^a-z0-9_-]+/gi, '-')
      .toLowerCase() || 'home';
  }

  function isHome() {
    var last = (window.location.pathname.split('/').pop() || '').toLowerCase();
    return !last || last === 'index.html' || last === 'home.html' || last === '';
  }

  function textOf(el) {
    if (!el) return '';
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function extractSpine() {
    var h1 = document.querySelector('main h1, .press-hero h1, article h1, h1');
    var kick = document.querySelector('.press-hero .kick, .kick, .eyebrow');
    var lede = document.querySelector(
      '.press-hero .dek, .lede, .hero-sub, main .dek, article .lede, main p.lede'
    );
    if (!lede) {
      lede = document.querySelector('main p, article p, .prose p');
    }
    var title = textOf(h1) || document.title.split('|')[0].trim();
    var sections = [];
    var nodes = document.querySelectorAll(
      'main h2, main .section-num, article h2, .press-main h2, [data-narrate]'
    );
    var seen = {};
    for (var i = 0; i < nodes.length && sections.length < 14; i++) {
      var t = textOf(nodes[i]);
      if (t.length < 3) continue;
      var key = t.toLowerCase().slice(0, 80);
      if (seen[key]) continue;
      seen[key] = 1;
      // skip pure chrome
      if (/^(home|briefing|investigations|evidence|guided|about)$/i.test(t)) continue;
      sections.push({
        id: nodes[i].id || '',
        text: clean(t, 160),
        el: nodes[i]
      });
    }
    // Prefer paragraphs under each h2 for body beats
    var bodyBeats = [];
    var paras = document.querySelectorAll(
      'main p.lede, main .prose p, article p, .press-main p, .finding-box p, .glass p'
    );
    for (var j = 0; j < paras.length && bodyBeats.length < MAX_BEATS; j++) {
      var pt = textOf(paras[j]);
      if (pt.length < 40) continue;
      if (/Powered by LIRIL|cookie|subscribe/i.test(pt)) continue;
      bodyBeats.push({
        kind: 'body',
        text: clean(pt, MAX_BEAT_CHARS),
        el: paras[j]
      });
    }
    return {
      slug: pageSlug(),
      path: window.location.pathname || '',
      title: clean(title, 120),
      kick: clean(textOf(kick), 80),
      lede: clean(textOf(lede), 320),
      sections: sections,
      bodyBeats: bodyBeats,
      docTitle: clean(document.title, 140)
    };
  }

  function buildScript(sp, remote) {
    // Merge remote pack if it matches this page title/slug
    var intro;
    var beats = [];
    var signOff =
      'That is this page for now. Open any primary source linked here — atmosphere is not proof. Powered by LIRIL AI. You verify.';

    if (remote && remote.ok && (remote.slug === sp.slug || !remote.slug)) {
      if (remote.intro) intro = clean(remote.intro, 500);
      if (remote.sign_off) signOff = clean(remote.sign_off, 280);
      if (remote.beats && remote.beats.length) {
        for (var r = 0; r < remote.beats.length && beats.length < MAX_BEATS; r++) {
          var b = remote.beats[r];
          var tx = clean(typeof b === 'string' ? b : b.text || b.narration || '', MAX_BEAT_CHARS);
          if (tx.length >= 12) beats.push({ kind: 'pack', text: tx, scrollId: (b && b.scrollId) || '' });
        }
      }
    }

    if (!intro) {
      var kickBit = sp.kick ? sp.kick + '. ' : '';
      intro =
        'You are on ' +
        (sp.title || 'this TENET5 page') +
        '. ' +
        kickBit +
        (sp.lede
          ? sp.lede
          : 'I will read the public record on this page — claims that open sources, not atmosphere alone.') +
        ' I am LIRIL. Powered by LIRIL AI. You verify.';
      intro = clean(intro, 520);
    }

    // Always ground first beats in live DOM (page match)
    if (sp.lede) {
      beats.unshift({ kind: 'lede', text: clean(sp.lede, MAX_BEAT_CHARS), scrollId: '' });
    }
    // Section labels as navigational guide
    for (var s = 0; s < sp.sections.length && beats.length < MAX_BEATS; s++) {
      var sec = sp.sections[s];
      beats.push({
        kind: 'section',
        text: 'Next: ' + sec.text + '.',
        scrollId: sec.id || '',
        el: sec.el
      });
    }
    // Body paragraphs — the actual match to the page
    for (var k = 0; k < sp.bodyBeats.length && beats.length < MAX_BEATS; k++) {
      beats.push({
        kind: 'body',
        text: sp.bodyBeats[k].text,
        el: sp.bodyBeats[k].el
      });
    }

    // Dedup near-identical consecutive
    var out = [];
    var prev = '';
    for (var i = 0; i < beats.length; i++) {
      var t = beats[i].text.toLowerCase().slice(0, 100);
      if (t && t === prev) continue;
      prev = t;
      out.push(beats[i]);
    }

    return {
      intro: intro,
      beats: out,
      signOff: signOff,
      dockLine: clean(
        (sp.kick ? sp.kick + ' · ' : '') +
          (sp.title || 'This page') +
          ' — tap Guide me and I will read what is on the record here.',
        140
      )
    };
  }

  /** Simple token overlap score between spoken plan and page text (0–1). */
  function matchScore(script, sp) {
    var pageBlob = (
      (sp.title || '') +
      ' ' +
      (sp.lede || '') +
      ' ' +
      (sp.bodyBeats || [])
        .map(function (b) {
          return b.text;
        })
        .join(' ')
    )
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ');
    var pageTokens = {};
    pageBlob.split(/\s+/).forEach(function (w) {
      if (w.length > 3) pageTokens[w] = 1;
    });
    var spoken =
      (script.intro || '') +
      ' ' +
      (script.beats || [])
        .map(function (b) {
          return b.text;
        })
        .join(' ');
    spoken = spoken.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    var words = spoken.split(/\s+/).filter(function (w) {
      return w.length > 3;
    });
    if (!words.length) return 0;
    var hit = 0;
    for (var i = 0; i < words.length; i++) {
      if (pageTokens[words[i]]) hit++;
    }
    return Math.round((hit / words.length) * 1000) / 1000;
  }

  function scrollToBeat(beat) {
    if (!beat) return;
    if (beat.el && beat.el.scrollIntoView) {
      try {
        beat.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        beat.el.classList.add('liril-voice-focus');
        setTimeout(function () {
          try {
            beat.el.classList.remove('liril-voice-focus');
          } catch (e) { /* */ }
        }, 2400);
      } catch (e2) { /* */ }
      return;
    }
    if (beat.scrollId) {
      var el = document.getElementById(beat.scrollId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function speakLine(text, opts) {
    opts = opts || {};
    if (!text) return false;
    if (window.__LIRIL_MUTED && !opts.force) return false;
    if (!window.LIRIL_VOICE || typeof window.LIRIL_VOICE.speak !== 'function') return false;
    // Prefer newsroom cadence for page guides
    var o = {
      rate: opts.rate != null ? opts.rate : 1.0,
      pitch: opts.pitch != null ? opts.pitch : 1.0,
      keepQueue: !!opts.keepQueue,
      onend: opts.onend,
      onerror: opts.onerror
    };
    return !!window.LIRIL_VOICE.speak(text, o);
  }

  var guideTimer = null;
  var guideIdx = -1;
  var guideActive = false;
  var currentScript = null;

  function stopGuide() {
    guideActive = false;
    guideIdx = -1;
    clearTimeout(guideTimer);
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) { /* */ }
    var dock = document.getElementById('dock');
    if (dock) dock.classList.remove('speaking');
  }

  function runGuide(opts) {
    opts = opts || {};
    stopGuide();
    spine = extractSpine();
    var script = buildScript(spine, pack);
    currentScript = script;
    var score = matchScore(script, spine);
    guideActive = true;
    guideIdx = -1;

    var lineEl = document.getElementById('liril-line');
    var statusEl = document.getElementById('liril-status');
    function setLine(t) {
      if (lineEl && t) lineEl.textContent = t;
    }
    function setStatus(t) {
      if (!statusEl) return;
      statusEl.textContent = t;
      statusEl.classList.add('show');
    }

    setLine(script.dockLine);
    setStatus('Guiding this page · match ' + Math.round(score * 100) + '%');

    var queue = [{ text: script.intro, kind: 'intro' }].concat(script.beats);
    queue.push({ text: script.signOff, kind: 'signoff' });

    function next() {
      if (!guideActive) return;
      guideIdx++;
      if (guideIdx >= queue.length) {
        guideActive = false;
        setStatus('Guide complete · open sources on the page');
        return;
      }
      var beat = queue[guideIdx];
      scrollToBeat(beat);
      setLine(clean(beat.text, 160));
      var dock = document.getElementById('dock');
      if (dock) dock.classList.add('speaking');
      var ok = speakLine(beat.text, {
        force: !!opts.force,
        // multi-beat guide: do not cancel mid-queue when chaining
        keepQueue: guideIdx > 0,
        onend: function () {
          if (dock) dock.classList.remove('speaking');
          guideTimer = setTimeout(next, 380);
        },
        onerror: function () {
          if (dock) dock.classList.remove('speaking');
          guideTimer = setTimeout(next, 500);
        }
      });
      if (!ok) {
        // text-only advance
        if (dock) dock.classList.remove('speaking');
        guideTimer = setTimeout(next, 2200);
      }
    }
    next();
    return { ok: true, score: score, beats: queue.length, slug: spine.slug };
  }

  function paintDock() {
    if (isHome()) return; // home guide owns home
    spine = extractSpine();
    var script = buildScript(spine, pack);
    currentScript = script;
    var lineEl = document.getElementById('liril-line');
    if (lineEl) lineEl.textContent = script.dockLine;
    var sayB = document.querySelector('#dock .say b');
    if (sayB && sayB.textContent.indexOf('LIRIL') === 0) {
      sayB.textContent = 'LIRIL · Guide';
    }
  }

  function loadPack() {
    var slug = pageSlug();
    // depth from site root so nested pages resolve data/liril_page_voice/
    var parts = (window.location.pathname || '').replace(/\\/g, '/').split('/').filter(Boolean);
    // drop filename if present
    if (parts.length && /\.html?$/i.test(parts[parts.length - 1])) parts.pop();
    // on GH pages repo is often / or /TENET-5.github.io/ — use relative ../ chain
    var depth = parts.length;
    var prefix = depth > 0 ? new Array(depth + 1).join('../') : '';
    var url = prefix + 'data/liril_page_voice/' + slug + '.json';
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (doc) {
        if (doc && doc.ok !== false) pack = doc;
        return pack;
      })
      .catch(function () {
        return null;
      });
  }

  function boot() {
    loadPack().then(function () {
      paintDock();
      // Expose match report for swarm / diagnostics
      spine = extractSpine();
      var script = buildScript(spine, pack);
      currentScript = script;
      window.__LIRIL_PAGE_VOICE_REPORT = {
        slug: spine.slug,
        title: spine.title,
        score: matchScore(script, spine),
        beat_count: script.beats.length,
        has_pack: !!pack,
        ts: new Date().toISOString()
      };
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.LIRIL_PAGE_VOICE = {
    __v: 1,
    extractSpine: extractSpine,
    buildScript: function () {
      spine = extractSpine();
      return buildScript(spine, pack);
    },
    matchScore: function () {
      spine = extractSpine();
      var sc = buildScript(spine, pack);
      return matchScore(sc, spine);
    },
    runGuide: runGuide,
    stopGuide: stopGuide,
    paintDock: paintDock,
    isGuiding: function () {
      return guideActive;
    },
    getPack: function () {
      return pack;
    },
    getReport: function () {
      return window.__LIRIL_PAGE_VOICE_REPORT || null;
    }
  };
})();
