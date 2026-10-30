// Prototype-only page (#/demo/glass-buttons): the issue card's two actions (Request proposal, Ask Spark) in the glass
// variant, in several looks side by side, each on the same white glass card over Sand with its one cluster of light.
import { PageHeader } from '../../components/ui/primitives';
import { BrandSpark } from '../../components/ui/BrandSpark';

const LOOKS = [
  { v: 'now', label: 'Now', note: 'Both white glass with the spectrum inside their edges; light under Ask Spark.' },
  { v: 'white', label: 'A · Plain white', note: 'As the dashboard reference: solid white pills, a hairline and a soft shadow, no colour. The spark carries the AI.' },
  { v: 'ai', label: 'B · Light only for AI', note: 'Request proposal plain white; only Ask Spark gets the brand’s light: the spectrum blurred beneath it, as the pills in the series (p. 40).' },
  { v: 'clear', label: 'C · Clear glass', note: 'No white fill: clear frost and a bright rim, the card showing through; Ask Spark with a faint light under it.' },
  { v: 'ink', label: 'D · Ink + glass', note: 'Request proposal the Ink primary (the main action); Ask Spark white glass with the light under it.' },
  { v: 'rim', label: 'E · Spectrum rim on AI', note: 'Request proposal plain white; Ask Spark with a thin spectrum edge (Cobalt to Ember) and no glow, as the brand’s glass tiles.' },
] as const;

export function GlassButtonsDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="Glass · issue actions" sub="Request proposal and Ask Spark on the issue card, in a few looks. Same card, same ground. Prototype only." />
      <div className="gbd-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="gbd-col">
            <span className="gk-label">{l.label}</span>
            <div className="gbd-stage">
              <div className="gbd-card">
                <b>Slow on mobile</b>
                <span>Product pages take 6.8 s to load on 4G.</span>
                <div className={`gbd-acts gbd--${l.v}`}>
                  <button type="button" className="gbd-btn gbd-btn--req">
                    Request proposal
                  </button>
                  <button type="button" className="gbd-btn gbd-btn--ask">
                    <BrandSpark size={15} flat /> Ask Spark
                  </button>
                </div>
              </div>
            </div>
            <p className="fdm-about">{l.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
