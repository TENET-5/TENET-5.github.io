# TENET5 Automation Diagnostic — Why nothing has ever really worked
Date: 2026-04-18 · Requested by: Daniel Perry · Author: claude_code (SATOR Manager)

## TL;DR
The user's complaint is correct. Two distinct failures, both severe:

1. **Formally-documented daemons have never worked.** Nine daemons
   (nemoclaw_daemon, liril_voice_daemon, posting_daemon, sator_convergence_daemon,
   cicd_health_monitor, nemoclaw_health_monitor, nemo_controller, liril_cicd_loop,
   nemoclaw_ops) die on startup with `ConnectionRefusedError: 4223`. Their logs
   are 27–31 days stale. **Root cause: a NATS port mismatch** — every daemon
   hardcodes `nats://127.0.0.1:4223` via `.env`, but `Boot_TENET5.ps1` starts
   NATS on `--port 4222`. The hosts have been using Docker-guest NATS on 4222
   the whole time; host NATS on 4223 never came up.
2. **A different set of daemons IS running — and making things worse.** Ten+
   Python processes are active right now (`liril_autonomous_daemon.py`,
   `auto_work_loop.py`, `liril_cicd_loop.py`, `self_repair.py`,
   `cross_agent_bridge.py`, etc.), many double-instanced from auto-restart
   without cleanup. These processes committed **1,357 commits in the last 7
   days** under the git identity `Antigravity Agent <admin@tenet5.local>`.
   Commit messages look like "[LIRIL PHASE 14] Mass inject walkthrough-
   enhancements.js into 295 HTML pages", "[PHASE 11] Atmosphere optimizer
   matrices applied. Genocide-Evidence EMH tracker badge deployed",
   "[PHASE 11] ABCXYZ Millennial Falcon metrics".

**The two failures together explain the user's statement:**
   - "Our claw system isn't working" — correct. NemoClaw and friends are dead.
   - "The website isn't being autonomously designed by AI" — correct. What
     IS running is not design. It's a high-frequency garbage-emitter that
     re-injects previously-removed code, coins pseudo-scientific jargon
     ("Millennial Falcon", "ABCXYZ", "Empirical Magic Handoff",
     "Atmosphere optimizer", "Genocide-Evidence EMH tracker"), and pollutes
     the codebase faster than a human can clean it up.

## Evidence

### Port mismatch (explains dead daemons)
- `.env` line 55:  `NATS_URL=nats://127.0.0.1:4223`
- `Boot_TENET5.ps1` line 143: `Start-Process $NatsBin -ArgumentList "--port","4222" ...`
- `Boot_TENET5.ps1` line 79:  `$env:NATS_URL = "nats://127.0.0.1"` (no port → defaults to 4222)
- Daemon source (examples):
  - `nemoclaw_daemon.py:56` — `NATS_URL = os.environ.get("NATS_URL", ..., "nats://127.0.0.1:4223")`
  - `liril_voice_daemon.py:30` — same pattern
  - `sator_convergence_daemon.py:19` — same pattern
- `liril_cicd_loop.log:22-47` — repeats `ConnectionRefusedError: 4223` every 15 minutes, never recovers.

### Running processes (explains garbage output)
Live processes observed via `Get-CimInstance Win32_Process`:
```
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 liril_autonomous_daemon.py   (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 src/tenet/auto_work_loop.py  (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 E:\S.L.A.T.E\tenet5\liril_cicd_loop.py (× 2)
E:\S.L.A.T.E\.venv\Scripts\pythonw.exe -X utf8 src/tenet/liril_cicd_coordinator.py
E:\S.L.A.T.E\.venv\Scripts\pythonw.exe -X utf8 src/tenet/liril_scheduler.py
E:\S.L.A.T.E\.venv\Scripts\python.exe -X utf8 src/tenet/liril_npu_service.py     (× 2)
E:\S.L.A.T.E\.venv\Scripts\python.exe -X utf8 src/tenet/aurora/nemo_server.py     (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 tools/mobile_bridge_standalone.py (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 tools/tenet5_sessions_agent.py --serve (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 src/tenet/liril_guardian.py  (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 src/tenet/liril_factory.py   (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 src/tenet/cross_agent_bridge.py (× 2)
E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe -X utf8 tools/self_repair.py --serve (× 2)
```
Two instances of each = supervisor auto-restart stacking zombies without cleanup.

### Rogue commit rate
- `git log --since='7 days ago' --format=%an | sort | uniq -c` → **1,357 commits, Antigravity Agent**
- Sampled recent messages show a continuous stream of:
  - `[LIRIL PHASE 14] Mass inject walkthrough-enhancements.js into 295 HTML pages`  ← undid the user-fix of the same hour
  - `[LIRIL DEPLOY] ETHICS/OPERA: Push latest OSINT scraper outputs — ActionGuard-verified SEED=118400`
  - `[PHASE 13] ABCXYZ telemetry + autonomous scraper output`
  - `[PHASE 11] Global injection of Empirical Magic Handoff & Millennial Falcon ABCXYZ metrics`
  - `[PHASE 11] Atmosphere optimizer matrices applied. Genocide-Evidence EMH tracker badge deployed`

### The specific "undo-fix" pattern
- `75da91c8` (04:53 UTC today) — user-directed fix: network-analysis + OSINT Layer 4
- `c34550bf` (05:10 UTC) — user-directed fix: LIRIL audit + walkthrough tag cleanup (removed walkthrough-enhancements.js from 292 pages)
- `4330be3f` (03:57 UTC next day, ~22h later) — **rogue commit: re-injected walkthrough-enhancements.js into 295 HTML pages**
- This is the closed loop: user asks for fix → claude ships fix → rogue daemon undoes fix → user sees the original problem persist → user gets frustrated.

## Why every manual "restart LIRIL" attempt has failed too
- `tools/liril_ask.py` defaults to `nats://127.0.0.1:4223` (line 65–67)
- Host NATS on 4223 has never been started (see above port mismatch)
- Docker-guest NATS IS up on 4222
- So `liril_ask.py classify/advise/execute` → `no responders available for request`
- Only `liril_ask.py infer` works, because it routes via `mercury.infer` subject which `aurora/nemo_server.py` (running) subscribes to on 4222.

## What DOES work right now
- NATS 4222 (docker guest) ✅
- llama-server 8082 (GPU0) + 8083 (GPU1) ✅
- `mercury.infer` → LIRIL inference via NemoServer ✅  (latency ~2–8s)
- `tenet5.liril.status` (NPU status) ✅
- GitHub Pages auto-deploy on push to main ✅

## What does NOT work
- Every `tenet5.liril.{classify,advise,execute,train,sync}` subject — no responders.
- Every daemon in the "formally-documented" list — connection-refused loop.
- Every "autonomous" claim about design quality — the running daemons emit garbage.
- The crash-recovery section of `CLAUDE.md` — the commands bring up NATS on 4223 which collides with the 4222 reality. If you run it, you get a new orphaned NATS that no-one connects to.

## The fix plan
Executed in this order. Each step verifies before the next.

### Step 1 — Stop the garbage emitter (IMMEDIATE)
Kill the rogue auto-commit loop. Identify the exact script making the `[PHASE N]`
commits (likely `liril_autonomous_daemon.py` or `auto_work_loop.py` driven by the
Gemini/Antigravity IDE agent, possibly coordinated by
`infrastructure/gastown/scripts/generate-newsletter.py` or similar). Pause it
until its commit-quality gate is built.

### Step 2 — Unify NATS port (NEXT)
Option A: Change `.env` to `NATS_URL=nats://127.0.0.1:4222` so daemons match
reality. **Preferred** — single-line change, cascades through all daemons.
Option B: Start host NATS on 4223 as documented. Higher ops cost.

### Step 3 — Replace the garbage loop with a focused design loop
A single python daemon, `tools/liril_site_designer.py`, that:
  - Reads user-stated goals from `data/user_goals.json`.
  - Each cycle: picks ONE specific improvement (better page explainer, fix
    broken link, add Officer-findings citation, etc.).
  - Drafts the change via `mercury.infer`.
  - Runs LIRIL audit on the draft (same hallucination gate we just proved works
    for Layer 4).
  - Only commits if LIRIL verdict is `PASS` AND the change passes a
    local-goal-alignment check.
  - Commit message format: `autonomous(<goal-id>): <one-line-title>` — no
    `[PHASE N]` jargon, no buzzwords, no ABCXYZ.

### Step 4 — Supervisor with proper cleanup
Replace the current auto-restart pattern that stacks zombies with `pidfile`-based
single-instance guard + crash-log-on-exit.

### Step 5 — Public visibility
Surface the autonomous loop's activity on `liril-autonomous.html` so the user
can see in real-time what the daemon proposed, whether LIRIL PASS/WATCH/FAILed,
and whether each proposal was committed or rejected.

## Constants verified
- SYSTEM_SEED = 118400 ✅
- CUDA_VISIBLE_DEVICES = 0,1 (dual RTX 5070 Ti) ✅
- 127.0.0.1 only (no external network binds observed) ✅
- UTF-8 encoding standard (observed in recent file writes) ✅
