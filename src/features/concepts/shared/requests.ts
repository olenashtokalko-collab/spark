import { useSyncExternalStore } from 'react'
import { requests as seed, type SparkRequest, type ServiceKey } from './data'

/**
 * Round 2 core loop: "Send to Spark".
 * A tiny in-memory store so every variant can turn a Dr.AI conversation (or a report) into a Request
 * and show it on Home straight away. Prototype only: nothing is saved, a reload resets it.
 */
let list: SparkRequest[] = [...seed]
const subs = new Set<() => void>()
const emit = () => subs.forEach(f => f())

export function sendToSpark(input: { title: string; service?: ServiceKey; from: string }): SparkRequest {
  const r: SparkRequest = {
    id: `r${Date.now()}`,
    title: input.title,
    service: input.service ?? 's',
    state: 'sent',
    from: input.from,
    when: 'Just now',
  }
  list = [r, ...list]
  emit()
  return r
}

export function useRequests(): SparkRequest[] {
  return useSyncExternalStore(
    cb => { subs.add(cb); return () => subs.delete(cb) },
    () => list,
  )
}
