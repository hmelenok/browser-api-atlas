import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface CloseWatcherInstance {
  destroy(): void
  requestClose(): void
  oncancel: ((e: Event) => void) | null
  onclose: ((e: Event) => void) | null
}

type CloseWatcherCtor = {new (opts?: {signal?: AbortSignal}): CloseWatcherInstance}

function getCloseWatcher(): CloseWatcherCtor | null {
  const w = window as unknown as {CloseWatcher?: CloseWatcherCtor}
  return w.CloseWatcher ?? null
}

interface LogEntry {
  t: string
  kind: 'open' | 'cancel' | 'close'
}

function CloseWatcherDemo() {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const watcherRef = useRef<CloseWatcherInstance | null>(null)

  const CW = getCloseWatcher()

  const addLog = (kind: LogEntry['kind']) => {
    const t = new Date().toLocaleTimeString([], {hour12: false})
    setLog((l) => [{t, kind}, ...l.slice(0, 7)])
  }

  const openWatcher = () => {
    if (!CW) return
    if (watcherRef.current) watcherRef.current.destroy()
    const w = new CW()
    w.onclose = () => {
      addLog('close')
      setOpen(false)
      watcherRef.current = null
    }
    w.oncancel = () => addLog('cancel')
    watcherRef.current = w
    setOpen(true)
    addLog('open')
  }

  const closeProgrammatic = () => watcherRef.current?.requestClose()

  // Clean up if component unmounts
  useEffect(() => () => watcherRef.current?.destroy(), [])

  if (!CW) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          CloseWatcher not available. Chrome 120+ / Edge.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={openWatcher} disabled={open}>
          {open ? '⏳ watching…' : '👁 open a CloseWatcher'}
        </DemoButton>
        {open && (
          <DemoButton variant="ghost" onClick={closeProgrammatic}>
            close via .requestClose()
          </DemoButton>
        )}
      </DemoRow>
      {open && (
        <p className="rounded border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-2 text-xs text-[var(--color-fg)]">
          Press <kbd className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 font-mono">Esc</kbd> or
          use the browser's back gesture to fire the close handler.
        </p>
      )}
      {log.length > 0 && (
        <ul className="space-y-0.5 font-mono text-[11px]">
          {log.map((entry, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--color-muted)]">{entry.t}</span>
              <span
                className={
                  entry.kind === 'close'
                    ? 'text-[var(--color-status-supported)]'
                    : entry.kind === 'cancel'
                      ? 'text-[var(--color-status-newly)]'
                      : 'text-[var(--color-accent)]'
                }
              >
                {entry.kind}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-[var(--color-muted)]">
        One API for Esc, the browser back button, and (on mobile) the system back gesture.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.CloseWatcher',
  title: 'CloseWatcher',
  Demo: CloseWatcherDemo,
  snippet: `// One handler for Esc + browser back + mobile back gesture
const watcher = new CloseWatcher()

watcher.onclose = () => {
  // user pressed Esc / hit back / etc.
  closeModal()
}

watcher.oncancel = (e) => {
  // intercept if you need to confirm
  if (hasUnsavedChanges) e.preventDefault()
}

// Or close programmatically
watcher.requestClose()`,
  notes: 'Chrome 120+. Solves the classic "users press back to close modals" pain. Pairs naturally with <dialog>.',
}
