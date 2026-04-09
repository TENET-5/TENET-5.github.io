# Add MAID/RCMP chain of command nodes to network analysis
# Modified: 2026-04-09 | Author: claude_code
import json
from pathlib import Path

DATA = Path(__file__).parent.parent / "data" / "network_analysis" / "influence_network.json"

with open(DATA, "r", encoding="utf-8") as f:
    data = json.load(f)

new_nodes = [
    {
        "id": "bill_c14_maid_2016",
        "label": "Bill C-14 (MAID Act 2016)",
        "influence_score": 95.0,
        "categories": ["maid_legislation"],
        "source_count": 3,
        "type": "event",
        "subtitle": "Medical Assistance in Dying Act \u2014 Royal Assent June 17, 2016",
        "detail": "Original MAID legislation. Legalized assisted suicide under specific conditions.",
    },
    {
        "id": "bill_c7_maid_2021",
        "label": "Bill C-7 (MAID Expansion 2021)",
        "influence_score": 95.0,
        "categories": ["maid_legislation"],
        "source_count": 3,
        "type": "event",
        "subtitle": "Expanded MAID \u2014 Royal Assent March 17, 2021",
        "detail": "Removed 'reasonably foreseeable death' requirement. Expanded eligibility.",
    },
    {
        "id": "justin_trudeau",
        "label": "Justin Trudeau",
        "influence_score": 90.0,
        "categories": ["maid_legislation", "lobbied_official"],
        "source_count": 5,
        "type": "official",
        "subtitle": "Prime Minister of Canada (2015-2025)",
        "detail": "PM during both C-14 and C-7. Government sponsored both MAID bills.",
    },
    {
        "id": "jody_wilson_raybould",
        "label": "Jody Wilson-Raybould",
        "influence_score": 70.0,
        "categories": ["maid_legislation", "lobbied_official"],
        "source_count": 2,
        "type": "official",
        "subtitle": "Minister of Justice (2015-2019)",
        "detail": "Introduced Bill C-14 in Parliament. Sponsored original MAID legislation.",
    },
    {
        "id": "david_lametti",
        "label": "David Lametti",
        "influence_score": 70.0,
        "categories": ["maid_legislation", "lobbied_official"],
        "source_count": 2,
        "type": "official",
        "subtitle": "Minister of Justice (2019-2023)",
        "detail": "Sponsored Bill C-7. Expanded MAID to non-terminal conditions.",
    },
    {
        "id": "bob_paulson_rcmp",
        "label": "Bob Paulson",
        "influence_score": 65.0,
        "categories": ["maid_legislation", "osint_target"],
        "source_count": 2,
        "type": "official",
        "subtitle": "RCMP Commissioner (2011-2017)",
        "detail": "RCMP Commissioner when Bill C-14 received Royal Assent. Top law enforcement.",
    },
    {
        "id": "brenda_lucki_rcmp",
        "label": "Brenda Lucki",
        "influence_score": 65.0,
        "categories": ["maid_legislation", "osint_target"],
        "source_count": 2,
        "type": "official",
        "subtitle": "RCMP Commissioner (2018-2023)",
        "detail": "RCMP Commissioner when Bill C-7 received Royal Assent. Top law enforcement.",
    },
    {
        "id": "michael_duheme_pps",
        "label": "Michael Duheme",
        "influence_score": 55.0,
        "categories": ["maid_legislation", "osint_target"],
        "source_count": 2,
        "type": "official",
        "subtitle": "PPS Director (2015-2016), RCMP Commissioner (2024-)",
        "detail": "First Director of Parliamentary Protective Service. On duty when C-14 passed.",
    },
    {
        "id": "jane_maclatchy_pps",
        "label": "Jane MacLatchy",
        "influence_score": 45.0,
        "categories": ["maid_legislation", "osint_target"],
        "source_count": 1,
        "type": "official",
        "subtitle": "PPS Director (2017-2019)",
        "detail": "Director of Parliamentary Protective Service. Oversaw Hill security.",
    },
    {
        "id": "parliamentary_protective_service",
        "label": "Parliamentary Protective Service (PPS)",
        "influence_score": 60.0,
        "categories": ["maid_legislation", "osint_target"],
        "source_count": 3,
        "type": "org",
        "subtitle": "Parliament Hill security force (est. 2015)",
        "detail": "Responsible for physical security of Parliament Hill.",
    },
    {
        "id": "rcmp_federal",
        "label": "Royal Canadian Mounted Police (RCMP)",
        "influence_score": 70.0,
        "categories": ["maid_legislation", "osint_target"],
        "source_count": 4,
        "type": "org",
        "subtitle": "Federal law enforcement",
        "detail": "National police force. Commissioners served during MAID legislation.",
    },
]

new_edges = [
    # Bill C-14 connections
    {"source": "justin_trudeau", "target": "bill_c14_maid_2016", "shared_categories": ["maid_legislation"], "weight": 3},
    {"source": "jody_wilson_raybould", "target": "bill_c14_maid_2016", "shared_categories": ["maid_legislation"], "weight": 3},
    {"source": "bob_paulson_rcmp", "target": "bill_c14_maid_2016", "shared_categories": ["maid_legislation"], "weight": 2},
    {"source": "michael_duheme_pps", "target": "bill_c14_maid_2016", "shared_categories": ["maid_legislation"], "weight": 2},
    {"source": "rcmp_federal", "target": "bill_c14_maid_2016", "shared_categories": ["maid_legislation"], "weight": 2},
    {"source": "parliamentary_protective_service", "target": "bill_c14_maid_2016", "shared_categories": ["maid_legislation"], "weight": 2},
    # Bill C-7 connections
    {"source": "justin_trudeau", "target": "bill_c7_maid_2021", "shared_categories": ["maid_legislation"], "weight": 3},
    {"source": "david_lametti", "target": "bill_c7_maid_2021", "shared_categories": ["maid_legislation"], "weight": 3},
    {"source": "brenda_lucki_rcmp", "target": "bill_c7_maid_2021", "shared_categories": ["maid_legislation"], "weight": 2},
    {"source": "rcmp_federal", "target": "bill_c7_maid_2021", "shared_categories": ["maid_legislation"], "weight": 2},
    {"source": "parliamentary_protective_service", "target": "bill_c7_maid_2021", "shared_categories": ["maid_legislation"], "weight": 2},
    # Org <-> person links
    {"source": "bob_paulson_rcmp", "target": "rcmp_federal", "shared_categories": ["osint_target"], "weight": 3},
    {"source": "brenda_lucki_rcmp", "target": "rcmp_federal", "shared_categories": ["osint_target"], "weight": 3},
    {"source": "michael_duheme_pps", "target": "rcmp_federal", "shared_categories": ["osint_target"], "weight": 2},
    {"source": "michael_duheme_pps", "target": "parliamentary_protective_service", "shared_categories": ["osint_target"], "weight": 3},
    {"source": "jane_maclatchy_pps", "target": "parliamentary_protective_service", "shared_categories": ["osint_target"], "weight": 3},
    {"source": "jane_maclatchy_pps", "target": "rcmp_federal", "shared_categories": ["osint_target"], "weight": 1},
    # PM <-> Ministers
    {"source": "justin_trudeau", "target": "jody_wilson_raybould", "shared_categories": ["lobbied_official"], "weight": 2},
    {"source": "justin_trudeau", "target": "david_lametti", "shared_categories": ["lobbied_official"], "weight": 2},
    # PM <-> RCMP (PM appoints Commissioner)
    {"source": "justin_trudeau", "target": "brenda_lucki_rcmp", "shared_categories": ["osint_target"], "weight": 2},
    # Cross-bill link
    {"source": "bill_c14_maid_2016", "target": "bill_c7_maid_2021", "shared_categories": ["maid_legislation"], "weight": 3},
    # Trudeau <-> orgs
    {"source": "justin_trudeau", "target": "rcmp_federal", "shared_categories": ["maid_legislation"], "weight": 2},
    {"source": "justin_trudeau", "target": "parliamentary_protective_service", "shared_categories": ["maid_legislation"], "weight": 1},
]

# Inject — skip duplicates
existing_ids = {n["id"] for n in data["nodes"]}
added = 0
for n in new_nodes:
    if n["id"] not in existing_ids:
        data["nodes"].append(n)
        added += 1

existing_edges = {(e["source"], e["target"]) for e in data["edges"]}
edge_added = 0
for e in new_edges:
    if (e["source"], e["target"]) not in existing_edges and (e["target"], e["source"]) not in existing_edges:
        data["edges"].append(e)
        edge_added += 1

data["total_nodes"] = len(data["nodes"])
data["total_edges"] = len(data["edges"])

with open(DATA, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {added} nodes, {edge_added} edges")
print(f"Total: {data['total_nodes']} nodes, {data['total_edges']} edges")
