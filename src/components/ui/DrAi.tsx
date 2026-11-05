// Dr.AI across the portal (prototype, 5 Nov; after the Clara AI reference): one switch puts Spark's mascot on the
// sidebar ("Dr.AI" in place of Chats), on every Ask button ("Ask Dr.AI") and in the chat panel. Off, the portal
// is as it was. The switch lives on #/demo/mascot and is kept in this browser only.
import { useEffect, useState } from 'react';
import { SparkDisc } from './BrandSpark';

const KEY = 'spark-drai';
const EVENT = 'spark-drai';

/** Dr.AI is on unless switched off on #/demo/mascot (5 Nov: on by default, so a fresh visitor sees him). */
export function drAiOn() {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}
export function setDrAi(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* the switch only lasts this visit */
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useDrAi() {
  const [on, setOn] = useState(drAiOn);
  useEffect(() => {
    const f = () => setOn(drAiOn());
    window.addEventListener(EVENT, f);
    return () => window.removeEventListener(EVENT, f);
  }, []);
  return on;
}

// The head as a still, cut from the client's transparent idle clip (5 Nov) at full resolution and kept for the
// visit; the old still from the film stands in for the first moment. Crops are boxes in the 1440 frame.
export const HEAD_CROPS = {
  // The whole head with the headdress: the chat's avatar.
  wide: { x: 320, y: 30, w: 760 },
  // As the lookbook's "Expression" tile: the headband at the top, the face filling the width, the collar below.
  expression: { x: 406, y: 128, w: 610 },
  // The Expression view with room around it, for the dark tile: the lookbook's ground shows round the head.
  tile: { x: 362, y: 88, w: 696 },
  // Roomier still, for the dark circle: the circle cuts the corners, so the head needs more ground round it.
  round: { x: 326, y: 58, w: 770 },
  // Just the head, headdress and all, down to the neck: for the frameless icon.
  head: { x: 350, y: 120, w: 720 },
  // The chat avatar's own crop (MascotClip's head box), so the still and the live head match.
  avatar: { x: 362, y: 66, w: 676 },
  // Tight, as the lookbook's tile: the headband cut at the top, the face filling the width, the collar below.
  tight: { x: 418, y: 178, w: 576 },
  // Closer: the screen face and glasses, the headdress only at the edges.
  face: { x: 455, y: 215, w: 510 },
};
type CropKey = keyof typeof HEAD_CROPS;
const OUT = 288; // px: sharp up to 96px on a 3× screen
let film: Promise<HTMLVideoElement> | null = null;
const urls: Partial<Record<CropKey, string>> = {};
const waits: Partial<Record<CropKey, Promise<string>>> = {};
function frame(): Promise<HTMLVideoElement> {
  film ??= new Promise((done) => {
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'auto';
    v.src = '/brand/drai/idle.webm';
    v.addEventListener('loadeddata', () => (v.currentTime = 0.3), { once: true });
    v.addEventListener('seeked', () => done(v), { once: true });
  });
  return film;
}
function headStill(crop: CropKey): Promise<string> {
  if (urls[crop]) return Promise.resolve(urls[crop]!);
  waits[crop] ??= frame().then((v) => {
    const k = HEAD_CROPS[crop];
    const c = document.createElement('canvas');
    c.width = c.height = OUT;
    const g = c.getContext('2d');
    if (g) {
      g.imageSmoothingQuality = 'high';
      // Only his head: Sparki drifts beyond the headdress (x > 1045 in the frame), so the still stops there.
      const s = OUT / k.w;
      g.beginPath();
      g.rect(0, 0, Math.min(OUT, (1045 - k.x) * s), OUT);
      g.clip();
      g.drawImage(v, k.x, k.y, k.w, k.w, 0, 0, OUT, OUT);
      // Frameless: the shoulders fade out instead of ending on a straight cut.
      if (crop === 'head') {
        g.globalCompositeOperation = 'destination-in';
        const f = g.createLinearGradient(0, OUT * 0.62, 0, OUT * 0.97);
        f.addColorStop(0, 'rgba(0,0,0,1)');
        f.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = f;
        g.fillRect(0, 0, OUT, OUT);
      }
    }
    return (urls[crop] = c.toDataURL('image/png'));
  });
  return waits[crop]!;
}

/** Sparki on his own (5 Nov): cut from the same idle frame, everything right of Dr.AI's headdress (x > 1060),
 *  boxed square round where he is. Kept for the visit. */
let sparkiUrl: string | null = null;
let sparkiWait: Promise<string> | null = null;
function sparkiStill(): Promise<string> {
  if (sparkiUrl) return Promise.resolve(sparkiUrl);
  sparkiWait ??= frame().then((v) => {
    const W = 720;
    const probe = document.createElement('canvas');
    probe.width = probe.height = W;
    const pg = probe.getContext('2d', { willReadFrequently: true })!;
    pg.drawImage(v, 0, 0, W, W);
    const d = pg.getImageData(0, 0, W, W).data;
    let x0 = W, y0 = W, x1 = 0, y1 = 0;
    // Sparki only: colourful pixels at his height, right of the headdress (the white cloth and the hands below
    // stay out).
    for (let y = 0; y < 330; y++)
      for (let x = 535; x < W; x++) {
        const k = (y * W + x) * 4;
        const sat = Math.max(d[k], d[k + 1], d[k + 2]) - Math.min(d[k], d[k + 1], d[k + 2]);
        if (d[k + 3] > 60 && sat > 60) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    // In the 1440 frame, a square round him with a little air.
    const cx = (x0 + x1), cy = (y0 + y1);
    const side = Math.max(x1 - x0, y1 - y0) * 2 * 1.25;
    const S = 96;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d')!;
    g.imageSmoothingQuality = 'high';
    g.beginPath();
    const sx = cx - side / 2, sy = cy - side / 2;
    // Only what lies right of the headdress.
    g.rect(Math.max(0, ((1060 - sx) / side) * S), 0, S, S);
    g.clip();
    g.drawImage(v, sx, sy, side, side, 0, 0, S, S);
    return (sparkiUrl = c.toDataURL('image/png'));
  });
  return sparkiWait;
}

/** Sparki, still, as a small mark: he floats and glows by CSS where he's used (the Thinking bubble). */
export function SparkiStill({ size = 20, className }: { size?: number; className?: string }) {
  const [url, setUrl] = useState(sparkiUrl);
  useEffect(() => {
    let live = true;
    if (!url) sparkiStill().then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [url]);
  return url ? <img src={url} width={size} height={size} alt="" className={['sparki-still', className].filter(Boolean).join(' ')} /> : <span style={{ width: size, height: size, display: 'inline-block' }} className={className} />;
}

/** The menu icon's looks (5 Nov), to choose from on #/demo/mascot: a crop, a shape and a ground. */
export const ICON_LOOKS = [
  { id: 'expr-circle', label: 'A · Expression, circle', crop: 'expression', look: 'circle light' },
  { id: 'expr-square', label: 'B · Expression, rounded square', crop: 'expression', look: 'square light' },
  { id: 'expr-dark', label: 'C · Expression, dark tile', crop: 'tile', look: 'square dark' },
  { id: 'expr-dark-circle', label: 'F · Expression, dark circle', crop: 'round', look: 'circle dark' },
  { id: 'head-clear', label: 'G · Just the head, no frame', crop: 'head', look: 'clear' },
  { id: 'wide-soft', label: 'H · As the empty state, still', crop: 'wide', look: 'circle soft' },
  { id: 'wide-bubble', label: 'I · Bubble, blue', crop: 'wide', look: 'circle bubble' },
  { id: 'bubble-pearl', label: 'J · Bubble, pearl', crop: 'wide', look: 'circle bubble pearl' },
  { id: 'bubble-peach', label: 'K · Bubble, peach', crop: 'wide', look: 'circle bubble peach' },
  { id: 'bubble-iris', label: 'L · Bubble, iridescent', crop: 'wide', look: 'circle bubble iris' },
  { id: 'bubble-graphite', label: 'M · Bubble, graphite', crop: 'wide', look: 'circle bubble graphite' },
  { id: 'wide-frost', label: 'N · Clear glass (the chat avatar, see-through)', crop: 'wide', look: 'circle frost' },
  { id: 'sq-navy', label: 'O · Tile, lookbook navy', crop: 'tight', look: 'square dark rim' },
  { id: 'sq-graphite', label: 'P · Tile, graphite', crop: 'tight', look: 'square ggraphite rim' },
  { id: 'sq-glass', label: 'Q · Tile, clear glass', crop: 'tight', look: 'square frost rim' },
  { id: 'sq-pearl', label: 'R · Tile, pearl', crop: 'tight', look: 'square gpearl rim' },
  { id: 'sq-iris', label: 'S · Tile, iridescent', crop: 'tight', look: 'square giris rim' },
  { id: 'chat-avatar', label: 'T · As the chat avatar', crop: 'avatar', look: 'circle soft' },
  { id: 'expr-ring', label: 'D · Expression, brand ring', crop: 'expression', look: 'circle ring' },
  { id: 'face-circle', label: 'E · Face close, circle', crop: 'face', look: 'circle light' },
  { id: 'wide-circle', label: 'Now · Whole head, circle', crop: 'wide', look: 'circle light' },
] as const satisfies readonly { id: string; label: string; crop: CropKey; look: string }[];
export type IconLookId = (typeof ICON_LOOKS)[number]['id'];
// v2 (5 Nov): the menu icon is the chat avatar's circle now; a choice saved before that is set aside.
const ICON_KEY = 'spark-drai-icon-v2';
function iconNow(): IconLookId {
  try {
    const v = localStorage.getItem(ICON_KEY);
    return ICON_LOOKS.some((l) => l.id === v) ? (v as IconLookId) : 'chat-avatar';
  } catch {
    return 'chat-avatar';
  }
}
export function setDrAiIcon(id: IconLookId) {
  try {
    localStorage.setItem(ICON_KEY, id);
  } catch {
    /* this visit only */
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useDrAiIcon() {
  const [id, setId] = useState(iconNow);
  useEffect(() => {
    const f = () => setId(iconNow());
    window.addEventListener(EVENT, f);
    return () => window.removeEventListener(EVENT, f);
  }, []);
  return id;
}

/** Dr.AI's head as a still. `look` picks one of ICON_LOOKS; without it, the look chosen for the portal (the
 *  graphite bubble), so the menu, the Ask buttons and the panel show the same head. */
export function DrAiHead({ size = 18, className, look }: { size?: number; strokeWidth?: number; className?: string; look?: IconLookId }) {
  const chosen = useDrAiIcon();
  const l = ICON_LOOKS.find((x) => x.id === (look ?? chosen))!;
  const [url, setUrl] = useState(urls[l.crop] ?? null);
  useEffect(() => {
    let live = true;
    headStill(l.crop).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [l.crop]);
  const cls = ['drai-head', ...l.look.split(' ').map((x) => `drai-head--${x}`), className].filter(Boolean).join(' ');
  const img = <img src={url ?? '/brand/drai-head.png'} width={size} height={size} alt="" className={cls} />;
  // The bubble's glint sits over him, so it needs a wrapper to hang on.
  return l.look.includes('bubble') ? (
    <span className="drai-bubble" style={{ width: size, height: size }}>
      {img}
    </span>
  ) : (
    img
  );
}

/** The menu's icon: the look chosen on the demo. */
export function DrAiNavIcon({ size = 22 }: { size?: number }) {
  return <DrAiHead size={size} look={useDrAiIcon()} />;
}

/** The inside of an Ask button: Dr.AI's head and "Ask Dr.AI", or Spark's disc and "Ask Spark". `about` adds
 *  the rest of the label ("about this file"). */
export function AskLabel({ size = 28, about }: { size?: number; about?: string }) {
  const on = useDrAi();
  return on ? (
    <>
      <DrAiHead size={size} /> Ask Dr.AI{about ? ` ${about}` : ''}
    </>
  ) : (
    <>
      <SparkDisc size={size} /> Ask Spark{about ? ` ${about}` : ''}
    </>
  );
}

/** An Ask button (5 Nov, buttons in one system): one pill everywhere, Dr.AI's head and "Ask Dr.AI" when he's
 *  on, Spark's disc and "Ask Spark" when he's off. `about` stays in the label for screen readers. */
export function AskButton({ onClick, className, about }: { onClick: () => void; className?: string; size?: number; headSize?: number; about?: string }) {
  const on = useDrAi();
  return (
    <button type="button" className={['hl-mchat drai-pill', className].filter(Boolean).join(' ')} onClick={onClick} aria-label={`${on ? 'Ask Dr.AI' : 'Ask Spark'}${about ? ` ${about}` : ''}`}>
      {on ? <DrAiHead size={26} /> : <SparkDisc size={26} />}
      {on ? 'Ask Dr.AI' : 'Ask Spark'}
    </button>
  );
}

/** The Ask pill as it was on Home (white, a hairline), with Dr.AI's head and "Ask Dr.AI" (5 Nov): one per page,
 *  at its top, to talk about what the page holds. Off, Spark's disc and "Ask Spark". */
export function AskPill({ onClick, className }: { onClick: () => void; className?: string }) {
  const on = useDrAi();
  return (
    <button type="button" className={['hl-mchat drai-pill', className].filter(Boolean).join(' ')} onClick={onClick}>
      {on ? <DrAiHead size={26} /> : <SparkDisc size={26} />}
      {on ? 'Ask Dr.AI' : 'Ask Spark'}
    </button>
  );
}
