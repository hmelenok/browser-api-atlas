import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

// Sieve of Eratosthenes — count primes < n
const PRIME_FN = `
function countPrimes(n) {
  if (n < 2) return 0
  const sieve = new Uint8Array(n)
  let count = 0
  for (let i = 2; i < n; i++) {
    if (!sieve[i]) {
      count++
      for (let j = i * i; j < n; j += i) sieve[j] = 1
    }
  }
  return count
}
`

const WORKER_SOURCE = `
${PRIME_FN}
self.onmessage = (e) => {
  const t0 = performance.now()
  const result = countPrimes(e.data.n)
  const elapsed = performance.now() - t0
  postMessage({result, elapsed})
}
`

// Same function so the comparison is apples-to-apples on the main thread
function countPrimes(n: number): number {
  if (n < 2) return 0
  const sieve = new Uint8Array(n)
  let count = 0
  for (let i = 2; i < n; i++) {
    if (!sieve[i]) {
      count++
      for (let j = i * i; j < n; j += i) sieve[j] = 1
    }
  }
  return count
}

const SIZES = [1_000_000, 5_000_000, 20_000_000, 50_000_000]

function WebWorkerDemo() {
  const supported = typeof Worker !== 'undefined'
  const [n, setN] = useState(20_000_000)
  const [mainResult, setMainResult] = useState<{result: number; elapsed: number} | null>(null)
  const [workerResult, setWorkerResult] = useState<{result: number; elapsed: number} | null>(null)
  const [tick, setTick] = useState(0) // ticks during compute to show main-thread freeze
  const [busy, setBusy] = useState<'main' | 'worker' | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // Heartbeat that visualizes whether the main thread is responsive
  useEffect(() => {
    let raf = 0
    const loop = () => {
      setTick((t) => t + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => () => workerRef.current?.terminate(), [])

  const runOnMain = () => {
    setMainResult(null)
    setBusy('main')
    // Defer so the button click commits before the freeze
    setTimeout(() => {
      const t0 = performance.now()
      const result = countPrimes(n)
      setMainResult({result, elapsed: performance.now() - t0})
      setBusy(null)
    }, 50)
  }

  const runInWorker = () => {
    setWorkerResult(null)
    setBusy('worker')
    const blob = new Blob([WORKER_SOURCE], {type: 'application/javascript'})
    const url = URL.createObjectURL(blob)
    const w = new Worker(url)
    workerRef.current = w
    w.onmessage = (e) => {
      setWorkerResult(e.data)
      setBusy(null)
      w.terminate()
      URL.revokeObjectURL(url)
    }
    w.postMessage({n})
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">Worker not available.</p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          count primes below
        </p>
        <DemoRow>
          {SIZES.map((s) => (
            <DemoButton
              key={s}
              variant={n === s ? 'primary' : 'ghost'}
              onClick={() => setN(s)}
            >
              {s.toLocaleString()}
            </DemoButton>
          ))}
        </DemoRow>
      </div>

      <DemoRow>
        <DemoButton variant="danger" onClick={runOnMain} disabled={busy !== null}>
          {busy === 'main' ? '⏳ running…' : 'run on main thread'}
        </DemoButton>
        <DemoButton onClick={runInWorker} disabled={busy !== null}>
          {busy === 'worker' ? '⏳ running…' : 'run in worker'}
        </DemoButton>
      </DemoRow>

      <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-xs">
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          main-thread heartbeat
        </p>
        <div className="flex h-2 items-center gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-full flex-1 rounded-full transition-colors"
              style={{
                background:
                  (tick + i) % 8 < 4
                    ? 'var(--color-accent)'
                    : 'var(--color-border)',
              }}
            />
          ))}
        </div>
        <p className="mt-1 text-[10px] text-[var(--color-muted)]">
          freezes when you "run on main thread" · stays smooth when you "run in worker"
        </p>
      </div>

      {mainResult && (
        <Result label="main thread" data={mainResult} color="var(--color-status-unsupported)" />
      )}
      {workerResult && (
        <Result label="worker" data={workerResult} color="var(--color-status-supported)" />
      )}
    </DemoFrame>
  )
}

function Result({
  label,
  data,
  color,
}: {
  label: string
  data: {result: number; elapsed: number}
  color: string
}) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-xs">
      <span style={{color}} className="font-mono font-medium">
        {label}
      </span>
      <span className="ml-2 text-[var(--color-muted)]">
        {data.result.toLocaleString()} primes in{' '}
        <span className="font-mono">{data.elapsed.toFixed(0)} ms</span>
      </span>
    </div>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Worker',
  title: 'Web Worker',
  Demo: WebWorkerDemo,
  snippet: `// Source-as-Blob trick: worker code without a separate file
const src = \`
  self.onmessage = (e) => {
    const result = expensive(e.data)
    self.postMessage(result)
  }
\`
const url = URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))
const worker = new Worker(url)

worker.onmessage = (e) => { /* result */ }
worker.postMessage(payload)

// Modern way for bundled apps: ES module workers
const worker = new Worker(
  new URL('./worker.ts', import.meta.url),
  {type: 'module'}
)

// Use postMessage transferables to move ArrayBuffers without copying
worker.postMessage({buf}, [buf])`,
  notes: 'Built-in heartbeat in the demo shows the main thread freezing when you run on it — the killer feature of workers is keeping the UI responsive.',
}
