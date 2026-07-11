#!/usr/bin/env python3
"""Build objective home wire from RSS news_feed.json + optional briefing.

Doctrine (Daniel):
  - Time continuum on home (hour wire / week investigations / …)
  - RSS feeds swarm for active news analysis — multi-source, low bias
  - External wire is labeled EXTERNAL SOURCE — not TENET5 verdict
  - Stated vs inferred never collapsed

Outputs:
  data/home_wire.json
  C:/PRISM/log/rss_home_wire_last.json

Usage:
  python tools/build_rss_home_wire.py
  python tools/build_rss_home_wire.py --scan   # run scanner first
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FEED = ROOT / "data" / "news_feed.json"
OUT = ROOT / "data" / "home_wire.json"
BRIEF = ROOT / "data" / "govt_daily_briefing.json"
PROOF = Path(r"C:\PRISM\log\rss_home_wire_last.json")
PROOF2 = ROOT / "data" / "rss_home_wire_last.json"

# Bias-guard: never promote pure opinion framing into TENET5 "verdict"
OPINION_MARKERS = re.compile(
    r"\b(must|should|outrage|scandalous|traitor|hero|destroyed canada|"
    r"liberal(s)? (are|is)|conservative(s)? (are|is)|woke|far[- ]right|"
    r"far[- ]left|globalist)\b",
    re.I,
)

# Prefer multi-domain balance
SOURCE_WEIGHT = {
    "CBC Politics": 1.0,
    "CTV Politics": 1.0,
    "Globe Politics": 1.0,
    "National Post": 1.0,
    "Parliament Bills": 1.2,
    "Reuters World": 1.1,
    "AP Top News": 1.1,
    "BBC World": 1.0,
    "Gov Canada News": 1.3,
}


def _utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_when(s: str) -> datetime | None:
    if not s:
        return None
    try:
        d = parsedate_to_datetime(s)
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        return d
    except Exception:
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00"))
            if d.tzinfo is None:
                d = d.replace(tzinfo=timezone.utc)
            return d
        except Exception:
            return None


def _horizon(age_s: float) -> str:
    if age_s < 3600:
        return "hour"
    if age_s < 86400:
        return "day"
    if age_s < 7 * 86400:
        return "week"
    if age_s < 31 * 86400:
        return "month"
    return "year"


def load_feed() -> dict:
    if FEED.is_file():
        try:
            return json.loads(FEED.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass
    return {"articles": []}


def build() -> dict:
    now = datetime.now(timezone.utc)
    feed = load_feed()
    arts = list(feed.get("articles") or [])
    wire: list[dict] = []
    seen_src: dict[str, int] = {}

    for a in arts:
        title = (a.get("title") or "").strip()
        link = (a.get("link") or "").strip()
        if not title or not link:
            continue
        if OPINION_MARKERS.search(title):
            # keep as external but flag high-rhetoric
            rhetoric = True
        else:
            rhetoric = False
        when = _parse_when(a.get("pub_date") or a.get("indexed_at") or "")
        age = (now - when).total_seconds() if when else 1e12
        src = a.get("source") or "External"
        # balance: max 3 per source in top wire
        if seen_src.get(src, 0) >= 3:
            continue
        score = int(a.get("relevance_score") or 0) * float(SOURCE_WEIGHT.get(src, 1.0))
        if rhetoric:
            score *= 0.55
        wire.append(
            {
                "id": a.get("id") or link,
                "type": "wire_external",
                "title": title,
                "summary": (a.get("description") or "")[:280],
                "source": src,
                "source_url": link,
                "date": (when or now).isoformat(),
                "horizon": _horizon(age),
                "age_s": int(age) if age < 1e11 else None,
                "relevance_score": int(a.get("relevance_score") or 0),
                "rank_score": score,
                "label": "EXTERNAL SOURCE",
                "epistemic": "reported",  # not TENET5 verified
                "rhetoric_flag": rhetoric,
                "matched_keywords": a.get("matched_keywords") or [],
            }
        )
        seen_src[src] = seen_src.get(src, 0) + 1

    wire.sort(key=lambda x: (-float(x.get("rank_score") or 0), x.get("date") or ""), reverse=False)
    wire.sort(key=lambda x: -float(x.get("rank_score") or 0))
    top = wire[:24]

    # Government briefing spine (TENET5 sheet — stated vs inferred)
    briefing_items = []
    if BRIEF.is_file():
        try:
            b = json.loads(BRIEF.read_text(encoding="utf-8"))
            for h in (b.get("happening_now") or [])[:6]:
                briefing_items.append(
                    {
                        "id": h.get("id"),
                        "type": "wire_tenet5",
                        "title": h.get("headline") or h.get("title") or "",
                        "summary": h.get("detail") or h.get("summary") or "",
                        "source": "TENET5 daily briefing",
                        "source_url": "daily-briefing.html",
                        "domain": h.get("domain"),
                        "label": "TENET5 · STATED/INFERRED LABELED",
                        "epistemic": "briefing",
                        "horizon": "day",
                    }
                )
        except (OSError, json.JSONDecodeError):
            pass

    by_h: dict[str, list] = {"hour": [], "day": [], "week": [], "month": [], "year": []}
    for w in top:
        by_h.setdefault(w["horizon"], []).append(w)

    doc = {
        "ts": _utc(),
        "doctrine": "objective_rss_home_wire",
        "bias_guard": {
            "opinion_rhetoric_downweighted": True,
            "max_per_source": 3,
            "external_label": "EXTERNAL SOURCE",
            "tenet5_label": "TENET5 · STATED/INFERRED LABELED",
            "rule": "RSS items are not TENET5 verdicts; multi-source + primary docs required for case claims",
        },
        "feed_last_scan": feed.get("last_scan"),
        "feed_total": len(arts),
        "wire": top,
        "briefing": briefing_items,
        "by_horizon": {k: v[:8] for k, v in by_h.items()},
        "ok": True,
        "verdict": "RSS_HOME_WIRE_OK" if top or briefing_items else "RSS_HOME_WIRE_EMPTY",
    }

    OUT.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    payload = json.dumps(doc, indent=2)
    for p in (PROOF, PROOF2):
        try:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(payload, encoding="utf-8")
        except OSError:
            pass
    return doc


def main() -> int:
    if "--scan" in sys.argv:
        try:
            sys.path.insert(0, str(ROOT / "tools"))
            import nemoclaw_news_scanner as scan  # noqa: WPS433

            scan.scan_all_feeds()
        except Exception as e:
            print(f"[warn] scan failed: {e}", file=sys.stderr)
    doc = build()
    print(
        json.dumps(
            {
                "verdict": doc["verdict"],
                "wire_n": len(doc.get("wire") or []),
                "briefing_n": len(doc.get("briefing") or []),
                "out": str(OUT),
            },
            indent=2,
        )
    )
    return 0 if doc.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
