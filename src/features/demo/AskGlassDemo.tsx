// Prototype-only page (#/demo/ask-glass): Ask Spark as an object of the brand's glass (the frosted tiles holding
// light, pp. 34, 36, and the client's example with the light bending at its ends), so it stands apart from the
// tabs and the plain buttons. Each look sits in the company card's corner beside the credits, as on Home.
import { PageHeader, cx } from '../../components/ui/primitives';
import { BrandSpark } from '../../components/ui/BrandSpark';

const LOOKS = [
  { v: 'now', label: 'Now', note: 'The plain glass of the other buttons: it reads as one of them.' },
  { v: 'rim', label: 'A · Light at the ends', note: 'As the client’s example: a white pill in a thick clear rim, the light bending at its ends, Cobalt at the left, Ember at the right.' },
  { v: 'tile', label: 'B · Glass tile', note: 'As the frosted tiles: a thick pane holding the spectrum inside, strongest at the lower left, frosted white over it, a bright rim and depth at the edges.' },
  { v: 'ember', label: 'C · Ember glass', note: 'The tile in Ember only (the AI’s colour): warm light inside the glass, white frost on top.' },
  { v: 'cobalt', label: 'D · Cobalt glass', note: 'The tile in Cobalt into violet, as the top tiles of the plate.' },
  { v: 'flow', label: 'E · Spectrum flow', note: 'The light flows through the glass, Cobalt to Ember, and drifts slowly while you hover.' },
] as const;

export function AskGlassDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="Glass · Ask Spark" sub="Ask Spark as a piece of the brand’s glass, so it stands apart from the tabs and the plain buttons. Point at each. Prototype only." />
      <div className="agd-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="agd-col">
            <span className="gk-label">{l.label}</span>
            <div className="agd-stage">
              <span className="agd-credits">USD 64.20 credits</span>
              <button type="button" className={cx('agd-btn', `agd--${l.v}`)}>
                <span className="agd-btn__light" aria-hidden />
                <BrandSpark size={15} flat />
                Ask Spark
              </button>
            </div>
            <p className="fdm-about">{l.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
