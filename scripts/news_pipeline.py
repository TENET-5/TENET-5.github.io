#!/usr/bin/env python3
"""
TENET5 News Page Pipeline
Fetches live Canadian news feeds, caches headlines for GitHub Pages, and generates a brief via NemoClaw if configured.
"""

import json
import os
import re
import socket
import sys
import time
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
NEWS_DIR = ROOT / "data" / "news"
NEWS_DIR.mkdir(parents=True, exist_ok=True)
HEADLINES_FILE = NEWS_DIR / "headlines.json"
BRIEF_FILE = NEWS_DIR / "brief.json"

FEEDS = [
    {"name": "CBC Politics", "url": "https://www.cbc.ca/cmlink/rss-politics"},
    {"name": "CBC Canada", "url": "https://www.cbc.ca/cmlink/rss-canada"},
    {"name": "Global News CA", "url": "https://globalnews.ca/canada/feed/"},
]

USER_AGENT = "TENET5 News Pipeline/1.0 (+https://tenet5.github.io)"


def fetch_url(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=20) as res:
        return res.read().decode("utf-8", errors="replace")


def extract_text(node, tags):
    for tag in tags:
        elem = node.find(tag)
        if elem is not None and elem.text:
            return elem.text.strip()
    return ""


def extract_link(node):
    link = node.find("link")
    if link is not None and link.text:
        return link.text.strip()
    href = node.attrib.get("href")
    if href:
        return href.strip()
    # Some Atom feeds use link rel="alternate"
    for child in node.findall("link"):
        if child.attrib.get("rel") == "alternate" and child.attrib.get("href"):
            return child.attrib["href"].strip()
    return ""


def parse_feed(name, url):
    print(f"Fetching feed: {name}")
    try:
        raw = fetch_url(url)
    except (HTTPError, URLError, TimeoutError, socket.timeout, OSError) as exc:
        print(f"  [WARN] Failed to fetch {name}: {exc}")
        return []

    try:
        doc = ET.fromstring(raw)
    except ET.ParseError as exc:
        print(f"  [WARN] Failed to parse XML for {name}: {exc}")
        return []

    items = []
    # RSS item tags
    for item in doc.findall(".//item"):
        title = extract_text(item, ["title"])
        link = extract_link(item)
        date = extract_text(item, ["pubDate", "published", "updated"])
        items.append({"title": title, "link": link, "date": date, "source": name})

    # Atom entry tags
    for entry in doc.findall(".//{http://www.w3.org/2005/Atom}entry"):
        title = extract_text(entry, ["{http://www.w3.org/2005/Atom}title"])
        link = extract_link(entry)
        date = extract_text(entry, ["{http://www.w3.org/2005/Atom}updated", "{http://www.w3.org/2005/Atom}published"])
        items.append({"title": title, "link": link, "date": date, "source": name})

    valid_items = [item for item in items if item["title"] and item["link"]]
    return valid_items


def normalize_date(value: str):
    if not value:
        return 0
    try:
        # Remove timezone names and parse natural formats
        value = re.sub(r"\s+\([^)]+\)", "", value).strip()
        return int(datetime.strptime(value[:25], "%a, %d %b %Y %H:%M:%S").timestamp())
    except Exception:
        try:
            return int(datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp())
        except Exception:
            return 0


def store_headlines(items):
    NEWS_DIR.mkdir(parents=True, exist_ok=True)
    with open(HEADLINES_FILE, "w", encoding="utf-8") as f:
        json.dump({"generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "headlines": items}, f, indent=2, ensure_ascii=False)
    print(f"  [OK] Saved {len(items)} headlines to {HEADLINES_FILE}")


def write_brief(brief_text, source="NemoClaw"):
    payload = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": source,
        "brief": brief_text,
    }
    with open(BRIEF_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"  [OK] Saved brief to {BRIEF_FILE}")


def generate_brief(headlines):
    url = os.environ.get("NEMOCLAW_OPENAI_URL")
    if not url:
        print("  [INFO] NEMOCLAW_OPENAI_URL not configured. Skipping brief generation.")
        return None

    prompt = (
        "You are NemoClaw, the TENET5 OSINT intelligence engine. "
        "Read the following Canadian news headlines and write a structured intelligence brief. "
        "Use clear short paragraphs and include exactly these sections:\n"
        "### MACRO THEMES\n"
        "### ACCOUNTABILITY WATCH\n"
        "### FORWARD IMPACT\n"
        "Do not hallucinate. Only use the provided headlines."
        "\n\nHeadlines:\n"
    )
    prompt += "\n".join(f"- [{item['source']}] {item['title']}" for item in headlines[:12])

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are NemoClaw, TENET5's local OSINT analyst. Be factual and concise."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 400,
    }).encode("utf-8")

    print(f"  [INFO] Requesting NemoClaw intelligence brief from {url}")
    try:
        req = Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urlopen(req, timeout=30) as res:
            data = json.loads(res.read().decode("utf-8", errors="replace"))

        if "choices" in data and data["choices"]:
            text = data["choices"][0].get("message", {}).get("content", "")
            return text.strip()
        print(f"  [WARN] NemoClaw response missing choices: {data}")
    except Exception as exc:
        print(f"  [WARN] NemoClaw brief generation failed: {exc}")
    return None


def main():
    print("\nTENET5 News Pipeline — NemoClaw news page maintenance\n")
    all_items = []
    for feed in FEEDS:
        items = parse_feed(feed["name"], feed["url"])
        all_items.extend(items)

    for item in all_items:
        item["date_ts"] = normalize_date(item["date"])

    all_items.sort(key=lambda x: x["date_ts"], reverse=True)
    headlines = [
        {"title": item["title"], "link": item["link"], "source": item["source"], "date": item["date"], "when": item["date_ts"]}
        for item in all_items[:20]
    ]

    store_headlines(headlines)
    brief_text = generate_brief(headlines)
    if brief_text:
        write_brief(brief_text)
    else:
        if BRIEF_FILE.exists():
            print(f"  [INFO] Keeping existing brief at {BRIEF_FILE}")
        else:
            write_brief("NemoClaw intelligence brief unavailable. Configure NEMOCLAW_OPENAI_URL to enable local briefing.")

    if headlines:
        print(f"\nFinished news pipeline: {len(headlines)} headlines cached.")
    else:
        print("\nWARNING: No headlines were cached.")


if __name__ == "__main__":
    main()
