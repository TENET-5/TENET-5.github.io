#!/usr/bin/env python3
"""Generate feed.xml (Atom) from recent git commits and page metadata.

Run from site root: python build-feed.py
"""

import html as htmlmod
import re
from datetime import datetime, timezone
from pathlib import Path

SITE = "https://tenet-5.github.io"
SITE_NAME = "TENET5 — Canadian Government Accountability Investigation"
AUTHOR = "Daniel Perry"
FEED_ID = f"{SITE}/feed.xml"


def extract_title(html_str):
    m = re.search(r"<title>([^<]+)</title>", html_str, re.IGNORECASE)
    return htmlmod.unescape(m.group(1).strip()) if m else ""


def extract_description(html_str):
    m = re.search(
        r'<meta\s+(?:name|property)=["\'](?:og:)?description["\']\s+content=["\']([^"\']+)["\']',
        html_str, re.IGNORECASE,
    )
    if not m:
        m = re.search(
            r'<meta\s+content=["\']([^"\']+)["\']\s+(?:name|property)=["\'](?:og:)?description["\']',
            html_str, re.IGNORECASE,
        )
    return htmlmod.unescape(m.group(1).strip()) if m else ""


def escape_xml(text):
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


SKIP = {"404.html", "auth-callback.html", "test-narration-validation.html"}


def main():
    root = Path(".")
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Collect all pages
    entries = []
    for f in sorted(root.glob("*.html")):
        if f.name in SKIP:
            continue
        html_str = f.read_text(encoding="utf-8", errors="replace")
        title = extract_title(html_str)
        desc = extract_description(html_str)
        if not title:
            continue
        url = f"{SITE}/{f.name}"
        # Use file mtime as updated date
        mtime = datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc)
        entries.append({
            "title": escape_xml(title),
            "url": url,
            "id": url,
            "summary": escape_xml(desc) if desc else escape_xml(title),
            "updated": mtime.strftime("%Y-%m-%dT%H:%M:%SZ"),
        })

    # Sort by most recently updated
    entries.sort(key=lambda e: e["updated"], reverse=True)
    # Limit to 50 most recent
    entries = entries[:50]

    # Build Atom XML
    xml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        f"  <title>{escape_xml(SITE_NAME)}</title>",
        f'  <link href="{SITE}/feed.xml" rel="self"/>',
        f'  <link href="{SITE}/" rel="alternate"/>',
        f"  <id>{FEED_ID}</id>",
        f"  <updated>{now}</updated>",
        f"  <author><name>{escape_xml(AUTHOR)}</name></author>",
        "  <subtitle>Evidence-based accountability investigation tracking Canadian government misconduct, corruption, and institutional failures.</subtitle>",
        f'  <icon>{SITE}/img/tenet5_logo.png</icon>',
        f'  <logo>{SITE}/img/og-card.png</logo>',
    ]

    for entry in entries:
        xml.append("  <entry>")
        xml.append(f"    <title>{entry['title']}</title>")
        xml.append(f'    <link href="{entry["url"]}"/>')
        xml.append(f"    <id>{entry['id']}</id>")
        xml.append(f"    <updated>{entry['updated']}</updated>")
        xml.append(f"    <summary>{entry['summary']}</summary>")
        xml.append("  </entry>")

    xml.append("</feed>")
    xml.append("")

    out = root / "feed.xml"
    out.write_text("\n".join(xml), encoding="utf-8")
    print(f"Generated feed.xml with {len(entries)} entries")


if __name__ == "__main__":
    main()
