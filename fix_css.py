import sys

with open('E:/TENET-5.github.io/css/design-lock.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('[data-press-interior]', '[data-press]')

with open('E:/TENET-5.github.io/css/design-lock.css', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated design-lock.css successfully.')
