# Publisher pack — expanded briefings, analysis, mermaid graphs

**For Claude (publisher)** · 2026-07-11  
**Taste:** Quantanium press — ice / void / glass. Newsroom English. One figure per fold. No cyber HUD, no neon, no “MODULE 01”.

---

## What Grok filed (analysis lane)

| Asset | Path | Use |
|-------|------|-----|
| Expanded briefing | `data/intelligence_briefs/defence_cluster_expanded_briefing_20260711.md` | Long-form desk brief; already embeds mermaid |
| Mermaid library | `data/analysis/defence_cluster_mermaid.md` | Six figures + captions + claim legend |
| Network graph JSON | `data/analysis/defence_cluster_network.json` | 20 nodes / 18 edges; FACT vs REPORTING |
| Data science summary | `data/analysis/defence_cluster_datascience_last.json` | Compression + transparency indices (labeled INFERENCE) |
| Press posts | `content/posts/2026-07-11-*.json` | 2 wire · 2 feature · 1 dossier (sourced, no sample flag) |
| Lap4 ship tables | `data/osint_laps/publisher_content_pack_defence_lap4_2026-07-11.md` | Page-level FACT lines |

---

## Publish sequence (you own)

1. `press.py` / `press_agent.py build` — ingest new `content/posts/`  
2. Optionally render a long-form story page from the expanded briefing (or link dossier to `griffon-glle-procurement.html` until hub exists)  
3. If embedding mermaid on HTML: load a single mermaid runtime once; style with press-theme tokens only (no page-local palette)  
4. `apply_one_theme.py` · `prism_site_duty` → SITE_DUTY_PASS  
5. Surgical commit of **publishable** paths only (not raw pipeline JSONs with internals)  
6. Push → **live browser scroll verify**

### What not to commit publicly without scrub

- Anything under gitignored AI/pipeline paths that names engines, ports, models  
- Datascience “compression index” is fine if captioned as analytical heuristic  
- Prefer shipping mermaid as static SVG later if mermaid JS is too heavy — same graph geometry

---

## Mermaid embed (elegant)

```html
<figure class="press-figure">
  <pre class="mermaid">…diagram…</pre>
  <figcaption>Solid edges: FACT. Dashed: REPORTING. Sources in machine network JSON.</figcaption>
</figure>
```

- Max **one** diagram above the fold  
- Caption always includes claim legend  
- Prefer overview graph on cluster hub; instrument chain on Griffon page; timeline on submarine page  

---

## Suggested page placement

| Page | Graph |
|------|--------|
| New cluster hub or dossier | Overview four-mode flowchart |
| `griffon-glle-procurement.html` | GLLE instrument chain + open.canada gap |
| Submarine / CPSP | Timeline mermaid |
| Arctic / OTHR | Money-and-partners flowchart |
| AEWC if page exists | Preferred-supplier surface |

---

## Evidence shelf candidates

Add to `content/evidence.json` when you rebuild shelf:

- CanadaBuys W8475-205391/001/BF  
- DCB project 2526  
- DIA CPSP + A-OTHR + AEWC releases  
- Network dataset path (derived): `data/analysis/defence_cluster_network.json`

---

## Seal

Analysis + graphs + press posts ready. **Claude publishes.** Live verify required before DONE.
