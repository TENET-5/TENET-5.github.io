#!/usr/bin/env python3
"""Canonical broadcast ticker slate — ONE source for web overlay + video burn-in.

Doctrine (Daniel 2026-07-12):
  The website ticker must perfectly overlap the ticker burned into desk video.
  If they drift, that is the first hallucination signal.

Constants in this module are shared by:
  - tools/press.py (HTML ticker text)
  - tools/prism_desk_video_package.py (ffmpeg drawtext scroll)
  - js/broadcast-ticker-sync.js (phase-lock to video.currentTime)
  - tools/prism_ticker_video_sync.py (hash gate)

    python tools/broadcast_ticker_slate.py --from-segments path.json
    python tools/broadcast_ticker_slate.py --write   # rebuild from live schedule / cards
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SLATE_PATH = ROOT / "data" / "broadcast_ticker_slate.json"
PROOF_PATHS = [
    Path(r"C:\PRISM\log\broadcast_ticker_slate_last.json"),
    ROOT / "data" / "broadcast_ticker_slate_last.json",
]

# ── HARD LOCK — must match js/broadcast-ticker-sync.js + ffmpeg burn ─────────
SCROLL_PX_PER_S = 80
SEPARATOR = "  ·  "
TAIL_MARKERS = ("LIVE", "TIME NAV", "TOPIC NAV", "TENET5")
VIDEO_W = 1280
VIDEO_H = 720
TICKER_H = 36  # px strip height at bottom of frame
TICKER_Y_FROM_BOTTOM = 28  # drawtext baseline y = h - 28
TITLE_CLIP = 48

# Article / chart product types must NEVER appear on the main ticker slate.
# Full multi-slate registry: tools/prism_news_slate.py + tools/NEWS_SLATE_SPEC.md
_POLLUTION = re.compile(
    r"\b("
    r"news\.package|investigation\.press-file|case\.act|evidence\.shelf|hub\.lane|"
    r"wire_note|daily_package|wire_external|article_type|chart_type|"
    r"nr-metrics|trajectory|network-graph|desk_svg|table_fact|chart:"
    r")\b",
    re.I,
)
_ARTICLE_TYPE_DESKS = {
    "feature",
    "wire_note",
    "daily_package",
    "wire_external",
    "briefing",
    "headline",
    "investigation",
    "case_act",
    "evidence_item",
    "hub",
    "chart",
    "metrics",
    "trajectory",
    "network",
}


def _esc_plain(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def bit_for_seg(n: int, desk: str, title: str) -> str:
    d = _esc_plain(desk).upper() or "DESK"
    # Strip type labels that leaked into desk fields
    if d.lower() in _ARTICLE_TYPE_DESKS:
        d = "DESK"
    t = _esc_plain(title)[:TITLE_CLIP]
    t = _POLLUTION.sub("", t).strip(" :·-") or "Desk hit"
    return f"SEG {int(n):02d} {d}: {t}"


def bits_from_segments(segments: list[dict[str, Any]]) -> list[str]:
    """Build main-slate bits only. Article/chart types are stripped/skipped."""
    bits: list[str] = []
    for i, s in enumerate(segments):
        # Explicit product-type rows never enter the main ticker
        kind = str(s.get("type") or s.get("article_type") or s.get("chart_type") or "").lower()
        if kind in _ARTICLE_TYPE_DESKS or kind.startswith("chart"):
            continue
        if s.get("off_main") or s.get("slate") in ("article", "chart", "osint", "wire"):
            continue
        n = int(s.get("n") or s.get("seg_n") or (i + 1))
        desk = str(s.get("desk") or s.get("domain") or "DESK")
        title = str(s.get("title") or s.get("headline") or s.get("id") or "Desk hit")
        bit = bit_for_seg(n, desk, title)
        if _POLLUTION.search(bit):
            continue
        bits.append(bit)
    return bits


def core_line(bits: list[str]) -> str:
    return SEPARATOR.join(bits) if bits else "TENET5  ·  PRIMARY SOURCES  ·  YOU VERIFY"


def tail_line() -> str:
    return SEPARATOR.join(TAIL_MARKERS)


def full_line(bits: list[str]) -> str:
    """Doubled line for seamless CSS / visual loop (half = one cycle of content)."""
    core = core_line(bits)
    tail = tail_line()
    unit = f"{core}{SEPARATOR}{tail}"
    return f"{unit}{SEPARATOR}{unit}"


def unit_line(bits: list[str]) -> str:
    """Single cycle (not doubled) — used for video burn + hash."""
    core = core_line(bits)
    return f"{core}{SEPARATOR}{tail_line()}"


def slate_hash(unit: str) -> str:
    return hashlib.sha256(unit.encode("utf-8")).hexdigest()[:16]


def build_slate(
    segments: list[dict[str, Any]],
    *,
    source: str = "segments",
) -> dict[str, Any]:
    bits = bits_from_segments(segments)
    unit = unit_line(bits)
    full = full_line(bits)
    h = slate_hash(unit)
    return {
        "ts": datetime.now(timezone.utc).isoformat(),
        "doctrine": "ticker_video_perfect_sync",
        "slate_role": "main.broadcast_ticker",
        "off_main": {
            "article_types": "data/news_slate_registry.json → article_types",
            "chart_types": "data/news_slate_registry.json → chart_types",
            "spec": "tools/NEWS_SLATE_SPEC.md",
        },
        "hallucination_rule": (
            "Web overlay ticker must phase-lock to video.currentTime at SCROLL_PX_PER_S. "
            "Desync of text hash or scroll phase = first hallucination indicator. "
            "Article types and chart types on this slate = pollution / fail."
        ),
        "source": source,
        "scroll_px_per_s": SCROLL_PX_PER_S,
        "separator": SEPARATOR,
        "video_w": VIDEO_W,
        "video_h": VIDEO_H,
        "ticker_h": TICKER_H,
        "ticker_y_from_bottom": TICKER_Y_FROM_BOTTOM,
        "title_clip": TITLE_CLIP,
        "bits": bits,
        "unit_line": unit,
        "full_line": full,
        "hash": h,
        "segment_count": len(bits),
        "ffmpeg_x_expr": f"w-mod(t*{SCROLL_PX_PER_S}\\,w+tw)",
        "web_transform": f"translateX( -((t * {SCROLL_PX_PER_S}) % loopW) px )",
    }


def write_slate(slate: dict[str, Any]) -> Path:
    SLATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    SLATE_PATH.write_text(json.dumps(slate, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    proof = {
        "ts": slate.get("ts"),
        "verdict": "TICKER_SLATE_OK",
        "hash": slate.get("hash"),
        "segment_count": slate.get("segment_count"),
        "scroll_px_per_s": slate.get("scroll_px_per_s"),
        "path": str(SLATE_PATH),
    }
    for p in PROOF_PATHS:
        try:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
        except OSError:
            pass
    return SLATE_PATH


def load_slate() -> dict[str, Any] | None:
    if not SLATE_PATH.is_file():
        return None
    try:
        return json.loads(SLATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def segments_from_schedule() -> list[dict[str, Any]]:
    """Prefer live station schedule; fall back to presentation / empty."""
    for rel in (
        "data/tenet5_live_schedule.json",
        "data/liril_news_presentation.json",
        "data/liril_desk_package.json",
    ):
        p = ROOT / rel
        if not p.is_file():
            continue
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        linear = d.get("linear") or d.get("segments") or []
        if not linear:
            continue
        out: list[dict[str, Any]] = []
        for i, s in enumerate(linear):
            if not isinstance(s, dict):
                continue
            # skip pure VO / open segments without desk hits when possible
            desk = s.get("desk") or s.get("domain") or s.get("label") or ""
            title = s.get("title") or s.get("headline") or s.get("text") or s.get("id") or ""
            if s.get("role") in ("anchor_open", "desk_tour") and not s.get("video_id"):
                continue
            out.append(
                {
                    "n": s.get("n") or s.get("seg_n") or (i + 1),
                    "desk": desk or "DESK",
                    "title": (title[:120] if isinstance(title, str) else str(title)[:120]),
                    "id": s.get("id") or s.get("video_id") or f"seg-{i}",
                }
            )
        if out:
            return out[:24]
    return []


def main(argv: list[str] | None = None) -> int:
    import sys

    args = list(argv if argv is not None else sys.argv[1:])
    segs = segments_from_schedule()
    slate = build_slate(segs, source="schedule_or_presentation")
    path = write_slate(slate)
    print(
        json.dumps(
            {
                "verdict": "TICKER_SLATE_OK",
                "hash": slate["hash"],
                "bits": len(slate["bits"]),
                "path": str(path),
                "scroll_px_per_s": SCROLL_PX_PER_S,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
