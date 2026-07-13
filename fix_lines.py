import sys

with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

newsdesk_idx = -1
liril_pres_idx = -1
newsdesk_end_idx = -1
newsair_idx = -1
newsair_end_idx = -1

for i, line in enumerate(lines):
    if '<section class="newsdesk field"' in line:
        newsdesk_idx = i
    if '<div class="liril-presentation glass"' in line:
        liril_pres_idx = i
    if liril_pres_idx != -1 and newsdesk_end_idx == -1 and '</section>' in line:
        newsdesk_end_idx = i
    if '<section class="news-air field tls-home"' in line:
        newsair_idx = i
    if newsair_idx != -1 and newsair_end_idx == -1 and '</section>' in line:
        # Wait, if newsair contains nested </section>? No it doesn't.
        # But just in case, I know news-air ends around line 316... wait, let's look for `<footer`
        pass

for i in range(newsair_idx, len(lines)):
    if '</section>' in lines[i]:
        newsair_end_idx = i
        break

if -1 in [newsdesk_idx, liril_pres_idx, newsdesk_end_idx, newsair_idx, newsair_end_idx]:
    print("Could not find all indices")
    print(f"newsdesk: {newsdesk_idx}, liril_pres: {liril_pres_idx}, newsdesk_end: {newsdesk_end_idx}, newsair: {newsair_idx}, newsair_end: {newsair_end_idx}")
    sys.exit(1)

# Parts
part1 = lines[:newsdesk_idx]

part_active_inv = lines[newsdesk_idx:liril_pres_idx] + ["  </div>\n</section>\n"]

# We need to wrap liril-pres in a section, or just a div
part_liril = ['<section class="newsdesk field" id="liril-pres-section" style="padding-bottom: 0;">\n', '  <div class="wrapx rv">\n'] + \
             lines[liril_pres_idx:newsdesk_end_idx-1] + \
             ['  </div>\n</section>\n']

part_newsair = lines[newsair_idx:newsair_end_idx+1]

part_end = lines[newsair_end_idx+1:]

new_lines = part1 + part_liril + part_newsair + ["\n\n"] + part_active_inv + part_end

with open("index.html", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Done via line slicing")
