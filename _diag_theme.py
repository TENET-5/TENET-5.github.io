from pathlib import Path
import re, json
c = Path("evidence-index.html").read_text(encoding="utf-8", errors="replace")
print("themes:", re.findall(r'href=["\']([^"\']*press-theme\.css[^"\']*)["\']', c, re.I))
print("locks:", re.findall(r'href=["\']([^"\']*design-lock\.css[^"\']*)["\']', c, re.I))
print("interior", "press-interior" in c)
bm = re.search(r"<body[^>]*>", c, re.I)
print("body", bm.group(0) if bm else None)
# scan all pages for multi theme
bad = []
for p in Path(".").rglob("*.html"):
    if any(x in p.parts for x in (".git","tools","node_modules","data","lab")):
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    n = len(re.findall(r'href=["\'](?:\.\./)*css/press-theme\.css', t, re.I))
    if n != 1:
        bad.append((str(p).replace("\\","/"), n))
print("multi_or_zero_theme", len(bad))
for b in bad[:25]:
    print(b)
