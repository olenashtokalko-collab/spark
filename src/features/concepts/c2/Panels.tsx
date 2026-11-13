import { useLayoutEffect, useRef, useState } from 'react'
import {
  readyReports, lockedReports, consultation, company, user, requestStates, reportAction,
  type RequestState,
} from '../shared/data'
import { useRequests } from '../shared/requests'
import { useCountUp, send, takeReveal, prefersReduced } from './hooks'
import { IArrow } from './Icons'
import s from './Home.module.css'

/* C2 · "Console 2" — the review pass (art director + product designer + UI designer, 12 Nov).
   One colour logic for every kind of information:
     Ink            the reading as a figure (3.4, 41) and all text
     Noor spectrum  the reading as dots (where you are now): the brand gradient, Cobalt → Violet → Magenta → Ember
                    (designer, 12 Nov: "make the black dots the gradient"), also Dr.AI
     Haze           the empty track of a scale
     dashed, dim    "typical" (the benchmark) — the same mark on both charts
     solid, dim     "Sep" (where you were) — the same mark on both charts
     Ember          new for you, and nothing else: unread ("2 new"), "2 need you", the bell
     request state  reads as progress: empty ring = sent → Ink dot = in discussion → lit Cobalt dot = proposal ready
     Cobalt         ready (as "Ready" on report cards); also focus rings
     service hues   only inside the S·P·A·R·K glass keys
   Doto is on two figures only: 3.4 and 41. Both charts draw real numbers only (value, September, typical). */

const [web, insta] = readyReports
const cssVars = (v: Record<string, string>) => v as React.CSSProperties
/** "+6 since September" → 6 ; "−0.4 pt since September" → -0.4 */
const deltaOf = (d: string) => parseFloat(d.replace('−', '-').replace('+', ''))
const LED: Record<RequestState, string> = { proposal: s.ledYou, discussion: s.ledTalk, sent: s.ledSent }

/* the brand gradient (tokens.css --noor), sampled per dot: t = 0 is Cobalt, t = 1 is Ember */
const NOOR = [[30, 59, 214], [122, 60, 240], [217, 53, 143], [232, 80, 31]]
const noorAt = (t: number) => {
  const x = Math.min(1, Math.max(0, t)) * (NOOR.length - 1)
  const i = Math.min(NOOR.length - 2, Math.floor(x))
  const c = NOOR[i].map((a, k) => Math.round(a + (NOOR[i + 1][k] - a) * (x - i)))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

/** Panel header: Mono label on the left; on the right only something worth reading (no module numbers). */
export function Head({ label, extra, you }: { label: string; extra?: string; you?: boolean }) {
  return (
    <div className={s.head}>
      <span className={s.label}>{label}</span>
      {extra && <span className={you ? s.headYou : s.headDim}>{extra}</span>}
    </div>
  )
}

/* ───────────── Requests: whose move is it ─────────────
   No counters (they repeated the rows). Each row: the service's glass key, the title, one meta line that starts
   with the state. "Proposal ready" is the one lit row with the one smoke button. */

const MAX_ROWS = 4

export function RequestsPanel({ d }: { d: number }) {
  const list = useRequests()
  const ref = useRef<HTMLElement>(null)
  const seen = useRef<Set<string> | null>(null)
  if (seen.current === null) seen.current = new Set(list.map(r => r.id))
  const [fresh, setFresh] = useState<Record<string, number>>({})

  useLayoutEffect(() => {
    const known = seen.current!
    const added = list.filter(r => !known.has(r.id))
    if (!added.length) return
    added.forEach(r => known.add(r.id))
    let wait = 0
    const el = ref.current
    if (takeReveal() && el) {
      // only when the rows are (nearly) out of sight: scrolled past, or still below the fold
      const r = el.getBoundingClientRect()
      if (r.bottom < 240 || r.top > window.innerHeight - 240) {
        const reduce = prefersReduced()
        wait = reduce ? 0 : 1300
        window.setTimeout(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), reduce ? 0 : 700)
      }
    }
    setFresh(f => ({ ...f, ...Object.fromEntries(added.map(r => [r.id, wait])) }))
  }, [list])

  const rows = [...list.filter(r => r.state === 'proposal'), ...list.filter(r => r.state !== 'proposal')]
  const shown = rows.slice(0, MAX_ROWS)
  const more = rows.length - shown.length
  const needYou = list.filter(r => r.state === 'proposal' || r.unread).length

  return (
    <section ref={ref} id="c-requests" className={`${s.panel} ${s.glass} ${s.req} ${s.boot}`} style={cssVars({ '--d': `${d}ms` })} aria-label="Requests">
      <Head label="Requests" extra={needYou ? `${needYou} need you` : 'All with Spark'} you={needYou > 0} />
      <ol className={s.reqList} aria-live="polite">
        {shown.map((r, i) => {
          const st = requestStates[r.state]
          const lit = r.state === 'proposal'
          const isNew = r.id in fresh || !seen.current!.has(r.id)
          return (
            <li
              key={r.id}
              className={`${s.row} ${lit ? s.rowLit : ''} ${isNew ? s.rowNew : s.rowBoot}`}
              style={cssVars({ '--rd': `${isNew ? fresh[r.id] ?? 0 : d + 240 + i * 80}ms` })}
            >
              <div className={s.rowClip}>
                <div className={s.rowIn}>
                  {/* no glass key here (13 Nov, review: the keys repeat in Start a request under it) */}
                  <div className={s.rMain}>
                    <span className={s.rTitle} title={r.title}>{r.title}</span>
                    <span className={s.rMeta}>
                      <span className={s.rState}><i className={`${s.led} ${LED[r.state]}`} />{st.label}</span>
                      {r.unread ? <span className={s.rNew}>{r.unread} new</span> : null}
                      <span className={s.rFrom}><span className={s.rFromText}>{r.from}</span></span>
                      <span>{r.when}</span>
                    </span>
                  </div>
                  {lit
                    ? <button className={`${s.btn} ${s.btnSmoke} ${s.btnRead}`}>Read the proposal <IArrow /></button>
                    : <button className={s.rGo} aria-label={`Open: ${r.title}`}><IArrow /></button>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      {more > 0 && <a href="#c2" className={s.reqMore}>+{more} more · All requests <IArrow /></a>}
    </section>
  )
}

/* ───────────── Website score: 100 dots, one dot = one point ─────────────
   Drawn 1:1 (viewBox = px), every dot 4px. Gradient dots = the score now; Haze = the rest of the scale.
   Two markers pass through the gaps between dots: solid "Sep" (where the score was) and dashed "Typical". */

const N = 100
function Dial({ lit, full, typical, sep }: { lit: number; full: number; typical: number; sep: number }) {
  const c = 160, R = 128
  const pos = (i: number, r = R) => {
    const a = ((135 + (270 * i) / (N - 1)) * Math.PI) / 180
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  // a marker for value v sits in the gap after dot v (index v - 0.5)
  const mark = (v: number) => ({ a: pos(v - 0.5, R - 12), b: pos(v - 0.5, R + 16), t: pos(v - 0.5, R + 28) })
  const typ = mark(typical)
  const was = mark(sep)
  const [z1x, z1y] = pos(0, R - 20)
  const [z2x, z2y] = pos(N - 1, R - 20)
  return (
    <svg viewBox="0 0 320 320" width={320} height={320} className={s.dial} aria-hidden>
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = pos(i)
        // the spectrum runs along the arc and always ends in Ember at the current score
        return i < lit
          ? <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r={2} style={{ fill: noorAt(i / (full - 1)) }} />
          : <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r={2} className={s.dotOff} />
      })}
      <line x1={was.a[0]} y1={was.a[1]} x2={was.b[0]} y2={was.b[1]} className={s.sepLine} />
      <text x={was.t[0]} y={was.t[1]} className={s.svgDim} textAnchor="middle" dominantBaseline="middle">SEP</text>
      <line x1={typ.a[0]} y1={typ.a[1]} x2={typ.b[0]} y2={typ.b[1]} className={s.typLine} />
      <text x={typ.t[0]} y={typ.t[1]} className={s.svgDim} textAnchor="middle" dominantBaseline="middle">TYPICAL {typical}</text>
      <text x={z1x} y={z1y + 4} className={s.svgDim} textAnchor="middle">0</text>
      <text x={z2x} y={z2y + 4} className={s.svgDim} textAnchor="middle">100</text>
    </svg>
  )
}

export function WebsitePanel({ d }: { d: number }) {
  const list = useRequests()
  const value = Number(web.value)
  const delta = deltaOf(web.delta)
  const v = useCountUp(value, d + 200, 1100)
  // the fix that came out of this report, if it is already with Spark (the loop closes here)
  const fix = list.find(r => /website report/i.test(r.from))
  return (
    <section className={`${s.panel} ${s.glass} ${s.web} ${s.boot}`} style={cssVars({ '--d': `${d}ms` })} aria-label={web.title}>
      <Head label={web.title} extra="Spark team report" />
      <div className={s.dialWrap} role="img" aria-label={`Website score ${value} of 100. September: ${value - delta}. Typical: ${web.typical}.`}>
        <Dial lit={v} full={value} typical={web.typical} sep={value - delta} />
        <div className={s.dialCenter}>
          <span className={s.numXL}>{Math.round(v)}</span>
          <span className={s.unitText}>of 100</span>
        </div>
        <div className={s.legend}>
          <span className={s.trend}>↑ {delta} since Sep</span>
        </div>
      </div>
      {/* SAMPLE line, built only from the report's own facts (58 − 41, and the note) */}
      <p className={s.small}>{web.typical - value} below typical: mobile speed on 4G holds it back.</p>
      <div className={s.foot}>
        {fix
          ? <a href="#c-requests" className={s.fixLine}><i className={`${s.led} ${LED[fix.state]}`} />Fix {requestStates[fix.state].label.toLowerCase()} · {fix.when}</a>
          : <button className={`${s.btn} ${s.btnOutline}`} onClick={() => send({ title: 'Website score: from 41 toward the 58 typical', service: 'a', from: 'From the Website report' }, true)}>Ask Spark to fix this</button>}
        <button className={`${s.btn} ${s.btnOutline}`}>Open report <IArrow /></button>
      </div>
    </section>
  )
}

/* ───────────── Instagram: a dot scale, one column = 0.1 pt ─────────────
   40 columns × 5 rows = 0 to 4.0%. Same grammar as the dial: gradient = now, Haze = the rest of the scale,
   solid "Sep" and dashed "Typical" markers in the gaps. Only real numbers: 3.4, 3.8 in September, 1.9 typical. */

function Band({ lit, full, typical, sep }: { lit: number; full: number; typical: number; sep: number }) {
  const COLS = 40, ROWS = 5, P = 8, TOP = 24
  const W = COLS * P
  const H = TOP + ROWS * P
  const tx = Math.round(typical * 10) * P
  const sx = Math.round(sep * 10) * P
  const dots = []
  for (let col = 0; col < COLS; col++) {
    for (let r = 0; r < ROWS; r++) {
      dots.push(col < lit
        ? <circle key={`${col}-${r}`} cx={col * P + P / 2} cy={TOP + r * P + P / 2} r={2} style={{ fill: noorAt(col / (full - 1)) }} />
        : <circle key={`${col}-${r}`} cx={col * P + P / 2} cy={TOP + r * P + P / 2} r={2} className={s.dotOff} />)
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className={s.band} aria-hidden>
      {dots}
      <line x1={tx} x2={tx} y1={0} y2={H} className={s.typLine} />
      <text x={tx + 8} y={12} className={s.svgDim}>TYPICAL {typical}%</text>
      <line x1={sx} x2={sx} y1={16} y2={H} className={s.sepLine} />
      <text x={sx} y={12} className={s.svgDim} textAnchor="middle">SEP</text>
    </svg>
  )
}

export function InstagramPanel({ d }: { d: number }) {
  const value = Number(insta.value)
  const delta = deltaOf(insta.delta)
  const v = useCountUp(value, d + 200, 1000)
  return (
    <section className={`${s.panel} ${s.sand} ${s.ig} ${s.boot}`} style={cssVars({ '--d': `${d}ms` })} aria-label={insta.title}>
      <Head label={insta.title} extra="Spark team report" />
      <div className={s.igBody}>
        <div className={s.igRead}>
          <span className={s.numL}>{v.toFixed(1)}<span className={s.unitText}>{insta.unit}</span></span>
          <span className={s.trend}>↓ {Math.abs(delta)} pt since Sep</span>
        </div>
        <div className={s.igChart} role="img" aria-label={`Instagram engagement ${value}%. September: ${(value - delta).toFixed(1)}%. Typical: ${insta.typical}%.`}>
          <Band lit={Math.round(v * 10)} full={Math.round(value * 10)} typical={insta.typical} sep={value - delta} />
          <div className={s.axis}><span>0</span><span>4%</span></div>
        </div>
        <div className={s.igFoot}>
          <p className={s.small}>{insta.note}.</p>
          <button className={`${s.btn} ${s.btnOutline}`}>Open report <IArrow /></button>
        </div>
      </div>
    </section>
  )
}

/* ───────────── More reports: the three the Spark team can prepare on request ───────────── */

export function MoreReportsPanel({ d }: { d: number }) {
  const [sent, setSent] = useState<string[]>([])
  const request = (id: string, kind: string) => {
    if (sent.includes(id)) return
    send({ title: `${kind} report`, from: 'From Home' }, true)
    setSent(o => [...o, id])
  }
  const open = lockedReports.length - sent.length
  return (
    <section className={`${s.panel} ${s.sand} ${s.more} ${s.boot}`} style={cssVars({ '--d': `${d}ms` })} aria-label="Reports to request">
      <Head label="More reports" extra={open ? `${open} to request` : 'All requested'} />
      <ul className={s.mrList}>
        {lockedReports.map(r => {
          const on = sent.includes(r.id)
          return (
            <li key={r.id} className={s.mr}>
              <span className={s.mrKind}>{r.kind}</span>
              <span className={s.mrTitle}>{r.title}</span>
              {on
                ? <span className={s.mrSent} role="status"><i className={`${s.led} ${s.ledSent}`} />Sent · the Spark team prepares it</span>
                : <button className={`${s.btn} ${s.btnOutline}`} onClick={() => request(r.id, r.kind)}>{reportAction}</button>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ───────────── Strategist call: the landing's Storyteller portrait (the lead's pick) ───────────── */

export function CallPanel({ d }: { d: number }) {
  return (
    <section className={`${s.panel} ${s.sand} ${s.call} ${s.boot}`} style={cssVars({ '--d': `${d}ms` })} aria-label={consultation.label}>
      <Head label="Strategist call" />
      <div className={s.callBody}>
        <figure className={s.callPic}>
          <img src="concepts/img/people/storytellers.jpg" alt="" width={900} height={1117} loading="lazy" decoding="async" />
          <figcaption className={s.callChip}>{consultation.minutes} min · Video</figcaption>
        </figure>
        <div className={s.callText}>
          <h3 className={s.rule}>AI explores. People decide.</h3>
          <p className={s.body}>{consultation.body}</p>
          <button className={`${s.btn} ${s.btnOutline}`}>{consultation.cta} <IArrow /></button>
        </div>
      </div>
    </section>
  )
}

/* ───────────── Profile: one line, no chips (they repeated the line) ───────────── */

export function PlatePanel({ d }: { d: number }) {
  return (
    <section className={`${s.panel} ${s.plate} ${s.boot}`} style={cssVars({ '--d': `${d}ms` })} aria-label="Company profile">
      <Head label="Profile" />
      <div className={s.plateId}>
        <h3 className={s.plateName}>{company.name}</h3>
        <div className={s.team}>
          <span className={s.avatars}>
            <b>{user.initials}</b>
            {company.team.map(t => <b key={t.initials}>{t.initials}</b>)}
          </span>
          <span className={s.label2}>{company.teamLine.split(' · ')[1]}</span>
        </div>
      </div>
      {/* the one fact only the chips carried is appended to the line */}
      <p className={s.small}>{company.profileLine} {company.chips[company.chips.length - 1]}.</p>
    </section>
  )
}
