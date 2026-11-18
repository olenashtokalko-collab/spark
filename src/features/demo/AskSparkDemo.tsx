// Prototype-only page (#/demo/ask-spark): the Ask Spark button with its mark as now (the spark in Ember on a pale
// disc) beside the app icon in its place, each still, breathing as a whole, and with only the spark breathing.
// Shown where the button lives: Home's header beside the credits and the cover's light, and on its own.
import { useState } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { SparkDisc } from '../../components/ui/BrandSpark';

type Mark = 'disc' | 'icon';
type Motion = 'still' | 'icon' | 'spark';

const MOTIONS: { v: Motion; label: string; note: string }[] = [
  { v: 'still', label: 'Still', note: 'As now: no motion.' },
  { v: 'icon', label: 'The icon breathes', note: 'The whole mark swells a touch and back, its light rising with it, every 3.2s.' },
  { v: 'spark', label: 'The spark breathes', note: 'The disc stays; only the spark swells and turns a few degrees, its glow rising with it, every 3.2s.' },
];

function Mark({ mark }: { mark: Mark }) {
  return mark === 'disc' ? (
    <SparkDisc size={22} />
  ) : (
    <span className="ask-icon" aria-hidden>
      <img src="/brand/spark-app-icon.jpg" alt="" />
    </span>
  );
}

function AskButton({ mark, motion }: { mark: Mark; motion: Motion }) {
  return (
    <button type="button" className={cx('hl-mchat rq-ask ask-demo', `ask-demo--${motion}`)}>
      <Mark mark={mark} />
      Ask Spark
    </button>
  );
}

export function AskSparkDemo() {
  const [motion, setMotion] = useState<Motion>('spark');
  const cur = MOTIONS.find((m) => m.v === motion)!;
  return (
    <div className="cdemo">
      <PageHeader title="Ask Spark · the mark" sub="The button's mark as now (the spark in Ember on a pale disc) beside the app icon, still or breathing. Prototype only." />
      <div className="fdm-switch">
        {MOTIONS.map((m) => (
          <button key={m.v} className={cx(motion === m.v && 'is-on')} onClick={() => setMotion(m.v)}>
            {m.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>

      <div className="ask-grid">
        {(['disc', 'icon'] as const).map((mark) => (
          <section key={mark} className="ask-col">
            <span className="gk-label">{mark === 'disc' ? 'A · Now: the spark in Ember on a pale disc' : 'B · The app icon'}</span>
            {/* In place: Home's header, beside the credits, the cover's light behind. */}
            <div className="ask-stage ask-stage--home">
              <div className="ask-cover" aria-hidden />
              <div className="ask-head">
                <b>Brand Co.</b>
                <span className="ask-head__acts">
                  <span className="ask-credits">USD 64.20 credits</span>
                  <AskButton mark={mark} motion={motion} />
                </span>
              </div>
            </div>
            {/* On its own, larger, to see the mark. */}
            <div className="ask-stage ask-stage--zoom">
              <AskButton mark={mark} motion={motion} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
