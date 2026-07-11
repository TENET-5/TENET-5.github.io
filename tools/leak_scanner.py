#!/usr/bin/env python3
"""TENET5 internals-leak scanner — the swarm's zero-internals regression gate.

The public site must reveal NOTHING about the AI systems: no engine/model/kernel
names, hardware, ports, paths, seeds. "Powered by LIRIL AI" / "Guided by LIRIL"
are the ONLY sanctioned AI references. As LIRIL/agents/the swarm regenerate pages
and the image/video pipeline emits filenames + alt text, this gate keeps the site
leak-clean: it FAILS a commit that would introduce the first visible leak.

Design (why it does not cry wolf — precision first):
  * WORD-BOUNDARY matching, acronyms UPPERCASE-only → "translate"/"input"/"score"
    never trip SLATE/NPU/core.
  * TIER-1 terms have no legitimate record homonym → FAIL anywhere in visible text.
  * TIER-2 terms share words with real record content → allowlisted phrases
    ("Hydrogen Strategy", "Hermes 900", "Project Prism", "logical inference") pass.
  * Scans RENDERED-ish text (strips <script>/<style>/comments) + visible attrs
    (alt/title/aria-label/placeholder/<title>) — never class/id/href slugs.

Usage:
    python tools/leak_scanner.py                # scan root *.html, exit 1 on any FAIL
    python tools/leak_scanner.py --selftest     # precision/recall fixtures (CI gate)
    python tools/leak_scanner.py --json         # machine-readable report
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ── TIER-1: no legitimate record homonym → FAIL anywhere in visible text ─────────
# Case-insensitive, word-boundary. These are engine/model/kernel/agent codenames
# and how-it-runs phrases that must never appear on the public record.
TIER1 = [
    r"p256", r"\.p256", r"base-?42", r"KERNIQ", r"HYDROGEN\s+(?:engine|inference)",
    r"HERMES\s+(?:agent|reviewer)", r"RACECAR", r"NemoClaw", r"SATOR[·\s]*OPERA",
    r"PRISM\s*OS", r"\bLTX\b", r"agentic\s+interface", r"on[-\s]device\s+inference",
    r"on[-\s]device\s+compute", r"local\s+inference", r"NPU[-\s]local",
    r"no\s+cloud,?\s+no\s+api", r"tick\s*=\s*118\.4", r"\.p256\b",
]
# Numeric / network secrets — FAIL in visible text OR source (never public).
SECRETS = [
    r"\b118400\b", r"127\.0\.0\.1", r"localhost:\d", r":87\d\d\b",
    r"[A-Za-z]:\\\\?PRISM", r"E:\\\\?TENET", r"C:\\\\PRISM",
]

# ── TIER-2: real homonyms → only flagged when NOT in the allowlist (WARN) ────────
TIER2 = [r"\bHydrogen\b", r"\bHermes\b", r"\bPrism\b", r"\bFlux\b", r"\bswarm\b"]
# hardware acronyms: UPPERCASE-only so "input"/"score" never trip
TIER2_UPPER = [r"\bGPU\b", r"\bNPU\b", r"\bRTX\b", r"\bCUDA\b", r"\bVRAM\b", r"\bTFLOPS\b"]

# curated public-record phrases that legitimately contain a Tier-2 word
ALLOWLIST = [
    r"Hydrogen\s+Strategy", r"clean\s+hydrogen", r"Hermes\s+9\d\d", r"Hermes\s+450",
    r"Project\s+Prism", r"(?:logical|editorial|rhetorical|reasonable|labell?ed|an?|the|draw\s+the)\s+inference",
    r"Slate\s+(?:magazine|reports?)",
]

# comments / script / style bodies stripped before the visible-text pass
_STRIP = re.compile(r"<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<!--.*?-->", re.I | re.S)
_TAGS = re.compile(r"<[^>]+>")
# visible text-bearing attributes we DO scan (alt/title/aria/placeholder/meta)
_VIS_ATTR = re.compile(r'(?:alt|title|aria-label|placeholder|content)\s*=\s*"([^"]*)"', re.I)


def _visible_text(html: str) -> str:
    body = _STRIP.sub(" ", html)
    text = _TAGS.sub(" ", body)
    attrs = " ".join(m.group(1) for m in _VIS_ATTR.finditer(body))
    return text + " " + attrs


def _allowed(window: str) -> bool:
    return any(re.search(p, window, re.I) for p in ALLOWLIST)


def scan_text(text: str) -> list[dict]:
    findings = []
    for pat in TIER1:
        for m in re.finditer(pat, text, re.I):
            findings.append({"tier": 1, "term": m.group(0), "verdict": "FAIL"})
    for pat in SECRETS:
        for m in re.finditer(pat, text):
            findings.append({"tier": "secret", "term": m.group(0), "verdict": "FAIL"})
    for pat in TIER2:  # case-insensitive homonyms → allowlist gate
        for m in re.finditer(pat, text, re.I):
            win = text[max(0, m.start() - 40): m.end() + 40]
            if not _allowed(win):
                findings.append({"tier": 2, "term": m.group(0), "verdict": "WARN"})
    for pat in TIER2_UPPER:  # uppercase-only hardware acronyms
        for m in re.finditer(pat, text):
            win = text[max(0, m.start() - 40): m.end() + 40]
            if not _allowed(win):
                findings.append({"tier": 2, "term": m.group(0), "verdict": "WARN"})
    return findings


def scan_file(path: Path) -> list[dict]:
    html = path.read_text(encoding="utf-8", errors="ignore")
    vis = _visible_text(html)
    out = []
    for f in scan_text(vis):
        f["file"] = path.name
        out.append(f)
    # secrets also fail in raw source (comments/attrs/paths)
    for pat in SECRETS:
        for m in re.finditer(pat, html):
            out.append({"tier": "secret", "term": m.group(0), "verdict": "FAIL", "file": path.name, "where": "source"})
    return out


def scan_site() -> dict:
    files = sorted(p for p in ROOT.glob("*.html"))
    findings = []
    for p in files:
        findings.extend(scan_file(p))
    fails = [f for f in findings if f["verdict"] == "FAIL"]
    warns = [f for f in findings if f["verdict"] == "WARN"]
    return {"scanned": len(files), "fails": fails, "warns": warns, "ok": not fails}


SELFTEST_FAIL = [
    "LIRIL NPU — SEED:118400", "rendered with LTX", "on-device inference engine",
    "runs on p256", "C:\\PRISM\\boot", "the agentic interface is active",
]
SELFTEST_PASS = [
    "Hydrogen Strategy (AG Fall 2023)", "Hermes 900 drone by Elbit",
    "Project Prism, the Toronto Police operation", "a logical inference from the record",
    "Powered by LIRIL AI", "Guided by LIRIL", "can't translate the clause",
]


def selftest() -> int:
    bad = []
    for s in SELFTEST_FAIL:
        if not any(f["verdict"] == "FAIL" for f in scan_text(s)):
            bad.append(f"MISS (should FAIL): {s!r}")
    for s in SELFTEST_PASS:
        if any(f["verdict"] == "FAIL" for f in scan_text(s)):
            bad.append(f"FALSE-POSITIVE (should PASS): {s!r}")
    if bad:
        print("SELFTEST FAILED:")
        for b in bad:
            print("  " + b)
        return 1
    print(f"SELFTEST PASS — {len(SELFTEST_FAIL)} true-positives FAIL, {len(SELFTEST_PASS)} true-negatives PASS")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    rep = scan_site()
    if "--json" in sys.argv:
        print(json.dumps(rep, indent=1))
    else:
        print(f"leak_scan: {rep['scanned']} pages · {len(rep['fails'])} FAIL · {len(rep['warns'])} WARN")
        for f in rep["fails"][:40]:
            print(f"  FAIL {f['file']}: {f['term']!r} (tier {f['tier']})")
        for f in rep["warns"][:10]:
            print(f"  warn {f['file']}: {f['term']!r}")
    return 0 if rep["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
