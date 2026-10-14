// Prototype-only page (#/demo/bubbles): looks for the user's message and for
// the "Spark is thinking" state, after the glass speech bubbles in the brand
// book's posts ("Make it brighter", the glowing bubble, "On it •••", p. 20).
import type { ReactNode } from 'react';
import { PageHeader } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';

const USER = [
  { id: 'today', name: '1 · Today', note: 'White glass pill with a soft Cobalt rim and glow. The reference point.' },
  { id: 'speech', name: '2 · Glass speech bubble', note: 'After “Make it brighter”: frosted white, a bright rim and a small tail towards you.' },
  { id: 'tint', name: '3 · Cobalt tint', note: 'Human = Cobalt: a light Cobalt wash inside the glass, Cobalt rim. Clearly yours, still calm.' },
  { id: 'solid', name: '4 · Solid Cobalt', note: 'The strongest: a Cobalt pill with white text, like the primary button.' },
  { id: 'ghost', name: '5 · Outline', note: 'No fill, a translucent line. The quietest; the answer gets all the attention.' },
  { id: 'ink', name: '6 · Ink', note: 'Mangrove Ink pill with Sand text. Reads like a note you wrote; strong contrast with the AI’s plain text.' },
] as const;

const THINK = [
  { id: 'dots', name: '1 · On it •••', note: 'The post as is: a glass bubble saying “On it” with three Ember dots bouncing in turn.' },
  { id: 'glow', name: '2 · Glowing bubble', note: 'The empty bubble from the post: the Noor light moves inside the glass while Spark works.' },
  { id: 'shimmer', name: '3 · Shimmer text', note: 'The orb breathes; “Thinking…” has a Cobalt-to-Ember light sweeping through the letters.' },
  { id: 'line', name: '4 · Light line', note: 'A thin spectrum line runs along the bottom of a glass pill, like progress without a number.' },
  { id: 'steps', name: '5 · Spoken steps', note: 'The orb with the current step in words, changing every few seconds, and soft Ember dots.' },
] as const;

function Stage({ children }: { children: ReactNode }) {
  return <div className="bbdemo__stage">{children}</div>;
}

function Thinking({ id }: { id: (typeof THINK)[number]['id'] }) {
  const orb = <FluidOrb size={30} active />;
  if (id === 'dots')
    return (
      <div className="bbthink">
        {orb}
        <span className="bb-glass bb-dots">
          On it
          <i />
          <i />
          <i />
        </span>
      </div>
    );
  if (id === 'glow')
    return (
      <div className="bbthink">
        {orb}
        <span className="bb-glass bb-glow" aria-label="Spark is thinking" />
      </div>
    );
  if (id === 'shimmer')
    return (
      <div className="bbthink">
        <span className="bb-breathe">{orb}</span>
        <span className="bb-shimmer">Thinking…</span>
      </div>
    );
  if (id === 'line')
    return (
      <div className="bbthink">
        {orb}
        <span className="bb-glass bb-line">Looking through your workspace</span>
      </div>
    );
  return (
    <div className="bbthink">
      {orb}
      <span className="bb-steps">
        <span className="bb-steps__track">
          <span>Reading the brief</span>
          <span>Searching your documents</span>
          <span>Checking social mentions</span>
          <span>Reading the brief</span>
        </span>
      </span>
      <span className="bb-dots bb-dots--bare">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

export function BubblesDemo() {
  return (
    <div className="cdemo bbdemo">
      <PageHeader title="Messages and thinking" sub="Looks for your message and for the moment Spark is working, after the glass speech bubbles in the brand book." />
      <h2 className="bbdemo__h">Your message</h2>
      <div className="bbdemo__grid">
        {USER.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <Stage>
              <div className={`bbuser bbuser--${v.id}`}>What are people saying about our brand right now?</div>
            </Stage>
          </section>
        ))}
      </div>
      <h2 className="bbdemo__h">Spark is thinking</h2>
      <div className="bbdemo__grid">
        {THINK.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <Stage>
              <Thinking id={v.id} />
            </Stage>
          </section>
        ))}
      </div>
    </div>
  );
}
