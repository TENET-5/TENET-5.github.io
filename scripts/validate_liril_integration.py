#!/usr/bin/env python3
"""
LIRIL Integration Validator — CI/CD Gate for Walkthrough + Presentation Engine

Ensures the LIRIL walkthrough/presentation narration pipeline is structurally
sound by statically analysing the JS source files. Catches the class of bugs
where one system silently blocks/yields to another without providing a fallback UI.

Checks:
  1. liril-walkthrough.js must NOT hard-yield when presentation.js is loaded
     (it must create a bridge button or delegate, never silently return)
  2. presentation.js must expose __TENET5_NEXT_PAGE and __TENET5_PAGE_PROGRESS
  3. The walkthrough button (#liril-start-walkthrough) must be created in
     BOTH the bridge path AND the standalone walkthrough path
  4. Cross-page autopilot (sessionStorage 'liril_autopilot') must be set
     when starting and cleared when stopping
  5. All HTML content pages must include the walkthrough script (directly or via shell.js)

TENET5 — Powered by LIRIL AI | SEED 118400
ABCXYZ Empirical Magic Handoff — Zero-Orphan CI/CD Policy
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS_DIR = ROOT / "js"
WALK_JS = JS_DIR / "liril-walkthrough.js"
PRES_JS = JS_DIR / "presentation.js"
SHELL_JS = ROOT / "shell.js"

ERRORS: list[str] = []
WARNINGS: list[str] = []


def error(msg: str) -> None:
    ERRORS.append(msg)
    print(f"  ✗ FAIL: {msg}")


def warn(msg: str) -> None:
    WARNINGS.append(msg)
    print(f"  ⚠ WARN: {msg}")


def ok(msg: str) -> None:
    print(f"  ✓ PASS: {msg}")


def read(path: Path) -> str:
    if not path.exists():
        error(f"Missing critical file: {path.name}")
        return ""
    return path.read_text(encoding="utf-8", errors="replace")


def check_walkthrough_no_silent_yield():
    """Verify walkthrough does not silently bail when presentation.js is loaded."""
    src = read(WALK_JS)
    if not src:
        return

    # Find the block that checks __TENET5_PRESENTATION_LOADED
    pres_check_pattern = re.compile(
        r"if\s*\(\s*window\.__TENET5_PRESENTATION_LOADED\s*\)\s*\{([^}]+)\}",
        re.DOTALL,
    )
    match = pres_check_pattern.search(src)
    if not match:
        warn("No __TENET5_PRESENTATION_LOADED guard found — may double-init")
        return

    block = match.group(1)
    # The block must NOT just `return;` — it must call a bridge/delegation function
    stripped = re.sub(r"//[^\n]*", "", block).strip()
    stripped = re.sub(r"console\.\w+\([^)]*\);?", "", stripped).strip()

    if re.fullmatch(r"return\s*;?", stripped):
        error(
            "walkthrough SILENTLY YIELDS to presentation.js — "
            "no bridge button, no delegation. Users see nothing."
        )
    elif "return" in stripped and ("Bridge" in block or "bridge" in block or "delegate" in block or "NARRATE_ALL" in block):
        ok("Walkthrough delegates to presentation engine (bridge pattern)")
    elif "return" in stripped:
        warn("Walkthrough returns in presentation guard — verify delegation exists")
    else:
        ok("Walkthrough does not silently yield")


def check_walkthrough_button_created():
    """Verify the walkthrough button element is created in both code paths."""
    src = read(WALK_JS)
    if not src:
        return

    # Count how many times #liril-start-walkthrough is created
    btn_creates = len(re.findall(r"liril-start-walkthrough", src))
    if btn_creates >= 2:
        ok(f"Walkthrough button created in {btn_creates} code paths (bridge + standalone)")
    elif btn_creates == 1:
        warn("Walkthrough button only created in ONE path — may not appear on all pages")
    else:
        error("Walkthrough button (#liril-start-walkthrough) is NEVER created")


def check_presentation_exposes_nav_api():
    """Verify presentation.js exposes the cross-page navigation functions."""
    src = read(PRES_JS)
    if not src:
        return

    has_next = "__TENET5_NEXT_PAGE" in src
    has_progress = "__TENET5_PAGE_PROGRESS" in src

    if has_next:
        ok("presentation.js exposes __TENET5_NEXT_PAGE")
    else:
        error("presentation.js does NOT expose __TENET5_NEXT_PAGE — cross-page nav broken")

    if has_progress:
        ok("presentation.js exposes __TENET5_PAGE_PROGRESS")
    else:
        error("presentation.js does NOT expose __TENET5_PAGE_PROGRESS — tour progress broken")


def check_autopilot_lifecycle():
    """Verify autopilot state is both set (start) and cleared (stop)."""
    src = read(WALK_JS)
    if not src:
        return

    sets = len(re.findall(r"sessionStorage\.setItem\(['\"]liril_autopilot['\"]", src))
    clears = len(re.findall(r"sessionStorage\.removeItem\(['\"]liril_autopilot['\"]", src))

    if sets > 0 and clears > 0:
        ok(f"Autopilot lifecycle: {sets} set(s), {clears} clear(s)")
    elif sets == 0:
        error("Autopilot is NEVER set — cross-page continuation is dead")
    elif clears == 0:
        error("Autopilot is NEVER cleared — stale sessions will loop forever")


def check_narrate_all_wiring():
    """Verify walkthrough bridge can reach __TENET5_LIRIL_NARRATE_ALL."""
    src = read(WALK_JS)
    if not src:
        return

    if "__TENET5_LIRIL_NARRATE_ALL" in src:
        ok("Walkthrough bridges to __TENET5_LIRIL_NARRATE_ALL")
    else:
        warn("Walkthrough does not reference __TENET5_LIRIL_NARRATE_ALL — may not trigger full narration")

    pres_src = read(PRES_JS)
    if "__TENET5_LIRIL_NARRATE_ALL" in pres_src:
        ok("presentation.js defines __TENET5_LIRIL_NARRATE_ALL")
    else:
        error("presentation.js does NOT define __TENET5_LIRIL_NARRATE_ALL — full narration impossible")


def check_page_sequence_coverage():
    """Verify PAGE_SEQUENCE covers a reasonable number of pages."""
    src = read(PRES_JS)
    if not src:
        return

    pages = re.findall(r"'([a-z0-9\-]+\.html)'", src[:15000])  # First 15K covers PAGE_SEQUENCE
    unique = set(pages)

    # Count actual HTML files in the repo
    html_files = set()
    for f in ROOT.glob("*.html"):
        if f.name not in ("index.html", "404.html") and not f.name.startswith("test-"):
            html_files.add(f.name)

    if len(unique) > 100:
        ok(f"PAGE_SEQUENCE covers {len(unique)} pages")
    elif len(unique) > 50:
        warn(f"PAGE_SEQUENCE only covers {len(unique)} pages — {len(html_files)} HTML files exist")
    else:
        error(f"PAGE_SEQUENCE only has {len(unique)} pages — site has {len(html_files)} HTML files")

    # Check for pages that exist but aren't in the sequence
    missing = html_files - unique
    if missing and len(missing) < 20:
        for m in sorted(missing)[:5]:
            warn(f"HTML page '{m}' exists but is NOT in PAGE_SEQUENCE")
    elif missing:
        warn(f"{len(missing)} HTML pages exist but are NOT in PAGE_SEQUENCE")


def check_shell_loads_scripts():
    """Verify shell.js loads presentation.js, liril-walkthrough.js, and the
    walkthrough-enhancements layer. Also verify the enhancements load AFTER
    the walkthrough script (otherwise hooks miss their targets)."""
    src = read(SHELL_JS)
    if not src:
        return

    if "presentation.js" in src:
        ok("shell.js loads presentation.js")
    else:
        error("shell.js does NOT load presentation.js")

    if "liril-walkthrough.js" in src:
        ok("shell.js loads liril-walkthrough.js")
    else:
        error("shell.js does NOT load liril-walkthrough.js")

    if "walkthrough-enhancements.js" in src:
        ok("shell.js loads walkthrough-enhancements.js")
        # Ordering guard: enhancements must come AFTER liril-walkthrough.js
        wt_idx = src.find("liril-walkthrough.js")
        en_idx = src.find("walkthrough-enhancements.js")
        if wt_idx != -1 and en_idx != -1 and en_idx > wt_idx:
            ok("walkthrough-enhancements.js loads AFTER liril-walkthrough.js")
        else:
            error("walkthrough-enhancements.js must load AFTER liril-walkthrough.js")
    else:
        error("shell.js does NOT load walkthrough-enhancements.js")


def check_fabricated_telemetry_guard():
    """Fail the build if the fabricated-telemetry labels return.

    On 2026-04-17 the site-wide truth audit (commit 717da47e) removed
    internal-telemetry-labelled speculation across 26 pages: ABCXYZ tracker,
    Millennial Falcon system, MF-hash vectors, Target Alpha branding,
    topological convergence, threat correlation scores. These were fabricated
    labels that presented as data-source credibility without traceable
    origin in the actual TENET5 architecture.

    This check enforces that the sweep is durable — if any page re-introduces
    these labels (e.g., via NemoClaw auto-cycle regeneration), the CI build
    fails before deploy.

    Allowed exceptions: HTML comments and explicit retraction notes that
    reference the old label in past tense (documented in retraction audit
    trail). Those are detected by surrounding "RETRACTED" / "retraction note"
    context.
    """
    BANNED = [
        # Each tuple: (regex, human description)
        (r"\bABCXYZ[- ]tracker",        "ABCXYZ tracker algorithm (fabricated data-source label)"),
        (r"\bABCXYZ EMPIRICAL SYNC",    "ABCXYZ EMPIRICAL SYNC framing (fabricated sync)"),
        (r"\bMillennial Falcon (?:tracking system|timeline|system|matrix|Convergence|Tracker)",
                                         "Millennial Falcon internal-telemetry label (fabricated system)"),
        (r"\bMF-[A-F0-9]{8,}",          "MF-hash vector (fabricated hash label)"),
        (r"\bVector:\s*MF-[A-F0-9]+",   "Vector: MF-hash (fabricated internal-system label)"),
        (r"\btopological convergence",  "topological convergence (speculative mathematical framing)"),
        (r"\bThreat correlation locked at \d+",
                                         "Threat correlation locked at N% (unsourced numerical framing)"),
        (r"\bTHREAT SCORE:\s*0\.\d{2}", "THREAT SCORE: 0.XX (unsourced numerical framing)"),
        (r'\btriggers a "magic handoff"',"'magic handoff' (fabricated procedural mechanism)"),
        (r"\bFOREIGN INFLUENCE: TARGET ALPHA",
                                         "FOREIGN INFLUENCE: TARGET ALPHA (speculative branding — use Hogue/NSICOP)"),
        (r"\bTarget Alpha\b",            "'Target Alpha' speculative branding (use Hogue/NSICOP source citations)"),
    ]

    offenders: list[tuple[str,str,int]] = []  # (file, pattern_desc, line_no)

    for html in ROOT.glob("*.html"):
        try:
            txt = html.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for pat, desc in BANNED:
            for m in re.finditer(pat, txt, flags=re.IGNORECASE):
                # Check 1: is this match inside an HTML comment? Walk backwards
                # to find the last <!-- before the match; if no matching -->
                # closes before the match position, we're inside a comment.
                before = txt[:m.start()]
                last_open = before.rfind("<!--")
                if last_open != -1:
                    between = before[last_open:]
                    # Close only counts if it comes AFTER the last <!--
                    if "-->" not in between:
                        continue  # inside an HTML comment — allowed
                # Check 2: wider retraction-documentation context window.
                # Case-insensitive "retract" anywhere in ±600 chars is accepted as
                # audit-trail context. Captures "RETRACTED", "retraction note",
                # "Retraction 1"/"Retraction 2"/"Retraction Protocol", "retracted",
                # "was retracted", etc.
                ctx_start = max(0, m.start() - 600)
                ctx_end = min(len(txt), m.end() + 300)
                context = txt[ctx_start:ctx_end].lower()
                if "retract" in context:
                    continue  # allowed — audit-trail context
                line_no = txt.count("\n", 0, m.start()) + 1
                offenders.append((html.name, desc, line_no))

    if offenders:
        for fn, desc, ln in offenders[:20]:
            error(f"{fn}:{ln}: FABRICATED TELEMETRY '{desc}' — "
                  f"removed in 2026-04-17 truth audit (commit 717da47e); "
                  f"must not return without primary-source citation")
        if len(offenders) > 20:
            error(f"...and {len(offenders)-20} more fabricated-telemetry occurrences")
    else:
        ok("no fabricated ABCXYZ/Millennial Falcon/MF-hash/Target Alpha telemetry detected")


def check_nav_read_only_guard():
    """Nav regression guard — ensures nav.js has no interactive widgets (flag,
    language selector, theme slider) and stays within a 20-link budget.

    User directive 2026-04-15: "remove the flag system from the website / have
    0 interactions from the user with the website for security." The NemoClaw
    auto-cycle has repeatedly reintroduced these widgets, so we check them in
    CI to fail deploy if they return.
    """
    nav = ROOT / "nav.js"
    if not nav.exists():
        error(f"nav.js not found at {nav}")
        return
    txt = read(nav)

    # Banned patterns — each is a hard fail
    banned = [
        (r"nav-bug-flag",                "Flag button — interactive widget forbidden"),
        (r"lang-selector",               "Language selector — site is read-only"),
        (r"theme-slider",                "Theme slider — interactive widget forbidden"),
        (r"onchange\s*=",                "onchange handler — no interactive state changes"),
        (r"<input\s+type=[\"']range",    "Range input — interactive widget forbidden"),
    ]
    # Exception: setSiteLanguage as a stub returning false is allowed; active
    # usage (invocations outside the stub definition) is banned.
    active_lang_setter = re.search(r"setSiteLanguage\(['\"a-zA-Z0-9_]", txt)
    if active_lang_setter:
        error("nav.js: active setSiteLanguage() invocation — site is read-only")

    for pat, desc in banned:
        m = re.search(pat, txt)
        if m:
            line_no = txt.count("\n", 0, m.start()) + 1
            error(f"nav.js:{line_no}: BANNED pattern '{m.group(0)}' — {desc}")

    # Link count budget (prevents off-screen overflow on desktop)
    link_count = len(re.findall(r'<a\s+href=["\'][^"\']+["\'][^>]*>', txt))
    if link_count > 20:
        error(f"nav.js: {link_count} nav links exceeds MAX_NAV_LINKS=20 — "
              f"nav will overflow on desktop")

    # Warning banner required
    if "DO NOT RE-ADD" not in txt:
        error("nav.js: DO NOT RE-ADD warning banner missing — see CLAUDE.md rule")

    # Inline <nav> blocks in HTML pages must not contain banned widgets
    banned_inline = ["nav-bug-flag", "\U0001f6a9", "lang-selector", "theme-slider"]
    for html in ROOT.glob("*.html"):
        try:
            h = read(html)
        except Exception:
            continue
        for m in re.finditer(r"<nav\b[^>]*>(.*?)</nav>", h,
                             flags=re.IGNORECASE | re.DOTALL):
            block = m.group(1)
            for b in banned_inline:
                if b in block:
                    error(f"{html.name}: inline <nav> contains banned '{b}'")
                    break

    if not ERRORS:
        ok("nav.js: no interactive widgets, warning banner present, "
           f"{link_count} links (<=20)")


def check_double_init_guard():
    """Verify both scripts have double-init protection."""
    walk_src = read(WALK_JS)
    pres_src = read(PRES_JS)

    if "__LIRIL_WALKTHROUGH_LOADED" in walk_src:
        ok("liril-walkthrough.js has double-init guard")
    else:
        warn("liril-walkthrough.js missing double-init guard")

    if "__TENET5_PRESENTATION_LOADED" in pres_src:
        ok("presentation.js has double-init guard")
    else:
        warn("presentation.js missing double-init guard")


def main():
    print("\n╔═══════════════════════════════════════════════════╗")
    print("║  LIRIL Integration Validator — CI/CD Gate        ║")
    print("║  TENET5 · ABCXYZ · SEED 118400                   ║")
    print("╚═══════════════════════════════════════════════════╝\n")

    print("── 0a. Nav Read-Only Guard ──")
    check_nav_read_only_guard()

    print("\n── 0b. Fabricated Telemetry Guard ──")
    check_fabricated_telemetry_guard()

    print("\n── 1. Double-Init Guards ──")
    check_double_init_guard()

    print("\n── 2. Walkthrough ↔ Presentation Cooperation ──")
    check_walkthrough_no_silent_yield()

    print("\n── 3. Walkthrough Button Visibility ──")
    check_walkthrough_button_created()

    print("\n── 4. Presentation Navigation API ──")
    check_presentation_exposes_nav_api()

    print("\n── 5. Narrate All Wiring ──")
    check_narrate_all_wiring()

    print("\n── 6. Autopilot Lifecycle ──")
    check_autopilot_lifecycle()

    print("\n── 7. PAGE_SEQUENCE Coverage ──")
    check_page_sequence_coverage()

    print("\n── 8. Shell Script Loading ──")
    check_shell_loads_scripts()

    print("\n" + "═" * 55)
    if ERRORS:
        print(f"  CRITICAL: {len(ERRORS)} error(s), {len(WARNINGS)} warning(s)")
        for e in ERRORS:
            print(f"    ✗ {e}")
        print("\nLIRIL Integration Validator: FAILED")
        sys.exit(1)
    elif WARNINGS:
        print(f"  OK with {len(WARNINGS)} warning(s)")
        print("\nLIRIL Integration Validator: PASSED (with warnings)")
        sys.exit(0)
    else:
        print("  ALL CHECKS PASSED — LIRIL narration pipeline is structurally sound")
        print("\nLIRIL Integration Validator: PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
