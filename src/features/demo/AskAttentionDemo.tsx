// Prototype-only page (#/demo/ask-attention, 11 Nov): another Ask Dr.AI start page, after the client's reference
// (Transistor's "Good morning. 5 things need your attention."). The greeting as today, then what needs you as a
// stack of cards to leaf through, and the chat box as today at the foot. No mascot. The send button turns into the
// Spark metal button once there is something to send.
//   Leafing: the front card lifts away and tips back as the next one comes forward; arrows, ↑/↓, the dots, a
//   swipe or the wheel. "Later" sends a card to the back. "Hide" folds the stack to one line.
// Two looks (?look=light): Ink cards, or light cards after the reference itself (an icon, a quiet label, the time
// at the right, outlined mono buttons, the next card fading in below).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate, useRoute, withQuery } from '../../lib/router';
import { cx } from '../../components/ui/primitives';
import { BeamEdge } from '../../components/ui/BeamEdge';
import { MetalButton } from '../../components/ui/MetalButton';
import { Composer } from '../assistant/Composer';
import { KIND_TITLE, useMessages, type Msg } from '../assistant/DrAiDock';
import type { Attachment } from '../../data/types';
import '../../styles/ask-attention.css';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
const plain = (t: string) => t.replace(/[[\]]/g, '');
/** A card's title: the marked words of the line ("[Riyadh launch campaign]"), capitalised. */
const title = (m: Msg) => {
  const hit = m.text.match(/\[([^\]]+)\]/)?.[1] ?? plain(m.text);
  return hit.charAt(0).toUpperCase() + hit.slice(1);
};

type Look = 'ink' | 'light';
// The light look's options to compare (11 Nov, review): how a card leaves and the next comes in, and how the
// cards waiting behind the front one look.
const MOTIONS = [
  { v: 'lift', label: 'Lift', note: 'lifts away and tips back' },
  { v: 'slide', label: 'Slide', note: 'the stack glides up' },
  { v: 'fade', label: 'Fade', note: 'dissolves as it grows' },
  { v: 'flip', label: 'Flip', note: 'turns over its top edge' },
  { v: 'swipe', label: 'Swipe', note: 'flies off to the side' },
] as const;
const PEEKS = [
  { v: 'ghost', label: 'Ghost', note: 'the next title, faded' },
  { v: 'glass', label: 'Glass', note: 'thin glass edges' },
  { v: 'fan', label: 'Fan', note: 'fanned out behind' },
  { v: 'tabs', label: 'Tabs', note: 'tight strips below' },
  { v: 'sharp', label: 'Sharp', note: 'the next card, crisp' },
  { v: 'one', label: 'One', note: 'just the next card, soft' },
] as const;
type Motion = (typeof MOTIONS)[number]['v'];
type Peek = (typeof PEEKS)[number]['v'];

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
          <header className="aa-card__top">
            {m.tag ? <span className={cx('aa-due', `aa-due--${tone}`)}>{m.tag}</span> : <span />}
          </header>
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

function Stack({ msgs, onAsk, look, motion = 'swipe', peek = 'fan', pulse = 0 }: { msgs: Msg[]; onAsk: (m: Msg) => void; look: Look; motion?: Motion; peek?: Peek; pulse?: number }) {
  const [order, setOrder] = useState(() => msgs.map((m) => m.key));
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [leaving, setLeaving] = useState<string | null>(null);
  const leaveT = useRef(0);
  const box = useRef<HTMLDivElement>(null);
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
    <div className={cx('aa-stack-wrap', `aa-stack-wrap--${look}`)} data-motion={motion} data-peek={peek}>
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
      <nav className="aa-rail" aria-label="Cards">
        <button type="button" onClick={() => go(-1)} aria-label="Previous" disabled={n < 2}>
          <ChevronUp size={15} />
        </button>
        {list.map((m, k) => (
          <button key={m.key} type="button" className={cx('aa-dot', k === i && 'is-on')} onClick={() => setI(k)} aria-label={`Card ${k + 1}`} aria-current={k === i} />
        ))}
        <button type="button" onClick={() => go(1)} aria-label="Next" disabled={n < 2}>
          <ChevronDown size={15} />
        </button>
      </nav>
      {look === 'ink' && (
        <button type="button" className="aa-hide" onClick={() => setHidden(true)}>
          Hide
        </button>
      )}
    </div>
  );
}

export function AskAttentionDemo() {
  const { me, actions } = useStore();
  const first = me.name.split(' ')[0];
  const { query } = useRoute();
  const look: Look = query.get('look') === 'light' ? 'light' : 'ink';
  const motion = (MOTIONS.find((x) => x.v === query.get('motion'))?.v ?? 'swipe') as Motion; // picked 11 Nov: Swipe
  const peek = (PEEKS.find((x) => x.v === query.get('peek'))?.v ?? 'fan') as Peek; // and Fan
  const [pulse, setPulse] = useState(0);
  const pick = (k: 'motion' | 'peek', v: string) => {
    navigate(withQuery('/demo/ask-attention', { look: 'light', motion: k === 'motion' ? v : motion, peek: k === 'peek' ? v : peek }), { replace: true });
    window.setTimeout(() => setPulse((p) => p + 1), 60);
  };
  const msgs = useMessages().filter((m) => m.kind !== 'news'); // what needs you, not the week's news
  const n = msgs.length;
  const [draft, setDraft] = useState({ key: 0, text: '' });
  const send = (text: string, attachments: Attachment[] = []) => {
    const id = actions.ask(null, text, { attachments });
    navigate(`/assistant/${id}`);
  };
  // No mascot on this page (11 Nov): Dr.AI's corner window, which would repeat these cards, steps aside here.
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
    <div className="assistant assistant--chats aa-page">
      <section className="assistant__main">
    <div className={cx('chats-start aa', `aa--${look}`)}>
      <div className="aa-looks" role="radiogroup" aria-label="Look">
        {(['ink', 'light'] as const).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={look === v} className={cx(look === v && 'is-on')} onClick={() => navigate(withQuery('/demo/ask-attention', { look: v === 'light' ? 'light' : null }), { replace: true })}>
            {v === 'ink' ? 'Ink cards' : 'Light cards'}
          </button>
        ))}
      </div>
      {look === 'light' && (
        <div className="aa-opts">
          {(
            [
              ['motion', 'Switching', MOTIONS, motion],
              ['peek', 'Next cards', PEEKS, peek],
            ] as const
          ).map(([k, title, list, cur]) => (
            <div key={k} className="aa-opts__row" role="radiogroup" aria-label={title}>
              <span className="aa-opts__label">{title}</span>
              {list.map((o) => (
                <button key={o.v} type="button" role="radio" aria-checked={cur === o.v} className={cx(cur === o.v && 'is-on')} title={o.note} onClick={() => pick(k, o.v)}>
                  {o.label}
                </button>
              ))}
            </div>
          ))}
          <button type="button" className="aa-opts__play" onClick={() => setPulse((p) => p + 1)}>
            Play ▸
          </button>
        </div>
      )}
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
        <Stack key={look} msgs={msgs} onAsk={askAbout} look={look} motion={motion} peek={peek} pulse={pulse} />
        <div className="chats-start__glass aa-box">
          <span className="chats-start__light" aria-hidden />
          <div className="chats-start__frame">
            <BeamEdge>
              <Composer key={draft.key} look="box" initial={draft.text} autoFocus={draft.key > 0} metalSend onSubmit={send} placeholder="Ask Dr.AI anything…" />
            </BeamEdge>
          </div>
        </div>
      </div>
    </div>
      </section>
    </div>
  );
}
