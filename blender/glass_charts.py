# Charts in glass (13 Nov, review: "the gauge from Layout 3, made like the jelly keys"): for Layout 5 · Grid tiles.
#   gauge: a ring open at its foot, as Layout 3's score gauge; the share filled in jelly glass of the card's colour,
#          the rest of the track in clear frosted glass. The page sets the figure in its middle.
#   bars:  two upright capsules side by side, ours in jelly glass of the card's colour, the typical in clear glass.
# Same glass, studio and white ground as the morph loop's white version (morph_four.py), so they sit on a light card
# with `mix-blend-mode: multiply`.
#   Blender -b --factory-startup -P blender/glass_charts.py -- <out_dir>
import bpy, bmesh, math, os, sys
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg

a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = a[0] if a else os.path.join(os.path.dirname(__file__), "renders", "charts")
os.makedirs(OUT, exist_ok=True)


def lin3(h): return sg.lin(h)[:3]


# ---------------------------------------------------------------- a tube along a path, rounded at both ends
def tube(name, path, r, seg=40):
    """path: list of Vector points (smooth, evenly spaced). A round tube of radius r along it, with half-sphere caps."""
    bm = bmesh.new()
    rings = []
    n = len(path)
    tangents = []
    for i in range(n):
        t = (path[min(i + 1, n - 1)] - path[max(i - 1, 0)]).normalized()
        tangents.append(t)
    up = Vector((0, 1, 0))   # the paths lie in the XZ plane; Y is the axis toward the camera

    def ring(c, t, rad):
        side = t.cross(up).normalized()
        return [bm.verts.new(c + (side * math.cos(2 * math.pi * k / seg) + up * math.sin(2 * math.pi * k / seg)) * rad) for k in range(seg)]

    caps = 10
    # start cap
    for j in range(caps, 0, -1):
        ph = (math.pi / 2) * j / caps
        rings.append(ring(path[0] - tangents[0] * r * math.sin(ph), tangents[0], r * math.cos(ph) + 1e-4))
    for i in range(n):
        rings.append(ring(path[i], tangents[i], r))
    for j in range(1, caps + 1):
        ph = (math.pi / 2) * j / caps
        rings.append(ring(path[-1] + tangents[-1] * r * math.sin(ph), tangents[-1], r * math.cos(ph) + 1e-4))
    for A, B in zip(rings, rings[1:]):
        for k in range(seg):
            bm.faces.new((A[k], A[(k + 1) % seg], B[(k + 1) % seg], B[k]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    sub = ob.modifiers.new("Smooth", "SUBSURF"); sub.levels = sub.render_levels = 1
    ob.visible_shadow = False
    return ob


def arc(R, a0, a1, steps=120):
    return [Vector((R * math.cos(a0 + (a1 - a0) * i / steps), 0, R * math.sin(a0 + (a1 - a0) * i / steps))) for i in range(steps + 1)]


def line(p0, p1, steps=40):
    return [p0.lerp(p1, i / steps) for i in range(steps + 1)]


# ---------------------------------------------------------------- glass
def jelly(name, hexc, emit=0.6, density=2.2):
    c = lin3(hexc)
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = tuple(x + (1 - x) * 0.5 for x in c) + (1,)
    b.inputs["Transmission Weight"].default_value = 1.0; b.inputs["Roughness"].default_value = 0.02
    b.inputs["IOR"].default_value = 1.42; b.inputs["Coat Weight"].default_value = 0.6; b.inputs["Coat Roughness"].default_value = 0.02
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    ab = nt.nodes.new("ShaderNodeVolumeAbsorption"); ab.inputs["Density"].default_value = density
    ab.inputs["Color"].default_value = tuple(1 - (1 - x) * 0.85 for x in c) + (1,)
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = emit; em.inputs["Color"].default_value = c + (1,)
    ad = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(ab.outputs[0], ad.inputs[0]); nt.links.new(em.outputs[0], ad.inputs[1]); nt.links.new(ad.outputs[0], out.inputs["Volume"])
    return m


def frosted(name="Track"):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    # milky, so the track stays neutral and doesn't take the colour of the light behind (13 Nov)
    b.inputs["Base Color"].default_value = (0.3, 0.32, 0.37, 1)
    b.inputs["Transmission Weight"].default_value = 0.0; b.inputs["Roughness"].default_value = 0.3
    b.inputs["IOR"].default_value = 1.42; b.inputs["Coat Weight"].default_value = 0.8; b.inputs["Coat Roughness"].default_value = 0.03
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    ab = nt.nodes.new("ShaderNodeVolumeAbsorption"); ab.inputs["Density"].default_value = 1.4
    ab.inputs["Color"].default_value = (0.78, 0.8, 0.88, 1)
    nt.links.new(ab.outputs[0], out.inputs["Volume"])
    return m


# ---------------------------------------------------------------- studio (white ground, as morph_four's white)
def studio(sc):
    w = bpy.data.worlds.new("Light"); sc.world = w; w.use_nodes = True; wn = w.node_tree
    bg = wn.nodes["Background"]; tc = wn.nodes.new("ShaderNodeTexCoord"); sep = wn.nodes.new("ShaderNodeSeparateXYZ")
    ramp = wn.nodes.new("ShaderNodeValToRGB"); el = ramp.color_ramp.elements
    el[0].position, el[0].color = 0.0, (0.78, 0.76, 0.72, 1)
    el[1].position, el[1].color = 1.0, (1.0, 1.0, 1.0, 1)
    e = el.new(0.5); e.color = (0.5, 0.5, 0.53, 1)
    e = el.new(0.56); e.color = (0.86, 0.86, 0.88, 1)
    wn.links.new(tc.outputs["Generated"], sep.inputs[0]); wn.links.new(sep.outputs["Z"], ramp.inputs[0])
    lp = wn.nodes.new("ShaderNodeLightPath"); mx = wn.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"
    wn.links.new(lp.outputs["Is Camera Ray"], mx.inputs[0]); wn.links.new(ramp.outputs["Color"], mx.inputs[6])
    mx.inputs[7].default_value = (1, 1, 1, 1)
    wn.links.new(mx.outputs[2], bg.inputs["Color"])

    def area(name, loc, power, size, size_y=None, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, "AREA"); ld.energy = power; ld.color = color
        if size_y: ld.shape = "RECTANGLE"; ld.size, ld.size_y = size, size_y
        else: ld.size = size
        o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area("Key", (-3.2, -4.2, 4.2), 520, 3.2)
    area("Strip", (3.6, -2.4, 2.2), 260, 0.5, 3.4)
    area("Top", (0.0, -0.6, 5.0), 260, 4.0, 1.0)
    area("Under", (0.0, -1.0, -3.6), 140, 3.0, color=(0.75, 0.8, 1.0))
    area("Back", (1.8, 4.5, 1.0), 380, 2.5, color=(1.0, 0.86, 0.8))

    cd = bpy.data.cameras.new("Cam"); cd.lens = 85
    cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam
    el_, dist = math.radians(14), 9.2
    cam.location = (0, -dist * math.cos(el_), dist * math.sin(el_))
    cam.rotation_euler = (Vector((0, 0, 0)) - cam.location).to_track_quat("-Z", "Y").to_euler()

    r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences; prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = d.type == "METAL"
    r.resolution_x = r.resolution_y = 900; sc.cycles.samples = 192; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 20; sc.cycles.transmission_bounces = 20; sc.cycles.volume_bounces = 2
    sc.cycles.caustics_reflective = True; sc.cycles.caustics_refractive = True; sc.cycles.blur_glossy = 0.6
    r.film_transparent = False
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGB"


def light_card(name, loc, rot, size, strength, color):
    """Light the glass refracts, unseen by the camera (as in morph_four.py): the body glows from within."""
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.visible_camera = False; o.visible_shadow = False
    mm = bpy.data.materials.new(name); mm.use_nodes = True; t = mm.node_tree; t.nodes.clear()
    oo = t.nodes.new("ShaderNodeOutputMaterial"); em = t.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = strength
    tc_ = t.nodes.new("ShaderNodeTexCoord"); gr = t.nodes.new("ShaderNodeTexGradient"); gr.gradient_type = "SPHERICAL"
    mp = t.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (2, 2, 2)
    t.links.new(tc_.outputs["Generated"], mp.inputs["Vector"])
    sub = t.nodes.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"; sub.inputs[1].default_value = (1.0, 1.0, 1.0)
    t.links.new(mp.outputs[0], sub.inputs[0]); t.links.new(sub.outputs[0], gr.inputs["Vector"])
    mx_ = t.nodes.new("ShaderNodeMix"); mx_.data_type = "RGBA"; mx_.inputs[6].default_value = (0, 0, 0, 1); mx_.inputs[7].default_value = color
    t.links.new(gr.outputs["Fac"], mx_.inputs[0])
    t.links.new(mx_.outputs[2], em.inputs["Color"]); t.links.new(em.outputs[0], oo.inputs["Surface"])
    o.data.materials.append(mm)


def glow_for(hexc):
    c = lin3(hexc)
    light_card("BackGlow", (0, 1.7, 0.1), (math.radians(90), 0, 0), 4.6, 4.0, c + (1,))
    light_card("FootGlow", (0, -0.2, -1.6), (0, 0, 0), 3.4, 8.0, tuple(x + (1 - x) * 0.4 for x in c) + (1,))


def tilt(*obs):
    """Lean the chart back a little, so its thickness and lit foot show, as the keys do."""
    e = bpy.data.objects.new("Lean", None); bpy.context.scene.collection.objects.link(e)
    e.rotation_euler = (math.radians(-12), 0, 0)
    for o in obs: o.parent = e


def render(name):
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, f"{name}.png")
    bpy.ops.render.render(write_still=True); print("DONE", sc.render.filepath)


R, TUBE = 1.0, 0.2
START, SWEEP = math.radians(225), math.radians(270)   # open at the foot, as Layout 3's gauge


def gauge(name, share, hexc):
    sg.reset(); sc = bpy.context.scene; studio(sc)
    gap = math.radians(3)
    a_end = START - SWEEP * share
    glow_for(hexc)
    fill = tube("Fill", arc(R, START, a_end), TUBE); fill.data.materials.append(jelly("Jelly", hexc))
    track = tube("Track", arc(R, a_end - gap - 2 * TUBE / R, START - SWEEP), TUBE * 0.82); track.data.materials.append(frosted())
    tilt(fill, track)
    render(name)


def bars(name, ours, ref, hexc):
    sg.reset(); sc = bpy.context.scene; studio(sc)
    glow_for(hexc)
    H = 1.8; base = -0.95; w = 0.3
    top = max(ours, ref)
    a_ = tube("Ours", line(Vector((-0.34, 0, base + w)), Vector((-0.34, 0, base + H * ours / top - w))), w); a_.data.materials.append(jelly("Jelly", hexc))
    b_ = tube("Typical", line(Vector((0.34, 0, base + w)), Vector((0.34, 0, base + H * ref / top - w))), w); b_.data.materials.append(frosted())
    tilt(a_, b_)
    render(name)


def bar(name, share, hexc):
    """A progress line in glass (13 Nov, review: the balance's bar, made like the gauge): the share in jelly, the rest a
    pale glossy track, end to end."""
    sg.reset(); sc = bpy.context.scene; studio(sc)
    glow_for(hexc)
    L, x0, r = 2.6, -1.3, 0.17
    xs = x0 + r + (L - 2 * r) * share
    fill = tube("Fill", line(Vector((x0 + r, 0, 0)), Vector((xs, 0, 0))), r); fill.data.materials.append(jelly("Jelly", hexc))
    track = tube("Track", line(Vector((xs + 2 * r + 0.04, 0, 0)), Vector((x0 + L - r, 0, 0))), r * 0.82); track.data.materials.append(frosted())
    tilt(fill, track)
    render(name)


def question(name, hexc):
    """A question mark in jelly glass (Dr.AI): its hook a round tube, the stem bending down from it, a ball for the dot."""
    sg.reset(); sc = bpy.context.scene; studio(sc)
    glow_for(hexc)
    r = 0.17
    c, R = Vector((0, 0, 0.42)), 0.46
    hook = [c + Vector((R * math.cos(t), 0, R * math.sin(t))) for t in [math.radians(165 - 225 * i / 90) for i in range(91)]]
    end = hook[-1]
    # from the hook's end, curve in and down to the stem's foot
    foot = Vector((0.0, 0, -0.32))
    mid = Vector((0.02, 0, (end.z + foot.z) / 2 + 0.02))
    stem = [(1 - t) ** 2 * end + 2 * (1 - t) * t * mid + t * t * foot for t in [i / 30 for i in range(1, 31)]]
    q = tube("Q", hook + stem, r); q.data.materials.append(jelly("Jelly", hexc))
    dot = tube("Dot", line(Vector((0, 0, -0.74)), Vector((0, 0, -0.739)), 2), r * 1.12); dot.data.materials.append(jelly("Jelly2", hexc))
    tilt(q, dot)
    render(name)


def calendar(name, hexc, day_hex="E8501F"):
    """A calendar in jelly glass (the consultation): a rounded frame, a bar across its top, two rings, a few days as
    beads, one of them Ember."""
    sg.reset(); sc = bpy.context.scene; studio(sc)
    glow_for(hexc)
    r = 0.11
    w, h, k = 1.0, 0.86, 0.26          # half width, half height, corner radius of the frame
    pts = []
    for cx, cz, a0 in ((w - k, h - k, 0), (-w + k, h - k, 90), (-w + k, -h + k, 180), (w - k, -h + k, 270)):
        for i in range(25):
            t = math.radians(a0 + 90 * i / 24); pts.append(Vector((cx + k * math.cos(t), 0, cz + k * math.sin(t))))
    pts.append(pts[0])
    frame = tube("Frame", pts, r); frame.data.materials.append(jelly("Jelly", hexc))
    bar_ = tube("Top", line(Vector((-w + r * 1.6, 0, h - 0.42)), Vector((w - r * 1.6, 0, h - 0.42))), r * 0.8); bar_.data.materials.append(jelly("Jelly3", hexc))
    rings = [tube(f"Ring{i}", line(Vector((x, 0, h - 0.12)), Vector((x, 0, h + 0.28))), r * 0.9) for i, x in enumerate((-0.42, 0.42))]
    for o in rings: o.data.materials.append(jelly("Jelly4", hexc))
    beads = []
    for i, (x, z) in enumerate([(-0.5, -0.12), (0, -0.12), (0.5, -0.12), (-0.5, -0.5), (0, -0.5), (0.5, -0.5)]):
        b_ = tube(f"Day{i}", line(Vector((x, 0, z)), Vector((x, 0, z + 0.001)), 2), 0.15 if i == 4 else 0.12)
        b_.data.materials.append(jelly("Ember", day_hex, emit=3.0, density=6.0) if i == 4 else frosted(f"Day{i}"))
        beads.append(b_)
    tilt(frame, bar_, *rings, *beads)
    render(name)


ONLY = a[1:]  # names to render; all when empty
JOBS = {
    "gauge_web": lambda: gauge("gauge_web", 0.41, "1E3BD6"),
    "gauge_credits": lambda: gauge("gauge_credits", 0.642, "E8501F"),
    "bars_social": lambda: bars("bars_social", 3.4, 1.9, "F2457D"),
    "bar_credits": lambda: bar("bar_credits", 0.642, "E8501F"),
    "question_ai": lambda: question("question_ai", "C83CBE"),
    "question_ember": lambda: question("question_ember", "E8501F"),
    "calendar_consult": lambda: calendar("calendar_consult", "6A4BEE"),
}
for k, job in JOBS.items():
    if not ONLY or k in ONLY:
        job()
