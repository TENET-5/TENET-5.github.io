import os, re

pages_missing = ['cfnis-proxy.html','cija-lobbying.html','foreign-influence-alpha.html','kids-guide.html','legislation.html','petitions.html','phac-mandates-s6.html','prosecution.html','red-duster-game.html','rogue-state.html']

all_pages = sorted([f for f in os.listdir('.') if f.endswith('.html')])
for p in all_pages:
    if p in ['index.html','home.html','404.html']: continue
    c = open(p, 'r', encoding='utf-8', errors='replace').read()
    has_shell = bool(re.search(r'<script[^>]*src=.shell\.js', c))
    has_nav = bool(re.search(r'<script[^>]*src=.nav\.js', c))
    if not has_shell and not has_nav:
        if p not in pages_missing:
            print('ALSO MISSING:', p)

for p in pages_missing + ['test-narration-validation.html', 'evidence-ns-oic.html']:
    c = open(p, 'r', encoding='utf-8', errors='replace').read()
    scripts = re.findall(r'src="([^"]+)"', c)
    key = [s for s in scripts if any(k in s for k in ['shell','nav.js','walkthrough','presentation','liril-voice'])]
    print(f'{p}: {key if key else "NO KEY SCRIPTS"}')
