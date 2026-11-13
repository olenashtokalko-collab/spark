// Shape morph (13 Nov, review: "take the properties from dozfx.com, the same shapes, in our colours"): Layout 4's
// figure, built to the properties of dozfx's hero. Five soft shapes in turn: a cube with a soft bevel, a disc like a
// puck, a cone with a rounded rim and tip, a torus and two interlocked rings; then a sixth of ours
// (13 Nov, review), Spark's app icon: a soft tile with the white spark raised on its face. It changes every 3.4 s over 1.15 s,
// gathering into a drop half way so the change reads as liquid; it quivers as it lands. It turns slowly about all three
// axes (fast at first, settling), leans toward the pointer, and a click spins it and makes it quiver. Now and then the
// chrome "faults": it flickers and glows from inside for a moment. The material is the chrome of ChromeRings, its room
// lit in Spark's colours, tinted with the Noor spectrum as Ask Dr.AI's metal is (Cobalt, Violet, Magenta, Ember).
import { useEffect, useRef } from 'react';
import { CHROME_GLSL, rotation } from './ChromeRings';

const VERT = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2. - 1., 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform mat3 uRot;
uniform int uA, uB;
uniform float uK, uTime, uWob, uFlick;
out vec4 outColor;
${CHROME_GLSL}

float sdBox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float sdTorus(vec3 p, float R, float r){ return length(vec2(length(p.xz) - R, p.y)) - r; }
/* a cone cut flat at both ends: half height h, radius r1 at the foot, r2 at the top */
float sdCone(vec3 p, float h, float r1, float r2){
  vec2 q = vec2(length(p.xz), p.y), k1 = vec2(r2, h), k2 = vec2(r2 - r1, 2. * h);
  vec2 ca = vec2(q.x - min(q.x, q.y < 0. ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0., 1.);
  float s = (cb.x < 0. && ca.y < 0.) ? -1. : 1.;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
/* a round puck facing us: radius ra, half thickness h, edges rounded by rr */
float sdPuck(vec3 p, float ra, float h, float rr){
  vec2 d = vec2(length(p.xy) - ra + rr, abs(p.z) - h + rr);
  return min(max(d.x, d.y), 0.) + length(max(d, 0.)) - rr;
}

/* a star of n points, reach r; m how deep the cuts between them go (2 none, up to n) */
float star2(vec2 p, float r, float n, float m){
  float an = 3.14159265 / n, en = 3.14159265 / m;
  vec2 acs = vec2(cos(an), sin(an)), ecs = vec2(cos(en), sin(en));
  float bn = mod(atan(p.x, p.y), 2. * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p += ecs * clamp(-dot(p, ecs), 0., r * acs.y / ecs.y);
  return length(p) * sign(p.x);
}
/* Spark's spark, flat: four long points with deep curved cuts, a little taller than wide (the app icon, p. 36) */
float spark2(vec2 p){ return star2(p * vec2(1., .86), .44, 4., 3.4) * .86; }

/* each sits on its own centre of mass so it turns about itself; all inside a sphere of radius 1.1: the hero's five
   and Spark's icon */
float shape(int s, vec3 p){
  if (s == 0) return sdBox(p, vec3(.53), .19);                                   /* cube, soft bevel */
  if (s == 1) return sdPuck(p, .74, .17, .14);                                    /* disc */
  if (s == 2) return sdCone(p - vec3(0., .24, 0.), .47, .66, 0.) - .055;          /* cone, rounded rim and tip */
  if (s == 3) return sdTorus(p, .52, .27);                                        /* torus */
  if (s == 5) {                                                                    /* Spark's app icon: a soft tile, the spark raised on its face */
    float tile = sdBox(p, vec3(.6, .6, .17), .22);
    vec2 w = vec2(spark2(p.xy) + .02, abs(p.z - .17) - .07);
    return min(tile, min(max(w.x, w.y), 0.) + length(max(w, 0.)) - .02);
  }
  vec3 a = p - vec3(-.2, 0., 0.);                                                 /* two rings through each other */
  a.xy = mat2(.93, -.37, .37, .93) * a.xy;
  vec3 b = p - vec3(.2, 0., 0.);
  b.yz = mat2(.93, .37, -.37, .93) * b.yz;
  return min(sdTorus(a, .4, .125), sdTorus(b.xzy, .4, .125));
}

float smin(float a, float b, float k){ float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }

float scene(vec3 w){
  vec3 p = uRot * w;
  float k = smoothstep(0., 1., uK), m = sin(3.14159265 * clamp(uK, 0., 1.));
  float d = mix(shape(uA, p), shape(uB, p), k);
  /* half way it gathers into a drop, so the change reads as liquid, not as a cross-fade of geometry */
  d = mix(d, smin(d, length(p) - .62, .34), m * .6);
  float wv = sin(p.x * 4.6 + uTime * 1.6) * sin(p.y * 3.9 - uTime * 1.25) * sin(p.z * 4.3 + uTime * 1.05);
  return d + wv * (.006 + .045 * m + uWob);
}

vec3 normalAt(vec3 p){
  vec2 e = vec2(.002, 0.);
  return normalize(vec3(scene(p + e.xyy) - scene(p - e.xyy), scene(p + e.yxy) - scene(p - e.yxy), scene(p + e.yyx) - scene(p - e.yyx)));
}

void main(){
  vec2 uv = (gl_FragCoord.xy * 2. - uRes) / uRes.y;
  vec3 ro = vec3(0., 0., 6.), rd = normalize(vec3(uv * .215, -1.));
  float b = dot(ro, rd), c = dot(ro, ro) - 1.32, h = b * b - c;
  if (h < 0.) { outColor = vec4(0.); return; }
  h = sqrt(h);
  float t = -b - h, tEnd = -b + h, dMin = 1e9, tMin = t;
  bool hit = false;
  for (int i = 0; i < 120; i++) {
    float d = scene(ro + rd * t);
    if (d < dMin) { dMin = d; tMin = t; }
    if (d < .0007) { hit = true; break; }
    t += d * .72;
    if (t > tEnd) break;
  }
  float px = 2.2 / uRes.y * .215;
  float alpha = hit ? 1. : 1. - smoothstep(0., px * tMin, dMin);
  if (alpha <= 0.) { outColor = vec4(0.); return; }
  vec3 p = ro + rd * (hit ? t : tMin), n = normalAt(p), v = -rd;
  vec3 key = normalize(vec3(-.55, .7, .65));
  float occ = clamp(scene(p + n * .1) / .1, 0., 1.);
  occ = .45 + .55 * occ;
  float edge = pow(1. - max(dot(n, v), 0.), 4.);
  vec3 r = reflect(rd, n);
  /* chrome: no colour of its own, the room it reflects; Fresnel takes the edges to full mirror. The room is near, so
     where the point sits shifts what it sees and flat faces carry gradients like real chrome */
  vec3 col = room(normalize(r + p * .38)) * (.62 + .38 * edge) * (.45 + .55 * occ) + vec3(.03) * max(dot(n, key), 0.);
  col += pow(max(dot(reflect(-key, n), v), 0.), 90.) * 1.4;
  col = 1. - exp(-col * 1.9);
  /* our colours: the Noor spectrum takes the hue at the chrome's own light, Cobalt at the bottom left to Ember at the
     top right, as on Ask Dr.AI; what the surface reflects moves the colours over it as it turns */
  float s = .56 + (uv.x + uv.y) * .42 + r.x * .16 + r.y * .1;
  vec3 tone = spectrum(s);
  col = setLum(tone, lum(col));
  /* the icon's spark in white, as on the app icon, fading in and out with the icon itself */
  float icon = (uB == 5 ? smoothstep(0., 1., uK) : 0.) + (uA == 5 ? 1. - smoothstep(0., 1., uK) : 0.);
  if (icon > 0.) {
    vec3 lp = uRot * p;
    float on = (1. - smoothstep(-.004, .02, spark2(lp.xy))) * smoothstep(.13, .2, lp.z);
    col = mix(col, vec3(.9 + .1 * lum(col)), on * icon);
  }
  /* the fault: for a moment it burns from inside, brightest at its edges */
  vec3 burn = tone * (.5 + 1.6 * edge) + col * .6;
  col = mix(col, 1. - exp(-burn * 1.6), uFlick);
  outColor = vec4(col * alpha, alpha);
}`;

const ORDER = [0, 1, 2, 3, 4, 5]; // cube, disc, cone, torus, rings (the hero's own order), then Spark's app icon
const EVERY = 3.4; // seconds between changes
const MELT = 1.15; // seconds a change takes

const near = (a: number, b: number, f: number) => a + (b - a) * f;

export function ShapeMorph({ className }: { className?: string }) {
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
      const sh = gl!.createShader(type)!;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) console.warn(gl!.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, make(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindVertexArray(gl.createVertexArray());
    gl.clearColor(0, 0, 0, 0);
    const u = (n: string) => gl!.getUniformLocation(prog, n);
    const [uRes, uRot, uA, uB, uK, uTime, uWob, uFlick] = ['uRes', 'uRot', 'uA', 'uB', 'uK', 'uTime', 'uWob', 'uFlick'].map(u);

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

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // a and b the places in the set it goes from and to, k how far (1 = there); it starts on the first
    let a = 0, b = 0, k = 1, wob = 0, t = Math.random() * 20;
    let nextChange = t + EVERY;
    const turn = [0, 0, 0];
    const spin = [0.13, still ? 0.21 : 2.6, 0.05]; // fast at first about y, settling to 0.21
    let lean = [0, 0], aim = [0, 0];
    // the fault: a few quick on and off steps, then it fades
    let flick = 0, fault: [number, number][] | null = null, faultAt = 0, faultHold = 0, nextFault = t + 2.2;
    const startFault = () => {
      const steps: [number, number][] = [];
      let at = 0;
      const n = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        steps.push([at, i % 2 ? Math.random() * 0.15 : 0.75 + Math.random() * 0.25]);
        at += 0.035 + Math.random() * 0.075;
      }
      steps.push([at, 1]);
      fault = steps;
      faultAt = t;
      faultHold = at + 0.12 + Math.random() * 0.5;
    };
    const change = () => {
      a = k > 0.5 ? b : a;
      b = (b + 1) % ORDER.length;
      k = 0;
      wob = 0.02;
    };

    const host = cv.closest('.qb, .qo-card') as HTMLElement | null;
    const move = (e: PointerEvent) => {
      const r = (host ?? cv).getBoundingClientRect();
      aim = [((e.clientY - r.top) / r.height - 0.5) * 0.6, ((e.clientX - r.left) / r.width - 0.5) * 0.9];
    };
    const leave = () => (aim = [0, 0]);
    const poke = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) return;
      wob = 0.06;
      spin[1] += 1.6;
    };
    host?.addEventListener('pointermove', move);
    host?.addEventListener('pointerleave', leave);
    host?.addEventListener('pointerdown', poke);

    const step = (dt: number) => {
      t += dt;
      if (k < 1) k = Math.min(1, k + dt / MELT);
      wob *= Math.exp(-dt * 2.2);
      if (t > nextChange) {
        change();
        nextChange = t + EVERY;
      }
      if (t > nextFault) {
        startFault();
        nextFault = t + 3 + Math.random() * 4.5;
      }
      let f = 0;
      if (fault) {
        const since = t - faultAt;
        if (since < faultHold) {
          for (const [at, v] of fault) if (since >= at) f = v;
        } else {
          f = Math.exp(-(since - faultHold) * 5);
          if (f < 0.01) (f = 0), (fault = null);
        }
      }
      flick = f;
      spin[1] = near(spin[1], 0.21, 1 - Math.exp(-dt * 0.8));
      for (let i = 0; i < 3; i++) turn[i] += spin[i] * dt;
      const ease = 1 - Math.exp(-dt * 2);
      lean = [near(lean[0], aim[0], ease), near(lean[1], aim[1], ease)];
    };
    const draw = () => {
      gl!.viewport(0, 0, cv.width, cv.height);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(uRes, cv.width, cv.height);
      gl!.uniformMatrix3fv(uRot, false, rotation(0.42 + turn[0] + lean[0], 0.7 + turn[1] + lean[1], turn[2]));
      gl!.uniform1i(uA, ORDER[a]);
      gl!.uniform1i(uB, ORDER[b]);
      gl!.uniform1f(uK, k);
      gl!.uniform1f(uTime, t);
      gl!.uniform1f(uWob, wob);
      gl!.uniform1f(uFlick, flick);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    };

    let raf = 0, last = performance.now(), seen = true;
    const frame = (now: number) => {
      step(Math.min(0.05, (now - last) / 1000));
      last = now;
      draw();
      raf = seen ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([en]) => {
      seen = en.isIntersecting;
      if (seen && !raf && !still) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(cv);
    if (still) draw();
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host?.removeEventListener('pointermove', move);
      host?.removeEventListener('pointerleave', leave);
      host?.removeEventListener('pointerdown', poke);
      gl!.deleteProgram(prog);
    };
  }, []);
  return <canvas ref={ref} className={className} aria-hidden />;
}
