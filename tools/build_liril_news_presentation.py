#!/usr/bin/env python3
"""Build LIRIL front-page news presentation script from live data.

News-anchor style: explain TENET5, what happened today, AI desk articles, how to read the desk.
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
ARTS = ROOT / "data" / "liril_news_articles.json"
PERSONA = ROOT / "data" / "liril_reporter_persona.json"
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
    arts = _load(ARTS)
    persona = _load(PERSONA)
    now = datetime.now(timezone.utc)
    date_lab = brief.get("date") or arts.get("date") or now.strftime("%Y-%m-%d")

    one = _clean(
        brief.get("one_line")
        or arts.get("one_line")
        or "The public record is open. Start at the briefing."
    )
    happening = list(brief.get("happening_now") or [])[:4]
    external = list(wire.get("wire") or [])[:4]
    threat = brief.get("threat_level") or arts.get("threat_level") or "WATCH"
    articles = list(arts.get("articles") or [])
    features = [a for a in articles if a.get("type") == "feature"][:5]
    daily = next((a for a in features if a.get("is_daily_package")), features[0] if features else None)

    sign_on = (
        (persona.get("sign_on") or "")
        .replace("{greeting}", "Good day.")
        .replace("{powered_by}", persona.get("powered_by") or "Powered by LIRIL AI")
    )
    if not sign_on.strip():
        sign_on = (
            "Good day. I am LIRIL, desk reporter for TENET5 — an independent Canadian "
            "investigative newsroom and government-analysis desk. I read the public record "
            "as it moves. Powered by LIRIL AI. You verify."
        )

    segs: list[dict] = []

    # 1 — desk reporter sign-on (AI persona)
    segs.append(
        {
            "id": "open",
            "role": "anchor_open",
            "scroll": "top",
            "wait_ms": 17000,
            "text": sign_on,
            "persona": persona.get("public_name") or "LIRIL",
            "role_label": persona.get("role") or "Desk reporter",
        }
    )

    # 2 — how the site works (time continuum) — video product = news air
    segs.append(
        {
            "id": "how",
            "role": "desk_tour",
            "scroll": "news-air",
            "wait_ms": 16000,
            "video_id": "news-0",
            "text": (
                "Here is how the website is structured — time is the spine. "
                "The submarine dial marks second, minute, hour, day, week, month, year, and era. "
                "Day is the news desk: daily briefing, live news segments on air, investigations hub, "
                "five-act argument, and the MAID file. "
                "Hour is the live wire — TENET5 desk beside multi-source external RSS. "
                "Week holds active investigations. Month checks viral claims against documents. "
                "Year holds case files. Video on this page means news segments and live desk updates — "
                "not canned atmosphere loops."
            ),
        }
    )

    # 3 — today's lead bulletin → play lead segment
    segs.append(
        {
            "id": "today_lead",
            "role": "bulletin",
            "scroll": "news-air",
            "wait_ms": 14000,
            "video_id": "news-0",
            "text": (
                f"Today is {date_lab}. Desk posture: {threat}. "
                f"Lead for this hour: {one}"
            ),
            "source": "TENET5 daily briefing",
        }
    )

    # 4 — AI desk package (the news website article-gen product)
    if daily:
        segs.append(
            {
                "id": "ai_package",
                "role": "desk_package",
                "scroll": "news-air",
                "wait_ms": 15000,
                "video_id": "news-0",
                "text": (
                    "Our AI desk has published today's news package from the live briefing and wire. "
                    f"Open: { _clean(daily.get('title') or 'today desk package', 140) }. "
                    f"{_clean(daily.get('dek') or one, 160)} "
                    "Each article labels TENET5 analysis versus external sources. "
                    "No invented facts — only restructuring of cited inputs."
                ),
                "href": daily.get("href") or "daily-briefing.html",
                "label": "TENET5 · AI DESK",
            }
        )

    # 5 — rundown of AI features
    if len(features) > 1:
        rundown = "; ".join(
            _clean(a.get("title") or "", 70)
            for a in features[1:4]
            if a.get("title")
        )
        if rundown:
            segs.append(
                {
                    "id": "ai_rundown",
                    "role": "rundown",
                    "scroll": "week",
                    "wait_ms": 14000,
                    "text": (
                        "Also in today's AI desk rundown: "
                        f"{rundown}. "
                        "Those pieces sit under this week on the home continuum, "
                        "and as full story pages with source shelves."
                    ),
                    "label": "TENET5 · AI DESK",
                }
            )

    # 6 — happening now items (TENET5 labeled)
    for i, h in enumerate(happening):
        hl = _clean(h.get("headline") or "", 140)
        body = _clean(h.get("body") or "", 200)
        domain = h.get("domain") or "FILE"
        page = h.get("page") or "daily-briefing.html"
        segs.append(
            {
                "id": f"now_{i}",
                "role": "story",
                "scroll": "news-air",
                "wait_ms": 13000,
                "video_id": f"news-{min(i, 7)}",
                "text": (
                    f"Active file, {domain}. {hl}. {body} "
                    f"Open the file at {page.replace('.html', '').replace('-', ' ')}. "
                    "This is TENET5 analysis against primary sources — not an external headline alone."
                ),
                "href": page,
                "label": "TENET5",
            }
        )

    # 7 — external wire
    if external:
        heads = "; ".join(_clean(x.get("title") or "", 90) for x in external[:3])
        segs.append(
            {
                "id": "rss_block",
                "role": "wire",
                "scroll": "news-air",
                "wait_ms": 14000,
                "video_id": "news-1",
                "text": (
                    "On the multi-source external wire — labeled external source, not a TENET5 verdict — "
                    f"recent intake includes: {heads}. "
                    "We surface these for situational awareness. TENET5 case claims still require primary documents."
                ),
                "label": "EXTERNAL SOURCE",
            }
        )

    # 8 — case package stays on Argument (not home wallpaper)
    segs.append(
        {
            "id": "argument",
            "role": "package",
            "scroll": "news-air",
            "wait_ms": 12000,
            "text": (
                "The long case package is the five-act argument under Rome Statute Article 6 — "
                "intent, killing fields, harm, conditions, coercion — filed from Canadian public records. "
                "That film lives on Argument and the guided record — not as fake live wallpaper here. "
                "On this page, video means news segments. Open Argument when you want the case film."
            ),
            "href": "argument.html",
        }
    )

    # 9 — signoff
    segs.append(
        {
            "id": "close",
            "role": "signoff",
            "scroll": "news-air",
            "wait_ms": 12000,
            "text": (
                "That is today's presentation of the TENET5 news desk. "
                "Play the live segments, open the briefing, then walk the continuum: "
                "hour wire, week investigations, month claim-check, year case files. "
                "Toggle Voice for narration. Bring skepticism. If a claim cannot open a source, do not accept it. "
                "This is TENET5 — Canadian public record, read with care. Powered by LIRIL AI."
            ),
        }
    )

    doc = {
        "ts": now.isoformat(),
        "doctrine": "liril_news_presentation",
        "persona_id": persona.get("id") or "liril_desk_reporter",
        "persona_name": persona.get("public_name") or "LIRIL",
        "persona_role": persona.get("role") or "Desk reporter",
        "date": date_lab,
        "threat_level": threat,
        "title": f"TENET5 desk presentation — {date_lab}",
        "one_line": one,
        "segments": segs,
        "segment_count": len(segs),
        "articles": [
            {
                "title": a.get("title"),
                "href": a.get("href"),
                "type": a.get("type"),
                "epistemic": a.get("epistemic"),
                "is_daily_package": bool(a.get("is_daily_package")),
            }
            for a in articles[:8]
        ],
        "article_count": len(articles),
        "inputs": {
            "briefing": BRIEF.name if BRIEF.is_file() else None,
            "home_wire": WIRE.name if WIRE.is_file() else None,
            "articles": ARTS.name if ARTS.is_file() else None,
            "happening_n": len(happening),
            "external_n": len(external),
            "articles_n": len(articles),
        },
        "ok": True,
        "verdict": "LIRIL_NEWS_PRESENTATION_OK",
    }
    OUT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    try:
        PROOF.parent.mkdir(parents=True, exist_ok=True)
        PROOF.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
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
                "articles": doc.get("article_count", 0),
                "date": doc["date"],
                "out": str(OUT),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
