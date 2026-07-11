import pathlib
import re

p = pathlib.Path(r"E:\TENET-5.github.io\maid-accountability.html")
content = p.read_text(encoding="utf-8")
content = re.sub(
    r'<video class="act-hero-video".*?</video>',
    '<img src="media/generated/maid_investigation.png" alt="MAID single veiled still" style="width:100%; height:100%; object-fit:cover;">',
    content,
    flags=re.DOTALL
)
content = content.replace('<div class="media-frame is-cine">', '<div class="media-frame">')
content = content.replace('<span class="act-film-live" data-state="wait" aria-hidden="true">Film ready</span>', '')
p.write_text(content, encoding="utf-8")
print("Replaced with regex.")
