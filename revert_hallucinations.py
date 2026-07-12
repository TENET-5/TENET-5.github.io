import os
import re

directory = r"E:\TENET-5.github.io"
pattern = re.compile(r'media/generated/[a-zA-Z0-9_-]+\.png')

count = 0
for root, dirs, files in os.walk(directory):
    if '.git' in dirs:
        dirs.remove('.git')
    for filename in files:
        if filename.endswith(".html") or filename.endswith(".json"):
            filepath = os.path.join(root, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                if pattern.search(content):
                    new_content = pattern.sub('media/landing/committee_empty.jpg', content)
                    with open(filepath, "w", encoding="utf-8", newline="\n") as f:
                        f.write(new_content)
                    print(f"Fixed {filepath}")
                    count += 1
            except Exception as e:
                pass

print(f"Finished fixing {count} files.")
