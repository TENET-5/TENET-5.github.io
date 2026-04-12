import os
import glob
import re
import shutil

# 1. Rename telemetry pages to prevent public access
try:
    if os.path.exists(r"e:\TENET-5.github.io\liril-analysis.html"):
        os.rename(r"e:\TENET-5.github.io\liril-analysis.html", r"e:\TENET-5.github.io\liril-analysis.html.offline")
    if os.path.exists(r"e:\TENET-5.github.io\cicd-status.html"):
        os.rename(r"e:\TENET-5.github.io\cicd-status.html", r"e:\TENET-5.github.io\cicd-status.html.offline")
except Exception as e:
    print(f"Rename error: {e}")

# Wait, now let's scrub .json files and any remaining .html files
all_files = glob.glob(r"e:\TENET-5.github.io\**\*.json", recursive=True) + glob.glob(r"e:\TENET-5.github.io\**\*.html", recursive=True)

changes_made = 0

for file_path in all_files:
    # skip the offline files just in case
    if "offline" in file_path:
        continue
        
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
        
        new_content = content
        
        # Aggressive substitutions for TENET5 and LIRIL metadata
        new_content = re.sub(r'\"system_seed\": 118400,?', '', new_content)
        new_content = re.sub(r'\"seed\": 118400,?', '', new_content)
        new_content = re.sub(r'SEED:118400', '', new_content)
        new_content = re.sub(r'LIRIL NPU', '', new_content)
        new_content = re.sub(r'LIRIL', '', new_content)
        new_content = re.sub(r'NPU device', '', new_content)
        new_content = re.sub(r'SATOR·OPERA.*?cloud', '', new_content)
        new_content = re.sub(r'tick:118\.4Hz', '', new_content)

        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(new_content)
            changes_made += 1

    except Exception as e:
        pass

print(f"Aggressive telemetry purge complete on {changes_made} files.")
