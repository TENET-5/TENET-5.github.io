# Intelligence Brief — Quantum Subagent OSINT Synthesis

**Filed:** 2026-07-10  
**Product:** Subagent read-only synthesis (no new collection)  
**JSON:** `data/osint_laps/subagent_osint_synthesis_last.json`  
**Standard:** Public corpus only. **FACT / REPORTING / SOCIAL_SIGNAL / INFERENCE** labeled. Inclusion ≠ criminal finding.

---

## Situation (INFERENCE)

Canadian political info-domain contest remains **dual-vector 5GW**: state-funded institutional amplifier (**Domain A**) versus CPC-centered X-first mesh (**Domain B**). **Domain C** (foreign FI) is commission-solid but collection-starved until FITR opens **2026-08-04**. Highest-yield residuals are **falsifiable public records and hard archives**, not more amplifier hunting.

---

## 1. Top 5 collection targets (falsifiability × impact)

| Rank | Target | f×i | Domain | Why |
|------|--------|-----|--------|-----|
| **1** | Hard-archive CPAC `PllLWKW56RA` + CBC as-aired window (cutaway case) | **0.86** | A+D | Side-by-side timestamps can **falsify or sustain** 55m30s vs ~17m30s claims |
| **2** | CBC MAID digital **N≥100** voice/frame code 2020–2024 | **0.81** | A+F | Population-scale stake; H1 still **UNTESTED_RATIO** |
| **3** | CBC board/CEO **Order-in-Council** numbers + bio crosswalk | **0.70** | A | GIC control surface; seed exists, OIC residual |
| **4** | **Elections Canada** top CPC donors 2023–2025 network | **0.64** | B | Closes finance gap on Domain-B apex without private data |
| **5** | **NLT1 / ISO** sting production chain (contracts/ATIP-class) | **0.66*** | D+A | Corp/BN already **FACT**; residual is primary production docs |

\*Raw f×i slightly above #4; ranked #5 because FACT base already frozen — prefer EC next for Domain-B gap.

### Anchors already in corpus

- **FACT (corp):** NLT1 PRODUCTIONS INC. — corp `16736955`, BN `719014623RC0001`, director Ryan Moccasin  
- **SOCIAL_SIGNAL:** Poilievre sting post ~192k views; Lantsman cutaway ~89k; @cbcwatcher minute audit chain  
- **FACT (commission):** Hogue PRC principal; Chong = FI **target**  
- **FACT:** FITR office open date 2026-08-04; **0** registrations as of 2026-07-10  

---

## 2. Domain status

### Domain A — State media / regulated info stack  
**Status:** STRUCTURAL_ACTIVE  

| Solid | Level |
|-------|-------|
| CBC appropriation ~$1.3–1.4B class; ~70% gov revenue class; GIC appointments | **FACT** |
| Heritage = funding principal | **FACT** |
| Cutaway dispute + named personnel + CPAC URL vaulted | **SOCIAL_SIGNAL** + cited primary |

**Open:** SHA256 hard vault; OIC numbers; MAID N≥100.  
**Read (INFERENCE):** Highest structural weight (envelope raw **38**). Collect records, not vibes.

### Domain B — CPC + independent mesh  
**Status:** GRAPH_COMPLETE / FINANCE_PARTIAL  

| Solid | Level |
|-------|-------|
| 17 nodes / 17 edges; handles resolved (incl. Barrett, Gunn) | **FACT** (public handles) |
| X-first bypass + ranked amplifiers | **SOCIAL_SIGNAL** |
| Atlas membership + Veldhuis dual-role | **FACT**; grant $ = **REPORTING** secondary |

**Open:** EC top-N donors; lobbying dossiers; Bluesky; T3010/990 line items.  
**Read (INFERENCE):** Social graph mature; money/lobbying thin. Counter-frame (@SpencerFernando) correctly retained.

### Domain C — Foreign interference  
**Status:** STRUCTURAL_THREAT / COLLECTION_STARVED  

| Solid | Level |
|-------|-------|
| Hogue: PRC principal; anti-CPC campaign indications | **FACT** (commission) |
| Chong intimidation target | **FACT** |
| FITAA enacted; FITR pre-op until 2026-08-04; 0 regs | **FACT** |
| Hogue vs over-strong NSICOP “traitors” framing | **FACT** (commission divergence) |

**Open:** First FITR entries; classified NSICOP names (**do not invent**).  
**Read (INFERENCE):** Real risk, lower near-term pull yield than A/B hard records. Watch date is hard gate.

**Domain D (note):** Sting/hybrid enforcement — FACT base solid (NLT1/NPF); hard video residual shared with Domain A.

---

## 3. Contradictions / weak claims

| ID | Severity | Issue |
|----|----------|-------|
| **W1** | HIGH | Cutaway still social-audit class — not hard archive / CRTC adjudication |
| **W2** | HIGH | MAID framing thesis ahead of sample; 2026 multi-voice pieces may weaken simple asymmetry claims |
| **W3** | MED | Atlas membership ≠ control; MLI cites &lt;1% revenue; secondary $ classes |
| **W4** | MED | Yes Men / Igor Vamos = **REPORTING** only |
| **W5** | MED | Bell/CTV ~$40M regulatory-relief class needs primary CRTC/ISED anchor |
| **W6** | LOW | Engagement scores are lap-relative, not population ranks |
| **W7** | LOW | NSICOP vs Hogue must stay dual-cited — no collapse into “witting MPs” |
| **W8** | LOW | Graph dangling stubs (CTV_Bell_class, PRC_FI, NLT1_sting) |
| **W9** | INFO | FITR zero regs expected pre-open — not proof of zero FI |

---

## 4. Next 3 public-record pulls (exact)

1. **CPAC hard archive**  
   - URL: https://www.youtube.com/watch?v=PllLWKW56RA  
   - Action: offline capture + **SHA256** into `osint_vault`  
   - Pair: CBC air log / ombudsman when public  

2. **CBC board OIC**  
   - Registry: https://orders-in-council.canada.ca/  
   - Search: CBC / Radio-Canada board & CEO appointments  
   - Crosswalk: CBC governance board public list  

3. **Elections Canada CPC finance**  
   - Portal: https://www.elections.ca/content.aspx?section=fin&document=index&lang=e  
   - Action: party + EDA returns; top individual/association contributors **2023–2025**  

**Deferred (scheduled):** FITR re-check after **2026-08-04** · CRA T3010 + Atlas 990 schedules · MAID N≥100 coding project.

---

## Route bias (honored)

Prefer **high-falsifiability public-record** pulls over social pile-on expansion. Overlap preferred: cutaway hard proof · MAID voice ratio · board appointment surface.

---

## Source corpus

- `data/cpc_cbc_5gw_influence_analysis_2026-07-10.json`  
- `data/cpc_media_political_graph.json`  
- `data/osint_laps/quantum_osint_decision_envelope.json`  
- `data/atlas_fraser_funding_crosswalk_2026-07-10.json`  
- `data/osint_vault/cbc_poilievre_presser_cutaway_2026-06.json`  
- `data/maid_cbc_framing_content_audit_seed.json`  
- `data/fitr_public_status_2026-07-10.json`  

---

**Status:** DONE_WITH_CONCERNS — synthesis only; hard vault / N≥100 / FITR live still open.
