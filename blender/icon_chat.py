# Chats · one frosted glass speech bubble (12 Nov): a rounded bubble whose lower-left corner runs down to a soft tail, the spectrum
# lit inside it (Cobalt bottom-left → Ember top-right, as on the report sheet), two embossed lines of a message and
# an Ember dot lit at the end of the second, as the drawn chat icon had. Same studio, lean and turn as the family.
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import spark_glass as sg

out, quality = sg.args()
sg.reset()

W, H, R, T = 2.0, 1.36, 0.44, 0.34   # bubble: width, height, corner radius, glass thickness
TAIL = 0.38                           # how far the tail reaches below the bubble
FRONT = T / 2
LEFT = -W / 2 + 0.3


def fillet(poly, radii, n=14):
    """A closed CCW outline through `poly`, each corner rounded by its radius (convex or concave alike)."""
    out = []
    k = len(poly)
    for i in range(k):
        (px, py), (vx, vy), (nx, ny) = poly[i - 1], poly[i], poly[(i + 1) % k]
        r = radii[i]
        a = (px - vx, py - vy); b = (nx - vx, ny - vy)
        la, lb = math.hypot(*a), math.hypot(*b)
        a = (a[0] / la, a[1] / la); b = (b[0] / lb, b[1] / lb)
        half = math.acos(max(-1.0, min(1.0, a[0] * b[0] + a[1] * b[1]))) / 2
        d = r / math.tan(half)
        bis = (a[0] + b[0], a[1] + b[1]); lbis = math.hypot(*bis)
        bis = (bis[0] / lbis, bis[1] / lbis)
        cx, cy = vx + bis[0] * r / math.sin(half), vy + bis[1] * r / math.sin(half)
        t1 = (vx + a[0] * d, vy + a[1] * d); t2 = (vx + b[0] * d, vy + b[1] * d)
        a1 = math.atan2(t1[1] - cy, t1[0] - cx); a2 = math.atan2(t2[1] - cy, t2[0] - cx)
        da = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi  # the short way round
        for j in range(n + 1):
            t = a1 + da * j / n
            out.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return out


def bubble(inset=0.0):
    """One piece of glass (12 Nov, review): the tail is the bubble's own lower-left corner drawn down to a soft
    point, its left side running straight on from the bubble's, its other side curving back into the bottom edge."""
    w, h, i = W / 2 - inset, H / 2 - inset, inset
    poly = [(w, h), (-w, h), (-w, -h - TAIL + i * 1.6), (-w + 0.52 - i * 0.2, -h), (w, -h)]
    return fillet(poly, [max(R - i, 0.06), max(R - i, 0.06), max(0.15 - i * 0.6, 0.05), 0.24, max(R - i, 0.06)])


body = sg.slab("Bubble", bubble(), T, 0.13, res=12)
body.data.materials.append(sg.frosted_glass())

# soft inner light at the back of the glass, the same shape a little inside it, into the tail too
inner = sg.slab("InnerLight", bubble(0.12), 0.03, 0.012, res=6)
inner.location.z = -FRONT + 0.07
inner.data.materials.append(sg.spectrum_light(direction=(0.75, 1, 0), span=1.2, strength=1.3, fade=0.3, edge=0.32, base=0.1, ends=0.9))

# a message's two lines, raised frosted glass, and an Ember dot lit at the end of the second
emboss = sg.frosted_glass("EmbossGlass", rough=0.14, tint=0.1)
lines = []
for i, (w, h, y) in enumerate(((1.12, 0.12, 0.17), (0.7, 0.12, -0.13))):
    ln = sg.slab(f"Line{i}", sg.pill(w, h), 0.07, 0.03, res=6)
    ln.location = (LEFT + w / 2, y, FRONT - 0.006)
    ln.data.materials.append(emboss)
    lines.append(ln)
dot = sg.slab("Dot", sg.rounded_rect(0.2, 0.2, 0.1), 0.1, 0.045, res=8)
dot.location = (LEFT + 0.7 + 0.26, -0.13, FRONT - 0.004)
dot.data.materials.append(sg.lit("DotEmber", sg.EMBER, 1.8, 0.4))

parts = [body, inner, *lines, dot]
sg.no_shadow(*parts)

# stand it up on its tail, lean it back a little, turn it three-quarters (as the report sheet)
LEAN, YAW = 10, -26
rx = math.radians(90 - LEAN)
base_z = (H / 2 + TAIL * 0.9) * math.sin(rx) + FRONT * math.cos(rx)
sg.group("Chat", parts, location=(0, 0, base_z), rotation=(90 - LEAN, 0, YAW))

sg.studio(shadow=(0.0, 0.05, 1.0, 0.3, 0.22, YAW), target_z=0.95)
sg.render(out, "chat", quality)
