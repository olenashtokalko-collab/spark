// A new chat, as picked on #/demo/chat-start (look D, 29 Oct): the short greeting, its first words in Noor
import { BeamEdge } from '../../components/ui/BeamEdge';
// light and a second line in Ink; the box by the brand book (white on top, a clear frosted rim, the light
// under it and gathered round it); then four ways to start as a quiet list, the light fading before it.
import { ArrowRight, Lightbulb, MessageSquareQuote, Palette, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useRoute } from '../../lib/router';
import { MascotClip } from '../demo/MascotDemo';
import { SparkiStill, useDrAi } from '../../components/ui/DrAi';
import { suggestedPrompts } from '../../data/assistant';
import { Composer } from './Composer';
import type { Attachment } from '../../data/types';

export const CHIP_ICON: Record<string, typeof Lightbulb> = {
  'Explore an idea': Lightbulb,
  'Run a background check': ShieldCheck,
  'Explore public feedback': MessageSquareQuote,
  'Understand your audience': UsersRound,
  'Explore a look': Palette,
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export function ChatStart({ onAsk }: { onAsk: (text: string, attachments?: Attachment[]) => void }) {
  const { me } = useStore();
  const first = me.name.split(' ')[0];
  // Dr.AI on (#/demo/mascot), or ?mascot=1: his whole figure over the greeting.
  const drai = useDrAi();
  const query = useRoute().query;
  const flag = query.get('mascot') === '1';
  const peek = query.get('sparky') === 'peek';
  const mascot = drai || flag;
  const [typing, setTyping] = useState(false);
  // Recording a voice message: Dr.AI listens, as while typing.
  const [voice, setVoice] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  return (
    <div className="chats-start" onInput={(e) => setTyping(!!(e.target as HTMLTextAreaElement).value)}>
      <div className="chats-start__col">
        <div className="chats-start__zone">
          <span className="chats-start__halo" aria-hidden />
          {/* Prototype (#/assistant?mascot=1, 5 Nov): Dr.AI over the greeting in a tile of the film's own ground, standing by, listening once you type. */}
          {/* Dr.AI alone (17 Nov, review): Sparky lives on the chat box here, so the clip is cropped short of the Sparky
              that flies by his head, and plays without the intro (Sparky leaving his chest): one Sparky on the page */}
          {/* 19 Nov, Jean: back to the earlier Dr.AI ("the previous version where Dr.AI has more movement is better"):
              his whole figure with Sparki by his head, opening with the intro (Sparki leaves his chest and circles his
              head), listening once you type. The floating Sparky on the box is off; ?sparky=peek brings it back */}
          {mascot && (peek ? <MascotClip state={typing || voice ? 'listening' : 'idle'} crop="solo" width={116} className="chats-start__mascot" /> : <MascotClip state={typing || voice ? 'listening' : 'idle'} width={150} intro className="chats-start__mascot" />)}
          <h1 className="chats-start__greet">
            <span className="chats-start__soft">{greeting()},</span> {first}.
            <br />
            What shall we bring to light?
          </h1>
          <div className="chats-start__glass">
            <span className="chats-start__light" aria-hidden />
            <div className="chats-start__frame" ref={frame}>
              {peek && <SparkyPeek frame={frame} />}
              <BeamEdge>
                <Composer look="box" onSubmit={onAsk} onVoice={setVoice} onTyping={setTyping} autoFocus placeholder={drai ? 'Ask Dr.AI anything…' : 'Ask Spark anything…'} />
              </BeamEdge>
            </div>
          </div>
        </div>
        {/* ways to start under the box, as the reference (17 Nov, review): soft filled pills, an icon and the words, the
            icons in the indicators' spectrum and moving under the pointer */}
        <ul className="chats-start__list" aria-label="Ways to start">
          {/* the icons' fill: the indicators' spectrum, Cobalt through violet to Ember (17 Nov, review) */}
          <li className="chats-start__defs" aria-hidden>
            <svg width="0" height="0">
              <defs>
                <linearGradient id="spark-spectrum" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0" stopColor="#1e3bd6" />
                  <stop offset="0.55" stopColor="#7c4ae0" />
                  <stop offset="1" stopColor="#e8501f" />
                </linearGradient>
              </defs>
            </svg>
          </li>
          {/* No icons (29 Oct), as in the Ask Spark drawer: the words, an arrow on hover. */}
          {suggestedPrompts.slice(0, 3).map((p) => (
            <li key={p.label}>
              <button type="button" className="chats-start__row" onClick={() => onAsk(p.prompt)} title={p.hint}>
                {(() => {
                  const Icon = CHIP_ICON[p.label] ?? Lightbulb;
                  return <Icon size={18} strokeWidth={1.7} className="chats-start__ico" aria-hidden />;
                })()}
                <span>
                  <b>{p.label}</b>
                  <span className="chats-start__hint"> {p.hint.charAt(0).toLowerCase() + p.hint.slice(1)}</span>
                </span>
                <ArrowRight size={15} strokeWidth={1.7} className="chats-start__go" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Sparky on the chat box (17 Nov, review: "bigger, livelier, more engaging"), after a mascot peeking over a prompt
 *  box. He peeks over the box's top edge, leaning side to side as if curious, and pops up for a look when you hover
 *  the box or type (a quick hop, as if he's eager to help). Every so often he springs out (a squash, a stretch, a spin)
 *  and goes round the box like a small planet, in front along the bottom and behind it along the top, leaving a short
 *  trail of sparks, then drops back behind the edge to peek again. Under reduced motion he only peeks. */
const PEEK_X = 0.93; // where he peeks, along the top edge: near the right corner (18 Nov, review)
const S = 58; // his size
function SparkyPeek({ frame }: { frame: React.RefObject<HTMLDivElement | null> }) {
  const el = useRef<HTMLSpanElement>(null);
  const body = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const box = frame.current;
    const me = el.current;
    const inner = body.current;
    if (!box || !me || !inner) return;
    // Each beat says where he should be; what's drawn follows it softly, so no hand-over between beats jumps (18 Nov,
    // review: "not smooth, as if it breaks off"). The lean follows the short way round, so a spin's end doesn't unwind.
    const want = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, k: 1, front: false };
    const cur = { x: NaN, y: 0, rot: 0, sx: 1, sy: 1, k: 1 };
    const place = (x: number, y: number, front: boolean) => {
      want.x = x;
      want.y = y;
      want.front = front;
    };
    // his own pose: a lean (deg), a squash or stretch (sy > 1 is taller), a size
    const pose = (rot: number, sx: number, sy: number, k = 1) => {
      want.rot = rot;
      want.sx = sx;
      want.sy = sy;
      want.k = k;
    };
    const draw = (dt: number) => {
      if (Number.isNaN(cur.x)) Object.assign(cur, { x: want.x, y: want.y, rot: want.rot, sx: want.sx, sy: want.sy, k: want.k });
      const f = 1 - Math.exp(-dt * 14);
      cur.x += (want.x - cur.x) * f;
      cur.y += (want.y - cur.y) * f;
      const dr = ((((want.rot - cur.rot) % 360) + 540) % 360) - 180;
      cur.rot += dr * f;
      cur.sx += (want.sx - cur.sx) * f;
      cur.sy += (want.sy - cur.sy) * f;
      cur.k += (want.k - cur.k) * f;
      me.style.transform = `translate(${(cur.x - S / 2).toFixed(1)}px, ${(cur.y - S / 2).toFixed(1)}px)`;
      me.style.zIndex = want.front ? '3' : '0';
      inner.style.transform = `rotate(${cur.rot.toFixed(1)}deg) scale(${(cur.sx * cur.k).toFixed(3)}, ${(cur.sy * cur.k).toFixed(3)})`;
    };
    const size = () => ({ w: box.clientWidth, h: box.clientHeight });
    const peekAt = (lift: number) => ({ x: size().w * PEEK_X, y: -S * 0.1 - lift });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const p = peekAt(0);
      place(p.x, p.y, false);
      pose(0, 1, 1);
      draw(1);
      return;
    }
    // a spark left behind on the orbit, fading as it falls a little
    let lastSpark = 0;
    const spark = (x: number, y: number, front: boolean) => {
      const d = document.createElement('span');
      d.className = 'sparky-spark';
      const r = 3 + Math.random() * 4;
      d.style.cssText = `left:${(x - r / 2 + (Math.random() - 0.5) * 10).toFixed(1)}px;top:${(y - r / 2 + (Math.random() - 0.5) * 10).toFixed(1)}px;width:${r.toFixed(1)}px;height:${r.toFixed(1)}px;z-index:${front ? 3 : 0}`;
      box.appendChild(d);
      window.setTimeout(() => d.remove(), 900);
    };
    // the orbit round the box, a little wider and taller than it; angle 0 at the right, π/2 at the bottom (in front)
    // on his lap he goes behind the box along its top, in front along its bottom, like a small planet (18 Nov,
    // review: "when he draws the circle, let him fly behind the message box"); `under` false keeps him in front
    let under = false;
    const orbit = (a: number) => {
      const { w, h } = size();
      const rx = w / 2 + 40, ry = h / 2 + 30;
      return { x: w / 2 + rx * Math.cos(a), y: h / 2 + ry * Math.sin(a), front: !under || Math.sin(a) > -0.05, depth: under ? Math.sin(a) : Math.max(0, Math.sin(a)) };
    };
    const peekAngle = () => {
      const { w } = size();
      return -Math.acos(Math.max(-1, Math.min(1, (w * PEEK_X - w / 2) / (w / 2 + 40))));
    };
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2; // overshoots a little, then settles
    // curious: the box hovered or typed in brings him up for a look
    let eager = 0, eagerUntil = 0;
    const lookUp = () => (eagerUntil = performance.now() + 1600);
    const typed = () => (eagerUntil = performance.now() + 1100);
    box.addEventListener('pointerenter', lookUp);
    box.addEventListener('input', typed);
    const PEEK = 12, RISE = 1.3, LAP = 11, SINK = 1.5; // calmer (18 Nov, review: "he flies too fast")
    let phase: 'peek' | 'rise' | 'orbit' | 'sink' = 'peek';
    let t0 = performance.now();
    let laps = 1;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      const a0 = peekAngle();
      // eagerness eases in and out, so his pop-up is smooth
      eager += ((now < eagerUntil ? 1 : 0) - eager) * Math.min(1, dt * 7);
      step(now, t, a0);
      draw(dt);
    };
    const step = (now: number, t: number, a0: number) => {
      if (phase === 'peek') {
        // a slow bob and a curious lean; when eager, up higher with a quick little hop
        const bob = Math.sin(t * 1.8) * 3;
        const hop = eager * (14 + Math.abs(Math.sin(t * 9)) * 6);
        const p = peekAt(bob + hop);
        place(p.x, p.y, false);
        pose(Math.sin(t * 0.9) * 12 - eager * 8, 1, 1);
        // he leaves only when he isn't busy looking
        if (t > PEEK && eager < 0.05) ((phase = 'rise'), (t0 = now), (laps = 1), (under = true));
        return;
      }
      if (phase === 'rise') {
        // a squash, then up and out with a spin onto the orbit
        const f = Math.min(1, t / RISE);
        if (f < 0.18) {
          const q = f / 0.18;
          const p = peekAt(0);
          place(p.x, p.y + q * 4, false);
          pose(0, 1 + 0.18 * q, 1 - 0.22 * q);
          return;
        }
        const k = back((f - 0.18) / 0.82);
        const p = peekAt(0), o = orbit(a0);
        place(p.x + (o.x - p.x) * k, p.y + (o.y - p.y) * k - Math.sin(Math.min(1, k) * Math.PI) * 26, k > 0.6);
        pose(360 * ease(Math.min(1, k)), 1 - 0.08 * Math.sin(k * Math.PI), 1 + 0.16 * Math.sin(k * Math.PI));
        if (f >= 1) ((phase = 'orbit'), (t0 = now));
        return;
      }
      if (phase === 'orbit') {
        // clockwise, `laps` turns; bigger in front, smaller behind; he leans into the curve and leaves sparks
        const f = Math.min(1, t / (LAP * laps));
        const a = a0 + ease(f) * laps * 2 * Math.PI;
        const o = orbit(a);
        // he sets off in front, as he came out (18 Nov, review: "he's on the box, then you put him behind: don't"):
        // down the right side and along the bottom, and only goes behind once he's round on the far side
        const early = a - a0 < Math.PI;
        const front = o.front || early;
        const depth = early ? Math.max(0, o.depth) : o.depth;
        place(o.x, o.y, front);
        pose(Math.cos(a) * 18, 1, 1, 0.86 + 0.26 * ((depth + 1) / 2));
        if (now - lastSpark > 70 && depth > -0.2) ((lastSpark = now), spark(o.x, o.y, front));
        if (f >= 1) ((phase = 'sink'), (t0 = now));
        return;
      }
      // back behind the top edge with a little bounce on landing, to peek again
      const f = Math.min(1, t / SINK);
      const k = back(f);
      const o = orbit(a0), p = peekAt(0);
      place(o.x + (p.x - o.x) * k, o.y + (p.y - o.y) * k, false);
      const land = f > 0.75 ? Math.sin(((f - 0.75) / 0.25) * Math.PI) : 0;
      pose(-12 * (1 - f), 1 + 0.14 * land, 1 - 0.14 * land);
      if (f >= 1) ((phase = 'peek'), (t0 = now));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      box.removeEventListener('pointerenter', lookUp);
      box.removeEventListener('input', typed);
    };
  }, [frame]);
  return (
    <span ref={el} className="sparky-peek" aria-hidden>
      <span ref={body} className="sparky-peek__body">
        <SparkiStill size={S} />
      </span>
    </span>
  );
}
