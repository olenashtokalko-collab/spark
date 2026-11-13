# Frames → web video, with Blender's own ffmpeg (no ffmpeg on this Mac). Writes an H.264 MP4 and a VP9 WebM.
#   Blender -b --factory-startup -P blender/encode_video.py -- <frames_dir> <prefix> <out_base> [fps]
# e.g. ... -- blender/renders/morph f_ public/brand/morph/morph 30
import bpy, os, sys

a = sys.argv[sys.argv.index("--") + 1:]
frames_dir, prefix, out_base = os.path.abspath(a[0]), a[1], os.path.abspath(a[2])
fps = int(a[3]) if len(a) > 3 else 30
files = sorted(f for f in os.listdir(frames_dir) if f.startswith(prefix) and f.endswith(".png"))
assert files, "no frames"
os.makedirs(os.path.dirname(out_base), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
w, h = bpy.data.images.load(os.path.join(frames_dir, files[0])).size
sed = sc.sequence_editor_create()
strips = sed.strips if hasattr(sed, "strips") else sed.sequences
st = strips.new_image(name="frames", filepath=os.path.join(frames_dir, files[0]), channel=1, frame_start=1)
for f in files[1:]:
    st.elements.append(f)
sc.frame_start, sc.frame_end = 1, len(files)
r = sc.render
r.fps = fps
r.resolution_x, r.resolution_y, r.resolution_percentage = w, h, 100
sc.view_settings.view_transform = "Standard"
ims = r.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "VIDEO"
ims.file_format = "FFMPEG"
ims.color_mode = "RGB"
ff = r.ffmpeg

for fmt, codec, ext in (("MPEG4", "H264", "mp4"), ("WEBM", "WEBM", "webm")):
    ff.format = fmt
    ff.codec = codec
    ff.constant_rate_factor = "HIGH"
    ff.ffmpeg_preset = "BEST"
    ff.gopsize = 12
    ff.audio_codec = "NONE"
    r.filepath = f"{out_base}.{ext}"
    r.use_file_extension = False
    bpy.ops.render.render(animation=True)
    print("ENCODED", r.filepath, os.path.getsize(r.filepath))
