// Prototype-only page (#/demo/states): the decision card in its two main states, side by side, so the
// WAITING card (white, hourglass, buttons) and the APPROVED card (green gradient) can be made one
// family. Every system uses the same anatomy in both states: a glass tile, the state and a mono line
// under it, the amount, the Starts / Duration facts, and (only while waiting) the buttons. Only the
// tile, the colour and the buttons change with the state. Colours from the brand book: Cobalt for
// the human’s decision, Ember for the spark, Ink, Sand; green is the product’s success colour.
import { useId } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';

const THUMB = 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z';
const CUFF = 'M7 10v12';
const HOURGLASS = ['M5 22h14', 'M5 2h14', 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22', 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'];

type State = 'awaiting' | 'approved';
type Pal = 'cobalt' | 'green' | 'light';
const PAL: Record<Pal, [string, string, string]> = {
  cobalt: ['#1e3bd6', '#6d5cf0', '#c8d8f0'],
  green: ['#0a6a47', '#19a672', '#9af0c6'],
  light: ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.4)'],
};

/** The brand's icon tile (p. 16): a glass squircle holding light, a white glyph on top. */
function Tile({ glyph, pal, size = 40 }: { glyph: 'thumb' | 'hourglass'; pal: Pal; size?: number }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `st-${n}-${id}`;
  const [a, b, c] = PAL[pal];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ flex: 'none' }}>
      <defs>
        <clipPath id={u('clip')}>
          <rect width="24" height="24" rx="7.5" />
        </clipPath>
        <linearGradient id={u('spec')} gradientUnits="userSpaceOnUse" x1="2" y1="24" x2="24" y2="0">
          <stop offset="0" stopColor={a} />
          <stop offset="0.5" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <linearGradient id={u('milk')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={u('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
        <filter id={u('b')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id={u('grain')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
      </defs>
      <rect width="24" height="24" rx="7.5" fill="rgba(255,255,255,0.3)" />
      <g clipPath={`url(#${u('clip')})`}>
        <rect width="24" height="24" fill={`url(#${u('spec')})`} filter={`url(#${u('b')})`} />
        <rect width="24" height="24" fill={`url(#${u('milk')})`} opacity="0.7" />
        <ellipse cx="9" cy="3.5" rx="8" ry="3" fill="#ffffff" opacity="0.5" filter={`url(#${u('b')})`} />
        <rect width="24" height="24" filter={`url(#${u('grain')})`} opacity="0.35" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <rect x="0.3" y="0.3" width="23.4" height="23.4" rx="7.2" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.6" />
      <g transform="translate(5.4 5.4) scale(0.55)" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {glyph === 'thumb' ? (
          <>
            <path d={THUMB} />
            <path d={CUFF} />
          </>
        ) : (
          HOURGLASS.map((d) => <path key={d} d={d} />)
        )}
      </g>
    </svg>
  );
}

const COPY: Record<State, { label: string; eyebrow: string }> = {
  awaiting: { label: 'Waiting for your decision', eyebrow: 'Due Sun 18 Oct · 3 days left' },
  approved: { label: 'Approved', eyebrow: 'Decided 10 Sep' },
};

function Facts() {
  return (
    <dl className="dst__facts">
      <div>
        <dt>Starts</dt>
        <dd>Mon 9 Nov</dd>
      </div>
      <div>
        <dt>Duration</dt>
        <dd>10 weeks</dd>
      </div>
    </dl>
  );
}

function Buttons() {
  return (
    <div className="dst__btns">
      <button className="dst__btn dst__btn--main">Approve proposal</button>
      <div className="dst__btnrow">
        <button className="dst__btn">Request changes</button>
        <button className="dst__btn">Decline</button>
      </div>
    </div>
  );
}

/** Systems A, B, C, E: tile and state on top, then amount, facts, buttons. */
function Card({ state, pal }: { state: State; pal: Pal }) {
  const c = COPY[state];
  return (
    <div className={cx('dst__card', `is-${state}`)}>
      <div className="dst__head">
        <Tile glyph={state === 'approved' ? 'thumb' : 'hourglass'} pal={pal === 'light' ? 'light' : state === 'approved' ? 'green' : 'cobalt'} />
        <div>
          <div className="dst__label">{c.label}</div>
          <div className="dst__eyebrow">{c.eyebrow}</div>
        </div>
      </div>
      <div className="dst__amount">AED 54,000</div>
      <Facts />
      {state === 'awaiting' && <Buttons />}
    </div>
  );
}

/** System D: the ring of the live card in both states; the object inside changes. */
function RingCard({ state }: { state: State }) {
  const c = COPY[state];
  const r = 44;
  const circ = 2 * Math.PI * r;
  const used = state === 'approved' ? 1 : 0.55;
  return (
    <div className={cx('dst__card dst__card--ring', `is-${state}`)}>
      <div className="dst__ringrow">
        <div>
          <div className="dst__eyebrow">{c.eyebrow}</div>
          <div className="dst__amount">AED 54,000</div>
          <div className="dst__label dst__label--sub">{c.label}</div>
        </div>
        <div className="dst__ring">
          <svg viewBox="0 0 100 100" aria-hidden>
            <circle className="dst__track" cx="50" cy="50" r={r} />
            <circle className="dst__arc" cx="50" cy="50" r={r} strokeDasharray={circ} strokeDashoffset={circ * (1 - used)} />
          </svg>
          <Tile glyph={state === 'approved' ? 'thumb' : 'hourglass'} pal={state === 'approved' ? 'green' : 'cobalt'} size={46} />
        </div>
      </div>
      <Facts />
      {state === 'awaiting' && <Buttons />}
    </div>
  );
}

const SYSTEMS = [
  {
    id: 'a',
    name: 'A · One white card, the state lives in the tile',
    note: 'The calmest. Both states are the same white card with the same anatomy; what changes is the glass tile (an hourglass in Cobalt while waiting, a thumb in green once approved), the colour of the state word, and the buttons. The page keeps its calm and the green card’s weight goes.',
    render: () => (
      <>
        <Card state="awaiting" pal="cobalt" />
        <Card state="approved" pal="green" />
      </>
    ),
  },
  {
    id: 'd',
    name: 'B · The ring in both states',
    note: 'The continuity idea: the composition of the live waiting card (amount on the left, the object in the time ring on the right) is kept, and approval closes the ring in green around the thumb tile. The waiting state is the unfinished version of the approved one.',
    render: () => (
      <>
        <RingCard state="awaiting" />
        <RingCard state="approved" />
      </>
    ),
  },
  {
    id: 'b',
    name: 'C · Two gradient cards',
    note: 'If the green card stays, so does a waiting card of the same kind: Cobalt for the human decision, green for success, both gradient, both with the same type and a glass tile. The buttons turn into white pills. The loudest, and the most consistent in kind.',
    render: () => (
      <>
        <Card state="awaiting" pal="light" />
        <Card state="approved" pal="light" />
      </>
    ),
  },
  {
    id: 'c',
    name: 'D · Soft tinted cards',
    note: 'Between the two: the card takes a tint of its state (Cobalt 6% while waiting, green 8% once approved) with a hairline of the same colour. Ink type, glass tiles, regular buttons. The state is readable at a glance without a heavy fill.',
    render: () => (
      <>
        <Card state="awaiting" pal="cobalt" />
        <Card state="approved" pal="green" />
      </>
    ),
  },
  {
    id: 'e',
    name: 'E · Ink cards',
    note: 'After “Ink objects carry the spark”: both states are Ink cards with a soft glow in the state colour in the corner (Cobalt while waiting, green once approved), white type and glass tiles. The most premium; it asks the most of the page around it.',
    render: () => (
      <>
        <Card state="awaiting" pal="cobalt" />
        <Card state="approved" pal="green" />
      </>
    ),
  },
] as const;

export function DecisionStatesDemo() {
  return (
    <div className="cdemo dstdemo">
      <PageHeader
        title="Decision card: one family"
        sub="Today the waiting card (white, hourglass, buttons) and the approved card (green gradient) look like two different components. Five ways to make them one, each shown in both states with the same anatomy: a glass tile, the state, the amount, Starts and Duration, and the buttons only while waiting."
      />
      <div className="dstdemo__grid">
        {SYSTEMS.map((s) => (
          <section key={s.id} className="gdemo__card">
            <header>
              <h3>{s.name}</h3>
              <p>{s.note}</p>
            </header>
            <div className={cx('dst__stage', `dst--${s.id}`)}>{s.render()}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
