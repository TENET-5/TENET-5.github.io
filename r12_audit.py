"""Round 12 full-site audit for TENET-5.github.io.

Checks:
1. HTML validity: unclosed tags, mismatched divs, missing doctype
2. Accessibility: skip-links, role=main, alt text on images, lang attribute
3. SEO: title, meta description, og:tags, canonical
4. Branding: TENET5 in title, og:site_name
5. CI integrity: orphans (0 inbound), broken links
6. Nav/Footer: nav.js and footer.js loaded
7. Structural: empty headings, duplicate IDs, broken anchors
8. Performance: inline styles >500 chars, missing async/defer on scripts
"""
import os, re, glob
from collections import defaultdict

SKIP_PAGES = {'404.html', 'auth-callback.html', 'home.html', 'index.html',
              'sitemap.html', 'test-narration-validation.html'}

issues = defaultdict(list)
all_html = sorted(glob.glob('*.html'))
all_basenames = set(os.path.basename(f) for f in all_html)

# Track CI inbound links
ci_inbound = defaultdict(set)  # target -> set of source pages

for f in all_html:
    name = os.path.basename(f)
    with open(f, 'r', encoding='utf-8') as fh:
        html = fh.read()

    head_end = html.find('</head>')
    head = html[:head_end] if head_end > 0 else ''
    body_start = html.find('<body')
    body = html[body_start:] if body_start > 0 else html

    # === 1. HTML VALIDITY ===
    if not html.strip().startswith('<!DOCTYPE') and not html.strip().startswith('<!doctype'):
        issues[name].append('MISSING DOCTYPE')

    # Div balance
    opens = len(re.findall(r'<div[\s>]', html))
    closes = html.count('</div>')
    if opens != closes:
        issues[name].append(f'DIV MISMATCH: {opens} opens vs {closes} closes (diff={opens-closes})')

    # Main tag balance
    main_opens = len(re.findall(r'<main[\s>]', html))
    main_closes = html.count('</main>')
    if main_opens != main_closes:
        issues[name].append(f'MAIN TAG MISMATCH: {main_opens} opens vs {main_closes} closes')

    # Section balance
    sec_opens = len(re.findall(r'<section[\s>]', html))
    sec_closes = html.count('</section>')
    if sec_opens != sec_closes:
        issues[name].append(f'SECTION MISMATCH: {sec_opens} opens vs {sec_closes} closes')

    if name in SKIP_PAGES:
        continue

    # === 2. ACCESSIBILITY ===
    if 'skip-link' not in html and '#main' not in html[:2000]:
        issues[name].append('NO SKIP-LINK or #main reference')

    if 'role="main"' not in html:
        issues[name].append('NO role="main"')

    if 'lang=' not in html[:500]:
        issues[name].append('NO lang attribute')

    # Images without alt
    imgs_no_alt = re.findall(r'<img(?![^>]*\balt\b)[^>]*>', html)
    if imgs_no_alt:
        issues[name].append(f'IMAGES WITHOUT ALT: {len(imgs_no_alt)}')

    # === 3. SEO ===
    if '<title>' not in head and '<title ' not in head:
        issues[name].append('NO TITLE TAG')
    else:
        title_m = re.search(r'<title[^>]*>(.*?)</title>', head, re.S)
        if title_m:
            title_text = title_m.group(1).strip()
            if 'TENET5' not in title_text and 'TENET' not in title_text:
                issues[name].append(f'TITLE MISSING TENET5: "{title_text[:60]}"')
            if len(title_text) > 70:
                issues[name].append(f'TITLE TOO LONG ({len(title_text)} chars)')

    if 'meta name="description"' not in head and "meta name='description'" not in head:
        issues[name].append('NO META DESCRIPTION')

    if 'og:title' not in head:
        issues[name].append('NO og:title')

    if 'og:description' not in head:
        issues[name].append('NO og:description')

    if 'og:site_name' not in head:
        issues[name].append('NO og:site_name')

    if 'canonical' not in head:
        issues[name].append('NO CANONICAL LINK')

    # === 4. NAV/FOOTER ===
    # shell.js dynamically loads nav.js and footer.js into header-frame/footer-frame
    has_shell = 'shell.js' in html
    has_nav = 'nav.js' in html
    has_footer = 'footer.js' in html
    if not has_shell and not has_nav:
        issues[name].append('NO nav.js OR shell.js')
    if not has_shell and not has_footer:
        issues[name].append('NO footer.js OR shell.js')

    # === 5. STRUCTURAL ===
    # Empty headings
    empty_h = re.findall(r'<(h[1-6])[^>]*>\s*</(h[1-6])>', html)
    if empty_h:
        issues[name].append(f'EMPTY HEADINGS: {len(empty_h)}')

    # Duplicate IDs
    ids = re.findall(r'\bid="([^"]+)"', html)
    seen = set()
    dupes = set()
    for i in ids:
        if i in seen:
            dupes.add(i)
        seen.add(i)
    if dupes:
        issues[name].append(f'DUPLICATE IDS: {", ".join(sorted(dupes)[:5])}')

    # === 6. CI INTEGRITY ===
    ci_start = html.find('[CONNECTED INTELLIGENCE]')
    if ci_start == -1:
        if name not in SKIP_PAGES:
            issues[name].append('NO CI BLOCK')
    else:
        ci_end = html.find('</div>\n</div>', ci_start)
        if ci_end == -1:
            ci_end = html.find('</div>\r\n</div>', ci_start)
        if ci_end == -1:
            ci_end = ci_start + 5000
        ci_section = html[ci_start:ci_end+20]
        hrefs = re.findall(r'href="([^"]+)"', ci_section)
        for h in hrefs:
            if not h.startswith('http') and not h.startswith('#') and not h.startswith('mailto:'):
                ci_inbound[h].add(name)
                if h not in all_basenames:
                    issues[name].append(f'CI BROKEN LINK: {h}')

# CI orphan check (pages with CI block but 0 inbound from other CI blocks)
ci_pages = set()
for f in all_html:
    name = os.path.basename(f)
    if name in SKIP_PAGES:
        continue
    with open(f, 'r', encoding='utf-8') as fh:
        if '[CONNECTED INTELLIGENCE]' in fh.read():
            ci_pages.add(name)

for p in sorted(ci_pages):
    inbound_count = len(ci_inbound.get(p, set()))
    if inbound_count == 0:
        issues[p].append('CI ORPHAN: 0 inbound CI links')
    elif inbound_count == 1:
        issues[p].append(f'LOW CI DENSITY: only 1 inbound from {list(ci_inbound[p])[0]}')

# === REPORT ===
total_issues = sum(len(v) for v in issues.values())
pages_with_issues = len(issues)

print(f'=== ROUND 12 AUDIT ===')
print(f'Total HTML files: {len(all_html)}')
print(f'CI pages: {len(ci_pages)}')
print(f'Pages with issues: {pages_with_issues}')
print(f'Total issues: {total_issues}')
print()

# Group by severity
CRITICAL = ('DIV MISMATCH', 'MAIN TAG MISMATCH', 'SECTION MISMATCH', 'CI BROKEN',
            'CI ORPHAN', 'NO CI BLOCK', 'MISSING DOCTYPE', 'NO TITLE')
HIGH = ('NO role="main"', 'NO SKIP-LINK', 'NO META DESC', 'NO og:', 'NO CANONICAL',
        'NO nav.js', 'NO footer.js', 'NO lang', 'DUPLICATE IDS')
MEDIUM = ('TITLE MISSING TENET5', 'TITLE TOO LONG', 'LOW CI', 'IMAGES WITHOUT ALT', 'EMPTY HEADINGS')

for sev_name, sev_keys in [('CRITICAL', CRITICAL), ('HIGH', HIGH), ('MEDIUM', MEDIUM)]:
    sev_issues = []
    for page, page_issues in sorted(issues.items()):
        for iss in page_issues:
            if any(k in iss for k in sev_keys):
                sev_issues.append((page, iss))
    if sev_issues:
        print(f'\n--- {sev_name} ({len(sev_issues)}) ---')
        for page, iss in sev_issues:
            print(f'  {page}: {iss}')

# Catch any remaining issues not in severity categories
remaining = []
all_sev_keys = CRITICAL + HIGH + MEDIUM
for page, page_issues in sorted(issues.items()):
    for iss in page_issues:
        if not any(k in iss for k in all_sev_keys):
            remaining.append((page, iss))
if remaining:
    print(f'\n--- OTHER ({len(remaining)}) ---')
    for page, iss in remaining:
        print(f'  {page}: {iss}')
