#!/usr/bin/env python3
"""
TENET5 — Batch fix for broken #main skip-link anchors.
Finds pages with <a href="#main" ...> but no id="main" element,
and adds id="main" to the first major content container after the header frame.
"""
import os
import re

SITE_DIR = os.path.dirname(os.path.abspath(__file__))

# All 42 pages identified by the link audit
AFFECTED_PAGES = [
    "5gw-subversion.html", "about.html", "acelephius-report.html",
    "acelephius-wardoll.html", "arms-pipeline.html", "belleville.html",
    "bloggins.html", "calgary.html", "carney-conflicts.html",
    "cda-institute-psyop.html", "charity-pipeline.html",
    "epstein-canadian-connections.html", "evidence-index.html",
    "evidence-ns-oic.html", "findings.html", "foreign-influence.html",
    "genocide-evidence.html", "hansard-dashboard.html",
    "hansard-evidence.html", "influence-target-alpha.html",
    "institutional-malice.html", "ledger-book.html", "legislation.html",
    "mp-analysis.html", "mp-brief.html", "mp-scorecard.html",
    "municipal-accountability.html", "municipal-intelligence.html",
    "ottawa.html", "petitions.html", "procurement-analysis.html",
    "publications.html", "quinte-west.html", "records.html",
    "rogue-state.html", "s504-court-filing.html", "sector-lobbying.html",
    "toronto.html", "vancouver.html", "sitemap.html",
    "share-pack.html", "convergence-matrix.html",
]

def fix_page(filepath):
    """Add id='main' to the first content container after the header frame."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has id="main"
    if 'id="main"' in content:
        return False

    # Skip if no #main skip-link
    if '#main' not in content:
        return False

    # Strategy: Find the first <div class="container"> or similar content wrapper
    # that appears after the site-header-frame div, and add id="main" to it.

    # Pattern 1: <div class="container"> (most common)
    pattern1 = re.compile(r'(<div\s+class="container")', re.IGNORECASE)
    # Pattern 2: <div class="wrap"> or <div class="xx-wrap">
    pattern2 = re.compile(r'(<div\s+class="[^"]*wrap[^"]*")', re.IGNORECASE)
    # Pattern 3: <main> tag
    pattern3 = re.compile(r'(<main\b[^>]*)', re.IGNORECASE)

    replaced = False

    # Try pattern 1 first
    match = pattern1.search(content)
    if match:
        old = match.group(1)
        new = old.replace('class="container"', 'id="main" class="container"')
        content = content.replace(old, new, 1)
        replaced = True

    # If no container div, try wrap pattern
    if not replaced:
        match = pattern2.search(content)
        if match:
            old = match.group(1)
            # Insert id="main" after <div
            new = old.replace('<div ', '<div id="main" ', 1)
            if new == old:
                new = old.replace('<div\n', '<div id="main"\n', 1)
            content = content.replace(old, new, 1)
            replaced = True

    # If still nothing, try <main> tag
    if not replaced:
        match = pattern3.search(content)
        if match:
            old = match.group(1)
            if 'id=' not in old:
                new = old + ' id="main"'
                content = content.replace(old, new, 1)
                replaced = True

    if replaced:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False


def main():
    fixed = 0
    skipped = 0
    failed = []

    for page in AFFECTED_PAGES:
        filepath = os.path.join(SITE_DIR, page)
        if not os.path.exists(filepath):
            print(f"  ⊘ {page} — not found")
            continue

        try:
            if fix_page(filepath):
                print(f"  ✓ {page}")
                fixed += 1
            else:
                print(f"  ~ {page} — already has id='main' or no pattern matched")
                skipped += 1
        except Exception as e:
            print(f"  ✗ {page} — {e}")
            failed.append(page)

    print(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"  Fixed: {fixed}  |  Skipped: {skipped}  |  Failed: {len(failed)}")
    if failed:
        print(f"  Failed pages: {', '.join(failed)}")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


if __name__ == '__main__':
    main()
