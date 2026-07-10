#!/usr/bin/env python3
"""ONE THEME enforcer — WordPress model for TENET5 public site.

Every HTML page may load only:
  1) Fraunces + IBM Plex Mono
  2) css/press-theme.css?v=N

Edit css/press-theme.css to change the whole site.
Homepage body is owned by tools/press.py (cover + linear-backwards + LIRIL guide).
LIRIL guide chrome on index is a permanent PRISM job — never strip those scripts.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {".git", "node_modules", "_site", "static_dump", "trash", "tools", "lab", "data"}
THEME_VER = "64"
THEME_HREF = f"css/press-theme.css?v={THEME_VER}"

FONTS_BLOCK = f"""  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{THEME_HREF}">
  <!-- ONE THEME: edit css/press-theme.css to restyle the whole site -->
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
    <a href="about.html">About</a>
    <a href="legal.html">Legal</a>
  </footer>
"""

# Strip any stylesheet / font / preconnect clutter
RE_LINK = re.compile(r"[ \t]*<link\b[^>]*>\s*\n?", re.I)
RE_THEME_COMMENT = re.compile(
    r"[ \t]*<!--\s*(ONE THEME|theme:\s*css/(?:press-theme|quantanium-spec)|QUANTANIUM|ONE system)[^>]*-->\s*\n?",
    re.I,
)
RE_DEFENSE = re.compile(
    r"<style id=\"(?:press-interior|product-system-defense)\">.*?</style>\s*",
    re.I | re.S,
)

PRESS_HOME_MARKERS = ("read <em>backwards", 'class="cover"', "ghost5")

# Banned alternate theme stacks (product thrash)
BANNED_HREF = re.compile(
    r'href=["\']css/(?:tokens|standard|tenet5|product|quantanium|quantanium-spec|liril-theme|tnt-override|award-home|home)\.css',
    re.I,
)

LIRIL_HOME_REQUIRED = (
    'id="dock"',
    'id="liril-guide-btn"',
    "js/liril-home-guide.js",
    "js/liril-voice.js",
)


def is_press_home(name: str, text: str) -> bool:
    if name != "index.html":
        return False
    return any(m in text for m in PRESS_HOME_MARKERS)


def apply_page(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text
    name = path.name
    home = is_press_home(name, text)

    # Remove all <link ...> then re-inject the one legal block after charset
    text = RE_LINK.sub("", text)
    text = RE_THEME_COMMENT.sub("", text)
    text = RE_DEFENSE.sub("", text)

    # Drop full-theme <style> blocks (theme lives in press-theme.css only)
    def _strip_theme_style(m: re.Match[str]) -> str:
        body = m.group(0)
        if (
            "--void" in body
            or "--serif" in body
            or ".cover{" in body
            or ".cover {" in body
            or ".glass{" in body
            or len(body) > 2500
        ):
            return ""
        return body

    text = re.sub(r"<style\b[^>]*>.*?</style>\s*", _strip_theme_style, text, flags=re.I | re.S)

    if re.search(r"<meta[^>]+charset", text, re.I):
        text = re.sub(
            r"(<meta[^>]+charset[^>]*>\s*)",
            r"\1" + FONTS_BLOCK,
            text,
            count=1,
            flags=re.I,
        )
    elif re.search(r"<head\b", text, re.I):
        text = re.sub(r"(<head\b[^>]*>)", r"\1\n" + FONTS_BLOCK, text, count=1, flags=re.I)
    else:
        return False

    # theme-color
    if re.search(r'name=["\']theme-color["\']', text, re.I):
        text = re.sub(
            r'(name=["\']theme-color["\']\s+content=["\'])[^"\']*',
            r"\1#050708",
            text,
            flags=re.I,
        )
    else:
        text = re.sub(
            r"(</head>)",
            '  <meta name="theme-color" content="#050708">\n\\1',
            text,
            count=1,
            flags=re.I,
        )

    # Interiors only: light chrome if missing (never rewrite press home body)
    if not home:
        if 'class="press-bar' not in text and 'class="cover-bar' not in text:
            text = re.sub(r"(<body\b[^>]*>)", r"\1\n" + NAV, text, count=1, flags=re.I)
        if 'class="press-foot' not in text and 'class="p-foot' not in text:
            if re.search(r"</body>", text, re.I):
                text = re.sub(r"</body>", FOOT + "\n</body>", text, count=1, flags=re.I)

    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def validate() -> dict:
    pages = 0
    ok = 0
    issues: list[str] = []
    for path in sorted(ROOT.glob("*.html")):
        pages += 1
        t = path.read_text(encoding="utf-8", errors="replace")
        n = len(re.findall(r'href=["\']css/press-theme\.css', t, flags=re.I))
        if n != 1:
            issues.append(f"{path.name}: press-theme links={n}")
            continue
        if BANNED_HREF.search(t):
            issues.append(f"{path.name}: old stack still linked")
            continue
        ok += 1
    home = (ROOT / "index.html").read_text(encoding="utf-8", errors="replace")
    if "backwards" not in home or "ghost5" not in home:
        issues.append("index.html: missing press cover markers")
    liril_ok = all(m in home for m in LIRIL_HOME_REQUIRED)
    if not liril_ok:
        issues.append("index.html: LIRIL guide chrome incomplete (PRISM job)")
    return {
        "pages": pages,
        "ok": ok,
        "issues": issues[:40],
        "issue_count": len(issues),
        "home_ok": "backwards" in home and "press-theme.css" in home and liril_ok,
        "liril_guide_ok": liril_ok,
    }


def main() -> int:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(p in SKIP for p in path.parts):
            continue
        if apply_page(path):
            changed += 1
    report = validate()
    print(
        f"apply_one_theme: changed={changed} pages={report['pages']} "
        f"ok={report['ok']} issues={report['issue_count']} "
        f"home_ok={report['home_ok']} liril_ok={report.get('liril_guide_ok')}"
    )
    for i in report["issues"][:15]:
        print(" ", i)
    return 0 if report["issue_count"] == 0 and report["home_ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
