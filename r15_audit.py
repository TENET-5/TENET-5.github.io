"""Round 15 full-site audit for TENET-5.github.io.

Checks:
1. HTML structure: div/main/section balance
2. Accessibility: role=main, skip-link
3. SEO: title branding (TENET5), title length (<=70), meta description, og tags, canonical
4. CI integrity: orphans, broken links, low-density (<2 inbound)
5. Content: empty headings, duplicate IDs
6. Shell: shell.js loaded
"""
import os, re, glob
from collections import defaultdict

SKIP_PAGES = {'404.html', 'auth-callback.html', 'home.html', 'index.html',
              'sitemap.html', 'test-narration-validation.html'}

issues = defaultdict(list)
all_html = sorted(glob.glob('*.html'))
all_basenames = set(os.path.basename(f) for f in all_html)
ci_inbound = defaultdict(set)
ci_pages = set()

for f in all_html:
    name = os.path.basename(f)
    with open(f, 'r', encoding='utf-8') as fh:
        html = fh.read()

    head_end = html.find('</head>')
    head = html[:head_end] if head_end > 0 else ''

    # === STRUCTURE ===
    for tag in ['div', 'main', 'section']:
        opens = len(re.findall(rf'<{tag}[\s>]', html))
        closes = html.count(f'</{tag}>')
        if opens != closes:
            issues[name].append(f'{tag.upper()} MISMATCH: {opens}o/{closes}c (diff={opens-closes})')

    if name in SKIP_PAGES:
        continue

    # === ACCESSIBILITY ===
    if 'role="main"' not in html:
        issues[name].append('NO role="main"')
    if 'skip-link' not in html and '#main' not in html[:2000]:
        issues[name].append('NO SKIP-LINK')

    # === SEO ===
    title_m = re.search(r'<title[^>]*>(.*?)</title>', head, re.S)
    if title_m:
        t = title_m.group(1).strip()
        if 'TENET5' not in t and 'TENET' not in t:
            issues[name].append(f'TITLE NO BRAND: "{t[:60]}"')
        if len(t) > 70:
            issues[name].append(f'TITLE LONG ({len(t)}ch)')
    else:
        issues[name].append('NO TITLE')

    if 'meta name="description"' not in head and "meta name='description'" not in head:
        issues[name].append('NO META DESC')
    if 'og:title' not in head:
        issues[name].append('NO og:title')
    if 'og:description' not in head:
        issues[name].append('NO og:description')
    if 'og:site_name' not in head:
        issues[name].append('NO og:site_name')
    if 'canonical' not in head:
        issues[name].append('NO CANONICAL')

    # === SHELL ===
    if 'shell.js' not in html and 'nav.js' not in html:
        issues[name].append('NO SHELL/NAV')

    # === CONTENT ===
    empty_h = re.findall(r'<(h[1-6])[^>]*>\s*</(h[1-6])>', html)
    if empty_h:
        issues[name].append(f'EMPTY HEADINGS: {len(empty_h)}')

    ids = re.findall(r'\bid="([^"]+)"', html)
    dupes = set(i for i in ids if ids.count(i) > 1)
    if dupes:
        issues[name].append(f'DUPE IDS: {", ".join(sorted(dupes)[:5])}')

    # === CI ===
    ci_start = html.find('[CONNECTED INTELLIGENCE]')
    if ci_start == -1:
        issues[name].append('NO CI')
    else:
        ci_pages.add(name)
        ci_end = html.find('</div>\n</div>', ci_start)
        if ci_end == -1:
            ci_end = html.find('</div>\r\n</div>', ci_start)
        if ci_end == -1:
            ci_end = ci_start + 5000
        ci_section = html[ci_start:ci_end+20]
        hrefs = re.findall(r'href="([^"]+)"', ci_section)
        for h in hrefs:
            if not h.startswith(('http', '#', 'mailto:')):
                ci_inbound[h].add(name)
                if h not in all_basenames:
                    issues[name].append(f'CI BROKEN: {h}')

# CI orphan/density check
for p in sorted(ci_pages):
    n = len(ci_inbound.get(p, set()))
    if n == 0:
        issues[p].append('CI ORPHAN (0 inbound)')
    elif n == 1:
        issues[p].append(f'CI LOW (1 inbound: {list(ci_inbound[p])[0]})')

# === REPORT ===
total = sum(len(v) for v in issues.values())
print(f'=== ROUND 15 AUDIT ===')
print(f'HTML: {len(all_html)} | CI: {len(ci_pages)} | Issues: {total}')

CRITICAL = ('MISMATCH', 'CI BROKEN', 'CI ORPHAN', 'NO CI', 'NO TITLE')
HIGH = ('NO role=', 'NO META DESC', 'NO og:', 'NO CANONICAL', 'NO SHELL', 'NO SKIP', 'DUPE IDS')
MEDIUM = ('TITLE NO BRAND', 'TITLE LONG', 'CI LOW', 'EMPTY HEADINGS')

for sev, keys in [('CRITICAL', CRITICAL), ('HIGH', HIGH), ('MEDIUM', MEDIUM)]:
    items = [(p,i) for p,ii in sorted(issues.items()) for i in ii if any(k in i for k in keys)]
    if items:
        print(f'\n--- {sev} ({len(items)}) ---')
        for p,i in items:
            print(f'  {p}: {i}')

other = [(p,i) for p,ii in sorted(issues.items()) for i in ii if not any(k in i for k in CRITICAL+HIGH+MEDIUM)]
if other:
    print(f'\n--- OTHER ({len(other)}) ---')
    for p,i in other:
        print(f'  {p}: {i}')

if total == 0:
    print('\nCLEAN — zero issues found.')
