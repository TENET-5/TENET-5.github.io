/**
 * scene-template.js — TENET5 scene narration template (audit criterion (a))
 *
 * Reads <meta name="scene-id" content="<scene>">, fetches the matching
 * /audio/<scene>.{opus,mp3} + /audio/<scene>.vtt, attaches them to a
 * hidden <audio>+<track> pair so the page can play LIRIL-narrated audio
 * with <track kind="captions"> for the deaf/HoH narration parity
 * (criterion (b)).
 *
 * Asset contract (cap357, revised cap358; cap2026-05-03 mp3 fallback):
 *   /audio/<scene>.vtt      — WebVTT subtitle file (UTF-8)
 *   /audio/<scene>.opus     — preferred: LIRIL-recorded narration (Opus)
 *   /audio/<scene>.mp3      — fallback: legacy MP3 narration (the on-disk
 *                             corpus today is .mp3; .opus added going fwd)
 *
 * 2026-05-03 — added .mp3 fallback. Original code only probed .opus, but
 * 0 .opus assets existed on disk and 349 scene-id pages silently rendered
 * narration-less. Daniel surfaced the regression via the LIRIL playthrough
 * at ?load=findings.html (audio/findings.mp3 already exists, just wasn't
 * being attached). Probing .opus first preserves the upgrade path; .mp3
 * fallback revives every existing recording.
 *
 * All three (opus, mp3, vtt) are optional. If audio in either format is
 * missing, page renders silent. If captions are missing but audio is
 * present, audio plays without subtitles. If both are missing,
 * scene-template.js is a no-op.
 *
 * No runtime TTS synthesis here. No data-narrate. The two-font lock and
 * IP-redaction both forbid robot-voice fallback per Daniel directive
 * 2026-04-27 — narration is pre-recorded LIRIL voice or nothing. (TTS
 * walkthrough kicks in separately via liril-autoreader.js for pages
 * without recordings.)
 */
(function () {
  "use strict";

  if (window.__TENET5_SCENE_TEMPLATE_LOADED) return;
  window.__TENET5_SCENE_TEMPLATE_LOADED = true;

  var meta = document.querySelector('meta[name="scene-id"]');
  if (!meta) return;
  var sceneId = (meta.getAttribute("content") || "").trim();
  if (!sceneId) return;

  var captionUrl = "/audio/" + sceneId + ".vtt";
  // Probe order: prefer .opus (smaller, modern), fall back to .mp3.
  var audioCandidates = [
    "/audio/" + sceneId + ".opus",
    "/audio/" + sceneId + ".mp3",
  ];

  function tryAudio(idx) {
    if (idx >= audioCandidates.length) {
      // No narration in any recorded format — silent render. Criterion
      // (b) tolerates this. liril-autoreader.js handles TTS fallback.
      return;
    }
    var audioUrl = audioCandidates[idx];
    fetch(audioUrl, { method: "HEAD" })
      .then(function (r) {
        if (!r.ok) {
          tryAudio(idx + 1);
          return;
        }
        attachAudio(audioUrl);
      })
      .catch(function () {
        tryAudio(idx + 1);
      });
  }

  function attachAudio(audioUrl) {
    var audio = document.createElement("audio");
    audio.id = "tenet5-scene-audio";
    audio.preload = "metadata";
    audio.src = audioUrl;
    audio.controls = false;
    audio.setAttribute(
      "aria-label",
      "LIRIL narration for scene " + sceneId
    );

    var track = document.createElement("track");
    track.kind = "captions";
    track.srclang = "en-CA";
    track.label = "English (Canada) — LIRIL narration";
    track.src = captionUrl;
    track.default = true;
    audio.appendChild(track);

    // Hide visually but keep accessible. Page chrome owns the play
    // control; we just expose the element on window for anyone who
    // wants to wire a button.
    audio.style.cssText =
      "position:absolute;left:-9999px;width:1px;height:1px;";
    document.body.appendChild(audio);

    window.__TENET5_SCENE_AUDIO = audio;

    // Dispatch a synthetic event so other scripts (auto-presenter,
    // walkthrough, voice toggle) can hook in without polling.
    document.dispatchEvent(
      new CustomEvent("tenet5:scene-audio-ready", {
        detail: { sceneId: sceneId, audio: audio, format: audioUrl.slice(-4) },
      })
    );
  }

  tryAudio(0);
})();
