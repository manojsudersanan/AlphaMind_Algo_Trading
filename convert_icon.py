from PIL import Image

png_path = r"C:\Users\manoj\.gemini\antigravity\brain\84d92c40-e790-4df3-9f61-b729f9ac88f6\alphamind_banana_icon_1777431745661.png"
ico_path = r"c:\Manoj\Projects\Auto Stock Cash Generator\icon.ico"

img = Image.open(png_path)
img.save(ico_path, format="ICO", sizes=[(256, 256)])
print("Icon converted successfully.")
