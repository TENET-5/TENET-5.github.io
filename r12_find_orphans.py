import re, glob
from collections import defaultdict

targets = ['data-sovereignty.html', 'food-supply-concentration.html']

for f in targets:
    with open(f, 'r', encoding='utf-8') as fh:
        html = fh.read()
    title = re.search(r'<title[^>]*>(.*?)</title>', html, re.S)
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S)
    print(f'--- {f} ---')
    print(f'Title: {title.group(1).strip() if title else "N/A"}')
    print(f'H1: {h1.group(1).strip()[:100] if h1 else "N/A"}')
    ci_start = html.find('[CONNECTED INTELLIGENCE]')
    if ci_start > -1:
        hrefs = re.findall(r'href="([^"]+\.html)"', html[ci_start:ci_start+5000])
        print(f'CI links OUT: {hrefs}')
    print()

# Now find best candidate pages to add inbound links FROM
# data-sovereignty: related to digital-identity, privacy-surveillance, bill-c22
# food-supply: related to telecom-oligopoly, housing-crisis, cost-of-failure
keywords = {
    'data-sovereignty.html': ['digital', 'privacy', 'surveillance', 'data', 'identity', 'sovereignty'],
    'food-supply-concentration.html': ['food', 'grocery', 'oligopoly', 'supply', 'concentration', 'telecom', 'cost']
}

for target in targets:
    print(f'\n=== CANDIDATES for inbound to {target} ===')
    scores = []
    for f in sorted(glob.glob('*.html')):
        name = f
        if name == target or name in ['404.html','auth-callback.html','home.html','index.html','sitemap.html','test-narration-validation.html']:
            continue
        with open(f, 'r', encoding='utf-8') as fh:
            html = fh.read().lower()
        ci_start = html.find('[connected intelligence]')
        if ci_start == -1:
            continue
        score = sum(html.count(kw) for kw in keywords[target])
        if score > 5:
            scores.append((score, name))
    scores.sort(reverse=True)
    for s, n in scores[:6]:
        print(f'  {n}: score={s}')
