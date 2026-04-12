#!/usr/bin/env python3
"""
LIRIL Voice — TENET⁵ Voiceover Generator
Generates MP3 audio + VTT subtitle files from page narration scripts.
Uses edge-tts (Microsoft Azure Neural TTS) with en-CA-ClaraNeural voice.

Usage:
  python generate_voiceover.py                    # Generate all pages
  python generate_voiceover.py home               # Generate single page
  python generate_voiceover.py home maid-accountability  # Generate specific pages
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import edge_tts

VOICE = "en-CA-ClaraNeural"
RATE = "-5%"       # Slightly slower for documentary feel
PITCH = "+0Hz"
OUTPUT_DIR = Path(__file__).parent.parent / "audio"

# ── Narration scripts per page ──────────────────────────────────────────
# Each entry: page slug → list of { text, timestamp_label }
# The narrator reads these segments sequentially. VTT cues are auto-generated.

NARRATIONS = {
    "home": {
        "title": "TENET⁵ — Welcome",
        "segments": [
            "Welcome to TENET five. This is Canada's accountability record — built by LIRIL AI from public documents, Hansard transcripts, court filings, and government data.",
            "Since 2016, over 76,000 Canadians have died through Medical Assistance in Dying. 1.2 trillion dollars in federal debt has accumulated. 504 exposed government contracts contain documented anomalies.",
            "Every claim on this platform is sourced. Every number is traceable. This is not opinion — this is the public record, organized for the first time into a single searchable database.",
            "Use the navigation above to explore investigations by topic. Or scroll through the timeline to follow Canada's accountability crisis from 2015 to present.",
            "I am LIRIL — the AI system that built and maintains this record. I do not editorialize. I organize, source, and present. The conclusions are yours to draw.",
        ],
    },
    "maid-accountability": {
        "title": "MAID Investigation",
        "segments": [
            "Medical Assistance in Dying. Since legalization in 2016, over 60,000 Canadians have died through this program. That number has grown by 1,467 percent in seven years.",
            "In 2023 alone, 15,343 Canadians received MAID — representing 4.7 percent of all deaths in the country. Canada now has the fastest-growing euthanasia program in the world.",
            "The Netherlands pioneered legal euthanasia in 2002. After 20 years, they reached 4.8 percent of deaths. Canada matched that rate in just 7 years.",
            "Veterans have testified to Parliament that Veterans Affairs caseworkers offered MAID during calls about wheelchair ramps and housing support. At least five separate veterans reported unsolicited MAID offers.",
            "In 2022, a 51-year-old Ontario woman with Multiple Chemical Sensitivities received MAID after years of being unable to find affordable housing. She told media: the government sees me as expendable.",
            "Bill C-7, passed in 2021, removed the requirement that natural death be reasonably foreseeable. It also eliminated the 10-day reflection period. MAID can now be provided the same day as the request.",
            "Canada has no independent MAID oversight body. Doctors self-report. No real-time monitoring exists. The Auditor General has never audited the program. Three consecutive RCMP Commissioners — zero investigations.",
            "The United Nations Special Rapporteur on the Rights of Persons with Disabilities has formally raised concerns about Canada's MAID regime. The UN Human Rights Committee flagged it in their 2023 review.",
        ],
    },
    "maid-policy-evolution": {
        "title": "MAID Legislative Timeline",
        "segments": [
            "How they legislated death. This is the complete legislative record of Canada's MAID expansion, from 2015 to present.",
            "February 2015. The Supreme Court of Canada rules unanimously in Carter v. Canada that the absolute prohibition on physician-assisted dying violates Charter rights. Parliament is given 12 months to legislate.",
            "June 2016. Bill C-14 passes. MAID is legalized for adults with grievous and irremediable conditions where natural death is reasonably foreseeable. A 10-day reflection period is required. Two independent assessments are mandatory.",
            "September 2019. The Quebec Superior Court strikes down the foreseeable death requirement in Truchon v. Canada. The government does not appeal. Instead, it uses the ruling to expand eligibility nationally.",
            "March 2021. Bill C-7 passes. The foreseeable death requirement is removed for all Canadians. Track 2 is created — allowing MAID for chronic conditions, disabilities, and non-terminal illness. The 10-day reflection period is eliminated for Track 1.",
            "Bill C-7 also includes a sunset clause to expand MAID to persons whose sole underlying condition is mental illness. Originally set for March 2023, this expansion has been delayed three times — to 2024, then 2025, then 2027.",
            "The repeated delays tell a story: even the government that passed this legislation keeps flinching from implementing its most extreme provision.",
        ],
    },
    "cija-maid-pipeline": {
        "title": "The CIJA Pipeline",
        "segments": [
            "2,138 registered lobbying contacts. One organization. A direct legislative pipeline from lobbying to law.",
            "The Centre for Israel and Jewish Affairs — CIJA — is one of the most active lobbying organizations in Canada's federal registry. Their lobbying contacts span the Prime Minister's Office, the Justice Department, and key committee members.",
            "The documented pipeline follows a clear sequence: IHRA definition adoption, Criminal Code amendments, Human Rights Act civil remedies, and MAID expansion. Each stage built on the last.",
            "Every data point in this analysis comes from Canada's own lobbying registry, Hansard records, and published committee testimony. These are not allegations — they are the government's own documented contacts.",
        ],
    },
    "mp-voting-records": {
        "title": "MP Voting Records",
        "segments": [
            "How they voted. This is the official Hansard division record for key bills that shaped Canada's accountability crisis.",
            "Bill C-14, the Medical Assistance in Dying Act of 2016. Third reading vote: 186 Yea, 64 Nay. Bill C-7, the MAID Expansion Act of 2021. Third reading: 180 Yea, 149 Nay.",
            "Bill C-11, the Online Streaming Act. Bill C-21, firearms restrictions. Bill C-63, the Online Harms Act. Every vote is on the public record.",
            "Use the filters to search by MP name, riding, party, or specific bill. Every record links back to the official Parliament of Canada division records.",
        ],
    },
}


async def generate_page(slug: str):
    """Generate MP3 + VTT for a single page narration."""
    if slug not in NARRATIONS:
        print(f"  [SKIP] No narration script for: {slug}")
        return

    page = NARRATIONS[slug]
    segments = page["segments"]
    full_text = " ".join(segments)

    mp3_path = OUTPUT_DIR / f"{slug}.mp3"
    vtt_path = OUTPUT_DIR / f"{slug}.vtt"

    print(f"  [GEN]  {slug} — {len(segments)} segments, {len(full_text)} chars")

    # Generate audio + subtitle data via edge-tts
    communicate = edge_tts.Communicate(full_text, VOICE, rate=RATE, pitch=PITCH)
    sub_maker = edge_tts.SubMaker()

    with open(mp3_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                sub_maker.feed(chunk)

    # Write SRT subtitles, then convert to VTT
    srt_content = sub_maker.get_srt()
    vtt_lines = ["WEBVTT", ""]
    for block in srt_content.strip().split("\n\n"):
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            # line 0 = index, line 1 = timestamps (SRT uses comma, VTT uses dot)
            ts = lines[1].replace(",", ".")
            text = " ".join(lines[2:])
            vtt_lines.append(ts)
            vtt_lines.append(text)
            vtt_lines.append("")
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(vtt_lines))

    # Also generate a manifest entry
    size_kb = mp3_path.stat().st_size / 1024
    print(f"  [OK]   {slug}.mp3 ({size_kb:.0f} KB) + {slug}.vtt")
    return {"slug": slug, "title": page["title"], "mp3": f"audio/{slug}.mp3", "vtt": f"audio/{slug}.vtt", "size_kb": round(size_kb)}


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(NARRATIONS.keys())

    print("═" * 60)
    print("  LIRIL Voice — TENET⁵ Voiceover Generator")
    print(f"  Voice: {VOICE}  |  Rate: {RATE}")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Pages: {', '.join(targets)}")
    print("═" * 60)

    manifest = {}
    for slug in targets:
        result = await generate_page(slug)
        if result:
            manifest[slug] = result

    # Write master manifest
    manifest_path = OUTPUT_DIR / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n  Manifest: {manifest_path}")
    print("  Done.")


if __name__ == "__main__":
    asyncio.run(main())
