// Ask Dr.AI's start page with what needs you (11 Nov), picked on #/demo/ask-attention after the client's reference
// (Transistor's "Good morning. 5 things need your attention."): the greeting, the count, the things that need you as
// a stack of cards to leaf through, the chat box as today at the foot. No mascot. The send button turns into the
// Spark metal button once there is something to send.
//   Leafing: arrows, ↑/↓, the dots, a swipe or the wheel. "Later" sends a card to the back.
//   Light (picked): see-through glass cards, the deadline as a warm badge, "Review →" as the metal button; Swipe:
//   the front card flies off to the side; Fan: the cards behind fan out. The demo keeps the other options to compare.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { CardRail } from '../../components/ui/CardRail';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { cx } from '../../components/ui/primitives';
import { BeamEdge } from '../../components/ui/BeamEdge';
import { MetalButton } from '../../components/ui/MetalButton';
import { SparkiStill } from '../../components/ui/DrAi';
import { Composer } from './Composer';
import { KIND_TITLE, useMessages, type Msg } from './DrAiDock';
import type { Attachment } from '../../data/types';
import '../../styles/ask-attention.css';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
const plain = (t: string) => t.replace(/[[\]]/g, '');
/** A card's title: the marked words of the line ("[Riyadh launch campaign]"), capitalised. */
// Spark's suggestions while onboarding have their own names (their marked words read as an instruction)
const TITLES: Record<string, string> = { files: 'Brand files', team: 'Invite your team' };
const title = (m: Msg) => {
  if (TITLES[m.key]) return TITLES[m.key];
  const hit = m.text.match(/\[([^\]]+)\]/)?.[1] ?? plain(m.text);
  return hit.charAt(0).toUpperCase() + hit.slice(1);
};

export type Look = 'ink' | 'light';
// The light look's options to compare (11 Nov, review): how a card leaves and the next comes in, and how the
// cards waiting behind the front one look.
export const MOTIONS = [
  { v: 'lift', label: 'Lift', note: 'lifts away and tips back' },
  { v: 'slide', label: 'Slide', note: 'the stack glides up' },
  { v: 'fade', label: 'Fade', note: 'dissolves as it grows' },
  { v: 'flip', label: 'Flip', note: 'turns over its top edge' },
  { v: 'swipe', label: 'Swipe', note: 'flies off to the side' },
] as const;
export const PEEKS = [
  { v: 'ghost', label: 'Ghost', note: 'the next title, faded' },
  { v: 'glass', label: 'Glass', note: 'thin glass edges' },
  { v: 'fan', label: 'Fan', note: 'fanned out behind' },
  { v: 'tabs', label: 'Tabs', note: 'tight strips below' },
  { v: 'sharp', label: 'Sharp', note: 'the next card, crisp' },
  { v: 'one', label: 'One', note: 'just the next card, soft' },
] as const;
export type Motion = (typeof MOTIONS)[number]['v'];
export type Peek = (typeof PEEKS)[number]['v'];

function Card({ m, pos, n, leaving, look, onAct, onAsk, onLater }: { m: Msg; pos: number; n: number; leaving: boolean; look: Look; onAct: () => void; onAsk: () => void; onLater: () => void }) {
  // pos 0 in front, 1 and 2 behind it; the card just left lifts away above first, then settles in at the back
  const state = leaving ? 'gone' : pos === 0 ? 'front' : pos === n - 1 && n > 3 ? 'gone' : pos <= 2 ? `back${pos}` : 'hidden';
  const tone = m.tone === 'critical' ? 'critical' : m.tone === 'urgent' ? 'urgent' : 'calm';
  if (look === 'light') {
    // see-through glass (11 Nov, review: the client wants transparency); the deadline as a badge you can't miss;
    // no icon and no "Needs you" (the line above says it); the action as the Spark metal button, Later as it was
    return (
      <article className={cx('aa-card aa-card--light', `is-${state}`, `aa-card--${tone}`)} aria-hidden={pos !== 0}>
        <div className="aa-card__main">
          {/* the deadline, when there is one; without it the title comes first (11 Nov, review) */}
          {m.tag && (
            <header className="aa-card__top">
              <span className={cx('aa-due', `aa-due--${tone}`)}>{m.tag}</span>
            </header>
          )}
          <h3 className="aa-card__title">{title(m)}</h3>
          <p className="aa-card__body">{plain(m.text)}</p>
          <footer className="aa-card__acts">
            <MetalButton tone="spark" profile="portal" className="aa-card__go" onClick={onAct} aria-label={m.action.label}>
              {/^review/i.test(m.action.label) ? 'Review' : m.action.label} <ArrowRight size={15} />
            </MetalButton>
            <button type="button" className="aa-pill" onClick={onLater}>
              Later
            </button>
          </footer>
        </div>
      </article>
    );
  }
  return (
    <article className={cx('aa-card', `is-${state}`, `aa-card--${tone}`)} aria-hidden={pos !== 0}>
      <header className="aa-card__head">
        <span className="aa-card__kind">{KIND_TITLE[m.kind ?? 'needs']}</span>
        {m.tag && <span className="aa-card__tag">{m.tag}</span>}
      </header>
      <h3 className="aa-card__title">{title(m)}</h3>
      <p className="aa-card__body">{plain(m.text)}</p>
      <footer className="aa-card__acts">
        <MetalButton tone="spark" profile="portal" className="aa-card__go" onClick={onAct}>
          {m.action.label} <ArrowRight size={14} />
        </MetalButton>
        <button type="button" className="aa-card__ask" onClick={onAsk}>
          <MessageCircle size={14} /> Ask Dr.AI
        </button>
        <span className="aa-card__sp" />
        <button type="button" className="aa-card__later" onClick={onLater}>
          Later
        </button>
      </footer>
    </article>
  );
}

/** Sparki around the cards (12 Nov): he sets off from the end of "… need your attention.", swings down onto an
 *  orbit round the front card and goes round it twice, like a planet: small and blurred behind the glass at the top,
 *  bigger and in front at the bottom. Then he slips behind the card and is gone for a few seconds, and comes out
 *  again somewhere else on the orbit for another turn or two. He hops with a spin when the card changes. */
const LAP = 7.5; // seconds a turn
function SparkiOrbit({ wrap, hop }: { wrap: React.RefObject<HTMLDivElement | null>; hop: number }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const box = wrap.current;
    const me = el.current;
    if (!box || !me) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // where the line of text ends, in the wrap's coordinates
    const textEnd = () => {
      const line = box.parentElement?.querySelector('.aa-subline');
      const b = box.getBoundingClientRect();
      if (!line) return { x: b.width / 2, y: -60 };
      const r = document.createRange();
      r.selectNodeContents(line);
      const t = r.getBoundingClientRect();
      return { x: t.right - b.left + 18, y: t.top + t.height / 2 - b.top };
    };
    // the orbit: round the front card, a little wider than it, tilted a touch
    const orbitAt = (a: number) => {
      const b = box.getBoundingClientRect();
      const c = box.querySelector('.aa-card.is-front')?.getBoundingClientRect() ?? b;
      const cx = c.left + c.width / 2 - b.left, cy = c.top + c.height / 2 - b.top;
      const rx = c.width / 2 + 56, ry = c.height / 2 + 34, tilt = -0.07;
      const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
      return { x: cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), y: cy + ex * Math.sin(tilt) + ey * Math.cos(tilt), depth: Math.sin(a) };
    };
    const place = (x: number, y: number, depth: number, show: number) => {
      // depth -1 (behind, at the top) … 1 (in front, at the bottom)
      const k = 0.78 + 0.3 * (depth + 1) / 2;
      me.style.transform = `translate(${x - 23}px, ${y - 23}px) scale(${(k * (0.4 + 0.6 * show)).toFixed(3)})`;
      me.style.opacity = show.toFixed(3);
      me.style.zIndex = depth > -0.15 ? '3' : '1';
    };
    if (still) {
      const p = textEnd();
      place(p.x, p.y, 1, 1);
      return;
    }
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    // one flight: from `from` (the text, or out from behind the card at angle a0), `laps` turns, then gone behind
    type Flight = { t0: number; a0: number; laps: number; fromText: boolean; rest: number };
    let f: Flight = { t0: performance.now() + 900, a0: -0.55, laps: 2, fromText: true, rest: 0 };
    const LEAD = 1.3, OUT = 0.7;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const t = (now - f.t0) / 1000;
      if (t < 0) return place(0, 0, 0, 0);
      const fly = f.laps * LAP;
      // the angle runs on from a0 and ends at the top of the orbit (behind the card), where he disappears
      const end = -Math.PI / 2 + Math.ceil((f.a0 + Math.PI / 2) / (2 * Math.PI) + f.laps) * 2 * Math.PI;
      const a = f.a0 + (end - f.a0) * Math.min(1, Math.max(0, t / fly));
      const o = orbitAt(a);
      if (f.fromText && t < LEAD) {
        // a curve from the end of the text down onto the orbit, growing into his size
        const p = textEnd(), k = ease(t / LEAD);
        const mx = (p.x + o.x) / 2 + 60, my = (p.y + o.y) / 2 - 20;
        const x = (1 - k) ** 2 * p.x + 2 * (1 - k) * k * mx + k * k * o.x;
        const y = (1 - k) ** 2 * p.y + 2 * (1 - k) * k * my + k * k * o.y;
        return place(x, y, 1 - k * (1 - o.depth), Math.min(1, t / 0.35));
      }
      if (t < fly) return place(o.x, o.y, o.depth, f.fromText ? 1 : Math.min(1, t / 0.6));
      if (t < fly + OUT) return place(o.x, o.y, -1, 1 - (t - fly) / OUT);
      place(o.x, o.y, -1, 0);
      if (t > fly + OUT + f.rest) {
        // out again elsewhere: from behind the card on its upper half, for one or two turns
        f = { t0: now, a0: -Math.PI + Math.random() * Math.PI, laps: Math.random() < 0.5 ? 1 : 2, fromText: false, rest: 0 };
      }
      if (!f.rest) f.rest = 4 + Math.random() * 4;
    };
    f.rest = 4 + Math.random() * 4;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [wrap]);
  return (
    <span ref={el} className="aa-sparki" aria-hidden>
      <span key={hop} className={cx('aa-sparki__hop', hop > 0 && 'is-hop')}>
        <span className="aa-sparki__float">
          <SparkiStill size={46} />
        </span>
      </span>
    </span>
  );
}

function Stack({ msgs, onAsk, look, motion = 'swipe', peek = 'fan', pulse = 0 }: { msgs: Msg[]; onAsk: (m: Msg) => void; look: Look; motion?: Motion; peek?: Peek; pulse?: number }) {
  const [order, setOrder] = useState(() => msgs.map((m) => m.key));
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [leaving, setLeaving] = useState<string | null>(null);
  // Sparki floats by the front card and hops each time it changes (12 Nov: the client wants Sparki used somewhere)
  const [hop, setHop] = useState(0);
  const leaveT = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const lock = useRef(0);
  const list = order.map((k) => msgs.find((m) => m.key === k)!).filter(Boolean);
  const n = list.length;
  const go = (d: number) => {
    const t = performance.now();
    if (t - lock.current < 380 || n < 2) return; // one card per flick
    lock.current = t;
    if (d > 0) {
      // the front card lifts away and tips back before it takes its place at the back
      setLeaving(order[i % n]);
      clearTimeout(leaveT.current);
      leaveT.current = window.setTimeout(() => setLeaving(null), 420);
    }
    setI((x) => (x + d + n) % n);
    setHop((h) => h + 1);
  };
  // a pick on the demo plays one leaf, so the motion can be seen
  useEffect(() => {
    if (!pulse) return;
    lock.current = 0;
    go(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulse]);
  // "Later": this card to the back of the stack, the next one forward
  const later = (key: string) => {
    setOrder((o) => [...o.filter((k) => k !== key), key]);
    setI((x) => (x >= n - 1 ? 0 : x));
    setHop((h) => h + 1);
  };
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      go(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  });
  // swipe up / down
  const start = useRef<number | null>(null);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), go(1));
    if (e.key === 'ArrowUp') (e.preventDefault(), go(-1));
  };
  if (!n) return <p className="aa-none">Nothing needs you right now.</p>;
  if (hidden)
    return (
      <button type="button" className="aa-folded" onClick={() => setHidden(false)}>
        {NUM[n] ?? n} {n === 1 ? 'thing needs' : 'things need'} you · <b>Show</b>
      </button>
    );
  return (
    <div ref={wrap} className={cx('aa-stack-wrap', `aa-stack-wrap--${look}`, !list.some((m) => m.tag) && 'aa-stack-wrap--compact')} data-motion={motion} data-peek={peek}>
      <div
        ref={box}
        className="aa-stack"
        tabIndex={0}
        role="region"
        aria-roledescription="stack of cards"
        aria-label={`What needs your attention, ${(i % n) + 1} of ${n}`}
        onKeyDown={onKey}
        onPointerDown={(e) => (start.current = e.clientY)}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dy = e.clientY - start.current;
          start.current = null;
          if (Math.abs(dy) > 36) go(dy < 0 ? 1 : -1);
        }}
      >
        {list.map((m, k) => (
          <Card
            key={m.key}
            m={m}
            pos={(k - i + n) % n}
            n={n}
            leaving={leaving === m.key}
            look={look}
            onAct={() => navigate(m.action.href.replace(/^#/, ''))}
            onAsk={() => onAsk(m)}
            onLater={() => later(m.key)}
          />
        ))}
      </div>
      {look === 'light' && <SparkiOrbit wrap={wrap} hop={hop} />}
      <CardRail
        count={n}
        index={i}
        onStep={go}
        onPick={(k) => {
          if (k !== i) setHop((h) => h + 1);
          setI(k);
        }}
      />
      {/* Hide, on both looks again (12 Nov, review) */}
      <button type="button" className="aa-hide" onClick={() => setHidden(true)}>
        Hide
      </button>
    </div>
  );
}


/** The Ask Dr.AI start page with what needs you (11 Nov, picked on #/demo/ask-attention): the greeting, the count,
 *  the stack of cards (Light, Swipe, Fan by default) and the chat box at the foot. `controls` is the demo's slot. */
export function AttentionStart({
  onAsk,
  look = 'light',
  motion = 'swipe',
  peek = 'fan',
  pulse = 0,
  controls,
}: {
  onAsk: (text: string, attachments?: Attachment[]) => void;
  look?: Look;
  motion?: Motion;
  peek?: Peek;
  pulse?: number;
  controls?: ReactNode;
}) {
  const { me } = useStore();
  const first = me.name.split(' ')[0];
  // What needs you, not the week's news. While nothing is due (a company onboarding) the stack holds Spark's
  // suggestions (upload files, invite the team); once there are things with deadlines, only those (11 Nov, review).
  const all = useMessages().filter((m) => m.kind !== 'news');
  const due = all.filter((m) => m.kind !== 'reminder');
  const msgs = due.length ? due : all;
  const n = msgs.length;
  const [draft, setDraft] = useState({ key: 0, text: '' });
  // No mascot here (11 Nov): Dr.AI's corner window, which would repeat these cards, steps aside on this page.
  useEffect(() => {
    document.documentElement.dataset.noDock = 'on';
    return () => {
      delete document.documentElement.dataset.noDock;
    };
  }, []);
  const askAbout = (m: Msg) => setDraft((d) => ({ key: d.key + 1, text: `Tell me about ${title(m)}: ` }));
  const line: ReactNode = n ? (
    <>
      {NUM[n] ?? n} {n === 1 ? 'thing needs' : 'things need'} your attention.
    </>
  ) : (
    'Nothing needs your attention.'
  );
  return (
    <div className={cx('chats-start aa', `aa--${look}`)}>
      {controls}
      <div className="chats-start__col">
        {look === 'ink' ? (
          <h1 className="chats-start__greet aa-greet">
            <span className="chats-start__soft">{greeting()},</span> {first}.
            <br />
            {line}
          </h1>
        ) : (
          <div className="aa-hello">
            <h1 className="chats-start__greet aa-greet aa-greet--big">
              <span className="chats-start__soft">{greeting()},</span> {first}.
            </h1>
            <p className="aa-subline">{line}</p>
          </div>
        )}
        <Stack key={`${look}:${msgs.map((m) => m.key).join(',')}`} msgs={msgs} onAsk={askAbout} look={look} motion={motion} peek={peek} pulse={pulse} />
        <div className="chats-start__glass aa-box">
          <span className="chats-start__light" aria-hidden />
          <div className="chats-start__frame">
            <BeamEdge>
              <Composer key={draft.key} look="box" initial={draft.text} autoFocus={draft.key > 0} metalSend onSubmit={(t, a) => onAsk(t, a)} placeholder="Ask Dr.AI anything…" />
            </BeamEdge>
          </div>
        </div>
      </div>
    </div>
  );
}
