import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {cn} from '@/lib/cn'
import {DemoFrame} from './_ui'

const ITEMS = Array.from({length: 12}, (_, i) => ({
  id: i,
  title: `Item ${i + 1}`,
  hue: (i * 30) % 360,
}))

function IntersectionObserverDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [visible, setVisible] = useState<Set<number>>(new Set())
  const [ratios, setRatios] = useState<Record<number, number>>({})

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          const next = new Set(prev)
          for (const e of entries) {
            const id = parseInt((e.target as HTMLElement).dataset.id ?? '', 10)
            if (e.isIntersecting) next.add(id)
            else next.delete(id)
            setRatios((r) => ({...r, [id]: e.intersectionRatio}))
          }
          return next
        })
      },
      {root: containerRef.current, threshold: [0, 0.25, 0.5, 0.75, 1]}
    )

    Object.values(itemRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <DemoFrame>
      <p className="text-[10px] text-[var(--color-muted)]">
        Scroll the list — the right column updates live as each card enters / leaves the viewport.
      </p>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        {/* Scrollable list */}
        <div
          ref={containerRef}
          className="h-48 overflow-y-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
        >
          <div className="flex flex-col gap-2">
            {ITEMS.map((item) => (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el
                }}
                data-id={item.id}
                className={cn(
                  'rounded border p-3 text-sm transition-all',
                  visible.has(item.id)
                    ? 'border-[var(--color-accent)] shadow-[0_0_0_3px_var(--color-accent)/20]'
                    : 'border-[var(--color-border)] opacity-60'
                )}
                style={{background: `oklch(96% 0.04 ${item.hue})`}}
              >
                <div className="font-medium text-[oklch(20%_0_0)]">{item.title}</div>
                <div className="text-[10px] text-[oklch(35%_0_0)]">
                  ratio: {(ratios[item.id] ?? 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visible list */}
        <aside className="min-w-32 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[11px]">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            visible ({visible.size})
          </p>
          <ul className="space-y-0.5">
            {[...visible]
              .sort((a, b) => a - b)
              .map((id) => (
                <li key={id} className="font-mono">
                  Item {id + 1} · {((ratios[id] ?? 0) * 100).toFixed(0)}%
                </li>
              ))}
          </ul>
        </aside>
      </div>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.IntersectionObserver',
  title: 'IntersectionObserver',
  Demo: IntersectionObserverDemo,
  snippet: `// Notify whenever any of the targets crosses one of the thresholds
const observer = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      console.log(e.target, e.isIntersecting, e.intersectionRatio)
      // typical: lazy-load images, fire analytics on visible cards,
      // infinite-scroll trigger, autoplay video, etc.
    }
  },
  {
    root: scrollContainer,          // null = viewport
    threshold: [0, 0.5, 1],         // ratios to notify at
    rootMargin: '100px 0px',        // expand root by N px
  },
)

for (const el of document.querySelectorAll('.card')) {
  observer.observe(el)
}`,
  notes: 'Vastly cheaper than scroll listeners — work happens off the main thread and is rate-limited by the browser.',
}
