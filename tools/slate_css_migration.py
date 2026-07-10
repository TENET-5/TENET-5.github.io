#!/usr/bin/env python3
"""Apply PRESS theme (screenshot) to whole site; protect press homepage body.

Homepage index.html is owned by tools/press.py (Fraunces cover).
Every other page gets: Fraunces fonts + css/press-theme.css + thin press chrome.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".git", "_site", "static_dump", "trash", "tools", "lab"}
V = "62-press"

PRESS_MARKERS = (
    "read <em>backwards",
    'data-press="1"',
    'data-quantanium="press"',
    "ghost5",
)

# Strip competing / old stacks
BAN_CSS = re.compile(
    r'[ \t]*<link[^>]+href=["\'][^"\']*?(?:'
    r'tokens|brand-lock|tnt-override|standard|quantanium|product|sprites|tenet5|'
    r'award-home|abracadabra|liril-theme|liril-utilities|legacy-bridge|'
    r'token-bridge|liril-unified|inline_generated|style|home|press-theme'
    r')\.css[^"\']*["\'][^>]*/?>\s*\n?',
    re.I,
)
BAN_JS = re.compile(
    r'[ \t]*<script[^>]+src=["\'][^"\']*?(?:'
    r'quantanium|liril-theme-slider|shell|liril-walkthrough|'
    r'tenet5-unified-walkthrough|liril-autoreader'
    r')\.js[^"\']*["\'][^>]*>\s*</script>\s*\n?',
    re.I,
)

FONTS = (
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">\n'
)
PRESS_CSS = f'  <link rel="stylesheet" href="css/press-theme.css?v={V}">\n'

# Interior layout glue (press aesthetic, not product shell)
INTERIOR_CSS = """  <style id="press-interior">
    .press-bar{display:flex;justify-content:space-between;align-items:center;gap:18px;
      padding:16px clamp(20px,4vw,48px);font-family:var(--mono,'IBM Plex Mono',monospace);
      font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ivory-faint,#6b6459);
      border-bottom:1px solid var(--hair,#26221c);background:var(--void,#050708);position:sticky;top:0;z-index:100}
    .press-bar a{color:var(--ivory-dim,#a89f90);text-decoration:none;margin-left:14px}
    .press-bar a:hover{color:var(--ice,#9adbe8)}
    .press-bar .wm{font-family:var(--serif,'Fraunces',Georgia,serif);font-size:16px;letter-spacing:.04em;
      color:var(--ivory,#ece7dc);text-transform:none}
    .press-bar .wm sup{font-size:.5em;color:var(--ice,#9adbe8)}
    .press-main{max-width:920px;margin:0 auto;padding:clamp(36px,6vw,72px) clamp(20px,4vw,40px) 80px;
      color:var(--ivory-dim,#a89f90);font-family:var(--serif,'Fraunces',Georgia,serif);font-weight:300;line-height:1.65}
    .press-main h1,.press-main h2,.press-main h3{color:var(--ivory,#ece7dc);font-weight:400;letter-spacing:-.02em}
    .press-main h1{font-size:clamp(2rem,4.5vw,3.2rem);line-height:1.1;margin:0 0 .5em}
    .press-main a{color:var(--ice,#9adbe8)}
    .press-main .inv-stat,.press-main .finding-box,.press-main .country-card,.press-main .panel,
    .press-main .p-card{background:linear-gradient(160deg,rgba(154,219,232,.06),rgba(5,7,8,.35));
      border:1px solid rgba(154,219,232,.14);border-radius:8px}
    .press-foot{max-width:920px;margin:0 auto;padding:24px clamp(20px,4vw,40px) 56px;
      border-top:1px solid var(--hair,#26221c);font-family:var(--mono,'IBM Plex Mono',monospace);
      font-size:10.5px;letter-spacing:.08em;color:var(--ivory-faint,#6b6459);
      display:flex;flex-wrap:wrap;gap:10px 18px}
    .press-foot a{color:var(--ivory-dim,#a89f90);text-decoration:none}
    .press-foot a:hover{color:var(--ice,#9adbe8)}
    .tnt-pillar-nav,.tnt-breadcrumb,.theme-slider,#theme-slider,.brand-crest,
    img[src*="crest"],.ambient-glow,.grain-overlay,.vignette{display:none!important}
  </style>
"""

NAV = """  <header class="press-bar">
    <a class="wm" href="index.html">TENET<sup>5</sup></a>
    <nav>
      <a href="index.html">Home</a>
      <a href="daily-briefing.html">Briefing</a>
      <a href="evidence-index.html">Evidence</a>
      <a href="liril-film.html">Film</a>
      <a href="about.html">About</a>
    </nav>
  </header>
"""
FOOT = """  <footer class="press-foot">
    <span>TENET5 · Powered by LIRIL AI</span>
    <a href="methodology-transparency.html">Methodology</a>
    <a href="take-action.html">Take action</a>
    <a href="about.html">About</a>
  </footer>
"""


def is_press_home(text: str, name: str) -> bool:
    if name == "index.html":
        return True
    return any(m in text for m in PRESS_MARKERS)


def migrate_html(text: str, name: str = "") -> tuple[str, bool]:
    original = text
    if is_press_home(text, name):
        return original, False

    text = BAN_CSS.sub("", text)
    text = BAN_JS.sub("", text)
    # drop old atkinson-only font links (re-inject Fraunces)
    text = re.sub(
        r'[ \t]*<link[^>]+fonts\.googleapis\.com/css2\?family=Atkinson[^>]*>\s*\n?',
        "",
        text,
        flags=re.I,
    )
    text = re.sub(
        r'[ \t]*<link[^>]+fonts\.googleapis\.com/css2\?family=Fraunces[^>]*>\s*\n?',
        "",
        text,
        flags=re.I,
    )
    text = re.sub(r'[ \t]*<link[^>]+rel=["\']preconnect["\'][^>]*fonts\.(googleapis|gstatic)[^>]*>\s*\n?', "", text, flags=re.I)
    text = re.sub(r'<style id="press-interior">.*?</style>\s*', "", text, flags=re.I | re.S)
    text = re.sub(r'<style id="product-system-defense">.*?</style>\s*', "", text, flags=re.I | re.S)

    def _html(m: re.Match[str]) -> str:
        attrs = re.sub(r'\s*data-product\s*=\s*["\'][^"\']*["\']', "", m.group(1) or "", flags=re.I)
        attrs = re.sub(r'\s*data-quantanium\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        attrs = re.sub(r'\s*lang\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        return f'<html lang="en-CA" data-press-interior="1"{attrs}>'

    text = re.sub(r"<html\b([^>]*)>", _html, text, count=1, flags=re.I)

    def _body(m: re.Match[str]) -> str:
        attrs = m.group(1) or ""
        attrs = re.sub(r'\s*class\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        attrs = re.sub(r'\s*data-product\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        return f'<body class="press-interior"{attrs}>'

    text = re.sub(r"<body\b([^>]*)>", _body, text, count=1, flags=re.I)

    inject = FONTS + PRESS_CSS + INTERIOR_CSS
    if re.search(r"<head\b", text, re.I):
        # inject after charset or at start of head
        if re.search(r"<meta[^>]+charset", text, re.I):
            text = re.sub(
                r'(<meta[^>]+charset[^>]*>\s*)',
                r"\1" + inject,
                text,
                count=1,
                flags=re.I,
            )
        else:
            text = re.sub(r"(<head\b[^>]*>)", r"\1\n" + inject, text, count=1, flags=re.I)

    # theme color
    if re.search(r'name=["\']theme-color["\']', text, re.I):
        text = re.sub(
            r'(name=["\']theme-color["\']\s+content=["\'])[^"\']*',
            r"\1#050708",
            text,
            flags=re.I,
        )

    if 'class="press-bar"' not in text:
        text = re.sub(r"(<body\b[^>]*>)", r"\1\n" + NAV, text, count=1, flags=re.I)
    if 'class="press-foot"' not in text:
        text = re.sub(r"</body>", FOOT + "\n</body>", text, count=1, flags=re.I)

    # wrap first main if bare content without press-main
    if "press-main" not in text and re.search(r"<main\b", text, re.I):
        text = re.sub(r"<main\b([^>]*)>", r'<main class="press-main"\1>', text, count=1, flags=re.I)

    return text, text != original


def collect_html_files(root: Path) -> list[Path]:
    out = []
    for p in root.rglob("*.html"):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        out.append(p)
    return out


def main() -> int:
    pages = collect_html_files(SITE_ROOT)
    touched = skipped = errors = 0
    for path in pages:
        try:
            src = path.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            print(f"read fail {path.name}: {e}", file=sys.stderr)
            errors += 1
            continue
        if is_press_home(src, path.name):
            skipped += 1
            continue
        new_src, changed = migrate_html(src, path.name)
        if not changed:
            continue
        try:
            path.write_text(new_src, encoding="utf-8", newline="\n")
            touched += 1
        except OSError as e:
            print(f"write fail {path.name}: {e}", file=sys.stderr)
            errors += 1
    print(f"press-theme migration: protected={skipped} interiors={touched} errors={errors} total={len(pages)}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
