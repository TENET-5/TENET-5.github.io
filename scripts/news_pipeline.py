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
ANALYSIS_FILE = NEWS_DIR / "analysis.json"

FEEDS = [
    {"name": "CBC Politics", "url": "https://www.cbc.ca/cmlink/rss-politics"},
    {"name": "CBC Canada", "url": "https://www.cbc.ca/cmlink/rss-canada"},
    {"name": "CTV Canada", "url": "https://www.ctvnews.ca/rss/ctvnews-ca-canada-public-rss-1.822284"},
    {"name": "Global News CA", "url": "https://globalnews.ca/canada/feed/"},
    {"name": "National Post", "url": "https://nationalpost.com/category/news/feed/"},
    {"name": "Globe Politics", "url": "https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/politics/?outputType=xml"},
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


def pick_topic(title: str):
    text = (title or "").lower()
    topic_rules = [
        ("Government Power & Majority Control", ["carney", "majority", "byelection", "floor", "liberal", "parliament"]),
        ("Ethics & Oversight", ["ethics", "conflict", "watchdog", "hiring", "oversight", "breach"]),
        ("Affordability & Tax Messaging", ["tax", "gas", "diesel", "affordability", "cost", "fuel"]),
        ("Security & Foreign Policy", ["arctic", "defend", "ukraine", "china", "lebanon", "nato", "foreign"]),
    ]
    for label, keywords in topic_rules:
        if any(keyword in text for keyword in keywords):
            return label
    return "Institutional Accountability"


FRAMING_PATTERNS = [
    ("Mandate language", ["majority", "sweep", "clinches", "solidify", "phase"], "The same event is framed as momentum or inevitability rather than as a decision that still warrants scrutiny."),
    ("Softened policy language", ["temporarily", "affordability", "support", "reassurance", "unity"], "Consumer-friendly wording can soften the hard trade-offs or governance implications of a policy move."),
    ("Direct ethics scrutiny", ["ethics", "conflict", "watchdog", "breach"], "When outlets use direct oversight language, the accountability stakes are made explicit instead of implied."),
]


def analyze_headlines(headlines):
    grouped = {}
    source_counts = {}
    for item in headlines:
        title = item.get("title", "")
        topic = pick_topic(title)
        grouped.setdefault(topic, []).append(item)
        source = item.get("source", "Unknown")
        source_counts[source] = source_counts.get(source, 0) + 1

    clusters = []
    for topic, items in sorted(grouped.items(), key=lambda kv: len(kv[1]), reverse=True):
        sources = sorted({entry.get("source", "Unknown") for entry in items})
        angle = "Cross-outlet convergence" if len(sources) > 1 else "Single-outlet emphasis"
        summary = (
            f"{len(items)} sourced items are clustering around {topic.lower()}. "
            f"Coverage currently emphasizes {angle.lower()} across {', '.join(sources[:4])}."
        )
        clusters.append({
            "topic": topic,
            "count": len(items),
            "angle": angle,
            "summary": summary,
            "items": items[:4],
        })

    signals = []
    joined_titles = " \n".join(item.get("title", "") for item in headlines).lower()
    for label, keywords, note in FRAMING_PATTERNS:
        hits = sum(1 for keyword in keywords if keyword in joined_titles)
        if hits:
            signals.append({"label": label, "strength": hits, "note": note})

    return {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "clusters": clusters[:4],
        "signals": sorted(signals, key=lambda item: item["strength"], reverse=True),
        "sources": [{"name": name, "count": count} for name, count in sorted(source_counts.items(), key=lambda kv: kv[1], reverse=True)],
    }


def store_analysis(analysis):
    with open(ANALYSIS_FILE, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    print(f"  [OK] Saved narrative analysis to {ANALYSIS_FILE}")


def build_local_brief(analysis):
    clusters = analysis.get("clusters", [])
    signals = analysis.get("signals", [])
    lead = clusters[0]["topic"] if clusters else "institutional accountability"
    watch = signals[0]["label"] if signals else "Narrative shifts"
    next_up = clusters[1]["topic"] if len(clusters) > 1 else "Public-cost consequences"
    return (
        "### MACRO THEMES\n"
        f"Coverage is presently converging around **{lead}**, with repeated emphasis on power, continuity, and executive control.\\n\\n"
        "### ACCOUNTABILITY WATCH\n"
        f"The strongest editorial signal in the current source set is **{watch}**. Readers should compare how different outlets soften or sharpen responsibility language.\\n\\n"
        "### FORWARD IMPACT\n"
        f"Expect the next cycle of coverage to expand around **{next_up}**, especially where public spending, oversight, or institutional legitimacy intersect."
    )


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
    analysis = analyze_headlines(headlines)
    store_analysis(analysis)

    brief_text = generate_brief(headlines)
    if brief_text:
        write_brief(brief_text)
    else:
        write_brief(build_local_brief(analysis), source="TENET5 Desk")

    if headlines:
        print(f"\nFinished news pipeline: {len(headlines)} headlines cached.")
    else:
        print("\nWARNING: No headlines were cached.")


if __name__ == "__main__":
    main()
