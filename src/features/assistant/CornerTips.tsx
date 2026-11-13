// Dr.AI's advice from his corner (12 Nov, review): now and then he says, in his own words, one of the things the
// attention cards on Ask Dr.AI hold ("I still don’t have your brand files…"), with its action (no Later, 12 Nov). Not on Ask
// Dr.AI itself (the cards are there) and never while someone is busy: the first one after the page has been quiet a
// while, then at most one every few minutes and one per page. After he has said the same thing three times with
// nothing done about it, a small "Skip this advice" lets it go for good (the card on Ask Dr.AI stays).
// `?tips=fast` on the address runs the clock ten times faster, for review; window.__drTip() says one now.
import { useCallback, useEffect, useRef, useState } from 'react';
import { navigate, useRoute } from '../../lib/router';
import { X } from 'lucide-react';
import { Button, cx } from '../../components/ui/primitives';
import { useMessages, type Msg } from './DrAiDock';
import * as sfx from '../demo/welcome/sfx';

const STORE = 'spark-drai-tips';

// What sits under his words (12 Nov, review: "the tip must stand out from the card under it; a backing, but not
// flat"), to compare on #/demo/home-bento: wash (the soft Sand wash so far), frost (frosted glass lit with Noor from
// below), halo (white with the spectrum's light around its edge), bubble (a 3D speech bubble with a tail to him), ink.
// Ink picked 12 Nov; it is the default.
export type TipLook = 'wash' | 'frost' | 'halo' | 'bubble' | 'ink';
const LOOK_KEY = 'spark-tip-look';
const readLook = (): TipLook => {
  try {
    return (localStorage.getItem(LOOK_KEY) as TipLook) || 'ink';
  } catch {
    return 'ink';
  }
};
export function setTipLook(v: TipLook) {
  try {
    localStorage.setItem(LOOK_KEY, v);
  } catch {
    /* this visit only */
  }
  window.dispatchEvent(new Event(LOOK_KEY));
}
export function useTipLook() {
  const [look, setLook] = useState(readLook);
  useEffect(() => {
    const f = () => setLook(readLook());
    window.addEventListener(LOOK_KEY, f);
    return () => window.removeEventListener(LOOK_KEY, f);
  }, []);
  return look;
}
// How the tip behaves (13 Nov, review: "Fold after 10 s" approved, the only way now): once said it stays 10 s
// (scrolling or not; a pointer on it keeps it), then folds into Dr.AI, a small Ember dot on him says he still has it,
// and a click on the dot brings it back whole (no typing again), for another 10 s. A local TIP switch (DEV only) is
// On while a tip is shown whole, Off otherwise: On says one at once, so the client needn't wait for one; Off puts it
// away.
const TIP_ON = 'spark-tip-on';
export const SHOW_TIP_SWITCH = import.meta.env.DEV || import.meta.env.VITE_UI_SWITCH === '1';
/** The review switch: Off or On, as the tip is now. */
export function TipSwitch() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(TIP_ON, f);
    return () => window.removeEventListener(TIP_ON, f);
  }, []);
  const hook = window as unknown as { __drTip?: () => void; __drTipOff?: () => void };
  return (
    <div className="ui-switch ui-switch--tip" role="radiogroup" aria-label="Dr.AI tip">
      <span className="ui-switch__label">TIP</span>
      {[false, true].map((v) => (
        <button key={String(v)} type="button" role="radio" aria-checked={on === v} className={cx(on === v && 'is-on')} onClick={() => (v ? hook.__drTip?.() : hook.__drTipOff?.())}>
          {v ? 'On' : 'Off'}
        </button>
      ))}
    </div>
  );
}

const FAST = typeof location !== 'undefined' && /[?&]tips=fast\b/.test(location.hash + location.search);
const K = FAST ? 0.1 : 1;
const FIRST = 25_000 * K; // on a page this long before the first word
const QUIET = 10_000 * K; // and nothing typed, clicked or scrolled for this long
const GAP = 4 * 60_000 * K; // between two tips, across pages
const FOLD_AFTER = 10_000; // on screen this long once said, then into his corner
const SKIP_AFTER = 3; // said this many times with nothing done: offer to skip it

type Seen = { n: number; skip?: boolean };
type Book = { at?: number; tips: Record<string, Seen> };
function readBook(): Book {
  try {
    return { tips: {}, ...JSON.parse(localStorage.getItem(STORE) || '{}') };
  } catch {
    return { tips: {} };
  }
}
function writeBook(b: Book) {
  try {
    localStorage.setItem(STORE, JSON.stringify(b));
  } catch {
    /* this visit only */
  }
}

const plain = (t: string) => t.replace(/[[\]]/g, '');
/** What he says for a card: two short lines, the first in ink, the second softer. */
function lines(m: Msg): [string, string] {
  if (m.key === 'files') return ['I still don’t have your brand files.', 'Share them, and your first proposal fits you better.'];
  if (m.key === 'team') return ['Your team can’t see requests yet.', 'Invite them when you’re ready.'];
  if (m.key === 'web-speed') return ['Your website is slow on mobile: 6.8 s on 4G.', 'It’s costing you sales. Want the fix?'];
  const first = plain(m.text);
  const second = m.tag?.startsWith('Due') ? `It’s ${m.tag.charAt(0).toLowerCase()}${m.tag.slice(1)}.` : 'Have a look when you can.';
  return [first, second];
}

/** His words typed out as in the welcome, with his robot voice on every few letters (sfx.talk); `done` once both
 *  lines are in. Reduced motion shows them at once, silent. */
function useTyping(text: [string, string] | null) {
  const [n, setN] = useState<[number, number]>([0, 0]);
  const [done, setDone] = useState(false);
  const key = text ? text.join('|') : '';
  useEffect(() => {
    setN([0, 0]);
    setDone(false);
    if (!text) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN([text[0].length, text[1].length]);
      setDone(true);
      return;
    }
    if (sfx.soundPref() !== false) sfx.wake();
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    (async () => {
      await wait(350);
      for (let i = 0; i < 2; i++) {
        const t = text[i];
        for (let k = 1; k <= t.length; k++) {
          if (cancelled) return;
          setN((x) => (i === 0 ? [k, 0] : [x[0], k]));
          if (k % 3 === 1 && /[a-z!’.?]/i.test(t[k - 1])) sfx.talk(k);
          await wait(/[.!,?:]/.test(t[k - 1]) ? 120 : 18 + Math.random() * 12);
        }
        await wait(200);
      }
      if (!cancelled) setDone(true);
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { n, done };
}

/** A line shown whole from the start in soft grey; each letter darkens as he says it (12 Nov, review). */
/** A line shown whole from the start in soft grey; each letter darkens as he says it (12 Nov, review). From `hl` on
 *  (a deadline, "due 14 Oct.") the letters light up in the brand's spectrum once he has said it all (`lit`), not
 *  before (12 Nov, review). */
const Typed = ({ text, n, hl = -1, lit = false }: { text: string; n: number; hl?: number; lit?: boolean }) => {
  const chars = Array.from(text);
  const ch = (c: string, i: number) => (
    <span key={i} className={cx('dt-say__ch', i < n && 'is-said')}>
      {c}
    </span>
  );
  return (
    <span aria-hidden>
      {hl < 0 ? chars.map(ch) : (
        <>
          {chars.slice(0, hl).map(ch)}
          <span className={cx('dt-say__due', lit && 'is-lit')}>{chars.slice(hl).map((c, k) => ch(c, hl + k))}</span>
        </>
      )}
    </span>
  );
};

export function CornerTip({ paused, onTalk }: { paused: boolean; onTalk: (on: boolean) => void }) {
  const { path } = useRoute();
  const all = useMessages().filter((m) => m.kind !== 'news');
  const due = all.filter((m) => m.kind !== 'reminder');
  const msgs = due.length ? due : all;
  const [tip, setTip] = useState<{ m: Msg; skip: boolean } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [folded, setFolded] = useState(false);
  const look = useTipLook();
  const lastAct = useRef(Date.now());
  const pageAt = useRef(Date.now());
  const saidHere = useRef(false);
  const hover = useRef(false);
  const hideT = useRef(0);
  const live = useRef({ msgs, paused, tip });
  live.current = { msgs, paused, tip };

  const close = useCallback(() => {
    clearTimeout(hideT.current);
    setLeaving(true);
    window.setTimeout(() => {
      setTip(null);
      setLeaving(false);
      setFolded(false);
    }, 320);
  }, []);

  const say = useCallback((force = false) => {
    const { msgs, paused, tip } = live.current;
    if (tip || (!force && paused)) return;
    const book = readBook();
    const open = msgs.filter((m) => !book.tips[m.key]?.skip);
    if (!open.length) return;
    // the one said least often, the most pressing first among equals
    const m = open.reduce((a, b) => ((book.tips[b.key]?.n ?? 0) < (book.tips[a.key]?.n ?? 0) ? b : a));
    const n = book.tips[m.key]?.n ?? 0;
    book.tips[m.key] = { n: n + 1 };
    book.at = Date.now();
    writeBook(book);
    saidHere.current = true;
    setFolded(false);
    setTip({ m, skip: n >= SKIP_AFTER });
  }, []);

  // a new page: its own quiet start, and one tip on it at most
  useEffect(() => {
    pageAt.current = Date.now();
    saidHere.current = false;
    if (live.current.tip) close();
  }, [path, close]);

  // what counts as being busy: typing, clicking, scrolling (a pointer just moving doesn't)
  useEffect(() => {
    const act = () => (lastAct.current = Date.now());
    const evs = ['keydown', 'pointerdown', 'wheel', 'scroll', 'input'] as const;
    evs.forEach((e) => window.addEventListener(e, act, { passive: true, capture: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, act, { capture: true }));
  }, []);

  // the clock: every couple of seconds, is now a good time? (why not, for review: window.__drTipWhy())
  useEffect(() => {
    const why = () => {
      const now = Date.now();
      if (saidHere.current) return 'one tip on this page already';
      if (live.current.paused) return 'the chat is open';
      if (live.current.tip) return 'a tip is up';
      if (document.hidden) return 'the tab is hidden';
      if (document.documentElement.dataset.welcomeMascot) return 'the welcome is still talking';
      if (document.querySelector('[role="dialog"], [aria-modal="true"]')) return 'a dialog is open';
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)) return 'a field has focus';
      if (now - pageAt.current < FIRST) return `on the page ${Math.round((now - pageAt.current) / 1000)} s of ${FIRST / 1000}`;
      if (now - lastAct.current < QUIET) return `quiet ${Math.round((now - lastAct.current) / 1000)} s of ${QUIET / 1000}`;
      const gap = now - (readBook().at ?? 0);
      if (gap < GAP) return `last tip ${Math.round(gap / 1000)} s ago, gap ${GAP / 1000} s`;
      return '';
    };
    (window as unknown as { __drTipWhy?: () => string }).__drTipWhy = () => why() || 'ready';
    const t = window.setInterval(() => {
      if (!why()) say();
    }, 2000 * K + 500);
    return () => clearInterval(t);
  }, [say]);

  // the review hook (TIP On): say one now, or bring back the one already said
  useEffect(() => {
    (window as unknown as { __drTip?: () => void }).__drTip = () => {
      if (!live.current.tip) return say(true);
      setFolded(false); // one already said comes back whole, as from the dot
    };
  }, [say]);

  // the review hook: put it away; and the TIP switch told whether one is shown whole
  useEffect(() => {
    (window as unknown as { __drTipOff?: () => void }).__drTipOff = () => live.current.tip && setFolded(true);
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(TIP_ON, { detail: !!tip && !leaving && !folded }));
  }, [tip, leaving, folded]);

  const said = tip ? lines(tip.m) : null;
  const typed = useTyping(said);
  // he talks while he types; the words go a while after he's done, unless a pointer is on them
  useEffect(() => {
    onTalk(!!tip && !leaving && !folded && !typed.done);
    if (!tip || !typed.done || folded) return; // folded, he keeps it until it's asked for again
    const arm = () => {
      clearTimeout(hideT.current);
      hideT.current = window.setTimeout(() => (hover.current ? arm() : setFolded(true)), FOLD_AFTER);
    };
    arm();
    return () => clearTimeout(hideT.current);
  }, [tip, leaving, folded, typed.done, onTalk]);

  // the chat opening, or the thing getting done, ends it
  useEffect(() => {
    if (tip && (paused || !msgs.some((m) => m.key === tip.m.key))) close();
  }, [paused, msgs, tip, close]);

  if (!tip || !said) return null;
  const [a, b] = said;
  const skip = () => {
    const book = readBook();
    book.tips[tip.m.key] = { ...(book.tips[tip.m.key] ?? { n: 0 }), skip: true };
    writeBook(book);
    close();
  };
  return (
    <>
    {folded && !leaving && (
      <button type="button" className="dt-say-dot" onClick={() => setFolded(false)} aria-label={`Dr.AI has a tip: ${a}`}>
        <span aria-hidden />
      </button>
    )}
    <div
      className={cx('dt-say', `dt-say--${look}`, !leaving && !folded && 'is-on', folded && 'is-folded')}
      aria-hidden={folded || undefined}
      role="status"
      aria-live="polite"
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
    >
      <button type="button" className="dt-say__x" onClick={close} aria-label="Close">
        <X size={13} strokeWidth={2} />
      </button>
      <p className="dt-say__a" aria-label={a}>
        <Typed text={a} n={typed.n[0]} />
      </p>
      <p className="dt-say__b" aria-label={b}>
        <Typed text={b} n={typed.n[1]} hl={/^It’s due /.test(b) ? 5 : -1} lit={typed.done} />
      </p>
      <div className={cx('dt-say__acts', typed.done && 'is-on')} aria-hidden={!typed.done}>
        <Button size="sm" variant="primary" onClick={() => (close(), navigate(tip.m.action.href.replace(/^#/, '')))}>
          {tip.m.action.label}
        </Button>
        {tip.skip && (
          <button type="button" className="dt-say__skip" onClick={skip}>
            Skip this advice
          </button>
        )}
      </div>
    </div>
    </>
  );
}
