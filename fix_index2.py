import sys

with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Markers
m_newsdesk_start = text.find('<section class="newsdesk field" id="newsdesk"')
m_liril_pres_start = text.find('<div class="liril-presentation glass" id="liril-presentation"')
m_newsdesk_end = text.find('  </div>\n</section>', m_liril_pres_start) + len('  </div>\n</section>')

# News-air starts after newsdesk
m_newsair_start = text.find('<section class="news-air field tls-home" id="news-air"')
m_newsair_end = text.find('</section>', m_newsair_start) + len('</section>')

if -1 in [m_newsdesk_start, m_liril_pres_start, m_newsdesk_end, m_newsair_start, m_newsair_end]:
    print("Markers not found!")
    sys.exit(1)

# Extract parts
# 1. Everything before newsdesk
pre_newsdesk = text[:m_newsdesk_start]

# 2. newsdesk BEFORE liril-presentation (this is the Active investigations part)
# We need to close the newsdesk section since we're splitting it.
# Actually, liril-presentation is currently INSIDE newsdesk at the bottom.
active_investigations = text[m_newsdesk_start:m_liril_pres_start] + '  </div>\n</section>\n'

# 3. liril-presentation
liril_presentation = text[m_liril_pres_start:m_newsdesk_end]

# 4. news-air section
news_air = text[m_newsair_start:m_newsair_end]

# 5. Everything after news-air
post_newsair = text[m_newsair_end:]

# But wait, liril_presentation originally closed the newsdesk div and section!
# Let's fix liril_presentation so it doesn't close anything, OR wrap it in a section!
# Actually, in the original:
"""
    <div class="liril-presentation glass" id="liril-presentation" aria-label="LIRIL desk reporter — live news">
      ...
    </div>
  </div>
</section>
"""
liril_presentation = '<section class="newsdesk field" id="liril-pres-section" style="padding-bottom: 0;">\n  <div class="wrapx rv">\n    ' + text[m_liril_pres_start:m_liril_pres_start + text[m_liril_pres_start:m_newsdesk_end].rfind('    </div>')] + '\n  </div>\n</section>\n'

# Assemble the new text:
# We want liril-presentation -> news-air -> active investigations
new_text = pre_newsdesk + \
           liril_presentation + \
           news_air + '\n\n' + \
           active_investigations + \
           post_newsair

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_text)

print("Reordered successfully!")
