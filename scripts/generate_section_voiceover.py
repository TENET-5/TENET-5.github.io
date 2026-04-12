#!/usr/bin/env python3
"""
LIRIL Section Voice — Objective, Professional Narration.
Generates one MP3 + VTT per section.
"""

import asyncio
import os
import sys
from pathlib import Path

import edge_tts

# ── Voice config — PROFESSIONAL OBJECTIVE (LIRIL CANON) ─────────────────────
VOICE = "en-US-AriaNeural" # LIRIL's formal, objective tone
RATE = "+0%"      
PITCH = "+0Hz"    
PAGE_SLUG = "home"
OUTPUT_DIR = Path(__file__).parent.parent / "audio" / "sections"

# ── Objective Section Narrations ──────────────────────────
SECTIONS = {
    "hero": {
        "text": (
            "76,475 Canadians have died as a result of state-administered euthanasia. "
            "This investigation examines the timeline, legislative changes, and financial data "
            "surrounding the Medical Assistance in Dying program and associated government operations. "
            "All figures presented are sourced directly from official government reports."
        ),
    },
    "carter": {
        "text": (
            "In February 2015, the Supreme Court of Canada issued its decision in Carter versus Canada, "
            "striking down the criminal prohibition on physician-assisted dying. The Court provided "
            "Parliament with a mandate to draft new legislation that included strict safeguards to protect vulnerable populations."
        ),
    },
    "c14": {
        "text": (
            "In June 2016, Parliament passed Bill C-14, establishing the legal framework for Medical Assistance in Dying. "
            "A core safeguard within this initial legislation was that a patient's natural death had to be "
            "'reasonably foreseeable'. In the first year of the program, 1,018 individuals utilized MAID."
        ),
    },
    "truchon": {
        "text": (
            "In September 2019, the Quebec Superior Court ruled in Truchon versus Attorney General that the "
            "'reasonably foreseeable natural death' requirement was unconstitutional. The federal government "
            "chose not to appeal the decision, creating a precedent for expanding access beyond terminal illnesses."
        ),
    },
    "c7": {
        "text": (
            "In March 2021, Parliament passed Bill C-7. This legislation officially removed the requirement that "
            "a person's death must be reasonably foreseeable in order to qualify for MAID. This established "
            "what is known as 'Track Two', legally permitting individuals with non-terminal disabilities and chronic illnesses to receive MAID."
        ),
    },
    "veterans": {
        "text": (
            "In 2022, during parliamentary committee testimony, it was disclosed that an employee at Veterans Affairs Canada "
            "had offered Medical Assistance in Dying to military veterans who were seeking structural support, "
            "such as accessibility ramps. Formal investigations confirmed these occurrences across multiple veteran case files."
        ),
    },
    "deaths-2023": {
        "text": (
            "Health Canada's annual report indicated that by the end of 2023, the number of MAID deaths reached 13,241 in a single year. "
            "At this stage, state-administered euthanasia accounted for 4.7 percent of all deaths nationwide, "
            "statistically surpassing suicide as a leading cause of mortality in Canada."
        ),
    },
    "deaths-2024": {
        "text": (
            "The most recent data for 2024 records 16,265 MAID deaths in that calendar year alone. "
            "This represents 5.05 percent of all national mortality. Since legalization in 2016, "
            "the cumulative total of individuals whose deaths were administered by the state has reached 76,475."
        ),
    },
    "investigation": {
        "text": (
            "This platform was created to systematically archive and cross-reference over seven million public records "
            "across six official databases. Over two years, data from Health Canada, Elections Canada, and the "
            "Commissioner of Lobbying was ingested to map the institutional framework driving these legislative changes."
        ),
    },
    "stats": {
        "text": (
            "The resulting database tracks 1.2 billion dollars in political contributions, decodes 350,000 lobbying contacts, "
            "and maintains 1,105 formal data entries connecting specific policymakers to legislative outcomes. "
            "The methodology relies entirely on the quantitative structure of the government's own publishing."
        ),
    },
    "narrative": {
        "text": (
            "The objective of this database is strict accountability and transparency. "
            "By compiling decentralized government data into a single, cohesive timeline, "
            "the public structure of the Canadian apparatus can be critically reviewed and understood without intermediary interpretation."
        ),
    },
    "s504": {
        "text": (
            "A core outcome of this investigation is the Section 504 Prosecution. "
            "Twenty-eight counts of criminal liability have been leveled against a Military Police investigator "
            "and a Crown Prosecutor. Under the Canadian Criminal Code, civilians hold the legal authority to lay charges "
            "when the system refuses to police itself."
        )
    },
    "scorecard": {
        "text": (
            "To measure legislative complicity, 340 Members of Parliament have been algorithmically scored. "
            "This metric cross-references their voting records on major bills, such as C-7, against documented "
            "lobbying contacts and political donations. 113 MPs demonstrated clean records, while the rest displayed significant conflicts."
        )
    },
    "lobbying": {
        "text": (
            "The system ingested fifty-seven megabytes of raw data from the Commissioner of Lobbying. "
            "Over 350,000 communications were decoded. The analysis reveals a direct, quantifiable pipeline "
            "between specialized influence operations and immediate shifts in federal legislation."
        )
    },
    "cfnis": {
        "text": (
            "Accountability failures within the Armed Forces are mapped through the military justice system. "
            "Five severe cases of misconduct within the National Investigation Service are documented, "
            "including evidence tampering condemned by the Ontario Superior Court. The internal oversight mechanisms are entirely compromised."
        )
    },
    "municipal": {
        "text": (
            "The investigation scales from federal policy down to the civic level. The Municipal Intelligence Engine "
            "tracks anomalies in local property taxation, police budgets, and unchecked administrative salaries "
            "across regional governments, exposing systemic local waste."
        )
    },
    "archive": {
        "text": (
            "This concludes the executive summary of the TENET5 findings. The timeline, the data, and the charges "
            "are fully accessible. You may now step into the primary OSINT dashboard to explore the evidence yourself."
        )
    }
}

async def generate_section(section_id: str):
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
    print("  TENET5 Section Voice — OBJECTIVE MODE")
    print(f"  Voice: {VOICE}  |  Rate: {RATE}  |  Pitch: {PITCH}")
    print("=" * 60)

    for section_id in targets:
        await generate_section(section_id)

    print("  Done.")


if __name__ == "__main__":
    asyncio.run(main())
