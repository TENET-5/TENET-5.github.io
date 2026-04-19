# AGENTS.md — Jules & autonomous-agent operating manual for tenet-5.github.io

This file is the primary instruction document for any asynchronous coding
agent (Jules, Claude Code, Copilot, etc.) working on the TENET5 accountability
website. **Read this file top-to-bottom before making changes.**

---

## 1. What this site is

TENET5 is the public accountability record for Daniel Perry and the broader
Canadian accountability investigation. It is:

- **An archival public record** — what is published here is intended to
  survive as permanent witness. Every page can be used in a court or
  regulatory proceeding.
- **Factual by discipline** — not editorial, not rhetorical, not campaigning.
- **Primary-source-backed** — every claim resolves to a Hansard transcript,
  Gazette OIC, court decision, Ethics Commissioner report, or equivalent
  public record.

**What this site is NOT:** a blog, a social-media property, a political
campaign poster, a news aggregator, or a personal grievance page.

---

## 2. Brand lock (DO NOT TOUCH)

- The brand is **TENET5**. The AI is **LIRIL**.
- `nav.js` brand-title = `"TENET5"`, brand-subtitle = `"Powered by LIRIL AI"`.
- The heraldic crest SVG (Crown + Red Shield + Gold Maple Leaf) is the logo.
- **Never rename to** "Canadian Accountability Project", "CAP",
  "Investigation Platform", or any other label.
- **Never strip** TENET5, LIRIL, SATOR, NATS, GPU, NPU, or SEED references
  from `<meta>` tags, schema.org blocks, or JS strings.
- All page titles end with `| TENET5`.
- `og:site_name = "TENET5"` across every page.
- `SYSTEM_SEED = 118400` is a public constant.

Any PR that alters brand-locked identity will be rejected at the approval
gate.

---

## 3. Truth discipline (the cardinal rule)

This is the rule that matters most on this site. **Treat every edit as if
it will be read in a deposition.**

### Do

- State facts as facts. `"X happened on [date]"` is a fact. `"X was
  devastating"` is editorial and not allowed on first-person pages.
- Attribute every claim to its source. `"Per PHAC CAEFISS dashboard
  (2024-11)…"` not `"As everyone knows…"`.
- When an item is pleaded but not adjudicated, label it: `"pleaded in
  Perry's s.504 Information; not yet adjudicated"`. Never assert the
  finding as proven.
- Use `--slate-verified` tagged blocks (`.ts-fact`) for factual records;
  use `.ts-critical` only for items the record itself labels critical.
- Reserve inference/motive to the legal pleadings. On the website, state
  what happened; let the reader or court draw the inference.

### Do NOT

- **Embellish.** Words not allowed on first-person pages about Daniel
  Perry: `lawfare`, `weaponized psychiatry`, `psychological warfare`,
  `the Machine`, `trying to destroy me`, `grind you down`. These were
  removed in commit `4fcca7d9` and should not return.
- **Compare Daniel Perry's case to other people's personal cases.** The
  earlier "This Is Not Unique to Me" section on `my-story.html` (listed
  Vice-Admiral Norman, sexual-misconduct whistleblowers, intel WB
  context) and the MAID-totals / Paralympian section were **removed on
  purpose**. Each person's record stands on its own.
- **Invent sources.** `"AG 2026 Report 1 para 3.21"` sounds authoritative
  and is fake. If a source doesn't exist, say "internal TENET5 change"
  or don't make the claim.
- **Invent URLs.** Every `<a href="…">` must return HTTP 2xx/3xx. A URL
  hallucination gate runs in the dev-team pipeline and catches these;
  do not test it.
- **Add rhetorical questions.** "Why is Canada prosecuting whistleblowers?"
  was removed because it's argument, not fact. Statements of fact only.

### Worked examples

- ❌ `"The CAF engaged in weaponized psychiatry. Dr. Selhi issued a
  retaliatory evaluation claiming I was cognitively impaired."`
- ✅ `"After the disclosure, I was referred for psychiatric evaluation.
  Dr. Zoe Selhi produced an assessment. The date of that assessment,
  and its temporal relationship to the date of the disclosure, is on
  the record."`

---

## 4. Design system: slate palette

The site is migrating (opt-in, incremental) to a new design system:
`style-slate.css` at repo root.

- **Aesthetic:** 1950s field-watch × contourography. Neither dark-theme
  nor light-theme: mid-tone slate base at LAB L*≈45.
- **Tokens:** `--slate-bg` `#5c6773`, `--slate-raised` `#68737f`,
  `--slate-brass` `#b5835a` (primary-source accent), `--slate-critical`
  `#a45a52` (muted brick, never alarm-red), `--slate-verified`
  `#6e8f68` (muted field green).
- **Opt-in classes:** `.ts-slate`, `.ts-card`, `.ts-fact`, `.ts-critical`,
  `.ts-cite`, `.ts-stat`, `.ts-btn`.
- **Contour background:** `--slate-contour-svg` tiled at 240×240, opacity
  0.18 — applied automatically on `.ts-slate`.
- **Typography:** Inter (body + headings), JetBrains Mono (labels +
  citations).
- **Never use:** `#000`, `#fff`, neon colours, alarm-red `#ef4444`,
  pure primary-party colours in muted contexts.

Reference implementation: `mp-accountability-grid.html` (commit
`ab5c0904`).

---

## 5. URL rules

- Every `<a href>` to an external domain must resolve HTTP 2xx/3xx.
- Every relative link must resolve to an existing file on the repo.
- Sitemap entries (`sitemap.xml`, `sitemap.html`) must be kept in sync
  when adding/removing pages.
- Known-good primary-source URLs:
  - `https://globalnews.ca/news/11247648/` (Hartman case)
  - `https://coadecisions.ontariocourts.ca/coa/coa/en/item/24102/index.do`
  - `https://scc-csc.lexum.com/scc-csc/scc-csc/en/793/1/document.do`
    (R v Stinchcombe)
  - `https://www.canada.ca/en/public-health/services/immunization/vaccine-safety/`
  - `https://laws-lois.justice.gc.ca/eng/acts/C-46/` (Criminal Code)
- Known-dead URLs (do NOT introduce):
  - `https://childrenshealthdefense.ca/dan-hartman-visp/` (404)
  - `https://tenet5.pvsnp.telemetry` (not a URL, it's a NATS subject)
  - Any fabricated `AG 2026 Report 1 para *` style citation

---

## 6. Accessibility

- Every `<img>` must have `alt=""` (decorative) or `alt="…"` (meaningful).
- Every interactive `<button>` or `<a>` acting as a button must have an
  accessible name (visible text or `aria-label`).
- Heading hierarchy must not skip levels (h1 → h2 → h3, not h1 → h3).
- Keyboard focus rings must remain visible; don't apply `outline: 0`
  without an alternative focus style.
- Honour `prefers-reduced-motion`: see the walkthrough animations in
  `js/liril-walkthrough.js` for the pattern (disable animations +
  undo opacity/saturate transitions).
- Colour contrast: text must pass WCAG AA on `--slate-bg` background
  (tested with `--slate-ink` cream on slate).

---

## 7. SEO conventions

- `<title>`: `"Page Title | TENET5"` — TENET5 always suffix.
- `<meta name="description">`: first sentence should state the page's
  factual content; 120-160 chars.
- `og:title` + `og:description`: match page title/description; never
  editorial/rhetorical.
- `og:site_name = "TENET5"`.
- `og:type = "website"` for most pages; `"article"` for dossiers.
- `<link rel="canonical">`: always present; match the production URL.
- `<meta name="dc.source">`: primary sources the page draws from.

---

## 8. Performance conventions

- Keep inline `<style>` blocks short; prefer `style.css` + `style-slate.css`.
- Images: prefer SVG for icons, compressed PNG for screenshots.
- No external-CDN JS libraries unless already imported (inventory:
  Fonts from Google Fonts; NO react/vue/angular; NO d3; NO jQuery).
- Scripts at end of `<body>` or with `defer` attribute.
- Lazy-load images below the fold when practical.

---

## 9. Commit discipline

- One logical change per commit.
- Subject: imperative, present tense, under 72 chars. Example:
  `"vaccine-injury: add VISP international comparative table"`.
- Body: why + what. Reference commits by hash when relevant.
- Co-authored-by tag from the agent that produced the change. Example:
  `Co-Authored-By: Jules <jules@google.com>` or `Co-Authored-By:
  Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- NEVER use `[PHASE N]` prefixes or ABCXYZ codes in commit subjects —
  those were the old pipeline; the new pipeline uses plain English.

---

## 10. The approval gate

Before any Jules PR merges, it is validated against
`tools/jules_review_pr.py` (in the S.L.A.T.E repo). The gate checks:

1. **URL hallucination** — every new `<a href="http…">` must return
   2xx/3xx within 8s; otherwise PR is rejected.
2. **Brand lock** — no change to `nav.js` brand-title, no strip of
   TENET5/LIRIL from `<meta>` tags.
3. **Truth audit** — no introduction of `lawfare`, `weaponized`,
   `the Machine`, or similar banned framings on `my-story.html`,
   `open-letter.html`, or other first-person pages.
4. **Comparison detector** — no addition of other people's personal
   cases to Daniel Perry's first-person pages.
5. **Citation check** — any new numerical claim needs a primary-source
   link within the same paragraph or in a `<small>` tag immediately after.

PRs that fail any gate item are rejected with a specific reason.
PRs that pass all items are queued for Daniel's manual review.

---

## 11. Task shapes Jules should handle well

Good task (atomic, verifiable):
> "On `foreign-influence.html`, add `alt=""` (decorative) or
>  `alt="…"` (meaningful) to every `<img>` currently without one."

Bad task (too vague):
> "Improve the foreign-influence page."

Good task:
> "Replace inline `color: #ef4444;` with `color: var(--slate-critical);`
>  on `corruption-atlas.html` lines 83-91, after `<link rel='stylesheet'
>  href='style-slate.css'>` is added to the `<head>`."

Bad task:
> "Update colours on corruption-atlas.html."

Atomic. Verifiable. Scoped.

---

## 12. If a rule conflicts

If two rules appear to conflict (e.g. brand lock vs. design system
migration), the one with the lower section number wins. Brand lock
(section 2) beats design system migration (section 4). Truth
discipline (section 3) beats everything else.

If a task you were assigned would require violating a rule, abort the
task and say so. Do not try to reinterpret the rule.

---

*Generated 2026-04-19 by claude_code. Updated whenever a rule changes.*
