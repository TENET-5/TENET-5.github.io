# Documentary audio product — hard contract (2026-07-12)

**Silent film is unfinished product.** Every public documentary hybrid must ship:

| Stem | Required | Owner |
|------|----------|--------|
| **Picture** | Motion b-roll (T1 Ken Burns floor or better) | film pipeline |
| **VO** | LIRIL neural voice **in the product** (muxed and/or paired stem) | `prism_audio_slate.py` |
| **BGM** | Memorial ice score, ducked under VO | `prism_audio_slate.py` + `media/film/docs/*_bgm.mp3` |
| **Captions** | WebVTT 1:1 with VO beats | `audio/docs/<id>.vtt` |
| **Manifest** | `audio`, `captions_vtt`, `video` → mux when green | `data/film/hybrid_*.json` |

## Commands

```text
python tools/prism_audio_slate.py --json --apply acts
python tools/prism_audio_slate.py --json --apply full --manifest data/film/hybrid_ch_01_intent.json
python tools/prism_audio_slate.py --json audit
```

## Player contract (`tenet5-doc-player.js`)

1. Prefer **muxed MP4** (`*_mux.mp4`) so voice + score play inside the video when user unmutes.
2. Always wire `data-doc-audio` + `data-doc-vtt` as fallback / dual path.
3. Browser TTS is **backup only** when stems missing — never the sole product path for acts.

## Forbidden

- Shipping act films as video-only and calling them “documentary complete”
- Male/default SAPI as product VO
- BGM louder than VO
- ComfyUI as a requirement for score (use curated beds; synth memorial bed only if no bed file)
- Claiming broadcast quality without `prism_audio_slate_last.json` gates

## Proof

- `data/prism_audio_slate_last.json`
- `audio/docs/hybrid_ch_*.mp3` + `.vtt`
- `media/film/docs/hybrid_ch_*_mux.mp4` with audio stream
