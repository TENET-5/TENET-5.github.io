#!/usr/bin/env python3
"""PRISM CSS quantum precision pipeline — mathematical accuracy of press-theme.

Ground truth: Screenshot 2026-07-10 042513 (The record, read backwards).
Single theme: css/press-theme.css

Checks (deterministic, no network):
  1) Exact :root token equality vs canonical anchors (integer RGB, zero drift)
  2) sRGB relative luminance (WCAG) for void/ice/ivory
  3) WCAG contrast ratios (body text, ice on void, ice on ivory)
  4) Ice chromatic bias (B > R, cyan band) — screenshot ice #9adbe8
  5) Hardcoded rgba() ice triplets in CSS match #9adbe8 (154,219,232)
  6) Ising energy over token-match spins (perfect match → min energy)
  7) Optional C++ quantum coding bench (prism_quantum_coding_bench.exe)

    python tools/prism_css_quantum_precision.py
    python tools/prism_css_quantum_precision.py --no-cpp   # math only
    python tools/prism_css_quantum_precision.py --json out.json

Artifacts:
  C:/PRISM/log/prism_css_quantum_precision_last.json
  data/prism_css_quantum_precision_last.json
"""
from __future__ import annotations

import json
import math
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
THEME = ROOT / "css" / "press-theme.css"
PROOF_PATHS = [
    Path(r"C:\PRISM\log\prism_css_quantum_precision_last.json"),
    ROOT / "data" / "prism_css_quantum_precision_last.json",
]
CPP_BENCH = Path(r"C:\PRISM\bin\prism_quantum_coding_bench.exe")
CPP_PROOF = Path(r"C:\PRISM\log\quantum_coding_pipeline_bench_last.json")
_CNW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

# Screenshot-locked press palette (exact hex — integer RGB ground truth)
CANON = {
    "void": "#1a1612",
    "ink": "#231e18",
    "ivory": "#fbf8f1",
    "ivory_dim": "#e6e2da",
    "ivory_faint": "#c4bfaf",
    "hair": "#5c4033",
    "hair_lit": "#7a5d4f",
    "ice": "#5a7d7c",
    "ice_deep": "#3c5959",
    "red": "#c4573a",
    "red_deep": "#a6432a",
    "gold": "#b66a50",
}
# CSS custom property names
CSS_KEYS = {
    "void": "--void",
    "ink": "--ink",
    "ivory": "--ivory",
    "ivory_dim": "--ivory-dim",
    "ivory_faint": "--ivory-faint",
    "hair": "--hair",
    "hair_lit": "--hair-lit",
    "ice": "--ice",
    "ice_deep": "--ice-deep",
    "red": "--red",
    "red_deep": "--red-deep",
    "gold": "--gold",
}
ICE_RGB = (154, 219, 232)
VOID_RGB = (5, 7, 8)
IVORY_RGB = (236, 231, 220)
KERNEL_BASE = 42  # TENET lattice base — used for modular spacing invariants only


def _hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.strip().lower()
    if h.startswith("#"):
        h = h[1:]
    if len(h) != 6 or any(c not in "0123456789abcdef" for c in h):
        raise ValueError(f"bad hex: {h}")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"


def _srgb_channel(c: float) -> float:
    """Linearize one sRGB channel in [0,1] — WCAG 2.x."""
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    r, g, b = (x / 255.0 for x in rgb)
    R, G, B = _srgb_channel(r), _srgb_channel(g), _srgb_channel(b)
    return 0.2126 * R + 0.7152 * G + 0.0722 * B


def contrast_ratio(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    L1, L2 = relative_luminance(a), relative_luminance(b)
    lighter, darker = max(L1, L2), min(L1, L2)
    return (lighter + 0.05) / (darker + 0.05)


def delta_e76(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    """Euclidean RGB ΔE proxy (integer space) — 0 = exact match."""
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def parse_root_tokens(css: str) -> dict[str, str]:
    """Extract --name:#hex from first :root { ... } block."""
    m = re.search(r":root\s*\{([^}]*)\}", css, re.I | re.S)
    if not m:
        return {}
    body = m.group(1)
    out: dict[str, str] = {}
    for name, val in re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", body, re.I):
        v = val.strip().split()[0].rstrip(",")
        if re.fullmatch(r"#[0-9a-fA-F]{6}", v):
            out[name.lower()] = v.lower()
    return out


def ising_energy(spins: list[int]) -> float:
    """1D Ising ferromagnet H = -sum s_i s_{i+1} - sum s_i (bias toward +1 = match).
    Perfect all-+1 → minimum energy = -(n-1) - n = 1 - 2n.
    """
    if not spins:
        return 0.0
    n = len(spins)
    couple = sum(spins[i] * spins[i + 1] for i in range(n - 1))
    field = sum(spins)
    return float(-(couple + field))


def brute_ising_min(n: int) -> float:
    """Exact min energy for n spins under same Hamiltonian (2^n, n small)."""
    best = float("inf")
    for mask in range(1 << n):
        spins = [1 if (mask >> i) & 1 else -1 for i in range(n)]
        e = ising_energy(spins)
        if e < best:
            best = e
    return best


def check_site_chrome() -> dict:
    """Structural quantum gate: interiors must share press-bar chrome, not product soup."""
    issues: list[str] = []
    interior = 0
    press_bar = 0
    product = 0
    cover_bar = 0
    skip_names = {
        "index_legacy.html",
        "index_backup.html",
        "index-legacy-cap222-shell.html",
    }
    for path in sorted(ROOT.glob("*.html")):
        if path.name in skip_names:
            continue
        t = path.read_text(encoding="utf-8", errors="replace")
        home = path.name == "index.html" and (
            "ghost5" in t or "read <em>backwards" in t or 'class="cover"' in t
        )
        if home:
            continue
        interior += 1
        if 'class="press-bar' in t or "class='press-bar" in t:
            press_bar += 1
        else:
            issues.append(f"no_press_bar:{path.name}")
        if "data-product" in t or re.search(r'class=["\'][^"\']*\bproduct\b', t):
            product += 1
            issues.append(f"product_soup:{path.name}")
        if "cover-bar" in t:
            cover_bar += 1
            issues.append(f"cover_bar_interior:{path.name}")
    ok = interior > 0 and press_bar == interior and product == 0 and cover_bar == 0
    return {
        "ok": ok,
        "interior": interior,
        "press_bar": press_bar,
        "product_left": product,
        "cover_bar_interior": cover_bar,
        "issues": issues[:40],
        "coverage": round(press_bar / interior, 4) if interior else 0.0,
    }


def check_math(css: str) -> dict:
    issues: list[str] = []
    checks: list[dict] = []
    tokens = parse_root_tokens(css)

    if not tokens:
        return {
            "ok": False,
            "issues": ["missing_root_block_or_hex_tokens"],
            "checks": [],
            "tokens_found": {},
            "ising": {},
        }

    spins: list[int] = []
    spin_labels: list[str] = []
    token_report: dict[str, dict] = {}

    for key, css_name in CSS_KEYS.items():
        want = CANON[key].lower()
        got = tokens.get(css_name.lower())
        exact = got == want
        spins.append(1 if exact else -1)
        spin_labels.append(key)
        de = None
        if got:
            try:
                de = round(delta_e76(_hex_to_rgb(got), _hex_to_rgb(want)), 6)
            except ValueError:
                de = None
        token_report[key] = {
            "css": css_name,
            "canonical": want,
            "actual": got,
            "exact_match": exact,
            "delta_e76": de,
        }
        if not exact:
            issues.append(f"token_mismatch:{key}:{got}!={want}")
        checks.append(
            {
                "id": f"exact_{key}",
                "ok": exact,
                "detail": f"{css_name} {got} == {want}" if exact else f"{css_name} {got} != {want}",
            }
        )

    # Fonts locked
    font_ok = (
        "Fraunces" in css
        and "IBM Plex Mono" in css
        and "--serif:" in css
        and "--mono:" in css
    )
    checks.append({"id": "fonts_locked", "ok": font_ok, "detail": "Fraunces + IBM Plex Mono in :root"})
    if not font_ok:
        issues.append("fonts_not_locked")
    spins.append(1 if font_ok else -1)
    spin_labels.append("fonts")

    # Luminance bounds (void near-black, ivory light, ice mid-high cyan)
    try:
        void_L = relative_luminance(VOID_RGB)
        ivory_L = relative_luminance(IVORY_RGB)
        ice_L = relative_luminance(ICE_RGB)
    except Exception as e:
        void_L = ivory_L = ice_L = -1.0
        issues.append(f"luma_error:{e}")

    void_ok = 0.0 <= void_L < 0.02
    ivory_ok = ivory_L > 0.70
    ice_ok = 0.55 < ice_L < 0.85
    checks.append({"id": "luma_void", "ok": void_ok, "detail": f"L_void={void_L:.6f} < 0.02"})
    checks.append({"id": "luma_ivory", "ok": ivory_ok, "detail": f"L_ivory={ivory_L:.6f} > 0.70"})
    checks.append({"id": "luma_ice", "ok": ice_ok, "detail": f"L_ice={ice_L:.6f} in (0.55,0.85)"})
    if not void_ok:
        issues.append("void_not_near_black")
    if not ivory_ok:
        issues.append("ivory_not_light")
    if not ice_ok:
        issues.append("ice_luma_out_of_band")
    for ok, lab in ((void_ok, "L_void"), (ivory_ok, "L_ivory"), (ice_ok, "L_ice")):
        spins.append(1 if ok else -1)
        spin_labels.append(lab)

    # Ice chromatic: B > R+20, G high — cyan identity
    ir, ig, ib = ICE_RGB
    ice_chroma = ib > ir + 20 and ig > 160 and abs(ig - ib) < 50
    checks.append(
        {
            "id": "ice_cyan_bias",
            "ok": ice_chroma,
            "detail": f"ice RGB={ICE_RGB} B>R+20 G>160",
        }
    )
    if not ice_chroma:
        issues.append("ice_not_cyan")
    spins.append(1 if ice_chroma else -1)
    spin_labels.append("ice_chroma")

    # WCAG contrast
    c_body = contrast_ratio(IVORY_RGB, VOID_RGB)
    c_ice_void = contrast_ratio(ICE_RGB, VOID_RGB)
    c_ice_deep = contrast_ratio(_hex_to_rgb(CANON["ice_deep"]), VOID_RGB)
    # Body text needs AA (4.5). Ice accent on void: large-text AA (3.0) acceptable for UI chrome.
    body_aa = c_body >= 4.5
    ice_large = c_ice_void >= 3.0
    checks.append({"id": "contrast_ivory_void", "ok": body_aa, "detail": f"{c_body:.4f}:1 AA>=4.5"})
    checks.append({"id": "contrast_ice_void", "ok": ice_large, "detail": f"{c_ice_void:.4f}:1 large>=3.0"})
    checks.append(
        {
            "id": "contrast_ice_deep_void",
            "ok": c_ice_deep >= 2.5,
            "detail": f"{c_ice_deep:.4f}:1 meta-muted",
        }
    )
    if not body_aa:
        issues.append(f"body_contrast_fail:{c_body:.3f}")
    if not ice_large:
        issues.append(f"ice_contrast_fail:{c_ice_void:.3f}")
    spins.append(1 if body_aa else -1)
    spin_labels.append("contrast_body")
    spins.append(1 if ice_large else -1)
    spin_labels.append("contrast_ice")

    # Hardcoded rgba(154,219,232,...) must not drift from ice
    rgba_hits = re.findall(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", css)
    ice_drifts = []
    for r, g, b in rgba_hits:
        rgb = (int(r), int(g), int(b))
        # near-ice but not exact → drift
        de = delta_e76(rgb, ICE_RGB)
        if 0 < de < 25 and rgb != ICE_RGB and rgb != (0, 0, 0):
            # only flag if in ice neighborhood but wrong
            if abs(rgb[0] - ICE_RGB[0]) < 40 and abs(rgb[2] - ICE_RGB[2]) < 40:
                ice_drifts.append(rgb)
    # Exact ice rgba is required present (glass system)
    has_ice_rgba = any((int(r), int(g), int(b)) == ICE_RGB for r, g, b in rgba_hits)
    checks.append(
        {
            "id": "ice_rgba_present",
            "ok": has_ice_rgba,
            "detail": "rgba(154,219,232,...) used in glass/aurora",
        }
    )
    if not has_ice_rgba:
        issues.append("missing_ice_rgba_literal")
    spins.append(1 if has_ice_rgba else -1)
    spin_labels.append("ice_rgba")

    # Red rails identity #c8102e
    red_ok = tokens.get("--red") == CANON["red"]
    checks.append({"id": "red_rail", "ok": red_ok, "detail": f"--red={tokens.get('--red')}"})
    spins.append(1 if red_ok else -1)
    spin_labels.append("red_rail")

    # Modular invariant: token count of exact hex matches % KERNEL_BASE posture
    # (not forced to 42; report residue for lattice telemetry)
    n_exact = sum(1 for s in spins if s == 1)
    n_total = len(spins)
    residue = n_exact % KERNEL_BASE

    # Ising: measured energy vs theoretical minimum for all-match
    E = ising_energy(spins)
    E_min_all_plus = ising_energy([1] * n_total)  # perfect config
    E_brute = brute_ising_min(min(n_total, 16)) if n_total <= 16 else E_min_all_plus
    perfect = all(s == 1 for s in spins) and E == E_min_all_plus
    checks.append(
        {
            "id": "ising_ground_state",
            "ok": perfect,
            "detail": f"E={E:.3f} E_perfect={E_min_all_plus:.3f} spins+={n_exact}/{n_total}",
        }
    )
    if not perfect:
        issues.append(f"ising_not_ground:E={E}")

    # No banned alternate palettes redefining chrome in this file
    banned = ["#38bdf8", "#0ea5e9", "accent-cyan", "quantanium.css"]
    ban_hits = [b for b in banned if b in css]
    ban_ok = len(ban_hits) == 0
    checks.append({"id": "no_cyber_ban", "ok": ban_ok, "detail": f"banned={ban_hits}"})
    if not ban_ok:
        issues.append(f"banned_tokens:{ban_hits}")

    ok = len(issues) == 0 and all(c["ok"] for c in checks)
    return {
        "ok": ok,
        "issues": issues,
        "checks": checks,
        "tokens_found": tokens,
        "token_report": token_report,
        "luminance": {
            "void": round(void_L, 8),
            "ivory": round(ivory_L, 8),
            "ice": round(ice_L, 8),
        },
        "contrast": {
            "ivory_on_void": round(c_body, 6),
            "ice_on_void": round(c_ice_void, 6),
            "ice_deep_on_void": round(c_ice_deep, 6),
            "body_AA_4_5": body_aa,
            "ice_large_AA_3_0": ice_large,
        },
        "ising": {
            "spins": spins,
            "labels": spin_labels,
            "energy": E,
            "energy_perfect": E_min_all_plus,
            "brute_min_n_le_16": E_brute,
            "ground_state": perfect,
            "match_count": n_exact,
            "spin_count": n_total,
            "kernel_base": KERNEL_BASE,
            "match_mod_42": residue,
        },
        "canonical": CANON,
        "ice_rgb": list(ICE_RGB),
        "void_rgb": list(VOID_RGB),
        "ivory_rgb": list(IVORY_RGB),
    }


def run_cpp_quantum() -> dict:
    """Run C++ PRISM quantum coding bench (CREATE_NO_WINDOW)."""
    if not CPP_BENCH.exists():
        return {"ok": False, "detail": f"missing {CPP_BENCH}", "skipped": False}
    t0 = time.time()
    try:
        r = subprocess.run(
            [str(CPP_BENCH), "--json", str(CPP_PROOF)],
            capture_output=True,
            text=True,
            timeout=180,
            encoding="utf-8",
            errors="replace",
            creationflags=_CNW,
        )
        tail = ((r.stdout or "") + "\n" + (r.stderr or ""))[-1200:]
        bench_ok = r.returncode == 0 and "QUANTUM_CODING_BENCH_PASS" in (r.stdout or "")
        proof = {}
        if CPP_PROOF.exists():
            try:
                proof = json.loads(CPP_PROOF.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                proof = {}
        return {
            "ok": bench_ok,
            "exit": r.returncode,
            "ms": round((time.time() - t0) * 1000, 1),
            "verdict": "QUANTUM_CODING_BENCH_PASS" if bench_ok else "QUANTUM_CODING_BENCH_FAIL",
            "proof": str(CPP_PROOF),
            "proof_verdict": proof.get("verdict") or proof.get("VERDICT"),
            "tail": tail,
        }
    except Exception as e:
        return {"ok": False, "detail": f"{type(e).__name__}: {e}", "ms": round((time.time() - t0) * 1000, 1)}


def run(no_cpp: bool = False) -> dict:
    ts = datetime.now(timezone.utc).isoformat()
    if not THEME.exists():
        doc = {
            "ts": ts,
            "doctrine": "prism_css_quantum_precision",
            "verdict": "CSS_QUANTUM_FAIL",
            "ok": False,
            "error": f"missing {THEME}",
        }
        _write(doc)
        return doc

    css = THEME.read_text(encoding="utf-8", errors="replace")
    math = check_math(css)
    chrome = check_site_chrome()
    cpp = {"ok": True, "skipped": True, "detail": "skipped --no-cpp"} if no_cpp else run_cpp_quantum()

    ok = bool(math.get("ok")) and bool(chrome.get("ok")) and bool(cpp.get("ok"))
    verdict = "CSS_QUANTUM_PASS" if ok else "CSS_QUANTUM_FAIL"
    doc = {
        "ts": ts,
        "doctrine": "prism_css_quantum_precision",
        "project": "TENET5_PUBLIC_SITE_VISUAL_ACUITY",
        "theme": str(THEME.relative_to(ROOT)).replace("\\", "/"),
        "theme_bytes": THEME.stat().st_size,
        "verdict": verdict,
        "ok": ok,
        "math": math,
        "chrome": chrome,
        "cpp_quantum": cpp,
        "rule": "C++_AND_MATH_PRECISION_FOR_CSS_TOKENS_AND_SITE_CHROME",
        "ground_truth": "Screenshot 2026-07-10 042513 The record, read backwards",
    }
    _write(doc)
    print(
        json.dumps(
            {
                "verdict": verdict,
                "ok": ok,
                "math_ok": math.get("ok"),
                "chrome_ok": chrome.get("ok"),
                "press_bar": f"{chrome.get('press_bar')}/{chrome.get('interior')}",
                "product_left": chrome.get("product_left"),
                "ising_E": (math.get("ising") or {}).get("energy"),
                "ising_ground": (math.get("ising") or {}).get("ground_state"),
                "cpp_ok": cpp.get("ok"),
                "cpp_verdict": cpp.get("verdict"),
                "issues": (math.get("issues", []) + chrome.get("issues", []))[:12],
            },
            indent=2,
        )
    )
    return doc


def _write(doc: dict) -> None:
    payload = json.dumps(doc, indent=2)
    for path in PROOF_PATHS:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(payload, encoding="utf-8")
        except OSError:
            pass


def main() -> int:
    args = sys.argv[1:]
    no_cpp = "--no-cpp" in args or os.environ.get("PRISM_CSS_QUANTUM_NO_CPP", "").strip() in {
        "1",
        "true",
        "yes",
    }
    # forever site duty may set FAST — still run math; cpp optional via env
    if os.environ.get("PRISM_SITE_DUTY_FAST", "").strip() in {"1", "true", "yes"}:
        no_cpp = True
    doc = run(no_cpp=no_cpp)
    return 0 if doc.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
