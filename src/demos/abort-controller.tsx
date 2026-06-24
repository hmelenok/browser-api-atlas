import {Pause, Play, X} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      {once: true}
    )
  })
}

function AbortControllerDemo() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const controllerRef = useRef<AbortController | null>(null)

  const addLog = (msg: string) => {
    const t = new Date().toLocaleTimeString([], {hour12: false})
    setLog((l) => [`${t} ${msg}`, ...l.slice(0, 5)])
  }

  // Clean up on unmount
  useEffect(() => () => controllerRef.current?.abort(), [])

  const start = async () => {
    const ctrl = new AbortController()
    controllerRef.current = ctrl
    setRunning(true)
    setProgress(0)
    addLog('▶ task started')

    try {
      for (let i = 1; i <= 10; i++) {
        await sleep(500, ctrl.signal)
        setProgress(i * 10)
      }
      addLog('✓ task completed')
    } catch (e) {
      addLog(`✗ aborted (${(e as Error).message || 'no reason'})`)
    } finally {
      setRunning(false)
      controllerRef.current = null
    }
  }

  const abort = () => {
    controllerRef.current?.abort(new DOMException('cancelled by user', 'AbortError'))
  }

  const startWithTimeout = async () => {
    // AbortSignal.timeout() — newer convenience
    const signal = AbortSignal.timeout(2000)
    setRunning(true)
    setProgress(0)
    addLog('▶ task with 2s timeout')

    try {
      for (let i = 1; i <= 10; i++) {
        await sleep(500, signal)
        setProgress(i * 10)
      }
      addLog('✓ task completed')
    } catch (e) {
      addLog(`✗ ${(e as Error).message || 'timed out'}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={start} disabled={running}>
          <Play size={12} />
          5-second task
        </DemoButton>
        <DemoButton variant="ghost" onClick={startWithTimeout} disabled={running}>
          <Pause size={12} />
          with 2s timeout
        </DemoButton>
        {running && (
          <DemoButton variant="danger" onClick={abort}>
            <X size={12} />
            abort
          </DemoButton>
        )}
      </DemoRow>

      <div className="h-3 overflow-hidden rounded-full bg-[var(--color-bg)] ring-1 ring-[var(--color-border)]">
        <div
          className="h-full rounded-full transition-[width] duration-200"
          style={{
            width: `${progress}%`,
            background: running ? 'var(--color-accent)' : 'var(--color-status-supported)',
          }}
        />
      </div>

      {log.length > 0 && (
        <ul className="space-y-0.5 font-mono text-[11px]">
          {log.map((entry, i) => (
            <li key={i} className="text-[var(--color-muted)]">
              {entry}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        AbortController is the universal cancellation token. fetch, addEventListener,
        ReadableStream, Web Locks — all accept a signal.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.AbortController',
  title: 'AbortController',
  Demo: AbortControllerDemo,
  snippet: `// The cancellation pattern that works across the platform
const controller = new AbortController()

// Pass the signal anywhere — fetch, addEventListener, locks…
const response = await fetch(url, {signal: controller.signal})

// Cancel from anywhere — a button click, an unmount, a timeout
controller.abort()
controller.abort(new DOMException('user cancelled', 'AbortError'))

// Shorthand for "timeout after N ms"
const r = await fetch(url, {signal: AbortSignal.timeout(5000)})

// Race multiple signals (AbortSignal.any is newer)
const combined = AbortSignal.any([controller.signal, AbortSignal.timeout(5000)])`,
  notes: 'One pattern, every async API. The reason argument was added in 2022 — pass a meaningful DOMException so callers can distinguish cancel from timeout from network error.',
}
