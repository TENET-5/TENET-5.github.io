/* ═══════════════════════════════════════════════════════
   LIRIL Voice Resolver — SINGLE SOURCE OF TRUTH
   All voice engines MUST delegate to window.LIRIL_VOICE.
   DO NOT duplicate voice logic elsewhere.

   HARD RULE: LIRIL speaks with a CANADIAN FEMALE voice. 
   If no acceptable voice exists on the visitor's system, 
   LIRIL stays SILENT.
   NEVER let an utterance fall through to the browser/OS
   default voice — that is how the "robot male" bug happened.
   Use LIRIL_VOICE.speak() (guarded) instead of calling
   speechSynthesis.speak() directly.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.LIRIL_VOICE) return;

  var VOICE_STORAGE_KEY = 'liril-voice-name';

  /* ── VOICE PERSONALITY — newsroom desk: calm, precise, Canadian ──────
     Matches data/liril_reporter_persona.json voice_posture (not hype, not angry). */
  var VOICE_PARAMS = {
    rate: 1.02,    /* Slightly deliberate news-reader cadence */
    pitch: 0.95,   /* Natural female range; not cartoon-high, not growled */
    volume: 1.0
  };

  /* ── TARGET VOICES — Canadian neural female, highest quality first ──
     Edge ships the Microsoft Clara Online (Natural) en-CA voice; */
  var TARGET_VOICES = [
    'microsoft clara online (natural)',
    'microsoft clara online',
    'google uk english female', /* fallback if no Canadian */
    'microsoft sonia online (natural)',
    'microsoft libby online (natural)'
  ];
  /* Secondary fallbacks */
  var FALLBACK_VOICES = [
    'microsoft jenny online (natural)',
    'microsoft aria online (natural)'
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
    'hazel','clara','libby','sonia','maisie','martha','kate','karen',
    'moira','fiona','serena','samantha','victoria','jenny','zira','eva',
    'aria','sara','emily','emma','amy','natasha','linda','catherine',
    'google uk english female',
    'microsoft hazel','microsoft clara','microsoft libby','microsoft sonia',
    'microsoft jenny','microsoft aria','microsoft sara','microsoft emily',
    'microsoft catherine','microsoft linda','microsoft natasha'
  ];

  function nameOf(v) { return (v.name || '').toLowerCase(); }
  /* Word-boundary match: a blocklisted token like "ian" must NOT match
     inside "Gillian"/"Vivian" (which would wrongly reject a female voice). */
  function nameMatches(v, list) {
    var n = nameOf(v);
    return list.some(function(name) {
      var esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp('\\b' + esc + '\\b').test(n);
    });
  }
  function isEnGB(v) {
    var l = (v.lang || '').toLowerCase().replace('_', '-');
    return l === 'en-gb' || l.indexOf('en-gb') === 0;
  }
  function isEnCA(v) {
    var l = (v.lang || '').toLowerCase().replace('_', '-');
    return l === 'en-ca' || l.indexOf('en-ca') === 0;
  }
  function isEn(v) {
    var l = (v.lang || '').toLowerCase().replace('_', '-');
    return l.indexOf('en') === 0;
  }
  function isFemale(v) { return nameMatches(v, FEMALE_NAMES); }
  function isMale(v) { return nameMatches(v, MALE_NAMES); }
  function isNeural(v) { return /(natural|online|neural)/i.test(v.name); }
  function isDesktop(v) { return /desktop/i.test(v.name); }
  function scoreVoice(v) {
    if (!v || isMale(v) || isDesktop(v)) return -999;
    var n = nameOf(v);
    var score = 0;
    if (isFemale(v)) score += 30;
    
    if (isEnCA(v)) score += 60;                 /* Canadian first */
    else if (isEnGB(v)) score += 30;
    else if (isEn(v)) score += 20;
    
    if (isNeural(v)) score += 90;
    else score -= 140;
    
    if (v.localService === false) score += 20;
    
    if (n.indexOf('clara') >= 0 && isNeural(v)) score += 220; /* Canadian neural target */
    if (/(sonia|libby|maisie)/i.test(n)) score += 100;
    if (n.indexOf('google uk english female') >= 0) score += 90;
    if (n.indexOf('hazel') >= 0 && isNeural(v)) score += 80;
    if (/(jenny|aria)/i.test(n)) score += 80;
    return score;
  }

  var cached = null;
  var resolved = false;
  var isTarget = false;

  /* Target = a Canadian female voice we consider "the LIRIL voice" */
  function isTargetVoice(v) {
    if (!v || isMale(v)) return false;
    var n = nameOf(v);
    if (n.indexOf('clara') >= 0) return true;
    return isEnCA(v) && isFemale(v) && isNeural(v);
  }

  /* A voice we will ALLOW to speak at all (target or acceptable fallback).
     Anything else — including "no voice" — means silence. */
  function isAcceptable(v) {
    return !!v && !isMale(v) && !isDesktop(v) && isEn(v) && scoreVoice(v) > 0;
  }

  function resolve() {
    if (resolved && cached) return cached;
    var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;

    /* P0: Restore from sessionStorage — but ONLY if it's still a target voice */
    try {
      var saved = sessionStorage.getItem(VOICE_STORAGE_KEY);
      if (saved) {
        var restored = voices.find(function(v) { return v.name === saved; });
        if (restored && isTargetVoice(restored)) {
          cached = restored; resolved = true; isTarget = true;
          console.log('[LIRIL-VOICE] Restored Canadian target:', cached.name);
          return cached;
        } else {
          sessionStorage.removeItem(VOICE_STORAGE_KEY);
          console.log('[LIRIL-VOICE] Cleared non-target cache:', saved);
        }
      }
    } catch(e) {}

    /* P0: exact match on target voice names (best quality first) */
    for (var t = 0; t < TARGET_VOICES.length && !cached; t++) {
      var target = TARGET_VOICES[t];
      cached = voices.find(function(v) { return nameOf(v) === target; });
    }
    /* P0.3: partial match on target names */
    if (!cached) {
      for (var t2 = 0; t2 < TARGET_VOICES.length && !cached; t2++) {
        var partial = TARGET_VOICES[t2];
        cached = voices.find(function(v) { return nameOf(v).indexOf(partial) >= 0 && !isMale(v); });
      }
    }
    /* P0.5: any Canadian neural female */
    if (!cached) {
      cached = voices.find(function(v) { return isTargetVoice(v); });
    }

    if (cached && isTargetVoice(cached)) {
      isTarget = true;
    } else if (cached) {
      console.log('[LIRIL-VOICE] Found non-target, not locking:', nameOf(cached));
      cached = null;
    }

    /* P1+: no Canadian target available — best acceptable English female,
       else silence. NEVER a male, NEVER a Desktop SAPI voice. */
    if (!cached && voices.length > 0) {
      var rankedFemale = voices
        .filter(function(v) { return isFemale(v) && !isMale(v) && isEn(v) && !isDesktop(v); })
        .sort(function(a, b) { return scoreVoice(b) - scoreVoice(a); });
      if (rankedFemale.length && scoreVoice(rankedFemale[0]) > 0) cached = rankedFemale[0];
    }
    if (!cached && voices.length > 0) {
      var rankedEnglish = voices
        .filter(function(v) { return !isMale(v) && isEn(v) && !isDesktop(v); })
        .sort(function(a, b) { return scoreVoice(b) - scoreVoice(a); });
      if (rankedEnglish.length && scoreVoice(rankedEnglish[0]) > 0) cached = rankedEnglish[0];
    }

    /* NEVER use Desktop SAPI5 voices — quality is unacceptable */
    if (cached && isDesktop(cached)) {
      console.warn('[LIRIL-VOICE] Rejecting Desktop voice (low quality):', cached.name);
      cached = null;
    }

    if (cached) {
      isTarget = isTargetVoice(cached);
      try { sessionStorage.setItem(VOICE_STORAGE_KEY, cached.name); } catch(e) {}
      console.log('[LIRIL-VOICE] Selected:', cached.name, '(' + cached.lang + ')', isTarget ? '★ CANADIAN TARGET' : '⚠ FALLBACK');
    }
    resolved = true;
    return cached;
  }

  /* ── GUARDED SPEAK — the ONLY sanctioned way to speak ──
     Returns true if the utterance was dispatched with an acceptable
     voice; false means no acceptable voice exists → stay silent. */
  function speak(text, opts) {
    if (!text || !window.speechSynthesis) return false;
    if (window.__LIRIL_MUTED) return false;   // dock voice toggle — single point, site-wide
    var v = resolve();
    if (!isAcceptable(v)) {
      console.warn('[LIRIL-VOICE] speak() suppressed — no acceptable voice (never default).');
      return false;
    }
    var u = new SpeechSynthesisUtterance(text);
    u.voice = v;
    /* Prefer the voice's own locale; default Canadian English for LIRIL desk */
    u.lang = v.lang || 'en-CA';
    u.rate = (opts && opts.rate) || VOICE_PARAMS.rate;
    u.pitch = (opts && opts.pitch) || VOICE_PARAMS.pitch;
    u.volume = (opts && opts.volume != null) ? opts.volume : VOICE_PARAMS.volume;
    if (opts) {
      if (opts.onend) u.onend = opts.onend;
      if (opts.onerror) u.onerror = opts.onerror;
      if (opts.onboundary) u.onboundary = opts.onboundary;
    }
    /* Cancel only stale queue if not mid-guide multi-utterance chain with keepQueue */
    if (!(opts && opts.keepQueue) && window.speechSynthesis.speaking) {
      try { window.speechSynthesis.cancel(); } catch (e0) { /* */ }
    }
    window.speechSynthesis.speak(u);
    return true;
  }

  /* Guard an existing utterance: attach the resolved voice or refuse.
     Returns true only when it is safe to call speechSynthesis.speak(u). */
  function guardUtterance(u) {
    var v = resolve();
    if (!isAcceptable(v)) return false;
    u.voice = v;
    u.lang = v.lang || 'en-GB';
    return true;
  }

  /* ── Retry loop for Chrome/Edge async voice loading ── */
  var retryCount = 0;
  function retryResolution() {
    cached = null; resolved = false; isTarget = false;
    var v = resolve();
    if (v && isTargetVoice(v)) {
      console.log('[LIRIL-VOICE] ★ Canadian target locked:', v.name, 'after', retryCount, 'retries');
      return;
    }
    retryCount++;
    /* Retry up to 40 times (10 seconds) — neural voices load late on some systems */
    if (retryCount < 40) {
      setTimeout(retryResolution, 250);
    } else {
      cached = null; resolved = false; isTarget = false;
      var v2 = resolve();
      if (v2 && isMale(v2)) {
        console.warn('[LIRIL-VOICE] Rejecting male after 40 retries:', v2.name);
        cached = null; resolved = false;
      } else if (v2) {
        console.warn('[LIRIL-VOICE] Canadian target unavailable, using fallback:', v2.name);
      } else {
        console.warn('[LIRIL-VOICE] No suitable voice found — silence mode');
      }
    }
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', function() {
      var voices = window.speechSynthesis.getVoices();
      if (cached && isTarget) {
        var still = voices.find(function(v) { return v.name === cached.name; });
        if (still) return;
      }
      var targetNow = voices.some(function(v) { return isTargetVoice(v); });
      if (targetNow || !cached) {
        console.log('[LIRIL-VOICE] voiceschanged: re-resolving', targetNow ? '(Canadian target detected)' : '(no voice yet)');
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
    speak: speak,
    guardUtterance: guardUtterance,
    isAcceptable: isAcceptable,
    params: VOICE_PARAMS,
    isMale: isMale,
    isFemale: isFemale,
    isNeural: isNeural,
    isDesktop: isDesktop,
    isTargetVoice: isTargetVoice,
    isEnGB: isEnGB,
    isEnCA: isEnCA,
    isEn: isEn,
    isClara: function() { return isTarget; },
    isHazel: function() { return false; },
    VOICE_STORAGE_KEY: VOICE_STORAGE_KEY
  };
})();
