#!/usr/bin/env python3
"""AI desk article generator for TENET5 public newsroom.

Turns live briefing + multi-source wire into press posts (content/posts/*.json)
that press.py renders into story/*.html and homepage chapters.

Doctrine (OBJECTIVITY_NEWS_DOCTRINE.md):
  - Never invent facts. Only restructure STATED/INFERRED material from inputs.
  - Every post carries sources with URLs (or sample:true — blocked for desk gen).
  - EXTERNAL SOURCE wire is labeled; TENET5 analysis is labeled.
  - Powered by LIRIL AI — public brand only.

Outputs:
  content/posts/YYYY-MM-DD-desk-*.json   (AI desk package + file features)
  data/liril_news_articles.json          (catalog for LIRIL presentation)
  C:/PRISM/log/liril_news_articles_last.json

Media (required product floor — every article):
  After posts write, run:
    python tools/prism_news_article_media.py --json --apply
  → hero image + LIRIL-read mux video per post (see OBJECTIVITY_NEWS_DOCTRINE).

Usage:
  python tools/build_liril_news_articles.py
  python tools/build_liril_news_articles.py --max 6
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRIEF = ROOT / "data" / "govt_daily_briefing.json"
WIRE = ROOT / "data" / "home_wire.json"
POSTS = ROOT / "content" / "posts"
CATALOG = ROOT / "data" / "liril_news_articles.json"
PROOF = Path(r"C:\PRISM\log\liril_news_articles_last.json")


def _et_now() -> datetime:
    """Eastern time without requiring tzdata package (Windows-safe)."""
    try:
        from zoneinfo import ZoneInfo

        return datetime.now(ZoneInfo("America/Toronto"))
    except Exception:
        # Fixed EST/EDT approximation: UTC-4 (EDT). Dates still correct for desk package.
        return datetime.now(timezone(timedelta(hours=-4)))

# Desk posts owned by this builder (safe to overwrite on re-run)
DESK_PREFIX = "desk-"


def _load(p: Path) -> dict:
    if not p.is_file():
        return {}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _clean(s: str, n: int = 280) -> str:
    s = " ".join((s or "").split())
    if len(s) <= n:
        return s
    return s[: n - 1].rsplit(" ", 1)[0] + "…"


def _slugify(s: str, max_len: int = 48) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    if not s:
        s = "item"
    return s[:max_len].rstrip("-")


def _src_list(item: dict) -> list[dict]:
    out: list[dict] = []
    for s in item.get("sources") or []:
        if not isinstance(s, dict):
            continue
        url = (s.get("url") or "").strip()
        if not url:
            continue
        out.append({"label": s.get("label") or "Source", "url": url})
    page = (item.get("page") or "").strip()
    if page and not any(page in (x.get("url") or "") for x in out):
        # Internal file as secondary navigation source
        if not page.startswith("http"):
            out.append(
                {
                    "label": f"TENET5 file · {page.replace('.html', '')}",
                    "url": f"https://tenet-5.github.io/{page.lstrip('/')}",
                }
            )
        else:
            out.append({"label": "TENET5 file", "url": page})
    return out


def _desk_id(seed: str) -> str:
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()[:10]


def article_from_happening(item: dict, date: str, et_now: datetime, idx: int) -> dict | None:
    """TENET5 desk feature from a happening_now briefing row."""
    sources = _src_list(item)
    if not sources:
        return None
    headline = _clean(item.get("headline") or "", 160)
    body_src = _clean(item.get("body") or "", 900)
    domain = (item.get("domain") or "FILE").upper()
    status = item.get("status") or "ACTIVE"
    severity = item.get("severity") or "WATCH"
    page = (item.get("page") or "").replace(".html", "")
    slug = f"{DESK_PREFIX}{_slugify(domain)}-{_slugify(headline, 36)}"
    if len(slug) < 12:
        slug = f"{DESK_PREFIX}{_desk_id(headline + domain)}"

    # Epistemic framing — think-tank grade, no invention beyond input text
    known = (
        f"What is on the record for this file: {body_src}"
        if body_src
        else f"What is on the record: {headline}."
    )
    not_known = (
        "What this desk does not claim from this entry alone: "
        "a complete chain of criminal liability, private intent of any individual, "
        "or any fact not present in the cited primary or agency materials linked below."
    )
    method = (
        f"Label: TENET5 analysis ({status}, severity {severity}). "
        "Stated government or agency language is preferred over secondary paraphrase. "
        "External headlines on the hour wire are separate and marked EXTERNAL SOURCE."
    )
    next_step = (
        f"Open the live file for tables and source shelves"
        + (f" ({page})" if page else "")
        + ". If a number cannot be opened in a primary document, treat it as provisional."
    )

    hour = 9 + (idx % 8)
    date_iso = et_now.replace(hour=hour, minute=15 + idx * 3, second=0, microsecond=0).isoformat()

    return {
        "slug": slug,
        "type": "feature",
        "kicker": f"Desk · {domain}",
        "title": headline,
        "dek": _clean(
            f"{domain} desk · {date}. "
            f"{body_src[:160]}" + ("…" if len(body_src) > 160 else ""),
            220,
        ),
        "body": [known, not_known, method, next_step],
        "pull_quote": _clean(headline, 72),
        "date": date_iso,
        "sources": sources,
        "link": item.get("page") or None,
        "epistemic": "TENET5 · STATED/INFERRED LABELED",
        "ai_generated": True,
        "generator": "build_liril_news_articles.py",
        "briefing_id": item.get("id"),
        "domain": domain,
    }


def article_daily_package(brief: dict, wire_heads: list[str], et_now: datetime) -> dict:
    """One daily news package: what TENET5 is + what's going on today."""
    date = brief.get("date") or et_now.strftime("%Y-%m-%d")
    one = _clean(brief.get("one_line") or "The public record is open.", 280)
    threat = brief.get("threat_level") or "WATCH"
    happening = list(brief.get("happening_now") or [])[:6]

    lines = []
    for h in happening:
        hl = _clean(h.get("headline") or "", 120)
        dom = (h.get("domain") or "FILE").upper()
        if hl:
            lines.append(f"{dom}: {hl}")

    body = [
        (
            f"This is the TENET5 daily desk package for {date}. "
            "TENET5 is an independent Canadian investigative newsroom and government-analysis desk. "
            "We read statutes, Hansard, contracts, Health Canada tables, and multi-source wires. "
            "Powered by LIRIL AI. You verify every claim against a source you can open."
        ),
        (
            f"Desk posture today: {threat}. Lead line: {one}"
        ),
        (
            "Active files on this hour's board: "
            + ("; ".join(lines) if lines else "see the daily briefing for the live sheet.")
            + " Each file is TENET5 analysis against primary sources — not a social headline alone."
        ),
        (
            "On the multi-source external wire (labeled EXTERNAL SOURCE, not a TENET5 verdict): "
            + (
                "; ".join(wire_heads[:4])
                if wire_heads
                else "intake pending the next RSS scan."
            )
            + " Case claims still require primary documents."
        ),
        (
            "How to read the site: time is the spine. "
            "Day is the news desk (briefing, investigations, five-act argument, MAID file). "
            "Hour is the live wire. Week holds investigations. Month is claim versus record. "
            "Year holds case files. Atmosphere film is memorial tone — not proof. "
            "Open the homepage news air desk for LIRIL's full video presentation."
        ),
    ]

    sources = [
        {
            "label": "TENET5 daily briefing",
            "url": "https://tenet-5.github.io/daily-briefing.html",
        },
        {
            "label": "Investigations hub",
            "url": "https://tenet-5.github.io/investigations.html",
        },
        {
            "label": "Evidence shelf",
            "url": "https://tenet-5.github.io/evidence-index.html",
        },
    ]
    # Attach first primary source from each happening item
    for h in happening[:4]:
        for s in _src_list(h)[:1]:
            if s["url"] not in {x["url"] for x in sources}:
                sources.append(s)

    return {
        "slug": f"{DESK_PREFIX}today-{date}",
        "type": "feature",
        "kicker": "Desk · Daily package",
        "title": f"What is going on today — TENET5 desk package ({date})",
        "dek": one,
        "body": body,
        "pull_quote": _clean(f"Desk posture {threat}. Sources first.", 72),
        "date": et_now.replace(hour=8, minute=5, second=0, microsecond=0).isoformat(),
        "sources": sources,
        "link": "daily-briefing.html",
        "epistemic": "TENET5 · STATED/INFERRED LABELED",
        "ai_generated": True,
        "generator": "build_liril_news_articles.py",
        "is_daily_package": True,
        "threat_level": threat,
    }


def wire_context_note(item: dict, date: str, et_now: datetime, idx: int) -> dict | None:
    """Optional short wire context post — external labeled, no TENET5 verdict."""
    title = _clean(item.get("title") or "", 160)
    url = (item.get("source_url") or "").strip()
    if not title or not url:
        return None
    summary = _clean(item.get("summary") or "", 320)
    source = item.get("source") or "External outlet"
    slug = f"{DESK_PREFIX}wire-{_slugify(title, 40)}"
    hour = 14 + (idx % 6)
    date_iso = et_now.replace(hour=hour, minute=20 + idx, second=0, microsecond=0).isoformat()
    body = [
        (
            f"EXTERNAL SOURCE intake for situational awareness on {date}. "
            f"Outlet: {source}. This is not a TENET5 verdict."
        ),
        (
            f"Reported headline: {title}. "
            + (f"Outlet summary: {summary}" if summary else "Open the primary coverage for full context.")
        ),
        (
            "TENET5 case claims (investigations, MAID file, five-act argument) still require "
            "primary government or court documents. Use this wire item only to see what outlets are saying."
        ),
    ]
    return {
        "slug": slug,
        "type": "wire",
        "kicker": f"External · {source}",
        "title": title,
        "dek": _clean(summary or f"External reporting from {source} — not a TENET5 verdict.", 200),
        "date": date_iso,
        "sources": [{"label": f"{source} · original", "url": url}],
        "epistemic": "EXTERNAL SOURCE",
        "ai_generated": True,
        "generator": "build_liril_news_articles.py",
        "label": "EXTERNAL SOURCE",
    }


def purge_old_desk_posts(keep_filenames: set[str]) -> int:
    """Remove prior AI desk posts not in this run (idempotent refresh)."""
    n = 0
    if not POSTS.is_dir():
        return 0
    for f in POSTS.glob("*.json"):
        try:
            p = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not p.get("ai_generated"):
            continue
        if p.get("generator") != "build_liril_news_articles.py":
            continue
        slug = p.get("slug") or ""
        # Only delete desk-prefixed AI posts
        if not str(slug).startswith(DESK_PREFIX):
            continue
        if f.name in keep_filenames:
            continue
        try:
            f.unlink()
            n += 1
        except OSError:
            pass
    return n


def write_post(post: dict) -> Path:
    POSTS.mkdir(parents=True, exist_ok=True)
    date = (post.get("date") or "")[:10] or _et_now().strftime("%Y-%m-%d")
    path = POSTS / f"{date}-{post['slug']}.json"
    # Drop None link
    clean = {k: v for k, v in post.items() if v is not None}
    path.write_text(json.dumps(clean, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def build(max_features: int = 5, max_wire: int = 3) -> dict:
    brief = _load(BRIEF)
    wire = _load(WIRE)
    et_now = _et_now()
    date = brief.get("date") or et_now.strftime("%Y-%m-%d")
    external = list(wire.get("wire") or [])[:12]
    wire_heads = [_clean(x.get("title") or "", 90) for x in external if x.get("title")]

    posts: list[dict] = []
    # 1) Daily package always
    posts.append(article_daily_package(brief, wire_heads, et_now))

    # 2) Features from happening_now
    happening = list(brief.get("happening_now") or [])
    for i, h in enumerate(happening):
        if len([p for p in posts if p.get("type") == "feature"]) >= max_features + 1:
            break
        art = article_from_happening(h, date, et_now, i)
        if art:
            posts.append(art)

    # 3) A few external wire notes (labeled)
    w_count = 0
    for i, w in enumerate(external):
        if w_count >= max_wire:
            break
        note = wire_context_note(w, date, et_now, i)
        if note:
            posts.append(note)
            w_count += 1

    keep_filenames = set()
    for p in posts:
        d = (p.get("date") or "")[:10] or et_now.strftime("%Y-%m-%d")
        keep_filenames.add(f"{d}-{p['slug']}.json")

    purged = purge_old_desk_posts(keep_filenames)
    written: list[str] = []
    for p in posts:
        path = write_post(p)
        written.append(str(path.relative_to(ROOT)).replace("\\", "/"))

    catalog = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "doctrine": "liril_news_articles",
        "date": date,
        "threat_level": brief.get("threat_level") or "WATCH",
        "one_line": _clean(brief.get("one_line") or "", 280),
        "title": f"TENET5 AI desk package — {date}",
        "article_count": len(posts),
        "features": sum(1 for p in posts if p.get("type") == "feature"),
        "wire_notes": sum(1 for p in posts if p.get("type") == "wire"),
        "purged_stale": purged,
        "articles": [
            {
                "slug": p["slug"],
                "type": p["type"],
                "kicker": p.get("kicker"),
                "title": p["title"],
                "dek": p.get("dek"),
                "href": (
                    f"story/{p['slug']}.html"
                    if p.get("type") == "feature" and p.get("body")
                    else (p.get("sources") or [{}])[0].get("url")
                ),
                "epistemic": p.get("epistemic"),
                "is_daily_package": bool(p.get("is_daily_package")),
                "domain": p.get("domain"),
            }
            for p in posts
        ],
        "files": written,
        "ok": True,
        "verdict": "LIRIL_NEWS_ARTICLES_OK",
        "note": (
            "Deterministic AI restructuring of briefing + wire only — "
            "no invented facts. press.py build required to refresh story HTML."
        ),
    }

    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    CATALOG.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    try:
        PROOF.parent.mkdir(parents=True, exist_ok=True)
        PROOF.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    except OSError:
        pass
    return catalog


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--max", type=int, default=5, help="Max feature articles from happening_now")
    ap.add_argument("--max-wire", type=int, default=3, help="Max external wire notes")
    args = ap.parse_args()
    doc = build(max_features=max(1, args.max), max_wire=max(0, args.max_wire))
    print(
        json.dumps(
            {
                "verdict": doc["verdict"],
                "date": doc["date"],
                "articles": doc["article_count"],
                "features": doc["features"],
                "wire_notes": doc["wire_notes"],
                "catalog": str(CATALOG),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
