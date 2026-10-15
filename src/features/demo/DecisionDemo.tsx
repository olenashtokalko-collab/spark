// Prototype-only page (#/demo/decision): the proposal's decision card after the
// "Tennis 29 mins" reference: the decision on the left, an object in a ring on
// the right. The ring is the time between the proposal being sent and its
// deadline; the closer the deadline, the further the line runs. Six objects
// in place of the tennis ball, and two ways of making the days left obvious. Drag "Days left" to see the ring move.
import { useEffect, useState, type ReactNode } from 'react';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { DeadlineHourglass } from '../../components/ui/DeadlineHourglass';

const TOTAL_DAYS = 8; // sent 6 Oct, due 14 Oct

const VARIANTS = [
  { id: 'glass', name: '1 · Glass sphere', note: 'A glossy Cobalt glass ball, like the toggle knob (p. 16). Cobalt is the client’s colour, and this is the client’s move.' },
  { id: 'orb', name: '2 · Spark’s orb', note: 'The AI orb that sent the proposal, flowing slowly while it waits for an answer. Ties the card to the chat.' },
  { id: 'spark', name: '3 · The spark', note: 'The logo’s spark in the Noor light, breathing. Most “brand”, says little about time.' },
  { id: 'count', name: '4a · Days left, in segments', note: 'One segment per day; the days still left are dark, the days gone are faint. “3” is three dark segments, and the label says “days left”.' },
  { id: 'timer', name: '4b · Days left, as a timer', note: 'The line counts down: as much ring is left as time is left, Ember on the last day. The label says “days left”.' },
  { id: 'sand', name: '4c · Hourglass', note: 'A 3D glass hourglass in the brand’s glass, the Noor light as sand: the top bulb is the days left, the bottom the days gone, glowing grains falling. The label says “3 days left”.' },
  { id: 'fill', name: '5 · Filling glass', note: 'A clear glass sphere that fills with the Noor light as the deadline nears, with a gentle wave on top.' },
  { id: 'fillsand', name: '5b · Emptying hourglass', note: 'Picked, now on the proposal page. 4c’s glass hourglass in a larger ring: the top bulb is the time left, pouring into the bottom, waves on both surfaces, the colours drifting.' },
  { id: 'sun', name: '6 · Light on the ring', note: 'No object: the ring itself is the Noor light, with a glowing point at its head; the due date sits inside.' },
] as const;

type VariantId = (typeof VARIANTS)[number]['id'];

const SPARK = 'M50 4 C53 34 66 47 96 50 C66 53 53 66 50 96 C47 66 34 53 4 50 C34 47 47 34 50 4 Z';

/** An arc of the ring from angle a to b (degrees, 0 at the top, clockwise). */
function arc(a: number, b: number, r = 44) {
  const p = (d: number) => [50 + r * Math.sin((d * Math.PI) / 180), 50 - r * Math.cos((d * Math.PI) / 180)];
  const [x1, y1] = p(a);
  const [x2, y2] = p(b);
  return `M${x1} ${y1} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

/**
 * The ring. `elapsed` (default): an arc for the share of the time used, which
 * draws in on mount. `segments`: one segment per day, the days left dark.
 * `remaining`: an arc for the share of the time left, counting down.
 */
function Ring({ progress, daysLeft, mode = 'elapsed', noor, children }: { progress: number; daysLeft: number; mode?: 'elapsed' | 'segments' | 'remaining'; noor?: boolean; children: ReactNode }) {
  const [shown, setShown] = useState(mode === 'remaining' ? 1 : 0);
  const target = mode === 'remaining' ? 1 - progress : progress;
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(target));
    return () => cancelAnimationFrame(t);
  }, [target]);
  const r = 44;
  const c = 2 * Math.PI * r;
  const a = (shown * 360 - 90) * (Math.PI / 180);
  const seg = 360 / TOTAL_DAYS;
  return (
    <div className={cx('dring', noor && 'dring--noor', `dring--${mode}`)}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id="dring-noor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3bd6" />
            <stop offset="55%" stopColor="#b35ad8" />
            <stop offset="100%" stopColor="#e8501f" />
          </linearGradient>
        </defs>
        {mode === 'segments' ? (
          // Like a timer: the days left run clockwise from the top, the days gone follow.
          <g className="dring__segs">
            {Array.from({ length: TOTAL_DAYS }, (_, k) => (
              <path key={k} d={arc(k * seg + 4, (k + 1) * seg - 4)} className={cx('dring__seg', k < daysLeft && 'is-left')} />
            ))}
          </g>
        ) : (
          <>
            <circle className="dring__track" cx="50" cy="50" r={r} />
            <circle className="dring__arc" cx="50" cy="50" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - shown)} />
            {noor && <circle className="dring__head" cx={50 + r * Math.cos(a)} cy={50 + r * Math.sin(a)} r="3.2" />}
          </>
        )}
      </svg>
      <div className="dring__in">{children}</div>
    </div>
  );
}

function Obj({ variant, progress, daysLeft }: { variant: VariantId; progress: number; daysLeft: number }) {
  switch (variant) {
    case 'glass':
      return <span className="dobj-glass" />;
    case 'orb':
      return <FluidOrb size={58} />;
    case 'spark':
      return (
        <svg viewBox="0 0 100 100" className="dobj-spark" aria-hidden>
          <defs>
            <linearGradient id="dobj-spark-g" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e3bd6" />
              <stop offset="55%" stopColor="#b35ad8" />
              <stop offset="100%" stopColor="#e8501f" />
            </linearGradient>
          </defs>
          <path d={SPARK} fill="url(#dobj-spark-g)" />
        </svg>
      );
    case 'count':
    case 'timer':
    case 'sand':
      return (
        <span className={cx('dobj-count', daysLeft <= 1 && 'is-due', daysLeft === 0 && 'is-today')}>
          {daysLeft === 0 ? (
            <>
              <strong>Today</strong>
              <span>last day</span>
            </>
          ) : (
            <>
              <strong>{daysLeft}</strong>
              <span>{daysLeft === 1 ? 'day left' : 'days left'}</span>
            </>
          )}
        </span>
      );
    case 'fill':
      return (
        <span className="dobj-fill" style={{ ['--p' as string]: progress }}>
          <span className="dobj-fill__liquid" />
        </span>
      );
    case 'sun':
      return (
        <span className="dobj-date">
          <span>Due</span>
          <strong>14 Oct</strong>
        </span>
      );
  }
}

/**
 * An hourglass in the brand's glass (p. 16, 18): a clear 3D flask with a bright
 * rim and glints, glossy Ink caps, and the Noor light (Cobalt, violet, Ember)
 * as the sand. The top bulb holds the time left, the bottom the time gone;
 * glowing grains keep falling through the neck.
 */
function Hourglass({ progress, daysLeft }: { progress: number; daysLeft: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(progress));
    return () => cancelAnimationFrame(t);
  }, [progress]);
  const glass = 'M18 15 C18 42 37 51 37 60 C37 69 18 78 18 105 L62 105 C62 78 43 69 43 60 C43 51 62 42 62 15 Z';
  return (
    <div className={cx('dhour', daysLeft === 0 && 'is-empty')}>
      <svg viewBox="0 0 80 122" aria-hidden>
        <defs>
          <clipPath id="dhour-in">
            <path d={glass} />
          </clipPath>
          <linearGradient id="dhour-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b56e8" />
            <stop offset="45%" stopColor="#b35ad8" />
            <stop offset="100%" stopColor="#f0642c" />
          </linearGradient>
          <linearGradient id="dhour-heap" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0642c" />
            <stop offset="55%" stopColor="#b35ad8" />
            <stop offset="100%" stopColor="#3b56e8" />
          </linearGradient>
          <linearGradient id="dhour-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="dhour-cap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a505e" />
            <stop offset="45%" stopColor="#0e1116" />
            <stop offset="100%" stopColor="#2a2f3a" />
          </linearGradient>
          <linearGradient id="dhour-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e3bd6" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#e8501f" />
          </linearGradient>
          <radialGradient id="dhour-shadow">
            <stop offset="0%" stopColor="#b35ad8" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#e8501f" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#e8501f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Coloured light pooling under the glass. */}
        <ellipse cx="40" cy="114" rx="30" ry="5" fill="url(#dhour-shadow)" />

        {/* Back of the glass: a faint body and a soft outer edge. */}
        <path d={glass} className="dhour__body" />

        <g clipPath="url(#dhour-in)" className="dhour__light">
          {/* Top bulb, 15–60, scaled to the time left; a lit surface on top. */}
          <g className="dhour__top" style={{ transform: `scaleY(${1 - shown})` }}>
            <rect x="0" y="15" width="80" height="45" fill="url(#dhour-sand)" />
            <ellipse cx="40" cy="15" rx="24" ry="2.5" className="dhour__surface" />
          </g>
          {/* Bottom bulb: a heap from the floor, scaled to the time gone. */}
          <path className="dhour__bottom" d="M0 105 L0 90 Q40 66 80 90 L80 105 Z" fill="url(#dhour-heap)" style={{ transform: `scaleY(${shown})` }} />
          {daysLeft > 0 && (
            <g className="dhour__grains">
              <circle cx="40" cy="60" r="1.1" />
              <circle cx="40" cy="60" r="0.9" />
              <circle cx="40" cy="60" r="1" />
            </g>
          )}
        </g>

        {/* Front of the glass: the tint, the coloured light caught in its
            edges (Cobalt left, Ember right, as on the brand's glass), the rim
            and the glints. */}
        <path d={glass} fill="url(#dhour-glass)" />
        <path d={glass} className="dhour__edge" clipPath="url(#dhour-in)" />
        <path d={glass} className="dhour__rim" />
        <path d="M22.5 20 C22.5 36 30 45 34 51" className="dhour__glint" />
        <path d="M34 69 C29 75 22.5 86 22.5 100" className="dhour__glint" />
        <path d="M58 22 C57 33 52 41 47 47" className="dhour__glint dhour__glint--soft" />
        <path d="M47 73 C52 79 57 88 58 99" className="dhour__glint dhour__glint--soft" />

        {/* Glossy Ink caps, seen slightly from above. */}
        <rect x="9" y="7" width="62" height="9" rx="4.5" fill="url(#dhour-cap)" />
        <rect x="14" y="8.2" width="40" height="1.6" rx="0.8" className="dhour__capshine" />
        <rect x="9" y="104" width="62" height="9" rx="4.5" fill="url(#dhour-cap)" />
        <rect x="14" y="105.2" width="40" height="1.6" rx="0.8" className="dhour__capshine" />
      </svg>
    </div>
  );
}

function DecisionCard({ variant, daysLeft }: { variant: VariantId; daysLeft: number }) {
  const progress = (TOTAL_DAYS - daysLeft) / TOTAL_DAYS;
  // The hourglass has no number, so its label says how long is left.
  const left = daysLeft === 0 ? 'Due today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`;
  return (
    <section className={cx('dcard', `dcard--${variant}`, daysLeft <= 1 && 'is-urgent')}>
      <div className="dcard__eyebrow">{variant === 'sand' ? left : daysLeft === 0 ? 'Due today' : `Due Wed 14 Oct · ${left}`}</div>
      <div className="dcard__top">
        <div className="dcard__text">
          <div className="dcard__total">AED 186,000</div>
          <div className="dcard__meta">Waiting for your decision</div>
        </div>
        {variant === 'sand' ? (
          <Hourglass progress={progress} daysLeft={daysLeft} />
        ) : variant === 'fillsand' ? (
          <DeadlineHourglass progress={progress} daysLeft={daysLeft} />
        ) : (
          <Ring progress={progress} daysLeft={daysLeft} noor={variant === 'sun'} mode={variant === 'count' ? 'segments' : variant === 'timer' ? 'remaining' : 'elapsed'}>
            <Obj variant={variant} progress={progress} daysLeft={daysLeft} />
          </Ring>
        )}
      </div>
      <div className="decision__btns">
        <Button variant="primary" size="lg">
          Approve proposal
        </Button>
        <div className="decision__row">
          <Button>Request changes</Button>
          <Button>Decline</Button>
        </div>
      </div>
    </section>
  );
}

export function DecisionDemo() {
  const [daysLeft, setDaysLeft] = useState(3);
  return (
    <div className="cdemo decdemo">
      <PageHeader
        title="Decision card"
        sub="The card where the client approves a proposal, after the tennis reference: an object in a ring that fills as the deadline nears. Six objects in place of the ball."
      />
      <label className="decdemo__slider">
        <span>Days left</span>
        <input type="range" min={0} max={TOTAL_DAYS} value={daysLeft} onChange={(e) => setDaysLeft(Number(e.target.value))} />
        <strong>{daysLeft === 0 ? 'Due today' : `${daysLeft} of ${TOTAL_DAYS}`}</strong>
      </label>
      <div className="decdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="decdemo__stage">
              <DecisionCard variant={v.id} daysLeft={daysLeft} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
