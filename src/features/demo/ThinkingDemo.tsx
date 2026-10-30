// Prototype-only page (#/demo/thinking): how an answer looks while Spark works, beside the client's reference (a
// glass speech bubble saying "On it" with three warm dots, and a clear capsule full of Noor light). Each look
// reuses the glass of our filter tabs (a clear bubble: white rim, gloss, no fill of its own) and runs the same
// steps, so they can be compared side by side.
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '../../components/ui/primitives';
import { SparkDisc } from '../../components/ui/BrandSpark';

const STEPS = ['Reading your request', 'Checked open requests and Q4 budget', 'Looking at Riyadh audiences', 'Writing the answer'];

const LOOKS = [
  { v: 'now', label: 'Now', note: 'A quiet line of grey text beside the spark, the time and a chevron.' },
  { v: 'bubble', label: 'A · Glass bubble', note: 'The step in the clear glass of the filter tabs’ bubble (white rim, gloss, no fill); a soft shine passes over the words while Spark works.' },
  { v: 'onit', label: 'B · On it', note: 'As the reference’s last bubble: “On it” in a warm glass bubble with three Ember dots; the step beside it in grey.' },
  { v: 'lens', label: 'C · Light in the glass', note: 'As the reference’s middle bubble: the glass capsule holds the Noor light (Cobalt to Ember), breathing, the step on it in Ink.' },
] as const;

function useStep() {
  const [i, setI] = useState(0);
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setT((x) => x + 1);
      setI((x) => (x + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return { step: STEPS[i], secs: (t % 9) + 1 };
}

function Think({ look }: { look: (typeof LOOKS)[number]['v'] }) {
  const { step, secs } = useStep();
  return (
    <div className="msg-ai thk">
      <div className="msg-ai__avatar is-working">
        <SparkDisc size={30} />
      </div>
      <div className="thk__body">
        {look === 'now' && (
          <span className="thk-now">
            {step} <b>{secs}s</b> <ChevronDown size={13} />
          </span>
        )}
        {look === 'bubble' && (
          <span className="thk-glass">
            <span className="thk-shine" key={step}>
              {step}
            </span>
            <b>{secs}s</b>
          </span>
        )}
        {look === 'onit' && (
          <span className="thk-onit-row">
            <span className="thk-glass thk-glass--warm thk-glass--tail">
              On it
              <span className="thk-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </span>
            <span className="thk-step">{step}</span>
          </span>
        )}
        {look === 'lens' && (
          <span className="thk-glass thk-glass--lens">
            <span className="thk-glass__light" aria-hidden />
            <span key={step} className="thk-fade">
              {step}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export function ThinkingDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="While Spark thinks" sub="The working state of an answer, in the glass of our filter tabs, after the client’s reference. All four run the same steps. Prototype only." />
      <div className="thk-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="thk-card">
            <span className="gk-label">{l.label}</span>
            <div className="thk-stage">
              <div className="msg-user thk-user">
                <div className="msg-user__bubble">I have an idea for the Riyadh launch.</div>
              </div>
              <Think look={l.v} />
            </div>
            <p className="fdm-about">{l.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
