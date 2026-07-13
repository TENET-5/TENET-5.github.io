with open('investigations.html', encoding='utf-8', errors='replace') as f:
    t = f.read()
print("class='press-bar' in t:", "class='press-bar" in t)
print('class="press-bar" in t:', 'class="press-bar' in t)
