// Prototype-only page (#/demo/metal-button, 11 Nov): the metal-ring glass button from adamperlis.com, rebuilt with
// Paper Shaders' Liquid Metal, as the reference (chrome) and in Spark's light (the Noor spectrum). Hover and press them.
import { ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { MetalButton, type MetalTone } from '../../components/ui/MetalButton';
import '../../styles/metal.css';

const TONES: { v: MetalTone; label: string }[] = [
  { v: 'chrome', label: 'Chrome · as on adamperlis.com' },
  { v: 'spark', label: 'Spark · Noor spectrum, Cobalt to Ember' },
];

function Buttons({ tone }: { tone: MetalTone }) {
  return (
    <div className="mbd-row">
      <MetalButton tone={tone}>
        Run <CornerDownLeft size={15} />
      </MetalButton>
      <MetalButton tone={tone}>
        Request a report <ArrowRight size={15} />
      </MetalButton>
      <MetalButton tone={tone}>
        <Sparkles size={15} /> Ask Dr.AI
      </MetalButton>
    </div>
  );
}

/** Ours beside adamperlis.com's own values, both in Spark's colours. */
function SideBySide() {
  return (
    <div className="mbd-vs">
      <div>
        <span className="mbd-label">Spark · ours</span>
        <MetalButton tone="spark">
          Request a report <ArrowRight size={15} />
        </MetalButton>
        <small>Lines 1.8, faster on hover (3). Metal only in the rim, glass white 10%, brighter on hover. Radius 12.</small>
      </div>
      <div>
        <span className="mbd-label">adamperlis.com · our colours</span>
        <MetalButton tone="spark" profile="reference">
          Request a report <ArrowRight size={15} />
        </MetalButton>
        <small>Lines 1, the same on hover. Glass white 42% over the whole metal, clearer on hover (22%). Radius 10.</small>
      </div>
    </div>
  );
}

export function MetalButtonDemo() {
  return (
    <div className="mbd">
      <span className="mbd-eyebrow">Prototype · Metal button</span>
      <h1>Glass in a ring of light.</h1>
      <p className="mbd-sub">
        The button from adamperlis.com: a glass face, a thin ring of moving liquid metal with red and blue at its edges,
        and the ring’s glow around it. Hover to clear the glass and brighten the glow; press to sink it.
      </p>
      <div className="mbd-pair">
        <section className="mbd-stage">
          <span className="mbd-label">Side by side · on Sand</span>
          <SideBySide />
        </section>
        <section className="mbd-stage mbd-stage--noor">
          <span className="mbd-label">Side by side · over the Noor glow</span>
          <SideBySide />
        </section>
      </div>
      {TONES.map((t) => (
        <div key={t.v} className="mbd-pair">
          <section className="mbd-stage">
            <span className="mbd-label">{t.label} · on Sand</span>
            <Buttons tone={t.v} />
          </section>
          <section className="mbd-stage mbd-stage--noor">
            <span className="mbd-label">{t.label} · over the Noor glow</span>
            <Buttons tone={t.v} />
          </section>
        </div>
      ))}
      <p className="mbd-note">
        Built as on the reference: Paper Shaders’ Liquid Metal (Apache-2.0) runs once in a hidden WebGL canvas, and each
        button copies its frame into its own ring, so many buttons cost one shader. It pauses off screen and stays still
        with reduced motion. The Spark tone keeps the metal’s light and lays the brand spectrum over its colour.
      </p>
    </div>
  );
}
