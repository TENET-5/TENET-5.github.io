"""Link integrity check for [CONNECTED INTELLIGENCE] cross-links."""
import os, re, glob

ci_targets = set()
ci_pages = []
all_html = set(os.path.basename(f) for f in glob.glob('*.html'))

for f in sorted(glob.glob('*.html')):
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    if '[CONNECTED INTELLIGENCE]' not in content:
        continue
    ci_pages.append(os.path.basename(f))
    ci_start = content.find('[CONNECTED INTELLIGENCE]')
    ci_end = content.find('</div>\n</div>', ci_start)
    if ci_end == -1:
        ci_end = content.find('</div>\r\n</div>', ci_start)
    if ci_end == -1:
        ci_end = ci_start + 3000
    ci_section = content[ci_start:ci_end+20]
    hrefs = re.findall(r'href="([^"]+?)"', ci_section)
    for h in hrefs:
        ci_targets.add(h)

broken = sorted(t for t in ci_targets if t not in all_html and not t.startswith('http'))
print(f'CI pages: {len(ci_pages)}')
print(f'Unique CI targets: {len(ci_targets)}')
print(f'Broken links: {len(broken)}')
for b in broken:
    print(f'  BROKEN: {b}')

ci_page_set = set(ci_pages)
targets_no_ci = sorted(t for t in ci_targets if t in all_html and t not in ci_page_set)
print(f'\nCI targets WITHOUT their own CI block: {len(targets_no_ci)}')
for t in targets_no_ci:
    print(f'  {t}')

# Pages with no CI at all
no_ci = sorted(f for f in all_html if f not in ci_page_set and 'Connected Intelligence</h3>' not in open(f, 'r', encoding='utf-8').read() and '[CONNECTED INTELLIGENCE]' not in open(f, 'r', encoding='utf-8').read())
print(f'\nPages with NO CI block at all: {len(no_ci)}')
for p in no_ci:
    print(f'  {p}')
