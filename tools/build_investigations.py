#!/usr/bin/env python3
"""Build investigations.html — curated long-form dossiers only.

Daniel 2026-07-12 IA fix:
  Site mixed MAID case + daily news + OSINT tools into one dump. This hub is
  ONLY long-form investigations, grouped by desk. News → news.html.
  The Case (five acts) → argument.html. Evidence → evidence-index.html.
"""
from __future__ import annotations

import html
import re
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"


def theme_ver() -> str:
    """Match apply_one_theme THEME_VER so hub rebuilds never drop Temple lock."""
    p = TOOLS / "apply_one_theme.py"
    if p.is_file():
        m = re.search(r'THEME_VER\s*=\s*["\'](\d+)["\']', p.read_text(encoding="utf-8", errors="replace"))
        if m:
            return m.group(1)
    return "240"

# Never list as an investigation (news products, chrome, tools, case hub pages)
SKIP = re.compile(
    r"^(index|404|auth-callback|archive-shell|chalkboard|campaign-generator|"
    r"search|test-|layout\.|gateway|permalink|sitemap|home|home-legacy|"
    r"liril-roadmap|liril-autonomous|investigations|master-index|"
    r"index_backup|index_legacy|index-legacy|news|live|newsletter|press-wire|"
    r"daily-briefing|information-architecture|about|legal|contact|contract|"
    r"methodology-transparency|faq|share|share-pack|experience|reading-order|"
    r"reading-path|kids-guide|one-pager|instagram|campaign-tracker|"
    r"osint-dashboard|data-science-dashboard|hansard-dashboard|"
    r"network-analysis|conspiracy-board|nepotism-detector|perception|"
    r"liril-film|argument|argument-sources|argument-transcript|"
    r"act-i|act-ii|act-iii|act-iv|act-v|complete-thesis|elements-analysis|"
    r"evidence-index|evidence$|auth)",
    re.I,
)

# Investigation desks — first match wins
CATS = [
    ("MAID & healthcare", r"maid|euthan|assisted dying|carter|foley|palliat|healthcare|doctor-shortage|disability|mental-health|pharmacare|dental|long-term-care|camap|brookfield-maid"),
    ("Procurement & waste", r"procurement|arrivecan|griffon|contract|waste|mckinsey|consult|phoenix|payroll|vendor|boondoggle|dnd-procurement|federal-contract"),
    ("Military & veterans", r"cfnis|military|veteran|ppcli|defence|forces|mpcc|submarine|arms-export|caf-|cds-|kit.shop"),
    ("Foreign interference", r"foreign-interfer|foreign-influ|hogue|nsicop|bill-c70|confucius|arms-pipeline|china|beijing"),
    ("Money & capture", r"lobby|brookfield|donation|charity|aga.khan|financial-crime|banking|corporate-welfare|nepotism|appointments|conflict-of-interest|engo-funding"),
    ("Media & information", r"\bcbc\b|media-capture|media-concentration|5gw|social.amplif|narrative|psyop|cbc-"),
    ("Parliament & oversight", r"hansard|parliament|voting|committee|auditor|accountab|ethics|ombuds|scorecard|mp-|legislation|bill-c"),
    ("Cities & provinces", r"municipal|calgary|toronto|ottawa|vancouver|belleville|housing|homeless|boil-water|indigenous"),
]

# Flagship rows always featured even if regex misses
FLAGSHIP = [
    ("maid-accountability.html", "MAID accountability — numbers and policy"),
    ("griffon-glle-procurement.html", "Griffon GLLE — $800M pause"),
    ("foreign-interference.html", "Foreign interference — public record"),
    ("arrivecan.html", "ArriveCAN — procurement pattern"),
    ("cbc-5gw-media-vector.html", "CBC media vector dossier"),
    ("lobbying-deepdive.html", "Lobbying pipeline"),
    ("canada-map.html", "Municipal failures — national map"),
    ("dnd-procurement.html", "DND procurement velocity"),
    ("genocide-evidence.html", "Genocide evidence shelf (case file)"),
    ("phoenix-pay.html", "Phoenix pay — waste pattern"),
]

_BOILER = re.compile(
    r"TENET5 is an investigative newsroom|"
    r"Investigative coverage of|"
    r"primary sources, statutes, and on-the-record|"
    r"Public-record file on TENET5|"
    r"Canada public record\s*$|"
    r"Primary sources on the page|"
    r"Powered by LIRIL AI\s*$|"
    r"AI desk package",
    re.I,
)


def _clean_desc(t: str) -> str:
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"&amp;", "&", t)
    t = re.sub(r"&#x27;|&#39;", "'", t)
    if not t or _BOILER.search(t):
        return ""
    if len(t) < 40:
        return ""
    return t[:160].rstrip(" .") + ("…" if len(t) > 160 else "")


def page_desc(s: str) -> str:
    for cls in ("stand", "lede", "dek", "newsdesk-lede", "pres-lede", "deck"):
        m = re.search(
            rf'<p[^>]*class="[^"]*\b{cls}\b[^"]*"[^>]*>(.*?)</p>',
            s,
            re.I | re.S,
        )
        if m:
            t = _clean_desc(re.sub(r"<[^>]+>", "", m.group(1)))
            if t:
                return t
    body = s
    bm = re.search(r"<main\b[^>]*>(.*)</main>", s, re.I | re.S)
    if bm:
        body = bm.group(1)
    for pm in re.finditer(r"<p\b[^>]*>(.*?)</p>", body, re.I | re.S):
        t = _clean_desc(re.sub(r"<[^>]+>", "", pm.group(1)))
        if t and len(t) >= 50:
            return t
    return ""


def page_quality(path: Path, s: str, desc: str) -> bool:
    """Investigations hub only lists pages that can support analysis."""
    if not desc:
        return False
    # Prefer press-file / report structure
    if "press-file" in s or "file-hero" in s or 'class="report"' in s:
        return True
    # Or substantial main
    main_m = re.search(r"<main\b[^>]*>(.*)</main>", s, re.I | re.S)
    if not main_m:
        return False
    plain = re.sub(r"<[^>]+>", " ", main_m.group(1))
    plain = re.sub(r"\s+", " ", plain).strip()
    return len(plain) >= 900


def collect() -> dict[str, tuple[str, str, bool]]:
    """name -> (title, desc, quality_ok)"""
    out: dict[str, tuple[str, str, bool]] = {}
    for p in sorted(glob.glob(str(ROOT / "*.html"))):
        name = Path(p).name
        stem = name.replace(".html", "")
        if SKIP.match(stem) or SKIP.match(name):
            continue
        s = Path(p).read_text(encoding="utf-8", errors="replace")
        m = re.search(r"<title>(.*?)</title>", s, re.S)
        if not m:
            continue
        title = re.sub(r"\s*\|\s*TENET5\s*$", "", m.group(1).strip())
        if not title:
            continue
        desc = page_desc(s)
        ok = page_quality(Path(p), s, desc)
        out[name] = (title, desc, ok)
    return out


def bucket(pages: dict[str, tuple[str, str, bool]]):
    """Only quality_ok pages go on desk shelves."""
    seen: set[str] = set()
    groups = [(c, []) for c, _ in CATS]
    gmap = {c: lst for c, lst in groups}
    for name, (title, desc, ok) in sorted(pages.items(), key=lambda x: x[1][0].upper()):
        if not ok:
            continue
        blob = name + " " + title
        for c, rx in CATS:
            if re.search(rx, blob, re.I):
                gmap[c].append((name, title, desc))
                seen.add(name)
                break
    further = sorted(
        [
            (n, t, d)
            for n, (t, d, ok) in pages.items()
            if ok and n not in seen
        ],
        key=lambda x: x[1].upper(),
    )
    thin = sum(1 for _, (_, _, ok) in pages.items() if not ok)
    return groups, further, thin


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def section(cid: str, kicker: str, items: list[tuple[str, str, str]], limit: int | None = None) -> str:
    show = items if limit is None else items[:limit]
    cards = []
    for name, title, desc in show:
        cards.append(
            f'<a class="cat-item glass" href="{esc(name)}">'
            f'<span class="t">{esc(title)}</span>'
            + (
                f'<span class="d">{esc(desc)}</span>'
                if desc
                else '<span class="d">Open the file — primary sources on the page.</span>'
            )
            + "</a>"
        )
    more = ""
    if limit and len(items) > limit:
        more = f'<p class="cat-more">{len(items) - limit} more on this desk · open a file above to continue.</p>'
    return (
        f'<section class="catalog" id="{esc(cid)}">\n'
        f'<span class="kick section-num">{esc(kicker)}</span>'
        f'<span class="kick-meta"> · {len(items)} files</span>\n'
        f'<div class="cat-group">{"".join(cards)}</div>\n'
        f"{more}</section>"
    )


def build() -> int:
    pages = collect()
    groups, further, thin = bucket(pages)
    quality_n = sum(1 for _, (_, _, ok) in pages.items() if ok)
    total_scanned = len(pages)

    flag_cards = []
    for href, label in FLAGSHIP:
        p = ROOT / href
        if not p.is_file():
            continue
        title, desc, _ = pages.get(href, (label, "", True))
        flag_cards.append(
            f'<a class="enter-card glass" href="{esc(href)}">'
            f'<span class="kick">Flagship</span>'
            f"<h3>{esc(title)}</h3>"
            f'<p>{esc(desc or label)}</p>'
            f"<span class=\"media-more\">Open file →</span></a>"
        )

    desk_nav_bits = []
    secs = []
    for c, items in groups:
        if not items:
            continue
        cid = re.sub(r"[^a-z0-9]+", "-", c.lower()).strip("-")
        desk_nav_bits.append(
            f'<a href="#{esc(cid)}">{esc(c)}'
            f'<span class="nr-count">{len(items)}</span></a>'
        )
        secs.append(section(cid, c, items, limit=24))
    if further:
        desk_nav_bits.append(
            f'<a href="#further">Further'
            f'<span class="nr-count">{len(further)}</span></a>'
        )
        secs.append(section("further", "Further dossiers", further, limit=36))

    ver = theme_ver()
    body = f"""<!doctype html>
<html lang="en-CA" data-press="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Investigations — Long-form dossiers | TENET5</title>
<meta name="description" content="Long-form investigations only — MAID, procurement, interference, parliament. Not daily news. Not the five-act case film. Primary sources on each file.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/press-theme.css?v={ver}">
<link rel="stylesheet" href="css/design-lock.css?v={ver}">
</head>
<body class="press-interior" data-presentation="research" data-desk="hub" data-lane="investigations" data-template="hub.lane">
<header class="press-bar" role="banner"></header>
<main class="press-main press-file">
<header class="press-hero file-hero">
  <div class="file-meta-row">
    <span class="kick section-num">Lane · Investigations</span>
    <span class="file-status">Long-form only</span>
    <span class="file-status">Primary sources</span>
  </div>
  <h1>Investigations</h1>
  <p class="stand">
    This room is for <strong>finished and active dossiers</strong> — tables, figures, and cites you can open.
    It is <em>not</em> the daily news desk, and it is <em>not</em> the original five-act case film.
    Those live in their own lanes so you can analyze without the pile-up.
  </p>
  <div class="file-rail" role="list" aria-label="Other lanes">
    <a class="file-pill" href="news.html" role="listitem">News desk →</a>
    <a class="file-pill" href="daily-briefing.html" role="listitem">Today's briefing →</a>
    <a class="file-pill" href="argument.html" role="listitem">The Case (five acts) →</a>
    <a class="file-pill" href="evidence-index.html" role="listitem">Evidence shelf →</a>
    <a class="file-pill" href="information-architecture.html" role="listitem">How the site is organized →</a>
  </div>
</header>

<div class="nr-metrics" role="group" aria-label="Investigations scale">
  <div class="nr-metric glass">
    <span class="v">{quality_n}</span>
    <span class="l">Dossiers on shelves</span>
    <span class="n">Quality-filtered long-form files</span>
  </div>
  <div class="nr-metric glass">
    <span class="v">{sum(1 for _, it in groups if it)}</span>
    <span class="l">Subject desks</span>
    <span class="n">Enter by theme, not alphabet soup</span>
  </div>
  <div class="nr-metric glass">
    <span class="v">{thin}</span>
    <span class="l">Held back</span>
    <span class="n">Thin or tool pages not mixed in here</span>
  </div>
  <div class="nr-metric glass">
    <span class="v">{total_scanned}</span>
    <span class="l">Scanned</span>
    <span class="n">Root HTML candidates this build</span>
  </div>
</div>

<section class="catalog" id="how-to-read" aria-labelledby="how-h">
  <span class="kick section-num">How to read</span>
  <h2 id="how-h">Three questions before you open a <em>file.</em></h2>
  <div class="nr-metrics" style="grid-template-columns:repeat(3,minmax(0,1fr))">
    <div class="nr-metric glass">
      <span class="l">1 · What is this?</span>
      <span class="n">Investigation = deep dossier. News = what moved today. Case = Article 6 acts.</span>
    </div>
    <div class="nr-metric glass">
      <span class="l">2 · What is on the record?</span>
      <span class="n">Prefer tables and linked primaries. Labels STATED / INFERRED stay on the page.</span>
    </div>
    <div class="nr-metric glass">
      <span class="l">3 · What is not claimed?</span>
      <span class="n">A file is not a conviction. Open the source. You verify.</span>
    </div>
  </div>
</section>

<section class="catalog" id="flagship" aria-labelledby="flag-h">
  <span class="kick section-num">Start here</span>
  <h2 id="flag-h">Flagship files</h2>
  <p class="stand" style="margin-top:0.5em;max-width:62ch">
    Highest-signal dossiers. If you only open ten pages, start with these — then walk a desk.
  </p>
  <div class="enter-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;margin-top:1.2rem">
    {"".join(flag_cards)}
  </div>
</section>

<nav class="nr-desk-strip" aria-label="Jump to desk">{"".join(desk_nav_bits)}</nav>

{"".join(secs)}

<section class="catalog" id="not-here">
  <span class="kick section-num">Elsewhere on TENET5</span>
  <h2>Not mixed into this <em>hub.</em></h2>
  <div class="cat-group">
    <a class="cat-item glass" href="news.html"><span class="t">News desk</span><span class="d">LIVE station, press wire, newsletter, day desk packages — time-sensitive, not dossiers.</span></a>
    <a class="cat-item glass" href="argument.html"><span class="t">The Case · five acts</span><span class="d">Original MAID / Article 6 argument. Cinema stages and elements analysis.</span></a>
    <a class="cat-item glass" href="evidence-index.html"><span class="t">Evidence shelf</span><span class="d">Primary sources and datasets without the narrative wrapper.</span></a>
    <a class="cat-item glass" href="daily-briefing.html"><span class="t">Daily briefing</span><span class="d">What Ottawa is doing now — stated vs inferred, cited.</span></a>
  </div>
</section>
</main>
<footer class="press-foot" role="contentinfo"></footer>
</body>
</html>
"""
    (ROOT / "investigations.html").write_text(body, encoding="utf-8", newline="\n")
    print(
        f"[investigations] scanned={total_scanned} quality={quality_n} "
        f"further={len(further)} thin_held={thin} desks={sum(1 for _, it in groups if it)} "
        f"theme_ver={ver}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(build())
