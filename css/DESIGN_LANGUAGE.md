# TENET5 Design Language

**Source of truth (visual):** `index.html` — *The record, read backwards.*  
**Theme CSS (tokens + chrome + media templates):** `css/press-theme.css`  
**Interior taste lock (last cascade):** `css/design-lock.css` — do not edit for thrash; change doctrine here first.  
**Machine contract:** `css/QUANTANIUM.json` + `css/PRESS_THEME_QUANTUM_CONTRACT.json`

## Palette law (ice lake)

| Token | Role |
|-------|------|
| `--void` / `--ink` | Backgrounds |
| `--ivory` / `--ivory-dim` / `--ivory-faint` | Content text ladder |
| `--ice` / `--ice-deep` | Labels, links, LIRIL signal |
| `--red` | CRITICAL only (thesis charge, alert) |
| Gold | Severity / data only — never body ink |

**White top-glint** beats colored glow. **No** neon cyan HUD, matrix grids, or cyber chrome.

## Type

- **Serif:** Fraunces — titles, body  
- **Mono:** IBM Plex Mono — kickers, meta, stamps  
- Kickers: `.kick` — mono, uppercase, wide tracking, ice  

## Chrome (every public page)

1. Fonts + `css/press-theme.css?v=N`  
2. Interiors: also `css/design-lock.css?v=N` (loads last)  
3. `header.press-bar` · `main.press-main` · `footer.press-foot` · LIRIL `#dock`  
4. Homepage only: cover + chapters (not `press-interior`)

## Visual media template (sitewide)

Use **theme classes**, not page-local `:root` or palette CSS.

```html
<div class="media-grid media-grid-2">
  <article class="media-card glass">
    <div class="media-frame">
      <img src="img/charts/…" alt="…" width="800" height="500" loading="lazy">
    </div>
    <div class="media-body">
      <span class="kick">01 · label</span>
      <h3>Title</h3>
      <p>Caption in newsroom English. Source ends in a file.</p>
      <a class="media-more" href="case-file.html">Open file →</a>
    </div>
  </article>
</div>
```

| Class | Use |
|-------|-----|
| `.media-grid` + `-2`/`-3`/`-4` | Responsive boards |
| `.media-card.glass` | Chart / still / poster card |
| `.media-frame` / `.is-cine` | Image or video crop (16/10 or 16/9) |
| `.media-body` / `.media-more` | Caption stack + link |
| `.media-note` | Labeled interpretation (honest limits) |
| `.media-hero` | Copy + still split (thesis pattern) |
| `.scale-grid` / `.scale-tile` | Metric tiles |
| `.dossier-media` / `.dossier-thumb` | Year case rows with stills |
| `.home-broll` / `.cinema-cell` | LTX atmosphere (home + film pages) |

**Tokens:** `--media-pane`, `--media-glint`, `--media-blur`, `--media-img-filter`, `--media-radius`, etc. in `:root` of `press-theme.css`.

### Home vs interior

| Surface | Optics |
|---------|--------|
| **Home** (`index.html`) | Full glass blur + white glint + deep shadow |
| **Interior** (`body.press-interior`) | Flat mono pane (design-lock); structure + image stills stay |

## Hard bans (public)

- Page-local `:root` inventing cyan/magenta  
- JetBrains / display gimmick fonts on product pages  
- Share bars, crest heraldry  
- Internals: ports, models, paths, engine names  
- Declaring done without opening the live URL  

## Ship checklist

1. Edit `press-theme.css` only for look (bump `THEME_VER` in `tools/apply_one_theme.py`).  
2. Prefer `.media-*` over new page CSS.  
3. Interiors: no palette in `<style>` — layout only if needed.  
4. Grep IP ban before push.  
5. Verify live page after deploy.
