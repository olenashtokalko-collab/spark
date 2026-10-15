// Prototype-only page (#/demo/approved): looks for the proposal's decision card once it is
// APPROVED. While it waits, the card has an object in a time ring (the hourglass); once the
// client has approved, that moment should be marked with the same kind of motion, in the brand's
// own terms (Spark Studios brand book, see BRAND_GUIDELINES.md):
//   · "Ink objects carry the spark, glass objects carry the light" (p. 18)  · Noor only as glow and glass (p. 11)
//   · Cobalt = human, Ember = AI / the spark (p. 19)                        · Doto for numbers, mono for labels (p. 12)
//   · "Switch on the spark" toggle with the Ember knob (pp. 16, 20)         · viewfinder brackets with a mono tag (pp. 19–20)
//   · a row of small squares as a step marker (p. 19)                       · Human mind + AI power = Spark (p. 4)
//   · bands for statements (p. 20)                                          · coordinates and the spark sign (p. 19)
// Each card plays once; "Replay" plays it again. With reduced motion the end state is simply shown.
import { useState } from 'react';
import { Check, ThumbsUp } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { DeadlineHourglass } from '../../components/ui/DeadlineHourglass';

const SPARK = 'M50 4 C53 34 66 47 96 50 C66 53 53 66 50 96 C47 66 34 53 4 50 C34 47 47 34 50 4 Z';

function Spark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg className={cx('apd__spark', className)} width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d={SPARK} />
    </svg>
  );
}

const Facts = () => (
  <>
    <div className="apd__total">AED 96,000</div>
    <div className="apd__meta">8 weeks · starts 14 Sep</div>
  </>
);

const Who = () => (
  <div className="apd__who">
    <b>Approved by Layla Haddad</b>
    <span>“Looks great, let's go.”</span>
    <em>10 Sep 2026, 10:20</em>
  </div>
);

type Look = { id: string; name: string; note: string; ref: string; body: () => React.ReactNode };

const LOOKS: Look[] = [
  {
    id: 'glass',
    name: '1 · The same hourglass, now counting to kick-off',
    ref: 'The object you already have',
    note: 'The hourglass and its ring stay: the same object that counted the time to decide now counts the time to kick-off. A small Cobalt check lands on the ring. The least new, the most continuous.',
    body: () => (
      <div className="apd__card">
        <div className="apd__label">Approved · kick-off in 3 days</div>
        <div className="apd__row">
          <div>
            <Facts />
          </div>
          <div className="apd__obj">
            <DeadlineHourglass progress={0.4} daysLeft={3} />
            <span className="apd__badge">
              <Check size={12} strokeWidth={3} />
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ring',
    name: '2 · The ring closes, the spark lights',
    ref: 'p. 18 · Ink objects carry the spark',
    note: 'The time ring finishes its circle in Cobalt (the human’s decision), and the spark sign inside it lights from within with a soft Noor glow, then breathes slowly.',
    body: () => (
      <div className="apd__card">
        <div className="apd__label">Approved</div>
        <div className="apd__row">
          <div>
            <Facts />
          </div>
          <div className="apd__ring">
            <svg className="apd__ring-svg" viewBox="0 0 100 100" aria-hidden>
              <circle className="apd__ring-track" cx="50" cy="50" r="44" />
              <circle className="apd__ring-arc" cx="50" cy="50" r="44" />
            </svg>
            <span className="apd__glow" />
            <Spark size={34} className="apd__ignite" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'switch',
    name: '3 · Switch on the spark',
    ref: 'pp. 16, 20 · glass toggle, Ember knob',
    note: 'A glass pill whose track fills with the Cobalt to Ember spectrum as an Ember knob carrying the spark slides to “on”. Approving is literally switching the spark on.',
    body: () => (
      <div className="apd__card">
        <div className="apd__label">Spark is on</div>
        <div className="apd__row">
          <div>
            <Facts />
          </div>
          <div className="apd__toggle">
            <span className="apd__toggle-fill" />
            <span className="apd__knob">
              <Spark size={16} />
            </span>
          </div>
        </div>
        <Who />
      </div>
    ),
  },
  {
    id: 'seal',
    name: '4 · Glass seal',
    ref: 'p. 16 · icon tile: glass, spectrum inside, white glyph',
    note: 'The brand’s icon tile as a seal: a frosted glass squircle with the spectrum inside and a white check. It settles in and a highlight crosses it once, as light across glass.',
    body: () => (
      <div className="apd__card">
        <div className="apd__row apd__row--start">
          <span className="apd__seal">
            <Check size={26} strokeWidth={2.4} />
          </span>
          <div>
            <div className="apd__label">Approved</div>
            <Facts />
          </div>
        </div>
        <Who />
      </div>
    ),
  },
  {
    id: 'merge',
    name: '5 · Human + AI = Spark',
    ref: 'p. 4 · the brand formula',
    note: 'A Cobalt dot (you) and an Ember dot (Spark) come together and become the spark. The brand idea, as the moment of approval.',
    body: () => (
      <div className="apd__card">
        <div className="apd__label">Human mind · AI power</div>
        <div className="apd__merge" aria-hidden>
          <i className="apd__dot apd__dot--a" />
          <i className="apd__dot apd__dot--b" />
          <span className="apd__flash" />
          <Spark size={42} className="apd__born" />
        </div>
        <Facts />
        <Who />
      </div>
    ),
  },
  {
    id: 'glow',
    name: '6 · Noor underneath',
    ref: 'pp. 10–11, 16 · light as depth, Doto numbers',
    note: 'The card stays flat. Light rises under it (one glow, Cobalt to Ember) and then breathes. The amount is set in Doto, the brand’s number face.',
    body: () => (
      <div className="apd__card apd__card--glow">
        <div className="apd__label">Approved</div>
        <div className="apd__total apd__total--doto">96,000</div>
        <div className="apd__meta">AED · 8 weeks · starts 14 Sep</div>
        <Who />
      </div>
    ),
  },
  {
    id: 'finder',
    name: '7 · Viewfinder lock',
    ref: 'pp. 19–20 · corner brackets and a mono tag',
    note: 'Four brackets close in on the amount like a lens locking focus, and the tag changes from FOCUS to APPROVED with a single Ember blink.',
    body: () => (
      <div className="apd__card">
        <div className="apd__vf">
          <i className="apd__corner apd__corner--tl" />
          <i className="apd__corner apd__corner--tr" />
          <i className="apd__corner apd__corner--bl" />
          <i className="apd__corner apd__corner--br" />
          <div className="apd__tag">
            <span className="apd__tag-a">Focus 100%</span>
            <span className="apd__tag-b">
              <i className="apd__blink" />
              Approved · locked
            </span>
          </div>
          <Facts />
        </div>
        <Who />
      </div>
    ),
  },
  {
    id: 'steps',
    name: '8 · Squares fill up to Approved',
    ref: 'p. 19 · small coloured squares as a step marker',
    note: 'Six small squares for the six stages fill one after another in Cobalt, and the fourth, Approved, takes the glow. A quiet way to show where the request is now.',
    body: () => (
      <div className="apd__card">
        <div className="apd__label">Approved</div>
        <div className="apd__steps" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <i key={i} className={cx('apd__sq', i < 4 && 'is-on', i === 3 && 'is-now')} style={{ ['--k' as string]: i }} />
          ))}
          <span className="apd__count">
            04<em>/06</em>
          </span>
        </div>
        <Facts />
        <Who />
      </div>
    ),
  },
  {
    id: 'editorial',
    name: '9 · Editorial rows with the spark sign',
    ref: 'pp. 5, 18, 19 · hairline rows, Ember Doto index, coordinates',
    note: 'As a page of the book: a mono label with date and the Abu Dhabi coordinates, the spark sign popping into the corner, then rows on hairlines with Ember Doto numbers appearing one by one.',
    body: () => (
      <div className="apd__card apd__card--edit">
        <div className="apd__top">
          <span className="apd__label">Approved · 10 Sep 2026</span>
          <Spark size={18} className="apd__stamp" />
        </div>
        <div className="apd__coords">24.45° N 54.38° E</div>
        <ol className="apd__rows">
          {[
            ['01', 'Approved by', 'Layla Haddad'],
            ['02', 'Note', '“Looks great, let’s go.”'],
            ['03', 'Next', 'Kick-off with Spark · 13 Sep'],
          ].map(([n, k, v], i) => (
            <li key={n} style={{ ['--k' as string]: i }}>
              <b>{n}</b>
              <span>{k}</span>
              <em>{v}</em>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: 'band',
    name: '10 · Statement band',
    ref: 'p. 20 · bands for statements',
    note: 'The card becomes a Cobalt band with a two-line statement, and a band of light crosses it once. Strong and short: use it for the moment only, then it can settle into a flat card.',
    body: () => (
      <div className="apd__card apd__card--band">
        <div className="apd__label apd__label--on">Approved</div>
        <div className="apd__say">
          Approved.
          <br />
          Kick-off in 3 days.
        </div>
        <div className="apd__meta apd__meta--on">AED 96,000 · 8 weeks · by Layla Haddad, 10 Sep</div>
      </div>
    ),
  },
  {
    id: 'noor',
    name: '11 · Noor glass card',
    ref: 'pp. 11, 14, 16 · frosted glass holding spectral light, with grain',
    note: 'The gradient version, the brand’s way: not a flat gradient fill (the book forbids it) but light inside frosted glass. A Cobalt to Ember cloud drifts slowly under a milky surface with grain, and the facts sit on a glass plate over it.',
    body: () => (
      <div className="apd__card apd__card--noor">
        <span className="apd__cloud" aria-hidden />
        <div className="apd__noor-in">
          <div className="apd__label">Approved</div>
          <div className="apd__say apd__say--ink">
            Approved.
            <br />
            Kick-off in 3 days.
          </div>
          <div className="apd__plate">
            <b>AED 96,000 · 8 weeks</b>
            <span>by Layla Haddad, 10 Sep 2026</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'widget',
    name: '12 · Gradient widget',
    ref: 'After the widget reference · brand colours, glass icon, grain',
    note: 'A rounded, saturated gradient card like the reference, in the brand’s colours: Cobalt melting into violet with a warm Ember glow in the corner, a frosted glass disc holding a thumb, white type. This one is on the live proposal page now. The card sits slightly tilted, the light drifts slowly.',
    body: () => (
      <div className="apd__card apd__card--widget">
        <div className="apd__orb">
          <ThumbsUp size={28} strokeWidth={1.8} />
        </div>
        <div className="apd__wtitle">Approved</div>
        <div className="apd__wsub">Spark kicks off in 3 days, effortlessly.</div>
        <div className="apd__wmeta">AED 96,000 · 8 weeks · Layla Haddad</div>
      </div>
    ),
  },
  {
    id: 'quiet',
    name: '13 · Quiet (no motion)',
    ref: 'The calm baseline',
    note: 'No animation at all: a small Cobalt check, the facts, the note. The reference for how much the others add.',
    body: () => (
      <div className="apd__card">
        <div className="apd__row apd__row--start">
          <span className="apd__quietcheck">
            <Check size={14} strokeWidth={2.6} />
          </span>
          <div>
            <Facts />
          </div>
        </div>
        <Who />
      </div>
    ),
  },
];

function Replayable({ look }: { look: Look }) {
  const [n, setN] = useState(0);
  return (
    <section className="gdemo__card apd">
      <header>
        <h3>{look.name}</h3>
        <p>
          <span className="apd__ref">{look.ref}</span> {look.note}
        </p>
      </header>
      <div className="apd__stage">
        <div key={n} className="apd__play">
          {look.body()}
        </div>
        {look.id !== 'quiet' && (
          <button className="link-btn apd__replay" onClick={() => setN((v) => v + 1)}>
            Replay
          </button>
        )}
      </div>
    </section>
  );
}

export function ApprovedDemo() {
  return (
    <div className="cdemo apddemo">
      <PageHeader
        title="Proposal approved"
        sub="Thirteen looks for the decision card once the proposal is approved, each with a short motion that echoes the time ring while it waited. After the Spark Studios brand book: the spark, Noor light, the Cobalt and Ember roles, Doto numbers, mono labels. Press Replay to see one again."
      />
      <div className="apddemo__grid">
        {LOOKS.map((l) => (
          <Replayable key={l.id} look={l} />
        ))}
      </div>
    </div>
  );
}
