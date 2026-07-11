#!/usr/bin/env python3
"""
Build a newsroom-safe network board from TENET5 OSINT artifacts.

Reads (when present):
  - data/investigation_board.json          foreign-influence board
  - data/entities.json + data/edges.json   sourced appointment graph
  - data/analysis/defence_cluster_network.json
  - data/osint_entity_registry.json
  - data/osint_vault/cbc_public_osint_last.json
  - data/osint_vault/*_osint*.json         light entity harvest
  - data/osint_scrapes/**/*.json           scrape entity tags (public)

Writes:
  - data/network_osint_board.json          page format (nodes + threads)
  - data/analysis/network_osint_build_last.json  proof artifact

Filters: drops punctuation-only labels, EC aggregate donor buckets,
orphan edges, and uncapped mega-graphs. Prefer sourced edges.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT_BOARD = DATA / "network_osint_board.json"
OUT_PROOF = DATA / "analysis" / "network_osint_build_last.json"

# Labels that are registry noise, not people/orgs for the public board
_JUNK_LABEL = re.compile(
    r"^[\s\.,;:\-_/\\|]+$|"
    r"contributions?\s+of\s+\$|"
    r"contributions?\s+de\s+|"
    r"^estate\s+of\s+",
    re.I,
)
_SLUG = re.compile(r"[^a-z0-9]+")


def _load(path: Path) -> Any | None:
    if not path.is_file():
        return None
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        print(f"[warn] skip {path}: {e}", file=sys.stderr)
        return None


def _slug(s: str) -> str:
    s = _SLUG.sub("_", (s or "").lower()).strip("_")
    return s[:64] or "node"


def _soft(s: str, n: int = 280) -> str:
    s = re.sub(r"\s+", " ", (s or "").strip())
    return s if len(s) <= n else s[: n - 1] + "…"


def _ok_label(label: str) -> bool:
    if not label or len(label) < 2:
        return False
    if _JUNK_LABEL.search(label):
        return False
    if len(label) > 80:
        return False
    # reject pure punctuation / single-char noise from broken graphs
    if not re.search(r"[A-Za-zÀ-ÿ0-9]", label):
        return False
    return True


class BoardBuilder:
    def __init__(self) -> None:
        self.nodes: dict[str, dict[str, Any]] = {}
        self.edges: list[dict[str, Any]] = []
        self.edge_keys: set[tuple[str, str, str]] = set()
        self.sources_used: list[str] = []
        self.stats: Counter[str] = Counter()

    def add_node(
        self,
        nid: str,
        *,
        label: str,
        ntype: str = "org",
        subtitle: str = "",
        detail: str = "",
        link: str = "",
        categories: list[str] | None = None,
        claim_level: str = "OSINT_INDEX",
        origin: str = "",
    ) -> str | None:
        if not _ok_label(label):
            self.stats["nodes_rejected"] += 1
            return None
        nid = nid or _slug(label)
        if nid in self.nodes:
            # merge categories / keep better detail
            existing = self.nodes[nid]
            cats = set(existing.get("categories") or [])
            for c in categories or []:
                if c:
                    cats.add(c)
            existing["categories"] = sorted(cats)
            if detail and len(detail) > len(existing.get("detail") or ""):
                existing["detail"] = _soft(detail)
            if subtitle and not existing.get("subtitle"):
                existing["subtitle"] = subtitle
            if link and not existing.get("link"):
                existing["link"] = link
            return nid
        self.nodes[nid] = {
            "id": nid,
            "type": ntype,
            "label": label.strip(),
            "subtitle": subtitle,
            "detail": _soft(detail),
            "link": link,
            "categories": list(categories or []),
            "claim_level": claim_level,
            "origin": origin,
        }
        self.stats["nodes_added"] += 1
        return nid

    def add_edge(
        self,
        frm: str,
        to: str,
        *,
        label: str = "documented link",
        strength: int = 1,
        claim_level: str = "OSINT_INDEX",
        source_url: str = "",
    ) -> None:
        if not frm or not to or frm == to:
            return
        if frm not in self.nodes or to not in self.nodes:
            self.stats["edges_orphan"] += 1
            return
        key = (frm, to, label[:48])
        if key in self.edge_keys:
            return
        self.edge_keys.add(key)
        edge: dict[str, Any] = {
            "from": frm,
            "to": to,
            "label": _soft(label, 80),
            "strength": max(1, min(3, int(strength))),
            "claim_level": claim_level,
        }
        if source_url:
            edge["source"] = source_url
        self.edges.append(edge)
        self.stats["edges_added"] += 1

    def ingest_investigation_board(self) -> None:
        path = DATA / "investigation_board.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        for n in raw.get("nodes") or []:
            cats = [c for c in (n.get("categories") or []) if c not in ("person", "org")]
            if not cats:
                cats = ["evidence"]
            self.add_node(
                n.get("id") or _slug(n.get("label", "")),
                label=n.get("label") or "",
                ntype=n.get("type") or "person",
                subtitle=n.get("subtitle") or "",
                detail=n.get("detail") or "",
                link=n.get("link") or "",
                categories=cats,
                claim_level="BOARD_INDEX",
                origin="investigation_board",
            )
        for t in raw.get("threads") or []:
            self.add_edge(
                t.get("from", ""),
                t.get("to", ""),
                label=t.get("label") or "link",
                strength=t.get("strength") or 1,
                claim_level="BOARD_INDEX",
            )

    def ingest_entities_edges(self) -> None:
        ent_path = DATA / "entities.json"
        edge_path = DATA / "edges.json"
        ents = _load(ent_path)
        edgs = _load(edge_path)
        if not ents or not edgs:
            return
        self.sources_used.append("data/entities.json")
        self.sources_used.append("data/edges.json")
        for e in ents.get("entities") or []:
            tags = e.get("tags") or []
            cats = ["authority"]
            if "law_enforcement" in tags:
                cats = ["cfnis"]
            elif "crown" in tags:
                cats = ["authority"]
            src = ""
            if e.get("sources"):
                src = (e["sources"][0] or {}).get("url") or ""
            self.add_node(
                e.get("id") or _slug(e.get("name", "")),
                label=e.get("name") or "",
                ntype="person" if "executive" in tags or "law_enforcement" in tags else "org",
                subtitle=e.get("role") or e.get("office") or "",
                detail=_soft(
                    f"{e.get('role') or ''}. Term {e.get('term_start') or '?'}–{e.get('term_end') or 'present'}."
                ),
                link=src or "appointments-registry.html",
                categories=cats,
                claim_level="FACT",
                origin="entities_edges",
            )
        for ed in edgs.get("edges") or []:
            url = ""
            if ed.get("sources"):
                url = (ed["sources"][0] or {}).get("url") or ""
            self.add_edge(
                ed.get("from", ""),
                ed.get("to", ""),
                label=(ed.get("type") or "link").replace("_", " "),
                strength=2,
                claim_level="FACT",
                source_url=url,
            )

    def ingest_defence(self) -> None:
        path = DATA / "analysis" / "defence_cluster_network.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        layer_cat = {
            "authority": "authority",
            "air": "air",
            "sea": "sea",
            "north": "north",
            "air_isr": "air_isr",
        }
        for n in raw.get("nodes") or []:
            cat = layer_cat.get(n.get("layer") or "", "defence")
            link = "dnd-procurement.html"
            if n.get("id") in ("glle", "w8475", "bell", "ntacs"):
                link = "griffon-glle-procurement.html"
            elif n.get("id") in ("cpsp", "tkms", "hanwha"):
                link = "submarine-timeline.html"
            elif n.get("id") in ("aothr", "australia", "bae_au"):
                link = "arctic-sovereignty.html"
            self.add_node(
                n.get("id") or _slug(n.get("label", "")),
                label=n.get("label") or "",
                ntype=n.get("type") or "program",
                subtitle=f"{n.get('type') or 'entity'} · {n.get('layer') or 'defence'}",
                detail="Defence procurement velocity freeze — public instruments only.",
                link=link,
                categories=[cat, "defence"],
                claim_level="FACT",
                origin="defence_cluster",
            )
        for e in raw.get("edges") or []:
            self.add_edge(
                e.get("from", ""),
                e.get("to", ""),
                label=e.get("rel") or e.get("label") or "link",
                strength=2 if e.get("claim_level") == "FACT" else 1,
                claim_level=e.get("claim_level") or "FACT",
                source_url=e.get("source") or "",
            )

    def ingest_entity_registry(self) -> None:
        path = DATA / "osint_entity_registry.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        for e in raw.get("entities") or []:
            name = e.get("canonical_name") or ""
            cats = ["osint"]
            srcs = e.get("sources") or []
            if "csis" in srcs or "hansard" in srcs:
                cats.append("ccp" if "dong" in name.lower() or "woo" in name.lower() else "evidence")
            self.add_node(
                e.get("cid") or _slug(name),
                label=name,
                ntype=e.get("category") or "person",
                subtitle="OSINT entity registry · " + ", ".join(srcs[:4]),
                detail=_soft(
                    "Aliases: " + ", ".join((e.get("aliases") or [])[:6])
                ),
                link="foreign-interference.html",
                categories=cats,
                claim_level="OSINT_REGISTRY",
                origin="osint_entity_registry",
            )

    def ingest_cbc_public_osint(self) -> None:
        path = DATA / "osint_vault" / "cbc_public_osint_last.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "cbc_radio_canada",
            label="CBC/Radio-Canada",
            ntype="org",
            subtitle="Public broadcaster · OSINT vault",
            detail="Entities harvested from public HTTP OSINT (no ATIP).",
            link="cbc-accountability.html",
            categories=["media", "osint"],
            claim_level="OSINT_PUBLIC",
            origin="cbc_public_osint",
        )
        fetches = (raw.get("fetches") or {}) if isinstance(raw, dict) else {}
        for key, block in fetches.items():
            if not isinstance(block, dict):
                continue
            url = block.get("url") or ""
            for ent in block.get("entities") or []:
                if not isinstance(ent, str) or not _ok_label(ent):
                    continue
                # skip pure dollar amounts
                if re.match(r"^\$[\d,]+", ent):
                    continue
                nid = self.add_node(
                    "osint_" + _slug(ent),
                    label=ent,
                    ntype="org" if ent.isupper() or "INC" in ent or "LTD" in ent else "person",
                    subtitle=f"CBC public OSINT · {key}",
                    detail=_soft(block.get("excerpt_fact") or f"Named in public fetch: {url}"),
                    link="cbc-social-amplification.html",
                    categories=["media", "osint"],
                    claim_level="OSINT_PUBLIC",
                    origin="cbc_public_osint",
                )
                if nid and hub:
                    self.add_edge(
                        hub,
                        nid,
                        label="public OSINT co-mention",
                        strength=1,
                        claim_level="OSINT_PUBLIC",
                        source_url=url,
                    )

    def ingest_vault_osint_light(self) -> None:
        vault = DATA / "osint_vault"
        if not vault.is_dir():
            return
        patterns = ("*osint*.json", "*_results.json", "mp_osint*.json")
        seen_files: set[Path] = set()
        for pat in patterns:
            for path in vault.glob(pat):
                if path in seen_files or path.name == "cbc_public_osint_last.json":
                    continue
                seen_files.add(path)
                raw = _load(path)
                if not raw:
                    continue
                self.sources_used.append(str(path.relative_to(ROOT)))
                # common shapes: {target, findings}, {results:[]}, list, { "MP Name": { topic: [hits] } }
                labels: list[tuple[str, str, str]] = []  # label, detail, href
                if isinstance(raw, dict):
                    for k in ("target", "name", "entity", "subject"):
                        if isinstance(raw.get(k), str):
                            labels.append((raw[k], "", ""))
                    for list_key in ("results", "entities", "profiles", "mps", "findings"):
                        arr = raw.get(list_key)
                        if not isinstance(arr, list):
                            continue
                        for item in arr[:40]:
                            if isinstance(item, str):
                                labels.append((item, "", ""))
                            elif isinstance(item, dict):
                                lab = ""
                                for kk in ("name", "label", "entity", "mp", "target"):
                                    if isinstance(item.get(kk), str):
                                        lab = item[kk]
                                        break
                                href = item.get("href") or item.get("url") or ""
                                body = item.get("body") or item.get("title") or ""
                                if lab:
                                    labels.append((lab, str(body), str(href)))
                    # mp_osint_batch shape: { "Anthony Housefather": { "topic": [ {title,href,body} ] } }
                    sample_keys = list(raw.keys())[:30]
                    if sample_keys and all(isinstance(raw[k], dict) for k in sample_keys):
                        for mp_name in sample_keys:
                            if mp_name in (
                                "id", "meta", "metadata", "generated_at", "status", "method", "engine"
                            ):
                                continue
                            if not _ok_label(mp_name):
                                continue
                            topics = raw[mp_name]
                            if not isinstance(topics, dict):
                                continue
                            first_hit = ""
                            first_href = ""
                            topic_names = []
                            for tname, hits in list(topics.items())[:6]:
                                topic_names.append(str(tname))
                                if isinstance(hits, list) and hits:
                                    h0 = hits[0]
                                    if isinstance(h0, dict):
                                        first_hit = first_hit or str(h0.get("title") or h0.get("body") or "")
                                        first_href = first_href or str(h0.get("href") or "")
                            labels.append(
                                (
                                    mp_name,
                                    _soft(
                                        f"OSINT topics: {', '.join(topic_names[:4])}. {first_hit}"
                                    ),
                                    first_href,
                                )
                            )
                for lab, detail, href in labels[:60]:
                    self.add_node(
                        "vault_" + _slug(lab),
                        label=lab,
                        ntype="person",
                        subtitle=f"OSINT vault · {path.stem}",
                        detail=detail
                        or "Harvested from local OSINT vault artifact (verify before legal use).",
                        link=href if href.startswith("http") else "osint-dashboard.html",
                        categories=["osint"],
                        claim_level="OSINT_VAULT",
                        origin=path.name,
                    )

    def ingest_scrape_tags(self) -> None:
        scrapes = DATA / "osint_scrapes"
        if not scrapes.is_dir():
            return
        for path in scrapes.rglob("*.json"):
            raw = _load(path)
            if not isinstance(raw, dict):
                continue
            self.sources_used.append(str(path.relative_to(ROOT)))
            platform = path.parent.name
            hub = self.add_node(
                f"scrape_{platform}",
                label=f"{platform.upper()} public scrape",
                ntype="event",
                subtitle="osint_scrapes",
                detail=f"Public scrape artifact {path.name}",
                link="cbc-social-amplification.html",
                categories=["media", "osint"],
                claim_level="OSINT_SCRAPE",
                origin="osint_scrapes",
            )
            list_keys = (
                "handles",
                "accounts",
                "entities",
                "amplifiers",
                "top",
                "institutional_handles_resolved",
                "case_nodes_resolved",
                "amplifier_rank_public",
                "primary_victim_posts",
            )
            for key in list_keys:
                arr = raw.get(key)
                if not isinstance(arr, list):
                    continue
                for item in arr[:40]:
                    if isinstance(item, str):
                        lab, role, detail = item, "", "Named in public social OSINT scrape."
                    elif isinstance(item, dict):
                        lab = (
                            item.get("name")
                            or item.get("handle")
                            or item.get("label")
                            or item.get("account")
                        )
                        role = str(item.get("role") or "")
                        detail = _soft(
                            item.get("summary")
                            or item.get("bio_signal")
                            or role
                            or "Named in public social OSINT scrape."
                        )
                    else:
                        continue
                    if not lab or not _ok_label(str(lab)):
                        continue
                    display = str(lab).lstrip("@")
                    nid = self.add_node(
                        "scrape_" + _slug(display),
                        label=display,
                        ntype="person",
                        subtitle=f"{platform} public" + (f" · {role}" if role else ""),
                        detail=detail,
                        link="cbc-social-amplification.html",
                        categories=["media", "osint"],
                        claim_level="OSINT_SCRAPE",
                        origin=path.name,
                    )
                    if nid and hub:
                        self.add_edge(
                            hub,
                            nid,
                            label=f"{platform} scrape",
                            strength=2 if "PRIMARY" in role or "CASE_TARGET" in role else 1,
                            claim_level="OSINT_SCRAPE",
                        )

    def build(self) -> dict[str, Any]:
        self.ingest_investigation_board()
        self.ingest_entities_edges()
        self.ingest_defence()
        self.ingest_entity_registry()
        self.ingest_cbc_public_osint()
        self.ingest_vault_osint_light()
        self.ingest_scrape_tags()

        # drop orphan edges again after all merges
        ids = set(self.nodes)
        self.edges = [e for e in self.edges if e["from"] in ids and e["to"] in ids]

        # cap board size for public UI — highest degree first
        deg: Counter[str] = Counter()
        for e in self.edges:
            deg[e["from"]] += 1
            deg[e["to"]] += 1
        if len(self.nodes) > 160:
            keep = {nid for nid, _ in deg.most_common(140)}
            # always keep FACT-origin nodes
            for nid, n in self.nodes.items():
                if n.get("claim_level") == "FACT" or n.get("origin") in (
                    "defence_cluster",
                    "entities_edges",
                ):
                    keep.add(nid)
            self.nodes = {k: v for k, v in self.nodes.items() if k in keep}
            ids = set(self.nodes)
            self.edges = [e for e in self.edges if e["from"] in ids and e["to"] in ids]
            self.stats["capped"] = 1

        # strip internal origin field for public board (optional keep for proof)
        public_nodes = []
        for n in self.nodes.values():
            public_nodes.append(
                {
                    "id": n["id"],
                    "type": n["type"],
                    "label": n["label"],
                    "subtitle": n.get("subtitle") or "",
                    "detail": n.get("detail") or "",
                    "link": n.get("link") or "",
                    "categories": n.get("categories") or [],
                    "claim_level": n.get("claim_level") or "OSINT_INDEX",
                }
            )

        board = {
            "meta": {
                "title": "TENET5 OSINT composite network",
                "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M"),
                "sources": ", ".join(self.sources_used[:24]),
                "builder": "tools/build_network_osint_board.py",
                "note": "Composite of investigation board + appointment edges + defence freezes + OSINT vault/scrapes. Centrality is not guilt. Prefer case files.",
            },
            "nodes": sorted(public_nodes, key=lambda x: x["label"].lower()),
            "threads": self.edges,
        }
        return board

    def proof(self, board: dict[str, Any]) -> dict[str, Any]:
        return {
            "ts": datetime.now(timezone.utc).isoformat(),
            "verdict": "NETWORK_OSINT_BOARD_BUILT",
            "nodes": len(board.get("nodes") or []),
            "edges": len(board.get("threads") or []),
            "sources": self.sources_used,
            "stats": dict(self.stats),
            "out": str(OUT_BOARD.relative_to(ROOT)),
        }


def main() -> int:
    b = BoardBuilder()
    board = b.build()
    OUT_BOARD.parent.mkdir(parents=True, exist_ok=True)
    OUT_PROOF.parent.mkdir(parents=True, exist_ok=True)
    with OUT_BOARD.open("w", encoding="utf-8") as f:
        json.dump(board, f, ensure_ascii=False, indent=2)
        f.write("\n")
    proof = b.proof(board)
    with OUT_PROOF.open("w", encoding="utf-8") as f:
        json.dump(proof, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(
        f"[network_osint] nodes={proof['nodes']} edges={proof['edges']} "
        f"sources={len(proof['sources'])} -> {OUT_BOARD}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
