#!/usr/bin/env python3
"""Build investigations.html — the categorized hub over every content page.

The homepage catalog is A-Z only; this groups the whole record by theme so
readers can enter by subject (MAID, Foreign Interference, Procurement, ...).
Auto-generated from each page's own <title> + description, rebuilt per run,
then apply_one_theme.py stamps the canonical nav/footer/theme.
"""
from __future__ import annotations
import re, glob, html
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP = re.compile(
    r"^(index|404|auth-callback|archive-shell|chalkboard|campaign-generator|"
    r"search|test-|layout\.|gateway|permalink|sitemap|home|home-legacy|"
    r"liril-roadmap|liril-autonomous|investigations|master-index|"
    r"index_backup|index_legacy|index-legacy)", re.I)

# Ordered: first match wins, so put specific themes before broad ones.
CATS = [
    ("MAID & Euthanasia", r"maid|euthan|assisted dying|carter|foley|palliat"),
    ("Foreign Interference", r"foreign|interference|china|beijing|\bprc\b|hogue|nsicop|cija|arms pipeline|convoy"),
    ("Military, Veterans & CFNIS", r"cfnis|military|veteran|ppcli|defence|\bforces\b|mpcc|rcmp|kit shop|submarine|arms export"),
    ("Procurement & Waste", r"procurement|arrivecan|contract|waste|mckinsey|consult|phoenix|payroll|vendor|boondoggle"),
    ("Foreign Influence & Money", r"brookfield|donation|charity|aga khan|financial|banking"),
    ("Media & Information Operations", r"\bcbc\b|media|5gw|social amplif|narrative|psyop|radio-canada"),
    ("Legal, Charter & Genocide", r"charter|criminal code|genocide|rome statute|law societ|human rights|article [0-9]|prosecut"),
    ("Parliament & Accountability", r"hansard|parliament|\bmp\b|voting|committee|auditor|\bag\b|accountab|ethics|lobby|appointment|scorecard|ombuds"),
]


_BOILER = re.compile(
    r"TENET5 is an investigative newsroom|"
    r"Investigative coverage of|"
    r"primary sources, statutes, and on-the-record|"
    r"TENET5 newsroom\s*[·.]|"
    r"Powered by LIRIL AI\s*$",
    re.I,
)


def _clean_desc(t: str) -> str:
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"&amp;", "&", t)
    t = re.sub(r"&#x27;|&#39;", "'", t)
    if not t or _BOILER.search(t):
        return ""
    if len(t) < 28:
        return ""
    return t[:140].rstrip(" .") + ("…" if len(t) > 140 else "")


def page_desc(s: str) -> str:
    """Prefer real page lede over SEO meta spam (Daniel: investigations hub was garbage)."""
    # 1) First standfirst / lede / stand paragraph in body
    for cls in ("stand", "lede", "newsdesk-lede", "pres-lede", "deck"):
        m = re.search(
            rf'<p[^>]*class="[^"]*\b{cls}\b[^"]*"[^>]*>(.*?)</p>',
            s, re.I | re.S,
        )
        if m:
            t = _clean_desc(re.sub(r"<[^>]+>", "", m.group(1)))
            if t:
                return t
    # 2) First substantial body paragraph (skip nav/chrome)
    body = s
    bm = re.search(r"<main\b[^>]*>(.*)</main>", s, re.I | re.S)
    if bm:
        body = bm.group(1)
    for pm in re.finditer(r"<p\b[^>]*>(.*?)</p>", body, re.I | re.S):
        t = _clean_desc(re.sub(r"<[^>]+>", "", pm.group(1)))
        if t and len(t) >= 40:
            return t
    # 3) Meta description only if not SEO boiler
    dm = re.search(r'name="description"\s+content="([^"]*)"', s, re.I)
    if dm:
        t = _clean_desc(dm.group(1))
        if t:
            return t
    return ""


def collect() -> dict[str, tuple[str, str]]:
    out = {}
    for p in sorted(glob.glob(str(ROOT / "*.html"))):
        name = Path(p).name
        if SKIP.match(name):
            continue
        s = Path(p).read_text(encoding="utf-8", errors="replace")
        m = re.search(r"<title>(.*?)</title>", s, re.S)
        if not m:
            continue
        title = re.sub(r"\s*\|\s*TENET5\s*$", "", m.group(1).strip())
        if not title:
            continue
        out[name] = (title, page_desc(s))
    return out


def bucket(pages: dict[str, tuple[str, str]]):
    seen, groups = set(), [(c, []) for c, _ in CATS]
    gmap = {c: lst for c, lst in groups}
    for name, (title, desc) in sorted(pages.items(), key=lambda x: x[1][0].upper()):
        for c, rx in CATS:
            if re.search(rx, name + " " + title, re.I):
                gmap[c].append((name, title, desc))
                seen.add(name)
                break
    other = sorted(
        [(n, t, d) for n, (t, d) in pages.items() if n not in seen],
        key=lambda x: x[1].upper())
    return groups, other


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def section(cid: str, kicker: str, items: list[tuple[str, str, str]]) -> str:
    cards = []
    for name, title, desc in items:
        narr = f"{title}. {desc}" if desc else title
        cards.append(
            f'<a class="cat-item glass" href="{esc(name)}" '
            f'data-narrate="{esc(narr)}">'
            f'<span class="t">{esc(title)}</span>'
            + (f'<span class="d">{esc(desc)}</span>' if desc else
               f'<span class="d">Open the file · primary sources on the page.</span>')
            + "</a>")
    return (
        f'<section class="catalog" id="{cid}">\n'
        f'<span class="kick section-num">{esc(kicker)}</span>'
        f'<span class="kick-meta"> · {len(items)} files</span>\n'
        f'<div class="cat-group">{"".join(cards)}</div>\n</section>')


def build() -> int:
    pages = collect()
    groups, other = bucket(pages)
    total = len(pages)
    secs = []
    for c, items in groups:
        if items:
            cid = re.sub(r"[^a-z0-9]+", "-", c.lower()).strip("-")
            secs.append(section(cid, c, items))
    if other:
        secs.append(section("other", "Further Investigations", other))
    acts_board = """
<section class="act-gallery" id="five-acts" aria-labelledby="inv-acts-h"
         data-line="The five-act genocide argument — cinema stages with primary sources.">
  <span class="kick">The argument · cinema stages</span>
  <h2 id="inv-acts-h">Five acts before the <em>shelf.</em></h2>
  <p class="stand" style="margin-top:0.6em;max-width:62ch">
    Genocide by policy, act by act under Article 6. LTX atmosphere and charts on each stage;
    Hansard, coroner files, and Health Canada are the proof.
  </p>
  <div class="media-grid media-grid-3" role="list">
    <a class="media-card glass is-cine" href="act-i.html" role="listitem">
      <div class="media-frame is-cine">
        <video muted loop playsinline preload="auto" poster="media/landing/parliament_ice.jpg" data-act-cine aria-hidden="true">
          <source src="media/film/hall_of_record.mp4" type="video/mp4">
        </video>
        <span class="media-tag">ACT I</span>
      </div>
      <div class="media-body">
        <span class="kick">Intent</span>
        <h3>Intent to Destroy</h3>
        <p>Bill C-7 · Article 6(a)</p>
        <span class="media-more">Stage →</span>
      </div>
    </a>
    <a class="media-card glass is-cine" href="act-ii.html" role="listitem">
      <div class="media-frame is-cine">
        <video muted loop playsinline preload="auto" poster="media/landing/hospital_corridor.jpg" data-act-cine aria-hidden="true">
          <source src="media/film/corridor_power.mp4" type="video/mp4">
        </video>
        <span class="media-tag">ACT II</span>
      </div>
      <div class="media-body">
        <span class="kick">Killing</span>
        <h3>The Killing Fields</h3>
        <p>Track 2 · coroner record</p>
        <span class="media-more">Stage →</span>
      </div>
    </a>
    <a class="media-card glass is-cine" href="argument.html" role="listitem">
      <div class="media-frame is-cine">
        <video muted loop playsinline preload="auto" poster="media/landing/ledger_desk.jpg" data-act-cine aria-hidden="true">
          <source src="media/film/flag_wind.mp4" type="video/mp4">
        </video>
        <span class="media-tag">HUB · III–V</span>
      </div>
      <div class="media-body">
        <span class="kick">Full case</span>
        <h3>Five-act board</h3>
        <p>Harm · conditions · coercion</p>
        <span class="media-more">Open hub →</span>
      </div>
    </a>
  </div>
  <p style="margin-top:1.2em">
    <a class="media-more" href="argument.html">Argument hub →</a>
    <a class="media-more" href="elements-analysis.html" style="margin-left:1.2em">Elements →</a>
    <a class="media-more" href="demographic-trajectory.html" style="margin-left:1.2em">Charts →</a>
  </p>
</section>
<script src="js/tenet5-cinema-play.js?v=1"></script>
"""
    body = f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Investigations — The Complete Record | TENET5</title>
<meta name="description" content="Every investigation on TENET5, grouped by subject: MAID, foreign interference, procurement, military accountability, and the parliamentary record.">
</head>
<body>
<main class="press-main">
<span class="hero-tag">The Record · By Subject</span>
<h1>Investigations</h1>
<p class="hero-sub">Every file on TENET5 — {total} investigations, editorials, dossiers and
datasets — grouped by subject. Each entry is a sourced page. LIRIL can read any of them to you.
For the full A-to-Z, see <a href="index.html">the whole book</a>.</p>
{acts_board}
{"".join(secs)}
</main>
</body>
</html>
"""
    (ROOT / "investigations.html").write_text(body, encoding="utf-8", newline="\n")
    named = sum(len(items) for _, items in groups)
    print(f"[investigations] {total} pages · {named} themed · {len(other)} further")
    return 0


if __name__ == "__main__":
    raise SystemExit(build())
