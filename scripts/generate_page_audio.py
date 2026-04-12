#!/usr/bin/env python3
"""
LIRIL Voice — Dynamic page audio generator.
Extracts data-narrate attributes from HTML pages and generates MP3+VTT.
Uses edge-tts with AvaMultilingualNeural voice.

Usage:
  python generate_page_audio.py s504-court-filing        # Single page
  python generate_page_audio.py s504-covey-bae carney-conflicts  # Multiple
  python generate_page_audio.py --all                     # All pages missing audio
"""

import asyncio
import json
import os
import re
import sys
from html import unescape
from pathlib import Path

import edge_tts

VOICE = "en-US-AvaMultilingualNeural"
RATE = "+10%"
PITCH = "-4Hz"
ROOT = Path(__file__).parent.parent
OUTPUT_DIR = ROOT / "audio"

def extract_narrations(html_path: Path) -> list[str]:
    """Extract all data-narrate text from an HTML file, in document order."""
    content = html_path.read_text(encoding="utf-8", errors="replace")
    raw = re.findall(r'data-narrate="([^"]+)"', content)
    texts = []
    for r in raw:
        t = unescape(r).strip()
        # Skip trivial or structural labels
        if len(t) > 20:
            texts.append(t)
    return texts


async def generate_page(slug: str):
    html_path = ROOT / f"{slug}.html"
    if not html_path.exists():
        print(f"  [SKIP] {slug}.html not found")
        return None

    texts = extract_narrations(html_path)
    if not texts:
        print(f"  [SKIP] {slug} — no data-narrate found")
        return None

    full_text = " ".join(texts)
    if len(full_text) < 50:
        print(f"  [SKIP] {slug} — narration too short ({len(full_text)} chars)")
        return None

    mp3_path = OUTPUT_DIR / f"{slug}.mp3"
    vtt_path = OUTPUT_DIR / f"{slug}.vtt"

    print(f"  [GEN]  {slug} — {len(texts)} sections, {len(full_text)} chars")

    communicate = edge_tts.Communicate(full_text, VOICE, rate=RATE, pitch=PITCH)
    sub_maker = edge_tts.SubMaker()

    with open(mp3_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                sub_maker.feed(chunk)

    # Convert SRT → VTT
    srt_content = sub_maker.get_srt()
    vtt_lines = ["WEBVTT", ""]
    for block in srt_content.strip().split("\n\n"):
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            ts = lines[1].replace(",", ".")
            text = " ".join(lines[2:])
            vtt_lines.append(ts)
            vtt_lines.append(text)
            vtt_lines.append("")
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(vtt_lines))

    size_kb = mp3_path.stat().st_size / 1024
    print(f"  [OK]   {slug}.mp3 ({size_kb:.0f} KB) + {slug}.vtt")
    return {
        "slug": slug,
        "mp3": f"audio/{slug}.mp3",
        "vtt": f"audio/{slug}.vtt",
        "size_kb": round(size_kb),
        "sections": len(texts),
    }


def find_missing_pages() -> list[str]:
    """Find all HTML pages that have data-narrate but no audio."""
    missing = []
    for html in sorted(ROOT.glob("*.html")):
        if html.name in ("index.html", "404.html"):
            continue
        slug = html.stem
        if (OUTPUT_DIR / f"{slug}.mp3").exists():
            continue
        texts = extract_narrations(html)
        if texts:
            missing.append(slug)
    return missing


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if "--all" in sys.argv:
        targets = find_missing_pages()
        print(f"  Found {len(targets)} pages missing audio")
    else:
        targets = [a for a in sys.argv[1:] if not a.startswith("-")]

    if not targets:
        print("Usage: python generate_page_audio.py <slug> [slug...] | --all")
        return

    print("═" * 60)
    print("  LIRIL Voice — Dynamic Page Audio Generator")
    print(f"  Voice: {VOICE}  |  Rate: {RATE}  |  Pitch: {PITCH}")
    print(f"  Pages: {len(targets)}")
    print("═" * 60)

    # Load existing manifest
    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest = {}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    generated = 0
    for slug in targets:
        result = await generate_page(slug)
        if result:
            manifest[slug] = result
            generated += 1

    # Write updated manifest
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n  Generated: {generated}/{len(targets)} pages")
    print(f"  Manifest: {manifest_path} ({len(manifest)} entries)")


if __name__ == "__main__":
    asyncio.run(main())
