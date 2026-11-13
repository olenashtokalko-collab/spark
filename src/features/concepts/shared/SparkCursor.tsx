import { useEffect, useRef } from 'react'

/* The landing's liquid-glass cursor (sparkstudios.ae/js/lens.js), brought into the portal at the designer's request
   (12 Nov: "pull the element that flies after the mouse from the landing and let it follow the mouse here, in every
   variant"). On the site the glass morphs between four shapes and refracts the headlines; here it is the spark star
   only — a glass body with the Noor rim and a highlight — and it does not touch the text under it.
   Same mechanics as the site: a small WebGL square travels with the glass (not a full-screen overlay), a spring pulls
   it to the pointer, it stretches a little with speed, and it fades when the pointer leaves the window.
   Off on touch devices, narrow screens, reduced motion, when WebGL is unavailable, and with ?nolens. */

// the brand star (brand kit, Spark_star.svg), as on the site
const STAR_D = 'M465.9,1051.18c0-.34,4.79-165.34,18.74-246.89,10.06-49.31,24.58-94.09,48.19-137.9,69.51-109.84,226.31-169.71,353.87-167.91h.04c-81.97-4.67-180.03-16.57-263.97-53.93-67.17-29.89-114.99-97.19-132.23-170.05-15.23-64.37-21.79-130.73-23.34-197.88l-2.31-76.63c-.15,89.58-6.42,173.31-23.61,257.89-.75,3.69-1.64,7.29-2.53,10.89-5.65,22.88-14.12,43.99-25.23,63.17-28.23,51.58-72.71,96.98-123.03,118.83-97.01,42.13-183.93,64.6-290.5,63.93,88.34-.8,175.84,11.91,257.93,45.06,108.85,43.95,159.58,111.08,182.86,226.01,1.67,8.27,3.18,16.54,4.68,24.81,14.39,79.23,20.32,158.81,20.43,240.6Z'

const RAD = 52                 // css px; the star is about 2.6× this tall (the site uses 70: a product screen is denser)
const HALO = RAD * 1.6 + 40    // css px around the glass centre
const CS = Math.ceil(HALO * 2) // the canvas is a CS × CS square that follows the glass

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FS = `precision highp float;
const float RIMTINT=.45;
uniform sampler2D S;uniform vec2 RES,C,SDIM,SCEN,SQ,LT;uniform float R,TM,K,GA,SSC;
float sdStar(vec2 p){vec2 g=p/SSC+SCEN;float v=texture2D(S,clamp(g/SDIM,0.,1.)).r;
 vec2 o=max(abs(g-SDIM*.5)-SDIM*.5,0.);return ((v*255.-128.)*40./127.+length(o))*SSC;}
vec3 noor(float x){x=clamp(x,0.,1.);vec3 a=vec3(.12,.23,.84),b=vec3(.48,.24,.94),c=vec3(.85,.21,.56),d=vec3(.91,.31,.12);
 return x<.33?mix(a,b,x/.33):x<.66?mix(b,c,(x-.33)/.33):mix(c,d,(x-.66)/.34);}
float shape(vec2 p){return sdStar(p/SQ);}
void main(){
 vec2 px=vec2(gl_FragCoord.x,RES.y-gl_FragCoord.y);vec2 p=px-C;
 float d=shape(p);float sc=R/(95.*K);
 if(d>1.5*K){gl_FragColor=vec4(0.);return;}
 vec4 col=vec4(0.);
 if(d<0.){
  float e=.8;vec2 n=normalize(vec2(shape(p+vec2(e,0.))-shape(p-vec2(e,0.)),shape(p+vec2(0.,e))-shape(p-vec2(0.,e)))+1e-5);
  float rim=clamp(1.+d/(48.*K*sc),0.,1.);
  float ang=atan(n.y,n.x);vec3 tint=noor(.5+.5*sin(ang+TM*.4));
  float ga=.10+.30*pow(rim,1.4);
  vec3 gc=mix(vec3(1.),tint,RIMTINT*.78*pow(rim,1.1));
  vec4 glass=vec4(gc*ga,ga);
  vec2 ld=normalize(LT-C+1e-5);
  float sp=pow(max(dot(n,-ld),0.),6.)*pow(rim,5.)*.95+pow(max(dot(n,ld),0.),10.)*pow(rim,7.)*.35;
  float edge=smoothstep(0.,1.5*K,-d)*(1.-smoothstep(1.5*K,3.5*K,-d));
  vec4 hi=vec4(vec3(1.)*(sp+edge*.6),sp+edge*.6);
  vec4 g2=glass+hi*(1.-glass.a*.5);
  col=mix(col,g2,smoothstep(0.,1.2*K,-d)*GA);
 }
 gl_FragColor=col;}`

/** The brand star as a signed-distance field (exact Euclidean distance transform), packed 128 = edge, 127 steps = 40px. */
function starField() {
  const SG = 200, PAD = 40, SK = SG / 1051.18
  const SW = Math.ceil(886.74 * SK) + PAD * 2, SH = SG + PAD * 2
  const c = document.createElement('canvas'); c.width = SW; c.height = SH
  const x = c.getContext('2d')!
  x.translate(PAD, PAD); x.scale(SK, SK); x.fill(new Path2D(STAR_D))
  const a = x.getImageData(0, 0, SW, SH).data, N = SW * SH, inside = new Uint8Array(N)
  for (let i = 0; i < N; i++) inside[i] = a[i * 4 + 3] > 127 ? 1 : 0
  const edt = (target: number) => {
    const INF = 1e10, f = new Float64Array(N)
    for (let i = 0; i < N; i++) f[i] = inside[i] === target ? 0 : INF
    const pass = (len: number, get: (q: number) => number, set: (q: number, v: number) => void) => {
      const d = new Float64Array(len), v = new Int32Array(len), z = new Float64Array(len + 1), src = new Float64Array(len)
      for (let q = 0; q < len; q++) src[q] = get(q)
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF
      for (let q = 1; q < len; q++) {
        let s = 0
        while (true) {
          const r = v[k]
          s = ((src[q] + q * q) - (src[r] + r * r)) / (2 * q - 2 * r)
          if (s <= z[k]) { k--; if (k < 0) { k = 0; break } } else break
        }
        k++; v[k] = q; z[k] = s; z[k + 1] = INF
      }
      k = 0
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const r = v[k]; d[q] = (q - r) * (q - r) + src[r] }
      for (let q = 0; q < len; q++) set(q, d[q])
    }
    for (let xx = 0; xx < SW; xx++) pass(SH, q => f[q * SW + xx], (q, val) => { f[q * SW + xx] = val })
    for (let yy = 0; yy < SH; yy++) pass(SW, q => f[yy * SW + q], (q, val) => { f[yy * SW + q] = val })
    return f
  }
  const dOut = edt(1), dIn = edt(0), px = new Uint8Array(N)
  for (let i = 0; i < N; i++) {
    const sd = inside[i] ? -(Math.sqrt(dIn[i]) - .5) : Math.sqrt(dOut[i]) - .5
    px[i] = Math.max(0, Math.min(255, Math.round(128 + sd * 127 / 40)))
  }
  return { px, SW, SH, SG, SCX: PAD + 446 * SK, SCY: PAD + 500 * SK }
}

export default function SparkCursor() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (/[?&]nolens/.test(location.search)) return
    if (!matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true })
    if (!gl) return

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5)
    cv.width = cv.height = Math.round(CS * DPR)
    cv.style.width = cv.style.height = CS + 'px'
    gl.viewport(0, 0, cv.width, cv.height)

    const sh = (t: number, s: string) => {
      const o = gl.createShader(t)!
      gl.shaderSource(o, s); gl.compileShader(o)
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) || 'shader')
      return o
    }
    let prg: WebGLProgram
    try {
      prg = gl.createProgram()!
      gl.attachShader(prg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prg, sh(gl.FRAGMENT_SHADER, FS))
      gl.linkProgram(prg); gl.useProgram(prg)
    } catch (e) { console.warn('spark cursor disabled:', (e as Error).message); return }
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const lp = gl.getAttribLocation(prg, 'p')
    gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0)
    const U = Object.fromEntries(['S', 'RES', 'C', 'SDIM', 'SCEN', 'SQ', 'LT', 'R', 'TM', 'K', 'GA', 'SSC'].map(k => [k, gl.getUniformLocation(prg, k)]))

    const star = starField()
    const st = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, st)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, star.SW, star.SH, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, star.px)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(U.S, 0); gl.uniform2f(U.SDIM, star.SW, star.SH); gl.uniform2f(U.SCEN, star.SCX, star.SCY)
    gl.uniform2f(U.RES, cv.width, cv.height); gl.uniform2f(U.C, HALO * DPR, HALO * DPR)
    gl.uniform1f(U.R, RAD * DPR); gl.uniform1f(U.K, DPR); gl.uniform1f(U.SSC, 2.6 * RAD * DPR / star.SG)
    gl.uniform2f(U.LT, (HALO + 300) * DPR, (HALO - 400) * DPR) // light up-right of the glass

    // motion: a quick spring to the pointer; hidden until the pointer first moves, fades when it leaves the window
    const lens = { x: innerWidth * .5, y: innerHeight * .5, vx: 0, vy: 0 }
    let tx = lens.x, ty = lens.y, inside = false, placed = false, ga = 0
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY; inside = true
      if (!placed) { placed = true; lens.x = tx; lens.y = ty }
    }
    const onOut = (e: PointerEvent) => { if (!e.relatedTarget) inside = false }
    addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut)

    let raf = 0, last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(.033, (now - last) / 1000); last = now
      const kS = 90, kD = 14
      lens.vx += ((tx - lens.x) * kS - lens.vx * kD) * dt; lens.vy += ((ty - lens.y) * kS - lens.vy * kD) * dt
      lens.x += lens.vx * dt; lens.y += lens.vy * dt
      ga += ((inside ? 1 : 0) - ga) * (1 - Math.exp(-dt * 6))
      cv.style.transform = `translate3d(${lens.x - HALO}px,${lens.y - HALO}px,0)` // compositor-only move
      const spd = Math.min(1, Math.hypot(lens.vx, lens.vy) / 2600)                // jelly: wider and flatter with speed
      gl.uniform2f(U.SQ, 1 + spd * .16, 1 - spd * .1)
      gl.uniform1f(U.TM, now / 1000); gl.uniform1f(U.GA, ga)
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(frame)
    }
    cv.style.display = 'block'
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
      cv.style.display = 'none' // the context is kept: React's dev double-mount reuses the same canvas
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', left: 0, top: 0, zIndex: 900, pointerEvents: 'none', willChange: 'transform', display: 'none' }}
    />
  )
}
