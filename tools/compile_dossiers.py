#!/usr/bin/env python3
"""Compile OSINT dossiers from agent research into master file."""
import json

dossiers = {
    "generated": "2026-04-11",
    "source": "Public OSINT - OpenParliament, lobbying registry, CBC, Globe and Mail, government records",
    "note": "All claims sourced from publicly available records. No dark web sources.",
    "total_profiles": 9,
    "profiles": [
        {
            "name": "Jonathan Wilkinson",
            "riding": "North Vancouver-Capilano",
            "party": "Liberal",
            "lobbying_contacts": 1346,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [
                "Democracy Watch conflict of interest complaint (2023): spouse investments in Teck Resources institutional shareholders while making Teck mine pollution decisions",
                "Former CEO of BioteQ which had a Teck contract"
            ],
            "lobbying_intel": "34 oil/gas lobbying meetings in 2023, 15 in 2024. CAPP and Pathways Alliance primary lobbyists.",
            "foreign_connections": "No CIJA/Israel trips found",
            "financial_flags": "Spouse investments in RBC, TD, BlackRock (Teck institutional shareholders)",
            "ethics_status": "Democracy Watch complaint filed"
        },
        {
            "name": "Julie Dabrusin",
            "riding": "Toronto-Danforth",
            "party": "Liberal",
            "lobbying_contacts": 995,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [],
            "lobbying_intel": "995 contacts, primarily environment/climate",
            "foreign_connections": "Jewish heritage, pre-political Israel visits, Aug 2025 Israel/Palestine statement",
            "financial_flags": "No violations found",
            "ethics_status": "Clean"
        },
        {
            "name": "Judy Sgro",
            "riding": "Humber River-Black Creek",
            "party": "Liberal",
            "lobbying_contacts": 833,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [
                "Strippergate (2004): resigned as Immigration Minister over visa for Romanian stripper/campaign supporter",
                "$60,000 repaid for improper living expense claims on condo transferred to children",
                "Conflicting stories about 2017 Italy trip funding; refused documentation"
            ],
            "lobbying_intel": "833 contacts",
            "foreign_connections": "IPAC member, APT31 Chinese state hacking target (2021), Taiwan delegation ($9,500+ sponsored)",
            "financial_flags": "$60K improper expenses, $24K+ sponsored travel",
            "ethics_status": "Multiple violations"
        },
        {
            "name": "Terry Duguid",
            "riding": "Winnipeg South",
            "party": "Liberal",
            "lobbying_contacts": 742,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [],
            "lobbying_intel": "742 contacts, environment/budget/infrastructure/climate",
            "foreign_connections": "Vice-Chair Canada-China Legislative Association, 2-week China tour Aug 2017",
            "financial_flags": "No violations found",
            "ethics_status": "Clean"
        },
        {
            "name": "Sean Fraser",
            "riding": "Central Nova",
            "party": "Liberal",
            "lobbying_contacts": 673,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [
                "International student fraud: 800 cases, only 2K of 150K investigated (Auditor General)",
                "Record population growth (4.7 people per housing unit) as Immigration Minister",
                "Called most incompetent immigration minister in Canadian history",
                "Housing Minister tenure criticized during worst housing crisis",
                "Retirement reversal after Carney call (Dec 2024)"
            ],
            "lobbying_intel": "673 contacts incl. Rogers Communications, Irving Shipbuilding",
            "foreign_connections": "No Israel/China group membership found",
            "financial_flags": "No ethics violations found",
            "ethics_status": "No formal findings, major policy failures"
        },
        {
            "name": "James Maloney",
            "riding": "Etobicoke-Lakeshore",
            "party": "Liberal",
            "lobbying_contacts": 614,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [
                "Ethics breach (2020): failed to disclose SNC-Lavalin + 43 corporate holdings. Ethics office contacted 15 TIMES.",
                "House rejected ethics report 153-133",
                "Rezoning controversy (2016): office in developer building ($12,435/quarter public funds)"
            ],
            "lobbying_intel": "614 contacts. Met Pathways Alliance (oil sands). TELUS, Snap ULC.",
            "foreign_connections": "Member Canada/Israel Interparliamentary Group",
            "financial_flags": "Shares in SNC-Lavalin + 43 corps (Apple, Google, Facebook, Philip Morris, Suncor). $12,435/quarter developer office.",
            "ethics_status": "Ethics Commissioner: GUILTY of breach"
        },
        {
            "name": "Randeep Sarai",
            "riding": "Surrey Centre",
            "party": "Liberal",
            "lobbying_contacts": 571,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [
                "Invited convicted attempted murderer Jaspal Atwal to PM India reception (2018)",
                "Law license suspended by BC Law Society (2005): trust accounting, conflict of interest",
                "Fined $200 Conflict of Interest Act (2026) -- 10th Liberal found in breach"
            ],
            "lobbying_intel": "571 contacts. Cooperation Canada, Save the Children, CMA, NCCM.",
            "foreign_connections": "Indiaspora.org listed. 2018 Atwal incident (foreign influence questions).",
            "financial_flags": "$200 ethics fine, law license trust accounting failures",
            "ethics_status": "3 documented violations"
        },
        {
            "name": "Greg Fergus",
            "riding": "Hull-Aylmer",
            "party": "Liberal",
            "lobbying_contacts": 558,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [
                "Ethics breach (2023): CRTC letter while Parliamentary Secretary -- prohibited quasi-judicial intervention",
                "Partisan Speaker video (2023): wore robes in Liberal tribute, fined",
                "Partisan fundraiser attacked Conservative leader (2024)",
                "Ejected Opposition Leader from House (2024) -- first time in history",
                "Ruled government defied Parliament on SDTC documents (2024)"
            ],
            "lobbying_intel": "558 contacts. Parl Sec to PM + 4 ministers -- high-value target.",
            "foreign_connections": "No foreign interference allegations found",
            "financial_flags": "Ethics breach fine, Speaker robes fine",
            "ethics_status": "Ethics Commissioner: GUILTY of breach"
        },
        {
            "name": "Karina Gould",
            "riding": "Burlington",
            "party": "Liberal",
            "lobbying_contacts": 525,
            "maid_votes": ["C-14", "C-7"],
            "controversies": [
                "Refused SDTC documents as Government House Leader (2024)",
                "CJPME grade D+ on Palestinian human rights",
                "Liberal leadership: placed 3rd with 3% (2025)"
            ],
            "lobbying_intel": "525 contacts across all policy domains (4 ministerial portfolios, 8 years)",
            "foreign_connections": "WEF Young Global Leader (2019/2020). Israel Independence Day speech (2019). Parents met on kibbutz. Voted to condemn BDS.",
            "financial_flags": "No violations found",
            "ethics_status": "No personal violations"
        }
    ]
}

with open("data/osint_vault/maid_mp_dossiers.json", "w", encoding="utf-8") as f:
    json.dump(dossiers, f, indent=2, ensure_ascii=False)

ethics = sum(1 for p in dossiers["profiles"] if "GUILTY" in p.get("ethics_status", "").upper() or "violation" in p.get("ethics_status", "").lower())
controv = sum(len(p["controversies"]) for p in dossiers["profiles"])
israel = sum(1 for p in dossiers["profiles"] if "Israel" in p.get("foreign_connections", ""))

print(f"Compiled {dossiers['total_profiles']} dossiers")
print(f"Ethics breaches: {ethics}")
print(f"Total controversies: {controv}")
print(f"Israel connections: {israel}")
print("Saved to data/osint_vault/maid_mp_dossiers.json")
