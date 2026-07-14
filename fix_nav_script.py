import os, glob, re
target_dir = r'E:\TENET-5.github.io'
files = glob.glob(os.path.join(target_dir, '*.html'))

unified_nav_inner = '''
        <a href="index.html">Home</a>
        <a href="news.html">News</a>
        <a href="daily-briefing.html">Briefing</a>
        <a href="investigations.html">Investigations</a>
        <a href="argument.html">The Case</a>
        <a href="evidence-index.html">Evidence</a>
        <a href="about.html">About</a>
'''

pattern = re.compile(r'(<nav[^>]*aria-label="Primary"[^>]*>)(.*?)(</nav>)', re.DOTALL | re.IGNORECASE)
count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if pattern.search(content):
        new_content = pattern.sub(r'\g<1>\n' + unified_nav_inner + r'      \g<3>', content)
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            count += 1

print(f"Updated {count} HTML files with unified navigation.")
