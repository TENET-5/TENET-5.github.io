"""Remove board.js from all pages except conspiracy-board.html where it belongs.
Also clean up STARK/SATOR/N-vs-NP references from public-facing text."""
import os, re

ROOT = r"E:\TENET-5.github.io"

# Pages where board.js is intentionally used
KEEP_BOARD = {'conspiracy-board.html', 'network-analysis.html'}

board_removed = 0
nvsmp_cleaned = 0
stark_cleaned = 0

for fname in sorted(os.listdir(ROOT)):
    if not fname.endswith('.html'):
        continue
    if fname in KEEP_BOARD:
        continue
    
    fpath = os.path.join(ROOT, fname)
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original = content
    
    # Remove board.js script tags
    content = re.sub(r'\s*<script src="board\.js\?v=\d+"></script>\s*', '\n', content)
    
    # Clean STARK references in visible text (not code comments)
    # Replace "STARK LOCAL AI CONTINUOUS ANALYSIS OVERRIDE" banners
    content = re.sub(
        r'<span[^>]*>🤖</span>\s*STARK LOCAL AI CONTINUOUS ANALYSIS OVERRIDE',
        '<span style="font-size:1.1rem;">🤖</span> CONTINUOUS ANALYSIS OVERRIDE',
        content
    )
    
    # Replace "N-vs-NP Empirical Matrix" with cleaner label
    content = re.sub(
        r'N-vs-NP Empirical Matrix:?\s*',
        'Policy Impact Matrix: ',
        content
    )
    content = re.sub(
        r'N-vs-NP Matrices',
        'Policy Matrices',
        content
    )
    
    # Clean SATOR references in visible text (not in comments/hidden sections)
    # Only clean visible text, not JS variable names
    content = re.sub(
        r'<h2>📡 ACTIVE TENET-5 / SATOR TELEMETRY</h2>',
        '<h2>📡 ACTIVE TENET-5 TELEMETRY</h2>',
        content
    )
    content = re.sub(
        r'Live 118\.4 Hz Telemetry Link \(SATOR\)',
        'Live Telemetry Link',
        content
    )
    
    # Clean "STARK Telemetry Logs, Phase 39 Gen-AI Output" 
    content = re.sub(
        r'Source: STARK Telemetry Logs,?\s*Phase \d+ Gen-AI Output',
        'Source: TENET5 Analysis Pipeline',
        content
    )
    
    # Clean "STARK Topography Links"
    content = re.sub(
        r'//\s*STARK Topography Links',
        '// Topography Links',
        content
    )
    
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        changes = []
        if 'board.js' in original and 'board.js' not in content:
            board_removed += 1
            changes.append('board.js removed')
        if 'N-vs-NP' in original and 'N-vs-NP' not in content:
            nvsmp_cleaned += 1
            changes.append('N-vs-NP cleaned')
        if 'STARK' in original and content.count('STARK') < original.count('STARK'):
            stark_cleaned += 1
            changes.append('STARK cleaned')
        
        print(f"  ✅ {fname}: {', '.join(changes)}")

print(f"\n{'='*50}")
print(f"board.js removed from {board_removed} files")
print(f"N-vs-NP cleaned from {nvsmp_cleaned} files")
print(f"STARK references cleaned from {stark_cleaned} files")
print(f"Done.")
