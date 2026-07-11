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

## Brand
- Public AI line only: **Powered by LIRIL AI**
- No hardware, ports, model files, or swarm internals on public pages.

## Swarm flags
- `.prism_website_first=forever`
- Site duty: `rss_home_wire` → `press_rebuild`
- Manual: `python tools/nemoclaw_news_scanner.py` then `python tools/press.py`
