#!/usr/bin/env python3
"""Render elite SVG art for Press Ink cartoons + Sunroom silhouettes.

No faces, ice-lake broadsheet ink. Ships immediately without Flux.
When Flux/LTX runs later, replace paths in catalogs.

  python tools/prism_desk_svg_art.py --json --apply
"""
from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CARTOON_DIR = ROOT / "media" / "cartoons"
SUNROOM_DIR = ROOT / "media" / "sunroom"
CARTOON_CAT = ROOT / "data" / "cartoon_desk.json"
SUNROOM_CAT = ROOT / "data" / "sunroom_catalog.json"
PROOF = ROOT / "data" / "prism_desk_svg_art_last.json"


def _utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _esc(s: str) -> str:
    return html.escape(s or "", quote=True)


def cartoon_svg(item: dict[str, Any]) -> str:
    """Single-panel broadsheet ink SVG — funny, tasteful, readable caption."""
    punch = (item.get("punchline") or "").replace("Caption:", "").strip().strip("'\"")
    title = (item.get("laugh_engine") or item.get("target") or "Press Ink")[:48]
    tid = item.get("template") or "ink"

    # Scene motifs by template id
    motifs = {
        "promise_vs_ledger": _balloon_ledger(),
        "oversight_asleep": _watchdog(),
        "two_sets_of_books": _two_binders(),
        "procurement_snail": _snail_jet(),
        "maid_form_queue": _two_doors(),
        "housing_ladder": _floating_ladder(),
        "foreign_interference_smoke": _smoke_room(),
        "media_subsidy_handshake": _cheque_notepad(),
    }
    scene = motifs.get(tid, _balloon_ledger())

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="{_esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1014"/>
      <stop offset="100%" stop-color="#050708"/>
    </linearGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 0 0.95  0 0 0 0.04 0"/></filter>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect x="24" y="20" width="752" height="460" fill="none" stroke="#9adbe8" stroke-opacity="0.22" stroke-width="1.5"/>
  <rect x="28" y="24" width="744" height="452" fill="#0e1318" stroke="#ece7dc" stroke-opacity="0.12"/>
  <!-- paper panel -->
  <rect x="48" y="44" width="704" height="340" fill="#e8e2d6" opacity="0.96"/>
  <rect x="48" y="44" width="704" height="340" filter="url(#grain)" opacity="0.35"/>
  {scene}
  <!-- caption bar -->
  <rect x="48" y="396" width="704" height="68" fill="#0b0e10"/>
  <text x="400" y="428" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#ece7dc">{_esc(punch[:72])}</text>
  <text x="400" y="452" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="2" fill="#9adbe8">PRESS INK · TENET5 · POWERED BY LIRIL AI</text>
  <text x="64" y="68" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="3" fill="#3f7c8c">{_esc(title.upper()[:40])}</text>
</svg>
'''


def _balloon_ledger() -> str:
    return '''
  <rect x="120" y="200" width="220" height="140" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="140" y1="230" x2="300" y2="230" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="140" y1="260" x2="280" y2="260" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="140" y1="290" x2="260" y2="290" stroke="#1a1a1a" stroke-width="2"/>
  <ellipse cx="520" cy="160" rx="90" ry="70" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <text x="520" y="168" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#1a1a1a">PROMISE</text>
  <line x1="520" y1="230" x2="520" y2="300" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="520" cy="310" r="8" fill="#c8102e"/>
  <!-- stick figure office (no face detail) -->
  <circle cx="520" cy="250" r="18" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="520" y1="268" x2="520" y2="320" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="520" y1="285" x2="490" y2="300" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="520" y1="285" x2="550" y2="270" stroke="#1a1a1a" stroke-width="2"/>
'''


def _watchdog() -> str:
    return '''
  <ellipse cx="380" cy="280" rx="100" ry="55" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <circle cx="320" cy="240" r="36" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <ellipse cx="300" cy="220" rx="10" ry="18" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <ellipse cx="340" cy="220" rx="10" ry="18" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <!-- Zzz -->
  <text x="380" y="200" font-family="Georgia, serif" font-size="28" fill="#1a1a1a">z z z</text>
  <!-- reports -->
  <rect x="480" y="220" width="90" height="110" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <rect x="500" y="200" width="90" height="110" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <rect x="520" y="180" width="90" height="110" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <text x="565" y="240" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">A.G.</text>
  <rect x="300" y="300" width="50" height="18" rx="4" fill="none" stroke="#c8102e" stroke-width="2"/>
'''


def _two_binders() -> str:
    return '''
  <rect x="180" y="260" width="440" height="20" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <rect x="220" y="200" width="50" height="60" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <text x="245" y="235" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" fill="#1a1a1a">PUBLIC</text>
  <g>
    <rect x="400" y="100" width="70" height="160" fill="none" stroke="#1a1a1a" stroke-width="2"/>
    <rect x="410" y="90" width="70" height="160" fill="none" stroke="#1a1a1a" stroke-width="2"/>
    <rect x="420" y="80" width="70" height="160" fill="none" stroke="#1a1a1a" stroke-width="2"/>
    <rect x="430" y="70" width="70" height="160" fill="none" stroke="#1a1a1a" stroke-width="2"/>
    <rect x="440" y="60" width="70" height="160" fill="none" stroke="#c8102e" stroke-width="2"/>
  </g>
  <text x="475" y="150" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="#1a1a1a">BRIEFING</text>
'''


def _snail_jet() -> str:
    return '''
  <!-- snail -->
  <ellipse cx="280" cy="280" rx="55" ry="28" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <path d="M230 280 Q200 250 220 230" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="215" cy="225" r="6" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <path d="M260 255 Q280 220 310 250" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <!-- general hat -->
  <rect x="250" y="248" width="40" height="10" fill="#1a1a1a"/>
  <polygon points="255,248 290,248 272,230" fill="none" stroke="#c8102e" stroke-width="2"/>
  <!-- tiny jet on string -->
  <line x1="330" y1="270" x2="480" y2="200" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>
  <path d="M480 200 l40 5 l-10 10 l-30 -5 z" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <text x="520" y="180" font-family="IBM Plex Mono, monospace" font-size="12" fill="#1a1a1a">2034</text>
  <line x1="120" y1="320" x2="680" y2="320" stroke="#1a1a1a" stroke-width="2"/>
'''


def _two_doors() -> str:
    return '''
  <rect x="160" y="120" width="140" height="220" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <text x="230" y="160" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#1a1a1a">CARE</text>
  <text x="230" y="178" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#1a1a1a">WAITLIST</text>
  <!-- long queue of circles (no faces) -->
  <g stroke="#1a1a1a" fill="none" stroke-width="1.5">
    <circle cx="200" cy="300" r="8"/><circle cx="220" cy="305" r="8"/>
    <circle cx="240" cy="298" r="8"/><circle cx="260" cy="310" r="8"/>
    <circle cx="190" cy="320" r="8"/><circle cx="230" cy="325" r="8"/>
  </g>
  <rect x="480" y="120" width="140" height="220" fill="none" stroke="#c8102e" stroke-width="3"/>
  <text x="550" y="160" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#c8102e">FASTER</text>
  <text x="550" y="178" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#c8102e">OPTION</text>
  <rect x="500" y="300" width="100" height="12" fill="#c8102e" opacity="0.35"/>
'''


def _floating_ladder() -> str:
    return '''
  <line x1="420" y1="80" x2="420" y2="280" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="480" y1="80" x2="480" y2="280" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="420" y1="110" x2="480" y2="110" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="420" y1="150" x2="480" y2="150" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="420" y1="190" x2="480" y2="190" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="420" y1="230" x2="480" y2="230" stroke="#1a1a1a" stroke-width="2"/>
  <text x="500" y="115" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">rates</text>
  <text x="500" y="155" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">zoning</text>
  <text x="500" y="195" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">capital</text>
  <!-- couple no faces -->
  <circle cx="300" cy="300" r="14" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="340" cy="300" r="14" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="300" y1="314" x2="300" y2="350" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="340" y1="314" x2="340" y2="350" stroke="#1a1a1a" stroke-width="2"/>
  <text x="450" y="70" font-family="Georgia, serif" font-size="14" fill="#1a1a1a">starter home</text>
'''


def _smoke_room() -> str:
    return '''
  <rect x="140" y="100" width="520" height="220" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <ellipse cx="400" cy="200" rx="120" ry="60" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="6 4"/>
  <ellipse cx="420" cy="190" rx="80" ry="40" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="400" y="205" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#1a1a1a">FINDINGS</text>
  <rect x="160" y="120" width="40" height="60" fill="none" stroke="#9adbe8" stroke-width="2"/>
  <text x="180" y="155" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" fill="#3f7c8c">PROCESS</text>
  <rect x="600" y="120" width="40" height="60" fill="none" stroke="#9adbe8" stroke-width="2"/>
'''


def _cheque_notepad() -> str:
    return '''
  <rect x="200" y="160" width="200" height="140" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="220" y1="200" x2="360" y2="200" stroke="#1a1a1a" stroke-width="1.5"/>
  <line x1="220" y1="230" x2="340" y2="230" stroke="#1a1a1a" stroke-width="1.5"/>
  <line x1="220" y1="260" x2="320" y2="260" stroke="#1a1a1a" stroke-width="1.5"/>
  <rect x="420" y="180" width="180" height="80" fill="none" stroke="#c8102e" stroke-width="2"/>
  <text x="510" y="225" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#c8102e">$ SUBSIDY</text>
  <path d="M400 220 Q410 200 420 220" fill="none" stroke="#1a1a1a" stroke-width="2"/>
'''


def sunroom_svg(item: dict[str, Any], i: int) -> str:
    """Gentlemen's fashion silhouette — glam stance, face not the subject."""
    wardrobe = (item.get("wardrobe") or "sundress")[:40]
    setting = (item.get("setting") or "lakeshore")[:40]
    # silhouette colors ice lake + warm fashion accents
    dress = ["#c4a574", "#9adbe8", "#e8e2d6", "#3f7c8c", "#d4b896", "#a89f90"][i % 6]
    # slight pose variation: lean / stand / three-quarter
    lean = (i % 3) - 1  # -1, 0, 1
    cx = 300 + lean * 18
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="Sunroom gentlemen's summer fashion">
  <defs>
    <linearGradient id="sky{i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#243640"/>
      <stop offset="55%" stop-color="#121a20"/>
      <stop offset="100%" stop-color="#050708"/>
    </linearGradient>
    <linearGradient id="glow{i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c4a574" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#050708" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#sky{i})"/>
  <rect width="600" height="400" fill="url(#glow{i})"/>
  <!-- horizon / lake -->
  <rect x="0" y="500" width="600" height="300" fill="#0b1014"/>
  <line x1="0" y1="500" x2="600" y2="500" stroke="#c4a574" stroke-opacity="0.25" stroke-width="1"/>
  <!-- figure: three-quarter glam, face in hat shadow (magazine craft) -->
  <ellipse cx="{cx}" cy="200" rx="38" ry="44" fill="#1a1614"/>
  <!-- hair sweep over shoulder -->
  <path d="M{cx - 30} 190 Q{cx - 70} 280 {cx - 40} 340" fill="none" stroke="#2a2420" stroke-width="18" stroke-linecap="round"/>
  <!-- hat brim silhouette -->
  <ellipse cx="{cx}" cy="175" rx="68" ry="11" fill="#0d0d0d"/>
  <rect x="{cx - 28}" y="140" width="56" height="36" rx="6" fill="#0d0d0d"/>
  <!-- confident shoulders + dress -->
  <path d="M{cx - 55} 255 Q{cx - 70} 380 {cx - 90} 500 L{cx + 90} 500 Q{cx + 70} 380 {cx + 55} 255 Q{cx} 275 {cx - 55} 255 Z" fill="{dress}" opacity="0.9"/>
  <path d="M{cx - 55} 255 Q{cx} 290 {cx + 55} 255" fill="none" stroke="#ece7dc" stroke-opacity="0.35" stroke-width="1.2"/>
  <!-- waist cinch suggestion -->
  <ellipse cx="{cx}" cy="340" rx="48" ry="8" fill="none" stroke="#050708" stroke-opacity="0.2" stroke-width="2"/>
  <!-- long legs -->
  <line x1="{cx - 28}" y1="500" x2="{cx - 32}" y2="620" stroke="#2a2420" stroke-width="9" stroke-linecap="round"/>
  <line x1="{cx + 28}" y1="500" x2="{cx + 36}" y2="620" stroke="#2a2420" stroke-width="9" stroke-linecap="round"/>
  <text x="300" y="680" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="3" fill="#c4a574">GENTLEMEN'S SUMMER</text>
  <text x="300" y="710" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#e8e2d6">{_esc(wardrobe)}</text>
  <text x="300" y="740" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#827a6d">{_esc(setting)}</text>
  <text x="300" y="770" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="2" fill="#3f7c8c">SUNROOM · TENET5 · POWERED BY LIRIL AI</text>
</svg>
'''


def apply() -> dict[str, Any]:
    CARTOON_DIR.mkdir(parents=True, exist_ok=True)
    SUNROOM_DIR.mkdir(parents=True, exist_ok=True)
    written = []
    cartoons = 0
    suns = 0

    if CARTOON_CAT.is_file():
        cat = json.loads(CARTOON_CAT.read_text(encoding="utf-8-sig"))
        items = cat.get("items") or []
        for it in items:
            if it.get("status") != "ready":
                continue
            fn = f"{it['id']}.svg"
            path = CARTOON_DIR / fn
            path.write_text(cartoon_svg(it), encoding="utf-8")
            it["image"] = f"media/cartoons/{fn}"
            it["art_kind"] = "svg_broadsheet"
            cartoons += 1
            written.append(str(path))
        cat["ts_art"] = _utc()
        CARTOON_CAT.write_text(json.dumps(cat, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if SUNROOM_CAT.is_file():
        cat = json.loads(SUNROOM_CAT.read_text(encoding="utf-8-sig"))
        items = cat.get("items") or []
        for it in items:
            # FLAG: Banned SVG generation for sunroom. High quality only.
            if "image" in it:
                del it["image"]
            if "art_kind" in it:
                del it["art_kind"]
        cat["ts_art"] = _utc()
        SUNROOM_CAT.write_text(json.dumps(cat, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    doc = {
        "ok": True,
        "verdict": "DESK_SVG_ART_PASS",
        "ts": _utc(),
        "cartoons": cartoons,
        "sunroom": suns,
        "written_n": len(written),
        "note": "Elite SVG placeholders until Flux/LTX pixels ship. Taste locked.",
    }
    PROOF.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return doc


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    doc = apply() if args.apply else {"ok": True, "verdict": "DESK_SVG_DRY", "ts": _utc()}
    if args.json:
        print(json.dumps(doc, indent=2, ensure_ascii=False))
    else:
        print(doc.get("verdict"), doc.get("cartoons"), doc.get("sunroom"))
    return 0 if doc.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
