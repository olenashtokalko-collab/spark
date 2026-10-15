// Prototype-only page (#/demo/typing): looks for the chat box once the user has
// typed something. Today that is a single Cobalt line round the rim. Every card is
// the real composer with one class swapped; each starts with text so the state
// shows, and you can clear it to see the resting glass, then type to see it light up.
import { PageHeader } from '../../components/ui/primitives';
import { Composer } from '../assistant/Composer';

const VARIANTS = [
  { id: 'today', name: '1 · Cobalt line (previous)', note: 'The earlier look: a 1.5px Cobalt line round the rim. Nothing else changes.', light: 'pool' },
  { id: 'halo', name: '2 · Cobalt halo (chosen, now in the app)', note: 'A finer Cobalt rim plus a soft, wide halo round the glass. The same colour, but it feels lit rather than outlined.', light: 'pool' },
  { id: 'spectrum', name: '3 · Spectrum rim', note: 'The brand spectrum on the edge: Cobalt on the left running into Ember on the right, the way the glass already refracts.', light: 'pool' },
  { id: 'ring', name: '4 · Living ring', note: 'Like the AI button: the spectrum runs slowly round the rim while the user types. The most alive of the set.', light: 'pool' },
  { id: 'noor', name: '5 · Noor underglow', note: 'The rim stays glass. Cobalt and Ember light pools under the box, as if it were lifted off the page.', light: 'haze' },
  { id: 'inner', name: '6 · Light from inside', note: 'Cobalt into Ember rises from the bottom edge behind the tools and the send button. The rim stays quiet.', light: 'pool' },
  { id: 'lift', name: '7 · Frost lift', note: 'No colour at all: the glass turns whiter and denser, the rim brightens and the box lifts a little off the page.', light: 'pool' },
  { id: 'edge', name: '8 · Lit bottom edge', note: 'A short spectrum line along the bottom edge, like the glass catching light. Everything else is the resting glass.', light: 'pool' },
] as const;

export function TypingDemo() {
  return (
    <div className="cdemo gvdemo tpdemo">
      <PageHeader title="Chat box while typing" sub="Eight looks for the typing state of the glass input. Each starts with text in it; clear it to see the resting state, type to see it light up." />
      <div className="gvdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className={`gvdemo__stage gvdemo__stage--${v.light}`}>
              <span className="gvdemo__light" aria-hidden />
              <Composer onSubmit={() => {}} className={`tp tp--${v.id}`} initial="What should we post for the Riyadh opening week?" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
