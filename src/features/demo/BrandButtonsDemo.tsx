// Prototype-only page (#/demo/buttons): every kind of button the portal has now, beside the same button
// by the guidelines. The book has no buttons page yet (AI kit and Governance are "to come"), so the rules
// are read from what it does say: Ink on Sand is the default (p. 30); every control follows one recipe,
// frosted glass with the spectrum underneath and Ink or white on top (p. 36); Ink objects carry the spark,
// glass objects carry the light (p. 38); Cobalt for human, Ember for AI (p. 39); the spectrum is never a
// flat fill (p. 31).
import type { ReactNode } from 'react';
import { ArrowUp, ChevronDown, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';
import { Mascot } from '../../components/ui/Mascot';
import { BrandSpark } from '../../components/ui/BrandSpark';
import { Button, PageHeader, cx } from '../../components/ui/primitives';

function Row({ role, where, now, book, note }: { role: string; where: string; now: ReactNode; book: ReactNode; note: string }) {
  return (
    <div className="bk-row">
      <div className="bk-row__role">
        <b>{role}</b>
        <span>{where}</span>
      </div>
      <div className="bk-row__cell">{now}</div>
      <div className="bk-row__cell bk-row__cell--book">{book}</div>
      <p className="bk-row__note">{note}</p>
    </div>
  );
}

export function BrandButtonsDemo() {
  return (
    <div className="cdemo bk">
      <PageHeader
        title="Buttons by the book"
        sub="What the portal has now, and the same button by the guidelines. The book has no buttons page yet, so these follow what it does say: Ink on Sand by default, controls in frosted glass, Cobalt for people, Ember only for AI. Prototype only."
      />

      <div className="bk-rules">
        <div>
          <span className="bui-label">Primary</span>
          <p>Solid Ink, white text. “Ink objects carry the spark.”</p>
        </div>
        <div>
          <span className="bui-label">Secondary</span>
          <p>A stroke only, no fill: it takes the colour of where it stands. Ink text.</p>
        </div>
        <div>
          <span className="bui-label">Tertiary</span>
          <p>Ink text only; underlined on hover.</p>
        </div>
        <div>
          <span className="bui-label">Never</span>
          <p>Ember on a human action, or the spectrum as a flat fill.</p>
        </div>
      </div>

      <div className="bk-table">
        <div className="bk-row bk-row--head">
          <span />
          <span className="bui-label">Now</span>
          <span className="bui-label">By the book</span>
          <span className="bui-label">What changes</span>
        </div>

        <Row
          role="Primary"
          where="New request, Pay, Send to Spark"
          now={<Button variant="primary">New request</Button>}
          book={<button type="button" className="bk-btn bk-btn--ink">New request</button>}
          note="Already right: Ink on Sand. Only the corners: the book's objects are soft squircles and pills; keep the pill."
        />
        <Row
          role="Secondary"
          where="Cancel, Request proposal, filters"
          now={
            <span className="bk-pair">
              <Button variant="secondary">Cancel</Button>
              <span className="hl-fix__tools">
                <Button size="sm" variant="secondary" className="hl-fix__make">
                  Request proposal
                </Button>
              </span>
            </span>
          }
          book={
            <span className="bk-pair">
              <button type="button" className="bk-btn bk-btn--line">Cancel</button>
              <button type="button" className="bk-btn bk-btn--line bk-btn--sm">Request proposal</button>
            </span>
          }
          note="Two looks today (white fill, and a bare outline). One instead: a stroke only, no fill, so the button takes the colour of whatever it stands on (Sand, white, a card). A faint fill on hover."
        />
        <Row
          role="Tertiary"
          where="All requests, All files, Show all"
          now={
            <a className="hl-link" href="#/demo/buttons">
              All files
            </a>
          }
          book={
            <a className="bk-text" href="#/demo/buttons">
              All files <ChevronRight size={14} />
            </a>
          }
          note="Ink text, no grey; the underline only on hover, with a small chevron, so it reads as a way on, not as body copy."
        />
        <Row
          role="Ask Spark (header)"
          where="Home"
          now={
            <span className="hl-hero__actions">
              <button type="button" className="hl-mchat">
                <Mascot size={28} />
                Ask Spark
              </button>
            </span>
          }
          book={
            <button type="button" className="bk-btn bk-btn--ink bk-btn--ask">
              <Mascot size={26} />
              Ask Spark
            </button>
          }
          note="Right already: an Ink object carrying the spark. Tightened to the primary's height, so the two never differ beside each other."
        />
        <Row
          role="Ask Spark (elsewhere)"
          where="Requests, Documents, proposals, drawer"
          now={
            <button type="button" className="hl-mchat rq-ask">
              <Mascot size={22} />
              Ask Spark
            </button>
          }
          book={
            <span className="bk-glow-wrap">
              <span className="bk-glow" aria-hidden />
              <button type="button" className="bk-btn bk-btn--glass bk-btn--ask">
                <Mascot size={22} />
                Ask Spark
              </button>
            </span>
          }
          note="The secondary glass, with the spectrum glowing under it: the one place the light shows, because it opens Spark."
        />
        <Row
          role="Send"
          where="Chat box"
          now={
            <span className="bk-send-now">
              <button type="button" className="composer__send" aria-label="Send">
                <ArrowUp size={18} strokeWidth={2.2} />
              </button>
            </span>
          }
          book={
            <button type="button" className="bk-send bk-send--ink" aria-label="Send">
              <ArrowUp size={18} strokeWidth={2.2} />
            </button>
          }
          note="Sending is the client's action and Ember means AI. By the book, and on the portal now: the primary, solid Ink. Ember stays for Spark at work (the “On it” dots)."
        />
        <Row
          role="Icon buttons"
          where="⋯, arrows, add"
          now={
            <span className="bk-pair">
              <button type="button" className="hl-fix__more" aria-label="More">
                <MoreHorizontal size={16} />
              </button>
              <span className="hdc-pager">
                <button type="button" aria-label="Next">
                  <ChevronRight size={15} />
                </button>
              </span>
            </span>
          }
          book={
            <span className="bk-pair">
              <button type="button" className="bk-icon" aria-label="More">
                <MoreHorizontal size={16} />
              </button>
              <button type="button" className="bk-icon" aria-label="Next">
                <ChevronRight size={15} />
              </button>
              <button type="button" className="bk-icon" aria-label="Add">
                <Plus size={16} />
              </button>
            </span>
          }
          note="Today a bare icon in one place and an outlined square in another. One small circle for all of them, a stroke and no fill, like the secondary: it takes the surface it stands on."
        />
        <Row
          role="Human / AI marks"
          where="Pills, not buttons"
          now={
            <span className="bk-pair">
              <span className="hl-impact hl-impact--high">High impact</span>
            </span>
          }
          book={
            <span className="bk-pair">
              <span className="bui-pill bui-pill--human">By people</span>
              <span className="bui-pill bui-pill--ai">By AI</span>
            </span>
          }
          note="Cobalt and Ember belong to labels, not to actions: Cobalt for what people did, Ember for what AI did."
        />
      </div>

      {/* Ask Spark in glass, more of it: the one button that opens Spark may carry the light. Each on Sand
          and on a white card, the two places it stands. Hover them. */}
      <section className="bk-ask">
        <header className="bg-point__head">
          <span className="bui-label">Ask Spark · glass</span>
          <h2>More glass, more light</h2>
          <p>The button that opens Spark is the one place the light may show (p. 36: frosted body, spectrum underneath). Six ways, each on Sand and on a white card. Hover them.</p>
        </header>
        <AskGrid list={ASKS} />
      </section>

      {/* B, more ways: the thick glass in other tints, a band of light, smoked, clearer, glowing. */}
      <section className="bk-ask">
        <header className="bg-point__head">
          <span className="bui-label">Ask Spark · thick glass</span>
          <h2>B, more ways</h2>
          <p>The same pebble of glass (a gloss on top, bright edges, the light pooled at the foot) in other tints and strengths. Each on Sand and on a white card. Hover them.</p>
        </header>
        <AskGrid list={THICK} />
      </section>

      {/* After three references the client sent (frosted pills, a glass marble round the mark, an
          embossed button with a lit mark and gradient type), in Spark's colours. */}
      <section className="bk-ask">
        <header className="bg-point__head">
          <span className="bui-label">Ask Spark · after the references</span>
          <h2>Frosted, marble, embossed</h2>
          <p>A frosted pill with the mark in a glass marble; a milky bar with a lit top edge; a button pressed up out of the surface. The spark is the brand’s own, filled with Noor; the words carry Noor too, Cobalt to Ember. Each on Sand and on a white card.</p>
        </header>
        <div className="bk-ask__grid">
          {REFS.map((x) => (
            <div key={x.v} className="bk-ask__tile">
              <span className="bui-label">{x.label}</span>
              <div className="bk-ask__stages">
                <div className="bk-ask__stage">
                  <AskRef v={x.v} />
                </div>
                <div className="bk-ask__stage bk-ask__stage--white">
                  <AskRef v={x.v} />
                </div>
              </div>
              <p>{x.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const REFS = [
  { v: 'marble', label: 'R1 · Frosted + marble', note: 'Milky frosted glass; the mark set in a clear glass marble with a bright rim and a highlight, as “Ask agents”.' },
  { v: 'frost', label: 'R2 · Grey frost', note: 'The same in a darker frosted glass with white type: closest to the first reference.' },
  { v: 'milky', label: 'R3 · Milky bar', note: 'Soft white glass, a bright top edge that turns Ember to Cobalt at the right; the spark in a white glass circle, as “Type @”.' },
  { v: 'emboss', label: 'R4 · Embossed', note: 'Pressed up out of the surface: a soft shadow under, a light edge on top; the brand’s spark in Noor, as “Ask”. Words in plain Ink, to compare.' },
  { v: 'emboss-grad', label: 'R5 · Embossed + light type', note: 'R4 with the words in Noor, Cobalt through violet to Ember, as in “Ask”.' },
  { v: 'marble-grad', label: 'R6 · Marble + light type', note: 'R1’s marble and frost with R5’s gradient type: the most light in one button.' },
  { v: 'soft', label: 'R7 · Soft pill', note: 'A plain white pill with the softest shadow; the spark on a pale Noor disc at the start, Ink words. As “Connect Wallet”: the quietest.' },
  { v: 'soft-grad', label: 'R8 · Soft pill + light type', note: 'R7 with the words in Noor.' },
] as const;

function AskRef({ v }: { v: (typeof REFS)[number]['v'] }) {
  const marble = v === 'marble' || v === 'frost' || v === 'marble-grad';
  const grad = v === 'emboss-grad' || v === 'marble-grad' || v === 'soft-grad';
  const soft = v === 'soft' || v === 'soft-grad';
  return (
    <button type="button" className={`bk-rf bk-rf--${v}`}>
      {v === 'milky' && <span className="bk-rf__edge" aria-hidden />}
      <span className={marble ? 'bk-rf__marble' : v === 'milky' ? 'bk-rf__disc' : soft ? 'bk-rf__tint' : 'bk-rf__mark'}>
        <BrandSpark size={marble ? 22 : v === 'milky' || soft ? 20 : 26} flat={soft} />
      </span>
      <span className={cx('bk-rf__label', grad && 'bk-rf__label--grad', (v === 'emboss' || v === 'soft') && 'bk-rf__label--plain')}>Ask Spark</span>
      {(v === 'marble' || v === 'frost') && <ChevronDown size={16} strokeWidth={2} className="bk-rf__chev" />}
    </button>
  );
}

function AskGrid({ list }: { list: readonly { v: AskLook; label: string; note: string }[] }) {
  return (
        <div className="bk-ask__grid">
          {list.map((x) => (
            <div key={x.v} className="bk-ask__tile">
              <span className="bui-label">{x.label}</span>
              <div className="bk-ask__stages">
                <div className="bk-ask__stage">
                  <AskGlass v={x.v} />
                </div>
                <div className="bk-ask__stage bk-ask__stage--white">
                  <AskGlass v={x.v} />
                </div>
              </div>
              <p>{x.note}</p>
            </div>
          ))}
        </div>
  );
}

const ASKS = [
  { v: 'clear', label: 'A · Clear + glow', note: 'Clear glass, a bright rim, the spectrum glowing under it. The proposal in the table.' },
  { v: 'thick', label: 'B · Thick glass', note: 'A gloss across the top, bright edges, the light pooling inside at the foot: a pebble of glass.' },
  { v: 'filled', label: 'C · Full of light', note: 'The glass filled with a pale spectrum, glossy on top, as the thinking capsule in chat.' },
  { v: 'rim', label: 'D · Spectrum rim', note: 'White glass edged with the spectrum, a gloss on top; the rim brightens on hover.' },
  { v: 'sheen', label: 'E · Sheen', note: 'Clear glass; on hover a band of light sweeps across it, Cobalt to Ember.' },
  { v: 'lit', label: 'F · Lit on hover', note: 'Quiet glass at rest; on hover the light rises inside it from the foot.' },
] as const;

const THICK = [
  { v: 'thick', label: 'B · Thick glass', note: 'As above: a faint Haze in the glass, Cobalt pooled at the left of the foot, Ember at the right.' },
  { v: 'thick-warm', label: 'B2 · Warm', note: 'Peach glass, as your messages in chat; Ember light pooled at the foot.' },
  { v: 'thick-cool', label: 'B3 · Cool', note: 'Haze glass; Cobalt light pooled at the foot, deeper at the edges.' },
  { v: 'thick-band', label: 'B4 · Band of light', note: 'Clear glass with the whole spectrum lying at the foot, Cobalt to Ember, like light caught in the thickness.' },
  { v: 'thick-smoke', label: 'B5 · Smoked', note: 'Ink-tinted glass with white text, the spectrum glowing at the foot: the primary in glass.' },
  { v: 'thick-glow', label: 'B6 · Thick + glow', note: 'B with the spectrum also glowing under it, brighter on hover.' },
] as const;

type AskLook = (typeof ASKS)[number]['v'] | (typeof THICK)[number]['v'];

/** Ask Spark in one of the glass looks; the light it carries is a layer inside or a glow under it. */
function AskGlass({ v }: { v: AskLook }) {
  return (
    <span className={`bk-ag bk-ag--${v}${v.startsWith('thick') ? ' bk-ag--tk' : ''}`}>
      {(v === 'clear' || v === 'thick-glow') && <span className="bk-ag__glow" aria-hidden />}
      <button type="button" className="bk-ag__btn">
        <span className="bk-ag__light" aria-hidden />
        <Mascot size={24} />
        <span className="bk-ag__label">Ask Spark</span>
      </button>
    </span>
  );
}
