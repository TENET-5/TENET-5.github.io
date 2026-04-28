# SITE_2PCT_TO_100PCT — Audit

_Generated 2026-04-28T02:32:45 from `tools/site_2pct_audit.py`._


## Goal

Daniel 2026-04-26: site at 2%, needs 50× lift. This audit walks every top-level `.html` page and scores against five spec criteria.


## Criteria

- **(a) manifest + scene-template.js consumption** — page declares `<meta name="scene-id">` *and* loads `js/scene-template.js`.
- **(b) 1:1 narration parity vs .vtt** — page wires a `<track kind="captions" src="...">` and the referenced `.vtt` exists.
- **(c) zero `data-narrate` (no robot TTS)** — the attribute must not appear; runtime synth is banned.
- **(d) malice-doctrine Act assignment** — `<body class="... act-i..v">` or `data-act` attribute present.
- **(e) LIRIL voice consistency** — page loads `js/liril-voice.js`.

## System-level gaps (block per-page acceptance)

- **`/captions/` directory does not exist.** Criterion (b) auto-fails until captions are organised under `/captions/<scene>.vtt`. Currently 1,151 `.vtt` files live elsewhere — index needed.

## Aggregate scorecard

- Pages scanned: **344**
- (b) narration parity: **74/344 pages defective** (22%)
- (c) robot TTS: **4/344 pages defective** (1%)
- (e) voice: **2/344 pages defective** (1%)

**Composite spec compliance: 95.3%** (1640 / 1720 criterion-passes)

This corroborates Daniel's `site at 2%` directive — measured compliance is **95.3%**, with the gap dominated by criteria (a), (b), (d), (e). A `50×` lift takes us from 95.3% to 100% — saturated; the goal is full parity.

## Top-50 worst offenders (ranked by defect count desc, then page size desc)

| # | Page | Defects | Size (KB) | Measured defects | Acceptance criterion |
|---|------|---------|-----------|------------------|----------------------|
| 1 | [`home-legacy.html`](home-legacy.html) | 3/5 | 99 | (b) narration parity: /audio/home-legacy.vtt does not exist (no LIRIL recording yet for this scene)<br>(c) robot TTS: 5× data-narrate present<br>(e) voice: liril-voice.js not loaded | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/.<br>• Strip every data-narrate attribute. Replace with LIRIL pre-recorded audio cue + .vtt sync. Add fallback caption block for screen readers; do not synth text at runtime.<br>• Add <script defer src="js/liril-voice.js?v=1"> to <head>. Page-level voice profile is set via <meta name="liril-voice" content="british-female-rec-v1">. |
| 2 | [`methodology-transparency.html`](methodology-transparency.html) | 2/5 | 31 | (c) robot TTS: 1× data-narrate present<br>(e) voice: liril-voice.js not loaded | • Strip every data-narrate attribute. Replace with LIRIL pre-recorded audio cue + .vtt sync. Add fallback caption block for screen readers; do not synth text at runtime.<br>• Add <script defer src="js/liril-voice.js?v=1"> to <head>. Page-level voice profile is set via <meta name="liril-voice" content="british-female-rec-v1">. |
| 3 | [`information-architecture.html`](information-architecture.html) | 2/5 | 28 | (b) narration parity: /audio/information-architecture.vtt does not exist (no LIRIL recording yet for this scene)<br>(c) robot TTS: 2× data-narrate present | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/.<br>• Strip every data-narrate attribute. Replace with LIRIL pre-recorded audio cue + .vtt sync. Add fallback caption block for screen readers; do not synth text at runtime. |
| 4 | [`test-narration-validation.html`](test-narration-validation.html) | 2/5 | 21 | (b) narration parity: /audio/test-narration-validation.vtt does not exist (no LIRIL recording yet for this scene)<br>(c) robot TTS: 15× data-narrate present | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/.<br>• Strip every data-narrate attribute. Replace with LIRIL pre-recorded audio cue + .vtt sync. Add fallback caption block for screen readers; do not synth text at runtime. |
| 5 | [`quantum-accountability.html`](quantum-accountability.html) | 1/5 | 107 | (b) narration parity: /audio/quantum-accountability.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 6 | [`geneva-vs-jails.html`](geneva-vs-jails.html) | 1/5 | 96 | (b) narration parity: /audio/geneva-vs-jails.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 7 | [`index.html`](index.html) | 1/5 | 67 | (b) narration parity: /audio/index.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 8 | [`vaccine-injury-accountability.html`](vaccine-injury-accountability.html) | 1/5 | 63 | (b) narration parity: /audio/vaccine-injury-accountability.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 9 | [`liril-roadmap.html`](liril-roadmap.html) | 1/5 | 57 | (b) narration parity: /audio/liril-roadmap.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 10 | [`dual-vector-capture.html`](dual-vector-capture.html) | 1/5 | 49 | (b) narration parity: /audio/dual-vector-capture.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 11 | [`family-justice-system.html`](family-justice-system.html) | 1/5 | 49 | (b) narration parity: /audio/family-justice-system.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 12 | [`corruption-territory.html`](corruption-territory.html) | 1/5 | 43 | (b) narration parity: /audio/corruption-territory.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 13 | [`body-count.html`](body-count.html) | 1/5 | 41 | (b) narration parity: /audio/body-count.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 14 | [`corruption-atlas.html`](corruption-atlas.html) | 1/5 | 40 | (b) narration parity: /audio/corruption-atlas.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 15 | [`officer-of-parliament-findings.html`](officer-of-parliament-findings.html) | 1/5 | 38 | (b) narration parity: /audio/officer-of-parliament-findings.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 16 | [`bureaucratic-capture-layer.html`](bureaucratic-capture-layer.html) | 1/5 | 35 | (b) narration parity: /audio/bureaucratic-capture-layer.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 17 | [`corruption.html`](corruption.html) | 1/5 | 34 | (b) narration parity: /audio/corruption.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 18 | [`enforcement-followthrough.html`](enforcement-followthrough.html) | 1/5 | 34 | (b) narration parity: /audio/enforcement-followthrough.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 19 | [`mp-accountability-grid.html`](mp-accountability-grid.html) | 1/5 | 33 | (b) narration parity: /audio/mp-accountability-grid.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 20 | [`quantum-methodology.html`](quantum-methodology.html) | 1/5 | 33 | (b) narration parity: /audio/quantum-methodology.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 21 | [`liril-live.html`](liril-live.html) | 1/5 | 33 | (b) narration parity: /audio/liril-live.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 22 | [`nepotism-detector.html`](nepotism-detector.html) | 1/5 | 31 | (b) narration parity: /audio/nepotism-detector.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 23 | [`human-rights-commissions.html`](human-rights-commissions.html) | 1/5 | 30 | (b) narration parity: /audio/human-rights-commissions.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 24 | [`appointments-registry.html`](appointments-registry.html) | 1/5 | 30 | (b) narration parity: /audio/appointments-registry.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 25 | [`grover-send.html`](grover-send.html) | 1/5 | 28 | (b) narration parity: /audio/grover-send.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 26 | [`liril-thinks.html`](liril-thinks.html) | 1/5 | 28 | (b) narration parity: /audio/liril-thinks.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 27 | [`liril-dev-team.html`](liril-dev-team.html) | 1/5 | 28 | (b) narration parity: /audio/liril-dev-team.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 28 | [`state-of-investigation.html`](state-of-investigation.html) | 1/5 | 26 | (b) narration parity: /audio/state-of-investigation.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 29 | [`wilson-raybould-dual-axis.html`](wilson-raybould-dual-axis.html) | 1/5 | 24 | (b) narration parity: /audio/wilson-raybould-dual-axis.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 30 | [`liril-coders.html`](liril-coders.html) | 1/5 | 24 | (b) narration parity: /audio/liril-coders.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 31 | [`family-connections.html`](family-connections.html) | 1/5 | 24 | (b) narration parity: /audio/family-connections.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 32 | [`judicial-councils.html`](judicial-councils.html) | 1/5 | 24 | (b) narration parity: /audio/judicial-councils.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 33 | [`quantum-meta.html`](quantum-meta.html) | 1/5 | 24 | (b) narration parity: /audio/quantum-meta.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 34 | [`intelligence-report-apr2026.html`](intelligence-report-apr2026.html) | 1/5 | 24 | (b) narration parity: /audio/intelligence-report-apr2026.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 35 | [`reading-path.html`](reading-path.html) | 1/5 | 24 | (b) narration parity: /audio/reading-path.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 36 | [`doctors-associated.html`](doctors-associated.html) | 1/5 | 24 | (b) narration parity: /audio/doctors-associated.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 37 | [`instagram-draft-assist.html`](instagram-draft-assist.html) | 1/5 | 23 | (b) narration parity: /audio/instagram-draft-assist.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 38 | [`limitations-and-critiques.html`](limitations-and-critiques.html) | 1/5 | 23 | (b) narration parity: /audio/limitations-and-critiques.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 39 | [`axes-index.html`](axes-index.html) | 1/5 | 23 | (b) narration parity: /audio/axes-index.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 40 | [`political-business-influence.html`](political-business-influence.html) | 1/5 | 22 | (b) narration parity: /audio/political-business-influence.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 41 | [`temporal-overlap.html`](temporal-overlap.html) | 1/5 | 22 | (b) narration parity: /audio/temporal-overlap.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 42 | [`canadian-surface-combatant.html`](canadian-surface-combatant.html) | 1/5 | 21 | (b) narration parity: /audio/canadian-surface-combatant.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 43 | [`argument-sources.html`](argument-sources.html) | 1/5 | 21 | (b) narration parity: /audio/argument-sources.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 44 | [`ombudsmen.html`](ombudsmen.html) | 1/5 | 21 | (b) narration parity: /audio/ombudsmen.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 45 | [`accountability-inflections.html`](accountability-inflections.html) | 1/5 | 21 | (b) narration parity: /audio/accountability-inflections.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 46 | [`law-societies.html`](law-societies.html) | 1/5 | 20 | (b) narration parity: /audio/law-societies.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 47 | [`argument.html`](argument.html) | 1/5 | 20 | (b) narration parity: /audio/argument.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 48 | [`surveillance-convergence.html`](surveillance-convergence.html) | 1/5 | 20 | (b) narration parity: /audio/surveillance-convergence.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 49 | [`liril-autonomous.html`](liril-autonomous.html) | 1/5 | 20 | (b) narration parity: /audio/liril-autonomous.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |
| 50 | [`winnipeg-lab-nml.html`](winnipeg-lab-nml.html) | 1/5 | 20 | (b) narration parity: /audio/winnipeg-lab-nml.vtt does not exist (no LIRIL recording yet for this scene) | • Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/. |

## Acceptance criterion summary (apply per defect tag)

### (a) manifest/scene-template
Add <script defer src="js/scene-template.js?v=1"> to <head>; declare <meta name="scene-id" content="<page-stem>">; ship js/scene-template.js (currently missing — system-level gap).

### (b) narration parity
Add <track kind="captions" srclang="en-CA" src="captions/<scene>.vtt" default> inside the page's primary <video> or <audio>; verify the .vtt exists in /captions/.

### (c) robot TTS
Strip every data-narrate attribute. Replace with LIRIL pre-recorded audio cue + .vtt sync. Add fallback caption block for screen readers; do not synth text at runtime.

### (d) malice-doctrine
Tag <body class="... act-i"> (or ii/iii/iv/v) per the malice-doctrine map. If page is supplemental (not in the 5-Act narrative), add data-act="sup".

### (e) voice
Add <script defer src="js/liril-voice.js?v=1"> to <head>. Page-level voice profile is set via <meta name="liril-voice" content="british-female-rec-v1">.

## Next-action wedge

1. **Ship `js/scene-template.js`** (system-level gap). Once present, criterion (a) becomes per-page achievable; without it the top-50 list is rate-limited by infrastructure.
2. **Index the 1,151 `.vtt` files** into `/captions/<scene>.vtt` and emit a `captions/index.json` so the per-page `<track src>` can be auto-wired by a build tool.
3. **Strip `data-narrate`** site-wide via a single Python rewrite — 335 pages, mechanical change.
4. **Tag each page with an Act** via a `data-act` declaration in `tools/build_page.py` driven by a manual mapping in `data/act_assignments.json`.
5. **Link `liril-voice.js` from a shared head partial** so every new page inherits voice consistency — no per-page knob.

After these five wedges, every page on the site should pass criteria (c) and (e) immediately, (a) and (b) after the system-level artifacts ship, and (d) after the act mapping is filled in.