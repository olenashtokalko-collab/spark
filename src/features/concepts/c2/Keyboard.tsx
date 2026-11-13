import { useCallback, useEffect, useRef, useState } from 'react'
import { services, loop, type ServiceKey } from '../shared/data'
import { Head } from './Panels'
import { IReturn } from './Icons'
import { send, askDrAI } from './hooks'
import s from './Home.module.css'

/** S·P·A·R·K as glass keys = the request launcher, and the page's one colour moment.
 *  Press a key (click or type the letter) → the screen opens a one-line brief for that service → Send to Spark.
 *  Idle (C2): one quiet strip — the loop as three words, and a way in for "I'm not sure which": Ask Dr.AI. */
export default function Keyboard({ d }: { d: number }) {
  const [active, setActive] = useState<ServiceKey | null>(null)
  const [pressed, setPressed] = useState<ServiceKey | null>(null)
  const [brief, setBrief] = useState('')
  const [sent, setSent] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const activeRef = useRef<ServiceKey | null>(null)
  const timer = useRef(0)
  useEffect(() => { activeRef.current = active }, [active])

  const press = useCallback((k: ServiceKey, fromKeyboard = false) => {
    window.clearTimeout(timer.current)
    setPressed(k)
    timer.current = window.setTimeout(() => setPressed(null), 140)
    const opening = activeRef.current !== k
    activeRef.current = opening ? k : null
    setActive(opening ? k : null)
    setSent(false)
    if (fromKeyboard) {
      const r = ref.current?.getBoundingClientRect()
      if (r && (r.top < 0 || r.bottom > window.innerHeight)) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      // keyboard-first: the letter opens the brief and the cursor is already in it
      if (opening) window.setTimeout(() => input.current?.focus(), 40)
    }
  }, [])

  const close = () => { activeRef.current = null; setActive(null); setSent(false); input.current?.blur() }

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const k = e.key.toLowerCase()
      if (k.length === 1 && 'spark'.includes(k)) { e.preventDefault(); press(k as ServiceKey, true) }
      else if (e.key === 'Escape' && activeRef.current) close()
    }
    window.addEventListener('keydown', on)
    return () => { window.removeEventListener('keydown', on); window.clearTimeout(timer.current) }
  }, [press])

  const svc = services.find(x => x.key === active)

  function submit() {
    if (!svc) return
    const t = brief.trim()
    send({ title: t ? t[0].toUpperCase() + t.slice(1) : svc.title, service: svc.key, from: 'From Home' }, true)
    setBrief('')
    setSent(true)
  }
  function toDrAI() {
    if (!svc) return
    askDrAI({ text: brief.trim() || svc.title, service: svc.key })
    setBrief('')
  }

  return (
    <section ref={ref} className={`${s.panel} ${s.glass} ${s.keys} ${s.boot}`} style={{ ['--d' as string]: `${d}ms` }} aria-label="Start a request">
      <Head label="Start a request" />
      <div className={s.keyRow} role="toolbar" aria-label="Spark services">
        {services.map((x, i) => (
          <button
            key={x.key}
            className={`${s.key} ${active === x.key ? s.keyOn : ''} ${pressed === x.key ? s.keyDown : ''}`}
            style={{ ['--c' as string]: `var(--svc-${x.key})`, ['--kd' as string]: `${d + 300 + i * 70}ms` }}
            aria-pressed={active === x.key}
            aria-keyshortcuts={x.letter}
            aria-label={`${x.letter}: ${x.title}`}
            onClick={() => press(x.key)}
          >
            {/* the live site's glass keycap render (letter lit inside coloured glass) */}
            <img src={`concepts/vc/key-${x.key}.png`} alt="" className={s.keyCap} width={96} height={108} draggable={false} />
            <span className={s.keyLabel}>{x.label}</span>
          </button>
        ))}
      </div>

      <div className={`${s.screen} ${svc ? s.screenLit : ''}`} style={svc ? { ['--c' as string]: `var(--svc-${svc.key})` } : undefined}>
        {svc ? (
          <div key={svc.key} className={`${s.screenIn} ${s.screenSvc}`}>
            <div className={s.svcMain}>
              <span className={s.svcLabel}>{svc.letter} — {svc.title}</span>
              <p className={s.svcLine}>{svc.line}</p>
            </div>
            <ul className={s.svcItems} aria-label={`${svc.label}: start from`}>
              {svc.items.map(it => (
                <li key={it}>
                  <button type="button" onClick={() => { setBrief(it); setSent(false); input.current?.focus() }}><i />{it}</button>
                </li>
              ))}
            </ul>
            <form className={s.brief} onSubmit={e => { e.preventDefault(); submit() }}>
              <span className={`${s.briefPrompt} ${sent ? s.briefSent : ''}`} aria-live="polite">
                {sent ? <><i className={`${s.led} ${s.ledSent}`} />{loop.sentLine}</> : 'Tell Dr.AI what you need, or send straight to Spark'}
              </span>
              <div className={s.briefRow}>
                <label htmlFor="c-brief" className={s.srOnly}>Your request for {svc.title}</label>
                <input
                  id="c-brief"
                  ref={input}
                  className={s.briefInput}
                  value={brief}
                  placeholder={`e.g. ${svc.items[0]}`}
                  autoComplete="off"
                  onChange={e => { setBrief(e.target.value); setSent(false) }}
                  onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); close() } }}
                />
                <button type="button" className={`${s.btn} ${s.btnOutline}`} onClick={toDrAI}>Ask Dr.AI</button>
                <button type="submit" className={`${s.btn} ${s.btnSmoke} ${s.btnSend}`}>
                  {loop.sendLabel} <IReturn />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div key="idle" className={`${s.screenIn} ${s.screenIdle}`}>
            <ol className={s.loop} aria-label={loop.title}>
              {loop.steps.map(st => (
                <li key={st.n}><span className={s.methodN}>{st.n}</span>{st.label}</li>
              ))}
            </ol>
            {/* SAMPLE copy: the way in for someone who can't pick a service yet */}
            <button type="button" className={`${s.btn} ${s.btnOutline}`} onClick={() => askDrAI({ text: '' })}>Not sure which? Ask Dr.AI</button>
          </div>
        )}
      </div>
    </section>
  )
}
