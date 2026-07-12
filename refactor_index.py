import re

with open('E:/TENET-5.github.io/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the enter section
pattern_enter = r'<section class="enter field" id="enter".*?</section>'
content = re.sub(pattern_enter, '', content, flags=re.DOTALL)

# Remove the book section
pattern_book = r'<section class="catalog field" id="book".*?</section>'
replacement_book = '''<section class="catalog field" id="book" data-line="The full index is maintained separately to ensure performance.">
  <div class="wrapx rv">
    <span class="kick">The Evidence Shelf</span>
    <h2 class="thesis-title" style="margin-top:2vh">Open the <em>archives.</em></h2>
    <p style="margin-top:2vh;max-width:720px;color:var(--ivory-dim);font-size:15px;line-height:1.7">
    Every investigation, editorial, dossier, and dataset on this site is categorized by domain in the evidence shelf. LIRIL can read any of them to you.</p>
    <div class="links" style="margin-top: 3vh">
      <a href="evidence-index.html">Open the full evidence shelf</a>
      <a href="investigations.html">Open the investigations hub</a>
    </div>
  </div>
</section>'''
content = re.sub(pattern_book, replacement_book, content, flags=re.DOTALL)

# Update videos (except the first one which is home-broll)
# Find all <video> tags.
videos = re.split(r'(<video\s)', content)
new_content = [videos[0]]
is_first_video = True
for i in range(1, len(videos), 2):
    tag_start = videos[i]
    tag_body_and_rest = videos[i+1]
    
    # Extract the full tag to process it
    match = re.search(r'(.*?>)(.*)', tag_body_and_rest, flags=re.DOTALL)
    if match:
        tag_content = match.group(1)
        rest = match.group(2)
        
        if is_first_video and 'class="home-broll"' in tag_content:
            # Keep first video as is
            is_first_video = False
            new_content.append(tag_start + tag_content + rest)
        else:
            # Replace preload
            tag_content = re.sub(r'preload="(auto|metadata)"', 'preload="none"', tag_content)
            # Make sure data-lazy-video attribute exists if we want our script to pick it up, 
            # actually we can just select video[preload="none"] in our JS.
            new_content.append(tag_start + tag_content + rest)
    else:
        new_content.append(tag_start + tag_body_and_rest)

content = ''.join(new_content)

# Add spacing to the stills section
content = content.replace('class="stills-grid stills-grid-9"', 'class="stills-grid stills-grid-9" style="margin-bottom: 6vh;"')
content = content.replace('class="charts-row charts-row-8"', 'class="charts-row charts-row-8" style="margin-bottom: 6vh;"')

with open('E:/TENET-5.github.io/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated index.html successfully.')
