#!/usr/bin/env python3
"""PRISM News Slate — raised multi-slate registry (main ticker isolated).

Doctrine (Daniel 2026-07-12):
  - Main slate = broadcast ticker ONLY (SEG desk hits + LIVE markers).
  - Every article type + every chart type is OFF the main slate.
  - All slates stamp Temple THEME_VER + press token kernel.
  - Data is rectified + sorted before consumers read it.
  - Proceed OSINT + news scrape queues for investigations.

  python tools/prism_news_slate.py rectify
  python tools/prism_news_slate.py rectify --json
  python tools/prism_news_slate.py gate        # main-slate pollution only
  python tools/prism_news_slate.py scrape-queue # write OSINT/news scrape flags

Proof:
  data/news_slate_registry.json
  data/news_slate_rectify_last.json
  C:/PRISM/log/news_slate_rectify_last.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
TOOLS = ROOT / "tools"
REGISTRY = DATA / "news_slate_registry.json"
PROOF_PATHS = [
    Path(r"C:\PRISM\log\news_slate_rectify_last.json"),
    DATA / "news_slate_rectify_last.json",
]
MANIFEST = DATA / "slate_manifest.json"

# ── Article types (OFF main slate) ──────────────────────────────────────────
ARTICLE_TYPES: dict[str, dict[str, str]] = {
    "feature": {"lane": "news", "surface": "liril_news_articles / story/*", "template": "news.package"},
    "wire_note": {"lane": "news", "surface": "liril_news_articles", "template": "news.package"},
    "daily_package": {"lane": "news", "surface": "desk-today package", "template": "news.package"},
    "briefing": {"lane": "news", "surface": "daily-briefing", "template": "news.package"},
    "wire_external": {"lane": "news", "surface": "home_wire / news_feed", "template": "hub.lane"},
    "headline": {"lane": "news", "surface": "news/headlines.json", "template": "hub.lane"},
    "investigation": {"lane": "investigations", "surface": "press-file dossiers", "template": "investigation.press-file"},
    "case_act": {"lane": "case", "surface": "argument / acts", "template": "case.act"},
    "evidence_item": {"lane": "evidence", "surface": "evidence shelf", "template": "evidence.shelf"},
    "hub": {"lane": "hub", "surface": "lane hubs", "template": "hub.lane"},
}

# ── Chart types (OFF main slate) ────────────────────────────────────────────
CHART_TYPES: dict[str, dict[str, str]] = {
    "metrics": {"surface": ".nr-metrics / scale band", "owner": "press-file pages"},
    "table_fact": {"surface": "FACT tables", "owner": "investigation.press-file"},
    "trajectory": {"surface": "trajectory charts", "owner": "generate_trajectory_charts.py"},
    "network": {"surface": "network_osint_board", "owner": "build_network_osint_board.py"},
    "desk_svg": {"surface": "desk SVG art", "owner": "prism_desk_svg_art.py"},
    "timeline": {"surface": "chrono / horizon bands", "owner": "home_wire horizons"},
}

# Tokens that must NEVER appear in main ticker bits / unit_line
MAIN_POLLUTION = re.compile(
    r"\b("
    r"news\.package|investigation\.press-file|case\.act|evidence\.shelf|hub\.lane|"
    r"wire_note|daily_package|wire_external|article_type|chart_type|"
    r"nr-metrics|trajectory|network-graph|desk_svg|table_fact|"
    r"chart:|type:\s*feature|template\s*id"
    r")\b",
    re.I,
)

# Off-main slate catalog (product surfaces)
OFF_MAIN_SLATES: list[dict[str, str]] = [
    {"id": "news.wire", "path": "data/home_wire.json", "role": "RSS continuum"},
    {"id": "news.feed", "path": "data/news_feed.json", "role": "raw RSS index"},
    {"id": "news.headlines", "path": "data/news/headlines.json", "role": "headline cache"},
    {"id": "news.articles", "path": "data/liril_news_articles.json", "role": "LIRIL desk packages"},
    {"id": "news.package", "path": "templates/news.package.html", "role": "story product type"},
    {"id": "investigation.press_file", "path": "templates/investigation.press-file.html", "role": "dossier type"},
    {"id": "case.act", "path": "templates/case.act.html", "role": "case act type"},
    {"id": "evidence.shelf", "path": "templates/evidence.shelf.html", "role": "evidence type"},
    {"id": "hub.lane", "path": "templates/hub.lane.html", "role": "hub type"},
    {"id": "osint.network_board", "path": "data/network_osint_board.json", "role": "composite graph"},
    {"id": "osint.alert_feed", "path": "data/osint_alert_feed.json", "role": "alerts"},
    {"id": "osint.entity_registry", "path": "data/osint_entity_registry.json", "role": "entity registry"},
    {"id": "chart.metrics", "path": "page-local", "role": "metrics boards"},
    {"id": "chart.trajectory", "path": "tools/generate_trajectory_charts.py", "role": "trajectory"},
    {"id": "chart.network", "path": "data/network_osint_board.json", "role": "network viz"},
    {"id": "chart.desk_svg", "path": "tools/prism_desk_svg_art.py", "role": "desk SVG"},
    {"id": "audio.slate", "path": "tools/prism_audio_slate.py", "role": "audio gates"},
    {"id": "video.slate", "path": "tools/prism_video_slate.py", "role": "video gates"},
    {"id": "seo.slate", "path": "tools/prism_site_seo_slate.py", "role": "SEO surface"},
    {"id": "media.format", "path": "tools/prism_site_media_format_slate.py", "role": "media format"},
    {"id": "temple.tokens", "path": "css/press-theme.css", "role": "theme kernel"},
]


def _utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load(path: Path) -> Any | None:
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def _write_json(path: Path, doc: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def theme_ver() -> str:
    p = TOOLS / "apply_one_theme.py"
    if not p.is_file():
        return ""
    m = re.search(r'THEME_VER\s*=\s*["\'](\d+)["\']', p.read_text(encoding="utf-8", errors="replace"))
    return m.group(1) if m else ""


def temple_stamp() -> dict[str, Any]:
    ver = theme_ver()
    temple_proof = _load(DATA / "prism_temple_slate_lock_last.json") or {}
    contract = _load(ROOT / "css" / "PRESS_THEME_QUANTUM_CONTRACT.json") or {}
    anchors = contract.get("anchors") or {}
    token_hash = hashlib.sha256(
        json.dumps(anchors, sort_keys=True).encode("utf-8")
    ).hexdigest()[:16] if anchors else ""
    return {
        "theme_ver": ver,
        "temple_verdict": temple_proof.get("verdict") or temple_proof.get("ok"),
        "temple_ts": temple_proof.get("ts"),
        "contract_version": contract.get("version"),
        "token_hash": token_hash,
        "css": ["css/press-theme.css", "css/design-lock.css"],
        "retired_themes": ["Red Ensign Royal", "product.css", "tokens.css", "cinematic-slate"],
    }


def gate_main_ticker(slate: dict[str, Any] | None) -> dict[str, Any]:
    """Ensure main broadcast ticker has zero article/chart type pollution."""
    if not slate:
        return {"ok": False, "issues": ["main_ticker_missing"], "polluted_bits": []}
    issues: list[str] = []
    polluted: list[str] = []
    bits = slate.get("bits") or []
    for b in bits:
        s = str(b)
        if MAIN_POLLUTION.search(s):
            polluted.append(s[:120])
            issues.append(f"polluted_bit:{s[:80]}")
        # bits must look like SEG form when present
        if s and not re.match(r"^SEG\s+\d+", s, re.I):
            issues.append(f"non_seg_bit:{s[:60]}")
    for field in ("unit_line", "full_line"):
        line = str(slate.get(field) or "")
        if MAIN_POLLUTION.search(line):
            issues.append(f"polluted_{field}")
    # main must not carry article type inventory
    for k in ("article_types", "chart_types", "templates", "lanes"):
        if k in slate:
            issues.append(f"main_carries_{k}")
    ok = not issues
    return {
        "ok": ok,
        "issues": issues[:40],
        "polluted_bits": polluted[:20],
        "segment_count": len(bits),
        "hash": slate.get("hash"),
        "doctrine": slate.get("doctrine"),
    }


def rectify_wire(wire_doc: dict | None) -> dict[str, Any]:
    items = list((wire_doc or {}).get("wire") or [])
    # sort: rank_score desc, then date desc
    def key(it: dict) -> tuple:
        rs = float(it.get("rank_score") or it.get("relevance_score") or 0)
        when = str(it.get("date") or "")
        return (-rs, when)

    items_sorted = sorted([i for i in items if isinstance(i, dict)], key=key)
    by_horizon: dict[str, int] = {}
    by_type: dict[str, int] = {}
    for it in items_sorted:
        h = str(it.get("horizon") or "unknown")
        by_horizon[h] = by_horizon.get(h, 0) + 1
        t = str(it.get("type") or "wire_external")
        by_type[t] = by_type.get(t, 0) + 1
    return {
        "count": len(items_sorted),
        "by_horizon": dict(sorted(by_horizon.items())),
        "by_type": dict(sorted(by_type.items())),
        "top": [
            {
                "id": it.get("id"),
                "title": (it.get("title") or "")[:100],
                "source": it.get("source"),
                "rank_score": it.get("rank_score"),
                "horizon": it.get("horizon"),
                "type": it.get("type") or "wire_external",
                "label": it.get("label"),
            }
            for it in items_sorted[:24]
        ],
        "sorted": True,
        "off_main": True,
    }


def rectify_articles(doc: dict | None) -> dict[str, Any]:
    arts = [a for a in list((doc or {}).get("articles") or []) if isinstance(a, dict)]
    # sort: daily first, then type, then domain, then title
    def key(a: dict) -> tuple:
        daily = 0 if a.get("is_daily_package") else 1
        return (daily, str(a.get("type") or ""), str(a.get("domain") or ""), str(a.get("title") or ""))

    arts_sorted = sorted(arts, key=key)
    by_type: dict[str, int] = {}
    for a in arts_sorted:
        t = str(a.get("type") or "feature")
        if a.get("is_daily_package"):
            t = "daily_package"
        by_type[t] = by_type.get(t, 0) + 1
    return {
        "count": len(arts_sorted),
        "by_type": dict(sorted(by_type.items())),
        "items": [
            {
                "slug": a.get("slug"),
                "type": "daily_package" if a.get("is_daily_package") else (a.get("type") or "feature"),
                "domain": a.get("domain"),
                "title": (a.get("title") or "")[:100],
                "href": a.get("href"),
                "off_main": True,
            }
            for a in arts_sorted
        ],
        "sorted": True,
        "off_main": True,
    }


def rectify_feed(doc: dict | None) -> dict[str, Any]:
    arts = [a for a in list((doc or {}).get("articles") or []) if isinstance(a, dict)]

    def when_key(a: dict) -> str:
        return str(a.get("pub_date") or a.get("indexed_at") or "")

    arts_sorted = sorted(arts, key=when_key, reverse=True)
    by_source: dict[str, int] = {}
    by_cat: dict[str, int] = {}
    for a in arts_sorted:
        s = str(a.get("source") or "unknown")
        by_source[s] = by_source.get(s, 0) + 1
        c = str(a.get("category") or "uncat")
        by_cat[c] = by_cat.get(c, 0) + 1
    return {
        "count": len(arts_sorted),
        "by_source": dict(sorted(by_source.items(), key=lambda x: -x[1])[:20]),
        "by_category": dict(sorted(by_cat.items())),
        "top": [
            {
                "id": a.get("id"),
                "title": (a.get("title") or "")[:100],
                "source": a.get("source"),
                "category": a.get("category"),
                "relevance_score": a.get("relevance_score"),
                "pub_date": a.get("pub_date"),
            }
            for a in arts_sorted[:30]
        ],
        "sorted": True,
        "off_main": True,
    }


def rectify_osint(board: dict | None, alerts: dict | None) -> dict[str, Any]:
    meta = (board or {}).get("meta") or {}
    nodes = [n for n in list((board or {}).get("nodes") or []) if isinstance(n, dict)]
    # sort: claim_level weight, then label
    claim_w = {
        "FACT": 0,
        "PUBLIC_EC_OPEN_DATA": 1,
        "OSINT_REGISTRY": 2,
        "REPORTING": 3,
        "OSINT_INDEX": 4,
    }

    def nkey(n: dict) -> tuple:
        cl = str(n.get("claim_level") or "Z")
        return (claim_w.get(cl, 9), str(n.get("label") or "").lower())

    nodes_sorted = sorted(nodes, key=nkey)
    by_claim: dict[str, int] = {}
    by_type: dict[str, int] = {}
    for n in nodes_sorted:
        cl = str(n.get("claim_level") or "unknown")
        by_claim[cl] = by_claim.get(cl, 0) + 1
        t = str(n.get("type") or "unknown")
        by_type[t] = by_type.get(t, 0) + 1
    alert_list = list((alerts or {}).get("alerts") or [])
    return {
        "board_updated": meta.get("updated"),
        "source_count": meta.get("source_count"),
        "raw_nodes": meta.get("raw_nodes"),
        "raw_edges": meta.get("raw_edges"),
        "nodes_capped": len(nodes_sorted),
        "by_claim_level": dict(sorted(by_claim.items())),
        "by_node_type": dict(sorted(by_type.items())),
        "claim_counts": meta.get("claim_counts") or {},
        "alert_count": len(alert_list),
        "top_nodes": [
            {
                "id": n.get("id"),
                "label": n.get("label"),
                "type": n.get("type"),
                "claim_level": n.get("claim_level"),
            }
            for n in nodes_sorted[:20]
        ],
        "sorted": True,
        "off_main": True,
        "chart_type": "network",
    }


def list_osint_scrape_inventory() -> dict[str, Any]:
    vault = DATA / "osint_vault"
    scrapes = DATA / "osint_scrapes"
    vault_files = sorted(vault.glob("*.json")) if vault.is_dir() else []
    scrape_dirs = sorted([p.name for p in scrapes.iterdir() if p.is_dir()]) if scrapes.is_dir() else []
    scrape_files = sorted(scrapes.rglob("*.json")) if scrapes.is_dir() else []
    return {
        "vault_json_count": len(vault_files),
        "vault_samples": [p.name for p in vault_files[:15]],
        "scrape_platforms": scrape_dirs,
        "scrape_json_count": len(scrape_files),
        "off_main": True,
    }


def sync_manifest(temple: dict[str, Any]) -> dict[str, Any]:
    """Rewrite stale Red Ensign slate_manifest to Temple press doctrine."""
    prev = _load(MANIFEST) or {}
    doc = {
        "slate_version": "2.0.0",
        "identity": "TENET5",
        "ai_brand": "Powered by LIRIL AI",
        "generated": _utc(),
        "doctrine": "temple_press_multi_slate",
        "main_slate": {
            "id": "main.broadcast_ticker",
            "path": "data/broadcast_ticker_slate.json",
            "allows": ["SEG desk titles", "LIVE", "TIME NAV", "TOPIC NAV", "TENET5"],
            "forbids": list(ARTICLE_TYPES.keys()) + list(CHART_TYPES.keys()),
        },
        "off_main_slates": OFF_MAIN_SLATES,
        "article_types": ARTICLE_TYPES,
        "chart_types": CHART_TYPES,
        "temple": temple,
        "theme": {
            "name": "Quantanium press (Temple)",
            "css": ["css/press-theme.css", "css/design-lock.css"],
            "theme_ver": temple.get("theme_ver"),
            "palette": "void/ink/ivory/ice/red/gold — press :root only",
            "typography": "Fraunces + IBM Plex Mono",
            "retired": ["Red Ensign Royal", "Playfair Display", "Inter as identity", "product.css"],
        },
        "lanes": {
            "news": "news.html",
            "investigations": "investigations.html",
            "case": "argument.html",
            "evidence": "evidence-index.html",
        },
        "build_pipeline": {
            "news_slate": "tools/prism_news_slate.py rectify",
            "ticker": "tools/broadcast_ticker_slate.py",
            "wire": "tools/build_rss_home_wire.py",
            "osint_board": "tools/build_network_osint_board.py",
            "temple": "tools/prism_temple_slate_lock.py",
            "theme_apply": "tools/apply_one_theme.py",
            "site_duty": "tools/prism_site_duty.py",
        },
        "pages": prev.get("pages") if isinstance(prev.get("pages"), dict) else {},
        "sator_grid": prev.get("sator_grid") if isinstance(prev.get("sator_grid"), dict) else {},
        "note": "Manifest is catalog only — design god is homepage + press-theme. Main ticker never carries article/chart types.",
    }
    _write_json(MANIFEST, doc)
    return {"ok": True, "path": str(MANIFEST), "version": doc["slate_version"]}


def build_registry() -> dict[str, Any]:
    temple = temple_stamp()
    main = _load(DATA / "broadcast_ticker_slate.json")
    main_gate = gate_main_ticker(main)
    wire = rectify_wire(_load(DATA / "home_wire.json"))
    articles = rectify_articles(_load(DATA / "liril_news_articles.json"))
    feed = rectify_feed(_load(DATA / "news_feed.json"))
    headlines_doc = _load(DATA / "news" / "headlines.json")
    headlines = {
        "count": len((headlines_doc or {}).get("headlines") or []),
        "generated": (headlines_doc or {}).get("generated"),
        "off_main": True,
    }
    osint = rectify_osint(
        _load(DATA / "network_osint_board.json"),
        _load(DATA / "osint_alert_feed.json"),
    )
    scrapes = list_osint_scrape_inventory()
    man = sync_manifest(temple)

    # Surface existence for off-main catalog
    surfaces = []
    for s in OFF_MAIN_SLATES:
        rel = s.get("path") or ""
        if rel == "page-local":
            exists = True
        else:
            exists = (ROOT / rel).exists()
        surfaces.append({**s, "exists": exists, "off_main": True})

    ok = bool(main_gate.get("ok"))
    registry = {
        "ts": _utc(),
        "doctrine": "main_ticker_only_article_chart_types_off_main",
        "spec": "tools/NEWS_SLATE_SPEC.md",
        "temple": temple,
        "main_slate": {
            "id": "main.broadcast_ticker",
            "path": "data/broadcast_ticker_slate.json",
            "gate": main_gate,
            "on_main": True,
            "bits_sample": (main or {}).get("bits") or [],
        },
        "article_types": ARTICLE_TYPES,
        "chart_types": CHART_TYPES,
        "off_main_surfaces": surfaces,
        "rectified": {
            "wire": wire,
            "articles": articles,
            "feed": feed,
            "headlines": headlines,
            "osint": osint,
            "scrapes": scrapes,
        },
        "manifest_sync": man,
        "ok": ok,
        "verdict": "NEWS_SLATE_RECTIFY_PASS" if ok else "NEWS_SLATE_RECTIFY_FAIL",
    }
    return registry


def write_proof(registry: dict[str, Any]) -> None:
    proof = {
        "ts": registry.get("ts"),
        "verdict": registry.get("verdict"),
        "ok": registry.get("ok"),
        "theme_ver": (registry.get("temple") or {}).get("theme_ver"),
        "main_gate_ok": ((registry.get("main_slate") or {}).get("gate") or {}).get("ok"),
        "main_issues": ((registry.get("main_slate") or {}).get("gate") or {}).get("issues") or [],
        "wire_count": ((registry.get("rectified") or {}).get("wire") or {}).get("count"),
        "articles_count": ((registry.get("rectified") or {}).get("articles") or {}).get("count"),
        "feed_count": ((registry.get("rectified") or {}).get("feed") or {}).get("count"),
        "osint_nodes": ((registry.get("rectified") or {}).get("osint") or {}).get("nodes_capped"),
        "article_types_off_main": list(ARTICLE_TYPES.keys()),
        "chart_types_off_main": list(CHART_TYPES.keys()),
        "registry": str(REGISTRY),
        "spec": "tools/NEWS_SLATE_SPEC.md",
    }
    for p in PROOF_PATHS:
        try:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
        except OSError:
            pass


def cmd_rectify(as_json: bool) -> int:
    reg = build_registry()
    _write_json(REGISTRY, reg)
    write_proof(reg)
    if as_json:
        print(json.dumps({
            "verdict": reg["verdict"],
            "ok": reg["ok"],
            "theme_ver": reg["temple"].get("theme_ver"),
            "main_gate": reg["main_slate"]["gate"],
            "counts": {
                "wire": reg["rectified"]["wire"]["count"],
                "articles": reg["rectified"]["articles"]["count"],
                "feed": reg["rectified"]["feed"]["count"],
                "osint_nodes": reg["rectified"]["osint"]["nodes_capped"],
            },
            "registry": str(REGISTRY),
        }, indent=2))
    else:
        g = reg["main_slate"]["gate"]
        print(f"=== {reg['verdict']} · THEME_VER={reg['temple'].get('theme_ver')} ===")
        print(f"  main ticker gate: {'OK' if g.get('ok') else 'FAIL'}  bits={g.get('segment_count')}")
        if g.get("issues"):
            for i in g["issues"][:8]:
                print(f"    - {i}")
        r = reg["rectified"]
        print(f"  wire={r['wire']['count']}  articles={r['articles']['count']}  feed={r['feed']['count']}")
        print(f"  osint_nodes={r['osint']['nodes_capped']}  vault={r['scrapes']['vault_json_count']}")
        print(f"  article types OFF main: {', '.join(ARTICLE_TYPES)}")
        print(f"  chart types OFF main: {', '.join(CHART_TYPES)}")
        print(f"  registry: {REGISTRY}")
    return 0 if reg.get("ok") else 1


def cmd_gate(as_json: bool) -> int:
    main = _load(DATA / "broadcast_ticker_slate.json")
    g = gate_main_ticker(main)
    if as_json:
        print(json.dumps(g, indent=2))
    else:
        print("MAIN_TICKER_GATE", "PASS" if g["ok"] else "FAIL", g)
    return 0 if g.get("ok") else 1


def cmd_scrape_queue() -> int:
    """Queue news RSS scan + OSINT investigation scrape flags (PRISM/site duty pickup)."""
    flags = [
        DATA / ".prism_news_rss_scan",
        DATA / ".prism_osint_scrape",
        DATA / ".prism_news_slate_rectify",
        DATA / ".prism_site_duty_once",
        Path(r"C:\PRISM\data\.prism_news_rss_scan"),
        Path(r"C:\PRISM\data\.prism_osint_scrape"),
        Path(r"C:\PRISM\data\.prism_news_slate_rectify"),
        Path(r"E:\S.L.A.T.E\tenet5\data\.game_background_force_cycle"),
        DATA / ".game_background_force_cycle",
    ]
    written = []
    body = _utc() + "\nnews_slate scrape-queue\n"
    for f in flags:
        try:
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(body, encoding="utf-8")
            written.append(str(f))
        except OSError:
            pass

    # Investigation-facing scrape plan (public-safe targets)
    plan = {
        "ts": _utc(),
        "doctrine": "osint_and_news_scrapes_for_investigations",
        "jobs": [
            {
                "id": "news_rss_scan",
                "tool": "tools/nemoclaw_news_scanner.py",
                "then": "tools/build_rss_home_wire.py --scan",
                "out": ["data/news_feed.json", "data/home_wire.json"],
            },
            {
                "id": "network_osint_board",
                "tool": "tools/build_network_osint_board.py",
                "out": ["data/network_osint_board.json"],
            },
            {
                "id": "cbc_public_osint",
                "tool": "tools/cbc_public_osint_run.py",
                "out": ["data/osint_vault/cbc_public_osint_last.json"],
                "optional": True,
            },
            {
                "id": "news_slate_rectify",
                "tool": "tools/prism_news_slate.py rectify",
                "out": ["data/news_slate_registry.json"],
            },
        ],
        "investigation_desks": [
            "foreign_interference",
            "procurement",
            "maid",
            "lobbying",
            "defence",
            "municipal",
            "5gw_media",
        ],
        "flags_written": written,
        "note": "PRISM site duty / Docker rotation picks flags; Grok does not host-Shell scanners.",
    }
    plan_path = DATA / "news_osint_scrape_queue_last.json"
    _write_json(plan_path, plan)
    try:
        Path(r"C:\PRISM\log\news_osint_scrape_queue_last.json").write_text(
            json.dumps(plan, indent=2) + "\n", encoding="utf-8"
        )
    except OSError:
        pass
    print(json.dumps({"ok": True, "flags": len(written), "plan": str(plan_path)}, indent=2))
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="TENET5 news multi-slate rectify + gate")
    ap.add_argument("cmd", nargs="?", default="rectify", choices=["rectify", "gate", "scrape-queue"])
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    if args.cmd == "rectify":
        return cmd_rectify(args.json)
    if args.cmd == "gate":
        return cmd_gate(args.json)
    if args.cmd == "scrape-queue":
        return cmd_scrape_queue()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
