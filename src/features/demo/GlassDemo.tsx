// Prototype-only page (#/demo/glass): chat-input looks that carry the brand
// book's frosted glass (pp. 10, 14, 16). Every card is the real composer with
// one class swapped, on a Sand stage with its own light behind it, so the
// transparency has something to show. Type in any of them.
import { PageHeader } from '../../components/ui/primitives';
import { Composer } from '../assistant/Composer';

const VARIANTS = [
  { id: 'today', name: '1 · Today', note: 'The current Brand A input: a solid white card on the gradient. The reference point.', light: 'pool' },
  { id: 'clear', name: '2 · Clear pill', note: 'After the glass plaque (p. 16): almost transparent, a thick bright rim, and the Noor light pooled underneath it.', light: 'under' },
  { id: 'frost', name: '3 · Frosted over light', note: 'After the hero logo (p. 10): the spectrum sits behind the input and the frosted glass softens it. White text.', light: 'behind' },
  { id: 'inside', name: '4 · Spectrum inside', note: 'The light is inside the glass: Cobalt on the left melting into Ember on the right, with a milky frost on top.', light: 'none' },
  { id: 'tile', name: '5 · Tinted tile', note: 'After the glass tiles (p. 14): Haze-tinted frost with the spectrum gathered in one corner, a lit top edge.', light: 'corner' },
  { id: 'slab', name: '6 · Thick slab', note: 'Glass with visible thickness: a white body, a lit bevel and an edge you can see, standing on its own glow.', light: 'under' },
] as const;

export function GlassDemo() {
  return (
    <div className="cdemo gvdemo">
      <PageHeader title="Glass chat input" sub="Six inputs that carry the brand book’s frosted glass. Each sits on Sand with its own light behind it; type to see the typing state." />
      <div className="gvdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className={`gvdemo__stage gvdemo__stage--${v.light}`}>
              <span className="gvdemo__light" aria-hidden />
              <Composer onSubmit={() => {}} className={`gv gv--${v.id}`} placeholder="Ask Spark anything" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
