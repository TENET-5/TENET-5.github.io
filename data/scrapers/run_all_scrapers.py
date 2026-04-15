#!/usr/bin/env python3
"""
TENET5 OSINT Scraper Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Runs all OSINT data collection scrapers in sequence, logs results,
and generates a unified status report. Designed to be triggered by
Windows Task Scheduler or manual invocation.

Empirical Magic Handoff: All run metadata is hashed and timestamped.
Millennial Falcon: Results feed into network_topology_analyzer.

Usage:
    python run_all_scrapers.py [--dry-run] [--scraper NAME] [--force]
"""

import os
import sys
import json
import time
import hashlib
import subprocess
import argparse
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.dirname(SCRIPT_DIR)
LOG_DIR = os.path.join(DATA_DIR, 'scraper_logs')
STATUS_FILE = os.path.join(DATA_DIR, 'scraper_status.json')

# Python executable — use WindowsApps path if default fails
PYTHON = sys.executable or r'C:\Users\Xbxac\AppData\Local\Microsoft\WindowsApps\python.exe'

# Scraper definitions in execution order
SCRAPERS = [
    {
        'name': 'politician_mapper',
        'file': 'politician_mapper.py',
        'description': 'Maps all active MPs, Senators, and key officials',
        'priority': 1,
        'timeout': 300,
        'outputs': ['politician_profiles/'],
    },
    {
        'name': 'lobbying_collector',
        'file': 'lobbying_collector.py',
        'description': 'Collects federal lobbying registry data',
        'priority': 2,
        'timeout': 300,
        'outputs': ['lobbying/'],
    },
    {
        'name': 'hansard_collector',
        'file': 'hansard_collector.py',
        'description': 'Scans Hansard parliamentary debates',
        'priority': 3,
        'timeout': 300,
        'outputs': ['hansard/'],
    },
    {
        'name': 'proactive_disclosure_scanner',
        'file': 'proactive_disclosure_scanner.py',
        'description': 'Scans government proactive disclosure portals',
        'priority': 4,
        'timeout': 600,
        'outputs': ['proactive_disclosure/'],
    },
    {
        'name': 'cija_pipeline_tracker',
        'file': 'cija_pipeline_tracker.py',
        'description': 'Tracks CIJA lobbying-to-vote pipelines',
        'priority': 5,
        'timeout': 240,
        'outputs': ['cija_pipeline/'],
    },
    {
        'name': 'analyze_bills',
        'file': 'analyze_bills.py',
        'description': 'Analyzes parliamentary bill voting patterns',
        'priority': 6,
        'timeout': 300,
        'outputs': ['bill_analysis/'],
    },
    {
        'name': 'corporate_registry_scanner',
        'file': 'corporate_registry_scanner.py',
        'description': 'Cross-references ISED Corporations Canada records with investigation entities',
        'priority': 7,
        'timeout': 120,
        'outputs': ['corporate_registry/'],
    },
    {
        'name': 'financial_transaction_scanner',
        'file': 'financial_transaction_scanner.py',
        'description': 'Analyzes political and foundation financial flows',
        'priority': 8,
        'timeout': 180,
        'outputs': [],
    },
    {
        'name': 'social_media_scanner',
        'file': 'social_media_scanner.py',
        'description': 'Monitors entity social pipelines with Nitter / SATOR',
        'priority': 9,
        'timeout': 300,
        'outputs': [],
    },
    {
        'name': 'network_topology_analyzer',
        'file': 'network_topology_analyzer.py',
        'description': 'Cross-references all sources into influence network',
        'priority': 98,
        'timeout': 600,
        'outputs': ['network_analysis/'],
    },
    {
        'name': 'jeff_brown_tracker',
        'file': 'jeff_brown_tracker.py',
        'description': 'Tracks Jeff Brown OSINT lawsuits pipeline via OSINTVector base',
        'priority': 99,
        'timeout': 120,
        'outputs': [],
    },
    {
        'name': 'local_ai_research_agent',
        'file': 'local_ai_research_agent.py',
        'description': 'LIRIL Local AI actively researches OSINT connections into insights',
        'priority': 100,  # Always runs last to capture final data correlations
        'timeout': 300,
        'outputs': [],
    },
]


def ensure_dirs():
    """Create necessary directories."""
    os.makedirs(LOG_DIR, exist_ok=True)
    for s in SCRAPERS:
        for out in s.get('outputs', []):
            os.makedirs(os.path.join(DATA_DIR, out), exist_ok=True)


def hash_run(scraper_name, start_time, exit_code, stdout_tail):
    """Empirical Magic Handoff — create a deterministic hash of the run."""
    payload = f"{scraper_name}|{start_time}|{exit_code}|{stdout_tail[-200:]}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


def run_scraper(scraper, dry_run=False):
    """Execute a single scraper and return its result dict."""
    script_path = os.path.join(SCRIPT_DIR, scraper['file'])

    if not os.path.exists(script_path):
        return {
            'name': scraper['name'],
            'status': 'SKIP',
            'reason': f"File not found: {scraper['file']}",
            'duration_s': 0,
        }

    result = {
        'name': scraper['name'],
        'file': scraper['file'],
        'description': scraper['description'],
        'started_at': datetime.now(timezone.utc).isoformat(),
    }

    if dry_run:
        result['status'] = 'DRY_RUN'
        result['duration_s'] = 0
        return result

    start = time.time()
    log_file = os.path.join(LOG_DIR, f"{scraper['name']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")

    try:
        proc = subprocess.run(
            [PYTHON, script_path],
            cwd=SCRIPT_DIR,
            capture_output=True,
            text=True,
            timeout=scraper.get('timeout', 300),
        )
        duration = time.time() - start
        result['exit_code'] = proc.returncode
        result['duration_s'] = round(duration, 2)
        result['status'] = 'OK' if proc.returncode == 0 else 'ERROR'
        result['stdout_tail'] = proc.stdout[-500:] if proc.stdout else ''
        result['stderr_tail'] = proc.stderr[-300:] if proc.stderr else ''
        result['emh_hash'] = hash_run(scraper['name'], result['started_at'], proc.returncode, proc.stdout or '')

        # Write full log
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write(f"=== {scraper['name']} ===\n")
            f.write(f"Started: {result['started_at']}\n")
            f.write(f"Exit code: {proc.returncode}\n")
            f.write(f"Duration: {duration:.2f}s\n")
            f.write(f"EMH Hash: {result['emh_hash']}\n")
            f.write(f"\n=== STDOUT ===\n{proc.stdout}\n")
            if proc.stderr:
                f.write(f"\n=== STDERR ===\n{proc.stderr}\n")
        result['log_file'] = log_file

    except subprocess.TimeoutExpired:
        result['status'] = 'TIMEOUT'
        result['duration_s'] = scraper.get('timeout', 300)
        result['error'] = f"Timed out after {scraper['timeout']}s"
    except Exception as e:
        result['status'] = 'CRASH'
        result['duration_s'] = round(time.time() - start, 2)
        result['error'] = str(e)

    return result


def save_status(results, total_duration):
    """Save the run status to scraper_status.json for the dashboard to read."""
    status = {
        'last_run': datetime.now(timezone.utc).isoformat(),
        'total_duration_s': round(total_duration, 2),
        'scraper_count': len(results),
        'ok_count': sum(1 for r in results if r.get('status') == 'OK'),
        'error_count': sum(1 for r in results if r.get('status') in ('ERROR', 'TIMEOUT', 'CRASH')),
        'results': results,
        'emh_run_hash': hashlib.sha256(json.dumps(results, default=str).encode()).hexdigest()[:20],
    }
    with open(STATUS_FILE, 'w', encoding='utf-8') as f:
        json.dump(status, f, indent=2, default=str)
    return status


def print_banner():
    """Print the TENET5 scraper banner."""
    print("\n" + "━" * 60)
    print("  TENET5 OSINT Scraper Orchestrator")
    print("  Millennial Falcon × Empirical Magic Handoff")
    print("━" * 60)
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Python: {PYTHON}")
    print(f"  Scrapers: {len(SCRAPERS)}")
    print("━" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description='TENET5 OSINT Scraper Orchestrator')
    parser.add_argument('--dry-run', action='store_true', help='Print what would run without executing')
    parser.add_argument('--scraper', type=str, help='Run only a specific scraper by name')
    parser.add_argument('--force', action='store_true', help='Run even if last run was < 1 hour ago')
    args = parser.parse_args()

    print_banner()
    ensure_dirs()

    # Check cooldown
    if not args.force and os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, 'r') as f:
                prev = json.load(f)
            last_run = datetime.fromisoformat(prev.get('last_run', '2000-01-01'))
            elapsed = (datetime.now(timezone.utc) - last_run).total_seconds()
            if elapsed < 3600:
                print(f"  ⏱ Last run was {elapsed/60:.0f} min ago. Use --force to override.\n")
                return
        except Exception:
            pass

    # Select scrapers
    scrapers = SCRAPERS
    if args.scraper:
        scrapers = [s for s in SCRAPERS if s['name'] == args.scraper]
        if not scrapers:
            print(f"  ✗ Unknown scraper: {args.scraper}")
            print(f"  Available: {', '.join(s['name'] for s in SCRAPERS)}")
            return

    # Execute
    results = []
    total_start = time.time()
    for i, scraper in enumerate(scrapers):
        print(f"  [{i+1}/{len(scrapers)}] {scraper['name']}")
        print(f"      {scraper['description']}")
        result = run_scraper(scraper, dry_run=args.dry_run)
        results.append(result)

        status_icon = {'OK': '✓', 'ERROR': '✗', 'TIMEOUT': '⏱', 'SKIP': '⊘', 'DRY_RUN': '◉', 'CRASH': '☠'}
        icon = status_icon.get(result['status'], '?')
        print(f"      {icon} {result['status']} ({result['duration_s']}s)")
        if result.get('emh_hash'):
            print(f"      EMH: {result['emh_hash']}")
        if result.get('error'):
            print(f"      Error: {result['error']}")
        print()

    total_duration = time.time() - total_start

    # Save status
    if not args.dry_run:
        status = save_status(results, total_duration)
        print(f"\n  Status saved to: {STATUS_FILE}")
        print(f"  Run hash: {status['emh_run_hash']}")

    # Summary
    ok = sum(1 for r in results if r.get('status') == 'OK')
    err = sum(1 for r in results if r.get('status') in ('ERROR', 'TIMEOUT', 'CRASH'))
    print(f"\n{'━' * 60}")
    print(f"  COMPLETE: {ok} OK / {err} errors / {total_duration:.1f}s total")
    print(f"{'━' * 60}\n")


if __name__ == '__main__':
    main()
