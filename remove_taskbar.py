import glob
import re

html_files = glob.glob('*.html')
script_tag = '<script src="js/prism-os-taskbar.js"></script>'

count = 0
for f in html_files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        if script_tag in content:
            # Also clean up the potential blank line/indentation if needed
            content = content.replace(f'  {script_tag}\n', '')
            content = content.replace(script_tag, '')
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            count += 1
            
    except Exception as e:
        print(f"Error processing {f}: {e}")

print(f"Removed taskbar script from {count} files.")
