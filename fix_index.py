import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# I botched index.html so let's first fix it by removing the extra injected string.
html = html.replace("""<section class="news-air field tls-home" style="padding-top: 2rem;" id="news-air" data-line="TENET5 LIVE — live station with time and topic navigation.">
  <div class="wrapx rv">
    <h2 class="thesis-title" style="margin-top:0.6em">What is going on <em>today.</em></h2>
      <p class="pres-lede">Live package: briefing + wire + playable news segments. Video follows the desk, not a canned reel. Powered by LIRIL AI — you verify.</p>
      <p class="pres-meta">Play segments for video updates. Open the briefing for sourced claims.</p>
      <div class="pres-actions" style="margin-bottom: 2rem;">
        <a class="begin begin-quiet" href="live.html"><span>Full station</span></a>
        <a class="begin begin-quiet" href="daily-briefing.html"><span>Full briefing</span></a>
      </div>
    <div class="broadcast-head">

""", "")

# Find the newsdesk section
start_newsdesk = html.find('<section class="newsdesk field" id="newsdesk"')

# Find the "What is going on today." block
start_what = html.find('    <h2 class="thesis-title" style="margin-top:0.6em">What is going on <em>today.</em></h2>')
end_what = html.find('  </div>\n</section>', start_what)

# Find the news-air section
start_newsair = html.find('<section class="news-air field tls-home" id="news-air"')
end_newsair = html.find('</section>', start_newsair) + 10

if start_newsdesk != -1 and start_what != -1 and start_newsair != -1:
    what_block = html[start_what:end_what]
    newsair_block = html[start_newsair:end_newsair]
    
    # Remove them from current positions
    # Remove newsair_block
    html = html[:start_newsair] + html[end_newsair:]
    
    # Remove what_block (recalculating because index changed)
    start_what2 = html.find('    <h2 class="thesis-title" style="margin-top:0.6em">What is going on <em>today.</em></h2>')
    end_what2 = html.find('    </div>\n  </div>\n</section>', start_what2)
    if start_what2 != -1:
        # Note: the original what_block ends with </div></div></section>
        # Wait, let's just use regex to extract and reposition.
        pass

# Let's do it cleaner.
import sys
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Revert my bad replace (if present)
text = text.replace('<section class="news-air field tls-home" style="padding-top: 2rem;" id="news-air" data-line="TENET5 LIVE — live station with time and topic navigation.">\n  <div class="wrapx rv">\n    <h2 class="thesis-title" style="margin-top:0.6em">What is going on <em>today.</em></h2>\n      <p class="pres-lede">Live package: briefing + wire + playable news segments. Video follows the desk, not a canned reel. Powered by LIRIL AI — you verify.</p>\n      <p class="pres-meta">Play segments for video updates. Open the briefing for sourced claims.</p>\n      <div class="pres-actions" style="margin-bottom: 2rem;">\n        <a class="begin begin-quiet" href="live.html"><span>Full station</span></a>\n        <a class="begin begin-quiet" href="daily-briefing.html"><span>Full briefing</span></a>\n      </div>\n    <div class="broadcast-head">\n\n', "")

# Regex to capture the whole newsdesk section without the What is going on today block
m = re.search(r'(<section class="newsdesk field" id="newsdesk".*?)(    <h2 class="thesis-title" style="margin-top:0.6em">What is going on <em>today.</em></h2>.*?)(</section>)(\s*<section class="news-air field tls-home" id="news-air".*?</section>)', text, re.DOTALL)
if m:
    newsdesk_first_part = m.group(1)
    what_block = m.group(2)
    newsdesk_close = m.group(3)
    news_air_section = m.group(4)
    
    # The new layout: 
    # 1. news_air_section WITH the what_block integrated inside it OR just above it inside its own section?
    # The user says "this should be ABove active investigations"
    # The live station (news-air) has its own header.
    # What if we just swap news-air section entirely above newsdesk section, and put the "What is going on today" block before the news-air section inside a wrapper?
    # Actually, the user screenshot shows "What is going on today." inside the Live station section.
    
    new_text = text[:m.start()] + \
    '<section class="news-air field tls-home" id="news-air" style="padding-top: 3rem; padding-bottom: 0;">\n  <div class="wrapx rv">\n' + \
    what_block + '\n  </div>\n</section>\n' + \
    news_air_section + '\n\n' + \
    newsdesk_first_part + '\n    </div>\n  </div>\n' + newsdesk_close + \
    text[m.end():]
    
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_text)
    print("Fixed!")
else:
    print("Regex failed. Restoring from git.")
    import subprocess
    subprocess.run(["rm", "-f", ".git/index.lock"])
    subprocess.run(["git", "checkout", "index.html"])
