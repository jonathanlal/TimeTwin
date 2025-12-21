from PIL import Image
import os

try:
    # Use absolute paths or check relative to CWD
    src = "apps/mobile/assets/icon-ouroboros.png"
    dst = "apps/mobile/assets/icon-ouroboros-safe.png"
    
    print(f"Reading {src}...")
    img = Image.open(src)
    print(f"Format: {img.format}, Mode: {img.mode}")
    
    # Convert to RGBA to ensure standard PNG
    img = img.convert("RGBA")
    
    # Save as non-optimized standard PNG
    img.save(dst, "PNG", optimize=False, compress_level=0)
    print(f"Saved to {dst}")
except Exception as e:
    print(f"Failed: {e}")
