import {Activity} from 'lucide-react'
import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame} from './_ui'

interface Vitals {
  fcp?: number // First Contentful Paint (ms)
  lcp?: number // Largest Contentful Paint (ms)
  cls?: number // Cumulative Layout Shift (score)
  fid?: number // (legacy) First Input Delay (ms)
  inp?: number // Interaction to Next Paint (ms)
  longTasks: Array<{duration: number; at: number}>
}

// LCP/CLS/FCP thresholds per Core Web Vitals
function rate(metric: keyof Vitals, value: number): 'good' | 'needs-improvement' | 'poor' {
  if (metric === 'lcp') return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
  if (metric === 'fcp') return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor'
  if (metric === 'cls') return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor'
  if (metric === 'inp') return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor'
  return 'good'
}

const COLOR: Record<string, string> = {
  good: 'var(--color-status-supported)',
  'needs-improvement': 'var(--color-status-newly)',
  poor: 'var(--color-status-unsupported)',
}

function PerformanceObserverDemo() {
  const supported = typeof PerformanceObserver !== 'undefined'
  const [vitals, setVitals] = useState<Vitals>({longTasks: []})
  const [observerCount, setObserverCount] = useState(0)

  useEffect(() => {
    if (!supported) return
    const observers: PerformanceObserver[] = []

    // 1. First Contentful Paint (paint entries)
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setVitals((v) => ({...v, fcp: entry.startTime}))
          }
        }
      })
      po.observe({type: 'paint', buffered: true})
      observers.push(po)
    } catch {/* unsupported */}

    // 2. Largest Contentful Paint
    try {
      const po = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1]
        if (last) setVitals((v) => ({...v, lcp: last.startTime}))
      })
      po.observe({type: 'largest-contentful-paint', buffered: true})
      observers.push(po)
    } catch {/* unsupported */}

    // 3. Cumulative Layout Shift
    try {
      let clsValue = 0
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & {value: number; hadRecentInput?: boolean}>) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setVitals((v) => ({...v, cls: clsValue}))
          }
        }
      })
      po.observe({type: 'layout-shift', buffered: true})
      observers.push(po)
    } catch {/* unsupported */}

    // 4. Interaction to Next Paint
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & {duration: number}>) {
          setVitals((v) => ({...v, inp: Math.max(v.inp ?? 0, entry.duration)}))
        }
      })
      po.observe({type: 'event', buffered: true, durationThreshold: 16} as PerformanceObserverInit & {durationThreshold: number})
      observers.push(po)
    } catch {/* unsupported */}

    // 5. Long tasks
    try {
      const po = new PerformanceObserver((list) => {
        const tasks = list.getEntries().map((e) => ({duration: e.duration, at: e.startTime}))
        setVitals((v) => ({
          ...v,
          longTasks: [...tasks, ...v.longTasks].slice(0, 5),
        }))
      })
      po.observe({type: 'longtask', buffered: true})
      observers.push(po)
    } catch {/* unsupported */}

    setObserverCount(observers.length)
    return () => observers.forEach((o) => o.disconnect())
  }, [supported])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          PerformanceObserver not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-[var(--color-accent)]" />
        <p className="text-xs font-medium">Watching Web Vitals on this page</p>
        <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)]">
          {observerCount} active observers
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Metric
          label="FCP"
          tip="First Contentful Paint — when the page first painted anything"
          value={vitals.fcp ? `${Math.round(vitals.fcp)} ms` : '—'}
          color={vitals.fcp ? COLOR[rate('fcp', vitals.fcp)] : 'var(--color-muted)'}
        />
        <Metric
          label="LCP"
          tip="Largest Contentful Paint — biggest element to render"
          value={vitals.lcp ? `${Math.round(vitals.lcp)} ms` : '—'}
          color={vitals.lcp ? COLOR[rate('lcp', vitals.lcp)] : 'var(--color-muted)'}
        />
        <Metric
          label="CLS"
          tip="Cumulative Layout Shift — unexpected movement score"
          value={vitals.cls !== undefined ? vitals.cls.toFixed(3) : '—'}
          color={
            vitals.cls !== undefined
              ? COLOR[rate('cls', vitals.cls)]
              : 'var(--color-muted)'
          }
        />
        <Metric
          label="INP"
          tip="Interaction to Next Paint — interaction responsiveness"
          value={vitals.inp ? `${Math.round(vitals.inp)} ms` : '—'}
          color={vitals.inp ? COLOR[rate('inp', vitals.inp)] : 'var(--color-muted)'}
        />
      </div>

      {vitals.longTasks.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            recent long tasks (≥ 50 ms)
          </p>
          <ul className="mt-1 space-y-0.5 font-mono text-[10px]">
            {vitals.longTasks.map((t, i) => (
              <li
                key={i}
                style={{color: t.duration > 100 ? 'var(--color-status-unsupported)' : 'var(--color-status-newly)'}}
              >
                {Math.round(t.duration)} ms blocked at {Math.round(t.at)} ms
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Same data Lighthouse / PageSpeed use, captured live from the page you're on. Try
        scrolling — INP usually updates after your first interaction.
      </p>
    </DemoFrame>
  )
}

function Metric({label, tip, value, color}: {label: string; tip: string; value: string; color: string}) {
  return (
    <div
      className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
      title={tip}
    >
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-0.5 font-mono font-medium" style={{color}}>
        {value}
      </p>
    </div>
  )
}

export const demo: Demo = {
  bcdKey: 'api.PerformanceObserver',
  title: 'PerformanceObserver',
  Demo: PerformanceObserverDemo,
  snippet: `// Subscribe to Web Vitals as the browser measures them
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.entryType, entry.startTime, entry.duration)
  }
}).observe({type: 'largest-contentful-paint', buffered: true})

// buffered: true → also fire for entries that happened *before* you subscribed

// Cumulative Layout Shift — sum entry.value across session
let cls = 0
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.hadRecentInput) cls += e.value
  }
  reportCls(cls)
}).observe({type: 'layout-shift', buffered: true})

// Long tasks (main-thread blocked > 50ms)
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (e.duration > 100) reportJank(e)
  }
}).observe({type: 'longtask'})

// User Timing — your own marks/measures
performance.mark('checkout-start')
// … work …
performance.measure('checkout', 'checkout-start')
new PerformanceObserver((list) => {
  list.getEntriesByType('measure').forEach(m =>
    console.log(m.name, m.duration)
  )
}).observe({type: 'measure'})`,
  notes: 'Use `buffered: true` to retroactively get entries that happened before subscription — this is how RUM libraries capture LCP even if their script loads late. Production code should batch reports to avoid hammering the analytics endpoint.',
}
