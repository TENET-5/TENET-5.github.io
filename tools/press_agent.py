#!/usr/bin/env python3
"""TENET5 PRESS AGENT — the local AI's hands on the website.

LIRIL (or any local orchestrator) manages the site by running THIS, never
by writing HTML. WordPress model: content in, themed site out, guarded.

    python tools/press_agent.py draft     # mesh-draft new wire items from real data/ files
    python tools/press_agent.py articles  # AI desk articles from briefing + wire (no invent)
    python tools/press_agent.py build     # validate content -> render site
    python tools/press_agent.py publish   # build + surgical commit (brand guard fires) + push

Safety rails:
  - content schema validated before any build; a post with no sources
    MUST carry "sample": true (anti-fabrication rule)
  - only press-owned paths are ever staged (never `git add -A`)
  - the pre-commit brand guard remains the final gate
  - mesh drafting goes through PRISM's own engine; drafts land in
    content/drafts/ for review, never straight to posts/
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
POSTS = CONTENT / "posts"
DRAFTS = CONTENT / "drafts"
OWNED = ["index.html", "evidence-index.html", "daily-briefing.html",
         "network-analysis.html", "story", "content"]

MESH = "E:/S.L.A.T.E/prism/os/hydrogen/prism_mesh.py"  # PRISM p256 mesh (local only)

TYPES = {"wire", "feature", "claim", "dossier"}
REQUIRED = {"slug", "type", "kicker", "title", "date"}


def fail(msg: str) -> int:
    print(f"[press-agent] BLOCKED: {msg}")
    return 1


def validate() -> list[str]:
    errs = []
    for f in sorted(POSTS.glob("*.json")):
        try:
            p = json.loads(f.read_text(encoding="utf-8"))
        except Exception as e:
            errs.append(f"{f.name}: invalid JSON ({e})")
            continue
        missing = REQUIRED - set(p)
        if missing:
            errs.append(f"{f.name}: missing {sorted(missing)}")
        if p.get("type") not in TYPES:
            errs.append(f"{f.name}: type must be one of {sorted(TYPES)}")
        has_source = any(s.get("url") for s in p.get("sources", []))
        if not has_source and not p.get("sample"):
            errs.append(f"{f.name}: no source URL and not marked sample — "
                        f"uncited content cannot publish (anti-fabrication rule)")
        if p.get("type") == "claim" and p.get("verdict") not in ("supported", "unsupported", "context"):
            errs.append(f"{f.name}: claim needs verdict supported|unsupported|context")
    return errs


def build() -> int:
    errs = validate()
    if errs:
        for e in errs:
            print(f"[press-agent]   {e}")
        return fail(f"{len(errs)} content error(s)")
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "press.py")])
    return r.returncode


def publish() -> int:
    if build() != 0:
        return 1
    subprocess.run(["git", "-C", str(ROOT), "add", "--"] + OWNED, check=True)
    r = subprocess.run(["git", "-C", str(ROOT), "commit",
                        "-m", "press: content update via press_agent (LIRIL-managed)"])
    if r.returncode != 0:
        return fail("commit failed or brand guard blocked — read output above")
    r = subprocess.run(["git", "-C", str(ROOT), "push", "origin", "main"])
    return r.returncode


def draft() -> int:
    """Ask PRISM's mesh to draft wire items from REAL data files. Drafts go to
    content/drafts/ for review — the agent never publishes unreviewed copy."""
    if not Path(MESH).is_file():
        return fail("PRISM mesh not found on this machine")
    seeds = []
    anomalies = ROOT / "data" / "live_anomaly_scan.json"
    if anomalies.is_file():
        try:
            d = json.loads(anomalies.read_text(encoding="utf-8"))
            items = d if isinstance(d, list) else d.get("anomalies") or d.get("flags") or []
            for a in items[:3]:
                seeds.append(("procurement anomaly", json.dumps(a)[:400]))
        except Exception:
            pass
    if not seeds:
        return fail("no real data seeds found in data/ — refusing to invent news")
    DRAFTS.mkdir(exist_ok=True)
    prompts = [
        f"Write a factual 20-word Canadian newsroom headline-and-dek for this real {kind}, "
        f"no names of private individuals, cite nothing you can't see here: {blob}"
        for kind, blob in seeds
    ]
    r = subprocess.run([sys.executable, MESH, "--tier", "strong", "--n-gen", "60"],
                       input="\n".join(prompts), capture_output=True, text=True, timeout=600)
    out = (DRAFTS / "mesh_drafts.txt")
    out.write_text(r.stdout, encoding="utf-8")
    print(f"[press-agent] {len(prompts)} draft(s) written to {out.relative_to(ROOT)} — review, "
          f"convert good ones to content/posts/*.json, then run build")
    return 0


def articles() -> int:
    """Deterministic AI desk articles from briefing + wire (no invented facts).
    Then rebuild presentation script so LIRIL's guide matches the new package."""
    gen = ROOT / "tools" / "build_liril_news_articles.py"
    if not gen.is_file():
        return fail("build_liril_news_articles.py missing")
    r = subprocess.run([sys.executable, str(gen)], cwd=str(ROOT))
    if r.returncode != 0:
        return fail("article generator failed")
    pres = ROOT / "tools" / "build_liril_news_presentation.py"
    if pres.is_file():
        subprocess.run([sys.executable, str(pres)], cwd=str(ROOT))
    return build()


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else "build"
    if mode == "build":
        return build()
    if mode == "publish":
        return publish()
    if mode == "draft":
        return draft()
    if mode == "articles":
        return articles()
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main())
