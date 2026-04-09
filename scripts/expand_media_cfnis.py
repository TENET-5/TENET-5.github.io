# Expand network: Media concentration + CFNIS/Afghan detainee
# Modified: 2026-04-09 | Author: claude_code
import json
from pathlib import Path

DATA = Path(__file__).parent.parent / "data" / "network_analysis" / "influence_network.json"
with open(DATA, "r", encoding="utf-8") as f:
    data = json.load(f)

existing_ids = {n["id"] for n in data["nodes"]}
existing_edges = {(e["source"], e["target"]) for e in data["edges"]}
na = 0; ea = 0

def add_node(n):
    global na
    if n["id"] not in existing_ids:
        data["nodes"].append(n); existing_ids.add(n["id"]); na += 1

def add_edge(s, t, c, w=1):
    global ea
    if (s,t) not in existing_edges and (t,s) not in existing_edges and s in existing_ids and t in existing_ids:
        data["edges"].append({"source": s, "target": t, "shared_categories": c, "weight": w})
        existing_edges.add((s,t)); ea += 1

# ═══ MEDIA OWNERSHIP / CONCENTRATION ═══
add_node({"id": "postmedia_network", "label": "Postmedia Network", "influence_score": 55.0,
    "categories": ["media", "financial_vector"], "source_count": 3, "type": "org",
    "subtitle": "Controls 15+ major Canadian dailies — 66% owned by US hedge fund",
    "detail": "Chatham Asset Management (US) owns 66%. Controls National Post, Ottawa Citizen, Calgary Herald, Vancouver Sun, etc. Directed all 16 dailies to endorse Harper in 2015."})

add_node({"id": "chatham_asset_mgmt", "label": "Chatham Asset Management", "influence_score": 40.0,
    "categories": ["media", "financial_vector"], "source_count": 2, "type": "org",
    "subtitle": "US hedge fund — 66% owner of Postmedia",
    "detail": "New Jersey-based hedge fund. Foreign ownership of Canadian newspapers unrestricted (unlike broadcasting). Controls editorial direction of 15+ dailies."})

add_node({"id": "bell_media", "label": "Bell Media (BCE)", "influence_score": 50.0,
    "categories": ["media", "financial_vector"], "source_count": 3, "type": "org",
    "subtitle": "CTV, CP24, BNN — part of Big Three telecom oligopoly",
    "detail": "Subsidiary of BCE Inc. Big Three (Bell/Rogers/Telus) control 89.7% of mobile revenue. Media arm runs CTV network, CP24, BNN Bloomberg."})

add_node({"id": "rogers_media", "label": "Rogers Communications", "influence_score": 50.0,
    "categories": ["media", "financial_vector"], "source_count": 3, "type": "org",
    "subtitle": "$26B Shaw acquisition — Citytv, Sportsnet",
    "detail": "Completed $26B Shaw acquisition 2023. Runs Citytv, Sportsnet, plus wireless/cable monopoly. Big Three oligopoly member."})

add_node({"id": "cbc_media", "label": "CBC / Radio-Canada", "influence_score": 45.0,
    "categories": ["media"], "source_count": 3, "type": "org",
    "subtitle": "Government-funded national broadcaster",
    "detail": "Publicly funded by federal government. Rated left-center bias. Receives $1.2B+ annual parliamentary appropriation. Eligible for additional QCJO tax credits."})

add_node({"id": "media_subsidies", "label": "Federal Media Subsidies (QCJO)", "influence_score": 40.0,
    "categories": ["media", "financial_vector"], "source_count": 2, "type": "event",
    "subtitle": "Government payroll subsidies + tax credits for 'qualified' media",
    "detail": "Bill C-30 (2021) created labour tax credit. Independent board designates Qualified Canadian Journalism Organizations. Creates financial dependency between media and government."})

# ═══ CFNIS / AFGHAN DETAINEE ═══
add_node({"id": "afghan_detainee_scandal", "label": "Afghan Detainee Scandal", "influence_score": 55.0,
    "categories": ["cfnis", "osint_target"], "source_count": 4, "type": "event",
    "subtitle": "Canadian Forces transferred detainees to known torture",
    "detail": "Richard Colvin testified 'likelihood is that all Afghans we handed over were tortured.' CFNIS investigated allegations. Military police complaints filed."})

add_node({"id": "richard_colvin", "label": "Richard Colvin", "influence_score": 45.0,
    "categories": ["cfnis", "osint_target"], "source_count": 3, "type": "person",
    "subtitle": "Diplomat — blew whistle on Afghan detainee torture transfers",
    "detail": "Testified Nov 2009 that all Afghan detainees transferred by Canada were likely tortured. Standard operating procedure for Kandahar interrogators."})

add_node({"id": "cfnis_org", "label": "CFNIS (Canadian Forces National Investigation Service)", "influence_score": 45.0,
    "categories": ["cfnis", "osint_target"], "source_count": 2, "type": "org",
    "subtitle": "Military police investigative arm",
    "detail": "Investigates all allegations of Afghan detainee mistreatment in Canadian Forces custody. Anonymous complaints filed about prisoner abuse at Kandahar Airfield (2010-2011)."})

# ═══ EDGES ═══
# Media ownership cluster
add_edge("postmedia_network", "chatham_asset_mgmt", ["media", "financial_vector"], 3)
add_edge("media_subsidies", "postmedia_network", ["media", "financial_vector"], 2)
add_edge("media_subsidies", "bell_media", ["media", "financial_vector"], 2)
add_edge("media_subsidies", "rogers_media", ["media", "financial_vector"], 2)
add_edge("media_subsidies", "cbc_media", ["media", "financial_vector"], 2)
add_edge("media_subsidies", "justin_trudeau", ["media", "financial_vector"], 2)
add_edge("cbc_media", "justin_trudeau", ["media"], 1)
add_edge("bell_media", "rogers_media", ["media", "financial_vector"], 1)

# CFNIS cluster
add_edge("afghan_detainee_scandal", "cfnis_org", ["cfnis"], 3)
add_edge("afghan_detainee_scandal", "richard_colvin", ["cfnis"], 3)
add_edge("afghan_detainee_scandal", "rcmp_federal", ["cfnis", "osint_target"], 1)
add_edge("cfnis_org", "richard_colvin", ["cfnis"], 2)

# Cross-cluster: media covers scandals
add_edge("cbc_media", "hogue_commission", ["media"], 1)
add_edge("global_news_ccp", "postmedia_network", ["media"], 1)

data["total_nodes"] = len(data["nodes"])
data["total_edges"] = len(data["edges"])
with open(DATA, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"Added {na} nodes, {ea} edges -> {data['total_nodes']} nodes, {data['total_edges']} edges")
