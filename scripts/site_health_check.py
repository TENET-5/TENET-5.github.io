# TENET5 Site Health Checker — CI/CD pipeline for tenet-5.github.io
# Validates all pages, data files, links, and reports via NATS
# Modified: 2026-04-09 | Author: claude_code | SYSTEM_SEED=118400
"""
Usage:
    python site_health_check.py              # Run all checks, print report
    python site_health_check.py --json       # Output JSON report
    python site_health_check.py --nats       # Report via NATS to LIRIL
    python site_health_check.py --fix        # Auto-fix what it can
"""
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

SITE_ROOT = Path(__file__).parent.parent
SEED = 118400


def check_html_pages():
    """Validate all HTML pages have content and proper structure."""
    issues = []
    pages = sorted(SITE_ROOT.glob("*.html"))

    for page in pages:
        try:
            content = page.read_text(encoding="utf-8", errors="replace")
            name = page.name

            # Check minimum size
            if len(content) < 200:
                issues.append({"page": name, "severity": "critical", "issue": f"Stub page ({len(content)} bytes)"})
                continue

            # Check has <title>
            if "<title>" not in content.lower():
                issues.append({"page": name, "severity": "high", "issue": "Missing <title> tag"})

            # Check has nav
            if "site-nav" not in content and "nav" not in content.lower()[:2000]:
                issues.append({"page": name, "severity": "medium", "issue": "Missing navigation"})

            # Check for broken fetch references
            fetches = re.findall(r"fetch\(['\"]([^'\"]+)['\"]", content)
            for url in fetches:
                clean = url.split("?")[0]  # strip query params
                if not clean.startswith("http") and not clean.startswith("//"):
                    data_path = SITE_ROOT / clean
                    if not data_path.exists():
                        issues.append({"page": name, "severity": "critical",
                                       "issue": f"Missing data file: {clean}"})

            # Check for broken local links
            hrefs = re.findall(r'href=["\']([^"\'#]+)["\']', content)
            for href in hrefs:
                if href.startswith("http") or href.startswith("//") or href.startswith("mailto:"):
                    continue
                clean = href.split("?")[0]
                if clean.endswith(".html"):
                    if not (SITE_ROOT / clean).exists():
                        issues.append({"page": name, "severity": "high",
                                       "issue": f"Broken link: {clean}"})

            # Check for broken script/css references
            srcs = re.findall(r'src=["\']([^"\']+)["\']', content)
            for src in srcs:
                if src.startswith("http") or src.startswith("//") or src.startswith("data:"):
                    continue
                clean = src.split("?")[0]
                if not (SITE_ROOT / clean).exists():
                    issues.append({"page": name, "severity": "medium",
                                   "issue": f"Missing asset: {clean}"})

        except Exception as e:
            issues.append({"page": page.name, "severity": "critical", "issue": f"Read error: {e}"})

    return pages, issues


def check_data_files():
    """Validate all JSON data files parse correctly."""
    issues = []
    data_files = list(SITE_ROOT.rglob("data/**/*.json"))

    for f in data_files:
        try:
            content = f.read_text(encoding="utf-8")
            d = json.loads(content)
            # Check for empty data
            if isinstance(d, dict) and not d:
                issues.append({"file": str(f.relative_to(SITE_ROOT)), "severity": "medium",
                               "issue": "Empty JSON object"})
            elif isinstance(d, list) and not d:
                issues.append({"file": str(f.relative_to(SITE_ROOT)), "severity": "medium",
                               "issue": "Empty JSON array"})
        except json.JSONDecodeError as e:
            issues.append({"file": str(f.relative_to(SITE_ROOT)), "severity": "critical",
                           "issue": f"Invalid JSON: {e}"})
        except Exception as e:
            issues.append({"file": str(f.relative_to(SITE_ROOT)), "severity": "high",
                           "issue": f"Read error: {e}"})

    return data_files, issues


def check_network_integrity():
    """Validate network analysis data consistency."""
    issues = []
    net_path = SITE_ROOT / "data" / "network_analysis" / "influence_network.json"
    if not net_path.exists():
        return [{"file": "influence_network.json", "severity": "critical", "issue": "Missing network data"}]

    d = json.loads(net_path.read_text(encoding="utf-8"))
    nodes = d.get("nodes", [])
    edges = d.get("edges", [])
    node_ids = {n["id"] for n in nodes}

    # Check for orphan edges
    orphan_count = 0
    for e in edges:
        if e["source"] not in node_ids:
            orphan_count += 1
        if e["target"] not in node_ids:
            orphan_count += 1
    if orphan_count:
        issues.append({"file": "influence_network.json", "severity": "high",
                       "issue": f"{orphan_count} orphan edge references (source/target not in nodes)"})

    # Check for duplicate node IDs
    if len(node_ids) != len(nodes):
        issues.append({"file": "influence_network.json", "severity": "high",
                       "issue": f"Duplicate node IDs ({len(nodes)} nodes but {len(node_ids)} unique)"})

    # Check count consistency
    if d.get("total_nodes") != len(nodes):
        issues.append({"file": "influence_network.json", "severity": "medium",
                       "issue": f"total_nodes mismatch: header says {d.get('total_nodes')}, actual {len(nodes)}"})

    return issues


def generate_report():
    """Run all checks and generate report."""
    pages, page_issues = check_html_pages()
    data_files, data_issues = check_data_files()
    network_issues = check_network_integrity()

    all_issues = page_issues + data_issues + network_issues
    critical = [i for i in all_issues if i.get("severity") == "critical"]
    high = [i for i in all_issues if i.get("severity") == "high"]
    medium = [i for i in all_issues if i.get("severity") == "medium"]

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "seed": SEED,
        "summary": {
            "pages_checked": len(pages),
            "data_files_checked": len(data_files),
            "total_issues": len(all_issues),
            "critical": len(critical),
            "high": len(high),
            "medium": len(medium),
            "status": "FAIL" if critical else ("WARN" if high else "PASS"),
        },
        "issues": all_issues,
    }
    return report


async def report_to_nats(report):
    """Send health report to LIRIL via NATS."""
    try:
        import nats
        nc = await nats.connect(os.environ.get("NATS_URL", "nats://127.0.0.1:4223"))
        await nc.publish(
            "tenet5.site.health",
            json.dumps(report).encode("utf-8"),
        )
        print(f"Report sent to NATS tenet5.site.health ({report['summary']['status']})")
        await nc.close()
    except Exception as e:
        print(f"NATS report failed: {e}")


def main():
    report = generate_report()
    s = report["summary"]

    if "--json" in sys.argv:
        print(json.dumps(report, indent=2))
        return

    # Print human-readable report
    status_color = {"PASS": "\033[92m", "WARN": "\033[93m", "FAIL": "\033[91m"}
    reset = "\033[0m"
    color = status_color.get(s["status"], "")

    print(f"\n{'='*60}")
    print(f"  TENET5 Site Health Check — SEED={SEED}")
    print(f"  {s['pages_checked']} pages, {s['data_files_checked']} data files")
    print(f"  Status: {color}{s['status']}{reset}")
    print(f"{'='*60}")

    if s["critical"]:
        print(f"\n  CRITICAL ({s['critical']}):")
        for i in report["issues"]:
            if i.get("severity") == "critical":
                loc = i.get("page") or i.get("file")
                print(f"    [!!] {loc}: {i['issue']}")

    if s["high"]:
        print(f"\n  HIGH ({s['high']}):")
        for i in report["issues"]:
            if i.get("severity") == "high":
                loc = i.get("page") or i.get("file")
                print(f"    [!]  {loc}: {i['issue']}")

    if s["medium"]:
        print(f"\n  MEDIUM ({s['medium']}):")
        for i in report["issues"]:
            if i.get("severity") == "medium":
                loc = i.get("page") or i.get("file")
                print(f"    [~]  {loc}: {i['issue']}")

    if not report["issues"]:
        print(f"\n  {color}All checks passed.{reset}")

    print()

    if "--nats" in sys.argv:
        import asyncio
        asyncio.run(report_to_nats(report))


if __name__ == "__main__":
    main()
