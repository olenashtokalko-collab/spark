import { useEffect, useRef, useState } from 'react'
import Mascot, { type MascotState } from '../shared/Mascot'
import TopUp from '../shared/TopUp'
import { drai, loop, user, company, balance, nav, type ServiceKey } from '../shared/data'
import { useRequests } from '../shared/requests'
import { prefersReduced, send, useAskListener } from './hooks'
import { IHome, IRequests, IDocs, IBell, IReturn, IFold } from './Icons'
import { RequestsPanel, WebsitePanel, InstagramPanel, MoreReportsPanel, CallPanel, PlatePanel } from './Panels'
import Keyboard from './Keyboard'
import s from './Home.module.css'

/* Concept C2 — "Console 2": C after the review pass (art director + product designer + UI designer, 12 Nov).
   One question at a glance: whose move is it? One colour logic (see Panels.tsx), two honest dot charts,
   Doto on two figures only, nothing blinking at rest except Dr.AI. C stays untouched next to it. */

const now = new Date()
const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

const icons: Record<string, (grad: boolean) => React.ReactElement> = { home: g => <IHome grad={g} />, requests: g => <IRequests grad={g} />, documents: g => <IDocs grad={g} /> }

/* Sidebar (designer, 12 Nov): after six rounds — colour fills, the landing's light under glass, Pastel, Noor light,
   her Wave reference — she picked LAVENDER S: clear glass with a delicate violet-lavender shimmer in the top third.
   It is the default now and the switch is gone. The other looks are still reachable for comparison with
   ?rail=sphere|pastel|noor|wave|lavm|lavl. */
type RailTone = 'lavs' | 'lavm' | 'lavl' | 'sphere' | 'pastel' | 'noor' | 'wave'
const RAILS: RailTone[] = ['lavs', 'lavm', 'lavl', 'sphere', 'pastel', 'noor', 'wave']
const RAIL_OPEN = 'c2-rail-open'
const readRail = (): RailTone => RAILS.find(r => r === new URLSearchParams(location.search).get('rail')) ?? 'lavs'

function Rail({ tone, open, onFold }: { tone: RailTone; open: boolean; onFold: () => void }) {
  // the bell shows what Home shows: the unread across requests (it used to say 4 next to "3 unread")
  const notifications = useRequests().reduce((a, r) => a + (r.unread ?? 0), 0)
  const warmActive = tone !== 'noor' && tone !== 'wave' // on the two coloured rails the icons stay white
  return (
    <>
      {/* the selected icon's stroke: a blue gradient, light blue → Cobalt → a deeper blue-violet
          (designer, 12 Nov: first orange, then "changed my mind, make it blue") */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <linearGradient id="c2-rail-active" gradientUnits="userSpaceOnUse" x1="4" y1="3" x2="20" y2="21">
            <stop offset="0" stopColor="#5C86FF" /><stop offset=".55" stopColor="#1E3BD6" /><stop offset="1" stopColor="#3D2CC8" />
          </linearGradient>
        </defs>
      </svg>
      {/* the light under the glass rail: an image for Sphere, four moving pools for Pastel and Noor light */}
      <div className={s.railGlow} aria-hidden>
        <i /><i /><i /><i />
        {/* Wave (her reference, turned vertical): blurred bands — Cobalt, magenta, a cream light, a coral wave, Ember —
            that sway slowly. Over them: the rail itself as a frost layer (blur 100 + white 10%), then a fine grain */}
        <svg className={s.wave} viewBox="0 0 72 868" preserveAspectRatio="none">
          <defs>
            <filter id="c2-wave-blur" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="20" /></filter>
            <linearGradient id="c2-wave-coral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E64C9A" /><stop offset=".5" stopColor="#EE5E72" /><stop offset="1" stopColor="#F2884A" />
            </linearGradient>
          </defs>
          <rect width="72" height="868" fill="#F6EEE8" />
          <g filter="url(#c2-wave-blur)">
            <ellipse className={s.wBlue} cx="8" cy="70" rx="96" ry="210" fill="#3B46E2" />
            <ellipse className={s.wMagenta} cx="72" cy="190" rx="60" ry="150" fill="#D845B6" />
            <ellipse className={s.wLight} cx="66" cy="420" rx="56" ry="120" fill="#FCF7F4" />
            <path className={s.wCoral} d="M-30 330 C 30 372, 56 500, 104 620 L 104 780 C 44 716, 4 600, -30 470 Z" fill="url(#c2-wave-coral)" />
            <ellipse className={s.wEmber} cx="14" cy="770" rx="84" ry="130" fill="#F07E3A" />
            <ellipse className={s.wLight2} cx="64" cy="868" rx="64" ry="80" fill="#F8E2D0" />
          </g>
        </svg>
      </div>
      {/* the menu with its words (13 Nov, review: "the client will want labels in the side menu; keep what it is now
          for the collapsed look"): open, every item is its icon and its name; folded, it is the 72 px rail of icons it
          was, with the names back on hover. The fold button at the top says which way it goes. */}
      <nav className={s.rail} data-rail={tone} data-open={open ? '' : undefined} aria-label="Main">
        <div className={s.railTop}>
          <img src="concepts/img/spark-icon.webp" alt="Spark" className={s.railLogo} width={40} height={40} />
          <button className={s.railFold} onClick={onFold} aria-expanded={open} aria-label={open ? 'Collapse the menu' : 'Expand the menu'}>
            <IFold />
            <span className={s.tip}>{open ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
        <div className={s.railGroup}>
          {nav.map(n => (
            <a key={n.id} href="#c2" className={s.railBtn} aria-current={n.id === 'home' ? 'page' : undefined} aria-label={n.label}>
              {/* selected = the blue gradient (on the light glass rails); the rest are muted */}
              {icons[n.id](n.id === 'home' && warmActive)}
              <span className={s.railName}>{n.label}</span>
              {n.dot && <i className={s.railDot} />}
              <span className={s.tip}>{n.label}</span>
            </a>
          ))}
          <button className={s.railBtn} aria-label={`Notifications: ${notifications}`}>
            <IBell />
            <span className={s.railName}>Notifications</span>
            {notifications > 0 && <b className={s.badge}>{notifications}</b>}
            <span className={s.tip}>{notifications} notifications</span>
          </button>
        </div>
        <button className={`${s.railBtn} ${s.avatarBtn}`} aria-label={`${user.name}, ${user.role}`}>
          <span className={s.avatar}>{user.initials}</span>
          <span className={`${s.railName} ${s.railWho}`}>
            <b>{user.name}</b>
            <span>{company.name}</span>
          </span>
          <span className={s.tip}>{user.name} · {company.name}</span>
        </button>
      </nav>
      {/* the grain sits above the frost (the blur would wash it out below): fine specks, overlay; only for Wave */}
      <svg className={s.railGrain} aria-hidden>
        <filter id="c2-wave-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.4" intercept="-.2" />
            <feFuncG type="linear" slope="1.4" intercept="-.2" />
            <feFuncB type="linear" slope="1.4" intercept="-.2" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#c2-wave-grain)" />
      </svg>
    </>
  )
}

/* Dr.AI answers — written only from data.ts facts. Each one can become a request ("Send to Spark"). */
const answers = [
  'Your website scores 41 of 100. Typical is 58. Mobile speed on 4G holds it back. It is up 6 since September.',
  'Mobile speed on 4G: it keeps the site 17 points under typical. Instagram can wait: 3.4% is still above 1.9%. Your strategist can say what the fix is worth.',
  'Like Qindeel: an Abu Dhabi group and a government partner, in Arabic and English. Engagement is 3.4%, down 0.4 pt since September. I can draft one. You decide.',
]
const asks: { title: string; service: ServiceKey }[] = [
  { title: 'Website score: from 41 toward the 58 typical', service: 'a' },
  { title: 'What to fix first, and what it’s worth', service: 's' },
  { title: 'How our next post should sound', service: 'p' },
]
const fallback = 'I know your two reports and your profile, not this one yet. Send it to Spark: the team comes back with a proposal.'

/* Dr.AI as a companion, not a card (designer, 12 Nov: "remove the card, place him as a regular mascot, like in A2"):
   the mascot sits bottom-right with an "Ask Dr.AI" pill; a click or ⌘K opens the chat above him.
   He stays in view and does the thinking and speaking himself, so the chat card has no second mascot. */
function DrAI() {
  const list = useRequests()
  const [open, setOpen] = useState(false)
  const wantFocus = useRef(false)
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const [phase, setPhase] = useState<'ready' | 'thinking' | 'answer'>('ready')
  const [answer, setAnswer] = useState('')
  const [typed, setTyped] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [intro, setIntro] = useState(true)
  const [sent, setSent] = useState(false)
  const [nAnswers, setNAnswers] = useState(0)
  const [nod, setNod] = useState(false)
  const [aboutSite, setAboutSite] = useState(false)
  const req = useRef<{ title: string; service: ServiceKey }>({ title: '', service: 's' })
  const root = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])
  const later = (f: () => void, ms: number) => { timers.current.push(window.setTimeout(f, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  // ⌘K / Ctrl+K opens the chat and focuses the bar from anywhere; Esc closes it
  const openAndFocus = () => { wantFocus.current = true; setOpen(true) }
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openAndFocus() }
      else if (e.key === 'Escape' && !e.defaultPrevented && document.activeElement !== input.current) setOpen(false)
    }
    window.addEventListener('keydown', on)
    return () => { window.removeEventListener('keydown', on); clear() }
  }, [])
  useEffect(() => {
    if (open && wantFocus.current) { wantFocus.current = false; input.current?.focus({ preventScroll: true }) }
  }, [open])

  // any new request (from here, the keys or a report): Dr.AI speaks for a moment
  const known = useRef(list.length)
  useEffect(() => {
    const grew = list.length > known.current
    known.current = list.length
    if (!grew) return
    setNod(true)
    const id = window.setTimeout(() => setNod(false), 2400)
    return () => clearTimeout(id)
  }, [list.length])

  // typewriter
  useEffect(() => {
    if (phase !== 'answer' || typed >= answer.length) return
    const id = window.setTimeout(() => setTyped(t => Math.min(answer.length, t + 2)), 24)
    return () => clearTimeout(id)
  }, [phase, typed, answer])
  useEffect(() => {
    if (phase === 'answer' && typed >= answer.length && speaking) later(() => setSpeaking(false), 900)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, typed, answer, speaking])

  function ask(text: string, service?: ServiceKey) {
    const t = text.trim()
    if (!t) return
    clear()
    setQ(t)
    setPhase('thinking')
    setSpeaking(false)
    setSent(false)
    const i = drai.prompts.findIndex(p => p.toLowerCase() === t.toLowerCase())
    setAboutSite(i === 0 || i === 1) // both answers are about the website score
    const a = i >= 0 ? answers[i] : fallback
    req.current = i >= 0
      ? { title: asks[i].title, service: service ?? asks[i].service }
      : { title: t[0].toUpperCase() + t.slice(1), service: service ?? 's' }
    const reduce = prefersReduced()
    later(() => {
      setAnswer(a)
      setPhase('answer')
      setSpeaking(true)
      setTyped(reduce ? a.length : 0)
      setNAnswers(n => n + 1)
    }, reduce ? 300 : 1600)
  }
  function reset() { clear(); setPhase('ready'); setAnswer(''); setQ(''); setSpeaking(false); setSent(false); input.current?.focus() }

  // the S·P·A·R·K brief can hand its text over ("Ask Dr.AI")
  useAskListener(a => { if (a.text) { setOpen(true); ask(a.text, a.service) } else openAndFocus() })

  const done = phase === 'answer' && typed >= answer.length
  function sendIt() {
    if (!done || sent) return
    send({ ...req.current, from: 'From a Dr.AI chat' }, true)
    setSent(true)
  }
  // ⌘↵ sends the answer to Spark
  useEffect(() => {
    if (!done || sent) return
    const on = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); sendIt() } }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, sent])

  const siteFix = list.find(r => /website report/i.test(r.from))
  const state: MascotState = phase === 'thinking' ? 'thinking' : speaking || nod ? 'speaking' : focus ? 'listening' : intro ? 'intro' : 'idle'

  return (
    <div className={s.aiDock}>
      <section
        ref={root}
        id="c-drai"
        className={`${s.panel} ${s.aiPop}`}
        data-open={open ? '' : undefined}
        aria-label={drai.name}
        aria-hidden={!open}
        inert={(!open) ? '' : undefined}
      >
        <div className={s.head}>
          <span className={s.label}>{drai.label}</span>
          <button type="button" className={s.aiClose} onClick={() => setOpen(false)} aria-label="Close Dr.AI">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <form className={`${s.bar} ${focus ? s.barFocus : ''}`} onSubmit={e => { e.preventDefault(); ask(q) }} role="search">
          <label htmlFor="c-ask" className={s.srOnly}>Ask Dr.AI</label>
          <input
            id="c-ask"
            ref={input}
            className={s.input}
            value={q}
            placeholder="Ask about your reports or what to do next"
            autoComplete="off"
            onChange={e => { setQ(e.target.value); if (phase !== 'thinking') setPhase('ready') }}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onKeyDown={e => { if (e.key === 'Escape') { if (phase !== 'ready') reset(); else setOpen(false) } }}
          />
          {phase === 'thinking'
            ? <span className={s.kbd}><i className={s.busy} />Thinking</span>
            : focus || q
              ? <button type="submit" className={s.kbd} aria-label="Ask">Enter <IReturn /></button>
              : <span className={s.kbd}>⌘K</span>}
        </form>

        <div className={s.speech} aria-live="polite">
          {phase === 'ready'
            ? <p className={s.body}>{drai.body}</p>
            : (
              <p className={s.answerText}>
                {phase === 'thinking' ? <span className={s.dim}>Reading your reports…</span> : answer.slice(0, typed)}
                {phase === 'answer' && typed < answer.length && <i className={s.caret} />}
              </p>
            )}
        </div>

        <div className={s.aiFoot}>
          {phase === 'ready' ? (
            <div className={s.chips}>
              {drai.prompts.map(p => (
                <button key={p} className={s.chip} onClick={() => ask(p)}>{p}</button>
              ))}
            </div>
          ) : done ? (
            <div className={s.sendBlock}>
              {/* he knows what is already with Spark, so the same fix isn't sent twice */}
              {aboutSite && siteFix && !sent && (
                <p className={s.already}><i className={`${s.led} ${s.ledSent}`} />Already with Spark: {siteFix.title} · {siteFix.when}</p>
              )}
              <div className={s.sendRow}>
                {sent
                  ? <span className={s.sentLine} role="status"><i className={`${s.led} ${s.ledSent}`} />{loop.sentLine}</span>
                  : (
                    <button className={`${s.btn} ${s.btnSmoke} ${s.btnSend}`} onClick={sendIt}>
                      {loop.sendLabel}<kbd className={s.kbdIn}>⌘↵</kbd>
                    </button>
                  )}
                <button className={`${s.btn} ${s.btnOutline}`} onClick={reset}>Ask another</button>
              </div>
              {!sent && nAnswers === 1 && <p className={s.hint}>{loop.sendHint}</p>}
            </div>
          ) : null}
        </div>
      </section>

      <button
        type="button"
        className={s.aiLauncher}
        onClick={() => (open ? setOpen(false) : openAndFocus())}
        aria-expanded={open}
        aria-controls="c-drai"
        aria-label={open ? 'Close Dr.AI' : 'Ask Dr.AI'}
      >
        <span className={s.aiFig}>
          <Mascot state={state} talk={answer.length > 120 ? 'medium' : 'short'} size="100%" onDone={() => setIntro(false)} />
        </span>
        <span className={s.aiPill} data-hide={open ? '' : undefined}><i className={s.aiDot} aria-hidden="true" />Ask Dr.AI</span>
      </button>
    </div>
  )
}

/* Layout: "Desk" (picked by the designer, 12 Nov, over Now and Flow) — the work on the left
   (requests, start a request, Instagram, more reports), the support on a 400px right column
   (Dr.AI, website, strategist call, profile). */
export default function Home() {
  const [rail] = useState<RailTone>(readRail)
  // the menu opens with its words; folded, it is the rail of icons. Remembered in this browser (13 Nov, review)
  // folded to the rail of icons unless this browser opened it (13 Nov, review: "by default let the menu be closed")
  const [railOpen, setRailOpen] = useState(() => {
    try { return localStorage.getItem(RAIL_OPEN) === 'on' } catch { return false }
  })
  const foldRail = () => setRailOpen(o => {
    try { localStorage.setItem(RAIL_OPEN, o ? 'off' : 'on') } catch { /* private window: just this visit */ }
    return !o
  })
  // balance lives here so the shared top-up modal can change what the header shows (prototype only, resets on reload)
  const [credit, setCredit] = useState(balance.amount)
  const [topUp, setTopUp] = useState(false)
  return (
    <div className={s.page} data-rail-open={railOpen ? '' : undefined}>
      <Rail tone={rail} open={railOpen} onFold={foldRail} />
      <main className={s.main}>
        {/* no status strip on top (designer, 12 Nov: "this is odd, remove it") */}
        {/* greeting on top (designer, 12 Nov): the date in Mono, then the hello — Ink only, no decoration */}
        <header className={s.hello}>
          <div className={s.helloText}>
            <p className={s.helloDate}>{today}</p>
            <h1 className={s.helloTitle}>{greeting}, {user.firstName}</h1>
          </div>
          {/* which company and what balance, visible at once, no scroll (designer, 12 Nov): a compact glass bar
              over the right column. "Balance" and the figure are SAMPLE (shared data). */}
          <div className={s.account} role="group" aria-label="Company and balance">
            <span className={s.accCo}>
              <span className={s.accMark} aria-hidden="true">{company.initial}</span>
              <b className={s.accName}>{company.name}</b>
            </span>
            <span className={s.accBal}>
              <span className={s.accLabel}>Balance</span>
              <span className={s.accName}>{credit.toFixed(2)} <span className={s.accCur}>{balance.currency}</span></span>
            </span>
            <button type="button" className={`${s.btn} ${s.btnOutline} ${s.accTop}`} onClick={() => setTopUp(true)}>Top up</button>
          </div>
        </header>
        <div className={s.desk}>
          <div className={s.deskCol}>
            <InstagramPanel d={0} />
            <RequestsPanel d={70} />
            <Keyboard d={140} />
            <MoreReportsPanel d={210} />
          </div>
          <div className={`${s.deskCol} ${s.deskSide}`}>
            <WebsitePanel d={70} />
            <CallPanel d={140} />
            <PlatePanel d={210} />
          </div>
        </div>
      </main>
      <DrAI />
      {/* the same top-up modal as in Studio and Glass deck (shared/TopUp) */}
      {topUp && <TopUp balance={credit} noun="balance" onClose={() => setTopUp(false)} onTopUp={a => setCredit(c => c + a)} />}
    </div>
  )
}
