#!/usr/bin/env python3
"""Sunroom — elite face-covered fashion stills (fully clothed, ice-lake).

No faces, no tattoos, no identifying marks. Sundress / beach / summer street.
Outputs prompt packs + catalog for the public desk. Wire Flux/Comfy later.

  python tools/prism_sunroom_gen.py --json --apply --n 8
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "sunroom_catalog.json"
PROOF = ROOT / "data" / "prism_sunroom_gen_last.json"

BANNED = re.compile(
    r"\b(nude|naked|topless|lingerie|porn|explicit|child|teen|schoolgirl|"
    r"identifiable face|tattoo|scar|barcode|logo|flag|hud|neon|cyberpunk)\b",
    re.I,
)

WARDROBE = [
    "linen sundress in pale ice blue, light fabric in wind",
    "classic one-piece swimsuit, high neck, modest cut, beach towel over shoulders",
    "sundress with wide sun hat held over the face",
    "summer linen set, cropped jacket, book held in front of the face",
    "bikini with oversized shirt worn open as cover-up, hat brim down",
    "floral midi sundress, hands gently covering the face",
    "white cotton beach dress, turned three-quarters away from camera",
    "resort wrap dress, scarf lightly across the lower face",
]

SETTINGS = [
    "cold Toronto lakeshore boardwalk, overcast ice light",
    "empty cottage dock on a grey-blue lake, morning mist",
    "quiet residential street of brick houses, soft summer cloud",
    "rooftop terrace with glass rail, desaturated skyline soft behind",
    "sand path through dunes, cool Atlantic wind",
    "hotel pool edge after rain, wet stone, pale sky",
    "urban park path, deep shade and ice-lake highlights",
    "yacht club pier, empty, restrained documentary fashion light",
]

POSE = [
    "face completely covered by both hands, relaxed shoulders",
    "wide-brim hat pulled low, chin tucked, no eyes visible",
    "looking away to the far horizon, face out of focus and turned",
    "magazine held open in front of the face, pages soft unreadable",
    "hair blown across the face, identity obscured",
    "shadow from a parasol covering the face plane entirely",
]

LENS = [
    "35mm fashion editorial, natural depth",
    "50mm magazine cover distance, soft background",
    "24mm environmental fashion, full figure",
]


def _utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _pick(opts: list[str], key: str) -> str:
    h = int(hashlib.sha256(key.encode()).hexdigest()[:8], 16)
    return opts[h % len(opts)]


def compose_prompt(seed: int, i: int) -> dict[str, Any]:
    key = f"sunroom|{seed}|{i}"
    wardrobe = _pick(WARDROBE, key + "w")
    setting = _pick(SETTINGS, key + "s")
    pose = _pick(POSE, key + "p")
    lens = _pick(LENS, key + "l")
    prompt = (
        f"Elite fashion still photograph of an adult woman, fully clothed, "
        f"{wardrobe}, {pose}, standing in {setting}, {lens}, "
        "ice-lake desaturated grade, restrained magazine taste, "
        "identity fully obscured, no facial features readable, no tattoos, no scars, "
        "no logos, no text, photoreal, high detail fabric, dignity not softcore"
    )
    if BANNED.search(prompt):
        prompt = BANNED.sub(" ", prompt)
        prompt = re.sub(r"\s+", " ", prompt).strip()
    neg = (
        "face visible, eyes, nose detail, identifiable person, tattoo, scar, mole map, "
        "nude, lingerie, porn, child, teen, school, logo, text, neon, cyberpunk, gore"
    )
    return {
        "id": f"sunroom_{seed}_{i:02d}",
        "seed": seed + i * 17,
        "wardrobe": wardrobe,
        "setting": setting,
        "pose": pose,
        "prompt": re.sub(r"\s+", " ", prompt).strip(),
        "negative": neg,
        "caption": "Sunroom · faces covered · fully clothed · AI-composed · Powered by LIRIL AI",
        "status": "prompt_ready",
    }


def build(n: int = 8, seed: int = 42) -> dict[str, Any]:
    items = [compose_prompt(seed, i) for i in range(max(1, min(n, 24)))]
    return {
        "ok": True,
        "verdict": "SUNROOM_CATALOG_PASS",
        "ts": _utc(),
        "doctrine": "sunroom_no_faces_fully_clothed_elite",
        "n": len(items),
        "items": items,
        "public_page": "sunroom.html",
        "note": "Prompts for Flux/Comfy. Never ship faces, tattoos, or nude framing.",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--n", type=int, default=8)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    doc = build(args.n, args.seed)
    if args.apply:
        OUT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        PROOF.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.json:
        print(json.dumps(doc, indent=2, ensure_ascii=False))
    else:
        print(doc["verdict"], doc["n"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
