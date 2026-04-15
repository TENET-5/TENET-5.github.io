#!/usr/bin/env python3
# Copyright (c) 2026, TENET5 Project
# All rights reserved.

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import ssl
import time
import schedule
import threading
import os

# Define constants - LIRIL S504 Directive Implementation
SMTP_SERVER = os.environ.get("TENET_SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("TENET_SMTP_PORT", 587))
FROM_EMAIL = os.environ.get("TENET_EMAIL_ACCOUNT", "tenet5.osint@proton.me")
PASSWORD = os.environ.get("TENET_EMAIL_PASS", "your-password")
SUBJECT = "Urgent: Section 504 (Treason) Evidence"
HTML_FILE = "s504-court-filing.html"

# Dynamically pull from the MP tracker database
RECIPIENT_EMAILS = []
try:
    with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'osint_vault', 'maid_mp_dossiers.json'), 'r', encoding='utf-8') as f:
        import json
        profiles = json.load(f).get('profiles', [])
        for p in profiles:
            name_parts = p.get('name', '').lower().split()
            if len(name_parts) >= 2:
                # Format: firstname.lastname@parl.gc.ca
                RECIPIENT_EMAILS.append(f"{name_parts[0]}.{name_parts[-1]}@parl.gc.ca")
    print(f"[TENET5] Loaded {len(RECIPIENT_EMAILS)} MP targets from OSINT Vault.")
except Exception as e:
    print(f"[WARNING] Failed to load MP database: {e}")
    RECIPIENT_EMAILS = ["test@example.com"]

def send_email(recipient_email: str) -> None:
    msg = MIMEMultipart()
    msg["From"] = FROM_EMAIL
    msg["To"] = recipient_email
    msg["Subject"] = SUBJECT

    file_path = os.path.join(os.path.dirname(__file__), '..', HTML_FILE)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, "r", encoding="utf-8") as file:
        html = file.read()

    msg.attach(MIMEText(html, "html"))

    try:
        context = ssl.create_default_context()
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls(context=context)
        server.login(FROM_EMAIL, PASSWORD)
        server.sendmail(FROM_EMAIL, recipient_email, msg.as_string())
        server.quit()
        print(f"  ✓ S.504 Dossier Dispatched -> {recipient_email}")
    except Exception as e:
        print(f"  ✗ Failed dispatch to {recipient_email}: {e}")

def broadcast_emails() -> None:
    print(f"\n[TENET5 BROADCASTER] Executing s.504 Mass Distribution at {time.strftime('%X')}")
    for recipient_email in RECIPIENT_EMAILS:
        send_email(recipient_email)

def run_schedule() -> None:
    schedule.every(6).hours.do(broadcast_emails)  # Run every 6 hours

    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    print("[ACTIVE] LIRIL s.504 Accountability Broadcaster (Daemon Mode)")
    # Broadcast once globally immediately on startup
    broadcast_emails()
    
    # Init 6-hour autonomous cycle
    thread = threading.Thread(target=run_schedule)
    thread.daemon = True
    thread.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[STOP] Broadcaster Terminated.")
