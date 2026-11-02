// Prototype-only page (#/demo/suggestions): the ways to start in the Ask Spark drawer, whose panel is white, in a
// few looks side by side: as now (a grey hairline), and in glass without the grey line, so it can be seen how
// much of the glass shows on white. The second row of each panel is held in its hover state.
import { ArrowRight, Maximize2, X } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { SparkDisc } from '../../components/ui/BrandSpark';

const QUESTIONS = ['How many sales do we lose to the 6.8 s load?', 'Which pages are slowest?', 'Can our developers do this, or should Spark?', 'How fast are competitors on mobile?'];

const LOOKS = [
  { v: 'now', label: 'Now', note: 'Sand fill and a grey one-pixel line, as a form field.' },
  { v: 'glass', label: 'A · Glass on white', note: 'No grey line: a white rim, the faintest outer edge and a soft shadow, a breath of Sand inside. Hover turns it white and lifts it.' },
  { v: 'lit', label: 'B · Glass on a lit panel', note: 'The panel takes one cluster of light at its top, so the clear glass rows have something to show through. Hover whiter.' },
  { v: 'fill', label: 'C · Fill only', note: 'No line and no shadow at rest: Sand on white is enough to hold the row. Hover turns it white glass with a shadow.' },
] as const;

export function SuggestionsDemo() {
  return (
    <div className="cdemo">
      <PageHeader
        title="Ask Spark · ways to start"
        sub="The questions in the Ask Spark drawer on its white panel: as now, and three ways in glass without the grey line. The second row of each is shown hovered. Prototype only."
      />
      <div className="sgd-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="sgd-col">
            <span className="gk-label">{l.label}</span>
            <div className={cx('sgd-panel', `sgd--${l.v}`)}>
              <header className="sgd-head">
                <SparkDisc size={28} />
                <b>Ask Spark</b>
                <Maximize2 size={16} strokeWidth={1.8} />
                <X size={17} strokeWidth={1.8} />
              </header>
              <h3>How can I help?</h3>
              <ul>
                {QUESTIONS.map((q, i) => (
                  <li key={q}>
                    <button type="button" className={cx('sgd-row', i === 1 && 'is-h')}>
                      <span>{q}</span>
                      <ArrowRight size={15} strokeWidth={1.7} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <p className="bbd-note">{l.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
