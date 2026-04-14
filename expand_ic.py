"""Expand institutional-capture cross-links into CI grids across the site.
Adds an IC card as the 5th item in the CI grid for qualifying pages.
The auto-fit grid wraps cleanly with 5 cards."""
import os, re

# Pages that should link to institutional-capture.html
# Criteria per LIRIL: regulatory failure, systemic non-response, complaint handling
# failure, whistleblower suppression, revolving door, resolution mechanism failure by design
QUALIFYING_PAGES = [
    # Already linked (13): caf-recruitment-crisis, caf-recruitment, carbon-tax,
    # carney-conflicts, cds-accountability, institutional-capture, institutional-malice,
    # military-housing, veteran-suicide, veterans-betrayal, veterans, wef-corridor, wef-davos
    # Skipping those — only adding new ones below

    # Core accountability / systemic failure
    "accountability",
    "5gw-subversion",
    "appointments",
    "arrivecan",

    # Bills / legislation — resolution mechanisms captured
    "bill-c22-surveillance",
    "bill-c63-online-harms",
    "bill-c70-registry",

    # MAID / healthcare — system designed to fail patients
    "brookfield-maid",
    "cija-maid-pipeline",
    "covid-accountability",
    "disability-genocide",
    "genocide-evidence",
    "harm-index",
    "healthcare-crisis",
    "maid-economics",
    "maid-policy-evolution",
    "maid-provincial",

    # Military / CAF — complaint mechanisms failing by design
    "caf-families",
    "cfnis",
    "cfnis-proxy",
    "dnd-procurement",
    "ppcli-lawsuit",

    # RCMP / Law enforcement — regulatory capture
    "rcmp-commissioners",
    "rcmp-complicity",
    "rcmp-non-enforcement",

    # Intelligence / foreign influence — oversight capture
    "cda-institute-psyop",
    "cija-lobbying",
    "csis-oversight",
    "foreign-influence",
    "foreign-influence-alpha",
    "foreign-interference",
    "influence-target-alpha",

    # Finance / procurement — systemic corruption
    "corruption-map",
    "cost-of-failure",
    "debt-fiscal",
    "follow-the-money",
    "indigenous-procurement-fraud",
    "infrastructure-bank",
    "infrastructure-deficit",
    "lobbying-deepdive",
    "phoenix-pay",
    "procurement-registry",
    "scandals",
    "snc-lavalin",

    # Political / parliamentary — revolving door
    "election-2025",
    "emergencies-act",
    "legislation",
    "mp-analysis",
    "mp-brief",
    "mp-scorecard",
    "passport-crisis",
    "provincial-analysis",

    # Legal / evidence
    "evidence-index",
    "findings",
    "investigation-matrix",
    "key-facts",
    "prosecution",
    "s504-court-filing",
    "s504-covey-bae",
    "timeline",

    # Media / privacy — captured oversight
    "media-concentration",
    "media-manipulation",
    "privacy-surveillance",

    # Housing / water — resolution failure
    "housing-crisis",
    "water-crisis",

    # Network / convergence analysis
    "convergence-matrix",
    "network-analysis",

    # Additional captured-system pages
    "phac-mandates-s6",
    "petitions",
]

IC_CARD = (
    '    <a href="institutional-capture.html" style="background:var(--glass-bg,rgba(255,255,255,0.03));border:1px solid rgba(220,38,38,0.4);padding:1rem;border-radius:6px;text-decoration:none;color:#fff;display:block;">\n'
    '      <div style="font-size:0.7rem;color:#dc2626;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Synthesis</div>\n'
    '      <div style="font-weight:700;margin-top:0.2rem;">Institutional Capture</div>\n'
    '    </a>'
)

def add_ic_to_grid(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'institutional-capture.html' in content:
        return False, "Already has IC link"

    if '[CONNECTED INTELLIGENCE]' not in content:
        return False, "No CI block"

    # Find the CI grid closing tag: look for the pattern after [CONNECTED INTELLIGENCE]
    # Grid is: <div style="display:grid;...">...cards...</div>
    ci_pos = content.find('[CONNECTED INTELLIGENCE]')
    if ci_pos < 0:
        return False, "CI marker not found"

    # Find the grid div after CI
    grid_start = content.find('display:grid', ci_pos)
    if grid_start < 0:
        return False, "Grid div not found"

    # Find the closing </div> of the grid (after the last </a>)
    # We need to find the last </a> in the grid and then the next </div>
    last_a_close = content.rfind('</a>', grid_start, content.find('</div>\n</div>', grid_start) + 20)
    if last_a_close < 0:
        # Try alternate: find closing </div> after grid
        grid_div_end = content.find('</div>', grid_start + 50)
        if grid_div_end < 0:
            return False, "Could not find grid end"
        # Find the </div> that closes the grid (after all cards)
        # Count nested divs
        return False, "Complex grid structure"

    # Insert IC card after the last </a> but before the grid's closing </div>
    insert_pos = last_a_close + len('</a>')
    new_content = content[:insert_pos] + '\n' + IC_CARD + content[insert_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, "IC card added"

def main():
    success = 0
    failed = 0
    skipped = 0
    for page in sorted(QUALIFYING_PAGES):
        filepath = f"{page}.html"
        if not os.path.exists(filepath):
            print(f"  SKIP: {filepath} not found")
            skipped += 1
            continue
        ok, msg = add_ic_to_grid(filepath)
        if ok:
            print(f"  OK: {page} — {msg}")
            success += 1
        elif msg == "Already has IC link":
            print(f"  SKIP: {page} — {msg}")
            skipped += 1
        else:
            print(f"  FAIL: {page} — {msg}")
            failed += 1
    print(f"\nDone: {success} added, {skipped} skipped, {failed} failed")

if __name__ == "__main__":
    main()
