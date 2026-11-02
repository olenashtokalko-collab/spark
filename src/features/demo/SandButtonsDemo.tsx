// Prototype-only page (#/demo/sand-buttons): the portal's buttons drawn again from the brand book, on Sand, the
// ground most of the portal stands on (p. 31: Sand 35%, Ink 20%, Cobalt and Ember 15% each, Haze 5%, Noor light
// only as glow and glass). The objects come from the brand's own interface pieces in the series (p. 40) and on
// p. 36: a glass tube round a frosted body, the light caught in the tube and cast onto the ground beneath (the
// spectrum underneath, Ink on top); Cobalt for human, Ember for AI (p. 39). Three ways to read them, each with
// every kind of button, its states, and two places it lives: the issue card and the chat box.
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUp, ChevronLeft, ChevronRight, MoreHorizontal, Paperclip, Plus, Trash2 } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { BrandSpark } from '../../components/ui/BrandSpark';

const LOOKS = [
  {
    v: 'tube',
    label: '01 · Glass tube',
    book: 'p. 40 “Different tools. One spark.”, “Search less.” · p. 36 · p. 39',
    note: 'Each button a frosted body in a clear glass tube. The tube catches its colour and casts it onto the Sand below: Cobalt for what you do (the main action), Ember for Spark, the whole spectrum for Send, where your words go to Spark. The quiet buttons in a tube of Corniche Haze. Ink words.',
  },
  {
    v: 'bubble',
    label: '02 · Frosted bubble',
    book: 'p. 40 “Make it brighter. We’re on it.”',
    note: 'Soft white frosted bubbles in a thick clear rim with a highlight at the top left. The main action lit from inside, Cobalt into violet, glowing round its edge; Ask Spark lit warm, Ember into peach. Follow-ups are speech bubbles: a corner tucked in, as the things you say.',
  },
  {
    v: 'core',
    label: '03 · Spark in glass',
    book: 'p. 40 “Switch on the spark.”, the switch on p. 36',
    note: 'A clear glass casing round a solid core, as the brand’s switch: the main action a glossy Cobalt core with white words; Spark an Ember sphere, the spark inside it, at the head of Ask Spark and as Send. The quiet buttons an empty casing.',
  },
] as const;

type Look = (typeof LOOKS)[number]['v'];

function B({ kind, children, label, className, disabled }: { kind: string; children: ReactNode; label?: string; className?: string; disabled?: boolean }) {
  return (
    <button type="button" className={cx('sb', `sb--${kind}`, className)} aria-label={label} title={label} disabled={disabled}>
      <span className="sb__t">{children}</span>
    </button>
  );
}

/** Spark's mark: in the sphere for 03, the Ember spark on its own for the others. */
function Mark({ look }: { look: Look }) {
  return look === 'core' ? (
    <span className="sb__orb" aria-hidden>
      <BrandSpark size={13} flat />
    </span>
  ) : (
    <span className="sb__spark" aria-hidden>
      <BrandSpark size={15} flat />
    </span>
  );
}

function Kit({ look }: { look: Look }) {
  return (
    <div className="sbk">
      <div className="sbk__group">
        <span className="sbk__cap">Actions</span>
        <div className="sbk__row">
          <B kind="primary">New request</B>
          <B kind="secondary">Cancel</B>
          <B kind="text">
            All files <ArrowRight size={14} strokeWidth={1.8} />
          </B>
          <B kind="danger">
            <Trash2 size={15} strokeWidth={1.7} /> Delete
          </B>
        </div>
      </div>
      <div className="sbk__group">
        <span className="sbk__cap">Spark</span>
        <div className="sbk__row">
          <B kind="ask">
            <Mark look={look} /> Ask Spark
          </B>
          <B kind="send" className="sb--icon" label="Send">
            {look === 'core' ? (
              <span className="sb__orb sb__orb--full" aria-hidden>
                <ArrowUp size={16} strokeWidth={2.2} />
              </span>
            ) : (
              <ArrowUp size={17} strokeWidth={2} />
            )}
          </B>
        </div>
      </div>
      <div className="sbk__group">
        <span className="sbk__cap">Icons</span>
        <div className="sbk__row">
          <B kind="secondary" className="sb--icon" label="Add">
            <Plus size={17} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="sb--icon" label="Attach">
            <Paperclip size={16} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="sb--icon" label="More">
            <MoreHorizontal size={17} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="sb--icon sb--sm" label="Previous">
            <ChevronLeft size={16} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="sb--icon sb--sm" label="Next">
            <ChevronRight size={16} strokeWidth={1.7} />
          </B>
        </div>
      </div>
      <div className="sbk__group">
        <span className="sbk__cap">Follow-ups</span>
        <div className="sbk__row">
          <B kind="chip">What would it cost?</B>
          <B kind="chip">Show me an example</B>
        </div>
      </div>
      <div className="sbk__group">
        <span className="sbk__cap">States · rest, hover, pressed, off</span>
        <div className="sbk__row">
          <B kind="primary">Request proposal</B>
          <B kind="primary" className="is-h">
            Request proposal
          </B>
          <B kind="primary" className="is-p">
            Request proposal
          </B>
          <B kind="primary" disabled>
            Request proposal
          </B>
        </div>
        <div className="sbk__row">
          <B kind="secondary">Cancel</B>
          <B kind="secondary" className="is-h">
            Cancel
          </B>
          <B kind="secondary" className="is-p">
            Cancel
          </B>
          <B kind="secondary" disabled>
            Cancel
          </B>
        </div>
      </div>
    </div>
  );
}

/** Where they live: the issue card on Home, and the chat box. */
function InPlace({ look }: { look: Look }) {
  return (
    <div className="sbp">
      <div className="sbp__card">
        <span className="sbp__tag">High impact</span>
        <b>Slow on mobile</b>
        <p>Product pages take 6.8 s to load on 4G, mostly because of uncompressed hero images.</p>
        <div className="sbk__row">
          <B kind="primary">Request proposal</B>
          <B kind="ask">
            <Mark look={look} /> Ask Spark
          </B>
        </div>
      </div>
      <div className="sbp__chat">
        <span className="sbp__ph">Ask Spark about your brand, a campaign or a market</span>
        <div className="sbp__bar">
          <B kind="secondary" className="sb--icon" label="Attach">
            <Paperclip size={16} strokeWidth={1.7} />
          </B>
          <span className="sbp__sp" />
          <B kind="send" className="sb--icon" label="Send">
            {look === 'core' ? (
              <span className="sb__orb sb__orb--full" aria-hidden>
                <ArrowUp size={16} strokeWidth={2.2} />
              </span>
            ) : (
              <ArrowUp size={17} strokeWidth={2} />
            )}
          </B>
        </div>
      </div>
    </div>
  );
}

export function SandButtonsDemo() {
  return (
    <div className="cdemo">
      <PageHeader
        title="Buttons on Sand"
        sub="The buttons drawn again from the brand book, on Sand. Three readings of the brand’s own glass pieces, each with every kind of button, its states, and where it lives. Prototype only."
      />
      <div className="sbd">
        {LOOKS.map((l) => (
          <section key={l.v} className="sbd__look">
            <div className="sbd__head">
              <span className="gk-label">{l.label}</span>
              <p className="sbd__book">{l.book}</p>
              <p className="sbd__note">{l.note}</p>
            </div>
            <div className={cx('sbd__stage', `sbv--${l.v}`)}>
              <Kit look={l.v} />
              <InPlace look={l.v} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
