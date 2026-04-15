#!/usr/bin/env python3
"""Inject [CONNECTED INTELLIGENCE] sections into non-CI pages.
Also weaves orphan pages into CI links to give them inbound connections."""
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

RED = "#dc2626"
RB = "rgba(220,38,38,0.4)"
GOLD = "var(--gold,#facc15)"
ACC = "var(--accent)"

def card(href, cat, label, color=ACC, border="#333"):
    return (
        f'    <a href="{href}" style="background:var(--glass-bg,rgba(255,255,255,0.03));'
        f'border:1px solid {border};padding:1rem;border-radius:6px;text-decoration:none;'
        f'color:#fff;display:block;">\n'
        f'      <div style="font-size:0.7rem;color:{color};text-transform:uppercase;'
        f'letter-spacing:1px;font-weight:600;">{cat}</div>\n'
        f'      <div style="font-weight:700;margin-top:0.2rem;">{label}</div>\n'
        f'    </a>'
    )

def ci_block(cards_list):
    cards_html = "\n".join(
        card(href, cat, label, color, border)
        for href, cat, label, color, border in cards_list
    )
    return (
        '\n<div style="max-width:900px;margin:2rem auto;">\n'
        '  <h2 style="color:var(--accent);font-family:monospace;font-size:1.2rem;">'
        '[CONNECTED INTELLIGENCE]</h2>\n'
        '  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));'
        'gap:1rem;margin-top:1rem;">\n'
        f'{cards_html}\n'
        '  </div>\n'
        '</div>\n\n'
    )

# ── 1. Header renames (3 pages already have grids, just wrong header) ──
renames = {
    "complete-thesis.html": "[NAVIGATE THE EVIDENCE]",
    "cyber-security-failures.html": "[250 PAGES &mdash; NAVIGATE THE EVIDENCE]",
    "sovereignty-summary.html": "[START HERE]",
}

# ── 2. New CI sections (8 pages) ──
# Links chosen to maximize orphan coverage (11 orphans woven in)
new_sections = {
    "class-action-guide.html": [
        ("s504-tracker.html",             "Legal",      "s.504 Prosecution Tracker",   RED, RB),
        ("prosecution.html",              "Framework",  "Prosecution Framework",       ACC, "#333"),
        ("citizens-toolkit.html",         "Action",     "Citizen\u2019s Toolkit",      GOLD, GOLD),
        ("lobbying-threshold-2026.html",  "Governance", "Lobbying Thresholds 2026",    ACC, "#333"),
        ("political-donation-system.html","Money",      "Political Donation System",   RED, RB),
        ("what-reform-looks-like.html",   "Solutions",  "What Reform Looks Like",      GOLD, GOLD),
    ],
    "faq.html": [
        ("system-architecture.html",            "Architecture", "13-Layer Capture Map",          RED, RB),
        ("complete-thesis.html",                "Thesis",       "What 250 Pages Prove",          ACC, "#333"),
        ("press-kit.html",                      "Press",        "Journalist Press Kit",           GOLD, GOLD),
        ("media-coverage-gaps.html",            "Media",        "10 Stories They Won\u2019t Run", RED, RB),
        ("conflict-of-interest-registry.html",  "Ethics",       "Conflict of Interest Registry",  ACC, "#333"),
        ("pandemic-response-audit.html",        "Audit",        "Pandemic Response Audit",        GOLD, GOLD),
    ],
    "maid-dossier-index.html": [
        ("immigration-maid-pipeline.html",      "Pipeline",       "Immigration \u2192 MAID Pipeline", RED, RB),
        ("credential-exploitation-data.html",   "Data",           "Credential Exploitation Data",      ACC, "#333"),
        ("maid-accountability.html",            "Accountability", "Who Is Responsible",                 RED, RB),
        ("maid-master-dossier.html",            "Master",         "Complete MAID Dossier",              GOLD, GOLD),
        ("opioid-crisis-accountability.html",   "Crisis",         "Opioid Accountability",              ACC, "#333"),
        ("veterans-maid-cases.html",            "Veterans",       "Veterans \u0026 MAID",               RED, RB),
    ],
    "maid-speech-evidence.html": [
        ("hansard-dashboard.html",   "Hansard",  "Parliamentary Dashboard",     RED, RB),
        ("maid-voting-record.html",  "Votes",    "MAID Voting Record",          ACC, "#333"),
        ("maid-dossier-index.html",  "Evidence", "9-Page MAID Dossier",         GOLD, GOLD),
        ("maid-master-dossier.html", "Dossier",  "Complete MAID Dossier",       RED, RB),
        ("s504-tracker.html",        "Legal",    "s.504 Prosecution Tracker",   ACC, "#333"),
    ],
    "press-kit.html": [
        ("system-architecture.html",            "Architecture", "13-Layer Capture Map",          RED, RB),
        ("before-and-after-2015.html",          "Data",         "12 Metrics, 11 Worsened",       GOLD, GOLD),
        ("maid-dossier-index.html",             "MAID",         "9-Page MAID Dossier",           ACC, "#333"),
        ("share-pack.html",                     "Share",        "19 Ready Social Posts",          GOLD, GOLD),
        ("federal-contract-waste.html",         "Spending",     "Federal Contract Waste",         RED, RB),
        ("conflict-of-interest-registry.html",  "Ethics",       "Conflict of Interest Registry",  ACC, "#333"),
    ],
    "privatization-timeline.html": [
        ("housing-financialization.html",  "Housing",   "Housing Financialization",  RED, RB),
        ("healthcare-privatization.html",  "Health",    "Healthcare Privatization",  ACC, "#333"),
        ("tax-policy.html",                "Fiscal",    "Tax Policy Failures",       GOLD, GOLD),
        ("energy-sovereignty.html",        "Energy",    "Energy Sovereignty",        RED, RB),
        ("housing-crisis-by-city.html",    "City Data", "Housing Crisis by City",    ACC, "#333"),
        ("political-donation-system.html", "Money",     "Political Donation System", GOLD, GOLD),
    ],
    "share-pack.html": [
        ("before-and-after-2015.html",          "Data",     "12 Metrics, 11 Worsened",       RED, RB),
        ("immigration-maid-pipeline.html",      "Pipeline", "Immigration \u2192 MAID Pipeline", ACC, "#333"),
        ("citizens-toolkit.html",               "Action",   "Citizen\u2019s Toolkit",         GOLD, GOLD),
        ("housing-crisis-by-city.html",         "Housing",  "Housing Crisis by City",          RED, RB),
        ("opioid-crisis-accountability.html",   "Health",   "Opioid Accountability",           ACC, "#333"),
        ("carney-wef.html",                     "Power",    "Davos \u0026 Canadian Policy",    GOLD, GOLD),
    ],
    "site-changelog.html": [
        ("maid-dossier-index.html",      "Evidence",     "9-Page MAID Dossier",         RED, RB),
        ("class-action-guide.html",      "Legal",        "Class Action Guide",           ACC, "#333"),
        ("system-architecture.html",     "Architecture", "13-Layer Capture Map",         GOLD, GOLD),
        ("pandemic-response-audit.html", "Audit",        "Pandemic Response Audit",      RED, RB),
        ("what-reform-looks-like.html",  "Reform",       "What Reform Looks Like",       ACC, "#333"),
        ("federal-contract-waste.html",  "Spending",     "Federal Contract Waste",       GOLD, GOLD),
    ],
}

RED_ALERT = '<div style="max-width:900px;margin:2rem auto;padding:1.3rem 1.5rem;background:rgba(220,38,38,0.08);'

# ── Execute renames ──
for fname, old_header in renames.items():
    with open(fname, "r", encoding="utf-8") as f:
        html = f.read()
    if old_header in html:
        html = html.replace(old_header, "[CONNECTED INTELLIGENCE]", 1)
        with open(fname, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  RENAMED  {fname}")
    else:
        print(f"  SKIP     {fname} — header not found: {old_header[:40]}")

# ── Execute new CI section injections ──
for fname, card_defs in new_sections.items():
    with open(fname, "r", encoding="utf-8") as f:
        html = f.read()

    if "CONNECTED INTELLIGENCE" in html:
        print(f"  SKIP     {fname} — already has CI section")
        continue

    ci = ci_block(card_defs)

    if fname == "maid-speech-evidence.html":
        # No red alert box — insert before </main>
        marker = "  </main>"
        idx = html.find(marker)
        if idx >= 0:
            html = html[:idx] + ci + html[idx:]
        else:
            print(f"  ERROR    {fname} — no </main> found")
            continue
    else:
        # Insert before the red alert box
        idx = html.find(RED_ALERT)
        if idx >= 0:
            html = html[:idx] + ci + html[idx:]
        else:
            print(f"  ERROR    {fname} — no red alert box found")
            continue

    with open(fname, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  INJECTED {fname}")

print("\nDone — 11 pages updated (3 renamed, 8 injected)")
