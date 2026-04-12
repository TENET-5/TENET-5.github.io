import os
import glob

root_dir = r"e:\TENET-5.github.io"
exclude_dirs = {".git", "node_modules", "scripts", "img", "css"}

processed = 0
for root, dirs, files in os.walk(root_dir):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            new_content = content
            # 1. Update theme colors
            new_content = new_content.replace('content="#050810"', 'content="#2E3440"')
            new_content = new_content.replace('content="#160408"', 'content="#2E3440"')

            # 2. Cache invalidation
            new_content = new_content.replace('style.css?v=16', 'style.css?v=17')
            new_content = new_content.replace('nav.js?v=8', 'nav.js?v=9')

            # 3. Scrub TENET5 branding on the frontend (User requested NO technical/backend names)
            new_content = new_content.replace('<title>TENET5', '<title>CAP')
            new_content = new_content.replace('| TENET5</title>', '| CAP</title>')
            new_content = new_content.replace('— TENET5</title>', '— CAP</title>')
            new_content = new_content.replace('TENET5 OSINT', 'Canadian Accountability Project')
            new_content = new_content.replace('TENET5 — OPEN SOURCE', 'CAP — OSINT')
            
            # Sator/Liril sweeps
            # Remove liril/NPU artifacts if any slipped through
            if "LIRIL NPU" in new_content:
                new_content = new_content.replace("LIRIL NPU local", "Offline OSINT")
                new_content = new_content.replace("LIRIL NPU", "Data Analysis Engine")
            if "SATOR" in new_content:
                new_content = new_content.replace("SATOR route:", "Data route:")

            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                processed += 1

print(f"Base44 Scrub completed. Modifed {processed} HTML files.")
