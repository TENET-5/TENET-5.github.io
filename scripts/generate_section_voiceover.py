#!/usr/bin/env python3
"""
LIRIL Section Voice — Objective, Professional Narration.
Crawls specific HTML files or the entire repository for `data-narrate` and generates audio overlays.
"""

import asyncio
import os
import sys
import glob
from pathlib import Path
from html.parser import HTMLParser

import edge_tts

# ── Voice config — LIRIL CANON (matches generate_voiceover.py) ────────────
# en-CA-ClaraNeural is the canonical human-quality voice for TENET5 narration.
# This keeps all site audio consistent and reduces voice drift.
VOICE = "en-CA-ClaraNeural"
RATE = "+10%"      # Match page narration pacing
PITCH = "-4Hz"     # Match page narration depth
OUTPUT_DIR = Path(__file__).parent.parent / "audio" / "dossiers"

class NarrateParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.narrations = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if 'data-narrate' in attr_dict:
            node_id = attr_dict.get('id', f"node-{len(self.narrations)+1}")
            # Clean up the narration text (remove excess whitespace)
            text = " ".join(attr_dict['data-narrate'].split())
            if text:
                self.narrations.append({
                    'id': node_id,
                    'text': text
                })

async def generate_section(page_slug: str, section_id: str, text: str):
    mp3_path = OUTPUT_DIR / f"{page_slug}-{section_id}.mp3"
    vtt_path = OUTPUT_DIR / f"{page_slug}-{section_id}.vtt"
    
    # Skip if already exists so we don't re-render 100s of files constantly
    if mp3_path.exists() and vtt_path.exists():
        print(f"  [SKIP] {page_slug}-{section_id}.mp3 already exists.")
        return

    print(f"  [GEN]  {page_slug}-{section_id} — {len(text)} chars")

    try:
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
        print(f"  [OK]   {page_slug}-{section_id}.mp3 ({size_kb:.0f} KB)")
    except Exception as e:
        print(f"  [ERR]  Failed to generate {page_slug}-{section_id}: {e}")

async def process_file(filepath: Path):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = NarrateParser()
    parser.feed(content)

    if not parser.narrations:
        return

    page_slug = filepath.stem
    print(f"\nProcessing {filepath.name} ({len(parser.narrations)} narration nodes found)")
    
    for sec in parser.narrations:
        await generate_section(page_slug, sec['id'], sec['text'])

async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("  TENET5 Universal Voice — OBJECTIVE MODE")
    print(f"  Voice: {VOICE}  |  Rate: {RATE}  |  Pitch: {PITCH}")
    print("=" * 60)

    # Allow passing specific files, else parse all html in parent dir
    if len(sys.argv) > 1:
        targets = [Path(arg) for arg in sys.argv[1:]]
    else:
        repo_root = Path(__file__).parent.parent
        targets = list(repo_root.glob("*.html"))

    for target in targets:
        if target.exists():
            await process_file(target)

    print("\n  Done.")

if __name__ == "__main__":
    asyncio.run(main())
