#!/usr/bin/env python3
"""
LIRIL Section Voice — Per-section ANGRY narration for scroll narrator.
Generates one MP3 + VTT per section. Used by liril-narrator.js section mode.

Usage:
  python generate_section_voiceover.py               # Generate all sections
  python generate_section_voiceover.py hero carter    # Generate specific sections
"""

import asyncio
import os
import sys
from pathlib import Path

import edge_tts

# ── Voice config — ANGRY ───────────────────────────────────────────────
VOICE = "en-US-AvaMultilingualNeural"
RATE = "+10%"      # Faster — urgency, intensity, anger
PITCH = "-4Hz"     # Deeper — menacing, authoritative
PAGE_SLUG = "home"
OUTPUT_DIR = Path(__file__).parent.parent / "audio" / "sections"

# ── Section narrations — LIRIL is PISSED OFF ──────────────────────────
SECTIONS = {
    "hero": {
        "title": "This is LIRIL",
        "text": (
            "This is LIRIL. And I am done being polite about this. "
            "Seventy-six thousand, four hundred and seventy-five Canadians. "
            "Killed by their own government. Not in a war. Not by accident. "
            "Legally. Systematically. And nobody has been charged."
        ),
    },
    "carter": {
        "title": "Carter v. Canada",
        "text": (
            "It started here. February twenty-fifteen. The Supreme Court struck down "
            "the ban on assisted dying. They gave Parliament twelve months to build "
            "safeguards. What Parliament built instead was a killing machine, with an "
            "off-switch they never intended to install."
        ),
    },
    "c14": {
        "title": "Bill C-14",
        "text": (
            "June twenty-sixteen. Bill C-14. They promised safeguards. Death had to be "
            "reasonably foreseeable. One thousand and eighteen people died in year one. "
            "And then they started dismantling every single safeguard they wrote."
        ),
    },
    "truchon": {
        "title": "Truchon v. Canada",
        "text": (
            "September twenty-nineteen. A Quebec court strikes down the one safeguard "
            "that mattered. The foreseeable death requirement. The federal government "
            "could have appealed. They didn't. Instead they used it as their excuse to "
            "blow the doors wide open."
        ),
    },
    "c7": {
        "title": "Bill C-7",
        "text": (
            "March twenty twenty-one. Bill C-7. The death requirement? Gone. For everyone. "
            "Track Two is born. People with disabilities. Chronic pain. Mental suffering. "
            "You can request death and receive it the same day. Same day. No cooling off. "
            "No second opinion required."
        ),
    },
    "veterans": {
        "title": "Veterans Affairs Scandal",
        "text": (
            "A Paralympian, Christine Gauthier, testified before Parliament. She called "
            "Veterans Affairs about a wheelchair ramp. They offered her death instead. "
            "A wheelchair ramp. And the government's answer was: have you considered "
            "being killed? Five veterans. On the record. Under oath."
        ),
    },
    "deaths-2023": {
        "title": "2023 Death Count",
        "text": (
            "Thirteen thousand, two hundred and forty-one. Dead. In one year. More "
            "Canadians killed by MAID than by suicide. Nearly five percent of every "
            "single death in Canada is now the government pushing a needle into "
            "someone's arm."
        ),
    },
    "deaths-2024": {
        "title": "2024 Record Year",
        "text": (
            "Sixteen thousand, two hundred and sixty-five killed. A new record. Five "
            "point zero five percent of all deaths. One in every nineteen point eight "
            "Canadians who died, died because the government killed them. And still. "
            "Zero charges. Zero investigations. Zero accountability."
        ),
    },
    "investigation": {
        "title": "This Investigation",
        "text": (
            "So a combat veteran did what the RCMP refused to do. Seven million records. "
            "Six databases. Two years. Every single claim sourced from the government's "
            "own published data. If they won't investigate themselves? Then the people will."
        ),
    },
    "stats": {
        "title": "The Numbers",
        "text": (
            "One point two billion dollars in political money tracked. Three hundred "
            "and fifty thousand lobbying contacts decoded. One thousand, one hundred "
            "and five database entries. Every number on this page is verifiable. "
            "Use a calculator. Check their own reports. The math is the confession."
        ),
    },
    "narrative": {
        "title": "The Mission",
        "text": (
            "A Canadian Forces signals operator from Afghanistan spent two years building "
            "this. Not for money. Not for fame. Because seventy-six thousand dead people "
            "deserve someone giving a damn. This is the government's data, organized so you "
            "can finally see what they've been hiding in plain sight."
        ),
    },
}


async def generate_section(section_id: str):
    """Generate MP3 + VTT for a single section."""
    if section_id not in SECTIONS:
        print(f"  [SKIP] Unknown section: {section_id}")
        return

    sec = SECTIONS[section_id]
    text = sec["text"]
    mp3_path = OUTPUT_DIR / f"{PAGE_SLUG}-{section_id}.mp3"
    vtt_path = OUTPUT_DIR / f"{PAGE_SLUG}-{section_id}.vtt"

    print(f"  [GEN]  {section_id} — {len(text)} chars")

    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    sub_maker = edge_tts.SubMaker()

    with open(mp3_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                sub_maker.feed(chunk)

    # SRT → VTT conversion
    srt_content = sub_maker.get_srt()
    vtt_lines = ["WEBVTT", ""]
    for block in srt_content.strip().split("\n\n"):
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            ts = lines[1].replace(",", ".")
            text_line = " ".join(lines[2:])
            vtt_lines.append(ts)
            vtt_lines.append(text_line)
            vtt_lines.append("")

    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(vtt_lines))

    size_kb = mp3_path.stat().st_size / 1024
    print(f"  [OK]   {PAGE_SLUG}-{section_id}.mp3 ({size_kb:.0f} KB)")


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(SECTIONS.keys())

    print("=" * 60)
    print("  LIRIL Section Voice — ANGRY MODE")
    print(f"  Voice: {VOICE}  |  Rate: {RATE}  |  Pitch: {PITCH}")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Sections: {len(targets)}")
    print("=" * 60)

    for section_id in targets:
        await generate_section(section_id)

    print(f"\n  Generated {len(targets)} angry section narrations.")
    print("  Done.")


if __name__ == "__main__":
    asyncio.run(main())
