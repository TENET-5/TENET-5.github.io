#!/usr/bin/env python3
"""Round 16 comprehensive audit for TENET-5.github.io"""
import os, re, glob
from collections import defaultdict

results = []
htmls = sorted(glob.glob("*.html"))
ci_pages = []
non_ci = []

for f in htmls:
    with open(f, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()
    issues = []

    # 1. Structural: div/main/section balance
    divs = len(re.findall(r"<div[\s>]", html)) - len(re.findall(r"</div>", html))
    mains = len(re.findall(r"<main[\s>]", html)) - len(re.findall(r"</main>", html))
    secs = len(re.findall(r"<section[\s>]", html)) - len(re.findall(r"</section>", html))
    if divs != 0: issues.append(f"DIV imbalance: {divs:+d}")
    if mains != 0: issues.append(f"MAIN imbalance: {mains:+d}")
    if secs != 0: issues.append(f"SECTION imbalance: {secs:+d}")

    # 2. role=main
    if not re.search(r'role=["\']main["\']', html):
        issues.append("NO role=main")

    # 3. Skip link
    if not re.search(r"skip.*main|#main", html, re.I):
        issues.append("NO skip-link")

    # 4. Title
    tm = re.search(r"<title>([^<]*)</title>", html)
    if tm:
        title = tm.group(1).strip()
        if "TENET5" not in title and "tenet5" not in title.lower():
            issues.append(f"TITLE no TENET5: {title[:50]}")
        if len(title) > 70:
            issues.append(f"TITLE >70: ({len(title)}) {title[:50]}...")
    else:
        issues.append("NO TITLE")

    # 5. Meta description
    if not re.search(r'<meta[^>]+name=["\']description["\']', html, re.I):
        issues.append("NO meta description")

    # 6. OG tags
    if not re.search(r"og:title", html): issues.append("NO og:title")
    if not re.search(r"og:description", html): issues.append("NO og:description")
    if not re.search(r"og:site_name", html): issues.append("NO og:site_name")

    # 7. Canonical
    if not re.search(r'<link[^>]+rel=["\']canonical["\']', html, re.I):
        issues.append("NO canonical")

    # 8. shell.js (nav/footer loader)
    if not re.search(r"shell\.js", html):
        issues.append("NO shell.js")

    # 9. Empty headings (skip known JS-populated)
    for m in re.finditer(r"<(h[1-6])([^>]*)>\s*</(h[1-6])>", html):
        if "id=" in m.group(2): continue
        ln = html[:m.start()].count("\n") + 1
        issues.append(f"EMPTY HEADING L{ln}: <{m.group(1)}>")

    # 10. Duplicate IDs
    ids = re.findall(r'id=["\']([^"\']+)["\']', html)
    dupes = [x for x in set(ids) if ids.count(x) > 1]
    if dupes:
        issues.append(f"DUPE IDs: {dupes[:3]}")

    # 11. CI detection — look for [CONNECTED INTELLIGENCE] section
    has_ci = bool(re.search(r"CONNECTED INTELLIGENCE", html))
    if has_ci:
        ci_pages.append(f)
    elif f not in ["404.html", "auth-callback.html", "home.html", "index.html",
                    "sitemap.html", "test-narration-validation.html"]:
        non_ci.append(f)

    if issues:
        results.append((f, issues))

# 12. CI link integrity
ci_targets = defaultdict(list)
ci_sources = defaultdict(list)
for f in ci_pages:
    with open(f, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()
    for m in re.finditer(r'href=["\']([^"\'#]+\.html)["\']', html):
        target = m.group(1)
        if target == f: continue
        ci_targets[f].append(target)
        ci_sources[target].append(f)

orphans = [p for p in ci_pages if len(ci_sources.get(p, [])) == 0
           and p not in ["ag-findings.html", "master-index.html"]]

print(f"HTML: {len(htmls)} | CI: {len(ci_pages)} | Non-CI (unexpected): {len(non_ci)}")
if non_ci:
    print(f"  Non-CI pages: {non_ci}")
print(f"CI Orphans (0 inbound): {len(orphans)}")
if orphans:
    for o in orphans:
        print(f"  {o}")
print(f"Issues: {sum(len(i) for _, i in results)}")
for f, iss in results:
    for issue in iss:
        sev = "HIGH" if any(k in issue for k in ["imbalance", "NO role", "NO TITLE", "NO shell"]) \
              else "MED" if any(k in issue for k in ["TITLE", "EMPTY", "DUPE", "NO meta", "NO og", "NO canonical", "NO skip"]) \
              else "LOW"
        print(f"  [{sev}] {f}: {issue}")
