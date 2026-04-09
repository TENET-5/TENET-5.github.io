#!/usr/bin/env python3
"""Generate municipal data for Kingston and Peterborough — nearby Belleville investigation zone."""
import json, os
from datetime import datetime, timezone

OUT = os.path.join(os.path.dirname(__file__), '..', 'municipal')
os.makedirs(OUT, exist_ok=True)

kingston = {
    "municipality": "City of Kingston",
    "province": "Ontario",
    "generated": datetime.now(timezone.utc).isoformat(),
    "population": 136685,
    "region": "Eastern Ontario",
    "county": "Frontenac",
    "website": "https://www.cityofkingston.ca",
    "council": [
        {"name": "Bryan Paterson", "role": "Mayor", "ward": "At-large", "notes": "Third-term mayor. Physicist."},
        {"name": "Robert Kiley", "role": "Councillor", "ward": "Collins-Bayridge"},
        {"name": "Simon Farbod Feigin", "role": "Councillor", "ward": "Countryside"},
        {"name": "Bridget Doherty", "role": "Councillor", "ward": "Kingscourt-Rideau"},
        {"name": "Wayne Hill", "role": "Councillor", "ward": "Loyalist-Cataraqui"},
        {"name": "Jeff McLaren", "role": "Councillor", "ward": "Meadowbrook-Strathcona"},
        {"name": "Adam Brathwaite", "role": "Councillor", "ward": "Lakeside"},
        {"name": "Lisa Osanic", "role": "Councillor", "ward": "Pittsburgh"},
        {"name": "Paige Agnew", "role": "Councillor", "ward": "Williamsville"},
        {"name": "Jeremy Freiburger", "role": "Councillor", "ward": "Kings Town"},
        {"name": "Rob Gilligan", "role": "Councillor", "ward": "Sydenham"},
        {"name": "Greg Kidd", "role": "Councillor", "ward": "Trillium"},
        {"name": "Ryan Boehme", "role": "Councillor", "ward": "Portsmouth"},
    ],
    "key_issues": [
        {"title": "Third Crossing Bridge Cost Overruns", "year": "2019-2024", "severity": "high",
         "description": "Waaban Crossing project saw significant cost increases from ~$180M estimate. Opened Dec 2024 after delays."},
        {"title": "Housing Affordability Crisis", "year": "2023-present", "severity": "high",
         "description": "Among highest rents in Ontario outside GTA. Queens/RMC student demand. Vacancy below 1%."},
        {"title": "Federal Corrections Hub", "year": "ongoing", "severity": "medium",
         "description": "Home to multiple federal institutions. Kingston Penitentiary closed 2013. Economic dependency on corrections."},
    ],
    "flags": ["Third Crossing cost overruns", "Severe housing crisis (sub-1% vacancy)", "Federal corrections economic dependency"],
    "budget_highlights": [{"year": 2025, "total_budget": 500000000, "notes": "Includes Third Crossing debt servicing"}],
    "court_cases": [],
    "cross_references": [],
    "system_seed": 118400
}

peterborough = {
    "municipality": "City of Peterborough",
    "province": "Ontario",
    "generated": datetime.now(timezone.utc).isoformat(),
    "population": 83651,
    "region": "Kawarthas",
    "county": "Peterborough",
    "website": "https://www.peterborough.ca",
    "council": [
        {"name": "Jeff Leal", "role": "Mayor", "ward": "At-large", "notes": "Former Liberal MPP 2003-2018. Former ON Minister of Agriculture."},
        {"name": "Keith Riel", "role": "Councillor", "ward": "Monaghan"},
        {"name": "Joy Lachica", "role": "Councillor", "ward": "Northcrest"},
        {"name": "Don Vassiliadis", "role": "Councillor", "ward": "Otonabee"},
        {"name": "Lesley Parnell", "role": "Councillor", "ward": "Ashburnham"},
        {"name": "Gary Baldwin", "role": "Councillor", "ward": "Town Ward"},
        {"name": "Alex Bierk", "role": "Councillor", "ward": "Town Ward"},
    ],
    "key_issues": [
        {"title": "Opioid and Homelessness Crisis", "year": "2020-present", "severity": "critical",
         "description": "One of highest per-capita opioid death rates in Ontario. Tent encampments. CTS site contentious."},
        {"title": "Jeff Leal Provincial-Municipal Revolving Door", "year": "2022-present", "severity": "high",
         "description": "Mayor served 15 years as Liberal MPP + Agriculture Minister. Same revolving door pattern as Neil Ellis in Belleville.", "cc_section": "s.121"},
        {"title": "Dean Del Mastro — Only Modern MP Imprisoned for Election Fraud", "year": "2014", "severity": "critical",
         "description": "Former CPC MP convicted: overspending, failing to report $21K contribution. 1 month prison + 4 months house arrest.", "cc_section": "cea"},
    ],
    "flags": [
        "Mayor is former 15-year provincial Liberal MPP — revolving door",
        "Former MP Del Mastro convicted of election fraud (only modern MP imprisoned)",
        "Highest opioid death rates per capita in Ontario",
        "Severe homelessness crisis"
    ],
    "budget_highlights": [{"year": 2025, "total_budget": 280000000, "notes": "Opioid response costs significant"}],
    "court_cases": [
        {"title": "R. v. Del Mastro", "court": "Ontario Court of Justice", "year": 2014,
         "summary": "Former CPC MP guilty of election overspending. 1 month prison + 4 months house arrest.",
         "url": "https://www.canlii.org/en/on/oncj/doc/2014/2014oncj645/2014oncj645.html"}
    ],
    "cross_references": [
        {"name": "Dean Del Mastro", "connection": "Convicted former MP. CRITICAL in charges_sheet.json — Canada Elections Act."},
        {"name": "Jeff Leal", "connection": "Former Liberal MPP 2003-2018. Provincial-municipal revolving door."}
    ],
    "system_seed": 118400
}

with open(os.path.join(OUT, 'kingston.json'), 'w', encoding='utf-8') as f:
    json.dump(kingston, f, indent=2, ensure_ascii=False)
print(f"Kingston: {len(kingston['council'])} council, {len(kingston['key_issues'])} issues")

with open(os.path.join(OUT, 'peterborough.json'), 'w', encoding='utf-8') as f:
    json.dump(peterborough, f, indent=2, ensure_ascii=False)
print(f"Peterborough: {len(peterborough['council'])} council, {len(peterborough['key_issues'])} issues")
