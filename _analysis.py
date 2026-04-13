#!/usr/bin/env python3
"""Site analysis for TENET-5.github.io"""
import os, re, sys
from collections import defaultdict

os.chdir(os.path.dirname(os.path.abspath(__file__)))

pages = sorted([f for f in os.listdir('.') if f.endswith('.html')])
print(f'Total HTML pages: {len(pages)}')

issues = []

for p in pages:
    try:
        content = open(p, 'r', encoding='utf-8', errors='replace').read()
    except:
        issues.append((p, 'CANNOT READ'))
        continue

    has_shell = bool(re.search(r'<script[^>]*src=["\']shell\.js', content))
    has_nav_direct = bool(re.search(r'<script[^>]*src=["\']nav\.js', content))

    if not has_shell and not has_nav_direct and p not in ['index.html', 'home.html', '404.html']:
        issues.append((p, 'NO_SHELL_OR_NAV'))

    if has_nav_direct and p != 'index.html':
        issues.append((p, 'DIRECT_NAV_JS'))

    if not content.strip().lower().startswith('<!doctype'):
        issues.append((p, 'MISSING_DOCTYPE'))

    if not re.search(r'<html[^>]*lang=', content):
        issues.append((p, 'MISSING_LANG'))

    if 'viewport' not in content:
        issues.append((p, 'MISSING_VIEWPORT'))

    if 'og:title' not in content:
        issues.append((p, 'MISSING_OG_TITLE'))

    if 'og:image' not in content:
        issues.append((p, 'MISSING_OG_IMAGE'))

    if 'twitter:card' not in content:
        issues.append((p, 'MISSING_TWITTER_CARD'))

    ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    seen = {}
    for i in ids:
        seen[i] = seen.get(i, 0) + 1
    for i, count in seen.items():
        if count > 1:
            issues.append((p, f'DUP_ID:{i}({count}x)'))

    if 'charset' not in content.lower():
        issues.append((p, 'MISSING_CHARSET'))

    title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
    if not title_match or not title_match.group(1).strip():
        issues.append((p, 'EMPTY_TITLE'))

    # Check for broken internal links
    hrefs = re.findall(r'href=["\']([^"\'#]+\.html)', content)
    for href in hrefs:
        clean = href.split('?')[0].split('#')[0].lstrip('/')
        if not clean.startswith('http') and not os.path.exists(clean):
            issues.append((p, f'BROKEN_LINK:{clean}'))

    # Check for JSON-LD
    if '"@context"' not in content and '"application/ld+json"' not in content:
        issues.append((p, 'MISSING_JSONLD'))

    # Check canonical
    if 'rel="canonical"' not in content and "rel='canonical'" not in content:
        issues.append((p, 'MISSING_CANONICAL'))

    # Check for unclosed tags
    open_divs = len(re.findall(r'<div[\s>]', content))
    close_divs = len(re.findall(r'</div>', content))
    if abs(open_divs - close_divs) > 2:
        issues.append((p, f'DIV_MISMATCH:open={open_divs},close={close_divs}'))

by_type = defaultdict(list)
for page, issue in issues:
    by_type[issue].append(page)

for issue_type in sorted(by_type.keys()):
    count = len(by_type[issue_type])
    print(f'\n=== {issue_type} ({count}) ===')
    for p in by_type[issue_type][:10]:
        print(f'  {p}')
    if count > 10:
        print(f'  ... +{count - 10} more')

print(f'\n\nTOTAL ISSUES: {len(issues)}')
print(f'ISSUE TYPES: {len(by_type)}')
