// Prototype-only page (#/demo/slab-buttons): every kind of button the portal has, in three looks after the client's
// glass reference (frosted slabs and tiles with the spectrum inside, thick edges that catch the light) and the
// brand book's glass keys (p. 36). One set per look: the actions (primary, secondary, text, danger), Spark's
// (Ask Spark, Send), the icon buttons and the follow-up chips. No swelling on hover: the colour inside wakes up;
// pressed, the slab sinks into its edge.
import { useState } from 'react';
import { ArrowRight, ArrowUp, ChevronLeft, ChevronRight, Download, MoreHorizontal, Paperclip, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { BrandSpark } from '../../components/ui/BrandSpark';

const LOOKS = [
  {
    v: 'tile',
    label: 'A · Frosted tiles',
    ref: 'Reference, bottom right · p. 36 the glass keys',
    note: 'Clear frosted tiles with a thick bright edge; the spectrum glows in their corners, strongest in the main action, a breath in the quiet ones. Ink words throughout.',
  },
  {
    v: 'jelly',
    label: 'B · Coloured jelly',
    ref: 'Reference, top right',
    note: 'The colour is the glass: Cobalt into magenta for the main action, Ember for Spark, pale clear jelly for the rest. White words on the deep ones, a lit edge and a coloured shadow under each.',
  },
  {
    v: 'pastel',
    label: 'C · Pastel frost',
    ref: 'Reference, left',
    note: 'Matte, soft-edged slabs in pastel washes of the spectrum: sky to pink to peach. Calm and light; Ink words, the colour telling the kinds apart.',
  },
  {
    v: 'ends',
    label: 'D · Light at the ends',
    ref: 'Ask Spark, the search field and the pager as they are · p. 36',
    note: 'A white frosted pill in a thick clear rim; the light bends at its ends, Cobalt at the left, Ember at the right. The main action and Send lit strongest, the quiet ones a breath.',
    lit: true,
  },
  {
    v: 'clear',
    label: 'E · Clear at the sides',
    ref: 'Ask Spark as it is, more glass',
    note: 'White only in the middle; towards the ends the pill turns clear and the ground shows through, the Cobalt and Ember running further in along the rim.',
    lit: true,
  },
  {
    v: 'ring',
    label: 'F · Spectrum ring and halo',
    ref: 'The pager as it is · p. 36 the switch',
    note: 'Clear glass inside a thin ring of the whole spectrum, Cobalt through violet and pink to Ember, and a halo of frost round it, as the round arrows.',
    lit: true,
  },
  {
    v: 'bubside',
    label: 'H · A clear bubble in a coloured rim',
    ref: 'The pager’s arrows as they are',
    note: 'Inside, clear convex glass with no colour of its own, the ground showing through: a highlight on top, a glow at its foot. Round it a thin rim running smoothly from Cobalt at the left to Ember at the right, and a halo of frost outside.',
    lit: true,
  },
  {
    v: 'tinted',
    label: 'G · Tinted glass, clear edges',
    ref: 'The reference’s coloured tiles, on the pill',
    note: 'The spectrum washed through the whole glass, Cobalt to Ember, frosted in the middle and clear at the edges; a lit rim. More colour, still glass.',
    lit: true,
  },
  {
    v: 'soft',
    label: 'I · Soft glass on Sand',
    ref: 'Reference “Buy Premium”',
    note: 'Calm frosted glass: a fine bright rim, the ends a shade deeper where the glass bends, light gathering at the foot. A breath of Cobalt at the left end and Ember at the right; the main action a touch more. Ink words.',
    stage: 'soft',
  },
  {
    v: 'lens',
    label: 'J · Clear lens on Ink',
    ref: 'Reference “Button” · Ink bands (p. 40)',
    note: 'For Ink bands and dark mode: clear glass on Ink running into deep Cobalt, a hairline rim that brightens at the foot, light focused along the bottom inside. Silver words; Spark’s light Ember.',
    stage: 'ink',
  },
  {
    v: 'gloss',
    label: 'K · Tinted gloss on Cobalt',
    ref: 'Reference “Download Now” · Cobalt bands (p. 40)',
    note: 'Glass tinted by the Cobalt under it, a gloss across the top half, a bright rim catching the light at the right end. White words; a split button for files, the icon apart.',
    stage: 'cobalt',
  },
  {
    v: 'caustic',
    label: 'L · Lens with the spectrum in it',
    ref: 'Reference “Button”, on Sand, with our light',
    note: 'The clear lens of J on Sand: the ends darker where the glass bends, and the light it focuses along the bottom inside is the spectrum, Cobalt into Ember. Ink words.',
    stage: 'soft',
  },
] as const;

function Set({ look, field, split }: { look: string; field?: boolean; split?: boolean }) {
  return (
    <div className={cx('rsd-set', `rsd--${look}`)}>
      {field && (
        <div className="rsd-group rsd-group--wide">
          <span className="rsd-cap">Field</span>
          <div className="rsd-b rsd-b--field">
            <Search size={16} strokeWidth={1.8} />
            <span>Ask Spark about your brand, a campaign or a market</span>
          </div>
        </div>
      )}
      <div className="rsd-group">
        <span className="rsd-cap">Actions</span>
        <div className="rsd-row">
          <button type="button" className="rsd-b rsd-b--primary">New request</button>
          <button type="button" className="rsd-b rsd-b--secondary">Cancel</button>
          <button type="button" className="rsd-b rsd-b--text">
            All files <ArrowRight size={14} strokeWidth={1.8} />
          </button>
          <button type="button" className="rsd-b rsd-b--danger">
            <Trash2 size={14} strokeWidth={1.8} /> Delete
          </button>
        </div>
      </div>
      <div className="rsd-group">
        <span className="rsd-cap">Spark</span>
        <div className="rsd-row">
          <button type="button" className="rsd-b rsd-b--ask">
            <BrandSpark size={14} /> Ask Spark
          </button>
          <button type="button" className="rsd-b rsd-b--send rsd-b--icon" aria-label="Send" title="Send">
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="rsd-group">
        <span className="rsd-cap">Icons</span>
        <div className="rsd-row">
          <button type="button" className="rsd-b rsd-b--icon" aria-label="Add" title="Add">
            <Plus size={16} strokeWidth={1.8} />
          </button>
          <button type="button" className="rsd-b rsd-b--icon" aria-label="Attach" title="Attach">
            <Paperclip size={16} strokeWidth={1.8} />
          </button>
          <button type="button" className="rsd-b rsd-b--icon" aria-label="More" title="More">
            <MoreHorizontal size={16} strokeWidth={1.8} />
          </button>
          <button type="button" className="rsd-b rsd-b--icon rsd-b--sm" aria-label="Previous" title="Previous">
            <ChevronLeft size={15} strokeWidth={1.8} />
          </button>
          <button type="button" className="rsd-b rsd-b--icon rsd-b--sm" aria-label="Next" title="Next">
            <ChevronRight size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
      {split && (
        <div className="rsd-group">
          <span className="rsd-cap">Split</span>
          <div className="rsd-row">
            <button type="button" className="rsd-b rsd-b--primary rsd-b--split">
              <span className="rsd-split__icon">
                <Download size={18} strokeWidth={1.6} />
              </span>
              <span className="rsd-split__text">
                <b>Download brief</b>
                <span>PDF · 1.6 MB</span>
              </span>
            </button>
          </div>
        </div>
      )}
      <div className="rsd-group">
        <span className="rsd-cap">Chips</span>
        <div className="rsd-row">
          <button type="button" className="rsd-b rsd-b--chip">What would it cost?</button>
          <button type="button" className="rsd-b rsd-b--chip">Show me an example</button>
        </div>
      </div>
    </div>
  );
}

export function SlabButtonsDemo() {
  const [ground, setGround] = useState<'sand' | 'card'>('sand');
  return (
    <div className="cdemo">
      <PageHeader
        title="Buttons · glass slabs"
        sub="Every kind of button we have, in looks after the glass references: frosted tiles, coloured jelly, pastel frost, five in the lit-rim glass of Ask Spark and the pager, and four after the classic glass buttons (soft glass, clear lens, tinted gloss) in our colours. Hover and press them. Prototype only."
      />
      <div className="fdm-switch rsd-bar">
        <button className={cx(ground === 'sand' && 'is-on')} onClick={() => setGround('sand')}>
          On Sand
        </button>
        <button className={cx(ground === 'card' && 'is-on')} onClick={() => setGround('card')}>
          On a white card
        </button>
      </div>
      <div className="rsd-list">
        {LOOKS.map((l) => (
          <section key={l.v} className="rsd-col">
            <span className="gk-label">{l.label}</span>
            <div
              className={cx(
                'rsd-stage',
                'lit' in l && 'rsd-stage--light',
                'stage' in l && `rsd-stage--${l.stage}`,
                ground === 'card' && !('stage' in l && (l.stage === 'ink' || l.stage === 'cobalt')) && 'rsd-stage--card',
              )}
            >
              <div className="rsd-surface">
                <Set look={l.v} field={'lit' in l || 'stage' in l} split={'stage' in l} />
              </div>
            </div>
            <p className="bbd-book">{l.ref}</p>
            <p className="bbd-note">{l.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
