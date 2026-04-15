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
  var isTarget = false; /* true ONLY when cached is a Hazel voice */

  function isTargetVoice(v) {
    if (!v) return false;
    var n = nameOf(v);
    return n.indexOf('hazel') >= 0;
  }

  function resolve() {
    if (resolved && cached) return cached;
    var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;

    /* P0: Restore from sessionStorage — but ONLY if it's Hazel */
    try {
      var saved = sessionStorage.getItem(VOICE_STORAGE_KEY);
      if (saved) {
        var restored = voices.find(function(v) { return v.name === saved; });
        if (restored && isTargetVoice(restored)) {
          cached = restored; resolved = true; isTarget = true;
          console.log('[LIRIL-VOICE] Restored Hazel:', cached.name);
          return cached;
        } else {
          /* Cached voice is not Hazel — clear and re-resolve */
          sessionStorage.removeItem(VOICE_STORAGE_KEY);
          console.log('[LIRIL-VOICE] Cleared non-Hazel cache:', saved);
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

    /* Mark if we found Hazel */
    if (cached && isTargetVoice(cached)) {
      isTarget = true;
    } else if (cached) {
      /* We found a non-Hazel voice — DON'T lock, keep looking */
      console.log('[LIRIL-VOICE] Found non-Hazel, not locking:', nameOf(cached));
      cached = null;
    }

    /* P1-P5: ONLY if Hazel is completely unavailable after full voice list loaded */
    if (!cached && voices.length > 5) {
      for (var f = 0; f < FALLBACK_VOICES.length && !cached; f++) {
        cached = voices.find(function(v) { return nameOf(v) === FALLBACK_VOICES[f]; });
      }
      for (var f2 = 0; f2 < FALLBACK_VOICES.length && !cached; f2++) {
        cached = voices.find(function(v) { return nameOf(v).indexOf(FALLBACK_VOICES[f2]) >= 0; });
      }
    }
    /* P6: Natural/Neural en-GB female (last resort, only if voice list is fully loaded) */
    if (!cached && voices.length > 5) cached = voices.find(function(v) { return isEnGB(v) && isFemale(v) && /(natural|online|neural)/i.test(v.name); });
    /* P7: silence is better than the wrong voice */

    if (cached) {
      isTarget = isTargetVoice(cached);
      try { sessionStorage.setItem(VOICE_STORAGE_KEY, cached.name); } catch(e) {}
      console.log('[LIRIL-VOICE] Selected:', cached.name, '(' + cached.lang + ')', isTarget ? '★ HAZEL' : '⚠ FALLBACK');
    }
    resolved = true;
    return cached;
  }

  /* ── Retry loop for Chrome/Edge async voice loading ── */
  /* Keep retrying until HAZEL is found, not just any female voice */
  var retryCount = 0;
  function retryResolution() {
    cached = null; resolved = false; isTarget = false;
    var v = resolve();
    if (v && isTargetVoice(v)) {
      console.log('[LIRIL-VOICE] ★ HAZEL locked:', v.name, 'after', retryCount, 'retries');
      return;
    }
    retryCount++;
    /* Retry up to 40 times (10 seconds) for Hazel — she loads late on some systems */
    if (retryCount < 40) {
      setTimeout(retryResolution, 250);
    } else {
      /* Hazel not found after 10s — accept best available or silence */
      cached = null; resolved = false; isTarget = false;
      var v2 = resolve();
      if (v2 && isMale(v2)) {
        console.warn('[LIRIL-VOICE] Rejecting male after 40 retries:', v2.name);
        cached = null; resolved = false;
      } else if (v2) {
        console.warn('[LIRIL-VOICE] Hazel unavailable, using fallback:', v2.name);
      } else {
        console.warn('[LIRIL-VOICE] No suitable voice found — silence mode');
      }
    }
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', function() {
      var voices = window.speechSynthesis.getVoices();
      /* Always try to upgrade to Hazel when voices change */
      if (cached && isTarget) {
        /* Already have Hazel — only re-resolve if she disappeared */
        var still = voices.find(function(v) { return v.name === cached.name; });
        if (still) return;
      }
      /* Either no voice, non-Hazel voice, or Hazel disappeared — re-resolve */
      /* Check if Hazel is now available */
      var hazelNow = voices.find(function(v) { return nameOf(v).indexOf('hazel') >= 0; });
      if (hazelNow || !cached) {
        console.log('[LIRIL-VOICE] voiceschanged: re-resolving', hazelNow ? '(Hazel detected!)' : '(no voice yet)');
        cached = null; resolved = false; isTarget = false;
        resolve();
      }
    });
    resolve();
    retryResolution();
  }

  /* ── PUBLIC API — used by presentation.js, liril-walkthrough.js, home.html ── */
  window.LIRIL_VOICE = {
    get: resolve,
    isMale: isMale,
    isFemale: isFemale,
    isTargetVoice: isTargetVoice,
    isEnGB: isEnGB,
    isEn: isEn,
    isHazel: function() { return isTarget; },
    VOICE_STORAGE_KEY: VOICE_STORAGE_KEY
  };
})();
