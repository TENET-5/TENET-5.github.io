# Add MAID / Rome Statute / Nuremberg charges to the 504 criminal code database
# Modified: 2026-04-10 | Author: claude_code
import json
from pathlib import Path

DATA = Path(__file__).parent.parent / "data" / "criminal_code_analysis.json"

with open(DATA, "r", encoding="utf-8") as f:
    d = json.load(f)

# Add international law sections
d["criminal_code_sections"]["rome_statute"] = {
    "section": "Rome Statute",
    "title": "Rome Statute of the International Criminal Court (Articles 7, 8)",
    "max_penalty": "Life imprisonment / ICC jurisdiction",
    "summary": "Article 7: Crimes against humanity including murder, extermination, and other inhumane acts intentionally causing great suffering when committed as part of a widespread or systematic attack directed against any civilian population. Article 28: Command responsibility.",
    "url": "https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf",
}

d["criminal_code_sections"]["nuremberg_principles"] = {
    "section": "Nuremberg Principles",
    "title": "Nuremberg Principles (Crimes Against Humanity)",
    "max_penalty": "Death / Life imprisonment (historical)",
    "summary": "Principle VI(c): Crimes against humanity. Principle IV: following orders is not a defense. Established individual criminal responsibility for state-authorized crimes.",
    "url": "https://legal.un.org/ilc/texts/instruments/english/draft_articles/7_1_1950.pdf",
}

d["criminal_code_sections"]["crimes_against_humanity_act"] = {
    "section": "Crimes Against Humanity and War Crimes Act (Canada)",
    "title": "Crimes Against Humanity and War Crimes Act, S.C. 2000, c. 24",
    "max_penalty": "Life imprisonment",
    "summary": "Canadian domestic law implementing the Rome Statute. Section 4: genocide, crimes against humanity, war crimes. Canada has universal jurisdiction.",
    "url": "https://laws-lois.justice.gc.ca/eng/acts/c-45.9/page-1.html",
}

# MAID findings under Rome Statute
maid_findings = [
    {
        "id": "F-MAID-001",
        "section": "Rome Statute",
        "section_title": "Rome Statute Art. 7 \u2014 Crimes Against Humanity",
        "section_url": "https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf",
        "max_penalty": "Life imprisonment / ICC jurisdiction",
        "severity": "critical",
        "entity": "Justin Trudeau",
        "entity_type": "pm",
        "description": "As PM, sponsored Bills C-14 (2016) and C-7 (2021) authorizing state-administered death (MAID) resulting in 76,475+ deaths. Rome Statute Art. 7(1)(a): murder; Art. 7(1)(k): other inhumane acts \u2014 widespread or systematic attack against civilian population.",
        "evidence": [
            {"fact": "MAID deaths reached 76,475 by 2024 (Health Canada). 45 deaths/day. 1 in 20 Canadian deaths.", "year": 2024, "source": "https://www.canada.ca/en/health-canada/services/medical-assistance-dying.html"},
            {"fact": "Bill C-7 removed terminal illness requirement, expanding to poverty, disability, homelessness.", "year": 2021, "source": "https://www.parl.ca/DocumentViewer/en/43-2/bill/C-7/royal-assent"},
            {"fact": "VAC offered MAID to Paralympian Christine Gauthier instead of wheelchair ramp.", "year": 2022, "source": "https://www.cbc.ca/news/politics/veterans-maid-gauthier-1.6672020"},
        ],
        "data_source": "Health Canada annual reports + parliamentary records",
        "legal_basis": "Rome Statute Art. 7(1)(a)(k): widespread attack against civilian population. Canadian Crimes Against Humanity Act s.4. Nuremberg Principle IV: orders are not a defense.",
        "action": "s.504 private prosecution + ICC referral available",
    },
    {
        "id": "F-MAID-002",
        "section": "Rome Statute",
        "section_title": "Rome Statute Art. 7 \u2014 Crimes Against Humanity",
        "section_url": "https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf",
        "max_penalty": "Life imprisonment / ICC jurisdiction",
        "severity": "critical",
        "entity": "David Lametti",
        "entity_type": "minister",
        "description": "Sponsored Bill C-7 as Minister of Justice. Removed reasonably foreseeable death safeguard. Enabled state death for poverty, disability, chronic conditions. Nuremberg: individuals bear personal responsibility regardless of position.",
        "evidence": [
            {"fact": "Sponsored Bill C-7. Removed terminal illness requirement.", "year": 2021, "source": "https://openparliament.ca/bills/43-2/C-7/"},
        ],
        "data_source": "parliamentary records",
        "legal_basis": "Rome Statute Art. 7(1). Nuremberg Principle IV.",
        "action": "s.504 private prosecution + ICC referral",
    },
    {
        "id": "F-MAID-003",
        "section": "Rome Statute",
        "section_title": "Rome Statute Art. 28 \u2014 Command Responsibility",
        "section_url": "https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf",
        "max_penalty": "Life imprisonment / ICC jurisdiction",
        "severity": "critical",
        "entity": "Bill Blair",
        "entity_type": "minister",
        "description": "As Minister of Public Safety, had direct RCMP oversight while voting YEA on C-7. Controlled police AND voted to expand death legislation. Rome Statute Art. 28: command responsibility.",
        "evidence": [
            {"fact": "Voted YEA on C-7 while serving as Public Safety Minister with RCMP oversight.", "year": 2021, "source": "https://www.ourcommons.ca/members/en/votes/43/2/72"},
        ],
        "data_source": "parliamentary voting records + ministerial mandate",
        "legal_basis": "Rome Statute Art. 28: responsibility of commanders and superiors.",
        "action": "s.504 private prosecution + ICC referral",
    },
    {
        "id": "F-MAID-004",
        "section": "Rome Statute",
        "section_title": "Rome Statute Art. 28 \u2014 Command Responsibility",
        "section_url": "https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf",
        "max_penalty": "Life imprisonment",
        "severity": "critical",
        "entity": "Bob Paulson",
        "entity_type": "rcmp_commissioner",
        "description": "RCMP Commissioner when C-14 passed (June 2016). Failed to mobilize federal police against legislation authorizing systematic termination of citizens.",
        "evidence": [
            {"fact": "RCMP Commissioner when Bill C-14 received Royal Assent. Did not intervene.", "year": 2016, "source": "https://en.wikipedia.org/wiki/Bob_Paulson_(police_commissioner)"},
        ],
        "data_source": "rcmp_maid_accountability.md",
        "legal_basis": "Rome Statute Art. 28: superior responsibility for failure to prevent crimes.",
        "action": "s.504 private prosecution",
    },
    {
        "id": "F-MAID-005",
        "section": "Rome Statute",
        "section_title": "Rome Statute Art. 28 \u2014 Command Responsibility",
        "section_url": "https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf",
        "max_penalty": "Life imprisonment",
        "severity": "critical",
        "entity": "Brenda Lucki",
        "entity_type": "rcmp_commissioner",
        "description": "RCMP Commissioner when C-7 passed (March 2021). Failed to intervene against expansion of state death to non-terminal conditions.",
        "evidence": [
            {"fact": "RCMP Commissioner when Bill C-7 received Royal Assent. Did not intervene.", "year": 2021, "source": "https://en.wikipedia.org/wiki/Brenda_Lucki"},
        ],
        "data_source": "rcmp_maid_accountability.md",
        "legal_basis": "Rome Statute Art. 28: superior responsibility.",
        "action": "s.504 private prosecution",
    },
    {
        "id": "F-MAID-006",
        "section": "Rome Statute",
        "section_title": "Rome Statute Art. 7 \u2014 Crimes Against Humanity",
        "section_url": "https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf",
        "max_penalty": "Life imprisonment / ICC jurisdiction",
        "severity": "critical",
        "entity": "Ralph Goodale",
        "entity_type": "minister",
        "description": "Minister of Public Safety (2015-2019) with direct RCMP oversight when C-14 passed. Failed to direct RCMP to intervene against authorization of state-administered death.",
        "evidence": [
            {"fact": "Minister of Public Safety overseeing RCMP when C-14 received Royal Assent.", "year": 2016, "source": "https://en.wikipedia.org/wiki/Ralph_Goodale"},
        ],
        "data_source": "rcmp_maid_accountability.md",
        "legal_basis": "Rome Statute Art. 28: civilian superior responsibility.",
        "action": "s.504 private prosecution",
    },
]

d["findings"].extend(maid_findings)
d["statistics"]["total_findings"] = len(d["findings"])
d["statistics"]["by_section"]["rome_statute"] = len(maid_findings)

with open(DATA, "w", encoding="utf-8") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)

print(f"Added {len(maid_findings)} MAID/Rome Statute findings to 504 database")
print(f"Total findings: {d['statistics']['total_findings']}")
print(f"New sections: Rome Statute, Nuremberg Principles, Crimes Against Humanity Act")
