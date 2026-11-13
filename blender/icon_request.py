# Requests · just the "+" (12 Nov review): a round frosted glass disc standing on the floor, the spectrum lit inside
# it (Cobalt bottom-left → Ember top-right, as on the report sheet), an Ember plus lit in its face.
# The same studio, lean and turn as the report sheet, so the empty pages read as one family.
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg

out, quality = sg.args()
sg.reset()

D, T = 1.6, 0.44                   # disc: diameter, glass thickness
FRONT = T / 2

disc = sg.slab("Disc", sg.rounded_rect(D, D, D / 2), T, 0.19, res=16)
disc.data.materials.append(sg.frosted_glass())

# soft inner light at the back of the glass
inner = sg.slab("InnerLight", sg.rounded_rect(D - 0.24, D - 0.24, (D - 0.24) / 2), 0.03, 0.012, res=8)
inner.location.z = -FRONT + 0.08
inner.data.materials.append(sg.spectrum_light(direction=(0.75, 1, 0), span=1.1, strength=1.3, fade=0.3, edge=0.32, base=0.1, ends=0.9))

# the plus, Ember, lit, standing a little proud of the face
ember = sg.lit("PlusEmber", sg.EMBER, 1.8, 0.4)
bars = []
for k, (w, h) in enumerate(((0.74, 0.19), (0.19, 0.74))):
    b = sg.slab(f"Plus{k}", sg.rounded_rect(w, h, 0.095), 0.09, 0.04, res=8)
    b.location = (0, 0, FRONT - 0.02)
    b.data.materials.append(ember)
    bars.append(b)

parts = [disc, inner, *bars]
sg.no_shadow(*parts)

# stand the disc up, lean it back a touch, turned only a little so the plus sits in its middle (12 Nov, review)
LEAN, YAW = 6, -12
rx = math.radians(90 - LEAN)
base_z = D / 2 * math.sin(rx) + FRONT * math.cos(rx)
sg.group("Request", parts, location=(0, 0, base_z), rotation=(90 - LEAN, 0, YAW))

sg.studio(shadow=(0.0, 0.05, 0.8, 0.3, 0.22, YAW), target_z=0.9)
sg.render(out, "request", quality)
