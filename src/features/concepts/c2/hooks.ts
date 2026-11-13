import { useEffect, useRef, useState } from 'react'
import { sendToSpark } from '../shared/requests'
import type { ServiceKey } from '../shared/data'

export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Instrument "power-on": counts from 0 to `target` after `delay` ms (ease-out). Instant with reduced motion. */
export function useCountUp(target: number, delay = 0, dur = 900) {
  const [reduce] = useState(prefersReduced)
  const [v, setV] = useState(reduce ? target : 0)
  useEffect(() => {
    if (reduce) { setV(target); return }
    // setTimeout frames (not rAF) so the boot also completes in background tabs and headless captures
    let id = 0
    const start = performance.now() + delay
    const tick = () => {
      const t = Math.min(1, Math.max(0, (performance.now() - start) / dur))
      setV(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) id = window.setTimeout(tick, 16)
    }
    id = window.setTimeout(tick, 16)
    return () => clearTimeout(id)
  }, [target, delay, dur, reduce])
  return v
}

/** true once `ms` have passed (immediately with reduced motion). Used for the LED self-test on boot. */
export function useAfter(ms: number) {
  const [on, setOn] = useState(prefersReduced)
  useEffect(() => {
    if (on) return
    const id = window.setTimeout(() => setOn(true), ms)
    return () => clearTimeout(id)
  }, [ms, on])
  return on
}

/* ───────── Send to Spark ─────────
   Wraps the shared sendToSpark(). `reveal` asks the Requests instrument to bring itself into view
   (when it is off-screen) so the user sees the new reading land. */
let revealNext = false
export function send(input: { title: string; service?: ServiceKey; from: string }, reveal = false) {
  revealNext = reveal
  return sendToSpark(input)
}
export function takeReveal() {
  const r = revealNext
  revealNext = false
  return r
}

/* ───────── Keys → Dr.AI ─────────
   The S·P·A·R·K brief can hand its text to Dr.AI ("Tell Dr.AI what you need"). */
export type Ask = { text: string; service?: ServiceKey }
const askSubs = new Set<(a: Ask) => void>()
export function askDrAI(a: Ask) { askSubs.forEach(f => f(a)) }
export function useAskListener(cb: (a: Ask) => void) {
  const ref = useRef(cb)
  useEffect(() => { ref.current = cb })
  useEffect(() => {
    const f = (a: Ask) => ref.current(a)
    askSubs.add(f)
    return () => { askSubs.delete(f) }
  }, [])
}
