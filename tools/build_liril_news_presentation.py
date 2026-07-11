#!/usr/bin/env python3
"""Build LIRIL front-page news presentation script from live data.

News-anchor style: explain TENET5, what happened today, how to read the desk.
Epistemic: TENET5 claims labeled; external RSS labeled EXTERNAL SOURCE.

Outputs:
  data/liril_news_presentation.json
  C:/PRISM/log/liril_news_presentation_last.json

Usage:
  python tools/build_liril_news_presentation.py
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRIEF = ROOT / "data" / "govt_daily_briefing.json"
WIRE = ROOT / "data" / "home_wire.json"
OUT = ROOT / "data" / "liril_news_presentation.json"
PROOF = Path(r"C:\PRISM\log\liril_news_presentation_last.json")


def _load(p: Path) -> dict:
    if not p.is_file():
        return {}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _clean(s: str, n: int = 220) -> str:
    s = " ".join((s or "").split())
    if len(s) <= n:
        return s
    return s[: n - 1].rsplit(" ", 1)[0] + "…"


def build() -> dict:
    brief = _load(BRIEF)
    wire = _load(WIRE)
    now = datetime.now(timezone.utc)
    date_lab = brief.get("date") or now.strftime("%Y-%m-%d")

    one = _clean(brief.get("one_line") or "The public record is open. Start at the briefing.")
    happening = list(brief.get("happening_now") or [])[:4]
    external = list(wire.get("wire") or [])[:4]
    threat = brief.get("threat_level") or "WATCH"

    segs: list[dict] = []

    # 1 — cold open: what is TENET5
    segs.append(
        {
            "id": "open",
            "role": "anchor_open",
            "scroll": "top",
            "wait_ms": 16000,
            "text": (
                "Good day. I am LIRIL, your guide on TENET5 — "
                "an independent Canadian investigative newsroom and government-analysis desk. "
                "We read the public record: statutes, Hansard, contracts, Health Canada tables, "
                "and multi-source wires. Every TENET5 claim is meant to open a source you can check. "
                "I am powered by LIRIL AI. You verify."
            ),
        }
    )

    # 2 — how the site works (time continuum)
    segs.append(
        {
            "id": "how",
            "role": "desk_tour",
            "scroll": "newsdesk",
            "wait_ms": 15000,
            "text": (
                "Here is how TENET5 is structured. Time is the spine. "
                "The submarine dial marks second, minute, hour, day, week, month, year, and era. "
                "Day is the news desk: daily briefing, investigations hub, five-act argument, and the MAID file. "
                "Hour is the live wire. Week holds active investigations. "
                "Month checks claims against documents. Year holds case files. "
                "Atmosphere film is memorial tone — not proof."
            ),
        }
    )

    # 3 — today's lead
    segs.append(
        {
            "id": "today_lead",
            "role": "bulletin",
            "scroll": "newsdesk",
            "wait_ms": 14000,
            "text": (
                f"Today is {date_lab}. Desk posture: {threat}. "
                f"Lead for this hour: {one}"
            ),
            "source": "TENET5 daily briefing",
        }
    )

    # 4 — happening now items (TENET5 labeled)
    for i, h in enumerate(happening):
        hl = _clean(h.get("headline") or "", 140)
        body = _clean(h.get("body") or "", 200)
        domain = h.get("domain") or "FILE"
        page = h.get("page") or "daily-briefing.html"
        segs.append(
            {
                "id": f"now_{i}",
                "role": "story",
                "scroll": "newsdesk" if i == 0 else "now",
                "wait_ms": 13000,
                "text": (
                    f"Active file, {domain}. {hl}. {body} "
                    f"Open the file at {page.replace('.html', '').replace('-', ' ')}. "
                    "This is TENET5 analysis against primary sources — not an external headline alone."
                ),
                "href": page,
                "label": "TENET5",
            }
        )

    # 5 — external wire (clearly labeled)
    if external:
        heads = "; ".join(_clean(x.get("title") or "", 90) for x in external[:3])
        segs.append(
            {
                "id": "rss_block",
                "role": "wire",
                "scroll": "now",
                "wait_ms": 14000,
                "text": (
                    "On the multi-source external wire — labeled external source, not a TENET5 verdict — "
                    f"recent intake includes: {heads}. "
                    "We surface these for situational awareness. TENET5 case claims still require primary documents."
                ),
                "label": "EXTERNAL SOURCE",
            }
        )

    # 6 — documentary / argument
    segs.append(
        {
            "id": "argument",
            "role": "package",
            "scroll": "doc-stage",
            "wait_ms": 12000,
            "text": (
                "The long package is the five-act argument under Rome Statute Article 6 — "
                "intent, killing fields, harm, conditions, coercion — filed from Canadian public records. "
                "Play the documentary stage for atmosphere, then walk each act for sources. "
                "Film is not evidence."
            ),
            "href": "argument.html",
        }
    )

    # 7 — how to use AI guide
    segs.append(
        {
            "id": "close",
            "role": "signoff",
            "scroll": "now",
            "wait_ms": 12000,
            "text": (
                "I will walk you down the time continuum: desk, hour wire, week investigations, "
                "month claim-check, year case files. Toggle Voice for narration. "
                "Bring skepticism. If a claim cannot open a source, do not accept it. "
                "This is TENET5 — Canadian public record, read with care. Powered by LIRIL AI."
            ),
        }
    )

    doc = {
        "ts": now.isoformat(),
        "doctrine": "liril_news_presentation",
        "date": date_lab,
        "threat_level": threat,
        "title": "TENET5 evening desk — LIRIL presentation",
        "one_line": one,
        "segments": segs,
        "segment_count": len(segs),
        "inputs": {
            "briefing": BRIEF.name if BRIEF.is_file() else None,
            "home_wire": WIRE.name if WIRE.is_file() else None,
            "happening_n": len(happening),
            "external_n": len(external),
        },
        "ok": True,
        "verdict": "LIRIL_NEWS_PRESENTATION_OK",
    }
    OUT.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    try:
        PROOF.parent.mkdir(parents=True, exist_ok=True)
        PROOF.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    except OSError:
        pass
    return doc


def main() -> int:
    doc = build()
    print(
        json.dumps(
            {
                "verdict": doc["verdict"],
                "segments": doc["segment_count"],
                "date": doc["date"],
                "out": str(OUT),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
