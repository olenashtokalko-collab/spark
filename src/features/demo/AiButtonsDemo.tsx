// Prototype-only page (#/demo/ai-buttons): four directions for the portal's buttons as an AI product's glass, on
// Sand with one cluster of light (p. 34: one cluster per frame). Ink on Sand stays the default (p. 30); the light
// moves only where Spark is (p. 39: Ember for AI; p. 31: Noor is light, glow and glass only). Each with every
// kind of button, its states, and the places they live: the header, the issue card and the chat box.
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUp, ChevronLeft, ChevronRight, MoreHorizontal, Paperclip, Plus, Trash2 } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { BrandSpark } from '../../components/ui/BrandSpark';

const LOOKS = [
  {
    v: 'liquid',
    label: 'A · Liquid glass',
    note: 'Clear glass with almost no white: the edges catch the light, bright at the top left and a thin line at the bottom right, the ground bent and brightened through it. The main action black Ink glass; Spark’s buttons with Cobalt and Ember caught inside their ends. Pressed, the glass gives.',
  },
  {
    v: 'aura',
    label: 'B · Ink and aura',
    note: 'Calm and sure: the main action black Ink with a soft gloss, the quiet ones clear frosted glass in a one-pixel rim. Only Spark’s buttons live: the spectrum turns slowly behind them as a halo, brighter on hover; the spark breathes.',
  },
  {
    v: 'hairline',
    label: 'C · Spectrum hairline',
    note: 'Clear glass in a one-pixel rim. The main action black Ink. Ask Spark is a frosted body in a thin clear glass tube, the spectrum turning slowly in it and its light cast onto the ground below; Send has the spectrum turning round a one-pixel rim.',
  },
  {
    v: 'edge',
    label: 'D · Edge light',
    note: 'Spark’s buttons hold the light inside their edges, the spectrum moving round them as Spark listens; the middle stays clear for the words. The main action black Ink, the quiet ones clear glass.',
  },
] as const;


function B({ kind, children, label, className, disabled }: { kind: string; children: ReactNode; label?: string; className?: string; disabled?: boolean }) {
  return (
    <button type="button" className={cx('ag', `ag--${kind}`, className)} aria-label={label} title={label} disabled={disabled}>
      <span className="ag__t">{children}</span>
    </button>
  );
}

const Spark = () => (
  <span className="ag__spark" aria-hidden>
    <BrandSpark size={15} flat />
  </span>
);

function Kit() {
  return (
    <div className="agk">
      <div className="agk__group">
        <span className="agk__cap">Actions</span>
        <div className="agk__row">
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
      <div className="agk__group">
        <span className="agk__cap">Spark</span>
        <div className="agk__row">
          <B kind="ask">
            <Spark /> Ask Spark
          </B>
          <B kind="send" className="ag--icon" label="Send">
            <ArrowUp size={17} strokeWidth={2} />
          </B>
        </div>
      </div>
      <div className="agk__group">
        <span className="agk__cap">Icons</span>
        <div className="agk__row">
          <B kind="secondary" className="ag--icon" label="Add">
            <Plus size={17} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="ag--icon" label="Attach">
            <Paperclip size={16} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="ag--icon" label="More">
            <MoreHorizontal size={17} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="ag--icon ag--sm" label="Previous">
            <ChevronLeft size={16} strokeWidth={1.7} />
          </B>
          <B kind="secondary" className="ag--icon ag--sm" label="Next">
            <ChevronRight size={16} strokeWidth={1.7} />
          </B>
        </div>
      </div>
      <div className="agk__group">
        <span className="agk__cap">Follow-ups</span>
        <div className="agk__row">
          <B kind="chip">What would it cost?</B>
          <B kind="chip">Show me an example</B>
        </div>
      </div>
      <div className="agk__group">
        <span className="agk__cap">States · rest, hover, pressed, off</span>
        {(['primary', 'secondary', 'ask'] as const).map((k) => (
          <div key={k} className="agk__row">
            {(['', 'is-h', 'is-p', 'off'] as const).map((s) => (
              <B key={s} kind={k} className={s === 'off' ? undefined : s} disabled={s === 'off'}>
                {k === 'ask' && <Spark />}
                {k === 'primary' ? 'Request proposal' : k === 'secondary' ? 'Cancel' : 'Ask Spark'}
              </B>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function InPlace() {
  return (
    <div className="agp">
      <div className="agp__head">
        <div>
          <b>Brand Co.</b>
          <span>Everyday products with a Gulf point of view</span>
        </div>
        <span className="agp__credits">USD 64.20 credits</span>
        <B kind="ask">
          <Spark /> Ask Spark
        </B>
      </div>
      <div className="agp__card">
        <span className="agp__tag">High impact</span>
        <b>Slow on mobile</b>
        <p>Product pages take 6.8 s to load on 4G, mostly because of uncompressed hero images.</p>
        <div className="agk__row">
          <B kind="primary">Request proposal</B>
          <B kind="ask">
            <Spark /> Ask Spark
          </B>
        </div>
      </div>
      <div className="agp__chat">
        <span className="agp__ph">Ask Spark about your brand, a campaign or a market</span>
        <div className="agp__bar">
          <B kind="secondary" className="ag--icon" label="Attach">
            <Paperclip size={16} strokeWidth={1.7} />
          </B>
          <span className="agp__sp" />
          <B kind="send" className="ag--icon" label="Send">
            <ArrowUp size={17} strokeWidth={2} />
          </B>
        </div>
      </div>
    </div>
  );
}

export function AiButtonsDemo() {
  return (
    <div className="cdemo">
      <PageHeader
        title="Buttons · AI glass"
        sub="Four directions for the buttons as an AI product’s glass, on Sand. The main action black Ink, the rest clear glass in a one-pixel rim; the light moves only where Spark is. Hover and press them. Prototype only."
      />
      <div className="agd">
        {LOOKS.map((l) => (
          <section key={l.v} className="agd__look">
            <div className="agd__head">
              <span className="gk-label">{l.label}</span>
              <p className="agd__note">{l.note}</p>
            </div>
            <div className={cx('agd__stage', `agv--${l.v}`)}>
              <Kit />
              <InPlace />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
