# TENET5 Objectivity & News Doctrine (homepage + swarm)

**Goal:** the strongest Canadian government-analysis and investigative news site —
competitive with think tanks and national outlets — with **0 to near-0 political bias**.

## Time continuum (home structure)
Time is product architecture, not decoration:

| Tick | Home surface |
|------|----------------|
| Second / minute | Live submarine dial + dateline (ET) |
| Hour | `#now` — TENET5 desk wire + multi-source RSS |
| Day | `#newsdesk` — briefing, investigations, argument, MAID |
| Week | `#week` — active investigations |
| Month | `#month` — claim vs public record |
| Year | `#year` — case files / dossiers |
| Era | `#era` — deep record |

The **submarine dial** is the horizontal instrument: needle tracks scroll chapter; seconds tick.

## Epistemic labels (never collapse)
| Label | Meaning |
|-------|---------|
| **STATED** | Government or primary document said it |
| **INFERRED** | TENET5 analysis — labeled as such |
| **EXTERNAL SOURCE** | RSS / third-party reporting — **not** a TENET5 verdict |
| **VERIFIED** | Multi-source or primary table checked |

## RSS swarm rules
1. Ingest **multi-source** Canadian + global feeds (`nemoclaw_news_scanner.py`).
2. Rebuild `data/home_wire.json` (`build_rss_home_wire.py`) every scan / site duty.
3. Cap per-source rows; down-weight pure opinion rhetoric.
4. Home shows external wire **beside** TENET5 desk — never mixed as one voice.
5. Case claims (MAID / genocide frame) require **primary docs**, not RSS alone.

## Article quality bar (think-tank grade)
- Open with **what is known** and **what is not**.
- Every quantitative claim cites a table, statute, Hansard, or agency report.
- Opposing institutional statements appear when they exist.
- No team-sport language; no conspiracy keywords as relevance fuel.
- Atmosphere film is **not** evidence.

## AI desk article generation (news website product)
Pipeline owned by PRISM site duty:

1. `build_rss_home_wire.py` — multi-source hour wire  
2. `build_liril_news_articles.py` — briefing + wire → `content/posts/*-desk-*.json`  
   + catalog `data/liril_news_articles.json`  
3. `build_liril_news_presentation.py` — LIRIL anchor script (site + today + AI package)  
4. `press.py` — renders `story/*.html` + homepage chapters  

Hard rules for the generator:
- **No invented facts** — only restructure labeled STATED/INFERRED inputs from briefing/wire.
- Every post needs source URLs (anti-fabrication; same as press_agent validate).
- TENET5 features vs EXTERNAL SOURCE wire notes never share one voice.
- Public brand only: **Powered by LIRIL AI**.

## LIRIL desk reporter (AI persona)
Public product: LIRIL is a **desk reporter** who reads the news to visitors as time moves.

| Asset | Role |
|-------|------|
| `data/liril_reporter_persona.json` | Voice posture, sign-on/off, live copy, poll intervals |
| `js/liril-reporter.js` | Live rebuild from briefing + wire; continuous poll; bulletins |
| `js/liril-home-guide.js` (v9+) | UI: Guide me + **Listen live**; ON AIR pill; ET clock |

Rules:
- Rebuild presentation **client-side** from latest JSON so the package is never stale to the clock.
- **Listen live** polls `home_wire` / briefing on an interval; new EXTERNAL SOURCE items are read as bulletins.
- After a full package, live mode stays open so the news **keeps arriving**.
- Never invent facts; only restructure labeled inputs.
- Voice: British female neural via `liril-voice.js` (existing hard rule).

## LIRIL front-page news presentation
- Card: `#liril-presentation` — "What is going on today" + AI rundown + ON AIR / Listen live.
- Beats: sign-on as reporter → time spine → lead (with ET clock) → AI package → desk files → external wire → live handoff.
- **Guide me** = full package. **Listen live** = package + continuous wire.

## Brand
- Public AI line only: **Powered by LIRIL AI**
- No hardware, ports, model files, or swarm internals on public pages.

## Swarm flags
- `.prism_website_first=forever`
- Site duty: `rss_home_wire` → `liril_news_articles` → `liril_news_presentation` → `press_rebuild`
- Manual: `python tools/nemoclaw_news_scanner.py` then articles → presentation → `python tools/press.py`
