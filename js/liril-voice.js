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

  /* ── VOICE PERSONALITY — newsroom desk: calm, human, Canadian ──────
     Slightly under 1.0 rate reads more natural on neural voices (Clara/Sonia).
     Matches data/liril_reporter_persona.json voice_posture. */
  var VOICE_PARAMS = {
    rate: 0.94,    /* Natural news-reader — not rushed robot */
    pitch: 1.0,    /* Neutral pitch; let the neural voice do the work */
    volume: 1.0
  };

  /* Words browsers spell letter-by-letter unless expanded for speech. */
  var SPEECH_WORDS = {
    /* Brand / product */
    'TENET5': 'Tenet Five',
    'TENET 5': 'Tenet Five',
    'LIRIL': 'Liril',
    'LIRIL AI': 'Liril A.I.',
    /* Canadian institutions & statutes (common on this site) */
    'MAID': 'maid',
    'MAiD': 'maid',
    'ATIP': 'A-tip',
    'VAC': 'Vee A C',
    'RCMP': 'R C M P',
    'CSIS': 'see-sis',
    'CAF': 'C A F',
    'CFNIS': 'C F Niss',
    'PSDPA': 'P S D P A',
    'TSX': 'T S X',
    'TSXV': 'T S X Venture',
    'NATO': 'NATO',
    'PMO': 'P M O',
    'MP': 'M P',
    'MPs': 'M P\'s',
    'AG': 'Auditor General',
    'DIA': 'D I A',
    'CBSA': 'C B S A',
    'CRA': 'C R A',
    'CBC': 'C B C',
    'WEF': 'W E F',
    'ICC': 'I C C',
    'UN': 'U N',
    'G7': 'G seven',
    'GIC': 'G I C',
    'PHAC': 'P hack',
    'NSICOP': 'N-sick-op',
    'SEDAR': 'See-dar',
    'CFL': 'C F L',
    'NHL': 'N H L',
    'NBA': 'N B A',
    'MLB': 'M L B',
    'MLS': 'M L S',
    'RSS': 'R S S',
    'API': 'A P I',
    'URL': 'U R L',
    'PDF': 'P D F',
    'HTML': 'H T M L',
    'CSS': 'C S S',
    'JSON': 'Jason',
    'AI': 'A.I.'
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

  /* ── NATURALIZE FOR SPEECH ──
     Browser TTS spells ALL-CAPS acronyms letter-by-letter and stumbles on
     money, bills, and scaffold chrome. Expand to spoken English first. */
  function naturalize(text) {
    if (!text) return '';
    var s = String(text);

    /* Kill HTML / markdown / scaffold that should never be spoken */
    s = s.replace(/<[^>]+>/g, ' ');
    s = s.replace(/&nbsp;/gi, ' ');
    s = s.replace(/&amp;/gi, ' and ');
    s = s.replace(/&[a-z]+;/gi, ' ');
    s = s.replace(/&#x27;|&#39;|&apos;/gi, "'");
    s = s.replace(/[·•▪▸►▶■□●○]/g, ' ');
    s = s.replace(/[═─–—―_|\\/]+/g, ' ');
    s = s.replace(/\s*→\s*/g, ' to ');
    s = s.replace(/\s*←\s*/g, ' from ');
    s = s.replace(/\s*…\s*/g, '. ');
    s = s.replace(/\.{3,}/g, '. ');
    s = s.replace(/#{1,6}\s*/g, '');
    s = s.replace(/\*{1,3}/g, '');
    s = s.replace(/`+/g, '');
    s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); /* markdown links */
    s = s.replace(/https?:\/\/\S+/gi, ' ');
    s = s.replace(/\bwww\.\S+/gi, ' ');
    s = s.replace(/\S+@\S+\.\S+/g, ' ');

    /* Bill / Act / section numbers before generic digit rules */
    s = s.replace(/\bBill\s*C[-\s]?(\d+)\b/gi, function(_, n) {
      return 'Bill C ' + n.split('').join(' ');
    });
    s = s.replace(/\bACT\s*([IVX]+)\b/gi, function(_, rom) {
      var map = { I: 'one', II: 'two', III: 'three', IV: 'four', V: 'five', VI: 'six' };
      return 'Act ' + (map[rom.toUpperCase()] || rom);
    });
    s = s.replace(/\bAct\s*([1-5])\b/gi, 'Act $1');
    s = s.replace(/\bArticle\s*6\(([a-c])\)/gi, 'Article 6 $1');
    s = s.replace(/\bs\.?\s*504\b/gi, 'section five oh four');
    s = s.replace(/\bTrack\s*2\b/gi, 'Track two');
    s = s.replace(/\bTrack\s*1\b/gi, 'Track one');

    /* Money: $54M, $1.2B, $797.6 million patterns */
    s = s.replace(/\$(\d+(?:\.\d+)?)\s*[Bb](?:illion)?\b/g, '$1 billion dollars');
    s = s.replace(/\$(\d+(?:\.\d+)?)\s*[Mm](?:illion)?\b/g, '$1 million dollars');
    s = s.replace(/\$(\d+(?:\.\d+)?)\s*[Kk]\b/g, '$1 thousand dollars');
    s = s.replace(/\$(\d{1,3}(?:,\d{3})+(?:\.\d+)?)/g, function(_, n) {
      return n.replace(/,/g, '') + ' dollars';
    });
    s = s.replace(/\$(\d+(?:\.\d+)?)/g, '$1 dollars');
    s = s.replace(/\bCAD\s*/gi, 'Canadian ');
    s = s.replace(/\b(\d+(?:\.\d+)?)\s*%/g, '$1 percent');

    /* Years stay natural; big counts lose commas so synth doesn't pause oddly */
    s = s.replace(/\b(\d{1,3}),(\d{3}),(\d{3})\b/g, '$1$2$3');
    s = s.replace(/\b(\d{1,3}),(\d{3})\b/g, '$1$2');

    /* Known lexicon (longest keys first so "LIRIL AI" wins over "LIRIL") */
    var keys = Object.keys(SPEECH_WORDS).sort(function(a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      s = s.replace(new RegExp('\\b' + esc + '\\b', 'g'), SPEECH_WORDS[k]);
    }

    /* Remaining 2–5 letter ALL-CAPS tokens → spaced letters (not shouted words) */
    s = s.replace(/\b([A-Z]{2,5})\b/g, function(m) {
      if (SPEECH_WORDS[m]) return SPEECH_WORDS[m];
      /* Keep short English words that happen to be caps in titles */
      if (/^(THE|AND|FOR|OF|TO|IN|ON|OR|A|AN|IS|IT|AS|AT|BY|BE|WE|US|NO|YES|NOT|BUT|IF|SO)$/.test(m)) {
        return m.toLowerCase();
      }
      return m.split('').join(' ');
    });

    /* Soften title case shouting: "THIS HOUR" already handled; collapse whitespace */
    s = s.replace(/\s+/g, ' ').trim();
    /* Prefer period pauses over run-ons for natural breath */
    s = s.replace(/\s*;\s*/g, '. ');
    s = s.replace(/\s*—\s*|\s*–\s*/g, ', ');
    return s;
  }

  /* Split into speakable breaths (sentences) so neural voices don't flatline. */
  function splitBreaths(text) {
    var t = naturalize(text);
    if (!t) return [];
    /* No lookbehind — older WebViews choke; split on punctuation then re-attach. */
    var raw = t.split(/([.!?]+)\s+/);
    var parts = [];
    for (var r = 0; r < raw.length; r++) {
      if (!raw[r] || !raw[r].replace(/[^a-zA-Z0-9]/g, '').length) continue;
      if (/^[.!?]+$/.test(raw[r])) {
        if (parts.length) parts[parts.length - 1] += raw[r];
        continue;
      }
      parts.push(raw[r]);
    }
    if (!parts.length) return [t];
    /* Merge tiny fragments so we don't over-chop */
    var out = [];
    var buf = '';
    for (var i = 0; i < parts.length; i++) {
      buf = buf ? buf + ' ' + parts[i] : parts[i];
      if (buf.length >= 48 || i === parts.length - 1) {
        out.push(buf);
        buf = '';
      }
    }
    return out.length ? out : [t];
  }

  /* ── PREBAKED NEURAL AUDIO (desk package) ──
     Product path: edge-tts Clara MP3s under audio/desk/*. Live browser TTS
     is backup only when no prebake exists. */
  var activeAudio = null;

  function stopAudio() {
    if (activeAudio) {
      try { activeAudio.pause(); activeAudio.removeAttribute('src'); activeAudio.load(); } catch (e) {}
      activeAudio = null;
    }
  }

  function playAudioSrc(src, opts) {
    if (!src || window.__LIRIL_MUTED) return false;
    stopAudio();
    if (!(opts && opts.keepQueue) && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e0) { /* */ }
    }
    var a = new Audio(src);
    a.preload = 'auto';
    a.volume = (opts && opts.volume != null) ? opts.volume : 1.0;
    activeAudio = a;
    a.onended = function () {
      if (activeAudio === a) activeAudio = null;
      if (opts && opts.onend) opts.onend();
    };
    a.onerror = function (ev) {
      if (activeAudio === a) activeAudio = null;
      if (opts && opts.onerror) opts.onerror(ev || { error: 'audio' });
    };
    var p = a.play();
    if (p && p.catch) {
      p.catch(function (err) {
        if (activeAudio === a) activeAudio = null;
        if (opts && opts.onerror) opts.onerror(err || { error: 'play' });
      });
    }
    return true;
  }

  /* ── GUARDED SPEAK — the ONLY sanctioned way to speak ──
     Prefer prebaked neural audio (opts.audio). Browser TTS only as backup
     with an acceptable Canadian/neural female voice — never male SAPI. */
  function speak(text, opts) {
    opts = opts || {};
    if (window.__LIRIL_MUTED) return false;

    /* P0 product path: prebaked neural MP3 (desk package / presentation) */
    if (opts.audio) {
      return playAudioSrc(opts.audio, opts);
    }

    if (!text || !window.speechSynthesis) return false;
    var v = resolve();
    if (!isAcceptable(v)) {
      console.warn('[LIRIL-VOICE] speak() suppressed — no acceptable voice (never default).');
      return false;
    }

    var breaths = opts.raw ? [String(text)] : splitBreaths(text);
    if (!breaths.length) return false;

    stopAudio();
    /* Cancel only stale queue if not mid-guide multi-utterance chain with keepQueue */
    if (!opts.keepQueue && window.speechSynthesis.speaking) {
      try { window.speechSynthesis.cancel(); } catch (e0) { /* */ }
    }

    // Fix Chrome stuck-in-paused-state bug
    if (window.speechSynthesis.paused) {
      try { window.speechSynthesis.resume(); } catch (e1) { /* */ }
    }

    window.__liril_utterances = window.__liril_utterances || [];
    var rate = (opts.rate != null) ? opts.rate : VOICE_PARAMS.rate;
    var pitch = (opts.pitch != null) ? opts.pitch : VOICE_PARAMS.pitch;
    var volume = (opts.volume != null) ? opts.volume : VOICE_PARAMS.volume;
    var last = breaths.length - 1;

    for (var i = 0; i < breaths.length; i++) {
      var u = new SpeechSynthesisUtterance(breaths[i]);
      u.voice = v;
      u.lang = v.lang || 'en-CA';
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      if (i === last) {
        if (opts.onend) u.onend = opts.onend;
        if (opts.onerror) u.onerror = opts.onerror;
        if (opts.onboundary) u.onboundary = opts.onboundary;
      }
      window.__liril_utterances.push(u);
      if (window.__liril_utterances.length > 40) window.__liril_utterances.shift();
      window.speechSynthesis.speak(u);
    }
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
    playAudio: playAudioSrc,
    stop: function () {
      stopAudio();
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    },
    naturalize: naturalize,
    splitBreaths: splitBreaths,
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
