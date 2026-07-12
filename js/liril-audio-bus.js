/* liril-audio-bus.js — ONE audio source at a time (a video's own VO OR LIRIL's voice, never both).
 *
 * Daniel (2026-07-12): "I have 2 voices playing sound." Root cause: liril-station plays a news video
 * with baked-in VO (v.play(), outside liril-voice.js's control) while liril-home-guide narrates via
 * speechSynthesis — two audio channels, no shared arbiter. speechSynthesis is a single queue so it
 * cannot overlap ITSELF; the double voice is always media + speech.
 *
 * This is the global arbiter, wrapping the two entry points so no existing script needs editing:
 *   - Starting a NON-MUTED <audio>/<video> makes it the sole source: it cancels any speech and pauses
 *     every other audible media (the muted ambient b-roll is exempt — it is not a "voice").
 *   - speechSynthesis DEFERS to any audible media already playing (never talk over a video's own VO),
 *     matching the read-vs-video rule; otherwise it speaks normally.
 * Load FIRST, before any liril voice/media/station script.
 */
(function () {
  "use strict";
  if (window.__LIRIL_AUDIO_BUS__) { return; }
  window.__LIRIL_AUDIO_BUS__ = true;

  function audible(m) {
    return m && !m.muted && m.volume > 0 && !m.paused && !m.ended;
  }
  function otherAudible(except) {
    var out = [], els = document.querySelectorAll('audio, video'), i;
    for (i = 0; i < els.length; i++) { if (els[i] !== except && audible(els[i])) { out.push(els[i]); } }
    return out;
  }
  function mediaPlaying() { return otherAudible(null).length > 0; }
  function cancelSpeech() {
    try { if (window.speechSynthesis && window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); } } catch (e) { /* */ }
  }
  function pauseOthers(except) {
    otherAudible(except).forEach(function (m) { try { m.pause(); } catch (e) { /* */ } });
  }

  // (1) a non-muted media element that starts playing becomes the sole audio owner.
  var _play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    var self = this, r = _play.apply(this, arguments);
    try { if (!self.muted && self.volume > 0) { cancelSpeech(); pauseOthers(self); } } catch (e) { /* */ }
    return r;
  };

  // (2) speech defers to any audible media already playing (no talking over a video's own VO).
  if (window.speechSynthesis && typeof window.speechSynthesis.speak === 'function') {
    var ss = window.speechSynthesis, _speak = ss.speak.bind(ss);
    ss.speak = function (u) {
      try { if (mediaPlaying()) { return; } } catch (e) { /* */ }
      return _speak(u);
    };
  }

  window.LIRIL_AUDIO_BUS = {
    mediaPlaying: mediaPlaying,
    silenceAll: function () { cancelSpeech(); pauseOthers(null); }
  };
})();
