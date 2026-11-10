# Latest from Spark · a frosted glass bell: classic bell silhouette, soft spectrum light inside,
# a glass clapper below, a loop on top and an Ember notification dot.
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg

out, quality = sg.args()
sg.reset()

LIFT = 0.42  # the bell rests on its clapper, a hand's breadth above the floor

# (radius, z): from the crown down the outside, round the rim, back in along a shallow hollow underneath
PROFILE = [
    (0.0, 1.86), (0.2, 1.84), (0.36, 1.78), (0.46, 1.67), (0.52, 1.52), (0.55, 1.33), (0.58, 1.12),
    (0.63, 0.9), (0.7, 0.68), (0.8, 0.48), (0.9, 0.33), (0.97, 0.24), (1.0, 0.17), (0.99, 0.1),
    (0.94, 0.06), (0.84, 0.07), (0.62, 0.13), (0.3, 0.17), (0.0, 0.18),
]
bell = sg.lathe("Bell", [(r, z + LIFT) for r, z in PROFILE], segments=128, smooth=12)
bell.data.materials.append(sg.frosted_glass())

# light inside the bell: Cobalt low on the left → Ember high on the right
# shaped like the bell itself, a little smaller, centred so the spectrum runs across it
MID = 1.0
core = sg.lathe("BellLight", [(r * 0.8, (z - MID) * 0.8) for r, z in PROFILE], segments=128, smooth=12)
core.location.z = MID + LIFT
core.data.materials.append(sg.spectrum_light(direction=(1, 0, 0.75), span=0.8, strength=1.35, fade=0.3, edge=0.28, base=0.35, ends=0.65))

# clapper: a frosted glass ball the bell rests on
clapper = sg.sphere("Clapper", 0.22, location=(0, 0, 0.22))
clapper.data.materials.append(sg.frosted_glass("ClapperGlass", rough=0.2, tint=0.1))

# loop on top
bpy = sg.bpy
bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.045, major_segments=64, minor_segments=24,
                                 location=(0, 0, 1.86 + LIFT + 0.1), rotation=(math.radians(90), 0, 0))
loop = bpy.context.active_object; loop.name = "Loop"
loop.data.polygons.foreach_set("use_smooth", [True] * len(loop.data.polygons))
loop.data.materials.append(sg.frosted_glass("LoopGlass", rough=0.2, tint=0.1))

# notification dot: a small glass ball with an Ember light inside, at the bell's right shoulder
dot_at = (0.62, -0.32, 1.62 + LIFT)
dot = sg.sphere("Dot", 0.2, location=dot_at)
dot.data.materials.append(sg.frosted_glass("DotGlass", rough=0.12, tint=0.05))
dot_core = sg.sphere("DotLight", 0.13, location=dot_at)
dot_core.data.materials.append(sg.lit("DotEmber", sg.EMBER, 1.7, 0.4))

sg.no_shadow(bell, core, clapper, loop, dot, dot_core)
icon = sg.group("BellIcon", [bell, core, clapper, loop, dot, dot_core], rotation=(0, 0, -18))
icon.scale = (0.9, 0.9, 0.9)  # same visual size as the report sheet

sg.studio(shadow=(0.0, 0.0, 0.75, 0.45, 0.22, 0), target_z=1.05)
sg.render(out, "bell", quality)
