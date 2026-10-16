// Prototype-only page (#/demo/outcomes): the decision card when the answer was "No" or "Not yet", built
// exactly like Approved: the amount, the state word, the tile in its ring, with the same one-time animation
// (the tile acts, circles go out, the ring closes and lets go). Only the word, the glyph and the colour change.
//   Declined           a thumb turned down, in the status colour (red)
//   Changes requested  a pen, in the violet and pink of the spectrum
// For each: the plain card it replaces, the new card, the new card with the note the client left, and for
// Declined a quieter option without the animation.
import { Avatar, PageHeader, cx } from '../../components/ui/primitives';
import { personById, useStore } from '../../state/store';
import { StateRing, StateTile, type TileGlyph, type TileTone } from '../../components/ui/StateTile';
import { useState } from 'react';

type Kind = 'declined' | 'changes';
type Look = 'now' | 'new' | 'note' | 'still';

const KIND: Record<Kind, { word: string; eyebrow: string; glyph: TileGlyph; tone: TileTone; note: string; reason?: string }> = {
  declined: { word: 'Declined', eyebrow: 'Decided 13 Oct', glyph: 'thumb-down', tone: 'red', note: 'The budget moved to Q1; we will come back with a smaller scope.', reason: 'budget' },
  changes: { word: 'Changes requested', eyebrow: 'Decided 13 Oct', glyph: 'pen', tone: 'cobalt', note: 'Please split the investment by phase and shorten the timeline to 6 weeks.' },
};

const NAMES: Record<Look, string> = {
  now: 'Now · the plain card',
  new: 'New · the same as Approved',
  note: 'New + the client’s note',
  still: 'Quieter · the tile only',
};

function Who({ kind }: { kind: Kind }) {
  const { state } = useStore();
  const p = personById(state, 'u-layla');
  const k = KIND[kind];
  return (
    <div className="decision__done">
      <Avatar person={p} size={22} />
      <div className="decision__done-body">
        <div className="decision__what">
          {k.word} by {p.name}
          {k.reason && <> ({k.reason})</>}
        </div>
        <p className="decision__quote">“{k.note}”</p>
        <div className="decision__when">13 Oct 2026, 10:20</div>
      </div>
    </div>
  );
}

function Card({ kind, look }: { kind: Kind; look: Look }) {
  const k = KIND[kind];
  if (look === 'now')
    return (
      <section className="decision">
        <div className="decision__head">
          <div className="decision__total">AED 186,000</div>
        </div>
        <div className="decision__meta">10 weeks · starts Mon 2 Nov</div>
        <Who kind={kind} />
      </section>
    );
  return (
    <section className={cx('decision', 'decision--timed', `oc--${kind}`)}>
      <div className="decision__eyebrow">
        <span>{k.eyebrow}</span>
      </div>
      <div className="decision__timed">
        <div>
          <div className="decision__total">AED 186,000</div>
          <div className="decision__meta decision__meta--ok">{k.word}</div>
        </div>
        {look === 'still' ? <StateTile glyph={k.glyph} tone={k.tone} size={46} /> : <StateRing used={1} glyph={k.glyph} tone={k.tone} celebrate quiet />}
      </div>
      {look === 'note' && <p className="oc__quote">“{k.note}”</p>}
    </section>
  );
}

export function OutcomesDemo() {
  const [n, setN] = useState(0);
  const sets: { kind: Kind; title: string; note: string; looks: Look[] }[] = [
    { kind: 'declined', title: '1 · Declined', note: 'The thumb turns down, in the Declined status colour, so the card matches the chip in the list. The circles that go out are red and the ring lets go the same way. The quieter option drops the motion: a refusal does not need a flourish.', looks: ['now', 'new', 'note', 'still'] },
    { kind: 'changes', title: '2 · Changes requested', note: 'The pen writes once, on a blue tile; the card keeps Approved’s form, only the word and the glyph change.', looks: ['now', 'new', 'note'] },
  ];
  return (
    <div className="cdemo ocdemo">
      <PageHeader
        title="Declined and changes requested"
        sub="Built exactly like Approved: the amount, the state word, the tile in its ring and the same one-time animation. Only the word, the glyph and the colour change. Nothing here is applied to the app."
      />
      {sets.map((set) => (
        <section key={set.kind} className="gdemo__card oc">
          <header>
            <h3>{set.title}</h3>
            <p>{set.note}</p>
          </header>
          <div className="oc__row">
            {set.looks.map((l) => (
              <div key={l} className="oc__col">
                <div className={cx('ck-tag', l !== 'now' && 'is-now')}>{NAMES[l]}</div>
                <div key={n} className="proposal__side oc__side">
                  <Card kind={set.kind} look={l} />
                </div>
              </div>
            ))}
          </div>
          <button className="link-btn oc__replay" onClick={() => setN((v) => v + 1)}>
            Replay animation
          </button>
        </section>
      ))}
    </div>
  );
}
