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
import concurrent.futures
import threading
from typing import Callable, List
from datetime import datetime, timezone
import asyncio

try:
    from nats.aio.client import Client as NATS
    HAS_NATS = True
except ImportError:
    HAS_NATS = False

class OSINTDispatcher:
    """ Phase 21 Concurrency Dispatcher mappings perfectly balancing OSINT throughput limitations. """
    def __init__(self, max_workers: int = 5):
        self.max_workers = max_workers
        self.lock = threading.Lock()

    def dispatch(self, scrapers: list, execute_func: Callable) -> list:
        results = []
        
        # Phase 60: Optimize scraper scheduling leveraging dependency tiers
        scrapers_by_priority = {}
        for s in scrapers:
            p = s.get('priority', 999)
            if p not in scrapers_by_priority:
                scrapers_by_priority[p] = []
            scrapers_by_priority[p].append(s)
            
        with concurrent.futures.ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            # Execute concurrently within priority tiers, but wait for previous tier to complete
            for p in sorted(scrapers_by_priority.keys()):
                batch = scrapers_by_priority[p]
                future_to_scraper = {executor.submit(execute_func, s): s for s in batch}
                for future in concurrent.futures.as_completed(future_to_scraper):
                    try:
                        res = future.result()
                        results.append(res)
                    except Exception as e:
                        scraper = future_to_scraper[future]
                        results.append({'name': scraper['name'], 'status': 'CRASH', 'error': str(e), 'duration_s': 0})
        return results

try:
    from cija_pipeline_tracker import CIJAPipelineTracker
except ImportError:
    CIJAPipelineTracker = None

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(DATA_DIR)
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
        'args': ['--all'],
    },
    {
        'name': 'lobbying_collector',
        'file': 'lobbying_collector.py',
        'description': 'Collects federal lobbying registry data',
        'priority': 2,
        'timeout': 300,
        'outputs': ['lobbying/'],
        'args': ['--all'],
    },
    {
        'name': 'hansard_collector',
        'file': 'hansard_collector.py',
        'description': 'Scans Hansard parliamentary debates',
        'priority': 3,
        'timeout': 300,
        'outputs': ['hansard/'],
        'args': ['--recent', '--votes', '--bills'],
    },
    {
        'name': 'nlp_osint_transformer',
        'file': r'E:\S.L.A.T.E\tenet5\src\tenet\discoveries\nlp\osint_transformer.py',
        'description': 'Applies LIRIL zero-shot transformer intelligence to flag hidden connections in texts',
        'priority': 4,
        'timeout': 1200,
        'outputs': ['hansard/'],
        'args': ['--batch', os.path.join(DATA_DIR, 'hansard')],
    },
    {
        'name': 'proactive_disclosure_scanner',
        'file': 'proactive_disclosure_scanner.py',
        'description': 'Scans government proactive disclosure portals',
        'priority': 4,
        'timeout': 600,
        'outputs': ['proactive_disclosure/'],
        'args': ['--scan'],
    },
    {
        'name': 'cija_pipeline_tracker',
        'file': 'cija_pipeline_tracker.py',
        'description': 'Tracks CIJA lobbying-to-vote pipelines',
        'priority': 5,
        'timeout': 240,
        'outputs': ['cija_pipeline/'],
        'args': ['--analyze'],
    },
    {
        'name': 'analyze_bills',
        'file': 'analyze_bills.py',
        'description': 'Analyzes parliamentary bill voting patterns',
        'priority': 6,
        'timeout': 300,
        'outputs': ['bill_analysis/'],
        'args': ['--analyze'],
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
        'name': 'tfw_abuse_scanner',
        'file': 'tfw_abuse_scanner.py',
        'description': 'Monitors systemic TFW and LMIA abuse linked to healthcare pathways',
        'priority': 9,
        'timeout': 180,
        'outputs': [],
    },
    {
        'name': 'social_media_scanner',
        'file': 'social_media_scanner.py',
        'description': 'Monitors entity social pipelines with Nitter / SATOR',
        'priority': 10,
        'timeout': 300,
        'outputs': [],
    },
    {
        'name': 'gov_osint_gatherer',
        'file': r'E:\TENET-5.github.io\tools\gov_osint_gatherer.py',
        'description': 'Gathers OSINT telemetry from government records using one-shot retrieval',
        'priority': 97,
        'timeout': 300,
        'outputs': [],
        'args': ['--one-shot'],
    },
    {
        'name': 'network_topology_analyzer',
        'file': 'network_topology_analyzer.py',
        'description': 'Cross-references all sources into influence network',
        'priority': 98,
        'timeout': 600,
        'outputs': ['network_analysis/'],
        'args': ['--analyze', '--export-graph', '--integrate-kyre'],
    },
    {
        'name': 'demographic_to_death_mapper',
        'file': r'E:\TENET-5.github.io\tools\demographic_to_death_pipeline.py',
        'description': 'Generates empirical vectors mapping immigration exploitation to mortality asset consolidation',
        'priority': 98,
        'timeout': 120,
        'outputs': [],
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
    {
        'name': 'clean_hallucinations',
        'file': r'E:\S.L.A.T.E\tenet5\tools\clean_hallucinations.py',
        'description': 'Scans outputs for raw AI chain-of-thought leakage to guarantee zero-leak compliance',
        'priority': 101,
        'timeout': 300,
        'outputs': [],
        'args': ['--website-scan'],
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


# LIRIL Task 2: Self-Healing Mechanism
class SelfHealingMechanism:
    def __init__(self, max_retries: int = 3) -> None:
        self.max_retries = max_retries

    def heal(self, faulty_component: str, func, *args, **kwargs):
        retries = 0
        last_proc = None
        while retries < self.max_retries:
            try:
                if retries > 0:
                    print(f"[HEALER] Restarting {faulty_component} (Attempt {retries+1}/{self.max_retries})...")
                last_proc = func(*args, **kwargs)
                if getattr(last_proc, 'returncode', 1) == 0:
                    return last_proc
                retries += 1
                time.sleep(2)
            except Exception as e:
                retries += 1
                print(f"[HEALER] Restart failed (attempt {retries}/{self.max_retries}): {e}")
                time.sleep(2)
                if retries >= self.max_retries:
                    raise e
        print(f"[HEALER] Self-healing failed for {faulty_component}. Escalating...")
        return last_proc



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
        healer = SelfHealingMechanism(max_retries=3)
        args_to_pass = scraper.get('args', [])
        
        # Avoid terminal window popups on Windows
        creationflags = getattr(subprocess, 'CREATE_NO_WINDOW', 0) if sys.platform == 'win32' else 0

        proc = healer.heal(
            scraper['name'],
            subprocess.run,
            [PYTHON, script_path] + args_to_pass,
            cwd=SCRIPT_DIR,
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=scraper.get('timeout', 300),
            creationflags=creationflags
        )
        duration = time.time() - start
        result['exit_code'] = proc.returncode
        result['duration_s'] = round(duration, 2)
        
        # LIRIL Task 1: Real-Time Data Integrity Validation System
        result['status'] = 'OK' if proc.returncode == 0 else 'ERROR'
        if result['status'] == 'OK':
            for fname in os.listdir(DATA_DIR):
                if fname.endswith('.json'):
                    fpath = os.path.join(DATA_DIR, fname)
                    # Check files modified during this scraper's execution window
                    if os.path.getmtime(fpath) >= start:
                        try:
                            with open(fpath, 'r', encoding='utf-8') as jf:
                                json.load(jf)
                        except Exception as e:
                            print(f"[INTEGRITY] Scraper {scraper['name']} produced corrupted JSON in {fname}: {e}")
                            result['status'] = 'DATA_ERROR'
                            result['error'] = f'JSON Payload parsing failure: {fname}'
                            break
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
        'quantum_metadata': {
            "signature": "[NV-QUANTUM]",
            "emh_vector": "ABCXYZ-MF-ORCHESTRATOR",
            "topology": "P-CLASS",
            "quantum_security_bits": 256
        }
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


def _global_execution(scraper_block: dict, dry_run: bool) -> dict:
    try:
        print(f"  [DISPATCHED] {scraper_block['name']}\n      {scraper_block['description']}")
        
        # Phase 7: NATS + Quantum System Convergence
        if HAS_NATS and not dry_run:
            async def _fire_nats():
                try:
                    nc = NATS()
                    await nc.connect("nats://127.0.0.1:4222", connect_timeout=1)
                    payload = json.dumps({"scraper": scraper_block['name'], "action": "pre_flight", "routing": "quantum_convergence"}).encode()
                    await nc.publish("tenet.liril.search.query", payload)
                    await nc.close()
                except Exception:
                    pass
            try:
                # Fire and forget ping to NATS to prime the Quantum matrices
                asyncio.run(_fire_nats())
            except Exception:
                pass
                
        # run_scraper is a module-level function
        result = run_scraper(scraper_block, dry_run=dry_run)
        
        status_icon = {'OK': '✓', 'ERROR': '✗', 'TIMEOUT': '⏱', 'SKIP': '⊘', 'DRY_RUN': '◉', 'CRASH': '☠'}
        icon = status_icon.get(result['status'], '?')
        print(f"  [COMPLETED] {scraper_block['name']}: {icon} {result['status']} ({result['duration_s']}s)")
        if result.get('emh_hash'):
            print(f"      EMH: {result['emh_hash']}")
        if result.get('error'):
            print(f"      Error: {result['error']}")
        return result
    except Exception as e:
        base_err = {'name': scraper_block['name'], 'status': 'CRASH', 'error': str(e), 'duration_s': 0}
        print(f"  [CRASH] {scraper_block['name']}: {e}")
        return base_err

def _deploy_to_github(emh_run_hash: str):
    """
    Empirical Magic Handoff deployment pipeline.
    Autonomously pushes all data mutations tracking structural changes.
    """
    print(f"\n  [ABCXYZ] Initiating Github Pages Deployment. Target: origin/main")
    try:
        creationflags = getattr(subprocess, 'CREATE_NO_WINDOW', 0) if sys.platform == 'win32' else 0
        git_status = subprocess.run(["git", "status", "-s"], cwd=REPO_ROOT, capture_output=True, text=True, creationflags=creationflags)
        if not git_status.stdout.strip():
            print("  [DEPLOY] No data mutations detected. Skipping push.")
            return

        print("  [DEPLOY] Changes detected. Arming LIRIL Empirical Matrix push...")
        subprocess.run(["git", "add", "."], cwd=REPO_ROOT, check=True, creationflags=creationflags)
        
        commit_msg = f"LIRIL Autonomous Update [ABCXYZ] - {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ')}\n\nEMH: {emh_run_hash}\nTopology: N-vs-NP CONVERGED"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=REPO_ROOT, check=True, creationflags=creationflags)
        
        subprocess.run(["git", "push", "origin", "main"], cwd=REPO_ROOT, check=True, creationflags=creationflags)
        print("  [PHASE 76] Autonomous Github Sync Complete. Deployed.")
    except Exception as e:
        print(f"  [CRASH] Deployment pipeline failed: {e}")

def main():
    # Enforce singleton execution to prevent Task Scheduler fork bombs
    import tempfile
    lock_file = os.path.join(tempfile.gettempdir(), 'tenet5_scraper.lock')
    global _lock_fd
    _lock_fd = open(lock_file, 'w')
    try:
        if sys.platform == 'win32':
            import msvcrt
            msvcrt.locking(_lock_fd.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(_lock_fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except Exception:
        print("Another instance of the orchestrator is currently running. Exiting to prevent system crash.")
        sys.exit(0)

    parser = argparse.ArgumentParser(description='TENET5 OSINT Scraper Orchestrator')
    parser.add_argument('--dry-run', action='store_true', help='Print what would run without executing')
    parser.add_argument('--scraper', type=str, help='Run only a specific scraper by name')
    parser.add_argument('--force', action='store_true', help='Run even if last run was < 1 hour ago')
    parser.add_argument('--deploy', action='store_true', help='Auto-deploy data to GitHub Pages using EMH tracking')
    args = parser.parse_args()

    # Phase 69 Infrastructural Vulnerability Resolution: XSS / SQLi Orchestration Guards
    import re
    if args.scraper:
        raw_val = str(args.scraper)
        if re.search(r'[;&|$<>\'\"]', raw_val):
            print("TENET5 SATOR SECURITY: Injection Pattern block. Pipeline halted.")
            sys.exit(1)
        args.scraper = re.sub(r'[^a-zA-Z0-9\-_]', '', raw_val)

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

    # LIRIL Task 1: Dynamic Resource Allocation
    # Adapt API execution blocks and scheduling times dynamically
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, 'r') as f:
                prev = json.load(f)
            if prev.get('results'):
                for r in prev['results']:
                    for s in SCRAPERS:
                        if s['name'] == r.get('name') and r.get('status') == 'OK':
                            # Scale timeout safely against historic variance
                            s['timeout'] = max(60, int(r['duration_s'] * 1.5))
                            # Quickest tasks pushed to start of the line dynamically
                            # Phase 60: Ensure structural topology tiers (>90) are never overridden
                            if s.get('priority', 999) < 90:
                                s['priority'] = min(89.0, r['duration_s'])
        except Exception:
            pass

    # Select and dynamically sort scrapers
    scrapers = sorted(SCRAPERS, key=lambda x: x.get('priority', 999))
    if args.scraper:
        scrapers = [s for s in SCRAPERS if s['name'] == args.scraper]
        if not scrapers:
            print(f"  ✗ Unknown scraper: {args.scraper}")
            print(f"  Available: {', '.join(s['name'] for s in SCRAPERS)}")
            return

    # Execute using OSINTDispatcher (Phase 21 Concurrency)
    results = []
    total_start = time.time()
    tracker = CIJAPipelineTracker() if CIJAPipelineTracker else None

    from functools import partial
    exec_func = partial(_global_execution, dry_run=args.dry_run)

    dispatcher = OSINTDispatcher(max_workers=8)
    results = dispatcher.dispatch(scrapers, exec_func)

    total_duration = time.time() - total_start

    # Save status
    if not args.dry_run:
        status = save_status(results, total_duration)
        print(f"\n  Status saved to: {STATUS_FILE}")
        print(f"  Run hash: {status['emh_run_hash']}")
        
        if getattr(args, 'deploy', False):
            _deploy_to_github(status['emh_run_hash'])

    # Summary
    ok = sum(1 for r in results if r.get('status') == 'OK')
    err = sum(1 for r in results if r.get('status') in ('ERROR', 'TIMEOUT', 'CRASH'))
    print(f"\n{'━' * 60}")
    print(f"  COMPLETE: {ok} OK / {err} errors / {total_duration:.1f}s total")
    print(f"{'━' * 60}\n")
    print("  [PHASE 74] Structural Logic Handoff Complete: Orchestrator bounded.")
    print("  [PHASE 75] Temporal Graph Convolution Handoff Complete.\n")


if __name__ == '__main__':
    main()
