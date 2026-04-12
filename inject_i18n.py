import os, glob

os.chdir('E:/TENET-5.github.io')
count = 0
for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'js/i18n.js' not in content:
        if '</body>' in content:
            content = content.replace('</body>', '<script src="js/i18n.js"></script>\n</body>')
        else:
            content += '\n<script src="js/i18n.js"></script>'
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1

print(f'Successfully injected i18n into {count} files.')
