#!/usr/bin/env python3
"""
TENET5 Canonical Figure Validator
==================================
Checks HTML pages against data/canonical_figures.json for discrepancies.
Run during CI/CD to catch figure drift before deployment.

Usage: python tools/validate_figures.py [--fix]
"""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
FIGURES_FILE = ROOT / "data" / "canonical_figures.json"

# Figures to check and their search patterns
CHECK_MAP = {
    "brookfield_aum": [
        (r"\$10T", "$10T (should be $1T+)"),
        (r"10 trillion.*[Bb]rookfield", "10 trillion Brookfield (should be 1 trillion)"),
        (r"ten trillion.*[Bb]rookfield", "ten trillion Brookfield (should be one trillion)"),
    ],
    "maid_confirmed": [
        # Only flag if a page says a different confirmed number
        (r"7[0-5],\d{3}.*MAID.*confirmed", "outdated MAID confirmed figure"),
    ],
}


def load_figures():
    with open(FIGURES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def scan_pages():
    issues = []
    html_files = sorted(ROOT.glob("*.html"))

    for html_file in html_files:
        name = html_file.name
        if name in ("index.html", "404.html", "auth-callback.html"):
            continue

        try:
            content = html_file.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue

        for fig_key, patterns in CHECK_MAP.items():
            for pattern, desc in patterns:
                matches = re.findall(pattern, content)
                if matches:
                    issues.append({
                        "file": name,
                        "figure": fig_key,
                        "issue": desc,
                        "matches": len(matches),
                    })

    return issues


def main():
    if not FIGURES_FILE.exists():
        print("ERROR: canonical_figures.json not found")
        sys.exit(1)

    figures = load_figures()
    print(f"Loaded {len(figures) - 1} canonical figures (excluding _meta)")
    print(f"Scanning {len(list(ROOT.glob('*.html')))} HTML pages...")
    print()

    issues = scan_pages()

    if issues:
        print(f"ISSUES FOUND: {len(issues)}")
        for iss in issues:
            print(f"  {iss['file']}: {iss['issue']} ({iss['matches']} occurrence(s))")
        print()
        print("Run figure audit to fix: search for the pattern and replace with canonical value")
        sys.exit(1)
    else:
        print("ALL FIGURES CONSISTENT — no discrepancies found")
        sys.exit(0)


if __name__ == "__main__":
    main()
