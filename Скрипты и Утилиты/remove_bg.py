from PIL import Image

try:
    img = Image.open('almas_user_logo.jpg').convert('RGBA')
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        # If the pixel is near black (background threshold)
        if r < 35 and g < 35 and b < 35:
            newData.append((0, 0, 0, 0))  # Completely transparent
        else:
            newData.append((r, g, b, 255))  # Keep logo sharp

    img.putdata(newData)
    img.save('almas_user_logo_transparent.png', 'PNG')
    print("SUCCESS: Logo background removed!")
except Exception as e:
    print("ERROR:", e)
