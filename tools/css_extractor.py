import os
import re

html_files = [f for f in os.listdir() if f.endswith('.html') and f != 'red-duster-game.html']
style_map = {}
style_counter = 1

def style_replacer(match):
    global style_counter
    prefix = match.group(1) # anything before style=
    styles_raw = match.group(2) # the actual style string
    
    # Clean up the style string a bit
    styles_clean = styles_raw.strip()
    if not styles_clean.endswith(';'):
        styles_clean += ';'
        
    if styles_clean not in style_map:
        style_map[styles_clean] = f"tnt-style-{style_counter}"
        style_counter += 1
        
    class_name = style_map[styles_clean]
    
    # Look closely if there is already a class attribute in prefix
    if 'class="' in prefix:
        # inject into existing class
        new_prefix = re.sub(r'class="([^"]*)"', f'class="\\1 {class_name}"', prefix, count=1)
        return new_prefix
    else:
        # no class attribute, add it
        # However, prefix might end with a space or not. Let's just append class
        return f'{prefix} class="{class_name}"'

for f in html_files:
    try:
        with open(f, encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        continue
        
    original = content
    
    # We look for tags with style="..."
    # Note: Regex parsing HTML is dangerous if there are nested quotes, 
    # but for simple style="...", it's usually safe.
    # Group 1 captures everything up to the style tag. Group 2 captures the styles.
    # We will iterate over all style="xxx"
    
    # But wait, we need to know if class exists on the SAME element.
    # A safer naive regex replaces within the <tag ...> bounds.
    # Let's find all <... style="..."> tags globally using a lambda replacer
    content = re.sub(r'(<[a-zA-Z0-9]+[^>]*?)\sstyle="([^"]+)"', style_replacer, content)

    if content != original:
        # Automatically ensure the generated CSS is imported in <head>
        if '<head>' in content or '<head ' in content:
            if 'inline_generated.css' not in content:
                content = content.replace('</head>', '    <link rel="stylesheet" href="css/inline_generated.css">\n</head>', 1)
        
        with open(f, "w", encoding='utf-8') as file:
            file.write(content)

# Write the centralized CSS
os.makedirs("css", exist_ok=True)
with open("css/inline_generated.css", "w", encoding='utf-8') as f:
    f.write("/* AUTO-GENERATED CSS EXTRACTED FROM HTML INLINES */\n\n")
    for css, class_name in style_map.items():
        f.write(f".{class_name} {{\n    {css}\n}}\n\n")

print(f"Phase 2 CSS Extraction Complete. Extracted {len(style_map)} distinct inline styles.")
