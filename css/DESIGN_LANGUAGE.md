# TENET5 Design Language

**Source of truth (visual):** `index.html` — *The record, read backwards.*  
**Theme CSS (tokens + chrome + media templates):** `css/press-theme.css`  
**Interior taste lock (last cascade):** `css/design-lock.css` — do not edit for thrash; change doctrine here first.  
**Machine contract:** `css/QUANTANIUM.json` + `css/PRESS_THEME_QUANTUM_CONTRACT.json`

## Awwwards research (2026-07-11) — adopt / reject

Curated against [Awwwards storytelling](https://www.awwwards.com/awwwards/collections/storytelling/), [black / dark mode](https://www.awwwards.com/websites/black/), [magazine-newspaper](https://www.awwwards.com/websites/magazine-newspaper-blog/), and memorial SOTDs (e.g. [The Armenian Genocide](https://www.awwwards.com/sites/the-armenian-genocide), Sakharov Space, Into the Storm–class docs).  
**Bar:** ProPublica / Foreign Affairs restraint — award craft without cyber cosplay.

### ADOPT (maps to TENET5)

| Pattern | Why it wins on Awwwards | TENET5 application |
|---------|-------------------------|-------------------|
| **Video as b-roll under type** | Film supports narrative; text stays king | Fixed page film + hero player; muted/loop; “Film playing” badge |
| **Chaptered scroll story** | Acts/beats, not infinite gimmick | Five-act argument + continuum cards |
| **Editorial type hierarchy** | Display + mono meta | Fraunces titles · IBM Plex Mono kickers |
| **Dark void + sparse accent** | Black collections / dark mode elegance | `--void` / ivory ladder / ice labels only |
| **Memorial tone over spectacle** | Non-commercial cultural SOTDs | No WebGL trauma porn; atmosphere ≠ proof |
| **Honest media presence** | Fullscreen video *readable* | No pure-black LTX; YAVG gate on bg clips |
| **Primary path clear** | Storytelling collections reward orientation | argument hub → acts → Health Canada / Hansard |

### REJECT (Awwwards glitter that fails our law)

| Pattern | Why |
|---------|-----|
| Neon HUD / cyber grids / matrix | Instant taste fail (public doctrine) |
| WebGL for its own sake | Competes with the record |
| Horizontal infinite gimmick scroll as default | Breaks LIRIL read + accessibility |
| Face-forward stock emotion | FILM_DIRECTOR_SPEC: empty institutions only |
| Share/social chrome | Retired; newsroom not growth-hack |
| Page-local palettes / cyan accents | Tokens only |

### Reference links (research, not endorsement)

- Storytelling collection: https://www.awwwards.com/awwwards/collections/storytelling/  
- Armenian Genocide SOTD (cultural memorial): https://www.awwwards.com/sites/the-armenian-genocide  
- Magazine / newspaper: https://www.awwwards.com/websites/magazine-newspaper-blog/  
- Black / dark: https://www.awwwards.com/websites/black/  
- Sites of the Year index: https://www.awwwards.com/websites/sites_of_the_year/  

### Next craft bets (small, measured)

1. Keep **hero film player** visible on every act (already shipping).  
2. Prefer **bright `media/film/*`** over crushed bg encodes (YAVG check).  
3. Optional later: scroll chapter progress on acts only — mono ice, no neon.

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
| `.act-cinema-page` + `.act-page-bg` / `.act-page-fg` | Genocide-argument acts: fixed LTX bg + forward vignette |
| `.act-cinema-host` / walkthrough `still`+`video` | Per-scene media in `data/scenes/act-*.json` |
| `.act-gallery` / `.act-continuum` | Evidence boards + next-act cards |

**Act cinema stack (intelligent media):**

1. **Page bg** — `media/backgrounds/*_bg.mp4` (LTX), veiled for readability  
2. **Page fg** — soft corner vignette (`media/film/*`) — atmosphere only  
3. **Stage** — `TENET5UnifiedWalkthrough` v3: each scene `still` + optional `video` + chart fg when path matches charts/generated  
4. **Gallery** — `.media-card` stills/charts/film cells → case files  
5. **Continuum** — acts II–V as media cards  

Atmosphere film is **not** proof. Hansard, statutes, and Health Canada reports are.

### Media relevance law (hard)

Every still, LTX clip, and chart must match the **claim beside it**. No orphan scandal art.

| Subject | Prefer | Never use for |
|---------|--------|----------------|
| **Statute / intent / Hansard** | `parliament_ice`, `hall_of_record`, `empty_committee`, `flag_wind` | Phoenix Pay, ArriveCAN, offshore |
| **Clinical MAID / Track 2 / care denied** | `hospital_corridor`, `corridor_power`, `maid_investigation` (+ bg) | procurement_binders, lobbying packshots |
| **Volume / provisions** | `img/charts/maid_trajectory.png` only | immigration velocity as “Track 2” |
| **Poverty / material deprivation** | `ledger_desk`, `ledger_turn`, `generational_attrition` | phoenix_pay, fintrac, panama |
| **Housing / isolation** | `hospital_corridor`, corridor film, housing case links | demographic_velocity unless caption says intake capacity |
| **Veterans / VAC / service** | `cfnis_military` (+ bg), committee + flag | ethics_violations packshot as default |
| **Palliative gap** | hospital corridor + maid investigation | paper trail alone without clinical poster |
| **Foreign interference / money** | `foreign_interference`, `lobbying_concentration`, panama | MAID hospital stills |

**Continuum cards:** fixed identity map — I parliament · II hospital · III committee · IV ledger · V parliament/flag.  
**Alt text:** never empty on continuum/gallery stills — name subject + act.

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
