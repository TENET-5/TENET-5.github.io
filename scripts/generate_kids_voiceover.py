#!/usr/bin/env python3
"""
LIRIL Kids Voice — Educational, friendly narration for the Simple Guide.
Generates one MP3 + VTT per section.
"""

import asyncio
import os
import sys
from pathlib import Path

import edge_tts

# ── Voice config — canonical TENET5 narration voice ─────────────────────
VOICE = "en-CA-ClaraNeural"  # Human-quality TENET5 voice across the site
RATE = "-5%"      # Slower for clarity
PITCH = "+2Hz"    # Slightly higher, more engaging
PAGE_SLUG = "kids"
OUTPUT_DIR = Path(__file__).parent.parent / "audio" / "sections"

SECTIONS = {
    "intro": {
        "text": (
            "Hello! Welcome to the Simple Guide to Accountability. "
            "Sometimes, when a lot of people try to spend a really big amount of money "
            "all at once, things can get messy. This guide explains a few times when our "
            "government made some big mistakes with the money that belongs to everybody."
        ),
    },
    "phoenix": {
        "text": (
            "Imagine you worked really hard all month, but when it was time to get your allowance, "
            "the piggy bank broke! That's what happened with the Phoenix Pay System. "
            "The government bought a giant robot computer to pay all of its workers, but the robot "
            "was broken. It didn't give out the right amounts, and figuring out how to fix it "
            "has cost billions and billions of coins!"
        ),
    },
    "arrivecan": {
        "text": (
            "Have you ever downloaded a game on a phone? They usually don't cost very much. "
            "But the government needed an app called ArriveCAN. They ended up paying a tiny company "
            "of just two people over 50 million dollars to build it! That's like paying for a million "
            "video games, but you only got one small app. The police are now looking into where it all went."
        ),
    },
    "sdtc": {
        "text": (
            "Imagine your class had a huge pot of gold that was supposed to be spent on helping the planet. "
            "But the people put in charge of the gold decided to give lots of it to their own friends and businesses instead! "
            "That's what happened with the Green Slush Fund. They gave away millions to themselves instead of playing by the rules."
        ),
    }
}

async def generate_section(section_id: str):
    if section_id not in SECTIONS:
        print(f"  [SKIP] Unknown section: {section_id}")
        return

    sec = SECTIONS[section_id]
    text = sec["text"]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
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
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(SECTIONS.keys())
    print("=" * 60)
    print("  LIRIL Kids Voice — FRIENDLY MODE")
    print("=" * 60)
    for section_id in targets:
        await generate_section(section_id)
    print("  Done.")

if __name__ == "__main__":
    asyncio.run(main())
