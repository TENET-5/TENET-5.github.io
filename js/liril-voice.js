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

  /* ── VOICE PERSONALITY — angry Canadian woman ────────── */
  /* She's exposing corruption. Not calm. Not neutral. FURIOUS. */
  var VOICE_PARAMS = {
    rate: 1.08,    /* Slightly fast — urgent, angry pace */
    pitch: 0.92,   /* Lower — authoritative, furious edge */
    volume: 1.0    /* Full volume */
  };

  /* ── TARGET VOICE — Clara (Canadian, Natural, highest quality) ── */
  /* CEO directive: Clara. Angry Canadian. Highest quality.
     Pre-rendered MP3 audio is ALWAYS preferred (studio quality).
     SpeechSynthesis Clara is fallback for pages without MP3. */
  var TARGET_VOICES = [
    'microsoft clara online (natural)',
    'microsoft clara online',
    'microsoft clara',
    'clara'
  ];
  /* Secondary fallbacks ONLY if Clara is completely unavailable on the system */
  /* All Canadian/high-quality neural female voices */
  var FALLBACK_VOICES = [
    'microsoft jenny online (natural)',
    'microsoft jenny online',
    'microsoft jenny',
    'microsoft sonia online (natural)',
    'microsoft sonia online',
    'microsoft sonia',
    'microsoft aria online (natural)',
    'microsoft aria online',
    'microsoft aria',
    'microsoft susan',
    'microsoft zira',
    'microsoft hazel online (natural)',
    'microsoft hazel online',
    'microsoft hazel',
    'google uk english female',
    'google us english female'
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
    'hazel','clara','susan','libby','sonia','maisie','martha','kate','karen',
    'moira','fiona','serena','samantha','victoria','zira','jenny',
    'aria','sara','emily','emma','amy','natasha','linda','catherine',
    'microsoft hazel','microsoft clara','microsoft libby','microsoft sonia','microsoft susan',
    'microsoft jenny','microsoft aria','microsoft sara','microsoft emily',
    'microsoft zira','microsoft catherine','microsoft linda','microsoft natasha',
    'google uk english female','google us english female'
  ];

  function nameOf(v) { return (v.name || '').toLowerCase(); }
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
  function isFemale(v) { return FEMALE_NAMES.some(function(f) { return nameOf(v).indexOf(f) >= 0; }); }
  function isMale(v) { return MALE_NAMES.some(function(m) { return nameOf(v).indexOf(m) >= 0; }); }
  function isNeural(v) { return /(natural|online|neural)/i.test(v.name); }
  function isDesktop(v) { return /desktop/i.test(v.name); }
  function scoreVoice(v) {
    if (!v || isMale(v)) return -999;
    var n = nameOf(v);
    var score = 0;
    if (isFemale(v)) score += 30;
    if (isEnCA(v)) score += 60;
    else if (isEnGB(v)) score += 35;
    else if (isEn(v)) score += 20;
    if (isNeural(v)) score += 45;
    if (v.localService === false) score += 20;
    if (n.indexOf('clara') >= 0) score += 200;
    if (/(jenny|sonia|aria|libby)/i.test(n)) score += 120;
    if (/(susan|zira)/i.test(n)) score += 90;
    if (n.indexOf('hazel') >= 0) score += 50;
    return score;
  }

  var cached = null;
  var resolved = false;
  var isTarget = false;

  function isTargetVoice(v) {
    if (!v) return false;
    var n = nameOf(v);
    return n.indexOf('clara') >= 0;
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
          console.log('[LIRIL-VOICE] Restored Clara:', cached.name);
          return cached;
        } else {
          /* Cached voice is not Clara — clear and re-resolve */
          sessionStorage.removeItem(VOICE_STORAGE_KEY);
          console.log('[LIRIL-VOICE] Cleared non-Clara cache:', saved);
        }
      }
    } catch(e) {}

    /* P0: CLARA ONLY — exact match on target voice names */
    for (var t = 0; t < TARGET_VOICES.length && !cached; t++) {
      var target = TARGET_VOICES[t];
      cached = voices.find(function(v) { return nameOf(v) === target; });
    }
    /* P0.3: Partial match on Clara target names */
    if (!cached) {
      for (var t2 = 0; t2 < TARGET_VOICES.length && !cached; t2++) {
        var partial = TARGET_VOICES[t2];
        cached = voices.find(function(v) { return nameOf(v).indexOf(partial) >= 0; });
      }
    }
    /* P0.5: Any voice with 'clara' in name (catch all Clara variants) */
    if (!cached) cached = voices.find(function(v) { return nameOf(v).indexOf('clara') >= 0 && !isMale(v); });

    /* Mark if we found Clara */
    if (cached && isTargetVoice(cached)) {
      isTarget = true;
    } else if (cached) {
      /* We found a non-Clara voice — DON'T lock, keep looking */
      console.log('[LIRIL-VOICE] Found non-Clara, not locking:', nameOf(cached));
      cached = null;
    }

    /* P1-P5: ONLY if Clara is completely unavailable after full voice list loaded */
    if (!cached && voices.length > 0) {
      for (var f = 0; f < FALLBACK_VOICES.length && !cached; f++) {
        cached = voices.find(function(v) { return nameOf(v) === FALLBACK_VOICES[f]; });
      }
      for (var f2 = 0; f2 < FALLBACK_VOICES.length && !cached; f2++) {
        cached = voices.find(function(v) { return nameOf(v).indexOf(FALLBACK_VOICES[f2]) >= 0; });
      }
    }
    /* P6: Highest-quality available female English voice by score */
    if (!cached && voices.length > 0) {
      var ranked = voices
        .filter(function(v) { return isFemale(v) && !isMale(v) && isEn(v); })
        .sort(function(a, b) { return scoreVoice(b) - scoreVoice(a); });
      if (ranked.length && scoreVoice(ranked[0]) > 0) cached = ranked[0];
    }
    /* P7: silence is better than the wrong voice */

    /* NEVER use Desktop SAPI5 voices — quality is unacceptable */
    if (cached && isDesktop(cached)) {
      console.warn('[LIRIL-VOICE] Rejecting Desktop voice (low quality):', cached.name);
      cached = null;
    }

    if (cached) {
      isTarget = isTargetVoice(cached);
      try { sessionStorage.setItem(VOICE_STORAGE_KEY, cached.name); } catch(e) {}
      console.log('[LIRIL-VOICE] Selected:', cached.name, '(' + cached.lang + ')', isTarget ? '★ CLARA' : '⚠ FALLBACK');
    }
    resolved = true;
    return cached;
  }

  /* ── Retry loop for Chrome/Edge async voice loading ── */
  /* Keep retrying until CLARA is found, not just any female voice */
  var retryCount = 0;
  function retryResolution() {
    cached = null; resolved = false; isTarget = false;
    var v = resolve();
    if (v && isTargetVoice(v)) {
      console.log('[LIRIL-VOICE] ★ CLARA locked:', v.name, 'after', retryCount, 'retries');
      return;
    }
    retryCount++;
    /* Retry up to 40 times (10 seconds) for Clara — she loads late on some systems */
    if (retryCount < 40) {
      setTimeout(retryResolution, 250);
    } else {
      /* Clara not found after 10s — accept best available or silence */
      cached = null; resolved = false; isTarget = false;
      var v2 = resolve();
      if (v2 && isMale(v2)) {
        console.warn('[LIRIL-VOICE] Rejecting male after 40 retries:', v2.name);
        cached = null; resolved = false;
      } else if (v2) {
        console.warn('[LIRIL-VOICE] Clara unavailable, using fallback:', v2.name);
      } else {
        console.warn('[LIRIL-VOICE] No suitable voice found — silence mode');
      }
    }
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', function() {
      var voices = window.speechSynthesis.getVoices();
      /* Always try to upgrade to Clara when voices change */
      if (cached && isTarget) {
        /* Already have Clara — only re-resolve if she disappeared */
        var still = voices.find(function(v) { return v.name === cached.name; });
        if (still) return;
      }
      /* Either no voice, non-Clara voice, or Clara disappeared — re-resolve */
      /* Check if Clara is now available */
      var claraNow = voices.find(function(v) { return nameOf(v).indexOf('clara') >= 0; });
      if (claraNow || !cached) {
        console.log('[LIRIL-VOICE] voiceschanged: re-resolving', claraNow ? '(Clara detected!)' : '(no voice yet)');
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
