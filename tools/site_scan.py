#!/usr/bin/env python3
"""Scan accountability site for broken links and missing data files."""
import glob
import os
import re

html_files = set(os.path.basename(f) for f in glob.glob("*.html"))

data_files = set()
for root, dirs, files in os.walk("data"):
    for f in files:
        data_files.add(os.path.join(root, f).replace("\\", "/"))
for root, dirs, files in os.walk("evidence"):
    for f in files:
        data_files.add(os.path.join(root, f).replace("\\", "/"))

broken_links = []
missing_data = []

for hf in sorted(glob.glob("*.html")):
    with open(hf, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    # Check href to local .html
    for m in re.finditer(r'href="([^"]+\.html)', content):
        link = m.group(1).split("?")[0].split("#")[0]
        if not link.startswith("http") and link not in html_files:
            broken_links.append((hf, link))

    # Check fetch() to data files
    for m in re.finditer(r"fetch\(['\"]([^'\"]+)['\"]\)", content):
        path = m.group(1).lstrip("./")
        if not path.startswith("http") and not os.path.exists(path):
            missing_data.append((hf, path))

print(f"HTML files: {len(html_files)}")
print(f"Data files: {len(data_files)}")
print()

if broken_links:
    seen = set()
    print(f"BROKEN LINKS ({len(set(broken_links))}):")
    for page, link in sorted(set(broken_links)):
        if (page, link) not in seen:
            seen.add((page, link))
            print(f"  {page} -> {link}")
else:
    print("No broken links.")

print()
if missing_data:
    seen = set()
    print(f"MISSING DATA ({len(set(missing_data))}):")
    for page, path in sorted(set(missing_data)):
        if (page, path) not in seen:
            seen.add((page, path))
            print(f"  {page} -> {path}")
else:
    print("No missing data files.")
