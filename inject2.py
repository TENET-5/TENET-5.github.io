import os
import re

files_intercept = [
    'investigation-matrix.html',
    'charity-pipeline.html',
    'carney-conflicts.html',
    'follow-the-money.html',
    'cfnis-proxy.html',
    'brookfield-maid.html',
    'demographics-to-death.html',
    'cija-lobbying.html'
]

html_block = '''<div id="nv-quantum-intercept">
    <div id="nv-quantum-content"><ul><li>NV-QUANTUM Active</li></ul></div>
    <div id="nv-quantum-sig">VERIFIED</div>
</div>'''

for f in files_intercept:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        # replace the old hidden block if it exists
        content = re.sub(r'<div id="nv-quantum-intercept" style="display:none;" aria-hidden="true">.*?</div>\n*</div>', html_block, content, flags=re.DOTALL)
        if 'id="nv-quantum-intercept"' not in content:
            content = content.replace('</body>', f'{html_block}\n</body>')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

# For interactive pages, put script at top of head so it executes immediately
files_interactive = ['conspiracy-board.html', 'network-analysis.html', 'canada-map.html']
script_tag = '<script>window.__TENET5_INTERACTIVE_PAGE = true;</script>'

for f in files_interactive:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        # remove from body end if we put it there
        content = content.replace(f'{script_tag}\n</body>', '</body>')
        content = content.replace(f'{script_tag}</body>', '</body>')
        
        # inject at start of head
        if script_tag not in content:
            content = content.replace('<head>', f'<head>\n{script_tag}')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print('Updated files.')
