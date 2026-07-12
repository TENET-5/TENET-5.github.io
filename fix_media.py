import glob
import os
import re

htmls = ['E:/TENET-5.github.io/index.html', 'E:/TENET-5.github.io/evidence-index.html', 'E:/TENET-5.github.io/network-analysis.html', 'E:/TENET-5.github.io/investigations.html']

for f in htmls:
    content = open(f, encoding='utf-8').read()
    new_content = re.sub(r'media/generated/[^\"]+\.(png|jpg)', 'media/landing/ledger_desk.jpg', content)
    with open(f, 'w', encoding='utf-8') as out:
        out.write(new_content)
    print("Fixed", f)
