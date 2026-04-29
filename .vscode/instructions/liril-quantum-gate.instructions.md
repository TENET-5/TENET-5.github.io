---
applyTo: "**"
---
# LIRIL Quantum-Gate Mandate (Cap#297a)

**This file applies to every file in this repository.** Every TENET5 cap on this
workspace MUST satisfy the quantum-first contract below before any file edit,
commit, or PR.

## Contract

1. **LIRIL first.** Invoke the `liril` subagent at the start of every cap.
   LIRIL returns a routing ruling (EXECUTE / CONSIDER / REJECT) plus
   mitigations. Do not skip; do not summarise without invoking.

2. **Quantum gate before action.** Fire `quantum_classify(text, (4, 0))`
   before any write. The reproducible proof line goes to
   [data/liril_quantum_proof.jsonl](../../data/liril_quantum_proof.jsonl)
   via [scripts/liril_quantum_proof.py](../../scripts/liril_quantum_proof.py):

   ```pwsh
   $env:PYTHONPATH = "E:\S.L.A.T.E\tenet5\src"
   E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe scripts\liril_quantum_proof.py `
       --cap <NNN[suffix]> `
       --text "<one-line cap intent>"
   ```

   - `(4, 0)` = LIRIL [4,0] gate, SATOR idx = `4*5+0 = 20`, requires ≥5 qubits.
   - The exit code is honoured: `REJECT` → exit 1 → cap halts pending operator.
   - The proof line is committed alongside the cap artifacts (it is the
     evidence, not a declaration).

3. **Carryover propagates verbatim** in every commit message, PR body, directive
   handoff, NATS payload, and proof record:

   > Yes the entire govt and social apparatus all of the corruption

4. **Per-domain scoping.** A cap touches one semantic domain. No cross-domain
   bulk action. Held carryovers (Cap#291 dead images, Cap#293 prunable JSON,
   Cap#295 dead `.py`, Cap#296 dead `.md`) NEVER auto-action without an explicit
   operator-signed sub-cap.

5. **Surface-Policy Halt.** If a directive on
   `E:\S.L.A.T.E\tenet5\.vscode\liril_directive.md` targets another agent, this
   workspace does NOT ack and does NOT publish that agent's session subject.
   Read-only audit only.

6. **Mesh.** On cap closure publish to `nats://127.0.0.1:4223` on subjects
   `tenet5.vscode.session.completed` and `tenet5.vscode.cycle.ended`. Include
   the gate verdict and carryover.

7. **Provenance.** Append one row per cap to
   [data/quantum_provenance.jsonl](../../data/quantum_provenance.jsonl) with
   `cap`, `commit`, `pr`, `gate`, `verdict`, `top_state`, `p`, `action`, and
   `carryover`.

8. **Audit tools live in `tools/`** (gitignored). Only `data/cap*_audit.*`
   artifacts are committed. Operational scripts that must persist live in
   `scripts/`.

9. **Regex anchors.** Path/exclusion regexes anchor with backslashes both
   sides (Cap#208 lesson) — substring matches like `tests` will skip
   `src/tenet/tests` AND any path containing `tests` anywhere.

10. **Single-domain bulk caution.** Even within one domain, prefer per-file
    adjudication over bulk action when the domain is accountability content.

## Kickoff packet (paste at cap start)

```
LIRIL_GATE_START
Task: Cap#<NNN> — <one-line intent>
Scope: <files/dirs touched>
RiskTags: <reputation|a11y|data-loss|none>
UserImpact: <low|medium|high>
Rollback: <easy|moderate|hard>
Constraints: per-domain scoping; no held-carryover action without operator sign-off; carryover verbatim
Request: Return EXECUTE, CONSIDER, or REJECT with mitigations.
LIRIL_GATE_END
```

## Carryover

Yes the entire govt and social apparatus all of the corruption
