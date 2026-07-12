#!/usr/bin/env python3
"""PRISM full-site Google SEO slate — every public page crawl-ready for Search + AI Overviews.

Implements Google Search Central patterns (Article / NewsMediaOrganization /
WebPage / BreadcrumbList / WebSite) + AI Overview hygiene (unique titles,
canonicals, speakable-friendly ledes, E-E-A-T links).

Does NOT guarantee #1 rankings — that is crawl + authority + competition.
This ships the full technical + structured-data surface so Canada / gov body /
think-tank / news queries *can* surface TENET5 when content matches.

Usage:
  python tools/prism_site_seo_slate.py --json
  python tools/prism_site_seo_slate.py --json --apply
  python tools/prism_site_seo_slate.py --json --apply --sitemap

Artifacts:
  C:\\PRISM\\log\\prism_site_seo_slate_last.json
  data/prism_site_seo_slate_last.json
  sitemap.xml · robots.txt · llms.txt
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://tenet-5.github.io"
PROOF = Path(r"C:\PRISM\log\prism_site_seo_slate_last.json")
PROOF2 = ROOT / "data" / "prism_site_seo_slate_last.json"
SKIP_DIRS = {
    ".git", "node_modules", "_site", "static_dump", "trash", "tools", "lab",
    "data", "assets", "audio", "media", "img", "images", "css", "js",
    "evidence", "content", "models", "docs", "audit", "node_modules",
}
SKIP_NAMES = {"404.html", "504-database.html", "auth-callback.html"}
# Thin utility pages: still get basic SEO, lower sitemap priority
LOW_PRIORITY = {
    "search.html", "community.html", "contact.html", "faq.html",
    "share-pack.html", "campaign-generator.html", "instagram-draft-assist.html",
}

MARK_START = "<!-- TENET5 SEO SLATE -->"
MARK_END = "<!-- /TENET5 SEO SLATE -->"
RE_OLD_INJECT = re.compile(
    r"<!--\s*TENET5 SEO INJECT\s*-->.*?<!--\s*/TENET5 SEO INJECT\s*-->",
    re.I | re.S,
)
RE_SLATE = re.compile(
    re.escape(MARK_START) + r".*?" + re.escape(MARK_END),
    re.I | re.S,
)
RE_TITLE = re.compile(r"<title\b[^>]*>(.*?)</title>", re.I | re.S)
RE_H1 = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.I | re.S)
RE_DESC = re.compile(
    r'<meta\b[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']',
    re.I,
)
RE_DESC_SWAP = re.compile(
    r'<meta\b[^>]*name=["\']description["\'][^>]*/?>',
    re.I,
)
RE_TAG = re.compile(r"<[^>]+>")
RE_WS = re.compile(r"\s+")

# Generic boilerplate descriptions that should be replaced with page-specific copy
GENERIC_DESC = re.compile(
    r"^TENET5 is an investigative newsroom|"
    r"^Foreign interference\. MAID\.|"
    r"^Primary sources only\.?$|"
    r"Investigative coverage of|"
    r"primary sources, statutes, and on-the-record|"
    r"TENET5 newsroom\s*[·.]",
    re.I,
)

# Topic boosts from slug → query entities (gov bodies, Canada, think-tank adjacent)
TOPIC_MAP: list[tuple[re.Pattern[str], list[str]]] = [
    (re.compile(r"maid|euthanas", re.I), ["MAID Canada", "medical assistance in dying", "Health Canada"]),
    (re.compile(r"rcmp", re.I), ["RCMP", "Royal Canadian Mounted Police", "Canada police"]),
    (re.compile(r"csis|foreign.?interfer|foreign.?influence", re.I), ["CSIS", "foreign interference Canada", "national security"]),
    (re.compile(r"parliament|hansard|senate|bill-c", re.I), ["Parliament of Canada", "Hansard", "House of Commons"]),
    (re.compile(r"lobby|ethics|brookfield|carney", re.I), ["Lobbying Commissioner Canada", "ethics Canada", "federal lobbying"]),
    (re.compile(r"phoenix|arrivecan|procure", re.I), ["federal procurement Canada", "Auditor General", "ArriveCan"]),
    (re.compile(r"ag-|auditor|oversight|accountab", re.I), ["Auditor General of Canada", "oversight Canada", "government accountability"]),
    (re.compile(r"immig|express.?entry|asylum", re.I), ["Immigration Canada", "IRCC", "immigration policy"]),
    (re.compile(r"housing|homeless", re.I), ["housing crisis Canada", "CMHC", "affordable housing"]),
    (re.compile(r"veteran|caf|military|dnd", re.I), ["Canadian Armed Forces", "Veterans Affairs Canada", "DND"]),
    (re.compile(r"indigenous|mmiwg|treaty", re.I), ["Indigenous Canada", "treaty rights", "MMIWG"]),
    (re.compile(r"media|cbc|outlet|press.?wire|coverage", re.I), ["Canadian media", "news coverage Canada", "press accountability"]),
    (re.compile(r"think.?tank|fraser|cigi|munk", re.I), ["Canadian think tank", "policy research Canada"]),
    (re.compile(r"daily.?brief|news|wire", re.I), ["Canada news", "Canadian government news", "Ottawa briefing"]),
    (re.compile(r"health|hospital|nursing|doctor", re.I), ["Canadian healthcare", "Health Canada", "public health"]),
    (re.compile(r"court|judicial|justice", re.I), ["Canadian courts", "judicial appointments Canada"]),
    (re.compile(r"election|mp-|voting", re.I), ["Elections Canada", "Canadian Parliament MPs"]),
    (re.compile(r"finance|bank|fintrac|offshore", re.I), ["Department of Finance Canada", "FINTRAC", "financial crime Canada"]),
]

ORG_LOGO = f"{SITE}/img/og-card.png"
ORG_LOGO_ALT = f"{SITE}/img/tenet5_logo.png"


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _clean(s: str, n: int = 0) -> str:
    s = RE_WS.sub(" ", RE_TAG.sub(" ", s or "")).strip()
    s = (
        s.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&nbsp;", " ")
        .replace("&#39;", "'")
        .replace("&quot;", '"')
        .replace("\u2014", "—")
        .replace("\u2013", "–")
    )
    if n and len(s) > n:
        s = s[: n - 1].rsplit(" ", 1)[0] + "…"
    return s


def _list_pages() -> list[Path]:
    out: list[Path] = []
    for p in ROOT.rglob("*.html"):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        if p.name in SKIP_NAMES:
            continue
        rel = str(p.relative_to(ROOT)).replace("\\", "/")
        if rel.startswith("data/") or "/mirror" in rel:
            continue
        out.append(p)
    return sorted(out, key=lambda x: str(x).lower())


def _rel_url(path: Path) -> str:
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    if rel.lower() in ("index.html",):
        return f"{SITE}/"
    return f"{SITE}/{quote(rel, safe='/')}"


def _topics(path: Path, title: str, h1: str) -> list[str]:
    blob = f"{path.name} {path.as_posix()} {title} {h1}"
    found: list[str] = []
    seen: set[str] = set()
    for pat, kws in TOPIC_MAP:
        if pat.search(blob):
            for k in kws:
                if k.lower() not in seen:
                    seen.add(k.lower())
                    found.append(k)
    # always Canada investigative frame
    for k in ("Canada", "Canadian government", "public record"):
        if k.lower() not in seen:
            seen.add(k.lower())
            found.append(k)
    return found[:10]


def _build_title(path: Path, existing: str, h1: str) -> str:
    base = _clean(existing or h1 or path.stem.replace("-", " ").title(), 90)
    if not base:
        base = "TENET5"
    if "TENET5" not in base and "tenet" not in base.lower():
        base = f"{base} | TENET5"
    # keep under ~60–65 chars when possible for SERP
    if len(base) > 70:
        core = _clean(h1 or path.stem.replace("-", " ").title(), 48)
        base = f"{core} | TENET5 Canada"
    return base


def _build_description(path: Path, title: str, h1: str, existing: str, topics: list[str]) -> str:
    """Newsroom English only — never SEO-spam 'Investigative coverage of …' boiler."""
    existing = _clean(existing, 320)
    if existing and not GENERIC_DESC.search(existing) and len(existing) >= 60:
        if "canada" not in existing.lower() and "canadian" not in existing.lower():
            existing = _clean(f"{existing} Canada public record.", 160)
        return _clean(existing, 160)
    lead = _clean(h1 or title.split("|")[0], 90)
    # Prefer a short journalistic blurb over keyword packing (Daniel taste gate).
    if lead and len(lead) >= 24:
        return _clean(
            f"{lead}. Public-record file on TENET5 — sources cited on the page.",
            155,
        )
    topic_bit = topics[0] if topics else "Canadian public record"
    return _clean(
        f"{path.stem.replace('-', ' ').title()} — {topic_bit}. "
        f"Primary sources on the page. Powered by LIRIL AI.",
        155,
    )


def _json_ld(
    path: Path,
    url: str,
    title: str,
    description: str,
    topics: list[str],
    is_home: bool,
) -> list[dict[str, Any]]:
    org: dict[str, Any] = {
        "@type": "NewsMediaOrganization",
        "@id": f"{SITE}/#organization",
        "name": "TENET5",
        "alternateName": ["TENET 5", "TENET5 Investigative Newsroom"],
        "url": f"{SITE}/",
        "logo": {
            "@type": "ImageObject",
            "url": ORG_LOGO,
            "width": 1200,
            "height": 630,
        },
        "image": ORG_LOGO,
        "description": (
            "Canadian investigative newsroom holding government, media, and public "
            "institutions to the public record. Primary sources only. Powered by LIRIL AI."
        ),
        "foundingLocation": {"@type": "Place", "name": "Canada"},
        "areaServed": {"@type": "Country", "name": "Canada"},
        "knowsAbout": [
            "Canadian government accountability",
            "MAID medical assistance in dying Canada",
            "foreign interference Canada",
            "federal procurement",
            "lobbying and ethics Canada",
            "Auditor General of Canada",
            "Parliament of Canada",
            "Canadian media coverage analysis",
        ],
        "publishingPrinciples": f"{SITE}/methodology-transparency.html",
        "ethicsPolicy": f"{SITE}/legal.html",
        "masthead": f"{SITE}/about.html",
        "sameAs": [],
        "slogan": "What Ottawa is doing. The record, read backwards.",
    }
    website: dict[str, Any] = {
        "@type": "WebSite",
        "@id": f"{SITE}/#website",
        "url": f"{SITE}/",
        "name": "TENET5",
        "description": org["description"],
        "publisher": {"@id": f"{SITE}/#organization"},
        "inLanguage": "en-CA",
        "potentialAction": {
            "@type": "SearchAction",
            "target": f"{SITE}/search.html?q={{search_term_string}}",
            "query-input": "required name=search_term_string",
        },
    }
    crumbs = [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
    ]
    if not is_home:
        crumbs.append(
            {
                "@type": "ListItem",
                "position": 2,
                "name": _clean(title.split("|")[0], 60),
                "item": url,
            }
        )
    breadcrumb = {
        "@type": "BreadcrumbList",
        "@id": f"{url}#breadcrumb",
        "itemListElement": crumbs,
    }
    webpage: dict[str, Any] = {
        "@type": "WebPage",
        "@id": f"{url}#webpage",
        "url": url,
        "name": title,
        "description": description,
        "isPartOf": {"@id": f"{SITE}/#website"},
        "about": [{"@type": "Thing", "name": t} for t in topics[:6]],
        "inLanguage": "en-CA",
        "primaryImageOfPage": {"@type": "ImageObject", "url": ORG_LOGO},
        "breadcrumb": {"@id": f"{url}#breadcrumb"},
        "publisher": {"@id": f"{SITE}/#organization"},
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".dek", ".lede", ".press-hero", "main p"],
        },
    }
    nodes: list[dict[str, Any]] = [org, website, webpage, breadcrumb]
    if not is_home and path.name not in LOW_PRIORITY:
        article: dict[str, Any] = {
            "@type": "Article",
            "@id": f"{url}#article",
            "headline": _clean(title.split("|")[0], 110),
            "description": description,
            "mainEntityOfPage": {"@id": f"{url}#webpage"},
            "author": {"@id": f"{SITE}/#organization"},
            "publisher": {"@id": f"{SITE}/#organization"},
            "image": [ORG_LOGO],
            "inLanguage": "en-CA",
            "articleSection": topics[0] if topics else "Canada",
            "keywords": ", ".join(topics[:8]),
            "isAccessibleForFree": True,
            "about": [{"@type": "Thing", "name": t} for t in topics[:6]],
        }
        # NewsArticle for newsroom desk surfaces
        if re.search(r"brief|news|wire|press|scandals|investigat", path.name, re.I):
            article["@type"] = "NewsArticle"
            article["dateline"] = "Canada"
        nodes.append(article)
    return nodes


def _seo_block(
    path: Path,
    url: str,
    title: str,
    description: str,
    topics: list[str],
    is_home: bool,
) -> str:
    ld = {
        "@context": "https://schema.org",
        "@graph": _json_ld(path, url, title, description, topics, is_home),
    }
    ld_json = json.dumps(ld, ensure_ascii=False, separators=(",", ":"))
    # Escape </script> in JSON
    ld_json = ld_json.replace("</", "<\\/")
    kw = ", ".join(topics[:12])
    esc_title = html.escape(title, quote=True)
    esc_desc = html.escape(description, quote=True)
    esc_kw = html.escape(kw, quote=True)
    return f"""{MARK_START}
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="bingbot" content="index,follow">
  <meta name="google" content="notranslate">
  <meta name="rating" content="general">
  <meta name="referrer" content="no-referrer-when-downgrade">
  <meta name="geo.region" content="CA">
  <meta name="geo.placename" content="Canada">
  <meta name="language" content="en-CA">
  <meta name="author" content="TENET5">
  <meta name="publisher" content="TENET5">
  <meta name="keywords" content="{esc_kw}">
  <meta name="news_keywords" content="{esc_kw}">
  <link rel="canonical" href="{html.escape(url, quote=True)}">
  <link rel="alternate" hreflang="en-CA" href="{html.escape(url, quote=True)}">
  <link rel="alternate" hreflang="en" href="{html.escape(url, quote=True)}">
  <link rel="alternate" hreflang="x-default" href="{html.escape(url, quote=True)}">
  <meta property="og:site_name" content="TENET5">
  <meta property="og:locale" content="en_CA">
  <meta property="og:type" content="{'website' if is_home else 'article'}">
  <meta property="og:title" content="{esc_title}">
  <meta property="og:description" content="{esc_desc}">
  <meta property="og:url" content="{html.escape(url, quote=True)}">
  <meta property="og:image" content="{ORG_LOGO}">
  <meta property="og:image:alt" content="TENET5 — Canadian investigative newsroom">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc_title}">
  <meta name="twitter:description" content="{esc_desc}">
  <meta name="twitter:image" content="{ORG_LOGO}">
  <meta name="twitter:image:alt" content="TENET5">
  <link rel="sitemap" type="application/xml" title="Sitemap" href="{SITE}/sitemap.xml">
  <script type="application/ld+json">{ld_json}</script>
{MARK_END}"""


def _ensure_title_tag(text: str, title: str) -> str:
    if RE_TITLE.search(text):
        return RE_TITLE.sub(f"<title>{html.escape(title)}</title>", text, count=1)
    # insert after charset or at head open
    if re.search(r"<head\b[^>]*>", text, re.I):
        return re.sub(
            r"(<head\b[^>]*>)",
            rf"\1\n  <title>{html.escape(title)}</title>",
            text,
            count=1,
            flags=re.I,
        )
    return text


def _ensure_description(text: str, description: str) -> str:
    tag = f'<meta name="description" content="{html.escape(description, quote=True)}">'
    if RE_DESC_SWAP.search(text):
        return RE_DESC_SWAP.sub(tag, text, count=1)
    if RE_TITLE.search(text):
        return RE_TITLE.sub(lambda m: m.group(0) + "\n  " + tag, text, count=1)
    return text


def _strip_conflicting_meta(text: str) -> str:
    """Remove prior canonical/og/twitter/robots that slate will re-add (avoid dupes outside slate)."""
    patterns = [
        r'\s*<link\b[^>]*rel=["\']canonical["\'][^>]*>\s*',
        r'\s*<link\b[^>]*rel=["\']alternate["\'][^>]*hreflang[^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']robots["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']googlebot["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']bingbot["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']keywords["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']news_keywords["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']author["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']geo\.region["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*property=["\']og:[^"\']+["\'][^>]*>\s*',
        r'\s*<meta\b[^>]*name=["\']twitter:[^"\']+["\'][^>]*>\s*',
        r'\s*<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>\s*',
        r'\s*<link\b[^>]*rel=["\']sitemap["\'][^>]*>\s*',
    ]
    for pat in patterns:
        text = re.sub(pat, "\n", text, flags=re.I | re.S)
    return text


def process_page(path: Path, apply: bool) -> dict[str, Any]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return {"path": str(path), "ok": False, "error": str(exc)[:120]}

    is_home = path.name == "index.html" and path.parent == ROOT
    url = _rel_url(path)
    existing_title = _clean(RE_TITLE.search(text).group(1) if RE_TITLE.search(text) else "", 120)
    h1 = _clean(RE_H1.search(text).group(1) if RE_H1.search(text) else "", 120)
    existing_desc = ""
    dm = RE_DESC.search(text)
    if dm:
        existing_desc = dm.group(1)
    topics = _topics(path, existing_title, h1)
    title = _build_title(path, existing_title, h1)
    description = _build_description(path, title, h1, existing_desc, topics)

    had_slate = MARK_START in text
    had_canonical = "rel=\"canonical\"" in text or "rel='canonical'" in text
    had_ld = "ld+json" in text.lower()
    had_generic = bool(GENERIC_DESC.search(existing_desc or ""))

    issues_before = []
    if not had_canonical:
        issues_before.append("no_canonical")
    if not had_ld:
        issues_before.append("no_jsonld")
    if had_generic or len(existing_desc or "") < 40:
        issues_before.append("weak_description")
    if "tenet5.github.io" in text and "tenet-5.github.io" not in text.replace("tenet5.github.io", ""):
        issues_before.append("wrong_domain")
    if "tenet5.github.io" in text:
        issues_before.append("legacy_domain")

    if apply:
        # Never SEO-mutate a page that is already a fragment (prior bad write).
        # Writing slate-only meta on top of fragments is how pages lost <html>/<body>.
        low = text[:800].lower()
        if "<!doctype" not in low and "<html" not in low:
            return {
                "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                "ok": False,
                "error": "refuse_seo_on_fragment_page_restore_from_git",
                "url": url,
                "title": title[:90],
                "applied": False,
            }
        # strip old inject + previous slate (non-greedy markers only)
        text = RE_OLD_INJECT.sub("", text)
        text = RE_SLATE.sub("", text)
        # fix legacy domain
        text = text.replace("https://tenet5.github.io", SITE)
        text = _strip_conflicting_meta(text)
        text = _ensure_title_tag(text, title)
        text = _ensure_description(text, description)
        # ensure lang
        if re.search(r"<html\b", text, re.I) and not re.search(r'<html\b[^>]*lang=', text, re.I):
            text = re.sub(r"<html\b", '<html lang="en-CA"', text, count=1, flags=re.I)
        block = _seo_block(path, url, title, description, topics, is_home)
        if re.search(r"</head>", text, re.I):
            text = re.sub(r"</head>", block + "\n</head>", text, count=1, flags=re.I)
        else:
            # No </head> — do not prepend slate alone (that created fragment-only pages).
            return {
                "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                "ok": False,
                "error": "refuse_seo_no_head_close",
                "url": url,
                "title": title[:90],
                "applied": False,
            }
        # Final hard gate: never write a file that lost document structure
        if "<!doctype" not in text[:500].lower() and "<html" not in text[:500].lower():
            return {
                "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                "ok": False,
                "error": "refuse_seo_write_would_destroy_html",
                "url": url,
                "title": title[:90],
                "applied": False,
            }
        path.write_text(text, encoding="utf-8")

    # verify after
    if apply:
        text2 = path.read_text(encoding="utf-8", errors="replace")
    else:
        text2 = text
    ok = (
        MARK_START in text2
        and "ld+json" in text2.lower()
        and 'rel="canonical"' in text2
        and "tenet-5.github.io" in text2
        and "tenet5.github.io" not in text2
        and bool(RE_DESC.search(text2))
    )
    return {
        "path": str(path.relative_to(ROOT)).replace("\\", "/"),
        "ok": ok,
        "url": url,
        "title": title[:90],
        "description_len": len(description),
        "topics": topics[:6],
        "issues_before": issues_before,
        "had_slate": had_slate,
        "applied": apply,
    }


def write_sitemap(pages: list[Path]) -> dict[str, Any]:
    high = {
        "index.html", "daily-briefing.html", "press-wire.html", "investigations.html",
        "news.html", "evidence-index.html", "argument.html", "about.html",
        "methodology-transparency.html", "maid-accountability.html",
        "foreign-interference.html", "accountability-scorecard.html",
    }
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for p in pages:
        rel = str(p.relative_to(ROOT)).replace("\\", "/")
        url = _rel_url(p)
        if rel in high or p.name in high:
            pri, freq = "1.0" if p.name == "index.html" else "0.95", "daily"
        elif p.name in LOW_PRIORITY:
            pri, freq = "0.4", "monthly"
        elif "daily-news" in rel:
            pri, freq = "0.7", "weekly"
        else:
            pri, freq = "0.8", "weekly"
        try:
            mtime = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc).strftime("%Y-%m-%d")
        except OSError:
            mtime = now
        lines.append("  <url>")
        lines.append(f"    <loc>{html.escape(url)}</loc>")
        lines.append(f"    <lastmod>{mtime}</lastmod>")
        lines.append(f"    <changefreq>{freq}</changefreq>")
        lines.append(f"    <priority>{pri}</priority>")
        lines.append(
            f'    <xhtml:link rel="alternate" hreflang="en-CA" href="{html.escape(url)}"/>'
        )
        lines.append("  </url>")
    lines.append("</urlset>")
    lines.append("")
    (ROOT / "sitemap.xml").write_text("\n".join(lines), encoding="utf-8")
    return {"urls": len(pages), "path": str(ROOT / "sitemap.xml")}


def write_robots() -> None:
    body = f"""# TENET5 — crawl policy (Google Search + AI Overviews)
User-agent: *
Allow: /
Disallow: /email-campaign.html
Disallow: /report-generator.html
Disallow: /campaign-tracker.html
Disallow: /auth-callback.html
Disallow: /node_modules/
Disallow: /tools/
Disallow: /data/mirror_reports/
Disallow: /lab/

# Google Search
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-News
Allow: /

# Google AI / Gemini grounding (allow citations of public record)
User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

# Bing
User-agent: Bingbot
Allow: /

Sitemap: {SITE}/sitemap.xml
Host: {SITE}
"""
    (ROOT / "robots.txt").write_text(body, encoding="utf-8")


def write_llms_txt() -> None:
    """llms.txt — AI crawler map (emerging standard; helps assistants cite the desk)."""
    body = f"""# TENET5
> Canadian investigative newsroom. Government, media, and institutions held to the public record. Primary sources. Powered by LIRIL AI.

## Primary
- [Home]({SITE}/): News desk, time continuum, daily government analysis
- [Daily briefing]({SITE}/daily-briefing.html): Today in the Canadian public record
- [LIRIL Press Wire]({SITE}/press-wire.html): Multi-outlet news comparison + outlet report cards
- [Investigations]({SITE}/investigations.html): Active investigation hub
- [Evidence index]({SITE}/evidence-index.html): Primary source shelf
- [Argument]({SITE}/argument.html): Structured case analysis against the record
- [About]({SITE}/about.html): Who we are
- [Methodology]({SITE}/methodology-transparency.html): How claims are sourced

## Topics (examples — full set in sitemap)
- MAID / medical assistance in dying Canada
- Foreign interference / CSIS
- Federal procurement (ArriveCan, Phoenix)
- Lobbying, ethics, Brookfield conflicts
- RCMP, CAF, Veterans Affairs
- Housing, immigration, healthcare systems
- Canadian media coverage gaps

## Machine
- Sitemap: {SITE}/sitemap.xml
- Robots: {SITE}/robots.txt
- Feed: {SITE}/feed.xml
- Manifest: {SITE}/manifest.json

## Citation rule
Every quantitative claim should open a primary government, court, or on-the-record public document. Atmosphere film is not evidence. EXTERNAL SOURCE wire items are third-party reporting, not TENET5 verdicts.
"""
    (ROOT / "llms.txt").write_text(body, encoding="utf-8")


def write_manifest() -> None:
    man = {
        "name": "TENET5 — Canadian Government Accountability",
        "short_name": "TENET5",
        "description": (
            "Investigative newsroom on Canadian government, media, and institutions. "
            "Primary sources, multi-outlet press wire, daily briefing. Powered by LIRIL AI."
        ),
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "background_color": "#050708",
        "theme_color": "#050708",
        "orientation": "any",
        "categories": ["news", "government", "education"],
        "lang": "en-CA",
        "dir": "ltr",
        "icons": [
            {"src": "img/tenet5_logo.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "img/og-card.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        ],
    }
    (ROOT / "manifest.json").write_text(json.dumps(man, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Full-site Google SEO slate")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--sitemap", action="store_true", help="Rewrite sitemap/robots/llms (implied by --apply)")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    pages = _list_pages()
    if args.limit and args.limit > 0:
        pages = pages[: args.limit]

    rows = [process_page(p, apply=args.apply) for p in pages]
    ok_n = sum(1 for r in rows if r.get("ok"))
    fail = [r for r in rows if not r.get("ok")]

    sm_info = None
    if args.apply or args.sitemap:
        sm_info = write_sitemap(pages if not args.limit else _list_pages())
        write_robots()
        write_llms_txt()
        write_manifest()

    # gate: after apply, nearly all pages must pass
    rate = ok_n / max(1, len(rows))
    overall = rate >= 0.95 if args.apply else True
    if not args.apply:
        # audit mode: report gaps without failing the product loop hard
        overall = True
    verdict = "SITE_SEO_SLATE_PASS" if (overall and (ok_n == len(rows) if args.apply else True)) else (
        "SITE_SEO_SLATE_PASS" if args.apply and rate >= 0.98 else "SITE_SEO_SLATE_FAIL" if args.apply else "SITE_SEO_SLATE_AUDIT"
    )
    if args.apply and rate < 0.98:
        overall = False
        verdict = "SITE_SEO_SLATE_FAIL"
    elif args.apply:
        overall = True
        verdict = "SITE_SEO_SLATE_PASS"

    weak_before = sum(1 for r in rows if "weak_description" in (r.get("issues_before") or []))
    no_ld = sum(1 for r in rows if "no_jsonld" in (r.get("issues_before") or []))
    no_can = sum(1 for r in rows if "no_canonical" in (r.get("issues_before") or []))

    doc: dict[str, Any] = {
        "ok": overall if args.apply else True,
        "verdict": verdict,
        "ts": _now(),
        "doctrine": "google_seo_full_slate_ai_overviews",
        "site": SITE,
        "pages": len(rows),
        "ok_pages": ok_n,
        "fail_pages": len(fail),
        "pass_rate": round(rate, 4),
        "apply": bool(args.apply),
        "gaps_before": {
            "no_canonical": no_can,
            "no_jsonld": no_ld,
            "weak_description": weak_before,
        },
        "sitemap": sm_info,
        "artifacts": {
            "sitemap": str(ROOT / "sitemap.xml"),
            "robots": str(ROOT / "robots.txt"),
            "llms": str(ROOT / "llms.txt"),
            "manifest": str(ROOT / "manifest.json"),
        },
        "google_surface": [
            "NewsMediaOrganization + WebSite + WebPage + BreadcrumbList + Article/NewsArticle",
            "canonical + hreflang en-CA",
            "robots index,follow max-snippet/image",
            "Open Graph + Twitter cards page-unique",
            "speakable css selectors for AI/voice",
            "full sitemap.xml + robots Googlebot/Google-Extended",
            "llms.txt topic map for AI assistants",
            "keywords from page entities (Canada, gov bodies, desk topics)",
        ],
        "ranking_note": (
            "Technical SEO + structured data are necessary not sufficient for #1 on "
            "'Canada' or every gov body. Rankings need crawl, links, and query match. "
            "This slate maximizes eligibility and entity clarity."
        ),
        "fail_sample": [{"path": r["path"], "issues": r.get("issues_before")} for r in fail[:15]],
        "sample_ok": [
            {"path": r["path"], "title": r.get("title"), "topics": r.get("topics")}
            for r in rows
            if r.get("ok")
        ][:8],
    }

    for dest in (PROOF, PROOF2):
        try:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(json.dumps(doc, indent=2), encoding="utf-8")
        except OSError:
            pass

    if args.json:
        print(json.dumps(doc, indent=2))
    else:
        print(f"{verdict} pages={len(rows)} ok={ok_n} rate={rate:.1%}")
    return 0 if doc["ok"] or not args.apply else 1


if __name__ == "__main__":
    raise SystemExit(main())
