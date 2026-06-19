import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame} from './_ui'

interface Size {
  width: number
  height: number
}

function ResizeObserverDemo() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({width: 0, height: 0})
  const [changeCount, setChangeCount] = useState(0)

  useEffect(() => {
    if (!boxRef.current || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const cb = entry.contentBoxSize?.[0]
      if (cb) {
        setSize({width: Math.round(cb.inlineSize), height: Math.round(cb.blockSize)})
      } else {
        const rect = entry.contentRect
        setSize({width: Math.round(rect.width), height: Math.round(rect.height)})
      }
      setChangeCount((c) => c + 1)
    })

    observer.observe(boxRef.current)
    return () => observer.disconnect()
  }, [])

  // Auto-categorize the size
  const breakpoint = size.width < 300 ? 'sm' : size.width < 500 ? 'md' : 'lg'
  const breakpointColor = {
    sm: 'var(--color-status-newly)',
    md: 'var(--color-status-supported)',
    lg: 'var(--color-accent)',
  }[breakpoint]

  return (
    <DemoFrame>
      <p className="text-[10px] text-[var(--color-muted)]">
        Drag the bottom-right corner of the box ↘. The right column tracks size in real time.
      </p>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div
          ref={boxRef}
          className="min-h-32 min-w-32 max-w-full resize overflow-auto rounded border border-[var(--color-accent)]/40 bg-[var(--color-bg)] p-3"
          style={{width: 360, height: 160}}
        >
          <p className="text-xs leading-relaxed">
            The bottom-right corner is the standard CSS `resize: both` handle. Each user
            interaction fires a single ResizeObserver entry — even when the user is mid-drag.
          </p>
        </div>

        <aside className="min-w-32 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">live size</p>
          <p className="font-mono">
            {size.width} × {size.height}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            container query
          </p>
          <p className="font-mono" style={{color: breakpointColor}}>
            {breakpoint}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">events</p>
          <p className="font-mono">{changeCount}</p>
        </aside>
      </div>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.ResizeObserver',
  title: 'ResizeObserver',
  Demo: ResizeObserverDemo,
  snippet: `// Driven by the layout / paint cycle, not scroll
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // entry.contentBoxSize / borderBoxSize are the modern reads
    const cb = entry.contentBoxSize[0]
    console.log(cb.inlineSize, cb.blockSize)

    // Common pattern: container-query-ish breakpoint
    el.dataset.size =
      cb.inlineSize < 400 ? 'sm' :
      cb.inlineSize < 800 ? 'md' : 'lg'
  }
})

observer.observe(el, {box: 'content-box'})`,
  notes: 'The right tool for container-query polyfills, responsive components in stories / iframes, and any "react when MY size changes" need.',
}
