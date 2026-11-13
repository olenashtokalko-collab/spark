import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Logo from '../shared/Logo'
import Mascot, { type MascotState } from '../shared/Mascot'
import { Chart } from '../shared/Charts'
import TopUp from '../shared/TopUp'
import {
  readyReports, lockedReports, consultation, drai, company, user, notifications, balance,
  loop, requestStates, reportAction, services, seriesMonths,
} from '../shared/data'
import type { ReadyReport, LockedReport, SparkRequest, ServiceKey } from '../shared/data'
import { useRequests, sendToSpark } from '../shared/requests'
import {
  IconHome, IconRequests, IconDocs, IconBell, IconStar, IconLeft, IconRight, IconDown, IconSend, IconClose, IconCheck, IconPlus,
} from './icons'
import s from './home.module.css'

/* ---------------------------------------------------------------------------------------------
 * Concept D2 — "Glass deck 2". D after a review by three roles the designer asked for (12 Nov):
 * an art director, a senior product designer and a UI designer. D stays untouched beside it.
 * Kept on her word: the deck and the bottom navigation (index strip + glass dock).
 *
 * What the reviews changed, and who asked:
 *   AD  · the chart is the image on a report card (area for the website, dot matrix for Instagram, whole spectrum);
 *         one axis: deck, index and dock share the window's centre, Dr.AI is smaller and stands bottom right;
 *         the slogan became the greeting she approved in E; the light has one direction (Cobalt left → Ember right)
 *         and no longer changes hue with the card; side cards are crisp, they recede by opacity, not by blur;
 *         requests wear the landing's rendered keycaps; one sheen crosses a card when it takes focus,
 *         then its chart draws and its figure counts up ("light in, spectrum out").
 *   PD  · one row of tabs only (the designer, 12 Nov: "why do we have two levels of these tabs?"): the index strip
 *         under the deck is the only way to jump between cards, and it carries the status itself (new messages on
 *         a request's keycap, the figure and its direction on a ready report). No status chips above, and the dock
 *         is a dock again: icons for the app's places, not a second row of labelled tabs.
 *         Requests have one door (the dock, which
 *         opens the list above itself) instead of four; the company is a chip top right that opens its profile on
 *         click; Dr.AI's prompts follow the card in focus; the dock's primary is "New request" with the five
 *         services as starters; a request card shows where it is (Sent → Proposal ready → In discussion);
 *         the website card shows the request that was sent from it; dock labels are always visible.
 *   UI  · see home.module.css.
 * New copy is built from data.ts facts only and is SAMPLE until the client confirms it.
 * ------------------------------------------------------------------------------------------- */

/* ───────────── the deck: requests that need you → reports → consultation ───────────── */

type Tone = 'cobalt' | 'violet' | 'ember'
type Glyph = 'compare' | 'reviews' | 'search'

/** White glyph lit from inside, sitting on the front face of a glass tile. `letter` = a service keycap (S P A R K). */
function GlassGlyph({ kind, letter, style }: { kind?: Glyph; letter?: string; style?: React.CSSProperties }) {
  const p = { fill: 'none', stroke: '#fff', strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 100 100" className={s.glyph} style={style} aria-hidden>
      {kind === 'compare' && (<>
        {/* three organisations side by side */}
        <path {...p} d="M24 74V48" /><path {...p} d="M50 74V28" /><path {...p} d="M76 74V58" />
        <path {...p} d="M16 84h68" strokeWidth={5} opacity={.7} />
      </>)}
      {kind === 'reviews' && (<>
        {/* a mention: speech bubble holding a spark */}
        <path {...p} d="M22 26h56a8 8 0 0 1 8 8v28a8 8 0 0 1-8 8H46l-16 13V70h-8a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z" />
        <path fill="#fff" d="M50 34c1.6 6.4 4 8.8 10.4 10.4C54 46 51.6 48.4 50 54.8 48.4 48.4 46 46 39.6 44.4 46 42.8 48.4 40.4 50 34z" />
      </>)}
      {kind === 'search' && (<>
        <circle {...p} cx="44" cy="44" r="22" />
        <path {...p} d="M60 60l20 20" strokeWidth={9} />
      </>)}
      {letter && (
        <text x="50" y="53" textAnchor="middle" dominantBaseline="central" className={s.glyphLetter}>{letter}</text>
      )}
    </svg>
  )
}

type Slide =
  | { kind: 'request'; id: string; dot: string; about: string; tone: Tone; line: string; req: SparkRequest }
  | { kind: 'ready'; id: string; dot: string; about: string; tone: Tone; img: string; imgClass: string; line: string; r: ReadyReport }
  | { kind: 'available'; id: string; dot: string; about: string; tone: Tone; img: string; imgClass: string; line: string; r: LockedReport; glyph: Glyph; face: [number, number] }
  | { kind: 'consult'; id: string; dot: string; about: string; tone: Tone; img: string; imgClass: string; line: string }

const [web, insta] = readyReports
const [comp, revs, search] = lockedReports

// Dr.AI's one-liners. New copy, written only from data.ts facts (flag for review).
const reportSlides: Slide[] = [
  { kind: 'ready', id: web.id, dot: 'Website', about: 'Website', tone: 'cobalt', img: 'concepts/img/glass-grid.webp', imgClass: s.imgGrid, r: web,
    line: `${web.value} is up 6 since September. Mobile speed on 4G is what holds it back.` },
  { kind: 'ready', id: insta.id, dot: 'Instagram', about: 'Instagram', tone: 'violet', img: 'concepts/img/spark-tile-float.webp', imgClass: s.imgTile, r: insta,
    line: `${insta.value}% is still above the 1.9% typical for UAE brands. It slipped 0.4 pt since September.` },
  // Not-yet-requested reports: a crisp glass tile (cut from the brand's glass-grid render) with a white glyph,
  // the brand-book recipe "frosted glass body, spectrum underneath, white on top". face = glyph centre in % of the tile.
  { kind: 'available', id: comp.id, dot: comp.kind, about: comp.kind, tone: 'violet', img: 'concepts/vd/tile-violet.png', imgClass: s.imgGlass, r: comp, glyph: 'compare', face: [45, 51],
    line: 'Name three organisations. The Spark team sets them side by side: reach, share of voice, what people praise.' },
  { kind: 'available', id: revs.id, dot: revs.kind, about: revs.kind, tone: 'ember', img: 'concepts/vd/tile-orange.png', imgClass: s.imgGlass, r: revs, glyph: 'reviews', face: [39, 50],
    line: '2,100 mentions in news, LinkedIn and Google reviews. Your strategist decides what matters.' },
  { kind: 'available', id: search.id, dot: search.kind, about: search.kind, tone: 'cobalt', img: 'concepts/vd/tile-blue.png', imgClass: s.imgGlass, r: search, glyph: 'search', face: [42, 49],
    line: 'What people search for, in Arabic and English. The Spark team has it ready in about 3 days.' },
  { kind: 'consult', id: 'consult', dot: 'Consultation', about: 'your consultation', tone: 'ember', img: 'concepts/img/hand-card.webp', imgClass: s.imgHand,
    line: 'I find the figures. Your strategist tells you what they’re worth. 45 minutes.' },
]

/* A request wears its service as a glass keycap: the same crisp tile + white glyph, here a white letter.
   No pink tile was rendered, so A and R tint the violet one toward magenta / pink. */
const svcTile: Record<ServiceKey, { img: string; face: [number, number]; hue?: number; tone: Tone }> = {
  s: { img: 'concepts/vd/tile-blue.png', face: [42, 49], tone: 'cobalt' },
  p: { img: 'concepts/vd/tile-violet.png', face: [45, 51], tone: 'violet' },
  a: { img: 'concepts/vd/tile-violet.png', face: [45, 51], hue: 36, tone: 'violet' },
  r: { img: 'concepts/vd/tile-violet.png', face: [45, 51], hue: 50, tone: 'ember' },
  k: { img: 'concepts/vd/tile-orange.png', face: [39, 50], tone: 'ember' },
}
const svc = (k: ServiceKey) => services.find(x => x.key === k) ?? services[0]
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const stateOrder: Record<SparkRequest['state'], number> = { proposal: 0, discussion: 1, sent: 2 }

// Dr.AI on a request (new copy from requestStates / loop, flag for review).
function requestLine(r: SparkRequest) {
  if (r.state === 'proposal') return `Spark came back with a proposal. ${r.unread ? `${plural(r.unread, 'new message waits', 'new messages wait')} for you.` : 'Read it first.'}`
  if (r.state === 'discussion') return `In discussion with Spark. ${r.unread ? `${plural(r.unread, 'new message', 'new messages')} here.` : 'Messages, files and approvals live here.'}`
  return loop.sentLine
}
const requestSlide = (r: SparkRequest): Slide => ({
  kind: 'request', id: r.id, dot: requestStates[r.state].label,
  about: r.state === 'proposal' ? 'this proposal' : 'this request',
  tone: svcTile[r.service].tone, line: requestLine(r), req: r,
})

// Answers to the three example prompts, built only from report facts (new copy, flag for review).
const answers: Record<string, string> = {
  [drai.prompts[0]]: '41 of 100 is 17 below the 58 typical. It is up 6 since September. Mobile speed on 4G is what holds it back.',
  [drai.prompts[1]]: 'Mobile speed on 4G first: it keeps the website at 41. Your strategist can tell you what fixing it is worth in a 45-minute call.',
  [drai.prompts[2]]: 'Engagement is 3.4%, well above the 1.9% typical, but down 0.4 pt since September. Keep the voice bilingual and specific.',
}
// What "Send to Spark" turns each answer into (new request titles, flag for review).
const sendables: Record<string, { title: string; service: ServiceKey }> = {
  [drai.prompts[0]]: { title: 'Website score 41/100: a plan to reach the 58 typical', service: 's' },
  [drai.prompts[1]]: { title: 'What to fix first, starting with mobile speed', service: 's' },
  [drai.prompts[2]]: { title: 'The voice for our next Instagram posts', service: 'p' },
}
const CHAT_FROM = 'From a Dr.AI chat'

/* D2: what Dr.AI offers follows the card in focus. Answers use data.ts facts and the request life the client
   described (sent → proposal → discussion, files, approvals). SAMPLE copy. */
type Preset = { q: string; a: string; send?: { title: string; service: ServiceKey } }
const preset = (q: string): Preset => ({ q, a: answers[q], send: sendables[q] })
function promptsFor(sl: Slide): Preset[] {
  if (sl.kind === 'ready') {
    return sl.id === web.id
      ? [preset(drai.prompts[0]), preset(drai.prompts[1])]
      : [
          { q: 'Why did engagement slip 0.4 pt?', a: `Engagement is ${insta.value}%, down 0.4 pt since September. Still well above the ${insta.typical}% typical. Your strategist can show which posts moved it.`, send: { title: 'Why Instagram engagement slipped 0.4 pt', service: 'p' } },
          preset(drai.prompts[2]),
        ]
  }
  if (sl.kind === 'available') return [
    { q: `What would the ${sl.r.kind} report show?`, a: `${sl.r.body} Someone on the Spark team prepares it. ${sl.r.eta}.`, send: { title: `${sl.r.kind} report`, service: 's' } },
    preset(drai.prompts[1]),
  ]
  if (sl.kind === 'consult') return [
    { q: `What happens in the ${consultation.minutes} minutes?`, a: `${consultation.body} I find the figures. Your strategist tells you what they are worth.` },
    preset(drai.prompts[1]),
  ]
  const next = {
    proposal: 'Read the proposal, then talk it through with Spark. Messages, files and approvals live in the request.',
    discussion: 'You and Spark work it through here: messages, files and approvals.',
    sent: `${requestStates.sent.line}. It lands here and in Requests.`,
  }[sl.req.state]
  return [{ q: 'What happens next?', a: next }, preset(drai.prompts[1])]
}
// "New request" starters: the five services from the site, in its own words.
const starters: Preset[] = services.map(x => ({
  q: x.title,
  a: `${x.line} Tell me what you have in mind, or send it to Spark as it is.`,
  send: { title: `New request · ${x.title}`, service: x.key },
}))

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
const stateSteps: SparkRequest['state'][] = ['sent', 'proposal', 'discussion']

/* ───────────── small hooks ───────────── */

function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth))
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

function useReducedMotion() {
  const q = '(prefers-reduced-motion: reduce)'
  const [r, setR] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setR(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return r
}

/* ───────────── coverflow geometry ───────────── */

const lerpKeys = (keys: number[], t: number) => {
  const a = Math.min(Math.abs(t), keys.length - 1)
  const i = Math.floor(a)
  const f = a - i
  return i >= keys.length - 1 ? keys[keys.length - 1] : keys[i] + (keys[i + 1] - keys[i]) * f
}

function geometry(vw: number) {
  const mobile = vw < 760
  const cardW = mobile ? Math.min(520, vw - 56) : 520
  const cardH = mobile ? 440 : 400 // 400 keeps the whole stack inside a laptop's height (UI designer)
  // translateX at |d| = 0,1,2,3 in px
  const tx = mobile
    ? [0, Math.round(cardW * 0.5 + cardW * 0.9 * 0.5 + 12), Math.round(cardW * 1.5), Math.round(cardW * 1.9)]
    : [0, 376, 640, 820]
  return {
    mobile, cardW, cardH, tx,
    rot: mobile ? [0, 10, 14, 16] : [0, 18, 24, 28],
    scale: mobile ? [1, 0.9, 0.82, 0.76] : [1, 0.8, 0.7, 0.6],
    // side cards stay crisp and recede by opacity alone (art director; the designer's rule: no blur as a visual).
    // Less transparent than before (designer, 12 Nov: "make the cards less transparent"): .64/.32 → .88/.56
    opacity: [1, mobile ? 0.8 : 0.88, 0.56, 0],
    blur: [0, 0, 0, 0],
    bright: [1, 1, 1, 1],
  }
}

/* ───────────── Home ───────────── */

type Asked = { q: string; a: string | null; sent?: boolean; send?: Preset['send'] }

export default function Home() {
  const vw = useViewportWidth()
  const reduced = useReducedMotion()
  const g = geometry(vw)
  const reqs = useRequests()

  // requests sent from Dr.AI in this session join the deck (right after the ones that need you)
  const [chatIds, setChatIds] = useState<string[]>([])
  const slides = useMemo<Slide[]>(() => {
    // at most three requests lead the deck (proposals first); the rest live in Requests, so reports stay a swipe away
    const needYou = reqs.filter(r => r.state !== 'sent').sort((a, b) => stateOrder[a.state] - stateOrder[b.state]).slice(0, 3)
    const fromChat = reqs.filter(r => chatIds.includes(r.id))
    return [...needYou.map(requestSlide), ...fromChat.map(requestSlide), ...reportSlides]
  }, [reqs, chatIds])

  const [activeId, setActiveId] = useState(() => slides[0].id)
  const found = slides.findIndex(sl => sl.id === activeId)
  const active = found < 0 ? 0 : found
  const [drag, setDrag] = useState<number | null>(null) // px offset while dragging
  const [ordered, setOrdered] = useState<Record<string, 'confirm' | 'done'>>({})
  const [reportReq, setReportReq] = useState<Record<string, string>>({}) // report id → request id
  const [seen, setSeen] = useState<string[]>([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [reqOpen, setReqOpen] = useState(false)
  const [fresh, setFresh] = useState<string | null>(null) // the request that just arrived (pill + list animate)
  const [landing, setLanding] = useState<string | null>(null) // the deck card that just arrived

  // companion
  const [mood, setMood] = useState<MascotState>(reduced ? 'idle' : 'intro')
  const [bubble, setBubble] = useState<'thinking' | 'line'>('line')
  const [composer, setComposer] = useState(false)
  const [draft, setDraft] = useState(false) // composer opened from "New request": the five services as starters
  // the company's budget beside its chip, with a plus that opens the top-up (designer, 12 Nov). SAMPLE figures.
  const [budget, setBudget] = useState({ left: balance.amount, total: balance.max })
  const [topUp, setTopUp] = useState(false)
  const [bWhole, bCents] = budget.left.toFixed(2).split('.')
  const [lit, setLit] = useState<string[]>(() => (reduced ? ['*'] : [])) // cards whose chart has drawn
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState<Asked | null>(null)
  const [sentCount, setSentCount] = useState(0)
  const timers = useRef<number[]>([])
  const freshTimer = useRef(0)
  const prevActive = useRef(activeId)
  const arriving = useRef<string | null>(null)

  const clearTimers = () => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = [] }
  const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)) }

  const go = useCallback((i: number) => {
    const n = Math.max(0, Math.min(slides.length - 1, i))
    setActiveId(slides[n].id)
  }, [slides])

  // On every focus change Dr.AI thinks (~1s), speaks the line, then rests.
  // A request that just arrived from Dr.AI skips the thinking: he says it straight away.
  useEffect(() => {
    if (prevActive.current === activeId) return
    prevActive.current = activeId
    clearTimers()
    setComposer(false)
    setAsked(null)
    if (reduced) { setBubble('line'); return }
    if (arriving.current === activeId) {
      arriving.current = null
      setBubble('line')
      setMood('speaking')
      later(2800, () => setMood('idle'))
      return
    }
    setMood('thinking')
    setBubble('thinking')
    later(1000, () => { setMood('speaking'); setBubble('line') })
    later(3600, () => setMood('idle'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => () => { clearTimers(); window.clearTimeout(freshTimer.current) }, [])

  // light in, spectrum out: a moment after a card takes focus (the sheen), its chart draws and its figure counts up. Once per card.
  useEffect(() => {
    const t = window.setTimeout(() => setLit(l => (l.includes(activeId) ? l : [...l, activeId])), 360)
    return () => window.clearTimeout(t)
  }, [activeId])

  // the tab of the card in focus is always in view when the strip has to scroll (narrow windows)
  const dotsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    dotsRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
  }, [activeId, reduced])

  // company profile (top right): a click outside closes it
  const coRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!profileOpen) return
    const on = (e: PointerEvent) => { if (!coRef.current?.contains(e.target as Node)) setProfileOpen(false) }
    document.addEventListener('pointerdown', on)
    return () => document.removeEventListener('pointerdown', on)
  }, [profileOpen])

  const afterIntro = () => {
    setMood('speaking')
    later(2600, () => setMood(m => (m === 'speaking' ? 'idle' : m)))
  }

  // keyboard
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (document.querySelector('[aria-modal="true"]')) return // the top-up modal owns the keyboard while it is open
      if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) }
      if (e.key === 'Escape') { setComposer(false); setProfileOpen(false); setReqOpen(false) }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [active, go])

  // requests popover: a click outside closes it
  const reqRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!reqOpen) return
    const on = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (reqRef.current?.contains(t) || t.closest?.('[data-req-toggle]')) return
      setReqOpen(false)
    }
    document.addEventListener('pointerdown', on)
    return () => document.removeEventListener('pointerdown', on)
  }, [reqOpen])

  // drag / swipe (pointer capture starts only after a real move, so buttons still click)
  const ds = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const onPointerDown = (e: React.PointerEvent) => {
    if (reduced || e.button !== 0) return
    ds.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = ds.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return
      d.moved = true
      try { (e.currentTarget as HTMLElement).setPointerCapture(d.id) } catch { /* pointer already released */ }
    }
    setDrag(dx)
  }
  const onPointerUp = () => {
    const d = ds.current
    ds.current = null
    if (!d || !d.moved) { setDrag(null); return }
    suppressClick.current = true
    window.setTimeout(() => { suppressClick.current = false }, 0)
    const dx = drag ?? 0
    const step = g.tx[1]
    let next = Math.round(active - dx / step)
    if (next === active && Math.abs(dx) > 48) next = active - Math.sign(dx)
    setDrag(null)
    go(next)
  }

  // trackpad horizontal swipe
  const wheelLock = useRef(0)
  const onWheel = (e: React.WheelEvent) => {
    if (reduced || Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 24) return
    const now = Date.now()
    if (now - wheelLock.current < 520) return
    wheelLock.current = now
    go(active + Math.sign(e.deltaX))
  }

  // reduced motion: the deck is a plain scroll-snap row; focus follows the scroll
  const rowRef = useRef<HTMLDivElement>(null)
  const scrollToCard = (i: number) => {
    const row = rowRef.current
    const el = row?.children[i] as HTMLElement | undefined
    if (row && el) row.scrollTo({ left: el.offsetLeft - (row.clientWidth - el.clientWidth) / 2 })
  }
  const goTo = (i: number) => { go(i); if (reduced) scrollToCard(Math.max(0, Math.min(slides.length - 1, i))) }
  const onRowScroll = () => {
    const row = rowRef.current
    if (!row) return
    const c = row.scrollLeft + row.clientWidth / 2
    let best = 0, bd = Infinity
    Array.from(row.children).forEach((el, i) => {
      const h = el as HTMLElement
      const d = Math.abs(h.offsetLeft + h.clientWidth / 2 - c)
      if (d < bd) { bd = d; best = i }
    })
    if (best !== active) setActiveId(slides[best].id)
  }
  // keep the reduced-motion row on the focused card when cards are inserted
  useEffect(() => { if (reduced) scrollToCard(active) }, [reduced, slides.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const pos = active - (drag ?? 0) / g.tx[1]
  const cur = slides[active]

  /* requests */
  const sortedReqs = useMemo(() => [...reqs].sort((a, b) => stateOrder[a.state] - stateOrder[b.state]), [reqs])
  const unreadOf = (r: SparkRequest) => (seen.includes(r.id) ? 0 : r.unread ?? 0)

  const arrive = (id: string) => {
    setFresh(id)
    window.clearTimeout(freshTimer.current)
    freshTimer.current = window.setTimeout(() => setFresh(null), 2600)
  }
  const markSeen = (id: string) => setSeen(x => (x.includes(id) ? x : [...x, id]))
  const openRequest = (r: SparkRequest) => {
    markSeen(r.id)
    setReqOpen(false)
    const reportId = Object.keys(reportReq).find(k => reportReq[k] === r.id)
    const i = slides.findIndex(sl =>
      sl.id === r.id || sl.id === reportId || (sl.kind === 'ready' && r.from.includes(sl.dot)))
    if (i >= 0 && i !== active) goTo(i)
  }

  /* Dr.AI */
  const openComposer = (asRequest = false) => {
    clearTimers()
    setReqOpen(false)
    setProfileOpen(false)
    setDraft(asRequest)
    setComposer(true)
    setAsked(null)
    setMood('listening')
  }
  const closeComposer = () => { setComposer(false); setDraft(false); setAsked(null); setMood('idle') }
  const ask = (q: string, p?: Preset) => {
    const text = q.trim()
    if (!text) return
    clearTimers()
    setQuestion('')
    const send = p?.send ?? sendables[text]
    setAsked({ q: text, a: null, send })
    const a = p?.a ?? answers[text]
      ?? (draft ? 'Got it. Spark reads this as your brief. Add what matters, or send it as it is.' : 'Noted. In the live portal I answer here, from your reports and your brand profile.')
    if (reduced) { setAsked({ q: text, a, send }); return }
    setMood('thinking')
    later(1200, () => { setMood('speaking'); setAsked({ q: text, a, send }) })
    later(4600, () => setMood('idle'))
  }

  // the core loop: Dr.AI answer → Send to Spark → a request lands in the pill, then glides into the deck
  const sendFromChat = () => {
    if (!asked?.a || asked.sent) return
    const pick = asked.send ?? { title: asked.q.length > 64 ? `${asked.q.slice(0, 62).trim()}…` : asked.q, service: 's' as ServiceKey }
    const r = sendToSpark({ title: pick.title, service: pick.service, from: CHAT_FROM })
    setAsked(a => (a ? { ...a, sent: true } : a))
    setSentCount(c => c + 1)
    arrive(r.id)
    clearTimers()
    const land = () => {
      arriving.current = r.id
      setLanding(r.id)
      setChatIds(ids => [r.id, ...ids])
      setActiveId(r.id)
      window.setTimeout(() => setLanding(l => (l === r.id ? null : l)), 1400)
    }
    if (reduced) { land(); return }
    setMood('speaking')
    later(1700, land)
  }

  /* reports */
  const order = (id: string, step: 'confirm' | 'done' | null) =>
    setOrdered(o => { const n = { ...o }; if (step) n[id] = step; else delete n[id]; return n })
  const requestReport = (r: LockedReport) => {
    const req = sendToSpark({ title: `${r.kind} report`, from: 'From Home' })
    setReportReq(m => ({ ...m, [r.id]: req.id }))
    order(r.id, 'done')
    arrive(req.id)
  }

  const handlers: Handlers = {
    order, requestReport, markSeen, unreadOf,
    showRequests: () => setReqOpen(true),
    reportSent: (id: string) => ordered[id],
    lit: (id: string) => lit.includes(id) || lit.includes('*'),
    sentFrom: (r: ReadyReport) => reqs.find(q => q.from === `From the ${r.kind}`),
  }

  const needCount = reqs.filter(r => r.state !== 'sent').length
  const offers = draft ? starters : promptsFor(cur)

  return (
    <div className={`${s.page} ${reduced ? s.reduced : ''}`}>
      {/* the one light, with a direction: Cobalt on the left, Violet in the middle, Ember on the right. It no longer changes hue with the card. */}
      <svg width="0" height="0" className={s.defs} aria-hidden>
        <defs>
          <linearGradient id="d2-ico" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0" stopColor="#1E3BD6" /><stop offset=".5" stopColor="#7A3CF0" /><stop offset="1" stopColor="#E8501F" />
          </linearGradient>
        </defs>
      </svg>
      <div className={s.light} aria-hidden>
        <span className={`${s.blob} ${s.blobCobalt}`} />
        <span className={`${s.blob} ${s.blobViolet}`} />
        <span className={`${s.blob} ${s.blobEmber}`} />
      </div>

      {/* top bar */}
      <header className={s.top}>
        <a href="#d2" className={s.logo} aria-label="Spark Studios, Home"><Logo height={24} color="var(--ink)" /></a>
        <div className={s.topRight}>
          {/* the company's budget: what is left, and a plus to add money */}
          <div className={s.budget} title={`${(budget.total - budget.left).toFixed(2)} used of ${budget.total.toFixed(2)} ${balance.currency}`}>
            <span className={s.budgetLabel}>Budget</span>
            <span className={s.budgetNum} aria-label={`${budget.left.toFixed(2)} ${balance.currency} left`}>{bWhole}<small>.{bCents}</small></span>
            <span className={s.budgetUnit}>{balance.currency}</span>
            <button className={s.budgetPlus} onClick={() => setTopUp(true)} aria-label="Top up the budget" title="Top up"><IconPlus size={16} /></button>
          </div>

          {/* the company: a chip that opens its profile on click (was a hover-only link in the headline) */}
          <div className={s.coWrap} ref={coRef}>
            <button className={`${s.coChip} ${profileOpen ? s.coChipOn : ''}`} onClick={() => setProfileOpen(o => !o)} aria-expanded={profileOpen} aria-haspopup="dialog">
              <span className={s.coTile} aria-hidden><img src="concepts/vd/tile-blue.png" alt="" draggable={false} /><b>{company.initial}</b></span>
              <span className={s.coName}>{company.name}</span>
              <span className={s.pillChev}><IconDown size={16} /></span>
            </button>
            <div className={`${s.profilePop} ${profileOpen ? s.profilePopOn : ''}`} role="dialog" aria-label="Company profile" aria-hidden={!profileOpen} inert={(!profileOpen) ? '' : undefined}>
              <span className={s.popLabel}>Company profile</span>
              <span className={s.profileText}>{company.profileLine}</span>
              <span className={s.chips}>{company.chips.map(c => <span key={c} className={s.chip}>{c}</span>)}</span>
              {/* the team lives here now, not in the top bar (designer, 12 Nov: "hide this in this thing") */}
              <span className={s.popTeam}>
                <span className={s.team} aria-hidden>
                  {[user.initials, ...company.team.map(t => t.initials)].map((ini, i) => (
                    <span key={ini} className={s.teamAv} style={{ zIndex: 3 - i }}>{ini}</span>
                  ))}
                </span>
                <span className={s.popTeamText}>You and {company.team.length} colleagues</span>
              </span>
              <span className={s.popFoot}><i aria-hidden />{drai.label}</span>
            </div>
          </div>
        </div>
      </header>

      {/* greeting (the one she approved in E) + today in one line */}
      <section className={s.hello}>
        <div className={s.helloText}>
          <p className={s.helloMeta}>{today}</p>
          <h1 className={s.h1}>{greeting}, <em>{user.firstName}</em></h1>
        </div>
      </section>

      {/* stage: deck + companion */}
      <main className={s.stage}>
        <div className={s.deckCol}>
          {reduced ? (
            <div className={s.row} ref={rowRef} onScroll={onRowScroll} aria-roledescription="carousel" aria-label="Requests, reports and consultation">
              {slides.map((sl, i) => (
                <article key={sl.id} className={`${s.card} ${s[`k_${sl.kind}`]} ${hot(sl) ? s.cardHot : ''} ${i === active ? s.cardOn : ''}`} style={{ width: g.cardW, height: g.cardH }}>
                  <CardBody sl={sl} h={handlers} />
                </article>
              ))}
            </div>
          ) : (
            <div
              className={`${s.deck} ${drag !== null ? s.dragging : ''}`}
              style={{ height: g.cardH + 24 }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              aria-roledescription="carousel"
              aria-label="Requests, reports and consultation"
            >
              <div className={s.under} aria-hidden />
              {slides.map((sl, i) => {
                const d = i - pos
                const sign = Math.sign(d)
                const a = Math.abs(d)
                const tx = sign * lerpKeys(g.tx, a)
                const rot = -sign * lerpKeys(g.rot, a)
                const sc = lerpKeys(g.scale, a)
                const op = lerpKeys(g.opacity, a)
                const bl = lerpKeys(g.blur, a)
                const br = lerpKeys(g.bright, a)
                const isOn = i === active
                return (
                  <article
                    key={sl.id}
                    className={`${s.card} ${s[`k_${sl.kind}`]} ${hot(sl) ? s.cardHot : ''} ${isOn ? s.cardOn : ''} ${landing === sl.id ? s.landing : ''}`}
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${slides.length}: ${sl.kind === 'request' ? `${sl.dot}, ${sl.req.title}` : sl.dot}`}
                    aria-hidden={a > 2.5}
                    data-far={a > 1.5 ? '' : undefined}
                    style={{
                      width: g.cardW,
                      height: g.cardH,
                      marginLeft: -g.cardW / 2,
                      transform: `perspective(1600px) translate3d(${Math.round(tx)}px,0,0) rotateY(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`,
                      opacity: op,
                      filter: bl > 0.05 ? `blur(${bl.toFixed(1)}px) brightness(${br.toFixed(3)})` : 'none',
                      zIndex: 20 - Math.round(a * 4),
                      pointerEvents: a > 2.5 ? 'none' : undefined,
                    }}
                    onClickCapture={e => {
                      if (suppressClick.current) { suppressClick.current = false; e.stopPropagation(); e.preventDefault(); return }
                      if (!isOn) { e.stopPropagation(); e.preventDefault(); go(i) }
                    }}
                  >
                    <CardBody sl={sl} h={handlers} inert={!isOn} />
                    {isOn && <i key={sl.id} className={s.sheen} aria-hidden />}
                  </article>
                )
              })}
            </div>
          )}

          {/* index */}
          <div className={s.index}>
            <button className={s.arrow} onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous card"><IconLeft /></button>
            <div className={s.dots} role="tablist" aria-label="Cards" ref={dotsRef}>
              {slides.map((sl, i) => {
                const brk = i > 0 && (slides[i - 1].kind === 'request') !== (sl.kind === 'request')
                return (
                  <span key={sl.id} className={s.dotSlot}>
                    {brk && <span className={s.dotSep} aria-hidden />}
                    <button
                      role="tab"
                      aria-selected={i === active}
                      aria-label={sl.kind === 'request' ? `${sl.dot}: ${sl.req.title}` : undefined}
                      title={sl.kind === 'request' ? sl.req.title : undefined}
                      className={`${s.dot} ${i === active ? s.dotOn : ''} ${sl.kind === 'request' ? s.dotReq : ''} ${landing === sl.id ? s.dotIn : ''}`}
                      onClick={() => goTo(i)}
                    >
                      {sl.kind === 'request' ? (
                        // the landing's rendered keycap for the request's service, the same one as on its card (designer, 12 Nov)
                        <i className={s.dotKey}>
                          <img src={`concepts/vc/key-${sl.req.service}.png`} alt="" draggable={false} />
                          {unreadOf(sl.req) > 0 && <b className={s.dotNew} aria-label={`${unreadOf(sl.req)} new`}>{unreadOf(sl.req)}</b>}
                        </i>
                      ) : sl.kind !== 'ready' && (
                        <i className={`${s.dotMark} ${sl.kind === 'consult' ? s.dotMarkHuman : ''} ${sl.kind === 'available' && ordered[sl.id] !== 'done' ? s.dotMarkDim : ''}`} />
                      )}
                      <span className={s.dotLabel}>{sl.dot}</span>
                      {/* a ready report says its figure and where it is heading, right in its tab */}
                      {sl.kind === 'ready' && (
                        <span className={s.dotVal}>
                          {sl.r.value}{sl.r.unit === '%' ? '%' : ''}
                          <b className={sl.r.trend === 'up' ? s.up : s.down} aria-label={sl.r.delta}>{sl.r.trend === 'up' ? '↑' : '↓'}</b>
                        </span>
                      )}
                    </button>
                  </span>
                )
              })}
            </div>
            <button className={s.arrow} onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="Next card"><IconRight /></button>
          </div>

        {/* Dr.AI companion: inside the deck column, so he always stands on the deck's own bottom line */}
        <aside className={s.companion} aria-label="Dr.AI">
          <div className={`${s.bubble} ${composer ? s.bubbleOpen : ''}`} aria-live="polite">
            {!composer ? (
              <button className={s.bubbleBtn} onClick={() => openComposer()}>
                <span className={s.bubbleLabel}>Dr.AI · on {cur.about}</span>
                {bubble === 'thinking'
                  ? <span className={s.thinking} aria-label="Thinking"><i /><i /><i /></span>
                  : <span key={cur.id} className={s.bubbleLine}>{cur.line}</span>}
                <span className={s.bubbleAsk}>Ask about this <IconRight size={16} /></span>
              </button>
            ) : (
              <div className={s.composer}>
                <div className={s.composerHead}>
                  <span className={s.bubbleLabel}>{draft ? 'New request · pick a start' : `Ask Dr.AI · ${cur.kind === 'consult' ? 'Consultation' : cur.kind === 'request' ? 'This request' : cur.dot}`}</span>
                  <button className={s.closeBtn} onClick={closeComposer} aria-label="Close"><IconClose size={16} /></button>
                </div>
                {asked ? (
                  <div className={s.thread}>
                    <p className={s.q}>{asked.q}</p>
                    {asked.a
                      ? <p key="a" className={s.a}>{asked.a}</p>
                      : <span className={s.thinking} aria-label="Thinking"><i /><i /><i /></span>}
                    {asked.a && (asked.sent ? (
                      <p className={s.sentNote}><IconCheck size={16} />{loop.sentLine}</p>
                    ) : (
                      <div className={s.sendBox}>
                        <button className={s.btnSpark} onClick={sendFromChat}><IconStar size={16} />{loop.sendLabel}</button>
                        {sentCount === 0 && <p className={s.hint}>{loop.sendHint}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={s.prompts}>
                    {offers.map(o => draft ? (
                      <button key={o.q} className={`${s.prompt} ${s.starter}`} onClick={() => ask(o.q, o)}>
                        <i className={s.dotDisc} style={{ '--svc': `var(--svc-${o.send?.service ?? 's'})` } as React.CSSProperties}>{svc(o.send?.service ?? 's').letter}</i>
                        {o.q}
                      </button>
                    ) : (
                      <button key={o.q} className={s.prompt} onClick={() => ask(o.q, o)}>{o.q}</button>
                    ))}
                  </div>
                )}
                <form className={s.field} onSubmit={e => { e.preventDefault(); ask(question) }}>
                  <input
                    className={s.input}
                    value={question}
                    onChange={e => { setQuestion(e.target.value); if (!asked) setMood('listening') }}
                    placeholder={draft ? 'Or say what you need from Spark' : 'Ask about your reports'}
                    aria-label="Ask Dr.AI"
                    autoFocus
                  />
                  <button className={s.send} aria-label="Ask" disabled={!question.trim()}><IconSend size={16} /></button>
                </form>
              </div>
            )}
          </div>
          <div className={s.mascotWrap}>
            {reduced
              ? <img src="concepts/mascot/still.png" alt="Dr.AI" className={s.mascotStill} style={{ width: g.mobile ? 120 : 200 }} />
              : <Mascot state={mood} talk="short" size={g.mobile ? 120 : 200} onDone={afterIntro} className={s.mascot} />}
          </div>
        </aside>
        </div>
      </main>

      {/* requests: one door. The dock's Requests item opens the list right above the dock. */}
      <div ref={reqRef} className={`${s.reqPop} ${s.reqSheet} ${reqOpen ? s.reqPopOn : ''}`} role="dialog" aria-label="Requests" aria-hidden={!reqOpen} inert={(!reqOpen) ? '' : undefined}>
        <div className={s.reqHead}>
          <span className={s.reqHeadLabel}>Requests · {reqs.length}</span>
          <button className={s.closeBtn} onClick={() => setReqOpen(false)} aria-label="Close requests"><IconClose size={16} /></button>
        </div>
        <ul className={s.reqList}>
          {sortedReqs.map(r => {
            const n = unreadOf(r)
            return (
              <li key={r.id} className={`${s.reqRow} ${r.state === 'proposal' ? s.reqRowHot : ''} ${fresh === r.id ? s.reqRowIn : ''}`}>
                <i className={s.discLg} style={{ '--svc': `var(--svc-${r.service})` } as React.CSSProperties} title={svc(r.service).title}>{svc(r.service).letter}</i>
                <div className={s.reqMain}>
                  <span className={`${s.reqState} ${s[`st_${r.state}`]}`}>
                    {requestStates[r.state].label}
                    {n > 0 && <b className={s.unread}>{n} new</b>}
                  </span>
                  <span className={s.reqTitle}>{r.title}</span>
                  <span className={s.reqFrom}>{r.from} · {r.when}</span>
                </div>
                <button className={s.reqOpen} onClick={() => openRequest(r)}>Open</button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* glass dock: the app's places as icons (name on hover) · the one primary action · you */}
      <nav className={s.dock} aria-label="Main">
        <a href="#d2" className={`${s.dockItem} ${s.dockOn}`} aria-current="page">
          <IconHome /><span className={s.dockLabel}>Home</span>
        </a>
        <button className={`${s.dockItem} ${reqOpen ? s.dockOpen : ''}`} onClick={() => setReqOpen(o => !o)} aria-expanded={reqOpen} aria-haspopup="dialog" data-req-toggle>
          {fresh && <span key={fresh} className={s.ping} aria-hidden />}
          <IconRequests /><span className={s.dockLabel}>Requests</span>
          {needCount > 0 && <b className={s.dockCount} aria-label={`${needCount} need you`}><span key={needCount} className={s.countRoll}>{needCount}</span></b>}
        </button>
        <a href="#d2" className={s.dockItem}>
          <IconDocs /><span className={s.dockLabel}>Documents</span>
          <i className={s.dockDot} aria-label="New" />
        </a>
        <span className={s.dockSep} aria-hidden />
        <button className={s.dockAsk} onClick={() => openComposer(true)}>
          <IconStar size={16} />
          <span>New request</span>
        </button>
        <span className={s.dockSep} aria-hidden />
        <button className={`${s.dockItem}`} aria-label={`Notifications, ${notifications} new`} title="Notifications">
          <IconBell />
          <b className={s.badge}>{notifications}</b>
        </button>
        <button className={`${s.dockItem} ${s.dockAv}`} aria-label={`${user.name}, account`} title={`${user.name}, ${user.role}`}>
          <span>{user.initials}</span>
        </button>
      </nav>

      {topUp && (
        <TopUp
          noun="budget"
          balance={budget.left}
          onClose={() => setTopUp(false)}
          onTopUp={a => setBudget(b => ({ left: b.left + a, total: b.total + a }))}
        />
      )}
    </div>
  )
}

const hot = (sl: Slide) => sl.kind === 'request' && sl.req.state === 'proposal'

/* ───────────── card faces ───────────── */

type Handlers = {
  order: (id: string, step: 'confirm' | 'done' | null) => void
  requestReport: (r: LockedReport) => void
  markSeen: (id: string) => void
  unreadOf: (r: SparkRequest) => number
  showRequests: () => void
  reportSent: (id: string) => 'confirm' | 'done' | undefined
  lit: (id: string) => boolean
  sentFrom: (r: ReadyReport) => SparkRequest | undefined
}

/** A Doto figure that counts up once, when its card first takes the light. */
function Count({ value, run, className }: { value: string; run: boolean; className?: string }) {
  const target = parseFloat(value)
  const dec = (value.split('.')[1] ?? '').length
  const [n, setN] = useState(run ? target : 0)
  const started = useRef(run)
  useEffect(() => {
    if (!run || started.current) return
    started.current = true
    let raf = 0
    let t0 = -1
    const tick = (t: number) => {
      if (t0 < 0) t0 = t
      const p = Math.min(1, (t - t0) / 1200)
      setN(target * (1 - Math.pow(1 - p, 4)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target])
  return <span className={className} aria-label={value}>{n.toFixed(dec)}</span>
}

function CardBody({ sl, h, inert }: { sl: Slide; h: Handlers; inert?: boolean }) {
  if (sl.kind === 'request') {
    const r = sl.req
    const st = requestStates[r.state]
    const n = h.unreadOf(r)
    const at = stateSteps.indexOf(r.state)
    return (
      <>
        {/* the landing's rendered keycap for the service (no tinting, no glyph) */}
        <img src={`concepts/vc/key-${r.service}.png`} alt="" className={`${s.peek} ${s.imgKey}`} draggable={false} />
        <div className={s.body} inert={(inert) ? '' : undefined}>
          <span className={`${s.label} ${s.labelQuiet}`}>Request · {svc(r.service).label}</span>
          {/* where this request is: the loop, on the card it belongs to */}
          <ol className={s.track} aria-label={`State: ${st.label}`}>
            {stateSteps.map((step, i) => (
              <li key={step} className={i < at ? s.trackDone : i === at ? s.trackOn : undefined} aria-current={i === at ? 'step' : undefined}>
                <i aria-hidden />{requestStates[step].label}
              </li>
            ))}
          </ol>
          <div className={s.foot}>
            <h2 className={`${s.title} ${s.titleReq}`}>{r.title}</h2>
            <p className={s.text}>{st.line}.</p>
            <p className={s.meta}>
              <span>{r.from} · {r.when}</span>
              {n > 0 && <span className={s.newTag}>{n} new</span>}
            </p>
            <div className={s.actions}>
              {r.state === 'proposal'
                ? <button className={s.btnSmoke} onClick={() => h.markSeen(r.id)}>Read the proposal</button>
                : <button className={s.btnOutline} onClick={() => h.markSeen(r.id)}>Open</button>}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (sl.kind === 'ready') {
    const r = sl.r
    const score = r.unit === '/100'
    const on = h.lit(sl.id)
    const sent = h.sentFrom(r)
    return (
      <div className={`${s.body} ${s.bodyReady}`} inert={(inert) ? '' : undefined}>
        <div className={s.readyTop}>
          <h2 className={`${s.label} ${s.h2Label}`}>{r.title}</h2>
          <span className={r.trend === 'up' ? s.up : s.down}>{r.trend === 'up' ? '↑' : '↓'} {r.delta.replace(' since September', ' since Sep')}</span>
        </div>
        <div className={s.figure}>
          <Count value={r.value} run={on} className={s.num} />
          <span className={s.unit}>{r.unit}</span>
        </div>
        {/* the chart is the image (art director): the whole spectrum, six months, the typical value dashed */}
        <div className={s.chartBox}>
          <Chart
            kind={score ? 'area' : 'dots'}
            series={r.series}
            labels={seriesMonths}
            typical={r.typical}
            typicalLabel={`Typical ${r.typical}${score ? '' : r.unit}`}
            format={v => `${v}${score ? '' : r.unit}`}
            seen={on}
            spectrum
          />
        </div>
        <div className={`${s.actions} ${s.actionsReady}`}>
          <button className={s.btnOutline}>Open report</button>
          {sent && (
            <button className={s.sentLink} onClick={h.showRequests} data-req-toggle title={sent.title}>
              <i aria-hidden />{requestStates[sent.state].label} · {sent.title}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (sl.kind === 'available') {
    const r = sl.r
    const state = h.reportSent(r.id)
    return (
      <>
        <div className={`${s.peek} ${sl.imgClass} ${state === 'done' ? s.glassLit : ''}`} aria-hidden>
          <img src={sl.img} alt="" draggable={false} />
          <GlassGlyph kind={sl.glyph} style={{ left: `${sl.face[0]}%`, top: `${sl.face[1]}%` }} />
        </div>
        <div key={state ?? 'front'} className={`${s.body} ${state ? s.flipIn : ''}`} inert={(inert) ? '' : undefined}>
          {state === 'confirm' ? (
            <>
              <div className={s.foot}>
                <span className={s.label}>{r.kind} report</span>
                <h2 className={s.title}>Request the {r.kind.toLowerCase()} report?</h2>
                <p className={s.text}>The Spark team prepares it. {r.eta}.</p>
                <div className={s.actions}>
                  <button className={s.btnSpark} onClick={() => h.requestReport(r)}><IconStar size={16} />{loop.sendLabel}</button>
                  <button className={s.btnText} onClick={() => h.order(r.id, null)}>Not now</button>
                </div>
              </div>
            </>
          ) : state === 'done' ? (
            <>
              <div className={s.foot}>
                <span className={`${s.label} ${s.labelSent}`}>{r.kind} · {requestStates.sent.label}</span>
                <h2 className={s.title}>{r.title}</h2>
                <p className={`${s.meta} ${s.sentMeta}`}><IconCheck size={16} />{requestStates.sent.label} · the Spark team prepares it</p>
                <p className={s.etaLine}>{r.eta}</p>
                <div className={s.actions}>
                  <button className={s.btnText} onClick={h.showRequests} data-req-toggle>See it in requests <IconRight size={16} /></button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={s.foot}>
                <span className={s.label}>{r.kind}</span>
                <h2 className={s.title}>{r.title}</h2>
                <p className={s.text}>{r.body}</p>
                <p className={s.etaLine}>{r.eta}</p>
                <div className={s.actions}>
                  <button className={s.btnGlass} onClick={() => h.order(r.id, 'confirm')}>{reportAction}</button>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <img src={sl.img} alt="" className={`${s.peek} ${sl.imgClass}`} draggable={false} />
      <div className={s.body} inert={(inert) ? '' : undefined}>
        <div className={s.foot}>
          <span className={`${s.label} ${s.labelHuman}`}>{consultation.label} · {consultation.minutes} min</span>
          <h2 className={`${s.title} ${s.titleNarrow}`}>{consultation.title.split(', ').map((part, i, a) => <span key={i} className={s.lineBlock}>{part}{i < a.length - 1 ? ',' : ''}</span>)}</h2>
          <p className={`${s.text} ${s.textNarrow}`}>{consultation.body}</p>
          <div className={s.actions}><button className={s.btnSmoke}>{consultation.cta}</button></div>
        </div>
      </div>
    </>
  )
}
