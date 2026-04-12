import os
import glob
import json
import re
from html import unescape

def build_index():
    base_dir = r"e:\TENET-5.github.io"
    html_files = glob.glob(os.path.join(base_dir, "*.html"))
    index = []
    
    # Regex to find title
    title_regex = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
    # Regex to find data-narrate="<content>"
    narrate_regex = re.compile(r'data-narrate="([^"]+)"', re.IGNORECASE)

    for file_path in html_files:
        filename = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
            title_match = title_regex.search(content)
            if title_match:
                title = title_match.group(1).strip()
            else:
                title = filename
                
            # Clean up the "| TENET5" suffix commonly found in titles
            title = title.replace(" | TENET5", "").replace(" - TENET5", "").strip()

            narrations = narrate_regex.findall(content)
            
            for index_id, narr in enumerate(narrations):
                clean_narr = unescape(narr).strip()
                if len(clean_narr) > 10:
                    index.append({
                        "id": f"{filename}-{index_id}",
                        "page": filename,
                        "title": title,
                        "narration": clean_narr
                    })

    # Output path
    out_dir = os.path.join(base_dir, "data")
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    out_path = os.path.join(out_dir, "narration_index.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"narrations": index}, f, indent=2)
        
    print(f"✅ Generated narration index with {len(index)} records extracted from {len(html_files)} pages.")
    print(f"Output saved to {out_path}")

if __name__ == "__main__":
    build_index()
