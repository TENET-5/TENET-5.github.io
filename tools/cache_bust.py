import os
import re

html_dir = r"e:\TENET-5.github.io"
count = 0

for root, _, files in os.walk(html_dir):
    for f in files:
        if f.endswith(".html"):
            path = os.path.join(root, f)
            try:
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()
                
                # Replace cache string - Cinematic Engine Update 20
                new_content = re.sub(r'style\.css\?v=\d+', 'style.css?v=20', content)
                new_content = re.sub(r'style\.css"', 'style.css?v=20"', new_content)
                new_content = re.sub(r"style\.css'", "style.css?v=20'", new_content)
                
                # Bust nav.js explicitly
                new_content = re.sub(r'nav\.js\?v=\d+', 'nav.js?v=20', new_content)
                new_content = re.sub(r'nav\.js"', 'nav.js?v=20"', new_content)
                new_content = re.sub(r"nav\.js'", "nav.js?v=20'", new_content)

                # Bust shell.js and readnext.js
                new_content = re.sub(r'shell\.js\?v=\d+', 'shell.js?v=20', new_content)
                new_content = re.sub(r'readnext\.js\?v=\d+', 'readnext.js?v=20', new_content)

                if new_content != content:
                    with open(path, "w", encoding="utf-8") as file:
                        file.write(new_content)
                    count += 1
            except Exception as e:
                pass

print(f"Busted cache on {count} HTML dossiers. Switched to v=12/6.")
