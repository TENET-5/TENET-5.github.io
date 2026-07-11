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
  - data/maid_lobbying_crossref.json       MAID × lobbying registry
  - data/connections.json                  MP–bill sponsorship (MAID-biased)
  - data/cpc_top_donors_2023_2025.json     EC open data donors
  - data/corruption_map_top80.json         degree sample
  - data/pmo_lobbying_analysis.json        PMO registry volume
  - data/blackrock_brookfield_connection.json  public filings / WEF
  - data/defense_nexus.json / carney_brookfield_dossier.json
  - data/cbc_social_graph_last.json            CBC production/social seed
  - data/business_holdings_dossier.json        OECC/SEDI holdings
  - data/politician_kinship_dossier.json       public-record kinship

Writes:
  - data/network_osint_board.json          page format (nodes + threads)
  - data/analysis/network_osint_build_last.json  proof artifact

Filters: drops punctuation-only labels, EC aggregate donor buckets,
orphan edges, and uncapped mega-graphs. Prefer sourced edges.
Public meta strips host paths; claim_counts + capped/raw for UI.
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
    s = _clean_text(s or "")
    s = re.sub(r"\s+", " ", s.strip())
    return s if len(s) <= n else s[: n - 1] + "…"


def _clean_text(s: str) -> str:
    """Scrub common mojibake / control noise from registry dumps."""
    if not s:
        return ""
    # latin-1 misread as cp1252 class replacements
    s = (
        s.replace("\ufffd", "")
        .replace("Fran�ois", "François")
        .replace("D�put�", "Député")
        .replace("Senateur", "Senator")
        .replace("\x00", "")
    )
    # drop leftover replacement-char sequences
    s = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", s)
    return s


def _ok_label(label: str) -> bool:
    label = _clean_text(label or "")
    if not label or len(label) < 2:
        return False
    if _JUNK_LABEL.search(label):
        return False
    if len(label) > 80:
        return False
    # reject pure punctuation / single-char noise from broken graphs
    if not re.search(r"[A-Za-zÀ-ÿ0-9]", label):
        return False
    # reject labels still carrying replacement garbage mid-word
    if "\ufffd" in label or "�" in label:
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
        label = _clean_text(label)
        subtitle = _clean_text(subtitle)
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

    def ingest_maid_lobbying(self) -> None:
        path = DATA / "maid_lobbying_crossref.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "maid_lobbying_hub",
            label="MAID lobbying cross-ref",
            ntype="event",
            subtitle="Registry contacts near MAID policy",
            detail=f"total_lobbying_contacts={raw.get('total_lobbying_contacts')} · mps={raw.get('total_maid_in_registry')}",
            link="lobbying-deepdive.html",
            categories=["osint", "evidence"],
            claim_level="OSINT_REGISTRY",
            origin="maid_lobbying_crossref",
        )
        for mp in (raw.get("mps") or [])[:35]:
            name = mp.get("name") or ""
            contacts = int(mp.get("lobbying_contacts") or 0)
            nid = self.add_node(
                "lobby_mp_" + _slug(name),
                label=name,
                ntype="person",
                subtitle=f"{contacts} lobbying contacts",
                detail=_soft(
                    "Institutions: " + ", ".join((mp.get("institutions") or [])[:5])
                ),
                link="lobbying-tracker.html",
                categories=["osint"],
                claim_level="OSINT_REGISTRY",
                origin="maid_lobbying_crossref",
            )
            if nid and hub:
                strength = 3 if contacts >= 1000 else (2 if contacts >= 500 else 1)
                self.add_edge(
                    hub,
                    nid,
                    label=f"{contacts} contacts",
                    strength=strength,
                    claim_level="OSINT_REGISTRY",
                )
            for inst in (mp.get("institutions") or [])[:4]:
                iid = self.add_node(
                    "inst_" + _slug(inst),
                    label=inst.split("(")[0].strip()[:60],
                    ntype="org",
                    subtitle="Federal institution",
                    detail="Named as lobbying target institution in MAID cross-ref.",
                    link="lobbying-deepdive.html",
                    categories=["authority", "osint"],
                    claim_level="OSINT_REGISTRY",
                    origin="maid_lobbying_crossref",
                )
                if nid and iid:
                    self.add_edge(
                        nid,
                        iid,
                        label="lobbied",
                        strength=1,
                        claim_level="OSINT_REGISTRY",
                    )

    def ingest_mp_bill_connections(self) -> None:
        path = DATA / "connections.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        # Prefer MAID/health-related bills + high-degree MPs
        nodes_by_id = {n["id"]: n for n in (raw.get("nodes") or []) if n.get("id")}
        edges = raw.get("edges") or []
        maid_bills = {
            n["id"]
            for n in nodes_by_id.values()
            if n.get("type") == "bill"
            and re.search(
                r"medical assistance|maid|organ donor|mental|health|dying",
                n.get("label") or "",
                re.I,
            )
        }
        # count mp degrees on maid bills only, else all
        mp_deg: Counter[str] = Counter()
        selected_edges = []
        for e in edges:
            frm, to = e.get("from") or e.get("source"), e.get("to") or e.get("target")
            if not frm or not to:
                continue
            if maid_bills and not (frm in maid_bills or to in maid_bills):
                continue
            selected_edges.append((frm, to, e.get("type") or "sponsored"))
            if str(frm).startswith("mp:"):
                mp_deg[frm] += 1
            if str(to).startswith("mp:"):
                mp_deg[to] += 1
        if not selected_edges:
            selected_edges = [
                (e.get("from"), e.get("to"), e.get("type") or "sponsored")
                for e in edges[:80]
                if e.get("from") and e.get("to")
            ]
        keep_mps = {m for m, _ in mp_deg.most_common(40)}
        for nid, n in nodes_by_id.items():
            if n.get("type") == "mp" and nid in keep_mps:
                self.add_node(
                    nid,
                    label=n.get("label") or nid,
                    ntype="person",
                    subtitle="MP · bill sponsorship graph",
                    detail="From data/connections.json MP–bill sponsorship edges.",
                    link="mp-voting-records.html",
                    categories=["osint"],
                    claim_level="OSINT_INDEX",
                    origin="connections",
                )
            elif n.get("type") == "bill" and (
                nid in maid_bills or any(nid in (a, b) for a, b, _ in selected_edges[:60])
            ):
                lab = n.get("label") or nid
                short = lab.split(":")[0] if lab.startswith("C-") or lab.startswith("bill:") else lab[:48]
                if lab.startswith("C-") or "C-" in lab[:8]:
                    short = lab.split(":")[0] if ":" in lab else lab[:20]
                else:
                    short = (lab[:50] + "…") if len(lab) > 50 else lab
                self.add_node(
                    nid,
                    label=short,
                    ntype="event",
                    subtitle="Bill",
                    detail=_soft(lab),
                    link="legislative-timeline.html",
                    categories=["evidence", "osint"],
                    claim_level="OSINT_INDEX",
                    origin="connections",
                )
        for frm, to, typ in selected_edges:
            if frm in self.nodes and to in self.nodes:
                self.add_edge(
                    frm,
                    to,
                    label=str(typ),
                    strength=1,
                    claim_level="OSINT_INDEX",
                )

    def ingest_cpc_donors_top(self) -> None:
        path = DATA / "cpc_top_donors_2023_2025.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "cpc_donor_hub",
            label="CPC top donors 2023–25",
            ntype="org",
            subtitle="Elections Canada open data (ranked)",
            detail=_soft(raw.get("corpus_note") or "Named monetary contributors to CPC."),
            link="elections-finance.html",
            categories=["osint", "evidence"],
            claim_level="PUBLIC_EC_OPEN_DATA",
            origin="cpc_top_donors",
        )
        for row in (raw.get("top_contributors") or [])[:20]:
            name = row.get("name") or ""
            if not _ok_label(name):
                continue
            total = row.get("total_cad")
            nid = self.add_node(
                "donor_" + _slug(name),
                label=name,
                ntype="person",
                subtitle=f"CPC donor · ${total:,.0f}" if isinstance(total, (int, float)) else "CPC donor",
                detail=_soft(
                    f"Monetary total CAD {total} · count={row.get('count')} · years={row.get('years_seen')}"
                ),
                link="elections-finance.html",
                categories=["osint"],
                claim_level="PUBLIC_EC_OPEN_DATA",
                origin="cpc_top_donors",
            )
            if nid and hub:
                self.add_edge(
                    nid,
                    hub,
                    label="monetary contribution",
                    strength=2 if isinstance(total, (int, float)) and total >= 5000 else 1,
                    claim_level="PUBLIC_EC_OPEN_DATA",
                )

    def ingest_corruption_map_top(self) -> None:
        path = DATA / "corruption_map_top80.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        seen_lab: set[str] = set()
        for n in (raw.get("nodes") or [])[:80]:
            lab = n.get("label") or n.get("id") or ""
            if not _ok_label(lab):
                continue
            key = lab.lower()
            if key in seen_lab:
                continue
            seen_lab.add(key)
            deg = n.get("degree") or 0
            self.add_node(
                n.get("id") or _slug(lab),
                label=lab if lab[0].isupper() or " " in lab else lab.replace("_", " ").title(),
                ntype=n.get("type") or "org",
                subtitle=f"centrality degree {deg}",
                detail="From corruption_map_top80 (degree-centrality sample). Index only.",
                link="corruption-map.html",
                categories=["osint"],
                claim_level="OSINT_INDEX",
                origin="corruption_map_top80",
            )
            if len(seen_lab) >= 45:
                break

    def ingest_pmo_lobbying(self) -> None:
        path = DATA / "pmo_lobbying_analysis.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "pmo_lobby_hub",
            label="PMO lobbying (registry)",
            ntype="org",
            subtitle=f"{raw.get('total_pmo_contacts', '')} contacts · open registry",
            detail=_soft(
                raw.get("title")
                or "Top staff and organizations from federal lobbying registry PMO contacts."
            ),
            link="lobbying-deepdive.html",
            categories=["authority", "osint"],
            claim_level="OSINT_REGISTRY",
            origin="pmo_lobbying_analysis",
        )
        for row in (raw.get("top_pmo_staff") or [])[:12]:
            name = row.get("name") or ""
            if not _ok_label(name):
                continue
            contacts = int(row.get("contacts") or 0)
            nid = self.add_node(
                "pmo_staff_" + _slug(name),
                label=name,
                ntype="person",
                subtitle=str(row.get("title") or "PMO") + f" · {contacts} contacts",
                detail="Named as lobbied PMO contact in registry analysis (count is volume, not finding).",
                link="lobbying-tracker.html",
                categories=["authority", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="pmo_lobbying_analysis",
            )
            if nid and hub:
                self.add_edge(
                    hub,
                    nid,
                    label=f"{contacts} contacts",
                    strength=3 if contacts >= 500 else (2 if contacts >= 300 else 1),
                    claim_level="OSINT_REGISTRY",
                )
        for row in (raw.get("who_lobbies_pmo_most") or [])[:15]:
            org = row.get("org") or ""
            if not _ok_label(org):
                continue
            contacts = int(row.get("contacts") or 0)
            oid = self.add_node(
                "pmo_org_" + _slug(org),
                label=org,
                ntype="org",
                subtitle=f"{contacts} PMO contacts",
                detail="Organization volume toward PMO in lobbying registry analysis.",
                link="lobbying-deepdive.html",
                categories=["osint"],
                claim_level="OSINT_REGISTRY",
                origin="pmo_lobbying_analysis",
            )
            if oid and hub:
                self.add_edge(
                    oid,
                    hub,
                    label="lobbied PMO",
                    strength=2 if contacts >= 100 else 1,
                    claim_level="OSINT_REGISTRY",
                )

    def ingest_blackrock_brookfield(self) -> None:
        path = DATA / "blackrock_brookfield_connection.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        br = self.add_node(
            "org_blackrock",
            label="BlackRock",
            ntype="org",
            subtitle=str((raw.get("blackrock") or {}).get("aum_display") or "asset manager"),
            detail=_soft(
                "Public filings and lobby registry: asset manager with Brookfield stake and Canadian healthcare practice."
            ),
            link="carney-brookfield.html",
            categories=["osint", "evidence"],
            claim_level="REPORTING",
            origin="blackrock_brookfield",
        )
        bf = self.add_node(
            "org_brookfield",
            label="Brookfield",
            ntype="org",
            subtitle="asset manager",
            detail=_soft((raw.get("combined") or {}).get("relationship") or ""),
            link="carney-brookfield.html",
            categories=["osint", "evidence"],
            claim_level="REPORTING",
            origin="blackrock_brookfield",
        )
        br_shares = (raw.get("blackrock") or {}).get("brookfield_shares") or {}
        if br and bf:
            self.add_edge(
                br,
                bf,
                label=str(br_shares.get("filing") or "13F stake"),
                strength=2,
                claim_level="REPORTING",
                source_url=str(br_shares.get("source") or ""),
            )
        fink = self.add_node(
            "person_larry_fink",
            label="Larry Fink",
            ntype="person",
            subtitle="BlackRock · WEF board concurrent",
            detail=_soft((raw.get("fink_carney_wef") or {}).get("wef_board") or ""),
            link="carney-brookfield.html",
            categories=["osint"],
            claim_level="REPORTING",
            origin="blackrock_brookfield",
        )
        carney = self.add_node(
            "person_mark_carney",
            label="Mark Carney",
            ntype="person",
            subtitle="WEF board concurrent · Brookfield history",
            detail=_soft((raw.get("fink_carney_wef") or {}).get("davos_2026") or ""),
            link="carney-brookfield.html",
            categories=["osint", "authority"],
            claim_level="REPORTING",
            origin="blackrock_brookfield",
        )
        wef_src = str((raw.get("fink_carney_wef") or {}).get("source_wef") or "")
        if fink and br:
            self.add_edge(fink, br, label="CEO/chair class", strength=2, claim_level="REPORTING")
        if fink and carney:
            self.add_edge(
                fink,
                carney,
                label="WEF board concurrent",
                strength=2,
                claim_level="REPORTING",
                source_url=wef_src,
            )
        if carney and bf:
            self.add_edge(
                carney,
                bf,
                label="prior leadership (public record)",
                strength=2,
                claim_level="REPORTING",
            )
        lobby = (raw.get("blackrock") or {}).get("lobbying_canada") or {}
        if lobby.get("entity") and br:
            ent = self.add_node(
                "org_" + _slug(str(lobby.get("entity"))),
                label=str(lobby.get("entity"))[:60],
                ntype="org",
                subtitle="Canadian lobby registrant",
                detail=_soft(str(lobby.get("targets") or "")),
                link="lobbying-tracker.html",
                categories=["osint"],
                claim_level="OSINT_REGISTRY",
                origin="blackrock_brookfield",
            )
            if ent:
                self.add_edge(
                    br,
                    ent,
                    label="Canadian entity",
                    strength=1,
                    claim_level="OSINT_REGISTRY",
                    source_url=str(lobby.get("source") or ""),
                )

    def ingest_most_lobbied_officials(self) -> None:
        path = DATA / "most_lobbied_officials.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "most_lobbied_hub",
            label="Most-lobbied officials",
            ntype="event",
            subtitle="Commissioner of Lobbying export (top 50)",
            detail="Meeting volume from Communication_DpohExport aggregate. Volume is not a finding of wrongdoing.",
            link="lobbying-deepdive.html",
            categories=["osint", "authority"],
            claim_level="OSINT_REGISTRY",
            origin="most_lobbied_officials",
        )
        for row in (raw.get("top_50") or [])[:30]:
            name = row.get("name") or ""
            if not _ok_label(name):
                continue
            meetings = int(row.get("total_meetings") or 0)
            inst = str(row.get("institution") or "")
            nid = self.add_node(
                "lobby_dpoh_" + _slug(name),
                label=name,
                ntype="person",
                subtitle=f"{meetings} meetings" + (f" · {inst.split('(')[0].strip()}" if inst else ""),
                detail=_soft(f"Institution: {inst}" if inst else "Named in most-lobbied officials export."),
                link="lobbying-tracker.html",
                categories=["authority", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="most_lobbied_officials",
            )
            if nid and hub:
                strength = 3 if meetings >= 1500 else (2 if meetings >= 800 else 1)
                self.add_edge(
                    hub,
                    nid,
                    label=f"{meetings} meetings",
                    strength=strength,
                    claim_level="OSINT_REGISTRY",
                )
            if inst and nid:
                iid = self.add_node(
                    "inst_" + _slug(inst.split("(")[0].strip()),
                    label=inst.split("(")[0].strip()[:60],
                    ntype="org",
                    subtitle="Federal institution",
                    detail="Institution of record for lobbied official.",
                    link="lobbying-deepdive.html",
                    categories=["authority", "osint"],
                    claim_level="OSINT_REGISTRY",
                    origin="most_lobbied_officials",
                )
                if iid:
                    self.add_edge(
                        nid,
                        iid,
                        label="posted at",
                        strength=1,
                        claim_level="OSINT_REGISTRY",
                    )

    def ingest_cija_lobbying(self) -> None:
        path = DATA / "cija_lobbying_detail.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "org_cija",
            label="CIJA",
            ntype="org",
            subtitle=f"{raw.get('total_cija_communications', '')} registry communications",
            detail=_soft(
                f"Lobbying registry: {raw.get('unique_contacts')} unique contacts. "
                "Meeting counts are volume, not findings."
            ),
            link="lobbying-deepdive.html",
            categories=["israel", "osint"],
            claim_level="OSINT_REGISTRY",
            origin="cija_lobbying_detail",
        )
        for row in (raw.get("top_contacts") or [])[:35]:
            name = row.get("name") or ""
            if not _ok_label(name):
                continue
            meetings = int(row.get("meetings") or 0)
            title = str(row.get("title") or "")
            inst = str(row.get("institution") or "")
            nid = self.add_node(
                "cija_contact_" + _slug(name),
                label=name,
                ntype="person",
                subtitle=(title[:40] + " · " if title else "") + f"{meetings} meetings",
                detail=_soft(f"{inst}" if inst else "Named CIJA registry contact."),
                link="lobbying-tracker.html",
                categories=["osint", "israel"],
                claim_level="OSINT_REGISTRY",
                origin="cija_lobbying_detail",
            )
            if nid and hub:
                strength = 3 if meetings >= 40 else (2 if meetings >= 20 else 1)
                self.add_edge(
                    hub,
                    nid,
                    label=f"{meetings} OCL communications",
                    strength=strength,
                    claim_level="OSINT_REGISTRY",
                )

    def ingest_cpc_media_graph(self) -> None:
        path = DATA / "cpc_media_political_graph.json"
        raw = _load(path)
        if not raw or not isinstance(raw, dict):
            return
        # never surface framework_tools_discovered (local paths)
        self.sources_used.append(str(path.relative_to(ROOT)))
        type_to_cat = {
            "CPC_LEADER": "osint",
            "CPC_DEPUTY": "osint",
            "CPC_MP": "osint",
            "CPC_MP_FI": "ccp",
            "CPC_MP_CASE": "media",
            "MEDIA_AMP": "media",
            "MEDIA": "media",
            "INSTITUTION": "media",
        }
        for n in (raw.get("nodes") or [])[:40]:
            if not isinstance(n, dict):
                continue
            nid = str(n.get("id") or "")
            handle = str(n.get("handle") or "").lstrip("@")
            lab = handle or nid
            if not _ok_label(lab):
                continue
            ntype_raw = str(n.get("type") or "person")
            cat = type_to_cat.get(ntype_raw, "media")
            role = str(n.get("role") or n.get("outlet") or "")
            self.add_node(
                "media_" + _slug(nid or lab),
                label=lab,
                ntype="person" if "MP" in ntype_raw or "LEADER" in ntype_raw else "org",
                subtitle=_soft(role, 80) or ntype_raw.replace("_", " "),
                detail="Public handle from CPC media/political mesh. Relation labels are index only.",
                link="cbc-social-amplification.html",
                categories=[cat, "media"],
                claim_level="OSINT_INDEX",
                origin="cpc_media_political_graph",
            )
        for e in (raw.get("edges") or [])[:40]:
            if not isinstance(e, dict):
                continue
            frm = "media_" + _slug(str(e.get("from") or ""))
            to = "media_" + _slug(str(e.get("to") or ""))
            rel = str(e.get("relation") or e.get("label") or "linked")
            if frm in self.nodes and to in self.nodes:
                self.add_edge(
                    frm,
                    to,
                    label=rel.replace("_", " ")[:60],
                    strength=1,
                    claim_level="OSINT_INDEX",
                )

    def ingest_osint_network_graph(self) -> None:
        path = DATA / "osint_network_graph.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        cat_map = {
            "foreign_org": "ccp",
            "corporation": "osint",
            "institution": "authority",
            "politician": "osint",
            "party": "osint",
        }
        for n in (raw.get("nodes") or [])[:20]:
            lab = n.get("label") or n.get("id") or ""
            if not _ok_label(str(lab)):
                continue
            # skip guilt framing from risk scores — soft index only
            self.add_node(
                "ong_" + _slug(str(n.get("id") or lab)),
                label=str(lab),
                ntype="person" if n.get("category") == "politician" else "org",
                subtitle="OSINT composite index node",
                detail="From osint_network_graph. Composite scores are not findings of wrongdoing.",
                link="foreign-influence.html",
                categories=[cat_map.get(str(n.get("category") or ""), "osint"), "osint"],
                claim_level="OSINT_INDEX",
                origin="osint_network_graph",
            )
        for e in (raw.get("edges") or [])[:20]:
            frm = "ong_" + _slug(str(e.get("source") or e.get("from") or ""))
            to = "ong_" + _slug(str(e.get("target") or e.get("to") or ""))
            if frm in self.nodes and to in self.nodes:
                self.add_edge(
                    frm,
                    to,
                    label=str(e.get("label") or "linked")[:60],
                    strength=min(3, int(e.get("weight") or 1) if str(e.get("weight") or "").replace(".", "").isdigit() else 1),
                    claim_level="OSINT_INDEX",
                )

    def ingest_defense_nexus(self) -> None:
        path = DATA / "defense_nexus.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "defense_nexus_hub",
            label="Defence contractor lobby nexus",
            ntype="event",
            subtitle=str((raw.get("defense_lobbying_total") or {}).get("combined_total") or "registry volume"),
            detail="Lobbying communications + public contract class from defense_nexus freeze. Volume is not guilt.",
            link="dnd-procurement.html",
            categories=["defence", "osint"],
            claim_level="OSINT_REGISTRY",
            origin="defense_nexus",
        )
        totals = raw.get("defense_lobbying_total") or {}
        for key, row in totals.items():
            if key == "combined_total" or not isinstance(row, dict):
                continue
            lab = key.replace("_", " ").title()
            if key == "general_dynamics":
                lab = "General Dynamics"
            elif key == "l3harris":
                lab = "L3Harris"
            elif key == "lockheed":
                lab = "Lockheed Martin"
            elif key == "northrop":
                lab = "Northrop Grumman"
            elif key == "elbit":
                lab = "Elbit Systems"
            elif key == "mda":
                lab = "MDA"
            elif key == "irving":
                lab = "Irving Shipbuilding"
            elif key == "cae":
                lab = "CAE"
            elif key == "raytheon":
                lab = "Raytheon"
            comms = row.get("comms")
            try:
                c_int = int(comms) if not isinstance(comms, str) else 0
            except (TypeError, ValueError):
                c_int = 0
            nid = self.add_node(
                "defcon_" + _slug(lab),
                label=lab,
                ntype="org",
                subtitle=_soft(str(row.get("contract") or "defence contractor"), 80),
                detail=_soft(
                    f"Registry communications: {comms}. Contract class: {row.get('contract')}"
                ),
                link="dnd-procurement.html",
                categories=["defence", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="defense_nexus",
            )
            if nid and hub:
                self.add_edge(
                    hub,
                    nid,
                    label=f"{comms} lobby comms" if c_int else "contract class",
                    strength=3 if c_int >= 500 else (2 if c_int >= 200 else 1),
                    claim_level="OSINT_REGISTRY",
                )
        dual = raw.get("irving_dual_donations") or {}
        irving_id = "defcon_irving_shipbuilding"
        for name in (dual.get("liberal_recipients") or [])[:6]:
            if not _ok_label(str(name)):
                continue
            pid = self.add_node(
                "donor_recv_" + _slug(str(name)),
                label=str(name),
                ntype="person",
                subtitle="Named EC recipient (Irving dual-party pattern)",
                detail="Named recipient in dual-party donation pattern note. Not a finding of wrongdoing.",
                link="elections-finance.html",
                categories=["osint"],
                claim_level="PUBLIC_EC_OPEN_DATA",
                origin="defense_nexus",
            )
            if pid and irving_id in self.nodes:
                self.add_edge(
                    irving_id,
                    pid,
                    label="family donation (public EC class)",
                    strength=1,
                    claim_level="PUBLIC_EC_OPEN_DATA",
                )
        for name in (dual.get("conservative_recipients") or [])[:4]:
            if not _ok_label(str(name)):
                continue
            pid = self.add_node(
                "donor_recv_" + _slug(str(name)),
                label=str(name),
                ntype="person",
                subtitle="Named EC recipient (Irving dual-party pattern)",
                detail="Named recipient in dual-party donation pattern note.",
                link="elections-finance.html",
                categories=["osint"],
                claim_level="PUBLIC_EC_OPEN_DATA",
                origin="defense_nexus",
            )
            if pid and irving_id in self.nodes:
                self.add_edge(
                    irving_id,
                    pid,
                    label="family donation (public EC class)",
                    strength=1,
                    claim_level="PUBLIC_EC_OPEN_DATA",
                )
        door = raw.get("revolving_door_summary") or {}
        for key, bio in door.items():
            lab = key.replace("_", " ").title()
            nid = self.add_node(
                "lobbyist_" + _slug(lab),
                label=lab,
                ntype="person",
                subtitle="Revolving-door summary (registry class)",
                detail=_soft(str(bio)),
                link="lobbying-deepdive.html",
                categories=["osint", "defence"],
                claim_level="OSINT_REGISTRY",
                origin="defense_nexus",
            )
            if nid and hub:
                self.add_edge(
                    nid,
                    hub,
                    label="lobbyist summary",
                    strength=1,
                    claim_level="OSINT_REGISTRY",
                )
        elbit = raw.get("elbit_hermes_900") or {}
        if elbit:
            eid = self.add_node(
                "defcon_elbit_systems",
                label="Elbit Systems",
                ntype="org",
                subtitle=_soft(str(elbit.get("contract") or "Hermes 900 class"), 80),
                detail=_soft(str(elbit.get("description") or "")),
                link="foreign-influence.html#legal",
                categories=["defence", "israel"],
                claim_level="REPORTING",
                origin="defense_nexus",
            )
            if eid and hub:
                self.add_edge(
                    hub,
                    eid,
                    label="Hermes 900 class",
                    strength=2,
                    claim_level="REPORTING",
                    source_url=str(elbit.get("source") or ""),
                )

    def ingest_carney_dossier(self) -> None:
        path = DATA / "carney_brookfield_dossier.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "org_brookfield",
            label="Brookfield",
            ntype="org",
            subtitle="asset manager hub",
            detail="Public-record tenure graph from Carney–Brookfield dossier (offices, not findings).",
            link="carney-brookfield.html",
            categories=["osint", "evidence"],
            claim_level="REPORTING",
            origin="carney_brookfield_dossier",
        )
        buckets = (
            "central_figure",
            "brookfield_corporate",
            "finance_ministers",
            "bank_of_canada_governors",
            "financial_regulators",
            "ethics_commissioners",
        )
        for bucket in buckets:
            for row in (raw.get(bucket) or [])[:8]:
                if not isinstance(row, dict):
                    continue
                name = row.get("name") or ""
                if not _ok_label(str(name)):
                    continue
                role = str(row.get("role") or bucket.replace("_", " "))
                tenure = str(row.get("tenure") or "")
                is_org = "Brookfield" in str(name) and "Carney" not in str(name)
                nid = self.add_node(
                    ("org_" if is_org else "person_") + _slug(str(name)),
                    label=str(name),
                    ntype="org" if is_org else "person",
                    subtitle=_soft(f"{role}" + (f" · {tenure}" if tenure else ""), 90),
                    detail=_soft(str(row.get("notable") or role), 220),
                    link="carney-brookfield.html",
                    categories=["osint", "authority"] if "minister" in bucket or "governor" in bucket else ["osint"],
                    claim_level="REPORTING",
                    origin="carney_brookfield_dossier",
                )
                if nid and hub and nid != hub:
                    self.add_edge(
                        nid,
                        hub,
                        label=bucket.replace("_", " "),
                        strength=2 if bucket == "central_figure" else 1,
                        claim_level="REPORTING",
                    )

    def ingest_cbc_social_graph(self) -> None:
        path = DATA / "cbc_social_graph_last.json"
        raw = _load(path)
        if not raw or not isinstance(raw, dict):
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        # Soften internal edge verbs for public newsroom board
        edge_soft = {
            "DECEIVES_TARGETS": "named target (on record)",
            "DECEIVES_TARGETS_CLASS": "named target class",
            "DECEPTIVE_OUTREACH": "reported outreach",
            "ALLEGED_MISREP": "alleged misrepresentation",
            "FALSE_FRONT": "shell watch",
            "FUNDS": "funds",
            "FUNDS_PROJECT": "funds project",
            "CO_PRODUCES": "co-produces",
            "AMPLIFIES_CRITIQUE": "amplifies critique",
            "AMPLIFIES": "amplifies",
            "AMPLIFIES_TARGET": "amplifies target",
            "DEMANDS_ACCOUNTABILITY": "demands accountability",
            "DEMANDS_INQUIRY": "demands inquiry",
            "DEMANDS_ANSWER": "demands answer",
            "EXPOSES": "exposes",
            "EXPOSES_SHELL": "exposes shell",
            "CONDEMNS": "condemns",
            "SUPPORTS": "supports",
            "BREAKS_CONFIRMATION": "breaks confirmation",
            "COUNTER_FRAME": "counter frame",
            "TACTICS": "tactics (reporting)",
        }
        type_cat = {
            "INSTITUTION": "media",
            "PRODUCTION": "media",
            "TARGET": "media",
            "TARGET_WAVE2": "media",
            "AMPLIFIER": "media",
            "AMPLIFIER_INSTITUTION": "media",
            "AMPLIFIER_JOURNALIST": "media",
            "AMPLIFIER_OUTLET": "media",
            "AMPLIFIER_INVESTIGATIVE": "media",
            "POLITICAL_AMPLIFIER": "osint",
            "POLITICAL_ACCOUNTABILITY": "authority",
            "COUNTER_FRAME": "disinfo",
            "OPERATIVE": "osint",
            "OPERATIVE_ALIAS": "osint",
            "OPERATIVE_WATCH": "osint",
            "FALSE_FRONT": "osint",
            "SHELL_WATCH": "osint",
            "INSTITUTION_RESPONSE": "authority",
        }

        def map_claim(cl: str) -> str:
            cl = (cl or "").upper()
            if cl.startswith("FACT"):
                return "FACT"
            if cl.startswith("REPORTING"):
                return "REPORTING"
            if cl.startswith("OBSERVED"):
                return "OSINT_PUBLIC"
            return "OSINT_INDEX"

        for n in (raw.get("nodes") or [])[:32]:
            if not isinstance(n, dict):
                continue
            sid = str(n.get("id") or "")
            lab = str(n.get("label") or sid).lstrip("@")
            if not _ok_label(lab):
                continue
            ntype_raw = str(n.get("type") or "person")
            # Soft type labels for public subtitle
            sub = ntype_raw.replace("_", " ").title()
            if "FALSE_FRONT" in ntype_raw or "SHELL" in ntype_raw:
                sub = "Shell watch · reporting"
            elif "OPERATIVE" in ntype_raw:
                sub = "Named in reporting"
            elif "TARGET" in ntype_raw:
                sub = "Named target"
            cl = map_claim(str(n.get("claim_level") or ""))
            if ntype_raw == "INSTITUTION" and not n.get("claim_level"):
                cl = "FACT" if sid in ("heritage", "iso", "cbc_news", "cbc_ent", "aptn") else cl
            self.add_node(
                "csg_" + _slug(sid or lab),
                label=lab,
                ntype="org" if ntype_raw in (
                    "INSTITUTION", "PRODUCTION", "FALSE_FRONT", "SHELL_WATCH",
                    "AMPLIFIER_OUTLET", "AMPLIFIER_INSTITUTION", "INSTITUTION_RESPONSE",
                ) else "person",
                subtitle=sub,
                detail="From CBC social seed graph (public handles and on-record production chain). Index only.",
                link="cbc-social-amplification.html",
                categories=[type_cat.get(ntype_raw, "media"), "media"],
                claim_level=cl,
                origin="cbc_social_graph",
            )
        for e in (raw.get("edges") or [])[:30]:
            if not isinstance(e, dict):
                continue
            frm = "csg_" + _slug(str(e.get("from") or ""))
            to = "csg_" + _slug(str(e.get("to") or ""))
            et = str(e.get("type") or "linked")
            lab = edge_soft.get(et, et.replace("_", " ").lower())
            cl = map_claim(str(e.get("claim_level") or ""))
            src = str(e.get("source") or "")
            # only pass public http sources
            if src and not src.startswith("http"):
                src = ""
            if frm in self.nodes and to in self.nodes:
                w = e.get("weight")
                strength = 1
                if isinstance(w, (int, float)) and w >= 5000:
                    strength = 3
                elif isinstance(w, (int, float)) and w >= 1000:
                    strength = 2
                elif cl == "FACT":
                    strength = 2
                self.add_edge(
                    frm,
                    to,
                    label=lab[:60],
                    strength=strength,
                    claim_level=cl,
                    source_url=src,
                )

    def ingest_business_holdings(self) -> None:
        path = DATA / "business_holdings_dossier.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        added = 0
        for rec in (raw.get("records") or []):
            if added >= 34:
                break
            if not isinstance(rec, dict):
                continue
            holdings = rec.get("holdings") or []
            if not holdings:
                continue
            principal = rec.get("principal") or ""
            if not _ok_label(str(principal)):
                continue
            pid = self.add_node(
                "person_" + _slug(str(principal)),
                label=str(principal),
                ntype="person",
                subtitle="Public holdings record",
                detail="Holdings from public OECC / SEDI / disclosure class sources. Empty holdings elsewhere are not findings.",
                link="carney-brookfield.html" if "Carney" in str(principal) else "evidence-index.html",
                categories=["osint", "evidence"],
                claim_level="FACT",
                origin="business_holdings",
            )
            if not pid:
                continue
            for h in holdings[:4]:
                if not isinstance(h, dict):
                    continue
                ent = h.get("entity") or ""
                if not _ok_label(str(ent)):
                    continue
                # merge known Brookfield/BlackRock ids
                elab = str(ent)
                if "Brookfield" in elab:
                    oid = "org_brookfield"
                elif "BlackRock" in elab:
                    oid = "org_blackrock"
                else:
                    oid = "hold_org_" + _slug(elab)
                sources = h.get("sources") or []
                cl = "FACT" if sources else "REPORTING"
                oid = self.add_node(
                    oid,
                    label=elab[:60],
                    ntype="org",
                    subtitle=_soft(f"{h.get('type') or 'holding'} · {h.get('role') or ''}", 80),
                    detail=_soft(str(h.get("accountability_relevance") or h.get("role") or ""), 200),
                    link="evidence-index.html",
                    categories=["osint", "evidence"],
                    claim_level=cl,
                    origin="business_holdings",
                )
                if oid and pid:
                    self.add_edge(
                        pid,
                        oid,
                        label=_soft(f"{h.get('type') or 'holding'} · {h.get('role') or ''}", 60),
                        strength=2 if cl == "FACT" else 1,
                        claim_level=cl,
                    )
                    added += 1

    def ingest_politician_kinship(self) -> None:
        path = DATA / "politician_kinship_dossier.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        n_edges = 0
        for rec in (raw.get("records") or []):
            if n_edges >= 25:
                break
            if not isinstance(rec, dict):
                continue
            kin = rec.get("kin") or []
            if not kin:
                continue
            principal = rec.get("principal") or ""
            if not _ok_label(str(principal)):
                continue
            # do not surface axes as categories
            pid = self.add_node(
                "person_" + _slug(str(principal)),
                label=str(principal),
                ntype="person",
                subtitle="Public-record kinship principal",
                detail="Kinship edges are public-record family links with cited sources where available.",
                link="evidence-index.html",
                categories=["osint"],
                claim_level="FACT",
                origin="politician_kinship",
            )
            if not pid:
                continue
            for k in kin[:4]:
                if n_edges >= 25:
                    break
                if not isinstance(k, dict):
                    continue
                kname = k.get("name") or ""
                if not _ok_label(str(kname)):
                    continue
                sources = k.get("sources") or []
                cl = "FACT" if sources else "OSINT_INDEX"
                kid = self.add_node(
                    "kin_" + _slug(str(kname)),
                    label=str(kname),
                    ntype="person",
                    subtitle=_soft(
                        f"{k.get('relation') or 'kin'}"
                        + (f" · {k.get('notable_role')}" if k.get("notable_role") else ""),
                        90,
                    ),
                    detail=_soft(str(k.get("notable_role") or "Public-record kinship link."), 180),
                    link="evidence-index.html",
                    categories=["osint"],
                    claim_level=cl,
                    origin="politician_kinship",
                )
                if kid and pid:
                    self.add_edge(
                        pid,
                        kid,
                        label=str(k.get("relation") or "kin")[:40],
                        strength=2 if cl == "FACT" else 1,
                        claim_level=cl,
                    )
                    n_edges += 1

    def ingest_lobbying_analysis(self) -> None:
        path = DATA / "lobbying_analysis.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "ocl_registry_hub",
            label="Federal lobbying registry",
            ntype="event",
            subtitle=f"{raw.get('total_communications', '')} communications class",
            detail="Top-volume officials and organizations from OCL aggregate analysis. Volume is not guilt.",
            link="lobbying-deepdive.html",
            categories=["osint", "authority"],
            claim_level="OSINT_REGISTRY",
            origin="lobbying_analysis",
        )
        for row in (raw.get("top_lobbied_officials") or [])[:25]:
            name = row.get("name") or ""
            if not _ok_label(str(name)):
                continue
            meetings = int(row.get("meetings") or 0)
            title = str(row.get("title") or "")
            inst = str(row.get("institution") or "")
            nid = self.add_node(
                "lobby_dpoh_" + _slug(str(name)),
                label=str(name),
                ntype="person",
                subtitle=_soft(
                    (title[:36] + " · " if title else "")
                    + f"{meetings} meetings"
                    + (f" · {inst.split('(')[0].strip()}" if inst else ""),
                    90,
                ),
                detail=_soft(f"Institution: {inst}" if inst else "Named in lobbying volume aggregate."),
                link="lobbying-tracker.html",
                categories=["authority", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="lobbying_analysis",
            )
            if nid and hub:
                self.add_edge(
                    hub,
                    nid,
                    label=f"{meetings} meetings",
                    strength=3 if meetings >= 900 else (2 if meetings >= 600 else 1),
                    claim_level="OSINT_REGISTRY",
                )
        for row in (raw.get("top_organizations") or [])[:20]:
            org = row.get("name") or row.get("org") or ""
            if not _ok_label(str(org)):
                continue
            comms = int(row.get("communications") or row.get("comms") or 0)
            oid = self.add_node(
                "lobby_org_" + _slug(str(org)),
                label=str(org)[:60],
                ntype="org",
                subtitle=f"{comms} communications" if comms else "lobby registrant",
                detail="Organization volume in federal lobbying aggregate.",
                link="lobbying-deepdive.html",
                categories=["osint"],
                claim_level="OSINT_REGISTRY",
                origin="lobbying_analysis",
            )
            if oid and hub:
                self.add_edge(
                    oid,
                    hub,
                    label="registry communications",
                    strength=2 if comms >= 500 else 1,
                    claim_level="OSINT_REGISTRY",
                )

    def ingest_foreign_lobbying_scan(self) -> None:
        path = DATA / "foreign_lobbying_deep_scan.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "foreign_lobby_scan_hub",
            label="Foreign-linked lobbying scan",
            ntype="event",
            subtitle="Registry volume ratios (index)",
            detail="Aggregate foreign-linked lobbying volumes and revolving-door summaries. Counts are not findings of wrongdoing.",
            link="foreign-influence.html",
            categories=["osint", "israel"],
            claim_level="OSINT_REGISTRY",
            origin="foreign_lobbying_deep_scan",
        )
        fogel = raw.get("fogel_ranking") or {}
        if fogel:
            fid = self.add_node(
                "person_shimon_fogel",
                label="Shimon Fogel",
                ntype="person",
                subtitle=f"CIJA · {fogel.get('communications', '')} registry communications",
                detail=_soft(str(fogel.get("finding") or "Named in lobbying rank summary.")),
                link="lobbying-deepdive.html",
                categories=["israel", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="foreign_lobbying_deep_scan",
            )
            if fid and hub:
                self.add_edge(
                    hub,
                    fid,
                    label=f"rank {fogel.get('rank', '?')}",
                    strength=3,
                    claim_level="OSINT_REGISTRY",
                )
            cija = self.add_node(
                "org_cija",
                label="CIJA",
                ntype="org",
                subtitle="Centre for Israel & Jewish Affairs",
                detail="Linked via Fogel ranking in foreign lobbying scan.",
                link="foreign-influence.html#cija",
                categories=["israel", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="foreign_lobbying_deep_scan",
            )
            if fid and cija:
                self.add_edge(fid, cija, label="CEO class", strength=2, claim_level="OSINT_REGISTRY")
        ratios = raw.get("israel_vs_all") or {}
        for key, lab, cat in (
            ("israel", "Israel-linked lobbying volume", "israel"),
            ("us_defense", "US defence lobbying volume", "defence"),
            ("uae", "UAE-linked lobbying volume", "osint"),
            ("china", "China-linked lobbying volume", "ccp"),
            ("india_actual", "India-linked lobbying volume", "india"),
        ):
            if key not in ratios:
                continue
            vol = ratios.get(key)
            nid = self.add_node(
                "flobby_" + key,
                label=lab,
                ntype="event",
                subtitle=f"{vol} communications class",
                detail=_soft(str(ratios.get("finding") or "Foreign-linked volume class from deep scan.")),
                link="foreign-influence.html",
                categories=[cat, "osint"],
                claim_level="OSINT_REGISTRY",
                origin="foreign_lobbying_deep_scan",
            )
            if nid and hub:
                try:
                    v = int(vol or 0)
                except (TypeError, ValueError):
                    v = 0
                self.add_edge(
                    hub,
                    nid,
                    label=f"{vol} class",
                    strength=3 if v >= 1000 else (2 if v >= 100 else 1),
                    claim_level="OSINT_REGISTRY",
                )
        pratt = raw.get("revolving_door_pratt") or {}
        if pratt.get("name"):
            pid = self.add_node(
                "lobbyist_" + _slug(str(pratt["name"])),
                label=str(pratt["name"]),
                ntype="person",
                subtitle=_soft(str(pratt.get("former_role") or "revolving door"), 80),
                detail=_soft(str(pratt.get("finding") or pratt.get("pattern") or "")),
                link="lobbying-deepdive.html",
                categories=["defence", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="foreign_lobbying_deep_scan",
            )
            for client in (pratt.get("clients") or [])[:4]:
                if not _ok_label(str(client)):
                    continue
                cid = self.add_node(
                    "defcon_" + _slug(str(client).split("(")[0].strip()),
                    label=str(client).split("(")[0].strip()[:50],
                    ntype="org",
                    subtitle="client (registry)",
                    detail="Named client in revolving-door summary.",
                    link="dnd-procurement.html",
                    categories=["defence", "osint"],
                    claim_level="OSINT_REGISTRY",
                    origin="foreign_lobbying_deep_scan",
                )
                if pid and cid:
                    self.add_edge(
                        pid,
                        cid,
                        label="represents",
                        strength=2,
                        claim_level="OSINT_REGISTRY",
                    )
        evershed = raw.get("revolving_door_evershed") or {}
        if evershed.get("clients"):
            eid = self.add_node(
                "lobbyist_robert_evershed",
                label="Robert Evershed",
                ntype="person",
                subtitle=f"{evershed.get('total_communications', '')} communications",
                detail=_soft(str(evershed.get("finding") or evershed.get("pattern") or "")),
                link="lobbying-deepdive.html",
                categories=["defence", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="foreign_lobbying_deep_scan",
            )
            for client in (evershed.get("clients") or [])[:4]:
                if not _ok_label(str(client)):
                    continue
                cid = self.add_node(
                    "defcon_" + _slug(str(client).split()[0] + " " + (str(client).split()[1] if len(str(client).split()) > 1 else "")),
                    label=str(client).split("(")[0].strip()[:50],
                    ntype="org",
                    subtitle="client (registry)",
                    detail="Named client in multi-contractor representation summary.",
                    link="dnd-procurement.html",
                    categories=["defence", "osint"],
                    claim_level="OSINT_REGISTRY",
                    origin="foreign_lobbying_deep_scan",
                )
                if eid and cid:
                    self.add_edge(eid, cid, label="represents", strength=2, claim_level="OSINT_REGISTRY")
        irving = raw.get("irving_shipbuilding") or {}
        if irving:
            iid = self.add_node(
                "defcon_irving_shipbuilding",
                label="Irving Shipbuilding",
                ntype="org",
                subtitle=f"{irving.get('total_communications', '')} lobby communications",
                detail=_soft(str(irving.get("finding") or irving.get("context") or "")),
                link="canadian-surface-combatant.html",
                categories=["defence", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="foreign_lobbying_deep_scan",
            )
            if iid and hub:
                self.add_edge(
                    hub,
                    iid,
                    label="shipbuilding lobby volume",
                    strength=3,
                    claim_level="OSINT_REGISTRY",
                )

    def ingest_atlas_fraser(self) -> None:
        path = DATA / "atlas_fraser_funding_crosswalk_2026-07-10.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        atlas = self.add_node(
            "org_atlas_network",
            label="Atlas Network",
            ntype="org",
            subtitle="US infrastructure layer · grants/academy",
            detail=_soft(
                str((raw.get("pipeline_model") or {}).get("infrastructure_layer") or "Think-tank network infrastructure.")
            ),
            link="fraser-atlas-network.html",
            categories=["osint", "evidence"],
            claim_level="FACT",
            origin="atlas_fraser",
        )
        for n in (raw.get("nodes") or [])[:12]:
            if not isinstance(n, dict):
                continue
            name = n.get("name") or n.get("id") or ""
            if not _ok_label(str(name)):
                continue
            alink = n.get("atlas_link") or {}
            srcs = (alink.get("sources") or []) if isinstance(alink, dict) else []
            src0 = ""
            if srcs and isinstance(srcs[0], str) and srcs[0].startswith("http"):
                src0 = srcs[0]
            nid = self.add_node(
                "thinktank_" + _slug(str(n.get("id") or name)),
                label=str(name)[:60],
                ntype="org",
                subtitle=_soft(
                    (str(n.get("type") or "think tank").replace("_", " "))
                    + (
                        " · Atlas membership"
                        if isinstance(alink, dict) and alink.get("membership")
                        else ""
                    ),
                    80,
                ),
                detail=_soft(
                    str(alink.get("dual_role") if isinstance(alink, dict) else "")
                    or "Canadian downstream node in public funding crosswalk."
                ),
                link="fraser-atlas-network.html",
                categories=["osint", "evidence"],
                claim_level="FACT" if src0 or (isinstance(alink, dict) and alink.get("membership")) else "REPORTING",
                origin="atlas_fraser",
            )
            if nid and atlas:
                self.add_edge(
                    atlas,
                    nid,
                    label="Atlas membership class" if isinstance(alink, dict) and alink.get("membership") else "pipeline",
                    strength=2,
                    claim_level="FACT",
                    source_url=src0,
                )
            funding = (n.get("funding_public") or {}).get("named_us_grants_class") or []
            for g in funding[:3]:
                if not isinstance(g, dict):
                    continue
                funder = g.get("funder") or ""
                if not _ok_label(str(funder)):
                    continue
                fid = self.add_node(
                    "funder_" + _slug(str(funder)),
                    label=str(funder)[:50],
                    ntype="org",
                    subtitle=_soft(str(g.get("amount_class") or "grant class"), 60),
                    detail="Named US grant class from public secondary sources (InfluenceWatch/Candid class).",
                    link="fraser-atlas-network.html",
                    categories=["osint"],
                    claim_level="REPORTING",
                    origin="atlas_fraser",
                )
                if fid and nid:
                    self.add_edge(
                        fid,
                        nid,
                        label="grant class",
                        strength=1,
                        claim_level="REPORTING",
                    )

    def _ingest_role_buckets(
        self,
        *,
        path: Path,
        hub_id: str,
        hub_label: str,
        hub_link: str,
        categories: list[str],
        buckets: list[str],
        origin: str,
        claim_level: str = "REPORTING",
        per_bucket: int = 6,
        skip_buckets: frozenset[str] | None = None,
    ) -> None:
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        skip = skip_buckets or frozenset()
        hub = self.add_node(
            hub_id,
            label=hub_label,
            ntype="event",
            subtitle="Public-office tenure index",
            detail="Named office-holders from public dossiers. Tenure is not a finding of wrongdoing.",
            link=hub_link,
            categories=categories,
            claim_level=claim_level,
            origin=origin,
        )
        for bucket in buckets:
            if bucket in skip:
                continue
            for row in (raw.get(bucket) or [])[:per_bucket]:
                if not isinstance(row, dict):
                    continue
                name = row.get("name") or ""
                if not _ok_label(str(name)):
                    continue
                role = str(row.get("role") or bucket.replace("_", " "))
                tenure = str(row.get("tenure") or "")
                is_org = bool(
                    re.search(
                        r"\b(agency|department|commission|corporation|systems|industries|inc\.?)\b",
                        str(name),
                        re.I,
                    )
                    or row.get("role_category") in ("export_controls_institutions", "major_defence_exporters")
                    or bucket.endswith("_institutions")
                    or bucket.endswith("_exporters")
                )
                nid = self.add_node(
                    ("org_" if is_org else "person_") + _slug(str(name)),
                    label=str(name)[:60],
                    ntype="org" if is_org else "person",
                    subtitle=_soft(f"{role}" + (f" · {tenure}" if tenure else ""), 90),
                    detail=_soft(str(row.get("notable") or role), 200),
                    link=hub_link,
                    categories=categories,
                    claim_level=claim_level,
                    origin=origin,
                )
                if nid and hub:
                    self.add_edge(
                        nid,
                        hub,
                        label=bucket.replace("_", " ")[:40],
                        strength=2 if is_org else 1,
                        claim_level=claim_level,
                    )

    def ingest_foreign_interference_dossier(self) -> None:
        path = DATA / "foreign_interference_dossier.json"
        self._ingest_role_buckets(
            path=path,
            hub_id="fi_dossier_hub",
            hub_label="Foreign interference accountability index",
            hub_link="foreign-influence.html",
            categories=["ccp", "osint"],
            buckets=[
                "public_safety_ministers",
                "csis_directors",
                "pmo_security_advisors",
                "oversight_bodies",
                "parliamentarians_implicated_or_targeted",
            ],
            origin="foreign_interference_dossier",
            claim_level="REPORTING",
            per_bucket=5,
            skip_buckets=frozenset({"foreign_entities_grover_amplified"}),
        )

    def ingest_arms_pipeline_dossier(self) -> None:
        path = DATA / "arms_pipeline_dossier.json"
        self._ingest_role_buckets(
            path=path,
            hub_id="arms_pipeline_hub",
            hub_label="Arms export accountability index",
            hub_link="arms-pipeline.html",
            categories=["israel", "defence", "osint"],
            buckets=[
                "foreign_affairs_ministers",
                "international_trade_ministers",
                "defence_ministers",
                "major_defence_exporters",
                "export_controls_institutions",
            ],
            origin="arms_pipeline_dossier",
            claim_level="REPORTING",
            per_bucket=5,
        )

    def ingest_charity_pipeline(self) -> None:
        path = DATA / "dossier_charity_pipeline.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        hub = self.add_node(
            "charity_pipeline",
            label="$276M Charity Pipeline",
            ntype="evidence",
            subtitle="Canadian charities → Israel 2024 class",
            detail=_soft(str(raw.get("pattern") or "Public charity-flow index. Prefer case files.")),
            link="foreign-influence.html#legal",
            categories=["israel", "evidence"],
            claim_level="BOARD_INDEX",
            origin="dossier_charity_pipeline",
        )
        for key, row in (raw.get("key_charities") or {}).items():
            if not isinstance(row, dict):
                continue
            name = row.get("name") or key
            if not _ok_label(str(name)):
                continue
            src = str(row.get("source") or "")
            if src and not src.startswith("http"):
                src = ""
            status = str(row.get("status") or "")
            cl = "FACT" if "REVOKED" in status.upper() and src else ("FACT" if src else "REPORTING")
            nid = self.add_node(
                "charity_" + _slug(str(name)),
                label=str(name)[:60],
                ntype="org",
                subtitle=_soft(status or "charity class", 70),
                detail=_soft(
                    str(row.get("cra_finding") or row.get("finding") or row.get("significance") or status),
                    200,
                ),
                link="foreign-influence.html#legal",
                categories=["israel", "evidence"],
                claim_level=cl,
                origin="dossier_charity_pipeline",
            )
            if nid and hub:
                self.add_edge(
                    hub,
                    nid,
                    label="charity class",
                    strength=2 if cl == "FACT" else 1,
                    claim_level=cl,
                    source_url=src,
                )
        idf = raw.get("idf_funding") or {}
        for key, row in idf.items():
            if key == "pattern" or not isinstance(row, dict):
                continue
            name = row.get("name") or key
            if not _ok_label(str(name)):
                continue
            url = str(row.get("url") or row.get("source") or "")
            if url and not url.startswith("http"):
                url = ""
            nid = self.add_node(
                "charity_" + _slug(str(name)),
                label=str(name)[:60],
                ntype="org",
                subtitle=_soft(str(row.get("function") or "IDF funding class"), 70),
                detail=_soft(str(row.get("function") or row.get("status") or "")),
                link="foreign-influence.html#legal",
                categories=["israel", "evidence"],
                claim_level="REPORTING",
                origin="dossier_charity_pipeline",
            )
            if nid and hub:
                self.add_edge(
                    hub,
                    nid,
                    label="IDF funding class",
                    strength=1,
                    claim_level="REPORTING",
                    source_url=url,
                )
        neeman = raw.get("neeman_foundation") or {}
        if isinstance(neeman, dict) and neeman.get("name"):
            nid = self.add_node(
                "charity_" + _slug(str(neeman["name"])),
                label=str(neeman["name"])[:60],
                ntype="org",
                subtitle=_soft(str(neeman.get("status") or "charity"), 70),
                detail="Named in charity pipeline dossier (revoke class where stated).",
                link="foreign-influence.html#legal",
                categories=["israel", "evidence"],
                claim_level="FACT" if "REVOKED" in str(neeman.get("status") or "").upper() else "REPORTING",
                origin="dossier_charity_pipeline",
            )
            if nid and hub:
                self.add_edge(hub, nid, label="charity class", strength=2, claim_level="FACT")

    def ingest_northland_production_chain(self) -> None:
        path = DATA / "cbc_northland_tales_production_chain.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        prod = raw.get("production") or {}
        company = prod.get("company") or {}
        cname = str(company.get("legal_name") or "NLT1 PRODUCTIONS INC.")
        srcs = company.get("sources") or []
        src0 = ""
        for s in srcs:
            if isinstance(s, dict) and str(s.get("url") or "").startswith("http"):
                src0 = str(s["url"])
                break
        nlt1 = self.add_node(
            "csg_nlt1",
            label=cname,
            ntype="org",
            subtitle=_soft(
                f"corp {company.get('corporation_number') or ''} · dir {company.get('director') or ''}",
                80,
            ),
            detail=_soft(
                f"Working titles: {', '.join((prod.get('working_titles') or [])[:3])}. "
                f"{prod.get('format') or ''}"
            ),
            link="cbc-social-amplification.html",
            categories=["media", "osint"],
            claim_level="FACT",
            origin="northland_production_chain",
        )
        director = company.get("director")
        if director and _ok_label(str(director)):
            did = self.add_node(
                "person_" + _slug(str(director)),
                label=str(director),
                ntype="person",
                subtitle="NLT1 director (corporate directory)",
                detail="Named director on public company registry / ISO listing class.",
                link="cbc-social-amplification.html",
                categories=["media", "osint"],
                claim_level="FACT",
                origin="northland_production_chain",
            )
            if did and nlt1:
                self.add_edge(
                    did,
                    nlt1,
                    label="director",
                    strength=2,
                    claim_level="FACT",
                    source_url=src0,
                )
        for row in (prod.get("key_creatives_iso") or [])[:8]:
            if not isinstance(row, dict):
                continue
            name = row.get("name") or ""
            if not _ok_label(str(name)):
                continue
            aff = str(row.get("affiliation") or "")
            cid = self.add_node(
                "person_" + _slug(str(name)),
                label=str(name),
                ntype="person",
                subtitle=_soft("ISO creative" + (f" · {aff}" if aff else ""), 80),
                detail="Named on ISO 2024-25 production recipients listing class.",
                link="cbc-social-amplification.html",
                categories=["media", "osint"],
                claim_level="FACT",
                origin="northland_production_chain",
            )
            if cid and nlt1:
                self.add_edge(
                    cid,
                    nlt1,
                    label="creative (ISO)",
                    strength=2,
                    claim_level="FACT",
                    source_url=src0,
                )
        for row in (prod.get("co_producers") or [])[:4]:
            if not isinstance(row, dict):
                continue
            name = row.get("name") or ""
            if not _ok_label(str(name)):
                continue
            cl = "FACT" if "FACT" in str(row.get("claim_level") or "").upper() else "REPORTING"
            oid = self.add_node(
                "org_" + _slug(str(name).split("(")[0].strip()),
                label=str(name).split("(")[0].strip()[:50],
                ntype="org",
                subtitle="co-producer (on-record class)",
                detail=_soft(str(row.get("note") or "Named co-producer in public statements.")),
                link="cbc-accountability.html" if "CBC" in str(name) else "cbc-social-amplification.html",
                categories=["media"],
                claim_level=cl,
                origin="northland_production_chain",
            )
            if oid and nlt1:
                self.add_edge(
                    oid,
                    nlt1,
                    label="co-produces",
                    strength=3 if cl == "FACT" else 1,
                    claim_level=cl,
                )
        funding = prod.get("funding") or {}
        iso_batch = funding.get("iso_story_fund_batch") or {}
        if iso_batch:
            iso = self.add_node(
                "org_indigenous_screen_office",
                label="Indigenous Screen Office",
                ntype="org",
                subtitle=_soft(
                    f"Story Fund batch CAD {iso_batch.get('amount')} · {iso_batch.get('year')}",
                    80,
                ),
                detail=_soft(str(iso_batch.get("note") or "ISO public recipients batch.")),
                link="cbc-social-amplification.html",
                categories=["media", "authority"],
                claim_level="FACT",
                origin="northland_production_chain",
            )
            fund_src = str(iso_batch.get("source") or src0)
            if iso and nlt1:
                self.add_edge(
                    iso,
                    nlt1,
                    label="funds project (batch class)",
                    strength=2,
                    claim_level="FACT",
                    source_url=fund_src if fund_src.startswith("http") else "",
                )
        heritage = funding.get("canadian_heritage") or {}
        if heritage:
            hid = self.add_node(
                "inst_canadian_heritage",
                label="Canadian Heritage",
                ntype="org",
                subtitle=_soft(str(heritage.get("role") or "upstream funder class"), 70),
                detail="Upstream cultural funding class for ISO programs.",
                link="cbc-accountability.html",
                categories=["authority", "media"],
                claim_level="FACT",
                origin="northland_production_chain",
            )
            if hid and self.nodes.get("org_indigenous_screen_office"):
                self.add_edge(
                    hid,
                    "org_indigenous_screen_office",
                    label="upstream funder class",
                    strength=1,
                    claim_level="FACT",
                )
        # Soft targets from wave_1 — REPORTING only, no method detail dump
        wave = (raw.get("waves") or {}).get("wave_1_commentators") or {}
        for tname in (wave.get("targets") or [])[:6]:
            lab = str(tname).split("(")[0].strip()
            if not _ok_label(lab):
                continue
            tid = self.add_node(
                "person_" + _slug(lab),
                label=lab,
                ntype="person",
                subtitle="Named in public production-chain reporting",
                detail="Named in public secondary reporting about production outreach. Index only — not a legal finding.",
                link="cbc-social-amplification.html",
                categories=["media", "osint"],
                claim_level="REPORTING",
                origin="northland_production_chain",
            )
            if tid and nlt1:
                self.add_edge(
                    nlt1,
                    tid,
                    label="named target (reporting)",
                    strength=1,
                    claim_level="REPORTING",
                )

    def ingest_csis_oversight_dossier(self) -> None:
        path = DATA / "csis_oversight_accountability_dossier.json"
        self._ingest_role_buckets(
            path=path,
            hub_id="csis_oversight_hub",
            hub_label="CSIS oversight accountability index",
            hub_link="foreign-influence.html#nsicop",
            categories=["cfnis", "ccp", "osint"],
            buckets=[
                "csis_directors",
                "public_safety_ministers",
                "nsira_chairs",
                "nsicop_chairs",
                "prime_ministers",
            ],
            origin="csis_oversight_dossier",
            claim_level="REPORTING",
            per_bucket=5,
        )

    def ingest_meta_actors_light(self) -> None:
        """Person enrichment only — no amp scores as guilt, no internal axis jargon as categories."""
        path = DATA / "meta_actors.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        axis_to_cat = {
            "arms": "israel",
            "foreign": "ccp",
            "csis_oversight": "cfnis",
            "cfnis": "cfnis",
            "carney": "osint",
            "maid": "osint",
            "central_banking": "osint",
            "climate_environment": "osint",
            "canadian_surface_combatant": "defence",
            "political_business_influence": "osint",
        }
        added = 0
        for row in (raw.get("actors") or []):
            if added >= 30:
                break
            if not isinstance(row, dict):
                continue
            name = row.get("name") or ""
            if not _ok_label(str(name)):
                continue
            axis_count = int(row.get("axis_count") or 0)
            if axis_count < 4:
                continue
            axes = row.get("axes") or []
            cats = set()
            for a in axes[:8]:
                c = axis_to_cat.get(str(a))
                if c:
                    cats.add(c)
            if not cats:
                cats.add("osint")
            # Never surface amp scores in public detail
            nid = self.add_node(
                "person_" + _slug(str(name)),
                label=str(name),
                ntype="person",
                subtitle=f"Cross-file index · {axis_count} public-record threads",
                detail="Appears across multiple public investigation threads. Thread count is documentation density, not guilt.",
                link="evidence-index.html",
                categories=sorted(cats)[:4],
                claim_level="OSINT_INDEX",
                origin="meta_actors",
            )
            if nid:
                added += 1

    def ingest_actor_tenures(self) -> None:
        path = DATA / "actor_tenures.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        actors = raw.get("actors") or {}
        if not isinstance(actors, dict):
            return
        n = 0
        for name, roles in actors.items():
            if n >= 45:
                break
            if not _ok_label(str(name)):
                continue
            pid = self.add_node(
                "person_" + _slug(str(name)),
                label=str(name),
                ntype="person",
                subtitle="Public tenure record",
                detail="Federal/public tenure ranges from Gazette OIC / parliamentary bios class sources.",
                link="evidence-index.html",
                categories=["authority", "osint"],
                claim_level="FACT",
                origin="actor_tenures",
            )
            if not pid or not isinstance(roles, list):
                continue
            for r in roles[:4]:
                if n >= 45:
                    break
                if not isinstance(r, dict):
                    continue
                role = str(r.get("role") or "")
                if not role:
                    continue
                start = str(r.get("start") or "")
                end = r.get("end")
                end_s = str(end) if end else "present"
                rid = self.add_node(
                    "tenure_" + _slug(f"{name}_{role}_{start}"),
                    label=_soft(role, 48),
                    ntype="event",
                    subtitle=f"{start} → {end_s}",
                    detail=_soft(f"{name}: {role} ({start} to {end_s})"),
                    link="evidence-index.html",
                    categories=["authority", "evidence"],
                    claim_level="FACT",
                    origin="actor_tenures",
                )
                if rid and pid:
                    self.add_edge(
                        pid,
                        rid,
                        label="held office",
                        strength=2,
                        claim_level="FACT",
                    )
                    n += 1

    def ingest_postmedia_ownership(self) -> None:
        path = DATA / "postmedia_ownership.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        own = raw.get("ownership") or {}
        post = self.add_node(
            "postmedia",
            label=str(own.get("company") or "Postmedia Network"),
            ntype="org",
            subtitle=_soft(str(own.get("papers") or "Canadian newspaper chain"), 80),
            detail=_soft(
                f"Flagships: {', '.join((own.get('flagships') or [])[:5])}. "
                f"Ownership class: {own.get('owner')} ({own.get('ownership_pct')}%)."
            ),
            link="foreign-influence.html#postmedia",
            categories=["media", "israel"],
            claim_level="REPORTING",
            origin="postmedia_ownership",
        )
        owner_name = str(own.get("owner") or "Chatham Asset Management")
        chatham = self.add_node(
            "chatham",
            label=owner_name.split("(")[0].strip()[:50] or "Chatham Asset Management",
            ntype="org",
            subtitle=f"{own.get('ownership_pct', '')}% ownership class",
            detail=_soft(str(own.get("restriction") or "Foreign ownership class note.")),
            link="foreign-influence.html#postmedia",
            categories=["media", "israel"],
            claim_level="REPORTING",
            origin="postmedia_ownership",
        )
        src = str(own.get("source") or "")
        if post and chatham:
            self.add_edge(
                chatham,
                post,
                label=f"{own.get('ownership_pct', '')}% ownership class",
                strength=3,
                claim_level="REPORTING",
                source_url=src if src.startswith("http") else "",
            )
        founding = raw.get("founding") or {}
        if founding.get("founder"):
            asper = self.add_node(
                "person_" + _slug(str(founding["founder"])),
                label=str(founding["founder"]),
                ntype="person",
                subtitle=_soft(str(founding.get("original") or "CanWest founding"), 70),
                detail=_soft(str(founding.get("founder_desc") or founding.get("transition") or "")),
                link="foreign-influence.html#postmedia",
                categories=["media", "israel"],
                claim_level="REPORTING",
                origin="postmedia_ownership",
            )
            if asper and post:
                self.add_edge(
                    asper,
                    post,
                    label="founding lineage (CanWest→Postmedia)",
                    strength=1,
                    claim_level="REPORTING",
                )
        editorial = raw.get("editorial_direction") or {}
        if editorial.get("finding") and post:
            # attach soft editorial note as detail merge only — no guilt event node
            self.add_node(
                "postmedia",
                label=str(own.get("company") or "Postmedia Network"),
                ntype="org",
                detail=_soft(str(editorial.get("finding") or "")),
                claim_level="REPORTING",
                origin="postmedia_ownership",
            )
        conn = raw.get("investigation_board_connections") or {}
        mesh = (
            ("lorrie_goldstein", "goldstein", "Lorrie Goldstein", "person", "Toronto Sun Editor Emeritus"),
            ("ezra_levant", "levant", "Ezra Levant", "person", "Rebel News founder"),
            ("rebel_news", "rebel_news", "Rebel News", "org", "Media outlet"),
            ("jns", "jns", "JNS", "org", "Jewish News Syndicate"),
        )
        for key, nid0, lab, ntype, sub in mesh:
            if key not in conn:
                continue
            nid = self.add_node(
                nid0,
                label=lab,
                ntype=ntype,
                subtitle=sub,
                detail=_soft(str(conn.get(key) or "")),
                link="foreign-influence.html#postmedia",
                categories=["media", "israel"],
                claim_level="BOARD_INDEX",
                origin="postmedia_ownership",
            )
            if nid and post:
                self.add_edge(
                    post,
                    nid,
                    label="media mesh",
                    strength=1,
                    claim_level="BOARD_INDEX",
                )
        petition = raw.get("petition") or {}
        if petition.get("number") and post:
            pid = self.add_node(
                "petition_" + _slug(str(petition["number"])),
                label=f"Petition {petition['number']}",
                ntype="event",
                subtitle=_soft(str(petition.get("topic") or "Parliamentary petition"), 80),
                detail="Parliamentary petition record (public).",
                link=str(petition.get("url") or "foreign-influence.html#postmedia"),
                categories=["evidence", "media"],
                claim_level="FACT",
                origin="postmedia_ownership",
            )
            if pid:
                self.add_edge(
                    post,
                    pid,
                    label="subject of petition",
                    strength=1,
                    claim_level="FACT",
                    source_url=str(petition.get("url") or ""),
                )

    def ingest_cija_lobbying_update(self) -> None:
        path = DATA / "cija_lobbying_update.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        reg = str(raw.get("registration") or "")
        hub = self.add_node(
            "org_cija",
            label=str(raw.get("org") or "CIJA").split("(")[0].strip() or "CIJA",
            ntype="org",
            subtitle=f"CEO class: {raw.get('ceo') or '—'}",
            detail="Lobbying pipeline update — contact counts are volume, not findings.",
            link="foreign-influence.html#cija",
            categories=["israel", "osint"],
            claim_level="OSINT_REGISTRY",
            origin="cija_lobbying_update",
        )
        if hub and reg.startswith("http"):
            # re-touch with registry link via edge to self not needed
            pass
        for row in (raw.get("top_10_lobbied_mps") or [])[:12]:
            name = row.get("name") or ""
            if not _ok_label(str(name)):
                continue
            contacts = int(row.get("contacts") or 0)
            party = str(row.get("party") or "")
            riding = str(row.get("riding") or "")
            nid = self.add_node(
                "cija_mp_" + _slug(str(name)),
                label=str(name),
                ntype="person",
                subtitle=_soft(
                    f"{contacts} contacts"
                    + (f" · {party}" if party else "")
                    + (f" · {riding}" if riding else ""),
                    90,
                ),
                detail=_soft(str(row.get("note") or "Named in CIJA lobbying volume update.")),
                link="lobbying-tracker.html",
                categories=["israel", "osint"],
                claim_level="OSINT_REGISTRY",
                origin="cija_lobbying_update",
            )
            if nid and hub:
                self.add_edge(
                    hub,
                    nid,
                    label=f"{contacts} contacts",
                    strength=3 if contacts >= 40 else (2 if contacts >= 15 else 1),
                    claim_level="OSINT_REGISTRY",
                    source_url=reg if reg.startswith("http") else "",
                )

    def ingest_cbc_influencer_registry(self) -> None:
        path = DATA / "cbc_influencer_registry.json"
        raw = _load(path)
        if not raw or not isinstance(raw, dict):
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        tiers = raw.get("tiers") or {}
        hub = self.add_node(
            "cbc_amplify_hub",
            label="CBC social amplification mesh",
            ntype="event",
            subtitle="Public handles · index only",
            detail=_soft(
                str(raw.get("disclaimer") or "Inclusion means relevance to public OSINT graph construction.")
            ),
            link="cbc-social-amplification.html",
            categories=["media", "osint"],
            claim_level="OSINT_INDEX",
            origin="cbc_influencer_registry",
        )
        # Institutions first (FACT-ish public handles)
        for row in (tiers.get("INSTITUTION") or [])[:8]:
            if not isinstance(row, dict):
                continue
            name = row.get("name") or row.get("id") or ""
            if not _ok_label(str(name)):
                continue
            handles = ((row.get("handles") or {}).get("x") or [])
            handle0 = ""
            if handles and isinstance(handles[0], dict):
                handle0 = str(handles[0].get("handle") or "").lstrip("@")
            nid = self.add_node(
                "csg_" + _slug(str(row.get("id") or name)),
                label=handle0 or str(name),
                ntype="org",
                subtitle=_soft(str(row.get("type") or "institution"), 60),
                detail="Institutional public handle from CBC influencer registry.",
                link="cbc-social-amplification.html",
                categories=["media"],
                claim_level="OSINT_PUBLIC",
                origin="cbc_influencer_registry",
            )
            if nid and hub:
                self.add_edge(hub, nid, label="institution", strength=2, claim_level="OSINT_PUBLIC")
        # Cap amplifiers — public handles only
        for row in (tiers.get("AMPLIFIER_WATCH") or [])[:18]:
            if not isinstance(row, dict):
                continue
            name = row.get("name") or row.get("id") or ""
            handles = ((row.get("handles") or {}).get("x") or [])
            handle0 = ""
            if handles and isinstance(handles[0], dict):
                handle0 = str(handles[0].get("handle") or "").lstrip("@")
            lab = handle0 or str(name)
            if not _ok_label(lab):
                continue
            nid = self.add_node(
                "scrape_" + _slug(lab),
                label=lab,
                ntype="person",
                subtitle="Amplifier watch (public handle)",
                detail="Public handle in amplifier-watch tier. Not a finding of wrongdoing.",
                link="cbc-social-amplification.html",
                categories=["media", "osint"],
                claim_level="OSINT_INDEX",
                origin="cbc_influencer_registry",
            )
            if nid and hub:
                self.add_edge(hub, nid, label="amplifier watch", strength=1, claim_level="OSINT_INDEX")
        for row in (tiers.get("CPC_POLITICAL") or [])[:8]:
            if not isinstance(row, dict):
                continue
            name = row.get("name") or row.get("id") or ""
            handles = ((row.get("handles") or {}).get("x") or [])
            handle0 = ""
            if handles and isinstance(handles[0], dict):
                handle0 = str(handles[0].get("handle") or "").lstrip("@")
            lab = handle0 or str(name)
            if not _ok_label(lab):
                continue
            nid = self.add_node(
                "media_" + _slug(str(row.get("id") or lab)),
                label=lab,
                ntype="person",
                subtitle="Political account (public)",
                detail="Public political handle in amplification mesh registry.",
                link="cbc-social-amplification.html",
                categories=["media", "osint"],
                claim_level="OSINT_INDEX",
                origin="cbc_influencer_registry",
            )
            if nid and hub:
                self.add_edge(hub, nid, label="political amp", strength=1, claim_level="OSINT_INDEX")
        # Skip CASE_NODE bulk to avoid over-weighting personal targets without edges

    def ingest_cbc_board_oic(self) -> None:
        path = DATA / "cbc_board_oic_public_records.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        cbc = self.add_node(
            "cbc_radio_canada",
            label="CBC/Radio-Canada",
            ntype="org",
            subtitle="Public broadcaster · GIC board",
            detail="Leadership appointments from Order-in-Council / Canadian Heritage public releases.",
            link="cbc-accountability.html",
            categories=["media", "authority"],
            claim_level="FACT",
            origin="cbc_board_oic",
        )
        heritage = self.add_node(
            "inst_canadian_heritage",
            label="Canadian Heritage",
            ntype="org",
            subtitle="Recommending department (GIC appointments)",
            detail="Recommending minister class for CBC board appointments.",
            link="cbc-accountability.html",
            categories=["authority", "media"],
            claim_level="FACT",
            origin="cbc_board_oic",
        )
        if cbc and heritage:
            self.add_edge(
                heritage,
                cbc,
                label="GIC appointment path",
                strength=2,
                claim_level="FACT",
            )
        for ap in (raw.get("appointments") or [])[:8]:
            if not isinstance(ap, dict):
                continue
            name = ap.get("name") or ""
            if not _ok_label(str(name)):
                continue
            role = str(ap.get("role") or "CBC board role")
            cl = str(ap.get("claim_level") or "FACT")
            if cl.upper().startswith("FACT"):
                cl = "FACT"
            elif cl.upper().startswith("REPORT"):
                cl = "REPORTING"
            else:
                cl = "FACT"
            srcs = ap.get("sources") or []
            src_url = ""
            for s in srcs:
                if isinstance(s, dict) and str(s.get("url") or "").startswith("http"):
                    src_url = str(s["url"])
                    break
            nid = self.add_node(
                "cbc_appt_" + _slug(str(name)),
                label=str(name).split(",")[0].strip()[:60],
                ntype="person",
                subtitle=_soft(
                    role
                    + (
                        f" · {ap.get('effective') or ap.get('oic_date') or ''}"
                        if ap.get("effective") or ap.get("oic_date")
                        else ""
                    ),
                    90,
                ),
                detail=_soft(
                    f"{role}. "
                    + (
                        f"Replaces {ap.get('replaces')}. "
                        if ap.get("replaces")
                        else ""
                    )
                    + (str(ap.get("term") or "")),
                    220,
                ),
                link="cbc-accountability.html",
                categories=["media", "authority"],
                claim_level=cl,
                origin="cbc_board_oic",
            )
            if nid and cbc:
                self.add_edge(
                    cbc,
                    nid,
                    label=role[:50],
                    strength=3 if "CEO" in role or "Chair" in role else 2,
                    claim_level=cl,
                    source_url=src_url,
                )
            if nid and heritage:
                self.add_edge(
                    heritage,
                    nid,
                    label="recommending path",
                    strength=1,
                    claim_level=cl,
                    source_url=src_url,
                )
            replaces = ap.get("replaces")
            if replaces and _ok_label(str(replaces)) and nid:
                rid = self.add_node(
                    "cbc_appt_" + _slug(str(replaces)),
                    label=str(replaces),
                    ntype="person",
                    subtitle="Prior CBC leadership (public record)",
                    detail="Named as replaced appointee in OIC/Heritage release class.",
                    link="cbc-accountability.html",
                    categories=["media", "authority"],
                    claim_level="FACT",
                    origin="cbc_board_oic",
                )
                if rid:
                    self.add_edge(
                        nid,
                        rid,
                        label="succeeds",
                        strength=2,
                        claim_level="FACT",
                        source_url=src_url,
                    )
        for dname in (raw.get("board_directors_seed") or [])[:10]:
            if not _ok_label(str(dname)):
                continue
            did = self.add_node(
                "cbc_dir_" + _slug(str(dname)),
                label=str(dname),
                ntype="person",
                subtitle="CBC board director seed",
                detail="Named in public CBC board director seed list. PC numbers may be incomplete.",
                link="cbc-accountability.html",
                categories=["media", "authority"],
                claim_level="REPORTING",
                origin="cbc_board_oic",
            )
            if did and cbc:
                self.add_edge(
                    cbc,
                    did,
                    label="board director",
                    strength=1,
                    claim_level="REPORTING",
                )

    def ingest_appointments_events(self) -> None:
        """FACT appointment events — edges only where entity ids already known or created lightly."""
        path = DATA / "appointments.json"
        raw = _load(path)
        if not raw:
            return
        self.sources_used.append(str(path.relative_to(ROOT)))
        # Prefer edges that attach to already-loaded entity nodes; add thin nodes for top 40
        added = 0
        for ap in (raw.get("appointments") or [])[:50]:
            if added >= 40:
                break
            if not isinstance(ap, dict):
                continue
            if ap.get("event_type") not in ("appointment", "interim", None):
                # skip pure resignations for edge budget unless both ends exist
                if ap.get("event_type") == "resignation":
                    continue
            eid = str(ap.get("entity_id") or "")
            office = str(ap.get("office") or "")
            body = str(ap.get("body") or "")
            label = office.split(",")[0].strip() if office else body
            # resolve person label from existing entity node if present
            person_lab = ""
            if eid in self.nodes:
                person_lab = str(self.nodes[eid].get("label") or "")
            if not person_lab:
                # thin synthetic from office holder pattern already in entities
                continue
            srcs = ap.get("sources") or []
            src_url = ""
            for s in srcs:
                if isinstance(s, dict) and str(s.get("url") or "").startswith("http"):
                    src_url = str(s["url"])
                    break
            body_id = None
            if body and _ok_label(body):
                body_id = self.add_node(
                    "inst_" + _slug(body),
                    label=body[:60],
                    ntype="org",
                    subtitle="Institution (appointment body)",
                    detail="Named body on public appointment event.",
                    link=src_url or "evidence-index.html",
                    categories=["authority"],
                    claim_level="FACT",
                    origin="appointments",
                )
            if body_id and eid in self.nodes:
                self.add_edge(
                    body_id,
                    eid,
                    label=_soft(office or "appointment", 50),
                    strength=2,
                    claim_level="FACT",
                    source_url=src_url,
                )
                added += 1
            appointer = str(ap.get("appointed_by") or "")
            if appointer and appointer in self.nodes and eid in self.nodes:
                self.add_edge(
                    appointer,
                    eid,
                    label="appointed",
                    strength=1,
                    claim_level="FACT",
                    source_url=src_url,
                )
                added += 1

    def build(self) -> dict[str, Any]:
        self.ingest_investigation_board()
        self.ingest_entities_edges()
        self.ingest_defence()
        self.ingest_entity_registry()
        self.ingest_cbc_public_osint()
        self.ingest_vault_osint_light()
        self.ingest_scrape_tags()
        self.ingest_maid_lobbying()
        self.ingest_mp_bill_connections()
        self.ingest_cpc_donors_top()
        self.ingest_corruption_map_top()
        self.ingest_pmo_lobbying()
        self.ingest_blackrock_brookfield()
        self.ingest_most_lobbied_officials()
        self.ingest_cija_lobbying()
        self.ingest_cpc_media_graph()
        self.ingest_osint_network_graph()
        self.ingest_defense_nexus()
        self.ingest_carney_dossier()
        self.ingest_cbc_social_graph()
        self.ingest_business_holdings()
        self.ingest_politician_kinship()
        self.ingest_lobbying_analysis()
        self.ingest_foreign_lobbying_scan()
        self.ingest_atlas_fraser()
        self.ingest_cbc_board_oic()
        self.ingest_appointments_events()
        self.ingest_foreign_interference_dossier()
        self.ingest_arms_pipeline_dossier()
        self.ingest_charity_pipeline()
        self.ingest_postmedia_ownership()
        self.ingest_cija_lobbying_update()
        self.ingest_cbc_influencer_registry()
        self.ingest_actor_tenures()
        self.ingest_northland_production_chain()
        self.ingest_csis_oversight_dossier()
        self.ingest_meta_actors_light()

        # drop orphan edges again after all merges
        ids = set(self.nodes)
        self.edges = [e for e in self.edges if e["from"] in ids and e["to"] in ids]

        raw_nodes = len(self.nodes)
        raw_edges = len(self.edges)

        # cap board size for public UI — highest degree first
        deg: Counter[str] = Counter()
        for e in self.edges:
            deg[e["from"]] += 1
            deg[e["to"]] += 1
        if len(self.nodes) > 220:
            keep = {nid for nid, _ in deg.most_common(140)}
            # always keep FACT / EC open data if connected (degree≥1) or core origins
            core_origins = {
                "defence_cluster",
                "entities_edges",
                "maid_lobbying_crossref",
                "cpc_top_donors",
                "cbc_social_graph",
                "cbc_board_oic",
                "appointments",
                "northland_production_chain",
                "actor_tenures",
            }
            for nid, n in self.nodes.items():
                if n.get("origin") in core_origins:
                    keep.add(nid)
                elif n.get("claim_level") in ("FACT", "PUBLIC_EC_OPEN_DATA") and deg.get(
                    nid, 0
                ) >= 1:
                    keep.add(nid)
            self.nodes = {k: v for k, v in self.nodes.items() if k in keep}
            ids = set(self.nodes)
            self.edges = [e for e in self.edges if e["from"] in ids and e["to"] in ids]
            # hard ceiling for browser layout — trim lowest-degree non-core
            if len(self.nodes) > 260:
                deg2: Counter[str] = Counter()
                for e in self.edges:
                    deg2[e["from"]] += 1
                    deg2[e["to"]] += 1
                ranked = sorted(
                    self.nodes.keys(),
                    key=lambda i: (
                        1 if self.nodes[i].get("origin") in core_origins else 0,
                        1
                        if self.nodes[i].get("claim_level")
                        in ("FACT", "PUBLIC_EC_OPEN_DATA")
                        else 0,
                        deg2.get(i, 0),
                    ),
                    reverse=True,
                )
                keep2 = set(ranked[:260])
                self.nodes = {k: v for k, v in self.nodes.items() if k in keep2}
                ids = set(self.nodes)
                self.edges = [
                    e for e in self.edges if e["from"] in ids and e["to"] in ids
                ]
            self.stats["capped"] = 1
            self.stats["raw_nodes"] = raw_nodes
            self.stats["raw_edges"] = raw_edges

        claim_counts: Counter[str] = Counter()
        for n in self.nodes.values():
            claim_counts[str(n.get("claim_level") or "OSINT_INDEX")] += 1

        # strip internal origin; public-safe source basenames only
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

        public_sources = []
        for s in self.sources_used[:32]:
            # basenames only — never expose full host paths
            public_sources.append(Path(s).name.replace("\\", "/").split("/")[-1])

        board = {
            "meta": {
                "title": "TENET5 OSINT composite network",
                "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M"),
                "sources": ", ".join(public_sources),
                "source_count": len(self.sources_used),
                "capped": bool(self.stats.get("capped")),
                "raw_nodes": raw_nodes,
                "raw_edges": raw_edges,
                "claim_counts": dict(claim_counts),
                "note": "Composite of investigation board + appointment edges + defence freezes + OSINT vault/scrapes + lobbying/donor open data. Centrality is not guilt. Prefer case files.",
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
