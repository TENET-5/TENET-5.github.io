#!/usr/bin/env python3
"""Build an investigation page from YAML front matter + Markdown content.

Usage:
    python tools/build_page.py content/maid-report.md
    python tools/build_page.py content/*.md  # Build all

Creates HTML pages using the standard template with:
- Red Ensign Royal theme
- Academic citation system
- Responsive data tables
- Progressive disclosure (TL;DR + expandable details)
- Proper OG/SEO metadata
- nav.js + footer.js integration
"""

import re
import sys
from pathlib import Path


TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | Canadian Accountability Project</title>
  <meta name="description" content="{description}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://tenet-5.github.io/{slug}.html">
  <meta property="og:site_name" content="Canadian Accountability Project">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://tenet-5.github.io/{slug}.html">
  <link rel="stylesheet" href="style.css?v=12">
  <meta name="theme-color" content="#0a1628">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1F1E8;&#x1F1E6;</text></svg>">
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <nav id="site-nav"></nav>

  <main id="main" class="container" style="max-width:900px;margin:0 auto;padding:20px;">

    <header style="text-align:center;padding:40px 0 20px;border-bottom:2px solid rgba(212,168,67,.3);margin-bottom:24px;">
      <div class="tag tag-{tag_color}">{tag}</div>
      <h1 style="font-family:'Playfair Display',serif;font-size:2rem;color:var(--text-primary);margin:12px 0 8px;">{title}</h1>
      <p style="font-size:0.85rem;color:var(--text-tertiary);max-width:700px;margin:0 auto;">{description}</p>
      <p style="font-size:0.75rem;color:var(--text-quaternary);margin-top:8px;">Last updated: {date} | Sources: {source_count} official records</p>
    </header>

    <!-- TL;DR -->
    <div class="tldr">
      <div class="tldr-label">Summary</div>
      <div class="tldr-text">{tldr}</div>
    </div>

    {content}

    <!-- SOURCES -->
    <section class="sources">
      <h3>Sources &amp; References</h3>
      {sources_html}
    </section>

  </main>

  <script src="nav.js?v=11"></script>
  <script src="share.js"></script>
  <footer id="site-footer"></footer>
  <script src="readnext.js?v=2"></script>
  <script src="footer.js?v=2"></script>
</body>
</html>'''


def parse_front_matter(text):
    """Parse YAML-like front matter from --- delimited block."""
    if not text.startswith('---'):
        return {}, text

    parts = text.split('---', 2)
    if len(parts) < 3:
        return {}, text

    meta = {}
    for line in parts[1].strip().splitlines():
        if ':' in line:
            key, val = line.split(':', 1)
            meta[key.strip()] = val.strip().strip('"').strip("'")

    return meta, parts[2].strip()


def md_to_html(md):
    """Minimal markdown to HTML conversion."""
    lines = md.split('\n')
    html = []
    in_list = False

    for line in lines:
        stripped = line.strip()

        # Headers
        if stripped.startswith('### '):
            html.append(f'<h3>{stripped[4:]}</h3>')
        elif stripped.startswith('## '):
            html.append(f'<h2>{stripped[3:]}</h2>')
        elif stripped.startswith('# '):
            html.append(f'<h1>{stripped[2:]}</h1>')
        # List items
        elif stripped.startswith('- '):
            if not in_list:
                html.append('<ul>')
                in_list = True
            html.append(f'<li>{stripped[2:]}</li>')
        elif in_list and not stripped.startswith('- '):
            html.append('</ul>')
            in_list = False
            if stripped:
                html.append(f'<p>{stripped}</p>')
        # Bold
        elif stripped:
            # Convert **bold** and [links](url)
            text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', stripped)
            text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)
            html.append(f'<p>{text}</p>')
        else:
            if in_list:
                html.append('</ul>')
                in_list = False

    if in_list:
        html.append('</ul>')

    return '\n    '.join(html)


def build_page(md_path):
    """Build an HTML page from a markdown file."""
    text = Path(md_path).read_text(encoding='utf-8')
    meta, content = parse_front_matter(text)

    slug = meta.get('slug', Path(md_path).stem)
    title = meta.get('title', slug.replace('-', ' ').title())
    description = meta.get('description', '')
    tag = meta.get('tag', 'INVESTIGATION')
    tag_color = meta.get('tag_color', 'red')
    date = meta.get('date', '2026-04-11')
    tldr = meta.get('tldr', '')
    source_count = meta.get('source_count', '0')

    # Parse sources
    sources = []
    if 'sources' in meta:
        for s in meta['sources'].split(';'):
            sources.append(s.strip())

    sources_html = '\n      '.join(
        f'<div class="source-item">{s}</div>' for s in sources
    ) if sources else '<div class="source-item">See inline citations throughout this page.</div>'

    content_html = md_to_html(content)

    html = TEMPLATE.format(
        title=title,
        description=description,
        slug=slug,
        tag=tag,
        tag_color=tag_color,
        date=date,
        tldr=tldr,
        source_count=source_count,
        content=content_html,
        sources_html=sources_html,
    )

    out_path = Path(md_path).parent.parent / f'{slug}.html'
    out_path.write_text(html, encoding='utf-8')
    print(f'  Built: {out_path} ({len(html)} bytes)')
    return out_path


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python tools/build_page.py content/page-name.md')
        sys.exit(1)

    for path in sys.argv[1:]:
        build_page(path)
