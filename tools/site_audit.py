"""Full site audit: find broken internal links, references to removed pages, board.js loads, and localhost references.
Now fully upgraded to utilize Playwright for robust, headless-browser validation of NV-QUANTUM UI intercept elements.
"""
import os, re, sys
import asyncio
import subprocess
import time
from collections import defaultdict
from playwright.async_api import async_playwright

ROOT = r"E:\TENET-5.github.io"
SERVER_PORT = 8089

TARGET_PAGES = [
    "investigation-matrix.html",
    "charity-pipeline.html",
    "carney-conflicts.html",
    "follow-the-money.html",
    "cfnis-proxy.html",
    "brookfield-maid.html",
    "demographics-to-death.html",
    "cija-lobbying.html"
]

# Cap#11 v2 (2026-04-25): pages that set window.__TENET5_INTERACTIVE_PAGE.
# Walkthrough autopilot MUST NOT auto-start on these — the user landed
# here to interact with a canvas/map/board, not to watch narration.
# This guards against the 2026-04-19 walkfix regression class:
# stdlib HTML inspection couldn't catch client-side JS autoplay bugs,
# so we now exercise them in headless Chromium.
INTERACTIVE_PAGES = [
    "conspiracy-board.html",
    "network-analysis.html",
    "canada-map.html",
]

def run_static_audit():
    # All existing HTML files
    existing_html = set()
    for f in os.listdir(ROOT):
        if f.endswith('.html'):
            existing_html.add(f)
    for subdir in []:
        d = os.path.join(ROOT, subdir)
        if os.path.isdir(d):
            for f in os.listdir(d):
                if f.endswith('.html'):
                    existing_html.add(f"{subdir}/{f}")

    # Removed pages (OSINT dashboards deleted earlier)
    removed_pages = {
        'knowledge-graph.html', 'entity-registry.html', 'threat-assessment.html',
        'investigation-timeline.html', 'anomaly-scanner.html', 'intelligence-briefing.html',
        'entity-relationships.html', 'system-health.html', 'causal-graph.html',
        'darkweb-intel.html'
    }

    # Bad patterns to search for
    bad_patterns = [
        (r'investigation_board\.js\b', 'investigation_board.js load (investigation board - may cause blank page)', True),
        (r'localhost:\d+', 'localhost reference', True),
        (r'dark\s*web|\.onion', 'darkweb reference', True),
        (r'NemoClaw|STARK|PEPPER', 'internal system reference', False),
    ]

    issues = []

    for fname in sorted(os.listdir(ROOT)):
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(ROOT, fname)
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        lines = content.split('\n')

        # Check internal links
        hrefs = re.findall(r'href=["\']([^"\'#?]+)', content)
        for href in hrefs:
            if href.startswith(('http', 'mailto:', 'tel:', 'javascript:', 'data:')):
                continue
            # Strip path
            target = href.split('/')[-1] if '/' not in href else href
            if target.endswith('.html') and target not in existing_html:
                if target in removed_pages:
                    issues.append((fname, f"LINK TO REMOVED PAGE: {target}"))
                else:
                    # Check if it really doesn't exist
                    full = os.path.join(ROOT, href)
                    if not os.path.exists(full):
                        issues.append((fname, f"BROKEN LINK: {href}"))

        # Check bad patterns
        for pattern, desc, ignorecase in bad_patterns:
            for i, line in enumerate(lines, 1):
                flags = re.IGNORECASE if ignorecase else 0
                if re.search(pattern, line, flags):
                    # Skip false positives in comments about removal
                    if 'removed' in line.lower() or 'deleted' in line.lower() or 'liril khan' in line.lower():
                        continue
                    issues.append((fname, f"LINE {i}: {desc} -> {line.strip()[:120]}"))

    print(f"\n{'='*70}")
    print(f"TENET-5 SITE STATIC AUDIT — {len(existing_html)} HTML files scanned")
    print(f"{'='*70}")
    print(f"\nTotal static issues found: {len(issues)}\n")
    
    if issues:
        by_file = defaultdict(list)
        for fname, issue in issues:
            by_file[fname].append(issue)

        for fname in sorted(by_file):
            print(f"\n📄 {fname} ({len(by_file[fname])} issues)")
            for issue in by_file[fname]:
                print(f"   ⚠  {issue}")

    print(f"\n{'='*70}")
    print(f"Files with board.js: {sum(1 for f,i in issues if 'board.js' in i)}")
    print(f"Broken links: {sum(1 for f,i in issues if 'BROKEN LINK' in i)}")
    print(f"Removed page refs: {sum(1 for f,i in issues if 'REMOVED PAGE' in i)}")
    print(f"Localhost refs: {sum(1 for f,i in issues if 'localhost' in i)}")
    
    return len(issues)


async def audit_page(page, p_name):
    shell_url = f"http://127.0.0.1:{SERVER_PORT}/{p_name}"
    print(f"[PLAYWRIGHT] Loading {p_name} directly...")
    await page.goto(shell_url, wait_until="networkidle")
    
    frame = page
    try:
        await frame.locator("body").wait_for(timeout=3000)
    except: ...
    
    intercept = frame.locator("#nv-quantum-intercept")
    
    try:
        await intercept.wait_for(state="visible", timeout=3000)
    except Exception:
        print(f"[!] PLAYWRIGHT FAIL: {p_name} did not render the NV-QUANTUM UI intercept.")
        return False

    try:
        sig = await frame.locator("#nv-quantum-sig").text_content()
    except Exception:
        try:
            sig = await frame.locator("#q-sig-display").text_content()
        except:
            sig = "UNKNOWN SIG"
        
    content_html = await frame.locator("#nv-quantum-content").inner_html()
    
    if "AWAITING" in str(sig) and "VERIFYING" not in str(sig) and "ACTIVE" not in str(sig):
         print(f"[!] PLAYWRIGHT WARN: {p_name} Sig stuck bridging Matrix: {str(sig)}")
    else:
        print(f"[*] PLAYWRIGHT OK: {p_name} validated topology signature [{sig.strip()}]")
        
    if "<li" in content_html or "<tr" in content_html:
        print(f"[*] PLAYWRIGHT OK: {p_name} Matrix injected records into the NV-QUANTUM grid.")
        return True
    else:
        print(f"[!] PLAYWRIGHT FAIL: {p_name} NV-QUANTUM block is empty.")
        return False

async def audit_interactive_no_autoplay(page, p_name):
    """Cap#11 v2: assert walkthrough autopilot does NOT fire on an
    interactive page. Verifies (a) presentation.js sets the
    __TENET5_INTERACTIVE_PAGE flag, and (b) liril-walkthrough.js
    respects it (no liril-narrating body class, no active subtitle)."""
    # The site's iframe shell is archive-shell.html (home.html redirects
    # there). index.html is just a marketing landing page and does NOT load
    # presentation.js / liril-walkthrough.js. Hitting archive-shell.html?load=
    # mirrors what real users see when they navigate via the in-site shell.
    shell_url = f"http://127.0.0.1:{SERVER_PORT}/{p_name}"
    print(f"[PLAYWRIGHT] Interactive-autoplay check: {p_name} ...")
    await page.goto(shell_url, wait_until="networkidle")
    # Give shell + presentation.js (loaded async via shell.js) +
    # liril-walkthrough.js time to init. liril-walkthrough.js polls
    # for presentation.js up to 4s, then liril autopilot delays start
    # by 1.5-2.5s. We must wait longer than the worst-case sum.
    await page.wait_for_timeout(10000)

    content_frame = page.main_frame
    parent_flag = False
    state = await content_frame.evaluate(
        """() => ({
            interactiveFlag: !!window.__TENET5_INTERACTIVE_PAGE,
            narrating: document.body.classList.contains('liril-narrating'),
            subtitleVisible: (function() {
                var s = document.getElementById('liril-subtitle');
                if (!s) return false;
                var op = parseFloat(getComputedStyle(s).opacity || '0');
                return op > 0.05;
            })(),
            autopilotActive: (function() {
                try {
                    var ap = JSON.parse(sessionStorage.getItem('liril_autopilot') || 'null');
                    return !!(ap && ap.autostart);
                } catch (e) { return false; }
            })()
        })"""
    )

    errs = []
    if not (parent_flag or state["interactiveFlag"]):
        errs.append(
            "neither parent nor iframe set __TENET5_INTERACTIVE_PAGE "
            "(presentation.js bailout did not fire)"
        )
    if state["narrating"]:
        errs.append("body.liril-narrating present — walkthrough auto-started")
    if state["subtitleVisible"]:
        errs.append("liril-subtitle visible — walkthrough auto-started")
    if state["autopilotActive"]:
        errs.append("sessionStorage liril_autopilot still autostart=true")

    if errs:
        print(f"[!] PLAYWRIGHT FAIL: {p_name} — interactive-autoplay regression:")
        for e in errs:
            print(f"      → {e}")
        return False
    print(f"[*] PLAYWRIGHT OK: {p_name} — autopilot correctly suppressed on interactive page")
    return True


async def run_playwright_audit():
    print(f"\n{'='*70}")
    print(f"TENET-5 PLAYWRIGHT NV-QUANTUM EMPIRICAL VALIDATION")
    print(f"{'='*70}")
    
    os.system("python -m playwright install chromium")
    print(f"[PLAYWRIGHT] Booting Empirical Python Server on Port {SERVER_PORT}...\n")
    server = subprocess.Popen([sys.executable, "-m", "http.server", str(SERVER_PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    
    failures = 0
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            for p_name in TARGET_PAGES:
                res = await audit_page(page, p_name)
                if not res:
                    failures += 1

            # Cap#11 v2: interactive-page autoplay-suppression checks.
            # Use a fresh context so sessionStorage from prior pages
            # (which may carry liril_autopilot set by manual click in
            # earlier audit) doesn't pollute these assertions.
            ctx2 = await browser.new_context()
            page2 = await ctx2.new_page()
            try:
                for p_name in INTERACTIVE_PAGES:
                    res = await audit_interactive_no_autoplay(page2, p_name)
                    if not res:
                        failures += 1
            finally:
                await ctx2.close()

            await browser.close()
    finally:
        server.terminate()
        server.wait()
        
    return failures

async def main():
    static_issues = run_static_audit()
    pw_issues = await run_playwright_audit()
    
    print(f"\n{'='*70}")
    print(f"AUDIT COMPLETE")
    print(f"Static issues: {static_issues}")
    print(f"Playwright failures: {pw_issues}")
    
    if pw_issues > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(main())
