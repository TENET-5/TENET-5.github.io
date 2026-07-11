# TENET5 PROJECT SWARM — operating contract (2026-07-11)

The swarm's ONE job: **finish the TENET5 public website to the owner's standard**, autonomously,
without ever breaking taste, legality, or zero-internals. Every worker (LIRIL, the site-duty loop,
the image/video pipelines, any agent) obeys this contract. Mission lives in
`tools/prism_site_duty.py` `PROJECT`; backlog is the bottom of this file.

## The standard (non-negotiable — enforced as gates, not vibes)
1. **Crystal-clear MONOCHROME.** Cold-ice void + ivory + ice(label/link) + red(CRITICAL only).
   No gaudy glass-blur, colour-glows, gradient fills, gold, or multi-colour rainbows. The ONE
   sanctioned effect is the cinematic accent glow on hero/heading emphasis. → gate: `css/design-lock.css`
   (loads LAST on every page, wins the cascade; DO NOT edit — edit `DESIGN_LANGUAGE.md`).
2. **Zero internals.** The public site names NO engine/model/kernel/hardware/port/path/seed.
   "Powered by LIRIL AI" / "Guided by LIRIL" are the ONLY sanctioned AI references. → gate:
   `tools/leak_scanner.py` (word-boundary, allowlisted) + `apply_one_theme.py` `_LEAK` self-heal.
3. **Legal compliance.** Sourced facts + %-based framing; never assert a crime as proven fact;
   frame as "the elements that warrant investigation." → gate: `apply_one_theme.py` `_COMPLIANCE`.
4. **Taste + respect.** Grave subjects (MAID deaths, veterans, Indigenous harm) get restraint:
   single quiet frames, no faces/bodies, no sensationalism, collage EXACTLY once site-wide.

## The gates (run every site-duty lap — a lap fails if any fail)
| Gate | Tool | Blocks on |
|---|---|---|
| design-lock present + injected last | `design_lock` step | missing/unlinked guardrail |
| zero-internals | `leak_scan` step → `leak_scanner.py` | LTX/p256/kernel/path/seed in visible text |
| legal + internals self-heal | `apply_one_theme.py` `_COMPLIANCE`/`_LEAK` | (auto-relabels, non-blocking) |
| visual acuity 14/14 | `visual_acuity_pc_mobile` | pages that don't read clean |
| CSS token precision | `css_quantum_precision` | off-palette / WCAG fails |

## The pipelines (content, all internals-free output)
- **Video** — proven: `media/film/*.mp4` atmospheric loops (labelled "REEL", never the model name).
- **Image** — `tools/imggen/` (gitignored, TO BUILD): six-gate gauntlet
  GENERATE → HARD-FILTER (obscene/gore/weapon/face/text/logo) → COLOUR/TASTE → AESTHETIC →
  GRAVITY-ROUTER (grave subjects never auto-ship; human sign-off) → EXIF-stripped PUBLISH.
  Nothing reaches `media/` unless approved + scrubbed. Collage capped ≤ 1-in-10 and only the
  ONE sanctioned site-wide collage. GPU: KP41 — defer if a game runs or both cards are hot.

## Backlog (priority order — owner-flagged)
1. **accountability.html** — 1,101 records dumped inline (388,000px tall). Add pagination +
   real filters (year/level/party/type/outcome) like procurement-registry. Point the 504
   generator at the paginated template.
2. **The 5 Acts / genocide argument** — rebuild to procurement-registry rigor: sourced,
   factual, "case for investigation," legally clean. Fix the manifest-generator so acts ii–v
   don't carry the "Failed to load manifest" artifact. Add the missing per-Act hero band.
3. **Formatting fixes** (from the audit) — procurement sticky-bar overlap (top:62px + mobile),
   accountability-inflections off-palette pink/lavender box, act-i Act-link card grid, the
   orphaned selector-less heal-block declaration, duplicate stat blocks, duplicate cover glint.
4. **Content enrichment** — HIGH tier reuses existing assets (MAID hero single veiled still,
   procurement paper backdrop, Act chapter-scene atmospheric loops). Build the image pipeline
   guard BEFORE generating anything new.
5. **Harden the guardrail** — make `design-lock.css` + the `apply_one_theme` injection
   tamper-resistant (the swarm has edited them); consider a lap self-heal that re-asserts both.

## Rules of engagement
- Commit surgically; the TENET5 repo pushes to GitHub Pages, the inner PRISM repo NEVER pushes.
- Verify on the LIVE site after deploy (design-lock/leak gates are green ≠ rendered-correct).
- STOP flag: `C:/PRISM/log/PRISM_SITE_DUTY_STOP` or `data/.PRISM_SITE_DUTY_STOP` (honored in all modes).
