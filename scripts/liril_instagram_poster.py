#!/usr/bin/env python3

# ── HEADLESS-ONLY GUARD ───────────────────────────────────────────────
# User directive 2026-04-18: IG campaign MUST run every 30 min. The
# script's internal `while True: sleep(1800)` handles that cadence inside
# ONE process.
#
# This guard refuses to run under console `python.exe` — only `pythonw.exe`
# (windowless) is allowed. If someone (Task Scheduler / Antigravity IDE
# agent / stray .bat) tries to launch with python.exe, the process exits
# in ~5 ms BEFORE Windows can render the console window — no popup.
#
# Launch the legitimate instance with:
#     E:\S.L.A.T.E\.venv\Scripts\pythonw.exe scripts\liril_instagram_poster.py
# (This is what `tools\lirilclaw\lirilclaw_autostart.bat` line 9 already does.)
#
# Override for local debugging only: set env LIRIL_IG_ALLOW_CONSOLE=1.
import os as _os, sys as _sys
if _os.environ.get("LIRIL_IG_ALLOW_CONSOLE") != "1":
    _exe = (_sys.executable or "").lower()
    # Accept pythonw (Windows windowless) and posix "python" (no console concept)
    if _exe.endswith("python.exe"):
        _sys.exit(0)
# ──────────────────────────────────────────────────────────────────────

# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "instagrapi",
#     "playwright",
# ]
# ///
"""
TENET5 — LIRIL Autonomous Instagram Poster
Captures the TENET5 OSINT dashboard and posts it to Instagram every 30 minutes
using #CanadianForces and #CanadianVeteran hashtags, as requested by the user.
"""

import os
import sys
import json
import time
import asyncio
from datetime import datetime
from pathlib import Path

try:
    from instagrapi import Client
except ImportError:
    print("instagrapi not found. Please install: pip install instagrapi")
    sys.exit(1)

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("playwright not found. Please install: pip install playwright && playwright install chromium")
    sys.exit(1)

# Configuration
IG_USER = os.getenv("IG_USERNAME", "tenet5_osint")
IG_PASS = os.getenv("IG_PASSWORD", "changeme")
WEBSITE_URL = "https://tenet-5.github.io/"
SCREENSHOT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "liril_snapshot.jpg")
HASHTAGS = "#CanadianForces #CanadianVeteran #TENET5 #OSINT #Accountability"
INTERVAL_SECONDS = 30 * 60  # 30 minutes

# Thoughts feed — writes directly (bypasses pythonw stdout buffer so user sees
# per-cycle status on liril-thinks.html even when log files look empty).
THOUGHTS_PATH = Path(__file__).resolve().parent.parent / "data" / "liril_thoughts.jsonl"

def log_thought(kind: str, summary: str, severity: str = "medium", **extra) -> None:
    """Append a thought to liril_thoughts.jsonl. Safe — never raises."""
    try:
        THOUGHTS_PATH.parent.mkdir(parents=True, exist_ok=True)
        record = {
            "ts":       int(time.time()),
            "kind":     kind,
            "source":   "ig_poster",
            "summary":  summary,
            "severity": severity,
            **extra,
        }
        with THOUGHTS_PATH.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception:
        pass

# Consecutive failure tracker for shadow-ban back-off
_consec_failures = 0

# Rate-limit duplicate "no credentials" alerts — log once per 6h instead
# of every 30-min cycle to keep the dashboard feed from being flooded.
_last_no_cred_alert_ts = 0.0

async def capture_dashboard():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] [LIRIL] Spawning Playwright to capture the latest TENET5 dashboard state...", end="\r")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            # Instagram prefers 1080x1080 (1:1) or 1080x1350 (4:5)
            page = await browser.new_page(viewport={"width": 1080, "height": 1350})
            await page.goto(WEBSITE_URL, wait_until="networkidle")

            # Save as JPEG for instagrapi
            await page.screenshot(path=SCREENSHOT_PATH, type="jpeg", quality=95)
            await browser.close()
        size_kb = os.path.getsize(SCREENSHOT_PATH) // 1024 if os.path.exists(SCREENSHOT_PATH) else 0
        print(f"[{datetime.now().strftime('%H:%M:%S')}] [LIRIL] Dashboard captured successfully to {SCREENSHOT_PATH}")
        log_thought("good", f"Playwright captured dashboard ({size_kb} KB)",
                    severity="low", size_kb=size_kb)
    except Exception as e:
        print(f"\n[ERROR] Failed to capture dashboard: {e}")
        log_thought("alert", f"Playwright capture failed: {e!r}",
                    severity="high")

def post_to_instagram():
    global _consec_failures, _last_no_cred_alert_ts
    msg = f"Latest Intelligence Update. Read the evidence at {WEBSITE_URL}\n\n{HASHTAGS}"

    print(f"[{datetime.now().strftime('%H:%M:%S')}] [LIRIL] Authenticating with Instagram as {IG_USER}...")

    # No-credential guard — was the silent failure mode for the last 5 weeks.
    # 2026-04-18: duplicate-alert suppression. Previously this logged a HIGH-
    # severity alert every 30 min saying the same thing ("password empty").
    # That pollutes liril_thoughts.jsonl with ~48 identical alerts/day.
    # Now we log once per boot + every 6 hours if the condition persists.
    if not IG_PASS or IG_PASS == "changeme":
        now = time.time()
        if now - _last_no_cred_alert_ts > 6 * 3600:  # 6 hours
            msg_detail = (f"SKIPPED: IG_PASSWORD env is empty for account {IG_USER!r}. "
                          f"Set IG_PASSWORD before relaunch (or switch to shroudcamo.ca). "
                          f"Dashboard captured but NOT posted.")
            print(f"[WARNING] {msg_detail}")
            log_thought("alert", msg_detail, severity="high",
                        account=IG_USER, reason="no_credentials")
            _last_no_cred_alert_ts = now
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] [LIRIL] No IG credentials — "
                  f"skipping upload silently (next alert in "
                  f"{int((6*3600 - (now - _last_no_cred_alert_ts))/60)} min).")
        return

    try:
        cl = Client()
        cl.login(IG_USER, IG_PASS)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] [LIRIL] Authentication successful. Uploading matrix proof...")
        media = cl.photo_upload(SCREENSHOT_PATH, msg)
        _consec_failures = 0
        print(f"[{datetime.now().strftime('%H:%M:%S')}] [LIRIL] Successfully posted: {media.code}")
        log_thought("good",
                    f"IG post SUCCESS for {IG_USER} — code={media.code}",
                    severity="high", account=IG_USER, post_code=media.code)
    except Exception as e:
        _consec_failures += 1
        emsg = str(e)
        # Detect shadow-ban / rate-limit patterns
        is_rate = any(k in emsg.lower() for k in
                      ["rate limit", "please wait", "challenge_required",
                       "feedback_required", "login_required"])
        print(f"\n[ERROR] Instagram upload failed: {e}")
        print("[LIRIL] Check your IG_USERNAME, IG_PASSWORD, or login restrictions on Instagram.")
        log_thought(
            "alert",
            f"IG post FAILED (#{_consec_failures} consecutive) for {IG_USER}: {emsg[:200]}",
            severity="high",
            account=IG_USER,
            rate_limited=is_rate,
            consecutive_failures=_consec_failures,
            error_type=type(e).__name__,
        )
        # After 3 consecutive rate-limit failures, sleep 2h instead of 30min
        # (shadow-ban back-off — keeps posting alive but doesn't hammer IG)
        if is_rate and _consec_failures >= 3:
            log_thought(
                "alert",
                (f"Shadow-ban back-off engaged for {IG_USER} "
                 f"({_consec_failures} consecutive rate-limits). "
                 f"Next attempt in 2 hours instead of 30 min."),
                severity="high", account=IG_USER,
                backoff_engaged=True,
            )

def main():
    print(f"===========================================================")
    print(f" LIRIL AUTONOMOUS INSTAGRAM POSTER")
    print(f" Target: {WEBSITE_URL}")
    print(f" Tags: {HASHTAGS}")
    print(f" Interval: {INTERVAL_SECONDS/60} minutes")
    print(f"===========================================================")
    
    log_thought("good",
                f"IG poster boot — account={IG_USER} target={WEBSITE_URL} interval={INTERVAL_SECONDS}s "
                f"credentials_set={'yes' if IG_PASS and IG_PASS != 'changeme' else 'NO'}",
                severity="medium",
                account=IG_USER, has_credentials=bool(IG_PASS and IG_PASS != "changeme"))

    while True:
        cycle_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"\n[LIRIL] Initiating posting cycle at {cycle_time}")
        log_thought("observation",
                    f"IG cycle start at {cycle_time} (consec_failures={_consec_failures})",
                    severity="low")

        asyncio.run(capture_dashboard())

        if os.path.exists(SCREENSHOT_PATH):
            post_to_instagram()
        else:
            print("[ERROR] Screenshot failed to generate. Skipping post.")
            log_thought("alert", "Screenshot missing after capture — skipping post",
                        severity="high")

        # Shadow-ban back-off: 2h sleep if we've hit 3+ rate-limit failures
        sleep_seconds = INTERVAL_SECONDS
        if _consec_failures >= 3:
            sleep_seconds = 2 * 60 * 60  # 2 hours

        print(f"[{datetime.now().strftime('%H:%M:%S')}] [LIRIL] Hibernating for {sleep_seconds/60:.0f} minutes...\n")
        time.sleep(sleep_seconds)

if __name__ == "__main__":
    main()
