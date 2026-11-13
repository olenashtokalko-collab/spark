// Metal button (11 Nov): a glass button in a thin ring of liquid metal, after adamperlis.com's "Run ⏎". Shown on
// #/demo/metal-button; in the Current UI the portal's primary buttons wear it in the Spark tone (Button, primitives).
// The metal is Paper Shaders' Liquid Metal (Apache-2.0), rendered once in a hidden WebGL canvas; every button
// copies its frame into its own 2D ring (clipped to the button's rim) and a blurred halo around it.
// "spark" tints the chrome with the Noor spectrum, Cobalt → violet → Ember, keeping the metal's light and its
// red/blue edge split; "chrome" is the reference's grey.
import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { ShaderMount } from '@paper-design/shaders';
import '../../styles/metal.css';

export type MetalTone = 'chrome' | 'spark';
/** 'spark': our tuning (faster lines that speed up on hover, metal only in the rim, clear glass that brightens on
 *  hover). 'reference': adamperlis.com's own values (lines at 1, glass over the whole metal, clearing on hover).
 *  'portal' (the Current UI, 11 Nov): the reference's look with our motion. */
export type MetalProfile = 'spark' | 'reference' | 'portal' | 'menu';
// 'menu' (12 Nov, review): the metal as the portal wore it (the reference's look, our motion, the Noor spectrum),
// kept only for Ask Dr.AI in the menu; every other portal button is now the flat Cobalt 'portal'.

const PAD = 18; // the ring and halo canvases reach this far past the button, for the glow
const RING = 2.5; // visible metal between the button's edge and its glass
const FPS = 30;
const SPEED = 1.8; // the lines' flow at rest (the reference runs at 1)
const SPEED_HOVER = 3; // and while a pointer is on a metal button
const MAGNET = 0.2; // the button leans this share of the pointer's offset from its centre (adamperlis.com's Contact)
const SPECTRUM = ['#1e3bd6', '#5a36d4', '#a33abf', '#e8501f'];

type Entry = { el: HTMLElement; ring: HTMLCanvasElement; halo: HTMLCanvasElement; tone: MetalTone; rim: boolean; on: boolean };
type Engine = ReturnType<typeof createEngine>;

/** One shader for every metal button of a profile on the page (its lines' speed is the shader's). */
function createEngine(SPEED: number, SPEED_HOVER: number) {
  const entries = new Set<Entry>();
  let mount: ShaderMount | null = null;
  let source: HTMLCanvasElement | null = null;
  let starting: Promise<void> | null = null;
  let raf = 0;
  let last = 0;
  let hovered = 0; // metal buttons under a pointer
  const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((es) => {
          es.forEach((e) => entries.forEach((x) => x.el === e.target && (x.on = e.isIntersecting)));
          mount?.setSpeed([...entries].some((x) => x.on) && !still ? (hovered ? SPEED_HOVER : SPEED) : 0);
        })
      : null;
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => entries.forEach(size)) : null;

  function start() {
    if (starting) return starting;
    // the shader library loads only when the first metal button appears
    starting = import('@paper-design/shaders').then(
      (P) =>
        new Promise<void>((done) => {
          const img = new Image();
          img.onload = () => {
            const host = document.createElement('div');
            host.setAttribute('aria-hidden', 'true');
            // On screen but invisible: Paper's ShaderMount stops drawing a canvas its IntersectionObserver can't
            // see, so a host parked off screen would freeze the metal on its first frame.
            Object.assign(host.style, { position: 'fixed', left: '0', top: '0', width: '420px', height: '180px', opacity: '0', pointerEvents: 'none', zIndex: '-1' });
            document.body.append(host);
            try {
              mount = new P.ShaderMount(
                host,
                P.liquidMetalFragmentShader,
                {
                  u_colorBack: P.getShaderColorFromString('#00000000'),
                  u_colorTint: P.getShaderColorFromString('#ffffff'),
                  u_image: img,
                  u_isImage: false,
                  u_shape: P.LiquidMetalShapes.none,
                  u_repetition: 1.7,
                  u_softness: 0.1,
                  u_shiftRed: 0.35,
                  u_shiftBlue: 0.35,
                  u_distortion: 0.1,
                  u_contour: 0.5,
                  u_angle: 80,
                  u_fit: P.ShaderFitOptions.contain,
                  u_scale: 1,
                  u_rotation: 0,
                  u_offsetX: 0,
                  u_offsetY: 0,
                  u_originX: 0.5,
                  u_originY: 0.5,
                  u_worldWidth: 0,
                  u_worldHeight: 0,
                },
                { preserveDrawingBuffer: true },
                still ? 0 : SPEED,
                2400,
                2,
                420 * 180 * 2,
              );
              source = mount.canvasElement;
            } catch {
              host.remove();
            }
            done();
          };
          img.src = P.emptyPixel;
        }),
    );
    return starting;
  }

  function size(e: Entry) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    for (const c of [e.ring, e.halo]) {
      c.width = Math.ceil((e.el.offsetWidth + PAD * 2) * dpr);
      c.height = Math.ceil((e.el.offsetHeight + PAD * 2) * dpr);
    }
    draw(e);
  }

  function rounded(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    c.beginPath();
    c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
  }

  function draw(e: Entry) {
    const ctx = e.ring.getContext('2d');
    if (!ctx || !source || !source.width || !e.el.offsetWidth) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const [x, y, w, h] = [PAD * dpr, PAD * dpr, e.el.offsetWidth * dpr, e.el.offsetHeight * dpr];
    const r = (parseFloat(getComputedStyle(e.el).borderTopLeftRadius) || 0) * dpr;
    const k = RING * dpr;
    // the metal, cover-fitted to the button
    const s = Math.max(w / source.width, h / source.height);
    const sw = w / s, sh = h / s;
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(source, (source.width - sw) / 2, (source.height - sh) / 2, sw, sh, x, y, w, h);
    if (e.tone === 'spark') {
      // the Noor spectrum takes the hue; the metal keeps its light and its red/blue split
      const g = ctx.createLinearGradient(x, y + h, x + w, y);
      SPECTRUM.forEach((c, i) => g.addColorStop(i / (SPECTRUM.length - 1), c));
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = g;
      rounded(ctx, x, y, w, h, r);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'destination-in';
    rounded(ctx, x, y, w, h, r);
    ctx.fill();
    // metal only in the rim: the face under the label stays clear white glass, not metal seen through it
    if (e.rim) {
      ctx.globalCompositeOperation = 'destination-out';
      rounded(ctx, x + k, y + k, w - 2 * k, h - 2 * k, r - k);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    // halo: the ring blurred, its middle cut away so it only glows outward
    const hx = e.halo.getContext('2d');
    if (!hx) return;
    hx.globalCompositeOperation = 'copy';
    hx.filter = `blur(${6 * dpr}px)`;
    hx.drawImage(e.ring, 0, 0);
    hx.filter = 'none';
    hx.globalCompositeOperation = 'destination-out';
    rounded(hx, x + k, y + k, w - 2 * k, h - 2 * k, r - k);
    hx.fill();
    hx.globalCompositeOperation = 'source-over';
  }

  function loop(t: number) {
    raf = requestAnimationFrame(loop);
    if (t - last < 1000 / FPS) return;
    last = t;
    entries.forEach((e) => e.on && draw(e));
  }

  return {
    hover(on: boolean) {
      hovered = Math.max(0, hovered + (on ? 1 : -1));
      if (mount && !still) mount.setSpeed(hovered ? SPEED_HOVER : SPEED);
    },
    add(e: Entry) {
      entries.add(e);
      io?.observe(e.el);
      ro?.observe(e.el);
      start().then(() => {
        if (!entries.has(e)) return;
        size(e);
        if (!raf && !still) raf = requestAnimationFrame(loop);
      });
    },
    remove(e: Entry) {
      entries.delete(e);
      io?.unobserve(e.el);
      ro?.unobserve(e.el);
      if (!entries.size && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
  };
}

const engines: Partial<Record<MetalProfile, Engine>> = {};
const engineFor = (p: MetalProfile) => {
  const k = p === 'reference' ? 'reference' : 'spark'; // the portal moves as ours does
  return (engines[k] ??= k === 'reference' ? createEngine(1, 1) : createEngine(SPEED, SPEED_HOVER));
};
/** The classes a metal button wears for a tone and profile. */
// 'portal' (the Current UI, 12 Nov review: "just Cobalt, no animation"): a flat Cobalt pill, no metal, no lines; it
// keeps the hover lean and lift
export const metalClass = (tone: MetalTone, profile: MetalProfile) =>
  ['metal', `metal--${tone}`, profile !== 'spark' && 'metal--ref', profile === 'portal' && 'metal--flat'].filter(Boolean).join(' ');

/** Hover micro-motion, as on adamperlis.com: the button leans toward the pointer and eases back when it leaves
 *  (their GSAP quickTo, 0.5s power3.out; here a frame-rate-independent ease of about the same feel). The lines
 *  speed up while it's hovered. A real pointer only, and nothing with reduced motion. */
// the flat Cobalt and outlined buttons lean less and ease slower (12 Nov, review: "too strong, a bit smoother")
const CALM = { pull: 0.07, ease: 0.24 };
function magnet(el: HTMLElement, engine: Engine | null, { pull, ease }: { pull: number; ease: number } = { pull: MAGNET, ease: 0.11 }) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, prev = 0, inside = false;
  const step = (t: number) => {
    const dt = prev ? Math.min((t - prev) / 1000, 0.05) : 0.016;
    prev = t;
    const k = 1 - Math.exp(-dt / ease);
    x += (tx - x) * k;
    y += (ty - y) * k;
    el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
    if (Math.abs(tx - x) + Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(step);
    else {
      raf = 0;
      prev = 0;
      if (!tx && !ty) el.style.translate = '';
    }
  };
  const go = () => raf || (raf = requestAnimationFrame(step));
  const move = (ev: PointerEvent) => {
    if (ev.pointerType !== 'mouse') return;
    if (!inside) {
      inside = true;
      engine?.hover(true);
    }
    const r = el.getBoundingClientRect();
    tx = (ev.clientX - r.left - r.width / 2) * pull;
    ty = (ev.clientY - r.top - r.height / 2) * pull;
    go();
  };
  const leave = () => {
    if (inside) engine?.hover(false);
    inside = false;
    tx = ty = 0;
    go();
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
    if (inside) engine?.hover(false);
    cancelAnimationFrame(raf);
    el.style.translate = '';
  };
}

/** The outlined buttons lean toward the pointer too (12 Nov, review: a micro-motion on both kinds): Later on the
 *  attention cards and the plain secondary pills, in the Current UI. Bound on the first hover, so nothing to mount. */
const OUTLINED = '.aa-pill, .btn--secondary:not(.metal):not(.btn--icon)';
const bound = new WeakSet<Element>();
if (typeof document !== 'undefined')
  document.addEventListener('pointerover', (ev) => {
    if ((document.documentElement.dataset.ui ?? 'a') !== 'a') return;
    const el = (ev.target as Element | null)?.closest?.(OUTLINED) as HTMLElement | null;
    if (!el || bound.has(el)) return;
    bound.add(el);
    magnet(el, null, CALM);
    el.dispatchEvent(new PointerEvent('pointermove', ev));
  });

/** The metal's layers, for any button: put it first inside the button, give the button the `metal metal--<tone>`
 *  classes, and wrap the button's content in `.metal__label`. */
export function MetalParts({ tone = 'spark', profile = 'spark' }: { tone?: MetalTone; profile?: MetalProfile }) {
  const ring = useRef<HTMLCanvasElement>(null);
  const halo = useRef<HTMLCanvasElement>(null);
  const glass = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = (ring.current ?? glass.current)?.parentElement;
    if (!el) return;
    if (profile === 'portal') return magnet(el, null, CALM); // flat Cobalt: no metal to draw
    if (!ring.current || !halo.current) return;
    const engine = engineFor(profile);
    const e: Entry = { el, ring: ring.current, halo: halo.current, tone, rim: profile === 'spark', on: true };
    engine.add(e);
    const unmagnet = magnet(el, engine);
    return () => {
      unmagnet();
      engine.remove(e);
    };
  }, [tone, profile]);
  if (profile === 'portal') return <span ref={glass} className="metal__glass" aria-hidden />;
  return (
    <>
      <canvas ref={halo} className="metal__halo" aria-hidden />
      <canvas ref={ring} className="metal__ring" aria-hidden />
      <span ref={glass} className="metal__glass" aria-hidden />
    </>
  );
}

/** True while the Current UI is on (<html data-ui="a">), where the portal's primary buttons wear the metal.
 *  Read from the page itself, so primitives can use it without importing the variant switch. */
export function useMetalUi() {
  const read = () => (document.documentElement.dataset.ui ?? 'a') === 'a';
  const [on, setOn] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setOn(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui'] });
    setOn(read());
    return () => mo.disconnect();
  }, []);
  return on;
}

/** A pill's content, wearing the portal's metal when `on`: the metal's layers, then the content in `.metal__label`.
 *  Give the pill `metalClass('spark', 'portal')` too. */
export function MetalInner({ on, children }: { on: boolean; children: ReactNode }) {
  if (!on) return <>{children}</>;
  return (
    <>
      <MetalParts tone="spark" profile="portal" />
      <span className="metal__label">{children}</span>
    </>
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: MetalTone; profile?: MetalProfile; children: ReactNode };

export const MetalButton = forwardRef<HTMLButtonElement, Props>(function MetalButton({ tone = 'spark', profile = 'spark', className, children, ...rest }, ref) {
  return (
    <button ref={ref} type="button" {...rest} className={[metalClass(tone, profile), className].filter(Boolean).join(' ')}>
      <MetalParts tone={tone} profile={profile} />
      <span className="metal__label">{children}</span>
    </button>
  );
});
