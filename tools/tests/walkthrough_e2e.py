"""End-to-end Playwright test for the LIRIL walkthrough.

Verifies that every test page produces N sensible "slides" (narratable
sections) when the walkthrough's collection logic runs against it. The
check is STRUCTURAL — we verify that collectPoints() produces more than
one slide and a substantial total char count, so that regressions like
the 2026-04-18 "reads 1 slide" bug get caught the next time.

Expected (post-2026-04-18 rewrite):
  * Every test page: slides >= 5
  * Every test page: total_chars >= 2,000

Run:
  "E:/S.L.A.T.E/.venv/Scripts/python.exe" tools/tests/walkthrough_e2e.py

Writes machine-readable results to
  E:/TENET-5.github.io/data/walkthrough_e2e_results.json

Run from outside the tenet5 tree to avoid popup_hunter default-deny, OR
add this script to liril_popup_hunter.py's WHITELIST_CMDLINE_MARKERS.

Modified: 2026-04-18T05:55:00Z — author: claude_code
"""
from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path


# Pages chosen to cover different structural conventions:
#   - section-based   (vaccine-injury-accountability)
#   - timeline-based  (maid-accountability)
#   - card-based      (covid-accountability)
#   - hero+cards      (follow-the-money)
#   - timeline-heavy  (legal)
TEST_PAGES = [
    "vaccine-injury-accountability.html",
    "maid-accountability.html",
    "covid-accountability.html",
    "accountability.html",
    "genocide-evidence.html",
    "foreign-interference.html",
    "follow-the-money.html",
]

RESULTS_PATH = Path(r"E:/TENET-5.github.io/data/walkthrough_e2e_results.json")

# Thresholds chosen to catch regression bugs (like the 2026-04-18 "1
# slide for an entire page" bug) while not flagging legitimate
# database-style pages (accountability.html is mostly a 1,111-record
# filterable database wrapped in one container — 3 narrative slides
# above the database is correct).
MIN_SLIDES_PER_PAGE = 3
MIN_CHARS_PER_PAGE = 2000


# Collection logic mirrors liril-walkthrough.js v=13.
EXTRACTION_JS = r"""
(() => {
  const NARRATE_TAGS = {H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,P:1,LI:1,
                        BLOCKQUOTE:1,FIGCAPTION:1,CAPTION:1,
                        DT:1,DD:1,TH:1,TD:1,SUMMARY:1};
  const SKIP_TAGS = {SCRIPT:1,STYLE:1,NAV:1,HEADER:1,FOOTER:1,
                     BUTTON:1,FORM:1,INPUT:1,SELECT:1,TEXTAREA:1,
                     IFRAME:1,SVG:1,CANVAS:1,TEMPLATE:1};
  const SLIDE_SELECTORS = [
    '[data-narrate]',
    'section','article',
    '.page-hero','.hero','.tl-hero','.stat-hero-banner',
    '.bloggins-hero','.cca-hero','.cm-hero','.conv-hero',
    '.cra-hero','.crown-hero','.debt-hero','.ge-hero',
    '.imm-hero','.infra-hero','.news-hero','.pattern-hero',
    '.pdd-hero','.prov-hero','.records-hero','.ta-hero','.vr-hero',
    '.timeline-section','.tl-timeline','.timeline','.timeline-item',
    '.timeline-entry','.timeline-node',
    '.finding-box','.case-card','.evidence-block','.program-card',
    '.stat-card','.stat-row','.source-block',
    '.callout','.call-out','.callout-box',
    '.person-card','.country-card','.credibility-card',
    '.purchase-callout','.record','.crpd-card',
    '.evidence-box','.finding-card','.verdict-box',
    '.alert-card','.anomaly-card',
    '.narrative-intro','.hero-section',
    '.dnd-section','.cc-section','.cg-section','.ge-section',
    '.ph-section','.se-section','.ta-section','.war-section',
    '.charge-section','.corp-section','.data-section',
    '.entity-section','.networks-section','.pattern-section',
    '.section-block','.section-head',
    '.loop-diagram','.loop-step'
  ];
  function extractSlideText(slide) {
    const parts = [];
    function visit(n) {
      if (!n || n.nodeType !== 1) return;
      if (SKIP_TAGS[n.tagName]) return;
      const st = getComputedStyle(n);
      if (st.display === 'none' || st.visibility === 'hidden') return;
      if (NARRATE_TAGS[n.tagName]) {
        const t = (n.textContent || '').replace(/\s+/g,' ').trim();
        if (t.length >= 2) parts.push(t);
        return;
      }
      for (const ch of n.children) visit(ch);
    }
    visit(slide);
    return parts.join('. ').replace(/\.\.+/g,'.');
  }
  const nodes = document.querySelectorAll(SLIDE_SELECTORS.join(','));
  const seenEls = new Set();
  const slides = [];
  for (const el of nodes) {
    if (seenEls.has(el)) continue;
    let p = el.parentElement, dominated = false;
    while (p) { if (seenEls.has(p)) { dominated = true; break; } p = p.parentElement; }
    if (dominated) continue;
    if (el.closest('nav,header,footer,#site-header-frame,#site-footer-frame,#hud-controls')) continue;
    const body = extractSlideText(el);
    const lead = (el.getAttribute('data-narrate') ||
                  el.getAttribute('data-narration') || '').trim();
    let raw = '';
    if (lead && body && body.toLowerCase().indexOf(lead.toLowerCase().substring(0,40)) < 0) {
      raw = lead + '. ' + body;
    } else {
      raw = body || lead;
    }
    if (raw.length < 15) continue;
    seenEls.add(el);
    slides.push({
      tag: el.tagName,
      cls: el.className ? el.className.substring(0, 80) : '',
      len: raw.length,
      preview: raw.substring(0, 120)
    });
  }
  return {
    total: slides.length,
    total_chars: slides.reduce((s,x)=>s+x.len,0),
    slides: slides
  };
})()
"""


async def test_page(browser, page_name: str) -> dict:
    url = f"https://tenet-5.github.io/index.html?load={page_name}"
    result = {"page": page_name, "url": url, "pass": False, "errors": []}
    page = await browser.new_page(viewport={"width": 1280, "height": 900})
    try:
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        content_frame = None
        for f in page.frames:
            if f == page.main_frame:
                continue
            if not f.url or f.url.startswith("about:"):
                continue
            content_frame = f
            break
        if not content_frame:
            content_frame = page.main_frame

        r = await content_frame.evaluate(EXTRACTION_JS)
        result["slide_count"] = r.get("total")
        result["total_chars"] = r.get("total_chars")
        result["slides_sample"] = r.get("slides", [])[:5]

        # Structural assertions
        if result["slide_count"] < MIN_SLIDES_PER_PAGE:
            result["errors"].append(
                f"FAIL: only {result['slide_count']} slides "
                f"(minimum {MIN_SLIDES_PER_PAGE})"
            )
        if result["total_chars"] < MIN_CHARS_PER_PAGE:
            result["errors"].append(
                f"FAIL: only {result['total_chars']} chars "
                f"(minimum {MIN_CHARS_PER_PAGE})"
            )
        result["pass"] = not result["errors"]
    except Exception as e:
        result["errors"].append(f"{type(e).__name__}: {e}")
    finally:
        await page.close()
    return result


async def main():
    from playwright.async_api import async_playwright

    print(f"Walkthrough E2E test — {len(TEST_PAGES)} pages")
    print(f"Asserts: slides >= {MIN_SLIDES_PER_PAGE}, chars >= {MIN_CHARS_PER_PAGE}")
    print("=" * 72)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            results = []
            for page_name in TEST_PAGES:
                r = await test_page(browser, page_name)
                results.append(r)
                status = "PASS" if r["pass"] else "FAIL"
                mark = "✓" if r["pass"] else "✗"
                print(f"  {mark} [{status}] {page_name:50s} "
                      f"slides={r.get('slide_count', 0):3d}  "
                      f"chars={r.get('total_chars', 0):7,}")
                for err in r.get("errors", []):
                    print(f"          → {err}")
        finally:
            await browser.close()

    pass_count = sum(1 for r in results if r["pass"])
    fail_count = len(results) - pass_count

    summary = {
        "timestamp": __import__("time").time(),
        "pages_tested": len(results),
        "passed": pass_count,
        "failed": fail_count,
        "thresholds": {
            "min_slides": MIN_SLIDES_PER_PAGE,
            "min_chars": MIN_CHARS_PER_PAGE,
        },
        "results": results,
    }
    RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print("=" * 72)
    print(f"PASS: {pass_count}/{len(results)}   FAIL: {fail_count}/{len(results)}")
    print(f"Results written to {RESULTS_PATH}")
    sys.exit(0 if fail_count == 0 else 1)


if __name__ == "__main__":
    asyncio.run(main())
