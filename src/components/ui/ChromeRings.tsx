// Chrome rings (13 Nov, review, after dozfx.com's hero): two interlocked rings of liquid chrome, raymarched in a
// fragment shader, turning slowly and leaning toward the pointer. Chrome has almost no colour of its own: it shows the
// room it sits in, so the room is lit in Spark's colours: a soft white box above, a strip at the side, a Cobalt to
// Violet bounce from the floor and a thin Ember strip low on the left, which is what the rims catch. Behind it, speed
// lines in white, Cobalt, Violet and Ember drift across the card. Without WebGL2 the card keeps its ground and lines.
import { useEffect, useRef } from 'react';

const VERT = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2. - 1., 0., 1.); }`;

/** The chrome's room and Ask Dr.AI's tint, shared with ShapeMorph (Layout 4). */
export const CHROME_GLSL = `
/* the room the chrome reflects, in Spark's colours */
vec3 room(vec3 d){
  float y = d.y;
  vec3 cobalt = vec3(.118, .231, .839), violet = vec3(.353, .212, .831), ember = vec3(.91, .314, .122);
  vec3 c = mix(vec3(.012, .014, .028), vec3(.11, .115, .16), smoothstep(-.65, .04, y));
  c += vec3(.55, .58, .7) * smoothstep(-.03, .1, y) * (1. - smoothstep(.1, .4, y)) * .5;          /* horizon */
  c += vec3(.86, .89, 1.) * smoothstep(.28, .95, y) * .36;                                         /* sky */
  c += vec3(1.) * smoothstep(.75, .93, dot(d, normalize(vec3(-.45, .75, .5)))) * 1.8;              /* softbox, top left */
  c += vec3(1.) * smoothstep(.9, .975, dot(d, normalize(vec3(.75, .25, .6)))) * 1.5;               /* box, right */
  c += vec3(.95, .96, 1.) * smoothstep(.07, 0., abs(d.x + .6)) * smoothstep(-.3, .25, y) * 1.05;   /* strip, left */
  c *= .82 + .18 * smoothstep(-.4, .4, sin(y * 8.5 + d.x * 2.2));                                   /* the room's folds */
  /* the floor's bounce: Cobalt to Violet across the room, a band low down so the lower rims glow and faces stay chrome */
  vec3 bounce = mix(cobalt * 1.5, violet * 1.6, smoothstep(-.7, .7, d.x));
  c += bounce * smoothstep(-.05, -.24, y) * (1. - smoothstep(-.34, -.7, y)) * 1.35;
  /* a thin Ember strip low on the left: the warm spark on the rims */
  c += ember * 1.6 * smoothstep(.05, 0., abs(y + .46 + d.x * .12)) * smoothstep(.35, -.5, d.x);
  return c;
}

/* Ask Dr.AI's tint (MetalButton, tone spark): the Noor spectrum takes the hue, the chrome keeps its light. This is
   canvas's 'color' blend: the spectrum's hue and saturation at the chrome's own luminance */
vec3 spectrum(float s){
  vec3 c0 = vec3(.118, .231, .839), c1 = vec3(.353, .212, .831), c2 = vec3(.639, .227, .749), c3 = vec3(.91, .314, .122);
  s = clamp(s, 0., 1.) * 3.;
  return s < 1. ? mix(c0, c1, s) : s < 2. ? mix(c1, c2, s - 1.) : mix(c2, c3, s - 2.);
}
float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
vec3 setLum(vec3 c, float l){
  c += l - lum(c);
  float m = lum(c), lo = min(min(c.r, c.g), c.b), hi = max(max(c.r, c.g), c.b);
  if (lo < 0.) c = m + (c - m) * m / (m - lo);
  if (hi > 1.) c = m + (c - m) * (1. - m) / (hi - m);
  return c;
}
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform mat3 uRot;
uniform float uTime;
uniform float uTint;
out vec4 outColor;

float torus(vec3 p, float R, float r){ return length(vec2(length(p.xz) - R, p.y)) - r; }

/* two rings through each other's middle: one lying flat, one standing up, both tilted a little so the link reads */
float scene(vec3 w){
  vec3 p = uRot * w;
  const float R = .42, r = .145;
  vec3 a = p - vec3(-.21, 0., 0.);
  a.xy = mat2(.95, -.31, .31, .95) * a.xy;
  vec3 b = p - vec3(.21, 0., 0.);
  b.yz = mat2(.95, .31, -.31, .95) * b.yz;
  float d = min(torus(a, R, r), torus(b.xzy, R, r));
  /* a slow ripple over the surface: liquid, not machined */
  float rip = sin(p.x * 5.1 + uTime * 1.3) * sin(p.y * 4.3 - uTime * 1.1) * sin(p.z * 4.7 + uTime * .9);
  return d + rip * .007;
}

vec3 normalAt(vec3 p){
  vec2 e = vec2(.0018, 0.);
  return normalize(vec3(scene(p + e.xyy) - scene(p - e.xyy), scene(p + e.yxy) - scene(p - e.yxy), scene(p + e.yyx) - scene(p - e.yyx)));
}

${CHROME_GLSL}
void main(){
  vec2 uv = (gl_FragCoord.xy * 2. - uRes) / uRes.y;
  vec3 ro = vec3(0., 0., 3.75), rd = normalize(vec3(uv * .25, -1.));
  /* march only inside the sphere that holds the rings */
  float b = dot(ro, rd), c = dot(ro, ro) - .74, h = b * b - c;
  if (h < 0.) { outColor = vec4(0.); return; }
  h = sqrt(h);
  float t = -b - h, tEnd = -b + h, dMin = 1e9, tMin = t;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    float d = scene(ro + rd * t);
    if (d < dMin) { dMin = d; tMin = t; }
    if (d < .0006) { hit = true; break; }
    t += d * .8;
    if (t > tEnd) break;
  }
  /* a soft edge one pixel wide, so the silhouette is smooth without multisampling */
  float px = 2.2 / uRes.y * .25;
  float alpha = hit ? 1. : 1. - smoothstep(0., px * tMin, dMin);
  if (alpha <= 0.) { outColor = vec4(0.); return; }
  vec3 p = ro + rd * (hit ? t : tMin), n = normalAt(p), v = -rd;
  vec3 key = normalize(vec3(-.55, .7, .65));
  float occ = clamp(scene(p + n * .1) / .1, 0., 1.);
  occ = .45 + .55 * occ;
  float fres = .6 + .4 * pow(1. - max(dot(n, v), 0.), 4.);
  vec3 r = reflect(rd, n);
  /* the room is near: where the point sits shifts what it sees, so flat stretches carry gradients like real chrome */
  vec3 col = room(normalize(r + p * .36)) * fres * (.45 + .55 * occ);
  col += vec3(.03) * max(dot(n, key), 0.);
  col += pow(max(dot(reflect(-key, n), v), 0.), 90.) * 1.3;
  col = 1. - exp(-col * 1.85);
  if (uTint > 0.) {
    /* Cobalt at the bottom left to Ember at the top right, as on the button; what the surface reflects moves the
       colours over it as the rings turn */
    float s = .56 + (uv.x + uv.y) * .42 + r.x * .16 + r.y * .1;
    vec3 tinted = setLum(spectrum(s), lum(col));
    col = mix(col, tinted, uTint);
  }
  outColor = vec4(col * alpha, alpha);
}`;

// x, then y, then z
export function rotation(ax: number, ay: number, az: number): Float32Array {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
  return new Float32Array([
    cy * cz, cx * sz + sx * sy * cz, sx * sz - cx * sy * cz,
    -cy * sz, cx * cz - sx * sy * sz, sx * cz + cx * sy * sz,
    sy, -sx * cy, cx * cy,
  ]);
}

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The rings themselves, on a canvas that fills its box. */
export function ChromeRings({ className, tint = false }: { className?: string; tint?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    } catch {
      gl = null;
    }
    if (!gl) return;
    const make = (type: number, src: string) => {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) console.warn(gl!.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, make(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindVertexArray(gl.createVertexArray());
    gl.clearColor(0, 0, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uRot = gl.getUniformLocation(prog, 'uRot');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uTint = gl.getUniformLocation(prog, 'uTint');

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();

    // the pointer anywhere over the card leans the rings toward it
    const host = cv.closest('.qo-card, section, div') as HTMLElement | null;
    let tx = 0, ty = 0, lx = 0, ly = 0, boost = 0;
    const move = (e: PointerEvent) => {
      const r = (host ?? cv).getBoundingClientRect();
      tx = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
      ty = ((e.clientX - r.left) / r.width - 0.5) * 0.8;
    };
    const leave = () => ((tx = 0), (ty = 0));
    const kick = () => (boost = 2.4);
    host?.addEventListener('pointermove', move);
    host?.addEventListener('pointerleave', leave);
    host?.addEventListener('pointerdown', kick);

    let t = 4, spinY = 0.6, raf = 0, last = performance.now(), seen = true;
    const draw = () => {
      lx += (tx - lx) * 0.05;
      ly += (ty - ly) * 0.05;
      gl!.viewport(0, 0, cv.width, cv.height);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(uRes, cv.width, cv.height);
      gl!.uniformMatrix3fv(uRot, false, rotation(0.38 + t * 0.09 + lx, spinY + ly, 0.1 + Math.sin(t * 0.3) * 0.12));
      gl!.uniform1f(uTime, t);
      gl!.uniform1f(uTint, tint ? 1 : 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      boost *= Math.exp(-dt * 1.6);
      spinY += dt * (0.32 + boost);
      draw();
      raf = seen ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf && !still()) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(cv);
    if (still()) draw();
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host?.removeEventListener('pointermove', move);
      host?.removeEventListener('pointerleave', leave);
      host?.removeEventListener('pointerdown', kick);
      // the program goes, the context stays: React's dev double effect asks the same canvas for it again
      gl!.deleteProgram(prog);
    };
  }, [tint]);
  return <canvas ref={ref} className={className} aria-hidden />;
}

/** Speed lines across the box: short dashes drifting right to left, nearer ones longer, brighter and faster.
 *  quiet (Layout 4's band, 13 Nov, review): a few soft glints of the spectrum, slow, for inside a beam of light. */
export function SpeedLines({ className, quiet }: { className?: string; quiet?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const cx = cv?.getContext('2d');
    if (!cv || !cx) return;
    // mostly white, then Cobalt and Violet lifted for the dark, a few Ember
    const COLS = quiet
      ? ['150,170,255', '190,160,255', '240,150,230', '255,170,200', '255,180,140']
      : ['255,255,255', '255,255,255', '255,255,255', '140,160,255', '170,140,255', '255,128,82'];
    const [speed, many, bright, long] = quiet ? [0.3, 1 / 5, 0.38, 1.4] : [1, 1, 1, 1];
    type Dash = { x: number; y: number; z: number; col: string };
    let w = 0, h = 0, dpr = 1;
    let dashes: Dash[] = [];
    const seed = (x?: number): Dash => ({ x: x ?? Math.random(), y: Math.random(), z: Math.pow(Math.random(), 1.8), col: COLS[(Math.random() * COLS.length) | 0] });
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(2, Math.round(w * dpr));
      cv.height = Math.max(2, Math.round(h * dpr));
      const n = Math.round(((w * h) / 2600) * many);
      while (dashes.length < n) dashes.push(seed());
      dashes.length = n;
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();
    const draw = (dt: number) => {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.clearRect(0, 0, w, h);
      cx.lineCap = 'round';
      for (const d of dashes) {
        d.x -= dt * (0.025 + d.z * 0.16) * speed;
        if (d.x < -0.15) Object.assign(d, seed(1.1));
        const len = (8 + d.z * 46) * long;
        const x = d.x * w, y = d.y * h;
        const a = (0.14 + d.z * 0.55) * bright;
        const g = cx.createLinearGradient(x, 0, x + len, 0);
        g.addColorStop(0, `rgba(${d.col},${a})`);
        g.addColorStop(1, `rgba(${d.col},0)`);
        cx.strokeStyle = g;
        cx.lineWidth = 0.8 + d.z * 1.4;
        cx.beginPath();
        cx.moveTo(x, y);
        cx.lineTo(x + len, y);
        cx.stroke();
      }
    };
    let raf = 0, last = performance.now(), seen = true;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      raf = seen ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf && !still()) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(cv);
    if (still()) draw(0);
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [quiet]);
  return <canvas ref={ref} className={className} aria-hidden />;
}
