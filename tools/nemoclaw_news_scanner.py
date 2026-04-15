#!/usr/bin/env python3
"""
NemoClaw News Scanner — TENET5 OSINT News Pipeline
Monitors Canadian news RSS feeds for MAID, corruption, lobbying,
and accountability stories. Indexes relevant articles in news_feed.json.

Usage:
  python nemoclaw_news_scanner.py          # Single scan
  python nemoclaw_news_scanner.py --loop   # Continuous (every 2 hours)

TENET5 — Powered by LIRIL AI | SEED 118400
"""

import json
import hashlib
import time
import sys
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

FEED_FILE = Path(__file__).parent.parent / "data" / "news_feed.json"
LOOP_INTERVAL = 7200  # 2 hours

# ── RSS Feed Sources ──────────────────────────────────────────────
FEEDS = [
    {
        "name": "CBC Politics",
        "url": "https://www.cbc.ca/cmlink/rss-politics",
        "category": "politics"
    },
    {
        "name": "CTV Politics",
        "url": "https://www.ctvnews.ca/rss/politics",
        "category": "politics"
    },
    {
        "name": "Parliament Bills",
        "url": "https://www.parl.ca/legisinfo/en/bills?rss=true",
        "category": "legislation"
    },
    {
        "name": "Globe Politics",
        "url": "https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/politics/",
        "category": "politics"
    },
    {
        "name": "National Post",
        "url": "https://nationalpost.com/feed",
        "category": "news"
    },
]

# ── Relevance Keywords ────────────────────────────────────────────
# Weighted: higher score = more relevant to TENET5 investigations
KEYWORDS = {
    # MAID (highest priority)
    "maid": 10, "medical assistance in dying": 15,
    "assisted dying": 12, "assisted suicide": 12,
    "euthanasia": 10, "bill c-7": 15, "bill c-14": 15,
    "track 2": 12, "track 1": 8,
    # Brookfield / Carney
    "brookfield": 12, "carney": 10, "mark carney": 15,
    "diana fox carney": 15, "maple fund": 12,
    "conflict of interest": 10, "blind trust": 10,
    # Procurement / Waste
    "arrivecan": 12, "phoenix pay": 12, "gcstrategies": 10,
    "procurement": 6, "auditor general": 8,
    # Military / Veterans
    "veterans affairs": 8, "cds": 6, "military": 5,
    "chief of defence": 8,
    # Foreign Interference
    "foreign interference": 10, "csis": 8,
    "china interference": 10, "india interference": 10,
    "fitaa": 8, "foreign influence": 8,
    # RCMP
    "rcmp": 6, "commissioner": 5,
    # Lobbying
    "lobbying": 8, "cija": 10, "lobbyist": 6,
    # Healthcare
    "healthcare": 4, "nursing": 5, "palliative": 8,
    "disability": 6, "mental health": 5,
    # WEF / Global
    "world economic forum": 10, "wef": 8, "davos": 8,
    "new world order": 12,
    # Budget / Finance
    "budget 2025": 6, "deficit": 5, "infrastructure bank": 8,
    # Parliament
    "hansard": 6, "committee": 4, "parliament": 3,
}

MINIMUM_RELEVANCE = 8  # Articles below this score are discarded


def fetch_rss(url: str, timeout: int = 15) -> str | None:
    """Fetch RSS feed XML."""
    try:
        req = Request(url, headers={
            "User-Agent": "TENET5-NewsScanner/1.0 (OSINT Research)"
        })
        with urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except (URLError, TimeoutError, Exception) as e:
        print(f"  [WARN] Failed to fetch {url}: {e}")
        return None


def parse_rss(xml_text: str) -> list[dict]:
    """Parse RSS XML into article dicts."""
    articles = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return articles

    # Support both RSS 2.0 (<item>) and Atom (<entry>)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    items = root.findall(".//item") or root.findall(".//atom:entry", ns)

    for item in items:
        title = ""
        link = ""
        description = ""
        pub_date = ""

        # RSS 2.0
        t = item.find("title")
        if t is not None and t.text:
            title = t.text.strip()
        l = item.find("link")
        if l is not None and l.text:
            link = l.text.strip()
        elif l is not None and l.get("href"):
            link = l.get("href", "").strip()
        d = item.find("description")
        if d is not None and d.text:
            description = re.sub(r"<[^>]+>", "", d.text).strip()[:500]
        p = item.find("pubDate")
        if p is not None and p.text:
            pub_date = p.text.strip()

        # Atom fallback
        if not title:
            t2 = item.find("atom:title", ns)
            if t2 is not None and t2.text:
                title = t2.text.strip()
        if not link:
            l2 = item.find("atom:link", ns)
            if l2 is not None:
                link = l2.get("href", "").strip()
        if not pub_date:
            p2 = item.find("atom:updated", ns)
            if p2 is not None and p2.text:
                pub_date = p2.text.strip()

        if title and link:
            articles.append({
                "title": title,
                "link": link,
                "description": description[:300],
                "pub_date": pub_date,
            })

    return articles


def score_article(article: dict) -> int:
    """Score article relevance to TENET5 investigations."""
    text = (article.get("title", "") + " " + article.get("description", "")).lower()
    score = 0
    matched = []
    for keyword, weight in KEYWORDS.items():
        if keyword in text:
            score += weight
            matched.append(keyword)
    article["relevance_score"] = score
    article["matched_keywords"] = matched
    return score


def article_id(article: dict) -> str:
    """Generate stable ID from article URL."""
    return hashlib.sha256(article["link"].encode()).hexdigest()[:16]


def load_feed() -> dict:
    """Load existing feed data."""
    if FEED_FILE.exists():
        try:
            with open(FEED_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {"articles": [], "last_scan": None, "total_scans": 0}


def save_feed(data: dict):
    """Save feed data."""
    FEED_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(FEED_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def scan_all_feeds() -> int:
    """Scan all RSS feeds and update news_feed.json. Returns new article count."""
    feed_data = load_feed()
    existing_ids = {a["id"] for a in feed_data["articles"]}
    new_count = 0

    print(f"\n[NEMOCLAW NEWS] Scanning {len(FEEDS)} feeds...")
    print(f"  Existing articles: {len(feed_data['articles'])}")

    for feed_info in FEEDS:
        print(f"\n  [{feed_info['name']}] {feed_info['url'][:60]}...")
        xml = fetch_rss(feed_info["url"])
        if not xml:
            continue

        articles = parse_rss(xml)
        print(f"    Found {len(articles)} items")

        for article in articles:
            aid = article_id(article)
            if aid in existing_ids:
                continue

            score = score_article(article)
            if score < MINIMUM_RELEVANCE:
                continue

            entry = {
                "id": aid,
                "title": article["title"],
                "link": article["link"],
                "description": article["description"],
                "pub_date": article.get("pub_date", ""),
                "source": feed_info["name"],
                "category": feed_info["category"],
                "relevance_score": score,
                "matched_keywords": article.get("matched_keywords", []),
                "indexed_at": datetime.now(timezone.utc).isoformat(),
                "published_to_site": False,
            }
            feed_data["articles"].insert(0, entry)  # newest first
            existing_ids.add(aid)
            new_count += 1
            print(f"    [+{score}] {article['title'][:70]}")

    # Keep max 500 articles
    feed_data["articles"] = feed_data["articles"][:500]
    feed_data["last_scan"] = datetime.now(timezone.utc).isoformat()
    feed_data["total_scans"] = feed_data.get("total_scans", 0) + 1

    save_feed(feed_data)
    print(f"\n[NEMOCLAW NEWS] Scan complete: {new_count} new articles indexed")
    print(f"  Total articles: {len(feed_data['articles'])}")
    return new_count


def main():
    loop = "--loop" in sys.argv

    if loop:
        print("[NEMOCLAW NEWS] Starting continuous scan loop (every 2 hours)")
        while True:
            try:
                scan_all_feeds()
            except Exception as e:
                print(f"[ERROR] Scan failed: {e}")
            print(f"\n[NEMOCLAW NEWS] Next scan in {LOOP_INTERVAL // 3600}h...")
            time.sleep(LOOP_INTERVAL)
    else:
        scan_all_feeds()


if __name__ == "__main__":
    main()
