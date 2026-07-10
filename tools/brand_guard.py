#!/usr/bin/env python3
"""TENET5 brand guard — pre-commit gate for the public site.

Scans ONLY the lines being ADDED in the staged diff, so pre-existing
content never blocks a commit. Rules enforced:

  R1  Wordmark: the display wordmark renders the 5 as an exponent —
      TENET<sup>5</sup>. A full-size <span>5</span> wordmark is rejected.
  R2  Titles: every added <title> ends with "| TENET5".
  R3  Hygiene: no local file paths or loopback/port references may be
      added to public pages. Additional private patterns are loaded from
      an operator file kept OUTSIDE this repository (never committed).
  R4  Voice: no direct speechSynthesis.speak() outside js/liril-voice.js —
      all speech goes through the LIRIL_VOICE guard (silence over wrong voice).
  R5  Product system: no theme-soup stylesheet re-injection (liril-theme,
      tnt-override, quantanium, award-home, Cap#222 landings). Public HTML
      must stay on tokens → product.

Bypass for emergencies: TENET5_GUARD_SKIP=1 git commit ...
"""
from __future__ import annotations

import os
import re
import subprocess
import sys

# Directories whose files are tooling, not public surface.
SKIP_PREFIXES = ("tools/", ".githooks/")

RE_WORDMARK = re.compile(r"TENET<span[^>]*>\s*5")
RE_TITLE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE)
RE_VOICE = re.compile(r"speechSynthesis\.speak\s*\(")
VOICE_ALLOWED = "js/liril-voice.js"

# R5 — one product system (ice-lake newsroom). Soup re-injection is a hard fail.
RE_SOUP_CSS = re.compile(
    r'href=["\'][^"\']*?(?:liril-theme|tnt-override|quantanium|award-home|'
    r'abracadabra|cinematic-slate|legacy-bridge)\.css',
    re.I,
)
RE_CAP_LANDING = re.compile(r"Cap#222|abracadabra-root|award-home\.css", re.I)
RE_NEON = re.compile(r"#38bdf8|#0ea5e9|accent-cyan", re.I)

# Generic hygiene patterns (safe to publish — they reveal nothing specific).
HYGIENE = [
    re.compile(r"[A-Za-z]:\\\\?[A-Za-z0-9_.$~-]"),   # windows drive paths
    re.compile(r"127\.0\.0\.1"),
    re.compile(r"\blocalhost[:/]"),
]


def _load_private_patterns() -> list[re.Pattern[str]]:
    """Operator pattern file lives OUTSIDE the repo; path via env or default
    one level above the repository root. Its contents are never published."""
    top = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    path = os.environ.get(
        "TENET5_GUARD_PATTERNS",
        os.path.join(os.path.dirname(top), ".tenet5_guard_patterns.txt"),
    )
    pats: list[re.Pattern[str]] = []
    try:
        with open(path, encoding="utf-8") as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                try:
                    pats.append(re.compile(line))
                except re.error:
                    print(f"[brand-guard] bad private pattern skipped: {line!r}")
    except OSError:
        pass  # no private file — generic rules still apply
    return pats


def _staged_added_lines() -> list[tuple[str, int, str]]:
    """Yield (file, new_lineno, added_line) for every staged added line."""
    out = subprocess.run(
        ["git", "diff", "--cached", "-U0", "--no-color", "--diff-filter=ACMR"],
        capture_output=True, text=True, errors="replace", check=True,
    ).stdout
    rows: list[tuple[str, int, str]] = []
    fname = ""
    lineno = 0
    for line in out.splitlines():
        if line.startswith("+++ b/"):
            fname = line[6:]
        elif line.startswith("@@"):
            m = re.search(r"\+(\d+)", line)
            lineno = int(m.group(1)) if m else 0
        elif line.startswith("+") and not line.startswith("+++"):
            rows.append((fname, lineno, line[1:]))
            lineno += 1
    return rows


def main() -> int:
    if os.environ.get("TENET5_GUARD_SKIP") == "1":
        print("[brand-guard] SKIPPED via TENET5_GUARD_SKIP=1")
        return 0

    private = _load_private_patterns()
    violations: list[str] = []

    for fname, lineno, text in _staged_added_lines():
        if fname.startswith(SKIP_PREFIXES):
            continue
        where = f"{fname}:{lineno}"

        if RE_WORDMARK.search(text):
            violations.append(
                f"{where}  R1 wordmark — render the 5 as an exponent: TENET<sup>5</sup>")

        for m in RE_TITLE.finditer(text):
            if not m.group(1).strip().endswith("| TENET5"):
                violations.append(
                    f'{where}  R2 title — must end with "| TENET5" (got: {m.group(1).strip()!r})')

        if RE_VOICE.search(text) and fname != VOICE_ALLOWED:
            violations.append(
                f"{where}  R4 voice — use window.LIRIL_VOICE.speak(); "
                f"direct speechSynthesis.speak() is banned outside {VOICE_ALLOWED}")

        for pat in HYGIENE:
            if pat.search(text):
                violations.append(f"{where}  R3 hygiene — local path/loopback reference added")
                break
        else:
            for pat in private:
                if pat.search(text):
                    violations.append(f"{where}  R3 private — blocked pattern added")
                    break

        # R5 product system lock
        if RE_SOUP_CSS.search(text):
            violations.append(
                f"{where}  R5 product — banned theme soup CSS "
                f"(use css/tokens.css + css/product.css only)")
        if RE_CAP_LANDING.search(text):
            violations.append(
                f"{where}  R5 product — Cap#222 / award-home landing banned")
        if RE_NEON.search(text) and fname.endswith((".html", ".css")):
            violations.append(
                f"{where}  R5 product — neon cyan banned (ice-lake chrome only)")

    if violations:
        print("[brand-guard] COMMIT BLOCKED — fix these before committing:")
        for v in violations:
            print("  " + v)
        print(f"[brand-guard] {len(violations)} violation(s).")
        return 1

    print("[brand-guard] clean.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
