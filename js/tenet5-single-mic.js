/* TENET5 SINGLE MIC v1 — Daniel 2026-07-12 HARD
 *
 * One audio path on the public site: the user-started <video> element.
 * No browser TTS. No parallel LIRIL voice engines. No guide/station/MP3 dual-play.
 * Anything that tries to speak() or open a second Audio is cancelled.
 */
(function () {
  'use strict';
  if (window.__TENET5_SINGLE_MIC_V1) return;
  window.__TENET5_SINGLE_MIC_V1 = true;
  window.__LIRIL_GUIDE_RETIRED = true;
  window.__LIRIL_MUTED = true;

  function cancelSpeech() {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        // Hard-ban further speaks this session
        if (!window.speechSynthesis.__tenet5_patched) {
          window.speechSynthesis.__tenet5_patched = true;
          var orig = window.speechSynthesis.speak.bind(window.speechSynthesis);
          window.speechSynthesis.speak = function () {
            try { window.speechSynthesis.cancel(); } catch (e) { /* */ }
            return;
          };
          window.speechSynthesis.__orig_speak = orig;
        }
      }
    } catch (e) { /* */ }
  }

  var deadVoice = {
    speak: function () { cancelSpeech(); return false; },
    stop: function () { cancelSpeech(); },
    stopAll: function () { cancelSpeech(); killOrphanAudio(null); },
    stopGuide: function () {},
    get: function () { return null; },
    isTargetVoice: function () { return false; },
    params: { rate: 1, pitch: 1, volume: 0 },
    muted: true,
    ready: false
  };

  window.LIRIL_VOICE = deadVoice;
  window.LIRIL_PAGE_VOICE = {
    ready: false,
    speak: function () { return false; },
    stop: function () {},
    stopGuide: function () {}
  };
  window.LIRIL_STATION = { stop: function () {}, start: function () {} };
  window.LIRIL_HOME_GUIDE = { stop: function () {}, start: function () {} };
  window.LIRIL_REPORTER = { stopLive: function () {}, start: function () {} };
  window.__LIRIL_WALKTHROUGH_STOP = function () { cancelSpeech(); };

  if (!window.LIRIL) window.LIRIL = {};
  window.LIRIL.speak = function () { return false; };

  /** Only one video may have sound. Pause other media when a video unmutes/plays with sound. */
  var activeVideo = null;

  function killOrphanAudio(exceptVideo) {
    cancelSpeech();
    try {
      var audios = document.querySelectorAll('audio');
      for (var i = 0; i < audios.length; i++) {
        try {
          audios[i].pause();
          audios[i].muted = true;
          audios[i].volume = 0;
          audios[i].removeAttribute('autoplay');
        } catch (eA) { /* */ }
      }
    } catch (e1) { /* */ }
    try {
      var vids = document.querySelectorAll('video');
      for (var j = 0; j < vids.length; j++) {
        var v = vids[j];
        if (exceptVideo && v === exceptVideo) continue;
        // Ambient/b-roll may stay muted; never leave two sounding
        if (!v.muted && !v.paused) {
          try {
            v.muted = true;
            v.setAttribute('muted', '');
          } catch (eV) { /* */ }
        }
      }
    } catch (e2) { /* */ }
  }

  function onVideoPlay(ev) {
    var v = ev.target;
    if (!v || v.tagName !== 'VIDEO') return;
    // Background/decorative loops stay muted forever
    if (v.classList.contains('home-broll') || v.classList.contains('act-page-bg') || v.getAttribute('aria-hidden') === 'true') {
      v.muted = true;
      return;
    }
    if (!v.muted) {
      activeVideo = v;
      killOrphanAudio(v);
    }
  }

  function onVideoVolume(ev) {
    var v = ev.target;
    if (!v || v.tagName !== 'VIDEO') return;
    if (!v.muted && v.volume > 0) {
      activeVideo = v;
      killOrphanAudio(v);
    }
  }

  document.addEventListener('play', onVideoPlay, true);
  document.addEventListener('volumechange', onVideoVolume, true);

  // Global bus used by doc-player / station
  window.TENET5AudioBus = {
    owner: null,
    docPlaying: false,
    claim: function (who) {
      this.owner = who || null;
      this.docPlaying = who === 'doc' || who === 'video';
      window.__TENET5_DOC_ON_AIR = this.docPlaying;
      try {
        document.documentElement.setAttribute('data-audio-owner', who || 'none');
      } catch (e) { /* */ }
      cancelSpeech();
    },
    release: function (who) {
      if (!who || this.owner === who) {
        this.owner = null;
        this.docPlaying = false;
        window.__TENET5_DOC_ON_AIR = false;
        try {
          document.documentElement.setAttribute('data-audio-owner', 'none');
        } catch (e2) { /* */ }
      }
    },
    stopNonDoc: function () {
      cancelSpeech();
      killOrphanAudio(activeVideo);
    },
    pauseAllDocs: function () {
      try {
        document.querySelectorAll('video').forEach(function (v) {
          if (v.classList.contains('home-broll') || v.classList.contains('act-page-bg')) return;
          try { v.pause(); } catch (e) { /* */ }
        });
      } catch (e3) { /* */ }
      this.release(this.owner);
    },
    killAllVoice: function () {
      cancelSpeech();
      killOrphanAudio(null);
    }
  };

  // Continuous enforcement: cancel any TTS AND mute every audio + every non-active video,
  // so no legacy player can leave a second voice sounding. Only the active <video> keeps sound.
  cancelSpeech();
  setInterval(function () {
    try {
      if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        window.speechSynthesis.cancel();
      }
    } catch (e) { /* */ }
    try { killOrphanAudio(activeVideo); } catch (e2) { /* */ }
  }, 1200);

  // Block HTMLAudioElement dual-play for product VO stems
  try {
    var NativeAudio = window.Audio;
    if (NativeAudio && !NativeAudio.__tenet5_wrapped) {
      function GuardedAudio(src) {
        var a = new NativeAudio(src);
        // Allow construction but force silent until explicitly needed — product path is video-only
        try {
          a.muted = true;
          a.volume = 0;
          var origPlay = a.play.bind(a);
          a.play = function () {
            // Deny orphan MP3 VO — videos own sound
            a.muted = true;
            a.volume = 0;
            return Promise.resolve();
          };
          a.__origPlay = origPlay;
        } catch (eG) { /* */ }
        return a;
      }
      GuardedAudio.__tenet5_wrapped = true;
      GuardedAudio.prototype = NativeAudio.prototype;
      window.Audio = GuardedAudio;
    }
  } catch (eA) { /* */ }

  // Also guard document.createElement('audio') — it bypasses window.Audio entirely.
  try {
    if (!document.__tenet5_ce_patched) {
      document.__tenet5_ce_patched = true;
      var origCreate = document.createElement.bind(document);
      document.createElement = function (tag) {
        var el = origCreate(tag);
        try {
          if (('' + tag).toLowerCase() === 'audio') {
            el.muted = true;
            el.volume = 0;
            var op = el.play ? el.play.bind(el) : null;
            el.play = function () { el.muted = true; el.volume = 0; return Promise.resolve(); };
            el.__origPlay = op;
          }
        } catch (eC) { /* */ }
        return el;
      };
    }
  } catch (eCE) { /* */ }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      cancelSpeech();
      killOrphanAudio(null);
    });
  } else {
    cancelSpeech();
    killOrphanAudio(null);
  }
})();
