# Light through a prism, sprayed (13 Nov, review: "only the light, as it scatters, in better quality"): a beam of
# clear light comes in from the left to a point and leaves as a fan of many fine rays, Cobalt at the top through
# violet and pink to Ember and peach at the bottom, each ray fading along its length, a few longer and brighter, so the
# spectrum reads as sprayed light rather than a flat wedge. Rendered on a transparent film; blender/light_post.py
# softens it into a glow.
#   Blender -b --factory-startup -P blender/light_spray.py -- blender/renders final
import math, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import spark_glass as sg

out, quality = sg.args()
sg.reset()
random.seed(7)

STOPS = [(0.0, "1E3BD6"), (0.16, "3D45F5"), (0.34, "6A3CF0"), (0.5, "B04AD8"), (0.66, "FF3A8C"), (0.82, "FF5A1F"), (1.0, "FFB48A")]


def spectrum(t):
    for (a, ca), (b, cb) in zip(STOPS, STOPS[1:]):
        if a <= t <= b:
            k = (t - a) / (b - a)
            A, B = sg.lin(ca), sg.lin(cb)
            return tuple(A[i] + (B[i] - A[i]) * k for i in range(3)) + (1.0,)
    return sg.lin(STOPS[-1][1]) + (1.0,)


def ray_material(name, color, strength, length, alpha=1.0):
    """Emission fading from the origin to the ray's end, mixed with transparency by the same fade; alpha thins the
    whole ray without darkening its colour (a dim emission at full cover reads as dark haze, not light)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    outn = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vl = nt.nodes.new("ShaderNodeVectorMath"); vl.operation = "LENGTH"
    nt.links.new(tc.outputs["Object"], vl.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.0
    mr.inputs["From Max"].default_value = length
    mr.inputs["To Min"].default_value = 1.0
    mr.inputs["To Max"].default_value = 0.0
    nt.links.new(vl.outputs["Value"], mr.inputs["Value"])
    pw = nt.nodes.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = FADE
    nt.links.new(mr.outputs["Result"], pw.inputs[0])
    al = nt.nodes.new("ShaderNodeMath"); al.operation = "MULTIPLY"; al.inputs[1].default_value = alpha
    nt.links.new(pw.outputs["Value"], al.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = color
    em.inputs["Strength"].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(al.outputs["Value"], mix.inputs["Fac"])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], outn.inputs["Surface"])
    return m


def wedge(name, a0, a1, length, color, strength, alpha=1.0, z=0.0):
    """A thin triangle from the origin out at angles a0..a1 (degrees)."""
    p = [(0, 0, z)]
    for a in (a0, a1):
        r = math.radians(a)
        p.append((length * math.cos(r), length * math.sin(r), z))
    me = bpy.data.meshes.new(name)
    me.from_pydata(p, [], [(0, 1, 2)])
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(ray_material(name + "M", color, strength, length, alpha))
    return ob


# the fan: many fine rays, colour by angle, lengths and brightness varied. CORNER (13 Nov, review): the light starts
# in the card's top right corner and spreads down and to the left; otherwise up and to the right from a beam
# WIDE (13 Nov, review: "the same area as First", then "from the corner itself, its tips reaching the words and the
# avatar"): the fan centred on the corner's diagonal rather than along the top edge, more and much longer rays, the
# longest aimed at the words and the avatar (down and to the left, about 200-215 degrees), fading more slowly so their
# tips carry; a square frame so the long ones aren't cut
WIDE = "wide" in sys.argv
CORNER = "corner" in sys.argv or WIDE
FADE = 1.1 if WIDE else 1.6  # how fast a ray fades along its length
SPAN0, SPAN1 = (186.0, 254.0) if WIDE else (196.0, 250.0) if CORNER else (-8.0, 36.0)
# (13 Nov, review: "fewer, not so thin, a little fuller") WIDE has fewer, broader rays, each with a faint wider halo
# round it, so a ray reads as a beam with soft edges rather than a hairline
for i in range(150 if WIDE else 260 if CORNER else 220):
    t = random.random()
    a = (SPAN0 + t * (SPAN1 - SPAN0)) if CORNER else (SPAN1 - t * (SPAN1 - SPAN0))  # the upper side = Cobalt
    w = random.uniform(1.0, 2.6) if WIDE else random.uniform(0.25, 1.1)
    if WIDE:
        toward_words = math.exp(-(((a - 207.0) / 16.0) ** 2))  # 1 toward the words and avatar, less to either side
        length = random.uniform(8.0, 12.0) * (0.8 + 0.5 * toward_words)
    else:
        length = random.uniform(6.0, 9.0) * (0.85 + 0.3 * math.sin(t * math.pi))
    # WIDE's rays all bright (13 Nov, review: Blender 2's colours read dark and veiled next to Blender's): no dim
    # ones, and each halo as bright as its ray but thin (a third of its cover), a little behind it
    k = random.uniform(1.1, 2.4) if WIDE else random.uniform(0.6, 2.4)
    wedge(f"Ray{i}", a - w / 2, a + w / 2, length, spectrum(t), k)
    if WIDE:
        wedge(f"Halo{i}", a - w * 1.4, a + w * 1.4, length * 0.9, spectrum(t), k, alpha=0.3, z=-0.01)

# the beam of clear light coming in from the left to the point
beam = bpy.data.meshes.new("Beam")
L, h = 9.0, 0.035
beam.from_pydata([(-L, -h, 0), (0, -h * 0.6, 0), (0, h * 0.6, 0), (-L, h, 0)], [], [(0, 1, 2, 3)])
bo = bpy.data.objects.new("Beam", beam)
if not CORNER:
    bpy.context.scene.collection.objects.link(bo)
bm = bpy.data.materials.new("BeamM")
bm.use_nodes = True
em = bm.node_tree.nodes["Principled BSDF"]
bm.node_tree.nodes.remove(em)
e = bm.node_tree.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (1, 1, 1, 1); e.inputs["Strength"].default_value = 6
bm.node_tree.links.new(e.outputs[0], bm.node_tree.nodes["Material Output"].inputs["Surface"])
bo.data.materials.append(bm)

# a bright point where the light splits
spark = bpy.data.objects.new("Point", None)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(0, 0, 0))
pt = bpy.context.active_object
pm = bpy.data.materials.new("PointM"); pm.use_nodes = True
pn = pm.node_tree.nodes["Principled BSDF"]; pm.node_tree.nodes.remove(pn)
pe = pm.node_tree.nodes.new("ShaderNodeEmission"); pe.inputs["Strength"].default_value = 12
pm.node_tree.links.new(pe.outputs[0], pm.node_tree.nodes["Material Output"].inputs["Surface"])
pt.data.materials.append(pm)

# an orthographic camera looking straight down at the fan, the point left of centre
cam_d = bpy.data.cameras.new("Cam"); cam_d.type = "ORTHO"; cam_d.ortho_scale = 15.0
cam = bpy.data.objects.new("Cam", cam_d); bpy.context.scene.collection.objects.link(cam)
cam.location = (-8.6, -8.6, 20) if WIDE else (-4.6, -2.6, 20) if CORNER else (3.2, 1.6, 20); cam.rotation_euler = (0, 0, 0)
if WIDE:
    cam_d.ortho_scale = 19.5
sc = bpy.context.scene
sc.camera = cam
r = sc.render
r.engine = "CYCLES"; sc.cycles.device = "GPU"
prefs = bpy.context.preferences.addons["cycles"].preferences; prefs.compute_device_type = "METAL"; prefs.get_devices()
for d in prefs.devices:
    d.use = d.type == "METAL"
r.resolution_x, r.resolution_y = ((1800, 1800) if WIDE else (2000, 1400)) if quality == "final" else (1000, 700)
sc.cycles.samples = 64 if quality == "final" else 16
sc.cycles.use_denoising = False
r.film_transparent = True
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGBA"
r.filepath = os.path.join(out, "light_wide.png" if WIDE else "light_corner.png" if CORNER else "light_spray.png")
bpy.ops.render.render(write_still=True)
print("DONE", r.filepath)
