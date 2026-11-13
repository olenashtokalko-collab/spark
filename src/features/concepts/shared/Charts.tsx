import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import c from './Charts.module.css'

/* ---------------------------------------------------------------------------------------------
 * Charts, shared by A2 and D2 (art-direction pass, 12 Nov). Hand-drawn SVG, no library.
 * One rule from the brand book runs through all of them: the spectrum flows Cobalt → Ember.
 * Each chart takes its two ends of the spectrum from --c1 / --c2 on the card it sits in;
 * `spectrum` on Chart draws the whole of it instead (Cobalt → Violet → Magenta → Ember).
 *   Gauge  · a score out of 100 on a 270° arc, with a tick for the typical value
 *   Chart  · six months as a smooth area ("area") or as a dot matrix ("dots": the brand sets its figures
 *            in Doto, so the chart is drawn in the same dots), zero-based, the typical value as a dashed
 *            line, a value on hover
 *   Dial   · the 45 minutes with a strategist as 45 lit ticks of an hour
 * ------------------------------------------------------------------------------------------- */

const r1 = (n: number) => Math.round(n * 10) / 10

/** The element's own width in whole pixels, so a chart is drawn at its real size (crisp at any column width). */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setW(Math.round(el.getBoundingClientRect().width))
    if (!('ResizeObserver' in window)) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

/* ============================== Gauge ============================== */

const G = { c: 72, r: 62, a0: 135, sweep: 270 }
const polar = (deg: number, rad: number) => {
  const a = (deg * Math.PI) / 180
  return [r1(G.c + rad * Math.cos(a)), r1(G.c + rad * Math.sin(a))] as const
}

export function Gauge({ value, max = 100, mark, seen, children }: {
  value: number
  max?: number
  mark?: number          // the typical value: a tick across the ring
  seen: boolean
  children: ReactNode    // the figure in the middle
}) {
  const id = useId().replace(/:/g, '')
  const p = Math.max(0, Math.min(1, value / max))
  const [sx, sy] = polar(G.a0, G.r)
  const [ex, ey] = polar(G.a0 + G.sweep, G.r)
  const arc = `M${sx} ${sy} A${G.r} ${G.r} 0 1 1 ${ex} ${ey}`
  const [vx, vy] = polar(G.a0 + G.sweep * p, G.r)
  const markA = mark == null ? null : G.a0 + G.sweep * Math.max(0, Math.min(1, mark / max))
  return (
    <span className={c.gauge} data-seen={seen ? '' : undefined}>
      <svg viewBox="0 0 144 144" aria-hidden="true">
        <defs>
          {/* the whole track is the spectrum, faint; the lit part runs from --c1 to --c2 along the arc */}
          <linearGradient id={`${id}t`} gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="136" y2="0">
            <stop offset="0" stopColor="#1E3BD6" /><stop offset=".36" stopColor="#7A3CF0" /><stop offset=".68" stopColor="#D9358F" /><stop offset="1" stopColor="#E8501F" />
          </linearGradient>
          <linearGradient id={`${id}v`} gradientUnits="userSpaceOnUse" x1={sx} y1={sy} x2={vx} y2={vy}>
            <stop offset="0" className={c.stopA} /><stop offset="1" className={c.stopB} />
          </linearGradient>
        </defs>
        <path d={arc} className={c.gTrack} stroke={`url(#${id}t)`} />
        <path d={arc} className={c.gValue} stroke={`url(#${id}v)`} pathLength={100} style={{ strokeDasharray: `${seen ? r1(p * 100) : 0} 100` }} />
        {markA != null && (() => {
          const [x1, y1] = polar(markA, G.r - 10)
          const [x2, y2] = polar(markA, G.r + 10)
          return <line x1={x1} y1={y1} x2={x2} y2={y2} className={c.gMark} />
        })()}
        <circle cx={vx} cy={vy} r="4" className={c.gSpark} />
      </svg>
      <span className={c.gCenter}>{children}</span>
    </span>
  )
}

/* ============================== Chart: area or dots ============================== */

/** Monotone cubic through the points (no overshoot), as an SVG path. */
function smooth(pts: (readonly [number, number])[]) {
  const n = pts.length
  if (n < 3) return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0]
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]
  }
  const t: number[] = [m[0]]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2
  t[n - 1] = m[n - 2]
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue }
    const a = t[i] / m[i]
    const b = t[i + 1] / m[i]
    const s = a * a + b * b
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i] }
  }
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += ` C${r1(pts[i][0] + h)} ${r1(pts[i][1] + h * t[i])} ${r1(pts[i + 1][0] - h)} ${r1(pts[i + 1][1] - h * t[i + 1])} ${pts[i + 1][0]} ${pts[i + 1][1]}`
  }
  return d
}

const H = 128   // plot height
const TOP = 28  // room above the tallest value for the typical label
const PITCH = 8 // dot matrix: one dot every 8px
const ROWS = Math.floor((H - TOP) / PITCH)

export function Chart({ kind, series, labels, typical, typicalLabel, format, seen, spectrum }: {
  kind: 'area' | 'dots'
  series: number[]
  labels: string[]
  typical: number
  typicalLabel: string
  format: (v: number) => string
  seen: boolean
  spectrum?: boolean     // the whole Noor spectrum instead of the card's two ends
}) {
  const id = useId().replace(/:/g, '')
  const [ref, w] = useWidth<HTMLDivElement>()
  const stops = spectrum
    ? <><stop offset="0" stopColor="#1E3BD6" /><stop offset=".36" stopColor="#7A3CF0" /><stop offset=".68" stopColor="#D9358F" /><stop offset="1" stopColor="#E8501F" /></>
    : <><stop offset="0" className={c.stopA} /><stop offset="1" className={c.stopB} /></>
  const [hover, setHover] = useState<number | null>(null)
  const n = series.length
  const last = n - 1

  const dots = kind === 'dots'
  const cols = dots ? Math.max(2, Math.min(7, Math.floor(((w / n) * 0.64) / PITCH))) : 0 // dots across one month
  const blockW = cols * PITCH
  const padX = dots ? blockW / 2 : 16
  const step = n > 1 ? (w - padX * 2) / (n - 1) : 0
  const hi = Math.max(...series, typical)
  const full = dots ? ROWS * PITCH : H - TOP
  const x = (i: number) => (dots ? Math.round(padX + i * step) : r1(padX + i * step))
  const y = (v: number) => r1(H - (v / hi) * full) // zero-based: the height is the value
  const ty = y(typical)
  const pts = series.map((v, i) => [x(i), y(v)] as const)
  const line = smooth(pts)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!step) return
    const box = e.currentTarget.getBoundingClientRect()
    const i = Math.round((e.clientX - box.left - padX) / step)
    setHover(Math.max(0, Math.min(last, i)))
  }
  const tipX = hover == null ? 0 : Math.max(44, Math.min(w - 44, x(hover)))

  return (
    <div
      ref={ref}
      className={c.chart}
      data-kind={kind}
      data-seen={seen ? '' : undefined}
      data-hover={hover != null ? '' : undefined}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <span className={c.typLabel} aria-hidden="true"><i />{typicalLabel}</span>
      {w > 0 && (
        <svg className={c.plot} width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
          <defs>
            <linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1={padX} y1="0" x2={w - padX} y2="0">
              {stops}
            </linearGradient>
            <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".56" /><stop offset="1" stopColor="#fff" stopOpacity=".04" />
            </linearGradient>
            <mask id={`${id}m`}><rect width={w} height={H} fill={`url(#${id}f)`} /></mask>
            {/* dots: with `spectrum` the colour runs across the months like the area's stroke, otherwise up the column */}
            <linearGradient id={`${id}b`} gradientUnits="userSpaceOnUse" x1={spectrum ? 0 : 0} y1={spectrum ? 0 : H - full} x2={spectrum ? w : 0} y2={spectrum ? 0 : H}>
              {spectrum ? stops : <><stop offset="0" className={c.stopB} /><stop offset="1" className={c.stopA} /></>}
            </linearGradient>
          </defs>

          {!dots && series.map((_, i) => <line key={i} x1={x(i)} x2={x(i)} y1={TOP - 12} y2={H} className={c.grid} />)}
          {!dots && <line x1="0" x2={w} y1={H - 0.5} y2={H - 0.5} className={c.base} />}

          {kind === 'area' && (
            <>
              <path d={`${line} L${x(last)} ${H} L${x(0)} ${H} Z`} fill={`url(#${id}s)`} mask={`url(#${id}m)`} className={c.area} />
              <path d={line} stroke={`url(#${id}s)`} className={c.line} pathLength={1} />
            </>
          )}
          {dots && series.map((v, i) => {
            const lit = (v / hi) * ROWS
            const whole = Math.floor(lit)
            const part = lit - whole
            const x0 = x(i) - blockW / 2 + PITCH / 2
            return (
              <g key={i} className={c.dotCol} data-on={hover === i ? '' : undefined}>
                {Array.from({ length: ROWS }, (_, j) => Array.from({ length: cols }, (_, k) => {
                  const on = j < whole || (j === whole && part > 0.15)
                  return (
                    <circle
                      key={`${j}-${k}`}
                      cx={x0 + k * PITCH}
                      cy={H - PITCH / 2 - j * PITCH}
                      r="3"
                      className={on ? c.dotOn : c.dotOff}
                      fill={on ? `url(#${id}b)` : undefined}
                      style={on ? ({ ['--o' as string]: j < whole ? 1 : Math.max(0.32, part), transitionDelay: `${i * 40 + j * 40}ms` } as CSSProperties) : undefined}
                    />
                  )
                }))}
              </g>
            )
          })}

          <line x1="0" x2={w} y1={ty} y2={ty} className={c.typ} />

          {kind === 'area' && (
            <g className={c.end}>
              <circle cx={x(last)} cy={y(series[last])} r="12" className={c.endHalo} />
              <circle cx={x(last)} cy={y(series[last])} r="5" className={c.endDot} />
            </g>
          )}
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={TOP - 12} y2={H} className={c.guide} />
              {kind === 'area' && <circle cx={x(hover)} cy={y(series[hover])} r="5" className={c.pt} />}
            </g>
          )}
        </svg>
      )}

      {hover != null && (
        <span className={c.tip} style={{ left: tipX, top: Math.max(0, Math.round(y(series[hover])) - 44) }} aria-hidden="true">
          <span className={c.tipLabel}>{labels[hover]}</span>
          <b className={c.tipVal}>{format(series[hover])}</b>
        </span>
      )}

      <div className={c.months} aria-hidden="true">
        {w > 0 && labels.map((l, i) => (
          <span key={l} style={{ left: x(i) }} data-on={(hover == null ? i === last : i === hover) ? '' : undefined}>{l}</span>
        ))}
      </div>
    </div>
  )
}

/* ============================== Dial: minutes of an hour ============================== */

const NOOR = [[30, 59, 214], [122, 60, 240], [217, 53, 143], [232, 80, 31]] // Cobalt → Violet → Magenta → Ember
function noor(t: number) {
  const f = Math.max(0, Math.min(1, t)) * (NOOR.length - 1)
  const i = Math.min(NOOR.length - 2, Math.floor(f))
  const k = f - i
  const mix = (a: number, b: number) => Math.round(a + (b - a) * k)
  return `rgb(${mix(NOOR[i][0], NOOR[i + 1][0])} ${mix(NOOR[i][1], NOOR[i + 1][1])} ${mix(NOOR[i][2], NOOR[i + 1][2])})`
}

export function Dial({ minutes, seen, children }: { minutes: number; seen: boolean; children: ReactNode }) {
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = ((i * 6 - 90) * Math.PI) / 180
    const on = i < minutes
    return {
      i, on,
      x1: r1(88 + 66 * Math.cos(a)), y1: r1(88 + 66 * Math.sin(a)),
      x2: r1(88 + 82 * Math.cos(a)), y2: r1(88 + 82 * Math.sin(a)),
      color: on ? noor(i / (minutes - 1)) : undefined,
    }
  })
  return (
    <span className={c.dial} data-seen={seen ? '' : undefined}>
      <svg viewBox="0 0 176 176" aria-hidden="true">
        {ticks.map(t => (
          <line
            key={t.i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            className={t.on ? c.tickOn : c.tick}
            style={t.on ? ({ stroke: t.color, transitionDelay: `${t.i * 20}ms` } as CSSProperties) : undefined}
          />
        ))}
      </svg>
      <span className={c.dialCenter}>{children}</span>
    </span>
  )
}
