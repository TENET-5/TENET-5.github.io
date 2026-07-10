import os
import glob
from bs4 import BeautifulSoup

layout = open('layout.html', 'r', encoding='utf-8').read()

files = glob.glob('*.html')
ignore = ['index.html', 'layout.html', 'index_legacy.html', 'index_backup.html', 'index-legacy-cap222-shell.html']

for f in files:
    if f in ignore:
        continue
    try:
        content = open(f, 'r', encoding='utf-8').read()
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract title
        title_tag = soup.find('title')
        title_text = title_tag.text if title_tag else "TENET5 File"
        title_text = title_text.replace(" | TENET5", "").strip()

        # Extract main content
        main_tag = soup.find('main')
        if main_tag:
            main_html = "".join([str(c) for c in main_tag.contents])
        else:
            # Fallback to body minus header/footer
            body_tag = soup.find('body')
            if body_tag:
                # Remove headers and footers
                for h in body_tag.find_all('header'): h.decompose()
                for h in body_tag.find_all('footer'): h.decompose()
                # Remove ambient-glow
                for h in body_tag.find_all('div', class_='ambient-glow'): h.decompose()
                # Remove old anime scripts
                for s in body_tag.find_all('script'): s.decompose()
                main_html = "".join([str(c) for c in body_tag.contents])
            else:
                main_html = content

        # Reconstruct file
        new_file = layout.replace('{{TITLE}}', title_text)
        new_file = new_file.replace('{{CONTENT}}', main_html)
        
        open(f, 'w', encoding='utf-8').write(new_file)
        print(f"Processed: {f}")
    except Exception as e:
        print(f"Failed {f}: {e}")
