# Speech-bubble outlines for the chat icon variants (12 Nov): a closed CCW outline through a polygon with every corner
# rounded by its own radius, convex or concave alike, so a bubble and its tail are one piece of glass.
import math


def fillet(poly, radii, n=14):
    out = []
    k = len(poly)
    for i in range(k):
        (px, py), (vx, vy), (nx, ny) = poly[i - 1], poly[i], poly[(i + 1) % k]
        r = radii[i]
        if r <= 0:
            out.append((vx, vy))
            continue
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
        da = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi
        for j in range(n + 1):
            t = a1 + da * j / n
            out.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return out


def rect_bubble(W, H, R, tail, inset=0.0, flip=False):
    """A rounded rectangle whose lower-left corner (lower-right when flipped) runs down to a soft tail."""
    w, h, i = W / 2 - inset, H / 2 - inset, inset
    poly = [(w, h), (-w, h), (-w, -h - tail + i * 1.6), (-w + 0.5 - i * 0.2, -h), (w, -h)]
    radii = [max(R - i, 0.06), max(R - i, 0.06), max(0.15 - i * 0.6, 0.05), 0.22, max(R - i, 0.06)]
    if flip:
        poly = [(-x, y) for x, y in reversed(poly)]
        radii = list(reversed(radii))
    return fillet(poly, radii)


def round_bubble(Rad, tail=0.42, at=232, spread=(24, 18), inset=0.0, segs=96):
    """A circle with a soft tail drawn out of its rim at angle `at` (degrees), the rim leaving it `spread` degrees
    either side."""
    r = Rad - inset
    a0, a1 = at - spread[0], at + spread[1]
    poly, radii = [], []
    for k in range(segs):
        ang = 360 * k / segs
        if a0 - 8 < ang < a1 + 8:  # room for the fillets at the junctions
            continue
        poly.append((r * math.cos(math.radians(ang)), r * math.sin(math.radians(ang))))
        radii.append(0)
    # rim junctions and tip, inserted in order around the circle
    j0 = (r * math.cos(math.radians(a0)), r * math.sin(math.radians(a0)))
    j1 = (r * math.cos(math.radians(a1)), r * math.sin(math.radians(a1)))
    tr = Rad + tail - inset * 1.6
    tip_ang = math.radians(at + 6)
    tip = (tr * math.cos(tip_ang), tr * math.sin(tip_ang))
    idx = next(k for k, (x, y) in enumerate(poly) if (math.degrees(math.atan2(y, x)) % 360) > a1)
    poly[idx:idx] = [j0, tip, j1]
    radii[idx:idx] = [0.14, max(0.15 - inset * 0.5, 0.06), 0.2]
    return fillet(poly, radii)
