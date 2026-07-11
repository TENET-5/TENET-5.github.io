#!/usr/bin/env python3
"""ONE THEME enforcer — WordPress model for TENET5 public site.

Every HTML page may load only:
  1) Fraunces + IBM Plex Mono
  2) css/press-theme.css?v=N

Interiors (all non-press-home pages) MUST use:
  - <html data-press="1"> (no data-product)
  - <body class="press-interior">
  - <header class="press-bar">…</header>  (never cover-bar / p-top product chrome)
  - <footer class="press-foot">…</footer>
  - no ambient-glow / grain-overlay / product soup shells

Homepage body is owned by tools/press.py (cover + LIRIL guide).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {".git", "node_modules", "_site", "static_dump", "trash", "tools", "lab"}
# Not public canon — do not fail site chrome gates on archives
SKIP_NAMES: set[str] = set()
THEME_VER = "77"

def _rel_prefix(path: Path) -> str:
    """Compute relative path prefix from file to ROOT (e.g. '../../' for data/mirror_reports/)."""
    try:
        rel = path.parent.relative_to(ROOT)
        depth = len(rel.parts)
    except ValueError:
        depth = 0
    return "../" * depth if depth > 0 else ""

def _fonts_block(prefix: str = "") -> str:
    return f"""  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}css/press-theme.css?v={THEME_VER}">
  <!-- ONE THEME: edit css/press-theme.css to restyle the whole site -->
"""

def _dock() -> str:
    # Same LIRIL guide bar the homepage carries, on every interior page.
    # Driven by js/liril-dock.js (bridges to the walkthrough engine).
    return """  <div class="dock guide-ready up" id="dock" role="region" aria-label="LIRIL guide">
    <div class="dock-in">
      <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="say"><b>LIRIL</b><span id="liril-line">I can read this page with you.</span></div>
      <button id="liril-guide-btn" type="button" title="LIRIL reads this page aloud">Guide me</button>
      <button id="voice-btn" type="button" aria-pressed="true" title="Toggle LIRIL voice narration">Voice · On</button>
      <div class="liril-status" id="liril-status">LIRIL ready</div>
    </div>
  </div>
"""


def _nav(prefix: str = "") -> str:
    return f"""  <header class="press-bar" role="banner">
    <a class="wm" href="{prefix}index.html">TENET<sup>5</sup></a>
    <nav aria-label="Primary">
      <a href="{prefix}index.html">Home</a>
      <a href="{prefix}daily-briefing.html">Briefing</a>
      <a href="{prefix}investigations.html">Investigations</a>
      <a href="{prefix}evidence-index.html">Evidence</a>
      <a href="{prefix}liril-film.html">Guided</a>
      <a href="{prefix}about.html">About</a>
    </nav>
  </header>
"""

def _foot(prefix: str = "") -> str:
    return f"""  <footer class="press-foot" role="contentinfo">
    <span>TENET5 · Powered by LIRIL AI</span>
    <a href="{prefix}methodology-transparency.html">Methodology</a>
    <a href="{prefix}about.html">About</a>
    <a href="{prefix}legal.html">Legal</a>
  </footer>
"""

RE_LINK = re.compile(r"[ \t]*<link\b[^>]*>\s*\n?", re.I)
RE_THEME_COMMENT = re.compile(
    r"[ \t]*<!--\s*(ONE THEME|theme:\s*css/(?:press-theme|quantanium-spec)|QUANTANIUM|ONE system)[^>]*-->\s*\n?",
    re.I,
)
RE_DEFENSE = re.compile(
    r"<style id=\"(?:press-interior|product-system-defense)\">.*?</style>\s*",
    re.I | re.S,
)
# Product/homepage chrome wrongly reused on interiors
RE_HEADER = re.compile(
    r"[ \t]*<header\b[^>]*(?:cover-bar|p-top|press-bar|site-header|p-header)[^>]*>.*?</header>\s*",
    re.I | re.S,
)
RE_FOOTER_P = re.compile(
    r"[ \t]*<footer\b[^>]*(?:p-foot|press-foot|site-footer|class=\"[^\"]*foot)[^>]*>.*?</footer>\s*",
    re.I | re.S,
)
RE_FOOTER_ANY = re.compile(r"[ \t]*<footer\b[^>]*>.*?</footer>\s*", re.I | re.S)
RE_SOUP_NODES = re.compile(
    r"\s*<(?:div|span)\b[^>]*(?:"
    r"ambient-glow|grain-overlay|vignette|site-header-frame|site-footer-frame|"
    r"theme-slider|tnt-pillar-nav|tnt-breadcrumb"
    r")[^>]*>\s*(?:</(?:div|span)>)?",
    re.I,
)
RE_SKIP = re.compile(r"\s*<a\b[^>]*class=\"[^\"]*skip-link[^\"]*\"[^>]*>.*?</a>\s*", re.I | re.S)
# Retired chrome injectors: nav.js/footer.js build the old unstyled mega-nav at
# runtime; liril-bootstrap.js loads them dynamically. press-bar is the only chrome.
RE_LEGACY_CHROME_JS = re.compile(
    r'\s*<script\b[^>]*src="[^"]*(?:nav\.js|footer\.js|liril-bootstrap\.js)(?:\?[^"]*)?"[^>]*>\s*</script>',
    re.I,
)
# Era-specific floating-widget systems (progress bars, cursor glow, chapter
# dots, subtitle bars, read-next rails…) — the reason "every page has different
# systems". Interiors carry ONE canonical set instead: voice + walkthrough +
# reading-mode. Pages whose CONTENT is rendered by these engines are exempt.
RE_WIDGET_JS = re.compile(
    r'\s*<script\b[^>]*src="[^"]*\b(?:ux|slate|cinema|flow|integrity|i18n|presentation|'
    r"sprite-loader|x-ai-glow|quantanium|theme-slider|auth-nav|hallucination-gate|"
    r"readnext|shell|scene-template|liril-documentary)\.js(?:\?[^\"]*)?\"[^>]*>\s*</script>",
    re.I,
)
WIDGET_KEEP = {"liril-film.html", "argument.html", "argument-sources.html", "argument-transcript.html"}

PRESS_HOME_MARKERS = ("read <em>backwards", 'class="cover"', "ghost5")

BANNED_HREF = re.compile(
    r'href=["\']css/(?:tokens|standard|tenet5|product|quantanium|quantanium-spec|liril-theme|tnt-override|award-home|home|cinematic-slate)\.css',
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


def is_public_page(path: Path) -> bool:
    if path.name in SKIP_NAMES:
        return False
    if any(p in SKIP for p in path.parts):
        return False
    return path.suffix.lower() == ".html"


def _strip_bom(text: str) -> str:
    if text.startswith("\ufeff"):
        return text.lstrip("\ufeff")
    return text


def _force_html_attrs(text: str, home: bool) -> str:
    if home:
        text = re.sub(
            r"<html\b[^>]*>",
            '<html lang="en-CA" data-press="1">',
            text,
            count=1,
            flags=re.I,
        )
    else:
        text = re.sub(
            r"<html\b[^>]*>",
            '<html lang="en-CA" data-press="1" data-press-interior="1">',
            text,
            count=1,
            flags=re.I,
        )
    return text


def _force_body(text: str, home: bool) -> str:
    if home:
        # leave press home body bare (press.py owns it)
        text = re.sub(r"<body\b[^>]*>", "<body>", text, count=1, flags=re.I)
    else:
        text = re.sub(
            r"<body\b[^>]*>",
            '<body class="press-interior">',
            text,
            count=1,
            flags=re.I,
        )
    return text


def _fix_main_tag(text: str) -> str:
    # invalid dual class attributes → single press-main
    text = re.sub(
        r"<main\b([^>]*)>",
        lambda m: _normalize_main_open(m.group(0)),
        text,
        count=1,
        flags=re.I,
    )
    return text


def _normalize_main_open(tag: str) -> str:
    # Collapse all class="..." into one with press-main
    classes = re.findall(r'class=["\']([^"\']*)["\']', tag, flags=re.I)
    merged = []
    for c in classes:
        for part in c.split():
            if part not in merged and part not in {"product", "unified-main"}:
                merged.append(part)
    if "press-main" not in merged:
        merged.insert(0, "press-main")
    # drop other attributes that are class
    rest = re.sub(r'\s*class=["\'][^"\']*["\']', "", tag[5:-1], flags=re.I)
    rest = rest.strip()
    if rest:
        return f'<main class="{" ".join(merged)}" {rest}>'
    return f'<main class="{" ".join(merged)}">'


RE_STRIP_TAGS = re.compile(r"<[^>]+>")

def _canonical_hero(text: str) -> str:
    """Rewrite the page's first h1 (plus adjacent hero-tag kicker and hero-sub
    dek when present) into the canonical .press-hero masthead."""
    if 'class="press-hero"' in text:
        return text
    m = re.search(r"<h1\b([^>]*)>(.*?)</h1>", text, re.I | re.S)
    if not m:
        return text
    # press-authored surfaces already open with a kick — leave them alone
    if re.search(r'class="kick', text[:m.start()]):
        return text
    attrs, inner = m.group(1), m.group(2)
    start, end = m.start(), m.end()
    pre = text[max(0, start - 400):start]
    tag_m = re.search(
        r'<(?:div|span|p)\b[^>]*class="[^"]*(?:hero-tag|inv-tag|eyebrow|kicker)[^"]*"[^>]*>'
        r"(.*?)</(?:div|span|p)>\s*$", pre, re.I | re.S)
    if tag_m:
        start -= len(pre) - tag_m.start()
    post = text[end:end + 600]
    sub_m = re.match(
        r'\s*<p\b[^>]*class="[^"]*(?:hero-sub|dek|subtitle|lede|stand)[^"]*"[^>]*>(.*?)</p>',
        post, re.I | re.S)
    if sub_m:
        end += sub_m.end()
    kick = RE_STRIP_TAGS.sub("", tag_m.group(1)).strip() if tag_m else "The Record · TENET5"
    dek = f'\n  <p class="dek">{RE_STRIP_TAGS.sub("", sub_m.group(1)).strip()}</p>' if sub_m else ""
    block = (f'<header class="press-hero">\n  <span class="kick">{kick}</span>\n'
             f"  <h1{attrs}>{inner}</h1>{dek}\n</header>")
    return text[:start] + block + text[end:]


def apply_page(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text
    name = path.name
    home = is_press_home(name, text)
    prefix = _rel_prefix(path)
    fonts_block = _fonts_block(prefix)
    nav = _nav(prefix)
    foot = _foot(prefix)

    text = _strip_bom(text)

    # Remove all <link ...> then re-inject the one legal block after charset
    text = RE_LINK.sub("", text)
    text = RE_THEME_COMMENT.sub("", text)
    text = RE_DEFENSE.sub("", text)

    # Colour science (owner directive 2026-07-11): kill invisible text. Bespoke page
    # styles were authored light-mode and use `color: var(--ink)` (near-black #0b0e10)
    # which is invisible on the dark void. Repoint text-ink to ivory; NEVER touch
    # `background: var(--ink)` (correctly dark). Negative lookbehind spares border-color.
    text = re.sub(r"(?<![-\w])color:\s*var\(--ink\)", "color: var(--ivory)", text)
    text = re.sub(r"(?<![-\w])color:\s*#0b0e10", "color: var(--ivory)", text, flags=re.I)

    # Bracket-literal headings read as tacky terminal cosplay ("[CONNECTED
    # INTELLIGENCE]"). Convert to the site's refined kicker label.
    text = re.sub(
        r'<h([1-4])[^>]*class="[^"]*cap263-mono-accent[^"]*"[^>]*>\s*\[([^\]<]{2,60})\]\s*</h\1>',
        lambda m: f'<span class="kick">{m.group(2).strip()}</span>',
        text)
    text = re.sub(
        r'<h([1-4])[^>]*>\s*\[\s*([A-Z][^\]<]{2,60}?)\s*\]\s*</h\1>',
        lambda m: f'<span class="kick">{m.group(2).strip()}</span>',
        text)

    # Retired components + leaked scaffold (owner directive 2026-07-11):
    # share bars are gone sitewide, and un-commented "═══ SECTION N — X ═══"
    # scaffold banners must never render as visible text.
    text = re.sub(r'[ \t]*<div [^>]*class="share-bar"[^>]*>.*?</div>\s*</div>\s*', "", text, flags=re.S)
    _parts = re.split(r"(<!--.*?-->)", text, flags=re.S)
    for _i in range(0, len(_parts), 2):
        _parts[_i] = re.sub(r"═{4,}[ \t]*\n[^<>]{0,120}?\n?[ \t]*═{4,}[ \t]*\n?", "\n", _parts[_i], flags=re.M)
        _parts[_i] = re.sub(r"^[ \t]*(SECTION[ ]?\d+[ ]?[—-][^<>\n]{0,60}|SHARE BAR)[ \t]*$\n?", "", _parts[_i], flags=re.M)
    text = "".join(_parts)

    def _strip_theme_style(m: re.Match[str]) -> str:
        body = m.group(0)
        # data-heal blocks are the restored legacy component styles (2026-07-10
        # heal after the theme strip left 359 pages unstyled) — never remove.
        if "data-heal" in body[:120]:
            return body
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
            r"\1" + _fonts_block(prefix),
            text,
            count=1,
            flags=re.I,
        )
    elif re.search(r"<head\b", text, re.I):
        text = re.sub(r"(<head\b[^>]*>)", r"\1\n" + _fonts_block(prefix), text, count=1, flags=re.I)
    else:
        return False

    # Page-scoped companion stylesheets the theme strip must NOT orphan:
    # the Guided player's UI lives in css/liril-film.css (48 lf-* rules).
    PAGE_CSS = {"liril-film.html": "css/liril-film.css?v=2"}
    extra_css = PAGE_CSS.get(path.name)
    if extra_css and extra_css.split("?")[0] not in text:
        text = re.sub(
            r'(<link rel="stylesheet" href="[^"]*press-theme[^"]*">)',
            r"\1\n  " + f'<link rel="stylesheet" href="{prefix}{extra_css}">',
            text, count=1)

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

    text = _force_html_attrs(text, home)
    text = _force_body(text, home)

    if not home:
        # Cap224 breadcrumb wreckage: orphan links + "CAP224-NAV-END"
        text = re.sub(
            r"(?:<main[^>]*>\s*)?(?:<a href=\"index\.html\">Home</a>\s*)?"
            r"(?:<span class=\"tnt-bc-sep\">[^<]*</span>\s*)?"
            r"(?:<span class=\"tnt-bc-current\">[^<]*</span>\s*)?"
            r"</div>\s*CAP224-NAV-END\s*",
            "",
            text,
            count=1,
            flags=re.I,
        )
        text = re.sub(r"\s*CAP224-NAV-END\s*", "\n", text, flags=re.I)
        text = re.sub(
            r"<a href=\"index\.html\">Home</a><span class=\"tnt-bc-sep\">[^<]*</span>"
            r"<span class=\"tnt-bc-current\">[^<]*</span></div>\s*",
            "",
            text,
            flags=re.I,
        )
        # hero-tag emoji cosplay → plain kicker
        text = re.sub(
            r'(class="hero-tag"[^>]*>)\s*[^\w]*\s*',
            r"\1",
            text,
            flags=re.I,
        )
        # undefined product accent var
        text = text.replace("var(--accent)", "var(--ice)")
        text = text.replace("var(--slate-ice-edge)", "rgba(154,219,232,.16)")

        # Strip product soup shells
        text = RE_SOUP_NODES.sub("\n", text)
        text = RE_SKIP.sub("\n", text)
        text = RE_LEGACY_CHROME_JS.sub("", text)

        # ONE widget system: strip era-specific floating-UI scripts (each page
        # had a different set — progress bars, cursor glow, subtitle bars),
        # then guarantee the canonical trio on every interior.
        if path.name not in WIDGET_KEEP:
            text = RE_WIDGET_JS.sub("", text)
        canon = []
        if "js/liril-voice.js" not in text:
            canon.append(f'<script src="{prefix}js/liril-voice.js?v=43"></script>')
        if "liril-walkthrough.js" not in text:
            canon.append(f'<script src="{prefix}js/liril-walkthrough.js?v=3"></script>')
        if "liril-dock.js" not in text:
            canon.append(f'<script defer src="{prefix}js/liril-dock.js?v=1"></script>')
        if "liril-radio.js" not in text:
            canon.append(f'<script defer src="{prefix}js/liril-radio.js?v=2"></script>')
        if "reading-mode.js" not in text:
            canon.append(f'<script defer src="{prefix}js/reading-mode.js?v=2"></script>')
        if canon:
            text = re.sub(r"</body>", "\n".join(canon) + "\n</body>", text, count=1, flags=re.I)

        # The persistent LIRIL guide bar (home parity). position:fixed, so DOM
        # order is irrelevant — inject once before </body>.
        if 'id="dock"' not in text:
            text = re.sub(r"</body>", _dock() + "</body>", text, count=1, flags=re.I)

        # data-heal styles yield to the theme: relocate them BEFORE the theme
        # <link> so press-theme.css wins every tie — page CSS only fills
        # classes the theme doesn't define. That is the inheritance model.
        heal_blocks = re.findall(r"<style [^>]*data-heal[^>]*>.*?</style>\n?", text, re.I | re.S)
        if heal_blocks and re.search(r'<link rel="stylesheet" href="[^"]*press-theme', text):
            for hb in heal_blocks:
                text = text.replace(hb, "")
            text = re.sub(
                r'([ \t]*<link rel="stylesheet" href="[^"]*press-theme[^>]*>)',
                lambda m: "".join(heal_blocks) + m.group(1),
                text, count=1)

        # Canonical masthead: every interior opens the same way — kick, h1,
        # dek — regardless of which era authored its hero. One design language.
        text = _canonical_hero(text)

        # Replace ANY existing header with canonical press-bar
        NAV = _nav(prefix)
        if RE_HEADER.search(text):
            text = RE_HEADER.sub(NAV, text, count=1)
            # kill duplicate/stale headers left behind (mirror_reports carried
            # a second unprefixed press-bar whose links 404 from subdirs)
            extras = list(RE_HEADER.finditer(text))
            if len(extras) > 1:
                for m in reversed(extras[1:]):
                    text = text[: m.start()] + text[m.end() :]
        elif 'class="press-bar' not in text:
            text = re.sub(r"(<body\b[^>]*>)", r"\1\n" + NAV, text, count=1, flags=re.I)

        # If cover-bar still present (malformed header), strip remaining cover-bar blocks
        text = re.sub(
            r"<header\b[^>]*cover-bar[^>]*>.*?</header>\s*",
            "",
            text,
            flags=re.I | re.S,
        )
        # Orphan cover-bar divs
        text = re.sub(
            r"<div\b[^>]*cover-bar[^>]*>.*?</div>\s*",
            "",
            text,
            count=1,
            flags=re.I | re.S,
        )

        # Footers → exactly one press-foot (replace any <footer>…</footer>)
        FOOT = _foot(prefix)
        if RE_FOOTER_ANY.search(text):
            text = RE_FOOTER_ANY.sub(FOOT, text, count=1)
            # remove any additional footers
            parts = list(RE_FOOTER_ANY.finditer(text))
            if len(parts) > 1:
                for m in reversed(parts[1:]):
                    text = text[: m.start()] + text[m.end() :]
        elif 'class="press-foot' not in text:
            text = re.sub(r"</body>", FOOT + "\n</body>", text, count=1, flags=re.I)

        text = _fix_main_tag(text)

        # strip residual product attributes anywhere on shell tags
        text = re.sub(r'\s*data-product(?:=["\'][^"\']*["\'])?', "", text, flags=re.I)
        text = re.sub(r"\bclass=\"product\b", 'class="', text, flags=re.I)
        text = re.sub(r"\sclass=\"\s*\"", "", text)

    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def validate() -> dict:
    pages = 0
    ok = 0
    issues: list[str] = []
    interior_press_bar = 0
    interior_total = 0
    product_left = 0
    cover_bar_interior = 0

    for path in sorted(ROOT.rglob("*.html")):
        if not is_public_page(path):
            continue
        pages += 1
        t = path.read_text(encoding="utf-8", errors="replace")
        home = is_press_home(path.name, t)
        n = len(re.findall(r'href=["\'](?:\.\./)*css/press-theme\.css', t, flags=re.I))
        if n != 1:
            issues.append(f"{path.name}: press-theme links={n}")
            continue
        if BANNED_HREF.search(t):
            issues.append(f"{path.name}: old stack still linked")
            continue
        if not home:
            interior_total += 1
            if 'class="press-bar' in t or "class='press-bar" in t:
                interior_press_bar += 1
            else:
                issues.append(f"{path.name}: missing press-bar")
            if "data-product" in t or 'class="product' in t or "class='product" in t:
                product_left += 1
                issues.append(f"{path.name}: product attrs remain")
            if "cover-bar" in t:
                cover_bar_interior += 1
                issues.append(f"{path.name}: cover-bar on interior")
            if 'class="press-foot' not in t and "class='press-foot" not in t:
                issues.append(f"{path.name}: missing press-foot")
        ok += 1

    # recompute ok excluding structural issues already listed
    structural_fail = product_left + cover_bar_interior + max(0, interior_total - interior_press_bar)
    home = (ROOT / "index.html").read_text(encoding="utf-8", errors="replace")
    if "backwards" not in home or "ghost5" not in home:
        issues.append("index.html: missing press cover markers")
    liril_ok = all(m in home for m in LIRIL_HOME_REQUIRED)
    if not liril_ok:
        issues.append("index.html: LIRIL guide chrome incomplete (PRISM job)")

    # de-dupe issues for count
    uniq = []
    seen = set()
    for i in issues:
        if i not in seen:
            seen.add(i)
            uniq.append(i)

    home_ok = "backwards" in home and "press-theme.css" in home and liril_ok
    chrome_ok = (
        interior_total > 0
        and interior_press_bar == interior_total
        and product_left == 0
        and cover_bar_interior == 0
    )
    return {
        "pages": pages,
        "ok": ok,
        "issues": uniq[:60],
        "issue_count": len(uniq),
        "home_ok": home_ok,
        "liril_guide_ok": liril_ok,
        "interior_total": interior_total,
        "interior_press_bar": interior_press_bar,
        "product_left": product_left,
        "cover_bar_interior": cover_bar_interior,
        "chrome_ok": chrome_ok,
        "structural_fail": structural_fail,
    }


def main() -> int:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        if not is_public_page(path):
            continue
        if apply_page(path):
            changed += 1
    report = validate()
    print(
        f"apply_one_theme: changed={changed} pages={report['pages']} "
        f"issues={report['issue_count']} home_ok={report['home_ok']} "
        f"chrome_ok={report['chrome_ok']} press_bar={report['interior_press_bar']}/"
        f"{report['interior_total']} product_left={report['product_left']} "
        f"cover_bar_interior={report['cover_bar_interior']}"
    )
    for i in report["issues"][:20]:
        print(" ", i)
    return 0 if report["issue_count"] == 0 and report["home_ok"] and report["chrome_ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

