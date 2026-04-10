import os
from PIL import Image, ImageDraw, ImageFont

img_dir = "E:/TENET-5.github.io/img"
os.makedirs(img_dir, exist_ok=True)

# 1. Logo Sprite (Shine + Pulse)
frames = 30
w, h = 180, 50
logo_sheet = Image.new('RGBA', (w * frames, h), (0, 0, 0, 0))

try:
    font = ImageFont.truetype("arialbd.ttf", 28)
    font_sub = ImageFont.truetype("arialbd.ttf", 18)
except:
    font = ImageFont.load_default()
    font_sub = ImageFont.load_default()

for i in range(frames):
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    progress = i / float(frames)
    
    # Base red
    d.text((10, 10), "TENET", font=font, fill=(196, 30, 58, 180))
    d.text((105, 20), "5", font=font_sub, fill=(196, 30, 58, 180))
    
    # Shine calculation
    shine_pos = -40 + (progress * 200)
    
    # Draw bright overlay with alpha mask based on proximity to shine_pos
    alpha_main = int(max(0, 255 - abs(50 - shine_pos)*3))
    alpha_sub = int(max(0, 255 - abs(110 - shine_pos)*3))
    
    d.text((10, 10), "TENET", font=font, fill=(255, 80, 100, alpha_main))
    d.text((105, 20), "5", font=font_sub, fill=(255, 80, 100, alpha_sub))
    
    logo_sheet.paste(img, (i * w, 0))

logo_sheet.save(os.path.join(img_dir, "logo_sprite.png"))

# 2. Hover Tactical Bracket Sprite
# 15 frames of brackets drawing in 
b_frames = 15
bw, bh = 40, 40
bracket_sheet = Image.new('RGBA', (bw * b_frames, bh), (0, 0, 0, 0))
for i in range(b_frames):
    img = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    prog = i / float(b_frames - 1)
    
    line_len = int(10 * prog)
    # top left
    d.line([(0, 10-line_len), (0,0), (line_len, 0)], fill=(196, 30, 58, 255), width=2)
    # bottom right
    d.line([(bw-1, bh-10+line_len), (bw-1,bh-1), (bw-1-line_len, bh-1)], fill=(196, 30, 58, 255), width=2)
    
    bracket_sheet.paste(img, (i * bw, 0))

bracket_sheet.save(os.path.join(img_dir, "hover_bracket_sprite.png"))

print("Sprites generated successfully.")
