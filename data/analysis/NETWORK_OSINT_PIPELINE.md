# Network OSINT pipeline — TENET5 site

## Purpose
Feed the public **network-analysis.html** board from real OSINT vault scrapes,
appointment graphs, defence freezes, and the curated foreign-influence board —
without dumping mega-graphs (hundreds of thousands of donor edges) onto the page.

## Build
```text
python tools/build_network_osint_board.py
```
Prefer the site venv / uv python; windowless on Windows (`pythonw` + TENET5_SILENT=1).

## Inputs (auto-detected)
| Path | Role |
|------|------|
| `data/investigation_board.json` | Curated FI board |
| `data/entities.json` + `data/edges.json` | FACT appointment edges |
| `data/analysis/defence_cluster_network.json` | Defence instruments |
| `data/osint_entity_registry.json` | Entity disambiguation |
| `data/osint_vault/cbc_public_osint_last.json` | CBC public HTTP OSINT |
| `data/osint_vault/*osint*.json` | Vault harvests (CFNIS, MPs, …) |
| `data/osint_scrapes/**/*.json` | X / Facebook / Bluesky public scrapes |

## Outputs
| Path | Role |
|------|------|
| `data/network_osint_board.json` | Page format: `nodes` + `threads` |
| `data/analysis/network_osint_build_last.json` | Proof (counts, sources) |

## Filters
- Drops punctuation-only / EC “contributions of $200 or less” aggregates
- Caps public board (~160 nodes) keeping FACT appointment + defence nodes
- Soft-caps detail text for newsroom inspector

## Page wiring
`network-analysis.html` tabs:
1. **OSINT composite** → `data/network_osint_board.json` (default when present)
2. **Foreign-influence** → `data/investigation_board.json`
3. **Defence instruments** → `data/analysis/defence_cluster_network.json` (+ inline fallback)

## Refresh after scrapers
1. Run site OSINT scrapers / `gov_osint_gatherer` / CBC public OSINT as usual  
2. `python tools/build_network_osint_board.py`  
   — **also runs automatically** inside `tools/prism_site_duty.py` as step `network_osint_board`  
3. Claude: theme/duty → commit `network-analysis.html` + `data/network_osint_board.json` if published  
4. Live verify network page  

## Last proof
See `data/analysis/network_osint_build_last.json` (`NETWORK_OSINT_BOARD_BUILT`, node/edge counts, source list).

## Do not
- Ship raw `data/network_analysis/influence_network.json` (1181n / 479k edges) to the public UI  
- Treat centrality as guilt  
- Sum dollar classes across defence instruments  
