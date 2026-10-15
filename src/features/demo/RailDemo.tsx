// Prototype-only page (#/demo/rail): looks for the marker on the proposal
// contents rail, after the app icon: the white four-point spark on a Cobalt
// to Ember light. Same rail and rows as the live one; click the items.
import { useRef, useState } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';

const ITEMS = ['Summary', 'Objectives', 'Scope & deliverables', 'Timeline', 'Investment', 'Terms', 'Comments'];

const VARIANTS = [
  { id: 'ink', name: '1 · Today', note: 'The Ink bar that stretches to the section in view. The reference point.' },
  { id: 'spectrum', name: '2 · Glass tube', note: 'After the glass slider in the brand file: a clear glass tube, the Noor light (Cobalt melting into Ember) glowing inside at the section in view. Now on the proposal page.' },
  { id: 'spark', name: '3 · Spark', note: 'The icon’s spark rides the rail: white, on a small Cobalt-to-Ember glow. It turns a quarter as it moves.' },
  { id: 'trail', name: '4 · Spark with a trail', note: 'The spark leaves a short streak of light on the rail behind it, which fades once it settles.' },
  { id: 'dots', name: '5 · Spots', note: 'The rail is a line of dots, like the Doto numbers. The dots by the section in view light up, Cobalt to Ember.' },
  { id: 'glow', name: '6 · Noor spot', note: 'A soft blurred spot of the icon’s colours slides along the rail, with a thin white bar at its core.' },
] as const;

type VariantId = (typeof VARIANTS)[number]['id'];

function Spark() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="rmk__spark">
      <path d="M50 4 C53 34 66 47 96 50 C66 53 53 66 50 96 C47 66 34 53 4 50 C34 47 47 34 50 4 Z" fill="currentColor" />
    </svg>
  );
}

function Rail({ variant }: { variant: VariantId }) {
  const [active, setActive] = useState(2);
  const prev = useRef(2);
  const [move, setMove] = useState({ from: 2, to: 2, n: 0 });

  const pick = (i: number) => {
    if (i === active) return;
    setMove((m) => ({ from: prev.current, to: i, n: m.n + 1 }));
    prev.current = i;
    setActive(i);
  };
  const dir = move.to >= move.from ? 'down' : 'up';

  return (
    <nav
      className={cx('rdemo', `rdemo--${variant}`, `rdemo--${dir}`)}
      style={{ ['--i' as string]: active, ['--n' as string]: ITEMS.length }}
      aria-label="Proposal sections"
    >
      <span className="rdemo__track" />
      {variant === 'trail' && move.n > 0 && (
        <span
          key={move.n}
          className={cx('rmk__trail', `rmk__trail--${dir}`)}
          style={{ ['--a' as string]: Math.min(move.from, move.to), ['--b' as string]: Math.max(move.from, move.to) }}
        />
      )}
      <span className="rmk">{(variant === 'spark' || variant === 'trail' || variant === 'dots') && <Spark />}</span>
      {ITEMS.map((label, i) => (
        <a
          key={label}
          href="#"
          className={cx('rdemo__item', i === active && 'is-active')}
          onClick={(e) => {
            e.preventDefault();
            pick(i);
          }}
        >
          {label}
          {label === 'Comments' && <span className="ptoc__count">2</span>}
        </a>
      ))}
    </nav>
  );
}

export function RailDemo() {
  return (
    <div className="cdemo raildemo">
      <PageHeader title="Contents marker" sub="Six markers for the proposal contents rail, after the app icon: the white spark on a Cobalt-to-Ember light. Click the items to see them move." />
      <div className="tocdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="tocdemo__stage">
              <Rail variant={v.id} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
