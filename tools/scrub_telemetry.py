import os
import glob
import re

html_files = glob.glob(r"e:\TENET-5.github.io\*.html")

changes_made = 0

for file_path in html_files:
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
        
        new_content = content
        
        # Array of malicious regexes to scrub out strings related to hardware
        scrub_patterns = [
            # NPU Pill / SEED tags
            r"<span[^>]*>(🤖 )?LIRIL NPU local — SEED 118400 \| NPU device</span>",
            r"<span[^>]*>🤖 LIRIL: all content classified NPU-local, SEED:118400</span>",
            r"<span[^>]*>🧠 LIRIL NPU — SEED:118400</span>",
            r"<span[^>]*>🔒 No external APIs \| SEED:118400</span>",
            r"<span>SEED:118400(?: \| trained:[\d,]+ samples)?</span>",
            r"<div style=\"font-size:0\.7rem;color:rgba\(0,212,255,0\.65\);font-family:monospace;\">device=NPU \| seed=118400 \| tick=118\.4Hz \| SATOR·OPERA·row3 \| local inference only — no cloud</div>",
            r"<p class=\"text-sm\">Live classification results from LIRIL's NPU at SEED:118400\. Domain scoring, SATOR routing, NemoClaw GPU status — no cloud, no API, fully local\.</p>",
            r"<div class=\"stat-box\"><div class=\"stat-num\"[^>]*>118400</div><div class=\"stat-label\">LIRIL System Seed</div></div>",
            r"<div class=\"liril-title\">LIRIL NPU — Site Content Classification \(Baked at Build Time\)</div>",
            r"LIRIL NPU classify \(SEED:118400\)",
            
            # Nav JS cache bust
            r"src=\"nav\.js\"",
            r"src=\"nav\.js\?v=\d+\"",
            
            # Remove liril-analysis references in links
            r"<a href=\"/liril-analysis\.html\"[^>]*>LIRIL Analysis</a>",
        ]

        # Process exact replacements
        for pattern in scrub_patterns:
            if pattern == r"src=\"nav\.js\"" or pattern == r"src=\"nav\.js\?v=\d+\"":
                new_content = re.sub(pattern, 'src="nav.js?v=5"', new_content)
            else:
                new_content = re.sub(pattern, '', new_content)

        # Replace TENET5 specific SEO leakage
        new_content = re.sub(r'TENET5 Accountability', 'Canadian Accountability Project', new_content)
        new_content = re.sub(r'TENET5 Investigation', 'Canadian Accountability Project', new_content)
        new_content = re.sub(r'TENET5 — Canadian Government Accountability', 'Canadian Accountability Project', new_content)

        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(new_content)
            changes_made += 1

    except Exception as e:
        print(f"Error reading {file_path}: {e}")

print(f"Telemetry scrubbed and js cache-busted from {changes_made} HTML dossiers.")
