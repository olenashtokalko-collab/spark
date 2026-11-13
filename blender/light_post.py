"""The light spray's render softened into sprayed light: the fine rays kept a little sharp at the point, a wide glow
laid over them, so it reads as light through air, as on sparkstudios.ae's hero. Keeps the alpha; blurs in
premultiplied colour, so no grey rims where the light meets the clear film.
python3 blender/light_post.py blender/renders/light_spray.png public/brand/glass/light-spray.webp 1200 [lift keep]"""
import sys
from PIL import Image, ImageChops, ImageFilter, ImageMath

src, dst, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGBA")
r, g, b, a = im.split()
pm = [ImageChops.multiply(c, a) for c in (r, g, b)]  # colour × alpha


def blurred(radius, k):
    f = ImageFilter.GaussianBlur(radius)
    return [c.filter(f) for c in pm], a.filter(f), k


layers = [blurred(im.width / 22, 0.8), blurred(im.width / 60, 0.9), blurred(im.width / 400, 0.75)]
# "over" in premultiplied terms, one layer at a time: C = Cl·k + C·(1 − Al·k), A = Al·k + A·(1 − Al·k)
C = [Image.new("L", im.size, 0) for _ in range(3)]
A = Image.new("L", im.size, 0)
for cs, al, k in layers:
    ak = al.point(lambda v, k=k: round(v * k))
    inv = ak.point(lambda v: 255 - v)
    C = [ImageChops.add(c.point(lambda v, k=k: round(v * k)), ImageChops.multiply(C0, inv)) for c, C0 in zip(cs, C)]
    A = ImageChops.add(ak, ImageChops.multiply(A, inv))
# back to straight colour
rgb = [ImageMath.lambda_eval(lambda e: e["convert"](e["min"](e["c"] * 255 / e["max"](e["a"], 1), 255), "L"), c=c, a=A) for c in C]
# pastel (13 Nov, review: Blender 2's broad rays read dark next to Blender's fine ones): optional 4th and 5th args, how
# far each colour is lifted toward white and how much of its alpha is kept, e.g. 0.3 0.7
if len(sys.argv) > 5:
    lift, keep = float(sys.argv[4]), float(sys.argv[5])
    rgb = [c.point(lambda v: round(v + (255 - v) * lift)) for c in rgb]
    A = A.point(lambda v: round(v * keep))
out = Image.merge("RGBA", (*rgb, A))
box = A.point(lambda v: 255 if v > 6 else 0).getbbox()
out = out.crop(box)
print("crop", box)  # to find where a point of the render lands in the output
out = out.resize((width, round(out.height * width / out.width)), Image.LANCZOS)
out.save(dst, "WEBP", quality=88)
print(dst, out.size)
