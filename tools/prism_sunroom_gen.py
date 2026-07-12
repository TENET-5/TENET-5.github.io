#!/usr/bin/env python3
"""Sunroom — gentlemen's summer fashion desk (Maxim energy, elite taste).

For gentlemen: confident summer women, fully clothed, fashion-first.
Sundress / resort / swim-as-clothing. Composition turns the face
away as magazine craft — never privacy-thriller or softcore.

HARD BAN: never ComfyUI, never Flux, never local SD pipelines for this desk.
HQ art is editorial fashion stills only (art_kind editorial_hq). Do not
overwrite locked JPGs with SVG placeholders.

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
    r"identifiable face|tattoo|scar|barcode|logo|flag|hud|neon|cyberpunk|"
    r"identity obscured|are these real|surveillance)\b",
    re.I,
)

# Aspirational Maxim wardrobe — sex sells, clothes stay on, taste holds.
WARDROBE = [
    "pale linen sundress catching lake wind, bare shoulders, clean lines",
    "classic high-neck one-piece swimsuit with open linen shirt as cover-up",
    "floral midi sundress, cinched waist, summer hat as style prop",
    "white cotton beach dress, light fabric against cool grey water",
    "resort wrap dress, gold-tone sandals, confident full-figure stance",
    "bikini with oversized oxford shirt worn open, hat brim low for style",
    "ice-blue slip sundress, silk sheen, evening terrace light",
    "tailored linen co-ord set, cropped jacket, long legs, yacht-club air",
]

SETTINGS = [
    "Toronto lakeshore boardwalk at golden hour, glass towers soft behind",
    "empty cottage dock on a blue-grey lake, morning heat rising",
    "hotel pool edge after rain, wet stone, pale sky, quiet money",
    "sand path through dunes, Atlantic wind, resort weekend energy",
    "rooftop terrace with glass rail, desaturated skyline, cocktail hour",
    "yacht club pier, empty slips, restrained documentary fashion light",
    "urban park path in deep shade with ice-lake highlights on fabric",
    "quiet residential street of brick houses, soft summer cloud",
]

# Magazine craft: face not the subject — never hands-over-face thriller.
POSE = [
    "three-quarter back to camera, hair over one shoulder, confident stance",
    "walking toward the light, full figure, face turned to the horizon",
    "leaning on a rail, looking out, body language open and assured",
    "over-the-shoulder composition, face soft out of frame, dress the hero",
    "wide-brim hat as silhouette, chin lifted, glamorous posture",
    "seated edge of dock, legs long, gaze to water, magazine cover distance",
]

LENS = [
    "35mm fashion editorial, natural depth, full figure priority",
    "50mm gentlemen's magazine cover distance, soft background",
    "24mm environmental fashion, body and place in one frame",
]

CAPTIONS = [
    "Sunroom · gentlemen's summer · Powered by LIRIL AI",
    "Sunroom · heat, properly dressed · Powered by LIRIL AI",
    "Sunroom · lake light and linen · Powered by LIRIL AI",
    "Sunroom · resort hour · Powered by LIRIL AI",
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
    caption = _pick(CAPTIONS, key + "c")
    prompt = (
        f"Gentlemen's magazine fashion still of an adult woman, fully clothed, "
        f"{wardrobe}, {pose}, in {setting}, {lens}, "
        "aspirational Maxim energy with ice-lake elite taste, "
        "confident glamorous body language, face not the subject of the frame, "
        "no readable facial portrait, no tattoos, no scars, no logos, no text, "
        "photoreal fabric detail, sexy but never softcore, never creepy"
    )
    if BANNED.search(prompt):
        prompt = BANNED.sub(" ", prompt)
        prompt = re.sub(r"\s+", " ", prompt).strip()
    neg = (
        "face close-up, eyes detail, identifiable person, tattoo, scar, mole map, "
        "nude, lingerie, porn, softcore, child, teen, school, logo, text, neon, "
        "cyberpunk, gore, hands covering face, identity thriller"
    )
    return {
        "id": f"sunroom_{seed}_{i:02d}",
        "seed": seed + i * 17,
        "wardrobe": wardrobe,
        "setting": setting,
        "pose": pose,
        "prompt": re.sub(r"\s+", " ", prompt).strip(),
        "negative": neg,
        "caption": caption,
        "status": "prompt_ready",
    }


def build(n: int = 8, seed: int = 42) -> dict[str, Any]:
    items = [compose_prompt(seed, i) for i in range(max(1, min(n, 24)))]
    return {
        "ok": True,
        "verdict": "SUNROOM_CATALOG_PASS",
        "ts": _utc(),
        "doctrine": "sunroom_gentlemen_maxim_fully_clothed_elite",
        "n": len(items),
        "items": items,
        "public_page": "sunroom.html",
        "note": (
            "Gentlemen's summer desk. NEVER ComfyUI/Flux. "
            "HQ editorial fashion stills only. Fully clothed, never softcore."
        ),
    }


def _hq_locked() -> bool:
    """True when catalog already ships HQ fashion stills — never clobber with prompts/SVG."""
    if not OUT.is_file():
        return False
    try:
        cat = json.loads(OUT.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return False
    items = cat.get("items") or []
    hq = 0
    for it in items:
        img = str(it.get("image") or "")
        kind = str(it.get("art_kind") or "")
        if kind == "editorial_hq" or img.endswith((".jpg", ".jpeg", ".png", ".webp")):
            hq += 1
    return hq >= max(1, len(items) // 2) if items else False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--n", type=int, default=8)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--force", action="store_true", help="overwrite even when HQ art is locked")
    args = ap.parse_args()
    if args.apply and _hq_locked() and not args.force:
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8-sig"))
        except (OSError, json.JSONDecodeError):
            existing = {"ok": True, "n": 0}
        proof = {
            "ok": True,
            "verdict": "SUNROOM_HQ_LOCKED",
            "ts": _utc(),
            "note": "HQ fashion stills locked. ComfyUI/Flux banned. Use --force only after deliberate wipe.",
            "n": existing.get("n"),
            "public_page": "sunroom.html",
        }
        PROOF.write_text(json.dumps(proof, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        if args.json:
            print(json.dumps(proof, indent=2, ensure_ascii=False))
        else:
            print("SUNROOM_HQ_LOCKED", existing.get("n"))
        return 0
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
