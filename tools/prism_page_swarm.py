#!/usr/bin/env python3
"""PRISM page swarm — correct EVERY public HTML page in one parallel lap.

Why this exists: site-duty used serial apply_one_theme + optional SEO/voice
steps that time out or skip, so pages stayed wrong for hours. This swarm is
the instant-correct path:

  1. Parallel theme/chrome/leak/compliance/heal (apply_one_theme --jobs N)
  2. Inject liril-live.js on interiors that still lack it
  3. Write proof: data/prism_page_swarm_last.json

    python tools/prism_page_swarm.py --json
    python tools/prism_page_swarm.py --json --jobs 12
    python tools/prism_page_swarm.py --json --changed-only

Site duty calls this FIRST every lap (before slow SEO / acuity).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
PROOF = ROOT / "data" / "prism_page_swarm_last.json"
PROOF2 = Path(r"C:\PRISM\log\prism_page_swarm_last.json")
_CNW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

SKIP_PARTS = {".git", "node_modules", "_site", "static_dump", "trash", "tools", "lab"}
LIVE_JS = "js/liril-live.js?v=1"
VOICE_JS_RE = re.compile(
    r'(<script\b[^>]*src="[^"]*liril-voice\.js[^"]*"[^>]*>\s*</script>)',
    re.I,
)


def _utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _public_html() -> list[Path]:
    out: list[Path] = []
    for p in ROOT.rglob("*.html"):
        if any(part in SKIP_PARTS for part in p.parts):
            continue
        out.append(p)
    return sorted(out)


def _inject_live_js(path: Path) -> bool:
    """Ensure liril-live.js loads after liril-voice on public pages."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return False
    if "liril-live.js" in text:
        return False
    if "liril-voice.js" not in text and path.name != "index.html":
        return False
    prefix = ""
    try:
        depth = len(path.parent.relative_to(ROOT).parts)
        prefix = "../" * depth
    except ValueError:
        pass
    tag = f'<script src="{prefix}{LIVE_JS}"></script>'
    if VOICE_JS_RE.search(text):
        new = VOICE_JS_RE.sub(r"\1\n" + tag, text, count=1)
    elif "</body>" in text.lower():
        new = re.sub(r"</body>", tag + "\n</body>", text, count=1, flags=re.I)
    else:
        return False
    if new == text:
        return False
    path.write_text(new, encoding="utf-8", newline="\n")
    return True


def _run_theme(jobs: int, changed_only: bool, paths: list[str] | None) -> dict:
    apply = TOOLS / "apply_one_theme.py"
    if not apply.is_file():
        return {"ok": False, "error": "apply_one_theme.py missing"}
    cmd = [sys.executable, str(apply), "--jobs", str(jobs)]
    if changed_only:
        cmd.append("--changed-only")
    if paths:
        cmd.append("--paths")
        cmd.extend(paths)
    try:
        r = subprocess.run(
            cmd,
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=600,
            creationflags=_CNW,
        )
        return {
            "ok": r.returncode == 0,
            "exit": r.returncode,
            "stdout": (r.stdout or "")[-1200:],
            "stderr": (r.stderr or "")[-400:],
        }
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "error": str(exc)[:300]}


def swarm(*, jobs: int = 0, changed_only: bool = False, paths: list[str] | None = None) -> dict:
    if jobs <= 0:
        jobs = min(12, max(4, (os.cpu_count() or 4)))

    theme = _run_theme(jobs, changed_only, paths)

    pages = _public_html()
    if paths:
        want = {p.replace("\\", "/").lstrip("./") for p in paths}
        pages = [
            p
            for p in pages
            if str(p.relative_to(ROOT)).replace("\\", "/") in want or p.name in want
        ]

    live_changed = 0
    live_errors: list[dict] = []

    def _one(p: Path) -> tuple[str, bool, str]:
        try:
            ch = _inject_live_js(p)
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            return rel, ch, ""
        except Exception as exc:  # noqa: BLE001
            return p.name, False, str(exc)[:160]

    if pages:
        with ThreadPoolExecutor(max_workers=jobs) as pool:
            futs = [pool.submit(_one, p) for p in pages]
            for fut in as_completed(futs):
                rel, ch, err = fut.result()
                if err:
                    live_errors.append({"page": rel, "error": err})
                elif ch:
                    live_changed += 1

    doc = {
        "ok": bool(theme.get("ok")) and not live_errors,
        "verdict": "PAGE_SWARM_PASS" if theme.get("ok") and not live_errors else "PAGE_SWARM_PARTIAL",
        "ts": _utc(),
        "jobs": jobs,
        "changed_only": changed_only,
        "pages_scanned": len(pages),
        "theme": theme,
        "liril_live_injected": live_changed,
        "live_errors": live_errors[:30],
        "note": "Parallel theme apply + liril-live inject. First job every site-duty lap.",
    }
    payload = json.dumps(doc, indent=2) + "\n"
    for dest in (PROOF, PROOF2):
        try:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(payload, encoding="utf-8")
        except OSError:
            pass
    return doc


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--jobs", type=int, default=0)
    ap.add_argument("--changed-only", action="store_true")
    ap.add_argument("--paths", nargs="*", default=None)
    args = ap.parse_args()
    doc = swarm(jobs=args.jobs, changed_only=args.changed_only, paths=args.paths)
    if args.json:
        print(json.dumps(doc, indent=2))
    else:
        print(doc["verdict"], "pages", doc["pages_scanned"], "live+", doc["liril_live_injected"])
    return 0 if doc.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
