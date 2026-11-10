"""Blender render on exact Sand → web image with alpha (colour-to-alpha against Sand), cropped to what's drawn.
On Sand it composites back to the render exactly; on lighter cards it sits without a box.
python3 blender/to_web.py blender/renders/reports.png public/brand/glass/reports.webp 560"""
import sys
from PIL import Image, ImageFilter

SAND = (248, 246, 242)
src, dst, height = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGB")
im = im.resize((1024, 1024), Image.LANCZOS)

B = [s / 255 for s in SAND]; out = []
for (r, g, b) in im.getdata():
    P = (r / 255, g / 255, b / 255); a = 0.0
    for p, bc in zip(P, B):
        if abs(p - bc) <= 5 / 255: continue  # render noise around Sand, not paint
        a = max(a, (p - bc) / (1 - bc) if p > bc else (bc - p) / bc if p < bc else 0.0)
    if a <= 0.004: out.append((0, 0, 0, 0)); continue
    c = [min(max((p - bc) / a + bc, 0.0), 1.0) for p, bc in zip(P, B)]
    out.append((round(c[0] * 255), round(c[1] * 255), round(c[2] * 255), round(min(a, 1.0) * 255)))
res = Image.new("RGBA", im.size); res.putdata(out)
# crop to where the alpha says something is drawn, keeping a little air
x0, y0, x1, y1 = res.getchannel("A").filter(ImageFilter.MinFilter(7)).point(lambda v: 255 if v > 34 else 0).getbbox()  # lone noisy pixels don't count
pad = 24; box = (max(x0 - pad, 0), max(y0 - pad, 0), min(x1 + pad, res.width), min(y1 + pad, res.height))
res = res.crop(box); res = res.resize((round(res.width * height / res.height), height), Image.LANCZOS)
# fade the glow out toward the edges so the crop never shows as a line
w, h = res.size; f = 0.12; A = res.getchannel('A'); ad = list(A.getdata())
for y in range(h):
    for x in range(w):
        k = min(x / (w * f), (w - 1 - x) / (w * f), y / (h * f), (h - 1 - y) / (h * f), 1.0)
        if k < 1: ad[y * w + x] = round(ad[y * w + x] * k * k * (3 - 2 * k))
A.putdata(ad); res.putalpha(A)
res.save(dst, quality=92, method=6) if dst.endswith(".webp") else res.save(dst)
print("saved", dst, res.size, "from crop", box)
