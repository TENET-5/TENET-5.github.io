# PRISM PROJECT LOCK — TENET5 public site (Daniel permanent)

**Status: LOCKED — do not digress unless Daniel says so.**

## Project

**Name:** `TENET5_PUBLIC_SITE_VISUAL_ACUITY`  
**Mission:** Keep https://tenet-5.github.io/ on the screenshot press design  
(The record, read backwards) with **continuous PC + mobile visual validation**  
and **LIRIL as the system/user guide on the homepage**.

## Non-negotiable workstream (PRISM jobs every lap)

1. **One theme:** `css/press-theme.css` only (WordPress model).
2. **Press rebuild:** `tools/press.py` owns index + evidence + story surfaces.
3. **LIRIL guide home (permanent):** dock always visible, **Guide me**, cover CTA,
   `js/liril-voice.js` + `js/liril-home-guide.js`, timeline rail, chapter `#now`.
   Self-heal via press rebuild if any marker missing.
4. **Capture:** JPG screenshots of key URLs at **PC (1440×900)** and **mobile (390×844)**.
5. **Validate:** visual acuity metrics (not blank, dark void theme, ice/structure present).
6. **Self-work:** PRISM improves theme/content/enforcement while it watches — still this project.
7. **Never stop** until Daniel creates a STOP flag or says stop.

## LIRIL on main page = PRISM job

Not a one-off feature. Every `prism_site_duty` lap must leave:

| Marker | Required |
|--------|----------|
| `#dock` + `aria-label="LIRIL guide"` + `guide-ready` | always-on chrome |
| `#liril-guide-btn` + `#liril-guide-btn-cover` | Guide me |
| `#liril-line` + `#voice-btn` + `#liril-status` | status/voice |
| `js/liril-voice.js` + `js/liril-home-guide.js` | scripts present on disk + linked |
| `#now` + timeline rail | chapter walk |

Proof: `C:\PRISM\log\prism_liril_guide_last.json` · `data/prism_liril_guide_last.json`

## Run forever

```text
python tools/prism_site_duty.py --forever
```

Stop only if either file exists:

```text
C:\PRISM\log\PRISM_SITE_DUTY_STOP
E:\tenet-5.github.io\data\.PRISM_SITE_DUTY_STOP
```

Or Daniel says stop in chat.

## Proof paths

| Artifact | Path |
|----------|------|
| Duty | `C:\PRISM\log\prism_site_duty_last.json` |
| LIRIL guide | `C:\PRISM\log\prism_liril_guide_last.json` |
| Visual acuity | `C:\PRISM\log\prism_visual_acuity_last.json` |
| JPGs | `E:\tenet-5.github.io\data\visual_acuity\` and `C:\PRISM\log\visual_acuity\` |
| Project lock copy | `C:\PRISM\log\PRISM_PROJECT_LOCK_TENET5_SITE.json` |

## Digression ban

Agents must **not** switch to SOLASTRA, games, unrelated refactors, or “side experiments” while this lock is active. Content posts, theme polish, visual acuity, LIRIL guide health, and PRISM self-tools that **serve this site** are in scope.
