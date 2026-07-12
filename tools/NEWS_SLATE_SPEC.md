# TENET5 NEWS SLATE SPEC (raised — 2026-07-12)

**Owner:** `tools/prism_news_slate.py` · site duty job `news_slate_rectify`  
**Temple lock:** `tools/prism_temple_slate_lock.py` + `css/press-theme.css`  
**Main ticker:** `tools/broadcast_ticker_slate.py` · `data/broadcast_ticker_slate.json`  
**Proof:** `data/news_slate_registry.json` · `data/news_slate_rectify_last.json` · `C:\PRISM\log\news_slate_rectify_last.json`

---

## Doctrine (Daniel)

1. **One main slate** — the broadcast ticker. It is LIVE desk segments only.
2. **Every article type and every chart type lives OFF the main slate** — separate product surfaces, separate JSON, separate HTML lanes.
3. **All slates sync to the Temple** — press-theme tokens + THEME_VER + design-lock. No Red Ensign / product.css / second palette.
4. **Data is rectified and sorted** before any public consumer reads it (wire, hub, OSINT board, ticker).
5. **Desync = hallucination** — ticker hash drift, theme drift, or article/chart bleed into main bits.

---

## Slate topology

| Slate ID | Role | On main ticker? | Canonical path |
|----------|------|-----------------|----------------|
| `main.broadcast_ticker` | LIVE segment crawl (web + video burn-in) | **YES — only this** | `data/broadcast_ticker_slate.json` |
| `news.wire` | External RSS continuum (hour/day/…) | NO | `data/home_wire.json` |
| `news.feed` | Raw RSS index (scraped) | NO | `data/news_feed.json` |
| `news.headlines` | Desk headline cache | NO | `data/news/headlines.json` |
| `news.articles` | LIRIL desk packages (feature / wire_note) | NO | `data/liril_news_articles.json` |
| `news.package` | Story HTML product type | NO | `templates/news.package.html` · `story/*` |
| `investigation.press_file` | Long-form dossier type | NO | `templates/investigation.press-file.html` |
| `case.act` | Five-act case type | NO | `templates/case.act.html` |
| `evidence.shelf` | Primary-source shelf type | NO | `templates/evidence.shelf.html` |
| `hub.lane` | Lane hub catalog type | NO | `templates/hub.lane.html` |
| `osint.network_board` | Composite network graph | NO | `data/network_osint_board.json` |
| `osint.alert_feed` | Anomaly / FIIS alerts | NO | `data/osint_alert_feed.json` |
| `osint.scrapes` | Scrape vault + tags | NO | `data/osint_scrapes/**` · `data/osint_vault/**` |
| `chart.metrics` | nr-metrics / scale boards | NO | page-local press-file bands |
| `chart.trajectory` | Trajectory / time-series charts | NO | `tools/generate_trajectory_charts.py` outputs |
| `chart.network` | Network visualizations | NO | OSINT board consumers |
| `chart.desk_svg` | Desk SVG art | NO | `tools/prism_desk_svg_art.py` |
| `audio.slate` | VO / BGM / mux gates | NO | `tools/prism_audio_slate.py` |
| `video.slate` | Film / desk mux gates | NO | `tools/prism_video_slate.py` |
| `seo.slate` | SEO / AI Overview surface | NO | `tools/prism_site_seo_slate.py` |
| `media.format` | Media format gates | NO | `tools/prism_site_media_format_slate.py` |
| `temple.tokens` | Theme / SLATE alias kernel | ALL consume | `css/press-theme.css` · temple lock |

---

## Main slate — ALLOWED only

```
SEG NN DESK: title-clip
LIVE · TIME NAV · TOPIC NAV · TENET5
```

Hard bans on main bits / unit_line:

| Banned class | Examples |
|--------------|----------|
| Article types | `feature`, `wire_note`, `news.package`, `investigation.press-file`, `case.act`, `evidence.shelf` |
| Chart types | `chart:`, `nr-metrics`, `trajectory`, `network-graph`, `svg-art`, `FACT table as ticker` |
| Taxonomy dump | Full IA lane lists, template ids, desk dialect enums |
| External RSS body | Wire summaries, source URLs, relevance scores |

Wire and articles may **feed segment titles** into the ticker builder only as cleaned `desk` + `title` — never as typed product rows.

---

## Article types (off-main)

| Type key | Lane | Template / product |
|----------|------|--------------------|
| `feature` | news | LIRIL desk feature → `story/desk-*.html` |
| `wire_note` | news | Short wire note |
| `daily_package` | news | Day package (`is_daily_package`) |
| `briefing` | news | `daily-briefing.html` cycle |
| `wire_external` | news | RSS item on home wire (labeled EXTERNAL) |
| `investigation` | investigations | `investigation.press-file` |
| `case_act` | case | `case.act` |
| `evidence_item` | evidence | `evidence.shelf` |
| `hub` | any hub | `hub.lane` |

---

## Chart types (off-main)

| Type key | Surface | Never on ticker |
|----------|---------|-----------------|
| `metrics` | `.nr-metrics` / scale band | yes |
| `table_fact` | FACT table | yes |
| `trajectory` | trajectory chart assets | yes |
| `network` | OSINT network board | yes |
| `desk_svg` | desk SVG package | yes |
| `timeline` | chrono bands | yes |

---

## Rectify + sort contract

`prism_news_slate.py rectify`:

1. Load all known slate sources.
2. Classify each record → article type / chart type / main-eligible segment / osint.
3. **Sort** wire by `rank_score` desc, then date desc; articles by type then domain; OSINT nodes by claim_level then label.
4. **Reject** main-ticker pollution (exit non-zero if bit contains banned tokens).
5. Stamp temple: `theme_ver`, token hash from temple lock when present.
6. Write `data/news_slate_registry.json` + proof JSON.

---

## Temple sync

Every slate consumer must:

- Use press tokens only (`--slate-*` aliases press anchors).
- Match `THEME_VER` from `apply_one_theme.py`.
- Pass `prism_temple_slate_lock` and (when run) `slate_cohesion_gate` K==N.

`data/slate_manifest.json` is **not** a second design system — it points at Temple press theme only. Red Ensign / Playfair / Inter is retired.

---

## Site duty / PRISM jobs

| Job | Trigger |
|-----|---------|
| `news_slate_rectify` | every site duty lap |
| `rss_home_wire` + scanner `--scan` | every 4th lap or force flag |
| `network_osint_board` | every lap |
| `temple_slate_lock` | every lap |
| OSINT scrape queue | `data/.prism_osint_scrape` / investigation scrape flags |

---

## Instant fail

- Article type keys in `broadcast_ticker_slate.bits`
- Chart type labels in unit_line
- Shipping wire as TENET5 verdict
- Declaring slates synced without registry proof + temple_ver stamp
- Updating `slate_manifest` theme to anything but press temple
