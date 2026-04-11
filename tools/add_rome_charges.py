#!/usr/bin/env python3
"""Add Rome Statute charges to Justin Trudeau in charges_sheet.json."""
import json

with open("data/charges_sheet.json", "r", encoding="utf-8") as f:
    cs = json.load(f)

for ind in cs["individuals"]:
    if ind["name"] == "Justin Trudeau":
        # Crimes Against Humanity
        ind["charges"].append({
            "charge_id": "ROME-0001",
            "section": "Rome Statute Art. 7 / CAHC s.4",
            "section_title": "Crimes Against Humanity",
            "severity": "critical",
            "description": "As Prime Minister, authorized and expanded MAID legislation (C-14, C-7) enabling systematic state-administered killing of vulnerable Canadians. MAID deaths exceeded 13,241 in 2022 (4.1% of all Canadian deaths). UN Special Rapporteur on disability rights expressed concern about MAID regime targeting disabled Canadians.",
            "max_penalty": "Life imprisonment (Crimes Against Humanity and War Crimes Act s.4)",
            "evidence": [
                {"fact": "Tabled and passed Bill C-14 (2016) and Bill C-7 (2021)", "source": "https://openparliament.ca/votes/42-1/76/"},
                {"fact": "13,241 MAID deaths in 2022 alone (4.1% of all Canadian deaths)", "source": "https://www.canada.ca/en/health-canada/services/medical-assistance-dying/annual-report-2022.html"},
                {"fact": "UN Special Rapporteur flagged Canadian MAID as threat to disabled persons", "source": "https://www.ohchr.org/en/press-releases/2021/01/disability-not-reason-sanction-medically-assisted-dying"},
                {"fact": "Veterans Affairs offered MAID to veteran seeking PTSD help", "source": "https://www.cbc.ca/news/politics/veterans-affairs-maid-rcmp-investigation-1.6662539"},
            ],
            "legal_basis": "Rome Statute Article 7(1)(a)(b)(d)(k): Murder, extermination, persecution. Crimes Against Humanity and War Crimes Act (S.C. 2000, c.24) s.4.",
            "data_source": "maid_votes.json + Health Canada annual reports",
            "action": "s.504 private prosecution + ICC complaint pathway"
        })

        # Mass Murder
        ind["charges"].append({
            "charge_id": "ROME-0002",
            "section": "235(1) / Rome Statute Art. 7(1)(a)",
            "section_title": "First Degree Murder (Mass) / Murder as Crime Against Humanity",
            "severity": "critical",
            "description": "Command responsibility for 44,958+ MAID deaths (2016-2022 cumulative). Deaths are planned, deliberate, state-administered. Targets identifiable vulnerable groups: disabled, elderly, mentally ill, impoverished, veterans, indigenous.",
            "max_penalty": "Life imprisonment, minimum 25 years (s.235) / Life (Rome Statute)",
            "evidence": [
                {"fact": "44,958+ cumulative MAID deaths 2016-2022", "source": "Health Canada MAID Annual Reports"},
                {"fact": "4.1% of ALL Canadian deaths - highest rate globally", "source": "Health Canada MAID 2022 Report"},
                {"fact": "Growth: 2,838 (2017) to 13,241 (2022) - 367% increase", "source": "Health Canada MAID Reports"},
                {"fact": "Command responsibility: PM tabled legislation, whipped vote, expanded program", "source": "Parliamentary records, Hansard"},
            ],
            "legal_basis": "Criminal Code s.235(1): First degree murder. Rome Statute Art. 7(1)(a): Murder as part of widespread systematic attack on civilian population.",
            "data_source": "Health Canada MAID reports",
            "action": "s.504 private prosecution + ICC referral"
        })

        # Genocide
        ind["charges"].append({
            "charge_id": "ROME-0003",
            "section": "Rome Statute Art. 6 / CAHC s.4(1.1)",
            "section_title": "Genocide",
            "severity": "critical",
            "description": "MAID regime disproportionately targets protected groups: disabled, indigenous, mentally ill. Killing members of identifiable groups through state-administered lethal injection when root cause is poverty, inadequate healthcare, or systemic discrimination.",
            "max_penalty": "Life imprisonment (CAHC s.4(1.1))",
            "evidence": [
                {"fact": "Disabled Canadians offered/administered MAID citing poverty and inadequate support", "source": "CBC, Global News investigative reports"},
                {"fact": "MMIWG inquiry found ongoing genocide - MAID adds state killing pathway", "source": "MMIWG Final Report 2019"},
                {"fact": "VAC employees offered MAID to veterans seeking mental health support", "source": "CBC News"},
                {"fact": "Mental illness expansion creates pathway to kill mentally ill Canadians", "source": "Parliamentary records"},
            ],
            "legal_basis": "Rome Statute Article 6: Genocide. Convention on Prevention and Punishment of the Crime of Genocide (1948). CAHC s.4(1.1).",
            "data_source": "MMIWG Report, Health Canada, Parliamentary records",
            "action": "s.504 private prosecution + ICC complaint + Genocide Convention Art. VIII referral"
        })

        ind["severity_score"] = 10
        ind["severity_label"] = "critical"
        break

cs["total_charges"] = sum(len(ind["charges"]) for ind in cs["individuals"])
cs["generated"] = "2026-04-11T01:00:00+00:00"

with open("data/charges_sheet.json", "w", encoding="utf-8") as f:
    json.dump(cs, f, indent=2, ensure_ascii=False)

for ind in cs["individuals"]:
    if ind["name"] == "Justin Trudeau":
        print(f"Trudeau charges: {len(ind['charges'])}")
        for c in ind["charges"]:
            print(f"  {c['charge_id']}: {c['section']} -- {c['section_title']}")
        break
print(f"Total charges: {cs['total_charges']}")
