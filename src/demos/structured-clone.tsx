import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const SAMPLES = [
  {
    name: 'with cycle',
    build: () => {
      const o: Record<string, unknown> = {a: 1, b: [1, 2, 3]}
      o.self = o
      return o
    },
  },
  {
    name: 'Map + Set',
    build: () => ({
      tags: new Set(['frontier', 'audio', 'graphics']),
      counts: new Map<string, number>([
        ['storage', 14],
        ['network', 30],
      ]),
    }),
  },
  {
    name: 'Date + RegExp',
    build: () => ({
      now: new Date(),
      match: /[A-Z]\w*/g,
    }),
  },
  {
    name: 'Typed array',
    build: () => {
      const ta = new Uint8Array([8, 6, 7, 5, 3, 0, 9])
      return {bytes: ta, sum: ta.reduce((a, b) => a + b, 0)}
    },
  },
] as const

function format(value: unknown, depth = 0, seen = new WeakSet()): string {
  if (value === null) return 'null'
  if (typeof value === 'undefined') return 'undefined'
  if (typeof value !== 'object') return JSON.stringify(value)
  if (seen.has(value as object)) return '«cycle»'
  seen.add(value as object)

  if (value instanceof Date) return `Date(${value.toISOString()})`
  if (value instanceof RegExp) return value.toString()
  if (value instanceof Map) {
    return `Map(${[...value.entries()].map(([k, v]) => `${JSON.stringify(k)} → ${format(v, depth + 1, seen)}`).join(', ')})`
  }
  if (value instanceof Set) {
    return `Set(${[...value].map((v) => format(v, depth + 1, seen)).join(', ')})`
  }
  if (ArrayBuffer.isView(value)) {
    const a = value as unknown as ArrayLike<number>
    return `${value.constructor.name}([${Array.from(a).slice(0, 8).join(', ')}${a.length > 8 ? ', …' : ''}])`
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => format(v, depth + 1, seen)).join(', ')}]`
  }
  const entries = Object.entries(value as Record<string, unknown>)
  return `{${entries.map(([k, v]) => `${k}: ${format(v, depth + 1, seen)}`).join(', ')}}`
}

function StructuredCloneDemo() {
  const supported = typeof structuredClone === 'function'
  const [sampleIdx, setSampleIdx] = useState(0)
  const [tick, setTick] = useState(0) // re-runs the demo

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          structuredClone() not available. Chrome 98+, Firefox 94+, Safari 15.4+.
        </p>
      </DemoFrame>
    )
  }

  const original = SAMPLES[sampleIdx].build()

  let cloned: unknown
  let jsonCloned: unknown
  let jsonError = ''
  try {
    cloned = structuredClone(original)
  } catch (e) {
    cloned = `error: ${(e as Error).message}`
  }
  try {
    jsonCloned = JSON.parse(JSON.stringify(original))
  } catch (e) {
    jsonError = (e as Error).message
  }

  // Suppress unused warning — we reference tick in build
  void tick

  return (
    <DemoFrame>
      <DemoRow>
        {SAMPLES.map((s, i) => (
          <DemoButton
            key={s.name}
            variant={sampleIdx === i ? 'primary' : 'ghost'}
            onClick={() => {
              setSampleIdx(i)
              setTick((t) => t + 1)
            }}
          >
            {s.name}
          </DemoButton>
        ))}
      </DemoRow>

      <div className="space-y-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">original</p>
          <pre className="overflow-x-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[11px]">
            {format(original)}
          </pre>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-status-supported)]">
            structuredClone()
          </p>
          <pre className="overflow-x-auto rounded border border-[var(--color-status-supported)]/40 bg-[var(--color-status-supported)]/5 p-2 font-mono text-[11px]">
            {format(cloned)}
          </pre>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-status-unsupported)]">
            JSON.parse(JSON.stringify())
          </p>
          <pre className="overflow-x-auto rounded border border-[var(--color-status-unsupported)]/40 bg-[var(--color-status-unsupported)]/5 p-2 font-mono text-[11px]">
            {jsonError ? `error: ${jsonError}` : format(jsonCloned)}
          </pre>
        </div>
      </div>
      <p className="text-[10px] text-[var(--color-muted)]">
        Note how JSON.stringify silently drops Date/Map/Set/typed arrays — or throws on cycles —
        while structuredClone preserves them.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.structuredClone',
  title: 'structuredClone()',
  Demo: StructuredCloneDemo,
  snippet: `// Deep clone that handles what JSON can't:
// Date, RegExp, Map, Set, ArrayBuffer / typed arrays, Blob, File,
// ImageData, ImageBitmap — and circular references.

const original = {
  created: new Date(),
  tags: new Set(['a', 'b']),
  data: new Uint8Array([1, 2, 3]),
}
original.self = original         // cycle — fine

const clone = structuredClone(original)

// Transfer (move, don't copy) ArrayBuffers for performance
const buf = new ArrayBuffer(1024 * 1024)
const movedClone = structuredClone({buf}, {transfer: [buf]})
// buf is now detached on the original side — zero copies`,
  notes: 'Same algorithm used by postMessage, Cache.put, indexedDB. Use the transfer option to move (not copy) huge ArrayBuffers across worker boundaries.',
}
