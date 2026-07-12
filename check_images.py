import os, re
with open('E:/TENET-5.github.io/index.html', 'r', encoding='utf-8') as f:
    html = f.read()
imgs = re.findall(r'<img[^>]+src=\"([^\"]+)\"', html)
missing = []
for img in set(imgs):
    path = os.path.join('E:/TENET-5.github.io', img)
    if not os.path.exists(path):
        missing.append(img)
print('Missing images:')
for m in missing:
    print(f'- {m}')
