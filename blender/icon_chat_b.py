# Chats · variant B, someone typing (12 Nov): a round frosted glass bubble, a disc like the request icon's with a soft
# tail drawn out of its lower left, the spectrum lit inside it, and three lit Ember dots across its face, the first
# full, the next at 70 %, the last at 50 % (review: one colour, fading, as a typing indicator).
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg
import chat_shapes as cs

out, quality = sg.args()
sg.reset()

RAD, T, TAIL = 0.82, 0.42, 0.4
FRONT = T / 2

body = sg.slab("Bubble", cs.round_bubble(RAD, TAIL, spread=(30, 22)), T, 0.12, res=14)
body.data.materials.append(sg.frosted_glass())
inner = sg.slab("InnerLight", cs.round_bubble(RAD, TAIL, spread=(30, 22), inset=0.12), 0.03, 0.012, res=8)
inner.location.z = -FRONT + 0.08
inner.data.materials.append(sg.spectrum_light(direction=(0.75, 1, 0), span=1.1, strength=1.2, fade=0.3, edge=0.32, base=0.1, ends=0.9))

def lit_fill(name, color, fill, strength=1.7, fade=0.4):
    """sg.lit with its light at `fill` (0..1): the rest clear, so the glass and its spectrum show through."""
    # a lit solid shows its colour through both faces, so clearing it alone barely shows: the colour also thins
    # toward the glass's own pale light, as a tint at that strength would
    pale = (1.0, 0.93, 0.95, 1.0)
    color = tuple(c * fill + p * (1 - fill) for c, p in zip(color[:3], pale[:3])) + (1.0,)
    m = sg.lit(name, color, strength * (0.55 + 0.45 * fill), fade)
    nt = m.node_tree
    lw = next(n for n in nt.nodes if n.type == "LAYER_WEIGHT")
    mix = next(n for n in nt.nodes if n.type == "MIX_SHADER")
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = fill
    nt.links.new(lw.outputs["Facing"], mul.inputs[0]); nt.links.new(mul.outputs[0], mix.inputs["Fac"])
    return m


dots = []
for i, fill in enumerate((1.0, 0.85, 0.72)):  # softer steps (12 Nov, review)
    d = sg.slab(f"Dot{i}", sg.rounded_rect(0.24, 0.24, 0.12), 0.12, 0.055, res=10)
    d.location = ((i - 1) * 0.38, 0.0, FRONT - 0.01)
    d.data.materials.append(lit_fill(f"Dot{i}Lit", sg.EMBER, fill))
    dots.append(d)

parts = [body, inner, *dots]
sg.no_shadow(*parts)

LEAN, YAW = 6, -16
rx = math.radians(90 - LEAN)
low = RAD + TAIL * 0.8
base_z = low * math.sin(rx) + FRONT * math.cos(rx)
sg.group("Chat", parts, location=(0, 0, base_z), rotation=(90 - LEAN, 0, YAW))

sg.studio(shadow=(0.0, 0.05, 0.85, 0.3, 0.22, YAW), target_z=0.95)
sg.render(out, "chat_b", quality)
