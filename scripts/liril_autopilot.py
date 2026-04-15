#!/usr/bin/env python3
"""
TENET5 LIRIL Autopilot
Trains the local LIRIL classifier for TENET5 site operations and runs a recurring
site-improvement loop for the GitHub Pages accountability platform.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PYTHON = sys.executable
LIRIL_ROOT = Path(os.environ.get("LIRIL_ROOT", r"e:\S.L.A.T.E\tenet5"))
LIRIL_CLI = LIRIL_ROOT / "tools" / "liril_ask.py"
STATUS_FILE = ROOT / "data" / "liril_autopilot_status.json"
LOG_FILE = ROOT / "data" / "liril_autopilot.log"

TRAINING_SAMPLES = [
    {
        "task": "maintain the TENET-5 GitHub Pages accountability OSINT site and continuously improve the presentation",
        "domain": "TECHNOLOGY",
    },
    {
        "task": "improve TENET5 homepage and LIRIL walkthrough quality for a premium investigative presentation",
        "domain": "ART",
    },
    {
        "task": "compare Canadian news narratives and expose framing differences double talk and manipulation",
        "domain": "ETHICS",
    },
    {
        "task": "validate site links metadata frame protection and evidence integrity before every deployment",
        "domain": "REASONING",
    },
    {
        "task": "run the TENET5 news pipeline site analyzer and github maintenance tasks locally on autopilot",
        "domain": "TECHNOLOGY",
    },
]


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def run_command(command: list[str], cwd: Path) -> dict:
    started = time.time()
    try:
        proc = subprocess.run(
            command,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            check=True,
        )
        return {
            "ok": True,
            "code": proc.returncode,
            "seconds": round(time.time() - started, 2),
            "stdout": proc.stdout[-4000:],
            "stderr": proc.stderr[-2000:],
        }
    except subprocess.CalledProcessError as exc:
        return {
            "ok": False,
            "code": exc.returncode,
            "seconds": round(time.time() - started, 2),
            "stdout": (exc.stdout or "")[-4000:],
            "stderr": (exc.stderr or "")[-2000:],
        }


def train_liril() -> dict:
    if not LIRIL_CLI.exists():
        return {
            "ok": False,
            "message": f"LIRIL CLI not found at {LIRIL_CLI}",
            "samples": [],
        }

    results = []
    overall_ok = True
    for sample in TRAINING_SAMPLES:
        cmd = [PYTHON, str(LIRIL_CLI), "train", sample["task"], sample["domain"]]
        result = run_command(cmd, LIRIL_ROOT)
        results.append({
            "task": sample["task"],
            "domain": sample["domain"],
            "result": result,
        })
        overall_ok = overall_ok and result["ok"]

    retrain = run_command([PYTHON, str(LIRIL_CLI), "retrain"], LIRIL_ROOT)
    status = run_command([PYTHON, str(LIRIL_CLI), "status"], LIRIL_ROOT)
    overall_ok = overall_ok and retrain["ok"] and status["ok"]

    return {
        "ok": overall_ok,
        "message": "Local LIRIL training cycle completed",
        "samples": results,
        "retrain": retrain,
        "status": status,
    }


def run_site_cycle() -> list[dict]:
    checks: list[tuple[str, list[str]]] = [
        ("news_pipeline", [PYTHON, str(ROOT / "scripts" / "news_pipeline.py")]),
        ("site_analyzer", [PYTHON, str(ROOT / "scripts" / "liril_site_analyzer.py"), "--report-only"]),
        ("link_validation", [PYTHON, str(ROOT / "scripts" / "cicd_validate.py")]),
        ("og_validation", [PYTHON, str(ROOT / "scripts" / "validate_og_meta.py")]),
        ("frame_validation", [PYTHON, str(ROOT / "scripts" / "validate_frame_buster.py")]),
    ]

    results = []
    for name, command in checks:
        results.append({"name": name, "result": run_command(command, ROOT)})
    return results


def write_status(payload: dict) -> None:
    STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATUS_FILE.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def append_log(text: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as handle:
        handle.write(text.rstrip() + "\n")


def ask_liril_for_guidance() -> dict:
    if not LIRIL_CLI.exists():
        return {"ok": False, "message": "LIRIL CLI unavailable"}
    prompt = (
        "Prioritize the next autonomous improvements for the TENET-5 GitHub Pages "
        "accountability site after training, validation, and presentation checks."
    )
    return run_command([PYTHON, str(LIRIL_CLI), "advise", prompt], LIRIL_ROOT)


def derive_recommendations(site_checks: list[dict]) -> list[str]:
    recommendations = []
    failed = [item["name"] for item in site_checks if not item["result"].get("ok")]
    if failed:
        recommendations.append("Fix failing validation steps before any editorial expansion: " + ", ".join(failed))
    else:
        recommendations.append("All core validations are green; prioritize presentation polish and stronger editorial synthesis next.")

    analyzer = next((item for item in site_checks if item["name"] == "site_analyzer"), None)
    if analyzer and "Health: FAIL" in analyzer["result"].get("stdout", ""):
        recommendations.append("Triage the broader site-health issues surfaced by the analyzer report and convert them into ranked cleanup tasks.")

    news = next((item for item in site_checks if item["name"] == "news_pipeline"), None)
    if news and "WARN" in news["result"].get("stdout", ""):
        recommendations.append("Stabilize additional news sources so the intelligence desk has a broader and more resilient outlet mix.")

    if not recommendations:
        recommendations.append("Continue the autopilot loop and keep refreshing the investigation presentation.")
    return recommendations[:5]


def improvement_cycle(cycle_number: int) -> dict:
    training = train_liril()
    site_checks = run_site_cycle()
    payload = {
        "generated": now_iso(),
        "cycle": cycle_number,
        "mode": "continuous-autopilot",
        "site": "TENET-5.github.io",
        "training": training,
        "site_checks": site_checks,
        "recommendations": derive_recommendations(site_checks),
        "liril_guidance": ask_liril_for_guidance(),
    }
    write_status(payload)
    return payload


def print_summary(payload: dict) -> None:
    lines = [f"\n[TENET5 AUTOPILOT] cycle {payload['cycle']} @ {payload['generated']}"]
    lines.append(f"  training: {'OK' if payload['training'].get('ok') else 'WARN'}")
    for item in payload.get("site_checks", []):
        state = "OK" if item["result"].get("ok") else "WARN"
        lines.append(f"  {item['name']}: {state} ({item['result'].get('seconds')}s)")
    for rec in payload.get("recommendations", [])[:3]:
        lines.append(f"  next: {rec}")
    lines.append(f"  status file: {STATUS_FILE}")
    summary = "\n".join(lines)
    print(summary, flush=True)
    append_log(summary)


def main() -> int:
    parser = argparse.ArgumentParser(description="Train LIRIL and run TENET5 site autopilot checks")
    parser.add_argument("--once", action="store_true", help="Run a single cycle and exit")
    parser.add_argument("--loop", action="store_true", help="Run continuously")
    parser.add_argument("--interval-minutes", type=int, default=30, help="Loop interval in minutes")
    args = parser.parse_args()

    cycle = 1
    if args.loop:
        while True:
            payload = improvement_cycle(cycle)
            print_summary(payload)
            cycle += 1
            wait_minutes = max(args.interval_minutes, 1)
            wait_note = f"[TENET5 AUTOPILOT] sleeping {wait_minutes} minute(s) until next cycle"
            print(wait_note, flush=True)
            append_log(wait_note)
            time.sleep(wait_minutes * 60)
    else:
        payload = improvement_cycle(cycle)
        print_summary(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
