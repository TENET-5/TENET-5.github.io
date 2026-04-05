#!/usr/bin/env python3
"""
politician_mapper.py — Map politicians and their connections

Combines OpenParliament MP data with lobbying and contribution data
to build comprehensive profiles and detect patterns. All data from
PUBLIC GOVERNMENT RECORDS.

Usage:
    python politician_mapper.py --collect-mps
    python politician_mapper.py --profile poilievre-pierre
    python politician_mapper.py --detect-patterns
    python politician_mapper.py --connection-graph
    python politician_mapper.py --all
"""

import argparse
import collections
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

BASE_URL = "https://api.openparliament.ca"
SCRAPERS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRAPERS_DIR, "..")
PROFILES_DIR = os.path.join(DATA_DIR, "profiles")
HANSARD_DIR = os.path.join(DATA_DIR, "hansard")
LOBBYING_DIR = os.path.join(DATA_DIR, "lobbying")
CONNECTIONS_PATH = os.path.join(DATA_DIR, "connections.json")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("politician_mapper")

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
    """Fetch a URL and return parsed JSON."""
    _rate_limit()
    log.debug("GET %s", url)
    req = urllib.request.Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "TENET5-PoliticianMapper/1.0 (public-government-data)",
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
    """Follow pagination, yielding all items."""
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

def ensure_dirs():
    os.makedirs(PROFILES_DIR, exist_ok=True)
    os.makedirs(HANSARD_DIR, exist_ok=True)
    os.makedirs(LOBBYING_DIR, exist_ok=True)


def save_json(data, path):
    """Save data as JSON."""
    dirpath = os.path.dirname(path)
    if dirpath:
        os.makedirs(dirpath, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    log.info("Saved to %s", path)
    return path


def load_json(path):
    """Load a JSON file if it exists."""
    if not os.path.isfile(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        log.warning("Failed to load %s: %s", path, exc)
        return None


# ---------------------------------------------------------------------------
# Load previously collected data
# ---------------------------------------------------------------------------

def load_lobbying_data():
    """Load all lobbying data from the lobbying directory."""
    records = []
    if not os.path.isdir(LOBBYING_DIR):
        log.warning("No lobbying directory found at %s", LOBBYING_DIR)
        return records
    for fname in os.listdir(LOBBYING_DIR):
        if fname.endswith(".json"):
            data = load_json(os.path.join(LOBBYING_DIR, fname))
            if data and "records" in data:
                records.extend(data["records"])
    log.info("Loaded %d lobbying records", len(records))
    return records


def load_hansard_data():
    """Load all Hansard data from the hansard directory."""
    records = []
    if not os.path.isdir(HANSARD_DIR):
        log.warning("No hansard directory found at %s", HANSARD_DIR)
        return records
    for fname in os.listdir(HANSARD_DIR):
        if fname.endswith(".jsonl"):
            path = os.path.join(HANSARD_DIR, fname)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            records.append(json.loads(line))
            except (json.JSONDecodeError, OSError) as exc:
                log.warning("Failed to load %s: %s", path, exc)
    log.info("Loaded %d hansard records", len(records))
    return records


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------

def collect_all_mps():
    """Fetch all current and recent MPs from OpenParliament API."""
    log.info("Collecting all MPs...")
    url = f"{BASE_URL}/politicians/?format=json"
    mps = fetch_all_pages(url)

    # Enrich each MP with detail data
    enriched = []
    for i, mp in enumerate(mps):
        mp_url = mp.get("url", "")
        if mp_url:
            if mp_url.startswith("/"):
                detail_url = BASE_URL + mp_url
            else:
                detail_url = mp_url
            if "format=json" not in detail_url:
                sep = "&" if "?" in detail_url else "?"
                detail_url = detail_url + sep + "format=json"
            detail = fetch_json(detail_url)
            if detail:
                mp.update(detail)
        enriched.append(mp)
        if (i + 1) % 25 == 0:
            log.info("  Enriched %d/%d MPs", i + 1, len(mps))

    ensure_dirs()
    path = os.path.join(DATA_DIR, "all_mps.json")
    save_json({
        "collected_at": datetime.utcnow().isoformat() + "Z",
        "total_mps": len(enriched),
        "mps": enriched,
    }, path)

    log.info("Collected %d MPs", len(enriched))
    return enriched


def _extract_mp_slug(mp):
    """Extract the slug from an MP record."""
    url = mp.get("url", "")
    # URL pattern: /politicians/lastname-firstname/
    match = re.search(r"/politicians/([^/]+)/?", url)
    if match:
        return match.group(1)
    name = mp.get("name", "")
    if name:
        parts = name.lower().split()
        if len(parts) >= 2:
            return f"{parts[-1]}-{parts[0]}"
    return None


def _extract_mp_name(mp):
    """Get MP name from various possible fields."""
    return mp.get("name", "") or mp.get("politician_name", "") or ""


def build_mp_profile(mp_slug, mps_data=None, lobbying_data=None, hansard_data=None):
    """Create comprehensive profile for a single MP.

    Includes: name, party, riding, province, voting record summary,
    top issues spoken about, lobbying meetings, bills sponsored.
    """
    log.info("Building profile for: %s", mp_slug)
    ensure_dirs()

    # Fetch MP detail from API
    mp_url = f"{BASE_URL}/politicians/{mp_slug}/?format=json"
    mp_detail = fetch_json(mp_url)
    if mp_detail is None:
        log.error("Could not fetch MP data for %s", mp_slug)
        return None

    name = mp_detail.get("name", mp_slug)
    party = mp_detail.get("current_party", {}).get("short_name", {})
    if isinstance(party, dict):
        party = party.get("en", "")
    riding = mp_detail.get("current_riding", {}).get("name", {})
    if isinstance(riding, dict):
        riding = riding.get("en", "")
    province = mp_detail.get("current_riding", {}).get("province", "")

    profile = {
        "slug": mp_slug,
        "name": name,
        "party": party,
        "riding": riding,
        "province": province,
        "collected_at": datetime.utcnow().isoformat() + "Z",
        "memberships": mp_detail.get("memberships", []),
        "other_info": mp_detail.get("other_info", {}),
    }

    # -- Voting record --
    log.info("  Fetching voting record for %s", mp_slug)
    votes_url = f"{BASE_URL}/politicians/{mp_slug}/votes/?format=json"
    votes = fetch_all_pages(votes_url, max_pages=10)

    total_votes = len(votes)
    with_party = 0
    against_party = 0
    for vote in votes:
        # The vote record should indicate party consensus vs individual vote
        party_vote = vote.get("party_vote", "")
        mp_vote = vote.get("vote", "")
        if party_vote and mp_vote:
            if party_vote == mp_vote:
                with_party += 1
            else:
                against_party += 1

    profile["voting_record"] = {
        "total_votes": total_votes,
        "with_party": with_party,
        "against_party": against_party,
        "pct_with_party": round(with_party / total_votes * 100, 1) if total_votes > 0 else 0,
        "pct_against_party": round(against_party / total_votes * 100, 1) if total_votes > 0 else 0,
    }

    # -- Top issues from statements --
    log.info("  Fetching statements for %s", mp_slug)
    statements_url = f"{BASE_URL}/politicians/{mp_slug}/statements/?format=json"
    statements = fetch_all_pages(statements_url, max_pages=5)

    issue_keywords = _extract_top_issues(statements)
    profile["top_issues"] = issue_keywords[:20]
    profile["total_statements"] = len(statements)

    # -- Bills sponsored --
    log.info("  Fetching bills sponsored by %s", mp_slug)
    bills_url = f"{BASE_URL}/bills/?format=json&sponsor_politician={mp_slug}"
    bills = fetch_all_pages(bills_url, max_pages=5)
    profile["bills_sponsored"] = []
    for bill in bills:
        profile["bills_sponsored"].append({
            "number": bill.get("number", ""),
            "name": bill.get("name", {}).get("en", "") if isinstance(bill.get("name"), dict) else bill.get("name", ""),
            "status": bill.get("status", {}).get("en", "") if isinstance(bill.get("status"), dict) else bill.get("status", ""),
            "introduced": bill.get("introduced", ""),
            "url": bill.get("url", ""),
        })

    # -- Lobbying meetings (from local data) --
    if lobbying_data is None:
        lobbying_data = load_lobbying_data()
    meetings = _find_lobbying_meetings(name, mp_slug, lobbying_data)
    profile["lobbying_meetings"] = meetings
    profile["total_lobbying_meetings"] = len(meetings)

    # Save profile
    profile_path = os.path.join(PROFILES_DIR, f"{mp_slug}.json")
    save_json(profile, profile_path)
    return profile


def _extract_top_issues(statements):
    """Extract top issues from MP statements by keyword frequency analysis."""
    # Issue-related keywords to look for in Hansard statements
    issue_categories = {
        "housing": ["housing", "affordable housing", "rent", "mortgage", "homelessness"],
        "healthcare": ["healthcare", "health care", "hospital", "doctor", "mental health", "pharmacare"],
        "immigration": ["immigration", "immigrant", "refugee", "newcomer", "citizenship"],
        "climate": ["climate", "carbon", "emissions", "environment", "green energy"],
        "economy": ["economy", "inflation", "cost of living", "gdp", "recession", "jobs"],
        "defence": ["defence", "defense", "military", "nato", "armed forces"],
        "indigenous": ["indigenous", "first nations", "reconciliation", "treaty"],
        "foreign_affairs": ["foreign affairs", "china", "russia", "ukraine", "nato", "trade"],
        "justice": ["justice", "crime", "bail", "prison", "sentencing", "police"],
        "education": ["education", "student", "university", "college", "tuition"],
        "taxation": ["tax", "taxes", "taxation", "carbon tax", "gst"],
        "digital": ["digital", "privacy", "data", "ai", "artificial intelligence", "technology"],
        "agriculture": ["agriculture", "farm", "farmer", "food security"],
        "energy": ["energy", "oil", "gas", "pipeline", "renewable"],
        "veterans": ["veteran", "veterans", "armed forces"],
        "seniors": ["senior", "seniors", "pension", "cpp", "old age"],
        "childcare": ["childcare", "child care", "daycare"],
        "transparency": ["transparency", "accountability", "ethics", "conflict of interest"],
        "foreign_interference": ["foreign interference", "election interference", "meddling"],
        "firearms": ["firearm", "gun", "firearms", "gun control"],
    }

    counts = collections.Counter()
    for stmt in statements:
        # Try multiple text fields
        text = ""
        for field in ("content", "text", "statement", "description"):
            content = stmt.get(field, "")
            if isinstance(content, dict):
                content = content.get("en", "")
            if content:
                text += " " + content
        text = text.lower()

        for category, keywords in issue_categories.items():
            for kw in keywords:
                if kw in text:
                    counts[category] += 1
                    break  # Count each category only once per statement

    # Return sorted by frequency
    return [
        {"issue": issue, "mentions": count}
        for issue, count in counts.most_common()
    ]


def _find_lobbying_meetings(mp_name, mp_slug, lobbying_data):
    """Find lobbying meetings involving this MP."""
    matches = []
    name_lower = mp_name.lower()
    name_parts = name_lower.split()

    for record in lobbying_data:
        # Check all fields for MP name matches
        all_text = " ".join(str(v).lower() for v in record.values() if isinstance(v, str))

        matched = False
        # Full name match
        if name_lower in all_text:
            matched = True
        # Last name + first name match (handles "Poilievre, Pierre" format)
        elif len(name_parts) >= 2:
            last_name = name_parts[-1]
            first_name = name_parts[0]
            if last_name in all_text and first_name in all_text:
                matched = True

        if matched:
            matches.append({
                "lobbyist": record.get("lobbyist_name", record.get("Registrant Name", "")),
                "client": record.get("client", record.get("Client Name", "")),
                "subject": record.get("subject", record.get("Subject Matter", "")),
                "date": record.get("date", record.get("Date", "")),
                "dpoh": record.get("dpoh_met", record.get("DPOH Name", "")),
            })

    return matches


# ---------------------------------------------------------------------------
# Pattern detection
# ---------------------------------------------------------------------------

def detect_patterns(profiles=None):
    """Detect suspicious patterns across all MP profiles.

    Flags:
    - MP votes against party AND met with lobbyists on same issue
    - MP sponsors bill that benefits a specific lobbyist's client
    - MP switches position after lobbying meetings
    """
    log.info("Running pattern detection...")
    ensure_dirs()

    if profiles is None:
        profiles = _load_all_profiles()

    if not profiles:
        log.warning("No profiles found. Run --collect-mps and --profile first.")
        return []

    findings = []

    for profile in profiles:
        slug = profile.get("slug", "unknown")
        name = profile.get("name", slug)
        party = profile.get("party", "")

        voting = profile.get("voting_record", {})
        against_pct = voting.get("pct_against_party", 0)
        lobbying_meetings = profile.get("lobbying_meetings", [])
        top_issues = profile.get("top_issues", [])
        bills = profile.get("bills_sponsored", [])

        # Pattern 1: High dissent rate + lobbying meetings
        if against_pct > 10 and len(lobbying_meetings) > 5:
            issue_overlap = _check_issue_overlap(top_issues, lobbying_meetings)
            if issue_overlap:
                findings.append({
                    "type": "dissent_plus_lobbying",
                    "severity": "high" if against_pct > 20 else "medium",
                    "mp_slug": slug,
                    "mp_name": name,
                    "party": party,
                    "detail": {
                        "against_party_pct": against_pct,
                        "total_lobbying_meetings": len(lobbying_meetings),
                        "overlapping_issues": issue_overlap,
                    },
                    "description": (
                        f"{name} ({party}) voted against party {against_pct}% of the time "
                        f"and had {len(lobbying_meetings)} lobbying meetings. "
                        f"Overlapping issues: {', '.join(issue_overlap)}"
                    ),
                })

        # Pattern 2: Bills sponsored that align with lobbyist clients
        if bills and lobbying_meetings:
            bill_lobby_matches = _check_bill_lobby_alignment(bills, lobbying_meetings)
            for match in bill_lobby_matches:
                findings.append({
                    "type": "bill_lobby_alignment",
                    "severity": "high",
                    "mp_slug": slug,
                    "mp_name": name,
                    "party": party,
                    "detail": match,
                    "description": (
                        f"{name} ({party}) sponsored bill '{match['bill_name']}' "
                        f"which may align with lobbying by {match['lobbyist_client']}"
                    ),
                })

        # Pattern 3: Heavy lobbying concentration from single entity
        if lobbying_meetings:
            client_counts = collections.Counter()
            for meeting in lobbying_meetings:
                client = meeting.get("client", "").strip()
                if client:
                    client_counts[client] += 1

            for client, count in client_counts.most_common(5):
                if count >= 3:
                    findings.append({
                        "type": "concentrated_lobbying",
                        "severity": "medium" if count < 5 else "high",
                        "mp_slug": slug,
                        "mp_name": name,
                        "party": party,
                        "detail": {
                            "client": client,
                            "meeting_count": count,
                            "total_meetings": len(lobbying_meetings),
                            "concentration_pct": round(count / len(lobbying_meetings) * 100, 1),
                        },
                        "description": (
                            f"{name} ({party}) had {count} meetings with lobbyists for "
                            f"'{client}' ({round(count / len(lobbying_meetings) * 100, 1)}% "
                            f"of all lobbying meetings)"
                        ),
                    })

    # Sort by severity
    severity_order = {"high": 0, "medium": 1, "low": 2}
    findings.sort(key=lambda x: severity_order.get(x["severity"], 3))

    log.info("Detected %d patterns across %d profiles", len(findings), len(profiles))

    path = os.path.join(DATA_DIR, "detected_patterns.json")
    save_json({
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        "profiles_analyzed": len(profiles),
        "total_findings": len(findings),
        "findings_by_severity": {
            "high": sum(1 for f in findings if f["severity"] == "high"),
            "medium": sum(1 for f in findings if f["severity"] == "medium"),
            "low": sum(1 for f in findings if f["severity"] == "low"),
        },
        "findings": findings,
    }, path)

    return findings


def _check_issue_overlap(top_issues, lobbying_meetings):
    """Check if lobbied subjects overlap with MP's top issues."""
    mp_issues = {item["issue"].lower() for item in top_issues[:10]}
    lobby_subjects = set()
    for meeting in lobbying_meetings:
        subject = meeting.get("subject", "").lower()
        for word in subject.split():
            lobby_subjects.add(word)

    # Map issue categories to lobbying keywords
    overlap_map = {
        "housing": {"housing", "real estate", "construction", "property"},
        "healthcare": {"health", "pharmaceutical", "drug", "medical"},
        "energy": {"energy", "oil", "gas", "pipeline", "petroleum"},
        "taxation": {"tax", "fiscal", "revenue"},
        "digital": {"technology", "digital", "data", "telecom"},
        "defence": {"defence", "defense", "military", "security"},
        "agriculture": {"agriculture", "food", "farm"},
        "climate": {"climate", "environment", "carbon", "emissions"},
        "foreign_affairs": {"trade", "international", "foreign"},
        "immigration": {"immigration", "citizenship"},
    }

    overlaps = []
    for issue in mp_issues:
        keywords = overlap_map.get(issue, {issue})
        if keywords & lobby_subjects:
            overlaps.append(issue)

    return overlaps


def _check_bill_lobby_alignment(bills, lobbying_meetings):
    """Check if sponsored bills align with lobbyist clients' interests."""
    matches = []
    for bill in bills:
        bill_name = bill.get("name", "").lower()
        bill_number = bill.get("number", "")
        if not bill_name:
            continue

        for meeting in lobbying_meetings:
            client = meeting.get("client", "")
            subject = meeting.get("subject", "").lower()
            if not subject:
                continue

            # Check for keyword overlap between bill name and lobbying subject
            bill_words = set(bill_name.split()) - {"the", "a", "an", "of", "to", "and", "act", "for", "in", "on"}
            subject_words = set(subject.split()) - {"the", "a", "an", "of", "to", "and", "for", "in", "on"}

            common = bill_words & subject_words
            if len(common) >= 2:
                matches.append({
                    "bill_number": bill_number,
                    "bill_name": bill.get("name", ""),
                    "lobbyist_client": client,
                    "lobbying_subject": meeting.get("subject", ""),
                    "matching_keywords": list(common),
                })
    return matches


def _load_all_profiles():
    """Load all saved MP profiles."""
    profiles = []
    if not os.path.isdir(PROFILES_DIR):
        return profiles
    for fname in os.listdir(PROFILES_DIR):
        if fname.endswith(".json"):
            data = load_json(os.path.join(PROFILES_DIR, fname))
            if data:
                profiles.append(data)
    log.info("Loaded %d profiles from %s", len(profiles), PROFILES_DIR)
    return profiles


# ---------------------------------------------------------------------------
# Connection graph
# ---------------------------------------------------------------------------

def generate_connection_graph(profiles=None):
    """Create a connection graph as JSON for visualization.

    Nodes: MPs, lobbyists, companies
    Edges: meetings, sponsorships, party membership
    """
    log.info("Generating connection graph...")
    ensure_dirs()

    if profiles is None:
        profiles = _load_all_profiles()

    if not profiles:
        log.warning("No profiles found. Run profile collection first.")
        return None

    nodes = {}  # id -> node
    edges = []  # list of edge dicts

    for profile in profiles:
        slug = profile.get("slug", "")
        name = profile.get("name", slug)
        party = profile.get("party", "")

        # Add MP node
        mp_id = f"mp:{slug}"
        nodes[mp_id] = {
            "id": mp_id,
            "type": "mp",
            "label": name,
            "party": party,
            "riding": profile.get("riding", ""),
            "province": profile.get("province", ""),
            "total_votes": profile.get("voting_record", {}).get("total_votes", 0),
            "against_party_pct": profile.get("voting_record", {}).get("pct_against_party", 0),
        }

        # Add party node and edge
        if party:
            party_id = f"party:{party}"
            if party_id not in nodes:
                nodes[party_id] = {
                    "id": party_id,
                    "type": "party",
                    "label": party,
                    "members": 0,
                }
            nodes[party_id]["members"] = nodes[party_id].get("members", 0) + 1
            edges.append({
                "source": mp_id,
                "target": party_id,
                "type": "member_of",
                "weight": 1,
            })

        # Add lobbying connections
        for meeting in profile.get("lobbying_meetings", []):
            lobbyist = meeting.get("lobbyist", "").strip()
            client = meeting.get("client", "").strip()
            subject = meeting.get("subject", "")

            if client:
                client_id = f"company:{_slug(client)}"
                if client_id not in nodes:
                    nodes[client_id] = {
                        "id": client_id,
                        "type": "company",
                        "label": client,
                        "lobbying_subjects": [],
                    }
                if subject and subject not in nodes[client_id].get("lobbying_subjects", []):
                    nodes[client_id].setdefault("lobbying_subjects", []).append(subject)

                # Edge: company -> MP (lobbying meeting)
                edge_key = f"{client_id}->{mp_id}"
                existing = next((e for e in edges if
                                 e["source"] == client_id and e["target"] == mp_id and
                                 e["type"] == "lobbying_meeting"), None)
                if existing:
                    existing["weight"] = existing.get("weight", 0) + 1
                else:
                    edges.append({
                        "source": client_id,
                        "target": mp_id,
                        "type": "lobbying_meeting",
                        "weight": 1,
                        "subject": subject,
                    })

            if lobbyist:
                lobbyist_id = f"lobbyist:{_slug(lobbyist)}"
                if lobbyist_id not in nodes:
                    nodes[lobbyist_id] = {
                        "id": lobbyist_id,
                        "type": "lobbyist",
                        "label": lobbyist,
                    }

                # Edge: lobbyist -> company (represents)
                if client:
                    edge_exists = any(
                        e["source"] == lobbyist_id and e["target"] == client_id and
                        e["type"] == "represents"
                        for e in edges
                    )
                    if not edge_exists:
                        edges.append({
                            "source": lobbyist_id,
                            "target": client_id,
                            "type": "represents",
                            "weight": 1,
                        })

        # Add bill sponsorship connections
        for bill in profile.get("bills_sponsored", []):
            bill_number = bill.get("number", "")
            bill_name = bill.get("name", "")
            if bill_number:
                bill_id = f"bill:{bill_number}"
                if bill_id not in nodes:
                    nodes[bill_id] = {
                        "id": bill_id,
                        "type": "bill",
                        "label": f"{bill_number}: {bill_name}",
                        "status": bill.get("status", ""),
                    }
                edges.append({
                    "source": mp_id,
                    "target": bill_id,
                    "type": "sponsored",
                    "weight": 1,
                })

    graph = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "node_types": dict(collections.Counter(n["type"] for n in nodes.values())),
        "edge_types": dict(collections.Counter(e["type"] for e in edges)),
        "nodes": list(nodes.values()),
        "edges": edges,
    }

    save_json(graph, CONNECTIONS_PATH)
    log.info(
        "Graph: %d nodes (%s), %d edges (%s)",
        len(nodes),
        ", ".join(f"{v} {k}" for k, v in graph["node_types"].items()),
        len(edges),
        ", ".join(f"{v} {k}" for k, v in graph["edge_types"].items()),
    )
    return graph


def _slug(text):
    """Convert text to a simple slug for node IDs."""
    return re.sub(r"[^a-z0-9]+", "-", text.lower().strip()).strip("-")[:80]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Map politicians and their connections using public government records",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python politician_mapper.py --collect-mps
  python politician_mapper.py --profile poilievre-pierre
  python politician_mapper.py --profile-all
  python politician_mapper.py --detect-patterns
  python politician_mapper.py --connection-graph
  python politician_mapper.py --all

Workflow:
  1. Run --collect-mps to get all MP data
  2. Run lobbying_collector.py to get lobbying data
  3. Run --profile-all to build all profiles
  4. Run --detect-patterns to find suspicious patterns
  5. Run --connection-graph to generate visualization data
""",
    )
    parser.add_argument("--collect-mps", action="store_true",
                        help="Fetch all current/recent MPs from OpenParliament")
    parser.add_argument("--profile", type=str, metavar="SLUG",
                        help="Build comprehensive profile for a specific MP (e.g. poilievre-pierre)")
    parser.add_argument("--profile-all", action="store_true",
                        help="Build profiles for all collected MPs")
    parser.add_argument("--detect-patterns", action="store_true",
                        help="Detect suspicious patterns across all profiles")
    parser.add_argument("--connection-graph", action="store_true",
                        help="Generate connection graph JSON for visualization")
    parser.add_argument("--all", action="store_true",
                        help="Run full pipeline: collect MPs, build profiles, detect patterns, graph")
    parser.add_argument("--max-profiles", type=int, default=50,
                        help="Max number of MP profiles to build in --profile-all (default: 50)")
    parser.add_argument("--verbose", action="store_true",
                        help="Enable debug logging")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not any([args.collect_mps, args.profile, args.profile_all,
                args.detect_patterns, args.connection_graph, args.all]):
        parser.print_help()
        sys.exit(1)

    mps = None
    lobbying_data = None

    # Step 1: Collect MPs
    if args.all or args.collect_mps:
        mps = collect_all_mps()

    # Step 2: Build individual profile
    if args.profile:
        lobbying_data = load_lobbying_data()
        profile = build_mp_profile(args.profile, lobbying_data=lobbying_data)
        if profile:
            log.info("Profile built for %s: %d votes, %d statements, %d lobbying meetings, %d bills",
                     args.profile,
                     profile["voting_record"]["total_votes"],
                     profile["total_statements"],
                     profile["total_lobbying_meetings"],
                     len(profile["bills_sponsored"]))

    # Step 3: Build all profiles
    if args.all or args.profile_all:
        if mps is None:
            mp_data = load_json(os.path.join(DATA_DIR, "all_mps.json"))
            if mp_data:
                mps = mp_data.get("mps", [])
            else:
                log.error("No MP data found. Run --collect-mps first.")
                mps = []

        if lobbying_data is None:
            lobbying_data = load_lobbying_data()

        built = 0
        for mp in mps[:args.max_profiles]:
            slug = _extract_mp_slug(mp)
            if slug:
                try:
                    build_mp_profile(slug, lobbying_data=lobbying_data)
                    built += 1
                except Exception as exc:
                    log.error("Failed to build profile for %s: %s", slug, exc)
        log.info("Built %d MP profiles", built)

    # Step 4: Detect patterns
    if args.all or args.detect_patterns:
        findings = detect_patterns()
        log.info("Detected %d patterns", len(findings))

    # Step 5: Connection graph
    if args.all or args.connection_graph:
        graph = generate_connection_graph()
        if graph:
            log.info("Connection graph saved to %s", CONNECTIONS_PATH)

    log.info("Done. Data saved under: %s", DATA_DIR)


if __name__ == "__main__":
    main()
