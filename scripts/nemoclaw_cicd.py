#!/usr/bin/env python3
"""
NemoClaw CI/CD Orchestrator for TENET5
Runs site validation, news page maintenance, and LIRIL analysis within the CI pipeline.
"""

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PYTHON = sys.executable


def run(script, args=None):
    args = args or []
    command = [PYTHON, str(ROOT / script)] + args
    print(f"\n[RUN] {' '.join(command)}")
    subprocess.run(command, cwd=ROOT, check=True)


def main():
    print("\nTENET5 NemoClaw CI/CD Orchestrator\n")

    # Local LIRIL training pass for autonomous repo upkeep.
    trainer = ROOT / "scripts" / "liril_autopilot.py"
    if trainer.exists() and os.environ.get("TENET5_LOCAL_LIRIL_TRAIN", "1") == "1":
        try:
            run("scripts/liril_autopilot.py", ["--once"])
        except subprocess.CalledProcessError as exc:
            print(f"[WARN] Local LIRIL training step did not complete cleanly: {exc}")

    # Generate and cache the news page data first.
    run("scripts/news_pipeline.py")

    # Run the site analyzer and optionally report to NATS if available.
    if os.environ.get("NATS_URL"):
        run("scripts/liril_site_analyzer.py", ["--nats"])
    else:
        run("scripts/liril_site_analyzer.py", ["--report-only"])

    print("\nNemoClaw CI/CD Orchestration complete. News page data generated and site analysis updated.")


if __name__ == "__main__":
    main()
