"""Insert [CONNECTED INTELLIGENCE] blocks into pages that have none.
Finds the correct insertion point: before red banner or before footer frame."""
import os, re, sys

# Cross-link assignments for all 33 content pages
CROSS_LINKS = {
    # P0a — 6 pages that are CI targets but have no CI block (dead ends)
    "institutional-capture": [
        ("institutional-malice.html", "Institutional", "#dc2626", "Institutional Malice"),
        ("wef-corridor.html", "Global", "var(--gold,#facc15)", "WEF Institutional Corridor"),
        ("cds-accountability.html", "Military", "var(--accent)", "CDS Accountability"),
        ("veterans-betrayal.html", "Veterans", "var(--accent)", "Veterans Betrayal"),
    ],
    "institutional-malice": [
        ("institutional-capture.html", "Synthesis", "#dc2626", "Institutional Capture"),
        ("disability-genocide.html", "Human Rights", "var(--gold,#facc15)", "Disability Genocide"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "prosecution": [
        ("s504-court-filing.html", "Legal", "#dc2626", "S.504 Court Filing"),
        ("s504-covey-bae.html", "Legal", "var(--gold,#facc15)", "Covey-Bae Prosecution"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "snc-lavalin": [
        ("corruption-map.html", "Mapping", "#dc2626", "Corruption Map"),
        ("follow-the-money.html", "Financial", "var(--gold,#facc15)", "Follow the Money"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
    ],
    "wef-corridor": [
        ("wef-davos.html", "Global", "#dc2626", "WEF-Davos"),
        ("institutional-capture.html", "Synthesis", "var(--gold,#facc15)", "Institutional Capture"),
        ("foreign-influence.html", "Influence", "var(--accent)", "Foreign Influence"),
        ("carney-conflicts.html", "Conflicts", "var(--accent)", "Carney Conflicts"),
    ],
    "phac-mandates-s6": [
        ("covid-accountability.html", "Healthcare", "#dc2626", "COVID Accountability"),
        ("healthcare-crisis.html", "Healthcare", "var(--gold,#facc15)", "Healthcare Crisis"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    # Legislation/Bills cluster
    "bill-c22-surveillance": [
        ("privacy-surveillance.html", "Privacy", "#dc2626", "Privacy & Surveillance"),
        ("bill-c63-online-harms.html", "Legislation", "var(--gold,#facc15)", "Bill C-63 Online Harms"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "bill-c63-online-harms": [
        ("bill-c22-surveillance.html", "Legislation", "#dc2626", "Bill C-22 Surveillance"),
        ("privacy-surveillance.html", "Privacy", "var(--gold,#facc15)", "Privacy & Surveillance"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
        ("media-concentration.html", "Media", "var(--accent)", "Media Concentration"),
    ],
    "bill-c70-registry": [
        ("foreign-interference.html", "Intelligence", "#dc2626", "Foreign Interference"),
        ("foreign-influence.html", "Influence", "var(--gold,#facc15)", "Foreign Influence"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
    ],
    # MAID/Healthcare cluster
    "brookfield-maid": [
        ("cija-maid-pipeline.html", "Pipeline", "#dc2626", "CIJA-MAID Pipeline"),
        ("disability-genocide.html", "Human Rights", "var(--gold,#facc15)", "Disability Genocide"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("maid-policy-evolution.html", "Policy", "var(--accent)", "MAID Policy Evolution"),
    ],
    "maid-economics": [
        ("maid-policy-evolution.html", "Policy", "#dc2626", "MAID Policy Evolution"),
        ("disability-genocide.html", "Human Rights", "var(--gold,#facc15)", "Disability Genocide"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("cija-maid-pipeline.html", "Pipeline", "var(--accent)", "CIJA-MAID Pipeline"),
    ],
    "maid-provincial": [
        ("maid-policy-evolution.html", "Policy", "#dc2626", "MAID Policy Evolution"),
        ("provincial-analysis.html", "Provincial", "var(--gold,#facc15)", "Provincial Analysis"),
        ("healthcare-crisis.html", "Healthcare", "var(--accent)", "Healthcare Crisis"),
        ("disability-genocide.html", "Human Rights", "var(--accent)", "Disability Genocide"),
    ],
    # Military cluster
    "cfnis-proxy": [
        ("cfnis.html", "Investigation", "#dc2626", "CFNIS"),
        ("cds-accountability.html", "Command", "var(--gold,#facc15)", "CDS Accountability"),
        ("rcmp-complicity.html", "Law Enforcement", "var(--accent)", "RCMP Complicity"),
        ("ppcli-lawsuit.html", "Legal", "var(--accent)", "PPCLI Lawsuit"),
    ],
    "military-housing": [
        ("caf-recruitment-crisis.html", "Military", "#dc2626", "CAF Recruitment Crisis"),
        ("dnd-procurement.html", "Procurement", "var(--gold,#facc15)", "DND Procurement"),
        ("housing-crisis.html", "Housing", "var(--accent)", "Housing Crisis"),
        ("veterans-betrayal.html", "Veterans", "var(--accent)", "Veterans Betrayal"),
    ],
    "veteran-suicide": [
        ("veterans-betrayal.html", "Veterans", "#dc2626", "Veterans Betrayal"),
        ("veterans.html", "Veterans", "var(--gold,#facc15)", "Veterans Investigation"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
        ("disability-genocide.html", "Human Rights", "var(--accent)", "Disability Genocide"),
    ],
    # Intelligence/Foreign cluster
    "cda-institute-psyop": [
        ("foreign-influence.html", "Influence", "#dc2626", "Foreign Influence"),
        ("csis-oversight.html", "Intelligence", "var(--gold,#facc15)", "CSIS Oversight"),
        ("media-concentration.html", "Media", "var(--accent)", "Media Concentration"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "csis-oversight": [
        ("foreign-interference.html", "Intelligence", "#dc2626", "Foreign Interference"),
        ("privacy-surveillance.html", "Privacy", "var(--gold,#facc15)", "Privacy & Surveillance"),
        ("rcmp-commissioners.html", "Law Enforcement", "var(--accent)", "RCMP Commissioners"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "foreign-influence-alpha": [
        ("foreign-influence.html", "Influence", "#dc2626", "Foreign Influence"),
        ("foreign-interference.html", "Intelligence", "var(--gold,#facc15)", "Foreign Interference"),
        ("cija-lobbying.html", "Lobbying", "var(--accent)", "CIJA Lobbying"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "influence-target-alpha": [
        ("foreign-influence.html", "Influence", "#dc2626", "Foreign Influence"),
        ("network-analysis.html", "Network", "var(--gold,#facc15)", "Network Analysis"),
        ("convergence-matrix.html", "Matrix", "var(--accent)", "Convergence Matrix"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
    ],
    "cija-lobbying": [
        ("cija-maid-pipeline.html", "Pipeline", "#dc2626", "CIJA-MAID Pipeline"),
        ("lobbying-deepdive.html", "Lobbying", "var(--gold,#facc15)", "Lobbying Deep Dive"),
        ("foreign-influence.html", "Influence", "var(--accent)", "Foreign Influence"),
        ("mp-analysis.html", "Parliament", "var(--accent)", "MP Analysis"),
    ],
    # Finance/Procurement cluster
    "cost-of-failure": [
        ("follow-the-money.html", "Financial", "#dc2626", "Follow the Money"),
        ("debt-fiscal.html", "Fiscal", "var(--gold,#facc15)", "Debt & Fiscal"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "infrastructure-bank": [
        ("infrastructure-deficit.html", "Infrastructure", "#dc2626", "Infrastructure Deficit"),
        ("follow-the-money.html", "Financial", "var(--gold,#facc15)", "Follow the Money"),
        ("procurement-registry.html", "Procurement", "var(--accent)", "Procurement Registry"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
    ],
    "phoenix-pay": [
        ("follow-the-money.html", "Financial", "#dc2626", "Follow the Money"),
        ("arrivecan.html", "Procurement", "var(--gold,#facc15)", "ArriveCAN"),
        ("procurement-registry.html", "Procurement", "var(--accent)", "Procurement Registry"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
    ],
    "indigenous-procurement-fraud": [
        ("procurement-registry.html", "Procurement", "#dc2626", "Procurement Registry"),
        ("corruption-map.html", "Mapping", "var(--gold,#facc15)", "Corruption Map"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    # Political/Electoral
    "election-2025": [
        ("mp-analysis.html", "Parliament", "#dc2626", "MP Analysis"),
        ("carney-conflicts.html", "Conflicts", "var(--gold,#facc15)", "Carney Conflicts"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "emergencies-act": [
        ("legislation.html", "Legal", "#dc2626", "Legislation Analysis"),
        ("rcmp-commissioners.html", "Law Enforcement", "var(--gold,#facc15)", "RCMP Commissioners"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "passport-crisis": [
        ("scandals.html", "Investigation", "#dc2626", "Scandals Database"),
        ("cost-of-failure.html", "Financial", "var(--gold,#facc15)", "Cost of Failure"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("infrastructure-deficit.html", "Infrastructure", "var(--accent)", "Infrastructure Deficit"),
    ],
    "water-crisis": [
        ("healthcare-crisis.html", "Healthcare", "#dc2626", "Healthcare Crisis"),
        ("infrastructure-deficit.html", "Infrastructure", "var(--gold,#facc15)", "Infrastructure Deficit"),
        ("provincial-analysis.html", "Provincial", "var(--accent)", "Provincial Analysis"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    # RCMP
    "rcmp-non-enforcement": [
        ("rcmp-complicity.html", "Law Enforcement", "#dc2626", "RCMP Complicity"),
        ("rcmp-commissioners.html", "Law Enforcement", "var(--gold,#facc15)", "RCMP Commissioners"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
    # Tools/Reference
    "investigation-matrix": [
        ("evidence-index.html", "Evidence", "#dc2626", "Evidence Index"),
        ("convergence-matrix.html", "Network", "var(--gold,#facc15)", "Convergence Matrix"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
    ],
    "key-facts": [
        ("evidence-index.html", "Evidence", "#dc2626", "Evidence Index"),
        ("harm-index.html", "Harm", "var(--gold,#facc15)", "Harm Index"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
    ],
    "mp-scorecard": [
        ("mp-analysis.html", "Parliament", "#dc2626", "MP Analysis"),
        ("mp-brief.html", "Parliament", "var(--gold,#facc15)", "MP Brief"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("appointments.html", "Appointments", "var(--accent)", "Federal Appointments"),
    ],
    "timeline": [
        ("evidence-index.html", "Evidence", "#dc2626", "Evidence Index"),
        ("accountability.html", "Accountability", "var(--gold,#facc15)", "Accountability Database"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
}

def build_ci_block(page_name):
    links = CROSS_LINKS.get(page_name)
    if not links:
        return None
    cards = []
    for i, (href, category, color, title) in enumerate(links):
        border = 'var(--gold,#facc15)' if i == 1 else '#333'
        cards.append(
            f'    <a href="{href}" style="background:var(--glass-bg,rgba(255,255,255,0.03));border:1px solid {border};padding:1rem;border-radius:6px;text-decoration:none;color:#fff;display:block;">\n'
            f'      <div style="font-size:0.7rem;color:{color};text-transform:uppercase;letter-spacing:1px;font-weight:600;">{category}</div>\n'
            f'      <div style="font-weight:700;margin-top:0.2rem;">{title}</div>\n'
            f'    </a>'
        )
    return (
        '<div style="max-width:900px;margin:2rem auto;">\n'
        '  <h2 style="color:var(--accent);font-family:monospace;font-size:1.2rem;">[CONNECTED INTELLIGENCE]</h2>\n'
        '  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1rem;">\n'
        + '\n'.join(cards) + '\n'
        '  </div>\n'
        '</div>'
    )

def find_insertion_point(content):
    """Find where to insert CI block. Priority:
    1. Before red banner div
    2. Before <div id="read-next">
    3. Before <div id="site-footer-frame">
    """
    # Red banner
    idx = content.find('<div style="max-width:900px;margin:2rem auto;padding:1.3rem 1.5rem;background:rgba(220,38,38')
    if idx > 0:
        return idx
    
    # read-next
    idx = content.find('<div id="read-next">')
    if idx > 0:
        return idx
    
    # footer frame
    idx = content.find('<div id="site-footer-frame">')
    if idx > 0:
        return idx
    
    # Before closing body
    idx = content.find('</body>')
    if idx > 0:
        return idx
    
    return -1

def process_file(filepath, page_name):
    ci_block = build_ci_block(page_name)
    if not ci_block:
        return False, f"No cross-links defined for {page_name}"
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '[CONNECTED INTELLIGENCE]' in content:
        return False, f"Already has CI: {page_name}"
    
    idx = find_insertion_point(content)
    if idx < 0:
        return False, f"No insertion point found in {page_name}"
    
    new_content = content[:idx] + ci_block + '\n' + content[idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, f"Inserted CI into {page_name}"

def main():
    success = 0
    failed = 0
    for page_name in sorted(CROSS_LINKS.keys()):
        filepath = f"{page_name}.html"
        if not os.path.exists(filepath):
            print(f"  SKIP: {filepath} not found")
            failed += 1
            continue
        ok, msg = process_file(filepath, page_name)
        status = "OK" if ok else "FAIL"
        print(f"  {status}: {msg}")
        if ok:
            success += 1
        else:
            failed += 1
    print(f"\nDone: {success} inserted, {failed} failed/skipped")

if __name__ == "__main__":
    main()
