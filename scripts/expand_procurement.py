# Expand network: procurement scandals (ArriveCAN, McKinsey)
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

# ═══ ArriveCAN Scandal ═══
add_node({"id": "arrivecan_scandal", "label": "ArriveCAN Scandal", "influence_score": 70.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 5, "type": "event",
    "subtitle": "$60M app originally budgeted at $80K",
    "detail": "COVID border app ballooned from $80K to $60M. Auditor General found procurement rules flouted. RCMP investigation ongoing."})

add_node({"id": "gc_strategies", "label": "GC Strategies", "influence_score": 55.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 4, "type": "org",
    "subtitle": "2-person IT firm — awarded $19M+ for ArriveCAN",
    "detail": "Founded 2015 by Kristian Firth and Darren Anthony. Banned from govt contracts for 7 years. Criteria 'heavily favoured' GC Strategies."})

add_node({"id": "kristian_firth", "label": "Kristian Firth", "influence_score": 45.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 3, "type": "person",
    "subtitle": "GC Strategies co-founder — ordered before House of Commons bar",
    "detail": "Refused to answer committee questions citing RCMP investigation. Ordered to appear before bar of the House."})

add_node({"id": "darren_anthony", "label": "Darren Anthony", "influence_score": 40.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 2, "type": "person",
    "subtitle": "GC Strategies co-founder",
    "detail": "Co-owner of 2-person firm awarded $19M+ for ArriveCAN."})

add_node({"id": "cbsa", "label": "Canada Border Services Agency (CBSA)", "influence_score": 50.0,
    "categories": ["financial_vector"], "source_count": 3, "type": "org",
    "subtitle": "Contracted GC Strategies for ArriveCAN",
    "detail": "Investigation found 'pattern of persistent collaboration' with GC Strategies circumventing procurement processes."})

# ═══ McKinsey Scandal ═══
add_node({"id": "mckinsey_canada", "label": "McKinsey & Company (Canada)", "influence_score": 65.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 4, "type": "org",
    "subtitle": "$209M in federal contracts — AG found rules flouted",
    "detail": "Auditor General found govt flouted contracting policies. Unable to show value for money on $209M in contracts since 2015."})

add_node({"id": "dominic_barton", "label": "Dominic Barton", "influence_score": 55.0,
    "categories": ["financial_vector", "ccp", "osint_target"], "source_count": 4, "type": "person",
    "subtitle": "Former McKinsey global head + Canada Ambassador to China",
    "detail": "Chaired Liberal economic advisory committee. Ambassador to China. AG noted 'apparent or perceived' conflict of interest with McKinsey contracts."})

# ═══ EDGES ═══
# ArriveCAN cluster
add_edge("kristian_firth", "gc_strategies", ["financial_vector"], 3)
add_edge("darren_anthony", "gc_strategies", ["financial_vector"], 3)
add_edge("gc_strategies", "arrivecan_scandal", ["financial_vector"], 3)
add_edge("cbsa", "arrivecan_scandal", ["financial_vector"], 3)
add_edge("cbsa", "gc_strategies", ["financial_vector"], 3)
add_edge("arrivecan_scandal", "rcmp_federal", ["osint_target"], 2)
add_edge("arrivecan_scandal", "justin_trudeau", ["financial_vector"], 1)

# McKinsey cluster
add_edge("dominic_barton", "mckinsey_canada", ["financial_vector"], 3)
add_edge("mckinsey_canada", "justin_trudeau", ["financial_vector"], 2)
add_edge("dominic_barton", "justin_trudeau", ["financial_vector", "ccp"], 2)
add_edge("dominic_barton", "hogue_commission", ["ccp"], 1)  # ambassador to China connection

# Cross-cluster
add_edge("arrivecan_scandal", "mckinsey_canada", ["financial_vector"], 1)

data["total_nodes"] = len(data["nodes"])
data["total_edges"] = len(data["edges"])
with open(DATA, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"Added {na} nodes, {ea} edges → {data['total_nodes']} total nodes, {data['total_edges']} total edges")
