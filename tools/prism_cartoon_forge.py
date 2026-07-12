#!/usr/bin/env python3
"""Press Ink — elite Canadian political cartoons that actually land.

Hard bar: a reader should grimace-laugh in under three seconds.
One visual, one target, one knife-caption — rooted in the PUBLIC RECORD
TENET5 already covers. No generic balloon/dog filler. No academic
"laugh_engine" titles. No wire chalkboard noise.

  python tools/prism_cartoon_forge.py --json --apply --n 8
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
OUT = ROOT / "data" / "cartoon_desk.json"
PROOF = ROOT / "data" / "prism_cartoon_forge_last.json"

BANNED = re.compile(
    r"\b(nazi|lynch|rape|slur|racial caricature|blackface|minstrel|"
    r"gore|decapitat|porn|nude|child|bloodbath|schoolgirl)\b",
    re.I,
)

# Instant-fail blandness — the old forge shipped this sludge
BANAL = re.compile(
    r"\b(promise balloon|watchdog dog|sleeps on a pile|"
    r"chalkboard in the corner|headline vibe|deflation of PR|"
    r"bureaucratic comedy)\b",
    re.I,
)

STYLES = [
    "classic broadsheet ink, ice-lake paper, single panel, bold readable labels",
    "Herblock lineage: thick black ink, white negative space, one caption under",
    "Canadian editorial: cream paper, black line, single crimson accent on the lie",
    "satirical newsprint panel: office props carry the joke, no private-life mockery",
]

# TENET5 beat — specific institutions, public-record irony, captions that cut.
# title = what the card shows (short, human). punch = the knife.
TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "phoenix_still_loading",
        "title": "Phoenix Pay",
        "target": "Phoenix pay system · still broken on the record",
        "setup": (
            "A giant government terminal labeled PHOENIX. Screen: "
            "PAY STATUS — RETRY (since 2016). A civil-service silhouette "
            "holds an empty pay envelope. Banner above: 'MODERNIZATION COMPLETE.'"
        ),
        "punch": "Still loading… since 2016.",
        "labels": ["PHOENIX", "RETRY", "MODERNIZATION COMPLETE"],
        "record": "Phoenix pay failure — AG reports, years of under/overpayment",
    },
    {
        "id": "arrivecan_receipt",
        "title": "ArriveCAN",
        "target": "ArriveCAN procurement · cost vs. utility",
        "setup": (
            "A phone app icon labeled ArriveCAN has grown into a bloated money-bag "
            "shape stamped $54M+. A tiny COVID particle waves goodbye in the corner. "
            "A receipt unrolls longer than the phone."
        ),
        "punch": "The app outlived the emergency. The invoice didn't.",
        "labels": ["ArriveCAN", "$54M+", "RECEIPT"],
        "record": "ArriveCAN cost findings — AG / Parliamentary record",
    },
    {
        "id": "atip_fully_disclosed",
        "title": "ATIP",
        "target": "Access to Information · blacked-out 'disclosure'",
        "setup": (
            "An official proudly holds up a released ATIP package: the entire page "
            "is black redaction bars. A gold star sticker says FULLY DISCLOSED. "
            "A citizen silhouette peers through a pinhole of white."
        ),
        "punch": "Fully disclosed under the Act.",
        "labels": ["ATIP", "████████", "FULLY DISCLOSED"],
        "record": "ATIP backlog and over-redaction — public complaints record",
    },
    {
        "id": "maid_capacity_found",
        "title": "Care vs. capacity",
        "target": "MAID expansion · care wait vs. death path (system, not patients)",
        "setup": (
            "Institutional corridor, no patient faces. Door A: CARE — WAITLIST "
            "with a line around the block (years). Door B: MAID — OPEN with a short "
            "red carpet and a smiling clipboard. Clock on wall frozen."
        ),
        "punch": "We found capacity. Just not for living.",
        "labels": ["CARE — WAITLIST", "MAID — OPEN"],
        "record": "Track 2 / capacity contrast — Coroners and Health Canada counts",
    },
    {
        "id": "vac_other_option",
        "title": "Veterans Affairs",
        "target": "VAC · MAID raised to veterans seeking help (policy scandal)",
        "setup": (
            "VAC service desk. Sign: HOW CAN WE HELP? Brochure rack: benefits, "
            "housing, treatment — and one red brochure labeled OTHER OPTION "
            "pushed forward by a hand from under the counter. Veteran silhouette "
            "from behind only — dignity intact. Punch the desk, not the soldier."
        ),
        "punch": "Have you considered our other option?",
        "labels": ["VAC", "HOW CAN WE HELP?", "OTHER OPTION"],
        "record": "Veterans Affairs MAID-offer scandals — public reporting / testimony",
    },
    {
        "id": "interference_more_process",
        "title": "Foreign interference",
        "target": "Foreign interference · study forever, act never",
        "setup": (
            "Committee room filled with smoke labeled INTERFERENCE. MPs open "
            "windows labeled PROCESS and fan the smoke with binders stamped "
            "MORE STUDY. Outside the window, cash envelopes float in undisturbed."
        ),
        "punch": "We'll act after one more process.",
        "labels": ["INTERFERENCE", "PROCESS", "MORE STUDY"],
        "record": "Foreign interference inquiries — process over consequence",
    },
    {
        "id": "media_bailout_pen",
        "title": "Media subsidy",
        "target": "Newsroom bailouts · independence with a sponsor",
        "setup": (
            "A reporter's hand writes a headline with a fountain pen chained to "
            "a government chequebook. Masthead says INDEPENDENT. The cheque stub "
            "says WITH LOVE FROM THE SUBSIDY."
        ),
        "punch": "Independent — terms and conditions apply.",
        "labels": ["INDEPENDENT", "SUBSIDY"],
        "record": "Federal news media funding / journalism subsidies",
    },
    {
        "id": "ethics_five_hundred",
        "title": "Ethics fine",
        "target": "Conflict of Interest · slap-on-wrist deterrence",
        "setup": (
            "Giant contract bag labeled $100M+ sits on one side of justice scales. "
            "Other side: a tiny ticket that says ETHICS FINE $500. The scale barely "
            "twitches. An Ethics Commissioner rubber stamp: LESSON LEARNED."
        ),
        "punch": "Deterrence, Canadian style.",
        "labels": ["$100M+", "ETHICS FINE $500"],
        "record": "Conflict of Interest Act penalties — max fine theatre",
    },
    {
        "id": "whistleblower_shredder",
        "title": "Whistleblowers",
        "target": "PSDPA · courage into the shredder",
        "setup": (
            "A person speaks into a megaphone labeled PROTECTED DISCLOSURE. "
            "The megaphone feeds straight into an industrial shredder labeled "
            "PSDPA. Confetti comes out reading THANK YOU FOR YOUR SERVICE. "
            "A small plaque: MAX AWARD $10,000."
        ),
        "punch": "Your courage has been received.",
        "labels": ["PROTECTED DISCLOSURE", "PSDPA", "MAX $10,000"],
        "record": "Whistleblower protection failure — PSDPA record",
    },
    {
        "id": "daycare_2031",
        "title": "$10 daycare",
        "target": "$10/day childcare · promise vs. waitlist",
        "setup": (
            "A bright sign: $10/DAY CHILDCARE — OPEN. The line of parents "
            "stretches past a calendar flipping to 2031. A toddler silhouette "
            "holds a university application form."
        ),
        "punch": "Your toddler can apply when they graduate.",
        "labels": ["$10/DAY", "WAITLIST", "2031"],
        "record": "$10/day childcare — waitlists vs. promise",
    },
    {
        "id": "nato_study_options",
        "title": "Defence",
        "target": "Defence procurement · NATO pledge vs. delivery",
        "setup": (
            "A soldier silhouette holds a broom labeled CURRENT EQUIPMENT. "
            "Beside them a NATO 2% thermometer is empty except a sticky note: "
            "STUDYING OPTIONS. A jet on a 2034 delivery truck is still in the "
            "parking lot."
        ),
        "punch": "Mission-ready — to study options.",
        "labels": ["NATO 2%", "STUDYING OPTIONS", "2034"],
        "record": "Defence spending / procurement delays — public commitments",
    },
    {
        "id": "equal_terms_apply",
        "title": "Two-tier justice",
        "target": "Connected vs. everyone else · equality with fine print",
        "setup": (
            "Lady Justice with two scales. Left scale (CONNECTED): feather-light "
            "wrist slap. Right scale (EVERYONE ELSE): full books of the Criminal "
            "Code. Fine print under the statue: EQUAL BEFORE THE LAW*."
        ),
        "punch": "Equal before the law.*",
        "labels": ["CONNECTED", "EVERYONE ELSE", "EQUAL*"],
        "record": "Selective accountability — dual-track enforcement pattern",
    },
]


def _utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _clean(s: str) -> str:
    s = re.sub(r"\s+", " ", (s or "").strip())
    s = BANNED.sub("[redacted]", s)
    return s


def _humor_score(t: dict[str, Any], setup: str, punch: str) -> dict[str, Any]:
    """Strict bar — reject generic filler even if keywords match."""
    text = f"{setup} {punch} {t.get('title', '')}".lower()
    reasons: list[str] = []
    score = 20

    if BANNED.search(text):
        return {"score": 0, "pass": False, "rubric": "banned_taste", "reasons": ["banned"]}
    if BANAL.search(text):
        return {"score": 10, "pass": False, "rubric": "banal_reject", "reasons": ["generic_filler"]}

    # Specificity: named Canadian institution / policy
    specifics = (
        "phoenix", "arrivecan", "atip", "maid", "vac", "veteran", "psdpa",
        "nato", "ethics", "subsidy", "interference", "daycare", "childcare",
        "procurement", "auditor", "parliament", "criminal", "justice",
        "connected", "equal before",
    )
    hit = sum(1 for w in specifics if w in text)
    if hit >= 1:
        score += 25
        reasons.append("specific_institution")
    else:
        score -= 20
        reasons.append("too_generic")

    # Punchline craft
    p = punch.strip()
    if 12 <= len(p) <= 90:
        score += 20
        reasons.append("tight_punch")
    elif len(p) > 90:
        score -= 15
        reasons.append("punch_too_long")
    else:
        score -= 10
        reasons.append("punch_too_thin")

    # Knife words / turn
    if any(x in p.lower() for x in ("*", "…", "...", "just not", "terms", "other option", "since ")):
        score += 10
        reasons.append("turn_or_sting")

    # Labels for visual gag
    if t.get("labels") and len(t["labels"]) >= 2:
        score += 15
        reasons.append("visual_labels")

    # Record anchor
    if t.get("record"):
        score += 10
        reasons.append("record_anchor")

    # Reject soft academic voice in punch
    if re.search(r"\b(redefined|sorted by|theatre|comedy of)\b", p, re.I):
        score -= 25
        reasons.append("academic_voice")

    score = max(0, min(100, score))
    return {
        "score": score,
        "pass": score >= 70,
        "rubric": "specific+tight_punch+labels+record+taste",
        "reasons": reasons,
    }


def forge_one(template: dict[str, Any], style: str, seed: str) -> dict[str, Any]:
    setup = _clean(template["setup"])
    punch = _clean(template["punch"])
    humor = _humor_score(template, setup, punch)
    labels = ", ".join(template.get("labels") or [])
    prompt = _clean(
        f"Political editorial cartoon, {style}. "
        f"Scene: {setup} "
        f"Caption under panel: \"{punch}\" "
        f"Clear ink labels in frame: {labels}. "
        "Caricature of offices and institutions only — no private citizens, "
        "no patient faces, no veteran face detail. "
        "Ice-lake newsprint, sharp ink, one joke, readable at thumbnail size. "
        "No gore, no hate symbols, no text soup beyond labels + one caption."
    )
    anim = {
        "duration_s": 6,
        "beats": [
            "Frame 1: establish the labeled institutional set",
            "Frame 2: reveal the contradiction prop",
            "Frame 3: the sting (scale tips / shredder / red carpet)",
            f"Frame 4: hold caption — {punch}",
        ],
        "ltx_prompt": _clean(
            f"Hand-drawn Canadian political cartoon, 6s, {setup} "
            f"end on caption card reading: {punch}. Ice-lake paper, bold labels."
        ),
    }
    return {
        "id": f"ink_{template['id']}_{hashlib.sha256(seed.encode()).hexdigest()[:6]}",
        "template": template["id"],
        "title": template["title"],
        "target": template["target"],
        "laugh_engine": punch,  # card headline = the joke, not academic gloss
        "record_hook": template.get("record", ""),
        "labels": template.get("labels") or [],
        "style": style,
        "setup": setup,
        "punchline": punch,
        "prompt": prompt,
        "negative": (
            "gore, hate symbol, racial caricature, sexual humiliation, child, "
            "porn, unreadable text wall, neon cyberpunk, meme impact font, "
            "generic balloon, sleeping dog cliché, stick-figure mush"
        ),
        "animation": anim,
        "humor": humor,
        "status": "ready" if humor["pass"] else "rejected_taste_or_humor",
        "claim_level": "SATIRE",
        "disclaimer": "Satire of public policy and offices — rooted in the public record. Powered by LIRIL AI.",
    }


def build(n: int = 8) -> dict[str, Any]:
    items = []
    pool = TEMPLATES[:]
    # Prefer highest-specificity first; rotate styles
    for i in range(max(1, min(n, len(pool)))):
        t = pool[i]
        style = STYLES[i % len(STYLES)]
        items.append(forge_one(t, style, f"{i}|{t['id']}|v2"))
    passed = [x for x in items if x["status"] == "ready"]
    return {
        "ok": True,
        "verdict": "CARTOON_FORGE_PASS" if len(passed) >= max(1, n // 2) else "CARTOON_FORGE_FAIL",
        "ts": _utc(),
        "doctrine": "press_ink_public_record_knife",
        "n": len(items),
        "passed": len(passed),
        "items": items,
        "public_page": "cartoon-desk.html",
        "note": (
            "Specific Canadian public-record satire. If it doesn't land in 3 seconds, it doesn't ship."
        ),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--n", type=int, default=8)
    ap.add_argument("--from-wire", action="store_true", help="ignored — wire chalkboards killed jokes")
    args = ap.parse_args()
    doc = build(args.n)
    if args.apply:
        OUT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        PROOF.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.json:
        print(json.dumps(doc, indent=2, ensure_ascii=False))
    else:
        print(doc["verdict"], "passed", doc["passed"], "/", doc["n"])
    return 0 if doc.get("ok") and doc.get("passed") else 1


if __name__ == "__main__":
    raise SystemExit(main())
