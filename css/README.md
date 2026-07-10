# css/ — TENET5 QUANTANIUM design system

**Canonical source of truth:** [`tokens.css`](./tokens.css)  
**Machine-readable mirror:** [`QUANTANIUM.json`](./QUANTANIUM.json)  
**Active palette:** `pristine-ice-lake` (crystal ice over water with no bottom)  
**Contract name:** QUANTANIUM · **CSS prefix:** `--slate-*` (+ `--quantanium-*` for pipeline badges)

---

## If you are an AI agent about to edit CSS — read this first

1. Open [`tokens.css`](./tokens.css). Read the §STOP banner. Do not skip it.
2. Check [`QUANTANIUM.json`](./QUANTANIUM.json). Those rules are non-negotiable.
3. **Do not** add a `:root{}` block with **new hex palette values** to any other file.
4. Feature CSS may only **forward** aliases: `--osint-bg: var(--slate-bg)`.
5. **Do not** invent a new namespace prefix. Canonical: `--slate-*`. Pipeline badges: `--quantanium-*`.
6. Legacy files (`slate-tokens.css`, `brand-lock.css`, `slates/ops.css`) are **shims** — they re-assert or forward QUANTANIUM. Do not resurrect mid-tone brass / oxblood / gold-chrome / neon.
7. After editing `tokens.css`, recompute sha256 into `QUANTANIUM.json` → `canonical_source.sha256`.

---

## Why QUANTANIUM is the mature theme

The site accumulated conflicting `:root` namespaces (oxblood → red-ensign → mid-tone brass → monochrome gold → ice). Every AI session that “fixed” one layer broke another.

**QUANTANIUM maturity is the contract, not a single hex:**

| Pillar | What it enforces |
|--------|------------------|
| Single token file | `tokens.css` only defines palette |
| Machine mirror | `QUANTANIUM.json` with values + rules |
| Fixed cascade | tokens → style → feature → inline_generated |
| Two-font lock | Atkinson Hyperlegible + IBM Plex Mono |
| Chrome vs data | Chrome is crystalline ice; colour only for DATA semantics |
| Defense layers | brand-lock re-asserts same values last — no second palette |

Beauty target (palette values may evolve under the same names):

> Crystal-clear frozen ice over a lake — looking into water with no bottom.

Surfaces: abyss `#02040a` · body `#05080d` · ice sheet `#0c1219` · chrome `#eef6fa` · ink `#f5fafc`.

---

## Cascade load order (fixed)

```
1. /css/tokens.css           ← QUANTANIUM canonical tokens
2. /style.css                ← reset + layout primitives
3. /css/<feature>.css        ← feature layers (forward-only)
4. /css/inline_generated.css ← CI rules LAST
5. brand-lock (via tenet5.css chain) re-asserts QUANTANIUM !important
```

---

## File-by-file role

| File | Role | Defines palette hex? |
| ---- | ---- | -------------------- |
| `tokens.css` | **Canonical QUANTANIUM contract** | ✅ ONLY HERE |
| `QUANTANIUM.json` | Machine mirror + agent rules | values documented |
| `brand-lock.css` | Final re-assert of same tokens | re-assert only |
| `slate-tokens.css` | Legacy import shim | forward / fallback only |
| `slates/ops.css` | Op/Intelligence component classes | ❌ forwards `--s5-*` → `--slate-*` |
| `slates/monochrome.css` | data-slate opt-in | ❌ forwards |
| `osint-dashboard.css` | Dashboard layout | ❌ `--osint-*` → `--slate-*` |
| `polish.css` | Glass / motion polish | ❌ |
| `liril-theme.css` | Theme shell + slate chain | ❌ |

---

## Glossary

- `--slate-bg / -raised / -sunken / -overlay / -abyss` — surface tiers (ice lake)
- `--slate-ink / -ink-strong / -ink-dim / -ink-muted / -ink-faint` — text
- `--slate-accent / -link` — crystalline chrome (not gold)
- `--slate-critical / -verified / -warning / -info / -quantum` — DATA only
- `--slate-ice-edge / -ice-skin / -depth-glow` — frost utilities
- `--quantanium-*` — pipeline status badges
- `--slate-font-sans / -mono` — two-font lock
