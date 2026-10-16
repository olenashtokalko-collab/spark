// Prototype-only page (#/demo/modal-spacing): the same two modals (the New request form and the "Request sent"
// confirmation) with different padding and gaps inside. The panel, the type and the colours are the real ones;
// only the spacing changes.
//   Now          the current spacing
//   A · Compact  tighter head, body and footer: more content, less air
//   B · Comfy    a little more everywhere
//   C · Airy     generous: the confirmation breathes, the form is longer
import { useState } from 'react';
import { ArrowRight, Check, Send, X } from 'lucide-react';
import { IconTile } from '../../components/ui/overlay';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import { RequestFields, defaultFields } from '../requests/CreateRequestDialog';

type Look = 'now' | 'a' | 'b' | 'c';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now', note: 'Head 36 px from the top, body 24 px, fields 16 px apart, footer 28 px from the edge.' },
  { id: 'a', name: 'A · Compact', note: 'Head 28, body 16 and 24 at the sides, fields 12 apart, footer 24. The form fits without scrolling on a laptop.' },
  { id: 'b', name: 'B · Comfy', note: 'Head 44, body 28 and 36 at the sides, fields 20 apart, footer 36. A little more air everywhere.' },
  { id: 'c', name: 'C · Airy', note: 'Head 56, body 36 and 48 at the sides, fields 26 apart, footer 48. The confirmation breathes; the form is longer.' },
];

function FormModal() {
  const [f, setF] = useState(() => ({ ...defaultFields(undefined, undefined), title: 'Spring campaign brief', description: 'A short brief for the spring campaign.' }));
  return (
    <div className="dialog dialog--md dialog--hero">
      <div className="dialog__head">
        <div>
          <IconTile icon={Send} />
          <h2 className="dialog__title">New request</h2>
          <p className="dialog__desc">Describe what you need. You’ll get questions or a proposal back.</p>
        </div>
        <button className="btn btn--ghost btn--sm btn--icon" aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div className="dialog__body">
        <RequestFields value={f} onChange={setF} errors={{}} idPrefix="ms" />
      </div>
      <div className="dialog__foot">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Send request</Button>
      </div>
    </div>
  );
}

function SentModal() {
  return (
    <div className="dialog dialog--md">
      <div className="dialog__body">
        <div className="req-done">
          <IconTile icon={Check} tone="ai" />
          <h2 className="req-done__title">Request sent</h2>
          <p className="req-done__reply">Your request has been sent successfully! You’ll usually receive a reply within 2 business days. We’ll notify you as soon as Spark responds.</p>
          <div className="req-done__actions">
            <Button variant="secondary">Close</Button>
            <Button variant="primary" iconRight={ArrowRight}>
              Go to requests
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalSpacingDemo() {
  return (
    <div className="cdemo msdemo">
      <PageHeader title="Modal spacing" sub="The same two modals with different padding and gaps inside. Only the spacing changes. Nothing here is applied to the app." />
      <div className="msdemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className={cx('gdemo__card', 'msp', `msp--${l.id}`)}>
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="msp__row">
              <div className="msp__stage">
                <FormModal />
              </div>
              <div className="msp__stage">
                <SentModal />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
