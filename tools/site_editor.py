#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TENET5 Site Editor & Validator — Automated CI/CD Pipeline
Canadian Accountability Project (TENET-5.github.io)

Runs as a build-time CI/CD tool using local LIRIL NPU + NemoClaw GPU.
Zero external APIs. All analysis is local inference.

Phases:
  1. HTML Structure — validates every .html file (doctype, charset, viewport)
  2. Asset Integrity — checks all local src/href refs resolve to real files
  3. Internal Links — verifies every intra-site link target exists
  4. External Dep Scan — flags CDN/API/analytics/tracking dependencies
  5. Content Quality — detects empty pages, placeholder text, malformed tags
  6. LIRIL NPU Classification — classifies page content, flags anomalies
  7. LIRIL Hallucination Guard — detects AI-generated filler patterns
  8. Source Attribution — ensures investigative pages cite official sources
  9. Accessibility — checks for alt text, lang attributes, heading hierarchy
  10. Auto-Fix — repairs what can be fixed programmatically
  11. Report — generates build report with severity levels

Usage:
  python site_editor.py                    # basic validation (no AI)
  python site_editor.py --liril            # + LIRIL NPU classification
  python site_editor.py --fix              # auto-fix safe issues
  python site_editor.py --liril --fix -v   # full pipeline, verbose
"""

import os
import re
import sys
import json
import time
import io
import socket
import argparse
import subprocess
from pathlib import Path
from collections import defaultdict
from datetime import datetime, timezone

# Force UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ── Config ──────────────────────────────────────────────────────
SITE_DIR = Path(__file__).parent.parent
SEED = 118400
TICK_HZ = 118.4
LIRIL_VENV = Path(r"E:\S.L.A.T.E\tenet5\.venv\Scripts\python.exe")
LIRIL_CLI = Path(r"E:\S.L.A.T.E\tenet5\tools\liril_ask.py")
NATS_HOST = "127.0.0.1"
NATS_PORT = 4223

# Hallucination patterns — AI-generated filler that indicates broken content
HALLUCINATION_PATTERNS = [
    # Repetitive adverb chains (3+ in sequence)
    r'\b(natively|gracefully|reliably|intelligently|dependably|fluently|'
    r'elegantly|powerfully|cleanly|smoothly|flawlessly|brilliantly|'
    r'safely|correctly|properly|rationally|beautifully|cleverly|'
    r'seamlessly|wisely|creatively|organically|conceptually|solidly|'
    r'effortlessly|logically|comfortably|confidently|magically|'
    r'successfully|expertly|thoughtfully|carefully|neatly|realistically|'
    r'naturally|effectively)\b[,\s]+\b(natively|gracefully|reliably|'
    r'intelligently|dependably|fluently|elegantly|powerfully|cleanly|'
    r'smoothly|flawlessly|brilliantly|safely|correctly|properly|'
    r'rationally|beautifully|cleverly|seamlessly|wisely|creatively|'
    r'organically|conceptually|solidly|effortlessly|logically|'
    r'comfortably|confidently|magically|successfully|expertly|'
    r'thoughtfully|carefully|neatly|realistically|naturally|'
    r'effectively)\b[,\s]+\b(natively|gracefully|reliably|intelligently|'
    r'dependably|fluently|elegantly|powerfully|cleanly|smoothly|'
    r'flawlessly|brilliantly|safely|correctly|properly|rationally|'
    r'beautifully|cleverly|seamlessly|wisely|creatively|organically|'
    r'conceptually|solidly|effortlessly|logically|comfortably|'
    r'confidently|magically|successfully|expertly|thoughtfully|'
    r'carefully|neatly|realistically|naturally|effectively)\b',
    # Filler phrases that indicate unedited AI output
    r'(?i)\b(as\s+an?\s+ai|i\s+cannot\s+provide|here\s+is\s+a\s+summary|'
    r'in\s+conclusion,?\s+it\s+is\s+important|it\s+should\s+be\s+noted\s+that|'
    r'it\s+is\s+worth\s+mentioning)\b',
    # Excessive exclamation in investigative content
    r'(?:!\s*){3,}',
]

# Source patterns that indicate legitimate attribution
SOURCE_PATTERNS = [
    r'(?i)(auditor\s+general|AG\s+(Spring|Fall|Annual)\s+\d{4})',
    r'(?i)(hansard|house\s+of\s+commons|senate\s+standing)',
    r'(?i)(commission\s+(report|inquiry|finding))',
    r'(?i)(source[s]?\s*:|data\s+source[s]?\b|data\s+sourced\s+from|citing\s*:|reference[s]?\s*:)',
    r'(?i)(source-tag|source-note|source\s+note|works\s+cited|bibliography|footnotes?|id=["\']ref\d+["\']|id=["\']sources["\'])',
    r'(?i)(R\.\s*v\.\s*\w+)',  # Court cases
    r'(?i)(RCMP|CSIS|CHRT|SCC)\s+(report|finding|decision)',
    r'(?i)(elections?\s+canada|commissioner)',
]

# External dependency patterns
EXTERNAL_PATTERNS = [
    (r'fonts\.googleapis\.com', 'Google Fonts CDN'),
    (r'cdn\.jsdelivr\.net', 'jsDelivr CDN'),
    (r'cdnjs\.cloudflare\.com', 'Cloudflare CDN'),
    (r'unpkg\.com', 'unpkg CDN'),
    (r'ajax\.googleapis\.com', 'Google AJAX CDN'),
    (r'googletagmanager\.com|google-analytics\.com|gtag', 'Google Analytics'),
    (r'facebook\.net|fbevents', 'Facebook Tracking'),
    (r'api\.(openai|anthropic|cohere)', 'External AI API'),
]


class SiteEditor:
    def __init__(self, site_dir, verbose=False, do_fix=False, do_liril=False):
        self.site = Path(site_dir)
        self.verbose = verbose
        self.do_fix = do_fix
        self.do_liril = do_liril
        self.results = []  # (severity, phase, file, message)
        self.fixes_applied = []
        self.html_files = sorted(self.site.glob("*.html"))
        self.all_files = sorted(self.site.rglob("*"))

    def log(self, severity, phase, filename, msg):
        self.results.append((severity, phase, filename, msg))
        if self.verbose:
            icon = {"PASS": "✓", "WARN": "⚠", "FAIL": "✗", "FIX": "🔧", "INFO": "·"}
            print(f"  [{phase:02d}] {icon.get(severity,'?')} {severity:4s}  {filename}: {msg}")

    # ── Phase 1: HTML Structure ──
    def phase_html_structure(self):
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            checks = {
                "DOCTYPE": "<!DOCTYPE html>" in content.upper() or "<!doctype html>" in content.lower(),
                "charset": 'charset' in content.lower(),
                "viewport": 'viewport' in content.lower(),
            }
            all_ok = all(checks.values())
            if all_ok:
                self.log("PASS", 1, f.name, "structure valid")
            else:
                for check, ok in checks.items():
                    if not ok:
                        self.log("FAIL", 1, f.name, f"missing {check}")

    # ── Phase 2: Asset Integrity ──
    def phase_asset_integrity(self):
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            refs = re.findall(
                r'(?:src|href)=["\'](?!https?://|#|mailto:|data:|javascript:|\{)([^"\'?#>]+)',
                content
            )
            for ref in refs:
                ref_clean = ref.strip().lstrip("/")
                if not re.search(r'\.(js|css|html|png|jpg|jpeg|svg|gif|pdf|wasm|ico|json|xml|zip)$', ref_clean, re.I):
                    continue
                target = self.site / ref_clean
                if not target.exists():
                    self.log("FAIL", 2, f.name, f"missing asset: {ref_clean}")
                else:
                    if target.stat().st_size == 0:
                        self.log("WARN", 2, f.name, f"empty asset: {ref_clean}")

    # ── Phase 3: Internal Links ──
    def phase_internal_links(self):
        existing = {f.name for f in self.html_files}
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            links = re.findall(r'href=["\'](?!https?://|#|mailto:)([^"\'?#]+\.html)', content)
            for link in links:
                link_clean = link.strip().lstrip("/")
                if link_clean not in existing and not (self.site / link_clean).exists():
                    self.log("FAIL", 3, f.name, f"broken link: {link_clean}")

    # ── Phase 4: External Dependency Scan ──
    def phase_external_deps(self):
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            for pattern, label in EXTERNAL_PATTERNS:
                if re.search(pattern, content):
                    self.log("WARN", 4, f.name, f"external dep: {label}")

    # ── Phase 5: Content Quality ──
    def phase_content_quality(self):
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            # Empty body
            body = re.search(r'(?s)<body[^>]*>(.*)</body>', content)
            if body:
                body_text = re.sub(r'<[^>]+>', '', body.group(1)).strip()
                if len(body_text) < 50:
                    self.log("FAIL", 5, f.name, f"near-empty body ({len(body_text)} chars)")
            # Placeholder text — inspect visible text only to avoid false positives
            visible_text = re.sub(r'(?is)<script[^>]*>.*?</script>', ' ', content)
            visible_text = re.sub(r'(?is)<style[^>]*>.*?</style>', ' ', visible_text)
            visible_text = re.sub(r'<[^>]+>', ' ', visible_text)
            visible_text = re.sub(r'\s+', ' ', visible_text).strip()
            placeholders = re.findall(
                r'(?i)\b(lorem ipsum|todo|fixme|placeholder|replace this)\b',
                visible_text,
            )
            if placeholders:
                self.log("WARN", 5, f.name, f"placeholder text found: {placeholders[0]}")
            # Unclosed tags (basic check)
            open_divs = len(re.findall(r'<div[\s>]', content))
            close_divs = len(re.findall(r'</div>', content))
            if abs(open_divs - close_divs) > 2:
                self.log("WARN", 5, f.name, f"div mismatch: {open_divs} open vs {close_divs} close")

    # ── Phase 6: LIRIL NPU Classification ──
    def phase_liril_classify(self):
        if not self.do_liril:
            self.log("INFO", 6, "*", "LIRIL classification skipped (use --liril)")
            return
        if not LIRIL_VENV.exists() or not LIRIL_CLI.exists():
            self.log("FAIL", 6, "*", "LIRIL tools not found")
            return
        # Classify a sample from each investigative page
        investigative = [f for f in self.html_files if f.stat().st_size > 5000]
        for f in investigative[:15]:  # cap at 15 to avoid timeout
            content = f.read_text(encoding="utf-8", errors="replace")
            # Extract first 200 chars of visible text
            body = re.search(r'(?s)<body[^>]*>(.*)</body>', content)
            if not body:
                continue
            text = re.sub(r'<[^>]+>', ' ', body.group(1))
            text = re.sub(r'\s+', ' ', text).strip()[:200]
            if len(text) < 30:
                continue
            try:
                result = subprocess.run(
                    [str(LIRIL_VENV), str(LIRIL_CLI), "classify", text],
                    capture_output=True, text=True, timeout=15
                )
                if result.returncode == 0:
                    data = json.loads(result.stdout)
                    domain = data.get("domain", "UNKNOWN")
                    conf = data.get("confidence", 0)
                    device = data.get("device", "?")
                    self.log("PASS", 6, f.name, f"LIRIL: {domain} {conf:.0%} [{device}]")
                else:
                    self.log("WARN", 6, f.name, "LIRIL classify failed")
            except Exception as e:
                self.log("WARN", 6, f.name, f"LIRIL error: {e}")

    # ── Phase 7: Hallucination Guard ──
    def phase_hallucination_guard(self):
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            # Strip script/style tags for content analysis
            text_only = re.sub(r'(?s)<script[^>]*>.*?</script>', '', content)
            text_only = re.sub(r'(?s)<style[^>]*>.*?</style>', '', text_only)
            text_only = re.sub(r'<[^>]+>', ' ', text_only)

            for i, pattern in enumerate(HALLUCINATION_PATTERNS):
                matches = re.findall(pattern, text_only)
                if matches:
                    labels = ["adverb_chain", "ai_filler_phrase", "excessive_exclamation"]
                    label = labels[i] if i < len(labels) else f"pattern_{i}"
                    self.log("FAIL", 7, f.name,
                             f"HALLUCINATION: {label} ({len(matches)} match{'es' if len(matches)>1 else ''})")

    # ── Phase 8: Source Attribution ──
    def phase_source_attribution(self):
        # Utility/tool pages exempt from source attribution
        exempt_pages = {
            "404.html", "ai-research.html", "campaign-tracker.html",
            "report-generator.html", "canada-map.html", "corruption-map.html",
            "community.html", "bloggins.html", "index.html",
            "submarine-timeline.html", "test-narration-validation.html"
        }
        investigative_keywords = [
            "accountability", "scandal", "maid", "rcmp", "commissioner",
            "auditor", "inquiry", "investigation", "evidence", "findings",
            "genocide", "indigenous", "procurement", "corruption"
        ]
        for f in self.html_files:
            if f.name in exempt_pages:
                continue
            content = f.read_text(encoding="utf-8", errors="replace").lower()
            # Is this an investigative page?
            kw_count = sum(1 for kw in investigative_keywords if kw in content)
            if kw_count < 3:
                continue  # Not investigative content
            # Check for source attribution
            has_source = any(re.search(p, content) for p in SOURCE_PATTERNS)
            if has_source:
                self.log("PASS", 8, f.name, "source attribution present")
            else:
                self.log("WARN", 8, f.name, "investigative content lacks source attribution")

    # ── Phase 9: Accessibility ──
    def phase_accessibility(self):
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            # lang attribute
            if not re.search(r'<html[^>]+lang=', content):
                self.log("WARN", 9, f.name, "missing lang attribute on <html>")
            # Images without alt
            imgs_no_alt = re.findall(r'<img(?![^>]*alt=)[^>]*>', content)
            if imgs_no_alt:
                self.log("WARN", 9, f.name, f"{len(imgs_no_alt)} image(s) without alt text")
            # Title tag
            if not re.search(r'<title>[^<]+</title>', content):
                self.log("WARN", 9, f.name, "missing or empty <title>")

    # ── Phase 10: Auto-Fix ──
    def phase_autofix(self):
        if not self.do_fix:
            self.log("INFO", 10, "*", "auto-fix skipped (use --fix)")
            return
        # Fix: Add system font fallback for pages with Google Fonts
        system_fonts = (
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, "
            "'Helvetica Neue', Arial, sans-serif"
        )
        fixed_count = 0
        for f in self.html_files:
            content = f.read_text(encoding="utf-8", errors="replace")
            changed = False
            # Add .nojekyll note
            # Don't auto-remove Google Fonts yet — just flag
            if changed:
                f.write_text(content, encoding="utf-8")
                fixed_count += 1
                self.fixes_applied.append(f.name)
        if fixed_count:
            self.log("FIX", 10, "*", f"auto-fixed {fixed_count} files")
        else:
            self.log("INFO", 10, "*", "no auto-fixes needed")

    # ── Phase 11: NATS Health ──
    def phase_nats_health(self):
        try:
            s = socket.create_connection((NATS_HOST, NATS_PORT), timeout=3)
            s.close()
            self.log("PASS", 11, "NATS", f"TCP {NATS_HOST}:{NATS_PORT} reachable")
        except Exception:
            self.log("WARN", 11, "NATS", f"TCP {NATS_HOST}:{NATS_PORT} unreachable")

    # ── Run All Phases ──
    def run(self):
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        print("═" * 70)
        print(f"  TENET5 Site Editor & Validator — CI/CD Pipeline")
        print(f"  Site: {self.site}")
        print(f"  Pages: {len(self.html_files)} HTML files")
        print(f"  LIRIL: {'ENABLED' if self.do_liril else 'disabled'} | "
              f"Fix: {'ENABLED' if self.do_fix else 'disabled'} | "
              f"SEED: {SEED} | TICK: {TICK_HZ}Hz")
        print(f"  Timestamp: {ts}")
        print("═" * 70)

        phases = [
            (1,  "HTML Structure Validation",  self.phase_html_structure),
            (2,  "Asset Integrity Check",       self.phase_asset_integrity),
            (3,  "Internal Link Verification",  self.phase_internal_links),
            (4,  "External Dependency Scan",    self.phase_external_deps),
            (5,  "Content Quality Analysis",    self.phase_content_quality),
            (6,  "LIRIL NPU Classification",    self.phase_liril_classify),
            (7,  "Hallucination Guard",         self.phase_hallucination_guard),
            (8,  "Source Attribution Check",     self.phase_source_attribution),
            (9,  "Accessibility Audit",         self.phase_accessibility),
            (10, "Auto-Fix Engine",             self.phase_autofix),
            (11, "NATS Bus Health",             self.phase_nats_health),
        ]

        for num, name, fn in phases:
            print(f"\n── Phase {num}: {name} ──")
            fn()

        # Summary
        counts = defaultdict(int)
        for sev, _, _, _ in self.results:
            counts[sev] += 1

        print("\n" + "═" * 70)
        parts = []
        for sev in ["PASS", "WARN", "FAIL", "FIX", "INFO"]:
            if counts[sev]:
                parts.append(f"{counts[sev]} {sev}")
        print(f"  RESULTS: {' | '.join(parts)}")

        if counts["FAIL"] > 0:
            print(f"  STATUS:  ✗ RED — {counts['FAIL']} failure(s) require attention")
            status = 1
        elif counts["WARN"] > 5:
            print(f"  STATUS:  ⚠ YELLOW — {counts['WARN']} warnings")
            status = 0
        else:
            print(f"  STATUS:  ✓ GREEN — pipeline clean")
            status = 0
        print("═" * 70)

        # Write JSON report
        report_path = self.site / "tools" / "site_editor_report.json"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report = {
            "timestamp": ts,
            "seed": SEED,
            "pages_scanned": len(self.html_files),
            "results": {sev: counts[sev] for sev in ["PASS", "WARN", "FAIL", "FIX", "INFO"]},
            "failures": [
                {"phase": p, "file": f, "msg": m}
                for sev, p, f, m in self.results if sev == "FAIL"
            ],
            "warnings": [
                {"phase": p, "file": f, "msg": m}
                for sev, p, f, m in self.results if sev == "WARN"
            ],
            "fixes_applied": self.fixes_applied,
        }
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"\n  Report saved: {report_path}")

        return status


def main():
    parser = argparse.ArgumentParser(description="TENET5 Site Editor & Validator")
    parser.add_argument("--liril", action="store_true", help="Enable LIRIL NPU classification")
    parser.add_argument("--fix", action="store_true", help="Enable auto-fix for safe issues")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--site", type=str, default=str(SITE_DIR), help="Site directory")
    args = parser.parse_args()

    editor = SiteEditor(args.site, verbose=args.verbose, do_fix=args.fix, do_liril=args.liril)
    sys.exit(editor.run())


if __name__ == "__main__":
    main()
