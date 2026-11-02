// Prototype-only page (#/demo/bubble-buttons): new looks for the portal's buttons, each read from the brand book.
// Every control follows one recipe: a frosted glass body, the spectrum underneath, Ink or white on top (p. 36);
// Ink objects carry the spark, glass objects carry the light (p. 38); the series' pills and drops (p. 40).
// Each look shows the same set: the main action, a quiet one, Ask Spark and two icon buttons, on a field of light
// that drifts behind them so the glass shows what it lets through. The light inside follows the pointer.
import { useState, type PointerEvent, type ReactNode } from 'react';
import { ArrowUp, Paperclip, Plus } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { BrandSpark } from '../../components/ui/BrandSpark';

const LOOKS = [
  {
    v: 'recipe',
    label: 'A · The recipe',
    book: 'p. 36 · Frosted glass body, spectrum underneath, Ink on top',
    note: 'White frost with a bright rim; the spectrum lies blurred under the button, not in it. On hover the light under it rises.',
  },
  {
    v: 'bubble',
    label: 'B · Bubble',
    book: 'p. 36 tiles · p. 40 “Make it brighter”',
    note: 'Clear, convex glass with almost no white: a highlight across the top, a glow along the bottom, the ground bent and sharpened through it. Swells a touch on hover, gives on press.',
  },
  {
    v: 'lens',
    label: 'C · Ink with a lens',
    book: 'p. 38 · Ink objects carry the spark · p. 36 the switch',
    note: 'The main action in Ink; the spark sits in a clear glass lens at its end, as the knob of the brand’s switch. The quiet buttons are bubbles.',
  },
  {
    v: 'ink',
    label: 'C2 · Ink, no lens',
    book: 'p. 38 · Ink objects carry the spark',
    note: 'As C, without the lens: the spark sits bare in Ember on the Ink. No light under any button and no swelling on hover: Ink lifts a shade, the glass turns a touch whiter, the spark turns.',
  },
  {
    v: 'drop',
    label: 'D · Liquid drop',
    book: 'p. 40 · “Switch on the spark”',
    note: 'Glass with a drop of the spectrum inside that follows the pointer and gathers under it; pressed, the drop spreads and the glass squeezes.',
  },
  {
    v: 'key',
    label: 'E · Thick glass keys',
    book: 'p. 36 · the glass keys, bottom right',
    note: 'Thicker glass with depth: an edge that catches the light and colour deep inside, Cobalt for things you do, Ember for Spark. For icon buttons above all.',
  },
  {
    v: 'tint',
    label: 'F · Tinted by the light',
    book: 'p. 39 · Cobalt for human, Ember for AI · p. 31 never a flat fill',
    note: 'The colour comes from the light under the glass, never as a fill: Cobalt under the main action, Ember under Ask Spark. The words stay Ink.',
  },
] as const;

type Look = (typeof LOOKS)[number]['v'];

/** A button whose inner light follows the pointer (--mx, --my). */
function Bub({ className, children, title }: { className?: string; children: ReactNode; title?: string }) {
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <button type="button" className={cx('bbd-b', className)} onPointerMove={move} aria-label={title} title={title}>
      {/* The light (under the glass, or in it), the glass itself, then the words. */}
      <span className="bbd-b__light" aria-hidden />
      <span className="bbd-b__glass" aria-hidden />
      <span className="bbd-b__in">{children}</span>
    </button>
  );
}

function Set({ look }: { look: Look }) {
  return (
    <div className={cx('bbd-set', `bbd--${look}`)}>
      <Bub className="bbd-b--main">
        Request proposal
        {look === 'lens' && (
          <span className="bbd-lens" aria-hidden>
            <BrandSpark size={12} />
          </span>
        )}
        {look === 'ink' && (
          <span className="bbd-bare" aria-hidden>
            <BrandSpark size={13} />
          </span>
        )}
      </Bub>
      <Bub className="bbd-b--quiet">Later</Bub>
      <Bub className="bbd-b--ask">
        <BrandSpark size={14} />
        Ask Spark
      </Bub>
      <Bub className="bbd-b--icon" title="Attach">
        <Paperclip size={16} strokeWidth={1.6} />
      </Bub>
      <Bub className="bbd-b--icon bbd-b--send" title="Send">
        <ArrowUp size={16} strokeWidth={1.8} />
      </Bub>
    </div>
  );
}

export function BubbleButtonsDemo() {
  const [ground, setGround] = useState<'field' | 'card'>('field');
  const [still, setStill] = useState(false);
  return (
    <div className="cdemo">
      <PageHeader
        title="Buttons · glass and bubbles"
        sub="New looks for the buttons, each from the brand book. The light behind drifts so you can see what the glass lets through; hover and press them. Prototype only."
      />
      <div className="bbd-bar">
        <div className="fdm-switch">
          <button className={cx(ground === 'field' && 'is-on')} onClick={() => setGround('field')}>
            On the field of light
          </button>
          <button className={cx(ground === 'card' && 'is-on')} onClick={() => setGround('card')}>
            On a glass card
          </button>
        </div>
        <div className="fdm-switch">
          <button className={cx(!still && 'is-on')} onClick={() => setStill(false)}>
            Light drifts
          </button>
          <button className={cx(still && 'is-on')} onClick={() => setStill(true)}>
            Light still
          </button>
        </div>
      </div>
      <div className="bbd-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="bbd-col">
            <span className="gk-label">{l.label}</span>
            <div className={cx('bbd-stage', still && 'is-still', ground === 'card' && 'bbd-stage--card')}>
              <span className="bbd-blob bbd-blob--a" aria-hidden />
              <span className="bbd-blob bbd-blob--b" aria-hidden />
              <span className="bbd-blob bbd-blob--c" aria-hidden />
              <div className="bbd-surface">
                <Set look={l.v} />
              </div>
            </div>
            <p className="bbd-book">{l.book}</p>
            <p className="bbd-note">{l.note}</p>
          </section>
        ))}
      </div>
      <section className="bbd-col bbd-big">
        <span className="gk-label">Up close · B, the bubble, in the chat box</span>
        <div className={cx('bbd-stage bbd-stage--big', still && 'is-still')}>
          <span className="bbd-blob bbd-blob--a" aria-hidden />
          <span className="bbd-blob bbd-blob--b" aria-hidden />
          <span className="bbd-blob bbd-blob--c" aria-hidden />
          <div className="bbd-box">
            <span className="bbd-box__ph">Ask anything about your brand…</span>
            <div className="bbd-box__row bbd--bubble">
              <Bub className="bbd-b--icon" title="Add">
                <Plus size={16} strokeWidth={1.6} />
              </Bub>
              <span className="bbd-box__sp" />
              <Bub className="bbd-b--icon bbd-b--send" title="Send">
                <ArrowUp size={16} strokeWidth={1.8} />
              </Bub>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
