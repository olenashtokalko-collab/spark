import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import t from './topup.module.css'

/*
 * Top-up modal, shared by E's balance panel and A2's sidebar budget
 * (designer, 12 Nov: "add a plus icon that opens a modal to top up the balance" · "budget with a way to add money").
 * Prototype only: no payment happens; confirming just adds the amount to the figure shown on Home.
 * Amounts and the "payment method on file" line are SAMPLE copy (the client never discussed money).
 * `noun` is the word the calling screen uses for the money: "balance" (E) or "budget" (A2).
 */

const AMOUNTS = [25, 50, 100, 250]
const fmt = (n: number) => n.toFixed(2)

export default function TopUp({ balance, onClose, onTopUp, noun = 'balance' }: { balance: number; onClose: () => void; onTopUp: (amount: number) => void; noun?: 'balance' | 'budget' }) {
  const Noun = noun[0].toUpperCase() + noun.slice(1)
  const [amount, setAmount] = useState<number>(50)
  const [custom, setCustom] = useState('')
  const [done, setDone] = useState(false)
  const first = useRef<HTMLButtonElement>(null)
  const card = useRef<HTMLDivElement>(null)

  const value = custom ? Math.max(0, Math.floor(Number(custom) || 0)) : amount
  const next = balance + value

  useEffect(() => {
    first.current?.focus()
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = prev }
  }, [onClose])

  const confirm = () => {
    if (!value) return
    onTopUp(value)
    setDone(true)
  }

  // portal to <body>: the hero's backdrop-filter would otherwise trap position: fixed inside the card
  return createPortal(
    <div className={t.wrap} role="presentation" onMouseDown={e => { if (!card.current?.contains(e.target as Node)) onClose() }}>
      <div className={t.scrim} aria-hidden />
      <div ref={card} className={t.card} role="dialog" aria-modal="true" aria-labelledby="topup-title">
        <span className={t.light} aria-hidden />
        <button className={t.close} onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>

        {!done ? (
          <>
            <span className={t.label}>{Noun} · USD</span>
            <h2 id="topup-title" className={t.title}>Top up your {noun}.</h2>
            <div className={t.now}>
              <span className={t.nowLabel}>Now</span>
              <span className={t.fig}>{fmt(balance)}</span>
            </div>

            <div className={t.chips} role="radiogroup" aria-label="Amount">
              {AMOUNTS.map((a, i) => (
                <button
                  key={a}
                  ref={i === 1 ? first : undefined}
                  role="radio"
                  aria-checked={!custom && amount === a}
                  className={`${t.chip} ${!custom && amount === a ? t.chipOn : ''}`}
                  onClick={() => { setAmount(a); setCustom('') }}
                >
                  <span className={t.chipFig}>{a}</span>
                  <span className={t.chipUnit}>USD</span>
                </button>
              ))}
            </div>

            <label className={t.field}>
              <span className={t.fieldLabel}>Other amount</span>
              <input
                inputMode="numeric"
                placeholder="e.g. 400"
                value={custom}
                onChange={e => setCustom(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              />
            </label>

            <div className={t.sum}>
              <span>New {noun}</span>
              <b>{fmt(next)}</b>
            </div>
            <p className={t.note}>Charged to the card on file. Receipts go to Documents.</p>

            <div className={t.actions}>
              <button className={t.primary} onClick={confirm} disabled={!value}>Top up · USD {value}</button>
              <button className={t.ghost} onClick={onClose}>Cancel</button>
            </div>
          </>
        ) : (
          <div className={t.doneBox}>
            <span className={t.label}>{Noun} · USD</span>
            <h2 id="topup-title" className={t.title}>{Noun} updated.</h2>
            <span className={t.figBig}>{fmt(balance)}</span>
            <p className={t.note}>USD {value} added. The receipt is in Documents.</p>
            <div className={t.actions}>
              <button className={t.primary} onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
