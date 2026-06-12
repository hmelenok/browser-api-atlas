import type {RuntimeStatus} from './types'

/**
 * Resolve a dotted runtime key against the current environment.
 *
 * Examples:
 *   "window.Notification"     → typeof window.Notification !== 'undefined'
 *   "navigator.storage"       → 'storage' in navigator
 *   "navigator.mediaDevices"  → 'mediaDevices' in navigator
 *
 * We treat a path as "supported" if every segment resolves to something
 * that's not undefined. A nullable navigator method (like getBattery) is
 * still "supported" if the method exists, even if calling it would fail.
 */
export function detectRuntime(key: string): RuntimeStatus {
  if (typeof window === 'undefined') {
    return {supported: false, reason: 'no window'}
  }

  const segments = key.split('.')
  let cur: unknown = globalThis

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (cur == null || (typeof cur !== 'object' && typeof cur !== 'function')) {
      return {supported: false, reason: `${segments.slice(0, i).join('.')} is ${typeof cur}`}
    }
    const val = (cur as Record<string, unknown>)[seg]
    if (val === undefined) {
      return {supported: false, reason: `${seg} not in ${segments.slice(0, i).join('.') || 'globalThis'}`}
    }
    cur = val
  }

  return {supported: true}
}

/** Detect support for every API in the catalog, keyed by entry id. */
export function detectAll(entries: Array<{id: string; runtimeKey: string}>): Record<string, RuntimeStatus> {
  const out: Record<string, RuntimeStatus> = {}
  for (const e of entries) out[e.id] = detectRuntime(e.runtimeKey)
  return out
}
