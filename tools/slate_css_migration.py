#!/usr/bin/env python3
"""ONE SYSTEM migration — tokens.css → product.css (WordPress consistency).

Daniel 2026-07-10: site must not look like many different websites.
Historical Cap#424 migrated TO css/tenet5.css + liril-utilities (soup chain).
That is RETIRED. Canonical public surface:

  tokens.css → product.css
  html[data-product="1"] + body.product
  shared .p-top / .p-nav chrome

This script is the pre-commit lock. It MUST:
  - strip banned theme soup stylesheets/scripts
  - ensure tokens + product links exist
  - set data-product markers
  - never re-introduce liril-theme / quantanium / tnt-override / award-home

Idempotent. Safe on every commit.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".git", "_site", "static_dump", "trash", "tools", "lab"}

TOKENS_V = "60"
PRODUCT_V = "9"

# Drop entire banned stylesheet links.
BAN_CSS = re.compile(
    r'[ \t]*<link[^>]+href=["\'][^"\']*?(?:'
    r'tenet5\.css|liril-theme\.css|liril-utilities\.css|tnt-override\.css|'
    r'standard\.css|quantanium\.css|award-home\.css|home\.css|sprites\.css|'
    r'cinematic-slate\.css|documentary(?:-tour)?\.css|abracadabra\.css|'
    r'legacy-bridge\.css|token-bridge\.css|liril-unified\.css|inline_generated\.css|'
    r'style\.css'
    r')[^"\']*["\'][^>]*/?>\s*\n?',
    re.I,
)

BAN_JS = re.compile(
    r'[ \t]*<script[^>]+src=["\'][^"\']*?(?:'
    r'quantanium\.js|liril-theme-slider\.js|scene-template\.js|shell\.js|'
    r'liril-documentary\.js|liril-tour\.js|liril-walkthrough\.js|'
    r'tenet5-unified-walkthrough\.js|liril-autoreader\.js'
    r')[^"\']*["\'][^>]*>\s*</script>\s*\n?',
    re.I,
)

THEME_BLOCK = re.compile(
    r'<!--\s*LIRIL-THEME-SLIDER-INJECTED-BEGIN\s*-->.*?<!--\s*LIRIL-THEME-SLIDER-INJECTED-END\s*-->\s*',
    re.I | re.S,
)

# Existing product/tokens links (any version) — we normalize after strip.
PRODUCT_LINK_RE = re.compile(
    r'<link[^>]+href=["\'][^"\']*product\.css[^"\']*["\'][^>]*>',
    re.I,
)
TOKENS_LINK_RE = re.compile(
    r'<link[^>]+href=["\'][^"\']*tokens\.css[^"\']*["\'][^>]*>',
    re.I,
)

CANON_LINKS = (
    f'  <link rel="stylesheet" href="css/tokens.css?v={TOKENS_V}">\n'
    f'  <link rel="stylesheet" href="css/product.css?v={PRODUCT_V}">\n'
)

FONTS_RE = re.compile(r"fonts\.googleapis\.com/css2\?family=Atkinson", re.I)
FONTS = (
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">\n'
)

PRODUCT_NAV = """  <header class="p-top">
    <a class="p-logo" href="index.html">TENET<sup>5</sup></a>
    <nav class="p-nav" aria-label="Primary">
      <a href="index.html">Home</a>
      <a href="start-here.html">Start</a>
      <a href="daily-briefing.html">Briefing</a>
      <a href="evidence-index.html">Evidence</a>
      <a href="master-index.html">Library</a>
      <a href="liril-film.html">Film</a>
      <a href="osint-dashboard.html">OSINT</a>
      <a href="about.html">About</a>
    </nav>
  </header>
"""

PRODUCT_FOOT = """  <footer class="p-foot">
    <span>TENET5 · Powered by LIRIL AI</span>
    <a href="methodology-transparency.html">Methodology</a>
    <a href="take-action.html">Take action</a>
    <a href="about.html">About</a>
    <a href="legal.html">Legal</a>
  </footer>
"""

# Pages authored as full product shells — do not inject second nav/foot.
HAND_AUTHORED = {
    "index.html",
    "daily-briefing.html",
    "start-here.html",
    "gateway.html",
}


def migrate_html(text: str, name: str = "") -> tuple[str, bool]:
    original = text

    text = THEME_BLOCK.sub("", text)
    text = BAN_CSS.sub("", text)
    text = BAN_JS.sub("", text)

    # Strip existing tokens/product so we re-inject one clean pair.
    text = TOKENS_LINK_RE.sub("", text)
    text = PRODUCT_LINK_RE.sub("", text)

    # html data-product
    def _html(m: re.Match[str]) -> str:
        attrs = m.group(1) or ""
        attrs = re.sub(r'\s*data-product\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        attrs = re.sub(r'\s*lang\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        return f'<html lang="en-CA" data-product="1"{attrs}>'

    text = re.sub(r"<html\b([^>]*)>", _html, text, count=1, flags=re.I)

    # body product class
    def _body(m: re.Match[str]) -> str:
        attrs = m.group(1) or ""
        classes: list[str] = []
        cm = re.search(r'class\s*=\s*["\']([^"\']*)["\']', attrs, re.I)
        if cm:
            classes = [c for c in cm.group(1).split() if c not in ("topo",)]
        if "product" not in classes:
            classes.insert(0, "product")
        attrs = re.sub(r'\s*class\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        attrs = re.sub(r'\s*data-product\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        return f'<body class="{" ".join(classes)}" data-product="1"{attrs}>'

    text = re.sub(r"<body\b([^>]*)>", _body, text, count=1, flags=re.I)

    # fonts
    if not FONTS_RE.search(text) and re.search(r"<head\b", text, re.I):
        text = re.sub(r"(<head\b[^>]*>)", r"\1\n" + FONTS, text, count=1, flags=re.I)

    # inject canon CSS after fonts or after <head>
    if FONTS_RE.search(text):
        text = re.sub(
            r'(family=IBM\+Plex\+Mono[^>]*>\s*)',
            r"\1" + CANON_LINKS,
            text,
            count=1,
            flags=re.I,
        )
    elif re.search(r"<head\b", text, re.I):
        text = re.sub(r"(<head\b[^>]*>)", r"\1\n" + CANON_LINKS, text, count=1, flags=re.I)

    # theme-color
    if re.search(r'name=["\']theme-color["\']', text, re.I):
        text = re.sub(
            r'(name=["\']theme-color["\']\s+content=["\'])[^"\']*',
            r"\1#05080d",
            text,
            flags=re.I,
        )
    else:
        text = re.sub(
            r"(</head>)",
            '  <meta name="theme-color" content="#05080d">\n\\1',
            text,
            count=1,
            flags=re.I,
        )

    # neon kill in added inline (common garbage)
    for a, b in (
        (r"#38bdf8", "#a8bcc8"),
        (r"#0ea5e9", "#a8bcc8"),
        (r"#22d3ee", "#a8bcc8"),
        (r"#a855f7", "#a8bcc8"),
        (r"#c4b5fd", "#a8bcc8"),
    ):
        text = re.sub(a, b, text, flags=re.I)

    if name not in HAND_AUTHORED:
        if 'class="p-top"' not in text and "class='p-top'" not in text:
            text = re.sub(
                r"(<body\b[^>]*>)",
                r"\1\n" + PRODUCT_NAV,
                text,
                count=1,
                flags=re.I,
            )
        if 'class="p-foot"' not in text and "class='p-foot'" not in text:
            text = re.sub(r"</body>", PRODUCT_FOOT + "\n</body>", text, count=1, flags=re.I)

    defense = (
        '  <style id="product-system-defense">'
        ".tnt-pillar-nav,.tnt-breadcrumb,.theme-slider,#theme-slider,"
        ".liril-masthead,.liril-related,.cap230-poster"
        "{display:none!important}</style>\n"
    )
    text = re.sub(r'\s*<style id="product-system-defense">.*?</style>\s*', '\n', text, flags=re.I | re.S)
    text = re.sub(r"(</head>)", defense + r"\1", text, count=1, flags=re.I)

    return text, text != original


def collect_html_files(root: Path) -> list[Path]:
    out: list[Path] = []
    for p in root.rglob("*.html"):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        out.append(p)
    return out


def main() -> int:
    pages = collect_html_files(SITE_ROOT)
    touched = 0
    errors = 0
    for path in pages:
        try:
            src = path.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            print(f"  read fail {path.name}: {e}", file=sys.stderr)
            errors += 1
            continue
        new_src, changed = migrate_html(src, path.name)
        if not changed:
            continue
        try:
            path.write_text(new_src, encoding="utf-8", newline="\n")
            touched += 1
        except OSError as e:
            print(f"  write fail {path.name}: {e}", file=sys.stderr)
            errors += 1
    print(
        "PRODUCT CSS migration complete:\n"
        f"  pages migrated: {touched}\n"
        f"  pages already to-spec: {len(pages) - touched - errors}\n"
        f"  read/write errors: {errors}\n"
        f"  total walked: {len(pages)}"
    )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
