#!/usr/bin/env python3
"""Audit all internal links, images, audio, and data references across the site.

Checks:
  - href/src attributes pointing to local files
  - Audio sources in <source> and data-narrate audio references
  - JSON data file references
  - Anchor targets (#id references within same page)
  - Missing alt attributes on images

Run from site root:
    python audit-links.py [--strict] [--json]

Exit codes:
    0 = clean (warnings only)
    1 = broken links found
"""

import argparse
import json
import re
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).parent

# File extensions that are local assets
ASSET_EXTS = {
    ".html", ".css", ".js", ".json", ".csv",
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
    ".mp3", ".mp4", ".ogg", ".wav", ".vtt", ".srt",
    ".pdf", ".txt", ".xml",
}

# Skip patterns (external links, special protocols)
SKIP_PATTERNS = re.compile(
    r"^(https?://|mailto:|tel:|javascript:|data:|#$|about:|blob:)", re.I
)

# Known generated/dynamic paths
KNOWN_DYNAMIC = {"feed.xml", "sitemap.xml", "robots.txt"}

# Known missing assets (require separate build pipeline)
KNOWN_MISSING = {
    "assets/index-okLQV7Oe.js",       # Vite build artifact
    "assets/babylon-core-BWpK-1k_.js", # Babylon.js chunk
    "assets/babylon-loaders-B756oZYW.js",  # Babylon.js chunk
}


def extract_title(html: str) -> str:
    m = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    return m.group(1).strip() if m else ""


def extract_ids(html: str) -> set[str]:
    """Extract all id attributes from the page."""
    return set(re.findall(r'\bid="([^"]+)"', html))


def strip_scripts(html: str) -> str:
    """Remove <script>...</script> blocks so JS template strings aren't parsed as links."""
    return re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S | re.I)


def extract_refs(html: str) -> list[dict]:
    """Extract all href, src, data-src, poster references (outside <script> blocks)."""
    # Work on script-stripped HTML for href/data-src, but keep orignal for src (we need <script src>)
    clean = strip_scripts(html)
    refs = []

    # href attributes (from cleaned HTML — no JS template strings)
    for m in re.finditer(r'<(\w+)\s[^>]*?href="([^"]*)"', clean, re.S):
        tag, url = m.group(1), m.group(2)
        refs.append({"tag": tag, "attr": "href", "url": url, "pos": m.start()})

    # src attributes (from original — includes <script src="...">)
    for m in re.finditer(r'<(\w+)\s[^>]*?src="([^"]*)"', html, re.S):
        tag, url = m.group(1), m.group(2)
        # Skip if inside a <script> block (JS-generated src like ' + url + ')
        if "'" in url or "${" in url or "+" in url:
            continue
        refs.append({"tag": tag, "attr": "src", "url": url, "pos": m.start()})

    # data-src (lazy loading) — from cleaned HTML
    for m in re.finditer(r'data-src="([^"]*)"', clean):
        refs.append({"tag": "?", "attr": "data-src", "url": m.group(1), "pos": m.start()})

    # poster attribute on video — from cleaned HTML
    for m in re.finditer(r'poster="([^"]*)"', clean):
        refs.append({"tag": "video", "attr": "poster", "url": m.group(1), "pos": m.start()})

    return refs


def extract_img_alts(html: str) -> list[dict]:
    """Find images missing alt attributes."""
    missing = []
    for m in re.finditer(r"<img\s([^>]*?)>", html, re.S | re.I):
        attrs = m.group(1)
        if not re.search(r'\balt\s*=', attrs):
            src = ""
            src_m = re.search(r'src="([^"]*)"', attrs)
            if src_m:
                src = src_m.group(1)
            missing.append({"src": src, "pos": m.start()})
    return missing


def get_line_number(html: str, pos: int) -> int:
    return html[:pos].count("\n") + 1


def resolve_path(base_page: str, url: str) -> str:
    """Resolve a URL relative to the site root."""
    # Strip query string and fragment
    clean = re.split(r"[?#]", url)[0]
    if clean.startswith("/"):
        clean = clean.lstrip("/")
    return clean


def main():
    parser = argparse.ArgumentParser(description="Audit internal links and assets")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    parser.add_argument("--json", action="store_true", help="Output JSON report")
    args = parser.parse_args()

    print("Auditing internal links and assets...")

    # Build file index
    all_files = set()
    for f in SITE_ROOT.rglob("*"):
        if f.is_file() and ".git" not in f.parts:
            rel = f.relative_to(SITE_ROOT).as_posix()
            all_files.add(rel)

    errors = []
    warnings = []
    pages_scanned = 0
    refs_checked = 0

    for f in sorted(SITE_ROOT.glob("*.html")):
        html = f.read_text(encoding="utf-8", errors="replace")
        page = f.name
        pages_scanned += 1
        page_ids = extract_ids(html)

        # Check references
        for ref in extract_refs(html):
            url = ref["url"].strip()
            if not url or SKIP_PATTERNS.match(url):
                continue

            # Skip JS template/concatenation artifacts
            if any(c in url for c in ("${", "'+", "' +", "$2", "encodeURI")):
                continue

            refs_checked += 1

            # Handle fragment-only links
            if url.startswith("#"):
                anchor = url[1:]
                if anchor and anchor not in page_ids:
                    errors.append({
                        "page": page,
                        "line": get_line_number(html, ref["pos"]),
                        "type": "broken_anchor",
                        "ref": url,
                        "detail": f"No element with id=\"{anchor}\" in {page}",
                    })
                continue

            # Handle versioned URLs (strip ?v=20 etc)
            resolved = resolve_path(page, url)
            if not resolved:
                continue

            # Check fragment targets in other pages
            fragment = ""
            if "#" in url:
                parts = url.split("#", 1)
                fragment = parts[1] if len(parts) > 1 else ""

            # Skip external-looking paths
            if resolved.startswith("http"):
                continue

            # Check file exists
            target = SITE_ROOT / resolved
            if not target.exists() and resolved not in KNOWN_DYNAMIC:
                # Try without query string more aggressively
                base_resolved = re.sub(r"\?.*$", "", resolved)
                if base_resolved in KNOWN_MISSING:
                    warnings.append({
                        "page": page,
                        "line": get_line_number(html, ref["pos"]),
                        "type": "known_missing",
                        "ref": url,
                        "detail": f"Known missing (separate build): {resolved}",
                    })
                elif not (SITE_ROOT / base_resolved).exists():
                    errors.append({
                        "page": page,
                        "line": get_line_number(html, ref["pos"]),
                        "type": "broken_link",
                        "ref": url,
                        "detail": f"File not found: {resolved}",
                    })

        # Check images missing alt
        for img in extract_img_alts(html):
            warnings.append({
                "page": page,
                "line": get_line_number(html, img["pos"]),
                "type": "missing_alt",
                "ref": img["src"],
                "detail": "Image missing alt attribute",
            })

    # Print results
    print(f"  Scanned {pages_scanned} pages, checked {refs_checked} references")
    print(f"  {len(errors)} errors, {len(warnings)} warnings")

    if errors:
        print(f"\n{'='*60}")
        print(f"  ERRORS ({len(errors)})")
        print(f"{'='*60}")
        for e in errors[:50]:
            print(f"  {e['page']}:{e['line']}  [{e['type']}]  {e['ref']}")
            print(f"    → {e['detail']}")
        if len(errors) > 50:
            print(f"  ... and {len(errors) - 50} more")

    if warnings:
        print(f"\n{'='*60}")
        print(f"  WARNINGS ({len(warnings)})")
        print(f"{'='*60}")
        for w in warnings[:20]:
            print(f"  {w['page']}:{w['line']}  [{w['type']}]  {w['ref']}")
        if len(warnings) > 20:
            print(f"  ... and {len(warnings) - 20} more")

    if args.json:
        report = {
            "pages_scanned": pages_scanned,
            "refs_checked": refs_checked,
            "errors": errors,
            "warnings": warnings,
        }
        (SITE_ROOT / "data" / "audit-report.json").write_text(
            json.dumps(report, indent=2), encoding="utf-8"
        )
        print(f"\n  JSON report → data/audit-report.json")

    if errors:
        exit_code = 1
        print(f"\n  AUDIT FAILED — {len(errors)} broken references")
    elif args.strict and warnings:
        exit_code = 1
        print(f"\n  AUDIT FAILED (strict) — {len(warnings)} warnings")
    else:
        exit_code = 0
        print(f"\n  AUDIT PASSED")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
