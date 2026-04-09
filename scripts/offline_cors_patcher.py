import os
import re
import json

base_dir = r"E:\TENET-5.github.io"
data_dir = os.path.join(base_dir, "data")
js_dir = os.path.join(base_dir, "js")
if not os.path.exists(js_dir):
    os.makedirs(js_dir)

db_path = os.path.join(js_dir, "offline_db.js")
polyfill_path = os.path.join(js_dir, "offline_fetch.js")

# 1. Bundle all JSON in data/ and MD in evidence/ into offline_db.js
db_content = "window.TENET_OFFLINE_DB = {};\n"

def process_dir(directory):
    global db_content
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".json"):
                filepath = os.path.join(root, filename)
                rel_path = os.path.relpath(filepath, base_dir).replace("\\", "/")
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    db_content += f"window.TENET_OFFLINE_DB['{rel_path}'] = {json.dumps(data)};\n"
                except Exception as e:
                    print(f"Failed to read {rel_path}: {e}")
            elif filename.endswith(".md"):
                filepath = os.path.join(root, filename)
                rel_path = os.path.relpath(filepath, base_dir).replace("\\", "/")
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = f.read()
                    db_content += f"window.TENET_OFFLINE_DB['{rel_path}'] = {json.dumps(data)};\n"
                except Exception as e:
                    print(f"Failed to read {rel_path}: {e}")

process_dir(data_dir)
process_dir(os.path.join(base_dir, "evidence"))


with open(db_path, "w", encoding="utf-8") as f:
    f.write(db_content)
print(f"Created {db_path} containing offline JSON data.")

# 2. Create the fetch polyfill
polyfill_code = """// TEMPORAL NODE: Offline CORS Fetch Bypass
(function() {
    if (window._fetchPolyfilled) return;
    window._fetchPolyfilled = true;
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            let relativeUrl = url.replace(/^\\/?/, '');
            // Some scripts might fetch './data/...'
            relativeUrl = relativeUrl.replace(/^\\.\\//, '');
            if (window.TENET_OFFLINE_DB && window.TENET_OFFLINE_DB[relativeUrl]) {
                console.log("[TEMPORAL] Intercepted CORS-safe fetch:", relativeUrl);
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(window.TENET_OFFLINE_DB[relativeUrl]),
                    text: () => Promise.resolve(typeof window.TENET_OFFLINE_DB[relativeUrl] === 'string' ? window.TENET_OFFLINE_DB[relativeUrl] : JSON.stringify(window.TENET_OFFLINE_DB[relativeUrl]))
                });
            }
        }
        return originalFetch.apply(this, arguments);
    };
})();
"""
with open(polyfill_path, "w", encoding="utf-8") as f:
    f.write(polyfill_code)
print(f"Created {polyfill_path}")

# 3. Auto-discover and inject scripts into ALL HTML files that use fetch()
target_files = []
for f in os.listdir(base_dir):
    if f.endswith(".html"):
        fpath = os.path.join(base_dir, f)
        with open(fpath, "r", encoding="utf-8") as fh:
            if "fetch(" in fh.read():
                target_files.append(f)
print(f"Auto-discovered {len(target_files)} HTML files with fetch() calls.")

injection = '<script src="js/offline_db.js"></script>\\n<script src="js/offline_fetch.js"></script>\\n'

for html_file in target_files:
    
    filepath = os.path.join(base_dir, html_file)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Inject right before head closes or script starts
    if "<script src=\"js/offline_db.js\">" not in content:
        if "</head>" in content:
            content = content.replace("</head>", f"{injection}</head>")
        else:
            # Drop it near the top
            content = injection + content
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Injected offline fetch into {html_file}")

print("TEMPORAL patcher execution complete.")
