#!/usr/bin/env python3
"""
cija_pipeline_tracker.py — TENET5 CIJA Lobby-to-Vote Pipeline Analyzer

Dedicated tracker for the Centre for Israel and Jewish Affairs (CIJA)
lobbying pipeline. Cross-references CIJA lobbying communications with
parliamentary voting records to map the influence pathway.

Extracts from public data:
  - CIJA registered lobbying communications
  - MPs lobbied by CIJA (from lobbying_analysis.json)
  - Vote records on Israel-related motions
  - CIJA trip participants (Israel solidarity trips)
  - Cross-reference: lobbied → voted alignment

All data from PUBLIC GOVERNMENT RECORDS.
Integrated with TENET5 ABCXYZ N vs NP Millennial Falcon.

Usage:
    python cija_pipeline_tracker.py --analyze
    python cija_pipeline_tracker.py --mp "Anthony Housefather"
"""

import argparse
import json
import logging
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Dict

class CIJAPipelineTracker:
    def __init__(self):
        self.pipeline_status: Dict[str, str] = {}
        self.logger = logging.getLogger(__name__)

    def update_status(self, scraper_name: str, status: str):
        self.pipeline_status[scraper_name] = status
        self.logger.info(f"Updated status for {scraper_name}: {status}")

    def get_status(self, scraper_name: str) -> str:
        return self.pipeline_status.get(scraper_name, "Unknown")


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "..")
EVIDENCE_DIR = os.path.join(SCRIPT_DIR, "..", "..", "evidence", "profiles")
OSINT_VAULT_DIR = os.path.join(DATA_DIR, "osint_vault")

LOBBYING_ANALYSIS_PATH = os.path.join(DATA_DIR, "lobbying_analysis.json")
INVESTIGATION_BOARD_PATH = os.path.join(DATA_DIR, "investigation_board.json")
ALL_MPS_PATH = os.path.join(DATA_DIR, "all_mps.json")
ANALYSIS_PATH = os.path.join(DATA_DIR, "analysis.json")

OUTPUT_DIR = os.path.join(DATA_DIR, "cija_analysis")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("cija_pipeline_tracker")


def load_json_safe(path):
    if not os.path.isfile(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log.error("Failed to load %s: %s", path, e)
        return None


# ---------------------------------------------------------------------------
# CIJA intelligence extraction
# ---------------------------------------------------------------------------

def extract_cija_from_board():
    """Extract CIJA-related entities from the investigation board."""
    board = load_json_safe(INVESTIGATION_BOARD_PATH) or {}
    nodes = board.get("nodes", [])
    edges = board.get("edges", [])

    cija_nodes = []
    cija_connected = []

    for node in nodes:
        cats = node.get("categories", [])
        label = node.get("label", "")
        detail = node.get("detail", "")

        # Direct CIJA nodes
        if "cija" in label.lower() or "cija" in detail.lower():
            cija_nodes.append(node)
        # Israel-category nodes
        elif "israel" in cats:
            cija_connected.append(node)

    # Find edges connected to CIJA
    cija_ids = {n["id"] for n in cija_nodes}
    cija_edges = []
    for edge in edges:
        if edge.get("source") in cija_ids or edge.get("target") in cija_ids:
            cija_edges.append(edge)

    log.info("CIJA nodes: %d, connected: %d, edges: %d",
             len(cija_nodes), len(cija_connected), len(cija_edges))
    return {
        "cija_nodes": cija_nodes,
        "israel_connected": cija_connected,
        "cija_edges": cija_edges,
    }


def extract_cija_from_osint():
    """Extract CIJA intelligence from OSINT vault."""
    results = {}
    if not os.path.isdir(OSINT_VAULT_DIR):
        return results

    for fname in os.listdir(OSINT_VAULT_DIR):
        if not fname.endswith(".json"):
            continue
        data = load_json_safe(os.path.join(OSINT_VAULT_DIR, fname))
        if not data or not isinstance(data, dict):
            continue

        for entity_name, searches in data.items():
            if not isinstance(searches, dict):
                continue
            for query, query_results in searches.items():
                if "cija" in query.lower() or "lobby" in query.lower():
                    results[entity_name] = results.get(entity_name, [])
                    if isinstance(query_results, list):
                        for r in query_results:
                            if isinstance(r, dict):
                                # LIRIL Task 1: Algorithmic Email Extraction Vector
                                body_content = r.get("body", "")
                                import re
                                email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
                                extracted_emails = re.findall(email_regex, body_content)
                                
                                results[entity_name].append({
                                    "query": query,
                                    "title": r.get("title", ""),
                                    "href": r.get("href", ""),
                                    "emails_discovered": extracted_emails,
                                    "body": body_content[:300],
                                })

    log.info("CIJA OSINT results: %d entities", len(results))
    return results


def extract_israel_votes():
    """Extract Israel-related votes from analysis data."""
    analysis = load_json_safe(ANALYSIS_PATH) or {}
    contentious = analysis.get("contentious_votes", [])

    israel_votes = []
    for vote in contentious:
        desc = (vote.get("description", "") + " " + vote.get("bill", "")).lower()
        if any(kw in desc for kw in ["israel", "ceasefire", "gaza", "arms",
                                      "weapons", "palestine", "hamas",
                                      "humanitarian", "genocide"]):
            israel_votes.append(vote)

    log.info("Israel-related votes found: %d", len(israel_votes))
    return israel_votes


def build_mp_cija_profile(mp_name):
    """Build a comprehensive CIJA pipeline profile for a specific MP."""
    log.info("Building CIJA profile for: %s", mp_name)
    name_lower = mp_name.lower()

    # Board intelligence
    board = load_json_safe(INVESTIGATION_BOARD_PATH) or {}
    board_matches = []
    for node in board.get("nodes", []):
        if name_lower in node.get("label", "").lower():
            board_matches.append(node)

    # OSINT vault intelligence
    osint_matches = {}
    if os.path.isdir(OSINT_VAULT_DIR):
        for fname in os.listdir(OSINT_VAULT_DIR):
            if not fname.endswith(".json"):
                continue
            data = load_json_safe(os.path.join(OSINT_VAULT_DIR, fname))
            if not data or not isinstance(data, dict):
                continue
            for entity_name, searches in data.items():
                if name_lower in entity_name.lower():
                    osint_matches[entity_name] = searches

    # Lobbying analysis
    lobbying = load_json_safe(LOBBYING_ANALYSIS_PATH) or {}
    lobby_matches = []
    for official in lobbying.get("top_lobbied_officials", []):
        if name_lower in official.get("name", "").lower():
            lobby_matches.append(official)

    return {
        "mp_name": mp_name,
        "board_entries": board_matches,
        "osint_intelligence": osint_matches,
        "lobbying_records": lobby_matches,
        "profile_type": "CIJA_PIPELINE",
    }


# ---------------------------------------------------------------------------
# Full Pipeline Analysis
# ---------------------------------------------------------------------------

def run_pipeline_analysis():
    """Run the full CIJA lobby-to-vote pipeline analysis."""
    log.info("=== CIJA Pipeline Analysis Starting ===")

    board_intel = extract_cija_from_board()
    osint_intel = extract_cija_from_osint()
    israel_votes = extract_israel_votes()

    # Known CIJA-lobbied MPs from investigation board
    cija_lobbied_mps = []
    for node in board_intel["israel_connected"]:
        if node.get("type") == "person":
            detail = node.get("detail", "")
            lobbied_count = 0
            match = re.search(r'lobbied.*?(\d+)', detail.lower())
            if match:
                lobbied_count = int(match.group(1))
            cija_lobbied_mps.append({
                "name": node.get("label", ""),
                "subtitle": node.get("subtitle", ""),
                "detail": detail,
                "cija_lobbying_count": lobbied_count,
                "categories": node.get("categories", []),
            })

    # Sort by lobbying count
    cija_lobbied_mps.sort(key=lambda x: x["cija_lobbying_count"], reverse=True)

    # Build output
    analysis = {
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "system": "TENET5 ABCXYZ N vs NP Millennial Falcon",
        "handoff": "Empirical Magic Handoff — SECURED",
        "pipeline_summary": {
            "cija_board_nodes": len(board_intel["cija_nodes"]),
            "israel_connected_entities": len(board_intel["israel_connected"]),
            "cija_edges": len(board_intel["cija_edges"]),
            "osint_entities_with_cija_intel": len(osint_intel),
            "israel_related_votes": len(israel_votes),
            "mps_with_cija_lobbying": len([m for m in cija_lobbied_mps if m["cija_lobbying_count"] > 0]),
        },
        "lobbied_mps": cija_lobbied_mps,
        "israel_votes": israel_votes,
        "osint_intelligence": {k: len(v) for k, v in osint_intel.items()},
        "board_entities": {
            "cija_direct": [{"id": n["id"], "label": n["label"], "detail": n.get("detail", "")}
                           for n in board_intel["cija_nodes"]],
            "israel_network": [{"id": n["id"], "label": n["label"], "type": n.get("type", "")}
                              for n in board_intel["israel_connected"]],
        },
    }

    # Save
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, "cija_pipeline_analysis.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False, default=str)
    log.info("Analysis saved: %s", output_path)

    # Generate dossier
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    dossier_path = os.path.join(EVIDENCE_DIR, f"cija_pipeline_dossier_{ts}.md")
    with open(dossier_path, "w", encoding="utf-8") as f:
        f.write(f"# TENET5 CIJA Lobby-to-Vote Pipeline Analysis\n\n")
        f.write(f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC\n")
        f.write(f"**System:** ABCXYZ N vs NP Millennial Falcon\n")
        f.write(f"**Memory:** Empirical Magic Handoff — SECURED\n\n")

        f.write("## Pipeline Summary\n\n")
        for k, v in analysis["pipeline_summary"].items():
            f.write(f"- **{k.replace('_', ' ').title()}:** {v}\n")

        f.write("\n## Most Lobbied MPs (by CIJA count)\n\n")
        f.write("| MP | Subtitle | CIJA Lobbying Count | Detail |\n")
        f.write("|----|----------|---------------------|--------|\n")
        for mp in cija_lobbied_mps[:20]:
            detail_short = mp["detail"][:80] + "..." if len(mp["detail"]) > 80 else mp["detail"]
            f.write(f"| **{mp['name']}** | {mp['subtitle']} | {mp['cija_lobbying_count']} | {detail_short} |\n")

        if israel_votes:
            f.write("\n## Israel-Related Parliamentary Votes\n\n")
            for v in israel_votes:
                f.write(f"### {v.get('bill', 'N/A')}\n")
                f.write(f"- **Description:** {v.get('description', 'N/A')}\n")
                f.write(f"- **Yea:** {v.get('yea', '?')} | **Nay:** {v.get('nay', '?')}\n\n")

        if osint_intel:
            f.write("\n## OSINT Intelligence (CIJA-related queries)\n\n")
            for entity, results in osint_intel.items():
                f.write(f"### {entity}\n")
                for r in results[:3]:
                    f.write(f"- [{r['title']}]({r['href']})\n")
                f.write("\n")

        f.write("\n---\n*Secured via TENET5 Empirical Magic Handoff Memory System*\n")

    log.info("Dossier saved: %s", dossier_path)
    return analysis


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="TENET5 CIJA Lobby-to-Vote Pipeline Tracker",
    )
    parser.add_argument("--analyze", action="store_true",
                        help="Run full CIJA pipeline analysis")
    parser.add_argument("--mp", type=str,
                        help="Build CIJA profile for specific MP")
    parser.add_argument("--verbose", action="store_true")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not any([args.analyze, args.mp]):
        parser.print_help()
        sys.exit(1)

    if args.mp:
        profile = build_mp_cija_profile(args.mp)
        print(json.dumps(profile, indent=2, default=str))

    if args.analyze:
        analysis = run_pipeline_analysis()
        log.info("=== ANALYSIS COMPLETE ===")
        for k, v in analysis["pipeline_summary"].items():
            log.info("  %s: %s", k, v)


if __name__ == "__main__":
    main()
