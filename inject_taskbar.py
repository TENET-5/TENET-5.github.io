import os
import glob

html_files = glob.glob('*.html')
script_tag = '<script src="js/prism-os-taskbar.js"></script>'

count = 0
for f in html_files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Avoid double injection
        if script_tag not in content and '</body>' in content:
            content = content.replace('</body>', f'  {script_tag}\n</body>')
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            count += 1
    except Exception as e:
        print(f"Error processing {f}: {e}")

print(f'Injected taskbar into {count} files.')
