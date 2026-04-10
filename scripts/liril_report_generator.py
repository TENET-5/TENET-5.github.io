# LIRIL Report Generator — creates publishable investigation reports from network data
# Uses DEIFIED GPU inference to generate AI analysis for each scandal cluster
# Modified: 2026-04-10 | Author: claude_code | SYSTEM_SEED=118400
"""
Usage:
    python scripts/liril_report_generator.py                    # Generate all cluster reports
    python scripts/liril_report_generator.py --cluster maid     # Generate specific cluster
    python scripts/liril_report_generator.py --summary          # Generate executive summary only
"""
import json
import os
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).parent.parent
SEED = 118400
DEIFIED_URL = os.environ.get("DEIFIED_URL", "http://127.0.0.1:11433")


def load_network():
    p = ROOT / "data" / "network_analysis" / "influence_network.json"
    return json.loads(p.read_text(encoding="utf-8"))


def get_cluster_nodes(d, category):
    """Get all nodes in a specific category cluster."""
    nodes = [n for n in d["nodes"] if category in (n.get("categories") or [])]
    # Also get connected nodes via edges
    cluster_ids = {n["id"] for n in nodes}
    connected = set()
    for e in d["edges"]:
        if e["source"] in cluster_ids:
            connected.add(e["target"])
        if e["target"] in cluster_ids:
            connected.add(e["source"])
    # Add connected nodes not already in cluster
    for n in d["nodes"]:
        if n["id"] in connected and n["id"] not in cluster_ids:
            nodes.append(n)
    return nodes


def ai_analyze_cluster(cluster_name, nodes, edge_count):
    """Use DEIFIED to generate AI analysis of a cluster."""
    try:
        entities = ", ".join(n["label"] for n in sorted(nodes, key=lambda x: -x.get("influence_score", 0))[:15])
        prompt = (
            f"Analyze this scandal cluster: {cluster_name}\n"
            f"Entities ({len(nodes)}): {entities}\n"
            f"Write a 150-word factual analysis of this cluster's significance, "
            f"key actors, and connections to other scandals. Cite specific numbers."
        )
        payload = json.dumps({
            "model": "llama",
            "messages": [
                {"role": "system", "content": "You are LIRIL, TENET5 AI analyst. Be factual. Cite numbers. No speculation."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 250,
            "temperature": 0.2,
        }).encode()

        for url in [f"{DEIFIED_URL}/api/chat", "http://127.0.0.1:11434/v1/chat/completions"]:
            try:
                req = Request(url, data=payload, headers={"Content-Type": "application/json"})
                resp = urlopen(req, timeout=15)
                r = json.loads(resp.read())
                if "choices" in r:
                    return r["choices"][0]["message"]["content"]
                elif "message" in r:
                    return r["message"].get("content", "")
            except Exception:
                continue
        return None
    except Exception:
        return None


def generate_cluster_report(d, category, cat_label):
    """Generate a full report for one scandal cluster."""
    nodes = get_cluster_nodes(d, category)
    if not nodes:
        return None

    # Sort by influence score
    nodes.sort(key=lambda x: -x.get("influence_score", 0))

    # Count edges in cluster
    cluster_ids = {n["id"] for n in nodes}
    edges = [e for e in d["edges"] if e["source"] in cluster_ids or e["target"] in cluster_ids]

    report = {
        "cluster": cat_label,
        "category": category,
        "node_count": len(nodes),
        "edge_count": len(edges),
        "top_entities": [
            {
                "name": n["label"],
                "score": n.get("influence_score", 0),
                "subtitle": n.get("subtitle", ""),
                "type": n.get("type", "unknown"),
            }
            for n in nodes[:20]
        ],
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    # AI analysis
    print(f"  Generating AI analysis for {cat_label}...")
    ai = ai_analyze_cluster(cat_label, nodes, len(edges))
    report["ai_analysis"] = ai or "Analysis unavailable"

    return report


def main():
    d = load_network()

    clusters = {
        "maid_legislation": "MAID Legislation (76,475+ deaths)",
        "ccp": "CCP Foreign Interference (107-year chain)",
        "financial_vector": "Financial/Procurement ($613B+)",
        "israel": "Israel Lobby (2,156 contacts)",
        "india": "India Foreign Interference (Nijjar assassination)",
        "media": "Media Concentration (Big Three oligopoly)",
        "cfnis": "Military/CFNIS (Afghan detainee + misconduct)",
        "treason_roster": "Treason Roster (NSICOP classified)",
        "osint_target": "OSINT Targets (active investigations)",
    }

    target = None
    if "--cluster" in sys.argv:
        idx = sys.argv.index("--cluster") + 1
        if idx < len(sys.argv):
            target = sys.argv[idx]

    print(f"\n{'='*60}")
    print(f"  LIRIL Report Generator — SEED={SEED}")
    print(f"  Network: {len(d['nodes'])} nodes, {len(d['edges'])} edges")
    print(f"{'='*60}\n")

    reports = {}
    for cat, label in clusters.items():
        if target and target not in cat:
            continue
        report = generate_cluster_report(d, cat, label)
        if report:
            reports[cat] = report
            print(f"  [{cat}] {report['node_count']} nodes, {report['edge_count']} edges")

    # Write reports
    out = ROOT / "data" / "liril_cluster_reports.json"
    out.write_text(json.dumps(reports, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nReports written to {out.name}")
    print(f"Clusters analyzed: {len(reports)}")


if __name__ == "__main__":
    main()
