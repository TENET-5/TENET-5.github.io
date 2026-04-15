import os
import glob
import re

SEO_TEMPLATE = """
<!-- TENET5 SEO INJECT -->
  <!-- Dynamic SEO Enforced by the TENET5 automated pipeline -->
  <meta property="og:title" content="{page_title}">
  <meta property="og:url" content="https://tenet5.github.io/{filename}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TENET5">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{page_title}">
  <link rel="canonical" href="https://tenet5.github.io/{filename}">
  <script type="application/ld+json">
  {{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{page_title}",
  "url": "https://tenet5.github.io/{filename}",
  "publisher": {{
    "@type": "Organization",
    "name": "TENET5",
    "logo": {{
      "@type": "ImageObject",
      "url": "https://tenet5.github.io/img/tenet5_logo.png"
    }}
  }}
}}
  </script>
<!-- /TENET5 SEO INJECT -->
"""

html_dir = r"e:\TENET-5.github.io"
files = glob.glob(os.path.join(html_dir, '**', '*.html'), recursive=True)

count = 0
for filepath in files:
    if "node_modules" in filepath:
        continue
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8', errors="ignore") as f:
        content = f.read()

    if '<!-- TENET5 SEO INJECT -->' in content:
        continue

    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    page_title = title_match.group(1).strip() if title_match else filename.replace('.html', '').replace('-', ' ').title()

    # Create the block
    seo_block = SEO_TEMPLATE.format(page_title=page_title, filename=filename).strip()

    # Inject it right before </head>
    if '</head>' in content:
        new_content = content.replace('</head>', f'{seo_block}\n</head>')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected SEO metadata into {filepath}")
        count += 1
    elif '</HEAD>' in content:
        new_content = content.replace('</HEAD>', f'{seo_block}\n</HEAD>')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected SEO metadata into {filepath}")
        count += 1
    else:
        print(f"Skipping {filepath}: no </head> tag found.")

print(f"\nTotal files updated: {count}")
