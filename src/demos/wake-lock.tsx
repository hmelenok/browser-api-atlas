import {Sun, SunDim} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface WakeLockSentinelLike {
  release: () => Promise<void>
  addEventListener: (e: string, cb: () => void) => void
  removeEventListener: (e: string, cb: () => void) => void
}

interface NavigatorWithWakeLock {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>
  }
}

function WakeLockDemo() {
  const nav = navigator as Navigator & NavigatorWithWakeLock
  const supported = typeof nav.wakeLock?.request === 'function'

  const lockRef = useRef<WakeLockSentinelLike | null>(null)
  const acquiredAtRef = useRef<number>(0)
  const [held, setHeld] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [autoReacquire, setAutoReacquire] = useState(true)
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState('')

  const append = (line: string) =>
    setLog((prev) => [`${new Date().toLocaleTimeString([], {hour12: false})}  ${line}`, ...prev.slice(0, 5)])

  // Tick the elapsed time
  useEffect(() => {
    if (!held) return
    const id = setInterval(() => {
      setElapsed(Math.floor((performance.now() - acquiredAtRef.current) / 1000))
    }, 500)
    return () => clearInterval(id)
  }, [held])

  // Auto-reacquire when tab becomes visible again (Wake Lock auto-releases on hidden)
  useEffect(() => {
    const onVis = async () => {
      if (document.visibilityState === 'visible' && autoReacquire && !lockRef.current) {
        try {
          await acquire()
        } catch {
          /* ignore */
        }
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoReacquire])

  const acquire = async () => {
    setError('')
    try {
      const sentinel = await nav.wakeLock!.request('screen')
      lockRef.current = sentinel
      acquiredAtRef.current = performance.now()
      setHeld(true)
      setElapsed(0)
      append('✓ acquired')
      sentinel.addEventListener('release', () => {
        lockRef.current = null
        setHeld(false)
        append('× released (by browser)')
      })
    } catch (e) {
      setError((e as Error).message)
      append(`✗ ${(e as Error).message}`)
    }
  }

  const release = async () => {
    if (!lockRef.current) return
    await lockRef.current.release()
    lockRef.current = null
    setHeld(false)
    append('× released (by us)')
  }

  // Cleanup on unmount
  useEffect(() => () => { void lockRef.current?.release() }, [])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Wake Lock API not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        {held ? (
          <DemoButton variant="danger" onClick={release}>
            <SunDim size={12} />
            release lock
          </DemoButton>
        ) : (
          <DemoButton onClick={acquire}>
            <Sun size={12} />
            keep screen awake
          </DemoButton>
        )}
        <label className="ml-auto inline-flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={autoReacquire}
            onChange={(e) => setAutoReacquire(e.target.checked)}
            className="size-3"
          />
          re-acquire on tab visible
        </label>
      </DemoRow>

      <div
        className="flex items-center gap-3 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
        style={{
          background: held
            ? 'color-mix(in srgb, var(--color-status-newly) 8%, var(--color-bg))'
            : 'var(--color-bg)',
        }}
      >
        {held ? (
          <Sun
            size={28}
            className="shrink-0"
            style={{color: 'var(--color-status-newly)', filter: 'drop-shadow(0 0 4px currentColor)'}}
          />
        ) : (
          <SunDim size={28} className="shrink-0 text-[var(--color-muted)]" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {held ? 'Screen lock active' : 'Screen will dim normally'}
          </p>
          {held && (
            <p className="font-mono text-[11px] text-[var(--color-muted)]">
              held for {Math.floor(elapsed / 60)
                .toString()
                .padStart(2, '0')}
              :{(elapsed % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      {log.length > 0 && (
        <ul className="space-y-0.5 font-mono text-[10px] text-[var(--color-muted)]">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Switch to another tab while the lock is held → browser auto-releases it. Switch back →
        the re-acquire toggle restores it. Common for recipe sites, dashboards, presentations.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.WakeLock',
  title: 'Screen Wake Lock',
  Demo: WakeLockDemo,
  snippet: `let sentinel = null

async function keepAwake() {
  try {
    sentinel = await navigator.wakeLock.request('screen')
    sentinel.addEventListener('release', () => {
      console.log('lock released — by browser, app, or tab going hidden')
    })
  } catch (err) {
    // Often NotAllowedError if not user-gesture-initiated
    console.error(err.name, err.message)
  }
}

// Browser releases the lock automatically when the tab is hidden.
// Common pattern: re-acquire when the tab becomes visible again.
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && sentinel?.released) {
    await keepAwake()
  }
})

// Release manually
sentinel?.release()`,
  notes: 'Only `screen` type is widely supported (a `system` type was proposed but didn\'t ship). The auto-release-on-hidden behavior is deliberate — saves battery if user backgrounds the app.',
}
