import re
t = open('E:/TENET-5.github.io/campaign-generator.html', encoding='utf-8', errors='replace').read()
print('n_theme:', len(re.findall(r'href=["\'](?:\.\./)*css/press-theme\.css', t, re.I)))
print('ver:', re.compile(r'href=["\'](?:\.\./)*css/press-theme\.css\?v=234["\']', re.I).search(t))
print('data-press:', 'data-press' in t)
print('press-bar:', 'class="press-bar' in t or "class='press-bar" in t)
