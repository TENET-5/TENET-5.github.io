#!/usr/bin/env python3
# Copyright (c) 2024-2026 Daniel Perry. All Rights Reserved.
# Licensed under EOSL-2.0.
"""Ontario Provincial Data Collector — Hansard, Bills, MPPs, Contributions.

Collects public data from the Ontario Legislative Assembly (ola.org)
and Elections Ontario (finances.elections.on.ca).

Data sources (ALL PUBLIC RECORDS):
  - Ontario Hansard: ola.org/en/legislative-business/house-hansard-index
  - Ontario Bills: ola.org/en/legislative-business/bills
  - Ontario MPPs: ola.org/en/members/current
  - Ontario Contributions: finances.elections.on.ca/en/contributions

Usage:
  python ontario_collector.py --mpps          # Collect current MPPs
  python ontario_collector.py --bills         # Collect current session bills
  python ontario_collector.py --contributions # Collect contribution data
  python ontario_collector.py --all           # Collect everything

SYSTEM_SEED = 118400
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import re
import ssl
import sys
import time
import urllib.request
import urllib.error
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, List, Optional

SYSTEM_SEED = 118400
DATA_DIR = Path(__file__).parent.parent / "ontario"
RATE_LIMIT = 1.5  # seconds between requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
_log = logging.getLogger("ontario")

# SSL context for government sites
_ctx = ssl.create_default_context()
_ctx.check_hostname = False
_ctx.verify_mode = ssl.CERT_NONE


def _fetch(url: str, timeout: float = 15.0) -> str:
    """Fetch a URL with rate limiting and government-site SSL handling."""
    _log.debug("GET %s", url)
    req = urllib.request.Request(url, headers={
        "User-Agent": "TENET5-OSINT/1.0 (government accountability research)",
        "Accept": "text/html,application/json",
    })
    time.sleep(RATE_LIMIT)
    try:
        with urllib.request.urlopen(req, context=_ctx, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        _log.error("Fetch error %s: %s", url, e)
        return ""


class SimpleHTMLTableParser(HTMLParser):
    """Extract tables from HTML pages."""

    def __init__(self):
        super().__init__()
        self.tables: List[List[List[str]]] = []
        self._current_table: List[List[str]] = []
        self._current_row: List[str] = []
        self._current_cell: str = ""
        self._in_table = False
        self._in_row = False
        self._in_cell = False

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self._in_table = True
            self._current_table = []
        elif tag == "tr" and self._in_table:
            self._in_row = True
            self._current_row = []
        elif tag in ("td", "th") and self._in_row:
            self._in_cell = True
            self._current_cell = ""
        elif tag == "a" and self._in_cell:
            for name, value in attrs:
                if name == "href":
                    self._current_cell += f" [{value}]"

    def handle_endtag(self, tag):
        if tag == "table" and self._in_table:
            self._in_table = False
            if self._current_table:
                self.tables.append(self._current_table)
        elif tag == "tr" and self._in_row:
            self._in_row = False
            if self._current_row:
                self._current_table.append(self._current_row)
        elif tag in ("td", "th") and self._in_cell:
            self._in_cell = False
            self._current_row.append(self._current_cell.strip())

    def handle_data(self, data):
        if self._in_cell:
            self._current_cell += data.strip()


class SimpleHTMLListParser(HTMLParser):
    """Extract list items and links from HTML."""

    def __init__(self):
        super().__init__()
        self.items: List[Dict[str, str]] = []
        self._in_li = False
        self._current_text = ""
        self._current_href = ""

    def handle_starttag(self, tag, attrs):
        if tag == "li":
            self._in_li = True
            self._current_text = ""
            self._current_href = ""
        elif tag == "a" and self._in_li:
            for name, value in attrs:
                if name == "href":
                    self._current_href = value

    def handle_endtag(self, tag):
        if tag == "li" and self._in_li:
            self._in_li = False
            if self._current_text.strip():
                self.items.append({
                    "text": self._current_text.strip(),
                    "href": self._current_href,
                })

    def handle_data(self, data):
        if self._in_li:
            self._current_text += data


def collect_mpps() -> List[Dict]:
    """Collect current Ontario MPPs from ola.org."""
    _log.info("Collecting Ontario MPPs...")
    url = "https://www.ola.org/en/members/current"
    html = _fetch(url)
    if not html:
        return []

    # Extract MPP data from the page
    mpps = []

    # Parse member links: /en/members/all/firstname-lastname
    pattern = re.compile(
        r'<a[^>]*href="(/en/members/all/[^"]+)"[^>]*>([^<]+)</a>',
        re.IGNORECASE,
    )
    matches = pattern.findall(html)

    # Also look for riding info
    riding_pattern = re.compile(
        r'<span[^>]*class="[^"]*riding[^"]*"[^>]*>([^<]+)</span>',
        re.IGNORECASE,
    )
    ridings = riding_pattern.findall(html)

    # Party pattern
    party_pattern = re.compile(
        r'<span[^>]*class="[^"]*party[^"]*"[^>]*>([^<]+)</span>',
        re.IGNORECASE,
    )
    parties = party_pattern.findall(html)

    for i, (href, name) in enumerate(matches):
        mpp = {
            "name": name.strip(),
            "url": f"https://www.ola.org{href}",
            "riding": ridings[i] if i < len(ridings) else "",
            "party": parties[i] if i < len(parties) else "",
            "province": "Ontario",
            "level": "provincial",
        }
        mpps.append(mpp)

    _log.info("Collected %d Ontario MPPs", len(mpps))
    return mpps


def collect_bills(parliament: int = 43, session: int = 2) -> List[Dict]:
    """Collect Ontario bills from current session."""
    _log.info("Collecting Ontario bills (Parliament %d, Session %d)...", parliament, session)
    url = f"https://www.ola.org/en/legislative-business/bills/parliament-{parliament}/session-{session}"
    html = _fetch(url)
    if not html:
        return []

    bills = []

    # Parse bill links: /en/legislative-business/bills/parliament-43/session-2/bill-XXX
    bill_pattern = re.compile(
        r'<a[^>]*href="(/en/legislative-business/bills/parliament-\d+/session-\d+/bill-[^"]+)"[^>]*>\s*'
        r'Bill\s+(\d+)\s*</a>',
        re.IGNORECASE,
    )

    # Also get bill titles from nearby text
    title_pattern = re.compile(
        r'Bill\s+\d+[^<]*<[^>]*>[^<]*</[^>]*>\s*([^<]+)',
        re.IGNORECASE,
    )
    titles = title_pattern.findall(html)

    for i, (href, number) in enumerate(bill_pattern.findall(html)):
        bill = {
            "number": f"Bill {number}",
            "bill_num": int(number),
            "url": f"https://www.ola.org{href}",
            "title": titles[i].strip() if i < len(titles) else "",
            "parliament": parliament,
            "session": session,
            "province": "Ontario",
            "level": "provincial",
        }
        bills.append(bill)

    _log.info("Collected %d Ontario bills", len(bills))
    return bills


def collect_contributions() -> Dict[str, Any]:
    """Collect Ontario political contribution summary from Elections Ontario."""
    _log.info("Collecting Ontario contribution data...")
    url = "https://finances.elections.on.ca/en/contributions"
    html = _fetch(url)
    if not html:
        return {"error": "Could not fetch Elections Ontario"}

    # Parse any tables on the contributions page
    parser = SimpleHTMLTableParser()
    try:
        parser.feed(html)
    except Exception as e:
        _log.warning("HTML parse error: %s", e)

    result = {
        "source": "Elections Ontario (finances.elections.on.ca)",
        "source_url": "https://finances.elections.on.ca/en/contributions",
        "province": "Ontario",
        "level": "provincial",
        "tables_found": len(parser.tables),
        "disclaimer": "Ontario political contributions over $200 are publicly disclosed. All data from Elections Ontario public records.",
        "generated": time.strftime("%Y-%m-%d"),
        "seed": SYSTEM_SEED,
    }

    # Extract whatever data is in the tables
    if parser.tables:
        for i, table in enumerate(parser.tables[:3]):
            headers = table[0] if table else []
            rows = table[1:] if len(table) > 1 else []
            result[f"table_{i}"] = {
                "headers": headers,
                "rows": rows[:50],  # cap at 50 rows
                "total_rows": len(rows),
            }

    _log.info("Contributions page: %d tables found", len(parser.tables))
    return result


def save_data(data: Any, filename: str) -> None:
    """Save data to the Ontario data directory."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        if isinstance(data, list):
            for item in data:
                f.write(json.dumps(item, ensure_ascii=False, default=str) + "\n")
        else:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    _log.info("Saved %s", path)


def main():
    parser = argparse.ArgumentParser(
        description="Collect Ontario provincial data (public records)",
    )
    parser.add_argument("--mpps", action="store_true", help="Collect current MPPs")
    parser.add_argument("--bills", action="store_true", help="Collect current session bills")
    parser.add_argument("--contributions", action="store_true", help="Collect contribution data")
    parser.add_argument("--all", action="store_true", help="Collect everything")
    parser.add_argument("--verbose", action="store_true", help="Debug logging")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not any([args.mpps, args.bills, args.contributions, args.all]):
        parser.print_help()
        return

    total = 0

    if args.mpps or args.all:
        mpps = collect_mpps()
        if mpps:
            save_data(mpps, f"mpps_{time.strftime('%Y%m%d')}.jsonl")
            total += len(mpps)

    if args.bills or args.all:
        bills = collect_bills()
        if bills:
            save_data(bills, f"bills_{time.strftime('%Y%m%d')}.jsonl")
            total += len(bills)

    if args.contributions or args.all:
        contribs = collect_contributions()
        save_data(contribs, f"contributions_{time.strftime('%Y%m%d')}.json")
        total += 1

    _log.info("Total records collected: %d", total)
    _log.info("Data saved to: %s", DATA_DIR)


if __name__ == "__main__":
    main()
