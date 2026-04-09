# Expand network: India foreign interference + Nijjar assassination
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

# ═══ INDIA FOREIGN INTERFERENCE / NIJJAR ═══
add_node({"id": "nijjar_assassination", "label": "Nijjar Assassination (June 2023)", "influence_score": 80.0,
    "categories": ["india", "osint_target"], "source_count": 6, "type": "event",
    "subtitle": "Indian state-sponsored assassination on Canadian soil",
    "detail": "Hardeep Singh Nijjar shot dead outside Surrey Sikh temple. RCMP arrested 3 Indian nationals. Evidence links Indian consular staff (RAW agents) to assassination."})

add_node({"id": "hardeep_singh_nijjar", "label": "Hardeep Singh Nijjar", "influence_score": 65.0,
    "categories": ["india", "osint_target"], "source_count": 5, "type": "person",
    "subtitle": "Sikh activist — assassinated June 2023 in Surrey BC",
    "detail": "Prominent Sikh activist, designated terrorist by India. Assassinated outside Guru Nanak Sikh Gurdwara. PM Trudeau accused India of state-sponsored killing."})

add_node({"id": "india_raw", "label": "Research and Analysis Wing (RAW)", "influence_score": 55.0,
    "categories": ["india", "osint_target"], "source_count": 3, "type": "org",
    "subtitle": "India's external intelligence agency",
    "detail": "Canada presented evidence that RAW agents operating as visa officers in Vancouver consulate supplied information for Nijjar assassination."})

add_node({"id": "sanjay_kumar_verma", "label": "Sanjay Kumar Verma", "influence_score": 45.0,
    "categories": ["india", "osint_target"], "source_count": 3, "type": "person",
    "subtitle": "Indian High Commissioner — expelled from Canada Oct 2024",
    "detail": "High Commissioner expelled along with 5 other diplomats after Canada provided 'irrefutable evidence' of links between Indian govt agents and assassinations."})

add_node({"id": "melanie_joly", "label": "Mélanie Joly", "influence_score": 50.0,
    "categories": ["india", "lobbied_official"], "source_count": 3, "type": "official",
    "subtitle": "Foreign Affairs Minister — announced diplomat expulsions",
    "detail": "Announced expulsion of 6 Indian diplomats in Oct 2024. Presented evidence of Indian government involvement in assassinations, home invasions, drive-by shootings."})

add_node({"id": "sukhdool_singh", "label": "Sukhdool Singh", "influence_score": 35.0,
    "categories": ["india", "osint_target"], "source_count": 2, "type": "person",
    "subtitle": "Second Sikh activist murdered — linked to Indian agents",
    "detail": "Second homicide linked to Indian government agents on Canadian soil. Part of broader campaign including home invasions, shootings, arson."})

# ═══ EDGES ═══
add_edge("nijjar_assassination", "hardeep_singh_nijjar", ["india"], 3)
add_edge("nijjar_assassination", "india_raw", ["india"], 3)
add_edge("nijjar_assassination", "justin_trudeau", ["india", "osint_target"], 3)
add_edge("nijjar_assassination", "rcmp_federal", ["india", "osint_target"], 3)
add_edge("india_raw", "sanjay_kumar_verma", ["india"], 3)
add_edge("india_raw", "hardeep_singh_nijjar", ["india"], 2)
add_edge("melanie_joly", "sanjay_kumar_verma", ["india"], 3)
add_edge("melanie_joly", "nijjar_assassination", ["india"], 2)
add_edge("melanie_joly", "justin_trudeau", ["india", "lobbied_official"], 2)
add_edge("sukhdool_singh", "nijjar_assassination", ["india"], 2)
add_edge("sukhdool_singh", "india_raw", ["india"], 2)
add_edge("sanjay_kumar_verma", "nijjar_assassination", ["india"], 2)

# Cross-interference link: India + China both investigated
add_edge("nijjar_assassination", "hogue_commission", ["osint_target"], 1)
# Joly also expelled Chinese diplomat Wei Zhao
add_edge("melanie_joly", "wei_zhao", ["osint_target"], 2)

data["total_nodes"] = len(data["nodes"])
data["total_edges"] = len(data["edges"])
with open(DATA, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"Added {na} nodes, {ea} edges -> {data['total_nodes']} nodes, {data['total_edges']} edges")
