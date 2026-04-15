#!/usr/bin/env python3
"""
network_topology_analyzer.py — TENET5 ABCXYZ Network Topology Analyzer

Cross-references the Treason Roster Matrix, Investigation Board graph,
OSINT vault intelligence, and existing MP profiles to generate a unified
entity influence scoring system.

Outputs:
  - Influence-scored entity graph (JSON) for frontend rendering
  - Cross-reference anomaly report (Markdown dossier)
  - Entity overlap matrix showing individuals appearing in multiple
    investigation vectors simultaneously

Integrated with N vs NP Millennial Falcon tracking.
Secured via Empirical Magic Handoff Memory System.

Usage:
    python network_topology_analyzer.py --analyze
    python network_topology_analyzer.py --entity "Anthony Housefather"
    python network_topology_analyzer.py --export-graph
"""

import argparse
import json
import logging
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
import asyncio

# LIRIL Task 1: Telemetry Anomaly Detector (Adaptive ML)
class TelemetryAnomalyDetector:
    def __init__(self, base_threshold: float = 3.0) -> None:
        self.base_threshold = base_threshold
        # Maintain a lightweight running variation (EMA approximation)
        self.ema_variance = None

    def adapt_threshold(self, telemetry_data: list[float]) -> float:
        """Dynamically adjust threshold based on array density."""
        if not telemetry_data: return self.base_threshold
        mean = sum(telemetry_data) / len(telemetry_data)
        variance = sum((x - mean) ** 2 for x in telemetry_data) / len(telemetry_data)
        
        if self.ema_variance is None:
            self.ema_variance = variance
        else:
            # Shift variance buffer smoothly
            self.ema_variance = 0.8 * self.ema_variance + 0.2 * variance
            
        # If variance is extremely tight, loosen the threshold (avoid false positives)
        # If variance is wildly erratic, tighten the threshold naturally
        adaptive_factor = 1.0 if self.ema_variance == 0 else (variance / self.ema_variance)
        return max(1.5, min(5.0, self.base_threshold * adaptive_factor))

    def detect(self, telemetry_data: list[float]) -> bool:
        if not telemetry_data: return False
        mean = sum(telemetry_data) / len(telemetry_data)
        std_dev = (sum((x - mean) ** 2 for x in telemetry_data) / len(telemetry_data)) ** 0.5
        if std_dev == 0: return False
        adapted_threshold = self.adapt_threshold(telemetry_data)
        return any(abs(x - mean) > adapted_threshold * std_dev for x in telemetry_data)
        
    def is_anomalous(self, score: float, telemetry_data: list[float]) -> bool:
        if not telemetry_data: return False
        mean = sum(telemetry_data) / len(telemetry_data)
        std_dev = (sum((x - mean) ** 2 for x in telemetry_data) / len(telemetry_data)) ** 0.5
        if std_dev == 0: return False
        adapted_threshold = self.adapt_threshold(telemetry_data)
        return (score - mean) > adapted_threshold * std_dev

# LIRIL Task 3: Real-Time Persistent Knowledge Graph
class KnowledgeGraph:
    def __init__(self, storage_path: str = None) -> None:
        self.entities: dict[str, dict[str, str]] = {}
        self.storage_path = storage_path
        self._load()

    def _load(self):
        if self.storage_path and os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    self.entities = json.load(f)
            except Exception as e:
                 # Local logging failure handled silently during daemon init
                 pass

    def _save(self):
        if self.storage_path:
            os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
            try:
                with open(self.storage_path, 'w', encoding='utf-8') as f:
                    json.dump(self.entities, f, indent=2, sort_keys=True)
            except:
                pass

    def add_entity(self, name: str, attributes: dict[str, str]) -> None:
        # Merge if exists
        if name in self.entities:
            self.entities[name].update(attributes)
        else:
            self.entities[name] = attributes
        self._save()

    def query(self, name: str) -> dict[str, str]:
        return self.entities.get(name, {})



try:
    sys.path.append(r'E:\S.L.A.T.E\tenet5\src')
    from tenet.aurora.kyre_knowledge import KyreEngine
    HAS_KYRE = True
except ImportError:
    HAS_KYRE = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "..")
EVIDENCE_DIR = os.path.join(SCRIPT_DIR, "..", "..", "evidence", "profiles")

# Data sources
TREASON_ROSTER_PATH = os.path.join(DATA_DIR, "treason_roster_matrix.json")
INVESTIGATION_BOARD_PATH = os.path.join(DATA_DIR, "investigation_board.json")
OSINT_VAULT_DIR = os.path.join(DATA_DIR, "osint_vault")
MP_PROFILES_DIR = os.path.join(DATA_DIR, "profiles")
LOBBYING_ANALYSIS_PATH = os.path.join(DATA_DIR, "lobbying_analysis.json")
CONTRIBUTIONS_PATH = os.path.join(DATA_DIR, "contributions_analysis.json")
ALL_MPS_PATH = os.path.join(DATA_DIR, "all_mps.json")
FINANCIAL_ANALYSIS_PATH = os.path.join(DATA_DIR, "financial_transaction_analysis.json")
SOCIAL_MEDIA_ANALYSIS_PATH = os.path.join(DATA_DIR, "social_media_analysis.json")

# Output
OUTPUT_DIR = os.path.join(DATA_DIR, "network_analysis")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("network_topology_analyzer")


# ---------------------------------------------------------------------------
# Data Loading
# ---------------------------------------------------------------------------

def load_json_safe(path):
    """Load JSON file, return None on failure."""
    if not os.path.isfile(path):
        log.warning("File not found: %s", path)
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        log.error("Failed to load %s: %s", path, e)
        return None


def load_all_sources():
    """Load all investigative data sources."""
    sources = {}

    # Treason Roster Matrix
    sources["treason_roster"] = load_json_safe(TREASON_ROSTER_PATH) or {}
    log.info("Treason roster: %d events loaded", len(sources["treason_roster"]))

    # Investigation Board
    board = load_json_safe(INVESTIGATION_BOARD_PATH) or {}
    sources["board_nodes"] = board.get("nodes", [])
    sources["board_edges"] = board.get("edges", [])
    log.info("Investigation board: %d nodes, %d edges",
             len(sources["board_nodes"]), len(sources["board_edges"]))

    # OSINT vault
    sources["osint_vault"] = {}
    if os.path.isdir(OSINT_VAULT_DIR):
        for fname in os.listdir(OSINT_VAULT_DIR):
            if fname.endswith(".json"):
                data = load_json_safe(os.path.join(OSINT_VAULT_DIR, fname))
                if data:
                    sources["osint_vault"][fname] = data
    log.info("OSINT vault: %d files loaded", len(sources["osint_vault"]))

    # Extra pipelines
    sources["lobbying"] = load_json_safe(LOBBYING_ANALYSIS_PATH) or {}
    sources["contributions"] = load_json_safe(CONTRIBUTIONS_PATH) or {}
    sources["financial_analysis"] = load_json_safe(FINANCIAL_ANALYSIS_PATH) or {}
    sources["social_media"] = load_json_safe(SOCIAL_MEDIA_ANALYSIS_PATH) or {}

    # All MPs
    mps_data = load_json_safe(ALL_MPS_PATH) or {}
    sources["mps"] = mps_data.get("mps", [])
    log.info("MPs data: %d records", len(sources["mps"]))

    return sources


# ---------------------------------------------------------------------------
# Entity Extraction & Normalization
# ---------------------------------------------------------------------------

def normalize_name(name):
    """Normalize name for cross-referencing."""
    return re.sub(r"\s+", " ", name.strip().lower())


def extract_all_entities(sources):
    """Extract unique entities from all data sources with source tracking."""
    entities = defaultdict(lambda: {
        "name": "",
        "appearances": [],
        "categories": set(),
        "sources": set(),
        "details": [],
        "influence_score": 0,
    })

    # 1. From Treason Roster Matrix
    for event_name, names in sources["treason_roster"].items():
        for name in names:
            key = normalize_name(name)
            entities[key]["name"] = name
            entities[key]["appearances"].append({
                "source": "treason_roster",
                "event": event_name,
            })
            entities[key]["categories"].add("treason_roster")
            entities[key]["sources"].add(f"treason_roster:{event_name}")

    # 2. From Investigation Board nodes
    for node in sources["board_nodes"]:
        label = node.get("label", "")
        if not label:
            continue
        key = normalize_name(label)
        entities[key]["name"] = label
        entities[key]["appearances"].append({
            "source": "investigation_board",
            "type": node.get("type", ""),
            "detail": node.get("detail", ""),
            "subtitle": node.get("subtitle", ""),
        })
        entities[key]["categories"].update(node.get("categories", []))
        entities[key]["sources"].add("investigation_board")
        entities[key]["details"].append(node.get("detail", ""))

    # 3. From OSINT vault
    for filename, data in sources["osint_vault"].items():
        if isinstance(data, dict):
            for entity_name, searches in data.items():
                key = normalize_name(entity_name)
                entities[key]["name"] = entity_name
                entities[key]["appearances"].append({
                    "source": "osint_vault",
                    "file": filename,
                })
                entities[key]["categories"].add("osint_target")
                entities[key]["sources"].add(f"osint_vault:{filename}")

                # Extract intelligence from search results
                if isinstance(searches, dict):
                    for query, results in searches.items():
                        if isinstance(results, list):
                            for result in results:
                                if isinstance(result, dict):
                                    entities[key]["details"].append(
                                        result.get("body", "")[:200]
                                    )

    # 4. From lobbying analysis
    for official in sources["lobbying"].get("top_lobbied_officials", []):
        name = official.get("name", "")
        if not name:
            continue
        key = normalize_name(name)
        entities[key]["name"] = name
        entities[key]["appearances"].append({
            "source": "lobbying_analysis",
            "meetings": official.get("meetings", 0),
            "institution": official.get("institution", ""),
        })
        entities[key]["categories"].add("lobbied_official")
        entities[key]["sources"].add("lobbying_analysis")

    # 5. From contributions analysis
    for donor in sources["contributions"].get("top_donors", []):
        name = donor.get("name", "")
        if not name:
            continue
        key = normalize_name(name)
        entities[key]["name"] = name
        entities[key]["appearances"].append({
            "source": "contributions_analysis",
            "total_amount": donor.get("total_amount", 0),
        })
        entities[key]["categories"].add("political_donor")
        entities[key]["sources"].add("contributions_analysis")

    # 6. From Financial Transactions (Phase 23: includes anomaly z-scores)
    financial_data = sources.get("financial_analysis", {}).get("transactions", {})
    for tid, t in financial_data.items():
        name = t.get("entity", "")
        if name:
            key = normalize_name(name)
            entities[key]["name"] = name
            entities[key]["appearances"].append({
                "source": "financial_analysis",
                "risk_factor": t.get("risk_factor", 0),
                "flow": t.get("flow", ""),
                "anomaly_z_score": t.get("anomaly_z_score", 0),
                "anomaly_flag": t.get("anomaly_flag", False),
            })
            entities[key]["categories"].add("financial_vector")
            entities[key]["sources"].add("financial_analysis")

    # 7. From Social Media (Phase 23: includes temporal decay scores)
    social_data = sources.get("social_media", {}).get("targets", {})
    for target, s in social_data.items():
        if target:
            key = normalize_name(target)
            entities[key]["name"] = target
            entities[key]["appearances"].append({
                "source": "social_media_analysis",
                "primary_vector": s.get("primary_vector", ""),
                "temporal_decay_score": s.get("temporal_decay_score", 0),
            })
            entities[key]["categories"].add("social_media")
            entities[key]["sources"].add("social_media_analysis")

    log.info("Extracted %d unique entities", len(entities))
    return entities


# ---------------------------------------------------------------------------
# Influence Scoring Algorithm
# ---------------------------------------------------------------------------

def compute_influence_scores(entities):
    """Compute N vs NP Millennial Falcon topological influence score.

    Scoring weights:
      - Treason roster appearance: +10 per event
      - Investigation board presence: +15
      - OSINT vault targeting: +12
      - Lobbied official: +8 per 100 meetings
      - Political donor: +5 per $10K donated
      - Cross-source overlap (appears in 3+ sources): +20 multiplier
      - Category diversity (appears across israel/ccp/cfnis/etc): +10 per category
    """
    for key, entity in entities.items():
        score = 0

        # Source-based scoring
        for appearance in entity["appearances"]:
            src = appearance.get("source", "")
            if src == "treason_roster":
                score += 10
            elif src == "investigation_board":
                score += 15
            elif src == "osint_vault":
                score += 12
            elif src == "lobbying_analysis":
                meetings = appearance.get("meetings", 0)
                score += 8 + (meetings / 100) * 5
            elif src == "contributions_analysis":
                amount = appearance.get("total_amount", 0)
                score += 5 + (amount / 10000) * 3
            elif src == "financial_analysis":
                risk = appearance.get("risk_factor", 0)
                score += 10 + (risk * 2)
                # Phase 24: Anomaly-flagged entities get a significant boost
                if appearance.get("anomaly_flag", False):
                    z = abs(appearance.get("anomaly_z_score", 0))
                    score += 15 + (z * 5)  # Higher z-score = more anomalous = higher priority
            elif src == "social_media_analysis":
                # Phase 24: Weight by temporal decay — fresh intel scores higher
                decay = appearance.get("temporal_decay_score", 0)
                score += 7 + (decay * 2)

        # Cross-source overlap bonus
        unique_sources = len(entity["sources"])
        if unique_sources >= 3:
            score *= 1.5
        if unique_sources >= 4:
            score *= 1.3

        # Category diversity bonus
        category_count = len(entity["categories"] - {"treason_roster", "person", "org", "event"})
        score += category_count * 10

        entity["influence_score"] = round(score, 2)

    return entities


# ---------------------------------------------------------------------------
# Cross-Reference Overlap Matrix
# ---------------------------------------------------------------------------

def find_overlap_entities(entities, min_sources=2):
    """Find entities appearing in multiple investigation vectors."""
    overlaps = []
    for key, entity in entities.items():
        unique_source_types = set()
        for src in entity["sources"]:
            source_type = src.split(":")[0]
            unique_source_types.add(source_type)

        if len(unique_source_types) >= min_sources:
            overlaps.append({
                "name": entity["name"],
                "influence_score": entity["influence_score"],
                "source_count": len(unique_source_types),
                "sources": list(entity["sources"]),
                "categories": list(entity["categories"]),
                "appearance_count": len(entity["appearances"]),
            })

    overlaps.sort(key=lambda x: x["influence_score"], reverse=True)
    log.info("Found %d entities in %d+ sources", len(overlaps), min_sources)
    return overlaps


# ---------------------------------------------------------------------------
# Output Generation
# ---------------------------------------------------------------------------

def generate_graph_json(entities, overlaps):
    """Generate frontend-ready JSON graph for network visualization."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Select top entities for the graph (score > 10)
    top_entities = [
        (k, v) for k, v in entities.items()
        if v["influence_score"] >= 10
    ]
    top_entities.sort(key=lambda x: x[1]["influence_score"], reverse=True)
    top_entities = top_entities[:200]  # Cap at 200 nodes

    nodes = []
    for key, entity in top_entities:
        nodes.append({
            "id": key.replace(" ", "_"),
            "label": entity["name"],
            "influence_score": entity["influence_score"],
            "categories": list(entity["categories"]),
            "source_count": len(entity["sources"]),
            "type": _classify_entity_type(entity),
        })

    # Generate edges from shared categories/events
    edges = []
    entity_keys = {k for k, _ in top_entities}
    for key1, e1 in top_entities:
        for key2, e2 in top_entities:
            if key1 >= key2:
                continue
            shared = e1["categories"] & e2["categories"]
            shared -= {"treason_roster", "person", "org", "event"}
            if shared:
                edges.append({
                    "source": key1.replace(" ", "_"),
                    "target": key2.replace(" ", "_"),
                    "shared_categories": list(shared),
                    "weight": len(shared),
                })

    # LIRIL Phase 18: NetworkX Greedy Modularity Institutional Detection
    import networkx as nx
    from networkx.algorithms import community

    G = nx.Graph()
    for node in nodes:
        G.add_node(node["id"])
    for edge in edges:
        G.add_edge(edge["source"], edge["target"], weight=edge.get("weight", 1))

    cluster_map = {}
    try:
        communities = community.greedy_modularity_communities(G)
        for idx, comm in enumerate(communities, 1):
            for node_id in comm:
                cluster_map[node_id] = idx
    except Exception as e:
        log.error(f"NetworkX Community Detection Failed: {e}")
        for node in nodes:
            cluster_map[node["id"]] = 0

    degrees = {node["id"]: 0.0 for node in nodes}
    for edge in edges:
        degrees[edge["source"]] += edge["weight"]
        degrees[edge["target"]] += edge["weight"]
    
    max_d = max(degrees.values()) if degrees else 1.0
    if max_d == 0: max_d = 1.0

    # Global fallback for LIRIL knowledge retention
    liril_kg = KnowledgeGraph(storage_path=os.path.join(OSINT_VAULT_DIR, "local_knowledge_graph.json"))

    for node in nodes:
        node["centrality"] = round(degrees[node["id"]] / max_d, 4)
        node["influence_score"] = round(node["influence_score"] * (1.0 + node["centrality"]), 2)
        node["cluster_id"] = cluster_map.get(node["id"], 0)
        
        # Hydrate the Local Knowledge Graph simultaneously
        liril_kg.add_entity(node["label"], {
            "influence_score": str(node["influence_score"]),
            "cluster_id": str(node["cluster_id"]),
            "source_count": str(node["source_count"]),
            "categories": ", ".join(node["categories"])
        })

    # LIRIL Network Anomaly Integration (Adaptive ML)
    scores = [n["influence_score"] for n in nodes]
    anomaly_detector = TelemetryAnomalyDetector(base_threshold=2.5)
    for node in nodes:
        node["anomaly_detected"] = anomaly_detector.is_anomalous(node["influence_score"], scores)

    graph = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "system": "TENET5 ABCXYZ N vs NP Millennial Falcon",
        "handoff": "Empirical Magic Handoff — SECURED",
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "nodes": nodes,
        "edges": edges,
        "entity_overlaps": overlaps[:50],
    }

    path = os.path.join(OUTPUT_DIR, "influence_network.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2, ensure_ascii=False, default=str)
    log.info("Graph saved: %s (%d nodes, %d edges)", path, len(nodes), len(edges))
    return graph


def _classify_entity_type(entity):
    """Classify entity as person/org/event based on categories."""
    cats = entity["categories"]
    if "person" in cats or "osint_target" in cats:
        return "person"
    if "org" in cats:
        return "org"
    if "event" in cats:
        return "event"
    if "political_donor" in cats:
        return "donor"
    if "lobbied_official" in cats:
        return "official"
    return "unknown"


def trigger_liril_modernization():
    pass

def generate_dossier(entities, overlaps):
    """Generate a human-readable analysis dossier."""
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    ts_file = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    path = os.path.join(EVIDENCE_DIR, f"network_analysis_{ts_file}.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# TENET5 Network Topology Analysis — {timestamp} UTC\n\n")
        f.write("**System:** ABCXYZ N vs NP Millennial Falcon Topological Analyzer\n")
        f.write("**Memory:** Empirical Magic Handoff — SECURED\n\n")
        f.write(f"**Total Unique Entities:** {len(entities):,}\n")
        f.write(f"**Multi-Source Entities:** {len(overlaps):,}\n\n")

        # Top influence scores
        f.write("## Top 30 Influence Scores\n\n")
        f.write("| Rank | Entity | Score | Sources | Categories |\n")
        f.write("|------|--------|-------|---------|------------|\n")
        top30 = sorted(entities.values(), key=lambda x: x["influence_score"], reverse=True)[:30]
        for i, entity in enumerate(top30, 1):
            cats = ", ".join(sorted(entity["categories"] - {"treason_roster", "person", "org"}))
            f.write(f"| {i} | **{entity['name']}** | {entity['influence_score']:.1f} | "
                    f"{len(entity['sources'])} | {cats} |\n")

        # Cross-source overlap entities
        f.write("\n## Multi-Vector Entities (3+ sources)\n\n")
        multi = [o for o in overlaps if o["source_count"] >= 3]
        if multi:
            for o in multi[:20]:
                f.write(f"### {o['name']} (Score: {o['influence_score']:.1f})\n")
                f.write(f"- **Sources ({o['source_count']}):** {', '.join(o['sources'])}\n")
                f.write(f"- **Categories:** {', '.join(o['categories'])}\n")
                f.write(f"- **Total appearances:** {o['appearance_count']}\n\n")
        else:
            f.write("No entities found in 3+ sources.\n\n")

        # Treason roster overlap with investigation board
        f.write("## Treason Roster ↔ Investigation Board Overlap\n\n")
        roster_names = set()
        for event, names in (load_json_safe(TREASON_ROSTER_PATH) or {}).items():
            for n in names:
                roster_names.add(normalize_name(n))

        board_names = set()
        board_data = load_json_safe(INVESTIGATION_BOARD_PATH) or {}
        for node in board_data.get("nodes", []):
            label = node.get("label", "")
            if label:
                board_names.add(normalize_name(label))

        overlap_names = roster_names & board_names
        if overlap_names:
            f.write(f"**{len(overlap_names)} entities appear in both the Treason Roster "
                    f"and the Investigation Board:**\n\n")
            for name in sorted(overlap_names):
                entity = entities.get(name, {})
                score = entity.get("influence_score", 0) if entity else 0
                f.write(f"- **{name.title()}** — Influence Score: {score:.1f}\n")
        else:
            f.write("No direct name overlaps detected.\n")

        f.write("\n---\n*Analysis secured via TENET5 Empirical Magic Handoff Memory System*\n")

    log.info("Dossier saved: %s", path)
    return path


def lookup_entity(entities, query):
    """Detailed lookup for a specific entity."""
    query_norm = normalize_name(query)
    matches = []
    for key, entity in entities.items():
        if query_norm in key or query_norm in normalize_name(entity["name"]):
            matches.append(entity)

    if not matches:
        log.warning("No entity found matching '%s'", query)
        return None

    for m in matches:
        print(f"\n=== {m['name']} ===")
        print(f"  Influence Score: {m['influence_score']:.1f}")
        print(f"  Categories: {', '.join(m['categories'])}")
        print(f"  Sources ({len(m['sources'])}): {', '.join(m['sources'])}")
        print(f"  Appearances: {len(m['appearances'])}")
        for app in m["appearances"]:
            print(f"    - {app}")
        if m["details"]:
            print(f"  Intelligence snippets:")
            for d in m["details"][:5]:
                if d:
                    print(f"    → {d[:150]}")
    return matches


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="TENET5 Network Topology Analyzer — Cross-reference investigative data sources",
    )
    parser.add_argument("--analyze", action="store_true",
                        help="Run full cross-reference analysis")
    parser.add_argument("--entity", type=str,
                        help="Lookup specific entity")
    parser.add_argument("--export-graph", action="store_true",
                        help="Export influence graph for frontend")
    parser.add_argument("--integrate-kyre", action="store_true",
                        help="Feed topology securely into S.L.A.T.E Kyre knowledge graph")
    parser.add_argument("--verbose", action="store_true",
                        help="Debug logging")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not any([args.analyze, args.entity, args.export_graph]):
        parser.print_help()
        sys.exit(1)

    # Load all investigative data
    sources = load_all_sources()
    entities = extract_all_entities(sources)
    entities = compute_influence_scores(entities)
    overlaps = find_overlap_entities(entities, min_sources=2)

    if args.entity:
        lookup_entity(entities, args.entity)

    if args.analyze or args.export_graph:
        graph = generate_graph_json(entities, overlaps)
        dossier_path = generate_dossier(entities, overlaps)
        log.info("=== ANALYSIS COMPLETE ===")
        log.info("Total entities: %d", len(entities))
        log.info("Multi-source entities: %d", len(overlaps))
        log.info("Graph nodes: %d, edges: %d",
                 graph["total_nodes"], graph["total_edges"])
        log.info("Dossier: %s", dossier_path)
        
        if args.integrate_kyre:
            if HAS_KYRE:
                log.info("[LIRIL] Unpacking Topology into S.L.A.T.E Kyre Matrix...")
                try:
                    engine = KyreEngine()
                    async def pipe_intelligence():
                        for key, entity in entities.items():
                            if entity["influence_score"] >= 10:
                                score = entity["influence_score"]
                                payload = {
                                    "source": "network_topology_analyzer",
                                    "name": entity["name"],
                                    "influence_score": score
                                }
                                await engine.ingest_osint_event(
                                    source="TENET5 Topology Matrix",
                                    text=f"Entity '{entity['name']}' has topological overlap yielding an Empirical Matrix score of {score}. Active in {len(entity['sources'])} vectors.",
                                    entities=[entity["name"]],
                                    domain="TECHNOLOGY",
                                    metadata=payload
                                )
                    asyncio.run(pipe_intelligence())
                    log.info("[SUCCESS] Topology embedded successfully inside KyreEngine OSINT Euclidean causal graph.")
                except Exception as e:
                    log.error(f"[ERROR] KyreEngine Link failed: {e}")
            else:
                log.warning("S.L.A.T.E Kyre Engine blocked natively.")


if __name__ == "__main__":
    main()
