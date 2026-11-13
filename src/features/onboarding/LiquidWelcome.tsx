// The welcome after sign-in (11 Nov, picked on #/demo/welcome-liquid), after adamperlis.com's intro. A new company's
// first visit: sound on or off; a living card types "Hi <name>, your workspace is ready"; Start pours it into Dr.AI,
// first as liquid metal in his shape, then the man himself, who introduces himself; then Home opens under the scene
// while he floats to the bottom-right corner in a glass bubble and stays there alone until clicked, when his usual
// window opens. Sounds are our own, made live with Web Audio (demo/welcome/sfx). Reduced motion: no typing, no morph.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { navigate } from '../../lib/router';
import { dockCmd } from '../../lib/dockMotion';
import type { ShaderMount } from '@paper-design/shaders';
import { CornerDownLeft, Volume2, VolumeX } from 'lucide-react';
import { MetalButton } from '../../components/ui/MetalButton';
import { MascotClip } from '../demo/MascotDemo';
import { cx } from '../../components/ui/primitives';
import * as sfx from '../demo/welcome/sfx';
import '../../styles/welcome-liquid.css';

export type Look = 'metal' | 'noor';
type Step = 'sound' | 'typing' | 'ready' | 'morph' | 'greet' | 'land' | 'corner';

export const LOOKS: { v: Look; label: string; note: string }[] = [
  { v: 'metal', label: 'A · Liquid metal, Noor', note: 'The reference’s material: liquid metal poured into the card, its light tinted with the spectrum. One family with the metal buttons.' },
  { v: 'noor', label: 'B · Noor glow (p. 42)', note: 'The brand book’s own light: a soft, grainy Cobalt → magenta → Ember blob moving behind a frosted glass card. No chrome.' },
];
const SPECTRUM = ['#1e3bd6', '#4b3cf2', '#b93ad6', '#ff3d9a', '#ff5a3a', '#ff6a1f', '#ffa070']; // p.42, left to right
type Line = { text: string; kind: 'meta' | 'hi' | 'sub' };
/** Who is welcomed, and where from: the card's corners and its greeting. */
export type WelcomeWho = { name: string; company: string; city: string };
const DEMO_WHO: WelcomeWho = { name: 'Layla', company: 'Brand Co.', city: 'Abu Dhabi' };
const linesFor = (w: WelcomeWho, back = false): Line[] => [
  { text: 'spark@studios ~ portal', kind: 'meta' },
  { text: `${w.company} · ${w.city}`, kind: 'meta' },
  { text: back ? `Welcome back, ${w.name}` : `Hi ${w.name}`, kind: 'hi' },
  { text: back ? 'Everything is where you left it.' : 'Your workspace is ready.', kind: 'sub' },
];
const GREETING = ['I’m Dr.AI.', 'I’ll show you around Spark.']; // the card already said hi
// a company past its first steps, back after signing in again (12 Nov, review: the welcome after Log out in Current)
const GREETING_BACK = ['Good to see you again.', 'I’m in my corner if you need me.'];
const FIG_H = 341; // Dr.AI's figure, the solo crop (786 × 1290 of the 1440 frame: no Sparki beside him)
const FIG_W = Math.round((FIG_H * 786) / 1290);
const CORNER_W = 92; // his width in the corner, the mascot alone
const CORNER_SAY = ['I’m here if you need me.', 'Click me anytime.'];
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** An image, loaded (img.decode() can hang while the page is in the background). */
function loaded(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/** Dr.AI's silhouette from his first frame, white on transparent, as a PNG data URL: the metal pours into it. */
async function silhouette(url: string, w: number) {
  const img = await loaded(url);
  // the still is the body crop (frame x 300–1320); cut to the solo box (x 280–1066), Sparki's side left out
  const k = img.naturalWidth / 1020;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = Math.round((w * 1290) / 786);
  const x = c.getContext('2d')!;
  const s = c.width / (786 * k);
  x.drawImage(img, 20 * k * s, 0, img.naturalWidth * s, img.naturalHeight * s);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = '#fff';
  x.fillRect(0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

/** The card's outline: a squircle (superellipse) on a transparent ground, as a PNG data URL. */
function squircle(w: number, h: number, n = 4.2) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  x.beginPath();
  for (let i = 0; i <= 360; i++) {
    const t = (i / 360) * Math.PI * 2;
    const ct = Math.cos(t), st = Math.sin(t);
    const px = w / 2 + (w / 2) * Math.sign(ct) * Math.abs(ct) ** (2 / n);
    const py = h / 2 + (h / 2) * Math.sign(st) * Math.abs(st) ** (2 / n);
    if (i) x.lineTo(px, py);
    else x.moveTo(px, py);
  }
  x.fillStyle = '#fff';
  x.fill();
  return c.toDataURL('image/png');
}

/** A: liquid metal poured into the card's shape, copied each frame into a visible canvas and tinted with Noor. */
export function MetalSurface({ onReady, mask = 'card', className, speed = 1 }: { onReady: () => void; mask?: 'card' | 'drai'; className?: string; speed?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true;
    let raf = 0;
    let mount: ShaderMount | null = null;
    const host = document.createElement('div');
    (async () => {
      const P = await import('@paper-design/shaders');
      const el = box.current;
      if (!el || !alive) return;
      const { width: w, height: h } = el.getBoundingClientRect();
      const shape = mask === 'drai' ? await silhouette('/brand/drai/intro-still.webp', 520) : squircle(600, Math.round((600 * h) / w));
      const { pngBlob } = await P.toProcessedLiquidMetal(shape);
      const img = await loaded(URL.createObjectURL(pngBlob));
      if (!alive) return;
      // on screen but invisible: Paper stops drawing a canvas its IntersectionObserver can't see
      Object.assign(host.style, { position: 'fixed', left: '0', top: '0', width: `${w}px`, height: `${h}px`, opacity: '0', pointerEvents: 'none', zIndex: '-1' });
      document.body.append(host);
      mount = new P.ShaderMount(
        host,
        P.liquidMetalFragmentShader,
        {
          u_colorBack: P.getShaderColorFromString('#00000000'),
          u_colorTint: P.getShaderColorFromString('#ffffff'),
          u_image: img,
          u_isImage: true,
          u_shape: P.LiquidMetalShapes.none,
          // the reference's intro look: big soft pools of light, a gentle wobble at the edge
          u_repetition: 1.4,
          u_softness: 0.85,
          u_distortion: 0.05,
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_contour: 0.4,
          u_angle: 70,
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
        still() ? 0 : speed,
        0,
        2,
      );
      const src = mount.canvasElement;
      const out = view.current!;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      out.width = Math.round(w * dpr);
      out.height = Math.round(h * dpr);
      const ctx = out.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, out.height * 0.6, out.width, out.height * 0.4);
      SPECTRUM.forEach((c, i) => grad.addColorStop(i / (SPECTRUM.length - 1), c));
      let shown = false;
      const paint = () => {
        if (!src.width) return;
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(src, 0, 0, out.width, out.height);
        ctx.globalCompositeOperation = 'color'; // the spectrum takes the hue, the metal keeps its light
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.globalCompositeOperation = 'screen'; // p.42 is light: lift the metal's dark pools toward the page
        ctx.fillStyle = 'rgba(255, 246, 250, 0.22)';
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.globalCompositeOperation = 'destination-in'; // and only where there is metal
        ctx.drawImage(src, 0, 0, out.width, out.height);
        ctx.globalCompositeOperation = 'source-over';
        if (!shown) {
          shown = true;
          onReady();
        }
      };
      const loop = () => {
        raf = requestAnimationFrame(loop);
        paint();
      };
      loop();
    })().catch((err) => {
      console.warn('Welcome: liquid metal did not start', err);
      onReady();
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      mount?.dispose();
      host.remove();
    };
  }, [onReady, mask]);
  return (
    <div ref={box} className={cx('wl-surface wl-surface--metal', className)} aria-hidden>
      <canvas ref={view} />
    </div>
  );
}

/** B: the brand book's p.42 light, Paper's Grain Gradient as a blob over Sand, filling the whole screen. */
/** Also Home's company card (#/demo/home-bento, 12 Nov): its speed, ground and class can be set. */
export function NoorField({ speed = 0.6, back = '#f8f6f2', className = 'wl-field' }: { speed?: number; back?: string; className?: string } = {}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    let mount: ShaderMount | null = null;
    (async () => {
      const P = await import('@paper-design/shaders');
      const noise = P.getShaderNoiseTexture();
      if (noise && !noise.complete) await new Promise((r) => { noise.addEventListener('load', r, { once: true }); noise.addEventListener('error', r, { once: true }); setTimeout(r, 3000); });
      if (!alive || !box.current) return;
      const colors = ['#1e3bd6', '#3d45f5', '#c43ad8', '#ff2f9a', '#ff5a3a', '#ff6a1f', '#ffb48a'].map((c) => P.getShaderColorFromString(c));
      mount = new P.ShaderMount(
        box.current,
        P.grainGradientFragmentShader,
        {
          u_colorBack: P.getShaderColorFromString(back),
          u_colors: colors,
          u_colorsCount: colors.length,
          u_softness: 1,
          u_intensity: 0.5,
          u_noise: 0.22,
          u_shape: P.GrainGradientShapes.blob,
          u_noiseTexture: noise,
          u_fit: P.ShaderFitOptions.cover,
          u_scale: 0.8,
          u_rotation: 0,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: 0.5,
          u_originY: 0.5,
          u_worldWidth: 0,
          u_worldHeight: 0,
        },
        undefined,
        still() ? 0 : speed,
      );
    })().catch(() => undefined);
    return () => {
      alive = false;
      mount?.dispose();
    };
  }, [speed, back]);
  return <div ref={box} className={className} aria-hidden />;
}

/** Dr.AI's greeting, typed key by key with a sound per key and a note per line. */
function useTyping(active: boolean, onDone: () => void, LINES: Line[]) {
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    if (!active) return;
    if (still()) {
      setShown(LINES.map((l) => l.text));
      onDone();
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    (async () => {
      await wait(420);
      for (let i = 0; i < LINES.length; i++) {
        const text = LINES[i].text;
        for (let k = 1; k <= text.length; k++) {
          if (cancelled) return;
          setShown((s) => {
            const n = [...s];
            n[i] = text.slice(0, k);
            return n;
          });
          if (text[k - 1] !== ' ') sfx.key();
          await wait(LINES[i].kind === 'meta' ? 22 + Math.random() * 18 : 42 + Math.random() * 38);
        }
        sfx.line(i);
        await wait(LINES[i].kind === 'meta' ? 160 : 380);
      }
      if (!cancelled) onDone();
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [active, onDone]);
  return shown;
}

/** Dr.AI's hello in his bubble, typed with a blip of his voice every few letters. */
function useGreeting(active: boolean, onDone: () => void, lines: string[] = GREETING) {
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    if (!active) return;
    if (still()) {
      setShown(lines);
      onDone();
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    (async () => {
      await wait(250);
      for (let i = 0; i < lines.length; i++) {
        const text = lines[i];
        for (let k = 1; k <= text.length; k++) {
          if (cancelled) return;
          setShown((s) => {
            const n = [...s];
            n[i] = text.slice(0, k);
            return n;
          });
          if (k % 3 === 1 && /[a-z!’.]/i.test(text[k - 1])) sfx.talk(k);
          await wait(/[.!,]/.test(text[k - 1]) ? 120 : 18 + Math.random() * 12);
        }
        await wait(200);
      }
      if (!cancelled) onDone();
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [active, onDone, lines]);
  return shown;
}

function Welcome({ look, onClose, who = DEMO_WHO, onSeen, back = false }: { look: Look; onClose: () => void; who?: WelcomeWho; onSeen?: () => void; back?: boolean }) {
  const LINES = linesFor(who, back);
  const greet = back ? GREETING_BACK : GREETING;
  const pref = sfx.soundPref();
  const [step, setStep] = useState<Step>(pref === null ? 'sound' : 'typing');
  const [surfaceReady, setSurfaceReady] = useState(look === 'noor');
  const [speaking, setSpeaking] = useState(false);
  const [orb, setOrb] = useState<'in' | 'pop' | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const metalFig = useRef<HTMLDivElement>(null);
  const realFig = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const goo = useRef<HTMLDivElement>(null);
  const ready = useCallback(() => setSurfaceReady(true), []);
  const figOk = useCallback(() => undefined, []);
  useEffect(() => {
    // the card shows within 2s even if the metal is slow or can't start (it keeps pouring in when it can)
    const t = window.setTimeout(() => setSurfaceReady(true), 2000);
    return () => clearTimeout(t);
  }, []);
  const typed = useCallback(() => setStep('ready'), []);
  const shown = useTyping(step === 'typing' && surfaceReady, typed, LINES);
  // seen once he is in his corner, or skipped
  const seen = useRef(false);
  const markSeen = () => {
    if (seen.current) return;
    seen.current = true;
    onSeen?.();
  };
  useEffect(() => {
    if (step === 'corner') markSeen();
  });
  const [sound, setSoundState] = useState(pref === true);

  useEffect(() => {
    if (pref === true) sfx.setSound(true); // a remembered "on" still needs a click to start audio; Start wakes it
  }, [pref]);

  const pickSound = (v: boolean) => {
    sfx.setSound(v);
    setSoundState(v);
    if (v) sfx.soundOn();
    setStep('typing');
  };

  /** Start: the card melts and pours itself into Dr.AI. The card and his metal figure share a gooey filter, so as
   *  one shrinks away and the other swells in they run together like one liquid; then the metal clears to him. */
  const morph = useCallback(() => {
    sfx.setSound(sound); // this click also unlocks audio for a remembered "on"
    sfx.chime();
    setStep('morph');
    if (still()) {
      if (realFig.current) realFig.current.style.opacity = '1';
      setSpeaking(true);
      setStep('greet');
      return;
    }
    const D = 1300;
    sfx.morph(D / 1000);
    const ease = 'cubic-bezier(0.65, 0, 0.35, 1)';
    card.current?.animate(
      [
        { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: 'scale(0.7) translateY(-3%)', opacity: 1, filter: 'blur(2px)', offset: 0.45 },
        { transform: 'scale(0.42) translateY(-8%)', opacity: 0, filter: 'blur(10px)' },
      ],
      { duration: D, easing: ease, fill: 'forwards' },
    );
    metalFig.current?.animate(
      [
        { transform: 'scale(1.5)', opacity: 0, filter: 'blur(16px)' },
        { transform: 'scale(1.18)', opacity: 0.85, filter: 'blur(6px)', offset: 0.5 },
        { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
      ],
      { duration: D, delay: 180, easing: ease, fill: 'forwards' },
    );
    window.setTimeout(() => goo.current?.classList.add('is-settled'), D + 200);
    // the metal clears to the man himself, with a flash of light and his hello
    window.setTimeout(() => {
      sfx.appear();
      metalFig.current?.animate(
        [
          { opacity: 1, filter: 'brightness(1) blur(0px)' },
          { opacity: 1, filter: 'brightness(1.6) blur(1px)', offset: 0.35 },
          { opacity: 0, filter: 'brightness(2) blur(6px)' },
        ],
        { duration: 650, easing: 'ease-out', fill: 'forwards' },
      );
      realFig.current?.animate([{ opacity: 0, scale: '0.96' }, { opacity: 1, scale: '1' }], { duration: 520, delay: 120, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', fill: 'forwards' });
      window.setTimeout(() => {
        setSpeaking(true);
        setStep('greet');
      }, 520);
    }, D + 380);
  }, [sound]);

  /** His hello done: Home opens under the scene, which floods away from him, while he shrinks and walks off to
   *  the bottom-right corner, where he stays as the mascot alone (no window) until clicked. */
  const land = useCallback(() => {
    setSpeaking(false);
    setStep('land');
    document.documentElement.dataset.welcomeMascot = 'on'; // the portal's own corner window waits
    navigate('/');
    const fig = realFig.current;
    const st = stage.current;
    const b = fig?.getBoundingClientRect();
    const fx = b ? b.left + b.width / 2 : innerWidth / 2;
    const fy = b ? b.top + b.height / 2 : innerHeight / 2;
    words.current?.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 300, fill: 'forwards' });
    if (still() || !st || !fig || !b) {
      st?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
      window.setTimeout(() => setStep('corner'), 320);
      return;
    }
    // No flood ring (11 Nov, review): the scene simply fades and Home comes up under it, while he floats off to his
    // corner in a glass bubble of the card's colours, which breaks softly when he lands.
    const dur = 1400;
    sfx.drift(dur / 1000);
    st.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 120, easing: 'ease-out', fill: 'forwards' });
    setOrb('in');
    // his corner: the mascot's own place on the portal, bottom right
    const k = CORNER_W / b.width;
    const tx = innerWidth - 26 - CORNER_W / 2 - fx;
    const ty = innerHeight - 22 - (b.height * k) / 2 - fy;
    fig.animate(
      [
        { transform: 'translate(0px, 0px) scale(1)' },
        { transform: `translate(${tx * 0.06}px, ${-18}px) scale(${1 - (1 - k) * 0.18})`, offset: 0.22 },
        { transform: `translate(${tx * 0.55}px, ${ty * 0.35}px) scale(${1 - (1 - k) * 0.62})`, offset: 0.6 },
        { transform: `translate(${tx}px, ${ty}px) scale(${k})` },
      ],
      { duration: dur, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' },
    );
    window.setTimeout(() => {
      sfx.pop();
      setOrb('pop');
    }, dur - 40);
    window.setTimeout(() => {
      setOrb(null);
      setStep('corner');
    }, dur + 380);
  }, []);
  const greeted = useCallback(() => window.setTimeout(land, 650), [land]);
  const hello = useGreeting(step === 'greet', greeted, greet);
  const [saying, setSaying] = useState(false);
  // His corner words said, the portal's own Dr.AI takes over in the same place (12 Nov): until then the portal's
  // mascot, and with it his advice (CornerTips), waited behind this one for as long as the visit lasted.
  const handOver = useRef(onClose);
  handOver.current = onClose;
  const saidDone = useCallback(() => {
    setSaying(false);
    window.setTimeout(() => {
      delete document.documentElement.dataset.welcomeMascot;
      handOver.current();
    }, 2600);
  }, []);
  const said = useGreeting(step === 'corner', saidDone, CORNER_SAY);
  useEffect(() => setSaying(step === 'corner'), [step]);

  // In his corner, a click on him opens the chat (and this welcome is done).
  // ...now his chat (11 Nov): the portal's own Dr.AI takes his place in the corner and opens it
  const openWindow = () => {
    delete document.documentElement.dataset.welcomeMascot;
    onClose();
    window.setTimeout(() => dockCmd('chat'), 30);
  };
  const skip = () => {
    delete document.documentElement.dataset.welcomeMascot;
    markSeen();
    onClose();
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && step === 'ready') {
        e.preventDefault();
        morph();
      }
      if (e.key === 'Escape' && step !== 'corner') skip();
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  });

  const after = step === 'morph' || step === 'greet' || step === 'land' || step === 'corner';
  const meta = (i: number) => (
    <>
      {shown[i] ?? ''}
      {step === 'typing' && shown.length - 1 === i && shown[i] !== LINES[i].text && <span className="wl-caret" />}
    </>
  );
  return (
    <>
      {step !== 'corner' && (
        <div ref={stage} className={cx('wl-stage', `wl-stage--${look}`)} role="dialog" aria-label="Welcome to Spark">
          {look === 'noor' && <NoorField />}
          <svg className="wl-defs" aria-hidden>
            {/* liquid: blur the shapes together, then sharpen their alpha back into one surface */}
            <filter id="wl-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" />
              <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
              <feComposite in="SourceGraphic" in2="g" operator="atop" />
            </filter>
          </svg>
          <div ref={goo} className={cx('wl-morph', after && 'is-on')}>
            <div className="wl-center">
              <div ref={card} className={cx('wl-card', `wl-card--${look}`, surfaceReady && 'is-ready', after && 'is-leaving')}>
                {look === 'metal' && <MetalSurface onReady={ready} />}
                {/* where and who, in the card's top corners */}
                <span className="wl-corner wl-corner--l">{meta(0)}</span>
                <span className="wl-corner wl-corner--r">{meta(1)}</span>
                <div className="wl-term wl-term--light">
                  {LINES.slice(2).map((l, j) => (
                    <p key={l.text} className={`wl-line wl-line--${l.kind}`} aria-hidden={!shown[j + 2]}>
                      {meta(j + 2)}
                    </p>
                  ))}
                </div>
                <div className={cx('wl-bar', step === 'ready' && 'is-on')}>
                  {/* the brand's line, not an instruction (13 Nov, review: "Every idea starts with a human", Brand book
                      p.4); Return still starts it, as the ⏎ on Start shows, and a screen reader hears so */}
                  <span className="wl-bar__line">
                    Every idea starts with you.
                    <span className="sr-only"> Press Return to start.</span>
                  </span>
                  <MetalButton tone="spark" profile="menu" onClick={morph} onPointerEnter={() => sfx.tick()}>
                    Start <CornerDownLeft size={15} />
                  </MetalButton>
                </div>
              </div>
              {step === 'sound' && (
                <div className="wl-sound">
                  <span className="wl-sound__label">
                    <Volume2 size={15} /> Best with sound
                  </span>
                  <button type="button" className="wl-sound__on" onClick={() => pickSound(true)}>
                    On
                  </button>
                  <button type="button" onClick={() => pickSound(false)}>
                    Off
                  </button>
                </div>
              )}
            </div>
            {/* Dr.AI as liquid metal in his own shape, poured in from the card; ready before Start is pressed */}
            {(step === 'ready' || after) && (
              <div ref={metalFig} className="wl-fig wl-fig--metal" style={{ width: FIG_W, height: FIG_H }}>
                <MetalSurface mask="drai" onReady={figOk} />
              </div>
            )}
          </div>
          <button type="button" className="wl-skip" onClick={skip}>
            Skip intro
          </button>
          {step !== 'sound' && (
            <span className="wl-sound-state" aria-live="polite">
              {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} {sound ? 'Sound on' : 'Sound off'}
            </span>
          )}
        </div>
      )}
      {/* Dr.AI himself, above the scene so he stays while it floods away, and walks to his corner */}
      {(step === 'ready' || after) && (
        <div className={cx('wl-hello', step === 'corner' && 'is-corner')}>
          <div ref={realFig} className="wl-fig wl-fig--real" style={{ width: FIG_W, height: FIG_H }}>
            <MascotClip state={speaking || saying ? 'speaking' : 'idle'} crop="solo" width={FIG_W} />
            {/* the bubble he travels in, in the card's light; it breaks when he lands */}
            {orb && <span className={cx('wl-orb', orb === 'pop' && 'is-popping')} aria-hidden />}
            {step === 'corner' && <button type="button" className="wl-fig__open" onClick={openWindow} aria-label="Dr.AI: open his window" />}
          </div>
          {/* in his corner, a few words beside him, as the reference's buddy does */}
          {step === 'corner' && (
            <div className={cx('wl-say', said.length > 0 && 'is-on')} aria-live="polite">
              <span>{said[0] ?? ''}</span> <span className="wl-say__more">{said[1] ?? ''}</span>
            </div>
          )}
          {/* his words on the ground itself, no bubble (11 Nov, review) */}
          <div ref={words} className={cx('wl-words', step === 'greet' && 'is-on')}>
            {greet.map((g, i) => (
              <p key={g} className={i ? 'wl-words__sub' : 'wl-words__hi'}>
                {hello[i] ?? ''}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/** The welcome plays in its own layer over the app, so it can open Home under itself and outlive the demo page.
 *  One at a time: the layers are kept on window, so a new run (or a code reload while it plays) clears every
 *  earlier one, Dr.AI waiting in his corner included, and never leaves a second scene over the portal. */
type Layer = { root: Root; el: HTMLDivElement };
const layers = (): Layer[] => ((window as unknown as { __wlLayers?: Layer[] }).__wlLayers ??= []);
function clearWelcome() {
  for (const l of layers().splice(0)) {
    try {
      l.root.unmount();
    } catch {
      /* already gone */
    }
    l.el.remove();
  }
  document.querySelectorAll('.wl-layer').forEach((el) => el.remove());
  delete document.documentElement.dataset.welcomeMascot;
}
export function playWelcome(look: Look, opts: { who?: WelcomeWho; onSeen?: () => void; back?: boolean } = {}) {
  clearWelcome();
  const el = document.createElement('div');
  el.className = 'wl-layer';
  document.body.append(el);
  const root = createRoot(el);
  const me: Layer = { root, el };
  const close = () => {
    const list = layers();
    const i = list.indexOf(me);
    if (i >= 0) list.splice(i, 1);
    // unmount after this event, not inside React's own work
    window.setTimeout(() => {
      root.unmount();
      el.remove();
    });
  };
  layers().push(me);
  root.render(<Welcome look={look} onClose={close} who={opts.who} onSeen={opts.onSeen} back={opts.back} />);
}
if (import.meta.hot) import.meta.hot.dispose(clearWelcome);

