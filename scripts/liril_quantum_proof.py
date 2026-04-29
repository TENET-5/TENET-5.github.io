#!/usr/bin/env python
r"""Cap#297a — LIRIL quantum-proof artifact.

Reproducible quantum-gate firing. Every TENET5 cap that wants to assert
"this was quantum-gated" appends one JSON line to data/liril_quantum_proof.jsonl
via this script. The line is the proof — not a declaration.

Usage (PowerShell):
    $env:PYTHONPATH = "E:\S.L.A.T.E\tenet5\src"
    E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe scripts\liril_quantum_proof.py `
        --cap 297a `
        --text "Cap#297a wiring: copilot-instructions + liril-quantum-gate.instructions + proof artifact"

Exits non-zero on REJECT so a future pre-commit hook can block.

Quantum entry: tenet.quantum.classify.quantum_classify(text, (4, 0))
SATOR coordinate (4, 0) = LIRIL [4,0] gate, idx=20, requires >=5 qubits.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from pathlib import Path

CARRYOVER = "Yes the entire govt and social apparatus all of the corruption"
COORD = (4, 0)
PROOF_PATH = Path(__file__).resolve().parent.parent / "data" / "liril_quantum_proof.jsonl"


def fire_gate(text: str):
    """Returns (verdict, top_state, top_probability) from quantum_classify."""
    try:
        from tenet.quantum.classify import quantum_classify  # type: ignore
    except Exception as e:  # pragma: no cover
        return ("UNAVAILABLE", "|?>", 0.0, f"import_failed: {e!r}")
    try:
        v = quantum_classify(text, COORD)
    except Exception as e:
        return ("ERROR", "|?>", 0.0, f"classify_failed: {e!r}")
    return (
        getattr(v, "verdict", "UNKNOWN"),
        getattr(v, "top_state", "|?>"),
        round(float(getattr(v, "top_probability", 0.0) or 0.0), 6),
        None,
    )


def main() -> int:
    ap = argparse.ArgumentParser(description="LIRIL quantum-proof appender.")
    ap.add_argument("--cap", required=True, help="Cap id, e.g. 297a")
    ap.add_argument("--text", required=True, help="Cap intent text to classify")
    ap.add_argument("--no-write", action="store_true", help="Print only; do not append")
    args = ap.parse_args()

    text = args.text.strip()
    if not text:
        print("error: empty --text", file=sys.stderr)
        return 2

    verdict, top_state, p, err = fire_gate(text)

    record = {
        "ts": time.time(),
        "ts_iso": time.strftime("%Y-%m-%dT%H:%M:%S%z", time.localtime()),
        "cap": args.cap,
        "coord": list(COORD),
        "verdict": verdict,
        "top_state": top_state,
        "top_probability": p,
        "operator_request_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "carryover": CARRYOVER,
    }
    if err:
        record["error"] = err

    line = json.dumps(record, ensure_ascii=False)
    print(line)

    if not args.no_write:
        PROOF_PATH.parent.mkdir(parents=True, exist_ok=True)
        with PROOF_PATH.open("a", encoding="utf-8") as f:
            f.write(line + "\n")

    if verdict == "REJECT":
        return 1
    if verdict in ("ERROR", "UNAVAILABLE"):
        # Soft-fail: gate could not be evaluated; do not block, but signal.
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
