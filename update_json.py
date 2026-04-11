import json

# Update charges_sheet.json
with open('E:/TENET-5.github.io/data/charges_sheet.json', 'r', encoding='utf-8') as f:
    charges = json.load(f)

# Create nodes
bendayan = {
    "name": "Rachel Bendayan",
    "type": "mp",
    "charges": [
        {
            "charge_id": "F-0082",
            "section": "122",
            "section_title": "Breach of trust by public officer",
            "severity": "medium",
            "description": "MAID Policy and Foreign Lobbying Cross-Reference flag. 23 CIJA lobbying meetings + consecutive MAID C-7 expansion votes.",
            "max_penalty": "5 years",
            "evidence": [
                {"fact": "23 CIJA lobbying meetings", "source": "Lobbying Commissioner CSV"},
                {"fact": "Voted Yea on MAID expansion C-7", "source": "Parliamentary records"}
            ],
            "legal_basis": "Every official who, in connection with the duties of their office, commits fraud or a breach of trust is guilty of an indictable offence.",
            "data_source": "maid_investigation_report.json",
            "action": "s.504 private prosecution available"
        }
    ],
    "severity_score": 2,
    "max_combined_penalty": "5 years",
    "charge_count": 1,
    "network": {
        "influence_score": 35,
        "source_count": 2,
        "categories": ["israel", "maid_expansion", "person"],
        "node_type": "person",
        "datasets": ["maid_investigation_report", "lobbying_analysis"]
    },
    "combined_score": 235
}

oliphant = {
    "name": "Rob Oliphant",
    "type": "mp",
    "charges": [
        {
            "charge_id": "F-0083",
            "section": "122",
            "section_title": "Breach of trust by public officer",
            "severity": "medium",
            "description": "MAID Policy and Foreign Lobbying Cross-Reference flag. 13 CIJA lobbying meetings + consecutive MAID C-7 expansion votes.",
            "max_penalty": "5 years",
            "evidence": [
                {"fact": "13 CIJA lobbying meetings", "source": "Lobbying Commissioner CSV"},
                {"fact": "Voted Yea on MAID expansion C-7", "source": "Parliamentary records"}
            ],
            "legal_basis": "Every official who, in connection with the duties of their office, commits fraud or a breach of trust is guilty of an indictable offence.",
            "data_source": "maid_investigation_report.json",
            "action": "s.504 private prosecution available"
        }
    ],
    "severity_score": 2,
    "max_combined_penalty": "5 years",
    "charge_count": 1,
    "network": {
        "influence_score": 35,
        "source_count": 2,
        "categories": ["israel", "maid_expansion", "person"],
        "node_type": "person",
        "datasets": ["maid_investigation_report", "lobbying_analysis"]
    },
    "combined_score": 235
}

charges['individuals'].extend([bendayan, oliphant])
charges['total_individuals'] = len(charges['individuals'])

with open('E:/TENET-5.github.io/data/charges_sheet.json', 'w', encoding='utf-8') as f:
    json.dump(charges, f, indent=2, ensure_ascii=False)


# Update influence_network.json
with open('E:/TENET-5.github.io/data/network_analysis/influence_network.json', 'r', encoding='utf-8') as f:
    network = json.load(f)

# Add nodes
network['nodes'].append({"id": "Rachel_Bendayan", "label": "Rachel Bendayan", "group": 1, "categories": ["person", "mp", "israel", "maid"], "description": "MP with 23 CIJA meetings + MAID expansion voting record"})
network['nodes'].append({"id": "Rob_Oliphant", "label": "Rob Oliphant", "group": 1, "categories": ["person", "mp", "israel", "maid"], "description": "MP with 13 CIJA meetings + MAID expansion voting record"})

# Add edges connecting them to CIJA and MAID
network['edges'].append({"source": "Rachel_Bendayan", "target": "CIJA", "type": "lobbied", "description": "23 meetings"})
network['edges'].append({"source": "Rachel_Bendayan", "target": "MAID_Network", "type": "voted_for", "description": "Bill C-7"})
network['edges'].append({"source": "Rob_Oliphant", "target": "CIJA", "type": "lobbied", "description": "13 meetings"})
network['edges'].append({"source": "Rob_Oliphant", "target": "MAID_Network", "type": "voted_for", "description": "Bill C-7"})

with open('E:/TENET-5.github.io/data/network_analysis/influence_network.json', 'w', encoding='utf-8') as f:
    json.dump(network, f, indent=2, ensure_ascii=False)

print("JSON files successfully updated!")
