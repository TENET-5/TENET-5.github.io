#!/usr/bin/env python3
"""
TENET5 Hansard Analysis Engine
Processes collected parliamentary data from OpenParliament.ca
and generates structured JSON for the hansard-dashboard.

All data is from PUBLIC GOVERNMENT RECORDS:
- OpenParliament.ca API (CC-BY licence)
- LEGISinfo (parl.ca)
- House of Commons Hansard

Usage:
    python analyze_bills.py --analyze --export data/analysis.json
"""

import json
import argparse
import re
import os
import sys
from datetime import datetime, timezone
from collections import defaultdict, Counter
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent / "hansard"
PROFILES_DIR = SCRIPT_DIR.parent / "profiles"
ALL_MPS_FILE = SCRIPT_DIR.parent / "all_mps.json"

BILLS_FILE = None
VOTES_FILE = None
DEBATES_FILE = None


def find_latest_file(prefix: str) -> Path | None:
    """Find the most recent JSONL file matching a prefix in DATA_DIR."""
    candidates = sorted(DATA_DIR.glob(f"{prefix}*.jsonl"), reverse=True)
    return candidates[0] if candidates else None


# ── Topic categorization keywords ──────────────────────────────────────
CATEGORY_KEYWORDS = {
    "defense": [
        "national defence", "defence act", "military", "armed forces",
        "canadian forces", "veterans", "nato", "norad", "security",
        "intelligence", "csis", "rcmp", "policing", "terrorism",
        "firearms", "weapons", "border security"
    ],
    "finance": [
        "income tax", "budget", "fiscal", "financial", "bank",
        "money", "revenue", "appropriation", "supply", "estimates",
        "granting to his majesty", "sums of money", "consolidated revenue",
        "affordability", "inflation", "economic", "tax"
    ],
    "healthcare": [
        "health", "medical", "drug", "pharmaceutical", "mental health",
        "cannabis", "opioid", "pandemic", "hospital", "patient",
        "assisted dying", "maid", "palliative", "disability",
        "diffuse intrinsic pontine glioma"
    ],
    "environment": [
        "environment", "climate", "carbon", "emission", "pollution",
        "water", "ocean", "fisheries", "wildlife", "conservation",
        "energy", "renewable", "gas-powered", "electric vehicle",
        "sustainability", "climate-aligned finance"
    ],
    "justice": [
        "criminal code", "justice", "bail", "sentencing", "prison",
        "corrections", "conditional release", "parole", "youth criminal",
        "hate propaganda", "hate crime", "sexual offence",
        "victim", "human trafficking", "intimate partner violence",
        "child protection", "gender-based violence", "lawful access"
    ],
    "immigration": [
        "immigration", "citizenship", "refugee", "asylum", "border",
        "immigration status", "immigration system"
    ],
    "indigenous": [
        "indigenous", "first nations", "inuit", "metis", "indian act",
        "treaty", "self-government", "blanket ceremony",
        "tlegohli got'ine", "red river metis"
    ],
    "trade": [
        "trade", "tariff", "export", "import", "commerce",
        "trans-pacific", "cptpp", "free trade", "labour mobility",
        "economic partnership", "indonesia", "united kingdom",
        "building canada", "auto pact"
    ],
    "technology": [
        "cyber", "digital", "technology", "telecommunications",
        "artificial intelligence", "data", "privacy", "internet",
        "online", "electronic"
    ],
    "social": [
        "housing", "education", "child care", "pension", "social",
        "employment", "labour", "workers", "accessibility",
        "women's health", "cities and municipalities",
        "build canada homes"
    ],
    "governance": [
        "elections", "electoral", "parliament", "senate", "governor",
        "oaths of office", "commissioner", "accountability",
        "public accounts", "weights and measures", "railways",
        "competition act"
    ],
}

# Bills flagged for foreign influence analysis
FOREIGN_INFLUENCE_KEYWORDS = [
    "trade", "tariff", "export", "import", "foreign", "international",
    "treaty", "defence", "defense", "nato", "norad", "security",
    "border", "immigration", "citizenship", "sanctions",
    "trans-pacific", "cptpp", "united kingdom", "indonesia",
    "lobbying", "influence", "espionage", "interference",
    "auto pact", "economic partnership"
]


def load_jsonl(filepath: Path) -> list[dict]:
    """Load a JSONL file into a list of dicts."""
    records = []
    if not filepath.exists():
        print(f"WARNING: File not found: {filepath}", file=sys.stderr)
        return records
    with open(filepath, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"WARNING: Malformed JSON at {filepath}:{line_num}: {e}",
                      file=sys.stderr)
    return records


def categorize_bill(bill: dict) -> str:
    """Categorize a single bill by its English title using keyword matching."""
    title = bill.get("name", {}).get("en", "").lower()
    number = bill.get("number", "").lower()

    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in title)
        if score > 0:
            scores[category] = score

    if scores:
        return max(scores, key=scores.get)

    return "other"


def is_foreign_affairs_bill(bill: dict) -> bool:
    """Check if a bill relates to foreign affairs / trade / defense / immigration."""
    title = bill.get("name", {}).get("en", "").lower()
    return any(kw in title for kw in FOREIGN_INFLUENCE_KEYWORDS)


def categorize_bills(bills_file: Path) -> list[dict]:
    """Read bills JSONL, categorize each bill by topic.

    Returns list of bill dicts enriched with 'category' and
    'foreign_affairs_flag' fields.
    """
    bills = load_jsonl(bills_file)
    print(f"Loaded {len(bills)} bills from {bills_file.name}")

    for bill in bills:
        bill["category"] = categorize_bill(bill)
        bill["foreign_affairs_flag"] = is_foreign_affairs_bill(bill)

    # Summary
    cat_counts = Counter(b["category"] for b in bills)
    print("Bill categories:")
    for cat, count in cat_counts.most_common():
        print(f"  {cat}: {count}")

    return bills


def analyze_vote_patterns(votes_file: Path) -> dict:
    """Read votes JSONL, compute per-party voting patterns.

    Returns a dict with:
    - party_stats: per-party vote totals (yea/nay/tie)
    - contentious_votes: votes with high dissent or close margins
    - unanimous_votes: votes with no nay votes
    - cross_party_votes: votes where parties crossed usual lines
    - all_votes: enriched vote records
    """
    votes = load_jsonl(votes_file)
    print(f"Loaded {len(votes)} votes from {votes_file.name}")

    party_stats = defaultdict(lambda: {
        "total_votes": 0, "yea": 0, "nay": 0,
        "internal_dissent_sum": 0.0, "dissent_count": 0
    })
    contentious_votes = []
    unanimous_votes = []
    cross_party_votes = []

    for vote in votes:
        total = vote.get("yea_total", 0) + vote.get("nay_total", 0)
        if total == 0:
            continue

        # Calculate margin
        margin = abs(vote.get("yea_total", 0) - vote.get("nay_total", 0))
        margin_pct = margin / total * 100 if total > 0 else 100

        vote["margin"] = margin
        vote["margin_pct"] = round(margin_pct, 1)
        vote["total_voters"] = total

        # Process party breakdown
        party_votes = {}
        max_dissent = 0.0
        for pb in vote.get("party_breakdown", []):
            party_name = pb["party"]["short_name"]["en"]
            party_vote = pb["vote"]
            dissent = pb.get("disagreement", 0.0)

            party_stats[party_name]["total_votes"] += 1
            if party_vote == "Yes":
                party_stats[party_name]["yea"] += 1
            else:
                party_stats[party_name]["nay"] += 1

            if dissent > 0:
                party_stats[party_name]["internal_dissent_sum"] += dissent
                party_stats[party_name]["dissent_count"] += 1

            party_votes[party_name] = party_vote
            max_dissent = max(max_dissent, dissent)

        vote["party_votes"] = party_votes
        vote["max_dissent"] = round(max_dissent, 4)

        # Classify vote types
        if vote.get("nay_total", 0) == 0:
            unanimous_votes.append(vote)

        # Contentious: margin < 10% or any party had internal dissent > 5%
        if margin_pct < 10 or max_dissent > 0.05:
            contentious_votes.append(vote)

        # Cross-party: check if Conservative+Liberal voted the same way
        con_vote = party_votes.get("Conservative")
        lib_vote = party_votes.get("Liberal")
        if con_vote and lib_vote and con_vote == lib_vote:
            cross_party_votes.append(vote)

    # Sort contentious by margin (closest first)
    contentious_votes.sort(key=lambda v: v["margin_pct"])

    # Compute average dissent per party
    for party, stats in party_stats.items():
        if stats["dissent_count"] > 0:
            stats["avg_dissent"] = round(
                stats["internal_dissent_sum"] / stats["dissent_count"], 4
            )
        else:
            stats["avg_dissent"] = 0.0

    print(f"  Unanimous votes: {len(unanimous_votes)}")
    print(f"  Contentious votes: {len(contentious_votes)}")
    print(f"  Cross-party (Con+Lib agree): {len(cross_party_votes)}")

    return {
        "party_stats": dict(party_stats),
        "contentious_votes": contentious_votes,
        "unanimous_votes": unanimous_votes,
        "cross_party_votes": cross_party_votes,
        "all_votes": votes,
    }


def load_mp_profiles() -> list[dict]:
    """Load MP profiles from all_mps.json if available."""
    if not ALL_MPS_FILE.exists():
        print(f"No MP data found at {ALL_MPS_FILE}")
        return []

    with open(ALL_MPS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    mps = data.get("mps", [])
    print(f"Loaded {len(mps)} MP profiles")
    return mps


def generate_bill_summary(
    categorized_bills: list[dict],
    vote_analysis: dict,
    mp_profiles: list[dict],
) -> dict:
    """Create a JSON summary combining all analysis results.

    Returns a dict with:
    - metadata: timestamps, counts
    - bills_by_category: count per category
    - bills_by_sponsor_party: count per sponsor party (from bill number prefix)
    - contentious_votes: top 20 most contentious
    - unanimous_votes: list of unanimous votes
    - foreign_affairs_bills: bills flagged for foreign influence
    - party_voting_patterns: per-party stats
    - cross_party_votes: where Con+Lib voted together
    - all_bills: full bill list with categories
    - all_votes: full vote list with enrichments
    - mp_summary: top MPs by party
    """
    # Bills by category
    bills_by_category = Counter(b["category"] for b in categorized_bills)

    # Bills by type (Government C-*, Private Member C-2**, Senate S-*)
    bills_by_type = {"government": 0, "private_member": 0, "senate": 0}
    for bill in categorized_bills:
        num = bill.get("number", "")
        if num.startswith("S-"):
            bills_by_type["senate"] += 1
        elif num.startswith("C-"):
            bill_num = num.replace("C-", "")
            try:
                n = int(bill_num)
                if n <= 200:
                    bills_by_type["government"] += 1
                else:
                    bills_by_type["private_member"] += 1
            except ValueError:
                bills_by_type["government"] += 1
        else:
            bills_by_type["government"] += 1

    # Foreign affairs bills
    foreign_bills = [
        {
            "number": b["number"],
            "title": b["name"]["en"],
            "category": b["category"],
            "introduced": b.get("introduced", ""),
            "url": b.get("url", ""),
        }
        for b in categorized_bills
        if b.get("foreign_affairs_flag")
    ]

    # Prepare vote summaries (trimmed for JSON size)
    def vote_summary(v):
        return {
            "number": v.get("number"),
            "date": v.get("date", ""),
            "description": v.get("description", {}).get("en", ""),
            "result": v.get("result", ""),
            "yea_total": v.get("yea_total", 0),
            "nay_total": v.get("nay_total", 0),
            "margin_pct": v.get("margin_pct", 100),
            "party_votes": v.get("party_votes", {}),
            "max_dissent": v.get("max_dissent", 0),
            "bill_url": v.get("bill_url"),
            "url": v.get("url", ""),
        }

    contentious = [
        vote_summary(v)
        for v in vote_analysis["contentious_votes"][:20]
    ]

    unanimous = [
        vote_summary(v)
        for v in vote_analysis["unanimous_votes"]
    ]

    cross_party = [
        vote_summary(v)
        for v in vote_analysis["cross_party_votes"][:20]
    ]

    # Party voting patterns
    party_patterns = {}
    for party, stats in vote_analysis["party_stats"].items():
        party_patterns[party] = {
            "total_votes": stats["total_votes"],
            "yea": stats["yea"],
            "nay": stats["nay"],
            "yea_pct": round(
                stats["yea"] / stats["total_votes"] * 100, 1
            ) if stats["total_votes"] > 0 else 0,
            "avg_dissent": stats["avg_dissent"],
        }

    # All bills for table (trimmed)
    all_bills_trimmed = []
    for b in categorized_bills:
        all_bills_trimmed.append({
            "number": b["number"],
            "title": b["name"]["en"],
            "introduced": b.get("introduced", ""),
            "category": b["category"],
            "foreign_flag": b.get("foreign_affairs_flag", False),
            "session": b.get("session", ""),
            "url": b.get("url", ""),
        })

    # All votes for table
    all_votes_trimmed = [
        vote_summary(v) for v in vote_analysis["all_votes"]
    ]

    # MP summary by party
    mp_summary = {"total": len(mp_profiles), "by_party": {}}
    for mp in mp_profiles:
        party = mp.get("current_party", {}).get("short_name", {}).get("en", "Unknown")
        if party not in mp_summary["by_party"]:
            mp_summary["by_party"][party] = 0
        mp_summary["by_party"][party] += 1

    # Debates summary
    debates = load_jsonl(DEBATES_FILE) if DEBATES_FILE and DEBATES_FILE.exists() else []

    summary = {
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "session": "45-1",
            "total_bills": len(categorized_bills),
            "total_votes": len(vote_analysis["all_votes"]),
            "total_mps": len(mp_profiles),
            "total_debates": len(debates),
            "data_sources": [
                "OpenParliament.ca API (CC-BY licence)",
                "LEGISinfo (parl.ca)",
                "House of Commons Hansard",
                "Elections Canada",
            ],
        },
        "bills_by_category": dict(bills_by_category.most_common()),
        "bills_by_type": bills_by_type,
        "party_voting_patterns": party_patterns,
        "contentious_votes": contentious,
        "unanimous_votes": unanimous,
        "cross_party_votes": cross_party,
        "foreign_affairs_bills": foreign_bills,
        "all_bills": all_bills_trimmed,
        "all_votes": all_votes_trimmed,
        "mp_summary": mp_summary,
        "recent_debates": [
            {
                "date": d.get("date", ""),
                "number": d.get("number", ""),
                "topic": d.get("most_frequent_word", {}).get("en", ""),
                "url": d.get("url", ""),
            }
            for d in debates
        ],
    }

    return summary


def export_for_site(summary: dict, output_path: Path) -> None:
    """Export analysis as JSON that the HTML pages can load via fetch()."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    size_kb = output_path.stat().st_size / 1024
    print(f"\nExported analysis to {output_path} ({size_kb:.1f} KB)")
    print(f"  Bills: {summary['metadata']['total_bills']}")
    print(f"  Votes: {summary['metadata']['total_votes']}")
    print(f"  MPs: {summary['metadata']['total_mps']}")
    print(f"  Foreign affairs bills: {len(summary['foreign_affairs_bills'])}")
    print(f"  Contentious votes: {len(summary['contentious_votes'])}")
    print(f"  Unanimous votes: {len(summary['unanimous_votes'])}")


def main():
    global BILLS_FILE, VOTES_FILE, DEBATES_FILE

    parser = argparse.ArgumentParser(
        description="TENET5 Hansard Analysis Engine — "
        "processes public parliamentary data"
    )
    parser.add_argument(
        "--analyze", action="store_true",
        help="Run full analysis on collected data"
    )
    parser.add_argument(
        "--export", type=str, default=None,
        help="Export analysis JSON to this path (relative to repo root)"
    )
    parser.add_argument(
        "--bills", type=str, default=None,
        help="Path to bills JSONL file (auto-detected if omitted)"
    )
    parser.add_argument(
        "--votes", type=str, default=None,
        help="Path to votes JSONL file (auto-detected if omitted)"
    )
    parser.add_argument(
        "--debates", type=str, default=None,
        help="Path to debates JSONL file (auto-detected if omitted)"
    )

    args = parser.parse_args()

    # Resolve data files
    BILLS_FILE = Path(args.bills) if args.bills else find_latest_file("bills_")
    VOTES_FILE = Path(args.votes) if args.votes else find_latest_file("votes_")
    DEBATES_FILE = Path(args.debates) if args.debates else find_latest_file("debates_")

    if not BILLS_FILE or not BILLS_FILE.exists():
        print(f"ERROR: Bills file not found. Searched in {DATA_DIR}", file=sys.stderr)
        sys.exit(1)

    if not VOTES_FILE or not VOTES_FILE.exists():
        print(f"ERROR: Votes file not found. Searched in {DATA_DIR}", file=sys.stderr)
        sys.exit(1)

    print("=" * 60)
    print("TENET5 Hansard Analysis Engine")
    print("=" * 60)
    print(f"Bills file:   {BILLS_FILE}")
    print(f"Votes file:   {VOTES_FILE}")
    print(f"Debates file: {DEBATES_FILE}")
    print(f"MP data:      {ALL_MPS_FILE}")
    print()

    if args.analyze or args.export:
        # Run analysis
        print("--- Categorizing Bills ---")
        categorized_bills = categorize_bills(BILLS_FILE)

        print("\n--- Analyzing Vote Patterns ---")
        vote_analysis = analyze_vote_patterns(VOTES_FILE)

        print("\n--- Loading MP Profiles ---")
        mp_profiles = load_mp_profiles()

        print("\n--- Generating Summary ---")
        summary = generate_bill_summary(
            categorized_bills, vote_analysis, mp_profiles
        )

        # Print summary stats
        print(f"\nTotal bills: {summary['metadata']['total_bills']}")
        print(f"Categories: {json.dumps(summary['bills_by_category'], indent=2)}")
        print(f"Bill types: {json.dumps(summary['bills_by_type'], indent=2)}")
        print(f"Party patterns:")
        for party, stats in summary["party_voting_patterns"].items():
            print(f"  {party}: {stats['yea']}Y / {stats['nay']}N "
                  f"({stats['yea_pct']}% yea, "
                  f"avg dissent {stats['avg_dissent']:.4f})")

        if args.export:
            # Resolve export path relative to repo root
            repo_root = SCRIPT_DIR.parent.parent
            export_path = repo_root / args.export
            export_for_site(summary, export_path)
    else:
        print("No action specified. Use --analyze and/or --export.")
        print("Example: python analyze_bills.py --analyze --export data/analysis.json")
        parser.print_help()


if __name__ == "__main__":
    main()
