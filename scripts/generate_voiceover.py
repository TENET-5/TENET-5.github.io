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

# AvaMultilingual is Microsoft's flagship neural voice — natural breathing,
# human prosody, emotional range. Dramatically less robotic than ClaraNeural.
VOICE = "en-US-AvaMultilingualNeural"
RATE = "+10%"      # Faster — urgency, anger, intensity
PITCH = "-4Hz"     # Deeper — menacing, authoritative
OUTPUT_DIR = Path(__file__).parent.parent / "audio"

# ── Narration scripts per page ──────────────────────────────────────────
# Each entry: page slug → list of { text, timestamp_label }
# The narrator reads these segments sequentially. VTT cues are auto-generated.

NARRATIONS = {
    "home": {
        "title": "TENET⁵ — Welcome",
        "segments": [
            "This is LIRIL. And I need to walk you through something important.",
            "Since 2016... seventy-six thousand, four hundred and seventy-five Canadians have been killed under their government's Medical Assistance in Dying program. That number comes from Health Canada's own annual reports. Not from us. From them.",
            "A Canadian Forces combat veteran — a signals operator who served in Afghanistan — spent two years cross-referencing seven million government records. Across six public databases. What he found is what you're about to see.",
            "One point two billion dollars in political money... tracked. Three hundred and fifty thousand lobbying contacts... decoded. Over one thousand database records compiled into what we call The 504 Dossier.",
            "Every claim on this website is sourced. Every number is verifiable. This is not opinion — this is the government's own data, organized so you can finally see the pattern.",
            "Scroll down. The evidence speaks for itself.",
        ],
    },
    "maid-accountability": {
        "title": "MAID — The Accountability Report",
        "segments": [
            "This is the MAID Accountability Report. What you're about to hear are facts — sourced entirely from Health Canada's own publications.",
            "In 2016, one thousand and eighteen Canadians died under Medical Assistance in Dying. By 2024? That number had risen to sixteen thousand, two hundred and sixty-five. That is not a gradual increase. That is an acceleration.",
            "Let me put that in perspective. The Netherlands — the country that pioneered legal euthanasia in 2002 — took twenty years to reach four point eight percent of all deaths. Canada matched that rate... in just seven years.",
            "Five point zero five percent of all Canadian deaths in 2024 were MAID deaths. One in every nineteen point eight people who died in Canada... died by government-administered lethal injection.",
            "Veterans have testified — under oath, before Parliamentary committee — that Veterans Affairs caseworkers offered them MAID. During calls about wheelchair ramps. During calls about housing support. At least five veterans. On the record.",
            "A fifty-one year old Ontario woman with Multiple Chemical Sensitivities chose MAID after years of being unable to find affordable housing. She told journalists — and I quote — the government sees me as expendable.",
            "There is no independent oversight body for MAID in Canada. Doctors self-report. The Auditor General has never audited the program. Three consecutive RCMP Commissioners have launched zero investigations.",
            "The United Nations Special Rapporteur on the Rights of Persons with Disabilities has formally raised concerns. The UN Human Rights Committee flagged Canada's MAID regime in their 2023 Periodic Review. The world is watching.",
        ],
    },
    "maid-policy-evolution": {
        "title": "MAID — How They Legislated Death",
        "segments": [
            "How they legislated death. This is the complete legislative record — every step that brought us here.",
            "February 2015. The Supreme Court of Canada rules unanimously in Carter v. Canada. The absolute prohibition on physician-assisted dying, they said, violates Charter rights. Parliament was given twelve months to write the law.",
            "June 2016. Bill C-14 passes. MAID is legalized — but with safeguards. Natural death must be reasonably foreseeable. A ten-day reflection period is mandatory. Two independent medical assessments are required. Those safeguards... would not last.",
            "September 2019. The Quebec Superior Court strikes down the foreseeable death requirement in Truchon v. Canada. The federal government does not appeal. Instead — and this is critical — they use the ruling to expand eligibility nationally.",
            "March 2021. Bill C-7 passes. The foreseeable death requirement? Gone. For all Canadians. Track 2 is created — MAID for chronic conditions, disabilities, and non-terminal illness. The ten-day reflection period? Eliminated for Track 1. You can now receive a lethal injection the same day you request it.",
            "Bill C-7 also included a sunset clause to expand MAID to people whose sole condition is mental illness. That expansion has been delayed three times. First to 2024. Then to 2025. Then to 2027.",
            "The repeated delays are telling. Even the government that wrote this legislation... keeps flinching from implementing its most extreme provision. They know what they've done.",
        ],
    },
    "cija-maid-pipeline": {
        "title": "The CIJA Lobbying Pipeline",
        "segments": [
            "Two thousand, one hundred and thirty-eight registered lobbying contacts. One organization. A direct documented pipeline — from lobbying... to law.",
            "The Centre for Israel and Jewish Affairs is one of the most active lobbying organizations in Canada's federal registry. Their contacts span the Prime Minister's Office, the Department of Justice, and key Parliamentary committee members.",
            "The documented sequence follows a clear pattern. First, IHRA definition adoption. Then, Criminal Code amendments. Then, Human Rights Act civil remedies. Then, MAID expansion. Each stage building on the last.",
            "Every data point you see in this analysis comes directly from Canada's own Commissioner of Lobbying registry, Hansard committee records, and published Parliamentary testimony. These are not allegations. These are the government's own documented contacts — we just organized them.",
        ],
    },
    "mp-voting-records": {
        "title": "How Your MP Voted",
        "segments": [
            "How they voted. Every vote you're about to see is from the official Hansard division record — the Parliament of Canada's own published record.",
            "Bill C-14 — the Medical Assistance in Dying Act of 2016. Third reading vote: one hundred and eighty-six Yea. Sixty-four Nay. Bill C-7 — the MAID Expansion Act of 2021. One hundred and eighty Yea. One hundred and forty-nine Nay.",
            "Bill C-11, the Online Streaming Act. Bill C-21, firearms restrictions. Bill C-63, the Online Harms Act. These are the bills that reshaped Canadian civil liberties — and every vote is on the record.",
            "Forty-six currently sitting Members of Parliament voted in favour of both C-14 and C-7 — both aggressive expansions of state-administered death. Search for your MP. See how they voted. Hold them accountable.",
        ],
    },
    "evidence": {
        "title": "The Evidence Archive",
        "segments": [
            "Welcome to the Evidence Archive. Everything here is mathematical proof — derived from the government's own published data.",
            "Seven million government records have been cross-referenced across six public databases. Fifty-seven megabytes of raw lobbying data, analyzed line by line. Three thousand, one hundred and eighty subject matter tags, decoded.",
            "The compound annual growth rate of MAID deaths from 2016 to 2024 is forty-one point seven percent. At that trajectory, the cumulative toll will exceed one hundred thousand Canadians by the end of 2026.",
            "The government valued each life eliminated at one thousand, nine hundred and fifty-four dollars in healthcare savings. A burial coffin costs more than what they saved by killing you.",
            "Every formula on these pages can be verified with a calculator and the Government of Canada's own reports. The math does not lie.",
        ],
    },
    "charges-sheet": {
        "title": "Section 504 — The Charges Sheet",
        "segments": [
            "Under Section 504 of the Criminal Code of Canada, any citizen — any Canadian — has the legal right to lay criminal charges through private prosecution.",
            "This page documents over one thousand sourced criminal charge incidents, mapped to specific government officials. Two hundred and seventy officials identified. Three hundred and seven charges mapped.",
            "Each entry includes the relevant Criminal Code section, the evidence basis from public records, and the prosecution pathway available to any Canadian citizen.",
            "This is your legal right. It has existed since Confederation. And it is the mechanism by which Canadians can hold their government accountable — without waiting for an RCMP that refuses to investigate.",
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
