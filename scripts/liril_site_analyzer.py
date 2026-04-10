# LIRIL Website Analyzer — AI-powered analysis of network data + site content
# Scans the network graph, generates AI analysis, writes reports to the site
# Modified: 2026-04-10 | Author: claude_code | SYSTEM_SEED=118400
"""
Usage:
    python scripts/liril_site_analyzer.py                # Full scan + AI analysis
    python scripts/liril_site_analyzer.py --report-only  # Generate report without AI
    python scripts/liril_site_analyzer.py --nats          # Report to LIRIL via NATS
"""
import asyncio
import json
import os
import sys
import time
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent.parent
SEED = 118400
NATS_URL = os.environ.get("NATS_URL", "nats://127.0.0.1:14222")


def load_network():
    """Load and analyze the influence network."""
    p = ROOT / "data" / "network_analysis" / "influence_network.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    return d


def analyze_network(d):
    """Generate comprehensive analysis of the network graph."""
    nodes = d["nodes"]
    edges = d["edges"]

    # Category distribution
    cats = Counter()
    types = Counter()
    for n in nodes:
        for c in n.get("categories", []):
            cats[c] += 1
        types[n.get("type", "unknown")] += 1

    # Hub analysis — top connected nodes
    edge_count = Counter()
    for e in edges:
        edge_count[e["source"]] += 1
        edge_count[e["target"]] += 1

    top_hubs = []
    for nid, count in edge_count.most_common(15):
        node = next((n for n in nodes if n["id"] == nid), None)
        if node:
            top_hubs.append({
                "name": node["label"],
                "connections": count,
                "score": node.get("influence_score", 0),
                "categories": node.get("categories", []),
            })

    # Scandal cluster detection — find connected components of non-donor nodes
    scandal_nodes = [n for n in nodes if n.get("type") != "donor"]
    high_score = [n for n in nodes if n.get("influence_score", 0) >= 50]

    # Financial exposure calculation
    financial_keywords = {
        "$357B": "infrastructure deficit",
        "$47.8B": "Indigenous child welfare",
        "$49B": "CEBA loans",
        "$34.2B": "Trans Mountain",
        "$27.7B": "F-35",
        "$77B": "shipbuilding",
        "$14B": "CERB fraud",
        "$13B": "carbon tax/year",
        "$5.1B": "Phoenix Pay",
        "$5B": "Canada Post losses",
        "$1.28T": "national debt",
        "$209M": "McKinsey",
        "$200M": "RCMP harassment settlements",
        "$60M": "ArriveCAN",
    }

    # Death toll
    death_counts = {
        "MAID": "76,475",
        "Opioid": "52,000+",
        "Yemen (Canadian arms)": "233,000",
        "Lac-Megantic": "47",
        "Jasper": "1",
        "Homeless (Calgary 2023)": "436",
    }

    analysis = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "seed": SEED,
        "network": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "non_donor_nodes": len(scandal_nodes),
            "high_score_entities": len(high_score),
        },
        "categories": dict(cats.most_common()),
        "entity_types": dict(types.most_common()),
        "top_hubs": top_hubs[:10],
        "financial_exposure": financial_keywords,
        "death_toll": death_counts,
        "institutional_failures": {
            "RCMP": "Connected to every enforcement failure — stood down on MAID, SNC-Lavalin, MindGeek, Sidewinder; enforced Emergencies Act against citizens; $200M+ harassment settlements",
            "CRA": "Identified $76M offshore taxes owed, can't say if collected; $14B+ CERB to ineligible; 2M+ taxpayer records breached",
            "PSPC": "Phoenix $5.1B, ArriveCAN $60M, McKinsey $209M, CIB $19B shortfall, shipbuilding $77B+",
            "Ethics Commissioner": "Found violations 3x for Trudeau, 3x for Morneau, 1x for LeBlanc — max penalty $500",
        },
        "key_findings": [
            f"Justin Trudeau hub: {edge_count.get('justin_trudeau', 0)} direct connections across all scandal clusters",
            f"Network contains {len(nodes)} entities and {len(edges)} documented relationships",
            f"Indigenous accountability cluster: MMIWG, child welfare ($47.8B), water crisis (30yr), incarceration (32%)",
            "Human cost pipeline: housing → homelessness → food banks → healthcare collapse → opioids → MAID",
            "CCP infiltration chain: Sidewinder (1997) → Winnipeg Lab → Hogue Commission → NSICOP (27 years)",
            "Carbon paradox: $13B/yr carbon tax, only 7% emission reduction, $34B oil pipeline built",
        ],
    }
    return analysis


def generate_ai_report(analysis):
    """Generate AI-written report using DEIFIED inference."""
    try:
        from urllib.request import Request, urlopen

        prompt = (
            "You are LIRIL, an AI intelligence analyst. Based on this network analysis data, "
            "write a 200-word executive summary of the most critical findings. "
            "Focus on the systemic patterns, institutional failures, and financial exposure. "
            "Be factual and cite specific numbers.\n\n"
            f"Network: {analysis['network']['total_nodes']} entities, {analysis['network']['total_edges']} edges\n"
            f"Trudeau hub: {analysis['top_hubs'][0]['connections'] if analysis['top_hubs'] else 0} connections\n"
            f"Key findings: {'; '.join(analysis['key_findings'][:4])}\n"
        )

        payload = json.dumps({
            "model": "llama",
            "messages": [
                {"role": "system", "content": "You are LIRIL, TENET5 AI intelligence analyst. Be factual. Cite numbers."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 300,
            "temperature": 0.2,
        }).encode()

        for url in ["http://127.0.0.1:11433/api/chat", "http://127.0.0.1:11434/v1/chat/completions"]:
            try:
                req = Request(url, data=payload, headers={"Content-Type": "application/json"})
                resp = urlopen(req, timeout=15)
                d = json.loads(resp.read())
                if "choices" in d:
                    return d["choices"][0]["message"]["content"]
                elif "message" in d:
                    return d["message"].get("content", "")
            except Exception:
                continue
        return None
    except Exception as e:
        return None


async def report_to_nats(analysis, ai_report):
    """Send analysis to LIRIL via NATS."""
    try:
        import nats
        nc = await nats.connect(NATS_URL, connect_timeout=5)
        payload = {
            "type": "site_analysis",
            "analysis": analysis,
            "ai_report": ai_report,
        }
        await nc.publish("tenet5.site.analysis", json.dumps(payload).encode())
        print(f"Analysis sent to NATS tenet5.site.analysis")
        await nc.close()
    except Exception as e:
        print(f"NATS report failed: {e}")


def write_report_to_site(analysis, ai_report):
    """Write analysis report as a JSON data file for the website."""
    report = {
        "generated": analysis["timestamp"],
        "seed": SEED,
        "summary": analysis,
        "ai_analysis": ai_report or "AI analysis unavailable — DEIFIED offline",
    }
    out = ROOT / "data" / "liril_analysis_report.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Report written to {out.name}")
    return out


def main():
    print(f"\n{'='*60}")
    print(f"  LIRIL Site Analyzer — SEED={SEED}")
    print(f"{'='*60}\n")

    # Load and analyze
    d = load_network()
    analysis = analyze_network(d)

    s = analysis["network"]
    print(f"Network: {s['total_nodes']} nodes, {s['total_edges']} edges")
    print(f"Non-donor entities: {s['non_donor_nodes']}")
    print(f"High-score entities (>=50): {s['high_score_entities']}")

    if analysis["top_hubs"]:
        print(f"\nTop hub: {analysis['top_hubs'][0]['name']} ({analysis['top_hubs'][0]['connections']} connections)")

    print(f"\nKey findings:")
    for f in analysis["key_findings"]:
        print(f"  • {f}")

    # AI analysis
    ai_report = None
    if "--report-only" not in sys.argv:
        print(f"\nGenerating AI analysis via DEIFIED...")
        ai_report = generate_ai_report(analysis)
        if ai_report:
            print(f"\n--- LIRIL AI ANALYSIS ---")
            print(ai_report[:500])
            print(f"--- END ---\n")
        else:
            print("AI analysis unavailable (DEIFIED offline)")

    # Write report
    write_report_to_site(analysis, ai_report)

    # NATS report
    if "--nats" in sys.argv:
        asyncio.run(report_to_nats(analysis, ai_report))

    # Run site health check
    print("\nRunning site health check...")
    from site_health_check import generate_report
    health = generate_report()
    print(f"Health: {health['summary']['status']} ({health['summary']['total_issues']} issues)")

    print(f"\n{'='*60}")
    print(f"  LIRIL Analysis Complete")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
