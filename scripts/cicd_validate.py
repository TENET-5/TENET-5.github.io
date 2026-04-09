import os
import sys
from html.parser import HTMLParser
import re

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.scripts = []
        self.styles = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag == "a" and "href" in attr_dict:
            self.links.append(attr_dict["href"])
        elif tag == "script" and "src" in attr_dict:
            self.scripts.append(attr_dict["src"])
        elif tag == "link" and attr_dict.get("rel") == "stylesheet" and "href" in attr_dict:
            self.styles.append(attr_dict["href"])
        elif tag == "img" and "src" in attr_dict:
            self.images.append(attr_dict["src"])

def check_file_exists(base_dir, current_file, target):
    if target.startswith("http://") or target.startswith("https://") or target.startswith("mailto:") or target.startswith("data:"):
        return True
    
    # Strip URL fragments and query params
    target = target.split('#')[0].split('?')[0]
    
    if not target:
        return True # Link was just a fragment (e.g. href="#")
    
    target_path = os.path.normpath(os.path.join(os.path.dirname(os.path.join(base_dir, current_file)), target))
    return os.path.exists(target_path)

def analyze_directory(base_dir):
    errors = []
    html_files = []
    
    for root, dirs, files in os.walk(base_dir):
        if ".git" in root or "node_modules" in root or "venv" in root:
            continue
        for file in files:
            if file.endswith(".html"):
                html_files.append(os.path.relpath(os.path.join(root, file), base_dir))

    for html_file in html_files:
        filepath = os.path.join(base_dir, html_file)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        parser = LinkParser()
        parser.feed(content)
        
        # Check href links
        for link in parser.links:
            if not check_file_exists(base_dir, html_file, link):
                errors.append(f"[{html_file}] BROKEN LINK: {link}")
                
        # Check script srcs
        for script in parser.scripts:
            if not check_file_exists(base_dir, html_file, script):
                errors.append(f"[{html_file}] BROKEN SCRIPT: {script}")
                
        # Check styles
        for style in parser.styles:
            if not check_file_exists(base_dir, html_file, style):
                errors.append(f"[{html_file}] BROKEN STYLE: {style}")
                
        # Check images
        for img in parser.images:
            if not check_file_exists(base_dir, html_file, img):
                errors.append(f"[{html_file}] BROKEN IMAGE: {img}")
                
        # Find raw fetch() commands
        fetches = re.findall(r"fetch\(['\"]([^'\"]+)['\"]\)", content)
        for fetch_url in fetches:
            if fetch_url.startswith("http"): continue
            if not check_file_exists(base_dir, html_file, fetch_url):
                 errors.append(f"[{html_file}] BROKEN FETCH: {fetch_url}")

    return errors

if __name__ == "__main__":
    pwd = os.getcwd()
    print(f"Executing LIRIL CI/CD Validation Pipeline over {pwd}...")
    
    errors = analyze_directory(pwd)
    
    if errors:
        print(f"\\nCRITICAL VALIDATION FAILURE. {len(errors)} broken path(s) detected:\\n")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\\nSUCCESS: 0 broken pages or missing assets found. Ecosystem is fully aligned.")
        sys.exit(0)
