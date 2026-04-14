#!/usr/bin/env python3
"""Generate evidence_permalinks.json — stable citation URLs for every evidence item.

Reads:
  - data/evidence_master_index.json  (EV-#### refs)
  - data/charges_sheet.json          (F-#### charge IDs)
  - data/investigation_board.js      (BOARD-<id> node IDs)

Outputs: data/evidence_permalinks.json

Run from the site root:
    python build-evidence-permalinks.py
"""

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

SITE_ROOT = Path(__file__).parent
SITE_URL = "https://tenet-5.github.io"


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_evidence_master_index() -> list:
    """Load EV-#### items from evidence_master_index.json."""
    path = SITE_ROOT / "data" / "evidence_master_index.json"
    if not path.exists():
        print(f"  WARNING: {path.name} not found — run build-evidence-index.py first")
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get("items", [])


def load_charges_sheet() -> list:
    """Load F-#### charges from charges_sheet.json."""
    path = SITE_ROOT / "data" / "charges_sheet.json"
    if not path.exists():
        print(f"  WARNING: {path.name} not found")
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    charges = []
    for individual in data.get("individuals", []):
        name = individual.get("name", "Unknown")
        for charge in individual.get("charges", []):
            charge["_individual"] = name
            charges.append(charge)
    return charges


def load_board_nodes() -> list:
    """Load BOARD-<id> nodes from investigation_board.js."""
    path = SITE_ROOT / "data" / "investigation_board.js"
    if not path.exists():
        print(f"  WARNING: {path.name} not found")
        return []
    text = path.read_text(encoding="utf-8")
    # Strip the JS assignment to get raw JSON
    m = re.match(r"window\.BOARD_DATA\s*=\s*", text)
    if not m:
        print("  WARNING: Could not parse investigation_board.js")
        return []
    json_text = text[m.end():].rstrip().rstrip(";")
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"  WARNING: JSON parse error in investigation_board.js: {e}")
        return []
    return data.get("nodes", [])


def build_refs() -> dict:
    """Build the unified permalink reference map."""
    refs = {}

    # ── Evidence items (EV-####) ──
    items = load_evidence_master_index()
    print(f"  Evidence items: {len(items)}")
    for item in items:
        ref = item.get("ref", "")
        if not ref:
            continue
        entry = {
            "page": item["page"],
            "type": item.get("type", "item"),
            "summary": item.get("summary", ""),
            "sha256": sha256(item.get("full_text", item.get("summary", ""))),
        }
        anchor = item.get("id", "")
        if anchor:
            entry["anchor"] = anchor
        refs[ref] = entry

    # ── Charges (F-####) ──
    # Charge IDs can repeat across individuals. Use F-####-<surname> for dupes.
    charges = load_charges_sheet()
    print(f"  Charges: {len(charges)}")
    seen_cids: dict[str, int] = {}
    for charge in charges:
        cid = charge.get("charge_id", "")
        if not cid:
            continue
        desc = charge.get("description", "")
        individual = charge.get("_individual", "")
        section = charge.get("section", "")
        section_title = charge.get("section_title", "")

        # Disambiguate duplicate charge IDs across individuals
        key = cid
        if cid in seen_cids:
            surname = individual.split()[-1].lower() if individual else str(seen_cids[cid])
            key = f"{cid}-{surname}"
        seen_cids[cid] = seen_cids.get(cid, 0) + 1

        entry = {
            "page": "charges-sheet.html",
            "type": "charge",
            "individual": individual,
            "section": f"{section} — {section_title}" if section_title else section,
            "summary": desc[:200] + "..." if len(desc) > 200 else desc,
            "sha256": sha256(f"{individual}:{desc}"),
        }
        refs[key] = entry

    # ── Board nodes (BOARD-<id>) ──
    nodes = load_board_nodes()
    print(f"  Board nodes: {len(nodes)}")
    for node in nodes:
        nid = node.get("id", "")
        if not nid:
            continue
        label = node.get("label", "")
        detail = node.get("detail", "")
        link = node.get("link", "")
        page = "conspiracy-board.html"
        anchor = nid
        if link:
            # link might be "foreign-influence.html#vuong"
            parts = link.split("#", 1)
            if len(parts) == 2:
                page = parts[0] or page
                anchor = parts[1] or nid
            elif parts[0]:
                page = parts[0]
        ref_key = f"BOARD-{nid}"
        entry = {
            "page": page,
            "anchor": anchor,
            "type": node.get("type", "node"),
            "label": label,
            "summary": detail[:200] + "..." if len(detail) > 200 else detail,
            "sha256": sha256(detail or label),
        }
        refs[ref_key] = entry

    return refs


def main():
    print("Building evidence permalinks...")
    refs = build_refs()

    # Type counts
    type_counts = {}
    for entry in refs.values():
        t = entry.get("type", "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

    index = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "algorithm": "SHA-256",
        "site": SITE_URL,
        "total_refs": len(refs),
        "type_counts": dict(sorted(type_counts.items(), key=lambda x: -x[1])),
        "refs": refs,
    }

    out = SITE_ROOT / "data" / "evidence_permalinks.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Written: {out.name} ({len(refs)} refs)")


if __name__ == "__main__":
    main()
