#!/usr/bin/env python3
"""Generate and verify integrity-manifest.json with SHA-256 hashes for all site assets.

Run from the site root:
    python build-integrity-manifest.py          # Generate/Update manifest
    python build-integrity-manifest.py --verify # Verify current files against manifest

Outputs integrity-manifest.json with structure:
{
  "generated": "2026-04-12T...",
  "algorithm": "SHA-256",
  "assets": {
    "img/og-card.png": {"hash": "...", "first_seen": "...", "last_verified": "...", "revisions": 1},
    ...
  },
  "pages": {
    "accountability.html": {"hash": "...", "first_seen": "...", "last_verified": "...", "revisions": 1},
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
ASSET_DIRS = ["img", "audio", "data", "css", "js", "assets"]
ASSET_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
              ".mp3", ".mp4", ".ogg", ".wav", ".vtt",
              ".pdf", ".json", ".csv", ".js", ".css"}
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".claude"}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception as e:
        return f"ERROR: {e}"


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
        try:
            html = f.read_text(encoding="utf-8", errors="replace")
            body_text = extract_body_text(html)
            if body_text:
                rel = f.relative_to(SITE_ROOT).as_posix()
                pages[rel] = sha256_text(body_text)
        except Exception:
            continue
    return pages


def load_existing_manifest() -> dict | None:
    out = SITE_ROOT / "integrity-manifest.json"
    if out.exists():
        try:
            return json.loads(out.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return None


def merge_custody(old_section: dict, new_hashes: dict, now: str) -> dict:
    """Merge new hashes into existing custody records, preserving first_seen."""
    merged = {}
    for path, new_hash in sorted(new_hashes.items()):
        prev = old_section.get(path)
        if isinstance(prev, dict):
            # Existing custody record
            if prev.get("hash") == new_hash:
                # Unchanged — update last_verified only
                merged[path] = {
                    "hash": new_hash,
                    "first_seen": prev["first_seen"],
                    "last_verified": now,
                    "revisions": prev.get("revisions", 1),
                }
            else:
                # Hash changed — new revision
                merged[path] = {
                    "hash": new_hash,
                    "first_seen": prev["first_seen"],
                    "last_verified": now,
                    "revisions": prev.get("revisions", 1) + 1,
                }
        elif isinstance(prev, str):
            # Upgrading from flat hash format
            if prev == new_hash:
                merged[path] = {
                    "hash": new_hash,
                    "first_seen": now,
                    "last_verified": now,
                    "revisions": 1,
                }
            else:
                merged[path] = {
                    "hash": new_hash,
                    "first_seen": now,
                    "last_verified": now,
                    "revisions": 2,
                }
        else:
            # Brand new entry
            merged[path] = {
                "hash": new_hash,
                "first_seen": now,
                "last_verified": now,
                "revisions": 1,
            }
    return merged


def verify_manifest(existing, current_assets, current_pages):
    print("Verifying site integrity against manifest...")
    old_assets = existing.get("assets", {})
    old_pages = existing.get("pages", {})

    mismatches = []
    missing = []

    for path, record in old_assets.items():
        if path not in current_assets:
            missing.append(f"Asset missing: {path}")
        else:
            current_hash = current_assets[path]
            expected_hash = record if isinstance(record, str) else record.get("hash")
            if current_hash != expected_hash:
                mismatches.append(f"Asset hash mismatch: {path}")

    for path, record in old_pages.items():
        if path not in current_pages:
            missing.append(f"Page missing: {path}")
        else:
            current_hash = current_pages[path]
            expected_hash = record if isinstance(record, str) else record.get("hash")
            if current_hash != expected_hash:
                mismatches.append(f"Page content mismatch (body text changed): {path}")

    for path in current_assets:
        if path not in old_assets:
            print(f"  [NEW] Untracked asset: {path}")
    for path in current_pages:
        if path not in old_pages:
            print(f"  [NEW] Untracked page: {path}")

    if not mismatches and not missing:
        print("\nSUCCESS: All tracked assets and pages match the integrity manifest.")
        return True

    print("\nFAILURE: Integrity discrepancies detected!")
    for m in missing:
        print(f"  [MISSING] {m}")
    for m in mismatches:
        print(f"  [MISMATCH] {m}")
    return False


def main():
    verify_mode = "--verify" in sys.argv

    if verify_mode:
        existing = load_existing_manifest()
        if not existing:
            print("Error: No integrity manifest found to verify against.")
            sys.exit(1)

        current_assets = collect_assets()
        current_pages = collect_pages()

        success = verify_manifest(existing, current_assets, current_pages)
        sys.exit(0 if success else 1)

    print("Building integrity manifest...")
    now = datetime.now(timezone.utc).isoformat()
    existing = load_existing_manifest() or {}
    old_assets = existing.get("assets", {})
    old_pages = existing.get("pages", {})

    assets = collect_assets()
    print(f"  Hashed {len(assets)} assets")
    pages = collect_pages()
    print(f"  Hashed {len(pages)} pages")

    manifest = {
        "generated": now,
        "algorithm": "SHA-256",
        "custody_format": "v2",
        "assets": merge_custody(old_assets, assets, now),
        "pages": merge_custody(old_pages, pages, now),
    }

    out = SITE_ROOT / "integrity-manifest.json"
    out.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    total = len(manifest["assets"]) + len(manifest["pages"])
    print(f"  Written to {out} ({total} entries, custody v2)")


if __name__ == "__main__":
    main()
