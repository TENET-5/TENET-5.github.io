#!/usr/bin/env python3
"""Add batch 2 OSINT findings to master dossier file."""
import json

with open("data/osint_vault/maid_mp_dossiers.json", "r", encoding="utf-8") as f:
    dossiers = json.load(f)

batch2 = [
    {
        "name": "Sean Casey",
        "riding": "Charlottetown",
        "party": "Liberal",
        "lobbying_contacts": 439,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Was registered consultant lobbyist before entering Parliament",
            "Called on Trudeau to resign over Freeland resignation (Dec 2024)"
        ],
        "lobbying_intel": "439 contacts. Former lobbyist himself (clients: ole, Beaverbrook Art Gallery).",
        "foreign_connections": "No foreign connections found",
        "financial_flags": "Interest in Other Ocean Partners North ULC, Sean J. Casey Family Trust",
        "ethics_status": "Clean"
    },
    {
        "name": "Salma Zahid",
        "riding": "Scarborough Centre--Don Valley East",
        "party": "Liberal",
        "lobbying_contacts": 431,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Holocaust denial event: Parliament Hill reception (Nov 2022), Nazih Khatatba of Meshwar Media attended",
            "Threatened to resign committee duties over Gaza (Jul 2024), never followed through",
            "Supported South Africa ICJ genocide case against Israel (Jan 2024)"
        ],
        "lobbying_intel": "431 contacts. Chair Canada-Palestine Parliamentary Friendship Group.",
        "foreign_connections": "Chair Canada-Palestine Friendship Group. Pro-Palestinian advocacy. B'nai Brith demanded she address Khatatba scandal.",
        "financial_flags": "No violations found",
        "ethics_status": "No formal violations, Holocaust denial event controversy"
    },
    {
        "name": "Peter Fragiskatos",
        "riding": "London Centre",
        "party": "Liberal",
        "lobbying_contacts": 411,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Office vandalized twice in 3 weeks during pro-Palestine protests (Oct-Nov 2023)",
            "Called on Trudeau to resign (Jan 2025)"
        ],
        "lobbying_intel": "411 contacts. Parl Sec to Immigration Minister.",
        "foreign_connections": "Greek heritage. Foreign Affairs subcommittee member.",
        "financial_flags": "No violations found",
        "ethics_status": "Clean"
    },
    {
        "name": "Sonia Sidhu",
        "riding": "Brampton South",
        "party": "Liberal",
        "lobbying_contacts": 411,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Campaign signs vandalized (2019)",
            "Spoke on RCMP evidence of Indian govt agents involved in Canadian homicides"
        ],
        "lobbying_intel": "411 contacts. Authored Bill C-237 (National Diabetes Framework).",
        "foreign_connections": "General-Secretary Canada-India Parliamentary Friendship Group. Condemned Brampton temple violence amid India-Khalistan tensions.",
        "financial_flags": "No violations found",
        "ethics_status": "Clean"
    },
    {
        "name": "Ali Ehsassi",
        "riding": "Willowdale",
        "party": "Liberal",
        "lobbying_contacts": 399,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Iranian diplomatic dynasty: great-grandfather was Pahlavi Minister of Court (Abdolhossein Teymourtash)",
            "Organized controversial Stephane Dion Iran re-engagement roundtable (2016) -- guest list accused of being stacked",
            "Called for public inquiry into Iranian interference in Canadian elections"
        ],
        "lobbying_intel": "399 contacts. Chair Foreign Affairs Committee since 2022.",
        "foreign_connections": "Iranian diplomatic family background. Father was Iranian diplomat. Vocal critic of Islamic Republic. Organized Iran roundtable.",
        "financial_flags": "No violations found",
        "ethics_status": "Clean"
    },
    {
        "name": "Chris Bittle",
        "riding": "St. Catharines",
        "party": "Liberal",
        "lobbying_contacts": 379,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Bill C-11 witness intimidation: senators condemned tactics against Digital First Canada director",
            "Hostile treatment of Meta witnesses during Bill C-18 hearings",
            "Indigenous creator alleged government gaslighting over C-11 concerns"
        ],
        "lobbying_intel": "379 contacts. Now Chair of PROC committee.",
        "foreign_connections": "No foreign connections found",
        "financial_flags": "No violations found",
        "ethics_status": "Clean, witness intimidation allegations"
    },
    {
        "name": "Wayne Long",
        "riding": "Saint John-Kennebecasis",
        "party": "Liberal",
        "lobbying_contacts": 378,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Anti-Palestinian remarks at Gaza solidarity protest (Dec 2023), staffer accused protesters of believing in terrorism",
            "Removed from two committees (2017) for breaking party ranks on small business tax reform",
            "Broke ranks calling for SNC-Lavalin investigation (2019)"
        ],
        "lobbying_intel": "378 contacts. Now Secretary of State for CRA and Financial Institutions.",
        "foreign_connections": "Anti-Palestinian activism documented. Continued confrontations with solidarity activists through 2024.",
        "financial_flags": "No violations found",
        "ethics_status": "Clean"
    },
    {
        "name": "Bardish Chagger",
        "riding": "Waterloo",
        "party": "Liberal",
        "lobbying_contacts": 350,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "Signed WE Charity sole-sourced contract worth $43.53M (originally reported $19.5M) as Minister of Diversity",
            "Met WE Charity days before PM announced program",
            "NDP identified her as key driver of WE decision",
            "Refused to resign. Removed from cabinet in 2021 reshuffle",
            "Resigned unexpectedly as PROC chair (Apr 2024)"
        ],
        "lobbying_intel": "350 contacts.",
        "foreign_connections": "Indian heritage (Sikh). No foreign lobbying connections documented.",
        "financial_flags": "$43.53M WE Charity sole-sourced contract signed by her",
        "ethics_status": "WE Charity scandal -- no formal ethics finding but key driver of decision"
    },
    {
        "name": "Ginette Petitpas Taylor",
        "riding": "Moncton-Dieppe",
        "party": "Liberal",
        "lobbying_contacts": 317,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "As Veterans Affairs Minister, admitted she had not read the Desmond inquiry report when responding publicly",
            "As Health Minister, oversaw cannabis legalization (C-45)"
        ],
        "lobbying_intel": "317 contacts. Now President of Treasury Board. Has held Health, Languages, Veterans, Employment portfolios.",
        "foreign_connections": "Chairs Canada-France Inter-Parliamentary Association. No other foreign ties.",
        "financial_flags": "No violations found",
        "ethics_status": "Clean"
    },
    {
        "name": "Anthony Housefather",
        "riding": "Mount Royal",
        "party": "Liberal",
        "lobbying_contacts": 315,
        "maid_votes": ["C-14", "C-7"],
        "controversies": [
            "#1 most-lobbied MP by CIJA (67-87 meetings)",
            "Chairs Canada-Israel Friendship Group AND Canada-Israel Interparliamentary Group",
            "Co-founded Inter-Parliamentary Task Force to Combat Antisemitism",
            "Voted AGAINST Gaza ceasefire motion",
            "Voted AGAINST ending arms exports to Israel",
            "Stated he would always be a strong supporter of Israel",
            "Appointed Special Advisor on Jewish Community Relations and Antisemitism (Jul 2024) despite CIJA ties"
        ],
        "lobbying_intel": "315 total contacts. 67-87 CIJA meetings. CIJA spent $678,277 on Israel trips for MPs since 2007.",
        "foreign_connections": "Most extensive Israel connections of any MP. Chairs Israel friendship and interparliamentary groups. CIJA top contact. Anti-ceasefire, anti-arms embargo votes.",
        "financial_flags": "CIJA sponsored travel. $678K total CIJA MP trip spending.",
        "ethics_status": "No formal violations but extensive foreign lobby influence"
    }
]

existing_names = {p["name"] for p in dossiers["profiles"]}
added = 0
for p in batch2:
    if p["name"] not in existing_names:
        dossiers["profiles"].append(p)
        added += 1

dossiers["total_profiles"] = len(dossiers["profiles"])

with open("data/osint_vault/maid_mp_dossiers.json", "w", encoding="utf-8") as f:
    json.dump(dossiers, f, indent=2, ensure_ascii=False)

ethics = sum(1 for p in dossiers["profiles"] if "GUILTY" in p.get("ethics_status", "").upper() or "PROVEN" in p.get("ethics_status", "").upper() or "Multiple" in p.get("ethics_status", ""))
controv = sum(len(p["controversies"]) for p in dossiers["profiles"])
print(f"Added {added} new profiles (batch 2a + 2b)")
print(f"Total profiles: {dossiers['total_profiles']}")
print(f"Total controversies: {controv}")
print(f"Ethics breaches: {ethics}")
