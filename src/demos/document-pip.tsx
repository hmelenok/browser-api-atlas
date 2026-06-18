import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface DocumentPipApi {
  requestWindow(opts?: {width?: number; height?: number}): Promise<Window>
  window: Window | null
}

function getPip(): DocumentPipApi | null {
  const w = window as unknown as {documentPictureInPicture?: DocumentPipApi}
  return w.documentPictureInPicture ?? null
}

function DocumentPipDemo() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const pipWinRef = useRef<Window | null>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  const pip = getPip()

  useEffect(() => {
    if (pip?.window) {
      setOpen(true)
      pipWinRef.current = pip.window
    }
  }, [pip])

  const popOut = async () => {
    if (!pip) return
    try {
      const w = await pip.requestWindow({width: 320, height: 220})
      pipWinRef.current = w

      // Copy our app's stylesheets so the widget looks the same in the PiP window
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const css = Array.from(sheet.cssRules).map((r) => r.cssText).join('\n')
          const style = w.document.createElement('style')
          style.textContent = css
          w.document.head.appendChild(style)
        } catch {
          // CORS stylesheet — skip
        }
      }

      // Move our widget element into the PiP window
      if (widgetRef.current) w.document.body.appendChild(widgetRef.current)
      w.document.body.style.background = 'var(--color-bg, white)'
      w.document.body.style.padding = '12px'
      w.document.body.style.fontFamily = 'system-ui, sans-serif'

      setOpen(true)
      w.addEventListener('pagehide', () => {
        setOpen(false)
        pipWinRef.current = null
      })
    } catch (e) {
      console.error(e)
    }
  }

  if (!pip) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Document Picture-in-Picture not available. Chrome 116+ / Edge.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={popOut} disabled={open}>
          {open ? '🪟 in PiP window' : '🪟 pop out widget'}
        </DemoButton>
      </DemoRow>
      <div
        ref={widgetRef}
        className="flex items-center justify-between rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-3"
      >
        <div>
          <p className="text-sm font-medium">Floating counter</p>
          <p className="text-[10px] text-[var(--color-muted)]">
            stays interactive even in PiP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCount((c) => Math.max(0, c - 1))}
            className="size-6 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
          >
            −
          </button>
          <span className="min-w-6 text-center font-mono text-lg font-medium">{count}</span>
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="size-6 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
          >
            +
          </button>
        </div>
      </div>
      <p className="text-[10px] text-[var(--color-muted)]">
        Try the buttons while the window floats — React state and event handlers carry over.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.DocumentPictureInPicture',
  title: 'Document Picture-in-Picture',
  Demo: DocumentPipDemo,
  snippet: `// Pop any element into a floating, always-on-top window.
const pipWindow = await documentPictureInPicture.requestWindow({
  width: 320,
  height: 220,
})

// Move your widget into it
pipWindow.document.body.appendChild(widgetEl)

// Copy stylesheets so it looks the same
for (const sheet of document.styleSheets) {
  const css = [...sheet.cssRules].map(r => r.cssText).join('\\n')
  const style = pipWindow.document.createElement('style')
  style.textContent = css
  pipWindow.document.head.appendChild(style)
}

pipWindow.addEventListener('pagehide', () => {
  // user closed the PiP window
})`,
  notes: 'Chrome 116+. Distinct from the older video PiP — this works with arbitrary HTML. Great for music players, video chat sidebars, live captions, dev tools.',
}
