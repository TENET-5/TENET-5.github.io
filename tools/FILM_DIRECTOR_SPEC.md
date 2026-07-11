# FILM DIRECTOR SPEC — "The Guided Record" (liril-film.html)

The film is a documentary of the Canadian public record, narrated by LIRIL. Video is
**b-roll under narration** — atmosphere, never spectacle. The record carries the weight;
the image is restraint. Every generated frame must earn the register: sober, archival,
reverent. If a shot looks like a movie trailer, it is wrong.

## Directorial register (non-negotiable)
- **Tone:** austere, patient, elegiac. The camera is a witness, not a showman.
- **Palette:** cold + desaturated — void black, ice blue, weathered stone grey. Matches the
  site (void + ice). No warm/saturated grades, no neon, no teal-orange.
- **Subject:** empty institutional space and the material of record — archives, chambers,
  corridors, ledgers, documents, flags. **No human faces. No readable text. No logos.**
- **Motion:** slow and deliberate only — dolly, forward tracking, gentle drift, macro pull.
  Symmetry and vanishing-point composition. Generous negative space. Never frenetic.
- **Duration:** Cohesive, narrative-driven documentary sequences dynamically scaled to article/chapter length. Generated beats are stitched to form full scenes with synchronized audio.

## Constraints (the negative, always applied)
`text, watermark, logo, subtitles, cartoon, oversaturated, warped faces, distorted hands,
low quality, jpeg artifacts, lens flare spectacle, fast motion, shaky cam`

## Shot vocabulary (map to the film's arc)
The film runs in acts (Prologue → the record → present). B-roll motifs by register:
- **The record itself** — archive halls, filing stacks, turning ledgers, sliding documents
  (redaction bars, never legible). Motif for evidence/sourcing beats.
- **The institutions** — empty committee rooms, marble corridors, chamber seats, the flag in
  grey wind. Motif for accountability/parliament beats.
- **The cost** — closed doors, empty waiting rooms, cold light on vacant chairs. Motif for
  the human-impact beats. (Restraint absolute here — dignity over drama.)

## Technical spec (current, honest)
- Model: **LTX-Video 2B distilled** (t2v), t5xxl fp8 text encoder.
- Params: 768×512, length 97, 8 steps, cfg 1.0, sampler euler — distilled few-step.
- Runner: `E:/ComfyUI_native/tenet5_ltx_gen.py` (queries ComfyUI /object_info, builds the
  graph, renders, ffmpeg-encodes mp4). Shot list: `tenet5_film_shotlist.json`.
- **Compute reality:** ComfyUI + PyTorch (cu128), **single** RTX 5070 Ti, ~6s/clip warm.
  This is NOT p256 and NOT dual-tower. See the roadmap note below — do not mislabel it.
- Output: `media/film/*.mp4` (individual shots) + `media/film/reel.mp4` (ambient loop).

## Integration
- Cohesive documentaries are embedded as high-tier cinema players (`.cinema-player`) at the head of every story and article. 
- They include synchronized LIRIL TTS audio, cinematic scoring, and playback controls. They do NOT sit silently in the background.

## Roadmap — the p256 target (corrected 2026-07-11)
Daniel's direction: generation runs on the **PRISM p256 dual-tower** pipeline. Honest status —
the p256 VIDEO SUBSTRATE ALREADY EXISTS and is proven, correcting an earlier wrong claim:
- `os/hydrogen/world_dit_gpu.cu` — WorldDiT video-diffusion forward on PRISM's base-42/p256
  quantized GPU kernels (k_gemv_q, no cuBLAS/torch). Proven forward ~8.5%.
- `os/hydrogen/world_taehv.cu` / `world_taehv_gpu.cu` — native p256 TAEHV video VAE decoder
  (latent→RGB frames), proven BIT-EXACT vs streaming.
So p256 documentary video is an ADAPTATION of a working substrate, not a from-scratch port.
Real gaps to close: WorldDiT is a world-model (interactive video, experimental accuracy), not
a polished text-to-video documentary model; conditioning/text-encode path + quality + a
dual-tower (both-GPU) split are the work. **Beat sequencing** is optimized by the PRISM Ising
solver (`qising.exe`, already used in `prism_flux_ising_schedule.py`) — ordering beats to
maximize the retention curve under constraints (a real QUBO, per the director system).
Current films still render on the working ComfyUI+LTX path (single GPU, ~6s/clip) until the
p256 documentary path is quality-verified — never mislabel the PyTorch runner as p256.
