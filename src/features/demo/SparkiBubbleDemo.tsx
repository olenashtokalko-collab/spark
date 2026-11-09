// Prototype-only page (#/demo/sparki-bubbles): Sparki's hint as a speech bubble after the brand book's chat bubbles
// (9 Nov): thick glass with a bright rim, a tail towards Sparki, a sentence instead of mono capitals. Three looks,
// with today's pill for comparison, each over a highlighted menu item.
import { cx } from '../../components/ui/primitives';
import { DrAiHead, SparkiStill } from '../../components/ui/DrAi';

const LOOKS = [
  { v: 'now', label: 'Now', note: 'Today’s pill: mono capitals, the Ember dot.' },
  { v: 'clear', label: 'A · Clear', note: 'As “Make it brighter”: clear glass, a thick bright rim, a tail to Sparki.' },
  { v: 'warm', label: 'B · Warm', note: 'As “On it ···”: the rim warmed with Ember, Ember’s dots breathing after the words.' },
  { v: 'glow', label: 'C · Glow', note: 'As the middle bubble: the spectrum lit inside the glass, the words in Ink over it.' },
  { v: 'thinking', label: 'D · As Dr.AI’s “Thinking”', note: 'The same pill as Dr.AI’s “Thinking ···” in the chat: light glass, a soft rim, the three dots breathing after the words.' },
] as const;

function Bubble({ look }: { look: string }) {
  if (look === 'thinking')
    // The chat's own pill (MessageView's Thinking), so Sparki speaks in the same object as Dr.AI.
    return (
      <span className="thk-glass thk-glass--warm thk-glass--tail sph-thk">
        Open the chat
        <span className="thk-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </span>
    );
  if (look === 'now')
    return (
      <span className="og-say sph-now">
        <i className="og-say__dot" />
        <span className="og-say__text" style={{ ['--n' as string]: 13 }}>
          Open the chat
        </span>
      </span>
    );
  return (
    <span className={cx('sph', `sph--${look}`)}>
      <span className="sph__t">Open the chat</span>
      {look === 'warm' && (
        <i className="sph-dots">
          <b />
          <b />
          <b />
        </i>
      )}
    </span>
  );
}

export function SparkiBubbleDemo() {
  return (
    <div className="dl-page sph-page">
      <header className="dl-head">
        <h1>Sparki’s hint · bubble</h1>
        <p>Sparki’s hint as a speech bubble from the brand book’s chat bubbles. Each over a highlighted menu item. Prototype only.</p>
      </header>
      <div className="dl-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="dl-tile">
            <span className="dl-tile__label">{l.label}</span>
            <p className="dl-tile__note">{l.note}</p>
            <div className="sph-stage">
              <span className="hlx-rail">
                <span className="hlx hlx--rim">
                  <span className="hlx-nav">
                    <DrAiHead size={26} /> Ask Dr.AI
                  </span>
                </span>
              </span>
              <span className="sph-sparki">
                <span className="sph-bubble">
                  <Bubble look={l.v} />
                </span>
                <SparkiStill size={40} />
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
