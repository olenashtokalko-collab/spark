# Spark Studios · Frosted Light icon family — shared studio.
# Every icon script imports this so camera, light, floor, materials and render settings stay identical.
# Run an icon:  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
#                 --python blender/icon_reports.py -- <out_dir> [preview|final]
import bpy, bmesh, math, os, sys
from mathutils import Vector


# ---------- palette (brand book p.11) ----------
def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)

SAND, COBALT, EMBER, HAZE = lin("F8F6F2"), lin("1E3BD6"), lin("E8501F"), lin("C8D8F0")
VIOLET, MAGENTA = lin("5A36D4"), lin("A33ABF")   # inferred steps of the Noor spectrum
SPECTRUM = ((0.0, COBALT), (0.4, VIOLET), (0.62, MAGENTA), (1.0, EMBER))


def args():
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out = a[0] if a else os.path.join(os.path.dirname(__file__), "renders")
    quality = a[1] if len(a) > 1 else "preview"
    os.makedirs(out, exist_ok=True)
    return out, quality


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


# ---------- geometry ----------
def rounded_rect(w, h, r, n=14):
    """Closed 2D outline of a rounded rectangle, counter-clockwise."""
    r = min(r, w / 2, h / 2); pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n); pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def pill(w, h, n=16):
    return rounded_rect(w, h, h / 2, n)


def slab(name, pts, depth, bevel, res=8, face_camera=True):
    """Extrude a 2D outline into a soft slab `depth` thick with rounded edges of radius `bevel`.
    The outline is the finished silhouette (bevel is inset first). Local +Z is the front face."""
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "2D"; cu.fill_mode = "BOTH"
    cu.extrude = max(depth / 2 - bevel, 0.0); cu.bevel_depth = bevel; cu.bevel_resolution = res
    cu.offset = -bevel  # keep the outline as the outer silhouette
    sp = cu.splines.new("POLY"); sp.points.add(len(pts) - 1)
    for p, (x, y) in zip(sp.points, pts): p.co = (x, y, 0, 1)
    sp.use_cyclic_u = True
    tmp = bpy.data.objects.new(name + "_c", cu); bpy.context.scene.collection.objects.link(tmp)
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(tmp); bpy.data.curves.remove(cu)
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    return ob


def _catmull(pts, n=6):
    """Smooth an open 2D polyline through its points (Catmull-Rom), n samples per span."""
    out = []
    P = [pts[0]] + list(pts) + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(pts[-1])
    return out


def lathe(name, profile, segments=96, smooth=6):
    """Revolve a (radius, z) profile around Z into a closed solid. The profile runs from the top of the axis
    (radius 0) down the outside and back to the axis at the bottom."""
    prof = _catmull(profile, smooth)
    bm = bmesh.new()
    rings = []
    for k in range(segments):
        a = 2 * math.pi * k / segments; ca, sa = math.cos(a), math.sin(a)
        rings.append([bm.verts.new((r * ca, r * sa, z)) for r, z in prof])
    for k in range(segments):
        A, B = rings[k], rings[(k + 1) % segments]
        for i in range(len(prof) - 1):
            bm.faces.new((A[i], A[i + 1], B[i + 1], B[i]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    return ob


def sphere(name, r, location=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=r, location=location)
    o = bpy.context.active_object; o.name = name; o.scale = scale
    o.data.polygons.foreach_set("use_smooth", [True] * len(o.data.polygons))
    return o


def group(name, children, location=(0, 0, 0), rotation=(0, 0, 0)):
    e = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(e)
    e.location = location; e.rotation_euler = [math.radians(a) for a in rotation]
    for c in children: c.parent = e
    return e


# ---------- materials ----------
def _new(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    return m, nt, nt.nodes.new("ShaderNodeOutputMaterial")


def frosted_glass(name="FrostedGlass", rough=0.34, tint=0.18):
    """Brand material: frosted body, glossy luminous edges (clear coat), faint Corniche Haze tint."""
    m, nt, out = _new(name)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = tuple(1 - tint * (1 - c) for c in HAZE[:3]) + (1,)
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = rough
    b.inputs["IOR"].default_value = 1.45
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Coat Roughness"].default_value = 0.03
    b.inputs["Coat IOR"].default_value = 1.5
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    return m


def tinted_glass(name, color, mix=0.45, rough=0.22):
    """Coloured frosted glass (the S·P·A·R·K cubes, p.11): brand colour lightened toward white, glossy coat."""
    m, nt, out = _new(name)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = tuple(c + (1 - c) * mix for c in color[:3]) + (1,)
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = rough; b.inputs["IOR"].default_value = 1.45
    b.inputs["Coat Weight"].default_value = 1.0; b.inputs["Coat Roughness"].default_value = 0.03
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    return m


def clear_glass(name="ClearGlass", rough=0.05):
    m, nt, out = _new(name)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (1, 1, 1, 1)
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = rough; b.inputs["IOR"].default_value = 1.45
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    return m


def _ramp(nt, stops):
    r = nt.nodes.new("ShaderNodeValToRGB"); el = r.color_ramp.elements
    el[0].position, el[0].color = stops[0]; el[1].position, el[1].color = stops[-1]
    for pos, col in stops[1:-1]:
        e = el.new(pos); e.color = col
    return r


def _math(nt, op, a, b=None):
    n = nt.nodes.new("ShaderNodeMath"); n.operation = op
    for i, v in enumerate((a, b)):
        if v is None: continue
        if isinstance(v, (int, float)): n.inputs[i].default_value = v
        else: nt.links.new(v, n.inputs[i])
    return n.outputs[0]


def spectrum_light(name="SpectrumLight", direction=(1, 1, 0), span=1.0, strength=1.0, fade=0.5, stops=SPECTRUM,
                   edge=0.22, base=0.35, ends=0.65):
    """Inner light: Cobalt → Ember along `direction` in object space.
    No hard outline: it fades out over `edge` (fraction of its size) toward its border and at grazing angles,
    and glows strongest at both ends of the spectrum (`base` in the middle, `base + ends` at the ends)."""
    m, nt, out = _new(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    dot = nt.nodes.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
    dot.inputs[1].default_value = Vector(direction).normalized()
    nt.links.new(tc.outputs["Object"], dot.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -span; mr.inputs["From Max"].default_value = span
    nt.links.new(dot.outputs["Value"], mr.inputs["Value"])
    ramp = _ramp(nt, stops); nt.links.new(mr.outputs[0], ramp.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = strength
    nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    # soft border from generated (0..1 box) coordinates
    g = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Generated"], g.inputs[0])
    ex = _math(nt, "MINIMUM", g.outputs["X"], _math(nt, "SUBTRACT", 1.0, g.outputs["X"]))
    ey = _math(nt, "MINIMUM", g.outputs["Y"], _math(nt, "SUBTRACT", 1.0, g.outputs["Y"]))
    sm = nt.nodes.new("ShaderNodeMapRange"); sm.interpolation_type = "SMOOTHSTEP"
    sm.inputs["From Min"].default_value = 0.0; sm.inputs["From Max"].default_value = edge
    nt.links.new(_math(nt, "MINIMUM", ex, ey), sm.inputs["Value"])
    endw = _math(nt, "ADD", base, _math(nt, "MULTIPLY", ends, _math(nt, "ABSOLUTE", _math(nt, "SUBTRACT", _math(nt, "MULTIPLY", mr.outputs[0], 2.0), 1.0))))
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = fade
    alpha = _math(nt, "MULTIPLY", _math(nt, "MULTIPLY", sm.outputs[0], endw), _math(nt, "SUBTRACT", 1.0, lw.outputs["Facing"]))
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(_math(nt, "SUBTRACT", 1.0, _math(nt, "MINIMUM", alpha, 1.0)), mix.inputs["Fac"])
    nt.links.new(em.outputs[0], mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


def lit(name, color, strength=1.2, fade=0.35):
    """A solid lit from inside: full light facing the camera, fading to clear at its rounded edges."""
    m, nt, out = _new(name)
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = color; em.inputs["Strength"].default_value = strength
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = fade
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lw.outputs["Facing"], mix.inputs["Fac"]); nt.links.new(em.outputs[0], mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


def glow(name, color, strength=1.2):
    m, nt, out = _new(name)
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = color; em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m


def no_shadow(*obs):
    """Glass must not block the lights from what sits inside it (brand look, and no caustic noise)."""
    for o in obs: o.visible_shadow = False


# ---------- studio: identical for every icon ----------
def _floor_mat(shadow, glow_ellipse):
    """Exact Sand emission floor carrying a soft ambient shadow and the Noor glow under the object."""
    m, nt, out = _new("SandFloor")
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])

    def M(op, a, b=None):
        n = nt.nodes.new("ShaderNodeMath"); n.operation = op
        for i, v in enumerate((a, b)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: nt.links.new(v, n.inputs[i])
        return n.outputs[0]

    def ellipse(cx, cy, rx, ry, power, angle=0.0):
        a = math.radians(angle); dx = M("SUBTRACT", sep.outputs["X"], cx); dy = M("SUBTRACT", sep.outputs["Y"], cy)
        u = M("ADD", M("MULTIPLY", dx, math.cos(a)), M("MULTIPLY", dy, math.sin(a)))
        v = M("SUBTRACT", M("MULTIPLY", dy, math.cos(a)), M("MULTIPLY", dx, math.sin(a)))
        ex = M("DIVIDE", u, rx); ey = M("DIVIDE", v, ry)
        d = M("SQRT", M("ADD", M("MULTIPLY", ex, ex), M("MULTIPLY", ey, ey)))
        return M("POWER", M("MAXIMUM", M("SUBTRACT", 1.0, d), 0.0), power)

    gx, gy, grx, gry, gamt = glow_ellipse
    gmask = M("MINIMUM", M("MULTIPLY", ellipse(gx, gy, grx, gry, 1.2), gamt), 0.9)
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = gx - grx; mr.inputs["From Max"].default_value = gx + grx
    nt.links.new(sep.outputs["X"], mr.inputs["Value"])
    ramp = _ramp(nt, ((0.12, COBALT), (0.42, VIOLET), (0.62, MAGENTA), (0.9, EMBER))); nt.links.new(mr.outputs[0], ramp.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"   # colour sockets: in 6/7, out 2
    nt.links.new(gmask, mix.inputs[0]); mix.inputs[6].default_value = SAND; nt.links.new(ramp.outputs["Color"], mix.inputs[7])

    # ambient shadow: a wide soft pool plus a tight contact line along the base, both turned with the object
    sx, sy, srx, sry, samt, sang = shadow
    smask = M("ADD", M("MULTIPLY", ellipse(sx, sy + 0.1, srx * 1.25, sry * 1.6, 1.6, sang), samt * 0.6),
              M("MULTIPLY", ellipse(sx, sy, srx * 0.85, sry * 0.45, 1.3, sang), samt))
    shade = M("SUBTRACT", 1.0, smask)
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
    mul.inputs[0].default_value = 1.0; nt.links.new(mix.outputs[2], mul.inputs[6])
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    for i in range(3): nt.links.new(shade, comb.inputs[i])
    nt.links.new(comb.outputs[0], mul.inputs[7])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 1.0
    nt.links.new(mul.outputs[2], em.inputs["Color"]); nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m


def studio(shadow=(0.0, 0.05, 1.0, 0.3, 0.2, 0.0), glow_ellipse=(0.0, 0.45, 1.9, 1.15, 1.25), target_z=1.05):
    """shadow = (x, y, radius x, radius y, depth, turn in degrees) on the floor; glow = (x, y, rx, ry, amount)."""
    sc = bpy.context.scene

    # world: soft studio dome for reflections; camera rays see exact Sand
    w = bpy.data.worlds.new("Studio"); sc.world = w; w.use_nodes = True; wn = w.node_tree
    bg = wn.nodes["Background"]; tc = wn.nodes.new("ShaderNodeTexCoord"); sep = wn.nodes.new("ShaderNodeSeparateXYZ")
    # a grey horizon band gives the bevels something darker to reflect, so glass edges read crisp
    wr = _ramp(wn, ((0.0, (0.62, 0.61, 0.6, 1)), (0.5, (0.36, 0.36, 0.37, 1)), (1.0, SAND)))
    wr.color_ramp.elements[1].position = 0.53; wr.color_ramp.elements[2].position = 0.72
    wn.links.new(tc.outputs["Generated"], sep.inputs[0]); wn.links.new(sep.outputs["Z"], wr.inputs[0])
    lp = wn.nodes.new("ShaderNodeLightPath"); mixw = wn.nodes.new("ShaderNodeMix"); mixw.data_type = "RGBA"
    nt_link = wn.links.new
    nt_link(lp.outputs["Is Camera Ray"], mixw.inputs[0]); nt_link(wr.outputs["Color"], mixw.inputs[6]); mixw.inputs[7].default_value = SAND
    nt_link(mixw.outputs[2], bg.inputs["Color"]); bg.inputs["Strength"].default_value = 1.0

    # floor
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, 0))
    fl = bpy.context.active_object; fl.name = "Floor"; fl.data.materials.append(_floor_mat(shadow, glow_ellipse))
    fl.visible_shadow = False

    # lights: one soft key, a long strip for the top-edge highlight, a warm rim, a little cool fill
    def area(name, loc, power, size, size_y=None, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, "AREA"); ld.energy = power; ld.color = color
        if size_y: ld.shape = "RECTANGLE"; ld.size, ld.size_y = size, size_y
        else: ld.size = size
        o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (Vector((0, 0, target_z)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area("Key", (-3.5, -5.0, 6.0), 420, 5)
    area("TopStrip", (0.0, -1.2, 6.5), 420, 8, 0.7)
    area("Rim", (3.8, 4.5, 3.5), 520, 3, color=(1.0, 0.9, 0.84))
    area("Fill", (5.0, -4.0, 1.2), 60, 4, color=(0.85, 0.9, 1.0))

    # camera: same 3/4 elevated view for the whole family
    cd = bpy.data.cameras.new("Cam"); cd.lens = 85
    cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam
    el, dist = math.radians(15), 9.6
    cam.location = (0, -dist * math.cos(el), target_z + dist * math.sin(el))
    cam.rotation_euler = (Vector((0, 0, target_z)) - cam.location).to_track_quat("-Z", "Y").to_euler()


def render(out_dir, name, quality="preview"):
    sc = bpy.context.scene; r = sc.render
    r.engine = "CYCLES"; sc.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences; prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = d.type == "METAL"
    size, samples = (2048, 512) if quality == "final" else (800, 160)
    r.resolution_x = r.resolution_y = size; sc.cycles.samples = samples; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 24; sc.cycles.transmission_bounces = 24; sc.cycles.glossy_bounces = 8
    r.film_transparent = False
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"  # brand hex stays exact
    r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGB"
    r.filepath = os.path.join(out_dir, f"{name}.png")
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out_dir, f"{name}.blend"))
    bpy.ops.render.render(write_still=True)
    print("DONE", r.filepath)
