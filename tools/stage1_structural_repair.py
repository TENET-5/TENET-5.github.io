import os
import re

html_files = [f for f in os.listdir() if f.endswith('.html')]

import json

for f in html_files:
    # Skip RED DUSTER entirely as it's suspended
    if f == 'red-duster-game.html':
        continue
        
    try:
        with open(f, encoding='utf-8') as file:
            content = file.read()
    except:
        continue
        
    original = content
    
    # Needs navigation?
    if 'id="navigation-container"' not in content:
        nav_inject = '<div id="navigation-container"></div>\n    <script src="nav.js"></script>'
        if '<body' in content:
            content = re.sub(r'(<body[^>]*>)', r'\1\n    ' + nav_inject, content, count=1)
            
    # Needs SEO?
    if 'name="description"' not in content:
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
        title_txt = title_match.group(1) if title_match else f"TENET-5 OSINT - {f.replace('.html','')}"
        meta = f'\n    <meta name="description" content="{title_txt} - Canadian Accountability Project investigation portal.">\n    <!-- TENET5 SEO INJECT -->'
        if '<head' in content:
            content = re.sub(r'(<head[^>]*>)', r'\1' + meta, content, count=1)
            
    # Needs H1?
    if '<h1' not in content.lower():
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
        title_txt = title_match.group(1) if title_match else "Dashboard"
        # Try to inject right after navigation container
        h1_str = f'\n    <h1 class="text-4xl text-white font-bold my-8 mx-12 border-b border-red-500 pb-2">{title_txt}</h1>'
        if '<div id="navigation-container"' in content:
            content = re.sub(r'(<script src="nav.js"></script>)', r'\1' + h1_str, content, count=1)
        elif '<body' in content:
            content = re.sub(r'(<body[^>]*>)', r'\1' + h1_str, content, count=1)

    if content != original:
        with open(f, "w", encoding='utf-8') as file:
            file.write(content)
        print(f"Patched: {f}")

print("Phase 1 complete.")
