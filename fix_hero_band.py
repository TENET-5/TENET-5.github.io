import re

files = {
    'act-ii.html': {'ch': 'ch_02_killing.mp4', 'title': 'ACT II · Killing chapter', 'num': 'II'},
    'act-iii.html': {'ch': 'ch_03_harm.mp4', 'title': 'ACT III · Harm chapter', 'num': 'III'},
    'act-iv.html': {'ch': 'ch_04_conditions.mp4', 'title': 'ACT IV · Conditions chapter', 'num': 'IV'},
    'act-v.html': {'ch': 'ch_05_coercion.mp4', 'title': 'ACT V · Coercion chapter', 'num': 'V'}
}

for fname, meta in files.items():
    content = open('E:/TENET-5.github.io/' + fname, 'r', encoding='utf-8').read()
    
    # 1. Update css version
    content = re.sub(r'css/press-theme\.css\?v=\d+', 'css/press-theme.css?v=207', content)
    content = re.sub(r'css/design-lock\.css\?v=\d+', 'css/design-lock.css?v=207', content)
    
    # 2. Update act-page-bg
    content = re.sub(
        r'(<video class="act-page-bg".*?src=")[^"]+(".*?>\s*<source src=")[^"]+(".*?>\s*</video>)', 
        r'\g<1>media/film/docs/' + meta['ch'] + r'\g<2>media/film/docs/' + meta['ch'] + r'\g<3>', 
        content, flags=re.DOTALL
    )
    
    # 3. Remove act-page-fg
    content = re.sub(r'<div class="act-page-fg" aria-hidden="true">.*?</div>\s*', '', content, flags=re.DOTALL)
    
    # 4. Add has-doc-primary
    content = re.sub(r'<section class="act-hero media-hero"', r'<section class="act-hero media-hero has-doc-primary"', content)
    
    # 5. Update act-hero-meta
    content = re.sub(
        r'<p class="act-hero-meta">.*?</p>', 
        f'<p class="act-hero-meta">\n        The documentary stage below stitches the ACT {meta["num"]} chapter film. Then walk the evidence\n        scene-by-scene. Atmosphere is not the proof; primary sources are.\n      </p>', 
        content, flags=re.DOTALL
    )
    
    # 6. Update act-hero-links
    content = re.sub(
        r'<a class="media-more" href="#cinema-stage">Enter the stage →</a>', 
        r'<a class="media-more" href="#doc-stage">Play chapter film →</a>\n        <a class="media-more" href="#cinema-stage">Enter the evidence stage →</a>', 
        content
    )
    
    # 7. Replace figure with doc-stage outside section
    # First, delete existing figure and any rogue doc-stage
    content = re.sub(r'<figure class="media-card glass act-hero-still">.*?</figure>\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'<section class="doc-stage".*?</section>\s*', '', content, flags=re.DOTALL)
    
    # Add doc-stage after act-hero section
    doc_stage = f'''
  <!-- PRIMARY DOCUMENTARY — stitched chapter film (hybrid-ready) -->
  <section class="doc-stage" id="doc-stage"
           data-doc-video="media/film/docs/{meta['ch']}"
           data-doc-poster="media/landing/parliament_ice.jpg"
           data-doc-title="{meta['title']}"
           data-doc-caption="Chapter film for this act. Atmosphere is not the proof — primary sources are in the evidence stage below."
           data-doc-loop
           data-force-play
           aria-label="{meta['title']}"></section>
'''
    # We find the end of the act-hero section by looking for </section> followed by either <!-- CINEMA STAGE or <section class="act-stage
    content = re.sub(r'(</section>)\s*(<!-- CINEMA STAGE|<section class="act-stage|<!-- EVIDENCE GALLERY)', r'\1\n' + doc_stage + r'\2', content)

    # 8. Update kick
    content = re.sub(r'<span class="kick">Cinema stage', '<span class="kick">Evidence stage', content)
    
    # 9. Add JS
    if 'tenet5-doc-player.js' not in content:
        content = content.replace('<script src="js/tenet5-unified-walkthrough.js?v=5"></script>', '<script src="js/tenet5-doc-player.js?v=1"></script>\n<script src="js/tenet5-unified-walkthrough.js?v=5"></script>')
    
    open('E:/TENET-5.github.io/' + fname, 'w', encoding='utf-8').write(content)
