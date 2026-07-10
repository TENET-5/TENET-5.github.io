# TENET5 Website — CLAUDE.md (MANDATORY)

## IDENTITY — DO NOT CHANGE

This website is **TENET5** powered by **LIRIL AI**. It is NOT:
- "Canadian Accountability Project"
- "CAP"
- Any other name

**TENET5** is the brand. **LIRIL** is the AI. These names are PERMANENT.

### Rules

1. **NEVER rename the project.** The site is TENET5. The AI is LIRIL. Period.
2. **NEVER strip TENET5 or LIRIL references.** These are the product identity.
3. **NEVER replace the brand with generic names** like "Canadian Accountability Project", "CAP", "Investigation Platform", etc.
4. **ZERO INTERNALS ON THE PUBLIC SITE (owner directive, 2026-07-09 — supersedes all
   earlier rules that said to keep infrastructure references).** The public site must
   reveal NOTHING about the owner's hardware, AI infrastructure, or how his systems
   work. That means no GPU/NPU/CPU models or counts, no daemon or bus names, no
   message-queue technology, no ports, no seeds or magic constants, no local file
   paths, no internal tool or script names, no model names, no inference-stack
   details. "Powered by LIRIL AI" as a brand line is fine; describing what LIRIL
   runs on is not. This file is served publicly too — keep internals out of it.
5. **The logo is the heraldic crest SVG** (Crown + Red Shield + Gold Maple Leaf) with "TENET5" brand text + "Powered by LIRIL AI" subtitle.
6. **nav.js brand-title = "TENET5"**, brand-subtitle = "Powered by LIRIL AI". DO NOT CHANGE.
7. **All page titles end with "| TENET5"**.
8. **og:site_name = "TENET5"** across all pages.

## OWNER

Daniel Perry — Canadian Forces combat veteran, Afghanistan. CEO.
He is a NON-CODER. Do not ask for design reviews or code approvals.
Execute autonomously. Fix problems immediately. Never stop working.

## CONTENT RULES

- All data sourced from official government records (Health Canada, Hansard, AG, court documents)
- APA-style citations with source links
- Every claim must have a source
- The site documents government failures — this is investigative journalism, not opinion
- **NO personal legal content (owner directive, 2026-07-09).** Nothing about the
  owner's own legal proceedings, filings, hearings, medical history, or named
  individuals from his case may appear on the site. The ONLY sanctioned reference
  is the single origin line: the site was created amid an ongoing political
  prosecution by the Canadian Forces military police for identifying foreign
  interference in the military linked to China and Israel. Institutional
  accountability reporting (e.g., about military police oversight generally)
  stays — personal case material goes.

## LIRIL VOICE (owner directive, 2026-07-09)

- LIRIL speaks with a **high-quality BRITISH FEMALE voice** (neural en-GB;
  Google UK English Female acceptable in Chrome).
- **Silence over wrong voice.** If no acceptable voice exists on the visitor's
  system, LIRIL says nothing. NEVER let an utterance play with the browser/OS
  default voice, and NEVER a male or "Desktop" SAPI voice.
- All speech goes through `window.LIRIL_VOICE.speak()` / `guardUtterance()` in
  `js/liril-voice.js` — the single source of truth. No page or script may call
  `speechSynthesis.speak()` without that guard.

## TECH STACK

- Static HTML/CSS/JS on GitHub Pages (tenet-5.github.io)
- nav.js = shared navigation (heraldic crest + two-tier header)
- footer.js = shared footer
- shell.js = iframe frame shell (index.html loads content pages in iframe)
- **css/tokens.css = CANONICAL design-token contract**
- style.css = global reset + layout primitives (references tokens.css)
- js/ux.js = reading progress bar, back-to-top, mobile nav toggle
- tools/build_page.py = markdown-to-HTML page builder

## DESIGN TOKENS (READ BEFORE TOUCHING ANY CSS)

**Single source of truth:** `css/tokens.css`. Every `:root` token lives
there and nowhere else. Active palette: **PRISTINE ICE LAKE** — deep
glassy abyssal ground (`--slate-bg #05080d`), crystalline ice-white
chrome (`--slate-accent #eef6fa`), glacial-silver ink. Monochrome chrome;
saturated colour reserved for MUTED data semantics only. Panels render as
frosted glass via `css/tnt-override.css` (the final-cascade deliverer).

**Rules:**
1. Do NOT add `:root{}` blocks to any other CSS file.
2. Do NOT invent namespaces. Use `--slate-*` canonical names; legacy
   names forward via the alias layer in `tokens.css` §2.
3. Do NOT migrate the palette without a Daniel directive.

## DEPLOYMENT

- Push to main → GitHub Pages auto-deploys
- CI/CD pipeline may inject SEO tags — DO NOT fight it, merge cleanly
- Cache bust: bump ?v=N on any changed CSS/JS asset in the same commit

## DO NOT

- Rename the project
- Strip branding
- Change the logo
- Remove LIRIL AI references
- Add tracking scripts or analytics
- Commit secrets (.env, API keys, tokens)
- Expose ANY internals: hardware, ports, seeds, paths, tool names, daemon names
- Publish the owner's personal legal material
