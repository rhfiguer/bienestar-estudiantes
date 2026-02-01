import os
from PIL import Image, ImageChops

INPUT_PATH = "/Users/rodrigofigueroareyes/.gemini/antigravity/brain/f532b71c-3dee-49ce-b0ff-c0228964928e/uploaded_media_1769865100578.png"
OUTPUT_DIR = "assets/images"
PUBLIC_DIR = "public"
TARGET_COLOR = (251, 251, 251, 255) # #FBFBFB

def smart_crop(img):
    print(f"Image Extrema: {img.getextrema()}")
    
    # Convert to RGB to ensure getbbox sees pixel differences even if alpha diff is 0
    rgb_img = img.convert("RGB")
    
    # Detect bg from top-left corner
    bg_color = rgb_img.getpixel((0, 0))
    print(f"Detected Background Color (0,0): {bg_color}")
    
    # Create a background image of the same color
    bg = Image.new("RGB", rgb_img.size, bg_color)
    
    diff = ImageChops.difference(rgb_img, bg)
    
    # Optional: Increase tolerance slightly to ignore compression noise
    diff = ImageChops.add(diff, diff, 2.0, -10)
    
    bbox = diff.getbbox()
    return bbox

def process():
    print(f"Processing {INPUT_PATH}...")
    img = Image.open(INPUT_PATH).convert("RGBA")
    
    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:
        resample = Image.LANCZOS

    # 1. Calculate Crop
    bbox = smart_crop(img)
    if not bbox:
        print("Error: Could not detect content bounding box (image might be fully white?)")
        return

    print(f"Original Size: {img.size}")
    print(f"Detected Content Bounds: {bbox}")
    
    content = img.crop(bbox)
    print(f"Content Size: {content.size}")

    # 2. Resize to fill % of target
    # iOS safe area is roughly circle diameter. 
    # For a 1024x1024 square, we want the logo to be significant.
    # We target the logo being approx 70% of the total width/height to be safe but large.
    TARGET_SIZE = 1024
    LOGO_PCT = 0.70  # Aggressive but safe
    
    target_logo_dim = int(TARGET_SIZE * LOGO_PCT)
    
    # Resize content maintaining aspect ratio
    content.thumbnail((target_logo_dim, target_logo_dim), resample)
    
    # 3. Create Canvas
    new_icon = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), TARGET_COLOR)
    
    # 4. Paste centered
    x = (TARGET_SIZE - content.width) // 2
    y = (TARGET_SIZE - content.height) // 2
    new_icon.paste(content, (x, y), content if content.mode == 'RGBA' else None)
    
    # 5. Save outputs
    outputs = [
        (os.path.join(OUTPUT_DIR, "icon.png"), (1024, 1024)),
        (os.path.join(OUTPUT_DIR, "adaptive-icon.png"), (1024, 1024)),
        (os.path.join(OUTPUT_DIR, "splash-icon.png"), (1024, 1024)),
        (os.path.join(OUTPUT_DIR, "favicon.png"), (48, 48)),
        (os.path.join(PUBLIC_DIR, "icon.png"), (1024, 1024)),
        (os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), (1024, 1024)),
    ]
    
    for path, size in outputs:
        # Resize if target is different from master 1024
        if size != (1024, 1024):
            final_img = new_icon.resize(size, resample)
        else:
            final_img = new_icon
            
        final_img.save(path)
        print(f"Saved optimized icon to {path} ({size})")

if __name__ == "__main__":
    process()
