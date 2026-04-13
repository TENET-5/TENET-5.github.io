#!/usr/bin/env python3
"""Validate SC_FRAME BUSTER presence across all TENET5 HTML pages.

Every page (except index.html, 404.html, auth-callback.html) must contain
the frame buster script that redirects bare page loads into the iframe shell.

Exit code 0 = all pages valid, 1 = pages missing frame buster.
"""
import glob
import sys

SKIP_PAGES = {"index.html", "404.html", "auth-callback.html", "test-narration-validation.html"}
BUSTER_MARKER = "SC_FRAME BUSTER"

def main():
    missing = []
    checked = 0

    for path in sorted(glob.glob("*.html")):
        if path in SKIP_PAGES:
            continue
        checked += 1
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read(4096)  # Buster is always in <head>, first 4KB

        if BUSTER_MARKER not in content:
            missing.append(path)

    print(f"Frame Buster Validation: {checked} pages checked")
    if missing:
        print(f"MISSING ({len(missing)}):")
        for p in missing:
            print(f"  {p}")
        sys.exit(1)
    else:
        print("All pages have frame buster protection.")
        sys.exit(0)

if __name__ == "__main__":
    main()
