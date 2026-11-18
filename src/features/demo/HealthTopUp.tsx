// Top up on Health, built on the portal's Dialog (18 Nov, the consistency audit, P3: "two modal implementations"):
// the same head, fields, foot and close as New request, so one modal is kept and shown in the Storybook. What it says
// and does is as the concepts' Top up the client liked: the balance now, four amounts as tiles, another amount, the new
// balance, Cancel and Top up; then "Balance updated." Prototype only: no payment happens.
import { useEffect, useState } from 'react';
import { Dialog } from '../../components/ui/overlay';
import { Button, Field } from '../../components/ui/primitives';

const AMOUNTS = [25, 50, 100, 250];
const fmt = (n: number) => n.toFixed(2);

export function HealthTopUp({ open, balance, onClose, onTopUp }: { open: boolean; balance: number; onClose: () => void; onTopUp: (amount: number) => void }) {
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState('');
  const [done, setDone] = useState<number | null>(null);
  // a fresh form each time it opens
  useEffect(() => {
    if (open) {
      setAmount(50);
      setCustom('');
      setDone(null);
    }
  }, [open]);
  const value = custom ? Math.max(0, Math.floor(Number(custom) || 0)) : amount;
  const confirm = () => {
    if (!value) return;
    onTopUp(value);
    setDone(value);
  };

  if (done !== null)
    return (
      <Dialog
        open={open}
        onClose={onClose}
        size="md"
        className="dlg-spark dlg-topup"
        title="Balance updated."
        description={`USD ${done} added. The receipt is in Documents.`}
        footer={
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        }
      >
        <span className="tu-big">{fmt(balance)}</span>
      </Dialog>
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      className="dlg-spark dlg-topup"
      title="Top up your balance."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirm} disabled={!value}>
            Top up
          </Button>
        </>
      }
    >
      <div className="stack">
        <div className="tu-row">
          <span>Current balance</span>
          <b>
            {fmt(balance)} <i>USD</i>
          </b>
        </div>
        <div className="tu-chips" role="radiogroup" aria-label="Amount">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={!custom && amount === a}
              className={!custom && amount === a ? 'tu-chip is-on' : 'tu-chip'}
              onClick={() => {
                setAmount(a);
                setCustom('');
              }}
            >
              <b>{a}</b>
              <span>USD</span>
            </button>
          ))}
        </div>
        <Field label="Other amount" htmlFor="tu-other">
          <input
            id="tu-other"
            className="input"
            inputMode="numeric"
            placeholder="e.g. 400"
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          />
        </Field>
        <div className="tu-row tu-row--sum">
          <span>New balance</span>
          <b>{fmt(balance + value)}</b>
        </div>
        <p className="tu-note">Charged to the card on file. Receipts go to Documents.</p>
      </div>
    </Dialog>
  );
}
