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
] as const;

function GlassStatus({ status, look }: { status: Status; look: string }) {
  return (
    <span className={cx('sg', `sg--${look}`, `sg-s--${status}`)}>
      {look === 'bead' && <i className="sg-bead" />}
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
