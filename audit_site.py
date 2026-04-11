import os
import re
import json

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
all_files = set(os.listdir('.'))

broken = []
hallucinations = []

for h in html_files:
    try:
        with open(h, 'r', encoding='utf-8') as f:
            content = f.read()
            links = re.findall(r'href=[\'\"]([^\'\">]+)[\'\"]', content)
            
            for l in links:
                if 'localhost' in l or 'file://' in l or '127.0.0.1' in l or 'internal_test/' in l:
                    hallucinations.append((h, l))
                    continue
                
                if l.startswith('http') or l.startswith('#') or l.startswith('mailto:') or l.startswith('tel:'):
                    continue
                    
                base = l.split('#')[0].split('?')[0]
                if base and base not in all_files:
                    if not any(base.startswith(d) for d in ['css/', 'js/', 'img/', 'assets/', 'reduster/', 'data/']):
                        broken.append((h, base))
    except Exception as e:
        print(f"Error parsing {h}: {e}")

print("--- HALLUCINATIONS ---")
for h, link in hallucinations:
    print(f"{h}: {link}")

print("\n--- BROKEN LINKS ---")
# Deduplicate
broken_map = {}
for h, link in broken:
    broken_map.setdefault(link, []).append(h)

for link, files in broken_map.items():
    print(f"Broken: {link} (found in {len(files)} files)")
    for file in files[:3]:
        print(f"   -> {file}")
