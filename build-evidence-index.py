#!/usr/bin/env python3
"""Scan all HTML pages and extract evidence items into a master index JSON.

Run from the site root:
    python build-evidence-index.py

Outputs: data/evidence_master_index.json
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

SITE_ROOT = Path(__file__).parent


def extract_title(html: str) -> str:
    m = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    if m:
        t = m.group(1).strip()
        # Strip " | TENET5" suffix
        t = re.sub(r"\s*[|—–]\s*TENET5?\s*$", "", t, flags=re.IGNORECASE)
        return t
    return ""


def classify_element(tag: str, classes: str) -> str:
    """Classify an evidence element by its type."""
    cl = classes.lower()
    if "charge-card" in cl:
        return "charge"
    if "evidence-block" in cl or "evidence-box" in cl:
        return "evidence"
    if "stat-tile" in cl or "stat-card" in cl:
        return "statistic"
    if "timeline-entry" in cl or "timeline-item" in cl:
        return "timeline"
    if "card" in cl:
        return "finding"
    if tag.lower() in ("section", "article"):
        return "section"
    return "item"


def extract_evidence_items(html: str, page: str) -> list:
    """Extract all data-narrate elements from HTML."""
    items = []
    title = extract_title(html)

    # Find all elements with data-narrate attribute
    pattern = r'<(\w+)\s+[^>]*?data-narrate="([^"]*)"'
    for m in re.finditer(pattern, html, re.DOTALL):
        tag = m.group(1)
        narrate_text = m.group(2).strip()
        if not narrate_text:
            continue

        # Get classes from the element
        full_tag = html[m.start():m.end() + 200]
        class_match = re.search(r'class="([^"]*)"', full_tag)
        classes = class_match.group(1) if class_match else ""

        # Get ID if present
        id_match = re.search(r'\bid="([^"]*)"', full_tag)
        elem_id = id_match.group(1) if id_match else ""

        # Extract first sentence as summary (up to 200 chars)
        summary = narrate_text
        dot = summary.find(". ")
        if dot > 0 and dot < 200:
            summary = summary[:dot + 1]
        elif len(summary) > 200:
            summary = summary[:197] + "..."

        items.append({
            "page": page,
            "page_title": title,
            "type": classify_element(tag, classes),
            "id": elem_id,
            "summary": summary,
            "full_text": narrate_text,
        })

    return items


def main():
    print("Building evidence master index...")
    all_items = []
    page_count = 0

    for f in sorted(SITE_ROOT.glob("*.html")):
        html = f.read_text(encoding="utf-8", errors="replace")
        page = f.name
        items = extract_evidence_items(html, page)
        if items:
            all_items.extend(items)
            page_count += 1

    # Assign sequential reference numbers
    for i, item in enumerate(all_items, 1):
        item["ref"] = f"EV-{i:04d}"

    # Collect type counts
    type_counts = {}
    for item in all_items:
        t = item["type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    index = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "total_items": len(all_items),
        "pages_scanned": page_count,
        "type_counts": dict(sorted(type_counts.items(), key=lambda x: -x[1])),
        "items": all_items,
    }

    out = SITE_ROOT / "data" / "evidence_master_index.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Extracted {len(all_items)} evidence items from {page_count} pages")
    print(f"  Types: {type_counts}")
    print(f"  Written to {out}")


if __name__ == "__main__":
    main()
