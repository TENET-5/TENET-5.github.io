/* ═══════════════════════════════════════════════════════
   LIRIL Voice Resolver — SINGLE SOURCE OF TRUTH
   All voice engines MUST delegate to window.LIRIL_VOICE.
   DO NOT duplicate voice logic elsewhere.
   TENET5 — Powered by LIRIL AI | SEED 118400
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.LIRIL_VOICE) return;

  var VOICE_STORAGE_KEY = 'liril-voice-name';

  /* ── CANONICAL BLOCKLIST — maintain here ONLY ────── */
  var MALE_NAMES = [
    'david','mark','james','george','daniel','ryan','guy','thomas',
    'richard','rishi','sean','oliver','liam','christopher','eric',
    'andrew','brian','roger','malcolm','connor','freddie','alfie',
    'ethan','noah'
  ];
  var FEMALE_NAMES = [
    'hazel','susan','libby','sonia','maisie','martha','kate','karen',
    'moira','fiona','serena','samantha','victoria','zira','jenny',
    'aria','sara','emily','emma','amy',
    'microsoft hazel','microsoft libby',
    'google uk english female','google us english female'
  ];

  function nameOf(v) { return (v.name || '').toLowerCase(); }
  function isEnGB(v) {
    var l = (v.lang || '').toLowerCase().replace('_', '-');
    return l === 'en-gb' || l.indexOf('en-gb') === 0;
  }
  function isEn(v) {
    var l = (v.lang || '').toLowerCase().replace('_', '-');
    return l.indexOf('en') === 0;
  }
  function isFemale(v) { return FEMALE_NAMES.some(function(f) { return nameOf(v).indexOf(f) >= 0; }); }
  function isMale(v) { return MALE_NAMES.some(function(m) { return nameOf(v).indexOf(m) >= 0; }); }

  var cached = null;
  var resolved = false;

  function resolve() {
    if (resolved && cached) return cached;
    var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;

    /* P0: Restore from sessionStorage */
    try {
      var saved = sessionStorage.getItem(VOICE_STORAGE_KEY);
      if (saved) {
        var restored = voices.find(function(v) { return v.name === saved; });
        if (restored && !isMale(restored)) {
          cached = restored; resolved = true;
          console.log('[LIRIL-VOICE] Restored:', cached.name);
          return cached;
        }
      }
    } catch(e) {}

    /* P0.5: Natural/Neural en-GB female (highest quality) */
    cached = voices.find(function(v) { return isEnGB(v) && isFemale(v) && /(natural|online|neural)/i.test(v.name); });
    /* P1: Known female en-GB */
    if (!cached) cached = voices.find(function(v) { return isEnGB(v) && isFemale(v); });
    /* P2: Any en-GB NOT male */
    if (!cached) cached = voices.find(function(v) { return isEnGB(v) && !isMale(v); });
    /* P3: Natural/Neural any-English female */
    if (!cached) cached = voices.find(function(v) { return isEn(v) && isFemale(v) && /(natural|online|neural)/i.test(v.name); });
    /* P4: Known female any-English */
    if (!cached) cached = voices.find(function(v) { return isEn(v) && isFemale(v); });
    /* P5: Any English NOT male */
    if (!cached) cached = voices.find(function(v) { return isEn(v) && !isMale(v); });
    /* P6: null — silence is better than a male voice */

    if (cached) {
      try { sessionStorage.setItem(VOICE_STORAGE_KEY, cached.name); } catch(e) {}
      console.log('[LIRIL-VOICE] Selected:', cached.name, '(' + cached.lang + ')');
    }
    resolved = true;
    return cached;
  }

  /* ── Retry loop for Chrome/Edge async voice loading ── */
  var retryCount = 0;
  function retryResolution() {
    cached = null; resolved = false;
    var v = resolve();
    if (v && !isMale(v)) {
      console.log('[LIRIL-VOICE] Locked:', v.name, 'after', retryCount, 'retries');
      return;
    }
    retryCount++;
    if (retryCount < 20) {
      setTimeout(retryResolution, 250);
    } else if (cached && isMale(cached)) {
      console.warn('[LIRIL-VOICE] Rejecting male after 20 retries:', cached.name);
      cached = null; resolved = false;
    }
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', function() {
      /* Only re-resolve if voice is gone or male — prevents drift */
      if (cached) {
        var voices = window.speechSynthesis.getVoices();
        var still = voices.find(function(v) { return v.name === cached.name; });
        if (still && !isMale(still)) return;
      }
      cached = null; resolved = false;
      resolve();
    });
    resolve();
    retryResolution();
  }

  /* ── PUBLIC API — used by presentation.js, liril-walkthrough.js, home.html ── */
  window.LIRIL_VOICE = {
    get: resolve,
    isMale: isMale,
    isFemale: isFemale,
    isEnGB: isEnGB,
    isEn: isEn,
    VOICE_STORAGE_KEY: VOICE_STORAGE_KEY
  };
})();
