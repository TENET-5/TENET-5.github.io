import re

with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# I want to find the newsdesk block, which starts with <section class="newsdesk field" id="newsdesk"
# And then the liril-presentation block, which is inside newsdesk.
# And then the news-air block, which is after newsdesk.

# But we know that newsdesk is currently:
# <section class="newsdesk ...>
#   <div class="wrapx rv">
#     ...
#     <div class="liril-presentation glass" id="liril-presentation" aria-label="LIRIL desk reporter — live news">
#       ...
#     </div>
#   </div>
# </section>
# <section class="news-air field tls-home" id="news-air" data-line="TENET5 LIVE — live station with time and topic navigation.">
#   ...
# </section>

# Let's extract newsdesk (before liril-presentation), liril-presentation, and news-air.

m1 = re.search(r'(<section class="newsdesk field" id="newsdesk".*?)(<div class="liril-presentation glass".*?)(</div>\s*</div>\s*</section>)(\s*<section class="news-air field tls-home" id="news-air".*?</section>)', text, re.DOTALL)

if m1:
    newsdesk_pre = m1.group(1)
    liril_pres = m1.group(2)
    newsdesk_post = m1.group(3)
    news_air = m1.group(4)
    
    # We want liril-presentation ABOVE active investigations (newsdesk).
    # Since liril-presentation is currently just a div inside newsdesk, if we move it up, we can wrap it in its own <section> or put it inside news-air.
    # The screenshot shows the "What is going on today." inside the Live station area maybe?
    # No, it's just a div. liril-presentation glass.
    
    # Let's construct the new order:
    # 1. New section for liril_pres
    new_liril = '<section class="newsdesk field" id="liril-pres-section" style="padding-bottom: 0;">\n  <div class="wrapx rv">\n    ' + liril_pres + '  </div>\n</section>'
    
    # 2. news-air section
    # 3. newsdesk section (Active investigations)
    new_newsdesk = newsdesk_pre + '  </div>\n</section>'
    
    new_content = new_liril + news_air + '\n\n' + new_newsdesk
    
    final_text = text[:m1.start()] + new_content + text[m1.end():]
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(final_text)
    print("Success")
else:
    print("Regex failed to match")
