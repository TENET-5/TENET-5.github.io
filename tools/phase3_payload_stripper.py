import os
import re

html_files = [f for f in os.listdir() if f.endswith('.html')]

restorer_script = """
    <!-- TENET5 SC_FRAME BUSTER -->
    <script>
      if (window === window.top && window.location.pathname.indexOf('index.html') === -1) {
          window.location.replace('index.html?load=' + window.location.pathname.split('/').pop());
      }
    </script>
"""

modified_count = 0

for f in html_files:
    if f == 'index.html' or f == 'red-duster-game.html':
        continue
        
    try:
        with open(f, encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        continue
        
    original = content

    # 1. Strip structural nav container and link
    content = content.replace('<div id="navigation-container"></div>', '')
    content = content.replace('<script src="nav.js"></script>', '')
    content = content.replace('<div id="navigation-container"></div>\n    <script src="nav.js"></script>', '')

    # 2. Inject frame restorer logic
    if 'SC_FRAME BUSTER' not in content:
        if '<head' in content:
            content = re.sub(r'(<head[^>]*>)', r'\1' + restorer_script, content, count=1)
            
    # Remove empty lines left over from nav deletion
    content = re.sub(r'\n\s*\n', '\n\n', content)

    if content != original:
        with open(f, "w", encoding='utf-8') as file:
            file.write(content)
        modified_count += 1

print(f"Phase 3 Payloads stripped and frame restorer injected securely across {modified_count} HTML content structures.")
