#!/usr/bin/env python3
"""Site CSS migration — PROTECT press homepage; QUANTANIUM for interiors.

Daniel screenshot 2026-07-10 042513 is the homepage ground truth:
  Fraunces + ice #9adbe8 + red rails + "The record, read backwards."
  Built only by tools/press.py. NEVER rewrite index if press markers present.

Interior investigation pages: tokens → brand-lock → tnt-override → standard
→ quantanium → product (chrome).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".git", "_site", "static_dump", "trash", "tools", "lab"}
V = "61-quantanium"

# Absolute protect — press surface (screenshot)
PRESS_MARKERS = (
    "read <em>backwards",
    'class="cover"',
    "ghost5",
    'data-press="1"',
    "data-quantanium=\"press\"",
    "Fraunces",
)

BAN_CSS = re.compile(
    r'[ \t]*<link[^>]+href=["\'][^"\']*?(?:'
    r'award-home\.css|abracadabra\.css|liril-theme\.css|liril-utilities\.css|'
    r'legacy-bridge\.css|token-bridge\.css|liril-unified\.css|inline_generated\.css|'
    r'style\.css|home\.css'
    r')[^"\']*["\'][^>]*/?>\s*\n?',
    re.I,
)
BAN_JS = re.compile(
    r'[ \t]*<script[^>]+src=["\'][^"\']*?(?:'
    r'liril-theme-slider\.js|shell\.js|liril-walkthrough\.js|'
    r'tenet5-unified-walkthrough\.js|liril-autoreader\.js'
    r')[^"\']*["\'][^>]*>\s*</script>\s*\n?',
    re.I,
)
THEME_BLOCK = re.compile(
    r'<!--\s*LIRIL-THEME-SLIDER-INJECTED-BEGIN\s*-->.*?<!--\s*LIRIL-THEME-SLIDER-INJECTED-END\s*-->\s*',
    re.I | re.S,
)
STACK_LINKS = re.compile(
    r'[ \t]*<link[^>]+href=["\'][^"\']*?(?:tokens|brand-lock|tnt-override|standard|quantanium|product|sprites|tenet5)\.css[^"\']*["\'][^>]*/?>\s*\n?',
    re.I,
)
STACK_JS = re.compile(
    r'[ \t]*<script[^>]+src=["\'][^"\']*?quantanium\.js[^"\']*["\'][^>]*>\s*</script>\s*\n?',
    re.I,
)

QUANTANIUM_BLOCK = f"""  <!-- QUANTANIUM cascade for interior pages -->
  <link rel="stylesheet" href="css/tokens.css?v={V}">
  <link rel="stylesheet" href="css/brand-lock.css?v={V}">
  <link rel="stylesheet" href="css/tnt-override.css?v={V}">
  <link rel="stylesheet" href="css/standard.css?v={V}">
  <link rel="stylesheet" href="css/quantanium.css?v={V}">
  <link rel="stylesheet" href="css/product.css?v={V}">
  <script defer src="js/quantanium.js?v=3"></script>
"""

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
      <a href="about.html">About</a>
    </nav>
  </header>
"""
PRODUCT_FOOT = """  <footer class="p-foot">
    <span>TENET5 · Powered by LIRIL AI</span>
    <a href="methodology-transparency.html">Methodology</a>
    <a href="about.html">About</a>
    <a href="legal.html">Legal</a>
  </footer>
"""

HAND_AUTHORED = {"index.html", "daily-briefing.html", "start-here.html", "gateway.html"}


def is_press(text: str, name: str) -> bool:
    if name == "index.html":
        return True
    return any(m in text for m in PRESS_MARKERS)


def migrate_html(text: str, name: str = "") -> tuple[str, bool]:
    original = text
    if is_press(text, name):
        return original, False

    text = THEME_BLOCK.sub("", text)
    text = BAN_CSS.sub("", text)
    text = BAN_JS.sub("", text)
    text = STACK_LINKS.sub("", text)
    text = STACK_JS.sub("", text)

    def _html(m: re.Match[str]) -> str:
        attrs = m.group(1) or ""
        attrs = re.sub(r'\s*data-product\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        attrs = re.sub(r'\s*data-quantanium\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        attrs = re.sub(r'\s*lang\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        return f'<html lang="en-CA" data-product="1" data-quantanium="1.5"{attrs}>'

    text = re.sub(r"<html\b([^>]*)>", _html, text, count=1, flags=re.I)

    def _body(m: re.Match[str]) -> str:
        attrs = m.group(1) or ""
        classes: list[str] = []
        cm = re.search(r'class\s*=\s*["\']([^"\']*)["\']', attrs, re.I)
        if cm:
            classes = list(cm.group(1).split())
        if "product" not in classes:
            classes.insert(0, "product")
        if "quantanium" not in classes:
            classes.append("quantanium")
        attrs = re.sub(r'\s*class\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        attrs = re.sub(r'\s*data-product\s*=\s*["\'][^"\']*["\']', "", attrs, flags=re.I)
        return f'<body class="{" ".join(classes)}" data-product="1"{attrs}>'

    text = re.sub(r"<body\b([^>]*)>", _body, text, count=1, flags=re.I)

    if not FONTS_RE.search(text) and re.search(r"<head\b", text, re.I):
        text = re.sub(r"(<head\b[^>]*>)", r"\1\n" + FONTS, text, count=1, flags=re.I)

    if FONTS_RE.search(text):
        text = re.sub(
            r'(family=IBM\+Plex\+Mono[^>]*>\s*)',
            r"\1" + QUANTANIUM_BLOCK,
            text,
            count=1,
            flags=re.I,
        )
    elif re.search(r"<head\b", text, re.I):
        text = re.sub(r"(<head\b[^>]*>)", r"\1\n" + QUANTANIUM_BLOCK, text, count=1, flags=re.I)

    if name not in HAND_AUTHORED:
        if 'class="p-top"' not in text:
            text = re.sub(r"(<body\b[^>]*>)", r"\1\n" + PRODUCT_NAV, text, count=1, flags=re.I)
        if 'class="p-foot"' not in text:
            text = re.sub(r"</body>", PRODUCT_FOOT + "\n</body>", text, count=1, flags=re.I)

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
    touched = skipped = errors = 0
    for path in pages:
        try:
            src = path.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            print(f"  read fail {path.name}: {e}", file=sys.stderr)
            errors += 1
            continue
        if is_press(src, path.name):
            skipped += 1
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
        "Migration complete:\n"
        f"  press protected: {skipped}\n"
        f"  interiors migrated: {touched}\n"
        f"  errors: {errors}\n"
        f"  total: {len(pages)}"
    )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
