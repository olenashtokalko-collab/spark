// Prototype-only page (#/demo/composer): looks for the chat box while the user
// types. Every card is the real composer with one glow class swapped; each
// starts with text in it so the glow shows, and you can type to try it.
import { PageHeader } from '../../components/ui/primitives';
import { Composer } from '../assistant/Composer';

const VARIANTS = [
  { id: 'now', name: '1 · Blue glow (chosen)', note: 'The original violet glow, now in Spark blue: a lit edge and a wide blue glow round the box.' },
  { id: 'blue', name: '2 · Spark blue edge', note: 'A thin brand-blue edge and a soft blue halo. The same idea in the product’s own colour.' },
  { id: 'ring', name: '3 · Living ring', note: 'The chat button’s ring: shades of Spark blue run slowly round the edge while you type.' },
  { id: 'pool', name: '4 · Light pool', note: 'No edge at all; blue light pools under the box as if it sat on a lit surface.' },
  { id: 'top', name: '5 · Lit top edge', note: 'Like the buttons: a bright line along the top edge and a faint blue tint inside.' },
  { id: 'grad', name: '6 · Gradient edge', note: 'A still edge that fades from Spark blue to lilac. Calm, but clearly “on”.' },
  { id: 'inner', name: '7 · Inner glow', note: 'Light rises from inside the bottom of the box, behind the buttons. The edge stays quiet.' },
  { id: 'quiet', name: '8 · Quiet', note: 'Barely there: the edge just turns a little lighter. The send button does the talking.' },
] as const;

export function ComposerDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="Chat box while typing" sub="Eight looks for the composer once the user starts typing. Each one starts with text in it; clear it to see the resting state, type to see it light up." />
      <div className="gdemo">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="gdemo__stage">
              <Composer onSubmit={() => {}} size="lg" initial="What should we post for the Riyadh opening week?" className={`cg cg--${v.id}`} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
