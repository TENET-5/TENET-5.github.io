# THE GUIDED RECORD — Director System Spec v1

*A long documentary of the Canadian public record, narrated by LIRIL, assembled from short sourced beats + generated b-roll. This spec turns four research tracks (attention/retention, narrative structure, documentary ethics, credibility mechanics) into machine-usable rules a director tool can execute.*

**Design axiom:** The audience *can* watch for hours (long-podcast/binge behavior proves it) but *will leave the instant relevance lapses*. We are not fighting a shrunken attention span (the "8 seconds / goldfish" claim is false — traced to an unsourced Statistic Brain footnote, BBC 2017). We are fighting a **switch-tolerance** that fires roughly every 40–75 seconds (Gloria Mark, UC Irvine screen-logging). The whole engine below is built to give the viewer a fresh, concrete reason to stay inside that window — using only true material, sequenced honestly.

---

## 1. THE RETENTION ENGINE

### 1.1 The atomic unit — the 4-slot BEAT

Every micro-beat is self-contained (survives out of context) and completes one loop internally, while emitting exactly one **residue question** the next beat inherits.

| Slot | Budget | Rule |
|---|---|---|
| **HOOK** | delivered in first ≤15s of the beat | Open on a concrete verified artifact — the document, the exact quote, the date. Poses **one specific answerable question** (information-gap theory, Loewenstein 1994; vague mystery does *not* create curiosity). |
| **CONTEXT** | ≤25% of beat runtime | Just enough orientation to make the gap *felt* and to pass the filter (what is this / why it matters / why trust it). Pre-teach essential actors + terms *before* the dense evidence, never during (Mayer segmenting + pre-training). |
| **TENSION** | 1 per beat, exactly | One complication, contradiction, or stake. Two tensions = split the beat. |
| **RESOLUTION** | closes the hook's literal question | A real payoff, at least as strong as the hook implied. Its closure exposes the residue question for the next beat. |

**Reject a beat if:** its hook question is never answered inside the beat *and* not explicitly tagged `defer_to: <beat_id>`; or context exceeds 25%; or it has two tensions; or the resolution is weaker than the hook promised.

### 1.2 Re-hook cadence (relevance heartbeat)

Never let a 60-second stretch pass with nothing new. Cadence *relaxes as narrative transportation deepens* — story that absorbs needs fewer external hooks (Green & Brock):

| Runtime zone | Re-hook interval | What counts as a re-hook |
|---|---|---|
| **0–3 min** (kill zone) | every ~30s | new named fact, new document on screen, new question |
| **3–15 min** | every 60–90s | as above, or a mode change |
| **>15 min** | per-chapter (one meso hook per 8–15 min) | transportation carries it; hooks become structural |

**The nose (first 30–60s) is the kill zone.** ~Half of viewers leave in the first minute on average videos; a >30% drop in the first 30s = a failing intro. So:
- Open cold on the single most arresting *verified* item in the whole record, on screen within 10 seconds.
- State explicitly what the film will show and prove, and show sourcing on screen (pass the credibility filter fast).
- **No** logo stings, no slow drone establishing shots, no theme music longer than ~5s before substance.

### 1.3 Pattern interrupts = MODE changes, not jump cuts

Every 3–5 minutes, change the **processing mode**, not just the shot (Ariga & Lleras 2011 — a brief goal switch resets the vigilance decrement). Rotate: narration-over-documents → on-screen timeline → location footage → verbatim audio/reading → map. **Each mode shift must carry story information.** Ban interrupts that are pure stimulation (random b-roll, loud stingers).

Constraint (from track 2): no more than **3 consecutive beats of the same type**; no more than **2 consecutive beats at intensity ≥4**; insert a breather beat (intensity ≤2) after every climax.

### 1.4 Nested open loops — the loop ledger

Run exactly two loops the viewer can name at any timestamp: **the spine** (film-level) + **the current chapter question** (meso). Micro loops live inside beats.

- **1 macro loop** — opened in the first 3 minutes, closed only in the final act. It is the film's single genuinely strong central question, decomposed into N sub-questions (one per chapter). *If the material yields fewer real sub-questions than the runtime needs, SHORTEN THE RUNTIME — never pad.*
- **1 meso loop per chapter** — closed within that chapter or the next.
- **micro loops** — close within 2 beats.
- **Invariant:** at any moment **2–4 loops open**, never 0 (dead air / exit) and never >5 (confusion / reads as evasive). A loop opened and never closed is a **build error**.

Every loop is logged: `{id, tier: macro|meso|micro, artifact_named, open_ts, planned_close_ts, paid: bool}`.

**The honest mechanism is resumption, not "open loops stick."** (The Zeigarnik memory effect failed a 2025 meta-analysis; the Ovsiankina *resumption* effect held.) So interrupt AT a concrete moment — "the letter was opened on the 14th — first, who sent it?" — so the viewer *wants to resume*, then **always resume**.

### 1.5 Chapter + act architecture

**Chapters:** 8–15 minutes, each a complete mini-arc with its own cold open, meso question, climax, and payoff. Each chapter must pass:
- **Standalone test** — a viewer starting there gets hook + enough context + climax + payoff.
- **Serial test** — it changes the *state* of the macro question (advances, complicates, or reframes it). A chapter that only entertains without moving the spine is cut or merged.

**Cold open (film-level and per chapter):** 30–90s assembled from the single highest-intensity beat that occurs *later* in that unit, cut at its tension peak before resolution, then rewind. Logged as a loop with a **guaranteed close** — the excerpted moment must play in full, in context, before the unit ends. A cold open drawn from material that never appears later is **forbidden** (bait-and-switch red line).

**Macro acts across chapters:**
- **Act 1 (≤20% runtime):** establish the world; **macro question locked** by the end.
- **Act 2:** escalate through complications. At **~50% runtime, a designated `reframe_beat`** — schedule the *second-strongest* revelation here (Wistia: survivors past the midpoint are the most invested; the midpoint must be a peak, not a valley). Its resolution must genuinely change the meaning of prior chapters.
- **Act 3:** convergence and payoff only — **no new context-only beats.** Chapter climaxes trend upward across acts (each act's peak ≥ previous; final act highest).

Default event order is **chronological** (chronology is the compass — and chronology is evidence, §3). Any departure is visibly signposted on screen ("three weeks earlier").

### 1.6 Chapter-boundary handoff (honest cliffhanger)

The final beat of every chapter must (a) close the chapter's meso loop *and* (b) open the next chapter's meso loop in its last ~30s — phrased as a question the just-delivered answer makes urgent ("resolution-that-opens").

**Stall detector (blocking):** if a chapter ends mid-beat on a question whose payoff arrives in the first <60s of the next chapter and required no intervening material, it is an artificial stall — restructure. Announce late-film payoffs early ("at the end you'll see the full filing") so survivors have a destination.

### 1.7 LIRIL — the connective tissue

LIRIL is the consistent guide that makes independently-produced beats feel like one authored work (Burns: narration is the "skeletal structure"). LIRIL owns exactly four fixed slots and nothing else:
1. Cold-open framing line.
2. **Seam lines** at every chapter boundary — restate the macro question in ≤2 sentences using the *newest* information.
3. **Orientation lines** on any time/place/thread jump.
4. The **final synthesis** (a factual summary + a question — never a verdict, see §3).

LIRIL diegetic rules: consistent persona/diction across all beats; **never delivers a beat's payoff for it** (beats own their resolutions); and **tags epistemic status on every factual claim** — "we know" / "the record suggests" / "this is unverified."

### 1.8 Audio-first mandate

Much long-form "viewing" is second-screen listening. The film must be **fully comprehensible by audio alone** — visuals are evidence, not the sole carrier of meaning. Publish chapter markers/timestamps: a viewer who can navigate trusts you and returns; total recap content <5% of runtime.

---

## 2. THE IMPACT RULES — make sourced facts land hard, without manipulation

The line: **emotion from true facts is craft; emotion as a substitute for evidence is manipulation.** Truthfulness has two duties — *accuracy* (each fact correct) and *sincerity* (the cut doesn't cause a false belief). A film can be 100% literally accurate and still lie by implying false causation (the NBC/Zimmerman 911 edit: every word real, meaning inverted).

**I1 — Anchor every emotional beat to an on-screen fact.** The document, testimony, or footage that earns the emotion must be visible/audible *at that moment*. **The subtraction test:** remove the fact — if the scene still "works" emotionally, it runs on manipulation. Cut or re-anchor.

**I2 — Show the receipt, not the paraphrase.** Never narrate a document you can show. Sequence: **full page (≥2s, legible) → zoom to the operative line → highlight.** Narration reads the *exact* words. If the document contradicts the narration in any nuance, recut the narration. When the document appears, it is the *only* thing competing for working memory: drop or duck music, hold long enough to read twice, one document-claim per screen (Mayer coherence/signaling).

**I3 — Understatement + receipts beats outrage.** For the most damning facts: **state plainly, show the document, hold the silence, do not underline** with narration or a sting. The viewer completing the judgment themselves produces more durable conviction (Spotlight / The Thin Blue Line method). Reserve the film's biggest emotional swings for **human consequences** (victims, costs), not for characterizing the accused.

**I4 — Precise, neutral, quantified verbs.** "Signed," "received $1.2M," "voted against," "declined to answer." Adjectives must be earned by a number or a document in the same sentence. Loaded language *weakens* impact with skeptical audiences — neutral verbs + damning documents read as authoritative; epithets read as advocacy.

**I5 — The MUTE TEST (picture lock).** Watch every accusatory scene with score removed. If the scene's factual claim collapses without the music, the music is doing evidentiary work — recut. Score may raise stakes on *proven* facts; it may never characterize *unproven* ones.

**I6 — Story, not a gallery of exhibits.** Cut the record as a chronological story with human protagonists and stakes, where **each document is a plot event that changes what a character knows or can do.** Test each segment: *does this change what happens next?* If not, it moves to the companion post/appendix.

**I7 — Point indignation at specifics, never at menace.** Every emotional peak targets a specific documented act by a specific named actor with a specific remedy or open question (anger reduces systematic processing — accountability film should make viewers *precise*, not furious). A sequence that generates dread without adding a checkable fact is atmosphere doing argument's job: cut it or attach the fact.

**I8 — Label every reconstruction at first frame.** On-screen label for every reenactment, generative/AI image, composited shot, and voice synthesis, *at the moment it plays* — not just in credits (the Roadrunner synthetic-Bourdain case is the canonical failure). Archival carries accurate dates; footage from another time/place never stands in as "the event" without a label.

---

## 3. THE OBJECTIVITY GUARDRAIL — the hard per-beat checklist

**This is the same legal safe harbor already standing on the site: public officials' public acts, sourced facts only, no accusation of criminality against any individual absent a court finding.** NYT v. Sullivan protects reporting on officials' official conduct; fair-report privilege covers accurate accounts of official proceedings; the document — not the filmmaker — makes the claim. Every beat must pass **all** gates before it can enter assembly. A failure is a **blocking defect, same severity as a factual error.**

- [ ] **G1 — Subject gate.** Is the subject a public official/figure, and is this their public/official act? If no → the beat is cut or rebuilt on public records only. No private individuals' private conduct; no personal/legal material. *(mirrors the site's standing scope rule)*
- [ ] **G2 — On-screen source.** Every factual claim carries a visible citation *in the same shot*: `SOURCE: [document title, date, public locator]`. If it can't be sourced on screen, it doesn't ship.
- [ ] **G3 — Provenance.** Each load-bearing document carries a provenance line: "Obtained via [FOIA #/docket #/published source], retrievable at [public locator]." Evidence that can't be publicly retrieved is corroboration only, never the load-bearing proof.
- [ ] **G4 — Calibrated language / banned verbs.** No **guilty, criminal, lied, fraud, corrupt** unless quoting a court's own finding *with citation*. Approved formulations by document type: filings → "alleges"; sworn testimony → "testified"; conviction → "was convicted of X on [date], [court], [docket]"; conflicting records → "the two statements cannot both be true."
- [ ] **G5 — Fact / inference / opinion labeled in distinct registers.** **FACT** = document on screen + citation (neutral frame). **INFERENCE** = distinct color/frame + a hedged verb in the narration itself ("suggests," "is consistent with"). **OPINION** = a named talking head with affiliation, *never* voice-of-god. No sentence ships uncolored; no inference ships wearing fact's clothing.
- [ ] **G6 — No individual crime accusation.** Culpability is never stated by the film. Criminality appears only as "convicted of X, [court], [date], [docket]" or "charged with X — charges are allegations."
- [ ] **G7 — Right of reply.** Every significant allegation shows a documented, good-faith request for comment: request date(s), channel, exact question, and the verbatim reply — or the on-screen card "X declined to comment / did not respond to N requests over M weeks." **Steelman:** present the accused's strongest genuine defense *before* rebutting it, and only rebut with on-screen evidence; if it can't be refuted, the beat says so.
- [ ] **G8 — No card-stacking.** Any genuine exculpatory or materially complicating evidence the team possesses must appear in the film. Before lock, a **red-team pass** (a person assigned to break the film) surfaces the most damaging counter-fact / least convenient date range / best opposing statistic; the film addresses the strongest on screen.
- [ ] **G9 — Edit integrity.** No frankenbiting: an answer appears only attached to the question that elicited it; cutaways/reactions come from the same exchange or are tonally neutral. Cuts checked against the full transcript by someone who did not make the cut. Chronology reorderings labeled on screen.
- [ ] **G10 — No guilt-by-juxtaposition.** Every cut implying a causal/associative link between subject and event/image has a documented evidentiary basis for *that specific link*, logged in the fact-check sheet. "It's just B-roll" is not a defense — B-roll asserts (Kuleshov).
- [ ] **G11 — Uncertainty disclosed.** Repetition budget by claim tier: **T1** document-proven (may recur as motif) / **T2** multi-source testimony (recurs *with attribution each time*) / **T3** single-source/contested (stated **once**, attributed, flagged unverified). Every act closes with an on-screen **OPEN QUESTIONS** card. *(Communicating uncertainty costs little trust — van der Bles 2020, PNAS; overclaiming that is later punctured is catastrophic.)*
- [ ] **G12 — Belief test.** Write the belief an average viewer walks away with after this cut. If that belief is not independently verifiable as true, re-edit — regardless of whether each shot is authentic.

**Ship-blocking companion requirement:** the film does not publish without the **companion evidence page** — every cited document downloadable, extended transcripts, a methods note, a version number + dated corrections log (live from day one). The film's end card points to it. **No claim in the film may lack a matching entry on that page.** Any verified error triggers a re-cut of the affected claim within a fixed SLA, logged publicly.

---

## 4. THE BEAT SCHEMA (machine-usable)

The director tool emits an ordered array of beats. Fields the tool consumes to build the shot/beat sequence, plus the guardrail metadata that makes each beat auditable. **A beat that fails validation cannot enter the ordering stage (§5).**

```json
{
  "beat_id": "c3-b07",
  "chapter": 3,
  "act": 2,
  "type": "document | timeline | location | verbatim_audio | map | talking_head | reframe",

  "hook": "A two-line email dated March 9 contradicts the minister's public account.",
  "hook_question": "Who sent it, and what did it say?",
  "claim": "On 2021-03-09, Deputy X emailed that the funds were already committed.",
  "claim_tier": "T1 | T2 | T3",
  "epistemic_mode": "fact | inference | opinion",
  "narration_verb": "emailed",

  "source_url": "https://records.example.ca/foia/2021-00842/p14",
  "source_citation": "FOIA 2021-00842, p.14, released 2022-06-01",
  "provenance": "FOIA request #2021-00842; retrievable at open.canada.ca",
  "evidence_type": "primary_document | sworn_testimony | court_finding | dataset | published_report | archival_footage",

  "broll_shot": "Full email page, hold 2.5s legible -> zoom to operative line -> highlight",
  "broll_generated": false,
  "broll_label": null,

  "dwell_seconds": 22,
  "intensity": 4,

  "rehook": "But the email names a second recipient the minister never disclosed.",
  "residue_question": "Who was the second recipient?",

  "loops": {
    "opens": ["meso:c3-secondrecipient"],
    "closes": ["micro:c3-b06-who-sent"],
    "defer_to": null
  },

  "reply": {
    "requested": true,
    "date": "2026-05-02",
    "channel": "email + registered letter",
    "question_asked": "Did you approve the March 9 commitment?",
    "response": "no response as of 2026-06-10",
    "steelman": "The commitment may have been provisional pending cabinet sign-off."
  },

  "guardrail": {
    "subject_is_public_official_act": true,
    "on_screen_source": true,
    "banned_verb_check": "pass",
    "fact_inference_opinion_labeled": true,
    "individual_crime_accusation": false,
    "juxtaposition_basis": null,
    "mute_test": "pass",
    "belief_test": "Viewer believes: an internal email predates the public account. (verifiable: true)",
    "redteam_counterfact": "Provisional-commitment reading addressed in c3-b09"
  }
}
```

**Director-tool contract:**
- `dwell_seconds` for a document beat must be long enough for the operative line to be read twice (tool enforces a min based on line length).
- `broll_generated: true` **requires** a non-null `broll_label` (G-label at first frame) or the beat is rejected.
- `claim_tier: "T3"` caps the claim to one occurrence across the whole film (repetition budget).
- `loops.opens`/`loops.closes` feed the loop ledger; an `opens` with no eventual `closes` (and no acknowledged OPEN QUESTIONS entry) is a build error.
- `epistemic_mode` selects the on-screen visual register (G5).
- Any `guardrail.*` field that is `false`/`fail` where a pass is required makes the beat **non-orderable** (excluded from §5 until fixed).

---

## 5. WHERE THE ISING / QUBO OPTIMIZER LEGITIMATELY FITS

**Honest scoping first:** the optimizer does **not** decide *what is true*, *what the payoff is*, or *whether a beat is ethical*. Those are §3 gates and human judgment. All the deception red lines are hard constraints resolved *before* the optimizer ever runs. The optimizer only reorders **already-validated, guardrail-passing beats** to best approximate a target retention curve under hard structural constraints. That is a genuine combinatorial sequencing problem — not hand-waving.

### 5.1 Why this is a real combinatorial problem

We have N validated beats. We want a permutation (with some beats pinned) that:
- keeps the re-hook heartbeat (§1.2) satisfied everywhere,
- respects loop nesting (a loop's close must follow its open; ≤4 open at once),
- respects intensity/type-run limits (no >2 consecutive intensity-≥4; no >3 same type; breather after each climax),
- puts the second-strongest revelation at ~50% and the strongest in Act 3,
- and keeps chronology as the default, penalizing unsignposted time inversions.

Naive permutation space is N! — for a multi-hour film with hundreds of beats, exact ordering is intractable. Pairwise "beat A should precede/adjoin beat B" preferences plus binary "open/closed loop at position i" states map cleanly onto a **QUBO** (quadratic unconstrained binary optimization) / **Ising** energy function, which is exactly the form our classical GPU state-vector QUBO solver (`qising.exe` / `qserve` `ising` pipeline) already handles.

### 5.2 The formulation

Binary variables `x[b,p] = 1` if beat `b` occupies slot `p`. Energy `H` = **hard-constraint penalties (large λ)** + **soft objective (retention shaping)**:

**Hard constraints (penalty terms, λ → large):**
- **One-hot:** each beat in exactly one slot, each slot one beat (`Σ_p x[b,p] = 1`, `Σ_b x[b,p] = 1`) — the standard permutation encoding.
- **Loop precedence:** for every loop, close-slot > open-slot (penalize inversions).
- **Loop concurrency ≤4:** penalize any slot where the count of (opened-but-not-yet-closed) loops exceeds 4 or hits 0.
- **Pins:** cold-open excerpt beats, the `reframe_beat` at ~50%, Act-3-only convergence beats fixed to their slot windows.
- **Micro/meso lag:** penalize a micro loop whose close is >2 beats after open, or a meso loop crossing >1 chapter boundary.

**Soft objective (what we minimize distance to):**
- **Retention-curve fit.** We hold a *measured* target curve — the retention graph of comparable long-form videos (NOT a goldfish assumption). Each slot has a modeled "hold probability" contribution from the beat placed there (its intensity, novelty vs. neighbors, mode-change bonus). The objective penalizes squared deviation from the target hold curve — pushing high-novelty/high-intensity beats into the empirically weak zones (nose, pre-midpoint sag, the >30-min drop).
- **Heartbeat smoothness.** Penalize any 60s window with no "new" event (new fact/document/question/mode).
- **Escalation.** Reward chapter peaks that trend upward across acts.
- **Chronology prior.** Small penalty per out-of-order pair, so the solver keeps chronological order unless a retention gain clearly justifies a (then-signposted) inversion.

### 5.3 The pipeline

1. Director tool emits validated beats (§4). Non-orderable beats excluded.
2. Build the weight matrix (precedence prefs, intensity, type, novelty, loop graph, pins) → QUBO/Ising matrix.
3. Solve on the existing classical GPU state-vector QUBO path (`qserve` over the `<<QASK>>` pipe). **KP41-safe:** check `nvidia-smi` first; a solve is a short burst, never sustained-max both cards.
4. Decode the permutation → candidate cut order.
5. **Human + guardrail re-audit** the candidate: run the loop-ledger audit (100% of opened loops closed or acknowledged on screen), the stall detector, and a promise-to-payoff lag check. The optimizer's output is a *proposal*, never a lock.

### 5.4 Where it must NOT be used (honesty guard)

- It may not "optimize watch time" by stretching a 40-minute story to 3 hours — runtime is capped by real sub-question count (§1.4); padding is a red line and retention curves punish it anyway.
- It may not reorder real events into a false causal sequence — chronology inversions are penalized *and* any it does propose must be signposted on screen; an unsignposted inversion is a hard-constraint violation, not a tunable cost.
- It may not move a beat out of the context slot it needs (pre-teaching before dense evidence is a pin, not a soft preference).
- Its retention target is a *measured* curve of comparable films, and the tuning weights are logged — no fitting against an invented "8-second" model.

**Bottom line:** the Ising/QUBO layer earns its place as a constrained sequencer over a pre-cleaned, ethics-passed beat set — real math on a real N! problem — while every claim of truth, every payoff, and every guardrail stays outside it, owned by the schema gates and human review.