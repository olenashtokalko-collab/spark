// How Dr.AI's corner window moves (prototype, 10 Nov review: "folding is too abrupt"). Three things, each with looks
// to pick from on #/demo/dock-motion, kept in this browser and set on <html> as data-dk-fold / data-dk-hover /
// data-dk-drawer, so the CSS (glass.css, "Dr.AI's motion") plays the picked one everywhere:
//   fold:   the window folding into his head, and opening out of it again;
//   hover:  how he answers the pointer, folded (his head) or standing;
//   drawer: the chat panel coming in and going away.
// "now" is today's behaviour, for comparison.
import { useEffect, useState } from 'react';

export const FOLD_LOOKS = [
  { v: 'a', label: 'A · Into his corner', note: 'The window shrinks into the corner where his head waits, Dr.AI sinks after it; opening, it grows back out of that spot with a soft spring and the lines come in one by one.' },
  { v: 'b', label: 'B · Slide down', note: 'Window and Dr.AI slip down out of sight together, his head rises in their place; opening, he rises first and the window slides up beside him.' },
  { v: 'c', label: 'C · Jelly', note: 'The window squeezes like soft glass into the corner; opening, it springs out with a little wobble.' },
  { v: 'now', label: 'Now', note: 'Today: the window disappears at once.' },
] as const;
export const HOVER_LOOKS = [
  { v: 'a', label: 'A · Head tilt', note: 'He tilts his head one way and the other, curious, as if asking “yes?”.' },
  { v: 'b', label: 'B · Little hop', note: 'He gives a small hop with a squash on landing; the light under him brightens.' },
  { v: 'c', label: 'C · Lean in', note: 'He leans in towards you, a touch bigger, and stays leaning while the pointer is on him.' },
  { v: 'now', label: 'Now', note: 'Today: no reaction.' },
] as const;
export const DRAWER_LOOKS = [
  { v: 'a', label: 'A · Glide in', note: 'The panel glides in from the right edge and settles; what is in it follows a beat later, line by line. Closing, it glides back out.' },
  { v: 'b', label: 'B · Out of Dr.AI', note: 'The panel opens out of the corner where Dr.AI stands, as if he unfolds it; closing, it folds back into his corner.' },
  { v: 'c', label: 'C · Frost in', note: 'The panel rises softly out of a blur, the page behind it frosting over; closing, it melts away.' },
  { v: 'now', label: 'Now', note: 'Today: a short slide in, gone at once on closing.' },
] as const;

export type FoldLook = (typeof FOLD_LOOKS)[number]['v'];
export type HoverLook = (typeof HOVER_LOOKS)[number]['v'];
export type DrawerLook = (typeof DRAWER_LOOKS)[number]['v'];
export type DockMotion = { fold: FoldLook; hover: HoverLook; drawer: DrawerLook };

const KEY = 'spark-dk-motion';
const EVENT = 'spark-dk-motion';
// Picked on the demo (10 Nov): Jelly, Little hop, Out of Dr.AI.
const DEFAULT: DockMotion = { fold: 'c', hover: 'b', drawer: 'b' };

function read(): DockMotion {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<DockMotion>;
    return {
      fold: FOLD_LOOKS.find((x) => x.v === v.fold)?.v ?? DEFAULT.fold,
      hover: HOVER_LOOKS.find((x) => x.v === v.hover)?.v ?? DEFAULT.hover,
      drawer: DRAWER_LOOKS.find((x) => x.v === v.drawer)?.v ?? DEFAULT.drawer,
    };
  } catch {
    return DEFAULT;
  }
}
function apply(m: DockMotion) {
  const d = document.documentElement.dataset;
  d.dkFold = m.fold;
  d.dkHover = m.hover;
  d.dkDrawer = m.drawer;
}
apply(read());

export function setDockMotion(part: Partial<DockMotion>) {
  const next = { ...read(), ...part };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* lasts this visit */
  }
  apply(next);
  window.dispatchEvent(new Event(EVENT));
}
export function useDockMotion() {
  const [m, setM] = useState(read);
  useEffect(() => {
    const f = () => setM(read());
    window.addEventListener(EVENT, f);
    return () => window.removeEventListener(EVENT, f);
  }, []);
  return m;
}

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** How long each move of the picked look takes, in ms; 0 for today's (instant) or reduced motion. Kept in step with
 *  the durations in glass.css. */
const MS = {
  fold: { a: [420, 640], b: [380, 620], c: [520, 760], now: [0, 0] },
  drawer: { a: [320, 0], b: [380, 0], c: [300, 0], now: [0, 0] },
} as const;
export function motionMs(kind: 'fold' | 'drawer', phase: 'out' | 'in'): number {
  if (reduce()) return 0;
  const v = (kind === 'fold' ? document.documentElement.dataset.dkFold : document.documentElement.dataset.dkDrawer) ?? 'now';
  const t = (MS[kind] as Record<string, readonly [number, number]>)[v] ?? [0, 0];
  return phase === 'out' ? t[0] : t[1];
}

/** The demo's buttons (#/demo/dock-motion) play a move on the real window in the corner. */
export const DOCK_CMD = 'spark-dock-cmd';
export type DockCmd = 'fold' | 'open' | 'chat' | 'close-chat';
export const dockCmd = (c: DockCmd) => window.dispatchEvent(new CustomEvent(DOCK_CMD, { detail: c }));
