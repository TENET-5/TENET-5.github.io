import glob
import re

navs = set()
for f in glob.glob('*.html'):
    try:
        content = open(f, 'r', encoding='utf-8').read()
        match = re.search(r'<nav aria-label="Primary">(.*?)</nav>', content, re.DOTALL)
        if match:
            navs.add(match.group(1).strip())
    except:
        pass

for i, nav in enumerate(navs):
    print(f"--- Nav Version {i+1} ---")
    print(nav)
    print()
