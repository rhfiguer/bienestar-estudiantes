import os
from PIL import Image

INPUT_PATH = "/Users/rodrigofigueroareyes/.gemini/antigravity/brain/f532b71c-3dee-49ce-b0ff-c0228964928e/uploaded_media_1769948738385.jpg"
OUTPUT_DIR = "assets/images"
PUBLIC_DIR = "public"

def process():
    print(f"Processing manual icon from {INPUT_PATH}...")
    img = Image.open(INPUT_PATH).convert("RGBA")
    
    print(f"Original Size: {img.size}")
    
    # Target size is 1024x1024
    if img.size != (1024, 1024):
        print("Resizing to 1024x1024...")
        img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    # Save outputs
    outputs = [
        (os.path.join(OUTPUT_DIR, "icon.png"), (1024, 1024)),
        (os.path.join(OUTPUT_DIR, "adaptive-icon.png"), (1024, 1024)),
        (os.path.join(OUTPUT_DIR, "splash-icon.png"), (1024, 1024)),
        (os.path.join(OUTPUT_DIR, "favicon.png"), (48, 48)),
        (os.path.join(PUBLIC_DIR, "icon.png"), (1024, 1024)),
        (os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), (1024, 1024)),
    ]
    
    for path, size in outputs:
        if size != (1024, 1024):
            final_img = img.resize(size, Image.Resampling.LANCZOS)
        else:
            final_img = img
            
        final_img.save(path)
        print(f"Saved icon to {path} ({size})")

if __name__ == "__main__":
    process()
