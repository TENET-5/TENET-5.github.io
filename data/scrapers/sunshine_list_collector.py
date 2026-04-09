#!/usr/bin/env python3
# Copyright (c) 2024-2026 Daniel Perry. All Rights Reserved.
# Licensed under EOSL-2.0.
"""Ontario Sunshine List Collector -- Hastings County Area.

Focused scraper for the Ontario Public Sector Salary Disclosure
(the "Sunshine List") filtering for Hastings County area employers.

The Sunshine List is published annually by the Ontario government under the
Public Sector Salary Disclosure Act, 1996. It discloses names, positions,
salaries, and taxable benefits of all Ontario public sector employees
earning $100,000 or more.

Data sources:
  - Ontario Open Data: https://data.ontario.ca/dataset/public-sector-salary-disclosure
  - Ontario.ca: https://www.ontario.ca/page/public-sector-salary-disclosure
  - Historical data may also be at: https://www.ontario.ca/page/public-sector-salary-disclosure-YEAR

Target employers (Hastings County region):
  - City of Belleville
  - Municipality of Quinte West / City of Quinte West
  - County of Hastings / Hastings County
  - Hastings and Prince Edward District School Board
  - Quinte Health / Quinte Health Care / QHC
  - Loyalist College

Usage:
  python sunshine_list_collector.py                  # Collect latest year
  python sunshine_list_collector.py --year 2024      # Collect specific year
  python sunshine_list_collector.py --all-years      # Collect all available years
  python sunshine_list_collector.py --verbose        # Debug logging

Output: data/municipal/sunshine_list_hastings.json

SYSTEM_SEED = 118400
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import logging
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

SYSTEM_SEED = 118400
DATA_DIR = Path(__file__).parent.parent / "municipal"
RATE_LIMIT = 1.0  # seconds between requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
_log = logging.getLogger("sunshine")

# SSL context
_ctx = ssl.create_default_context()
_ctx.check_hostname = False
_ctx.verify_mode = ssl.CERT_NONE

USER_AGENT = "TENET5-Sunshine/1.0 (government accountability research)"

# ── Target employers ────────────────────────────────────────
# These are normalized to lowercase for matching.
# The Sunshine List uses various employer name formats across years.
TARGET_EMPLOYERS: Set[str] = {
    "city of belleville",
    "the corporation of the city of belleville",
    "corporation of the city of belleville",
    "municipality of quinte west",
    "city of quinte west",
    "the corporation of the city of quinte west",
    "corporation of the city of quinte west",
    "county of hastings",
    "hastings county",
    "the corporation of the county of hastings",
    "corporation of the county of hastings",
    "hastings and prince edward district school board",
    "hastings & prince edward district school board",
    "hpedsb",
    "quinte health",
    "quinte health care",
    "qhc",
    "quinte healthcare corporation",
    "loyalist college",
    "loyalist college of applied arts and technology",
}

# Known Ontario Open Data portal URLs for Sunshine List datasets
# The portal uses CKAN -- resource IDs change each year
SUNSHINE_PORTAL = "https://data.ontario.ca/dataset/public-sector-salary-disclosure"


# ──────────────────────────────────────────────────────────
#  HTTP fetch
# ──────────────────────────────────────────────────────────
_last_request_time = 0.0


def _fetch(url: str, timeout: float = 30.0) -> Optional[bytes]:
    """Fetch URL and return raw bytes. Returns None on error."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < RATE_LIMIT:
        time.sleep(RATE_LIMIT - elapsed)

    _log.debug("GET %s", url)
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "*/*",
        "Accept-Language": "en-CA,en;q=0.9",
    })

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_ctx) as resp:
            _last_request_time = time.time()
            return resp.read()
    except urllib.error.HTTPError as e:
        _log.warning("HTTP %d for %s", e.code, url)
        return None
    except urllib.error.URLError as e:
        _log.warning("URL error for %s: %s", url, e.reason)
        return None
    except Exception as e:
        _log.warning("Fetch error for %s: %s", url, e)
        return None


def _fetch_text(url: str, timeout: float = 30.0) -> Optional[str]:
    """Fetch URL and return decoded text."""
    raw = _fetch(url, timeout)
    if raw is None:
        return None
    # Try UTF-8 first, then Latin-1 (common for government CSVs)
    for enc in ("utf-8", "latin-1", "cp1252"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace")


# ──────────────────────────────────────────────────────────
#  Employer matching
# ──────────────────────────────────────────────────────────
def _matches_target_employer(employer_name: str) -> bool:
    """Check if an employer name matches our target list.

    Uses normalized lowercase comparison and substring matching
    to handle the various name formats used across years.
    """
    name = employer_name.strip().lower()
    if name in TARGET_EMPLOYERS:
        return True
    # Substring checks for partial matches
    for target in TARGET_EMPLOYERS:
        if target in name or name in target:
            return True
    # Additional keyword checks
    keywords = ["belleville", "quinte west", "hastings county", "loyalist college",
                "quinte health"]
    return any(kw in name for kw in keywords)


def _normalize_employer(employer_name: str) -> str:
    """Normalize employer names to canonical forms."""
    name = employer_name.strip()
    lower = name.lower()

    if "belleville" in lower:
        return "City of Belleville"
    elif "quinte west" in lower:
        return "City of Quinte West"
    elif "hastings" in lower and ("county" in lower or "corporation" in lower):
        if "school" in lower or "district" in lower:
            return "Hastings and Prince Edward District School Board"
        return "County of Hastings"
    elif "hastings" in lower and ("prince edward" in lower or "school" in lower):
        return "Hastings and Prince Edward District School Board"
    elif "quinte health" in lower or lower in ("qhc",):
        return "Quinte Health"
    elif "loyalist" in lower:
        return "Loyalist College"

    return name


# ──────────────────────────────────────────────────────────
#  CSV parsing
# ──────────────────────────────────────────────────────────
def _parse_salary(value: str) -> float:
    """Parse a salary value, handling $, commas, etc."""
    cleaned = re.sub(r"[^\d.]", "", value.strip())
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_sunshine_csv(csv_text: str, year: int) -> List[Dict[str, Any]]:
    """Parse a Sunshine List CSV and filter for target employers.

    The CSV format varies by year but generally has columns:
    - Sector, Last Name, First Name, Salary Paid, Taxable Benefits, Employer
    Some years use different column names or ordering.
    """
    records: List[Dict[str, Any]] = []
    reader = csv.reader(io.StringIO(csv_text))

    # Read header to determine column mapping
    try:
        header = next(reader)
    except StopIteration:
        _log.warning("  Empty CSV for year %d", year)
        return records

    # Normalize headers to lowercase for matching
    header_lower = [h.strip().lower() for h in header]

    # Map column indices -- handle various header formats
    col_map = {}
    for i, h in enumerate(header_lower):
        if "sector" in h:
            col_map["sector"] = i
        elif "last" in h and "name" in h:
            col_map["last_name"] = i
        elif "first" in h and "name" in h:
            col_map["first_name"] = i
        elif "salary" in h or "paid" in h:
            col_map["salary"] = i
        elif "benefit" in h or "taxable" in h:
            col_map["benefits"] = i
        elif "employer" in h:
            col_map["employer"] = i
        elif "position" in h or "title" in h or "job" in h:
            col_map["position"] = i

    if "employer" not in col_map:
        _log.warning("  No 'employer' column found in CSV headers: %s", header)
        return records

    for row_num, row in enumerate(reader, start=2):
        if len(row) < max(col_map.values()) + 1:
            continue

        employer = row[col_map["employer"]].strip()
        if not _matches_target_employer(employer):
            continue

        # Extract fields
        first_name = row[col_map.get("first_name", 0)].strip() if "first_name" in col_map else ""
        last_name = row[col_map.get("last_name", 0)].strip() if "last_name" in col_map else ""
        name = f"{first_name} {last_name}".strip() if first_name or last_name else "Unknown"

        salary = _parse_salary(row[col_map.get("salary", 0)]) if "salary" in col_map else 0.0
        benefits = _parse_salary(row[col_map.get("benefits", 0)]) if "benefits" in col_map else 0.0
        position = row[col_map.get("position", 0)].strip() if "position" in col_map else ""
        sector = row[col_map.get("sector", 0)].strip() if "sector" in col_map else ""

        records.append({
            "name": name,
            "position": position,
            "employer": _normalize_employer(employer),
            "salary": salary,
            "taxable_benefits": benefits,
            "year": year,
            "sector": sector,
        })

    return records


# ──────────────────────────────────────────────────────────
#  Data portal discovery
# ──────────────────────────────────────────────────────────
def discover_csv_urls() -> List[Dict[str, Any]]:
    """Try to discover CSV download URLs from the Ontario Open Data portal.

    The portal (data.ontario.ca) uses CKAN. The dataset page contains
    links to resources (CSVs) for each year.

    TODO: The CKAN API can also be used:
    https://data.ontario.ca/api/3/action/package_show?id=public-sector-salary-disclosure
    """
    _log.info("Discovering Sunshine List CSV URLs from Open Data portal...")

    # Try CKAN API first
    api_url = "https://data.ontario.ca/api/3/action/package_show?id=public-sector-salary-disclosure"
    text = _fetch_text(api_url)

    datasets: List[Dict[str, Any]] = []

    if text:
        try:
            data = json.loads(text)
            if data.get("success") and "result" in data:
                resources = data["result"].get("resources", [])
                for res in resources:
                    if res.get("format", "").upper() == "CSV":
                        # Extract year from resource name/description
                        name = res.get("name", "")
                        desc = res.get("description", "")
                        url = res.get("url", "")
                        year_match = re.search(r"20\d{2}", name + " " + desc)
                        year = int(year_match.group()) if year_match else 0
                        datasets.append({
                            "year": year,
                            "url": url,
                            "name": name,
                        })
                _log.info("  Found %d CSV resources via CKAN API", len(datasets))
        except (json.JSONDecodeError, KeyError) as e:
            _log.warning("  Failed to parse CKAN API response: %s", e)
    else:
        _log.warning("  Could not reach Ontario Open Data CKAN API")

    return datasets


# ──────────────────────────────────────────────────────────
#  Main collection
# ──────────────────────────────────────────────────────────
def collect_sunshine_list(year: Optional[int] = None,
                          all_years: bool = False) -> Dict[str, Any]:
    """Collect Sunshine List data for Hastings County area employers.

    Returns a structured dataset with metadata and records.
    """
    all_records: List[Dict[str, Any]] = []
    errors: List[str] = []
    sources_checked: List[str] = []

    # Step 1: Try to discover CSV URLs from the data portal
    csv_datasets = discover_csv_urls()

    if csv_datasets:
        # Filter by year if specified
        if year and not all_years:
            csv_datasets = [d for d in csv_datasets if d["year"] == year]
        elif not all_years:
            # Default to latest year
            csv_datasets = sorted(csv_datasets, key=lambda d: d["year"], reverse=True)
            csv_datasets = csv_datasets[:1] if csv_datasets else []

        for dataset in csv_datasets:
            _log.info("Downloading CSV for year %d: %s", dataset["year"], dataset["url"])
            sources_checked.append(dataset["url"])
            csv_text = _fetch_text(dataset["url"], timeout=60)
            if csv_text:
                records = parse_sunshine_csv(csv_text, dataset["year"])
                _log.info("  Found %d local records for year %d", len(records), dataset["year"])
                all_records.extend(records)
            else:
                msg = f"Failed to download CSV for year {dataset['year']}"
                _log.warning("  %s", msg)
                errors.append(msg)
    else:
        msg = "Could not discover CSV URLs from Ontario Open Data portal"
        _log.warning(msg)
        errors.append(msg)

    # Step 2: If we got no records, provide placeholder data
    # TODO: These are realistic placeholder records demonstrating the data structure.
    # Replace with actual Sunshine List data once CSV download is working.
    if not all_records:
        _log.info("Using placeholder data -- actual Sunshine List CSVs could not be retrieved")
        _log.info("To populate with real data:")
        _log.info("  1. Visit https://data.ontario.ca/dataset/public-sector-salary-disclosure")
        _log.info("  2. Download the CSV for the desired year")
        _log.info("  3. Place it in data/municipal/ and re-run with --csv flag")

        all_records = [
            # -- City of Belleville --
            {
                "name": "Rod Bovay", "position": "Chief Administrative Officer",
                "employer": "City of Belleville", "salary": 225000.00,
                "taxable_benefits": 1250.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            {
                "name": "Mark Fluhrer", "position": "Fire Chief",
                "employer": "City of Belleville", "salary": 185000.00,
                "taxable_benefits": 950.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            {
                "name": "Eric Krushelnicki", "position": "Director of Planning",
                "employer": "City of Belleville", "salary": 165000.00,
                "taxable_benefits": 820.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            {
                "name": "Joe Reid", "position": "Director of Recreation",
                "employer": "City of Belleville", "salary": 155000.00,
                "taxable_benefits": 780.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            # -- City of Quinte West --
            {
                "name": "Charlie Murphy", "position": "Chief Administrative Officer",
                "employer": "City of Quinte West", "salary": 215000.00,
                "taxable_benefits": 1180.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            {
                "name": "Chris Angelo", "position": "Director of Community Services",
                "employer": "City of Quinte West", "salary": 158000.00,
                "taxable_benefits": 790.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            {
                "name": "John Walters", "position": "Fire Chief",
                "employer": "City of Quinte West", "salary": 172000.00,
                "taxable_benefits": 870.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            # -- County of Hastings --
            {
                "name": "Jim Pine", "position": "Chief Administrative Officer",
                "employer": "County of Hastings", "salary": 220000.00,
                "taxable_benefits": 1200.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            {
                "name": "Erin Faye Robb", "position": "Director of Community & Human Services",
                "employer": "County of Hastings", "salary": 162000.00,
                "taxable_benefits": 810.00, "year": 2024, "sector": "Municipalities and Services",
                "_placeholder": True
            },
            # -- Hastings and Prince Edward District School Board --
            {
                "name": "Sean Monteith", "position": "Director of Education",
                "employer": "Hastings and Prince Edward District School Board",
                "salary": 275000.00, "taxable_benefits": 1450.00, "year": 2024,
                "sector": "School Boards",
                "_placeholder": True
            },
            {
                "name": "Mandy Savery-Whiteway", "position": "Superintendent of Education",
                "employer": "Hastings and Prince Edward District School Board",
                "salary": 185000.00, "taxable_benefits": 980.00, "year": 2024,
                "sector": "School Boards",
                "_placeholder": True
            },
            # -- Quinte Health --
            {
                "name": "Stacey Daub", "position": "President & CEO",
                "employer": "Quinte Health", "salary": 350000.00,
                "taxable_benefits": 2100.00, "year": 2024, "sector": "Hospitals",
                "_placeholder": True
            },
            {
                "name": "Brad Harrington", "position": "VP Clinical Services & CNO",
                "employer": "Quinte Health", "salary": 245000.00,
                "taxable_benefits": 1350.00, "year": 2024, "sector": "Hospitals",
                "_placeholder": True
            },
            {
                "name": "Carol Smith", "position": "VP Corporate Services & CFO",
                "employer": "Quinte Health", "salary": 238000.00,
                "taxable_benefits": 1280.00, "year": 2024, "sector": "Hospitals",
                "_placeholder": True
            },
            # -- Loyalist College --
            {
                "name": "Ann Marie Vaughan", "position": "President & CEO",
                "employer": "Loyalist College", "salary": 285000.00,
                "taxable_benefits": 1520.00, "year": 2024, "sector": "Colleges",
                "_placeholder": True
            },
            {
                "name": "Brian Frier", "position": "VP Academic",
                "employer": "Loyalist College", "salary": 195000.00,
                "taxable_benefits": 1050.00, "year": 2024, "sector": "Colleges",
                "_placeholder": True
            },
        ]

    # Sort by salary descending
    all_records.sort(key=lambda r: r.get("salary", 0), reverse=True)

    # Build output
    output = {
        "title": "Ontario Sunshine List -- Hastings County Area",
        "description": (
            "Public sector employees earning $100,000+ in the Hastings County region. "
            "Data from the Ontario Public Sector Salary Disclosure Act, 1996."
        ),
        "source_url": "https://www.ontario.ca/page/public-sector-salary-disclosure",
        "data_portal_url": "https://data.ontario.ca/dataset/public-sector-salary-disclosure",
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "system_seed": SYSTEM_SEED,
        "target_employers": sorted(TARGET_EMPLOYERS),
        "record_count": len(all_records),
        "has_placeholder_data": any(r.get("_placeholder") for r in all_records),
        "sources_checked": sources_checked,
        "errors": errors,
        "summary": {
            "by_employer": {},
            "total_salary": sum(r.get("salary", 0) for r in all_records),
            "average_salary": (
                sum(r.get("salary", 0) for r in all_records) / len(all_records)
                if all_records else 0
            ),
            "highest_salary": max((r.get("salary", 0) for r in all_records), default=0),
        },
        "records": all_records,
    }

    # Compute per-employer summary
    employer_totals: Dict[str, Dict[str, Any]] = {}
    for rec in all_records:
        emp = rec.get("employer", "Unknown")
        if emp not in employer_totals:
            employer_totals[emp] = {"count": 0, "total_salary": 0}
        employer_totals[emp]["count"] += 1
        employer_totals[emp]["total_salary"] += rec.get("salary", 0)
    output["summary"]["by_employer"] = employer_totals

    return output


def save_output(data: Dict[str, Any]) -> Path:
    """Save the collected data to JSON."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / "sunshine_list_hastings.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    _log.info("Saved: %s (%d bytes)", path, path.stat().st_size)
    return path


# ──────────────────────────────────────────────────────────
#  CLI
# ──────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="TENET5 Sunshine List Collector -- Hastings County Area"
    )
    parser.add_argument("--year", type=int, default=None,
                        help="Collect specific year (default: latest)")
    parser.add_argument("--all-years", action="store_true",
                        help="Collect all available years")
    parser.add_argument("--csv", type=str, default=None,
                        help="Parse a local CSV file instead of downloading")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Enable debug logging")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    print("=" * 60)
    print("  TENET5 Sunshine List Collector")
    print("  Target: Hastings County Area Employers")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # If a local CSV is provided, parse it directly
    if args.csv:
        csv_path = Path(args.csv)
        if not csv_path.exists():
            print(f"  ERROR: CSV file not found: {csv_path}")
            sys.exit(1)
        print(f"  Parsing local CSV: {csv_path}")
        with open(csv_path, "r", encoding="utf-8") as f:
            csv_text = f.read()
        year = args.year or datetime.now().year
        records = parse_sunshine_csv(csv_text, year)
        data = {
            "title": f"Ontario Sunshine List -- Hastings County Area ({year})",
            "source_url": str(csv_path.resolve()),
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "system_seed": SYSTEM_SEED,
            "record_count": len(records),
            "has_placeholder_data": False,
            "records": sorted(records, key=lambda r: r.get("salary", 0), reverse=True),
        }
    else:
        data = collect_sunshine_list(year=args.year, all_years=args.all_years)

    path = save_output(data)

    print(f"\n  Records: {data['record_count']}")
    if data.get("has_placeholder_data"):
        print("  NOTE: Using placeholder data -- actual CSVs could not be retrieved")
        print("  To get real data, download the CSV from:")
        print("    https://data.ontario.ca/dataset/public-sector-salary-disclosure")
        print("  Then run: python sunshine_list_collector.py --csv <path>")
    print(f"\n  Output: {path.resolve()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
