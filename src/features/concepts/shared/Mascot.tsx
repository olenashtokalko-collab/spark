import { useEffect, useRef, useState } from 'react'

/**
 * Dr.AI — the 3D mascot from DrAI_Sparki_Delivery.zip (transparent VP9 clips, 640²).
 * Sparki (the little glass star) is already inside every clip.
 *
 * state:
 *   intro      — Sparki flies out of the chest, circles the head, pops; then idle
 *   idle       — breathing, waiting
 *   listening  — leans in (use while the user types)
 *   thinking   — hand to chin (enter → loop a/b → exit when the state changes)
 *   speaking   — talking (short / medium / long by `talk`)
 *
 * Two stacked <video>s cross-fade so switching clips never flashes.
 * Safari cannot draw VP9 alpha: it gets the HEVC idle clip, or the still for other states.
 */
export type MascotState = 'intro' | 'idle' | 'listening' | 'thinking' | 'speaking'

const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)

const clip = (name: string) => `concepts/mascot/${name}.webm`

function pickClip(state: MascotState, phase: number, talk: 'short' | 'medium' | 'long'): { src: string; loop: boolean } {
  switch (state) {
    case 'intro': return { src: clip('intro'), loop: false }
    case 'listening': return { src: clip('listening'), loop: true }
    case 'thinking':
      if (phase === 0) return { src: clip('enter_think'), loop: false }
      return { src: clip(phase % 2 ? 'think_loop_a' : 'think_loop_b'), loop: false }
    case 'speaking': return { src: clip(`speaking_${talk}`), loop: true }
    default: return { src: clip('idle'), loop: true }
  }
}

type Props = {
  state?: MascotState
  talk?: 'short' | 'medium' | 'long'
  size?: number | string
  className?: string
  style?: React.CSSProperties
  /** called when a one-shot clip (intro) finishes */
  onDone?: () => void
  title?: string
}

export default function Mascot({ state = 'idle', talk = 'medium', size = 240, className, style, onDone, title = 'Dr.AI' }: Props) {
  const [current, setCurrent] = useState<MascotState>(state)
  const [phase, setPhase] = useState(0)
  const [front, setFront] = useState<0 | 1>(0)
  const vids = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const prev = useRef<MascotState>(state)

  // state change from the parent (leaving "thinking" plays the exit clip first)
  useEffect(() => {
    if (state === prev.current) return
    if (prev.current === 'thinking' && state !== 'thinking') {
      prev.current = state
      swap(clip('exit_think'), false, () => { setCurrent(state); setPhase(0) })
      return
    }
    prev.current = state
    setCurrent(state)
    setPhase(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const pending = useRef<null | (() => void)>(null)

  function swap(src: string, loop: boolean, after?: () => void) {
    const back = (front ^ 1) as 0 | 1
    const v = vids[back].current
    if (!v) return
    pending.current = after ?? null
    v.loop = loop
    if (!v.src.endsWith(src)) v.src = src
    v.currentTime = 0
    const go = () => {
      v.play().catch(() => {})
      setFront(back)
    }
    if (v.readyState >= 2) go()
    else v.addEventListener('loadeddata', go, { once: true })
  }

  useEffect(() => {
    if (isSafari) return
    const { src, loop } = pickClip(current, phase, talk)
    swap(src, loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, phase, talk])

  function onEnded(i: 0 | 1) {
    if (i !== front) return
    if (pending.current) { const f = pending.current; pending.current = null; f(); return }
    if (current === 'intro') { onDone?.(); setCurrent('idle'); prev.current = 'idle'; return }
    if (current === 'thinking') setPhase(p => p + 1)
  }

  const box: React.CSSProperties = { position: 'relative', width: size, aspectRatio: '1', ...style }
  const layer: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity .18s linear' }

  if (isSafari) {
    return (
      <div className={className} style={box} role="img" aria-label={title}>
        {state === 'idle'
          ? <video style={layer} src="concepts/mascot/idle.mov" autoPlay muted loop playsInline poster="concepts/mascot/still.png" />
          : <img style={layer} src="concepts/mascot/still.png" alt="" />}
      </div>
    )
  }

  return (
    <div className={className} style={box} role="img" aria-label={title}>
      {[0, 1].map(i => (
        <video
          key={i}
          ref={vids[i]}
          style={{ ...layer, opacity: front === i ? 1 : 0 }}
          muted
          playsInline
          preload="auto"
          poster={i === 0 ? 'concepts/mascot/still.png' : undefined}
          onEnded={() => onEnded(i as 0 | 1)}
        />
      ))}
    </div>
  )
}
