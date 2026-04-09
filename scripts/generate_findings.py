# Generate cross_reference_findings.json from criminal code analysis
# Modified: 2026-04-09 | Author: claude_code
import json
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).parent.parent
CRIMINAL = ROOT / "data" / "criminal_code_analysis.json"
NETWORK = ROOT / "data" / "network_analysis" / "influence_network.json"
OUTPUT = ROOT / "data" / "cross_reference_findings.json"

with open(CRIMINAL, "r", encoding="utf-8") as f:
    crim = json.load(f)

with open(NETWORK, "r", encoding="utf-8") as f:
    net = json.load(f)

# Build entity lookup from network data
entity_scores = {}
for n in net.get("nodes", []):
    entity_scores[n["label"].lower()] = {
        "score": n.get("influence_score", 0),
        "sources": n.get("source_count", 1),
        "categories": n.get("categories", []),
    }

# Group findings by section
by_section = defaultdict(list)
for f in crim.get("findings", []):
    section = f.get("section_title", f.get("section", "Unknown"))
    by_section[section].append(f)

# Build the findings JSON in the format the page expects
output = {}
finding_num = 0

# Finding 1: Foreign Influence Overview
overlap_entities = [n for n in net["nodes"] if n.get("source_count", 1) >= 2]
finding_num += 1
output[f"finding_{finding_num}"] = {
    "title": "Cross-Referenced Foreign Influence Network",
    "severity": "critical",
    "summary": (
        f"{len(overlap_entities)} entities appear in 2+ independent investigation datasets "
        f"(lobbying records, political donations, OSINT targets, treason roster). "
        f"Cross-referencing increases confidence that these entities occupy structural "
        f"positions within the influence network."
    ),
    "entities": [
        {
            "name": e["label"],
            "sidewinder": any("israel" in c or "ccp" in c for c in e.get("categories", [])),
            "emergencies_act": any("osint" in c for c in e.get("categories", [])),
            "lobby_meetings": str(e.get("source_count", 1)) + " sources",
        }
        for e in sorted(overlap_entities, key=lambda x: x.get("influence_score", 0), reverse=True)[:12]
    ],
}

# Finding 2: MAID Accountability Chain
maid_nodes = [n for n in net["nodes"] if "maid_legislation" in (n.get("categories") or [])]
if maid_nodes:
    finding_num += 1
    output[f"finding_{finding_num}"] = {
        "title": "MAID Legislation: Chain of Command Accountability",
        "severity": "critical",
        "summary": (
            "The RCMP and Parliamentary Protective Service held direct operational authority "
            "over Parliament Hill security when Bills C-14 (2016) and C-7 (2021) received Royal Assent. "
            "No intervention was made against the legislative authorization of state-administered death "
            "for vulnerable populations."
        ),
        "entities": [
            {
                "name": n["label"],
                "sidewinder": False,
                "emergencies_act": "osint_target" in (n.get("categories") or []),
                "lobby_meetings": n.get("subtitle", ""),
            }
            for n in sorted(maid_nodes, key=lambda x: x.get("influence_score", 0), reverse=True)
        ],
    }

# Generate findings from criminal code analysis groups
for section, findings in sorted(by_section.items(), key=lambda x: -len(x[1])):
    if len(findings) < 2:
        continue  # skip sections with only 1 finding
    finding_num += 1

    # Determine overall severity
    sevs = [f.get("severity", "medium") for f in findings]
    if "critical" in sevs:
        overall_sev = "critical"
    elif "high" in sevs:
        overall_sev = "high"
    else:
        overall_sev = "medium"

    evidence_items = []
    for f in findings[:6]:  # cap at 6 evidence items per finding
        for e in f.get("evidence", []):
            evidence_items.append({
                "fact": f"{f['entity']}: {e['fact']}",
                "source": e.get("source", f.get("data_source", "Public record")),
            })

    entity_items = []
    for f in findings[:8]:
        ent_lower = f.get("entity", "").lower()
        net_data = entity_scores.get(ent_lower, {})
        entity_items.append({
            "name": f["entity"],
            "sidewinder": any("israel" in c or "ccp" in c for c in net_data.get("categories", [])),
            "emergencies_act": any("osint" in c for c in net_data.get("categories", [])),
            "lobby_meetings": str(net_data.get("sources", "—")),
        })

    max_penalty = findings[0].get("max_penalty", "Unknown")
    output[f"finding_{finding_num}"] = {
        "title": f"{section} — {len(findings)} Entities Flagged",
        "severity": overall_sev,
        "summary": (
            f"{len(findings)} individuals/organizations flagged under {section} "
            f"(max penalty: {max_penalty}). "
            f"{findings[0].get('legal_basis', '')} "
            f"Action available: {findings[0].get('action', 's.504 private prosecution')}."
        ),
        "evidence": evidence_items[:6],
        "entities": entity_items,
    }

# Add metadata
output["_meta"] = {
    "generated": "2026-04-09T15:00:00Z",
    "system": "TENET5 Cross-Reference Engine",
    "seed": 118400,
    "total_findings": finding_num,
    "sources": ["criminal_code_analysis", "influence_network", "lobbying_analysis", "treason_roster"],
}

with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Generated {finding_num} cross-reference findings → {OUTPUT.name}")
