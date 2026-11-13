# Layout 5's figure (13 Nov, review): four shapes from Spark's own story, "We bring Sparks to Light", in thick jelly
# glass with light inside, pouring from one into the next. Find the spark → power it up (the prism: one idea, every
# format) → bring it to light (the orb) → the key (five capabilities, one spark) → back to the spark.
# Each its own colour, as the service keys on sparkstudios.ae: spark Ember orange, prism violet, orb magenta, key
# Cobalt blue. Rendered on black so the page lays it over the dark band with `mix-blend-mode: screen`.
#
# How the shapes pour: one dense sphere is the mesh of all four. Every vertex keeps its direction from the centre and
# is pushed out along it to where that ray leaves each shape (all four are star-shaped about their centre), so the four
# are shape keys of one mesh and Blender blends them smoothly. Each flat shape is a 2D outline swollen into a pillow
# with round edges (half thickness T, edge radius R), so even the spark's long thin points stay rounded jelly.
#
#   Blender -b --factory-startup -P blender/morph_four.py -- <out_dir> stills|anim [preview|final]
import bpy, bmesh, math, os, sys
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg

a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = a[0] if a else os.path.join(os.path.dirname(__file__), "renders", "morph")
MODE = a[1] if len(a) > 1 else "stills"
QUALITY = a[2] if len(a) > 2 else "preview"
BG = a[3] if len(a) > 3 else "dark"   # "white": for a light page (Scenes), the camera sees white and the page multiplies it
os.makedirs(OUT, exist_ok=True)
sg.reset()
sc = bpy.context.scene

# ---------------------------------------------------------------- outlines (x, y), centred, about 1.75 across
SPARK_PATH = ("12.27 0.00 12.40 3.29 12.55 4.59 12.79 5.91 13.00 6.68 13.31 7.46 13.61 8.03 14.10 8.72 14.55 9.21 15.17 9.71 "
              "15.92 10.14 16.82 10.49 17.92 10.82 19.17 11.08 20.28 11.25 21.86 11.38 20.66 11.48 19.48 11.69 18.46 11.97 "
              "17.40 12.39 16.41 12.90 15.54 13.48 14.93 14.00 14.15 14.85 13.73 15.49 13.28 16.51 12.94 17.56 12.74 18.40 "
              "12.58 19.54 12.42 21.48 12.30 24.02 12.23 22.32 12.09 20.51 11.99 19.72 11.61 17.64 11.35 16.74 11.08 16.07 "
              "10.67 15.30 10.19 14.66 9.60 14.07 8.81 13.49 8.03 13.07 7.06 12.67 5.86 12.29 4.53 12.00 3.40 11.85 2.04 11.76 "
              "3.57 11.64 4.73 11.45 6.10 11.08 7.23 10.69 8.34 10.23 8.85 9.95 9.61 9.37 10.23 8.74 10.80 7.97 11.20 7.30 "
              "11.50 6.59 11.70 5.88 11.95 4.48 12.12 3.02 12.23 1.29")


def spark_outline(height=1.9):
    v = [float(x) for x in SPARK_PATH.split()]
    pts = np.array(list(zip(v[0::2], v[1::2])), dtype=np.float64)
    pts[:, 1] = 24 - pts[:, 1]                       # SVG y runs down
    c = np.array([12.2, 12.0])                       # the spark's heart, where its four points cross
    return (pts - c) * (height / 24.0)


def rounded_poly(corners, r, n=18):
    """A convex polygon with each corner rounded by radius r."""
    P = np.array(corners, dtype=np.float64); out = []
    for i in range(len(P)):
        p0, p1, p2 = P[i - 1], P[i], P[(i + 1) % len(P)]
        u, w = (p0 - p1) / np.linalg.norm(p0 - p1), (p2 - p1) / np.linalg.norm(p2 - p1)
        half = math.acos(np.clip(np.dot(u, w), -1, 1)) / 2
        d = r / math.tan(half); cen = p1 + (u + w) / np.linalg.norm(u + w) * (r / math.sin(half))
        a0 = math.atan2(*(p1 + u * d - cen)[::-1]); a1 = math.atan2(*(p1 + w * d - cen)[::-1])
        da = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi
        for k in range(n + 1):
            t = a0 + da * k / n; out.append(cen + r * np.array([math.cos(t), math.sin(t)]))
    return np.array(out)


def triangle_outline(side=1.95, r=0.16):
    h = side * math.sqrt(3) / 2
    tri = [(0, 2 * h / 3), (-side / 2, -h / 3), (side / 2, -h / 3)]   # centroid at the origin
    return rounded_poly(tri[::-1], r)


def square_outline(w=1.42, r=0.36):
    s = w / 2
    return rounded_poly([(s, s), (-s, s), (-s, -s), (s, -s)][::-1], r)


# ---------------------------------------------------------------- the pillow test, vectorised
def inside_depth(Q, poly):
    """Distance from each point Q (M,2) to the outline, positive inside."""
    A = poly; B = np.roll(poly, -1, axis=0); AB = B - A
    out = np.empty(len(Q))
    for s in range(0, len(Q), 8192):
        q = Q[s:s + 8192, None, :]
        t = np.clip(((q - A) * AB).sum(-1) / (AB * AB).sum(-1), 0, 1)
        d = np.sqrt(((q - (A + t[..., None] * AB)) ** 2).sum(-1)).min(1)
        qy, qx = q[..., 1], q[..., 0]
        cross = ((A[:, 1] > qy) != (B[:, 1] > qy)) & (qx < (B[:, 0] - A[:, 0]) * (qy - A[:, 1]) / (B[:, 1] - A[:, 1] + 1e-12) + A[:, 0])
        inside = (cross.sum(1) % 2) == 1
        out[s:s + 8192] = np.where(inside, d, -d)
    return out


def pillow_inside(P, poly, T, R):
    """Inside the outline swollen to half thickness T, its edges rounded with radius R (flat face where deep enough)."""
    D = inside_depth(P[:, :2], poly)
    Dc = np.clip(D, 0, R)
    H = (T - R) + np.sqrt(np.maximum(R * R - (R - Dc) ** 2, 0))
    H = np.where(D > 0, np.maximum(H, 0), -1)
    return np.abs(P[:, 2]) < H


def project(dirs, inside, tmax=1.4, iters=26):
    """Where each ray from the centre leaves the shape (bisection; the shapes are star-shaped about the centre)."""
    lo = np.zeros(len(dirs)); hi = np.full(len(dirs), tmax)
    for _ in range(iters):
        mid = (lo + hi) / 2
        ins = inside(dirs * mid[:, None])
        lo = np.where(ins, mid, lo); hi = np.where(ins, hi, mid)
    return dirs * ((lo + hi) / 2)[:, None]


# ---------------------------------------------------------------- the one mesh: a dense sphere
CUTS = 95 if QUALITY == "preview" and MODE == "stills" else 127
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=2.0)
bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=CUTS, use_grid_fill=True)
for v in bm.verts: v.co = v.co.normalized()
me = bpy.data.meshes.new("Shape"); bm.to_mesh(me); bm.free()
me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
ob = bpy.data.objects.new("Shape", me); sc.collection.objects.link(ob)
n = len(me.vertices)
dirs = np.empty(n * 3); me.vertices.foreach_get("co", dirs); dirs = dirs.reshape(n, 3)
dirs /= np.linalg.norm(dirs, axis=1)[:, None]
print("verts", n)

ORB_R = 0.84
SHAPES = {
    "spark": project(dirs, lambda P: pillow_inside(P, spark_outline(2.35), 0.3, 0.3)),
    "prism": project(dirs, lambda P: pillow_inside(P, triangle_outline(), 0.44, 0.13)),
    "key": project(dirs, lambda P: pillow_inside(P, square_outline(), 0.36, 0.25)),
}
basis = dirs * ORB_R   # the orb is the basis
me.vertices.foreach_set("co", basis.ravel())
ob.shape_key_add(name="Orb", from_mix=False)
for name, co in SHAPES.items():
    k = ob.shape_key_add(name=name, from_mix=False); k.data.foreach_set("co", co.ravel())
print("shapes done")

# ---------------------------------------------------------------- jelly glass with light inside
def lin3(h): return sg.lin(h)[:3]
COLS = {"spark": lin3("FF6A1F"), "prism": lin3("6A3CF0"), "orb": lin3("D23AC8"), "key": lin3("2A55FF")}

m = bpy.data.materials.new("Jelly"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputMaterial")
b = nt.nodes.new("ShaderNodeBsdfPrincipled")
b.inputs["Transmission Weight"].default_value = 1.0
b.inputs["Roughness"].default_value = 0.02
b.inputs["IOR"].default_value = 1.42
b.inputs["Coat Weight"].default_value = 0.6; b.inputs["Coat Roughness"].default_value = 0.02
nt.links.new(b.outputs[0], out.inputs["Surface"])
absn = nt.nodes.new("ShaderNodeVolumeAbsorption"); absn.inputs["Density"].default_value = 1.4
emv = nt.nodes.new("ShaderNodeEmission"); emv.inputs["Strength"].default_value = 0.35
add = nt.nodes.new("ShaderNodeAddShader")
nt.links.new(absn.outputs[0], add.inputs[0]); nt.links.new(emv.outputs[0], add.inputs[1]); nt.links.new(add.outputs[0], out.inputs["Volume"])
me.materials.append(m)
sg.no_shadow(ob)


# light the glass refracts, unseen by the camera: a soft card of the shape's colour behind it (the body glows from
# within, lighter at its heart) and a bright pool under it (the foot burns, as under the keys on sparkstudios.ae)
def light_card(name, loc, rot, size, strength):
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.visible_camera = False; o.visible_shadow = False
    mm = bpy.data.materials.new(name); mm.use_nodes = True; t = mm.node_tree; t.nodes.clear()
    oo = t.nodes.new("ShaderNodeOutputMaterial"); em = t.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = strength
    tc_ = t.nodes.new("ShaderNodeTexCoord"); gr = t.nodes.new("ShaderNodeTexGradient"); gr.gradient_type = "SPHERICAL"
    mp = t.nodes.new("ShaderNodeMapping"); mp.inputs["Location"].default_value = (0, 0, 0); mp.inputs["Scale"].default_value = (2, 2, 2)  # 0..1 → -1..1 after the subtract
    t.links.new(tc_.outputs["Generated"], mp.inputs["Vector"])
    sub = t.nodes.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"; sub.inputs[1].default_value = (1.0, 1.0, 1.0)  # a flat plane's generated z sits at 0.5
    t.links.new(mp.outputs[0], sub.inputs[0]); t.links.new(sub.outputs[0], gr.inputs["Vector"])
    mx_ = t.nodes.new("ShaderNodeMix"); mx_.data_type = "RGBA"; mx_.inputs[6].default_value = (0, 0, 0, 1)
    t.links.new(gr.outputs["Fac"], mx_.inputs[0])
    t.links.new(mx_.outputs[2], em.inputs["Color"]); t.links.new(em.outputs[0], oo.inputs["Surface"])
    o.data.materials.append(mm)
    return mx_.inputs[7]


BACK = light_card("BackGlow", (0, 1.7, 0.1), (math.radians(90), 0, 0), 4.2, 4.0)
FOOT = light_card("FootGlow", (0, -0.2, -1.35), (0, 0, 0), 3.2, 8.0)


def set_colour(c, frame=None):
    tint = tuple(x + (1 - x) * 0.5 for x in c) + (1,)
    absorb = tuple(1 - (1 - x) * 0.85 for x in c) + (1,)   # absorbs the complement: thick parts go deep
    glow = tuple(c) + (1,)
    b.inputs["Base Color"].default_value = tint
    absn.inputs["Color"].default_value = absorb
    emv.inputs["Color"].default_value = glow
    BACK.default_value = tuple(c) + (1,)
    FOOT.default_value = tuple(x + (1 - x) * 0.4 for x in c) + (1,)
    if frame is not None:
        for s in (b.inputs["Base Color"], absn.inputs["Color"], emv.inputs["Color"], BACK, FOOT):
            s.keyframe_insert("default_value", frame=frame)


# ---------------------------------------------------------------- a dark studio
w = bpy.data.worlds.new("Dark"); sc.world = w; w.use_nodes = True; wn = w.node_tree
bg = wn.nodes["Background"]; tc = wn.nodes.new("ShaderNodeTexCoord"); sep = wn.nodes.new("ShaderNodeSeparateXYZ")
ramp = wn.nodes.new("ShaderNodeValToRGB"); el = ramp.color_ramp.elements
if BG == "white":
    # a bright studio: a warm Sand floor, a grey horizon band for the edges to catch, white sky
    el[0].position, el[0].color = 0.0, (0.78, 0.76, 0.72, 1)
    el[1].position, el[1].color = 1.0, (1.0, 1.0, 1.0, 1)
    e = el.new(0.5); e.color = (0.5, 0.5, 0.53, 1)
    e = el.new(0.56); e.color = (0.86, 0.86, 0.88, 1)
else:
    el[0].position, el[0].color = 0.0, (0.004, 0.004, 0.008, 1)
    el[1].position, el[1].color = 1.0, (0.35, 0.36, 0.42, 1)
    e = el.new(0.5); e.color = (0.03, 0.03, 0.05, 1)
    e = el.new(0.56); e.color = (0.16, 0.16, 0.2, 1)
wn.links.new(tc.outputs["Generated"], sep.inputs[0]); wn.links.new(sep.outputs["Z"], ramp.inputs[0])
lp = wn.nodes.new("ShaderNodeLightPath"); mx = wn.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"
wn.links.new(lp.outputs["Is Camera Ray"], mx.inputs[0]); wn.links.new(ramp.outputs["Color"], mx.inputs[6])
mx.inputs[7].default_value = (1, 1, 1, 1) if BG == "white" else (0, 0, 0, 1)   # the camera sees black (screened onto the band) or white (multiplied onto a light page)
wn.links.new(mx.outputs[2], bg.inputs["Color"]); bg.inputs["Strength"].default_value = 1.0


def area(name, loc, power, size, size_y=None, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, "AREA"); ld.energy = power; ld.color = color
    if size_y: ld.shape = "RECTANGLE"; ld.size, ld.size_y = size, size_y
    else: ld.size = size
    o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


area("Key", (-3.2, -4.2, 4.2), 520, 3.2)               # the big soft box, top left: the long highlights
area("Strip", (3.6, -2.4, 2.2), 260, 0.5, 3.4)          # a strip at the right: the crisp edge line
area("Top", (0.0, -0.6, 5.0), 260, 4.0, 1.0)            # the top edge
area("Under", (0.0, -1.0, -3.6), 140, 3.0, color=(0.75, 0.8, 1.0))   # the foot, lit from below as the keys are
area("Back", (1.8, 4.5, 1.0), 380, 2.5, color=(1.0, 0.86, 0.8))

cd = bpy.data.cameras.new("Cam"); cd.lens = 85
cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam
el_, dist = math.radians(9), 8.6
cam.location = (0, -dist * math.cos(el_), dist * math.sin(el_))
cam.rotation_euler = (Vector((0, 0, 0)) - cam.location).to_track_quat("-Z", "Y").to_euler()

# the shape stands facing the camera (its face is +Z in its own space), leaning back a little
ob.rotation_mode = "XYZ"
LEAN = math.radians(90 - 28)   # face tipped up, as the keys lie on sparkstudios.ae: the lit foot shows


def pose(f, F, seg=78, hold=42):
    # turning as dozfx's hero turns (13 Nov, review: "rotate them more"), so each shape still faces us while it holds:
    # while one shape pours into the next it spins half a turn about the vertical and nods forward, fast; while it holds
    # it drifts slowly, face to us. Half turns only, so every shape lands face on (front or back: they read the same),
    # and four of them close the loop.
    i, k = divmod(f, seg)
    e = 0.0 if k < hold else (k - hold) / (seg - hold)
    e = e * e * (3 - 2 * e)
    drift = 2 * math.pi * k / seg
    spin = math.pi * (i + e) + math.radians(16) * math.sin(drift)
    nod = math.radians(34) * math.sin(math.pi * e) + math.radians(5) * math.sin(2 * drift)
    roll = math.radians(9) * math.sin(drift + 0.8) + math.radians(12) * math.sin(math.pi * e)
    ob.rotation_euler = (LEAN + nod, roll, spin)


# ---------------------------------------------------------------- render settings
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "GPU"
prefs = bpy.context.preferences.addons["cycles"].preferences; prefs.compute_device_type = "METAL"; prefs.get_devices()
for d in prefs.devices: d.use = d.type == "METAL"
size, samples = {"draft": (320, 16), "small": (420, 80), "preview": (640, 96), "final": (800, 160)}[QUALITY]
r.resolution_x = r.resolution_y = size; sc.cycles.samples = samples; sc.cycles.use_denoising = True
sc.cycles.max_bounces = 20; sc.cycles.transmission_bounces = 20; sc.cycles.glossy_bounces = 8; sc.cycles.volume_bounces = 2
sc.cycles.caustics_reflective = True; sc.cycles.caustics_refractive = True; sc.cycles.blur_glossy = 0.6
sc.cycles.volume_step_rate = 2.0
r.film_transparent = False
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGB"

ORDER = ["spark", "prism", "orb", "key"]
KEYS = {k.name: k for k in ob.data.shape_keys.key_blocks}


def weights(fr_shape, to_shape, e):
    """Shape key values for e of the way from one to the next; half way it swells a little toward the orb (liquid)."""
    m = math.sin(math.pi * e) * 0.3
    w = {k: 0.0 for k in ("spark", "prism", "key")}
    if fr_shape != "orb": w[fr_shape] += (1 - e) * (1 - m)
    if to_shape != "orb": w[to_shape] += e * (1 - m)
    return w


def ease(x): return x * x * (3 - 2 * x)


def mixc(c0, c1, e): return tuple(c0[i] + (c1[i] - c0[i]) * e for i in range(3))


if MODE == "stills":
    F = 100
    for i, s in enumerate(ORDER):
        for k in ("spark", "prism", "key"): KEYS[k].value = 1.0 if k == s else 0.0
        set_colour(COLS[s]); pose(8 + i * 3, F)
        r.filepath = os.path.join(OUT, f"still_{s}.png")
        bpy.ops.render.render(write_still=True); print("DONE", r.filepath)
    # one half-way frame, spark → prism
    for k, v in weights("spark", "prism", 0.5).items(): KEYS[k].value = v
    set_colour(mixc(COLS["spark"], COLS["prism"], 0.5)); pose(10, F)
    r.filepath = os.path.join(OUT, "still_mid.png"); bpy.ops.render.render(write_still=True); print("DONE", r.filepath)
elif MODE == "plates":
    # Layout 5 · Grid tiles (13 Nov, review): blank keys in the five colours of the service keys on sparkstudios.ae
    # (S Cobalt, P violet, A magenta, R pink, K Ember), face to us and tipped up so the lit foot shows, for the page
    # to set a figure or an icon on their face
    PLATES = {"s": "1E3BD6", "p": "6A4BEE", "a": "C83CBE", "r": "F2457D", "k": "E8501F"}
    for k in ("spark", "prism", "key"): KEYS[k].value = 1.0 if k == "key" else 0.0
    ob.rotation_euler = (LEAN, 0, 0)
    for name, hexc in PLATES.items():
        set_colour(lin3(hexc))
        r.filepath = os.path.join(OUT, f"plate_{name}.png")
        bpy.ops.render.render(write_still=True); print("DONE", r.filepath)
else:
    HOLD, MELT = 42, 36            # frames at 30 fps: 1.4 s on a shape, 1.2 s pouring into the next
    F = (HOLD + MELT) * len(ORDER)
    sc.frame_start, sc.frame_end = 0, F - 1; sc.render.fps = 30
    for f in range(F):
        i, ph = divmod(f, HOLD + MELT)
        cur, nxt = ORDER[i], ORDER[(i + 1) % len(ORDER)]
        e = 0.0 if ph < HOLD else ease((ph - HOLD) / MELT)
        for k, v in weights(cur, nxt, e).items():
            KEYS[k].value = v; KEYS[k].keyframe_insert("value", frame=f)
        set_colour(mixc(COLS[cur], COLS[nxt], e), frame=f)
        pose(f, F); ob.keyframe_insert("rotation_euler", frame=f)
    if QUALITY == "draft": sc.frame_step = 13   # a look at the motion: every 13th frame
    r.use_overwrite = False   # a stopped render picks up where it left off
    r.filepath = os.path.join(OUT, "f_")
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "morph.blend"))
    bpy.ops.render.render(animation=True)
    print("DONE anim", F)
