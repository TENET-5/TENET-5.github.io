#!/usr/bin/env python3
"""
TENET5 Criminal Code Analyzer
Maps all accountability data to applicable Criminal Code of Canada sections.
Generates a comprehensive legal analysis JSON for the website.

Criminal Code sections covered:
  s.119  - Bribery of judicial officers
  s.120  - Bribery of officers
  s.121  - Frauds on the government (secret commissions, influence peddling)
  s.122  - Breach of trust by public officer
  s.123  - Municipal corruption
  s.124  - Selling or purchasing office
  s.126  - Disobeying a statute
  s.139  - Obstructing justice
  s.380  - Fraud
  s.418  - Selling defective stores to Her Majesty
  s.504  - Anyone may lay information (private prosecution)

Lobbying Act:
  s.10.11 - Designated public office holder communication
  s.14    - Prohibition on lobbying while receiving benefits

Other statutes:
  Conflict of Interest Act (CoIA)
  Canada Elections Act (CEA)
  Foreign Influence Transparency and Accountability Act (FITAA)
  Security of Information Act (SoIA)
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent
OUTPUT_DIR = DATA_DIR

SYSTEM_SEED = 118400


class CriminalCodeAnalyzer:
    """Maps accountability data to Criminal Code sections."""

    # ── Criminal Code Section Definitions ──
    SECTIONS = {
        "s119": {
            "section": "119",
            "title": "Bribery of judicial officers",
            "max_penalty": "14 years",
            "summary": "Giving or offering a bribe to a justice, police commissioner, or peace officer.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-19.html#docCont"
        },
        "s120": {
            "section": "120",
            "title": "Bribery of officers",
            "max_penalty": "14 years",
            "summary": "Giving or receiving a benefit as consideration for cooperation, assistance, or exercise of influence in government.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-19.html#docCont"
        },
        "s121": {
            "section": "121",
            "title": "Frauds on the government",
            "max_penalty": "5 years",
            "summary": "Giving, offering, or receiving a benefit in connection with government transactions, contracts, or business. Includes influence peddling and secret commissions.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-19.html#docCont"
        },
        "s122": {
            "section": "122",
            "title": "Breach of trust by public officer",
            "max_penalty": "5 years",
            "summary": "Every official who, in connection with the duties of their office, commits fraud or a breach of trust is guilty of an indictable offence.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-19.html#docCont"
        },
        "s123": {
            "section": "123",
            "title": "Municipal corruption",
            "max_penalty": "5 years",
            "summary": "Giving or receiving a benefit to influence a municipal official in the exercise of their duties.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-19.html#docCont"
        },
        "s124": {
            "section": "124",
            "title": "Selling or purchasing office",
            "max_penalty": "5 years",
            "summary": "Selling, purchasing, or agreeing to sell or purchase an appointment to or resignation from an office.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-19.html#docCont"
        },
        "s126": {
            "section": "126",
            "title": "Disobeying a statute",
            "max_penalty": "2 years",
            "summary": "Willfully doing anything that a federal statute forbids, or omitting to do anything a statute requires.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-20.html#docCont"
        },
        "s139": {
            "section": "139",
            "title": "Obstructing justice",
            "max_penalty": "10 years",
            "summary": "Wilfully attempting to obstruct, pervert or defeat the course of justice.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-22.html#docCont"
        },
        "s380": {
            "section": "380",
            "title": "Fraud",
            "max_penalty": "14 years (over $5,000) / 2 years (under $5,000)",
            "summary": "By deceit, falsehood or other fraudulent means, defrauding the public or any person of property, money, or valuable security.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-82.html#docCont"
        },
        "s418": {
            "section": "418",
            "title": "Selling defective stores to Her Majesty",
            "max_penalty": "14 years",
            "summary": "Knowingly selling defective stores to Her Majesty or committing fraud in connection with government contracts.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-90.html#docCont"
        },
        "s504": {
            "section": "504",
            "title": "Anyone may lay an information",
            "max_penalty": "N/A (procedural)",
            "summary": "Any person who, on reasonable grounds, believes that a person has committed an indictable offence may lay an information in writing and under oath before a justice.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/c-46/page-116.html#docCont"
        },
        "lobbying_act": {
            "section": "Lobbying Act",
            "title": "Lobbyists' Code of Conduct violations",
            "max_penalty": "$200,000 fine / 2 years",
            "summary": "Failure to register, improper communication with DPOHs, or lobbying while receiving government benefits.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/L-12.4/"
        },
        "coia": {
            "section": "Conflict of Interest Act",
            "title": "Conflict of Interest Act violations",
            "max_penalty": "$500 AMPs / referral to RCMP",
            "summary": "Public office holders must not further their private interests or those of relatives using their position.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/C-36.65/"
        },
        "cea": {
            "section": "Canada Elections Act",
            "title": "Canada Elections Act violations",
            "max_penalty": "5 years / $50,000 fine",
            "summary": "Election spending violations, contribution limit breaches, false returns.",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/E-2.01/"
        },
        "fitaa": {
            "section": "FITAA (F-29.2)",
            "title": "Foreign Influence Transparency and Accountability Act",
            "max_penalty": "5 years / $5M fine",
            "summary": "Requires registration of arrangements with foreign principals. Currently UNPROCLAIMED (Day 658+).",
            "url": "https://laws-lois.justice.gc.ca/eng/acts/F-29.2/"
        }
    }

    def __init__(self):
        self.data = {}
        self.findings = []
        self.stats = {
            "total_findings": 0,
            "by_section": {},
            "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "individuals_flagged": set(),
            "organizations_flagged": set()
        }

    def load_data(self):
        """Load all analysis data files."""
        files = {
            "mp_analysis": "mp_full_analysis.json",
            "dossier": "mp_criminal_ethics_dossier.json",
            "cija": "cija_deep_analysis.json",
            "lobbying": "lobbying_analysis.json",
            "crossref": "cross_reference_findings.json",
            "carney": "carney_conflicts_dossier.json",
            "cfnis": "cfnis_command_dossier.json",
            "procurement": "contracts/anomaly_scan_20260409_035111.json",
            "corporate": "corporate_registry_analysis.json",
            "revolving": "revolving_door_analysis.json",
            "arms": "arms_exports_israel.json",
            "charity": "dossier_charity_pipeline.json",
            "woo": "dossier_senator_woo.json",
            "freeland": "freeland_browder_dossier.json",
            "financial": "financial_transaction_analysis.json",
        }
        for key, filename in files.items():
            path = DATA_DIR / filename
            if path.exists():
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        self.data[key] = json.load(f)
                    print(f"  Loaded {filename}")
                except Exception as e:
                    print(f"  WARN: Failed to load {filename}: {e}")
            else:
                print(f"  SKIP: {filename} not found")

    def add_finding(self, section_key, severity, entity, entity_type, description, evidence, data_source):
        """Add a criminal code finding."""
        section = self.SECTIONS.get(section_key, {})
        finding = {
            "id": f"F-{len(self.findings)+1:04d}",
            "section": section.get("section", section_key),
            "section_title": section.get("title", ""),
            "section_url": section.get("url", ""),
            "max_penalty": section.get("max_penalty", ""),
            "severity": severity,
            "entity": entity,
            "entity_type": entity_type,
            "description": description,
            "evidence": evidence,
            "data_source": data_source,
            "legal_basis": section.get("summary", ""),
            "action": "s.504 private prosecution available" if section_key not in ("s504", "fitaa") else ""
        }
        self.findings.append(finding)
        self.stats["total_findings"] += 1
        self.stats["by_section"][section_key] = self.stats["by_section"].get(section_key, 0) + 1
        self.stats["by_severity"][severity] += 1
        self.stats["individuals_flagged"].add(entity) if entity_type in ("mp", "senator", "official", "person") else None
        self.stats["organizations_flagged"].add(entity) if entity_type == "organization" else None

    # ── Analysis Methods ──

    def analyze_criminal_convictions(self):
        """Map existing criminal convictions to CC sections."""
        dossier = self.data.get("dossier", {})
        for entry in dossier.get("criminal_convictions", []):
            offence = entry.get("offence", "").lower()
            if "election" in offence:
                section = "cea"
            elif "fraud" in offence:
                section = "s380"
            elif "assault" in offence or "breach" in offence:
                section = "s122"
            else:
                section = "s122"
            self.add_finding(section, "critical", entry["name"], "mp",
                f"Criminal conviction: {entry.get('offence', '')}. Sentence: {entry.get('sentence', 'Unknown')}.",
                [{"fact": entry.get("offence", ""), "year": entry.get("year"), "source": entry.get("source", "")}],
                "mp_criminal_ethics_dossier.json")

    def analyze_ethics_violations(self):
        """Map ethics commissioner findings to CoIA."""
        dossier = self.data.get("dossier", {})
        for entry in dossier.get("ethics_commissioner_violations", []):
            for v in entry.get("violations", []):
                self.add_finding("coia", "high", entry["name"], "mp",
                    f"Ethics Commissioner finding: {v.get('case', '')} ({v.get('year', '')}).",
                    [{"fact": v.get("finding", ""), "year": v.get("year"), "source": v.get("source", "")}],
                    "mp_criminal_ethics_dossier.json")

    def analyze_foreign_interference(self):
        """Map foreign interference flags to SoIA/FITAA."""
        dossier = self.data.get("dossier", {})
        for entry in dossier.get("foreign_interference_flagged", []):
            self.add_finding("fitaa", "critical", entry["name"], "mp",
                f"Foreign interference flag: {entry.get('allegations', '')}",
                [{"fact": entry.get("allegations", ""), "source": entry.get("source", "")}],
                "mp_criminal_ethics_dossier.json")

    def analyze_lobbying_concentration(self):
        """Analyze lobbying patterns for s.121 (frauds on government) indicators."""
        lobbying = self.data.get("lobbying", {})
        cija = self.data.get("cija", {})

        # CIJA concentration analysis
        if cija:
            total = cija.get("total_communications", 0)
            unique = cija.get("unique_contacts", 0)
            if total > 2000:
                self.add_finding("lobbying_act", "high", "CIJA (Registration 959914-111-95)", "organization",
                    f"Extreme lobbying concentration: {total:,} registered communications to {unique:,} officials since 2008. Post-Oct 7 surge: {cija.get('oct7_surge_pct', 0)}% increase.",
                    [{"fact": f"{total} communications", "source": "Commissioner of Lobbying bulk CSV"}],
                    "cija_deep_analysis.json")

        # Top lobbied MPs - flag extreme meeting counts
        if lobbying:
            for official in lobbying.get("top_lobbied_officials", [])[:20]:
                meetings = official.get("meetings", 0)
                if meetings > 500 and official.get("title") in ("Member of Parliament", "Member of Parliment"):
                    self.add_finding("s121", "medium", official["name"], "mp",
                        f"Extreme lobbying exposure: {meetings:,} registered meetings with lobbyists. May indicate s.121 'influence in connection with government transactions'.",
                        [{"fact": f"{meetings} meetings", "source": "Commissioner of Lobbying open data"}],
                        "lobbying_analysis.json")

    def analyze_conflict_of_interest(self):
        """Analyze Carney and other CoI patterns."""
        carney = self.data.get("carney", {})
        if carney:
            name = carney.get("name", "Mark Carney")
            brookfield = carney.get("brookfield", {})
            ethics = carney.get("ethics_issues", {})
            recusals = ethics.get("recusals", "100+")
            self.add_finding("coia", "critical", name, "mp",
                f"Conflict of Interest: {recusals} corporate entities under conflict screen. Brookfield Asset Management (${brookfield.get('assets', 'unknown')}). {ethics.get('screen_applied', 0)} screens applied. Blind trust maintains ownership.",
                [
                    {"fact": f"{recusals} recusal entities", "source": "Ethics Commissioner"},
                    {"fact": f"Brookfield AUM: {brookfield.get('assets', 'unknown')}", "source": "Public filings"},
                ],
                "carney_conflicts_dossier.json")

    def analyze_cfnis(self):
        """Analyze CFNIS command chain for s.122 (breach of trust) and s.139 (obstruction)."""
        cfnis = self.data.get("cfnis", {})
        if cfnis:
            for person in cfnis.get("command_chain", cfnis.get("persons", [])):
                name = person.get("name", person.get("person", "Unknown"))
                role = person.get("role", person.get("position", ""))
                issues = person.get("issues", person.get("allegations", ""))
                if issues:
                    self.add_finding("s139", "high", name, "official",
                        f"Potential obstruction of justice: {role}. {issues}",
                        [{"fact": str(issues)[:200], "source": "CFNIS investigation records"}],
                        "cfnis_command_dossier.json")

    def analyze_procurement(self):
        """Analyze procurement anomalies for s.121/s.380/s.418."""
        proc = self.data.get("procurement", {})
        if not proc:
            return

        anomalies = proc.get("anomalies", [])

        # Vendor concentration — flag high-spend concentration
        vendor_conc = [a for a in anomalies if a.get("type") == "VENDOR_CONCENTRATION"]
        vendor_conc.sort(key=lambda a: -a.get("vendor_spend", 0))
        for anomaly in vendor_conc[:20]:  # Top 20 by spend
            spend = anomaly.get("vendor_spend", 0)
            concentration = anomaly.get("concentration_pct", 0)
            severity = "critical" if spend > 10_000_000_000 else "high" if spend > 1_000_000_000 else "medium"
            self.add_finding("s121", severity, anomaly.get("vendor", "Unknown"), "organization",
                f"Procurement vendor concentration: {anomaly['vendor']} holds {concentration:.0f}% of {anomaly.get('department', 'unknown').upper()} department spend (${spend:,.0f}). {proc.get('total_contracts_scanned', 0):,} total contracts scanned.",
                [{"fact": f"{concentration:.0f}% concentration, ${spend:,.0f}", "source": "Proactive disclosure open.canada.ca"}],
                "contracts/anomaly_scan_20260409.json")

        # Amendment chains — flag extreme amendment counts (70+ amendments)
        amend_chains = [a for a in anomalies if a.get("type") == "AMENDMENT_CHAIN"]
        # Get department-level stats
        dept_counts = {}
        for a in amend_chains:
            dept = a.get("department", "unknown")
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
        # Flag departments with extreme amendment patterns
        for dept, count in sorted(dept_counts.items(), key=lambda x: -x[1])[:10]:
            if count > 100:
                self.add_finding("s418", "high", dept.upper(), "institution",
                    f"Systematic amendment chain pattern: {count:,} contracts in {dept.upper()} have been amended 50+ times each. Pattern suggests systematic avoidance of competitive procurement thresholds.",
                    [{"fact": f"{count:,} amendment chain anomalies in {dept}", "source": "Proactive disclosure"}],
                    "contracts/anomaly_scan_20260409.json")

        # Name variant detection — same vendor under multiple names
        seen_vendors = {}
        for a in vendor_conc:
            base = a.get("vendor", "").upper().split(" ")[0:2]
            key = " ".join(base)
            if key not in seen_vendors:
                seen_vendors[key] = []
            seen_vendors[key].append(a)
        for key, variants in seen_vendors.items():
            if len(variants) > 1:
                names = [v["vendor"] for v in variants]
                total_spend = sum(v.get("vendor_spend", 0) for v in variants)
                self.add_finding("s380", "high", " / ".join(names[:3]), "organization",
                    f"Vendor name variant pattern: {len(variants)} entries under similar names ({', '.join(names[:3])}). Combined spend: ${total_spend:,.0f}. May indicate entity fragmentation to avoid disclosure thresholds.",
                    [{"fact": f"{len(variants)} name variants, ${total_spend:,.0f} combined", "source": "Proactive disclosure"}],
                    "contracts/anomaly_scan_20260409.json")

    def analyze_revolving_door(self):
        """Analyze revolving door patterns for s.121 influence peddling."""
        rev = self.data.get("revolving", {})
        if rev:
            for case in rev.get("cases", rev.get("revolving_door_cases", [])):
                name = case.get("name", case.get("person", "Unknown"))
                self.add_finding("s121", "high", name, "person",
                    f"Revolving door: {case.get('previous_role', '')} to {case.get('current_role', '')}. {case.get('concern', case.get('description', ''))}",
                    [{"fact": f"Former: {case.get('previous_role', '')}, Now: {case.get('current_role', '')}", "source": "Lobbying registry + public records"}],
                    "revolving_door_analysis.json")

    def analyze_arms_pipeline(self):
        """Analyze arms export contradictions."""
        arms = self.data.get("arms", {})
        if arms:
            exports = arms.get("exports", arms.get("total_exports", []))
            if isinstance(exports, list):
                for export in exports[:5]:
                    self.add_finding("s122", "high", export.get("entity", "Government of Canada"), "organization",
                        f"Arms export contradiction: {export.get('description', export.get('detail', 'Export to Israel during stated pause'))}",
                        [{"fact": str(export)[:200], "source": "Global Affairs Canada export permits"}],
                        "arms_exports_israel.json")
            elif isinstance(arms, dict) and arms.get("total_value"):
                self.add_finding("s122", "high", "Government of Canada", "organization",
                    f"Arms export pipeline: ${arms.get('total_value', 'unknown')} in permits despite stated pause. Contradiction between public statements and permit records.",
                    [{"fact": f"Total value: {arms.get('total_value', 'unknown')}", "source": "GAC export data"}],
                    "arms_exports_israel.json")

    def analyze_fitaa_non_proclamation(self):
        """The FITAA non-proclamation is itself a finding."""
        self.add_finding("s126", "critical", "Governor in Council", "institution",
            "Foreign Influence Transparency and Accountability Act (FITAA, F-29.2) received Royal Assent but remains unproclaimed for 658+ days. The GIC has a statutory duty to bring enacted legislation into force. CIJA lobbied both ministers required to sign the proclamation order within 18 days of the Gazette publication.",
            [
                {"fact": "FITAA unproclaimed 658+ days", "source": "Canada Gazette + laws-lois.justice.gc.ca"},
                {"fact": "CIJA lobbied Justice Minister Fraser (Jan 12, 2026) and Public Safety Minister Anandasangaree (Jan 18, 2026)", "source": "Commissioner of Lobbying"},
            ],
            "cross_reference_findings.json")

    def analyze_mp_tiers(self):
        """Flag tier 1 MPs with compound scores for s.122 breach of trust."""
        mp_data = self.data.get("mp_analysis", {})
        for mp in mp_data.get("tier1_highest", []):
            flags = mp.get("flags", [])
            score = mp.get("score", 0)
            details = mp.get("details", {})
            cija_meetings = details.get("cija_meetings", 0)

            evidence = []
            if "CIJA_LOBBIED" in flags:
                evidence.append({"fact": f"{cija_meetings} CIJA lobbying meetings", "source": "Lobbying Commissioner CSV"})
            if "ON_BOARD" in flags:
                evidence.append({"fact": "Appears on investigation board (network graph)", "source": "TENET5 analysis"})
            if "EMERGENCIES_ERA" in flags:
                evidence.append({"fact": "Served during Emergencies Act invocation", "source": "Parliamentary records"})

            self.add_finding("s122", "high", mp["name"], "mp",
                f"Compound accountability score {score}/11 with {len(flags)} flags: {', '.join(flags)}. {cija_meetings} CIJA meetings recorded. Cross-reference with voting record and policy positions required.",
                evidence,
                "mp_full_analysis.json")

    def analyze_charity_pipeline(self):
        """Analyze charity revocations for s.380 fraud patterns."""
        charity = self.data.get("charity", {})
        if charity:
            revocations = charity.get("revocations", charity.get("charities", []))
            if revocations:
                for rev in revocations[:5]:
                    name = rev.get("name", rev.get("charity", "Unknown"))
                    self.add_finding("s380", "medium", name, "organization",
                        f"Charity revocation/audit: {rev.get('reason', rev.get('description', 'CRA audit finding'))}",
                        [{"fact": str(rev)[:200], "source": "CRA charitable registry"}],
                        "dossier_charity_pipeline.json")

    # ── Main Analysis Pipeline ──

    def run_all(self):
        """Run complete Criminal Code analysis."""
        print("\n" + "=" * 60)
        print("  TENET5 Criminal Code Analyzer")
        print("  SYSTEM_SEED:", SYSTEM_SEED)
        print("  Started:", datetime.now(timezone.utc).isoformat())
        print("=" * 60)

        print("\nLoading data...")
        self.load_data()

        print("\nRunning analyses...")
        analyses = [
            ("Criminal convictions", self.analyze_criminal_convictions),
            ("Ethics violations", self.analyze_ethics_violations),
            ("Foreign interference", self.analyze_foreign_interference),
            ("Lobbying concentration", self.analyze_lobbying_concentration),
            ("Conflict of interest", self.analyze_conflict_of_interest),
            ("CFNIS command chain", self.analyze_cfnis),
            ("Procurement anomalies", self.analyze_procurement),
            ("Revolving door", self.analyze_revolving_door),
            ("Arms pipeline", self.analyze_arms_pipeline),
            ("FITAA non-proclamation", self.analyze_fitaa_non_proclamation),
            ("MP tier analysis", self.analyze_mp_tiers),
            ("Charity pipeline", self.analyze_charity_pipeline),
        ]
        for name, method in analyses:
            try:
                method()
                count = self.stats["total_findings"]
                print(f"  {name}: {count} total findings")
            except Exception as e:
                print(f"  WARN: {name} failed: {e}")

        return self.export()

    def export(self):
        """Export findings to JSON."""
        output = {
            "generated": datetime.now(timezone.utc).isoformat(),
            "system_seed": SYSTEM_SEED,
            "analyzer": "TENET5-CriminalCodeAnalyzer",
            "version": "1.0.0",
            "statistics": {
                "total_findings": self.stats["total_findings"],
                "by_section": self.stats["by_section"],
                "by_severity": self.stats["by_severity"],
                "individuals_flagged": len(self.stats["individuals_flagged"]),
                "organizations_flagged": len(self.stats["organizations_flagged"]),
            },
            "criminal_code_sections": self.SECTIONS,
            "findings": self.findings,
            "methodology": "Algorithmic cross-reference of public government data against Criminal Code of Canada provisions. Findings indicate potential applicability of legal sections based on documented patterns. They are NOT accusations or determinations of guilt. All data sourced from government public records. Legal review required before any action.",
            "disclaimer": "This analysis is generated by software from public records. It does not constitute legal advice. Correlation does not imply causation. All persons are presumed innocent. Consult a qualified lawyer before taking any legal action."
        }

        out_path = OUTPUT_DIR / "criminal_code_analysis.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False, default=str)

        print(f"\n{'=' * 60}")
        print(f"  ANALYSIS COMPLETE")
        print(f"  Total findings: {self.stats['total_findings']}")
        print(f"  Critical: {self.stats['by_severity']['critical']}")
        print(f"  High: {self.stats['by_severity']['high']}")
        print(f"  Medium: {self.stats['by_severity']['medium']}")
        print(f"  Low: {self.stats['by_severity']['low']}")
        print(f"  Individuals flagged: {len(self.stats['individuals_flagged'])}")
        print(f"  Organizations flagged: {len(self.stats['organizations_flagged'])}")
        print(f"  Output: {out_path}")
        print(f"{'=' * 60}")

        return output


if __name__ == "__main__":
    analyzer = CriminalCodeAnalyzer()
    analyzer.run_all()
