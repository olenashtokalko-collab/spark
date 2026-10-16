import { useEffect, useRef, useState } from 'react';
import { cx } from './primitives';

/**
 * The AI's orb (after the ElevenLabs voice orbs): a lit 3D sphere with colour
 * waves flowing across its surface, a soft rim light and fine grain.
 *
 * One shared WebGL renderer draws every orb on the page and copies each frame
 * into the orb's own 2D canvas, so a long chat with many avatars never runs out
 * of WebGL contexts. The flow speeds up smoothly while the client types or the
 * assistant works (`active`); `still` draws a single frame. Without WebGL the
 * orb falls back to a CSS gradient. `glass` swaps in the brand look after the
 * ElevenLabs orbs: one soft, slowly drifting field of Spark colours (Cobalt,
 * violet, pink, Ember, peach) that melt into each other, airbrushed light and
 * dark clouds, fine grain, no outline or highlight. It defaults to on in the
 * Brand A theme, so every orb follows the theme.
 */
export function FluidOrb({
  size = 200,
  active = false,
  boost = false,
  still = false,
  glass,
  squircle,
  className,
}: {
  size?: number;
  active?: boolean;
  /** Spark at work: the light races (faster than `active`). */
  boost?: boolean;
  still?: boolean;
  glass?: boolean;
  /** Fill the reference squircle instead of a circle. */
  squircle?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const orb = useRef<Orb>();
  const brandTheme = useBrandTheme();
  const isGlass = glass ?? brandTheme;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const o: Orb = { canvas, active, boost, still, glass: isGlass, squircle: !!squircle, phase: Math.random() * 40, speed: active ? FAST : 1, drawn: false };
    orb.current = o;
    return renderer()?.add(o);
  }, [still, isGlass, squircle]);

  useEffect(() => {
    if (orb.current) orb.current.active = active;
  }, [active]);
  useEffect(() => {
    if (orb.current) orb.current.boost = boost;
  }, [boost]);

  return (
    <div
      className={cx('forb', size < 60 && 'forb--sm', isGlass && 'forb--glass', squircle && 'forb--squircle', className)}
      style={{ width: size, height: size, ['--s' as string]: size }}
      aria-hidden
    >
      <canvas ref={ref} className="forb__ball" />
    </div>
  );
}

/** True while the Brand A ('sand') theme is on; follows theme switches. */
function useBrandTheme() {
  const read = () => document.documentElement.dataset.theme === 'sand';
  const [on, setOn] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setOn(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return on;
}

// ---- Shared renderer -------------------------------------------------------------------

interface Orb {
  canvas: HTMLCanvasElement;
  active: boolean;
  boost: boolean;
  still: boolean;
  glass: boolean;
  squircle: boolean;
  phase: number;
  speed: number;
  drawn: boolean;
}

const FAST = 2.6;
const BOOST = 6;

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uGlass;
uniform float uShape;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

// Brand ramp for the glass orb: Cobalt, violet, pink, Ember, peach, blended
// with smooth steps so neighbouring colours melt into each other.
vec3 noorRamp(float x){
  float s=clamp(x,0.0,1.0)*4.0;
  vec3 c=mix(vec3(0.16,0.27,0.86),vec3(0.56,0.40,0.95),smoothstep(0.0,1.0,s));
  c=mix(c,vec3(0.96,0.52,0.76),smoothstep(1.0,2.0,s));
  c=mix(c,vec3(0.94,0.42,0.20),smoothstep(2.0,3.0,s));
  c=mix(c,vec3(1.0,0.80,0.60),smoothstep(3.0,4.0,s));
  return c;
}

void main(){
  vec2 p=(gl_FragCoord.xy/uRes)*2.0-1.0;
  float r=length(p);
  float aa=3.0/uRes.x;
  // The edge: a circle, or the squircle (a superellipse a little squarer than a rounded square).
  vec2 ap=abs(p);
  float edge=mix(r,pow(pow(ap.x,4.0)+pow(ap.y,4.0),0.25),uShape);
  float mask=1.0-smoothstep(1.0-aa,1.0,edge);
  if(mask<=0.0){gl_FragColor=vec4(0.0);return;}

  // A point on the sphere's surface, turning slowly so the waves wrap around it.
  float rz=mix(r,r*0.72,uShape);
  vec3 n=vec3(p,sqrt(max(0.0,1.0-rz*rz)));
  float t=uTime;
  vec3 q=n;
  q.xz=rot(t*0.12)*q.xz;
  q.yz=rot(0.35)*q.yz;
  q*=0.62;

  // Domain-warped noise: soft colour waves that fold into each other.
  vec3 w=vec3(snoise(q*0.8+vec3(0.0,0.0,t*0.12)),snoise(q*0.8+vec3(5.2,1.3,t*0.1)),snoise(q*0.8+vec3(2.1,7.7,-t*0.11)));
  float f=snoise(q+w*0.45+vec3(0.0,t*0.06,0.0));
  float g=snoise(q*0.8-w*0.35+vec3(3.0,0.0,t*0.04));

  vec3 deep=vec3(0.06,0.07,0.32);
  vec3 blue=vec3(0.16,0.38,1.0);
  vec3 violet=vec3(0.48,0.24,0.96);
  vec3 amber=vec3(1.0,0.64,0.26);
  vec3 cream=vec3(1.0,0.86,0.62);

  // A fixed composition (violet top left, blue top right, amber below) that
  // the waves keep pushing around, so the light flows but the orb stays itself.
  vec3 col=mix(deep,blue,smoothstep(-0.9,0.6,f*0.7+n.y*0.5+0.2));
  col=mix(col,violet,smoothstep(-0.25,0.75,-n.x*0.75+n.y*0.35+g*0.65)*0.9);
  col=mix(col,amber*1.06,smoothstep(0.0,0.8,-n.y*0.85+f*0.55-g*0.25));
  col=mix(col,cream,smoothstep(0.3,0.95,-n.y*0.6+f*0.6)*0.65);

  // Light from the top left: shading, a bright sheen and a darker far side.
  vec3 L=normalize(vec3(-0.55,0.6,0.75));
  float diff=clamp(dot(n,L),0.0,1.0);
  col*=0.6+0.55*diff;
  vec3 H=normalize(L+vec3(0.0,0.0,1.0));
  col+=vec3(1.0,0.95,0.9)*pow(clamp(dot(n,H),0.0,1.0),22.0)*0.2;
  col+=vec3(1.0)*smoothstep(0.55,0.0,length(p-vec2(-0.38,0.42)))*0.07;

  // Rim light: a thin cool edge, brighter opposite the light (back light).
  float fr=pow(1.0-n.z,2.6);
  float back=0.45+0.55*clamp(dot(normalize(p+1e-4),vec2(0.7,-0.55)),0.0,1.0);
  col+=fr*mix(blue,vec3(0.75,0.7,1.0),0.4)*0.55*back;
  col*=1.0-0.3*smoothstep(0.7,1.0,r)*(1.0-back);

  // Glass (Brand A), after the ElevenLabs "Narration" orb: one soft field of
  // colour that drifts slowly, mapped through the brand ramp so the colours
  // melt into each other. No outline, no highlight, no edge darkening: the
  // depth comes from darker and lighter clouds inside the colour itself.
  if(uGlass>0.5){
    vec3 s1=q*0.75+w*0.35;
    float c1=snoise(s1+vec3(0.0,t*0.05,t*0.04));
    float c2=snoise(s1*1.6+vec3(c1*0.5,-t*0.06,t*0.05));
    // Slow travel through the ramp, so the mood shifts from blue to warm and back.
    float v=0.5+0.42*(c1*0.75+c2*0.25)+0.22*sin(t*0.12)+0.12*n.y-0.08*n.x;
    vec3 b=noorRamp(v);
    // Soft tonal clouds: deeper and lighter patches, like airbrushed paint.
    float shade=snoise(s1*1.2+vec3(5.0,t*0.04,2.0));
    b*=1.0-0.18*smoothstep(0.1,0.8,shade);
    b=mix(b,vec3(1.0,0.93,0.86),0.22*smoothstep(0.2,0.9,-shade+n.y*0.4));
    // A gentle sense of volume from the top left, without darkening the rim.
    b*=0.94+0.1*clamp(dot(n,normalize(vec3(-0.45,0.6,0.65))),0.0,1.0);
    col=clamp(b,0.0,1.0);
  }

  // Fine film grain.
  col+=(hash(gl_FragCoord.xy)-0.5)*(uGlass>0.5?0.06:0.09);

  col=clamp(col,0.0,1.0);
  gl_FragColor=vec4(col*mask,mask);
}`;

let shared: { add: (o: Orb) => () => void } | null | undefined;

function renderer() {
  if (shared !== undefined) return shared;
  const glCanvas = document.createElement('canvas');
  const gl = glCanvas.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
  if (!gl) return (shared = null);

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('FluidOrb shader:', gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return (shared = null);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uGlass = gl.getUniformLocation(prog, 'uGlass');
  const uShape = gl.getUniformLocation(prog, 'uShape');
  gl.clearColor(0, 0, 0, 0);

  const orbs = new Set<Orb>();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  let last = 0;

  const draw = (o: Orb) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.max(8, Math.round(o.canvas.clientWidth * dpr));
    if (o.canvas.width !== px || o.canvas.height !== px) {
      o.canvas.width = o.canvas.height = px;
    }
    if (glCanvas.width < px || glCanvas.height < px) {
      glCanvas.width = glCanvas.height = Math.max(px, glCanvas.width);
    }
    gl.viewport(0, 0, px, px);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, px, px);
    gl.uniform1f(uTime, o.phase);
    gl.uniform1f(uGlass, o.glass ? 1 : 0);
    gl.uniform1f(uShape, o.squircle ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const ctx = o.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(glCanvas, 0, glCanvas.height - px, px, px, 0, 0, px, px);
    o.drawn = true;
  };

  const visible = (c: HTMLCanvasElement) => {
    const b = c.getBoundingClientRect();
    return b.width > 0 && b.bottom > 0 && b.top < window.innerHeight;
  };

  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    let moving = false;
    for (const o of orbs) {
      const frozen = o.still || reduced.matches;
      if (frozen) {
        if (!o.drawn && visible(o.canvas)) draw(o);
        continue;
      }
      moving = true;
      // Ease the speed so the flow speeds up and settles smoothly.
      o.speed += ((o.boost ? BOOST : o.active ? FAST : 1) - o.speed) * Math.min(1, dt * 3);
      o.phase += dt * o.speed;
      if (visible(o.canvas)) draw(o);
    }
    raf = moving || [...orbs].some((o) => !o.drawn) ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  };

  return (shared = {
    add(o) {
      orbs.add(o);
      if (!raf) raf = requestAnimationFrame(tick);
      return () => {
        orbs.delete(o);
      };
    },
  });
}
