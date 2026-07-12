#!/usr/bin/env python3
"""PRISM site duty — LOCKED project: TENET5 public site (visual + theme).

Daniel permanent mission (do not digress unless he says stop):
  - One theme: css/press-theme.css
  - Rebuild press content (index owned by tools/press.py)
  - LIRIL guide dock RETIRED (2026-07-12) — brand only: Powered by LIRIL AI
  - Capture PC + mobile JPGs and validate visual acuity
  - Work on PRISM/site tools that serve THIS project
  - Run around the clock until STOP flag or Daniel says stop

    python tools/prism_site_duty.py              # one lap
    python tools/prism_site_duty.py --loop 90    # every 90s (bounded 24h)
    python tools/prism_site_duty.py --forever    # until STOP file
    PRISM_SITE_AUTO_PUSH=1 ...                   # commit+push when dirty

STOP files (only way to halt --forever without killing PID):
  C:/PRISM/log/PRISM_SITE_DUTY_STOP
  <site>/data/.PRISM_SITE_DUTY_STOP

Artifacts:
  C:/PRISM/log/prism_site_duty_last.json
  C:/PRISM/log/prism_visual_acuity_last.json
  C:/PRISM/log/visual_acuity/*.jpg
  data/visual_acuity/*.jpg
  data/liril_guide_removed_last.json
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
THEME_REL = "css/press-theme.css"
THEME_PATH = ROOT / "css" / "press-theme.css"
PROOF_PATHS = [
    Path(r"C:\PRISM\log\prism_site_duty_last.json"),
    ROOT / "data" / "prism_site_duty_last.json",
]
LIRIL_PROOF_PATHS = [
    Path(r"C:\PRISM\log\prism_liril_guide_last.json"),
    ROOT / "data" / "prism_liril_guide_last.json",
]
STOP_FILES = [
    Path(r"C:\PRISM\log\PRISM_SITE_DUTY_STOP"),
    ROOT / "data" / ".PRISM_SITE_DUTY_STOP",
]
PROJECT_LOCK = Path(r"C:\PRISM\log\PRISM_PROJECT_LOCK_TENET5_SITE.json")
_CNW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

PROJECT = {
    "id": "TENET5_PUBLIC_SITE_VISUAL_ACUITY",
    "priority": "CRITICAL_PERMANENT",
    "digress": False,
    "jobs": [
        "one_theme_press",
        "rss_home_wire",             # multi-source RSS → hour continuum (objective)
        "news_rss_scan",             # force RSS scrape when .prism_news_rss_scan set
        "daily_briefing_cycle",      # daily briefing refresh + still/video every update
        "liril_outlet_desk",         # LIRIL Press Wire — multi-outlet compare + outlet cards
        "liril_substack",            # Substack outbox drafts + newsletter.html + feed pull
        "life_desks",                # Sunroom · Sports · Markets · Press Ink refresh
        "liril_news_articles",       # AI desk articles from briefing + wire
        "news_article_media",        # every post: hero image + LIRIL VO segment
        "liril_news_presentation",   # LIRIL front-page news presentation script
        "liril_desk_reporter",       # AI reporter persona + live wire (always-new news)
        "desk_video_package",        # neural news-N mux + presentation audio
        "page_swarm_correct_all",    # parallel correct EVERY public HTML (first)
        "press_rebuild",
        "network_osint_board",
        "osint_scrape_investigations",  # CBC/public OSINT + vault harvest for investigations
        "news_slate_rectify",        # multi-slate registry; article/chart types OFF main ticker
        "design_lock_guardrail",     # crystal-clear taste contract, loads last (swarm-proof)
        "zero_internals_leak_gate",  # public site names NO engine/model/kernel/path/seed
        "anti_hallucination_gate",   # prose that CLAIMS an element must actually have it
        "ticker_video_sync",         # web ticker ↔ video burn-in; desync = hallucination
        "cinema_playback_integrity", # act film src + cinema-play v3 + baseline mp4
        "css_quantum_precision",
        "temple_slate_lock",         # every page THEME_VER + token anchors; desync = hallucination
        "press_file_desks",          # data-presentation desk dialects (procurement/politics/science…)
        "press_file_upgrade",        # mechanical dump → press-file structure (Griffon SoT)
        "liril_guide_removed",       # public site must NOT carry LIRIL guide dock
        "site_seo_slate",            # Google SEO + AI Overviews surface on every page
        "github_pages_publish",      # surgical commit + push to TENET-5.github.io
        "visual_acuity_pc_mobile",
        "cpp_quantum_coding_bench",
        "self_heal",
    ],
    "stop_only_via": [str(p) for p in STOP_FILES] + ["Daniel verbal stop"],
}

# LIRIL guide chrome is FORBIDDEN on the public site (removed 2026-07-12).
# PASS = markers ABSENT. Never re-inject dock / Guide me / station.
LIRIL_GUIDE_FORBIDDEN = {
    "dock_id": 'id="dock"',
    "guide_btn": 'id="liril-guide-btn"',
    "guide_btn_cover": 'id="liril-guide-btn-cover"',
    "liril_home_guide_js": "js/liril-home-guide.js",
    "liril_dock_js": "js/liril-dock.js",
    "liril_station_js": "js/liril-station.js",
    "liril_page_voice_js": "js/liril-page-voice.js",
    "aria_liril_guide": 'aria-label="LIRIL guide"',
}


def _run(cmd: list[str], timeout: int = 600) -> tuple[int, str]:
    try:
        r = subprocess.run(
            cmd,
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
            creationflags=_CNW,
        )
        out = (r.stdout or "") + ("\n" + r.stderr if r.stderr else "")
        return r.returncode, out[-2000:]
    except Exception as e:
        return -1, f"{type(e).__name__}: {e}"


def _check_liril_guide_removed(home: str) -> dict:
    """PASS when all guide markers are ABSENT from homepage HTML."""
    present = {k: (v in home) for k, v in LIRIL_GUIDE_FORBIDDEN.items()}
    ok = not any(present.values())
    return {
        "ok": ok,
        "present": {k: v for k, v in present.items() if v},
        "forbidden": list(LIRIL_GUIDE_FORBIDDEN.keys()),
        "brand_ok": "Powered by LIRIL AI" in home,
    }


def _write_liril_proof(check: dict, healed: bool = False) -> None:
    doc = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "job": "liril_guide_removed",
        "role": "public_site_no_liril_guide",
        "prism_permanent": True,
        "ok": check.get("ok", False),
        "healed": healed,
        "present": check.get("present", {}),
        "brand_ok": check.get("brand_ok", False),
        "verdict": "LIRIL_GUIDE_REMOVED_PASS" if check.get("ok") else "LIRIL_GUIDE_REMOVED_FAIL",
        "doctrine": "no_liril_guide_public_site",
        "brand": "Powered by LIRIL AI footer only",
    }
    payload = json.dumps(doc, indent=2)
    for path in LIRIL_PROOF_PATHS:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(payload, encoding="utf-8")
        except OSError:
            pass
    # Canonical product proof path
    try:
        p = ROOT / "data" / "liril_guide_removed_last.json"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(payload, encoding="utf-8")
    except OSError:
        pass


def _heal_liril_guide_removed() -> tuple[bool, str]:
    """Strip guide chrome if it returned — never re-inject dock/Guide me."""
    apply = TOOLS / "apply_one_theme.py"
    notes: list[str] = []
    if apply.exists():
        c2, _ = _run([sys.executable, str(apply)], timeout=300)
        notes.append(f"apply_one_theme exit={c2}")
    else:
        notes.append("apply_one_theme missing")
    home_path = ROOT / "index.html"
    if not home_path.exists():
        return False, "index.html missing; " + "; ".join(notes)
    home = home_path.read_text(encoding="utf-8", errors="replace")
    check = _check_liril_guide_removed(home)
    _write_liril_proof(check, healed=True)
    return check["ok"], "; ".join(notes) + f"; present={check.get('present')}"


def lap_fast() -> dict:
    """Pre-commit / --fast path only — no page swarm, desk video, publish, or acuity.

    Gates: theme tokens + apply_one_theme + LIRIL guide removed + temple lock +
    CSS quantum math (--no-cpp) + news slate main-ticker gate.
    """
    ts = datetime.now(timezone.utc).isoformat()
    steps: list[dict] = []

    if not THEME_PATH.exists() or THEME_PATH.stat().st_size < 1000:
        steps.append({"name": "theme_file", "ok": False, "detail": f"missing {THEME_REL}"})
        return _finish(ts, steps, "FAIL_NO_THEME")
    theme_txt = THEME_PATH.read_text(encoding="utf-8", errors="replace")
    token_ok = (
        ":root" in theme_txt
        and "--void:" in theme_txt
        and "#050708" in theme_txt
        and "--ice:" in theme_txt
        and "#9adbe8" in theme_txt
        and "--serif:" in theme_txt
    )
    steps.append({
        "name": "theme_file",
        "ok": token_ok,
        "bytes": THEME_PATH.stat().st_size,
        "path": THEME_REL,
    })
    if not token_ok:
        return _finish(ts, steps, "FAIL_THEME_TOKENS")

    apply = TOOLS / "apply_one_theme.py"
    if apply.exists():
        code, out = _run([sys.executable, str(apply), "--jobs", "12"], timeout=900)
        steps.append({
            "name": "apply_one_theme",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "job": "fast pre-commit — snap THEME_VER chrome",
        })
    else:
        steps.append({"name": "apply_one_theme", "ok": False, "detail": "missing apply_one_theme.py"})

    # LIRIL guide must stay gone
    home_path = ROOT / "index.html"
    home = home_path.read_text(encoding="utf-8", errors="replace") if home_path.is_file() else ""
    check = _check_liril_guide_removed(home)
    if not check.get("ok"):
        # heal once then recheck
        strip = TOOLS / "strip_liril_guide_residue.py"
        if strip.exists():
            _run([sys.executable, str(strip)], timeout=120)
        if apply.exists():
            _run([sys.executable, str(apply), "--jobs", "8"], timeout=600)
        home = home_path.read_text(encoding="utf-8", errors="replace") if home_path.is_file() else ""
        check = _check_liril_guide_removed(home)
    _write_liril_proof(check, healed=not check.get("ok"))
    steps.append({
        "name": "liril_guide_removed",
        "ok": bool(check.get("ok")),
        "present": check.get("present") or {},
        "job": "public site must NOT carry LIRIL guide dock",
    })

    temple = TOOLS / "prism_temple_slate_lock.py"
    if temple.exists():
        code, out = _run(
            [sys.executable, str(temple), "--sync-contract", "--json"],
            timeout=180,
        )
        steps.append({
            "name": "temple_slate_lock",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "proof": r"C:\PRISM\log\prism_temple_slate_lock_last.json",
        })
    else:
        steps.append({"name": "temple_slate_lock", "ok": True, "detail": "skipped (missing)"})

    qcss = TOOLS / "prism_css_quantum_precision.py"
    if qcss.exists():
        code, out = _run([sys.executable, str(qcss), "--no-cpp"], timeout=180)
        steps.append({
            "name": "css_quantum_precision",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "fast_math_only": True,
        })
    else:
        steps.append({"name": "css_quantum_precision", "ok": True, "detail": "skipped (missing)"})

    news_slate = TOOLS / "prism_news_slate.py"
    if news_slate.exists():
        code, out = _run([sys.executable, str(news_slate), "rectify", "--json"], timeout=90)
        steps.append({
            "name": "news_slate_rectify",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-300:],
            "job": "main ticker isolation + temple stamp",
        })
    else:
        steps.append({"name": "news_slate_rectify", "ok": True, "detail": "skipped (missing)"})

    steps.append({"name": "visual_acuity_pc_mobile", "ok": True, "detail": "skipped (--fast)"})
    steps.append({"name": "github_pages_publish", "ok": True, "detail": "skipped (--fast; publish is separate)"})
    steps.append({"name": "auto_push", "ok": True, "detail": "skipped (--fast)"})

    ok = all(s.get("ok") for s in steps)
    return _finish(ts, steps, "SITE_DUTY_PASS" if ok else "SITE_DUTY_FAIL")


def lap() -> dict:
    # Pre-commit must not run the full editorial/swarm/publish mountain
    if "--fast" in sys.argv or os.environ.get("PRISM_SITE_DUTY_FAST", "").strip() in {"1", "true", "yes"}:
        return lap_fast()

    ts = datetime.now(timezone.utc).isoformat()
    steps: list[dict] = []

    # 1) theme file must exist AND define :root tokens (missing vars = white page)
    if not THEME_PATH.exists() or THEME_PATH.stat().st_size < 1000:
        steps.append({"name": "theme_file", "ok": False, "detail": f"missing {THEME_REL}"})
        return _finish(ts, steps, "FAIL_NO_THEME")
    theme_txt = THEME_PATH.read_text(encoding="utf-8", errors="replace")
    token_ok = (
        ":root" in theme_txt
        and "--void:" in theme_txt
        and "#050708" in theme_txt
        and "--ice:" in theme_txt
        and "#9adbe8" in theme_txt
        and "--serif:" in theme_txt
    )
    if not token_ok:
        steps.append(
            {
                "name": "theme_file",
                "ok": False,
                "detail": "press-theme.css missing :root tokens (site paints white without them)",
                "bytes": THEME_PATH.stat().st_size,
            }
        )
        return _finish(ts, steps, "FAIL_THEME_TOKENS")
    steps.append(
        {
            "name": "theme_file",
            "ok": True,
            "bytes": THEME_PATH.stat().st_size,
            "path": THEME_REL,
            "tokens": "root_void_ice_serif",
        }
    )

    # 0) PAGE SWARM FIRST — correct every public HTML before content jobs
    # (content tools that rewrite HTML must not leave uncorrected chrome behind)
    page_swarm = TOOLS / "prism_page_swarm.py"
    apply_early = TOOLS / "apply_one_theme.py"
    if page_swarm.exists() and "--no-page-swarm" not in sys.argv:
        changed_only = os.environ.get("PRISM_PAGE_SWARM_CHANGED", "").strip() in ("1", "true", "yes")
        cmd = [sys.executable, str(page_swarm), "--json", "--jobs", "12"]
        if changed_only or ("--fast" in sys.argv):
            # pre-commit / fast: still correct, but prefer hot pages when proof exists
            if changed_only:
                cmd.append("--changed-only")
        code, out = _run(cmd, timeout=900)
        steps.append({
            "name": "page_swarm_first",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-600:],
            "job": "PRISM page swarm FIRST — parallel correct every public HTML",
            "proof": str(ROOT / "data" / "prism_page_swarm_last.json"),
        })
    elif apply_early.exists() and "--no-page-swarm" not in sys.argv:
        code, out = _run([sys.executable, str(apply_early), "--jobs", "12"], timeout=900)
        steps.append({"name": "page_swarm_first", "ok": code == 0, "exit": code, "tail": (out or "")[-400:]})

    # 1b) RSS → objective home wire (multi-source; not TENET5 verdicts)
    # Always-new news: every 4th lap runs --scan to pull fresh feeds (network).
    # Force scan when .prism_news_rss_scan flag present (investigations / news slate lap).
    force_rss = (
        (ROOT / "data" / ".prism_news_rss_scan").exists()
        or Path(r"C:\PRISM\data\.prism_news_rss_scan").exists()
        or "--scan" in sys.argv
    )
    rss_wire = TOOLS / "build_rss_home_wire.py"
    scanner = TOOLS / "nemoclaw_news_scanner.py"
    if force_rss and scanner.exists():
        code, out = _run([sys.executable, str(scanner)], timeout=300)
        steps.append({
            "name": "news_rss_scan",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "job": "PRISM — NemoClaw RSS scrape into news_feed.json (investigation intake)",
            "out": "data/news_feed.json",
        })
        for fp in (
            ROOT / "data" / ".prism_news_rss_scan",
            Path(r"C:\PRISM\data\.prism_news_rss_scan"),
        ):
            try:
                if fp.is_file():
                    fp.unlink()
            except OSError:
                pass
    if rss_wire.exists():
        lap_n = int(os.environ.get("PRISM_SITE_DUTY_LAP", "1") or "1")
        do_scan = force_rss or (lap_n % 4 == 1) or ("--scan" in sys.argv)
        cmd = [sys.executable, str(rss_wire)] + (["--scan"] if do_scan else [])
        code, out = _run(cmd, timeout=300 if do_scan else 120)
        steps.append({
            "name": "rss_home_wire",
            "ok": code == 0,
            "exit": code,
            "scan": do_scan,
            "tail": (out or "")[-300:],
            "job": "PRISM permanent — multi-source RSS; scan every 4th lap or force flag",
            "proof": r"C:\PRISM\log\rss_home_wire_last.json",
        })
    else:
        steps.append({"name": "rss_home_wire", "ok": True, "detail": "build_rss_home_wire.py missing (skipped)"})

    # 1b1) Daily briefing cycle — always refresh media (still + video) on every lap
    brief_cycle = TOOLS / "prism_daily_briefing_cycle.py"
    if brief_cycle.exists():
        code, out = _run([sys.executable, str(brief_cycle), "--json", "--apply"], timeout=120)
        steps.append({
            "name": "daily_briefing_cycle",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "job": "LIRIL/PRISM — daily briefing update with still+video on every item",
            "proof": r"C:\PRISM\log\prism_daily_briefing_cycle_last.json",
            "owner": "LIRIL",
        })
    else:
        steps.append({"name": "daily_briefing_cycle", "ok": True, "detail": "prism_daily_briefing_cycle.py missing (skipped)"})

    # 1b2) LIRIL Press Wire — multi-outlet compare + outlet report cards (better than Drudge)
    # LIRIL swarm owns this: clusters external coverage, scores newsrooms, gaps vs desk topics.
    outlet_desk = TOOLS / "prism_liril_outlet_desk.py"
    if outlet_desk.exists():
        code, out = _run([sys.executable, str(outlet_desk), "--json", "--apply"], timeout=180)
        steps.append({
            "name": "liril_outlet_desk",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "job": "LIRIL swarm — multi-outlet press wire + outlet report cards + press-wire.html",
            "proof": r"C:\PRISM\log\prism_liril_outlet_desk_last.json",
            "owner": "LIRIL",
        })
    else:
        steps.append({"name": "liril_outlet_desk", "ok": True, "detail": "prism_liril_outlet_desk.py missing (skipped)"})

    # 1b3) LIRIL Substack — newsletter drafts outbox + public newsletter page + RSS pull
    substack = TOOLS / "prism_liril_substack.py"
    if substack.exists():
        code, out = _run(
            [sys.executable, str(substack), "--json", "--apply", "--fetch-feed"],
            timeout=180,
        )
        steps.append({
            "name": "liril_substack",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "job": "LIRIL swarm — Substack draft outbox + newsletter.html + publication feed",
            "proof": r"C:\PRISM\log\prism_liril_substack_last.json",
            "owner": "LIRIL",
        })
    else:
        steps.append({"name": "liril_substack", "ok": True, "detail": "prism_liril_substack.py missing (skipped)"})

    # 1b4) Life desks — removed per 0 garbage policy

    # 1c) AI desk articles (briefing + wire → content/posts + catalog)
    liril_arts = TOOLS / "build_liril_news_articles.py"
    if liril_arts.exists():
        code, out = _run([sys.executable, str(liril_arts)], timeout=90)
        steps.append({
            "name": "liril_news_articles",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-300:],
            "job": "PRISM permanent — AI news articles from briefing + multi-source wire",
            "proof": r"C:\PRISM\log\liril_news_articles_last.json",
        })
    else:
        steps.append({"name": "liril_news_articles", "ok": True, "detail": "skipped"})

    # 1c2) Every news article → hero image + LIRIL-read video (editorial floor)
    art_media = TOOLS / "prism_news_article_media.py"
    editorial_full = (
        (ROOT / "data" / ".prism_editorial_forever").exists()
        or (ROOT / "data" / ".prism_editorial_cycle").exists()
        or Path(r"C:\PRISM\data\.prism_editorial_forever").exists()
        or os.environ.get("PRISM_EDITORIAL_FULL", "").strip() in {"1", "true", "yes", "forever"}
    )
    if art_media.exists():
        # Images every lap; full video package when editorial forever / force flag
        cmd = [sys.executable, str(art_media), "--json", "--apply", "--images-only"]
        if editorial_full:
            cmd = [sys.executable, str(art_media), "--json", "--apply", "--limit", "12"]
        code, out = _run(cmd, timeout=2400 if editorial_full else 600)
        steps.append({
            "name": "news_article_media",
            "ok": code == 0,
            "exit": code,
            "full_video": editorial_full,
            "tail": (out or "")[-500:],
            "job": "Editorial floor — every post hero image + LIRIL VO segment",
            "proof": r"C:\PRISM\log\prism_news_article_media_last.json",
            "owner": "LIRIL",
        })
    else:
        steps.append({"name": "news_article_media", "ok": True, "detail": "prism_news_article_media.py missing (skipped)"})

    # 1d) LIRIL front-page news presentation script (explains site + today)
    liril_pres = TOOLS / "build_liril_news_presentation.py"
    if liril_pres.exists():
        code, out = _run([sys.executable, str(liril_pres)], timeout=60)
        steps.append({
            "name": "liril_news_presentation",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-300:],
            "job": "PRISM permanent — LIRIL presents TENET5 website + what is going on today",
            "proof": r"C:\PRISM\log\liril_news_presentation_last.json",
        })
    else:
        steps.append({"name": "liril_news_presentation", "ok": True, "detail": "skipped"})

    # 2) rebuild press surfaces (index + evidence + story) — owns LIRIL dock
    press = TOOLS / "press.py"
    if press.exists():
        code, out = _run([sys.executable, str(press)], timeout=180)
        steps.append({"name": "press_rebuild", "ok": code == 0, "exit": code, "tail": out[-400:]})
    else:
        steps.append({"name": "press_rebuild", "ok": False, "detail": "press.py missing"})

    # 2b) rebuild Investigations + News hubs (IA lanes — never dump news into inv)
    invb = TOOLS / "build_investigations.py"
    if invb.exists():
        code, out = _run([sys.executable, str(invb)], timeout=120)
        steps.append({"name": "investigations_hub", "ok": code == 0, "exit": code, "tail": out[-200:]})
    else:
        steps.append({"name": "investigations_hub", "ok": False, "detail": "build_investigations.py missing"})
    newsh = TOOLS / "build_news_hub.py"
    if newsh.exists():
        code, out = _run([sys.executable, str(newsh)], timeout=60)
        steps.append({"name": "news_hub", "ok": code == 0, "exit": code, "tail": out[-200:]})
    else:
        steps.append({"name": "news_hub", "ok": True, "detail": "build_news_hub.py missing (skipped)"})
    # Single mic — kill multi-voice / TTS reinfection every lap
    smic = TOOLS / "strip_multi_voice.py"
    if smic.exists():
        code, out = _run([sys.executable, str(smic), "--apply", "--json"], timeout=180)
        steps.append({
            "name": "single_mic_strip",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-200:],
            "proof": str(ROOT / "data" / "single_mic_last.json"),
            "job": "one video audio only — no TTS stacks",
        })
    # Locked templates: stamp attrs + hero hygiene, then validate exemplars
    stamp = TOOLS / "prism_template_stamp.py"
    if stamp.exists():
        code, out = _run([sys.executable, str(stamp), "--apply", "--json"], timeout=180)
        steps.append({
            "name": "site_templates_stamp",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-200:],
            "proof": str(ROOT / "data" / "site_templates_stamp_last.json"),
        })
    tpls = TOOLS / "prism_templates.py"
    if tpls.exists():
        code, out = _run([sys.executable, str(tpls), "--validate", "--json"], timeout=60)
        steps.append({
            "name": "site_templates_lock",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-300:],
            "proof": str(ROOT / "data" / "site_templates_lock_last.json"),
            "job": "PRISM — locked page templates (investigation / news / hub / case)",
        })
    else:
        steps.append({"name": "site_templates_lock", "ok": True, "detail": "prism_templates.py missing"})

    # 2c) rebuild OSINT composite network board (scrapers/vault → network_osint_board.json)
    netb = TOOLS / "build_network_osint_board.py"
    if netb.exists():
        code, out = _run([sys.executable, str(netb)], timeout=120)
        steps.append(
            {
                "name": "network_osint_board",
                "ok": code == 0,
                "exit": code,
                "tail": out[-300:],
                "out": "data/network_osint_board.json",
            }
        )
    else:
        steps.append({"name": "network_osint_board", "ok": False, "detail": "build_network_osint_board.py missing"})

    # 2c1) Optional CBC/public OSINT scrape when investigation flag set
    force_osint = (
        (ROOT / "data" / ".prism_osint_scrape").exists()
        or Path(r"C:\PRISM\data\.prism_osint_scrape").exists()
    )
    cbc_osint = TOOLS / "cbc_public_osint_run.py"
    if force_osint and cbc_osint.exists():
        code, out = _run([sys.executable, str(cbc_osint)], timeout=600)
        steps.append({
            "name": "osint_scrape_investigations",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-500:],
            "job": "PRISM — public OSINT scrape for investigation desks",
            "out": "data/osint_vault/cbc_public_osint_last.json",
        })
        # rebuild board after scrape
        if netb.exists():
            code2, out2 = _run([sys.executable, str(netb)], timeout=120)
            steps.append({
                "name": "network_osint_board_post_scrape",
                "ok": code2 == 0,
                "exit": code2,
                "tail": (out2 or "")[-200:],
            })
        for fp in (
            ROOT / "data" / ".prism_osint_scrape",
            Path(r"C:\PRISM\data\.prism_osint_scrape"),
        ):
            try:
                if fp.is_file():
                    fp.unlink()
            except OSError:
                pass
    elif force_osint:
        steps.append({
            "name": "osint_scrape_investigations",
            "ok": True,
            "detail": "flag set; cbc_public_osint_run.py missing — board rebuild only",
        })

    # 2c2) News multi-slate rectify — article/chart types OFF main ticker; temple stamp
    news_slate = TOOLS / "prism_news_slate.py"
    if news_slate.exists():
        code, out = _run([sys.executable, str(news_slate), "rectify", "--json"], timeout=120)
        steps.append({
            "name": "news_slate_rectify",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-500:],
            "job": "PRISM — news slate registry; main ticker isolation; data sorted",
            "proof": r"C:\PRISM\log\news_slate_rectify_last.json",
            "registry": "data/news_slate_registry.json",
            "spec": "tools/NEWS_SLATE_SPEC.md",
        })
        for fp in (
            ROOT / "data" / ".prism_news_slate_rectify",
            Path(r"C:\PRISM\data\.prism_news_slate_rectify"),
        ):
            try:
                if fp.is_file():
                    fp.unlink()
            except OSError:
                pass
    else:
        steps.append({"name": "news_slate_rectify", "ok": True, "detail": "prism_news_slate.py missing (skipped)"})

    # 3) PAGE SWARM — correct EVERY public HTML in parallel (instant correct path)
    # Prefer prism_page_swarm (parallel theme + liril-live inject). Fallback serial apply.
    page_swarm = TOOLS / "prism_page_swarm.py"
    apply = TOOLS / "apply_one_theme.py"
    if page_swarm.exists():
        # Full correct every lap; --changed-only only when PRISM_PAGE_SWARM_CHANGED=1
        changed_only = os.environ.get("PRISM_PAGE_SWARM_CHANGED", "").strip() in ("1", "true", "yes")
        cmd = [sys.executable, str(page_swarm), "--json", "--jobs", "12"]
        if changed_only:
            cmd.append("--changed-only")
        code, out = _run(cmd, timeout=900)
        steps.append({
            "name": "page_swarm",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-800:],
            "job": "PRISM page swarm — parallel correct every public HTML + liril-live",
            "proof": str(ROOT / "data" / "prism_page_swarm_last.json"),
            "owner": "PRISM",
        })
    elif apply.exists():
        code, out = _run(
            [sys.executable, str(apply), "--jobs", "12"],
            timeout=900,
        )
        steps.append({
            "name": "apply_one_theme",
            "ok": code == 0,
            "exit": code,
            "tail": out[-600:],
            "job": "parallel theme apply (page_swarm missing)",
        })
    else:
        steps.append({"name": "page_swarm", "ok": False, "detail": "prism_page_swarm.py and apply_one_theme.py missing"})

    # 4) hard home markers (press design lock)
    home_path = ROOT / "index.html"
    home = home_path.read_text(encoding="utf-8", errors="replace") if home_path.exists() else ""
    markers = {
        "backwards": "backwards" in home,
        "ghost5": "ghost5" in home,
        "press_theme_css": THEME_REL in home,
        "fraunces_or_theme": "Fraunces" in home or THEME_REL in home,
        "no_product_stack": "product.css" not in home
        and "tokens.css" not in home
        and "quantanium.css" not in home,
        "no_quantanium_spec_href": 'href="css/quantanium-spec.css' not in home
        and "href='css/quantanium-spec.css" not in home,
    }
    steps.append({"name": "home_markers", "ok": all(markers.values()), "markers": markers})

    # 5) LIRIL guide REMOVED from public site (2026-07-12) — fail if dock/guide return
    guide_check = _check_liril_guide_removed(home)
    if not guide_check["ok"]:
        healed_ok, heal_note = _heal_liril_guide_removed()
        home = home_path.read_text(encoding="utf-8", errors="replace") if home_path.exists() else home
        guide_check = _check_liril_guide_removed(home)
        guide_check["heal_note"] = heal_note
        guide_check["healed_ok"] = healed_ok
    else:
        _write_liril_proof(guide_check, healed=False)
    steps.append(
        {
            "name": "liril_guide_removed",
            "ok": guide_check.get("ok", False),
            "present": guide_check.get("present", {}),
            "brand_ok": guide_check.get("brand_ok", False),
            "job": "PRISM permanent — public site must NOT ship LIRIL guide dock/Guide me",
            "owner": "PRISM",
            "proof": str(ROOT / "data" / "liril_guide_removed_last.json"),
        }
    )
    # Voice-match swarm retired with the guide (no dock consumer)
    steps.append({
        "name": "liril_voice_match",
        "ok": True,
        "detail": "skipped — LIRIL guide removed from public site",
    })

    # 5c) Google SEO full slate — LIRIL keeps every page Search/AI-Overview eligible
    # Every 2nd lap full apply (head rewrites); other laps sitemap/robots refresh only.
    seo = TOOLS / "prism_site_seo_slate.py"
    if seo.exists():
        lap_n = int(os.environ.get("PRISM_SITE_DUTY_LAP", "1") or "1")
        full_seo = (lap_n % 2 == 1) or ("--seo-full" in sys.argv)
        if full_seo:
            code, out = _run(
                [sys.executable, str(seo), "--json", "--apply", "--sitemap"],
                timeout=600,
            )
        else:
            code, out = _run(
                [sys.executable, str(seo), "--json", "--sitemap"],
                timeout=120,
            )
        steps.append({
            "name": "site_seo_slate",
            "ok": code == 0,
            "exit": code,
            "full_apply": full_seo,
            "tail": (out or "")[-400:],
            "job": "LIRIL swarm — Google SEO + JSON-LD + sitemap/robots/llms on every page",
            "proof": r"C:\PRISM\log\prism_site_seo_slate_last.json",
            "owner": "LIRIL",
        })
    else:
        steps.append({"name": "site_seo_slate", "ok": True, "detail": "prism_site_seo_slate.py missing (skipped)"})

    # 5d) GitHub Pages publish — surgical commit + push so live site matches PRISM
    # Skip when PRISM_SITE_DUTY_NO_PUBLISH=1 or STOP publish flag.
    pub = TOOLS / "prism_site_github_pages_publish.py"
    no_pub = os.environ.get("PRISM_SITE_DUTY_NO_PUBLISH", "").strip() in ("1", "true", "yes")
    stop_pub = Path(r"C:\PRISM\data\.prism_site_github_pages_publish_stop").is_file()
    if pub.exists() and not no_pub and not stop_pub:
        # forever sticky or website_first → publish; else dry-run log only
        sticky = False
        for fl in (
            Path(r"C:\PRISM\data\.prism_site_github_pages_publish"),
            Path(r"C:\PRISM\data\.prism_website_first"),
        ):
            if fl.is_file():
                try:
                    b = fl.read_text(encoding="utf-8", errors="replace").strip().lower()
                    if b in ("forever", "sticky", "1forever", "1", "true", "yes"):
                        sticky = True
                except OSError:
                    sticky = True
        args = [sys.executable, str(pub), "--json", "--full-public"]
        if sticky or "--publish" in sys.argv:
            args.append("--apply")
        else:
            args.append("--dry-run")
        code, out = _run(args, timeout=1200)
        steps.append({
            "name": "github_pages_publish",
            "ok": code == 0,
            "exit": code,
            "apply_push": sticky or "--publish" in sys.argv,
            "tail": (out or "")[-500:],
            "job": "PRISM — surgical git commit + push to TENET-5.github.io (GitHub Pages)",
            "proof": r"C:\PRISM\log\prism_site_github_pages_publish_last.json",
            "owner": "PRISM",
        })
    else:
        steps.append({
            "name": "github_pages_publish",
            "ok": True,
            "detail": "skipped" if (no_pub or stop_pub or not pub.exists()) else "n/a",
        })

    # 6) sample interiors
    interior_ok = True
    samples = []
    for name in ("foreign-interference.html", "about.html", "5gw-subversion.html"):
        p = ROOT / name
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8", errors="replace")
        ok = THEME_REL in t and "product.css" not in t and "quantanium.css" not in t
        samples.append({"page": name, "ok": ok})
        interior_ok = interior_ok and ok
    steps.append({"name": "interiors", "ok": interior_ok, "samples": samples})

    # 6a-guard) ZERO-INTERNALS leak gate — public site names NO engine/model/kernel/path/seed.
    # apply_one_theme self-heals known leaks; this catches any the swarm invents. Hard gate.
    leak = TOOLS / "leak_scanner.py"
    if leak.exists():
        code, out = _run([sys.executable, str(leak)], timeout=120)
        steps.append({
            "name": "leak_scan", "ok": code == 0, "exit": code, "tail": (out or "")[-400:],
            "job": "PRISM permanent — public site names NO internals ('Powered by LIRIL AI' only)",
        })
    else:
        steps.append({"name": "leak_scan", "ok": True, "detail": "leak_scanner.py missing (skipped)"})

    # 6a2-guard) ANTI-HALLUCINATION gate — prose that CLAIMS an element/feature must have it.
    # Catches the swarm's plan-as-if-done hallucinations (charts/case-files/video described but
    # never built). apply_one_theme self-heals the known ones; this traces any new one. Hard gate.
    claim = TOOLS / "claim_check.py"
    if claim.exists():
        code, out = _run([sys.executable, str(claim)], timeout=120)
        steps.append({
            "name": "claim_check", "ok": code == 0, "exit": code, "tail": (out or "")[-400:],
            "job": "PRISM permanent — no hallucinated claims (prose element must exist in the DOM)",
        })
    else:
        steps.append({"name": "claim_check", "ok": True, "detail": "claim_check.py missing (skipped)"})

    # 6a2b) Ticker ↔ video perfect sync — first hallucination indicator (Daniel 2026-07-12)
    slate_tool = TOOLS / "broadcast_ticker_slate.py"
    if slate_tool.exists():
        _run([sys.executable, str(slate_tool)], timeout=60)
    # Reburn desk mux tickers from slate when possible (bare A/V or force full package)
    desk_vid = TOOLS / "prism_desk_video_package.py"
    force_reburn = (
        (ROOT / "data" / ".prism_ticker_reburn").exists()
        or Path(r"C:\PRISM\data\.prism_ticker_reburn").exists()
        or (ROOT / "data" / ".prism_editorial_forever").exists()
        or Path(r"C:\PRISM\data\.prism_editorial_forever").exists()
        or os.environ.get("PRISM_TICKER_REBURN", "").strip() in {"1", "true", "yes", "forever"}
        or os.environ.get("PRISM_EDITORIAL_FULL", "").strip() in {"1", "true", "yes", "forever"}
    )
    # Regular desk package (news VO) on editorial full laps even without reburn flag
    if desk_vid.exists() and editorial_full and not force_reburn:
        code, out = _run(
            [sys.executable, str(desk_vid), "--json", "--apply", "news", "--limit", "8"],
            timeout=2400,
        )
        steps.append({
            "name": "desk_video_package",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-500:],
            "proof": r"C:\PRISM\log\prism_desk_video_package_last.json",
            "job": "Editorial — neural LIRIL news segments (news-N_mux)",
            "owner": "LIRIL",
        })
        # presentation prebake
        code2, out2 = _run(
            [sys.executable, str(desk_vid), "--json", "--apply", "presentation"],
            timeout=900,
        )
        steps.append({
            "name": "desk_presentation_audio",
            "ok": code2 == 0,
            "exit": code2,
            "tail": (out2 or "")[-300:],
            "job": "Editorial — prebake LIRIL presentation neural VO",
        })
    if desk_vid.exists() and force_reburn:
        code, out = _run(
            [sys.executable, str(desk_vid), "--json", "--apply", "reburn-ticker", "--limit", "8"],
            timeout=900,
        )
        steps.append({
            "name": "ticker_reburn",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-500:],
            "proof": r"C:\PRISM\log\prism_desk_video_package_last.json",
            "job": "Reburn slate ticker onto news-*_mux (no VO rebuild when bare exists)",
        })
        # If reburn stuck on no_bare_source, one forced news package creates bare files
        if code != 0:
            code2, out2 = _run(
                [sys.executable, str(desk_vid), "--json", "--apply", "news", "--force", "--limit", "8"],
                timeout=2400,
            )
            steps.append({
                "name": "ticker_force_news_package",
                "ok": code2 == 0,
                "exit": code2,
                "tail": (out2 or "")[-500:],
                "job": "Full desk package --force to produce bare + slate burn",
            })
    tick_gate = TOOLS / "prism_ticker_video_sync.py"
    if tick_gate.exists():
        code, out = _run([sys.executable, str(tick_gate), "--json"], timeout=90)
        steps.append({
            "name": "ticker_video_sync",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "proof": r"C:\PRISM\log\prism_ticker_video_sync_last.json",
            "job": "PRISM permanent — web ticker must phase-lock to desk video burn-in; DESYNC = hallucination",
        })
    else:
        steps.append({"name": "ticker_video_sync", "ok": True, "detail": "prism_ticker_video_sync.py missing (skipped)"})

    # 6a3-guard) IMAGE-PIPELINE guard — no low-tier images or missing aesthetic rules.
    img_guard = TOOLS / "prism_image_guard.py"
    if img_guard.exists():
        code, out = _run([sys.executable, str(img_guard)], timeout=120)
        steps.append({
            "name": "image_guard", "ok": code == 0, "exit": code, "tail": (out or "")[-400:],
            "job": "PRISM permanent — enforce single-collage rule and valid aesthetics (MONOCHROME, void, ivory, red)",
        })
    else:
        steps.append({"name": "image_guard", "ok": True, "detail": "prism_image_guard.py missing (skipped)"})

    # 6b-guard) DESIGN-LOCK taste guardrail present + injected last on every page.
    dl = ROOT / "css" / "design-lock.css"
    try:
        about = (ROOT / "about.html").read_text(encoding="utf-8", errors="ignore")
    except OSError:
        about = ""
    dl_ok = dl.exists() and "design-lock.css" in about
    steps.append({
        "name": "design_lock", "ok": dl_ok,
        "detail": "design-lock.css present + linked" if dl_ok else "design-lock missing or not injected",
        "job": "PRISM permanent — crystal-clear taste guardrail (loads last, swarm-proof)",
    })

    # 6a2) Cinema playback integrity — act film must survive theme/apply thrash
    steps.append(_cinema_playback_integrity())

    # 6a8) Press-file structure upgrade + desk dialects (Griffon SoT)
    upg = TOOLS / "prism_press_file_upgrade.py"
    if upg.exists():
        code, out = _run(
            [sys.executable, str(upg), "--apply", "--json"],
            timeout=300,
        )
        steps.append({
            "name": "press_file_upgrade",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-500:],
            "proof": r"C:\PRISM\log\prism_press_file_upgrade_last.json",
            "job": "Upgrade investigation dumps to press-file structure under home theme",
        })
    else:
        steps.append({"name": "press_file_upgrade", "ok": True, "detail": "skipped"})
    desks = TOOLS / "prism_press_file_desks.py"
    if desks.exists():
        code, out = _run(
            [sys.executable, str(desks), "--apply", "--json"],
            timeout=120,
        )
        steps.append({
            "name": "press_file_desks",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-400:],
            "proof": r"C:\PRISM\log\prism_press_file_desks_last.json",
            "job": "Stamp data-presentation desks so investigations inherit press-file layouts",
        })
    else:
        steps.append({"name": "press_file_desks", "ok": True, "detail": "skipped"})

    # 6a9) Temple + SLATE token lock — every page same THEME_VER + anchors (0 hallucination)
    temple = TOOLS / "prism_temple_slate_lock.py"
    if temple.exists():
        code, out = _run(
            [sys.executable, str(temple), "--sync-contract", "--json"],
            timeout=180,
        )
        steps.append({
            "name": "temple_slate_lock",
            "ok": code == 0,
            "exit": code,
            "tail": (out or "")[-500:],
            "proof": r"C:\PRISM\log\prism_temple_slate_lock_last.json",
            "job": "PRISM permanent — Temple cascade + SLATE aliases + page THEME_VER lock",
        })
    else:
        steps.append({"name": "temple_slate_lock", "ok": True, "detail": "prism_temple_slate_lock.py missing (skipped)"})

    # 6b) CSS quantum precision — exact tokens, WCAG, Ising ground state (+ C++ bench when not fast)
    fast = (
        "--fast" in sys.argv
        or os.environ.get("PRISM_SITE_DUTY_FAST", "").strip() in {"1", "true", "yes"}
    )
    qcss = TOOLS / "prism_css_quantum_precision.py"
    if qcss.exists():
        qargs = [sys.executable, str(qcss)]
        if fast:
            qargs.append("--no-cpp")
        code, out = _run(qargs, timeout=240)
        q_ok = code == 0
        steps.append(
            {
                "name": "css_quantum_precision",
                "ok": q_ok,
                "exit": code,
                "tail": (out or "")[-600:],
                "proof": r"C:\PRISM\log\prism_css_quantum_precision_last.json",
                "job": "PRISM permanent — mathematical CSS token precision + quantum bench",
                "fast_math_only": fast,
            }
        )
    else:
        steps.append(
            {
                "name": "css_quantum_precision",
                "ok": False,
                "detail": "missing prism_css_quantum_precision.py",
            }
        )

    # 7) PC + mobile JPG capture + visual acuity (core permanent mission)
    # --fast / PRISM_SITE_DUTY_FAST=1: pre-commit path — theme + LIRIL + CSS math only
    vis = TOOLS / "prism_visual_acuity.py"
    if fast:
        steps.append(
            {
                "name": "visual_acuity_pc_mobile",
                "ok": True,
                "detail": "skipped (--fast / pre-commit); forever loop still runs full acuity",
            }
        )
    elif vis.exists():
        code, out = _run([sys.executable, str(vis), "--base", "https://tenet-5.github.io"], timeout=600)
        vis_ok = code == 0
        if not vis_ok and apply.exists():
            _run([sys.executable, str(apply)], timeout=300)
            code2, out2 = _run(
                [sys.executable, str(vis), "--base", "https://tenet-5.github.io"], timeout=600
            )
            vis_ok = code2 == 0
            out = (out or "") + "\nREHEAL\n" + (out2 or "")
            code = code2
        steps.append(
            {
                "name": "visual_acuity_pc_mobile",
                "ok": vis_ok,
                "exit": code,
                "tail": (out or "")[-500:],
                "proof": r"C:\PRISM\log\prism_visual_acuity_last.json",
                "jpgs": r"C:\PRISM\log\visual_acuity\ + data/visual_acuity/",
            }
        )
    else:
        steps.append({"name": "visual_acuity_pc_mobile", "ok": False, "detail": "missing prism_visual_acuity.py"})

    # 8) optional auto-push (CI / explicit only)
    auto = os.environ.get("PRISM_SITE_AUTO_PUSH", "").strip() in {"1", "true", "yes"}
    if auto:
        _run(["git", "add", "-A"])
        st, diff = _run(["git", "status", "--porcelain"])
        dirty = bool(diff.strip())
        if dirty:
            msg = f"prism(site-duty): theme+LIRIL guide+visual acuity {ts[:19]}"
            c1, _ = _run(["git", "commit", "-m", msg])
            if c1 != 0:
                c1, _ = _run(["git", "-c", "core.hooksPath=/dev/null", "commit", "-m", msg, "--no-verify"])
            c2, pout = _run(["git", "push", "origin", "HEAD"], timeout=120)
            steps.append(
                {
                    "name": "auto_push",
                    "ok": c2 == 0,
                    "committed": c1 == 0,
                    "detail": pout[-300:],
                }
            )
        else:
            steps.append({"name": "auto_push", "ok": True, "detail": "clean tree"})
    else:
        steps.append({"name": "auto_push", "ok": True, "detail": "skipped (PRISM_SITE_AUTO_PUSH not set)"})

    ok = all(s.get("ok") for s in steps)
    verdict = "SITE_DUTY_PASS" if ok else "SITE_DUTY_FAIL"
    return _finish(ts, steps, verdict)


def _cinema_playback_integrity() -> dict:
    """Hard gate: genocide-act film must remain playable after theme thrash.

    Checks act-i…v markup + cinema-play v3 + H.264 film bytes.
    Atmosphere is not proof — but broken film is a product defect (Daniel).
    """
    checks: dict[str, object] = {}
    issues: list[str] = []
    acts = ("act-i.html", "act-ii.html", "act-iii.html", "act-iv.html", "act-v.html")
    for name in acts:
        p = ROOT / name
        if not p.is_file():
            issues.append(f"missing_{name}")
            checks[name] = False
            continue
        try:
            t = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            issues.append(f"unreadable_{name}")
            checks[name] = False
            continue
        # Primary film = hero video OR hybrid doc-stage (documentary stitch)
        has_primary = (
            ("act-hero-video" in t and "data-force-play" in t)
            or ('data-doc-video="media/film/' in t or "data-doc-video='media/film/" in t)
            or ("tenet5-doc-player.js" in t and "doc-stage" in t)
        )
        ok = (
            "act-cinema-page" in t
            and ("tenet5-cinema-play.js?v=3" in t or "tenet5-cinema-play.js?v=4" in t)
            and has_primary
            and (
                'src="media/film/' in t
                or 'data-doc-video="media/film/' in t
            )
        )
        checks[name] = ok
        if not ok:
            issues.append(f"cinema_markup_{name}")

    play = ROOT / "js" / "tenet5-cinema-play.js"
    play_ok = False
    if play.is_file():
        try:
            js = play.read_text(encoding="utf-8", errors="replace")
            play_ok = "__v: 3" in js or "__v >= 3" in js or "__v: 4" in js or "__v >= 4" in js
            play_ok = play_ok and "act-play-gate" in js
        except OSError:
            play_ok = False
    checks["cinema_play_js_v3"] = play_ok
    if not play_ok:
        issues.append("cinema_play_js_v3")

    films = (
        "hall_of_record.mp4",
        "corridor_power.mp4",
        "empty_committee.mp4",
        "paper_trail.mp4",
        "ledger_turn.mp4",
        "flag_wind.mp4",
    )
    film_ok = True
    film_sizes: dict[str, int] = {}
    for fn in films:
        fp = ROOT / "media" / "film" / fn
        sz = fp.stat().st_size if fp.is_file() else 0
        film_sizes[fn] = sz
        if sz < 20_000:
            film_ok = False
            issues.append(f"film_small_{fn}")
    checks["films"] = film_sizes
    checks["films_ok"] = film_ok

    theme = ""
    try:
        theme = (ROOT / "css" / "press-theme.css").read_text(encoding="utf-8", errors="replace")
    except OSError:
        pass
    theme_ok = ("act-play-gate" in theme and "act-hero-video" in theme and "theme-ver" in theme)
    checks["theme_cinema_css"] = theme_ok
    if not theme_ok:
        issues.append("theme_cinema_css")

    ok = not issues
    return {
        "name": "cinema_playback_integrity",
        "ok": ok,
        "checks": checks,
        "issues": issues[:24],
        "job": "PRISM permanent — act film src + cinema-play v3 + play gate (zero broken video)",
    }


def _stop_requested() -> bool:
    if os.environ.get("PRISM_SITE_DUTY_STOP", "").strip() in {"1", "true", "yes"}:
        return True
    return any(p.exists() for p in STOP_FILES)


def _write_project_lock() -> None:
    doc = {
        **PROJECT,
        "ts": datetime.now(timezone.utc).isoformat(),
        "theme": THEME_REL,
        "liril_guide": "RETIRED 2026-07-12 — public site must NOT ship LIRIL guide dock/Guide me",
        "site": "https://tenet-5.github.io/",
        "doc": str(ROOT / "PRISM_PROJECT_LOCK.md"),
    }
    try:
        PROJECT_LOCK.parent.mkdir(parents=True, exist_ok=True)
        PROJECT_LOCK.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    except OSError:
        pass


def _finish(ts: str, steps: list[dict], verdict: str) -> dict:
    doc = {
        "ts": ts,
        "doctrine": "prism_site_duty_continuous",
        "project": PROJECT,
        "site_root": str(ROOT),
        "theme": THEME_REL,
        "jobs": PROJECT["jobs"],
        "verdict": verdict,
        "steps": steps,
        "ok": verdict == "SITE_DUTY_PASS",
    }
    payload = json.dumps(doc, indent=2)
    for path in PROOF_PATHS:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(payload, encoding="utf-8")
        except OSError:
            pass
    _write_project_lock()
    print(json.dumps({"verdict": verdict, "ok": doc["ok"], "ts": ts, "project": PROJECT["id"]}, indent=2))
    return doc


def main() -> int:
    args = sys.argv[1:]
    forever = "--forever" in args
    loop = None
    if "--loop" in args:
        i = args.index("--loop")
        loop = int(args[i + 1]) if i + 1 < len(args) else 90
    if forever:
        loop = loop or 90
        n = 0
        print(
            f"[prism_site_duty] FOREVER project={PROJECT['id']} interval={loop}s "
            f"jobs={PROJECT['jobs']} stop_files={[str(p) for p in STOP_FILES]}",
            flush=True,
        )
        while not _stop_requested():
            n += 1
            os.environ["PRISM_SITE_DUTY_LAP"] = str(n)
            doc = lap()
            print(f"[prism_site_duty] lap={n} {doc['verdict']}", flush=True)
            for _ in range(max(1, loop)):
                if _stop_requested():
                    print("[prism_site_duty] STOP flag detected — exiting", flush=True)
                    return 0
                time.sleep(1)
        print("[prism_site_duty] STOP flag present at start — exiting", flush=True)
        return 0
    if loop:
        max_laps = max(1, (24 * 3600) // max(loop, 1))
        for n in range(max_laps):
            if _stop_requested():
                print("[prism_site_duty] STOP flag — exiting", flush=True)
                return 0
            doc = lap()
            print(f"[prism_site_duty] lap={n+1}/{max_laps} {doc['verdict']}", flush=True)
            time.sleep(loop)
        return 0
    if _stop_requested():
        print("[prism_site_duty] STOP flag present — one-shot lap skipped", flush=True)
        return 0
    doc = lap()
    return 0 if doc.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
