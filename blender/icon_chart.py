# Reports (alternative) · a glass bar chart: four rising columns of coloured glass, Cobalt → violet → magenta → Ember,
# each lit from a core inside, standing on a frosted glass base. The colours are the S·P·A·R·K cubes' (p.11).
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg

out, quality = sg.args()
sg.reset()

BASE_W, BASE_D, BASE_T = 2.35, 0.95, 0.16
base = sg.slab("Base", sg.rounded_rect(BASE_W, BASE_D, 0.3), BASE_T, 0.06, res=10)
base.location.z = BASE_T / 2
base.data.materials.append(sg.frosted_glass())

COL, GAP = 0.4, 0.13
bars = []
for i, (h, col) in enumerate(((0.62, sg.COBALT), (0.98, sg.VIOLET), (1.3, sg.MAGENTA), (1.7, sg.EMBER))):
    x = (i - 1.5) * (COL + GAP)
    b = sg.slab(f"Bar{i}", sg.rounded_rect(COL, COL, 0.14), h, 0.1, res=10)
    b.location = (x, 0, BASE_T + h / 2 - 0.01)
    b.data.materials.append(sg.tinted_glass(f"BarGlass{i}", col, mix=0.28, rough=0.3))
    core = sg.slab(f"BarCore{i}", sg.rounded_rect(COL * 0.72, COL * 0.72, 0.11), h - 0.14, 0.09, res=8)
    core.location = b.location.copy()
    core.data.materials.append(sg.lit(f"BarLight{i}", col, 1.15, 0.65))
    bars += [b, core]

sg.no_shadow(base, *bars)
YAW = -28
sg.group("Chart", [base, *bars], location=(-0.08, 0, 0), rotation=(0, 0, YAW))

sg.studio(shadow=(0.0, 0.0, 1.25, 0.55, 0.2, YAW), target_z=1.0)
sg.render(out, "chart", quality)
