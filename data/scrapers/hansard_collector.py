#!/usr/bin/env python3
"""
hansard_collector.py — Collect Canadian Hansard debates from OpenParliament.ca

All data is from PUBLIC GOVERNMENT RECORDS via the open OpenParliament.ca REST API.
No authentication required. Rate limited to 1 request per second.

Usage:
    python hansard_collector.py --recent [--days 30]
    python hansard_collector.py --mp trudeau-justin
    python hansard_collector.py --votes [--session 45-1]
    python hansard_collector.py --search "foreign interference"
    python hansard_collector.py --bills [--session 45-1]
"""

import argparse
import json
import logging
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

BASE_URL = "https://api.openparliament.ca"
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hansard")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("hansard_collector")

# ---------------------------------------------------------------------------
# Rate-limited HTTP helper
# ---------------------------------------------------------------------------

_last_request_time = 0.0


def _rate_limit():
    """Enforce 1 request per second."""
    global _last_request_time
    now = time.monotonic()
    elapsed = now - _last_request_time
    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)
    _last_request_time = time.monotonic()


def fetch_json(url):
    """Fetch a URL and return parsed JSON. Handles rate limiting and errors."""
    _rate_limit()
    log.info("GET %s", url)
    req = urllib.request.Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "TENET5-HansardCollector/1.0 (public-government-data)",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        log.error("HTTP %d for %s: %s", exc.code, url, exc.reason)
        return None
    except urllib.error.URLError as exc:
        log.error("URL error for %s: %s", url, exc.reason)
        return None
    except Exception as exc:
        log.error("Unexpected error fetching %s: %s", url, exc)
        return None


def fetch_all_pages(url, max_pages=100):
    """Follow pagination, yielding each item from 'objects' across pages."""
    items = []
    page = 0
    while url and page < max_pages:
        data = fetch_json(url)
        if data is None:
            break
        objects = data.get("objects", [])
        items.extend(objects)
        log.info("  Page %d: got %d items (total %d)", page + 1, len(objects), len(items))
        next_url = data.get("pagination", {}).get("next_url")
        if next_url:
            if next_url.startswith("/"):
                url = BASE_URL + next_url
            elif not next_url.startswith("http"):
                url = BASE_URL + "/" + next_url
            else:
                url = next_url
            # Ensure format=json
            if "format=json" not in url:
                sep = "&" if "?" in url else "?"
                url = url + sep + "format=json"
        else:
            url = None
        page += 1
    return items


# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def save_jsonl(items, filename):
    """Save a list of dicts as JSONL (one JSON object per line)."""
    ensure_data_dir()
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        for item in items:
            f.write(json.dumps(item, ensure_ascii=False, default=str) + "\n")
    log.info("Saved %d records to %s", len(items), path)
    return path


def save_json(data, filename):
    """Save a single JSON object."""
    ensure_data_dir()
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    log.info("Saved to %s", path)
    return path


# ---------------------------------------------------------------------------
# Core collection functions
# ---------------------------------------------------------------------------

def collect_recent_debates(days=30):
    """Fetch recent House of Commons debates from the last N days."""
    log.info("Collecting debates from the last %d days", days)
    cutoff = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
    url = f"{BASE_URL}/debates/?format=json&date__gte={cutoff}"
    items = fetch_all_pages(url)
    if not items:
        log.warning("No debates found for the last %d days", days)
        return []
    filename = f"debates_last_{days}d_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    save_jsonl(items, filename)
    return items


def collect_mp_statements(mp_slug):
    """Fetch all statements by a specific MP."""
    log.info("Collecting statements for MP: %s", mp_slug)
    url = f"{BASE_URL}/politicians/{mp_slug}/statements/?format=json"
    items = fetch_all_pages(url)
    if not items:
        log.warning("No statements found for %s", mp_slug)
        return []
    filename = f"statements_{mp_slug}_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    save_jsonl(items, filename)
    return items


def collect_votes(session="45-1"):
    """Fetch all recorded votes with party breakdowns for a session."""
    log.info("Collecting votes for session %s", session)
    url = f"{BASE_URL}/votes/?format=json&session={session}"
    votes = fetch_all_pages(url)
    if not votes:
        log.warning("No votes found for session %s", session)
        return []

    # For each vote, fetch its detail page to get party breakdowns
    enriched = []
    for i, vote in enumerate(votes):
        vote_url = vote.get("url", "")
        if vote_url:
            if vote_url.startswith("/"):
                detail_url = BASE_URL + vote_url
            else:
                detail_url = vote_url
            if "format=json" not in detail_url:
                sep = "&" if "?" in detail_url else "?"
                detail_url = detail_url + sep + "format=json"
            detail = fetch_json(detail_url)
            if detail:
                vote["party_breakdown"] = detail.get("party_votes", {})
                vote["result"] = detail.get("result", "")
                vote["bill"] = detail.get("bill", {})
        enriched.append(vote)
        if (i + 1) % 50 == 0:
            log.info("  Enriched %d/%d votes", i + 1, len(votes))

    filename = f"votes_{session}_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    save_jsonl(enriched, filename)
    return enriched


def search_debates(query):
    """Full-text search Hansard for keywords."""
    log.info("Searching debates for: %s", query)
    encoded = urllib.parse.quote(query)
    url = f"{BASE_URL}/search/?format=json&q={encoded}"
    items = fetch_all_pages(url, max_pages=20)
    if not items:
        log.warning("No search results for '%s'", query)
        return []
    safe_query = query.replace(" ", "_").replace("/", "-")[:50]
    filename = f"search_{safe_query}_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    save_jsonl(items, filename)
    return items


def collect_bills(session="45-1"):
    """Fetch all bills with status and sponsors for a session."""
    log.info("Collecting bills for session %s", session)
    url = f"{BASE_URL}/bills/?format=json&session={session}"
    items = fetch_all_pages(url)
    if not items:
        log.warning("No bills found for session %s", session)
        return []
    filename = f"bills_{session}_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    save_jsonl(items, filename)
    return items


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Collect Canadian Hansard debates from OpenParliament.ca (public government records)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python hansard_collector.py --recent --days 14
  python hansard_collector.py --mp poilievre-pierre
  python hansard_collector.py --votes --session 44-1
  python hansard_collector.py --search "foreign interference"
  python hansard_collector.py --bills --session 45-1
""",
    )
    parser.add_argument("--recent", action="store_true", help="Collect recent debates")
    parser.add_argument("--days", type=int, default=30, help="Number of days for --recent (default: 30)")
    parser.add_argument("--mp", type=str, help="MP slug to collect statements for (e.g. trudeau-justin)")
    parser.add_argument("--votes", action="store_true", help="Collect recorded votes")
    parser.add_argument("--search", type=str, help="Full-text search query")
    parser.add_argument("--bills", action="store_true", help="Collect bills")
    parser.add_argument("--session", type=str, default="45-1", help="Parliamentary session (default: 45-1)")
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not any([args.recent, args.mp, args.votes, args.search, args.bills]):
        parser.print_help()
        sys.exit(1)

    results = {}

    if args.recent:
        results["debates"] = collect_recent_debates(days=args.days)
        log.info("Collected %d debate records", len(results["debates"]))

    if args.mp:
        results["statements"] = collect_mp_statements(args.mp)
        log.info("Collected %d statements for %s", len(results["statements"]), args.mp)

    if args.votes:
        results["votes"] = collect_votes(session=args.session)
        log.info("Collected %d votes for session %s", len(results["votes"]), args.session)

    if args.search:
        results["search"] = search_debates(args.search)
        log.info("Found %d search results for '%s'", len(results["search"]), args.search)

    if args.bills:
        results["bills"] = collect_bills(session=args.session)
        log.info("Collected %d bills for session %s", len(results["bills"]), args.session)

    total = sum(len(v) for v in results.values())
    log.info("Total records collected: %d", total)
    log.info("Data saved to: %s", DATA_DIR)


if __name__ == "__main__":
    main()
