import re
import sys
from pathlib import Path

CSS_PATH = Path(r"E:\TENET-5.github.io\style.css")

MAPPING = {
    # Reds
    r"(?i)#c41e3a": "var(--accent)",
    r"(?i)#dc2626": "var(--color-critical)",
    r"(?i)#ef4444": "var(--color-critical)",
    r"(?i)#ff6b6b": "var(--accent-bright)",
    r"(?i)#ff8a8a": "var(--accent-bright)",
    r"(?i)#f87171": "var(--accent-bright)",
    
    # Oranges / Yellows
    r"(?i)#d97706": "var(--color-warning)",
    r"(?i)#fbbf24": "var(--color-warning)",
    r"(?i)#fcd34d": "var(--color-warning)",

    # Greens
    r"(?i)#059669": "var(--color-green)",
    r"(?i)#22c55e": "var(--color-green)",
    r"(?i)#4ade80": "var(--color-green)",
    r"(?i)#06d6a0": "var(--color-green)",

    # Blues
    r"(?i)#2563eb": "var(--color-info)",
    r"(?i)#3b82f6": "var(--color-info)",
    r"(?i)#60a5fa": "var(--color-info)",

    # Purples
    r"(?i)#a855f7": "var(--color-purple)",
    r"(?i)#c084fc": "var(--color-purple)",

    # Lights (Whites/Grays)
    r"(?i)#fff([;}])": r"var(--text-light)\1",
    r"(?i)#ffffff([;}])": r"var(--text-light)\1",
    r"(?i)#f3f4f6": "var(--text-light)",
    r"(?i)#ededed": "var(--text-light)",
    r"(?i)#d1d5db": "var(--text-light-muted)",
    r"(?i)#e5e7eb": "var(--text-light-muted)",
    r"(?i)#c0bfbb": "var(--text-light-muted)",
    r"(?i)#a0a0a6": "var(--text-light-muted)",

    # Darks
    r"(?i)#0a0a0e": "var(--bg-dark)",
    r"(?i)#0a0c10": "var(--bg-dark)",
}

def clean_css():
    with open(CSS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split to avoid replacing values inside :root
    root_split = content.find("/* ═══ RESET ═══════════════════════════════════ */")
    if root_split == -1:
        print("Could not find reset block.")
        return

    root_section = content[:root_split]
    body_section = content[root_split:]
    
    # Check if we need to add color-purple to root
    if "--color-purple" not in root_section:
        root_section = root_section.replace("--color-info:    #2563eb;", "--color-info:    #2563eb;\n  --color-purple:  #a855f7;")

    # Apply mapping only to body section
    for hex_patt, var_repl in MAPPING.items():
        body_section = re.sub(hex_patt, var_repl, body_section)

    with open(CSS_PATH, 'w', encoding='utf-8') as f:
        f.write(root_section + body_section)
    print("CSS Refactored successfully.")

if __name__ == '__main__':
    clean_css()
