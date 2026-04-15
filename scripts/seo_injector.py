#!/usr/bin/env python3
import os
import glob
import re
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Regex patterns
title_re = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
head_end_re = re.compile(r"</head>", re.IGNORECASE)
css_re = re.compile(r"style\.css(\?v=\d+)?")

# We don't want to double inject if tags exist, so we will do a basic check
# Actually, the safest way is to strip out old schema script blocks and inject a new one.

SCHEMA_START = '<!-- TENET5 SEO INJECT -->'
SCHEMA_END = '<!-- /TENET5 SEO INJECT -->'

def inject_seo(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Skip files that are not actually HTML pages (like fragments)
    if "<head>" not in content.lower():
        return False

    # Extract title
    title_match = title_re.search(content)
    page_title = title_match.group(1).strip() if title_match else "TENET5 Database"

    # 1. Enforce CSS versioning globally (v=6 ensures cache break)
    content = css_re.sub("style.css?v=6", content)

    # 2. Clean up any previous automated SEO injects to avoid duplicates
    if SCHEMA_START in content and SCHEMA_END in content:
        # remove old block
        content = re.sub(rf"{SCHEMA_START}.*?{SCHEMA_END}\n?", "", content, flags=re.DOTALL)

    # Base URL inference
    basename = os.path.basename(filepath)
    canonical = f"https://tenet5.github.io/{basename if basename != 'index.html' else ''}"

    # Build the injection block
    json_ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page_title,
        "url": canonical,
        "publisher": {
            "@type": "Organization",
            "name": "TENET5 Investigation",
            "logo": {"@type": "ImageObject", "url": "https://tenet5.github.io/img/tenet5_logo.png"}
        }
    }

    seo_block = f"""
{SCHEMA_START}
  <!-- Dynamic SEO Enforced by TENET5 automated pipeline -->
  <meta property="og:title" content="{page_title}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TENET5 Accountability">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{page_title}">
  <link rel="canonical" href="{canonical}">
  <script type="application/ld+json">
  {json.dumps(json_ld, indent=2)}
  </script>
{SCHEMA_END}
</head>"""

    # Inject right before </head>
    new_content = head_end_re.sub(lambda _: seo_block, content, count=1)

    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False

def main():
    html_files = glob.glob(os.path.join(ROOT_DIR, "*.html"))
    updated = 0
    for f in html_files:
        if inject_seo(f):
            updated += 1
            print(f"Updated SEO & CSS headers -> {os.path.basename(f)}")
    print(f"\\nProcessed {len(html_files)} files. Updated {updated} files.")

if __name__ == "__main__":
    main()
