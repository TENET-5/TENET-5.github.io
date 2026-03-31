import os
import glob

d = 'e:/TENET-5.github.io'
files = []
for ext in ['html', 'md', 'txt', 'json', 'xml', 'js', 'css']:
    files.extend(glob.glob(f'{d}/**/*.{ext}', recursive=True))

for f in files:
    if 'node_modules' in f or '\\.git' in f or '/.git' in f or 'three.min.js' in f:
        continue
    try:
        with open(f, 'r', encoding='utf-8') as file:
            c = file.read()
        
        nc = c.replace('TENET-5', 'ABCXYZ').replace('TENET‑5', 'ABCXYZ').replace('TENET&#8209;5', 'ABCXYZ').replace('TENET&#x2011;5', 'ABCXYZ')
        nc = nc.replace('LirilClaw', 'AbcxyzFactory').replace('lirilclaw', 'abcxyz_factory').replace('LIRIL', 'ABCXYZ')
        nc = nc.replace('DeepMind', 'ABCXYZ').replace('tenet5', 'abcxyz').replace('TENET5', 'ABCXYZ')
        
        if c != nc:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(nc)
            print(f"Scrubbed {f}")
    except Exception as e:
        print(f"Error scrubbing {f}: {e}")
