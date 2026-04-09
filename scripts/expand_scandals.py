# Expand network: SNC-Lavalin, WE Charity, Emergencies Act
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

# ═══ SNC-LAVALIN AFFAIR ═══
add_node({"id": "snc_lavalin_affair", "label": "SNC-Lavalin Affair", "influence_score": 75.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 5, "type": "event",
    "subtitle": "PMO pressured AG to give deferred prosecution to SNC-Lavalin",
    "detail": "Ethics commissioner found Trudeau violated Conflict of Interest Act. PMO exerted 'sustained effort' to politically interfere in prosecution. RCMP found 'insufficient evidence' to charge."})

add_node({"id": "snc_lavalin", "label": "SNC-Lavalin (now AtkinsRéalis)", "influence_score": 60.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 4, "type": "org",
    "subtitle": "Engineering firm — charged with corruption/fraud re: Libya contracts",
    "detail": "Charged in 2015 with corruption and fraud for bribing Libyan government officials. PMO pressured AG to offer deferred prosecution agreement."})

add_node({"id": "michael_wernick", "label": "Michael Wernick", "influence_score": 45.0,
    "categories": ["financial_vector", "lobbied_official"], "source_count": 2, "type": "official",
    "subtitle": "Clerk of the Privy Council (2016-2019)",
    "detail": "Testified at SNC-Lavalin hearings. Wilson-Raybould testified she received pressure from Wernick. Resigned after controversy."})

add_node({"id": "gerald_butts", "label": "Gerald Butts", "influence_score": 50.0,
    "categories": ["financial_vector", "lobbied_official"], "source_count": 3, "type": "person",
    "subtitle": "Principal Secretary to PM Trudeau — resigned over SNC-Lavalin",
    "detail": "Trudeau's top political adviser. Resigned February 2019 amid SNC-Lavalin controversy. Denied inappropriate pressure."})

# ═══ WE CHARITY SCANDAL ═══
add_node({"id": "we_charity_scandal", "label": "WE Charity Scandal", "influence_score": 65.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 4, "type": "event",
    "subtitle": "$912M student grant program awarded to WE — Trudeau family paid $425K",
    "detail": "WE Charity awarded contract to administer $912M program. WE had paid Trudeau family $425K for speaking events. Morneau broke ethics laws 3 times."})

add_node({"id": "craig_kielburger", "label": "Craig Kielburger", "influence_score": 45.0,
    "categories": ["financial_vector", "osint_target"], "source_count": 3, "type": "person",
    "subtitle": "WE Charity co-founder",
    "detail": "Co-founded WE Charity. Personal friendship with Finance Minister Morneau led to ethics violations. WE paid $425K to Trudeau family."})

add_node({"id": "bill_morneau", "label": "Bill Morneau", "influence_score": 55.0,
    "categories": ["financial_vector", "lobbied_official"], "source_count": 3, "type": "official",
    "subtitle": "Finance Minister (2015-2020) — broke ethics laws 3x over WE",
    "detail": "Ethics commissioner found Morneau broke ethics laws 3 times. Personal friendship with Craig Kielburger. Failed to recuse from WE decision. Resigned."})

add_node({"id": "margaret_trudeau", "label": "Margaret Trudeau", "influence_score": 35.0,
    "categories": ["financial_vector"], "source_count": 2, "type": "person",
    "subtitle": "PM's mother — paid $250K by WE Charity for speaking",
    "detail": "Received $250,000 from WE Charity for speaking at events (2016-2020) while her son's government awarded WE a $912M contract."})

# ═══ EMERGENCIES ACT ═══
add_node({"id": "emergencies_act_2022", "label": "Emergencies Act Invocation (2022)", "influence_score": 70.0,
    "categories": ["osint_target", "treason_roster"], "source_count": 5, "type": "event",
    "subtitle": "First-ever invocation — bank accounts frozen, protests cleared",
    "detail": "Invoked Feb 14, 2022. Banks froze accounts of protestors. Court later ruled use was 'unreasonable'. Rouleau Commission found threshold met but civil liberties concerns."})

add_node({"id": "chrystia_freeland", "label": "Chrystia Freeland", "influence_score": 60.0,
    "categories": ["osint_target", "lobbied_official", "treason_roster"], "source_count": 4, "type": "official",
    "subtitle": "Deputy PM + Finance Minister — ordered bank account freezing",
    "detail": "Authorized financial institutions to freeze accounts of convoy supporters without court order. Testified at Rouleau Commission."})

add_node({"id": "marco_mendicino_ea", "label": "Marco Mendicino (Emergencies)", "influence_score": 55.0,
    "categories": ["osint_target", "lobbied_official", "treason_roster"], "source_count": 3, "type": "official",
    "subtitle": "Public Safety Minister during Emergencies Act",
    "detail": "Claimed CSIS recommended invoking the Act. CSIS Director testified this was inaccurate. Testified at Rouleau Commission."})

add_node({"id": "tamara_lich", "label": "Tamara Lich", "influence_score": 40.0,
    "categories": ["osint_target"], "source_count": 3, "type": "person",
    "subtitle": "Freedom Convoy organizer — arrested, accounts frozen",
    "detail": "Key convoy organizer. Arrested, detained, accounts frozen under Emergencies Act. Later acquitted of mischief charges."})

add_node({"id": "rouleau_commission", "label": "Rouleau Commission (POEC)", "influence_score": 55.0,
    "categories": ["osint_target", "treason_roster"], "source_count": 3, "type": "event",
    "subtitle": "Public Order Emergency Commission (2022)",
    "detail": "Led by Justice Paul Rouleau. Found threshold met but court later ruled Act invocation was 'unreasonable'."})

# ═══ EDGES ═══
# SNC-Lavalin cluster
add_edge("snc_lavalin_affair", "justin_trudeau", ["financial_vector"], 3)
add_edge("snc_lavalin_affair", "jody_wilson_raybould", ["financial_vector"], 3)
add_edge("snc_lavalin_affair", "snc_lavalin", ["financial_vector"], 3)
add_edge("snc_lavalin_affair", "rcmp_federal", ["osint_target"], 2)
add_edge("michael_wernick", "snc_lavalin_affair", ["financial_vector"], 2)
add_edge("michael_wernick", "justin_trudeau", ["lobbied_official"], 2)
add_edge("gerald_butts", "snc_lavalin_affair", ["financial_vector"], 2)
add_edge("gerald_butts", "justin_trudeau", ["financial_vector"], 3)
add_edge("jody_wilson_raybould", "snc_lavalin", ["financial_vector"], 2)

# WE Charity cluster
add_edge("we_charity_scandal", "justin_trudeau", ["financial_vector"], 3)
add_edge("we_charity_scandal", "bill_morneau", ["financial_vector"], 3)
add_edge("we_charity_scandal", "craig_kielburger", ["financial_vector"], 3)
add_edge("we_charity_scandal", "margaret_trudeau", ["financial_vector"], 2)
add_edge("craig_kielburger", "bill_morneau", ["financial_vector"], 3)
add_edge("margaret_trudeau", "justin_trudeau", ["financial_vector"], 2)
add_edge("bill_morneau", "justin_trudeau", ["financial_vector", "lobbied_official"], 2)

# Emergencies Act cluster
add_edge("emergencies_act_2022", "justin_trudeau", ["osint_target", "treason_roster"], 3)
add_edge("emergencies_act_2022", "chrystia_freeland", ["osint_target"], 3)
add_edge("emergencies_act_2022", "rouleau_commission", ["osint_target"], 3)
add_edge("chrystia_freeland", "justin_trudeau", ["lobbied_official"], 3)
add_edge("tamara_lich", "emergencies_act_2022", ["osint_target"], 2)
add_edge("rouleau_commission", "justin_trudeau", ["osint_target"], 2)
add_edge("rouleau_commission", "chrystia_freeland", ["osint_target"], 2)
add_edge("emergencies_act_2022", "rcmp_federal", ["osint_target"], 2)

# Cross-scandal links (Trudeau is the hub)
add_edge("snc_lavalin_affair", "we_charity_scandal", ["financial_vector"], 1)
add_edge("snc_lavalin_affair", "emergencies_act_2022", ["osint_target"], 1)

# Mendicino appears in both Emergencies Act and existing Israel/lobby data
# Link if marco_mendicino already exists
if "marco_mendicino" in existing_ids:
    add_edge("marco_mendicino", "emergencies_act_2022", ["osint_target"], 2)
    add_edge("marco_mendicino", "rouleau_commission", ["osint_target"], 2)

data["total_nodes"] = len(data["nodes"])
data["total_edges"] = len(data["edges"])
with open(DATA, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"Added {na} nodes, {ea} edges -> {data['total_nodes']} nodes, {data['total_edges']} edges")
