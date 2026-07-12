#!/usr/bin/env python3
"""Build news.html — time-sensitive desk hub (NOT investigations).

Daniel 2026-07-12 IA: News lane holds LIVE, wire, newsletter, desk packages.
Investigations and The Case stay separate.
"""
from __future__ import annotations

import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "content" / "posts"
STORY = ROOT / "story"
TOOLS = ROOT / "tools"


def theme_ver() -> str:
    """Match apply_one_theme THEME_VER so hub rebuilds never drop Temple lock."""
    p = TOOLS / "apply_one_theme.py"
    if p.is_file():
        m = re.search(r'THEME_VER\s*=\s*["\'](\d+)["\']', p.read_text(encoding="utf-8", errors="replace"))
        if m:
            return m.group(1)
    return "240"


def esc(s: str) -> str:
    return html.escape(s or "", quote=True)


def load_posts(limit: int = 24) -> list[dict]:
    items: list[dict] = []
    if not POSTS.is_dir():
        return items
    for p in sorted(POSTS.glob("*.json"), reverse=True):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(d, dict) or not d.get("title"):
            continue
        slug = d.get("slug") or p.stem
        href = f"story/{slug}.html" if (STORY / f"{slug}.html").is_file() else ""
        if not href:
            # try desk- prefix patterns
            for cand in STORY.glob(f"*{slug}*.html"):
                href = f"story/{cand.name}"
                break
        items.append(
            {
                "title": d.get("title") or slug,
                "dek": d.get("dek") or "",
                "kicker": d.get("kicker") or "Desk",
                "href": href or "daily-briefing.html",
                "date": (d.get("date") or "")[:10],
                "domain": d.get("domain") or "",
            }
        )
        if len(items) >= limit:
            break
    return items


def build() -> int:
    posts = load_posts()
    cards = []
    for it in posts:
        cards.append(
            f'<a class="cat-item glass" href="{esc(it["href"])}">'
            f'<span class="t">{esc(it["title"])}</span>'
            f'<span class="d">{esc(it["kicker"])}'
            + (f' · {esc(it["date"])}' if it["date"] else "")
            + (f' — {esc(it["dek"][:140])}' if it["dek"] else "")
            + "</span></a>"
        )
    if not cards:
        cards.append(
            '<a class="cat-item glass" href="daily-briefing.html">'
            '<span class="t">Open today\'s briefing</span>'
            '<span class="d">Desk packages rebuild from the live sheet.</span></a>'
        )

    ver = theme_ver()
    body = f"""<!doctype html>
<html lang="en-CA" data-press="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>News desk — Today on the record | TENET5</title>
<meta name="description" content="TENET5 news desk: daily briefing, LIVE station, press wire, and day packages. Time-sensitive. Not long-form investigations. Primary sources linked.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/press-theme.css?v={ver}">
<link rel="stylesheet" href="css/design-lock.css?v={ver}">
</head>
<body class="press-interior" data-presentation="media" data-desk="hub" data-lane="news" data-template="hub.lane">
<header class="press-bar" role="banner"></header>
<main class="press-main press-file">
<header class="press-hero file-hero">
  <div class="file-meta-row">
    <span class="kick section-num">Lane · News</span>
    <span class="file-status">Time-sensitive</span>
    <span class="file-status">Labeled sources</span>
  </div>
  <h1>News desk</h1>
  <p class="stand">
    What is moving <strong>today</strong>. Briefing, LIVE station, multi-outlet wire, and desk packages.
    These pages are for the hour and the day — they are <em>not</em> long-form investigations
    and they are <em>not</em> the five-act case. External wire rows are labeled EXTERNAL SOURCE.
  </p>
  <div class="file-rail" role="list" aria-label="News products">
    <a class="file-pill" href="daily-briefing.html" role="listitem">Daily briefing →</a>
    <a class="file-pill" href="live.html" role="listitem">LIVE station →</a>
    <a class="file-pill" href="press-wire.html" role="listitem">Press wire →</a>
    <a class="file-pill" href="newsletter.html" role="listitem">Newsletter →</a>
    <a class="file-pill" href="investigations.html" role="listitem">Investigations →</a>
    <a class="file-pill" href="argument.html" role="listitem">The Case →</a>
  </div>
</header>

<div class="nr-metrics" role="group" aria-label="News products">
  <a class="nr-metric glass" href="daily-briefing.html" style="text-decoration:none;color:inherit">
    <span class="v">Today</span>
    <span class="l">Briefing</span>
    <span class="n">Stated vs inferred · cited</span>
  </a>
  <a class="nr-metric glass" href="live.html" style="text-decoration:none;color:inherit">
    <span class="v">LIVE</span>
    <span class="l">Station</span>
    <span class="n">Desk segments · wall-clock</span>
  </a>
  <a class="nr-metric glass" href="press-wire.html" style="text-decoration:none;color:inherit">
    <span class="v">Wire</span>
    <span class="l">Outlets</span>
    <span class="n">Same story, different framing</span>
  </a>
  <a class="nr-metric glass" href="newsletter.html" style="text-decoration:none;color:inherit">
    <span class="v">Inbox</span>
    <span class="l">Newsletter</span>
    <span class="n">Substack editions · sources on TENET5</span>
  </a>
</div>

<section class="catalog" id="how-news" aria-labelledby="how-news-h">
  <span class="kick section-num">How to use this lane</span>
  <h2 id="how-news-h">News is for the <em>clock.</em> Investigations are for the <em>file.</em></h2>
  <p class="stand" style="max-width:68ch">
    Start with the briefing for what Ottawa is doing now. Use LIVE for segment video.
    Use the wire to compare outlets. When a story needs depth, jump to the investigation
    or case file linked on the package — do not treat a day package as a finished dossier.
  </p>
</section>

<section class="catalog" id="desk-packages">
  <span class="kick section-num">Desk packages</span>
  <h2>Recent day files</h2>
  <p class="stand" style="margin-top:0.5em;max-width:62ch">
    Short packages from the live sheet. Each one states what is on the record,
    what is not claimed, and links sources. Open the linked investigation for depth.
  </p>
  <div class="cat-group">{"".join(cards)}</div>
</section>

<section class="catalog" id="elsewhere">
  <span class="kick section-num">Elsewhere</span>
  <div class="cat-group">
    <a class="cat-item glass" href="investigations.html"><span class="t">Investigations hub</span><span class="d">Long-form dossiers by subject desk.</span></a>
    <a class="cat-item glass" href="argument.html"><span class="t">The Case · five acts</span><span class="d">Original Article 6 / MAID argument.</span></a>
    <a class="cat-item glass" href="evidence-index.html"><span class="t">Evidence shelf</span><span class="d">Primary sources without narrative.</span></a>
    <a class="cat-item glass" href="information-architecture.html"><span class="t">Site map for readers</span><span class="d">How TENET5 is organized after the MAID → full-record expansion.</span></a>
  </div>
</section>
</main>
<footer class="press-foot" role="contentinfo"></footer>
</body>
</html>
"""
    (ROOT / "news.html").write_text(body, encoding="utf-8", newline="\n")
    proof = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "job": "build_news_hub",
        "posts": len(posts),
        "theme_ver": ver,
        "ok": True,
        "verdict": "NEWS_HUB_BUILT",
    }
    try:
        (ROOT / "data" / "news_hub_last.json").write_text(
            json.dumps(proof, indent=2), encoding="utf-8"
        )
    except OSError:
        pass
    print(f"[news-hub] posts={len(posts)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(build())
