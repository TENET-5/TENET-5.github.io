import os, re

# 1. Rename lawsuit-ppcli.html to ppcli-lawsuit.html
if os.path.exists('lawsuit-ppcli.html'):
    os.rename('lawsuit-ppcli.html', 'ppcli-lawsuit.html')
    print('Renamed lawsuit-ppcli.html to ppcli-lawsuit.html')

# 2. Replace references globally
updated_files = []
for file in os.listdir('.'):
    if file.endswith(('.html', '.js', '.py')) or file == 'sitemap.xml':
        with open(file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        new_content = content.replace('lawsuit-ppcli', 'ppcli-lawsuit')

        if file == 'index.html':
            new_content = new_content.replace('href="/sitemap.xml"', 'href="sitemap.xml"')
        elif file == 'red-duster-game.html':
            new_content = new_content.replace('/reduster/assets/', 'assets/')

        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated_files.append(file)

print('Updated files with ppcli-lawsuit, sitemap link, and reduster paths:', updated_files)

# Update subdirectories like 'data/' and 'js/'
for subdir in ['data', 'js']:
    for file in os.listdir(subdir):
        if file.endswith(('.html', '.js', '.json')):
            filepath = os.path.join(subdir, file)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            new_content = content.replace('lawsuit-ppcli', 'ppcli-lawsuit')
            
            if file == 'investigation_board.js':
                # Update s504 link
                new_content = new_content.replace('"link": "cfnis.html"', '"link": "s504-covey-bae.html"')
                # Update MAID nodes (bill_c14, bill_c7) from dossier-viewer to maid-policy-evolution
                new_content = new_content.replace('"link": "dossier-viewer.html?file=evidence/profiles/rcmp_maid_accountability.md"', '"link": "maid-policy-evolution.html"')
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {filepath}')

# 3. Add maid-policy-evolution.html to sitemap.xml if missing
with open('sitemap.xml', 'r', encoding='utf-8') as f:
    sitemap_content = f.read()

if 'maid-policy-evolution.html' not in sitemap_content:
    injection = '''  <url>\n    <loc>https://tenet5.github.io/maid-policy-evolution.html</loc>\n    <priority>0.9</priority>\n    <changefreq>weekly</changefreq>\n  </url>'''
    sitemap_content = sitemap_content.replace('</urlset>', injection + '\n</urlset>')
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    print('Added maid-policy-evolution.html to sitemap.xml')
else:
    print('maid-policy-evolution.html is already in sitemap.xml')
