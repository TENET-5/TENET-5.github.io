import os
import re

def audit_links(repo_dir):
    html_files = [f for f in os.listdir(repo_dir) if f.endswith('.html')]
    valid_files = set(html_files)
    valid_files.add('')
    
    broken_links = []
    
    href_regex = re.compile(r'href=["\']([^"\']+)["\']')
    
    for filename in html_files:
        filepath = os.path.join(repo_dir, filename)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        for href in href_regex.findall(content):
            if href.startswith('http') or href.startswith('mailto:') or href.startswith('javascript:') or href.startswith('data:'):
                continue
                
            base_link = href.split('#')[0].split('?')[0]
            if base_link and base_link not in valid_files:
                asset_path = os.path.join(repo_dir, base_link.replace('/', os.sep))
                if not os.path.exists(asset_path):
                    broken_links.append(f"{filename}: broken link => {href}")
                    
    return broken_links

if __name__ == '__main__':
    broken = audit_links(r'E:\TENET-5.github.io')
    if broken:
        print(f"FAILED: Found {len(broken)} broken links.")
        for b in broken[:20]:
            print(b)
    else:
        print("SUCCESS: 0 broken internal links found.")
