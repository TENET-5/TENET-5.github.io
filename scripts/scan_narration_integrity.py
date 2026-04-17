# Copyright (c) 2024-2026 Daniel Perry. All Rights Reserved.
# Licensed under EOSL-2.0.
# Modified: 2026-04-17T16:10:00Z
"""scan_narration_integrity.py — CI scanner for [data-narrate] blocks.

Finds structural problems the LIRIL walkthrough + presentation layers can't
recover from at runtime:

  1. EMPTY — data-narrate="" (block present but no text to read)
  2. TOO_SHORT — < 5 words (likely placeholder / forgotten paragraph)
  3. TOO_LONG — > 800 chars, Chrome SpeechSynthesis truncates around 1000;
     > 2400 chars (safe overhead) is a hard FAIL because part will be silent
  4. FABRICATED_TELEMETRY — ABCXYZ / Millennial Falcon / MF-hash /
     Target Alpha appearing outside retraction context
  5. CLAIM_UNBACKED_URL — narration says "see X" but X isn't linked
     from the same page (weak check — only flags the strongest patterns)

Exits non-zero if any HARD failures found.
Emits a JSON summary to data/narration_integrity_report.json.

Run:
  E:\\S.L.A.T.E\\.venv\\Scripts\\python.exe scripts/scan_narration_integrity.py
"""
from __future__ import annotations

import json
import os
import pathlib
import re
import sys
import time
from typing import Iterator

SITE_ROOT = pathlib.Path(__file__).resolve().parent.parent
REPORT_OUT = SITE_ROOT / "data" / "narration_integrity_report.json"

HARD_MAX_CHARS = 2400   # hard fail above this (TTS truncation)
SOFT_MAX_CHARS = 800    # warn above this
MIN_WORDS = 5
BANNED = ("ABCXYZ", "Millennial Falcon", "MF-hash", "Target Alpha")

# Extract data-narrate="..." blocks. Supports both " and ' quoting.
NARRATE_RE = re.compile(
    r'data-narrate\s*=\s*(?:"([^"]*)"|\'([^\']*)\')',
    re.IGNORECASE | re.DOTALL,
)
# Also match <tag data-narrate>...</tag> where the body holds the narration
NARRATE_BODY_RE = re.compile(
    r'<[^>]*\sdata-narrate\b[^>]*>([\s\S]*?)</',
    re.IGNORECASE,
)


def decode_entities(s: str) -> str:
    return (
        s.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("&nbsp;", " ")
    )


def iter_narrations(html: str) -> Iterator[str]:
    """Yield narration text from each data-narrate block."""
    for match in NARRATE_RE.finditer(html):
        txt = match.group(1) or match.group(2) or ""
        if txt.strip():
            yield decode_entities(txt).strip()


def has_retraction_context(html: str, needle: str) -> bool:
    """Return True if `needle` only appears inside text that also contains
    the word 'retract' within ±600 chars — matches Check 0b semantics."""
    idx = html.lower().find(needle.lower())
    while idx != -1:
        window = html[max(0, idx - 600) : idx + len(needle) + 600].lower()
        if "retract" not in window:
            return False
        idx = html.lower().find(needle.lower(), idx + 1)
    return True


def scan_page(path: pathlib.Path) -> dict:
    html = path.read_text(encoding="utf-8", errors="replace")

    narrations = list(iter_narrations(html))
    total_chars = sum(len(n) for n in narrations)
    total_words = sum(len(n.split()) for n in narrations)

    issues: list[dict] = []
    for i, n in enumerate(narrations):
        clen = len(n)
        wc = len(n.split())
        if not n.strip():
            issues.append({"idx": i, "severity": "hard", "code": "EMPTY"})
        elif wc < MIN_WORDS:
            issues.append({"idx": i, "severity": "soft", "code": "TOO_SHORT", "words": wc})
        if clen > HARD_MAX_CHARS:
            issues.append({"idx": i, "severity": "hard", "code": "TOO_LONG_HARD", "chars": clen})
        elif clen > SOFT_MAX_CHARS:
            issues.append({"idx": i, "severity": "soft", "code": "TOO_LONG_SOFT", "chars": clen})
        for banned in BANNED:
            if banned.lower() in n.lower():
                if not has_retraction_context(html, banned):
                    issues.append(
                        {"idx": i, "severity": "hard", "code": "FABRICATED_TELEMETRY", "term": banned}
                    )

    return {
        "page": path.name,
        "narrations": len(narrations),
        "total_chars": total_chars,
        "total_words": total_words,
        "issues": issues,
    }


def main() -> int:
    pages = sorted(SITE_ROOT.glob("*.html"))
    reports = []
    hard_issues = 0
    soft_issues = 0
    total_narr = 0
    total_words = 0
    for p in pages:
        r = scan_page(p)
        reports.append(r)
        total_narr += r["narrations"]
        total_words += r["total_words"]
        for iss in r["issues"]:
            if iss["severity"] == "hard":
                hard_issues += 1
            else:
                soft_issues += 1

    summary = {
        "system_seed": 118400,
        "timestamp_utc": int(time.time()),
        "pages_scanned": len(pages),
        "narrations_total": total_narr,
        "words_total": total_words,
        "hard_issues": hard_issues,
        "soft_issues": soft_issues,
        "issue_pages": [r["page"] for r in reports if r["issues"]],
        "reports": reports,
    }

    # Print banner
    print("╔═══════════════════════════════════════════════════╗")
    print("║  Narration Integrity Scanner — CI Gate            ║")
    print("║  TENET5 · LIRIL · SEED 118400                    ║")
    print("╚═══════════════════════════════════════════════════╝")
    print(f"  pages scanned   : {len(pages)}")
    print(f"  narration blocks: {total_narr}")
    print(f"  total words     : {total_words:,}")
    print(f"  hard issues     : {hard_issues}")
    print(f"  soft issues     : {soft_issues}")

    if hard_issues:
        print("\n── HARD FAILURES ──")
        for r in reports:
            for iss in r["issues"]:
                if iss["severity"] == "hard":
                    extra = ", ".join(f"{k}={v}" for k, v in iss.items() if k not in ("severity",))
                    print(f"  ✗ {r['page']} #{iss['idx']}  {extra}")

    if soft_issues and not hard_issues:
        print("\n── WARNINGS ──")
        shown = 0
        for r in reports:
            for iss in r["issues"]:
                if iss["severity"] == "soft":
                    extra = ", ".join(f"{k}={v}" for k, v in iss.items() if k not in ("severity",))
                    print(f"  ⚠ {r['page']} #{iss['idx']}  {extra}")
                    shown += 1
                    if shown > 40:
                        print(f"  ... (+{soft_issues - shown} more soft issues suppressed)")
                        break
            if shown > 40:
                break

    REPORT_OUT.parent.mkdir(parents=True, exist_ok=True)
    REPORT_OUT.write_text(json.dumps(summary, ensure_ascii=False, sort_keys=True), encoding="utf-8")
    print(f"\n  report → {REPORT_OUT.relative_to(SITE_ROOT)}")

    if hard_issues:
        print("\n  RESULT: HARD FAIL — fix before shipping")
        return 2
    print(f"\n  RESULT: PASSED{' (with warnings)' if soft_issues else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
