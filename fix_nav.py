import os
import re

TARGET_DIR = r"E:\TENET-5.github.io"

# The standard nav block for inner pages
STANDARD_NAV = """    <nav aria-label="Primary">
      <a href="index.html">Home</a>
      <a href="news.html">News</a>
      <a href="daily-briefing.html">Briefing</a>
      <a href="investigations.html">Investigations</a>
      <a href="argument.html">The Case</a>
      <a href="evidence-index.html">Evidence</a>
      <a href="information-architecture.html">Map</a>
    </nav>"""

nav_regex = re.compile(r'^[ \t]*<nav[^>]*aria-label="Primary"[^>]*>.*?</nav>', re.DOTALL | re.MULTILINE)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'aria-label="Primary"' in content:
        # Don't touch index.html cover-nav as it has class="cover-nav"
        if "index.html" in os.path.basename(filepath):
            return
            
        new_content, count = nav_regex.subn(STANDARD_NAV, content)
        if count > 0 and new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

for root, _, files in os.walk(TARGET_DIR):
    # skip node_modules
    if "node_modules" in root:
        continue
    for file in files:
        if file.endswith('.html'):
            process_file(os.path.join(root, file))
