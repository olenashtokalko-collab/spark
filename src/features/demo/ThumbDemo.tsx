// Prototype-only page (#/demo/thumb): the "thumb" for the approved card, drawn in the brand's
// own material (Spark Studios brand book + the poster references): frosted glass with the
// Cobalt to Ember spectrum held inside it, a bright refractive rim, Noor light on the ground
// under it, grain, and an Ink object that carries the spark. One drawing (the Lucide thumb
// silhouette, so it stays a thumb) rendered eight ways, plus the sizes it has to survive.
import { useId, useState } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';

/** The thumb silhouette (24 grid), closed: hand and cuff in one. */
const THUMB = 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z';
const CUFF = 'M7 10v12';
const SPARK4 = 'M12 0 C12.6 6 15 8.6 24 12 C15 15.4 12.6 18 12 24 C11.4 18 9 15.4 0 12 C9 8.6 11.4 6 12 0 Z';

/** Shared SVG defs: the spectrum, the milky veil, blurs and grain. Ids are per instance. */
function Defs({ id }: { id: string }) {
  const u = (n: string) => `${n}-${id}`;
  return (
    <defs>
      <clipPath id={u('thumb')}>
        <path d={THUMB} />
      </clipPath>
      <linearGradient id={u('spec')} gradientUnits="userSpaceOnUse" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0" stopColor="#1e3bd6" />
        <stop offset="0.42" stopColor="#6d5cf0" />
        <stop offset="0.7" stopColor="#d65aa6" />
        <stop offset="1" stopColor="#f0642c" />
      </linearGradient>
      <linearGradient id={u('milk')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id={u('rim')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
      </linearGradient>
      <radialGradient id={u('orange')} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#ffc090" />
        <stop offset="0.5" stopColor="#f0642c" />
        <stop offset="1" stopColor="#c43d10" />
      </radialGradient>
      <filter id={u('b1')} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.1" />
      </filter>
      <filter id={u('b3')} x="-40%" y="-80%" width="180%" height="260%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
      <filter id={u('grain')} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
      </filter>
    </defs>
  );
}

/** The thumb as a lump of frosted glass with the spectrum inside. */
function GlassThumb({ size = 160, className, animate }: { size?: number; className?: string; animate?: boolean }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className={cx('thd__svg', className)} width={size} height={size * 1.06} viewBox="-3 -2 30 32" aria-hidden>
      <Defs id={id} />
      <ellipse className={animate ? 'thd__under' : undefined} cx="12" cy="25.4" rx="8.6" ry="1.5" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.7" />
      <path d={THUMB} fill="rgba(255,255,255,0.4)" />
      <g clipPath={`url(#${u('thumb')})`}>
        <rect x="-2" y="-2" width="28" height="28" fill={`url(#${u('spec')})`} filter={`url(#${u('b1')})`} />
        <rect x="-2" y="-2" width="28" height="28" fill={`url(#${u('milk')})`} />
        <ellipse cx="9" cy="5.5" rx="5.2" ry="2.6" fill="#ffffff" opacity="0.6" filter={`url(#${u('b1')})`} />
        <ellipse cx="18.5" cy="19.5" rx="3" ry="1.4" fill="#ffffff" opacity="0.28" filter={`url(#${u('b1')})`} />
        <rect x="-2" y="-2" width="28" height="28" filter={`url(#${u('grain')})`} opacity="0.35" style={{ mixBlendMode: 'soft-light' }} />
        {animate && <rect className="thd__sheen" x="-14" y="-4" width="9" height="32" fill="#ffffff" opacity="0.55" transform="skewX(-18)" filter={`url(#${u('b1')})`} />}
      </g>
      <path d={THUMB} fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.55" strokeLinejoin="round" />
      <path d={CUFF} fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="0.4" strokeLinecap="round" />
    </svg>
  );
}

/** The brand's icon tile (p. 16): a glass squircle, the spectrum inside, a white glyph on top. */
function GlassTile({ size = 140 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size} height={size * 1.12} viewBox="-2 -2 28 31" aria-hidden>
      <Defs id={id} />
      <clipPath id={u('tile')}>
        <rect x="0" y="0" width="24" height="24" rx="7.5" />
      </clipPath>
      <ellipse cx="12" cy="25" rx="9" ry="1.6" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.75" />
      <rect x="0" y="0" width="24" height="24" rx="7.5" fill="rgba(255,255,255,0.35)" />
      <g clipPath={`url(#${u('tile')})`}>
        <rect width="24" height="24" fill={`url(#${u('spec')})`} filter={`url(#${u('b1')})`} />
        <rect width="24" height="24" fill={`url(#${u('milk')})`} opacity="0.7" />
        <ellipse cx="9" cy="3.5" rx="8" ry="3" fill="#ffffff" opacity="0.5" filter={`url(#${u('b1')})`} />
        <rect width="24" height="24" filter={`url(#${u('grain')})`} opacity="0.35" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <rect x="0.3" y="0.3" width="23.4" height="23.4" rx="7.2" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.6" />
      <g transform="translate(5.2 5.2) scale(0.6)" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d={THUMB} />
        <path d={CUFF} />
      </g>
    </svg>
  );
}

/** A glass dial, after the round glass object in the poster: a sphere with the spectrum at its edge. */
function GlassSphere({ size = 150 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size} height={size * 1.1} viewBox="-2 -2 28 31" aria-hidden>
      <Defs id={id} />
      <clipPath id={u('ball')}>
        <circle cx="12" cy="12" r="12" />
      </clipPath>
      <radialGradient id={u('core')} cx="0.5" cy="0.45" r="0.55">
        <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <ellipse cx="12" cy="25" rx="9" ry="1.6" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.75" />
      <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.4)" />
      <g clipPath={`url(#${u('ball')})`}>
        <rect width="24" height="24" fill={`url(#${u('spec')})`} filter={`url(#${u('b1')})`} />
        <circle cx="12" cy="11" r="10" fill={`url(#${u('core')})`} />
        <ellipse cx="9" cy="4.2" rx="6.5" ry="2.4" fill="#ffffff" opacity="0.65" filter={`url(#${u('b1')})`} />
        <rect width="24" height="24" filter={`url(#${u('grain')})`} opacity="0.3" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <circle cx="12" cy="12" r="11.75" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.6" />
      <g transform="translate(6.4 6.2) scale(0.5)" fill="none" stroke="#2a2f6e" strokeOpacity="0.9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={THUMB} />
        <path d={CUFF} />
      </g>
    </svg>
  );
}

/** An Ink object that carries the spark (p. 18): solid Ink, the Ember spark at the cuff, Noor behind. */
function InkThumb({ size = 150 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size} height={size * 1.06} viewBox="-3 -2 30 32" aria-hidden>
      <Defs id={id} />
      <linearGradient id={u('ink')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a2f3a" />
        <stop offset="1" stopColor="#0e1116" />
      </linearGradient>
      <ellipse cx="12" cy="13" rx="12" ry="11" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.4" />
      <path d={THUMB} fill={`url(#${u('ink')})`} />
      <g clipPath={`url(#${u('thumb')})`}>
        <ellipse cx="10" cy="5" rx="5" ry="2.2" fill="#ffffff" opacity="0.16" filter={`url(#${u('b1')})`} />
        <rect x="-2" y="-2" width="28" height="28" filter={`url(#${u('grain')})`} opacity="0.3" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <path d={THUMB} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.4" />
      <g transform="translate(2.9 12.9) scale(0.17)">
        <path d={SPARK4} fill="#e8501f" />
      </g>
    </svg>
  );
}

/** A plain outline icon with rounded ends (the brand's UI icon rule), with a smudge of Noor beneath. */
function LineThumb({ size = 96, glow = true }: { size?: number; glow?: boolean }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size} height={size * 1.12} viewBox="-2 -2 28 29" aria-hidden>
      <Defs id={id} />
      {glow && <ellipse cx="12" cy="24.6" rx="8" ry="1.3" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.7" />}
      <g fill="none" stroke="#1e3bd6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={THUMB} />
        <path d={CUFF} />
      </g>
    </svg>
  );
}

/** The glass toggle from the poster, but the Ember knob carries the thumb. */
function ToggleThumb({ size = 200 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size} height={size * 0.6} viewBox="-2 -2 48 28" aria-hidden>
      <Defs id={id} />
      <clipPath id={u('pill')}>
        <rect x="0" y="0" width="44" height="22" rx="11" />
      </clipPath>
      <ellipse cx="18" cy="23.6" rx="16" ry="1.6" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.7" />
      <rect x="0" y="0" width="44" height="22" rx="11" fill="rgba(255,255,255,0.4)" />
      <g clipPath={`url(#${u('pill')})`}>
        <rect x="-2" y="-2" width="48" height="26" fill={`url(#${u('spec')})`} filter={`url(#${u('b1')})`} />
        <rect x="-2" y="-2" width="48" height="26" fill={`url(#${u('milk')})`} opacity="0.65" />
        <ellipse cx="14" cy="3" rx="12" ry="2.4" fill="#ffffff" opacity="0.55" filter={`url(#${u('b1')})`} />
        <rect x="-2" y="-2" width="48" height="26" filter={`url(#${u('grain')})`} opacity="0.3" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <rect x="0.3" y="0.3" width="43.4" height="21.4" rx="10.7" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.5" />
      <circle cx="33" cy="11" r="8.4" fill={`url(#${u('orange')})`} />
      <ellipse cx="30.4" cy="7.4" rx="4" ry="2.2" fill="#ffffff" opacity="0.5" filter={`url(#${u('b1')})`} />
      <g transform="translate(27 5.1) scale(0.5)" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d={THUMB} />
        <path d={CUFF} />
      </g>
    </svg>
  );
}

type Look = { id: string; name: string; ref: string; note: string; body: () => React.ReactNode; replay?: boolean };

const LOOKS: Look[] = [
  {
    id: 'glass',
    name: '1 · Glass thumb',
    ref: 'p. 14 · frosted, never flat · the poster’s glass objects',
    note: 'The thumb itself as a lump of frosted glass: the Cobalt to Ember spectrum held inside, a milky veil on top, a bright refractive rim, a soft highlight and Noor light on the ground under it. The hero.',
    body: () => <GlassThumb size={170} />,
  },
  {
    id: 'tile',
    name: '2 · Glass tile with a white thumb',
    ref: 'p. 16 · the icon-tile recipe',
    note: 'The brand’s icon tile exactly as in the book: a glass squircle, the spectrum inside it, a white glyph on top. The most reusable one: it is a tile like any other in the product.',
    body: () => <GlassTile size={150} />,
  },
  {
    id: 'sphere',
    name: '3 · Glass sphere',
    ref: 'p. 20 · the round glass dial',
    note: 'After the round glass dial in the poster: a sphere with a bright core and the spectrum gathering at its edge, the thumb engraved in deep blue. Soft, friendly, a good fit for a success moment.',
    body: () => <GlassSphere size={160} />,
  },
  {
    id: 'toggle',
    name: '4 · The toggle, thumbs up',
    ref: 'pp. 16, 20 · glass toggle, Ember knob',
    note: 'The glass toggle from the poster (the one that switches the spark on) with a white thumb on the Ember knob. Approval as a switch that has been thrown.',
    body: () => <ToggleThumb size={230} />,
  },
  {
    id: 'ink',
    name: '5 · Ink thumb carries the spark',
    ref: 'p. 18 · Ink objects carry the spark',
    note: 'The other half of the brand rule: a solid Ink thumb with the Ember spark at its cuff and a faint Noor glow behind it. Heavier and more serious than the glass ones: for a formal approval.',
    body: () => <InkThumb size={160} />,
  },
  {
    id: 'line',
    name: '6 · Line thumb for the interface',
    ref: 'p. 16 · outline icons with rounded ends',
    note: 'The small, everyday version: a simple Cobalt outline with rounded ends, as the book’s interface icons are, with a smudge of Noor under it. Shown here at 96, 48 and 24 px.',
    body: () => (
      <div className="thd__sizes">
        <LineThumb size={96} />
        <LineThumb size={48} />
        <LineThumb size={24} glow={false} />
      </div>
    ),
  },
  {
    id: 'finder',
    name: '7 · In a viewfinder',
    ref: 'pp. 19–20 · corner brackets and a mono tag',
    note: 'The glass thumb framed like the poster objects: four corner brackets and a mono tag. It fits a big success moment (an empty state, a dialog) and not the small card.',
    body: () => (
      <div className="thd__vf">
        <i className="thd__c thd__c--tl" />
        <i className="thd__c thd__c--tr" />
        <i className="thd__c thd__c--bl" />
        <i className="thd__c thd__c--br" />
        <span className="thd__tag">Approved · 100%</span>
        <GlassThumb size={130} />
      </div>
    ),
  },
  {
    id: 'anim',
    name: '8 · Glass thumb, moving',
    ref: 'The motion of the approved card',
    note: 'The hero with a short motion: it rises and settles, a band of light crosses the glass once, and the light on the ground breathes. Press Replay.',
    replay: true,
    body: () => <GlassThumb size={170} className="thd__rise" animate />,
  },
  {
    id: 'sizes',
    name: '9 · The glass thumb at the sizes it has to survive',
    ref: 'Scale check',
    note: 'The hero at 96, 56, 36 and 24 px. Under about 40 px the glass detail turns to mush, so small uses should switch to the line thumb (6) or the tile (2).',
    body: () => (
      <div className="thd__sizes">
        <GlassThumb size={96} />
        <GlassThumb size={56} />
        <GlassThumb size={36} />
        <GlassThumb size={24} />
      </div>
    ),
  },
];

function Card({ look }: { look: Look }) {
  const [n, setN] = useState(0);
  return (
    <section className="gdemo__card thd">
      <header>
        <h3>{look.name}</h3>
        <p>
          <span className="thd__ref">{look.ref}</span> {look.note}
        </p>
      </header>
      <div className="thd__stage">
        <div key={n} className="thd__play">
          {look.body()}
        </div>
        {look.replay && (
          <button className="link-btn thd__replay" onClick={() => setN((v) => v + 1)}>
            Replay
          </button>
        )}
      </div>
    </section>
  );
}

export function ThumbDemo() {
  return (
    <div className="cdemo thddemo">
      <PageHeader
        title="Thumb"
        sub="The thumb for the approved card, drawn in the brand’s material: frosted glass with the spectrum held inside, a bright rim, Noor light on the ground, grain, and an Ink object that carries the spark. One silhouette (the standard thumb, so it stays recognisable), nine treatments."
      />
      <div className="thddemo__grid">
        {LOOKS.map((l) => (
          <Card key={l.id} look={l} />
        ))}
      </div>
    </div>
  );
}
