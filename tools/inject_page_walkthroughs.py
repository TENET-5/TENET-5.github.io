import os
import glob
import re
import uuid

directory = r'e:\TENET-5.github.io'

def clean_html(raw):
    # Remove HTML tags and extra whitespace
    cleaner = re.compile('<.*?>')
    cleaned = re.sub(cleaner, ' ', raw)
    # Remove entities
    cleaned = re.sub(r'&[a-zA-Z]+;', ' ', cleaned)
    return ' '.join(cleaned.split())

def inject_walkthrough(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return 0

    if 'data-narrate=' in content:
        return 0  # Skip already fully annotated pages
        
    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', content, flags=re.IGNORECASE|re.DOTALL)
    title = clean_html(title_match.group(1)) if title_match else ""
    if "|" in title:
        title = title.split("|")[0].strip()

    # Extract first paragraph or subtitle
    p_match = re.search(r'<p[^>]*>(.*?)</p>', content, flags=re.IGNORECASE|re.DOTALL)
    para = clean_html(p_match.group(1)) if p_match else ""

    summary_text = f"{title}. {para}"
    if len(summary_text.strip()) < 10:
        return 0

    # Inject into the primary heading or hero container securely
    h1_match = re.search(r'<h1([^>]*)>(.*?)</h1>', content, flags=re.IGNORECASE|re.DOTALL)
    hero_match = re.search(r'<section\s+class="[^"]*hero[^"]*"([^>]*)>', content, flags=re.IGNORECASE|re.DOTALL)

    node_id = 'n-' + str(uuid.uuid4())[:8]
    injected_str = f' id="{node_id}" data-narrate="{summary_text.replace("\"", "")}" '

    if hero_match:
        original = hero_match.group(0)
        new_str = original.replace('>', f'{injected_str}>')
        content = content.replace(original, new_str, 1)
    elif h1_match:
        original = f"<h1{h1_match.group(1)}>{h1_match.group(2)}</h1>"
        new_str = f"<h1{h1_match.group(1)}{injected_str}>{h1_match.group(2)}</h1>"
        content = content.replace(original, new_str, 1)
    else:
        # Fallback to the content div
        content = content.replace('<div class="content">', f'<div class="content"{injected_str}>', 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Injected walkthrough into {os.path.basename(filepath)}')
    return 1

print("Injecting LIRIL Walkthroughs into orphaned pages...")
count = 0
for f in glob.glob(os.path.join(directory, '*.html')):
    count += inject_walkthrough(f)
print(f'Total newly instrumented pages: {count}')
