import os

pages = ['act-i.html', 'act-ii.html', 'act-iii.html', 'act-iv.html', 'act-v.html']
for p in pages:
    path = os.path.join(r"E:\TENET-5.github.io", p)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the broken 4-column grid with the correct 5-column grid
        content = content.replace(
            'class="media-grid media-grid-4 act-continuum-grid"',
            'class="media-grid media-grid-5 act-continuum-grid"'
        )
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {p}")
