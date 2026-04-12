import os
import re

html_files = [f for f in os.listdir() if f.endswith('.html')]

no_nav = []
no_seo = []
no_meta = []
missing_h1 = []
missing_lang = []
inline_css_heavy = []
total_lines = 0

for f in html_files:
    try:
        with open(f, encoding='utf-8') as file:
            lines = file.readlines()
            content = "".join(lines)
            total_lines += len(lines)
            
            if 'nav.js' not in content and 'navigation-container' not in content:
                no_nav.append(f)
            if 'seo' not in content.lower():
                no_seo.append(f)
            if 'name="description"' not in content:
                no_meta.append(f)
            if '<h1' not in content:
                missing_h1.append(f)
            if '<html lang=' not in content:
                missing_lang.append(f)
            if content.count('style="') > 10:
                inline_css_heavy.append(f)
    except Exception as e:
        print(f"Error reading {f}: {e}")

report = f"""# Web Repository Comprehensive Analysis

Total HTML Files Analysed: {len(html_files)}
Total Lines Read: {total_lines}

## Structural & Semantic Anomalies
- **Missing Navigation Components:** {len(no_nav)}
- **Missing SEO Metadata:** {len(no_seo)}
- **Missing Meta Description:** {len(no_meta)}
- **Missing H1 Tags:** {len(missing_h1)}
- **Missing HTML Lang Attributes:** {len(missing_lang)}
- **Heavy Inline CSS Usage (>10 inline styles):** {len(inline_css_heavy)}

### Files Missing Navigation:
{', '.join(no_nav) if no_nav else 'None'}

### Files Missing <h1> Structure:
{', '.join(missing_h1) if missing_h1 else 'None'}

### Heavy Inline CSS Needs Refactoring:
{', '.join(inline_css_heavy) if inline_css_heavy else 'None'}
"""

with open("analysis_results.md", "w", encoding='utf-8') as f:
    f.write(report)

print("Comprehensive analysis complete. Output written to analysis_results.md.")
