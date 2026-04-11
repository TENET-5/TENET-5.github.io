"""Full site audit: find broken internal links, references to removed pages, board.js loads, and localhost references."""
import os, re, json

ROOT = r"E:\TENET-5.github.io"

# All existing HTML files
existing_html = set()
for f in os.listdir(ROOT):
    if f.endswith('.html'):
        existing_html.add(f)
# Include subdirs
for subdir in ['reduster', 'reduster/dist']:
    d = os.path.join(ROOT, subdir)
    if os.path.isdir(d):
        for f in os.listdir(d):
            if f.endswith('.html'):
                existing_html.add(f"{subdir}/{f}")

# Removed pages (OSINT dashboards deleted earlier)
removed_pages = {
    'knowledge-graph.html', 'entity-registry.html', 'threat-assessment.html',
    'investigation-timeline.html', 'anomaly-scanner.html', 'intelligence-briefing.html',
    'entity-relationships.html', 'system-health.html', 'causal-graph.html',
    'darkweb-intel.html'
}

# Bad patterns to search for
bad_patterns = [
    (r'board\.js', 'board.js load (investigation board - may cause blank page)'),
    (r'localhost:\d+', 'localhost reference'),
    (r'dark\s*web|\.onion', 'darkweb reference'),
    (r'LIRIL|SATOR|NemoClaw|STARK|PEPPER', 'internal system reference'),
    (r'N-vs-NP|N\.vs\.NP|millennialfalcon|MillennialFalcon', 'internal system reference'),
]

issues = []

for fname in sorted(os.listdir(ROOT)):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(ROOT, fname)
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    lines = content.split('\n')

    # Check internal links
    hrefs = re.findall(r'href=["\']([^"\'#?]+)', content)
    for href in hrefs:
        if href.startswith(('http', 'mailto:', 'tel:', 'javascript:', 'data:')):
            continue
        # Strip path
        target = href.split('/')[-1] if '/' not in href else href
        if target.endswith('.html') and target not in existing_html:
            if target in removed_pages:
                issues.append((fname, f"LINK TO REMOVED PAGE: {target}"))
            else:
                # Check if it really doesn't exist
                full = os.path.join(ROOT, href)
                if not os.path.exists(full):
                    issues.append((fname, f"BROKEN LINK: {href}"))

    # Check bad patterns
    for pattern, desc in bad_patterns:
        for i, line in enumerate(lines, 1):
            if re.search(pattern, line, re.IGNORECASE):
                # Skip false positives in comments about removal
                if 'removed' in line.lower() or 'deleted' in line.lower():
                    continue
                issues.append((fname, f"LINE {i}: {desc} -> {line.strip()[:120]}"))

# Report
print(f"\n{'='*70}")
print(f"TENET-5 SITE AUDIT — {len(existing_html)} HTML files scanned")
print(f"{'='*70}")
print(f"\nTotal issues found: {len(issues)}\n")

# Group by file
from collections import defaultdict
by_file = defaultdict(list)
for fname, issue in issues:
    by_file[fname].append(issue)

for fname in sorted(by_file):
    print(f"\n📄 {fname} ({len(by_file[fname])} issues)")
    for issue in by_file[fname]:
        print(f"   ⚠  {issue}")

print(f"\n{'='*70}")
print(f"Files with board.js: {sum(1 for f,i in issues if 'board.js' in i)}")
print(f"Broken links: {sum(1 for f,i in issues if 'BROKEN LINK' in i)}")
print(f"Removed page refs: {sum(1 for f,i in issues if 'REMOVED PAGE' in i)}")
print(f"Localhost refs: {sum(1 for f,i in issues if 'localhost' in i)}")
print(f"Internal system refs: {sum(1 for f,i in issues if 'internal system' in i)}")
