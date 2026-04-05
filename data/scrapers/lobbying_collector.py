#!/usr/bin/env python3
"""
lobbying_collector.py — Collect lobbying registry data from Canada Open Government Portal

All data is from PUBLIC GOVERNMENT RECORDS. CSV downloads from open.canada.ca.
No authentication required. Rate limited to 5 seconds between large downloads.

Usage:
    python lobbying_collector.py --registrations
    python lobbying_collector.py --communications
    python lobbying_collector.py --contracts
    python lobbying_collector.py --foreign-connections
    python lobbying_collector.py --all
"""

import argparse
import csv
import io
import json
import logging
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from html.parser import HTMLParser

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lobbying")

# Open Canada dataset pages — we scrape the actual CSV download links from these
DATASET_REGISTRATIONS = "https://open.canada.ca/data/en/dataset/70ef2117-1095-4d77-80eb-b87f2bada2a4"
DATASET_COMMUNICATIONS = "https://open.canada.ca/data/en/dataset/a34eb330-7136-4f5e-9f5f-3ba41df58b06"
DATASET_CONTRACTS = "https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b"

# CKAN API endpoints for these datasets (more reliable than scraping HTML)
CKAN_API = "https://open.canada.ca/data/api/3/action/package_show"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("lobbying_collector")

# ---------------------------------------------------------------------------
# Rate-limited HTTP helpers
# ---------------------------------------------------------------------------

_last_request_time = 0.0


def _rate_limit(seconds=5.0):
    """Enforce delay between requests."""
    global _last_request_time
    now = time.monotonic()
    elapsed = now - _last_request_time
    if elapsed < seconds:
        time.sleep(seconds - elapsed)
    _last_request_time = time.monotonic()


def fetch_url(url, timeout=120):
    """Fetch a URL and return raw bytes."""
    _rate_limit(seconds=5.0)
    log.info("GET %s", url)
    req = urllib.request.Request(url, headers={
        "User-Agent": "TENET5-LobbyingCollector/1.0 (public-government-data)",
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except urllib.error.HTTPError as exc:
        log.error("HTTP %d for %s: %s", exc.code, url, exc.reason)
        return None
    except urllib.error.URLError as exc:
        log.error("URL error for %s: %s", url, exc.reason)
        return None
    except Exception as exc:
        log.error("Unexpected error fetching %s: %s", url, exc)
        return None


def fetch_json(url):
    """Fetch JSON from a URL."""
    raw = fetch_url(url, timeout=30)
    if raw is None:
        return None
    try:
        return json.loads(raw.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        log.error("Failed to parse JSON from %s: %s", url, exc)
        return None


# ---------------------------------------------------------------------------
# CKAN resource discovery
# ---------------------------------------------------------------------------

def get_csv_urls_for_dataset(dataset_id):
    """Use the CKAN API to find CSV resource URLs for a dataset."""
    url = f"{CKAN_API}?id={dataset_id}"
    data = fetch_json(url)
    if data is None or not data.get("success"):
        log.error("CKAN API failed for dataset %s", dataset_id)
        return []
    resources = data.get("result", {}).get("resources", [])
    csv_urls = []
    for res in resources:
        fmt = (res.get("format", "") or "").upper()
        res_url = res.get("url", "")
        name = res.get("name", "") or res.get("name_translated", {}).get("en", "")
        if fmt == "CSV" and res_url:
            csv_urls.append({
                "url": res_url,
                "name": name,
                "format": fmt,
                "size": res.get("size", 0),
                "last_modified": res.get("last_modified", ""),
            })
    log.info("Found %d CSV resources for dataset %s", len(csv_urls), dataset_id)
    return csv_urls


def extract_dataset_id(url):
    """Extract dataset UUID from an open.canada.ca URL."""
    match = re.search(r'dataset/([0-9a-f-]{36})', url)
    if match:
        return match.group(1)
    return None


# ---------------------------------------------------------------------------
# CSV download and parsing
# ---------------------------------------------------------------------------

def download_csv(dataset_url, label):
    """Download CSV files from a dataset. Returns list of (name, rows) tuples."""
    dataset_id = extract_dataset_id(dataset_url)
    if not dataset_id:
        log.error("Cannot extract dataset ID from %s", dataset_url)
        return []

    csv_resources = get_csv_urls_for_dataset(dataset_id)
    if not csv_resources:
        log.warning("No CSV resources found for %s", label)
        return []

    results = []
    for res in csv_resources:
        log.info("Downloading CSV: %s (%s)", res["name"], res["url"])
        raw = fetch_url(res["url"], timeout=300)
        if raw is None:
            log.warning("Failed to download %s", res["url"])
            continue

        # Try multiple encodings
        text = None
        for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
            try:
                text = raw.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        if text is None:
            log.warning("Cannot decode CSV from %s", res["url"])
            continue

        reader = csv.DictReader(io.StringIO(text))
        rows = []
        for row in reader:
            # Clean up keys: strip whitespace and BOM
            cleaned = {}
            for k, v in row.items():
                if k is None:
                    continue
                clean_key = k.strip().lstrip("\ufeff")
                cleaned[clean_key] = (v or "").strip()
            rows.append(cleaned)

        log.info("Parsed %d rows from %s", len(rows), res["name"])
        results.append((res["name"], rows))
    return results


# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def save_json(data, filename):
    """Save data as JSON."""
    ensure_data_dir()
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    log.info("Saved to %s (%d bytes)", path, os.path.getsize(path))
    return path


# ---------------------------------------------------------------------------
# Core collection functions
# ---------------------------------------------------------------------------

def download_lobbying_registrations():
    """Download the full lobbying registrations CSV from open.canada.ca."""
    log.info("Downloading lobbying registrations...")
    results = download_csv(DATASET_REGISTRATIONS, "lobbying_registrations")

    all_rows = []
    for name, rows in results:
        for row in rows:
            row["_source_file"] = name
        all_rows.extend(rows)

    if all_rows:
        filename = f"registrations_{datetime.utcnow().strftime('%Y%m%d')}.json"
        save_json({
            "collected_at": datetime.utcnow().isoformat() + "Z",
            "source": DATASET_REGISTRATIONS,
            "total_records": len(all_rows),
            "records": all_rows,
        }, filename)
    else:
        log.warning("No lobbying registration data downloaded")
    return all_rows


def download_communication_reports():
    """Download monthly communication reports CSV."""
    log.info("Downloading communication reports...")
    results = download_csv(DATASET_COMMUNICATIONS, "communication_reports")

    all_rows = []
    for name, rows in results:
        for row in rows:
            row["_source_file"] = name
        all_rows.extend(rows)

    if all_rows:
        filename = f"communications_{datetime.utcnow().strftime('%Y%m%d')}.json"
        save_json({
            "collected_at": datetime.utcnow().isoformat() + "Z",
            "source": DATASET_COMMUNICATIONS,
            "total_records": len(all_rows),
            "records": all_rows,
        }, filename)
    else:
        log.warning("No communication report data downloaded")
    return all_rows


def download_contracts():
    """Download proactive disclosure contracts CSV."""
    log.info("Downloading proactive disclosure contracts...")
    results = download_csv(DATASET_CONTRACTS, "contracts")

    all_rows = []
    for name, rows in results:
        for row in rows:
            row["_source_file"] = name
        all_rows.extend(rows)

    if all_rows:
        filename = f"contracts_{datetime.utcnow().strftime('%Y%m%d')}.json"
        save_json({
            "collected_at": datetime.utcnow().isoformat() + "Z",
            "source": DATASET_CONTRACTS,
            "total_records": len(all_rows),
            "records": all_rows,
        }, filename)
    else:
        log.warning("No contracts data downloaded")
    return all_rows


def parse_lobbying_csv(path):
    """Parse a lobbying CSV file and extract key fields.

    Returns list of dicts with: lobbyist_name, client, subject, dpoh_met.
    """
    log.info("Parsing lobbying CSV: %s", path)
    if not os.path.isfile(path):
        log.error("File not found: %s", path)
        return []

    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        log.info("CSV headers: %s", headers)

        # Map common field names (headers vary between datasets)
        field_map = {
            "lobbyist": _find_header(headers, [
                "lobbyist", "registrant", "consultant", "name",
                "lobbyist_name", "Registrant Name",
            ]),
            "client": _find_header(headers, [
                "client", "corporation", "organization", "company",
                "Client Name", "Organization Name",
            ]),
            "subject": _find_header(headers, [
                "subject", "subject_matter", "topic", "issue",
                "Subject Matter", "Subject",
            ]),
            "dpoh": _find_header(headers, [
                "dpoh", "designated_public_office_holder", "official",
                "DPOH Name", "Public Office Holder",
            ]),
        }

        records = []
        for row in reader:
            record = {
                "lobbyist_name": _get_field(row, field_map["lobbyist"]),
                "client": _get_field(row, field_map["client"]),
                "subject": _get_field(row, field_map["subject"]),
                "dpoh_met": _get_field(row, field_map["dpoh"]),
                "_raw": row,
            }
            records.append(record)

    log.info("Parsed %d records from %s", len(records), path)
    return records


def _find_header(headers, candidates):
    """Find the best matching header from a list of candidates."""
    lower_headers = {h.lower().strip(): h for h in headers}
    for candidate in candidates:
        if candidate.lower() in lower_headers:
            return lower_headers[candidate.lower()]
    # Partial match
    for candidate in candidates:
        for h_lower, h_orig in lower_headers.items():
            if candidate.lower() in h_lower:
                return h_orig
    return None


def _get_field(row, header):
    """Safely get a field from a row."""
    if header is None:
        return ""
    return (row.get(header, "") or "").strip()


def find_foreign_connections(data):
    """Flag registrations where client has a foreign parent organization.

    Looks for indicators of foreign connections in the data:
    - Fields mentioning parent organization, foreign entity, or country
    - Non-Canadian addresses
    """
    log.info("Scanning %d records for foreign connections...", len(data))
    flagged = []

    # Keywords that suggest foreign connections
    foreign_keywords = [
        "foreign", "international", "parent", "subsidiary",
        "headquartered", "based in", "incorporated in",
    ]
    canadian_indicators = ["canada", "canadian", "ontario", "quebec", "british columbia",
                           "alberta", "manitoba", "saskatchewan", "nova scotia",
                           "new brunswick", "newfoundland", "pei", "prince edward",
                           "yukon", "northwest territories", "nunavut", "ottawa"]

    for record in data:
        # Check all fields in the raw data for foreign indicators
        raw = record.get("_raw", record)
        all_text = " ".join(str(v).lower() for v in raw.values())

        foreign_score = 0
        foreign_indicators = []

        # Check for explicit foreign/parent org fields
        for key, val in raw.items():
            key_lower = key.lower()
            val_lower = str(val).lower().strip()
            if not val_lower:
                continue

            if any(kw in key_lower for kw in ["parent", "foreign", "international", "country"]):
                if val_lower and val_lower not in ("", "n/a", "none", "null"):
                    is_canadian = any(ci in val_lower for ci in canadian_indicators)
                    if not is_canadian:
                        foreign_score += 3
                        foreign_indicators.append(f"{key}: {val}")

            # Check for foreign keywords in values
            for kw in foreign_keywords:
                if kw in val_lower and "address" not in key_lower:
                    foreign_score += 1
                    foreign_indicators.append(f"{key} contains '{kw}'")
                    break

        if foreign_score >= 2:
            flagged.append({
                "lobbyist_name": record.get("lobbyist_name", ""),
                "client": record.get("client", ""),
                "subject": record.get("subject", ""),
                "foreign_score": foreign_score,
                "foreign_indicators": foreign_indicators,
                "_raw": raw,
            })

    log.info("Flagged %d records with potential foreign connections", len(flagged))

    if flagged:
        filename = f"foreign_connections_{datetime.utcnow().strftime('%Y%m%d')}.json"
        save_json({
            "collected_at": datetime.utcnow().isoformat() + "Z",
            "total_flagged": len(flagged),
            "total_scanned": len(data),
            "records": flagged,
        }, filename)

    return flagged


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Collect lobbying registry data from Canada Open Government Portal (public records)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python lobbying_collector.py --registrations
  python lobbying_collector.py --communications
  python lobbying_collector.py --contracts
  python lobbying_collector.py --all
  python lobbying_collector.py --parse-csv path/to/file.csv
  python lobbying_collector.py --foreign-connections
""",
    )
    parser.add_argument("--registrations", action="store_true",
                        help="Download lobbying registrations")
    parser.add_argument("--communications", action="store_true",
                        help="Download communication reports")
    parser.add_argument("--contracts", action="store_true",
                        help="Download proactive disclosure contracts")
    parser.add_argument("--parse-csv", type=str, metavar="PATH",
                        help="Parse a specific lobbying CSV file")
    parser.add_argument("--foreign-connections", action="store_true",
                        help="Scan registrations for foreign connections")
    parser.add_argument("--all", action="store_true",
                        help="Download all datasets")
    parser.add_argument("--verbose", action="store_true",
                        help="Enable debug logging")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not any([args.registrations, args.communications, args.contracts,
                args.parse_csv, args.foreign_connections, args.all]):
        parser.print_help()
        sys.exit(1)

    reg_data = []

    if args.all or args.registrations:
        reg_data = download_lobbying_registrations()
        log.info("Downloaded %d lobbying registrations", len(reg_data))

    if args.all or args.communications:
        comm_data = download_communication_reports()
        log.info("Downloaded %d communication reports", len(comm_data))

    if args.all or args.contracts:
        contracts_data = download_contracts()
        log.info("Downloaded %d contracts", len(contracts_data))

    if args.parse_csv:
        parsed = parse_lobbying_csv(args.parse_csv)
        log.info("Parsed %d records", len(parsed))
        if not reg_data:
            reg_data = parsed

    if args.all or args.foreign_connections:
        if not reg_data:
            log.info("No registration data loaded; downloading first...")
            reg_data = download_lobbying_registrations()
        foreign = find_foreign_connections(reg_data)
        log.info("Found %d records with foreign connections", len(foreign))

    log.info("Data saved to: %s", DATA_DIR)


if __name__ == "__main__":
    main()
