import os, re
base = r'e:\TENET-5.github.io'
os.chdir(base)
b = []
for r, _, fs in os.walk('.'):
    for f in fs:
        if f.endswith('.html'):
            p = os.path.join(r, f)
            text = open(p, 'r', encoding='utf-8', errors='ignore').read()
            for m in re.finditer(r'(?:href|src)=[\"\'](.*?)[\"\']', text):
                link = m.group(1).split('?')[0].split('#')[0]
                if link and not link.startswith(('http', 'mailto:', 'tel:', 'data:', 'javascript:')):
                    cl = link[1:] if link.startswith('/') else link
                    tgt = os.path.normpath(os.path.join(base, cl))
                    if not os.path.exists(tgt): b.append((p, link))
b = list(set(b))
print(f'Broken Links: {len(b)}')
for p, l in b[:30]: print(f'[404] {os.path.relpath(p, base)} -> {l}')
