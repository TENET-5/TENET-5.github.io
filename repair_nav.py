import os
import glob

directory = r"E:\TENET-5.github.io"
html_files = glob.glob(os.path.join(directory, "*.html"))

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace v=2 with v=3
    new_content = content.replace('nav.js?v=2', 'nav.js?v=3')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

print(f"Updated {len(html_files)} HTML files safely.")
