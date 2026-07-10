#!/usr/bin/env python3
"""PRISM visual acuity — capture site JPGs (PC + mobile) and validate.

Permanent project step: look at the live (or local) site the way a human does.
Produces timestamped JPG captures and a JSON acuity report.

    python tools/prism_visual_acuity.py
    python tools/prism_visual_acuity.py --base https://tenet-5.github.io

Does NOT open a visible browser window (headless Chromium).
"""
from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIRS = [
    ROOT / "data" / "visual_acuity",
    Path(r"C:\PRISM\log\visual_acuity"),
]
PROOF = [
    Path(r"C:\PRISM\log\prism_visual_acuity_last.json"),
    ROOT / "data" / "prism_visual_acuity_last.json",
]

# Canonical pages under continuous visual duty
PAGES = [
    "index.html",
    "index.html#now",
    "index.html#week",
    "foreign-interference.html",
    "daily-briefing.html",
    "evidence-index.html",
    "about.html",
]

VIEWPORTS = {
    "pc": {"width": 1440, "height": 900, "device_scale_factor": 1},
    "mobile": {"width": 390, "height": 844, "device_scale_factor": 2, "is_mobile": True, "has_touch": True},
}

# Design anchors (screenshot 2026-07-10 042513)
VOID_RGB = (5, 7, 8)
ICE_RGB = (154, 219, 232)
IVORY_RGB = (236, 231, 220)


def _ensure_dirs() -> Path:
    primary = OUT_DIRS[0]
    for d in OUT_DIRS:
        try:
            d.mkdir(parents=True, exist_ok=True)
        except OSError:
            pass
    return primary


def _luma(r: int, g: int, b: int) -> float:
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def analyze_jpg(path: Path) -> dict:
    """Basic visual acuity metrics via PIL."""
    from PIL import Image

    im = Image.open(path).convert("RGB")
    w, h = im.size
    # sample grid for speed
    step = max(1, min(w, h) // 80)
    pixels = list(im.getdata())
    n = len(pixels)
    # subsample
    sample = pixels[:: max(1, n // 8000)]
    if not sample:
        return {"ok": False, "error": "empty"}

    avg_r = sum(p[0] for p in sample) / len(sample)
    avg_g = sum(p[1] for p in sample) / len(sample)
    avg_b = sum(p[2] for p in sample) / len(sample)
    avg_l = _luma(avg_r, avg_g, avg_b)

    # near-black / near-white fraction
    dark = sum(1 for p in sample if _luma(*p) < 40) / len(sample)
    bright = sum(1 for p in sample if _luma(*p) > 220) / len(sample)

    # ice-ish cyan presence (rough band around #9adbe8)
    ice = 0
    for r, g, b in sample:
        if b > r + 20 and b > 140 and g > 160 and abs(g - b) < 50:
            ice += 1
    ice_frac = ice / len(sample)

    # ivory text-ish (light warm-neutral)
    ivory = sum(
        1
        for r, g, b in sample
        if r > 180 and g > 170 and b > 160 and abs(r - g) < 40 and abs(g - b) < 40
    ) / len(sample)

    issues = []
    # Dead render: all black or all white
    if dark > 0.98:
        issues.append("almost_pure_black_render")
    if bright > 0.95:
        issues.append("almost_pure_white_render")
    # Homepage press theme is dark void — mean should be dark
    if avg_l > 160:
        issues.append("too_bright_for_void_theme")
    # Expected some structure (not flat)
    if path.stat().st_size < 8_000:
        issues.append("jpg_too_small_likely_blank")
    if w < 300 or h < 400:
        issues.append("viewport_too_small")

    ok = len(issues) == 0
    return {
        "ok": ok,
        "width": w,
        "height": h,
        "bytes": path.stat().st_size,
        "avg_rgb": [round(avg_r, 1), round(avg_g, 1), round(avg_b, 1)],
        "avg_luma": round(avg_l, 1),
        "dark_frac": round(dark, 3),
        "bright_frac": round(bright, 3),
        "ice_frac": round(ice_frac, 4),
        "ivory_frac": round(ivory, 4),
        "issues": issues,
    }


def capture(base: str, stamp: str, out_dir: Path) -> list[dict]:
    from playwright.sync_api import sync_playwright

    results: list[dict] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for vp_name, vp in VIEWPORTS.items():
                context = browser.new_context(
                    viewport={"width": vp["width"], "height": vp["height"]},
                    device_scale_factor=vp.get("device_scale_factor", 1),
                    is_mobile=vp.get("is_mobile", False),
                    has_touch=vp.get("has_touch", False),
                    color_scheme="dark",
                    reduced_motion="reduce",
                )
                page = context.new_page()
                for rel in PAGES:
                    url = base.rstrip("/") + "/" + rel.lstrip("/")
                    # normalize index.html#hash
                    if rel.startswith("index.html#"):
                        url = base.rstrip("/") + "/" + rel
                    elif rel == "index.html":
                        url = base.rstrip("/") + "/"
                    safe = rel.replace("#", "_").replace("/", "_").replace(".", "_")
                    jpg_name = f"{stamp}_{vp_name}_{safe}.jpg"
                    jpg_path = out_dir / jpg_name
                    rec: dict = {
                        "platform": vp_name,
                        "page": rel,
                        "url": url,
                        "jpg": str(jpg_path),
                        "jpg_rel": f"data/visual_acuity/{jpg_name}",
                    }
                    try:
                        page.goto(url, wait_until="networkidle", timeout=45000)
                        # Reveal .rv chapters (JS starts them opacity:0) so acuity is real, not pure black
                        page.evaluate(
                            """() => {
                              document.documentElement.classList.add('js');
                              document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
                              // force void background if CSS failed to apply (diagnostic signal stays in paint)
                              const cs = getComputedStyle(document.body);
                              return {
                                bg: cs.backgroundColor,
                                color: cs.color,
                                font: cs.fontFamily
                              };
                            }"""
                        )
                        page.wait_for_timeout(500)
                        # full page can be huge; capture viewport for acuity
                        page.screenshot(path=str(jpg_path), type="jpeg", quality=82, full_page=False)
                        # mirror to C:\PRISM\log\visual_acuity
                        for d in OUT_DIRS[1:]:
                            try:
                                d.mkdir(parents=True, exist_ok=True)
                                dest = d / jpg_name
                                dest.write_bytes(jpg_path.read_bytes())
                            except OSError:
                                pass
                        rec["analysis"] = analyze_jpg(jpg_path)
                        rec["ok"] = bool(rec["analysis"].get("ok"))
                    except Exception as e:
                        rec["ok"] = False
                        rec["error"] = f"{type(e).__name__}: {e}"
                    results.append(rec)
                context.close()
        finally:
            browser.close()
    return results


def run(base: str = "https://tenet-5.github.io") -> dict:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_dir = _ensure_dirs()
    t0 = time.time()
    try:
        captures = capture(base, stamp, out_dir)
    except Exception as e:
        doc = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "doctrine": "prism_visual_acuity_pc_mobile",
            "verdict": "VISUAL_ACUITY_FAIL",
            "ok": False,
            "error": f"{type(e).__name__}: {e}",
            "base": base,
        }
        _write_proof(doc)
        return doc

    ok_n = sum(1 for c in captures if c.get("ok"))
    total = len(captures)
    # homepage PC + mobile must pass hard
    home_caps = [c for c in captures if c.get("page", "").startswith("index.html") and "#" not in c.get("page", "index.html") or c.get("page") == "index.html"]
    # fix: page field is "index.html" for home
    home_caps = [c for c in captures if c.get("page") == "index.html"]
    home_ok = all(c.get("ok") for c in home_caps) and len(home_caps) >= 2

    pc_ok = all(c.get("ok") for c in captures if c.get("platform") == "pc")
    mobile_ok = all(c.get("ok") for c in captures if c.get("platform") == "mobile")

    verdict = "VISUAL_ACUITY_PASS" if home_ok and ok_n >= max(2, int(total * 0.7)) else "VISUAL_ACUITY_FAIL"
    doc = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "doctrine": "prism_visual_acuity_pc_mobile",
        "project": "TENET5_PUBLIC_SITE_VISUAL_ACUITY",
        "base": base,
        "verdict": verdict,
        "ok": verdict == "VISUAL_ACUITY_PASS",
        "wall_ms": round((time.time() - t0) * 1000, 1),
        "counts": {"ok": ok_n, "total": total, "home_ok": home_ok, "pc_ok": pc_ok, "mobile_ok": mobile_ok},
        "viewports": VIEWPORTS,
        "captures": captures,
        "design_anchors": {"void": VOID_RGB, "ice": ICE_RGB, "ivory": IVORY_RGB},
        "output_dir": str(out_dir),
    }
    _write_proof(doc)
    print(json.dumps({"verdict": verdict, "ok": doc["ok"], "ok_n": ok_n, "total": total, "home_ok": home_ok}, indent=2))
    return doc


def _write_proof(doc: dict) -> None:
    payload = json.dumps(doc, indent=2)
    for path in PROOF:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(payload, encoding="utf-8")
        except OSError:
            pass


def main() -> int:
    base = "https://tenet-5.github.io"
    args = sys.argv[1:]
    if "--base" in args:
        i = args.index("--base")
        if i + 1 < len(args):
            base = args[i + 1]
    doc = run(base)
    return 0 if doc.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
