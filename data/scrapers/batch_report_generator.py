#!/usr/bin/env python3
"""
TENET5 Batch Mirror Report Generator

Generates personalized HTML reports for all 340 MPs + media + institutions.
Each MP report omits that MP's own incriminating data.
Clean MPs (score 0) see everything + recruitment pitch.
Media/courts/institutions see everything unredacted.

Output: data/mirror_reports/*.html (one per recipient)
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from html import escape

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent
OUTPUT_DIR = DATA_DIR / "mirror_reports"
SYSTEM_SEED = 118400


def load_json(filename):
    path = DATA_DIR / filename
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def norm_name(n):
    return (n or "").lower().strip()


def name_match(a, b):
    na, nb = norm_name(a), norm_name(b)
    if na == nb:
        return True
    pa, pb = na.split(), nb.split()
    if len(pa) > 1 and len(pb) > 1:
        return pa[-1] == pb[-1] and pa[0][0:1] == pb[0][0:1]
    return False


def fmt(n):
    return f"{int(n):,}"


def fmt_dollar(n):
    return f"${int(n):,}"


class ReportGenerator:
    def __init__(self):
        self.data = {}
        self.generated = 0
        self.errors = 0

    def load_all(self):
        print("Loading data...")
        files = {
            "directory": "mp_email_directory.json",
            "mps": "mp_full_analysis.json",
            "dossier": "mp_criminal_ethics_dossier.json",
            "cija": "cija_deep_analysis.json",
            "lobbying": "lobbying_analysis.json",
            "cc": "criminal_code_analysis.json",
            "strategy": "campaign_strategy.json",
            "rivalries": "parliamentary_rivalries.json",
            "media": "media_contacts.json",
            "institutions": "institution_contacts.json",
        }
        for key, filename in files.items():
            d = load_json(filename)
            if d:
                self.data[key] = d
                print(f"  Loaded {filename}")
            else:
                print(f"  SKIP: {filename}")

    def get_mp_score(self, name):
        mps = self.data.get("mps", {})
        for tier in ["tier1_highest", "tier2_moderate", "tier3_low", "tier4_clean"]:
            for mp in mps.get(tier, []):
                if name_match(mp["name"], name):
                    return mp.get("score", 0), mp.get("flags", []), tier
        return 0, [], "tier4_clean"

    def filter_dossier(self, target_name, omit):
        """Return dossier entries, omitting target if flagged."""
        dossier = self.data.get("dossier", {})
        result = {}
        for cat in ["criminal_convictions", "ethics_commissioner_violations",
                     "foreign_interference_flagged", "caucus_expulsions_resignations", "other_misconduct"]:
            entries = dossier.get(cat, [])
            if omit:
                entries = [e for e in entries if not name_match(e.get("name", ""), target_name)]
            result[cat] = entries
        return result

    def filter_cc_findings(self, target_name, omit):
        """Return CC findings, omitting target if flagged."""
        cc = self.data.get("cc", {})
        findings = cc.get("findings", [])
        if omit:
            findings = [f for f in findings if not name_match(f.get("entity", ""), target_name)]
        return findings

    def filter_lobbying(self, target_name, omit):
        """Return top lobbied officials, omitting target if flagged."""
        lobbying = self.data.get("lobbying", {})
        officials = lobbying.get("top_lobbied_officials", [])
        if omit:
            officials = [o for o in officials if not name_match(o.get("name", ""), target_name)]
        return officials

    def generate_subject(self, name, party, score, recipient_type):
        if recipient_type == "media":
            return "Investigation Brief: Cross-Referenced Canadian Government Accountability Data"
        if recipient_type in ("court", "institution", "thinktank"):
            return "Evidence Submission: Public Record Criminal Code Analysis — 50 Findings"
        if score == 0:
            return "Constituent Brief: Clean Record — Request for Structural Reform Leadership"
        if party == "Conservative":
            return "Opposition Intelligence: Liberal Government Ethics Record — 504+ Documented Entries"
        if party == "Liberal":
            return "Parliamentary Brief: Cross-Party Accountability Gaps in Government Oversight"
        if party == "NDP":
            return "Evidence Brief: Corporate Capture of Both Major Parties — Cross-Referenced Data"
        return "Parliamentary Brief: Canadian Government Accountability — Public Record Analysis"

    def generate_html(self, name, party="", riding="", score=0, flags=None,
                      email="", recipient_type="mp"):
        omit = recipient_type == "mp" and score > 0
        dossier = self.filter_dossier(name, omit)
        cc_findings = self.filter_cc_findings(name, omit)
        officials = self.filter_lobbying(name, omit)
        subject = self.generate_subject(name, party, score, recipient_type)
        cija = self.data.get("cija", {})
        is_clean = not omit

        h = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>Intelligence Brief — {escape(name)} | TENET5</title>
<style>
body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: #fafaf8; color: #1a1f36; max-width: 800px; margin: 0 auto; padding: 20px; font-size: 15px; line-height: 1.7; }}
h1,h2,h3 {{ font-family: Georgia, serif; }}
.header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #c41e3a; margin-bottom: 20px; }}
.header .tag {{ font-size: 0.65rem; letter-spacing: 4px; color: #c41e3a; text-transform: uppercase; }}
.header h1 {{ font-size: 1.5rem; margin: 8px 0; }}
.header .meta {{ font-size: 0.8rem; color: #6b7280; }}
.section {{ margin: 24px 0; }}
.section h2 {{ font-size: 1.1rem; border-bottom: 1px solid #e5e5e3; padding-bottom: 6px; display: flex; align-items: center; gap: 8px; }}
.section h2 .num {{ display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #c41e3a; color: #fff; font-size: 0.65rem; font-weight: 700; }}
.clean-badge {{ background: #ecfdf5; border: 1px solid #34d399; border-radius: 6px; padding: 12px 16px; font-size: 0.85rem; color: #065f46; margin: 12px 0; }}
.recruit-badge {{ background: #eff6ff; border: 1px solid #60a5fa; border-radius: 6px; padding: 12px 16px; font-size: 0.82rem; color: #1e40af; margin: 12px 0; }}
.card {{ background: #fff; border: 1px solid #e5e5e3; border-radius: 6px; padding: 12px 16px; margin: 8px 0; font-size: 0.82rem; }}
.card-critical {{ border-left: 3px solid #ef4444; }}
.card-high {{ border-left: 3px solid #f59e0b; }}
.card-medium {{ border-left: 3px solid #eab308; }}
.card .entity {{ font-weight: 700; }}
.card .detail {{ color: #6b7280; margin-top: 4px; }}
.card .penalty {{ color: #ef4444; font-weight: 600; }}
.card .action {{ color: #c41e3a; font-weight: 600; font-size: 0.75rem; margin-top: 4px; }}
table {{ width: 100%; border-collapse: collapse; font-size: 0.82rem; }}
th {{ text-align: left; padding: 6px 10px; background: #f8f8f6; border-bottom: 1px solid #e5e5e3; font-size: 0.72rem; text-transform: uppercase; color: #6b7280; }}
td {{ padding: 5px 10px; border-bottom: 1px solid #f0f0ee; }}
.stat-row {{ display: flex; gap: 12px; flex-wrap: wrap; margin: 12px 0; }}
.stat {{ background: #f8f8f6; border: 1px solid #e5e5e3; border-radius: 6px; padding: 10px 14px; text-align: center; flex: 1; min-width: 100px; }}
.stat .val {{ font-size: 1.2rem; font-weight: 800; color: #c41e3a; }}
.stat .label {{ font-size: 0.62rem; color: #6b7280; text-transform: uppercase; }}
.policy {{ background: #f8f8f6; border: 1px solid #e5e5e3; border-left: 3px solid #c41e3a; border-radius: 4px; padding: 10px 14px; margin: 8px 0; }}
.policy strong {{ color: #1a1f36; }}
.policy .desc {{ font-size: 0.78rem; color: #6b7280; margin-top: 4px; }}
.footer {{ text-align: center; padding: 20px 0; border-top: 2px solid #e5e5e3; margin-top: 24px; font-size: 0.72rem; color: #9ca3af; }}
a {{ color: #c41e3a; }}
</style>
</head>
<body>
<div class="header">
<div class="tag">Canadian Government Accountability Report</div>
<h1>Public Record Intelligence Brief</h1>
<div class="meta">Prepared for: {escape(name)}</div>
<div class="meta">From: Daniel Perry — Canadian Forces Veteran, Afghanistan</div>
</div>
"""
        # Section 1: Executive Summary
        h += '<div class="section"><h2><span class="num">1</span> Executive Summary</h2>\n'
        h += f'<p>This brief summarizes findings from cross-referencing six Canadian government public datasets: the Commissioner of Lobbying registry ({fmt(self.data.get("lobbying", {}).get("total_communications", 350612))} communications), Elections Canada donation records (6.2 million entries), OpenParliament voting data, ISED corporate registry, government procurement contracts, and parliamentary Hansard records.</p>\n'
        if riding:
            h += f'<p><strong>Your riding ({escape(riding)})</strong> is represented in this analysis.</p>\n'
        if is_clean and recipient_type == "mp":
            h += '<div class="clean-badge"><strong>Your record is clean.</strong> Based on our analysis of lobbying contacts, CIJA communications, ethics findings, and criminal records, you have no flags in any of our datasets. We are reaching out because Canada needs parliamentarians who can champion structural reform without personal conflicts of interest.</div>\n'
        h += '<div class="stat-row">\n'
        h += f'<div class="stat"><div class="val">{fmt(self.data.get("lobbying", {}).get("total_communications", 350612))}</div><div class="label">Lobbying Comms</div></div>\n'
        h += '<div class="stat"><div class="val">6.2M</div><div class="label">Donation Records</div></div>\n'
        cc_stats = self.data.get("cc", {}).get("statistics", {})
        h += f'<div class="stat"><div class="val">{cc_stats.get("total_findings", 50)}</div><div class="label">CC Findings</div></div>\n'
        h += f'<div class="stat"><div class="val">{cc_stats.get("individuals_flagged", 38)}</div><div class="label">Individuals Flagged</div></div>\n'
        h += '</div></div>\n'

        # Section 2: Criminal Code Findings
        h += '<div class="section"><h2><span class="num">2</span> Criminal Code Analysis</h2>\n'
        h += f'<p>{len(cc_findings)} findings mapped to Criminal Code sections. All actionable via s.504 (private prosecution).</p>\n'
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        cc_findings.sort(key=lambda f: severity_order.get(f.get("severity", "low"), 9))
        for f in cc_findings[:20]:
            cls = f"card card-{f.get('severity', 'medium')}"
            h += f'<div class="{cls}">\n'
            h += f'<div class="entity">{escape(f.get("entity", ""))}</div>\n'
            h += f'<div class="detail"><strong>CC {escape(f.get("section", ""))}</strong> — {escape(f.get("section_title", ""))} (max: {escape(f.get("max_penalty", ""))})</div>\n'
            h += f'<div class="detail">{escape(f.get("description", "")[:300])}</div>\n'
            if f.get("action"):
                h += f'<div class="action">{escape(f["action"])}</div>\n'
            h += '</div>\n'
        if len(cc_findings) > 20:
            h += f'<p style="color:#6b7280;font-size:0.78rem;">+ {len(cc_findings)-20} additional findings. See <a href="https://tenet-5.github.io/criminal-code-analysis.html">full analysis</a>.</p>\n'
        h += '</div>\n'

        # Section 3: Accountability Records
        h += '<div class="section"><h2><span class="num">3</span> Cross-Party Accountability Record</h2>\n'
        for cat_name, cat_key in [("Criminal Convictions", "criminal_convictions"),
                                   ("Ethics Commissioner Findings", "ethics_commissioner_violations"),
                                   ("Foreign Interference Flags", "foreign_interference_flagged")]:
            entries = dossier.get(cat_key, [])
            if entries:
                h += f'<h3>{cat_name}</h3>\n'
                for e in entries:
                    h += '<div class="card card-critical">\n'
                    h += f'<div class="entity">{escape(e.get("name", ""))} ({escape(e.get("party", ""))})</div>\n'
                    detail = e.get("offence", "") or e.get("allegations", "") or e.get("issue", "")
                    if isinstance(e.get("violations"), list):
                        for v in e["violations"]:
                            h += f'<div class="detail">{escape(v.get("case", ""))} ({v.get("year", "")}): {escape(v.get("finding", ""))}</div>\n'
                    elif detail:
                        h += f'<div class="detail">{escape(detail)}</div>\n'
                    if e.get("sentence"):
                        h += f'<div class="penalty">{escape(e["sentence"])}</div>\n'
                    h += '</div>\n'
        h += '</div>\n'

        # Section 4: Lobbying Patterns
        mp_officials = [o for o in officials if o.get("title") in ("Member of Parliament", "Member of Parliment")][:15]
        if mp_officials:
            h += '<div class="section"><h2><span class="num">4</span> Lobbying Contact Patterns</h2>\n'
            h += '<table><thead><tr><th>MP</th><th style="text-align:right;">Meetings</th></tr></thead><tbody>\n'
            for o in mp_officials:
                h += f'<tr><td>{escape(o["name"])}</td><td style="text-align:right;font-weight:700;color:#c41e3a;">{fmt(o.get("meetings", 0))}</td></tr>\n'
            h += '</tbody></table>\n'
            h += f'<p style="font-size:0.78rem;color:#6b7280;margin-top:8px;">CIJA: {fmt(cija.get("total_communications", 2156))} communications to {fmt(cija.get("unique_contacts", 993))} officials. Post-Oct 7 surge: {cija.get("oct7_surge_pct", 239)}% increase.</p>\n'
            h += '</div>\n'

        # Section 5: Policy Recommendations
        h += '<div class="section"><h2><span class="num">5</span> Structural Reform Recommendations</h2>\n'
        policies = [
            ("P1: Public Officer Accountability Act", "Strengthen Criminal Code s.122 with mandatory minimums for breach of trust."),
            ("P2: Foreign Lobbying Transparency Act", "Require disclosure of foreign-connected funding and trip sponsorships."),
            ("P3: Revolving Door Prohibition", "10-year cooling period before former ministers can register as lobbyists."),
            ("P4: PM Corporate Divestiture Act", "Require PMs to fully divest holdings over $1M in lobbying entities."),
            ("P5: Military Oversight Independence Act", "Remove CFNIS from military chain of command. Give MPCC binding power."),
        ]
        for name_p, desc in policies:
            h += f'<div class="policy"><strong>{escape(name_p)}</strong><div class="desc">{escape(desc)}</div></div>\n'
        if is_clean and recipient_type == "mp":
            h += '<div class="recruit-badge"><strong>Action requested:</strong> As a clean MP with no conflicts in our datasets, we ask you to consider championing one of these five reforms. We can provide full legislative drafting support and evidence packages for committee testimony.</div>\n'
        h += '</div>\n'

        # Section 6: Evidence Links
        h += '<div class="section"><h2><span class="num">6</span> Public Evidence</h2>\n'
        links = [
            ("Cross-Reference Findings", "https://tenet-5.github.io/findings.html"),
            ("Follow the Money", "https://tenet-5.github.io/cross-reference.html"),
            ("Criminal Code Analysis", "https://tenet-5.github.io/criminal-code-analysis.html"),
            ("The 504 Database", "https://tenet-5.github.io/accountability.html"),
            ("Foreign Influence Investigation", "https://tenet-5.github.io/foreign-influence.html"),
            ("Commissioner of Lobbying (verify)", "https://lobbycanada.gc.ca/en/open-data/"),
        ]
        h += '<ul>\n'
        for label, url in links:
            h += f'<li><a href="{url}">{escape(label)}</a></li>\n'
        h += '</ul></div>\n'

        # Footer
        h += '<div class="footer">\n'
        h += '<p>Every number in this report is sourced from Canadian government public records.</p>\n'
        h += '<p>Daniel Perry — Canadian Forces combat veteran, former Signals Operator, Afghanistan</p>\n'
        h += '<p><a href="https://tenet-5.github.io/">tenet-5.github.io</a></p>\n'
        h += '</div>\n</body></html>'

        return {"subject": subject, "html": h, "name": name, "party": party,
                "score": score, "email": email, "type": recipient_type}

    def generate_all(self):
        """Generate all reports."""
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        directory = self.data.get("directory", {}).get("directory", [])
        media = self.data.get("media", {}).get("contacts", [])
        institutions = self.data.get("institutions", {}).get("contacts", [])

        print(f"\nGenerating {len(directory)} MP reports...")
        manifest = []

        for i, mp in enumerate(directory):
            name = mp.get("name", "Unknown")
            score, flags, tier = self.get_mp_score(name)
            try:
                report = self.generate_html(
                    name=name,
                    party=mp.get("party", ""),
                    riding=mp.get("riding", ""),
                    score=score,
                    flags=flags,
                    email=mp.get("email", ""),
                    recipient_type="mp"
                )
                slug = name.lower().replace(" ", "-").replace("'", "").replace(".", "")
                filename = f"mp_{slug}.html"
                with open(OUTPUT_DIR / filename, "w", encoding="utf-8") as f:
                    f.write(report["html"])
                manifest.append({
                    "file": filename,
                    "name": name,
                    "party": mp.get("party", ""),
                    "score": score,
                    "tier": tier,
                    "email": mp.get("email", ""),
                    "subject": report["subject"],
                    "type": "mp"
                })
                self.generated += 1
            except Exception as e:
                print(f"  ERROR: {name}: {e}")
                self.errors += 1

            if (i + 1) % 50 == 0:
                print(f"  {i+1}/{len(directory)} MPs generated...")

        # Media reports
        print(f"\nGenerating {len(media)} media reports...")
        for m in media:
            name = m.get("name", "Unknown")
            try:
                report = self.generate_html(
                    name=name,
                    email=m.get("email", ""),
                    recipient_type="media"
                )
                slug = name.lower().replace(" ", "-").replace("'", "").replace(".", "").replace("(", "").replace(")", "")
                filename = f"media_{slug}.html"
                with open(OUTPUT_DIR / filename, "w", encoding="utf-8") as f:
                    f.write(report["html"])
                manifest.append({
                    "file": filename,
                    "name": name,
                    "email": m.get("email", ""),
                    "subject": report["subject"],
                    "type": "media"
                })
                self.generated += 1
            except Exception as e:
                print(f"  ERROR media {name}: {e}")
                self.errors += 1

        # Institution reports
        print(f"\nGenerating {len(institutions)} institution reports...")
        for inst in institutions:
            name = inst.get("name", "Unknown")
            rtype = "court" if inst.get("type") == "court" else "institution"
            try:
                report = self.generate_html(
                    name=name,
                    email=inst.get("email", ""),
                    recipient_type=rtype
                )
                slug = name.lower().replace(" ", "-").replace("'", "").replace(".", "").replace("(", "").replace(")", "")[:60]
                filename = f"inst_{slug}.html"
                with open(OUTPUT_DIR / filename, "w", encoding="utf-8") as f:
                    f.write(report["html"])
                manifest.append({
                    "file": filename,
                    "name": name,
                    "email": inst.get("email", ""),
                    "subject": report["subject"],
                    "type": rtype
                })
                self.generated += 1
            except Exception as e:
                print(f"  ERROR inst {name}: {e}")
                self.errors += 1

        # Save manifest
        manifest_data = {
            "generated": datetime.now(timezone.utc).isoformat(),
            "system_seed": SYSTEM_SEED,
            "total_reports": len(manifest),
            "mp_reports": sum(1 for m in manifest if m["type"] == "mp"),
            "media_reports": sum(1 for m in manifest if m["type"] == "media"),
            "institution_reports": sum(1 for m in manifest if m["type"] in ("court", "institution")),
            "reports": manifest
        }
        with open(OUTPUT_DIR / "manifest.json", "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2, ensure_ascii=False)

        print(f"\n{'='*60}")
        print(f"  BATCH GENERATION COMPLETE")
        print(f"  Total generated: {self.generated}")
        print(f"  Errors: {self.errors}")
        print(f"  MP reports: {manifest_data['mp_reports']}")
        print(f"  Media reports: {manifest_data['media_reports']}")
        print(f"  Institution reports: {manifest_data['institution_reports']}")
        print(f"  Output: {OUTPUT_DIR}")
        print(f"  Manifest: {OUTPUT_DIR / 'manifest.json'}")
        print(f"{'='*60}")


if __name__ == "__main__":
    gen = ReportGenerator()
    gen.load_all()
    gen.generate_all()
