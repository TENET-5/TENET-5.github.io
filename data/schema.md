# TENET-5 Accountability Data Spine — Schema

**Last verified:** 2026-04-27
**Quantum gate:** LIRIL [4,0]=20 admit · CONSIDER with M1–M19
**Scope:** Public officeholders and documented public events only. No private persons.

This file documents the three JSON shapes consumed by the planned interactive pages
(`appointments-registry.html`, `nepotism-graph.html`, `appointment-concentration.html`,
`federal-watch.html`). All consumer pages MUST treat these files as read-only and
MUST NOT compute editorial labels client-side (mitigation **M18**).

---

## 0 · Source-or-omit invariant (M14)

Every record in `entities.json`, `appointments.json`, and `edges.json` MUST contain a
non-empty `sources` array. Each source is an object:

```json
{
  "url":           "https://...",            // primary public source ONLY
  "type":          "order_in_council|gazette|hansard|press_release|court_docket|registry|departmental_report|coroner|fOI|elections_canada",
  "retrieved_utc": "YYYY-MM-DDTHH:MM:SSZ"
}
```

**A record with zero verifiable sources MUST be omitted at build time.** It MUST NOT
ship with a TODO marker. Source-or-omit is a hard schema constraint, not a convention.

Allowed primary-source domains (suffix match):

- `canada.ca`, `gc.ca`, `ourcommons.ca`, `sencanada.ca`, `parl.ca`
- `orders-in-council.canada.ca`, `gazette.gc.ca`
- `oag-bvg.gc.ca`, `ombudsman.canada.ca`, `cba.ca/lawsocieties` (federation index only)
- `elections.ca`, `lobbycanada.gc.ca`, `ised-isde.canada.ca`
- Provincial: `*.gov.ca`, `*.gc.ca` provincial subdomains, provincial coroner services
- Court dockets: `decisions.fct-cf.gc.ca`, `decisions.scc-csc.ca`, `canlii.org`
- News-media URLs are NOT primary sources for entity/appointment records and are
  permitted only as supplementary `type: "press_release"` when an official mirror does
  not exist; they must point to the originating outlet, not aggregators.

---

## 1 · `entities.json` — actors (MATRIX [1,1] · A)

```json
{
  "version": 1,
  "generated_utc": "ISO-8601",
  "entities": [
    {
      "id":             "ent_<short_kebab>",       // stable, never reused
      "name":           "Full Name",
      "role":           "Office Title",            // current or most recent public role
      "office":         "Body / Department",
      "appointed_by":   "ent_<id>|null",           // resolves to another entities.json id
      "term_start":     "YYYY-MM-DD|null",
      "term_end":       "YYYY-MM-DD|null",          // null = no public end-date on record (M19)
      "sator_coord":    [r, c],                    // 0..4, 0..4
      "tags":           ["judicial"|"oversight"|"executive"|"law_enforcement"|"crown"|"regulator"|"foreign_state"],
      "sources":        [ /* M14 — min length 1 */ ]
    }
  ]
}
```

**Rules:**

- `id` is immutable. If a person changes office, create a new `appointments.json` event,
  not a new entity.
- `appointed_by` MUST resolve to an existing `entities.json` id, or be `null` (e.g.
  for elected MPs, party-elected leaders, or Constitutional offices).
- `tags` are structural classifiers, not editorial verdicts.
- `sator_coord` places the entity on the 5×5 grid for consumer-page layout. It is
  advisory; consumers may relayout.

---

## 2 · `appointments.json` — events (MATRIX [2,2] · T/N-center)

```json
{
  "version": 1,
  "generated_utc": "ISO-8601",
  "appointments": [
    {
      "id":             "apt_<short_kebab>",
      "entity_id":      "ent_<id>",                // resolves to entities.json
      "office":         "Office Title",
      "body":           "Body / Department",
      "event_date":     "YYYY-MM-DD",              // date of OIC, swearing-in, or Gazette
      "event_type":     "appointment|reappointment|interim|resignation|removal|term_extension",
      "oic_number":     "PC YYYY-NNNN|null",
      "appointed_by":   "ent_<id>|null",
      "sources":        [ /* M14 */ ]
    }
  ]
}
```

**Rules:**

- Multiple appointments per entity are expected (career trajectory).
- `oic_number` SHOULD be filled when the appointment was made by Order in Council;
  use the orders-in-council.canada.ca search portal to verify.
- `event_type` enum is closed; new types require a fresh LIRIL pass.

---

## 3 · `edges.json` — relations (MATRIX [3,3] · O)

```json
{
  "version": 1,
  "generated_utc": "ISO-8601",
  "edges": [
    {
      "id":     "edg_<short_kebab>",
      "from":   "ent_<id>",                        // M15 — both endpoints public office
      "to":     "ent_<id>",
      "type":   "appointed_by|spouse_of_public_record|professional_supervised|party_donation_disclosed",
      "since":  "YYYY-MM-DD|null",
      "until":  "YYYY-MM-DD|null",
      "amount_cad": null,                           // only for party_donation_disclosed
      "notes":  null,                               // structural only; no editorial language
      "sources": [ /* M14 */ ]
    }
  ]
}
```

**Hard constraints (M15, M16):**

- Both `from` and `to` MUST resolve to `entities.json` ids whose `role` is a public
  office. **No private-person nodes may be referenced even transitively.**
- `type` allowlist is closed. The four permitted types are exhaustive. Adding a fifth
  type requires a fresh LIRIL [4,0] pass and a corresponding mitigation.
- `spouse_of_public_record` is admissible only when both endpoints independently hold
  public office.
- `party_donation_disclosed` requires an Elections Canada registry URL in `sources`
  and the `amount_cad` field populated.
- `professional_supervised` requires a documented reporting line (org chart, Hansard
  testimony, departmental report) — never inferred mentorship.

---

## 4 · `quantum_provenance.jsonl` — LIRIL admit ledger (MATRIX [4,0] · R)

Append-only JSONL. Never rewritten or compacted (M17). One line per build pass:

```json
{
  "ts_utc":       "ISO-8601",
  "directive_id": "build-<kebab>",
  "verdict":      "EXECUTE|CONSIDER|REJECT",
  "sator_coord":  [4, 0],
  "files":        [{"path": "data/entities.json", "sha256": "..."}],
  "mitigations":  ["M1", "M2", "..."],
  "notes":        "freeform structural note (no editorial)"
}
```

The provenance JSONL is the audit chain. Future builds append; consumers verify by
reading the last entry whose `files` array contains the artifact they consume.

---

## 5 · Consumer page contract (M18, M19)

Pages that read this data MUST:

1. Render the JSON facts only. No client-side computation of editorial tags such as
   "suspicious", "cronyism", "captured", or color-codings that imply criminal intent.
2. Render `term_end: null` as `—`, never as `present` or `current`. The user infers.
3. Honor the right-of-reply contact `corrections@tenet-5.example` on every page that
   surfaces a named individual.
4. Display `last_verified_utc` from `quantum_provenance.jsonl` last entry.
5. Never fetch from third-party domains at runtime. All data is local.

---

## 6 · Closed enums (single source of truth)

```
entities.tags   = judicial | oversight | executive | law_enforcement | crown | regulator | foreign_state
appointments.event_type = appointment | reappointment | interim | resignation | removal | term_extension
edges.type      = appointed_by | spouse_of_public_record | professional_supervised | party_donation_disclosed
sources.type    = order_in_council | gazette | hansard | press_release | court_docket | registry | departmental_report | coroner | fOI | elections_canada
```

Any enum extension requires a fresh LIRIL [4,0] pass.
