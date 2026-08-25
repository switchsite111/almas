import os

folder = r"c:\Users\ARDORTIMUR\Downloads\сайт алмас"
print("Root files in 'c:\\Users\\ARDORTIMUR\\Downloads\\сайт алмас':")
for f in os.listdir(folder):
    print(" -", f)
