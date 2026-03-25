"""Inject canonical nav into all HTML pages and fix dark theme issues."""
import re
from pathlib import Path

SITE = Path("E:/TENET-5.github.io")

# Canonical nav — every page gets this exact nav
# The script sets class="active" on the current page's link
CANONICAL_NAV = """  <nav class="site-nav">
    <a href="index.html" class="brand">TENET-5</a>
    <a href="index.html">Data</a>
    <a href="my-story.html">My Story</a>
    <a href="evidence.html" style="color:#ff6b6b;font-weight:bold;">Evidence</a>
    <a href="5gw-subversion.html" style="color:#9333ea;font-weight:bold;">&#9876; The War On You</a>
    <a href="hansard-evidence.html" style="color:#e63950;font-weight:bold;">&#127963; Hansard</a>
    <a href="harm-index.html" style="color:#ff4444;font-weight:bold;">&#9760; Harm Index</a>
    <a href="corruption-map.html" style="color:#fbbf24;font-weight:bold;">&#128269; Corruption Map</a>
    <a href="infographics.html">Infographics</a>
    <a href="legal.html">Legal</a>
    <a href="history.html">History</a>
    <a href="veterans.html">Veterans</a>
    <a href="open-letter.html">Open Letter</a>
    <a href="faq.html">FAQ</a>
    <a href="resources.html">Resources</a>
    <a href="bloggins.html" style="color:#22c55e;font-weight:bold;">&#129409; Bloggins</a>
    <a href="lirilclaw.html" style="color:#e63950;font-weight:bold;">&#128295; LirilClaw</a>
    <a href="ai-tool.html" style="color:#1a73e8;font-weight:bold;">&#129504; AI Tool</a>
    <a href="mooserack.html" style="color:#4ade80;font-weight:bold;">&#128190; MooseRack</a>
  </nav>"""

# Pages to skip (not real content pages)
SKIP = {"fix_nav.py"}

def set_active(nav_html: str, filename: str) -> str:
    """Set class="active" on the link matching this page."""
    # Remove any existing active classes first
    nav = nav_html.replace(' class="active"', '')
    # Add active to matching href
    nav = nav.replace(f'href="{filename}"', f'href="{filename}" class="active"')
    return nav


def inject_nav(filepath: Path):
    """Replace the existing <nav>...</nav> block with canonical nav."""
    html = filepath.read_text(encoding="utf-8")
    filename = filepath.name

    # Build nav with active class for this page
    nav = set_active(CANONICAL_NAV, filename)

    # Replace existing nav block
    pattern = r'<nav\s+class="site-nav"[^>]*>.*?</nav>'
    if re.search(pattern, html, re.DOTALL):
        new_html = re.sub(pattern, nav.strip(), html, count=1, flags=re.DOTALL)
        if new_html != html:
            filepath.write_text(new_html, encoding="utf-8")
            return True
    return False


def fix_hansard_dark_theme(filepath: Path):
    """Fix hansard-evidence.html white background to match dark theme."""
    html = filepath.read_text(encoding="utf-8")

    # Replace white backgrounds with dark theme equivalents
    replacements = [
        ("background: #fff;", "background: var(--bg-card);"),
        ("background:#fff;", "background: var(--bg-card);"),
        ("color: #111;", "color: var(--text);"),
        ("color:#111;", "color: var(--text);"),
        ("background: #f4f4f4;", "background: var(--bg-table);"),
        ("background:#f4f4f4;", "background: var(--bg-table);"),
        ("background: #fbf0f2;", "background: rgba(225, 29, 72, 0.1);"),
        ("background:#fbf0f2;", "background: rgba(225, 29, 72, 0.1);"),
        ("color: #333;", "color: var(--text-muted);"),
        ("color:#333;", "color: var(--text-muted);"),
        ("border: 1px solid #ddd;", "border: 1px solid var(--border);"),
        ("border:1px solid #ddd;", "border: 1px solid var(--border);"),
        ("border-left: 4px solid #e63950;", "border-left: 4px solid var(--accent);"),
        ("color: #222;", "color: var(--text);"),
        ("color:#222;", "color: var(--text);"),
        ("border-bottom: 1px solid #ccc;", "border-bottom: 1px solid var(--border);"),
        ("border-bottom:1px solid #ccc;", "border-bottom: 1px solid var(--border);"),
        ("color: #c41e3a;", "color: var(--accent);"),
        ("color:#c41e3a;", "color: var(--accent);"),
    ]

    for old, new in replacements:
        html = html.replace(old, new)

    filepath.write_text(html, encoding="utf-8")


def main():
    html_files = sorted(SITE.glob("*.html"))

    print(f"Found {len(html_files)} HTML files")
    print()

    # 1. Inject canonical nav into all pages
    nav_updated = 0
    for f in html_files:
        if inject_nav(f):
            nav_updated += 1
            print(f"  ✅ Nav injected: {f.name}")
        else:
            print(f"  ⚠️  No nav found: {f.name}")

    print(f"\nNav updated: {nav_updated}/{len(html_files)}")

    # 2. Fix hansard dark theme
    hansard = SITE / "hansard-evidence.html"
    if hansard.exists():
        fix_hansard_dark_theme(hansard)
        print(f"\n✅ Hansard dark theme fixed")

    # 3. Fix 5gw-subversion.html — it had an old essay-container with white bg
    fgw = SITE / "5gw-subversion.html"
    if fgw.exists():
        html = fgw.read_text(encoding="utf-8")
        # The War On You page we wrote already uses dark theme vars, verify
        if "background: #fff" in html or "color: #111" in html:
            html = html.replace("background: #fff;", "background: var(--bg-card);")
            html = html.replace("color: #111;", "color: var(--text);")
            fgw.write_text(html, encoding="utf-8")
            print("✅ 5GW page dark theme fixed")
        else:
            print("✅ 5GW page already dark themed")

    print("\nDone!")


if __name__ == "__main__":
    main()
