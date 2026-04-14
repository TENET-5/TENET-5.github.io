#!/usr/bin/env python3
"""Batch update old Connected Intelligence blocks to new [CONNECTED INTELLIGENCE] format."""
import re
import os

# Page-specific cross-link assignments from LIRIL
# Format: page_name -> [(href, category_label, category_color, title), ...]
# Colors: #dc2626 = red (primary), var(--gold,#facc15) = gold (secondary), var(--accent) = accent
CROSS_LINKS = {
    # BATCH 1 — Core Accountability & Evidence
    "accountability": [
        ("corruption-map.html", "Mapping", "#dc2626", "Corruption Map"),
        ("follow-the-money.html", "Financial", "var(--gold,#facc15)", "Follow the Money"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
    ],
    "evidence-index": [
        ("accountability.html", "Accountability", "#dc2626", "Accountability Database"),
        ("findings.html", "Analysis", "var(--gold,#facc15)", "Key Findings"),
        ("records.html", "Records", "var(--accent)", "Public Records"),
        ("s504-court-filing.html", "Legal", "var(--accent)", "S.504 Court Filing"),
    ],
    "findings": [
        ("evidence-index.html", "Evidence", "#dc2626", "Evidence Index"),
        ("accountability.html", "Accountability", "var(--gold,#facc15)", "Accountability Database"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
        ("convergence-matrix.html", "Network", "var(--accent)", "Convergence Matrix"),
    ],
    "harm-index": [
        ("disability-genocide.html", "Human Rights", "#dc2626", "Disability Genocide"),
        ("veterans-betrayal.html", "Veterans", "var(--gold,#facc15)", "Veterans Betrayal"),
        ("maid-policy-evolution.html", "Policy", "var(--accent)", "MAID Policy Evolution"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
    ],
    "corruption-map": [
        ("follow-the-money.html", "Financial", "#dc2626", "Follow the Money"),
        ("network-analysis.html", "Network", "var(--gold,#facc15)", "Network Analysis"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "follow-the-money": [
        ("corruption-map.html", "Mapping", "#dc2626", "Corruption Map"),
        ("procurement-registry.html", "Procurement", "var(--gold,#facc15)", "Procurement Registry"),
        ("crown-corporations.html", "Crown Corps", "var(--accent)", "Crown Corporations"),
        ("cra-enforcement.html", "Enforcement", "var(--accent)", "CRA Enforcement"),
    ],
    "scandals": [
        ("corruption-map.html", "Mapping", "#dc2626", "Corruption Map"),
        ("accountability.html", "Accountability", "var(--gold,#facc15)", "Accountability Database"),
        ("treason-trajectory.html", "State Analysis", "var(--accent)", "Treason Trajectory"),
        ("judicial-appointments.html", "Judiciary", "var(--accent)", "Judicial Appointments"),
    ],
    "records": [
        ("evidence-index.html", "Evidence", "#dc2626", "Evidence Index"),
        ("s504-court-filing.html", "Legal", "var(--gold,#facc15)", "S.504 Court Filing"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "convergence-matrix": [
        ("network-analysis.html", "Network", "#dc2626", "Network Analysis"),
        ("conspiracy-board.html", "Analysis", "var(--gold,#facc15)", "Conspiracy Board"),
        ("cross-reference.html", "Cross-Ref", "var(--accent)", "Cross-Reference"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "conspiracy-board": [
        ("convergence-matrix.html", "Network", "#dc2626", "Convergence Matrix"),
        ("network-analysis.html", "Analysis", "var(--gold,#facc15)", "Network Analysis"),
        ("foreign-interference.html", "Intelligence", "var(--accent)", "Foreign Interference"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    # BATCH 2 — Military/CAF/Veterans
    "veterans": [
        ("veterans-betrayal.html", "Veterans", "#dc2626", "Veterans Betrayal"),
        ("ppcli-lawsuit.html", "Legal", "var(--gold,#facc15)", "PPCLI Lawsuit"),
        ("caf-recruitment-crisis.html", "Military", "var(--accent)", "CAF Recruitment Crisis"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
    "veterans-betrayal": [
        ("veterans.html", "Veterans", "#dc2626", "Veterans Investigation"),
        ("disability-genocide.html", "Human Rights", "var(--gold,#facc15)", "Disability Genocide"),
        ("ppcli-lawsuit.html", "Legal", "var(--accent)", "PPCLI Lawsuit"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
    "caf-recruitment-crisis": [
        ("caf-recruitment.html", "Military", "#dc2626", "CAF Recruitment"),
        ("cds-accountability.html", "Command", "var(--gold,#facc15)", "CDS Accountability"),
        ("dnd-procurement.html", "Procurement", "var(--accent)", "DND Procurement"),
        ("veterans-betrayal.html", "Veterans", "var(--accent)", "Veterans Betrayal"),
    ],
    "caf-recruitment": [
        ("caf-recruitment-crisis.html", "Military", "#dc2626", "CAF Recruitment Crisis"),
        ("cds-accountability.html", "Command", "var(--gold,#facc15)", "CDS Accountability"),
        ("cds-carignan-charges.html", "Legal", "var(--accent)", "CDS Carignan Charges"),
        ("veterans.html", "Veterans", "var(--accent)", "Veterans Investigation"),
    ],
    "cds-accountability": [
        ("cds-carignan-charges.html", "Legal", "#dc2626", "CDS Carignan Charges"),
        ("caf-recruitment-crisis.html", "Military", "var(--gold,#facc15)", "CAF Recruitment Crisis"),
        ("dnd-procurement.html", "Procurement", "var(--accent)", "DND Procurement"),
        ("cfnis.html", "Investigation", "var(--accent)", "CFNIS"),
    ],
    "cds-carignan-charges": [
        ("cds-accountability.html", "Command", "#dc2626", "CDS Accountability"),
        ("cfnis.html", "Investigation", "var(--gold,#facc15)", "CFNIS"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
    ],
    "cfnis": [
        ("cds-carignan-charges.html", "Legal", "#dc2626", "CDS Carignan Charges"),
        ("rcmp-complicity.html", "Law Enforcement", "var(--gold,#facc15)", "RCMP Complicity"),
        ("cds-accountability.html", "Command", "var(--accent)", "CDS Accountability"),
        ("ppcli-lawsuit.html", "Legal", "var(--accent)", "PPCLI Lawsuit"),
    ],
    "ppcli-lawsuit": [
        ("veterans-betrayal.html", "Veterans", "#dc2626", "Veterans Betrayal"),
        ("s504-court-filing.html", "Legal", "var(--gold,#facc15)", "S.504 Court Filing"),
        ("veterans.html", "Veterans", "var(--accent)", "Veterans Investigation"),
        ("cds-accountability.html", "Command", "var(--accent)", "CDS Accountability"),
    ],
    "dnd-procurement": [
        ("procurement-registry.html", "Procurement", "#dc2626", "Procurement Registry"),
        ("arms-pipeline.html", "Defence", "var(--gold,#facc15)", "Arms Pipeline"),
        ("cds-accountability.html", "Command", "var(--accent)", "CDS Accountability"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
    ],
    "arms-pipeline": [
        ("dnd-procurement.html", "Procurement", "#dc2626", "DND Procurement"),
        ("procurement-registry.html", "Registry", "var(--gold,#facc15)", "Procurement Registry"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    # BATCH 3 — MAID/Healthcare/Disability
    "disability-genocide": [
        ("maid-policy-evolution.html", "Policy", "#dc2626", "MAID Policy Evolution"),
        ("cija-maid-pipeline.html", "Pipeline", "var(--gold,#facc15)", "CIJA-MAID Pipeline"),
        ("veterans-betrayal.html", "Veterans", "var(--accent)", "Veterans Betrayal"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
    "cija-maid-pipeline": [
        ("disability-genocide.html", "Human Rights", "#dc2626", "Disability Genocide"),
        ("maid-policy-evolution.html", "Policy", "var(--gold,#facc15)", "MAID Policy Evolution"),
        ("rcmp-maid-accountability.html", "Enforcement", "var(--accent)", "RCMP MAID Accountability"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
    ],
    "maid-policy-evolution": [
        ("disability-genocide.html", "Human Rights", "#dc2626", "Disability Genocide"),
        ("cija-maid-pipeline.html", "Pipeline", "var(--gold,#facc15)", "CIJA-MAID Pipeline"),
        ("healthcare-crisis.html", "Healthcare", "var(--accent)", "Healthcare Crisis"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
    ],
    "healthcare-crisis": [
        ("maid-policy-evolution.html", "Policy", "#dc2626", "MAID Policy Evolution"),
        ("opioid-crisis.html", "Health", "var(--gold,#facc15)", "Opioid Crisis"),
        ("disability-genocide.html", "Human Rights", "var(--accent)", "Disability Genocide"),
        ("provincial-analysis.html", "Provincial", "var(--accent)", "Provincial Analysis"),
    ],
    "opioid-crisis": [
        ("healthcare-crisis.html", "Healthcare", "#dc2626", "Healthcare Crisis"),
        ("harm-index.html", "Harm", "var(--gold,#facc15)", "Harm Index"),
        ("provincial-analysis.html", "Provincial", "var(--accent)", "Provincial Analysis"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "rcmp-maid-accountability": [
        ("cija-maid-pipeline.html", "Pipeline", "#dc2626", "CIJA-MAID Pipeline"),
        ("rcmp-complicity.html", "Law Enforcement", "var(--gold,#facc15)", "RCMP Complicity"),
        ("disability-genocide.html", "Human Rights", "var(--accent)", "Disability Genocide"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "covid-accountability": [
        ("healthcare-crisis.html", "Healthcare", "#dc2626", "Healthcare Crisis"),
        ("accountability.html", "Accountability", "var(--gold,#facc15)", "Accountability Database"),
        ("cra-enforcement.html", "Enforcement", "var(--accent)", "CRA Enforcement"),
        ("provincial-analysis.html", "Provincial", "var(--accent)", "Provincial Analysis"),
    ],
    "the-boot": [
        ("veterans-betrayal.html", "Veterans", "#dc2626", "Veterans Betrayal"),
        ("disability-genocide.html", "Human Rights", "var(--gold,#facc15)", "Disability Genocide"),
        ("my-story.html", "Personal", "var(--accent)", "My Story"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
    # BATCH 4 — RCMP/Legal
    "rcmp-commissioners": [
        ("rcmp-complicity.html", "Law Enforcement", "#dc2626", "RCMP Complicity"),
        ("rcmp-reform.html", "Reform", "var(--gold,#facc15)", "RCMP Reform"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
    ],
    "rcmp-complicity": [
        ("rcmp-commissioners.html", "Law Enforcement", "#dc2626", "RCMP Commissioners"),
        ("rcmp-maid-accountability.html", "MAID", "var(--gold,#facc15)", "RCMP MAID Accountability"),
        ("cfnis.html", "Investigation", "var(--accent)", "CFNIS"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "rcmp-reform": [
        ("rcmp-commissioners.html", "Law Enforcement", "#dc2626", "RCMP Commissioners"),
        ("rcmp-complicity.html", "Complicity", "var(--gold,#facc15)", "RCMP Complicity"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
    ],
    "judicial-appointments": [
        ("appointments.html", "Appointments", "#dc2626", "Federal Appointments"),
        ("accountability.html", "Accountability", "var(--gold,#facc15)", "Accountability Database"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "s504-court-filing": [
        ("s504-covey-bae.html", "Legal", "#dc2626", "Covey-Bae Prosecution"),
        ("evidence-index.html", "Evidence", "var(--gold,#facc15)", "Evidence Index"),
        ("ppcli-lawsuit.html", "Military", "var(--accent)", "PPCLI Lawsuit"),
        ("records.html", "Records", "var(--accent)", "Public Records"),
    ],
    "s504-covey-bae": [
        ("s504-court-filing.html", "Legal", "#dc2626", "S.504 Court Filing"),
        ("arms-pipeline.html", "Defence", "var(--gold,#facc15)", "Arms Pipeline"),
        ("dnd-procurement.html", "Procurement", "var(--accent)", "DND Procurement"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
    ],
    "treason-trajectory": [
        ("rogue-state.html", "State Analysis", "#dc2626", "Canada: Rogue State"),
        ("scandals.html", "Investigation", "var(--gold,#facc15)", "Scandals Database"),
        ("foreign-interference.html", "Intelligence", "var(--accent)", "Foreign Interference"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "rogue-state": [
        ("treason-trajectory.html", "State Analysis", "#dc2626", "Treason Trajectory"),
        ("foreign-interference.html", "Intelligence", "var(--gold,#facc15)", "Foreign Interference"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
        ("scandals.html", "Investigation", "var(--accent)", "Scandals Database"),
    ],
    # BATCH 5 — Foreign Influence & Network
    "foreign-influence": [
        ("foreign-interference.html", "Intelligence", "#dc2626", "Foreign Interference"),
        ("foreign-interference-deep.html", "Deep Dive", "var(--gold,#facc15)", "Foreign Interference Deep"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("wef-davos.html", "Global", "var(--accent)", "WEF-Davos"),
    ],
    "foreign-interference": [
        ("foreign-interference-deep.html", "Deep Dive", "#dc2626", "Foreign Interference Deep"),
        ("foreign-influence.html", "Influence", "var(--gold,#facc15)", "Foreign Influence"),
        ("treason-trajectory.html", "State Analysis", "var(--accent)", "Treason Trajectory"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "foreign-interference-deep": [
        ("foreign-interference.html", "Intelligence", "#dc2626", "Foreign Interference"),
        ("foreign-influence.html", "Influence", "var(--gold,#facc15)", "Foreign Influence"),
        ("convergence-matrix.html", "Network", "var(--accent)", "Convergence Matrix"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "network-analysis": [
        ("convergence-matrix.html", "Network", "#dc2626", "Convergence Matrix"),
        ("conspiracy-board.html", "Analysis", "var(--gold,#facc15)", "Conspiracy Board"),
        ("cross-reference.html", "Cross-Ref", "var(--accent)", "Cross-Reference"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "cross-reference": [
        ("network-analysis.html", "Network", "#dc2626", "Network Analysis"),
        ("convergence-matrix.html", "Matrix", "var(--gold,#facc15)", "Convergence Matrix"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
    ],
    "mp-analysis": [
        ("mp-brief.html", "Parliament", "#dc2626", "MP Brief"),
        ("network-analysis.html", "Network", "var(--gold,#facc15)", "Network Analysis"),
        ("appointments.html", "Appointments", "var(--accent)", "Federal Appointments"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
    ],
    "mp-brief": [
        ("mp-analysis.html", "Parliament", "#dc2626", "MP Analysis"),
        ("network-analysis.html", "Network", "var(--gold,#facc15)", "Network Analysis"),
        ("appointments.html", "Appointments", "var(--accent)", "Federal Appointments"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "carney-conflicts": [
        ("follow-the-money.html", "Financial", "#dc2626", "Follow the Money"),
        ("wef-davos.html", "Global", "var(--gold,#facc15)", "WEF-Davos"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "acelephius-report": [
        ("acelephius-wardoll.html", "Investigation", "#dc2626", "Acelephius-Wardoll"),
        ("gillespie-murder.html", "Case File", "var(--gold,#facc15)", "Gillespie Murder"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
    ],
    "acelephius-wardoll": [
        ("acelephius-report.html", "Investigation", "#dc2626", "Acelephius Report"),
        ("gillespie-murder.html", "Case File", "var(--gold,#facc15)", "Gillespie Murder"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
    ],
    # BATCH 6 — Money/Procurement/Crown Corps
    "procurement-registry": [
        ("dnd-procurement.html", "Defence", "#dc2626", "DND Procurement"),
        ("arms-pipeline.html", "Defence", "var(--gold,#facc15)", "Arms Pipeline"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "crown-corporations": [
        ("follow-the-money.html", "Financial", "#dc2626", "Follow the Money"),
        ("cra-enforcement.html", "Enforcement", "var(--gold,#facc15)", "CRA Enforcement"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "cra-enforcement": [
        ("follow-the-money.html", "Financial", "#dc2626", "Follow the Money"),
        ("crown-corporations.html", "Crown Corps", "var(--gold,#facc15)", "Crown Corporations"),
        ("debt-fiscal.html", "Fiscal", "var(--accent)", "Debt & Fiscal"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "debt-fiscal": [
        ("cra-enforcement.html", "Enforcement", "#dc2626", "CRA Enforcement"),
        ("follow-the-money.html", "Financial", "var(--gold,#facc15)", "Follow the Money"),
        ("infrastructure-deficit.html", "Infrastructure", "var(--accent)", "Infrastructure Deficit"),
        ("crown-corporations.html", "Crown Corps", "var(--accent)", "Crown Corporations"),
    ],
    "arrivecan": [
        ("procurement-registry.html", "Procurement", "#dc2626", "Procurement Registry"),
        ("scandals.html", "Investigation", "var(--gold,#facc15)", "Scandals Database"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "lobbying-deepdive": [
        ("sector-lobbying.html", "Lobbying", "#dc2626", "Sector Lobbying"),
        ("mp-analysis.html", "Parliament", "var(--gold,#facc15)", "MP Analysis"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "sector-lobbying": [
        ("lobbying-deepdive.html", "Lobbying", "#dc2626", "Lobbying Deep Dive"),
        ("mp-analysis.html", "Parliament", "var(--gold,#facc15)", "MP Analysis"),
        ("follow-the-money.html", "Financial", "var(--accent)", "Follow the Money"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "wef-davos": [
        ("foreign-influence.html", "Influence", "#dc2626", "Foreign Influence"),
        ("carney-conflicts.html", "Conflicts", "var(--gold,#facc15)", "Carney Conflicts"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "appointments": [
        ("judicial-appointments.html", "Judiciary", "#dc2626", "Judicial Appointments"),
        ("mp-analysis.html", "Parliament", "var(--gold,#facc15)", "MP Analysis"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "legislation": [
        ("accountability.html", "Accountability", "#dc2626", "Accountability Database"),
        ("maid-policy-evolution.html", "Policy", "var(--gold,#facc15)", "MAID Policy Evolution"),
        ("rcmp-reform.html", "Reform", "var(--accent)", "RCMP Reform"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
    ],
    # BATCH 7 — Geographic & Policy
    "canada-map": [
        ("provincial-analysis.html", "Provincial", "#dc2626", "Provincial Analysis"),
        ("municipal-intelligence.html", "Municipal", "var(--gold,#facc15)", "Municipal Intelligence"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "provincial-analysis": [
        ("canada-map.html", "Geographic", "#dc2626", "Canada Map"),
        ("municipal-accountability.html", "Municipal", "var(--gold,#facc15)", "Municipal Accountability"),
        ("healthcare-crisis.html", "Healthcare", "var(--accent)", "Healthcare Crisis"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "municipal-accountability": [
        ("municipal-intelligence.html", "Municipal", "#dc2626", "Municipal Intelligence"),
        ("provincial-analysis.html", "Provincial", "var(--gold,#facc15)", "Provincial Analysis"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "municipal-intelligence": [
        ("municipal-accountability.html", "Municipal", "#dc2626", "Municipal Accountability"),
        ("provincial-analysis.html", "Provincial", "var(--gold,#facc15)", "Provincial Analysis"),
        ("canada-map.html", "Geographic", "var(--accent)", "Canada Map"),
        ("network-analysis.html", "Network", "var(--accent)", "Network Analysis"),
    ],
    "belleville": [
        ("quinte-west.html", "Regional", "#dc2626", "Quinte West"),
        ("municipal-intelligence.html", "Municipal", "var(--gold,#facc15)", "Municipal Intelligence"),
        ("my-story.html", "Personal", "var(--accent)", "My Story"),
        ("veterans.html", "Veterans", "var(--accent)", "Veterans Investigation"),
    ],
    "quinte-west": [
        ("belleville.html", "Regional", "#dc2626", "Belleville"),
        ("municipal-intelligence.html", "Municipal", "var(--gold,#facc15)", "Municipal Intelligence"),
        ("municipal-accountability.html", "Accountability", "var(--accent)", "Municipal Accountability"),
        ("veterans.html", "Veterans", "var(--accent)", "Veterans Investigation"),
    ],
    "ottawa": [
        ("municipal-intelligence.html", "Municipal", "#dc2626", "Municipal Intelligence"),
        ("lobbying-deepdive.html", "Lobbying", "var(--gold,#facc15)", "Lobbying Deep Dive"),
        ("appointments.html", "Appointments", "var(--accent)", "Federal Appointments"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "calgary": [
        ("municipal-intelligence.html", "Municipal", "#dc2626", "Municipal Intelligence"),
        ("provincial-analysis.html", "Provincial", "var(--gold,#facc15)", "Provincial Analysis"),
        ("opioid-crisis.html", "Health", "var(--accent)", "Opioid Crisis"),
        ("housing-crisis.html", "Housing", "var(--accent)", "Housing Crisis"),
    ],
    "housing-crisis": [
        ("infrastructure-deficit.html", "Infrastructure", "#dc2626", "Infrastructure Deficit"),
        ("debt-fiscal.html", "Fiscal", "var(--gold,#facc15)", "Debt & Fiscal"),
        ("provincial-analysis.html", "Provincial", "var(--accent)", "Provincial Analysis"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "immigration-policy": [
        ("tfw-abuse.html", "Labour", "#dc2626", "TFW Abuse"),
        ("housing-crisis.html", "Housing", "var(--gold,#facc15)", "Housing Crisis"),
        ("provincial-analysis.html", "Provincial", "var(--accent)", "Provincial Analysis"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
    ],
    "infrastructure-deficit": [
        ("housing-crisis.html", "Housing", "#dc2626", "Housing Crisis"),
        ("debt-fiscal.html", "Fiscal", "var(--gold,#facc15)", "Debt & Fiscal"),
        ("procurement-registry.html", "Procurement", "var(--accent)", "Procurement Registry"),
        ("provincial-analysis.html", "Provincial", "var(--accent)", "Provincial Analysis"),
    ],
    "tfw-abuse": [
        ("immigration-policy.html", "Policy", "#dc2626", "Immigration Policy"),
        ("housing-crisis.html", "Housing", "var(--gold,#facc15)", "Housing Crisis"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
    "gillespie-murder": [
        ("acelephius-report.html", "Investigation", "#dc2626", "Acelephius Report"),
        ("cfnis.html", "Military Justice", "var(--gold,#facc15)", "CFNIS"),
        ("rcmp-complicity.html", "Law Enforcement", "var(--accent)", "RCMP Complicity"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
    ],
    "dossier-viewer": [
        ("evidence-index.html", "Evidence", "#dc2626", "Evidence Index"),
        ("network-analysis.html", "Network", "var(--gold,#facc15)", "Network Analysis"),
        ("convergence-matrix.html", "Matrix", "var(--accent)", "Convergence Matrix"),
        ("findings.html", "Analysis", "var(--accent)", "Key Findings"),
    ],
    # BATCH 8 — Media/Tech/Utility
    "media-concentration": [
        ("telecom-oligopoly.html", "Telecom", "#dc2626", "Telecom Oligopoly"),
        ("privacy-surveillance.html", "Privacy", "var(--gold,#facc15)", "Privacy & Surveillance"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("corruption-map.html", "Mapping", "var(--accent)", "Corruption Map"),
    ],
    "telecom-oligopoly": [
        ("media-concentration.html", "Media", "#dc2626", "Media Concentration"),
        ("privacy-surveillance.html", "Privacy", "var(--gold,#facc15)", "Privacy & Surveillance"),
        ("lobbying-deepdive.html", "Lobbying", "var(--accent)", "Lobbying Deep Dive"),
        ("sector-lobbying.html", "Sectors", "var(--accent)", "Sector Lobbying"),
    ],
    "privacy-surveillance": [
        ("telecom-oligopoly.html", "Telecom", "#dc2626", "Telecom Oligopoly"),
        ("ai-research.html", "Technology", "var(--gold,#facc15)", "AI Research"),
        ("media-concentration.html", "Media", "var(--accent)", "Media Concentration"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
    ],
    "ai-research": [
        ("privacy-surveillance.html", "Privacy", "#dc2626", "Privacy & Surveillance"),
        ("telecom-oligopoly.html", "Telecom", "var(--gold,#facc15)", "Telecom Oligopoly"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("convergence-matrix.html", "Network", "var(--accent)", "Convergence Matrix"),
    ],
    "email-campaign": [
        ("open-letter.html", "Action", "#dc2626", "Open Letter"),
        ("petitions.html", "Action", "var(--gold,#facc15)", "Petitions"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("my-story.html", "Personal", "var(--accent)", "My Story"),
    ],
    "open-letter": [
        ("email-campaign.html", "Action", "#dc2626", "Email Campaign"),
        ("petitions.html", "Action", "var(--gold,#facc15)", "Petitions"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("veterans-betrayal.html", "Veterans", "var(--accent)", "Veterans Betrayal"),
    ],
    "petitions": [
        ("open-letter.html", "Action", "#dc2626", "Open Letter"),
        ("email-campaign.html", "Action", "var(--gold,#facc15)", "Email Campaign"),
        ("accountability.html", "Accountability", "var(--accent)", "Accountability Database"),
        ("legislation.html", "Legal", "var(--accent)", "Legislation Analysis"),
    ],
    "my-story": [
        ("veterans-betrayal.html", "Veterans", "#dc2626", "Veterans Betrayal"),
        ("the-boot.html", "Personal", "var(--gold,#facc15)", "The Boot"),
        ("belleville.html", "Regional", "var(--accent)", "Belleville"),
        ("harm-index.html", "Harm", "var(--accent)", "Harm Index"),
    ],
    "ledger-book": [
        ("follow-the-money.html", "Financial", "#dc2626", "Follow the Money"),
        ("corruption-map.html", "Mapping", "var(--gold,#facc15)", "Corruption Map"),
        ("evidence-index.html", "Evidence", "var(--accent)", "Evidence Index"),
        ("cra-enforcement.html", "Enforcement", "var(--accent)", "CRA Enforcement"),
    ],
}

def build_new_ci(page_name):
    """Build the new [CONNECTED INTELLIGENCE] HTML block for a page."""
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

def find_old_ci_block(content):
    """Find and return the old Connected Intelligence block in file content.
    Returns (start_pos, end_pos) or None."""
    # Pattern 1: Single-line format (most common)
    # <div style="max-width:900px;margin:2rem auto;padding:1.5rem;"><h3...>Connected Intelligence</h3>.....</div></div>
    pattern1 = re.compile(
        r'[ \t]*<div\s+style="max-width:900px;margin:2rem auto;padding:1\.5rem;">'
        r'.*?Connected Intelligence</h3>'
        r'.*?</div>\s*</div>',
        re.DOTALL
    )
    
    m = pattern1.search(content)
    if m:
        return m.start(), m.end()
    
    # Pattern 2: Multi-line format where outer div is on its own line
    # <div style="max-width:900px;margin:2rem auto;padding:1.5rem;">
    #   <h3...>Connected Intelligence</h3>
    #   <div...>
    #     <a>...</a>
    #   </div>
    # </div>
    pattern2 = re.compile(
        r'[ \t]*<div\s+style="max-width:900px;margin:2rem auto;padding:1\.5rem;">\s*\n'
        r'.*?Connected Intelligence</h3>'
        r'.*?</div>\s*\n\s*</div>',
        re.DOTALL
    )
    
    m = pattern2.search(content)
    if m:
        return m.start(), m.end()
    
    return None

def process_file(filepath, page_name):
    """Process a single file: replace old CI with new CI block."""
    new_ci = build_new_ci(page_name)
    if not new_ci:
        return False, f"No cross-links defined for {page_name}"
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verify old CI exists
    if 'Connected Intelligence</h3>' not in content:
        return False, f"No old CI block found in {page_name}"
    
    # Already has new CI?
    if '[CONNECTED INTELLIGENCE]' in content:
        return False, f"Already has new CI: {page_name}"
    
    result = find_old_ci_block(content)
    if not result:
        return False, f"Could not locate old CI block boundaries in {page_name}"
    
    start, end = result
    old_block = content[start:end]
    
    # Preserve leading whitespace from the old block
    new_content = content[:start] + new_ci + content[end:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, f"Updated {page_name}"

def verify_file(filepath, page_name):
    """Verify a file has the correct structure after update."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    if '[CONNECTED INTELLIGENCE]' not in content:
        issues.append("Missing new CI block")
    if 'Connected Intelligence</h3>' in content:
        issues.append("Old CI block still present")
    if 'id="site-footer-frame"' not in content:
        issues.append("Missing footer frame")
    if 'shell.js' not in content:
        issues.append("Missing shell.js")
    
    return issues

def main():
    import sys
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Which batch to process? Pass as argument or do all
    batch_arg = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    batches = {
        "1": ["accountability", "evidence-index", "findings", "harm-index", "corruption-map",
              "follow-the-money", "scandals", "records", "convergence-matrix", "conspiracy-board"],
        "2": ["veterans", "veterans-betrayal", "caf-recruitment-crisis", "caf-recruitment",
              "cds-accountability", "cds-carignan-charges", "cfnis", "ppcli-lawsuit",
              "dnd-procurement", "arms-pipeline"],
        "3": ["disability-genocide", "cija-maid-pipeline", "maid-policy-evolution",
              "healthcare-crisis", "opioid-crisis", "rcmp-maid-accountability",
              "covid-accountability", "the-boot"],
        "4": ["rcmp-commissioners", "rcmp-complicity", "rcmp-reform", "judicial-appointments",
              "s504-court-filing", "s504-covey-bae", "treason-trajectory", "rogue-state"],
        "5": ["foreign-influence", "foreign-interference", "foreign-interference-deep",
              "network-analysis", "cross-reference", "mp-analysis", "mp-brief",
              "carney-conflicts", "acelephius-report", "acelephius-wardoll"],
        "6": ["procurement-registry", "crown-corporations", "cra-enforcement", "debt-fiscal",
              "arrivecan", "lobbying-deepdive", "sector-lobbying", "wef-davos",
              "appointments", "legislation"],
        "7": ["canada-map", "provincial-analysis", "municipal-accountability",
              "municipal-intelligence", "belleville", "quinte-west", "ottawa", "calgary",
              "housing-crisis", "immigration-policy", "infrastructure-deficit", "tfw-abuse",
              "gillespie-murder", "dossier-viewer"],
        "8": ["media-concentration", "telecom-oligopoly", "privacy-surveillance",
              "ai-research", "email-campaign", "open-letter", "petitions", "my-story",
              "ledger-book"],
    }
    
    if batch_arg == "all":
        pages = []
        for b in sorted(batches.keys()):
            pages.extend(batches[b])
    elif batch_arg in batches:
        pages = batches[batch_arg]
    else:
        print(f"Unknown batch: {batch_arg}. Use 1-8 or 'all'.")
        sys.exit(1)
    
    print(f"Processing {len(pages)} pages (batch: {batch_arg})...")
    
    success = 0
    failed = 0
    for page_name in pages:
        filepath = os.path.join(base_dir, f"{page_name}.html")
        if not os.path.exists(filepath):
            print(f"  SKIP: {page_name}.html not found")
            failed += 1
            continue
        
        ok, msg = process_file(filepath, page_name)
        if ok:
            issues = verify_file(filepath, page_name)
            if issues:
                print(f"  WARN: {page_name} — {', '.join(issues)}")
            else:
                print(f"  OK: {page_name}")
            success += 1
        else:
            print(f"  FAIL: {msg}")
            failed += 1
    
    print(f"\nDone: {success} updated, {failed} failed/skipped")

if __name__ == "__main__":
    main()
