#!/usr/bin/env python3
"""
TENET5 Daily Evidence Dispatch Mailer
=====================================
Reads all contact registries and sends the daily evidence briefing
via SMTP to every elected official, police service, think tank,
government agency, and court registry across Canada.

Usage:
  python daily_mailer.py                       # Dry run (preview only)
  python daily_mailer.py --send                # Actually send emails
  python daily_mailer.py --send --category mp  # Send only to MPs
  python daily_mailer.py --send --smtp-host smtp.gmail.com --smtp-port 587

Schedulable via Windows Task Scheduler or cron.
"""

import argparse
import json
import os
import smtplib
import sys
import time
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

# ── Paths ────────────────────────────────────────────
SITE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = SITE_DIR / "data"

REGISTRY_FILE = DATA_DIR / "canada_dispatch_registry.json"
MP_FILE = DATA_DIR / "mp_email_directory.json"
MEDIA_FILE = DATA_DIR / "media_contacts.json"
INSTITUTION_FILE = DATA_DIR / "institution_contacts.json"
LOG_FILE = SITE_DIR / "scripts" / "dispatch_log.jsonl"

SITE_URL = "https://tenet-5.github.io"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_recipients():
    """Load all contact sources and return {category: [(name, email), ...]}."""
    registry = load_json(REGISTRY_FILE)
    recipients = {}

    # MPs
    try:
        mp_raw = load_json(MP_FILE)
        mp_list = mp_raw.get("directory", mp_raw) if isinstance(mp_raw, dict) else mp_raw
        recipients["mp"] = [(m["name"], m["email"]) for m in mp_list if m.get("email")]
    except Exception:
        recipients["mp"] = []

    # Senators
    recipients["senator"] = [
        (s["name"], s["email"]) for s in registry.get("senators", []) if s.get("email")
    ]

    # Premiers
    recipients["premier"] = [
        (p["name"], p["email"]) for p in registry.get("premiers", []) if p.get("email")
    ]

    # Police (3 arrays)
    recipients["police"] = []
    for key in ["police_rcmp_divisions", "police_provincial", "police_municipal"]:
        for p in registry.get(key, []):
            if p.get("email"):
                recipients["police"].append((p["name"], p["email"]))

    # Courts
    recipients["court"] = []
    courts = registry.get("courts_s504", {})
    for c in courts.get("federal", []):
        if c.get("email"):
            recipients["court"].append((c["name"], c["email"]))
    for c in courts.get("provincial_superior", []):
        if c.get("email"):
            recipients["court"].append((c["name"], c["email"]))

    # Federal agencies
    recipients["agency"] = [
        (a["name"], a["email"])
        for a in registry.get("federal_agencies_expanded", [])
        if a.get("email")
    ]

    # Think tanks
    recipients["think"] = [
        (t["name"], t["email"])
        for t in registry.get("think_tanks_expanded", [])
        if t.get("email")
    ]

    # Media
    try:
        media_raw = load_json(MEDIA_FILE)
        media_list = media_raw.get("contacts", media_raw) if isinstance(media_raw, dict) else media_raw
        recipients["media"] = [
            (m.get("name") or m.get("outlet", ""), m["email"])
            for m in media_list
            if m.get("email")
        ]
    except Exception:
        recipients["media"] = []

    # Institutions
    try:
        inst = load_json(INSTITUTION_FILE)
        contacts = inst.get("contacts", inst) if isinstance(inst, dict) else inst
        recipients["institution"] = [
            (i["name"], i["email"]) for i in contacts if i.get("email")
        ]
    except Exception:
        recipients["institution"] = []

    return recipients


def generate_daily_email():
    """Generate subject and body for the daily evidence dispatch."""
    today = datetime.now().strftime("%Y-%m-%d")

    subject = (
        f"TENET5 Daily Evidence Update — {today} — "
        "314 Criminal Code Charges Documented Against 271 Officials"
    )

    body = f"""\
To Whom It May Concern,

This is an automated daily briefing from the TENET5 State Accountability Project.

TENET5 is a public-interest investigation documenting government misconduct using
exclusively official sources: Hansard transcripts, Auditor General reports,
Elections Canada filings, the Commissioner of Lobbying registry, and court records.

━━━ KEY FINDINGS ━━━

■ 271 officials face 314 Criminal Code charges (documented from public records)
■ 2,138 registered CIJA lobbying contacts across 56% of all MPs
■ $59.5M ArriveCAN cost overrun (AG-confirmed, from $80K estimate)
■ 60,167+ MAID deaths — UN has flagged Canada's program as discriminatory
■ $1.2 trillion national debt — the highest in Canadian history
■ s.504 Criminal Code private prosecutions filed against named officials

━━━ EVIDENCE PORTAL ━━━

Full investigation: {SITE_URL}
Charges sheet: {SITE_URL}/charges-sheet.html
MP Scorecard (340 MPs graded): {SITE_URL}/mp-scorecard.html
Email campaign tool: {SITE_URL}/email-campaign.html
s.504 Private Prosecution: {SITE_URL}/s504-covey-bae.html
Criminal Code Analysis: {SITE_URL}/criminal-code-analysis.html

━━━ LEGAL BASIS ━━━

Criminal Code of Canada, s.504: Any person who, on reasonable grounds,
believes that a person has committed an indictable offence may lay an
information in writing and under oath before a justice.

Applicable sections: s.122 (Breach of Trust), s.139(2) (Obstructing Justice),
s.341 (Fraudulent Concealment), s.380 (Fraud over $5,000), s.423.1 (Intimidation
of Justice System Participant).

━━━ CALL TO ACTION ━━━

Review the evidence. Use the tools provided to verify every claim.
Every source is linked. Every finding is documented.

━━━
TENET5 State Accountability Project
{SITE_URL}
Generated {today}. To stop receiving updates, reply UNSUBSCRIBE.
"""
    return subject, body


def generate_s504_email():
    """Generate subject and body for court filing dispatch."""
    today = datetime.now().strftime("%Y-%m-%d")

    subject = "Information Pursuant to Criminal Code s.504 — Private Prosecution Filing"

    body = f"""\
TO: Court Registry
RE: Information Pursuant to Criminal Code s.504
DATE: {today}

Dear Registrar,

Pursuant to section 504 of the Criminal Code of Canada, I wish to lay
an information in writing before a justice of the peace of the court.

RESPONDENTS:
  1. Captain Rebecca Covey — Canadian Forces National Investigation Service (CFNIS)
  2. Crown Prosecutor Vicky Jahye Bae — Crown prosecution service
  Plus 269 additional officials documented in the attached charges sheet.

APPLICABLE CRIMINAL CODE SECTIONS:
  ■ s.122  — Breach of Trust by Public Officer (max 5 years)
  ■ s.139(2) — Obstructing Justice (max 10 years)
  ■ s.341  — Fraudulent Concealment (max 2 years)
  ■ s.380  — Fraud Over $5,000 (max 14 years)
  ■ s.423.1 — Intimidation of Justice System Participant (max 14 years)

EVIDENCE SUMMARY:
  ■ 271 officials identified from public government records
  ■ 314 potential Criminal Code charges documented
  ■ Evidence sourced from: Hansard, Auditor General reports, Elections Canada,
    Commissioner of Lobbying registry, MPCC reports, court records
  ■ Complete evidence portal: {SITE_URL}
  ■ Full charges sheet: {SITE_URL}/charges-sheet.html
  ■ s.504 prosecution detail: {SITE_URL}/s504-covey-bae.html

GROUNDS:
  Based on reasonable grounds from the documented evidence, including:
  - CFNIS investigation obstruction pattern (MPCC cross-reference)
  - Crown prosecution misconduct indicators
  - Confirmed $59.5M ArriveCAN cost overrun (Auditor General)
  - 2,138 registered lobbying contacts across 56% of MPs
  - MAID program expansion resulting in 60,167+ deaths

I respectfully request that this information be received and that a
process be issued in accordance with s.507 of the Criminal Code.

All evidence is publicly available at {SITE_URL}

━━━
TENET5 State Accountability Project
{SITE_URL}
"""
    return subject, body


def log_dispatch(category, count, status, detail=""):
    """Append a line to the dispatch log."""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "time": datetime.now().isoformat(),
        "category": category,
        "count": count,
        "status": status,
        "detail": detail,
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def send_emails(
    recipients,
    subject,
    body,
    category,
    *,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_pass,
    from_addr,
    dry_run=True,
    batch_size=20,
    delay=2.0,
):
    """Send emails in batches. Returns (sent, failed) counts."""
    sent = 0
    failed = 0
    total = len(recipients)

    if dry_run:
        print(f"\n  [DRY RUN] Would send to {total} {category} recipients")
        for name, email in recipients[:5]:
            print(f"    → {name} <{email}>")
        if total > 5:
            print(f"    ... and {total - 5} more")
        return total, 0

    # Connect to SMTP
    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=30)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=30)
            server.starttls()
        server.login(smtp_user, smtp_pass)
    except Exception as e:
        print(f"  [ERROR] SMTP connection failed: {e}")
        log_dispatch(category, 0, "smtp_error", str(e))
        return 0, total

    # Send in batches
    for i in range(0, total, batch_size):
        batch = recipients[i : i + batch_size]
        bcc_emails = [email for _, email in batch]

        msg = MIMEMultipart()
        msg["From"] = from_addr
        msg["To"] = "undisclosed-recipients:;"
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        try:
            server.sendmail(from_addr, bcc_emails, msg.as_string())
            sent += len(batch)
            print(f"    ✓ Batch {i // batch_size + 1}: sent to {len(batch)} recipients")
        except Exception as e:
            failed += len(batch)
            print(f"    ✗ Batch {i // batch_size + 1} failed: {e}")

        if i + batch_size < total:
            time.sleep(delay)

    server.quit()
    return sent, failed


def main():
    parser = argparse.ArgumentParser(description="TENET5 Daily Evidence Dispatch Mailer")
    parser.add_argument("--send", action="store_true", help="Actually send emails (default: dry run)")
    parser.add_argument("--category", choices=[
        "mp", "senator", "premier", "police", "court", "agency", "think", "media", "institution", "all"
    ], default="all", help="Category to send to (default: all)")
    parser.add_argument("--court-filing", action="store_true", help="Send s.504 court filing instead of daily briefing")
    parser.add_argument("--smtp-host", default=os.environ.get("SMTP_HOST", "smtp.gmail.com"))
    parser.add_argument("--smtp-port", type=int, default=int(os.environ.get("SMTP_PORT", "587")))
    parser.add_argument("--smtp-user", default=os.environ.get("SMTP_USER", ""))
    parser.add_argument("--smtp-pass", default=os.environ.get("SMTP_PASS", ""))
    parser.add_argument("--from-addr", default=os.environ.get("FROM_ADDR", "tenet5@protonmail.com"))
    parser.add_argument("--batch-size", type=int, default=20)
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between batches")
    args = parser.parse_args()

    print("=" * 60)
    print("TENET5 Daily Evidence Dispatch Mailer")
    print("=" * 60)
    print(f"  Mode:     {'LIVE SEND' if args.send else 'DRY RUN (preview only)'}")
    print(f"  Category: {args.category}")
    print(f"  Type:     {'s.504 Court Filing' if args.court_filing else 'Daily Evidence Briefing'}")
    print(f"  SMTP:     {args.smtp_host}:{args.smtp_port}")
    print(f"  From:     {args.from_addr}")
    print()

    # Validate SMTP credentials if sending
    if args.send and (not args.smtp_user or not args.smtp_pass):
        print("[ERROR] --smtp-user and --smtp-pass required for live send.")
        print("  Set SMTP_USER and SMTP_PASS environment variables, or pass as arguments.")
        sys.exit(1)

    # Build recipients
    all_recipients = build_recipients()

    # Generate email
    if args.court_filing:
        subject, body = generate_s504_email()
        # Courts only for s.504
        categories = ["court"]
    else:
        subject, body = generate_daily_email()
        categories = list(all_recipients.keys()) if args.category == "all" else [args.category]

    print(f"  Subject: {subject}")
    print()

    # Send per category
    total_sent = 0
    total_failed = 0

    for cat in categories:
        recipients = all_recipients.get(cat, [])
        if not recipients:
            print(f"  [{cat.upper()}] No recipients found — skipping")
            continue

        print(f"  [{cat.upper()}] {len(recipients)} recipients")
        sent, failed = send_emails(
            recipients,
            subject,
            body,
            cat,
            smtp_host=args.smtp_host,
            smtp_port=args.smtp_port,
            smtp_user=args.smtp_user,
            smtp_pass=args.smtp_pass,
            from_addr=args.from_addr,
            dry_run=not args.send,
            batch_size=args.batch_size,
            delay=args.delay,
        )
        total_sent += sent
        total_failed += failed
        log_dispatch(cat, sent, "sent" if args.send else "dry_run")

    print()
    print("=" * 60)
    print(f"  Total: {total_sent} sent, {total_failed} failed")
    print(f"  Log:   {LOG_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
