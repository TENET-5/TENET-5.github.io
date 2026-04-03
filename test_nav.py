import json
import re

with open("E:/TENET-5.github.io/nav.js", "r", encoding="utf-8") as f:
    js = f.read()

# Since we just want to know if it's broken, let's extract the NAV_STRUCTURE and verify it visually
match = re.search(r'const NAV_STRUCTURE = ({.*?});', js, re.DOTALL)
if match:
    print("NAV_STRUCTURE found and looks parsing-ready.")
else:
    print("NAV_STRUCTURE not matched.")
