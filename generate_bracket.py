import os
from PIL import Image, ImageDraw

img_dir = "E:/TENET-5.github.io/img"

# 2. Hover Tactical Bracket Sprite (Top-Left Single Corner)
b_frames = 15
bw, bh = 20, 20
bracket_sheet = Image.new('RGBA', (bw * b_frames, bh), (0, 0, 0, 0))
for i in range(b_frames):
    img = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    prog = i / float(b_frames - 1)
    
    line_len = int(18 * prog)
    # top left
    d.line([(0, 18-line_len), (0,0), (line_len, 0)], fill=(196, 30, 58, 255), width=2)
    
    bracket_sheet.paste(img, (i * bw, 0))

bracket_sheet.save(os.path.join(img_dir, "hover_bracket_sprite.png"))
print("Bracket sprite updated.")
