#!/usr/bin/env python3
"""Generate a self-contained offline ZIP archive of the TENET5 evidence site.

Run from the site root:
    python build-archive.py

Outputs: tenet5-evidence-archive.zip
Contains all HTML, JS, CSS, images, audio, PDFs, JSON data, and the
integrity manifest. Excludes build scripts, CSVs, and non-web assets.
"""

import hashlib
import json
import os
import zipfile
from datetime import datetime, timezone
from pathlib import Path

SITE_ROOT = Path(__file__).parent
OUT_NAME = "tenet5-evidence-archive.zip"
CHECKSUM_NAME = "tenet5-evidence-archive.sha256"

# Extensions to include
INCLUDE_EXTS = {
    ".html", ".css", ".js", ".json", ".xml",
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico",
    ".mp3", ".vtt",
    ".pdf",
}

# Directories to skip entirely
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".github"}

# Files to skip
SKIP_FILES = {OUT_NAME, CHECKSUM_NAME, "build-archive.py", "build-integrity-manifest.py", "build-feed.py"}

# Top-level directories to include (beyond root-level files)
INCLUDE_DIRS = {"js", "img", "audio", "data", "fonts", "public"}


def should_include(rel: Path) -> bool:
    """Decide if a file belongs in the archive."""
    parts = rel.parts
    if any(s in parts for s in SKIP_DIRS):
        return False
    if rel.name in SKIP_FILES:
        return False
    if rel.suffix.lower() not in INCLUDE_EXTS:
        return False
    # Root-level files
    if len(parts) == 1:
        return True
    # Files in allowed directories
    if parts[0] in INCLUDE_DIRS:
        # Skip massive CSVs in data/
        if rel.suffix.lower() == ".csv":
            return False
        return True
    return False


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    now = datetime.now(timezone.utc)
    print(f"Building evidence archive: {OUT_NAME}")

    out_path = SITE_ROOT / OUT_NAME
    file_count = 0
    total_bytes = 0

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for p in sorted(SITE_ROOT.rglob("*")):
            if not p.is_file():
                continue
            rel = p.relative_to(SITE_ROOT)
            if not should_include(rel):
                continue

            arc_name = rel.as_posix()
            zf.write(p, arc_name)
            file_count += 1
            total_bytes += p.stat().st_size

        # Add a README inside the archive
        readme = (
            f"TENET5 Evidence Archive\n"
            f"=======================\n"
            f"Generated: {now.isoformat()}\n"
            f"Files: {file_count}\n"
            f"Uncompressed: {total_bytes / 1024 / 1024:.1f} MB\n\n"
            f"This archive contains the complete TENET5 accountability evidence site.\n"
            f"Open index.html in any browser to view offline.\n\n"
            f"Integrity Verification:\n"
            f"  The file integrity-manifest.json contains SHA-256 hashes for every\n"
            f"  asset and page. Each entry includes chain-of-custody timestamps\n"
            f"  (first_seen, last_verified, revisions).\n\n"
            f"Source: https://tenet5.github.io/\n"
        )
        zf.writestr("ARCHIVE-README.txt", readme)

    archive_size = out_path.stat().st_size
    archive_hash = sha256_file(out_path)

    # Write checksum file
    checksum_path = SITE_ROOT / CHECKSUM_NAME
    checksum_path.write_text(
        f"{archive_hash}  {OUT_NAME}\n"
        f"Generated: {now.isoformat()}\n"
        f"Files: {file_count}\n"
        f"Compressed: {archive_size / 1024 / 1024:.1f} MB\n"
        f"Uncompressed: {total_bytes / 1024 / 1024:.1f} MB\n",
        encoding="utf-8",
    )

    print(f"  Archived {file_count} files ({total_bytes / 1024 / 1024:.1f} MB uncompressed)")
    print(f"  ZIP size: {archive_size / 1024 / 1024:.1f} MB")
    print(f"  SHA-256: {archive_hash}")
    print(f"  Checksum: {CHECKSUM_NAME}")


if __name__ == "__main__":
    main()
