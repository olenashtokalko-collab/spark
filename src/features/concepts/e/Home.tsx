import { useEffect, useRef, useState } from 'react'
import Logo from '../shared/Logo'
import Mascot, { type MascotState } from '../shared/Mascot'
import { company, user, readyReports, lockedReports, consultation, notifications, requestStates, reportAction, balance } from '../shared/data'
import { sendToSpark } from '../shared/requests'
import { RailGlow } from './Rails'
import TopUp from '../shared/TopUp'
import s from './Home.module.css'

/*
 * Variant E — "Studio": the designer's improved Home from Figma
 * (file g1Esgsw9cfczby9LA0sQBv, node 22:957 "Layout 1").
 * Transfer rules from the designer: brand fonts only (Diatype Extended / Diatype Mono / Doto),
 * whole pixels on a 4px step. Copy and sample data come from data.ts.
 * Round 2 for E (designer's calls, 12 Nov): reports are requested from Spark instead of unlocked for a price,
 * but the balance panel from her Figma stays in the hero ("let's bring the balance back").
 */

const tiles: Record<string, { img: string; face: [number, number] }> = {
  competitors: { img: 'concepts/vd/tile-violet.png', face: [45, 51] },
  reviews: { img: 'concepts/vd/tile-orange.png', face: [39, 50] },
  search: { img: 'concepts/vd/tile-blue.png', face: [42, 49] },
}


/** Figma's 18px lucide icons, centred in a 20px box (4px grid). */
const Icon = ({ src, size = 18, box = 20 }: { src: string; size?: number; box?: number }) => (
  <span className={s.icon} style={{ width: box, height: box }} aria-hidden>
    <img src={src} width={size} height={size} alt="" />
  </span>
)

function Sidebar({ collapsed, onToggle, onAsk }: { collapsed: boolean; onToggle: () => void; onAsk: () => void }) {
  return (
    <nav className={`${s.rail} ${collapsed ? s.railCollapsed : ''}`} aria-label="Main">
      <div className={s.railHead}>
        <a href="#e" className={s.wordmark} aria-label="Spark Studios home">
          {!collapsed && <Logo height={24} className={s.wordmarkFull} />}
          <img src="concepts/img/spark-icon.webp" width={32} height={32} alt="" className={collapsed ? undefined : s.wordmarkIcon} />
        </a>
        <button className={s.toggle} onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <span className={s.toggleGlyph}>
            <img src="concepts/ve/toggle-a.svg" alt="" className={s.tA} />
            <img src="concepts/ve/toggle-b.svg" alt="" className={s.tB} />
            <img src="concepts/ve/toggle-c.svg" alt="" className={s.tC} />
          </span>
        </button>
      </div>

      <div className={s.railNav}>
        <a href="#e" className={`${s.railBtn} ${s.railBtnOn}`} aria-current="page">
          <Icon src="concepts/ve/i-home.svg" /><span className={s.railLabel}>Home</span>
        </a>
        <a href="#e" className={s.railBtn}>
          <Icon src="concepts/ve/i-requests.svg" /><i className={s.railDot} /><span className={s.railLabel}>Requests</span>
        </a>
        <a href="#e" className={s.railBtn}>
          <Icon src="concepts/ve/i-docs.svg" /><i className={s.railDot} /><span className={s.railLabel}>Documents</span>
        </a>
      </div>

      <button className={s.ask} onClick={onAsk}>
        {collapsed ? 'AI' : 'Ask Dr.AI'}
      </button>

      <div className={s.railSpacer} />

      <button className={s.railBtn} aria-label={`Notifications, ${notifications} unread`}>
        <Icon src="concepts/ve/i-bell.svg" /><span className={s.railLabel}>Notifications</span>
        <b className={s.bellDot}>{notifications}</b>
      </button>

      <button className={s.me} aria-label="Account, team and settings">
        <span className={s.avatar}>{user.initials}</span>
        <span className={s.meText}>
          <span className={s.meName}>{user.name}</span>
          <span className={s.meSub}>{user.role} · {company.name}</span>
        </span>
        <Icon src="concepts/ve/i-updown.svg" size={15} box={16} />
      </button>
    </nav>
  )
}

/** "Good afternoon, Layla" — follows the clock; the name carries the brand spectrum (designer, 12 Nov). */
function Greeting() {
  const now = new Date()
  const h = now.getHours()
  const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
  return (
    <header className={s.greet}>
      {/* no date line above the hello (designer, 12 Nov: removed) */}
      <h1 className={s.greetTitle}>Good {part}, <span className={s.greetName}>{user.firstName}</span></h1>
    </header>
  )
}

function Hero() {
  // balance lives here so the top-up modal can change what Home shows (prototype only, resets on reload)
  const [credit, setCredit] = useState(() => Number(`${balance.whole}.${balance.cents}`))
  const [topUp, setTopUp] = useState(false)
  const [whole, cents] = credit.toFixed(2).split('.')
  return (
    <section className={s.hero} aria-label={company.name}>
      {/* the light: fan + three beams from the Figma frame, anchored to the card's right edge */}
      <span className={s.light} aria-hidden>
        <span className={s.lightRig}>
          <img src="concepts/ve/fan.png" alt="" className={s.fan} />
          <img src="concepts/ve/beam-1.png" alt="" className={s.beam1} />
          <img src="concepts/ve/beam-2.png" alt="" className={s.beam2} />
          <img src="concepts/ve/beam-3.png" alt="" className={s.beam3} />
        </span>
      </span>

      <div className={s.heroText}>
        <span className={s.mark}><b>{company.initial}</b></span>
        <h2 className={s.heroTitle}>{company.name}</h2>
        <p className={s.heroBody}>{company.description}</p>
        <a href="#e" className={s.team}>
          <span className={s.faces}>
            {company.team.map((m, i) => <span key={m.initials} className={s.face} style={{ left: i * 20 }}>{m.initials}</span>)}
            <span className={`${s.face} ${s.invite}`} style={{ left: 40 }}>+</span>
          </span>
          <span className={s.teamText}>{company.teamLine}</span>
          <Icon src="concepts/ve/i-arrow.svg" size={15} box={16} />
        </a>

        <div className={s.reqWrap} role="group" aria-label="Balance">
          <div className={s.credits}>
            <span className={s.creditsLabel}>Credits · {balance.currency}</span>
            <span className={s.creditsFig}>{whole}<small>.{cents}</small></span>
          </div>
          {/* appears under the card on hover / keyboard focus — never on top of the figures */}
          <button className={s.topUpBtn} onClick={() => setTopUp(true)} aria-label="Top up balance">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            Top up
          </button>
        </div>
      </div>
      {topUp && <TopUp balance={credit} onClose={() => setTopUp(false)} onTopUp={a => setCredit(c => c + a)} />}
    </section>
  )
}

function Pair() {
  return (
    <section className={s.section} aria-labelledby="e-pair">
      <h2 id="e-pair" className={s.sectionTitle}>Your brand &amp; plan</h2>
      <div className={s.pair}>
        <article className={`${s.card} ${s.cardConsult}`}>
          <div className={s.cardTop}>
            <span className={s.label}>{consultation.label}</span>
            <h3 className={s.cardTitle}>{consultation.altTitle}</h3>
          </div>
          <p className={`${s.cardBody} ${s.cardBodyNarrow}`}>The strategist who wrote your reports shows what to fix first, and what it’s worth.</p>
          <a href="#e" className={`${s.btn} ${s.btnCta}`}>{consultation.cta}</a>
          <img src="concepts/ve/glass-grid.png" alt="" className={s.consultImg} width={132} height={160} />
        </article>
        <article className={`${s.card} ${s.cardProfile}`}>
          <div className={s.cardTop}>
            <span className={s.label}>Company profile</span>
            <h3 className={s.cardTitle}>Your brand, at a glance.</h3>
          </div>
          <p className={s.cardBody}>{company.profileLine}</p>
          <a href="#e" className={s.btn}>Open company profile</a>
        </article>

      </div>
    </section>
  )
}

function Reports() {
  const row = useRef<HTMLDivElement>(null)
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const request = (id: string, kind: string) => {
    sendToSpark({ title: `${kind} report`, service: 's', from: 'From Home' })
    setSent(m => ({ ...m, [id]: true }))
  }
  const [active, setActive] = useState(0)
  const target = useRef(0) // where the last click is heading, so quick double clicks add up
  const total = readyReports.length + lockedReports.length

  // dots follow the scroll position; prev/next scroll one card
  useEffect(() => {
    const el = row.current
    if (!el) return
    const on = () => {
      const card = el.firstElementChild as HTMLElement | null
      if (!card) return
      const step = card.offsetWidth + 16
      const i = Math.min(total - 1, Math.round(el.scrollLeft / step))
      setActive(i)
      if (Math.abs(el.scrollLeft - i * step) < 2) target.current = i
    }
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [total])

  const go = (i: number) => {
    const el = row.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    const n = Math.max(0, Math.min(total - 1, i))
    target.current = n
    setActive(n)
    el.scrollTo({ left: n * (card.offsetWidth + 16), behavior: 'smooth' })
  }

  return (
    <section className={s.section} aria-labelledby="e-reports">
      <div className={s.carHead}>
        <h2 id="e-reports" className={s.sectionTitle}>Your reports</h2>
        <nav className={s.carNav} aria-label="Reports">
          <button className={s.carArrow} onClick={() => go(target.current - 1)} disabled={active === 0} aria-label="Previous">
            <img src="concepts/ve/i-prev.svg" width={5} height={9} alt="" />
          </button>
          {Array.from({ length: total }, (_, i) => (
            <button key={i} className={`${s.dot} ${i === active ? s.dotOn : ''}`} onClick={() => go(i)} aria-label={`Card ${i + 1}`} aria-current={i === active} />
          ))}
          <button className={s.carArrow} onClick={() => go(target.current + 1)} disabled={active === total - 1} aria-label="Next">
            <Icon src="concepts/ve/i-next.svg" size={15} box={16} />
          </button>
        </nav>
      </div>

      <div className={s.shelf} ref={row}>
        {readyReports.map(r => (
          <article key={r.id} className={s.report}>
            <div className={s.fig}>
              <span className={s.num}>{r.value}</span>
              <span className={s.unit}>{r.unit}</span>
            </div>
            <span className={s.label}>{r.kind}</span>
            <h3 className={s.cardTitle}>{r.title}</h3>
            <span className={s.delta}><i className={r.trend === 'up' ? s.up : s.down}>{r.trend === 'up' ? '↑' : '↓'}</i> {r.delta}</span>
            <a href="#e" className={`${s.btn} ${s.btnWide}`}>Open report</a>
          </article>
        ))}
        {lockedReports.map(r => {
          const t = tiles[r.id]
          return (
            <article key={r.id} className={`${s.report} ${s.reportLocked} ${sent[r.id] ? s.reportSent : ''}`}>
              {/* designer, 12 Nov: a stylish glass icon with the brand's first letter, in the figure's place */}
              <div className={s.fig} aria-hidden>
                {t && (
                  <span className={s.glassIcon}>
                    <img src={t.img} alt="" width={80} height={72} />
                    <b style={{ left: `${t.face[0]}%`, top: `${t.face[1]}%` }}>{company.initial}</b>
                  </span>
                )}
              </div>
              <span className={s.label}>{r.kind}</span>
              <h3 className={s.cardTitle}>{r.title}</h3>
              <span className={s.delta}>{sent[r.id] ? <><i className={s.up}>●</i> Sent · the Spark team prepares it</> : r.eta}</span>
              {sent[r.id]
                ? <span className={`${s.btn} ${s.btnWide} ${s.btnDone}`}>{requestStates.sent.label}</span>
                : <button className={`${s.btn} ${s.btnWide}`} onClick={() => request(r.id, r.kind)}>{reportAction}</button>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

/** Phones get the compact top bar; desktop gets the Glow sidebar. */
function useMobile() {
  const q = '(max-width: 760px)'
  const [m, setM] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const mm = matchMedia(q)
    const on = () => setM(mm.matches)
    mm.addEventListener('change', on)
    return () => mm.removeEventListener('change', on)
  }, [])
  return m
}

export default function Home() {
  const [collapsed, setCollapsed] = useState(false)
  const mobile = useMobile()
  const [mascot, setMascot] = useState<MascotState>('idle')
  const timer = useRef<number | undefined>(undefined)

  const ask = () => {
    window.clearTimeout(timer.current)
    setMascot('speaking')
    timer.current = window.setTimeout(() => setMascot('idle'), 2400)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className={s.page}>
      <div className={`${s.shell} ${collapsed ? s.shellCollapsed : ''}`}>
        {mobile
          ? <Sidebar collapsed={false} onToggle={() => setCollapsed(c => !c)} onAsk={ask} />
          : <RailGlow collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} onAsk={ask} mascot={mascot} />}
        <main className={s.main}>
          <Greeting />
          <Hero />
          <Pair />
          <Reports />
        </main>
      </div>
      {mobile && (
        <button className={s.mascot} onClick={ask} aria-label="Ask Dr.AI">
          <Mascot state={mascot} talk="short" size={160} />
        </button>
      )}
    </div>
  )
}
