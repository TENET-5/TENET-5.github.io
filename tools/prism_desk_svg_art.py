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
    """Single-panel broadsheet ink — gag must read at a glance."""
    punch = (item.get("punchline") or "").replace("Caption:", "").strip().strip("'\"")
    title = (item.get("title") or item.get("template") or "Press Ink")[:40]
    tid = item.get("template") or "ink"
    uid = re.sub(r"[^a-zA-Z0-9]", "", item.get("id") or tid)[:16]

    motifs = {
        "phoenix_still_loading": _sc_phoenix(),
        "arrivecan_receipt": _sc_arrivecan(),
        "atip_fully_disclosed": _sc_atip(),
        "maid_capacity_found": _sc_maid_doors(),
        "vac_other_option": _sc_vac(),
        "interference_more_process": _sc_interference(),
        "media_bailout_pen": _sc_media(),
        "ethics_five_hundred": _sc_ethics(),
        "whistleblower_shredder": _sc_whistle(),
        "daycare_2031": _sc_daycare(),
        "nato_study_options": _sc_nato(),
        "equal_terms_apply": _sc_two_tier(),
    }
    scene = motifs.get(tid, _sc_atip())

    # Wrap long punchlines
    punch_show = punch[:78]
    punch_size = 18 if len(punch_show) > 48 else 22

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="{_esc(title)}: {_esc(punch_show)}">
  <defs>
    <linearGradient id="bg{uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1014"/>
      <stop offset="100%" stop-color="#050708"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg{uid})"/>
  <rect x="20" y="16" width="760" height="468" fill="none" stroke="#9adbe8" stroke-opacity="0.2" stroke-width="1"/>
  <!-- newsprint panel -->
  <rect x="40" y="36" width="720" height="360" fill="#efe9dc"/>
  <rect x="40" y="36" width="720" height="28" fill="#0b0e10"/>
  <text x="56" y="55" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="3" fill="#c4a574">{_esc(title.upper())}</text>
  <text x="720" y="55" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="10" fill="#827a6d">PRESS INK</text>
  {scene}
  <!-- caption bar — the knife -->
  <rect x="40" y="396" width="720" height="72" fill="#0b0e10"/>
  <text x="400" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="{punch_size}" font-style="italic" fill="#ece7dc">{_esc(punch_show)}</text>
  <text x="400" y="454" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="2" fill="#3f7c8c">TENET5 · PUBLIC RECORD SATIRE · POWERED BY LIRIL AI</text>
</svg>
'''


def _sc_phoenix() -> str:
    return '''
  <rect x="180" y="100" width="440" height="220" rx="6" fill="#1a1a1a"/>
  <rect x="196" y="116" width="408" height="160" fill="#0d1a12"/>
  <text x="400" y="155" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#6a9" letter-spacing="4">PHOENIX PAY</text>
  <text x="400" y="200" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="28" fill="#c8102e" font-weight="700">RETRY</text>
  <text x="400" y="235" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" fill="#9adbe8">since 2016…</text>
  <text x="400" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#1a1a1a">MODERNIZATION COMPLETE</text>
  <rect x="250" y="330" width="90" height="40" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <text x="295" y="355" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">$0.00</text>
'''


def _sc_arrivecan() -> str:
    return '''
  <rect x="280" y="90" width="120" height="200" rx="18" fill="none" stroke="#1a1a1a" stroke-width="4"/>
  <rect x="295" y="115" width="90" height="140" fill="#1a2830"/>
  <text x="340" y="180" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#9adbe8">Arrive</text>
  <text x="340" y="198" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#9adbe8">CAN</text>
  <path d="M400 140 Q520 100 560 180 Q580 240 540 280 Q480 320 420 260" fill="none" stroke="#c8102e" stroke-width="3"/>
  <text x="530" y="200" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="22" fill="#c8102e" font-weight="700">$54M+</text>
  <text x="530" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#1a1a1a">receipt unfurls…</text>
  <text x="200" y="320" font-family="IBM Plex Mono, monospace" font-size="11" fill="#827a6d">COVID: gone</text>
  <text x="200" y="340" font-family="IBM Plex Mono, monospace" font-size="11" fill="#c8102e">INVOICE: forever</text>
'''


def _sc_atip() -> str:
    return '''
  <rect x="220" y="90" width="360" height="260" fill="#f5f0e6" stroke="#1a1a1a" stroke-width="3"/>
  <text x="400" y="120" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="#1a1a1a">ACCESS TO INFORMATION</text>
  <rect x="250" y="145" width="300" height="22" fill="#0a0a0a"/>
  <rect x="250" y="175" width="300" height="22" fill="#0a0a0a"/>
  <rect x="250" y="205" width="260" height="22" fill="#0a0a0a"/>
  <rect x="250" y="235" width="300" height="22" fill="#0a0a0a"/>
  <rect x="250" y="265" width="180" height="22" fill="#0a0a0a"/>
  <rect x="430" y="265" width="20" height="22" fill="#efe9dc" stroke="#1a1a1a"/>
  <rect x="500" y="100" width="70" height="70" rx="8" fill="#c8102e"/>
  <text x="535" y="130" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#fff">FULLY</text>
  <text x="535" y="148" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#fff">DISCLOSED</text>
'''


def _sc_maid_doors() -> str:
    return '''
  <rect x="120" y="90" width="200" height="260" fill="none" stroke="#1a1a1a" stroke-width="4"/>
  <text x="220" y="130" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#1a1a1a">CARE</text>
  <text x="220" y="152" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#1a1a1a">WAITLIST</text>
  <text x="220" y="190" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#827a6d">est. years</text>
  <g fill="#1a1a1a" opacity="0.7">
    <circle cx="160" cy="300" r="6"/><circle cx="180" cy="305" r="6"/>
    <circle cx="200" cy="298" r="6"/><circle cx="220" cy="308" r="6"/>
    <circle cx="240" cy="302" r="6"/><circle cx="260" cy="310" r="6"/>
    <circle cx="170" cy="320" r="6"/><circle cx="210" cy="325" r="6"/>
    <circle cx="250" cy="318" r="6"/>
  </g>
  <rect x="480" y="90" width="200" height="260" fill="none" stroke="#c8102e" stroke-width="4"/>
  <text x="580" y="130" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#c8102e">MAID</text>
  <text x="580" y="152" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#c8102e">OPEN</text>
  <rect x="510" y="280" width="140" height="14" fill="#c8102e" opacity="0.35"/>
  <text x="580" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#c8102e">no wait</text>
'''


def _sc_vac() -> str:
    return '''
  <rect x="160" y="100" width="480" height="50" fill="#1a1a1a"/>
  <text x="400" y="132" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="16" fill="#ece7dc" letter-spacing="2">VETERANS AFFAIRS — HOW CAN WE HELP?</text>
  <rect x="180" y="180" width="100" height="140" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <text x="230" y="255" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">benefits</text>
  <rect x="300" y="180" width="100" height="140" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <text x="350" y="255" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">housing</text>
  <rect x="420" y="180" width="100" height="140" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <text x="470" y="255" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">treatment</text>
  <rect x="540" y="170" width="110" height="160" fill="#3a1010" stroke="#c8102e" stroke-width="3"/>
  <text x="595" y="250" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#c8102e">OTHER</text>
  <text x="595" y="270" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#c8102e">OPTION</text>
'''


def _sc_interference() -> str:
    return '''
  <rect x="120" y="90" width="560" height="240" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <ellipse cx="400" cy="200" rx="160" ry="70" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="8 5"/>
  <ellipse cx="420" cy="190" rx="100" ry="45" fill="none" stroke="#827a6d" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="400" y="205" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="16" fill="#1a1a1a" letter-spacing="2">INTERFERENCE</text>
  <rect x="140" y="110" width="90" height="40" fill="#9adbe8" opacity="0.25" stroke="#3f7c8c"/>
  <text x="185" y="135" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#1a1a1a">PROCESS</text>
  <rect x="570" y="110" width="90" height="40" fill="#9adbe8" opacity="0.25" stroke="#3f7c8c"/>
  <text x="615" y="135" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#1a1a1a">MORE STUDY</text>
  <text x="200" y="300" font-family="Georgia, serif" font-size="12" fill="#c8102e">$$$ floating in the window →</text>
'''


def _sc_media() -> str:
    return '''
  <rect x="160" y="120" width="280" height="180" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <text x="300" y="155" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#1a1a1a">THE DAILY INDEPENDENT</text>
  <line x1="180" y1="180" x2="400" y2="180" stroke="#1a1a1a" stroke-width="1"/>
  <line x1="180" y1="210" x2="380" y2="210" stroke="#1a1a1a" stroke-width="1"/>
  <line x1="180" y1="240" x2="360" y2="240" stroke="#1a1a1a" stroke-width="1"/>
  <rect x="480" y="140" width="160" height="100" fill="none" stroke="#c8102e" stroke-width="3"/>
  <text x="560" y="185" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#c8102e">SUBSIDY</text>
  <text x="560" y="210" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#1a1a1a">CHEQUEBOOK</text>
  <path d="M440 220 C460 180 480 200 480 190" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <text x="400" y="340" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#827a6d">pen chained to the float</text>
'''


def _sc_ethics() -> str:
    return '''
  <line x1="400" y1="90" x2="400" y2="160" stroke="#1a1a1a" stroke-width="4"/>
  <line x1="280" y1="160" x2="520" y2="160" stroke="#1a1a1a" stroke-width="4"/>
  <path d="M280 160 L220 280 L340 280 Z" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <path d="M520 160 L480 200 L560 200 Z" fill="none" stroke="#c8102e" stroke-width="3"/>
  <text x="280" y="310" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="16" fill="#1a1a1a">$100M+</text>
  <text x="280" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#827a6d">contract</text>
  <text x="520" y="230" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="#c8102e">$500</text>
  <text x="520" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#c8102e">ethics fine</text>
  <text x="400" y="360" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="2" fill="#1a1a1a">LESSON LEARNED</text>
'''


def _sc_whistle() -> str:
    return '''
  <circle cx="200" cy="200" r="40" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <path d="M240 200 L340 160 L340 240 Z" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <text x="200" y="280" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">PROTECTED</text>
  <text x="200" y="296" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#1a1a1a">DISCLOSURE</text>
  <rect x="360" y="140" width="200" height="140" fill="#1a1a1a"/>
  <text x="460" y="200" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="18" fill="#c8102e">PSDPA</text>
  <text x="460" y="230" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#ece7dc">SHREDDER</text>
  <text x="460" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#827a6d">confetti: thank you for your service</text>
  <text x="620" y="180" font-family="IBM Plex Mono, monospace" font-size="11" fill="#c8102e">MAX $10k</text>
'''


def _sc_daycare() -> str:
    return '''
  <rect x="200" y="90" width="400" height="70" fill="#1a2830"/>
  <text x="400" y="135" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="22" fill="#9adbe8">$10 / DAY — OPEN</text>
  <path d="M120 280 Q200 200 280 280 Q360 200 440 280 Q520 200 600 280 Q680 220 720 280" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <text x="400" y="310" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#1a1a1a">the line</text>
  <rect x="560" y="200" width="100" height="60" fill="none" stroke="#c8102e" stroke-width="2"/>
  <text x="610" y="235" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="20" fill="#c8102e">2031</text>
  <text x="200" y="350" font-family="IBM Plex Mono, monospace" font-size="11" fill="#827a6d">toddler holds a university form</text>
'''


def _sc_nato() -> str:
    return '''
  <rect x="160" y="100" width="40" height="200" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <rect x="164" y="260" width="32" height="40" fill="#3f7c8c" opacity="0.4"/>
  <text x="180" y="90" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#1a1a1a">NATO 2%</text>
  <rect x="240" y="160" width="160" height="50" fill="#efe9dc" stroke="#c8102e" stroke-width="2"/>
  <text x="320" y="190" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#c8102e">STUDYING OPTIONS</text>
  <line x1="480" y1="140" x2="480" y2="300" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="480" y1="300" x2="520" y2="340" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="480" y1="300" x2="440" y2="340" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="480" y1="200" x2="520" y2="240" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="520" y1="240" x2="560" y2="200" stroke="#1a1a1a" stroke-width="2"/>
  <text x="560" y="195" font-family="IBM Plex Mono, monospace" font-size="11" fill="#1a1a1a">broom = kit</text>
  <text x="600" y="320" font-family="IBM Plex Mono, monospace" font-size="14" fill="#c8102e">DELIVERY 2034</text>
'''


def _sc_two_tier() -> str:
    return '''
  <circle cx="400" cy="120" r="28" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="400" y1="148" x2="400" y2="200" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="300" y1="200" x2="500" y2="200" stroke="#1a1a1a" stroke-width="4"/>
  <path d="M300 200 L250 300 L350 300 Z" fill="none" stroke="#c8102e" stroke-width="3"/>
  <path d="M500 200 L450 260 L550 260 Z" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <text x="300" y="330" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#c8102e">CONNECTED</text>
  <text x="300" y="350" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#c8102e">wrist slap</text>
  <text x="500" y="290" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#1a1a1a">EVERYONE ELSE</text>
  <text x="500" y="310" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#1a1a1a">full Code</text>
  <text x="400" y="90" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="2" fill="#827a6d">EQUAL BEFORE THE LAW*</text>
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
        # Never overwrite high-quality editorial art with SVG placeholders.
        # HQ lock: art_kind editorial_hq OR existing .jpg/.png image path.
        for it in items:
            if it.get("status") != "ready":
                continue
            img = str(it.get("image") or "")
            kind = str(it.get("art_kind") or "")
            if kind == "editorial_hq" or img.endswith((".jpg", ".jpeg", ".png", ".webp")):
                cartoons += 0  # preserved
                continue
            # Legacy fallback only when no HQ art is locked in
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
        # HARD BAN: never overwrite HQ fashion stills with SVG. Never Comfy/Flux path.
        for i, it in enumerate(items):
            img = str(it.get("image") or "")
            kind = str(it.get("art_kind") or "")
            if kind == "editorial_hq" or img.endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            # SVG fallback only if no HQ art locked (should not ship publicly)
            fn = f"{it.get('id') or f'sun_{i}'}.svg"
            path = SUNROOM_DIR / fn
            path.write_text(sunroom_svg(it, i), encoding="utf-8")
            it["image"] = f"media/sunroom/{fn}"
            it["art_kind"] = "svg_silhouette"
            suns += 1
            written.append(str(path))
        cat["ts_art"] = _utc()
        SUNROOM_CAT.write_text(json.dumps(cat, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    doc = {
        "ok": True,
        "verdict": "DESK_SVG_ART_PASS",
        "ts": _utc(),
        "cartoons": cartoons,
        "sunroom": suns,
        "written_n": len(written),
        "note": "Gentlemen sunroom silhouettes + cartoon ink until Flux/LTX. Taste locked.",
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
