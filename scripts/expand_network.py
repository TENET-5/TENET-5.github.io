# Expand network analysis with researched entities
# Modified: 2026-04-09 | Author: claude_code
import json
from pathlib import Path

DATA = Path(__file__).parent.parent / "data" / "network_analysis" / "influence_network.json"

with open(DATA, "r", encoding="utf-8") as f:
    data = json.load(f)

existing_ids = {n["id"] for n in data["nodes"]}
existing_edges = {(e["source"], e["target"]) for e in data["edges"]}

def add_node(n):
    if n["id"] not in existing_ids:
        data["nodes"].append(n)
        existing_ids.add(n["id"])
        return True
    return False

def add_edge(source, target, cats, weight=1):
    if (source, target) not in existing_edges and (target, source) not in existing_edges:
        if source in existing_ids and target in existing_ids:
            data["edges"].append({"source": source, "target": target, "shared_categories": cats, "weight": weight})
            existing_edges.add((source, target))
            return True
    return False

nodes_added = 0
edges_added = 0

# ═══════════════════════════════════════════════════════════
# CCP FOREIGN INTERFERENCE — from Hogue Commission findings
# ═══════════════════════════════════════════════════════════

ccp_nodes = [
    {"id": "han_dong", "label": "Han Dong", "influence_score": 55.0,
     "categories": ["ccp", "lobbied_official", "osint_target"], "source_count": 4, "type": "official",
     "subtitle": "Liberal MP (Don Valley North) — resigned caucus over CCP ties",
     "detail": "Alleged to have advised Chinese consul general to delay freeing Kovrig and Spavor. Sued Global News for defamation. Chinese international students bused to vote for him in Liberal nomination."},

    {"id": "wei_zhao", "label": "Wei Zhao", "influence_score": 50.0,
     "categories": ["ccp", "osint_target"], "source_count": 3, "type": "person",
     "subtitle": "Chinese diplomat — expelled from Canada 2023",
     "detail": "PRC consular official in Toronto. Sought information on Michael Chong's relatives in China. First Chinese diplomat expelled from Canada in decades."},

    {"id": "michael_chong", "label": "Michael Chong", "influence_score": 60.0,
     "categories": ["ccp", "osint_target", "lobbied_official"], "source_count": 3, "type": "official",
     "subtitle": "Conservative MP — targeted by CCP",
     "detail": "Vocal critic of Beijing's Uyghur treatment. CSIS confirmed he and his Hong Kong family were targeted by Chinese operatives via Wei Zhao."},

    {"id": "david_vigneault_csis", "label": "David Vigneault", "influence_score": 55.0,
     "categories": ["ccp", "osint_target"], "source_count": 3, "type": "official",
     "subtitle": "CSIS Director (2017-2024)",
     "detail": "Confirmed CCP targeting of Michael Chong. CSIS concluded Chinese govt interfered in 2019 and 2021 elections."},

    {"id": "huawei_canada", "label": "Huawei Technologies Canada", "influence_score": 45.0,
     "categories": ["ccp", "financial_vector"], "source_count": 2, "type": "org",
     "subtitle": "Chinese telecom — registered Canadian lobbyist",
     "detail": "Registered lobbyist with Commissioner of Lobbying. Lobbied multiple government departments on 5G, telecom, and trade policy."},

    {"id": "ccpac", "label": "Canadian Chinese Political Affairs Committee", "influence_score": 35.0,
     "categories": ["ccp", "financial_vector"], "source_count": 2, "type": "org",
     "subtitle": "Political action committee — CCP-linked",
     "detail": "Co-founder became prominent CBC commentator on China affairs. Blurred lines between PR, journalism, and political activism."},

    {"id": "hogue_commission", "label": "Foreign Interference Commission", "influence_score": 60.0,
     "categories": ["ccp", "israel"], "source_count": 3, "type": "event",
     "subtitle": "Public Inquiry into Foreign Interference (2023-2024)",
     "detail": "Led by Justice Marie-Josée Hogue. Found China was main perpetrator of 'persistent and sophisticated' election interference."},
]

# ═══════════════════════════════════════════════════════════
# ISRAEL LOBBY — from Commissioner of Lobbying records
# ═══════════════════════════════════════════════════════════

israel_nodes = [
    {"id": "cija", "label": "CIJA (Centre for Israel and Jewish Affairs)", "influence_score": 70.0,
     "categories": ["israel", "financial_vector"], "source_count": 4, "type": "org",
     "subtitle": "Primary Israel lobby organization in Canada",
     "detail": "Lobbied 46+ MPs in 12 months including PM Trudeau and 6 cabinet ministers. CEO ranked top-100 lobbyist by Hill Times."},

    {"id": "shimon_fogel", "label": "Shimon Fogel", "influence_score": 50.0,
     "categories": ["israel", "financial_vector"], "source_count": 2, "type": "person",
     "subtitle": "Former CIJA CEO — top-100 Canadian lobbyist",
     "detail": "Recognized by Hill Times as top-100 lobbyist. Embassy Magazine ranked him among 50 most important people influencing Canadian foreign policy."},

    {"id": "noah_shack_cija", "label": "Noah Shack", "influence_score": 45.0,
     "categories": ["israel", "financial_vector"], "source_count": 2, "type": "person",
     "subtitle": "Current CIJA CEO",
     "detail": "Registered with Commissioner of Lobbying. Active lobbying on hate speech, foreign policy, and Middle East policy."},

    {"id": "cjpac", "label": "CJPAC (Canadian Jewish Political Affairs Committee)", "influence_score": 45.0,
     "categories": ["israel", "financial_vector"], "source_count": 2, "type": "org",
     "subtitle": "Jewish political action committee",
     "detail": "Formed from consolidation of Jewish business leaders. Funds candidates, coordinates policy initiatives across Jewish organizations."},
]

# ═══════════════════════════════════════════════════════════
# MAID CHAIN EXPANSION — Ministers of Public Safety
# ═══════════════════════════════════════════════════════════

maid_nodes = [
    {"id": "ralph_goodale", "label": "Ralph Goodale", "influence_score": 60.0,
     "categories": ["maid_legislation", "lobbied_official"], "source_count": 3, "type": "official",
     "subtitle": "Minister of Public Safety (2015-2019)",
     "detail": "Direct civilian oversight of RCMP Commissioner Bob Paulson when Bill C-14 passed. Responsible for RCMP, CSIS, and border services."},

    {"id": "bill_blair", "label": "Bill Blair", "influence_score": 60.0,
     "categories": ["maid_legislation", "lobbied_official"], "source_count": 3, "type": "official",
     "subtitle": "Minister of Public Safety (2019-2021)",
     "detail": "Former Toronto Police Chief. Oversaw RCMP during Bill C-7 expansion of MAID. Direct civilian oversight of Commissioner Brenda Lucki."},
]

# ═══════════════════════════════════════════════════════════
# MEDIA — key figures in coverage/suppression
# ═══════════════════════════════════════════════════════════

media_nodes = [
    {"id": "global_news_ccp", "label": "Global News (CCP Investigation)", "influence_score": 40.0,
     "categories": ["media", "ccp"], "source_count": 2, "type": "org",
     "subtitle": "Broke Han Dong / CCP interference story",
     "detail": "Published CSIS intelligence alleging Han Dong advised Chinese consul general. Han Dong sued for defamation."},

    {"id": "sam_cooper", "label": "Sam Cooper", "influence_score": 40.0,
     "categories": ["media", "ccp"], "source_count": 2, "type": "person",
     "subtitle": "Investigative journalist — author of 'Wilful Blindness'",
     "detail": "Key reporter on Chinese influence operations in Canada. Book 'Wilful Blindness' documented CCP interference networks."},
]

# Add all nodes
for n in ccp_nodes + israel_nodes + maid_nodes + media_nodes:
    if add_node(n):
        nodes_added += 1

# ═══════════════════════════════════════════════════════════
# EDGES — relationship connections
# ═══════════════════════════════════════════════════════════

edge_defs = [
    # CCP interference cluster
    ("han_dong", "justin_trudeau", ["ccp", "lobbied_official"], 2),
    ("han_dong", "wei_zhao", ["ccp"], 3),
    ("wei_zhao", "michael_chong", ["ccp", "osint_target"], 3),
    ("david_vigneault_csis", "michael_chong", ["ccp"], 2),
    ("david_vigneault_csis", "wei_zhao", ["ccp"], 2),
    ("david_vigneault_csis", "hogue_commission", ["ccp"], 2),
    ("han_dong", "hogue_commission", ["ccp"], 2),
    ("michael_chong", "hogue_commission", ["ccp"], 2),
    ("huawei_canada", "justin_trudeau", ["ccp", "financial_vector"], 1),
    ("ccpac", "han_dong", ["ccp"], 2),
    ("justin_trudeau", "hogue_commission", ["ccp"], 2),
    ("global_news_ccp", "han_dong", ["media", "ccp"], 2),
    ("sam_cooper", "han_dong", ["media", "ccp"], 1),
    ("sam_cooper", "wei_zhao", ["media", "ccp"], 1),
    ("sam_cooper", "hogue_commission", ["media", "ccp"], 1),

    # Israel lobby cluster
    ("cija", "justin_trudeau", ["israel", "financial_vector"], 3),
    ("cija", "shimon_fogel", ["israel"], 3),
    ("cija", "noah_shack_cija", ["israel"], 3),
    ("cjpac", "cija", ["israel", "financial_vector"], 2),
    ("shimon_fogel", "justin_trudeau", ["israel"], 1),

    # MAID chain expansion
    ("ralph_goodale", "bill_c14_maid_2016", ["maid_legislation"], 3),
    ("ralph_goodale", "bob_paulson_rcmp", ["maid_legislation"], 3),
    ("ralph_goodale", "justin_trudeau", ["maid_legislation", "lobbied_official"], 2),
    ("ralph_goodale", "rcmp_federal", ["maid_legislation"], 2),
    ("bill_blair", "bill_c7_maid_2021", ["maid_legislation"], 3),
    ("bill_blair", "brenda_lucki_rcmp", ["maid_legislation"], 3),
    ("bill_blair", "justin_trudeau", ["maid_legislation", "lobbied_official"], 2),
    ("bill_blair", "rcmp_federal", ["maid_legislation"], 2),

    # Cross-cluster connections (where entities span categories)
    ("cija", "anthony_housefather", ["israel"], 2),  # if exists
    ("hogue_commission", "rcmp_federal", ["ccp"], 1),
    ("david_vigneault_csis", "brenda_lucki_rcmp", ["osint_target"], 1),
    ("david_vigneault_csis", "justin_trudeau", ["ccp"], 2),
]

for src, tgt, cats, w in edge_defs:
    if add_edge(src, tgt, cats, w):
        edges_added += 1

# Update totals
data["total_nodes"] = len(data["nodes"])
data["total_edges"] = len(data["edges"])

with open(DATA, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {nodes_added} nodes, {edges_added} edges")
print(f"Total: {data['total_nodes']} nodes, {data['total_edges']} edges")
