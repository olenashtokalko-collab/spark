// Prototype-only page (#/demo/ai-button): looks for the "Start a chat" button
// (the AI action) after the brand book: Ember and Noor mean AI (p. 19), glass
// carries the light (p. 16, 18). Each is the real Button, next to the Cobalt
// primary it sits beside on the Requests page. Hover them.
import { Plus } from 'lucide-react';
import { Button, PageHeader } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';

const VARIANTS = [
  { id: 'today', name: '1 · Today', note: 'Dark-to-light pill with a moving Cobalt-to-Ember ring and the orb. The reference point.' },
  { id: 'plaque', name: '2 · Glass plaque', note: 'After the glass logo plaque (p. 16): a clear glass pill with a bright rim and the Noor light glowing underneath. Ink text.' },
  { id: 'spectrum', name: '3 · Spectrum inside', note: 'After the hero logo (p. 10): the light is inside the glass, Cobalt melting into Ember, milky frost on top. White text.' },
  { id: 'ink', name: '4 · Ink with the orb', note: '“Ink objects carry the spark” (p. 18): a Mangrove Ink pill, Sand text, the orb lit in colour. Calm next to Cobalt.' },
  { id: 'ember', name: '5 · Ember', note: '“Ember for AI” (p. 19): a soft glossy Ember pill with Ink text (5.1:1). Clearly AI, clearly different from the Cobalt primary.' },
  { id: 'knob', name: '6 · Orb knob', note: 'After the toggle (p. 16): a glass pill with a large orb sitting at its left end, like the switch knob.' },
] as const;

export function AiButtonDemo() {
  return (
    <div className="cdemo aibdemo">
      <PageHeader title="“Start a chat” button" sub="Six looks for the AI action after the brand book: Ember and Noor mean AI, glass carries the light. Each sits next to the Cobalt primary; hover them." />
      <div className="aibdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="aibdemo__stage">
              <Button
                variant="ai"
                className={`aib aib--${v.id}`}
                lead={<FluidOrb size={v.id === 'knob' ? 30 : 20} className={v.id === 'knob' ? 'aib-knob' : undefined} />}
              >
                Start a chat
              </Button>
              <Button variant="primary" icon={Plus}>
                New request
              </Button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
