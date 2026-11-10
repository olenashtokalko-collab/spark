# Reports · a single frosted glass report sheet: rounded corners, embossed data lines, a small lit bar chart inside.
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg

out, quality = sg.args()
sg.reset()

W, H, T = 1.6, 2.1, 0.32          # sheet: width, height, glass thickness
FRONT = T / 2
LEFT = -W / 2 + 0.24              # text margin

sheet = sg.slab("Sheet", sg.rounded_rect(W, H, 0.26), T, 0.1, res=12)
sheet.data.materials.append(sg.frosted_glass())

# soft inner light at the back of the glass: Cobalt bottom-left → Ember top-right
inner = sg.slab("InnerLight", sg.rounded_rect(W - 0.2, H - 0.2, 0.2), 0.03, 0.012, res=4)
inner.location.z = -FRONT + 0.06
inner.data.materials.append(sg.spectrum_light(direction=(0.75, 1, 0), span=1.25, strength=1.3, fade=0.3, edge=0.32, base=0.1, ends=0.9))

# embossed data lines: a heading and three lines of text, raised frosted glass
emboss = sg.frosted_glass("EmbossGlass", rough=0.14, tint=0.1)
lines = []
for i, (w, h, y) in enumerate(((0.62, 0.11, 0.70), (1.08, 0.065, 0.49), (0.94, 0.065, 0.35), (0.7, 0.065, 0.21))):
    ln = sg.slab(f"Line{i}", sg.pill(w, h), 0.06, 0.028, res=6)
    ln.location = (LEFT + w / 2, y, FRONT - 0.006)
    ln.data.materials.append(emboss); lines.append(ln)

# small abstract chart: four raised glass bars, each lit from a core inside; the tallest carries the Ember spark
white, ember = sg.lit("ChartWhite", (1, 1, 1, 1), 1.4, 0.4), sg.lit("ChartEmber", sg.EMBER, 1.6, 0.4)
bars = []
for i, h in enumerate((0.24, 0.38, 0.3, 0.56)):
    x, y = LEFT + 0.08 + i * 0.235, -0.8 + h / 2
    b = sg.slab(f"Bar{i}", sg.rounded_rect(0.16, h, 0.08), 0.11, 0.05, res=8)
    b.location = (x, y, FRONT - 0.004)
    b.data.materials.append(emboss)
    core = sg.slab(f"BarCore{i}", sg.rounded_rect(0.075, h - 0.085, 0.037), 0.035, 0.016, res=4)
    core.location = (x, y, FRONT + 0.004)
    core.data.materials.append(ember if i == 3 else white)
    bars += [b, core]

sg.no_shadow(sheet, inner, *lines, *bars)

# stand the sheet up, lean it back a little, turn it three-quarters
LEAN, YAW = 10, -30
rx = math.radians(90 - LEAN)
base_z = H / 2 * math.sin(rx) + FRONT * math.cos(rx)
sg.group("Report", [sheet, inner, *lines, *bars], location=(0, 0, base_z), rotation=(90 - LEAN, 0, YAW))

sg.studio(shadow=(0.0, 0.06, 0.95, 0.3, 0.22, YAW), target_z=1.0)
sg.render(out, "reports", quality)
