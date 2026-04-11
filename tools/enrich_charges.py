#!/usr/bin/env python3
"""Enrich charges_sheet.json with OSINT dossier findings."""
import json

with open("data/charges_sheet.json", "r", encoding="utf-8") as f:
    cs = json.load(f)
with open("data/osint_vault/maid_mp_dossiers.json", "r", encoding="utf-8") as f:
    dossiers = json.load(f)

# Build lookup
cs_lookup = {ind["name"]: ind for ind in cs["individuals"]}
charge_id = 8000
added = 0

for profile in dossiers["profiles"]:
    name = profile["name"]
    ind = cs_lookup.get(name)
    if not ind:
        continue

    existing_ids = {c["charge_id"] for c in ind["charges"]}

    # Add ethics breach charges
    if "GUILTY" in profile.get("ethics_status", "").upper() or "PROVEN" in profile.get("ethics_status", "").upper():
        charge_id += 1
        cid = f"OSINT-{charge_id:04d}"
        if cid not in existing_ids:
            ind["charges"].append({
                "charge_id": cid,
                "section": "122",
                "section_title": "Breach of Trust by Public Officer",
                "severity": "critical",
                "description": f"Ethics Commissioner found violation. {profile['ethics_status']}. Details: {'; '.join(profile['controversies'][:2])}",
                "max_penalty": "5 years imprisonment",
                "evidence": [{"fact": c, "source": "Ethics Commissioner / public records"} for c in profile["controversies"][:3]],
                "legal_basis": "Every official who commits fraud or breach of trust in connection with duties of office is guilty of an indictable offence (s.122 Criminal Code).",
                "data_source": "OSINT dossier research",
                "action": "s.504 private prosecution available"
            })
            added += 1

    # Add conflict of interest charges for financial flags
    if profile.get("financial_flags") and "violation" not in profile.get("financial_flags", "").lower():
        flags = profile["financial_flags"]
        if "$" in flags or "shares" in flags.lower() or "clam" in flags.lower():
            charge_id += 1
            cid = f"OSINT-{charge_id:04d}"
            if cid not in existing_ids:
                ind["charges"].append({
                    "charge_id": cid,
                    "section": "121(1)",
                    "section_title": "Frauds on the Government / Municipal Corruption",
                    "severity": "high",
                    "description": f"Financial irregularity: {flags}",
                    "max_penalty": "5 years imprisonment",
                    "evidence": [{"fact": flags, "source": "Public financial disclosures / Ethics Commissioner"}],
                    "legal_basis": "Every one who being an official demands, accepts or agrees to accept any reward, advantage or benefit for cooperating or assisting in procuring benefits (s.121 Criminal Code).",
                    "data_source": "OSINT dossier research",
                    "action": "s.504 private prosecution available"
                })
                added += 1

    # Add foreign influence charges where applicable
    fc = profile.get("foreign_connections", "")
    if any(term in fc for term in ["CIJA", "BDS", "WEF Young Global Leader", "Canada-China", "APT31", "Atwal"]):
        charge_id += 1
        cid = f"OSINT-{charge_id:04d}"
        if cid not in existing_ids:
            ind["charges"].append({
                "charge_id": cid,
                "section": "FITAA / 20(1) COIA",
                "section_title": "Foreign Influence / Conflict of Interest",
                "severity": "high",
                "description": f"Foreign influence indicators: {fc}",
                "max_penalty": "5 years / $5M fine (FITAA); varies (COIA)",
                "evidence": [{"fact": fc, "source": "Parliamentary records, lobbying registry, public disclosures"}],
                "legal_basis": "Foreign Influence Transparency and Accountability Act / Conflict of Interest Act s.20(1).",
                "data_source": "OSINT dossier research",
                "action": "s.504 private prosecution + FITAA registration review"
            })
            added += 1

    # Update counts
    ind["charge_count"] = len(ind["charges"])
    sevs = [c.get("severity", "medium") for c in ind["charges"]]
    if "critical" in sevs:
        ind["severity_label"] = "critical"
    elif "high" in sevs:
        ind["severity_label"] = "high"
    if any("life" in c.get("max_penalty", "").lower() for c in ind["charges"]):
        ind["max_combined_penalty"] = "Life imprisonment"

# Update totals
cs["total_charges"] = sum(len(ind["charges"]) for ind in cs["individuals"])
cs["generated"] = "2026-04-11T02:30:00+00:00"

with open("data/charges_sheet.json", "w", encoding="utf-8") as f:
    json.dump(cs, f, indent=2, ensure_ascii=False)

print(f"Added {added} new charges from OSINT dossiers")
print(f"Total individuals: {cs['total_individuals']}")
print(f"Total charges: {cs['total_charges']}")
