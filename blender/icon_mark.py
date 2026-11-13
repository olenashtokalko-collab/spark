# The company's mark as a 3D glass tile (13 Nov, review: "glassier, more 3D, more angular"): a squarer slab of
# frosted glass, crisp bevelled edges, the spectrum lit inside it (Cobalt from the top left to Ember at the bottom
# right), facing the camera so the page can set the company's initial on it in its own face. Same studio as the
# family of icons.
#   Blender -b --factory-startup -P blender/icon_mark.py -- blender/renders final
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg

out, quality = sg.args()
sg.reset()

W = H = 1.3
T = 0.42
FRONT = T / 2
body = sg.slab("Body", sg.rounded_rect(W, H, 0.2), T, 0.07, res=6)  # small corners, a crisp bevel: angular
body.data.materials.append(sg.frosted_glass("TileGlass", rough=0.22, tint=0.14))

inner = sg.slab("InnerLight", sg.rounded_rect(W - 0.26, H - 0.26, 0.12), 0.03, 0.012, res=6)
inner.location.z = -FRONT + 0.1
STOPS = ((0.0, sg.COBALT), (0.35, sg.lin("4A46F2")), (0.6, sg.VIOLET), (0.82, sg.lin("FF4F9A")), (1.0, sg.EMBER))
inner.data.materials.append(sg.spectrum_light(direction=(1, -1, 0), span=1.25, strength=1.25, fade=0.32, edge=0.3, base=0.12, ends=0.9, stops=STOPS))

parts = [body, inner]
sg.no_shadow(*parts)
LEAN, YAW = 4, -10
rx = math.radians(90 - LEAN)
base_z = H / 2 * math.sin(rx) + FRONT * math.cos(rx)
sg.group("Mark", parts, location=(0, 0, base_z), rotation=(90 - LEAN, 0, YAW))
sg.studio(shadow=(0.0, 0.05, 0.8, 0.28, 0.22, YAW), target_z=0.75)
sg.render(out, "mark", quality)
