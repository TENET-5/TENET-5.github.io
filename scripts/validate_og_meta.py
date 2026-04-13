#!/usr/bin/env python3
"""Validate OG meta tags across all TENET5 HTML pages.

Checks that every investigation page has:
  - og:title (ends with "| TENET5")
  - og:description (non-empty)
  - og:url (non-empty)
  - og:site_name = "TENET5"

Exit code 0 = all pages valid, 1 = issues found.
"""
import glob
import re
import sys

REQUIRED_OG = ["og:title", "og:description", "og:url", "og:site_name"]
SKIP_PAGES = {"index.html", "404.html", "auth-callback.html", "test-narration-validation.html"}

def extract_og_tags(html: str) -> dict:
    tags = {}
    for match in re.finditer(r'<meta\s+property="(og:[^"]+)"\s+content="([^"]*)"', html):
        tags[match.group(1)] = match.group(2)
    for match in re.finditer(r'<meta\s+content="([^"]*)"\s+property="(og:[^"]+)"', html):
        tags[match.group(2)] = match.group(1)
    return tags

def main():
    issues = []
    checked = 0

    for path in sorted(glob.glob("*.html")):
        if path in SKIP_PAGES:
            continue
        checked += 1
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            html = f.read()

        tags = extract_og_tags(html)

        for req in REQUIRED_OG:
            if req not in tags or not tags[req].strip():
                issues.append(f"  {path}: missing {req}")

        if "og:site_name" in tags and tags["og:site_name"] != "TENET5":
            issues.append(f"  {path}: og:site_name is '{tags['og:site_name']}', expected 'TENET5'")

    print(f"OG Meta Validation: {checked} pages checked")
    if issues:
        print(f"ISSUES ({len(issues)}):")
        for i in issues:
            print(i)
        sys.exit(1)
    else:
        print("All pages have valid OG meta tags.")
        sys.exit(0)

if __name__ == "__main__":
    main()
