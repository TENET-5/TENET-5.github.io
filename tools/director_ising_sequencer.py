#!/usr/bin/env python3
"""director_ising_sequencer.py — quantum beat SELECTION for the documentary director.

Honest scope: PRISM's qising is a 2^N state-vector QAOA sim, so N (beats considered at once)
must stay small (<=16). Beat SELECTION — pick the subset of a candidate pool that maximizes
IMPACT under a runtime budget while penalizing topic redundancy — is an N-binary QUBO that
fits. (Global ordering of a long film is N! and blows up qubits; that stays classical/
hierarchical: run this per chapter.) This is a real combinatorial optimization, not theatre.

QUBO (maximize):  sum_i impact_i x_i
  subject to      sum_i dur_i x_i ~ T          (soft, weight lam)
  penalize        same-topic pairs             (weight mu)
Minimize energy E(x) = -sum impact_i x_i + lam*(sum dur_i x_i - T)^2 + mu*sum_{topic(i)=topic(j)} x_i x_j
Convert x in {0,1} -> Ising z in {-1,+1} via x=(1+z)/2, emit (J,h) for qising.

Usage: python director_ising_sequencer.py <pool.json> <target_runtime_s>
"""
from __future__ import annotations
import sys, json, subprocess, tempfile, re
from pathlib import Path
from itertools import combinations

QISING = r"E:\S.L.A.T.E\prism\os\hydrogen\qising.exe"


def build_ising(beats, T, lam=0.02, mu=1.5):
    """Return (N, J dict{(i,j):w}, h list) for E(x) above, in Ising z-space."""
    n = len(beats)
    imp = [b["impact"] for b in beats]
    dur = [b["duration_s"] for b in beats]
    top = [b.get("topic", "") for b in beats]
    # QUBO coefficients: E = sum_i a_i x_i + sum_{i<j} b_ij x_i x_j (+ const)
    a = [0.0] * n
    b = {}
    # -impact
    for i in range(n):
        a[i] += -imp[i]
    # lam*(sum dur_i x_i - T)^2 = lam*(sum dur_i^2 x_i + 2 sum_{i<j} dur_i dur_j x_i x_j - 2T sum dur_i x_i + T^2)
    for i in range(n):
        a[i] += lam * (dur[i] * dur[i] - 2 * T * dur[i])
    for i, j in combinations(range(n), 2):
        b[(i, j)] = b.get((i, j), 0.0) + lam * 2 * dur[i] * dur[j]
    # mu topic-redundancy on same-topic pairs
    for i, j in combinations(range(n), 2):
        if top[i] and top[i] == top[j]:
            b[(i, j)] = b.get((i, j), 0.0) + mu
    # QUBO -> Ising:  x_i = (1+z_i)/2
    #  a_i x_i -> a_i/2 z_i + const ;  b_ij x_i x_j -> b_ij/4 z_i z_j + b_ij/4 z_i + b_ij/4 z_j + const
    h = [a[i] / 2.0 for i in range(n)]
    J = {}
    for (i, j), w in b.items():
        J[(i, j)] = J.get((i, j), 0.0) + w / 4.0
        h[i] += w / 4.0
        h[j] += w / 4.0
    return n, J, h


def solve(beats, T):
    n, J, h = build_ising(beats, T)
    spec = [f"n {n}"]
    for (i, j), w in J.items():
        if abs(w) > 1e-9:
            spec.append(f"J {i} {j} {w:.6f}")
    spec.append("h " + " ".join(f"{v:.6f}" for v in h))
    with tempfile.NamedTemporaryFile("w", suffix=".ising", delete=False) as f:
        f.write("\n".join(spec) + "\n")
        path = f.name
    if not Path(QISING).exists():
        return None, "qising.exe not found at " + QISING
    out = subprocess.run([QISING, "solve", path], capture_output=True, text=True, timeout=120).stdout
    m = re.search(r"x[= ]([01]{%d})" % n, out) or re.search(r"([01]{%d})" % n, out)
    if not m:
        return None, out[:300]
    bits = m.group(1)
    chosen = [beats[i] for i, c in enumerate(bits) if c == "1"]
    return chosen, bits


def main():
    if len(sys.argv) < 3:
        # self-test on a synthetic pool
        pool = [
            {"id": "arrivecan", "impact": 9, "duration_s": 60, "topic": "procurement"},
            {"id": "phoenix", "impact": 7, "duration_s": 55, "topic": "procurement"},
            {"id": "mckinsey", "impact": 6, "duration_s": 50, "topic": "procurement"},
            {"id": "maid_veterans", "impact": 10, "duration_s": 70, "topic": "health"},
            {"id": "maid_numbers", "impact": 8, "duration_s": 45, "topic": "health"},
            {"id": "foreign_interf", "impact": 9, "duration_s": 65, "topic": "foreign"},
            {"id": "housing", "impact": 6, "duration_s": 40, "topic": "economy"},
            {"id": "veterans_offices", "impact": 7, "duration_s": 50, "topic": "military"},
        ]
        T = 240
    else:
        pool = json.loads(Path(sys.argv[1]).read_text())
        T = float(sys.argv[2])
    chosen, bits = solve(pool, T)
    if chosen is None:
        print("solve failed:", bits); return 1
    tot = sum(b["duration_s"] for b in chosen)
    print(f"qising selection (bits={bits}): {len(chosen)}/{len(pool)} beats, {tot}s of {T}s target")
    for b in chosen:
        print(f"  +{b['duration_s']:>3}s  impact {b['impact']:>2}  {b['topic']:11} {b['id']}")
    topics = {b["topic"] for b in chosen}
    print(f"topic spread: {len(topics)} distinct ({', '.join(sorted(topics))}) — redundancy penalized")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
