#!/usr/bin/env python3
"""Scan all HTML pages and build source provenance metadata.

For each page, extracts:
  - Existing <div class="citation"> text
  - data-source attributes
  - Known source matches from keyword patterns
  - Existing JSON-LD sourceOrganization

Outputs: data/provenance.json
Also injects <meta name="dc.source"> Dublin Core tag into pages missing one.

Run from site root:
    python build-provenance.py
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

SITE_ROOT = Path(__file__).parent

# Known government/institutional sources and keywords that indicate them
SOURCE_REGISTRY = {
    "openparliament": {
        "name": "OpenParliament.ca",
        "url": "https://openparliament.ca/",
        "type": "government_data",
        "license": "CC-BY",
    },
    "hansard": {
        "name": "House of Commons Hansard",
        "url": "https://www.ourcommons.ca/",
        "type": "parliamentary_record",
        "license": "Open Government Licence - Canada",
    },
    "elections_canada": {
        "name": "Elections Canada",
        "url": "https://www.elections.ca/",
        "type": "government_data",
        "license": "Open Government Licence - Canada",
    },
    "lobbying_registry": {
        "name": "Office of the Commissioner of Lobbying",
        "url": "https://lobbycanada.gc.ca/",
        "type": "government_registry",
        "license": "Open Government Licence - Canada",
    },
    "nsicop": {
        "name": "National Security and Intelligence Committee of Parliamentarians",
        "url": "https://www.nsicop-cpsnr.ca/",
        "type": "parliamentary_report",
        "license": "Crown Copyright",
    },
    "cra": {
        "name": "Canada Revenue Agency — Charity Data",
        "url": "https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch",
        "type": "government_data",
        "license": "Open Government Licence - Canada",
    },
    "court_records": {
        "name": "Canadian Court Records",
        "url": "https://www.fct-cf.gc.ca/",
        "type": "court_filing",
        "license": "Public Record",
    },
    "gazette": {
        "name": "Canada Gazette",
        "url": "https://gazette.gc.ca/",
        "type": "government_publication",
        "license": "Open Government Licence - Canada",
    },
    "statcan": {
        "name": "Statistics Canada",
        "url": "https://www.statcan.gc.ca/",
        "type": "government_data",
        "license": "Open Government Licence - Canada",
    },
    "criminal_code": {
        "name": "Criminal Code of Canada (R.S.C., 1985, c. C-46)",
        "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/",
        "type": "legislation",
        "license": "Crown Copyright",
    },
    "rome_statute": {
        "name": "Rome Statute of the International Criminal Court",
        "url": "https://www.icc-cpi.int/resource-library/documents/rs-eng.pdf",
        "type": "international_treaty",
        "license": "Public International Law",
    },
    "nddn_committee": {
        "name": "Standing Committee on National Defence (NDDN)",
        "url": "https://www.ourcommons.ca/Committees/en/NDDN",
        "type": "parliamentary_committee",
        "license": "Open Government Licence - Canada",
    },
    "acva_committee": {
        "name": "Standing Committee on Veterans Affairs (ACVA)",
        "url": "https://www.ourcommons.ca/Committees/en/ACVA",
        "type": "parliamentary_committee",
        "license": "Open Government Licence - Canada",
    },
}

# Keyword → source key mapping
KEYWORD_MAP = [
    (r"openparliament\.ca|OpenParliament", "openparliament"),
    (r"Hansard|hansard|House of Commons Debates", "hansard"),
    (r"Elections Canada|elections\.ca|contribution.*return", "elections_canada"),
    (r"lobbycanada|lobbying.*registry|Commissioner of Lobbying", "lobbying_registry"),
    (r"NSICOP|National Security.*Intelligence.*Committee", "nsicop"),
    (r"CRA|Canada Revenue Agency|T3010|charity.*data", "cra"),
    (r"Federal Court|court.*filing|docket|lawsuit", "court_records"),
    (r"Canada Gazette|gazette\.gc\.ca", "gazette"),
    (r"Statistics Canada|statcan|StatsCan|census", "statcan"),
    (r"Criminal Code|R\.S\.C.*C-46|s\.\s*\d+\s*of the Code", "criminal_code"),
    (r"Rome Statute|ICC|International Criminal Court|Article 7|Article 8", "rome_statute"),
    (r"NDDN|National Defence.*Committee", "nddn_committee"),
    (r"ACVA|Veterans Affairs.*Committee", "acva_committee"),
]


def extract_title(html: str) -> str:
    m = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    if m:
        t = m.group(1).strip()
        return re.sub(r"\s*[|—–]\s*TENET5?\s*$", "", t, flags=re.I)
    return ""


def extract_citations(html: str) -> list[str]:
    """Extract text from <div class="citation ..."> elements."""
    results = []
    for m in re.finditer(r'<div\s+class="citation[^"]*"[^>]*>(.*?)</div>', html, re.S):
        text = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        if text:
            results.append(text[:300])
    return results


def extract_data_sources(html: str) -> list[str]:
    """Extract data-source attribute values."""
    return list(set(re.findall(r'data-source="([^"]+)"', html)))


def match_keyword_sources(html: str) -> list[str]:
    """Match known sources by keyword patterns in the page text."""
    # Strip HTML tags for text matching
    text = re.sub(r"<[^>]+>", " ", html)
    matched = set()
    for pattern, key in KEYWORD_MAP:
        if re.search(pattern, text):
            matched.add(key)
    return sorted(matched)


def has_dc_source(html: str) -> bool:
    return bool(re.search(r'<meta\s+name="dc\.source"', html, re.I))


def inject_dc_source(html: str, sources: list[str]) -> str | None:
    """Inject Dublin Core source meta tag if not present."""
    if has_dc_source(html) or not sources:
        return None
    source_names = []
    for key in sources:
        if key in SOURCE_REGISTRY:
            source_names.append(SOURCE_REGISTRY[key]["name"])
    if not source_names:
        return None

    dc_tag = f'<meta name="dc.source" content="{"; ".join(source_names)}">'
    # Insert after last <meta> in <head>
    head_end = re.search(r"(</head>)", html, re.I)
    if head_end:
        return html[:head_end.start()] + dc_tag + "\n" + html[head_end.start():]
    return None


def main():
    print("Building source provenance metadata...")
    provenance = {}
    pages_updated = 0

    for f in sorted(SITE_ROOT.glob("*.html")):
        html = f.read_text(encoding="utf-8", errors="replace")
        page = f.name
        title = extract_title(html)

        citations = extract_citations(html)
        data_sources = extract_data_sources(html)
        keyword_sources = match_keyword_sources(html)

        # Merge all identified sources
        all_source_keys = set(keyword_sources)
        # data-source attrs might be free text, try to map them
        for ds in data_sources:
            for pattern, key in KEYWORD_MAP:
                if re.search(pattern, ds, re.I):
                    all_source_keys.add(key)

        sources_detail = []
        for key in sorted(all_source_keys):
            if key in SOURCE_REGISTRY:
                sources_detail.append(SOURCE_REGISTRY[key])

        entry = {
            "title": title,
            "citations_found": len(citations),
            "citation_excerpts": citations[:5],  # First 5 for reference
            "data_source_attrs": data_sources[:10],
            "matched_sources": sorted(all_source_keys),
            "sources": sources_detail,
        }
        provenance[page] = entry

        # Inject Dublin Core tag
        updated = inject_dc_source(html, sorted(all_source_keys))
        if updated:
            f.write_text(updated, encoding="utf-8")
            pages_updated += 1

    # Summary stats
    total_with_sources = sum(1 for p in provenance.values() if p["matched_sources"])
    total_citations = sum(p["citations_found"] for p in provenance.values())
    source_freq = {}
    for p in provenance.values():
        for s in p["matched_sources"]:
            source_freq[s] = source_freq.get(s, 0) + 1

    output = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "total_pages": len(provenance),
        "pages_with_sources": total_with_sources,
        "total_citations_found": total_citations,
        "source_frequency": dict(sorted(source_freq.items(), key=lambda x: -x[1])),
        "source_registry": SOURCE_REGISTRY,
        "pages": provenance,
    }

    out = SITE_ROOT / "data" / "provenance.json"
    out.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  {len(provenance)} pages scanned")
    print(f"  {total_with_sources} pages with identified sources")
    print(f"  {total_citations} citation elements found")
    print(f"  {pages_updated} pages got <meta name=\"dc.source\"> injected")
    print(f"  Source frequency: {dict(sorted(source_freq.items(), key=lambda x: -x[1]))}")
    print(f"  Written to {out}")


if __name__ == "__main__":
    main()
