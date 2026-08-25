from PIL import Image
import os

input_path = r"C:\Users\ARDORTIMUR\.gemini\antigravity-ide\brain\e534905d-9cdb-494d-ac15-be6f5dcf0cc6\media__1785135060350.jpg"

if not os.path.exists(input_path):
    print("File not found at input_path, trying fallback media__1785108884787.jpg")
    input_path = r"C:\Users\ARDORTIMUR\.gemini\antigravity-ide\brain\e534905d-9cdb-494d-ac15-be6f5dcf0cc6\media__1785108884787.jpg"

img = Image.open(input_path).convert("RGBA")
datas = img.getdata()

newData = []
for item in datas:
    r, g, b, a = item
    # Threshold for black background removal
    if r < 32 and g < 32 and b < 32:
        newData.append((0, 0, 0, 0))
    else:
        # Boost brightness slightly if needed, preserve alpha
        newData.append((r, g, b, 255))

img.putdata(newData)

# Save to target directories
target_dirs = [
    r"c:\Users\ARDORTIMUR\Downloads\сайт алмас",
    r"c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)",
    r"c:\Users\ARDORTIMUR\Downloads\алмас"
]

for d in target_dirs:
    if os.path.exists(d):
        p1 = os.path.join(d, "almas_user_logo_transparent.png")
        p2 = os.path.join(d, "almas_logo.png")
        p3 = os.path.join(d, "almas_official_logo.png")
        img.save(p1, "PNG")
        img.save(p2, "PNG")
        img.save(p3, "PNG")
        print(f"Saved processed logo to: {d}")

print("Logo background removal and saving completed successfully!")
