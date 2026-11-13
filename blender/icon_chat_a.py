# Chats · variant A, a conversation (12 Nov): two frosted glass bubbles, the reply set back up and to the right with
# its tail the other way, the front one lit inside with the spectrum and carrying a message's two embossed lines and
# an Ember dot. Same studio, lean and turn as the family.
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spark_glass as sg
import chat_shapes as cs

out, quality = sg.args()
sg.reset()

T = 0.32
FRONT = T / 2

# the front bubble
FW, FH, FX, FY = 1.7, 1.16, -0.28, -0.22
front = sg.slab("Front", cs.rect_bubble(FW, FH, 0.38, 0.34), T, 0.12, res=12)
front.data.materials.append(sg.frosted_glass())
inner = sg.slab("FrontLight", cs.rect_bubble(FW, FH, 0.38, 0.34, inset=0.11), 0.03, 0.012, res=6)
inner.location.z = -FRONT + 0.07
inner.data.materials.append(sg.spectrum_light(direction=(0.75, 1, 0), span=1.1, strength=1.3, fade=0.3, edge=0.32, base=0.1, ends=0.9))

emboss = sg.frosted_glass("EmbossGlass", rough=0.14, tint=0.1)
LEFT = -FW / 2 + 0.28
marks = []
for i, (w, y) in enumerate(((0.98, 0.15), (0.6, -0.12))):
    ln = sg.slab(f"Line{i}", sg.pill(w, 0.11), 0.07, 0.03, res=6)
    ln.location = (LEFT + w / 2, y, FRONT - 0.006)
    ln.data.materials.append(emboss)
    marks.append(ln)
dot = sg.slab("Dot", sg.rounded_rect(0.18, 0.18, 0.09), 0.1, 0.045, res=8)
dot.location = (LEFT + 0.6 + 0.22, -0.12, FRONT - 0.004)
dot.data.materials.append(sg.lit("DotEmber", sg.EMBER, 1.8, 0.4))

fparts = [front, inner, *marks, dot]
fgroup = sg.group("FrontBubble", fparts, location=(FX, FY, 0))

# the reply: smaller, behind and above to the right, tail to the right, the light warmer (Ember side)
BW, BH, BX, BY = 1.36, 0.92, 0.42, 0.4
back = sg.slab("Back", cs.rect_bubble(BW, BH, 0.32, 0.28, flip=True), T * 0.9, 0.11, res=12)
back.data.materials.append(sg.frosted_glass("BackGlass", rough=0.38, tint=0.2))
binner = sg.slab("BackLight", cs.rect_bubble(BW, BH, 0.32, 0.28, inset=0.1, flip=True), 0.03, 0.012, res=6)
binner.location.z = -T * 0.45 + 0.07
binner.data.materials.append(sg.spectrum_light("BackSpectrum", direction=(1, 0.6, 0), span=1.0, strength=1.0, fade=0.35, edge=0.3, base=0.08, ends=0.8))
bgroup = sg.group("BackBubble", [back, binner], location=(BX, BY, -0.3))

sg.no_shadow(*fparts, back, binner)

LEAN, YAW = 10, -24
rx = math.radians(90 - LEAN)
low = -(FY - FH / 2 - 0.34) * 0.92   # how far the front tail reaches below the middle
base_z = low * math.sin(rx) + FRONT * math.cos(rx)
sg.group("Chat", [fgroup, bgroup], location=(0, 0, base_z), rotation=(90 - LEAN, 0, YAW))

sg.studio(shadow=(0.05, 0.12, 1.15, 0.36, 0.22, YAW), target_z=1.0)
sg.render(out, "chat_a", quality)
