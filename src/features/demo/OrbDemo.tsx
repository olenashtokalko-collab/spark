// Prototype-only page (#/demo/orb): Spark's AI mark after the glass reference: a pillow-shaped squircle of
// thick glass lit from inside. What makes it read as 3D: a rim with thickness whose colour is refracted
// (Cobalt and violet on the lit side, Ember at the bottom), a double inner edge, bright streaks along the
// edge, a gloss on top, a warm caustic where the light gathers at the bottom, and a reflection on the ground.
//   Now  the live orb (a flat airbrushed ball)
//   A    the reference form with the full glass and the spark drawn as a glowing outline
//   B    the same, without a glyph: only the light
//   C    the live, moving orb as the light inside the same glass
//   D    a calmer glass (thin rim, no caustic) that holds up at small sizes
import { useId, useRef } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';

type Look = 'now' | 'soft' | 'a' | 'b' | 'c' | 'd';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now · the soft ball', note: 'Airbrushed clouds in a circle: no edge, no thickness, nothing on top. Lovely large, a flat dot at 28 px, and unlike every glass tile in the product.' },
  { id: 'soft', name: 'E · The soft ball, as a squircle', note: 'Exactly today’s ball (the live orb, the same clouds and grain, still moving), with only the shape changed from a circle to the reference squircle. Nothing is added: no rim, no gloss, no reflection.' },
  { id: 'a', name: 'A · Reference form, full glass', note: 'The pillow-shaped squircle, a thick rim that splits the light (blue and violet on the left, Ember below), a double inner edge, streaks, a gloss, a warm caustic at the bottom, the spark as a glowing outline and a reflection on the ground.' },
  { id: 'b', name: 'B · Only the light', note: 'The same glass without a glyph. For a presence rather than a button: the thinking state, a hero, an empty state.' },
  { id: 'c', name: 'C · The live orb inside the glass', note: 'The real animated orb is the light under the glass, so it keeps moving the way it does today; the rim, streaks and caustic are on top. One canvas per mark, so for a few large places only.' },
  { id: 'd', name: 'D · Calmer glass', note: 'A thin rim and no caustic or streaks: the same form, quieter. The one that survives 28 px next to a chat answer.' },
];

// The squircle: a superellipse a little squarer than a rounded rectangle, as in the reference (100-unit box,
// the shape sits 5 units in so the rim has room).
const SQ = 'M50 5C81 5 95 19 95 50C95 81 81 95 50 95C19 95 5 81 5 50C5 19 19 5 50 5Z';
const SPARK = 'M50 34C51.6 43.5 56.5 48.4 66 50C56.5 51.6 51.6 56.5 50 66C48.4 56.5 43.5 51.6 34 50C43.5 48.4 48.4 43.5 50 34Z';

function Glass({ size, glyph = true, live = false, calm = false }: { size: number; glyph?: boolean; live?: boolean; calm?: boolean }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `og-${n}-${id}`;
  const small = size < 40;
  const rim = calm || small ? 5 : 9;
  const ref = useRef<HTMLSpanElement>(null);
  // The mark tilts toward the pointer a few degrees, as a thick pane would, and settles when it leaves.
  const tilt = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el || size < 100) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${(x * 16).toFixed(1)}deg`);
    el.style.setProperty('--rx', `${(-y * 16).toFixed(1)}deg`);
  };
  const settle = () => {
    ref.current?.style.setProperty('--ry', '0deg');
    ref.current?.style.setProperty('--rx', '0deg');
  };
  return (
    <span ref={ref} className={cx('og', size >= 100 && 'og--float')} style={{ ['--s' as string]: `${size}px` }} onPointerMove={tilt} onPointerLeave={settle}>
      <svg width="0" height="0" className="og__defs" aria-hidden>
        <clipPath id={u('clip')} clipPathUnits="objectBoundingBox">
          <path d="M0.5 0.05C0.81 0.05 0.95 0.19 0.95 0.5C0.95 0.81 0.81 0.95 0.5 0.95C0.19 0.95 0.05 0.81 0.05 0.5C0.05 0.19 0.19 0.05 0.5 0.05Z" />
        </clipPath>
      </svg>
      <span className="og__body" style={{ clipPath: `url(#${u('clip')})` }}>
        {live ? <FluidOrb size={size} /> : <span className="og__field" />}
      </span>
      <svg className="og__glass" viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <defs>
          {/* The rim takes the light's colours, refracted: cool on the lit side, warm under. */}
          <linearGradient id={u('rim')} gradientUnits="userSpaceOnUse" x1="8" y1="10" x2="92" y2="92">
            <stop offset="0" stopColor="#6f8cff" />
            <stop offset="0.28" stopColor="#c8b8ff" />
            <stop offset="0.52" stopColor="#ff9fd0" />
            <stop offset="0.8" stopColor="#ff8a4a" />
            <stop offset="1" stopColor="#ffd07a" />
          </linearGradient>
          <linearGradient id={u('edge')} gradientUnits="userSpaceOnUse" x1="10" y1="10" x2="90" y2="90">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>
          <filter id={u('soft')} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
          <filter id={u('blur')} x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          <filter id={u('glow')} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={u('in')}>
            <path d={SQ} transform="translate(50 50) scale(0.9) translate(-50 -50)" />
          </clipPath>
        </defs>
        {/* The thick rim */}
        <path d={SQ} fill="none" stroke={`url(#${u('rim')})`} strokeWidth={rim} opacity="1" filter={`url(#${u('soft')})`} />
        {/* Its two edges: the outside catch-light and a double line just inside, as glass of real thickness */}
        <path d={SQ} fill="none" stroke={`url(#${u('edge')})`} strokeWidth="1" opacity="0.9" transform="translate(50 50) scale(1.045) translate(-50 -50)" />
        <path d={SQ} fill="none" stroke={`url(#${u('edge')})`} strokeWidth="0.9" opacity="0.55" transform="translate(50 50) scale(0.9) translate(-50 -50)" />
        {!calm && !small && (
          <>
            <path d={SQ} fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.35" transform="translate(50 50) scale(0.86) translate(-50 -50)" />
            {/* Streaks along the edge, where the glass bends the light */}
            <path d={SQ} pathLength="400" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="46 354" strokeDashoffset="-338" opacity="0.95" filter={`url(#${u('soft')})`} transform="translate(50 50) scale(0.97) translate(-50 -50)" />
            <path d={SQ} pathLength="400" fill="none" stroke="#ffe3b0" strokeWidth="2" strokeLinecap="round" strokeDasharray="38 362" strokeDashoffset="-168" opacity="0.9" filter={`url(#${u('soft')})`} transform="translate(50 50) scale(0.97) translate(-50 -50)" />
            <path d={SQ} pathLength="400" fill="none" stroke="#bcd0ff" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="22 378" strokeDashoffset="-272" opacity="0.9" filter={`url(#${u('soft')})`} transform="translate(50 50) scale(0.94) translate(-50 -50)" />
            {/* The warm caustic where the light gathers at the bottom */}
            <g clipPath={`url(#${u('in')})`}>
              <ellipse cx="60" cy="90" rx="30" ry="6" fill="#ffb347" opacity="0.7" filter={`url(#${u('blur')})`} />
            </g>
          </>
        )}
        {/* The gloss on top */}
        <ellipse cx="42" cy="15" rx="24" ry="5.5" fill="#ffffff" opacity={calm || small ? 0.45 : 0.6} filter={`url(#${u('blur')})`} />
        {glyph && (
          <path d={SPARK} fill="none" stroke="#ffffff" strokeWidth={small ? 3 : 2.4} strokeLinejoin="round" filter={`url(#${u('glow')})`} />
        )}
      </svg>
      {size > 40 && <span className="og__floor" />}
    </span>
  );
}

/** Today's ball, only the shape changed: the live orb fills the reference squircle. Nothing added. */
function SoftSquircle({ size }: { size: number }) {
  return <FluidOrb size={size} squircle />;
}

function Mark({ look, size }: { look: Look; size: number }) {
  if (look === 'now') return <FluidOrb size={size} />;
  if (look === 'soft') return <SoftSquircle size={size} />;
  return <Glass size={size} glyph={look !== 'b'} live={look === 'c'} calm={look === 'd'} />;
}

export function OrbDemo() {
  return (
    <div className="cdemo orbdemo">
      <PageHeader
        title="The AI mark after the glass reference"
        sub="The reference is a squircle of thick glass, lit from inside, with a bright refracting rim, streaks along the edge and a reflection of its light on the ground. That is what makes it look three-dimensional. Five looks for the mark, each large, at 56 and 28 px, and next to a chat answer. Nothing here is applied to the app."
      />
      <div className="orbdemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className="gdemo__card orbd">
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="orbd__stage">
              <div className="orbd__big">
                <Mark look={l.id} size={150} />
              </div>
              <div className="orbd__sizes">
                <Mark look={l.id} size={56} />
                <Mark look={l.id} size={28} />
              </div>
            </div>
            <div className="orbd__chat">
              <Mark look={l.id} size={28} />
              <div>
                <div className="orbd__who">Spark</div>
                <p>The proposal lands on 18 Oct. Two of the three routes fit the budget; I’d start with the second.</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
