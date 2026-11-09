// Prototype-only page (#/demo/highlight-looks): how Sparki lights up the next thing to press, four looks (9 Nov),
// after the brand book's closing page (a soft, grainy spectrum aura round the logo) and the search pill (clear glass,
// coloured light under it). Each on three usual targets: a menu item, an Ink button, a light button.
import { cx } from '../../components/ui/primitives';
import { DrAiHead, SparkiStill } from '../../components/ui/DrAi';

const LOOKS = [
  { v: 'line', label: 'A · Now: a thin gradient line', note: 'What the portal does today: a 2 px Cobalt-to-Ember outline, breathing.' },
  { v: 'aura', label: 'B · Aura', note: 'After the closing page: a soft, grainy spectrum light round the target, blue on the left, magenta above and below, Ember on the right. No line.' },
  { v: 'rim', label: 'C · Glass rim, lit from below', note: 'After the search pill: a thick clear glass rim hugging the target, the spectrum as light on the ground under it.' },
  { v: 'both', label: 'D · Aura and a glass edge', note: 'B’s aura with a thin bright glass edge, so the target’s shape stays crisp inside the light.' },
  // 9 Nov, review: "it reads as blur, not as transparency". Crisp glass, no haze, after the brand book's pyramid,
  // chat bubbles and glass objects.
  { v: 'candy', label: 'E · Candy glass', note: 'After the brand pyramid: the colour is in the rim itself, violet into pink into peach, a bright gloss along the top, the lower edge lit. No haze.' },
  { v: 'bubble', label: 'F · Bubble', note: 'After the chat bubbles: a nearly clear rim, a gloss across the top, a lilac shade at the bottom, a fine dark edge outside, a white one inside.' },
  { v: 'prism', label: 'G · Prism', note: 'After the glass icon tile: the spectrum running round inside the rim, as light bent by the glass; crisp edges.' },
  { v: 'bevel', label: 'H · Bevel', note: 'After the SPARK letters: a bevelled rim, bright on top, the colour gathering at the bottom, as thick glass catches light.' },
] as const;

function Lit({ look, children, round }: { look: string; children: React.ReactNode; round?: boolean }) {
  return (
    <span className={cx('hlx', `hlx--${look}`, round && 'hlx--round')}>
      {children}
    </span>
  );
}

export function HighlightLooksDemo() {
  return (
    <div className="hlx-page">
      <header className="dl-head">
        <h1>Next step · highlight</h1>
        <p>How Sparki lights up what to press next. Four looks, each on a menu item, an Ink button and a light button. Prototype only.</p>
      </header>
      <div className="hlx-list">
        {LOOKS.map((l) => (
          <section key={l.v} className="dl-tile hlx-row">
            <span className="dl-tile__label">{l.label}</span>
            <p className="dl-tile__note">{l.note}</p>
            <div className="hlx-stage">
              <span className="hlx-rail">
                <Lit look={l.v}>
                  <span className="hlx-nav">
                    <DrAiHead size={26} /> Ask Dr.AI
                  </span>
                </Lit>
              </span>
              <Lit look={l.v} round>
                <span className="hlx-btn hlx-btn--ink">Request proposal</span>
              </Lit>
              <Lit look={l.v} round>
                <span className="hlx-btn hlx-btn--light">New request</span>
              </Lit>
              <span className="hlx-sparki">
                <SparkiStill size={34} />
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
