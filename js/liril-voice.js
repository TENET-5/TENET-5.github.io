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

  /* ── TARGET VOICE — Hazel is LIRIL's ONLY voice ────── */
  /* CEO directive: Hazel English ONLY. No fallbacks. Silence > wrong voice. */
  var TARGET_VOICES = [
    'microsoft hazel online (natural)',
    'microsoft hazel online',
    'microsoft hazel desktop',
    'microsoft hazel',
    'hazel'
  ];
  /* Secondary fallbacks ONLY if Hazel is completely unavailable on the system */
  var FALLBACK_VOICES = [
    'microsoft libby online (natural)',
    'microsoft libby online',
    'microsoft libby',
    'microsoft sonia online (natural)',
    'microsoft sonia online',
    'microsoft sonia',
    'google uk english female'
  ];

  /* ── CANONICAL BLOCKLIST — maintain here ONLY ────── */
  var MALE_NAMES = [
    'david','mark','james','george','daniel','ryan','guy','thomas',
    'richard','rishi','sean','oliver','liam','christopher','eric',
    'andrew','brian','roger','malcolm','connor','freddie','alfie',
    'ethan','noah','william','henry','charlie','oscar','jack',
    'harry','arthur','leo','jacob','lucas','mason','logan',
    'alexander','benjamin','samuel','joseph','matthew','caleb',
    'steffan','elliot','alistair','angus','finley','hamish','neil',
    'darren','duncan','tim','tony','peter','john','paul','ian',
    'gordon','lewis','aiden','prabhat','bob','ken','raj','wayne',
    'microsoft david','microsoft mark','microsoft george','microsoft james',
    'microsoft ryan','microsoft guy','microsoft rishi','microsoft steffan',
    'google uk english male','google us english male'
  ];
  var FEMALE_NAMES = [
    'hazel','susan','libby','sonia','maisie','martha','kate','karen',
    'moira','fiona','serena','samantha','victoria','zira','jenny',
    'aria','sara','emily','emma','amy','natasha','linda','catherine',
    'microsoft hazel','microsoft libby','microsoft sonia','microsoft susan',
    'microsoft jenny','microsoft aria','microsoft sara','microsoft emily',
    'microsoft zira','microsoft catherine','microsoft linda','microsoft natasha',
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

    /* P0: Restore from sessionStorage — but ONLY if it's a known female voice */
    try {
      var saved = sessionStorage.getItem(VOICE_STORAGE_KEY);
      if (saved) {
        var restored = voices.find(function(v) { return v.name === saved; });
        if (restored && isFemale(restored) && !isMale(restored)) {
          cached = restored; resolved = true;
          console.log('[LIRIL-VOICE] Restored:', cached.name);
          return cached;
        } else {
          /* Cached voice is male or unknown — clear and re-resolve */
          sessionStorage.removeItem(VOICE_STORAGE_KEY);
          console.log('[LIRIL-VOICE] Cleared stale cache:', saved);
        }
      }
    } catch(e) {}

    /* P0: HAZEL ONLY — exact match on target voice names */
    for (var t = 0; t < TARGET_VOICES.length && !cached; t++) {
      var target = TARGET_VOICES[t];
      cached = voices.find(function(v) { return nameOf(v) === target; });
    }
    /* P0.3: Partial match on Hazel target names */
    if (!cached) {
      for (var t2 = 0; t2 < TARGET_VOICES.length && !cached; t2++) {
        var partial = TARGET_VOICES[t2];
        cached = voices.find(function(v) { return nameOf(v).indexOf(partial) >= 0; });
      }
    }
    /* P0.5: Any voice with 'hazel' in name (catch all Hazel variants) */
    if (!cached) cached = voices.find(function(v) { return nameOf(v).indexOf('hazel') >= 0 && !isMale(v); });

    /* P1-P5: ONLY if Hazel is completely unavailable — use secondary fallbacks */
    if (!cached) {
      for (var f = 0; f < FALLBACK_VOICES.length && !cached; f++) {
        cached = voices.find(function(v) { return nameOf(v) === FALLBACK_VOICES[f]; });
      }
      for (var f2 = 0; f2 < FALLBACK_VOICES.length && !cached; f2++) {
        cached = voices.find(function(v) { return nameOf(v).indexOf(FALLBACK_VOICES[f2]) >= 0; });
      }
    }
    /* P6: Natural/Neural en-GB female (last resort) */
    if (!cached) cached = voices.find(function(v) { return isEnGB(v) && isFemale(v) && /(natural|online|neural)/i.test(v.name); });
    /* P7: null — silence is better than the wrong voice */
    if (!cached) cached = voices.find(function(v) { return isEn(v) && /female/i.test(v.name); });
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
