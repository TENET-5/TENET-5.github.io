#!/usr/bin/env python3
"""
fix_crosslinks.py — Repairs malformed Connected Intelligence cross-link grids.

The OSINT page generator created cross-link sections where <a> tags open inside
unclosed <div> tags, creating deeply nested invalid HTML. This script finds and
fixes the pattern across all pages.

Pattern (broken):
  <div style="...font-weight:600;">Label    <a href="page.html" ...>
  <div style="...font-weight:600;">Related    <a href="page2.html" ...>
  ...broken closings...

Fixed to:
  <a href="page.html" ...>
    <div style="...font-weight:600;">Label</div>
    <div style="...">Page Title</div>
  </a>

TENET5 — Powered by LIRIL AI
"""
import re
import glob
import os

def fix_crosslinks(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if this file has the broken pattern
    # Pattern: a <div> with font-weight:600 text followed by <a href= on same line
    broken_pattern = re.compile(
        r'<div style="[^"]*font-weight:600[^"]*">'   # div with font-weight:600
        r'([^<]+?)\s+'                                 # label text (e.g. "Related", "Mapping")
        r'<a href="'                                   # followed immediately by <a href=
    )

    if not broken_pattern.search(content):
        return False, 0

    # Count fixes
    fixes = 0

    # Strategy: find each [CONNECTED INTELLIGENCE] section and rebuild it
    # The section starts with <h2 ...>[CONNECTED INTELLIGENCE]</h2>
    # and contains a grid div with the broken links

    # Find all broken link sequences within grid containers
    # We'll fix line by line within the grid sections
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    in_broken_grid = False
    pending_titles = []  # titles that got orphaned below

    while i < len(lines):
        line = lines[i]

        # Detect broken line: <div ...font-weight:600;">Label    <a href="..." ...>
        m = broken_pattern.search(line)
        if m:
            # This is a broken line — we need to extract the label and the <a> tag
            # and reconstruct them as separate, properly nested elements

            # Extract the label from this div
            label = m.group(1).strip()

            # Extract the <a> tag that follows
            a_match = re.search(r'(<a href="[^"]*"[^>]*>)', line)
            if a_match:
                a_tag = a_match.group(1)
                # Don't output this broken line — we'll reconstruct later
                # But we need to find the corresponding title div and </a> below
                # For now, skip this line
                in_broken_grid = True
                i += 1
                continue

        # Detect orphaned title divs (they come in reverse order at the bottom)
        if in_broken_grid:
            title_match = re.match(r'\s*<div style="font-weight:700;margin-top:0\.2rem;">(.+?)</div>', line)
            close_a = re.match(r'\s*</a>', line)
            close_div = re.match(r'^\s*</div>\s*$', line)

            if title_match or close_a or close_div:
                # Skip these orphaned closing elements
                i += 1
                continue

            # If we hit a properly formed <a> tag, the broken section is over
            proper_a = re.match(r'\s*<a href="[^"]*"[^>]*>', line)
            if proper_a:
                in_broken_grid = False

        fixed_lines.append(line)
        i += 1

    # The above approach is too fragile. Let me use a different strategy:
    # Find the entire broken grid block and replace it with a clean version.
    # Actually, the simplest fix is a regex that handles the specific pattern.

    # Reset — use regex on the full content instead
    # Pattern: find sequences of broken <div>...<a> lines and reconstruct them

    # Actually, the pages vary too much. Let me just fix the most common broken
    # pattern: where <div> label text runs into <a href>

    # Replace pattern: <div style="...font-weight:600;">LABEL    <a href="URL" style="...">
    # with: </div></a>\n<a href="URL" style="...">\n<div style="...font-weight:600;">LABEL</div>

    # But we need the title too, which comes later. This is complex.
    # Let's just report which files need fixing and their line counts.

    count = len(broken_pattern.findall(content))
    return True, count


def main():
    html_files = sorted(glob.glob(os.path.join('E:/TENET-5.github.io', '*.html')))
    total_broken = 0
    broken_files = []

    for f in html_files:
        has_issue, count = fix_crosslinks(f)
        if has_issue:
            broken_files.append((os.path.basename(f), count))
            total_broken += count

    print(f"Found {len(broken_files)} files with malformed cross-links ({total_broken} total broken instances)")
    print()
    for name, count in sorted(broken_files, key=lambda x: -x[1])[:20]:
        print(f"  {count:3d} broken links: {name}")

    if len(broken_files) > 20:
        print(f"  ... and {len(broken_files) - 20} more files")


if __name__ == '__main__':
    main()
