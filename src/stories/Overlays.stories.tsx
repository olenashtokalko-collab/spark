import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog } from '../components/ui/overlay';
import { Button, Field } from '../components/ui/primitives';
import { HealthTopUp } from '../features/demo/HealthTopUp';
import './stories.css';

// One modal (18 Nov, the audit): the portal's Dialog in Health's dress (.dlg-spark): overlay glass with its corner
// light, 32 px corners, a 28 px title, the glass close that turns, sentence-case labels, Cancel and the main action.
const meta: Meta = { title: 'Overlays/Modal', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

function NewRequest() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ padding: 24 }}>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        New request
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="md"
        className="dlg-spark"
        title="New request."
        description="Describe what you need. You’ll get questions or a proposal back."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Send request
            </Button>
          </>
        }
      >
        <div className="stack">
          <Field label="Title" htmlFor="sbm-title">
            <input id="sbm-title" className="input" placeholder="e.g. Trademark check for Riyadh" />
          </Field>
          <Field label="What do you need?" htmlFor="sbm-desc">
            <textarea id="sbm-desc" className="input textarea" rows={4} placeholder="Context, what a good result looks like, any constraints." />
          </Field>
          <Field label="Budget" htmlFor="sbm-budget" optional hint="A range helps Spark scope the right proposal.">
            <input id="sbm-budget" className="input" placeholder="e.g. AED 20–40k" />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
export const Form: Story = { render: () => <NewRequest /> };

function TopUp() {
  const [open, setOpen] = useState(true);
  const [balance, setBalance] = useState(100);
  return (
    <div style={{ padding: 24 }}>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        Top up
      </Button>
      <HealthTopUp open={open} balance={balance} onClose={() => setOpen(false)} onTopUp={(n) => setBalance((b) => b + n)} />
    </div>
  );
}
/** Top up, on the same Dialog: the amounts as tiles, the new balance, then "Balance updated." */
export const TopUpBalance: Story = { name: 'Top up', render: () => <TopUp /> };
