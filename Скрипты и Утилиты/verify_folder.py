import os

folder = r"c:\Users\ARDORTIMUR\Downloads\сайт алмас"
if os.path.exists(folder):
    files = os.listdir(folder)
    print("Files in 'c:\\Users\\ARDORTIMUR\\Downloads\\сайт алмас':")
    for f in files:
        print(" -", f)
else:
    print("Folder does not exist!")
