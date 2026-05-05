# Cross-Link Anchor Audit — 6 Pillar Pages

**Goal:** `site_xlink_audit_1777669473`
**Run:** 2026-05-04
**Method:** AST-grade extraction via BeautifulSoup; for every `<a href>` containing a fragment, verify the target file exists and contains `id="<frag>"` or `name="<frag>"`. Skips JS template literals, `data:`/`mailto:`/`tel:` URIs, and external `http(s)` links.

## Pages audited

1. `enforcement-followthrough.html`
2. `lobbying-ledger.html`
3. `ag-findings.html`
4. `corruption.html`
5. `carney-conflicts.html`
6. `financial-crime-policy-2026.html`

## Result

**0 broken anchors / 14 fragment refs verified across 6 pillar pages.** All cross-page anchors resolve to live `id` targets in the destination files. All same-page TOC and skip-links resolve. Audit clean.

| # | Source | Target file | Anchor | Link text | Status |
|---|---|---|---|---|---|
| 1 | enforcement-followthrough.html | (self) | `#main` | Skip to main content | OK |
| 2 | lobbying-ledger.html | (self) | `#main` | Skip to main content | OK |
| 3 | lobbying-ledger.html | enforcement-followthrough.html | `#recent-posture-2026-04` | enforcement-followthrough.html — Recent posture (April 2026) | OK |
| 4 | lobbying-ledger.html | ag-findings.html | `#ag-investigation-requests` | ag-findings.html — Pending AG-Investigation Requests | OK |
| 5 | ag-findings.html | (self) | `#main` | Skip to content | OK |
| 6 | corruption.html | (self) | `#main` | Skip to content | OK |
| 7 | carney-conflicts.html | (self) | `#main` | Skip to main content | OK |
| 8 | carney-conflicts.html | panama-papers.html | `#quantum-analysis` | Full offshore analysis | OK |
| 9 | financial-crime-policy-2026.html | (self) | `#main` | Skip to main content | OK |
| 10 | financial-crime-policy-2026.html | (self) | `#crypto-atm-ban` | Federal crypto-ATM ban | OK |
| 11 | financial-crime-policy-2026.html | (self) | `#federal-financial-crime-agency` | Federal financial-crime police agency | OK |
| 12 | financial-crime-policy-2026.html | enforcement-followthrough.html | `#recent-posture-2026-04` | enforcement-followthrough.html | OK |
| 13 | financial-crime-policy-2026.html | lobbying-ledger.html | `#recent-policy-2026-04` | lobbying-ledger.html | OK |
| 14 | financial-crime-policy-2026.html | ag-findings.html | `#ag-investigation-requests` | ag-findings.html | OK |

### Substantive cross-page anchors (the ones that matter for spine integrity)

| Anchor | Located in | Confirmed `id` present |
|---|---|---|
| `#recent-posture-2026-04` | enforcement-followthrough.html | yes |
| `#recent-policy-2026-04` | lobbying-ledger.html | yes |
| `#ag-investigation-requests` | ag-findings.html | yes |
| `#quantum-analysis` | panama-papers.html | yes |

## Skipped (out of audit scope)

- 44 external `https://` links (non-tenet-5 domains — government sources, treaty bodies, journals)
- 0 JS-template / `data:` / `mailto:` / `tel:` hits this run

## Method notes

- The 8 self-only refs (`#frag` against the same page) are the union of skip-to-content links (`#main`) on every pillar plus the two in-page TOC entries inside `financial-crime-policy-2026.html`.
- The 6 cross-page refs are all the inter-pillar wiring, plus one outbound (`carney-conflicts.html` → `panama-papers.html#quantum-analysis`). All 4 unique cross-page anchors resolve.
- A previous run on 2026-04-28 reported a clean audit at 17 refs (3 of those were false positives from a coarser regex extractor — JS template literal + 2 inline SVG `data:` URIs). This run uses BeautifulSoup `<a href>` extraction so it never sees those false positives in the first place; the count drops to 14 net real refs.

## Acceptance

Acceptance criterion (queue): *"All 6 pillar pages cross-link with no 404 anchors; report committed as audit/site_xlink_audit_1777669473.md OR fix-in-place commit closes the broken anchors."* — first branch satisfied: 0 broken anchors found, this report is the deliverable.

Closing `site_xlink_audit_1777669473`.
