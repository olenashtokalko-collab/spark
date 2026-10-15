// Prototype-only page (#/demo/hourglass): the deadline hourglass of the decision card, redrawn in
// the same material as the thumb (#/demo/thumb): frosted glass holding the Noor light, a bright
// refractive rim, grain, light on the ground underneath. Colours straight from the brand book
// (BRAND_GUIDELINES.md): Gulf Cobalt #1E3BD6 (human), Liwa Ember #E8501F (the spark), Corniche
// Haze #C8D8F0, Mangrove Ink #0E1116, Saadiyat Sand #F8F6F2, and the Noor spectrum between
// Cobalt and Ember. In the hourglass the light is the TIME: Cobalt while there is plenty, warming
// to Ember as it runs out. One silhouette, ten treatments.
import { useEffect, useId, useState } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';

const COBALT = '#1e3bd6';
const VIOLET = '#6d5cf0';
const PINK = '#d65aa6';
const EMBER = '#f0642c';

// The body (24 grid): two bulbs meeting at a neck, between a top and a bottom cap.
const BODY = 'M6.2 3.2 C6.2 9 11 10.6 11 12 C11 13.4 6.2 15 6.2 20.8 L17.8 20.8 C17.8 15 13 13.4 13 12 C13 10.6 17.8 9 17.8 3.2 Z';
const CAP_TOP = { x: 4.4, y: 1.2, w: 15.2, h: 2.2 };
const CAP_BOTTOM = { x: 4.4, y: 20.6, w: 15.2, h: 2.2 };
// The outline icon (Lucide's hourglass), for glyphs and the line version.
const GLYPH = ['M5 22h14', 'M5 2h14', 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22', 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'];

type Tone = 'cool' | 'mid' | 'warm';
const TONES: Record<Tone, [string, string, string, string]> = {
  cool: [COBALT, VIOLET, VIOLET, PINK],
  mid: [VIOLET, PINK, PINK, EMBER],
  warm: [PINK, EMBER, EMBER, '#e8501f'],
};

function Defs({ id, tone = 'cool' }: { id: string; tone?: Tone }) {
  const u = (n: string) => `${n}-${id}`;
  const [a, b, c, d] = TONES[tone];
  return (
    <defs>
      <clipPath id={u('body')}>
        <path d={BODY} />
      </clipPath>
      <clipPath id={u('top')}>
        <rect x="0" y="0" width="24" height="12" />
      </clipPath>
      <clipPath id={u('bottom')}>
        <rect x="0" y="12" width="24" height="12" />
      </clipPath>
      <linearGradient id={u('sandA')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
      <linearGradient id={u('sandB')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={c} />
        <stop offset="1" stopColor={d} />
      </linearGradient>
      <linearGradient id={u('spec')} gradientUnits="userSpaceOnUse" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0" stopColor={COBALT} />
        <stop offset="0.42" stopColor={VIOLET} />
        <stop offset="0.7" stopColor={PINK} />
        <stop offset="1" stopColor={EMBER} />
      </linearGradient>
      <linearGradient id={u('milk')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.14" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id={u('side')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="0.25" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="0.8" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id={u('rim')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id={u('stream')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={b} />
        <stop offset="1" stopColor={c} />
      </linearGradient>
      <filter id={u('b1')} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="0.7" />
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

/** The glass hourglass. `used` is the share of the time that has gone (0 to 1): the top bulb holds what is left. */
function GlassHourglass({ size = 150, used = 0.4, tone = 'cool', className, live }: { size?: number; used?: number; tone?: Tone; className?: string; live?: boolean }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  // Sand surfaces: the top bulb (y 3 to 12) drains downwards, the bottom bulb (y 12 to 21) fills upwards.
  const topY = 3.2 + used * 8.6;
  const bottomY = 20.8 - used * 8.2;
  const soft = live ? { transition: 'y 3.2s linear, height 3.2s linear' } : undefined;
  return (
    <svg className={cx('thd__svg', className)} width={size * 0.76} height={size} viewBox="2.4 0.2 19.2 25.2" aria-hidden>
      <Defs id={id} tone={tone} />
      <ellipse cx="12" cy="24.7" rx="7.8" ry="1.3" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.7" />
      <path d={BODY} fill="rgba(255,255,255,0.4)" />
      <g clipPath={`url(#${u('body')})`}>
        <g clipPath={`url(#${u('top')})`}>
          <rect x="4" width="16" style={{ y: `${topY}px`, height: `${12.2 - topY}px`, ...soft }} fill={`url(#${u('sandA')})`} filter={`url(#${u('b1')})`} />
        </g>
        <g clipPath={`url(#${u('bottom')})`}>
          <rect x="4" width="16" style={{ y: `${bottomY}px`, height: `${21 - bottomY}px`, ...soft }} fill={`url(#${u('sandB')})`} filter={`url(#${u('b1')})`} />
        </g>
        <rect x="11.6" y="11.4" width="0.8" height="9.4" rx="0.4" fill={`url(#${u('stream')})`} filter={`url(#${u('b1')})`} opacity="0.9" />
        <rect x="0" y="0" width="24" height="24" fill={`url(#${u('milk')})`} />
        <rect x="0" y="0" width="24" height="24" fill={`url(#${u('side')})`} opacity="0.7" />
        <rect x="0" y="0" width="24" height="24" filter={`url(#${u('grain')})`} opacity="0.3" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <path d={BODY} fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.5" strokeLinejoin="round" />
      {[CAP_TOP, CAP_BOTTOM].map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="1.1" fill="rgba(255,255,255,0.55)" />
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="1.1" fill={`url(#${u('milk')})`} />
          <rect x={c.x + 0.25} y={c.y + 0.25} width={c.w - 0.5} height={c.h - 0.5} rx="0.9" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

/** The brand's icon tile (p. 16): a glass squircle holding the spectrum, a white glyph on top. */
function GlassTile({ size = 140 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size} height={size * 1.12} viewBox="-2 -2 28 31" aria-hidden>
      <Defs id={id} />
      <clipPath id={u('tile')}>
        <rect width="24" height="24" rx="7.5" />
      </clipPath>
      <ellipse cx="12" cy="25" rx="9" ry="1.6" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.75" />
      <rect width="24" height="24" rx="7.5" fill="rgba(255,255,255,0.35)" />
      <g clipPath={`url(#${u('tile')})`}>
        <rect width="24" height="24" fill={`url(#${u('spec')})`} filter={`url(#${u('b1')})`} />
        <rect width="24" height="24" fill={`url(#${u('milk')})`} opacity="0.7" />
        <ellipse cx="9" cy="3.5" rx="8" ry="3" fill="#ffffff" opacity="0.5" filter={`url(#${u('b1')})`} />
        <rect width="24" height="24" filter={`url(#${u('grain')})`} opacity="0.35" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <rect x="0.3" y="0.3" width="23.4" height="23.4" rx="7.2" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.6" />
      <g transform="translate(5.8 5.8) scale(0.52)" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {GLYPH.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** A glass dial, after the round object in the poster: a sphere, the spectrum at its edge. */
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
      <g transform="translate(6.4 6.4) scale(0.45)" fill="none" stroke="#1b2a8a" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {GLYPH.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** An Ink object that carries the spark (p. 18): solid Ink, Ember grains of light falling through the neck. */
function InkHourglass({ size = 150 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size * 0.76} height={size} viewBox="2.4 0.2 19.2 25.2" aria-hidden>
      <Defs id={id} />
      <linearGradient id={u('ink')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a2f3a" />
        <stop offset="1" stopColor="#0e1116" />
      </linearGradient>
      <ellipse cx="12" cy="12" rx="11" ry="12" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.4" />
      <path d={BODY} fill={`url(#${u('ink')})`} />
      <g clipPath={`url(#${u('body')})`}>
        <ellipse cx="9" cy="5" rx="3" ry="1.6" fill="#ffffff" opacity="0.14" filter={`url(#${u('b1')})`} />
        <rect x="0" y="0" width="24" height="24" filter={`url(#${u('grain')})`} opacity="0.3" style={{ mixBlendMode: 'soft-light' }} />
        <path d="M8 18.2 Q12 15.6 16 18.2 V20.8 H8 Z" fill={EMBER} opacity="0.95" />
      </g>
      <rect x="11.6" y="12" width="0.8" height="5" rx="0.4" fill={EMBER} filter={`url(#${u('b1')})`} />
      {[CAP_TOP, CAP_BOTTOM].map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx="1.1" fill="#0e1116" />
      ))}
    </svg>
  );
}

/** A plain outline with rounded ends (the brand's interface icons), in Cobalt, with a smudge of Noor under it. */
function LineHourglass({ size = 96, glow = true }: { size?: number; glow?: boolean }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `${n}-${id}`;
  return (
    <svg className="thd__svg" width={size} height={size * 1.12} viewBox="-2 -2 28 29" aria-hidden>
      <Defs id={id} />
      {glow && <ellipse cx="12" cy="24.6" rx="8" ry="1.3" fill={`url(#${u('spec')})`} filter={`url(#${u('b3')})`} opacity="0.7" />}
      <g fill="none" stroke={COBALT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {GLYPH.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** The time ring of the live card, with the glass hourglass inside it. */
function RingHourglass({ used = 0.45, size = 150 }: { used?: number; size?: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="hgd__ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle className="hgd__track" cx="50" cy="50" r={r} />
        <circle className="hgd__arc" cx="50" cy="50" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - used)} />
      </svg>
      <GlassHourglass size={size * 0.62} used={used} />
    </div>
  );
}

/** Drains once on mount: the top bulb empties into the bottom one. */
function MovingHourglass() {
  const [used, setUsed] = useState(0.04);
  useEffect(() => {
    const t = requestAnimationFrame(() => setUsed(0.72));
    return () => cancelAnimationFrame(t);
  }, []);
  return <GlassHourglass size={170} used={used} live />;
}

type Look = { id: string; name: string; ref: string; note: string; body: () => React.ReactNode; replay?: boolean };

const LOOKS: Look[] = [
  {
    id: 'glass',
    name: '1 · Glass hourglass',
    ref: 'p. 14 · frosted, never flat · Noor as glow and glass',
    note: 'The hourglass as a piece of frosted glass: Cobalt light in the top bulb, warming towards Ember in the bottom one, a thin glowing stream through the neck, glass caps, a bright rim and Noor on the ground under it. The time is the light.',
    body: () => <GlassHourglass size={190} used={0.42} />,
  },
  {
    id: 'ring',
    name: '2 · In the time ring',
    ref: 'The live decision card',
    note: 'The glass hourglass inside the ring of the card that waits for a decision: the ring runs on as the time is used. The most continuous with what is on the page today.',
    body: () => <RingHourglass used={0.45} size={190} />,
  },
  {
    id: 'states',
    name: '3 · The light warms as time runs out',
    ref: 'p. 11 · the spectrum flows Cobalt to Ember',
    note: 'Plenty of time (Cobalt), halfway (violet and pink), almost out (Ember). The brand’s own spectrum as a gauge: no new colours, and Ember stays the spark that says look here.',
    body: () => (
      <div className="thd__sizes hgd__states">
        <div>
          <GlassHourglass size={120} used={0.18} tone="cool" />
          <span>5 days</span>
        </div>
        <div>
          <GlassHourglass size={120} used={0.55} tone="mid" />
          <span>2 days</span>
        </div>
        <div>
          <GlassHourglass size={120} used={0.9} tone="warm" />
          <span>Due today</span>
        </div>
      </div>
    ),
  },
  {
    id: 'tile',
    name: '4 · Glass tile with a white hourglass',
    ref: 'p. 16 · the icon-tile recipe',
    note: 'The brand’s icon tile: a glass squircle with the spectrum inside and a white glyph on top. The same family as the thumb tile, so the card’s two states (waiting, approved) read as a pair.',
    body: () => <GlassTile size={150} />,
  },
  {
    id: 'sphere',
    name: '5 · Glass sphere',
    ref: 'p. 20 · the round glass dial',
    note: 'After the round glass dial in the poster: a sphere with a bright core and the spectrum at its edge, the hourglass engraved in deep Cobalt.',
    body: () => <GlassSphere size={160} />,
  },
  {
    id: 'ink',
    name: '6 · Ink hourglass carries the spark',
    ref: 'p. 18 · Ink objects carry the spark',
    note: 'The other half of the brand rule: a solid Ink hourglass whose light is an Ember spark, a stream and a heap of Ember grains, with a faint Noor glow behind. Serious: for a decision that matters.',
    body: () => <InkHourglass size={180} />,
  },
  {
    id: 'line',
    name: '7 · Line hourglass for the interface',
    ref: 'p. 16 · outline icons with rounded ends',
    note: 'The small, everyday version: a Cobalt outline with rounded ends and a smudge of Noor under it, at 96, 48 and 24 px. Use it where the glass would turn to mush.',
    body: () => (
      <div className="thd__sizes">
        <LineHourglass size={96} />
        <LineHourglass size={48} />
        <LineHourglass size={24} glow={false} />
      </div>
    ),
  },
  {
    id: 'finder',
    name: '8 · In a viewfinder',
    ref: 'pp. 19–20 · corner brackets and a mono tag',
    note: 'The glass hourglass framed like the poster objects, with the deadline as a mono tag. For a big moment (a reminder, a dialog), not for the small card.',
    body: () => (
      <div className="thd__vf">
        <i className="thd__c thd__c--tl" />
        <i className="thd__c thd__c--tr" />
        <i className="thd__c thd__c--bl" />
        <i className="thd__c thd__c--br" />
        <span className="thd__tag">Due 14 Oct · 3 days</span>
        <GlassHourglass size={150} used={0.55} tone="mid" />
      </div>
    ),
  },
  {
    id: 'moving',
    name: '9 · The sand runs',
    ref: 'The motion of the live card',
    note: 'On arrival the top bulb empties into the bottom one down to today’s level while the stream glows through the neck, as the live hourglass does. Press Replay.',
    replay: true,
    body: () => <MovingHourglass />,
  },
  {
    id: 'sizes',
    name: '10 · The glass hourglass at the sizes it has to survive',
    ref: 'Scale check',
    note: 'The glass version at 96, 56, 36 and 24 px. Under about 40 px the caps and the sand blur together, so for small uses switch to the tile (4) or the line hourglass (7).',
    body: () => (
      <div className="thd__sizes">
        <GlassHourglass size={96} />
        <GlassHourglass size={56} />
        <GlassHourglass size={36} />
        <GlassHourglass size={24} />
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

export function HourglassDemo() {
  return (
    <div className="cdemo thddemo hgddemo">
      <PageHeader
        title="Hourglass"
        sub="The deadline hourglass of the decision card in the same glass material as the thumb, in the brand book’s colours: Cobalt, Ember, Haze, Ink and Sand, and the Noor spectrum between them. In the hourglass the light is the time: Cobalt while there is plenty of it, warming to Ember as it runs out."
      />
      <div className="thddemo__grid">
        {LOOKS.map((l) => (
          <Card key={l.id} look={l} />
        ))}
      </div>
    </div>
  );
}
