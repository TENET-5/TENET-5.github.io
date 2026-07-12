# AUDIO SLATE — precision voice · score · mix (video product)

**Status:** living lock (2026-07-12)  
**Owner:** `tools/prism_audio_slate.py` + `prism_doc_swarm.py`  
**Proof:** `C:\PRISM\log\prism_audio_slate_last.json`  
**Parents:** `FILM_DIRECTOR_SPEC.md` · `SLATE_VIDEO_PIPELINE.md` · LIRIL voice doctrine  

---

## Product truth

Video without **controlled audio** is unfinished. Public documentaries are **T2 hybrid**:

| Stem | Role | Quality bar |
|------|------|-------------|
| **VO** | LIRIL narration (neural TTS, female Canadian preferred) | edge-tts neural; never raw male SAPI |
| **BGM** | Memorial ice score bed (no lyrics, no trailer drums) | loop-safe, ducked under VO |
| **AMB** | Optional room tone / soft air | below BGM |
| **MUX** | AAC stereo on the product MP4 **or** paired `data-doc-audio` | loudness-normalized |

Hybrid player (`tenet5-doc-player.js`) can use **separate** audio bed; muxed files ship for offline/download and silent-autoplay fail-safes.

---

## Voice doctrine (absolute)

1. **Neural only** for offline stems — default: Microsoft **en-CA Clara** via `edge-tts`.  
2. Fallbacks (order): `en-CA-ClaraNeural` → `en-GB-SoniaNeural` → `en-GB-LibbyNeural` → `en-US-AriaNeural`.  
3. **Never** ship Desktop/SAPI male or “robot” default. If no neural path: **fail closed** (no fake green VO).  
4. Cadence: rate ~0.95–1.05, pitch natural; newsroom calm, not trailer energy.  
5. Script: plain language; **no flags/symbols/glyph bait** (same as visual gen).  
6. Captions: WebVTT 1:1 with VO beats; timestamps match hybrid manifest.

---

## Music / score doctrine

1. **Memorial / institutional** — low, sustained, ice-cold; no pop hooks, no epic trailer hits.  
2. Source: curated beds under `media/film/docs/*_bgm.mp3` or `audio/score/`.  
3. Default level under VO: **−18 to −22 dB** relative (ducked further on speech).  
4. No lyrics. No samples that imply brand IDs.  
5. Loop must be seamless enough for 30–120 s beds.

---

## Mix targets (precision)

| Metric | Target | Gate |
|--------|--------|------|
| Sample rate | **48 kHz** stereo for mux | `G_SR` |
| VO integrated loudness | **−16 LUFS** (±1) | `G_LUFS_VO` |
| Program (mux) loudness | **−14 LUFS** (±1.5) | `G_LUFS_PRG` |
| True peak | **≤ −1.5 dBTP** | `G_TP` |
| VO bitrate (AAC) | ≥ **160 kb/s** | `G_BR` |
| BGM under speech | sidechain duck or fixed ≤ −18 dB | `G_DUCK` |
| Duration | VO ≤ video; pad/trim BGM to video | `G_DUR` |
| Sync | VO start ≤ 200 ms after beat start | `G_SYNC` |

Tools: ffmpeg `loudnorm`, `sidechaincompress`, `amix`, `aac`.

---

## Pipeline (who owns what)

| Stage | Script | Output |
|-------|--------|--------|
| Beat script | hybrid `data/film/hybrid_*.json` | narration lines |
| Neural VO | `prism_audio_slate.py render-vo` | `media/film/audio/docs/<id>_vo.wav` + `.vtt` |
| Score bed | `prism_audio_slate.py bed` | `media/film/audio/docs/<id>_bgm.wav` |
| Mix + mux | `prism_audio_slate.py mux` | `media/film/docs/<id>_mux.mp4` + `audio/docs/<id>.mp3` |
| Audit | `prism_audio_slate.py audit` | gates in proof JSON |
| Doc swarm | `prism_doc_swarm.py` calls audio after video | end-to-end |

---

## Forbidden

- Silent “final” documentaries presented as finished product  
- Male/default SAPI on product stems  
- BGM louder than VO  
- Clipping / peaks > −1.0 dBTP  
- Claiming “broadcast quality” without proof artifact  
- Shipping internals (engine names) in captions  

---

## Win condition

MAID full doc + report films: **cinema video + neural VO + ducked score**, gates green in `prism_audio_slate_last.json`, hybrid player wired to new stems, live HEAD bytes match.

## Act batch (product)

```text
python tools/prism_audio_slate.py --json --apply acts
```

Produces for each `data/film/hybrid_ch_*.json`:
- `audio/docs/hybrid_ch_*.mp3` + `.vtt` (LIRIL VO + BGM)
- `media/film/docs/hybrid_ch_*_mux.mp4` (picture + voice + score **inside the file**)
- Manifest fields: `audio`, `captions_vtt`, `video` → mux, `product_audio: true`

See also: `tools/DOCUMENTARY_AUDIO_PRODUCT.md`.
