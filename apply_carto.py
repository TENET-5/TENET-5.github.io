import re
import os

files_to_topo = [
    'index.html',
    'investigations.html',
    'information-architecture.html',
    'argument.html',
    'evidence-index.html',
    'news.html',
    'daily-briefing.html'
]

for filename in files_to_topo:
    if not os.path.exists(filename): continue
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add compass to investigations.html hero
    if filename == 'investigations.html' or filename == 'information-architecture.html':
        if '<div class="compass" aria-hidden="true"></div>' not in content:
            content = re.sub(r'(<header[^>]*class="[^"]*press-hero[^"]*"[^>]*>)', r'\1\n  <div class="compass" aria-hidden="true"></div>', content, count=1)

    # Convert glass to map-frame on metric cards
    content = re.sub(r'(<div[^>]*class="[^"]*nr-metric[^"]*)glass([^"]*">.*?)(</div>)', 
                     r'\1map-frame\2<div class="mf-tr" aria-hidden="true"></div><div class="mf-br" aria-hidden="true"></div>\3', 
                     content, flags=re.DOTALL)

    # Convert glass to map-frame on cat-item
    content = re.sub(r'(<a[^>]*class="[^"]*cat-item[^"]*)glass([^"]*">.*?)(</a>)', 
                     r'\1map-frame\2<div class="mf-tr" aria-hidden="true"></div><div class="mf-br" aria-hidden="true"></div>\3', 
                     content, flags=re.DOTALL)

    # evidence-index specific cards
    if filename == 'evidence-index.html':
        content = re.sub(r'(<a[^>]*class="[^"]*ev-card[^"]*)glass([^"]*">.*?)(</a>)', 
                         r'\1map-frame\2<div class="mf-tr" aria-hidden="true"></div><div class="mf-br" aria-hidden="true"></div>\3', 
                         content, flags=re.DOTALL)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("Applied Cartographer motifs to cards!")
