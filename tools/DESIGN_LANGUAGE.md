# TENET5 DESIGN LANGUAGE — one vocabulary, learnable at a glance (KISS)

The reader learns ONE system, then reads the whole site fluently. Every colour and element
carries exactly one meaning. Nothing is decorative. If a colour appears, it is *saying*
something. Minimal, elegant, cold-ice register — never mixed.

## Colour = meaning (the whole palette, and it's small)
| Token | Hex | MEANS | Used on |
|---|---|---|---|
| `--void` | `#050708` | the ground; absence | page background |
| `--ivory` | `#ece7dc` | primary content — the record itself | body headings, key text |
| `--ivory-dim` | `#a89f90` | secondary content | body copy, deks |
| `--ivory-faint` | `#827a6d` | tertiary / metadata | timestamps, captions |
| `--ice` | `#9adbe8` | **the signal layer**: labels, links, LIRIL/AI, interactive | kickers, category tags, dock, links |
| `--red` | `#c8102e` | **CRITICAL only** — the charge, an alert | `.kick.red`, critical headline. Never decorative. |
| gold | `#d3a625` | RETIRED from labels (was decorative mixing) | — |

Rule: a small mono ice label = "this is a category/section marker." A red label = "this is
critical." There is no third label colour. That is how the reader learns to read.

## Element = meaning
- **Kicker** (`.kick`, small mono ice, letter-spaced) — "a section/category marker."
- **Glass panel** (`.glass-card`/card/tile/panel — cold-ice glass, white top-glint) — "a
  sourced record: one claim, its evidence." Every glass panel is a unit of the record.
- **Serif heading** (Fraunces) — "content / the record speaks." Mono (IBM Plex) — "system /
  label / LIRIL." Two typefaces, two voices, never crossed.
- **LIRIL dock** (bottom bar, ice) — "the AI guide layer." Ice everywhere = "this is LIRIL /
  interactive," so the reader always knows what will talk or respond.
- **Source link** (ice, underlined in prose only) — "click to verify at the primary source."
- **Ambient film b-roll** — atmosphere BEHIND the hero only; fades to void before the reading
  text so it never competes (director-spec + minimalism).

## The rules that keep it one system (enforced in press-theme.css)
1. **One stylesheet.** `css/press-theme.css` only. No page invents its own theme.
2. **One meaning per colour.** The design-language block forces every category tag
   (`cap263-tag--*`, `*-status`) to ice; red only survives on the explicit critical label.
   No red/gold/tan mixing on the same kind of element.
3. **Two typefaces, fixed roles.** Serif = content, Mono = system/label. Never swap.
4. **Minimalism is the default.** If an element doesn't carry meaning, it is removed
   (share bars, bracket cosplay, emoji clip-art, decorative colour — all retired).
5. **Contrast is law.** No text below WCAG AA on the void (the `--ink` invisible-text bug is
   why; `prism_css_quantum_precision.py` gates it).

## Why (the science, briefly)
Consistent mapping = lower cognitive load (Mayer/CTML signalling + coherence): the reader
spends attention on the record, not on decoding the interface. A learnable legend builds
trust; trust sustains the long-form watch (see DIRECTOR_SYSTEM.md). Elegance here is not
taste-for-its-own-sake — it is comprehension.
