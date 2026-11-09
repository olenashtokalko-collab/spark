// Prototype-only page (#/demo/status-glass): request statuses as glass after the brand book's key visuals (9 Nov):
// the pyramid's candy glass, the chat bubbles, the frosted tile with colour inside. Same colours as today (Ember
// waits on the client, Cobalt is with Spark, Ink is done, grey is out of play), now in the glass.
import { cx } from '../../components/ui/primitives';
import { RequestStatus, requestStatusMeta } from '../../components/domain';
import type { RequestStatus as Status } from '../../data/types';

const STATUSES = Object.keys(requestStatusMeta) as Status[];

const LOOKS = [
  { v: 'candy', label: 'A · Candy glass', note: 'After the brand pyramid: the pill is glass of the status’s colour, see-through, a bright rim, a gloss along the top, the lower edge lit. Ink words.' },
  { v: 'bead', label: 'B · Clear bubble, glass bead', note: 'After the chat bubbles and the switch’s knob: a clear glass bubble, the colour in a small candy bead with its own highlight.' },
  { v: 'inside', label: 'C · Colour inside the frost', note: 'After the mail tile: frosted glass with the status’s colour glowing inside it from the left, crisp rim.' },
  {
    v: 'bubble',
    label: 'D · Soap bubble',
    note: 'Nearly clear, as the brand book’s bubbles: a faint tint, a rim of the status’s colour that turns to white where the light hits, a bright highlight at the top left, the page showing through.',
  },
  {
    v: 'jelly',
    label: 'E · Jelly, 3D',
    note: 'A thick, see-through capsule of the status’s colour: a gloss across the top like a lens, light pooling in its lower half, a darker edge underneath. The most 3D.',
  },
  {
    v: 'orb',
    label: 'F · Clear capsule, glass orb',
    note: 'Clear frosted glass with a small 3D orb of the status’s colour inside; the orb throws its colour into the glass round it.',
  },
  {
    v: 'lit',
    label: 'G · Lit from below',
    note: 'As Dr.AI’s window and the brand book’s glass tiles: clear frosted glass, the status’s colour as light along its lower edge and glowing on the page under it.',
  },
  {
    v: 'liquid',
    label: 'H · Liquid glass',
    note: 'Very clear, thick glass that bends the light: a white edge where the light enters at the top left, the status’s colour caught in the edge at the bottom right, a faint tint.',
  },
  {
    v: 'pearl',
    label: 'I · Pearl',
    note: 'A pearly white pill with a sheen of the status’s colour drifting into Corniche Haze across it, as the glass objects in the book catch more than one colour.',
  },
  {
    v: 'fade',
    label: 'J · Colour fading into glass',
    note: 'The status’s colour deep at the left and clearing into glass at the right, a gloss on top: the colour reads first, the word stays on clear glass.',
  },
  {
    v: 'emoji',
    label: 'K · Glass capsule with an emoji',
    note: 'As F, with an emoji for the status in a clear glass bubble in place of the orb, its colour glowing round it: a face for each step.',
  },
  {
    v: 'slab',
    label: 'L · Frosted slab',
    note: 'After the brand book’s glass objects: thick satin glass, no shine, the colour deep in one corner and clearing across it; its edge shows under the face as the slab’s side.',
  },
  {
    v: 'wash',
    label: 'M · Clear tile, colour wash',
    note: 'As the clear tiles in the book: frosted, nearly colourless glass with a soft wash of the status’s colour inside at the lower left, a bright bevelled edge, a soft shadow.',
  },
  {
    v: 'spectrum',
    label: 'N · Spectrum slab',
    note: 'As the big slabs in the book: satin glass with the colour flowing through it, Cobalt into Haze for Spark’s steps, Ember into a warm peach for yours, Ink into Cobalt when done; a thick lit edge.',
  },
  {
    v: 'edge',
    label: 'O · Colour in the edge',
    note: 'After the book’s Cobalt glass: the colour gathers deep in the thick rounded edge, the middle clears to frosted glass, a white glint where the light enters.',
  },
  {
    v: 'satin',
    label: 'P · Satin colour block',
    note: 'After the book’s Ember cube: matte glass of the full colour, a soft light inside its upper half, a lighter rim. White words; the boldest.',
  },
  {
    v: 'layer',
    label: 'Q · Glass over colour',
    note: 'After the book’s overlapping pieces: a block of the status’s colour behind, a clear frosted pill laid over it, the colour blurred through the glass.',
  },
  {
    v: 'through',
    label: 'R · Colour seen through the glass',
    note: 'As Q with nothing showing outside the pill: the colour deep at its left end, top to bottom, flowing on along the lower edge and just showing again in the lower right corner.',
  },
  {
    v: 'under',
    label: 'S · Q, the colour hidden under the glass',
    note: 'Q’s clear glass with the same strip of colour under its left end, blurred through the glass and melting into it, but cut at the pill’s edge: nothing shows outside.',
  },
  {
    v: 'glow',
    label: 'T · Clear pill, soft dot',
    note: 'As C with a clear ground: the pill is only its glass rim, and the colour is a small soft, blurred dot of light at its front. Delivered in green.',
  },
  {
    v: 'base',
    label: 'U · Glass on a coloured base',
    note: 'L’s slab with Q’s glass: a solid strip of the status’s colour along the foot, 3px of it showing under the pill as a solid underline and the rest glowing up through the lower edge of Q’s clear frosted glass.',
  },
] as const;

/** K's emoji, one per status. */
const EMOJI: Record<Status, string> = {
  submitted: '⭐',
  in_review: '👀',
  proposal: '🎁',
  changes_requested: '✏️',
  approved: '✅',
  in_progress: '⏳',
  delivered: '📦',
  declined: '🚫',
};

function GlassStatus({ status, look }: { status: Status; look: string }) {
  return (
    <span className={cx('sg', `sg--${look}`, `sg-s--${status}`)}>
      {(look === 'bead' || look === 'orb') && <i className="sg-bead" />}
      {look === 'emoji' && <i className="sg-emoji">{EMOJI[status] ?? '•'}</i>}
      {look === 'layer' && <i className="sg-layer" aria-hidden />}
      {look === 'under' && <i className="sg-under" aria-hidden />}
      {look === 'base' && <i className="sg-base" aria-hidden />}
      {requestStatusMeta[status].label}
    </span>
  );
}

export function StatusGlassDemo() {
  return (
    <div className="dl-page sg-page">
      <header className="dl-head">
        <h1>Statuses · glass</h1>
        <p>Request statuses as glass from the brand book. Same colours and meanings as today. Prototype only.</p>
      </header>
      <section className="dl-tile">
        <span className="dl-tile__label">Now</span>
        <div className="sg-row">
          {STATUSES.map((s) => (
            <RequestStatus key={s} status={s} />
          ))}
        </div>
      </section>
      {LOOKS.map((l) => (
        <section key={l.v} className="dl-tile">
          <span className="dl-tile__label">{l.label}</span>
          <p className="dl-tile__note">{l.note}</p>
          <div className="sg-row">
            {STATUSES.map((s) => (
              <GlassStatus key={s} status={s} look={l.v} />
            ))}
          </div>
          {/* In a table, as on Requests */}
          <div className="sg-table">
            {(['proposal', 'in_review', 'delivered'] as Status[]).map((s, i) => (
              <div key={s} className="sg-tr">
                <span>{['Riyadh launch campaign', 'What do people say about our brand?', 'Ramadan 2027 packaging'][i]}</span>
                <span className="sg-faint">{['Creative', 'Research', 'Creative'][i]}</span>
                <GlassStatus status={s} look={l.v} />
                <span className="sg-faint">{['14 Oct', '2 Oct', '28 Sep'][i]}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
