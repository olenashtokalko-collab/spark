// Prototype-only page (#/demo/dock-looks): Dr.AI's window by the mascot and Sparki, four looks after the brand book's
// key visuals (9 Nov); Sparki comes with the mascot's clip: the brand pyramid's thick candy glass, the SPARK letter tiles, the glass objects (a frosted
// tile with the spectrum inside, a clear pill lit from below). Same content in each; only the material changes.
import { Minus } from 'lucide-react';
import { cx } from '../../components/ui/primitives';
import { Stepper } from '../onboarding/Onboarding';
import { MascotClip } from './MascotDemo';

const LOOKS = [
  {
    v: 'jelly',
    label: 'A · Jelly glass',
    note: 'After the brand pyramid: the window is a thick slab of candy glass, violet into blue, with a bright rim and light pooling at its lower edge. Ink text stays on it, as on the pyramid.',
  },
  {
    v: 'inside',
    label: 'B · Spectrum inside',
    note: 'After the mail tile: frosted glass with the spectrum deep inside it, blue on the left, Ember on the right, soft as if seen through the glass.',
  },
  {
    v: 'clear',
    label: 'C · Clear glass, lit from below',
    note: 'After the Spark pill: clear glass with a thick refracting rim, nearly no fill; the colour is the light it throws on the ground under it.',
  },
  {
    v: 'beads',
    label: 'D · Jelly steps',
    note: 'After the SPARK letter tiles: the window stays light; the four steps are candy-glass tiles, blue, violet, magenta and Ember, lit when done, clear while to come.',
  },
  {
    v: 'rim',
    label: 'E · Clear rim, one line',
    note: 'As the next-step highlight: the window’s rim is clear glass that takes the ground’s colour, one bright line on its outer edge, a frosted body for the text, a thin line of light under it. Sparki’s bubble in the same glass.',
  },
] as const;

const DONE = [true, false, false, false];

function Beads() {
  const tones = ['blue', 'violet', 'magenta', 'ember'];
  return (
    <span className="dl-beads" aria-label="1 of 4 steps done">
      {tones.map((t, i) => (
        <i key={t} className={cx(`dl-bead dl-bead--${t}`, DONE[i] && 'is-done', i === 1 && 'is-now')}>
          {i + 1}
        </i>
      ))}
    </span>
  );
}

function Window({ look }: { look: string }) {
  return (
    <div className="dk dk--corner dl-scene">
      <div className={cx('dk-card dl-card', `dl-card--${look}`)}>
        <header className="dk-card__head">
          <b>Getting started</b>
          <span className="dk-card__n">1/4</span>
          <span className="dk-card__sp" />
          <button type="button" className="dk-fold" aria-label="Fold">
            <Minus size={15} />
          </button>
        </header>
        {look === 'beads' ? <Beads /> : <Stepper done={DONE} current={1} />}
        <p className="dk-msg">
          Now your <span className="dk-hl">first request</span>: press Request proposal under my answer, and Spark sends a proposal within two days.
        </p>
        <span className="dk-acts is-in">
          <button type="button" className="dk-btn dk-btn--primary">
            Show me
          </button>
          <button type="button" className="dk-btn dk-btn--ask">
            Ask me
          </button>
        </span>
      </div>
      {look === 'rim' && (
        <span className="dl-say">
          <span className="og-say dl-say__b" style={{ ['--n' as string]: 21 }}>
            <i className="og-say__dot" />
            <span className="og-say__text">Type here, press Enter</span>
          </span>
        </span>
      )}
      <span className="dl-fig">
        <MascotClip state="idle" width={150} className="dk-fig" />
      </span>
    </div>
  );
}

export function DockLooksDemo() {
  return (
    <div className="dl-page">
      <header className="dl-head">
        <h1>Dr.AI’s window · looks</h1>
        <p>Four materials from the brand book’s key visuals for the window by the mascot and Sparki. Same content in each. Prototype only.</p>
      </header>
      <div className="dl-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="dl-tile">
            <span className="dl-tile__label">{l.label}</span>
            <p className="dl-tile__note">{l.note}</p>
            <Window look={l.v} />
          </section>
        ))}
      </div>
    </div>
  );
}
