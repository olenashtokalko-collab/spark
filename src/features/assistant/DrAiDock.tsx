// Dr.AI's dock (prototype, 6 Nov, after the client's feedback "let Dr.AI and Sparki be a lovely assistant, not the
// avatar of the chat"): on every page he stands in full with Sparki by his head, and says only what is urgent or
// critical, one thing at a time, with its action and "Ask me". Ask me opens the side panel with the whole chat,
// what needs you on top. Three ways to place him, picked on #/demo/dock and kept in this browser:
//   corner: he stands in the lower right corner, his message in a glass card at his side;
//   bar:    a glass bar at the foot of the page, him standing on its left end;
//   top:    a glass strip at the top of the page that stays as you scroll, him standing in it.
// Folded, he becomes small (his head with a count), one click brings the message back.
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import { navigate, useRoute } from '../../lib/router';
import { useStore } from '../../state/store';
import { STEPS, SparkiGuide, Stepper, useJustDone, useOnboarding } from '../onboarding/Onboarding';
import { analyses } from '../../data/mock';
import { fmtDate } from '../../lib/format';
import { cx } from '../../components/ui/primitives';
import { DrAiHead, SparkiStill } from '../../components/ui/DrAi';
import { MascotClip } from '../demo/MascotDemo';
import { useModel } from '../home/HomeLayouts';
import { ChatDrawer } from './ChatDrawer';

export const DOCK_LOOKS = [
  { v: 'corner', label: 'A · Corner', note: 'He stands in the lower right corner of every page; his message sits in a glass card at his side.' },
  { v: 'bar', label: 'B · Bar at the foot', note: 'A glass bar at the foot of the page, him standing on its left end, the message in one line.' },
  { v: 'top', label: 'C · Strip at the top', note: 'A glass strip at the top of each page, staying while you scroll, him standing in it.' },
  { v: 'off', label: 'Off', note: 'No dock: the portal as it is now.' },
] as const;
export type DockLook = (typeof DOCK_LOOKS)[number]['v'];

const KEY = 'spark-dock';
const EVENT = 'spark-dock';
function dockLook(): DockLook {
  try {
    const v = localStorage.getItem(KEY);
    return (DOCK_LOOKS.find((x) => x.v === v)?.v ?? 'corner') as DockLook;
  } catch {
    return 'corner';
  }
}
export function setDockLook(v: DockLook) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* lasts this visit */
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useDockLook() {
  const [v, setV] = useState(dockLook);
  useEffect(() => {
    const f = () => setV(dockLook());
    window.addEventListener(EVENT, f);
    return () => window.removeEventListener(EVENT, f);
  }, []);
  return v;
}

type Msg = { key: string; tag: string; tone: 'urgent' | 'critical' | 'reminder'; text: string; action: { label: string; href: string } };

/** Only what can't wait: the decisions due first, and the finding that costs the most. [Brackets]: the gradient. */
function useMessages(): Msg[] {
  const m = useModel(analyses);
  const { state } = useStore();
  const ob = useOnboarding();
  const due: Msg[] = m.waiting.slice(0, 2).map((w) => ({
    key: w.key,
    tag: w.date ? `Due ${fmtDate(w.date.iso)}` : 'Needs you',
    tone: 'urgent',
    text:
      w.type === 'Proposal'
        ? `Spark’s proposal for [${w.title}] is waiting for your decision.`
        : `Spark needs your feedback on [${w.title}] to keep going.`,
    action: { label: w.action, href: w.href },
  }));
  // A new account after the tutorial (6 Nov): no reports to warn about; instead, what was put off, as reminders.
  if (ob.fresh) {
    const later: Msg[] = [];
    if (!state.docs.some((d) => d.uploadedBy === 'u-layla'))
      later.push({
        key: 'files',
        tag: 'Reminder',
        tone: 'reminder',
        text: 'Spark doesn’t have your [brand files] yet. Share them, and your first proposal fits you better.',
        action: { label: 'Upload files', href: '#/documents' },
      });
    if (!state.invitations.length)
      later.push({
        key: 'team',
        tag: 'Reminder',
        tone: 'reminder',
        text: 'Your team can’t see requests yet. [Invite them] when you’re ready.',
        action: { label: 'Invite people', href: '#/team' },
      });
    return [...due, ...later];
  }
  return [
    ...due,
    {
      key: 'web-speed',
      tag: 'Critical',
      tone: 'critical',
      text: 'Your website is [slow on mobile]: 6.8 s on 4G. It’s costing you sales.',
      action: { label: 'See the fix', href: '#/brand-analysis/website' },
    },
  ];
}

/** Types the line each time it changes; reduced motion shows it at once. */
function useTyped(text: string, lead = 500) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [s, setS] = useState({ text, n: reduce ? text.length : 0 });
  if (s.text !== text) setS({ text, n: reduce ? text.length : 0 });
  useEffect(() => {
    if (s.n >= text.length) return;
    const t = setTimeout(() => setS((x) => ({ ...x, n: x.n + 1 })), s.n === 0 ? lead : 20);
    return () => clearTimeout(t);
  }, [s, text, lead]);
  return { n: s.n, done: s.n >= text.length };
}
const plain = (t: string) => t.replace(/[[\]]/g, '');

/** The marked line typed up to n; the rest waits invisible so nothing jumps. */
function Typed({ text, n }: { text: string; n: number }) {
  let k = 0;
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((s, i) => {
        const mark = s.startsWith('[');
        const body = mark ? s.slice(1, -1) : s;
        const from = k;
        k += body.length;
        const shown = Math.max(0, Math.min(body.length, n - from));
        return (
          <span key={i} className={cx(mark && 'dk-hl')}>
            {body.slice(0, shown)}
            <span className="dk-ghost">{body.slice(shown)}</span>
          </span>
        );
      })}
    </>
  );
}

/** What needs you, on top of the chat panel when Ask me opens it. */
function NowList({ msgs, onGo }: { msgs: Msg[]; onGo: () => void }) {
  return (
    <section className="dk-now">
      <h4>
        <SparkiStill size={18} /> Needs you now
      </h4>
      <ul>
        {msgs.map((x) => (
          <li key={x.key}>
            <span className={cx('dk-tag', `dk-tag--${x.tone}`)}>{x.tag}</span>
            <span className="dk-now__text">{plain(x.text)}</span>
            <a href={x.action.href} onClick={onGo}>
              {x.action.label} <ArrowRight size={13} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// One intro a visit: Sparki flies out the first time he appears, not on every page.
const NO_DOCK = import.meta.env.VITE_NO_DOCK === '1';
let introDone = false;
// Where Dr.AI was dragged to, for the rest of the visit (9 Nov).
let dockOff = { dx: 0, dy: 0 };

export function DrAiDock({ place }: { place: 'fixed' | 'top' | 'foot' }) {
  const look = useDockLook();
  const { path } = useRoute();
  const msgs = useMessages();
  const [i, setI] = useState(0);
  const [folded, setFolded] = useState(false);
  const [chat, setChat] = useState(false);
  // Drag Dr.AI aside by the mascot, as Sparki (9 Nov, review); the window comes with him. Kept for the visit.
  const [off, setOff] = useState(() => dockOff);
  const grab = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const dragProps = {
    className: 'dk-drag',
    title: 'Drag me aside',
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      grab.current = { x: e.clientX, y: e.clientY, dx: off.dx, dy: off.dy };
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const g = grab.current;
      if (g) {
        const next = { dx: g.dx + e.clientX - g.x, dy: g.dy + e.clientY - g.y };
        dockOff = next;
        setOff(next);
      }
    },
    onPointerUp: () => {
      grab.current = null;
    },
    onPointerCancel: () => {
      grab.current = null;
    },
  };
  const dragStyle = off.dx || off.dy ? { transform: `translate(${off.dx}px, ${off.dy}px)` } : undefined;
  const [intro] = useState(() => {
    const first = !introDone;
    introDone = true;
    return first;
  });
  const ob = useOnboarding();
  // Well done only for what was really done, not for a step put off (that would thank you for files you didn't send).
  const just = useJustDone(ob.done.map((d, k) => d && !ob.skipped[k]));
  // The finale (9 Nov): the first time every step is done or put off, glass sparks burst from the window.
  const [party, setParty] = useState(false);
  const wasAll = useRef(ob.all);
  useEffect(() => {
    if (ob.on && ob.all && !wasAll.current) {
      setParty(true);
      const t = setTimeout(() => setParty(false), 2800);
      wasAll.current = ob.all;
      return () => clearTimeout(t);
    }
    wasAll.current = ob.all;
  }, [ob.all, ob.on]);
  const { actions, state } = useStore();
  const [guiding, setGuiding] = useState(true);
  // Onboarding: what he says is the step (or well done for the one just done); otherwise what's urgent.
  const allSay = ob.skipped.some(Boolean) ? '[You’re all set!] I’ll remind you about what you put off.' : STEPS[STEPS.length - 1].doneSay;
  const obText = ob.on ? (just !== null ? STEPS[just].doneSay : ob.all ? allSay : STEPS[ob.current].say) : '';
  const msg = msgs[i % msgs.length];
  const typed = useTyped(ob.on ? plain(obText) : msg ? plain(msg.text) : '');

  // Where each look lives in the shell: the corner is fixed, the bar at the foot of the page, the strip at its top.
  // Onboarding always takes the corner, so Sparki has somewhere to fly from.
  const where = ob.fresh ? 'corner' : look;
  const mine = (where === 'corner' && place === 'fixed') || (where === 'bar' && place === 'foot') || (where === 'top' && place === 'top');
  // Sparki shows the current step; for a moment after one is done, where its result lives (the request, in Requests).
  const shown =
    just !== null
      ? STEPS[just].after && { id: `${STEPS[just].key}-after`, point: STEPS[just].after }
      : !ob.all && STEPS[ob.current] && { id: STEPS[ob.current].key, point: STEPS[ob.current].point };
  const guide = ob.on && place === 'fixed' && (
    <SparkiGuide point={shown ? shown.point : undefined} id={shown ? shown.id : undefined} active={guiding && !folded && !chat && !!shown} />
  );
  // Not on the chat itself, where he already is; Sparki still points the way there.
  if (!mine || path.startsWith('/assistant')) return guide || null;
  // A build without the corner Dr.AI (VITE_NO_DOCK=1, 9 Nov: spark-glass-share keeps him out for now); onboarding's
  // Sparki still guides where there is onboarding.
  if (NO_DOCK) return guide || null;
  // Nothing to say (a new account with nothing put off): he waits in the corner, his head opens the chat.
  if (!ob.on && !msg)
    return where === 'corner' ? (
      <>
        {!chat && (
          <button type="button" className="dk-mini dk-mini--corner" onClick={() => setChat(true)} aria-label="Ask Dr.AI">
            <DrAiHead size={44} />
          </button>
        )}
        <ChatDrawer open={chat} onClose={() => setChat(false)} />
      </>
    ) : null;

  if (ob.on) {
    const step = STEPS[ob.current];
    const ask = <ChatDrawer open={chat} onClose={() => setChat(false)} />;
    if (chat) return ask;
    if (folded)
      return (
        <button type="button" className="dk-mini dk-mini--corner" onClick={() => setFolded(false)} aria-label="Dr.AI: getting started">
          <DrAiHead size={44} />
          <b className="dk-mini__n">{STEPS.length - ob.count}</b>
        </button>
      );
    return (
      <>
        {guide}
        <div className="dk dk--corner dk--ob" style={dragStyle}>
          {party && <Confetti />}
          <div className={cx('dk-card', just !== null && 'is-cheer', party && 'is-cheer')}>
            <header className="dk-card__head">
              <b>{ob.all ? 'All set' : step?.optional ? 'Optional step' : 'Getting started'}</b>
              <span className="dk-card__n">
                {ob.count}/{STEPS.length}
              </span>
              <span className="dk-card__sp" />
              <button type="button" className="dk-fold" onClick={() => setFolded(true)} aria-label="Fold">
                <Minus size={15} />
              </button>
            </header>
            <Stepper done={ob.done} current={ob.current} skipped={ob.skipped} just={just} />
            <p className="dk-msg" aria-live="polite" aria-label={plain(obText)}>
              <Typed text={obText} n={typed.n} />
            </p>
            <span className={cx('dk-acts', typed.done && 'is-in')}>
              {ob.all ? (
                <button type="button" className="dk-btn dk-btn--primary" onClick={() => actions.endOnboarding()}>
                  Finish
                </button>
              ) : (
                <button
                  type="button"
                  className="dk-btn dk-btn--primary"
                  onClick={() => {
                    setGuiding(true);
                    // Takes you to where the step starts; Sparki then lights up the button there.
                    const to = step.go(state);
                    if (!path.startsWith(to)) navigate(to);
                  }}
                >
                  Show me
                </button>
              )}
              {/* Ask me stays on every step, so the chat is always one click away (6 Nov). */}
              <button type="button" className="dk-btn dk-btn--ask" onClick={() => setChat(true)}>
                Ask me
              </button>
              {step?.optional && !ob.all && (
                // Optional steps: a quiet link at the right; Dr.AI reminds you afterwards.
                <button type="button" className="dk-skip" onClick={() => actions.skipStep(step.key)}>
                  Skip for now
                </button>
              )}
            </span>
          </div>
          <span key="fig" {...dragProps}>
            <MascotClip state={typed.n > 0 && !typed.done ? 'speaking' : 'idle'} width={150} intro={intro} className="dk-fig" />
          </span>
        </div>
        {ask}
      </>
    );
  }

  const speaking = typed.n > 0 && !typed.done;
  const step = (d: number) => setI((x) => (x + d + msgs.length) % msgs.length);
  const pager = msgs.length > 1 && (
    <span className="dk-pager">
      <button type="button" onClick={() => step(-1)} aria-label="Previous">
        <ChevronLeft size={15} />
      </button>
      <span>
        {(i % msgs.length) + 1}/{msgs.length}
      </span>
      <button type="button" onClick={() => step(1)} aria-label="Next">
        <ChevronRight size={15} />
      </button>
    </span>
  );
  const line = (
    <p className="dk-msg" aria-live="polite" aria-label={plain(msg.text)}>
      <Typed text={msg.text} n={typed.n} />
    </p>
  );
  const acts = (
    <span className={cx('dk-acts', typed.done && 'is-in')}>
      <a className="dk-btn dk-btn--primary" href={msg.action.href}>
        {msg.action.label}
      </a>
      <button type="button" className="dk-btn dk-btn--ask" onClick={() => setChat(true)}>
        Ask me
      </button>
    </span>
  );
  const tag = <span className={cx('dk-tag', `dk-tag--${msg.tone}`)}>{msg.tag}</span>;
  const fold = (
    <button type="button" className="dk-fold" onClick={() => setFolded(true)} aria-label="Fold">
      <Minus size={15} />
    </button>
  );
  const drawer = <ChatDrawer open={chat} onClose={() => setChat(false)} top={<NowList msgs={msgs} onGo={() => setChat(false)} />} />;

  // While the panel is open he stands in it, so the dock steps aside.
  if (chat) return drawer;

  if (folded)
    return (
      <>
        <button type="button" className={cx('dk-mini', `dk-mini--${look}`)} onClick={() => setFolded(false)} aria-label={`Dr.AI: ${msgs.length} need you`}>
          <DrAiHead size={look === 'corner' ? 44 : 26} />
          {look !== 'corner' && <span>{msgs.length} things need you</span>}
          <b className="dk-mini__n">{msgs.length}</b>
        </button>
        {drawer}
      </>
    );

  if (look === 'corner')
    return (
      <>
        {/* What needs you, in the onboarding window's shape (9 Nov): a title and a count, one segment per thing (the
            one shown lit, a click opens another), then its tag, Dr.AI's line and the way to act on it. */}
        <div className="dk dk--corner dk--needs" style={dragStyle}>
          <div className="dk-card">
            <header className="dk-card__head">
              <b>Needs you</b>
              <span className="dk-card__n">
                {(i % msgs.length) + 1}/{msgs.length}
              </span>
              <span className="dk-card__sp" />
              {msgs.length > 1 && (
                <span className="dk-pager dk-pager--arrows">
                  <button type="button" onClick={() => step(-1)} aria-label="Previous">
                    <ChevronLeft size={15} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Next">
                    <ChevronRight size={15} />
                  </button>
                </span>
              )}
              {fold}
            </header>
            {msgs.length > 1 && (
              <span className="og-stepper dk-pages" aria-hidden>
                {msgs.map((x, k) => (
                  <i
                    key={x.key}
                    className={cx(k === i % msgs.length && 'is-done')}
                    style={{ ['--i' as string]: k, ['--of' as string]: msgs.length }}
                    onClick={() => setI(k)}
                  />
                ))}
              </span>
            )}
            <span className="dk-needs__tag">{tag}</span>
            {line}
            {acts}
          </div>
          <span key="fig" {...dragProps}>
            <MascotClip state={speaking ? 'speaking' : 'idle'} width={150} intro={intro} className="dk-fig" />
          </span>
        </div>
        {drawer}
      </>
    );

  if (look === 'bar')
    return (
      <>
        <div className="dk dk--bar">
          <MascotClip key="fig" state={speaking ? 'speaking' : 'idle'} width={104} intro={intro} className="dk-fig" />
          <span className="dk-bar__main">
            <span className="dk-bar__top">
              <b>Dr.AI</b>
              {tag}
              {pager}
            </span>
            {line}
          </span>
          {acts}
          {fold}
        </div>
        {drawer}
      </>
    );

  return (
    <>
      <div className="dk dk--top">
        <MascotClip key="fig" state={speaking ? 'speaking' : 'idle'} width={84} intro={intro} className="dk-fig" />
        <span className="dk-bar__main">
          <span className="dk-bar__top">
            <b>Dr.AI</b>
            {tag}
            {pager}
          </span>
          {line}
        </span>
        {acts}
        {fold}
      </div>
      {drawer}
    </>
  );
}

/** Glass sparks bursting from Dr.AI's window when onboarding is done (9 Nov). Still for reduced motion: none. */
// Brand book only: Cobalt, Ember, Haze and white light (9 Nov, review: no pink).
const SPARK_TONES = ['#1E3BD6', '#E8501F', '#C8D8F0', '#ffffff', '#1E3BD6', '#E8501F'];
function Confetti() {
  const bits = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.3;
    const d = 90 + (i % 5) * 34;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8 - 40, r: (i * 47) % 360, s: 0.6 + (i % 4) * 0.25, c: SPARK_TONES[i % SPARK_TONES.length], t: (i % 6) * 0.04 };
  });
  return (
    <span className="dk-confetti" aria-hidden>
      {bits.map((b, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width="14"
          height="14"
          style={{ ['--x' as string]: `${b.x}px`, ['--y' as string]: `${b.y}px`, ['--r' as string]: `${b.r}deg`, ['--s' as string]: b.s, ['--t' as string]: `${b.t}s` }}
        >
          <path d="M10 0 C10.6 7 13 9.4 20 10 C13 10.6 10.6 13 10 20 C9.4 13 7 10.6 0 10 C7 9.4 9.4 7 10 0 Z" fill={b.c} />
        </svg>
      ))}
    </span>
  );
}
