# Locked report · a tiny glass padlock (12 Nov, review): a frosted glass body with the spectrum lit inside it, a clear
# glass shackle, an Ember keyhole. Few, bold shapes, so it still reads at 28 px. Same studio, lean and turn as the family.
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import spark_glass as sg

out, quality = sg.args()
sg.reset()

W, H, T = 1.36, 1.08, 0.5          # body: width, height, thickness
FRONT = T / 2
SR, SW = 0.42, 0.13                 # shackle: radius of its arch, tube radius

body = sg.slab("Body", sg.rounded_rect(W, H, 0.3), T, 0.2, res=14)
body.data.materials.append(sg.frosted_glass())

inner = sg.slab("InnerLight", sg.rounded_rect(W - 0.24, H - 0.24, 0.2), 0.03, 0.012, res=8)
inner.location.z = -FRONT + 0.09
# more Cobalt than the family's spectrum (12 Nov, review: "more blue, the brand's colour, less violet")
BLUE = ((0.0, sg.COBALT), (0.5, sg.lin("2F49E6")), (0.82, sg.lin("4A3FE0")), (1.0, sg.VIOLET))
inner.data.materials.append(sg.spectrum_light(direction=(0.75, 1, 0), span=1.0, strength=1.35, fade=0.3, edge=0.32, base=0.1, ends=0.9, stops=BLUE))

# the shackle: two legs down into the body and the arch over it, one tube of clear frosted glass
top = H / 2 + 0.32
pts = [(-SR, H / 2 - 0.22), (-SR, top)]
for i in range(1, 24):
    a = math.pi - math.pi * i / 24
    pts.append((SR * math.cos(a), top + SR * math.sin(a)))
pts += [(SR, top), (SR, H / 2 - 0.22)]
cu = bpy.data.curves.new("Shackle", "CURVE"); cu.dimensions = "3D"
cu.bevel_depth = SW; cu.bevel_resolution = 10; cu.use_fill_caps = True
sp = cu.splines.new("POLY"); sp.points.add(len(pts) - 1)
for p, (x, y) in zip(sp.points, pts):
    p.co = (x, y, 0, 1)
tmp = bpy.data.objects.new("Shackle_c", cu); bpy.context.scene.collection.objects.link(tmp)
me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
bpy.data.objects.remove(tmp)
me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
shackle = bpy.data.objects.new("Shackle", me); bpy.context.scene.collection.objects.link(shackle)
shackle.data.materials.append(sg.frosted_glass("ShackleGlass", rough=0.28, tint=0.16))  # a touch more frost, so it reads at 28 px

# the keyhole, Ember, lit, a little proud of the face
ember = sg.lit("KeyEmber", sg.EMBER, 1.8, 0.4)
hole = sg.slab("Hole", sg.rounded_rect(0.24, 0.24, 0.12), 0.09, 0.04, res=8)
hole.location = (0, 0.02, FRONT - 0.02)
slot = sg.slab("Slot", sg.rounded_rect(0.1, 0.28, 0.05), 0.09, 0.035, res=6)
slot.location = (0, -0.17, FRONT - 0.02)
for o in (hole, slot):
    o.data.materials.append(ember)

parts = [body, inner, shackle, hole, slot]
sg.no_shadow(*parts)

LEAN, YAW = 6, -18
rx = math.radians(90 - LEAN)
base_z = H / 2 * math.sin(rx) + FRONT * math.cos(rx)
sg.group("Lock", parts, location=(0, 0, base_z), rotation=(90 - LEAN, 0, YAW))

sg.studio(shadow=(0.0, 0.05, 0.75, 0.28, 0.22, YAW), target_z=1.0)
sg.render(out, "lock", quality)
