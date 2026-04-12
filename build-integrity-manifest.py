#!/usr/bin/env python3
"""Generate integrity-manifest.json with SHA-256 hashes for all site assets.

Run from the site root:
    python build-integrity-manifest.py

Outputs integrity-manifest.json with structure:
{
  "generated": "2026-04-12T...",
  "algorithm": "SHA-256",
  "assets": {
    "img/og-card.png": "a1b2c3...",
    "audio/dossiers/...mp3": "d4e5f6...",
    ...
  },
  "pages": {
    "accountability.html": "sha256-of-body-text...",
    ...
  }
}
"""

import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

SITE_ROOT = Path(__file__).parent
ASSET_DIRS = ["img", "audio", "data"]
ASSET_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
              ".mp3", ".mp4", ".ogg", ".wav", ".vtt",
              ".pdf", ".json", ".csv"}
SKIP_DIRS = {".git", "node_modules", "__pycache__"}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def extract_body_text(html: str) -> str:
    """Extract visible text from <body> for content hashing."""
    body = re.search(r"<body[^>]*>(.*)</body>", html, re.DOTALL | re.IGNORECASE)
    if not body:
        return html
    text = body.group(1)
    # Strip script/style blocks
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def collect_assets() -> dict:
    assets = {}
    for d in ASSET_DIRS:
        root = SITE_ROOT / d
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in ASSET_EXTS:
                continue
            if any(s in path.parts for s in SKIP_DIRS):
                continue
            rel = path.relative_to(SITE_ROOT).as_posix()
            assets[rel] = sha256_file(path)
    # Also hash top-level critical assets
    for f in SITE_ROOT.glob("*.pdf"):
        rel = f.relative_to(SITE_ROOT).as_posix()
        assets[rel] = sha256_file(f)
    return assets


def collect_pages() -> dict:
    pages = {}
    for f in sorted(SITE_ROOT.glob("*.html")):
        if any(s in f.parts for s in SKIP_DIRS):
            continue
        html = f.read_text(encoding="utf-8", errors="replace")
        body_text = extract_body_text(html)
        if body_text:
            rel = f.relative_to(SITE_ROOT).as_posix()
            pages[rel] = sha256_text(body_text)
    return pages


def main():
    print("Building integrity manifest...")
    assets = collect_assets()
    print(f"  Hashed {len(assets)} assets")
    pages = collect_pages()
    print(f"  Hashed {len(pages)} pages")

    manifest = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "algorithm": "SHA-256",
        "assets": dict(sorted(assets.items())),
        "pages": dict(sorted(pages.items())),
    }

    out = SITE_ROOT / "integrity-manifest.json"
    out.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"  Written to {out} ({len(assets) + len(pages)} entries)")


if __name__ == "__main__":
    main()
