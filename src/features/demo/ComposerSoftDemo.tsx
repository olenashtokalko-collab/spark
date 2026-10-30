// Prototype-only page (#/demo/composer-soft): a new chat as it is now, beside the same page with only the chat box's
// window changed to the soft style of the client's reference (tryclico.com): no glass rim round it, a pale box lifted
// off the page by a white top edge and two soft warm shadows, 24px corners. The page, its light, the buttons in the
// box (Attach, Send) and the suggestions below stay Spark's own. A third look takes the white out of the box and
// makes the box itself the glass (one edge, no rim round it), so the light under it shows through.
import { ChatStart } from '../assistant/ChatStart';
import { PageHeader } from '../../components/ui/primitives';

export function ComposerSoftDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="Chat box · soft window" sub="A new chat as it is now, and the same page with only the box's window in the reference's soft style. Everything else is ours. Prototype only." />
      <div className="scd-grid">
        <section className="scd-col">
          <span className="gk-label">Now · the glass rim round a white box</span>
          <div className="scd-page">
            <ChatStart onAsk={() => undefined} />
          </div>
        </section>
        <section className="scd-col">
          <span className="gk-label">No white fill · one clear glass box</span>
          <div className="scd-page scd-page--clear">
            <ChatStart onAsk={() => undefined} />
          </div>
        </section>
        <section className="scd-col">
          <span className="gk-label">Soft window · after the reference</span>
          <div className="scd-page scd-page--soft">
            <ChatStart onAsk={() => undefined} />
          </div>
        </section>
      </div>
    </div>
  );
}
