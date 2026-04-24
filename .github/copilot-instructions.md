# TENET5 — Copilot Working Instructions

Repository: `TENET-5/TENET-5.github.io` (GitHub Pages OSINT/accountability site).

## Identity & Scope

- This is the **TENET5** accountability/OSINT publishing site. It is the only
  public-facing project and the only active web property.
- Voice: clinical, institutional, defense-grade operational-intelligence.
  Sentence-case headlines. ALL-CAPS, tracked-wide eyebrows and UI labels.
- Do NOT mention or reference any external design source, brand, agency,
  award, or template by name in code, comments, commit messages, or
  filenames. Describe the aesthetic in TENET5's own terms.
- No game-development work. No multi-user/distribution proposals. The
  system is local-first and private.

## Repository Layout

```
/                        GitHub Pages root; /index.html is what the world sees
index.html               Real served homepage (Cap#160-era standalone shell)
home.html                Newsroom shell (loads css/liril-theme.css)
css/
  liril-theme.css        Top-of-chain theme. @imports the slates.
  slates/
    monochrome.css       Base monochrome tokens (loaded first)
    ops.css              Operational slate — palette/type/layout tokens
    motion.css           Motion vocabulary (.s5-* classes)
    chapter.css          Chapter-page overrides
js/
  motion.js              Motion driver (IntersectionObserver + rAF + nav scroll)
  liril-narrate.js       Web Speech narration
  tenet5-status-ribbon.js  Hero binary status ribbon
  experience/main.js     XR/scroll experience
evidence/                Primary-source documents
data/                    Network analysis JSON, OSINT datasets
```

## Conventions

### Naming
- CSS namespace `.s5-*` is the motion/operational primitive namespace.
  Keep using it; do not rename in bulk (high blast radius).
- File basenames must be neutral and descriptive
  (`motion.css`, `ops.css`, `motion.js` — never named after an external brand).

### Cache busting
- Bump `?v=N` on `<script>` and `<link>` whenever shipping a behaviour
  or style change. GitHub Pages CDN is ~60s.

### Commit messages
- Format: `Cap#NNN: <imperative summary>`
- One blank line, then optional bullet body.
- Never name external brands in commit messages.
- Capnumbers are monotonic across the project — read recent `git log`
  before choosing the next.

### Push pattern (watcher daemons rebase aggressively)
```pwsh
git fetch origin main
git rebase --autostash origin/main
git push origin main
```
CRLF warnings are normal noise. Many `M js/*.js` entries are CRLF
normalization artifacts, not real edits.

## Editing rules for AI assistants

1. **Read before editing.** Watcher commits may have moved or rewritten
   anything since the last interaction.
2. **Resolve rebase conflicts cleanly.** Never commit files containing
   `<<<<<<<`/`=======`/`>>>>>>>` markers. Always grep the working tree
   for these after a rebase.
3. **No external-brand references.** When neutralising legacy comments,
   use TENET5-native phrasing.
4. **Animation layer.** `motion.js` boots on `DOMContentLoaded`. It is
   defensively wrapped — every `init*` call is in a try/catch. Add new
   init steps to `boot()` and keep them no-op-safe.
5. **Nav.** `header.t5-nav` is fixed-position, transparent at top,
   solid+blurred when `.is-scrolled` is added by `motion.js`. Body has
   `padding-top: 58px` to compensate.
6. **Reduced motion.** Always honour `prefers-reduced-motion: reduce`.

## Hard limits

- No Ollama, no OpenAI-first framing. TENET5 inference is TENET5-native
  (NemoClaw / LIRIL stack).
- No game development of any kind.
- No public-distribution / multi-user features unless explicitly asked.
