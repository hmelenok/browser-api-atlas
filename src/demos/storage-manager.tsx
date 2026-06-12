import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface Snapshot {
  quotaBytes: number
  usageBytes: number
  /** Per-storage-type breakdown if supported. */
  details?: Record<string, number>
  persisted: boolean
}

function format(n: number): string {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(2)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(2)} KB`
  return `${n} B`
}

async function snapshot(): Promise<Snapshot> {
  const est = (await navigator.storage.estimate()) as StorageEstimate & {usageDetails?: Record<string, number>}
  const persisted = await navigator.storage.persisted()
  return {
    quotaBytes: est.quota ?? 0,
    usageBytes: est.usage ?? 0,
    details: est.usageDetails,
    persisted,
  }
}

function StorageManagerDemo() {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [log, setLog] = useState('')

  const refresh = () => snapshot().then(setSnap).catch((e) => setLog(String(e)))
  useEffect(() => {
    refresh()
  }, [])

  const askPersist = async () => {
    try {
      const ok = await navigator.storage.persist()
      setLog(ok ? 'persisted granted ✓' : 'persisted denied — browser will not grant under heuristics or user denied')
      refresh()
    } catch (e) {
      setLog((e as Error).message)
    }
  }

  if (!snap) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-muted)]">Reading quota…</p>
      </DemoFrame>
    )
  }

  const pct = snap.quotaBytes ? (snap.usageBytes / snap.quotaBytes) * 100 : 0

  return (
    <DemoFrame>
      <div>
        <div className="mb-1 flex items-baseline justify-between text-[11px]">
          <span className="text-[var(--color-muted)]">used</span>
          <span className="font-mono">
            {format(snap.usageBytes)} / {format(snap.quotaBytes)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg)] ring-1 ring-[var(--color-border)]">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${Math.max(pct, 0.2)}%`,
              background: 'var(--color-accent)',
            }}
          />
        </div>
        <p className="mt-1 font-mono text-[10px] text-[var(--color-muted)]">{pct.toFixed(4)}%</p>
      </div>

      {snap.details && (
        <ul className="space-y-0.5 text-[10px] font-mono">
          {Object.entries(snap.details).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="text-[var(--color-muted)]">{k}</span>
              <span>{format(v)}</span>
            </li>
          ))}
        </ul>
      )}

      <DemoRow>
        <DemoButton variant="ghost" onClick={refresh}>
          re-estimate
        </DemoButton>
        <DemoButton onClick={askPersist} disabled={snap.persisted}>
          {snap.persisted ? 'persisted ✓' : 'request persist'}
        </DemoButton>
      </DemoRow>

      {log && (
        <pre className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[10px] text-[var(--color-muted)]">
          {log}
        </pre>
      )}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.StorageManager',
  title: 'Storage Manager',
  Demo: StorageManagerDemo,
  snippet: `// Origin-wide quota & usage summary
const {quota, usage, usageDetails} = await navigator.storage.estimate()

// Request that the browser not evict this origin's data under pressure
const granted = await navigator.storage.persist()

// Is the origin already persisted?
const persisted = await navigator.storage.persisted()`,
  notes: 'Browsers grant `persist()` under their own heuristics — install state, user engagement, bookmarks.',
}
