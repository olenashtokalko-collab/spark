// Topping up the company's credits (the balance itself shows on Home, beside the company's name). The
// top-up: pay by card, or contact Spark (invoice, bank transfer, larger amounts). Prototype: the card payment
// is simulated and adds the amount at once; the real one opens the payment provider's checkout here.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Mail, Plus } from 'lucide-react';
import { useStore } from '../../state/store';
import { Button, Field, Textarea, cx } from '../ui/primitives';
import { Dialog } from '../ui/overlay';
import { useToast } from '../ui/toast';

const AMOUNTS = [100, 250, 500, 1000];
const SPARK_EMAIL = 'hello@sparkstudios.example';
export const usd = (n: number) => `USD ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function TopUpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const [method, setMethod] = useState<'card' | 'contact'>('card');
  const [amount, setAmount] = useState(250);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setBusy(false);
    setNote('');
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    if (method === 'card') {
      actions.topUp(amount);
      toast({ title: `${usd(amount)} added to your credits`, body: `Balance: ${usd(state.credits + amount)}` });
    } else {
      toast({ title: 'Message sent to Spark', body: 'We’ll reply by email within one business day.' });
    }
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      size="sm"
      title="Top up credits"
      description={`Balance: ${usd(state.credits)}`}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" loading={busy} onClick={submit}>
            {method === 'card' ? `Pay ${usd(amount)}` : 'Send to Spark'}
          </Button>
        </>
      }
    >
      <div className="topup">
        {/* The two ways to top up, as two cards to choose from. */}
        <div className="topup__methods" role="radiogroup" aria-label="How to top up">
          <button type="button" role="radio" aria-checked={method === 'card'} className={cx('topup__method', method === 'card' && 'is-on')} onClick={() => setMethod('card')}>
            <CreditCard size={18} strokeWidth={1.7} />
            <span className="topup__method-title">Pay by card</span>
            <span className="topup__method-sub">Added right away</span>
          </button>
          <button type="button" role="radio" aria-checked={method === 'contact'} className={cx('topup__method', method === 'contact' && 'is-on')} onClick={() => setMethod('contact')}>
            <Mail size={18} strokeWidth={1.7} />
            <span className="topup__method-title">Contact us</span>
            <span className="topup__method-sub">Invoice or bank transfer</span>
          </button>
        </div>

        {method === 'card' ? (
          <div className="topup__body">
            <span className="topup__label">Amount</span>
            <div className="topup__amounts" role="radiogroup" aria-label="Amount">
              {AMOUNTS.map((a) => (
                <button key={a} type="button" role="radio" aria-checked={amount === a} className={cx('topup__amount', amount === a && 'is-on')} onClick={() => setAmount(a)}>
                  USD {a.toLocaleString('en-US')}
                </button>
              ))}
            </div>
            <p className="topup__hint">You’ll pay on a secure page. A receipt goes to {me.email}.</p>
          </div>
        ) : (
          <div className="topup__body">
            <Field label="Message" htmlFor="topup-note" optional>
              <Textarea id="topup-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="How much you need, and how you’d like to pay." />
            </Field>
            <p className="topup__hint">
              Or write to us at <a href={`mailto:${SPARK_EMAIL}`}>{SPARK_EMAIL}</a>.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/** What the credits are: the balance, where it came from, what's been used, what credits pay for, and Top up.
 *  The same card on Home (on hover, beside the company's name) and from the account menu (on click). */
export const FREE_CREDITS = 100;
export function CreditsCard({ left, total, onTopUp }: { left: number; total: number; onTopUp: () => void }) {
  const rows: [string, string][] = [
    ['Free credits', usd(FREE_CREDITS)],
    ['Topped up', usd(Math.max(0, total - FREE_CREDITS))],
    ['Used so far', usd(Math.max(0, total - left))],
  ];
  return (
    <>
      <span className="hl-cind__big">{usd(left)}</span>
      <span className="hl-cind__sub">credits available</span>
      <dl className="hl-cind__rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <span className="hl-cind__note">
        <b>Credits pay for chats and research.</b> Work from the Spark team is quoted in its proposals.
      </span>
      <Button variant="primary" icon={Plus} onClick={onTopUp}>
        Top up
      </Button>
    </>
  );
}

/** The credits card from the account menu: on hover of its credits row, beside the menu, over the page.
 *  It stays while the pointer moves onto it; Top up hands over to the dialog (kept by the menu, so it
 *  outlives the card). Escape or a click elsewhere closes it. */
export function CreditsOverlay({ anchor, onClose, onTopUp, onEnter, onLeave }: { anchor: HTMLElement; onClose: () => void; onTopUp: () => void; onEnter: () => void; onLeave: () => void }) {
  const { state } = useStore();
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);
  const card = useRef<HTMLDivElement>(null);

  // Beside the account menu, its foot level with the menu's foot (the menu opens upward from the account).
  useLayoutEffect(() => {
    const menu = (anchor.closest('.popover') ?? anchor).getBoundingClientRect();
    setPos({ left: Math.min(menu.right + 8, window.innerWidth - 316), bottom: Math.max(8, window.innerHeight - menu.bottom) });
  }, [anchor]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => !card.current?.contains(e.target as Node) && !anchor.contains(e.target as Node) && onClose();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={card}
      className="hl-cind__card credits-overlay"
      role="dialog"
      aria-label="Credits"
      style={pos ? { left: pos.left, bottom: pos.bottom } : { visibility: 'hidden' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <CreditsCard left={state.credits} total={state.creditsTotal} onTopUp={onTopUp} />
    </div>,
    document.body,
  );
}
