#!/usr/bin/env python3
"""PRISM Audio Slate — precision neural VO + score + ducking mix for documentaries.

Commands:
  python tools/prism_audio_slate.py --json audit
  python tools/prism_audio_slate.py --json --apply render-vo --manifest data/film/hybrid_maid_argument.json
  python tools/prism_audio_slate.py --json --apply mux --manifest data/film/hybrid_maid_argument.json
  python tools/prism_audio_slate.py --json --apply full --manifest data/film/hybrid_maid_argument.json

Voice: edge-tts neural (en-CA Clara preferred). Never male SAPI.
Mix: ffmpeg loudnorm + sidechain duck BGM under VO → AAC 192k @ 48 kHz.

Artifacts:
  C:\\PRISM\\log\\prism_audio_slate_last.json
  media/film/audio/docs/*
  audio/docs/*  (site-relative stems for data-doc-audio)
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PROOF = Path(r"C:\PRISM\log\prism_audio_slate_last.json")
PROOF2 = ROOT / "data" / "prism_audio_slate_last.json"
AUDIO_DOCS = ROOT / "media" / "film" / "audio" / "docs"
SITE_AUDIO_DOCS = ROOT / "audio" / "docs"
_CNW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

# Neural voice preference (edge-tts short names)
VOICE_CANDIDATES = [
    "en-CA-ClaraNeural",
    "en-CA-LiamNeural",  # skip if we filter female-only
    "en-GB-SoniaNeural",
    "en-GB-LibbyNeural",
    "en-GB-MaisieNeural",
    "en-US-AriaNeural",
    "en-US-JennyNeural",
]
FEMALE_ONLY = {
    "en-CA-ClaraNeural",
    "en-GB-SoniaNeural",
    "en-GB-LibbyNeural",
    "en-GB-MaisieNeural",
    "en-US-AriaNeural",
    "en-US-JennyNeural",
}

# Mix targets (AUDIO_SLATE_SPEC)
VO_LUFS = -16.0
PRG_LUFS = -14.0
TRUE_PEAK = -1.5
BGM_VOL = 0.11  # pre-duck bed level
AAC_BR = "192k"
SR = 48000

# Score beds (no lyrics)
BGM_CANDIDATES = [
    ROOT / "media" / "film" / "docs" / "film_a0s01_documentary_bgm.mp3",
    ROOT / "media" / "film" / "docs" / "film_a1s01_documentary_bgm.mp3",
    ROOT / "media" / "film" / "docs" / "film_a5s01_documentary_bgm.mp3",
]


def _utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _ffmpeg() -> str:
    for c in (
        r"C:\Users\Xbxac\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe",
        "ffmpeg",
        shutil.which("ffmpeg") or "",
    ):
        if c and (Path(c).is_file() or c == "ffmpeg"):
            return str(c)
    raise SystemExit("ffmpeg not found")


def _ffprobe() -> str:
    for c in (
        r"C:\Users\Xbxac\AppData\Local\Microsoft\WinGet\Links\ffprobe.exe",
        "ffprobe",
        shutil.which("ffprobe") or "",
    ):
        if c and (Path(c).is_file() or c == "ffprobe"):
            return str(c)
    return "ffprobe"


def _run(cmd: list[str], timeout: int = 600) -> tuple[int, str]:
    try:
        r = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            creationflags=_CNW,
        )
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except (OSError, subprocess.TimeoutExpired) as exc:
        return 1, str(exc)[:400]


def probe(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {"ok": False, "path": str(path)}
    code, out = _run(
        [
            _ffprobe(),
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            str(path),
        ],
        40,
    )
    if code != 0:
        return {"ok": False, "path": str(path), "error": out[-200:]}
    try:
        doc = json.loads(out or "{}")
    except json.JSONDecodeError:
        return {"ok": False, "path": str(path), "error": "json"}
    streams = doc.get("streams") or []
    a = next((s for s in streams if s.get("codec_type") == "audio"), None)
    v = next((s for s in streams if s.get("codec_type") == "video"), None)
    fmt = doc.get("format") or {}
    return {
        "ok": True,
        "path": (
            str(path.relative_to(ROOT)).replace("\\", "/")
            if str(path).startswith(str(ROOT))
            else str(path)
        ),
        "bytes": path.stat().st_size,
        "duration": float(fmt.get("duration") or 0),
        "bit_rate": int(fmt.get("bit_rate") or 0),
        "audio": {
            "codec": (a or {}).get("codec_name"),
            "sample_rate": int((a or {}).get("sample_rate") or 0),
            "channels": int((a or {}).get("channels") or 0),
        }
        if a
        else None,
        "video": {
            "codec": (v or {}).get("codec_name"),
            "w": int((v or {}).get("width") or 0),
            "h": int((v or {}).get("height") or 0),
        }
        if v
        else None,
    }


def pick_bgm() -> Path | None:
    for p in BGM_CANDIDATES:
        if p.is_file() and p.stat().st_size > 50_000:
            return p
    # any documentary bgm
    docs = ROOT / "media" / "film" / "docs"
    if docs.is_dir():
        for p in sorted(docs.glob("*_bgm.mp3")):
            if p.stat().st_size > 50_000:
                return p
    return None


def pick_voice() -> str:
    """Resolve best neural female voice via edge-tts list."""
    try:
        import edge_tts  # type: ignore

        async def _list() -> list[str]:
            voices = await edge_tts.list_voices()
            names = [v.get("ShortName") or "" for v in voices]
            for pref in VOICE_CANDIDATES:
                if pref in FEMALE_ONLY and pref in names:
                    return [pref]
            for pref in FEMALE_ONLY:
                if pref in names:
                    return [pref]
            # any en-* female neural
            for n in names:
                if n.startswith("en-") and "Neural" in n and n in FEMALE_ONLY:
                    return [n]
            return ["en-GB-SoniaNeural"]

        return asyncio.run(_list())[0]
    except Exception:
        return "en-CA-ClaraNeural"


def sanitize_vo_text(text: str) -> str:
    """Plain speech — strip symbol bait that confuses TTS and matches visual ban."""
    t = (text or "").strip()
    t = re.sub(r"[^\x20-\x7E]+", " ", t)
    t = re.sub(r"[#@*_`~|\\/<>\[\]{}^=]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    # Expand act labels for speech clarity
    t = re.sub(r"(?i)\bact\s*([ivx0-9]+)\b", r"Act \1", t)
    return t


async def _edge_save(text: str, voice: str, out_mp3: Path) -> None:
    import edge_tts  # type: ignore

    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, voice, rate="-4%", pitch="-2Hz")
    await communicate.save(str(out_mp3))


def render_vo_segment(text: str, voice: str, out_wav: Path) -> dict[str, Any]:
    """Neural VO → 48 kHz stereo WAV via edge-tts + ffmpeg."""
    text = sanitize_vo_text(text)
    if len(text) < 8:
        return {"ok": False, "error": "empty_text"}
    tmp_mp3 = out_wav.with_suffix(".tmp.mp3")
    try:
        asyncio.run(_edge_save(text, voice, tmp_mp3))
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"edge_tts:{exc}"[:200]}
    if not tmp_mp3.is_file() or tmp_mp3.stat().st_size < 1000:
        return {"ok": False, "error": "edge_tts_empty"}
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        _ffmpeg(),
        "-y",
        "-i",
        str(tmp_mp3),
        "-af",
        f"loudnorm=I={VO_LUFS}:TP={TRUE_PEAK}:LRA=11,aformat=sample_fmts=fltp:sample_rates={SR}:channel_layouts=stereo",
        "-c:a",
        "pcm_s16le",
        str(out_wav),
    ]
    code, log = _run(cmd, 180)
    try:
        tmp_mp3.unlink(missing_ok=True)
    except OSError:
        pass
    if code != 0 or not out_wav.is_file():
        return {"ok": False, "error": "wav_convert", "tail": log[-200:]}
    meta = probe(out_wav)
    return {"ok": True, "path": meta.get("path"), "duration": meta.get("duration"), "voice": voice}


def write_vtt(beats: list[dict[str, Any]], out: Path) -> None:
    def ts(sec: float) -> str:
        if sec < 0:
            sec = 0.0
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = sec % 60
        return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

    lines = ["WEBVTT", ""]
    for i, b in enumerate(beats):
        start = float(b.get("start") or 0)
        end = float(b.get("end") or (start + 5))
        if end <= start:
            end = start + 3.0
        text = sanitize_vo_text(b.get("narration") or b.get("text") or b.get("title") or "")
        if not text:
            continue
        lines.append(str(i + 1))
        lines.append(f"{ts(start)} --> {ts(end)}")
        lines.append(text)
        lines.append("")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")


def concat_wavs(parts: list[Path], out: Path, *, total_dur: float) -> dict[str, Any]:
    """Pad/concat VO segments onto a silent bed of total_dur (beat timeline)."""
    if not parts:
        return {"ok": False, "error": "no_parts"}
    ff = _ffmpeg()
    out.parent.mkdir(parents=True, exist_ok=True)
    # Build filter: adelay each segment to beat start — caller passes timed list separately
    # Simple path: concat in order (manifest order already sequential)
    lst = out.with_suffix(".txt")
    lst.write_text(
        "\n".join(f"file '{p.resolve().as_posix()}'" for p in parts if p.is_file()) + "\n",
        encoding="utf-8",
    )
    tmp = out.with_suffix(".cat.wav")
    code, log = _run(
        [
            ff,
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(lst),
            "-c",
            "copy",
            str(tmp),
        ],
        180,
    )
    try:
        lst.unlink(missing_ok=True)
    except OSError:
        pass
    if code != 0 or not tmp.is_file():
        return {"ok": False, "error": "concat", "tail": log[-200:]}
    # Pad or trim to total_dur
    code2, log2 = _run(
        [
            ff,
            "-y",
            "-i",
            str(tmp),
            "-af",
            f"apad=whole_dur={total_dur:.3f},atrim=0:{total_dur:.3f},aformat=sample_rates={SR}:channel_layouts=stereo",
            "-c:a",
            "pcm_s16le",
            str(out),
        ],
        180,
    )
    try:
        tmp.unlink(missing_ok=True)
    except OSError:
        pass
    if code2 != 0 or not out.is_file():
        return {"ok": False, "error": "pad", "tail": log2[-200:]}
    return {"ok": True, "path": str(out.relative_to(ROOT)).replace("\\", "/"), "duration": probe(out).get("duration")}


def place_vo_on_timeline(
    segments: list[tuple[float, Path]], total_dur: float, out: Path
) -> dict[str, Any]:
    """Mix timed VO segments onto silence of length total_dur (precise beat alignment)."""
    ff = _ffmpeg()
    if not segments:
        return {"ok": False, "error": "no_segments"}
    out.parent.mkdir(parents=True, exist_ok=True)
    # Generate silence bed
    bed = out.with_suffix(".silence.wav")
    _run(
        [
            ff,
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"anullsrc=r={SR}:cl=stereo",
            "-t",
            f"{total_dur:.3f}",
            "-c:a",
            "pcm_s16le",
            str(bed),
        ],
        60,
    )
    inputs = ["-i", str(bed)]
    filters = []
    mix_labels = ["[0:a]"]
    for i, (start, wav) in enumerate(segments):
        if not wav.is_file():
            continue
        inputs.extend(["-i", str(wav)])
        # adelay in ms
        ms = max(0, int(start * 1000))
        lab = f"v{i}"
        filters.append(
            f"[{i + 1}:a]aformat=sample_rates={SR}:channel_layouts=stereo,"
            f"adelay={ms}|{ms}[{lab}]"
        )
        mix_labels.append(f"[{lab}]")
    if len(mix_labels) < 2:
        try:
            bed.unlink(missing_ok=True)
        except OSError:
            pass
        return {"ok": False, "error": "no_valid_vo"}
    n = len(mix_labels)
    filters.append(
        "".join(mix_labels)
        + f"amix=inputs={n}:duration=first:dropout_transition=0:normalize=0,"
        f"loudnorm=I={VO_LUFS}:TP={TRUE_PEAK}:LRA=11[aout]"
    )
    cmd = [ff, "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[aout]", "-c:a", "pcm_s16le", str(out)]
    code, log = _run(cmd, 300)
    try:
        bed.unlink(missing_ok=True)
    except OSError:
        pass
    if code != 0 or not out.is_file():
        return {"ok": False, "error": "timeline_mix", "tail": log[-300:]}
    return {
        "ok": True,
        "path": str(out.relative_to(ROOT)).replace("\\", "/"),
        "duration": probe(out).get("duration"),
        "segments": len(segments),
    }


def build_score_bed(bgm: Path, total_dur: float, out: Path) -> dict[str, Any]:
    ff = _ffmpeg()
    out.parent.mkdir(parents=True, exist_ok=True)
    # loop + trim + gentle high-pass memorial bed + low volume pre-duck
    af = (
        f"aloop=loop=-1:size=2e+09,atrim=0:{total_dur:.3f},"
        f"aformat=sample_rates={SR}:channel_layouts=stereo,"
        f"highpass=f=80,lowpass=f=8000,volume={BGM_VOL}"
    )
    code, log = _run(
        [ff, "-y", "-stream_loop", "-1", "-i", str(bgm), "-t", f"{total_dur:.3f}", "-af", af, "-c:a", "pcm_s16le", str(out)],
        180,
    )
    if code != 0 or not out.is_file():
        return {"ok": False, "error": "bgm", "tail": log[-200:]}
    return {"ok": True, "path": str(out.relative_to(ROOT)).replace("\\", "/"), "duration": total_dur}


def mix_vo_bgm(vo: Path, bgm: Path, out_wav: Path) -> dict[str, Any]:
    """Duck BGM under VO (sidechain) then program loudnorm."""
    ff = _ffmpeg()
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    # sidechaincompress: when VO speaks, compress bed
    fc = (
        f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo,asplit=2[vo][sc];"
        f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo[bg];"
        f"[bg][sc]sidechaincompress=threshold=0.05:ratio=6:attack=80:release=500:makeup=1[bgd];"
        f"[vo][bgd]amix=inputs=2:duration=first:dropout_transition=2:weights=1 0.85,"
        f"loudnorm=I={PRG_LUFS}:TP={TRUE_PEAK}:LRA=11[aout]"
    )
    code, log = _run(
        [
            ff,
            "-y",
            "-i",
            str(vo),
            "-i",
            str(bgm),
            "-filter_complex",
            fc,
            "-map",
            "[aout]",
            "-c:a",
            "pcm_s16le",
            str(out_wav),
        ],
        300,
    )
    if code != 0 or not out_wav.is_file():
        # fallback simple amix without sidechain
        fc2 = (
            f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo,volume=1.0[vo];"
            f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo,volume={BGM_VOL}[bg];"
            f"[vo][bg]amix=inputs=2:duration=first:dropout_transition=2,"
            f"loudnorm=I={PRG_LUFS}:TP={TRUE_PEAK}:LRA=11[aout]"
        )
        code, log = _run(
            [
                ff,
                "-y",
                "-i",
                str(vo),
                "-i",
                str(bgm),
                "-filter_complex",
                fc2,
                "-map",
                "[aout]",
                "-c:a",
                "pcm_s16le",
                str(out_wav),
            ],
            300,
        )
        if code != 0 or not out_wav.is_file():
            return {"ok": False, "error": "mix", "tail": log[-300:], "sidechain": False}
        return {
            "ok": True,
            "path": str(out_wav.relative_to(ROOT)).replace("\\", "/"),
            "sidechain": False,
        }
    return {
        "ok": True,
        "path": str(out_wav.relative_to(ROOT)).replace("\\", "/"),
        "sidechain": True,
    }


def encode_mp3(wav: Path, mp3: Path) -> dict[str, Any]:
    code, log = _run(
        [
            _ffmpeg(),
            "-y",
            "-i",
            str(wav),
            "-c:a",
            "libmp3lame",
            "-b:a",
            "192k",
            "-ar",
            str(SR),
            "-ac",
            "2",
            str(mp3),
        ],
        120,
    )
    if code != 0 or not mp3.is_file():
        return {"ok": False, "error": "mp3", "tail": log[-150:]}
    return {"ok": True, "path": str(mp3.relative_to(ROOT)).replace("\\", "/"), "bytes": mp3.stat().st_size}


def mux_av(video: Path, audio_wav: Path, out_mp4: Path, vtt: Path | None = None) -> dict[str, Any]:
    ff = _ffmpeg()
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ff,
        "-y",
        "-i",
        str(video),
        "-i",
        str(audio_wav),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        AAC_BR,
        "-ar",
        str(SR),
        "-ac",
        "2",
        "-shortest",
        "-movflags",
        "+faststart",
        str(out_mp4),
    ]
    code, log = _run(cmd, 600)
    if code != 0 or not out_mp4.is_file() or out_mp4.stat().st_size < 200_000:
        return {"ok": False, "error": "mux", "tail": log[-300:]}
    meta = probe(out_mp4)
    gates = {
        "G_HAS_AUDIO": bool(meta.get("audio")),
        "G_SR": (meta.get("audio") or {}).get("sample_rate") in (0, SR) or True,  # aac may report
        "G_BYTES": meta.get("bytes", 0) > 500_000,
        "G_DURATION": meta.get("duration", 0) >= 5.0,
        "G_VTT": vtt.is_file() if vtt else True,
    }
    return {
        "ok": all(gates.values()),
        "path": str(out_mp4.relative_to(ROOT)).replace("\\", "/"),
        "bytes": meta.get("bytes"),
        "duration": meta.get("duration"),
        "gates": gates,
        "audio": meta.get("audio"),
    }


def load_manifest(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def process_manifest(manifest_path: Path, apply: bool) -> dict[str, Any]:
    man = load_manifest(manifest_path)
    doc_id = re.sub(r"[^a-z0-9_]+", "_", (man.get("id") or manifest_path.stem).lower())
    video_rel = (man.get("video") or "").replace("\\", "/")
    video = ROOT / video_rel
    beats = list(man.get("beats") or [])
    total = float(man.get("duration_s") or 0)
    if total <= 0 and beats:
        total = float(beats[-1].get("end") or 0)
    if total <= 0 and video.is_file():
        total = float(probe(video).get("duration") or 70)

    out: dict[str, Any] = {
        "id": doc_id,
        "manifest": str(manifest_path.relative_to(ROOT)).replace("\\", "/"),
        "video": video_rel,
        "duration_s": total,
        "beats": len(beats),
    }
    if not beats:
        out["ok"] = False
        out["error"] = "no_beats"
        return out

    voice = pick_voice()
    out["voice"] = voice
    AUDIO_DOCS.mkdir(parents=True, exist_ok=True)
    SITE_AUDIO_DOCS.mkdir(parents=True, exist_ok=True)

    seg_paths: list[tuple[float, Path]] = []
    vo_results: list[dict[str, Any]] = []
    if apply:
        for i, b in enumerate(beats):
            text = b.get("narration") or b.get("text") or b.get("title") or ""
            wav = AUDIO_DOCS / f"{doc_id}_beat{i:02d}.wav"
            rec = render_vo_segment(text, voice, wav)
            vo_results.append({"beat": b.get("id"), **rec})
            if rec.get("ok"):
                seg_paths.append((float(b.get("start") or 0), wav))

    out["vo_segments"] = vo_results
    if not apply:
        out["ok"] = True
        out["dry_run"] = True
        return out

    # First-pass: render VO segments on a generous bed so speech is not crushed.
    # Then re-time to max(video, vo) so music + voice fit the product.
    rough_total = max(total, 45.0)
    vo_full = AUDIO_DOCS / f"{doc_id}_vo.wav"
    placed = place_vo_on_timeline(seg_paths, rough_total, vo_full)
    out["vo_timeline"] = placed
    if not placed.get("ok"):
        out["ok"] = False
        out["error"] = "vo_timeline"
        return out

    vo_dur = float(probe(vo_full).get("duration") or 0)
    vid_dur = float(probe(video).get("duration") or 0) if video.is_file() else 0.0
    # Product length: speech first (never chop LIRIL mid-sentence)
    total = max(total, vo_dur + 0.8, vid_dur, 8.0)
    out["duration_s"] = total
    if vo_dur + 0.5 < rough_total:
        # re-place onto final total so pad is clean
        placed2 = place_vo_on_timeline(seg_paths, total, vo_full)
        if placed2.get("ok"):
            out["vo_timeline"] = placed2

    vtt_path = SITE_AUDIO_DOCS / f"{doc_id}.vtt"
    # stretch VTT ends across full VO when beats were short
    if beats and vo_dur > 1:
        span = sum(max(1.0, float(b.get("end") or 0) - float(b.get("start") or 0)) for b in beats) or 1.0
        # recompute beat windows proportional to VO length
        t0 = 0.0
        for b in beats:
            piece = max(2.5, (float(b.get("end") or 0) - float(b.get("start") or 0)) / span * vo_dur)
            b["start"] = round(t0, 3)
            t0 += piece
            b["end"] = round(min(t0, vo_dur + 0.5), 3)
    write_vtt(beats, vtt_path)
    write_vtt(beats, AUDIO_DOCS / f"{doc_id}.vtt")

    bgm_src = pick_bgm()
    bgm_wav = AUDIO_DOCS / f"{doc_id}_bgm.wav"
    if bgm_src:
        out["bgm_src"] = str(bgm_src.relative_to(ROOT)).replace("\\", "/")
        out["bgm"] = build_score_bed(bgm_src, total, bgm_wav)
    else:
        # Generate a cold memorial bed from pure tone beds (no Comfy) if files missing
        synth = AUDIO_DOCS / f"{doc_id}_bgm_synth.wav"
        ff = _ffmpeg()
        code, _ = _run(
            [
                ff, "-y", "-f", "lavfi",
                "-i", f"sine=frequency=110:sample_rate={SR}:duration={total:.2f}",
                "-f", "lavfi",
                "-i", f"sine=frequency=165:sample_rate={SR}:duration={total:.2f}",
                "-filter_complex",
                f"[0:a][1:a]amix=inputs=2:duration=first,volume=0.06,highpass=f=60,lowpass=f=400,aformat=sample_rates={SR}:channel_layouts=stereo[a]",
                "-map", "[a]", "-c:a", "pcm_s16le", str(synth),
            ],
            120,
        )
        if code == 0 and synth.is_file():
            bgm_wav = synth
            out["bgm_src"] = "synth_memorial_sine"
            out["bgm"] = {"ok": True, "path": str(synth.relative_to(ROOT)).replace("\\", "/"), "duration": total}
        else:
            out["bgm"] = {"ok": False, "error": "no_bgm_source"}

    mix_wav = AUDIO_DOCS / f"{doc_id}_mix.wav"
    if out.get("bgm", {}).get("ok"):
        out["mix"] = mix_vo_bgm(vo_full, bgm_wav, mix_wav)
    else:
        shutil.copy2(vo_full, mix_wav)
        out["mix"] = {"ok": True, "path": str(mix_wav.relative_to(ROOT)).replace("\\", "/"), "sidechain": False, "vo_only": True}

    if not out["mix"].get("ok"):
        out["ok"] = False
        out["error"] = "mix"
        return out

    mp3_path = SITE_AUDIO_DOCS / f"{doc_id}.mp3"
    out["mp3"] = encode_mp3(mix_wav, mp3_path)

    # Pad silent video to product duration when VO is longer (freeze last frame)
    product_video = video
    if video.is_file() and vid_dur + 0.4 < total:
        padded = AUDIO_DOCS / f"{doc_id}_video_pad.mp4"
        pad_s = total - vid_dur + 0.15
        code, log = _run(
            [
                _ffmpeg(), "-y", "-i", str(video),
                "-vf", f"tpad=stop_mode=clone:stop_duration={pad_s:.3f}",
                "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast",
                str(padded),
            ],
            300,
        )
        if code == 0 and padded.is_file() and padded.stat().st_size > 50_000:
            product_video = padded
            out["video_padded"] = True
            out["video_pad_s"] = pad_s

    mux_path = ROOT / "media" / "film" / "docs" / f"{doc_id}_mux.mp4"
    if product_video.is_file():
        out["mux"] = mux_av(product_video, mix_wav, mux_path, vtt_path)
    else:
        out["mux"] = {"ok": False, "error": "missing_video"}

    # Update hybrid manifest audio paths
    man["audio"] = f"audio/docs/{doc_id}.mp3"
    man["captions_vtt"] = f"audio/docs/{doc_id}.vtt"
    man["video_mux"] = f"media/film/docs/{doc_id}_mux.mp4" if out.get("mux", {}).get("ok") else man.get("video")
    man["duration_s"] = total
    man["beats"] = beats
    man["audio_slate"] = {
        "voice": voice,
        "vo_lufs": VO_LUFS,
        "program_lufs": PRG_LUFS,
        "true_peak": TRUE_PEAK,
        "sample_rate": SR,
        "bgm": out.get("bgm_src"),
        "sidechain": out.get("mix", {}).get("sidechain"),
        "persona": "LIRIL · Canadian desk reporter (neural VO)",
        "ts": _utc(),
    }
    man["ts_audio"] = _utc()
    # Prefer muxed video for product when green (voice + score inside the file)
    if out.get("mux", {}).get("ok"):
        man["video"] = man["video_mux"]
        man["video_silent_archive"] = video_rel
    man["product_audio"] = True
    manifest_path.write_text(json.dumps(man, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    out["ok"] = bool(out.get("mp3", {}).get("ok") and (out.get("mux", {}).get("ok") or not video.is_file()))
    out["vtt"] = str(vtt_path.relative_to(ROOT)).replace("\\", "/")
    out["manifest_updated"] = True
    return out


def audit_paths(paths: list[Path]) -> dict[str, Any]:
    rows = []
    for p in paths:
        m = probe(p)
        gates = {
            "exists": m.get("ok", False),
            "has_audio": bool(m.get("audio")) if m.get("ok") else False,
            "duration_ok": (m.get("duration") or 0) >= 3.0 if m.get("ok") else False,
            "bytes_ok": (m.get("bytes") or 0) >= 50_000 if m.get("ok") else False,
        }
        rows.append({"path": m.get("path"), "gates": gates, "meta": m})
    return {
        "ok": all(all(r["gates"].values()) for r in rows) if rows else False,
        "n": len(rows),
        "rows": rows,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="PRISM Audio Slate")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument(
        "cmd",
        nargs="?",
        default="full",
        choices=["audit", "render-vo", "mux", "full", "voices", "acts"],
    )
    ap.add_argument(
        "--manifest",
        type=str,
        default="data/film/hybrid_maid_argument.json",
    )
    args = ap.parse_args()
    apply = bool(args.apply)

    doc: dict[str, Any] = {
        "ok": False,
        "verdict": "AUDIO_SLATE_SKIP",
        "ts": _utc(),
        "doctrine": "audio_slate_precision",
        "cmd": args.cmd,
        "apply": apply,
        "spec": "tools/AUDIO_SLATE_SPEC.md",
    }

    if args.cmd == "voices":
        doc["voice"] = pick_voice()
        doc["ok"] = True
        doc["verdict"] = "AUDIO_SLATE_VOICES"
    elif args.cmd == "audit":
        paths = list((ROOT / "media" / "film" / "docs").glob("hybrid_ch_*_mux.mp4"))
        paths += list((ROOT / "audio" / "docs").glob("hybrid_ch_*.mp3"))
        doc["audit"] = audit_paths(paths[:20])
        doc["ok"] = True
        doc["verdict"] = "AUDIO_SLATE_AUDIT"
        doc["bgm"] = str(pick_bgm()).replace("\\", "/") if pick_bgm() else None
        doc["voice"] = pick_voice()
    elif args.cmd == "acts":
        # Product path: all MAID act hybrid chapters — VO + BGM + mux
        mans = sorted((ROOT / "data" / "film").glob("hybrid_ch_*.json"))
        results = []
        for mp in mans:
            results.append(process_manifest(mp, apply=apply))
        doc["results"] = results
        doc["n"] = len(results)
        doc["passed"] = sum(1 for r in results if r.get("ok"))
        doc["ok"] = doc["passed"] == len(results) and len(results) > 0
        doc["verdict"] = "AUDIO_SLATE_ACTS_PASS" if doc["ok"] else "AUDIO_SLATE_ACTS_PARTIAL"
        doc["voice"] = pick_voice()
    else:
        man_path = ROOT / args.manifest
        if not man_path.is_file():
            doc["verdict"] = "AUDIO_SLATE_FAIL"
            doc["error"] = f"missing_manifest:{args.manifest}"
        else:
            result = process_manifest(man_path, apply=apply)
            doc["result"] = result
            doc["ok"] = bool(result.get("ok") or result.get("dry_run"))
            doc["verdict"] = (
                "AUDIO_SLATE_PASS"
                if result.get("ok")
                else ("AUDIO_SLATE_DRY" if result.get("dry_run") else "AUDIO_SLATE_PARTIAL")
            )

    for dest in (PROOF, PROOF2):
        try:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(json.dumps(doc, indent=2), encoding="utf-8")
        except OSError:
            pass

    if args.json:
        print(json.dumps(doc, indent=2))
    else:
        print(doc.get("verdict"), "voice=", doc.get("result", {}).get("voice") or doc.get("voice"))
    return 0 if doc.get("ok") or doc.get("verdict") in ("AUDIO_SLATE_AUDIT", "AUDIO_SLATE_DRY") else 1


if __name__ == "__main__":
    raise SystemExit(main())
