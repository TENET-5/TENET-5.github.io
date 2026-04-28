/**
 * scene-template.js — TENET5 scene narration template (audit criterion (a))
 *
 * Reads <meta name="scene-id" content="<scene>">, fetches the matching
 * /captions/<scene>.vtt + /audio/<scene>.opus, attaches them to a hidden
 * <audio>+<track> pair so the page can play LIRIL-narrated audio with
 * <track kind="captions"> for the deaf/HoH narration parity (criterion
 * (b)).
 *
 * Asset contract (cap357, revised cap358):
 *   /audio/<scene>.vtt      — WebVTT subtitle file (UTF-8)
 *   /audio/<scene>.opus     — LIRIL-recorded narration (Opus codec)
 *   (both colocated under /audio/ — 270 of 344 pages have a .vtt
 *    already; new pages will pick up assets when LIRIL records them)
 *
 * Both are optional. If audio is missing, page renders silent. If
 * captions are missing but audio is present, audio plays without
 * subtitles. If both are missing, scene-template.js is a no-op.
 *
 * No runtime TTS synthesis. No data-narrate. The two-font lock and
 * IP-redaction both forbid robot-voice fallback per Daniel directive
 * 2026-04-27 — narration is pre-recorded LIRIL voice or nothing.
 */
(function () {
  "use strict";

  if (window.__TENET5_SCENE_TEMPLATE_LOADED) return;
  window.__TENET5_SCENE_TEMPLATE_LOADED = true;

  const meta = document.querySelector('meta[name="scene-id"]');
  if (!meta) return;
  const sceneId = (meta.getAttribute("content") || "").trim();
  if (!sceneId) return;

  const audioUrl = "/audio/" + sceneId + ".opus";
  const captionUrl = "/audio/" + sceneId + ".vtt";

  // Probe audio existence with HEAD before attaching — cheap miss-skip.
  fetch(audioUrl, { method: "HEAD" }).then(function (r) {
    if (!r.ok) {
      // No narration recorded yet — page stays silent. Criterion (b)
      // tolerates this; criterion (c) requires NO data-narrate (already
      // stripped site-wide in fcc03089b).
      return;
    }
    const audio = document.createElement("audio");
    audio.id = "tenet5-scene-audio";
    audio.preload = "metadata";
    audio.src = audioUrl;
    audio.controls = false;
    audio.setAttribute("aria-label", "LIRIL narration for scene " + sceneId);

    const track = document.createElement("track");
    track.kind = "captions";
    track.srclang = "en-CA";
    track.label = "English (Canada) — LIRIL narration";
    track.src = captionUrl;
    track.default = true;
    audio.appendChild(track);

    // Hide visually but keep accessible. The page chrome owns the play
    // control; we just expose the element on window for anyone who
    // wants to wire a button.
    audio.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;";
    document.body.appendChild(audio);

    window.__TENET5_SCENE_AUDIO = audio;

    // Dispatch a synthetic event so other scripts (auto-presenter,
    // walkthrough, voice toggle) can hook in without polling.
    document.dispatchEvent(
      new CustomEvent("tenet5:scene-audio-ready", {
        detail: { sceneId: sceneId, audio: audio },
      }),
    );
  }).catch(function () {
    // Network error or invalid URL — silent skip. Page renders as
    // text-only, which is the documented fallback for criterion (b).
  });
})();
