import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_almas_logo():
    size = (512, 512)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = 256, 230
    
    # Outer Glow Ring
    for r in range(180, 140, -2):
        alpha = int(40 * (1 - (180 - r) / 40))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(56, 189, 248, alpha), width=3)
    
    # Diamond Gem Vertices
    # Top flat facet, middle points, bottom tip
    top_left = (cx - 70, cy - 90)
    top_right = (cx + 70, cy - 90)
    mid_left = (cx - 130, cy - 20)
    mid_right = (cx + 130, cy - 20)
    bottom = (cx, cy + 120)
    
    # Draw Diamond Facets
    # Top trapezoid facets
    draw.polygon([top_left, (cx, cy - 90), (cx - 35, cy - 20), mid_left], fill=(59, 130, 246, 220), outline=(167, 200, 255, 255))
    draw.polygon([(cx, cy - 90), top_right, mid_right, (cx + 35, cy - 20)], fill=(14, 165, 233, 220), outline=(167, 200, 255, 255))
    draw.polygon([top_left, top_right, (cx + 35, cy - 20), (cx - 35, cy - 20)], fill=(125, 211, 252, 240), outline=(255, 255, 255, 255))
    
    # Bottom triangle facets
    draw.polygon([mid_left, (cx - 35, cy - 20), bottom], fill=(29, 78, 216, 230), outline=(167, 200, 255, 255))
    draw.polygon([(cx - 35, cy - 20), (cx + 35, cy - 20), bottom], fill=(56, 189, 248, 250), outline=(255, 255, 255, 255))
    draw.polygon([(cx + 35, cy - 20), mid_right, bottom], fill=(3, 105, 161, 230), outline=(167, 200, 255, 255))
    
    # Inner Crystal Refractions
    draw.line([(cx, cy - 90), (cx, cy + 120)], fill=(255, 255, 255, 180), width=3)
    draw.line([(cx - 70, cy - 90), (cx + 70, cy - 90)], fill=(255, 255, 255, 220), width=3)
    draw.line([mid_left, mid_right], fill=(255, 255, 255, 200), width=3)

    # Text ALMAS below diamond
    try:
        font = ImageFont.truetype("arial.ttf", 46)
    except:
        font = ImageFont.load_default()
        
    text = "АЛМАС"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    
    tx = (512 - tw) // 2
    ty = cy + 145
    
    # Text Glow
    for offset in range(1, 4):
        draw.text((tx - offset, ty), text, font=font, fill=(56, 189, 248, 100))
        draw.text((tx + offset, ty), text, font=font, fill=(56, 189, 248, 100))
        draw.text((tx, ty - offset), text, font=font, fill=(56, 189, 248, 100))
        draw.text((tx, ty + offset), text, font=font, fill=(56, 189, 248, 100))
        
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    img.save("almas_user_logo_transparent.png", "PNG")
    print("ALMAS logo created successfully!")

if __name__ == "__main__":
    create_almas_logo()
