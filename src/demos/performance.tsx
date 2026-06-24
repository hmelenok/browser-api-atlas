import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface Run {
  measures: PerformanceMeasure[]
  start: number
  duration: number
}

function busyWait(ms: number) {
  const stop = performance.now() + ms
  while (performance.now() < stop) {
    /* spin */
  }
}

function runScenario(): PerformanceMeasure[] {
  // Clear any previous marks from earlier runs
  performance.clearMarks()
  performance.clearMeasures()

  performance.mark('parse:start')
  busyWait(40)
  performance.mark('parse:end')

  performance.mark('compute:start')
  busyWait(120)
  performance.mark('compute:end')

  performance.mark('render:start')
  busyWait(60)
  performance.mark('render:end')

  performance.measure('parse', 'parse:start', 'parse:end')
  performance.measure('compute', 'compute:start', 'compute:end')
  performance.measure('render', 'render:start', 'render:end')

  return performance.getEntriesByType('measure') as PerformanceMeasure[]
}

const COLORS = ['var(--color-accent)', 'var(--color-status-newly)', 'var(--color-status-supported)']

function PerformanceDemo() {
  const [run, setRun] = useState<Run | null>(null)

  const start = () => {
    const t0 = performance.now()
    const measures = runScenario()
    setRun({
      measures,
      start: t0,
      duration: performance.now() - t0,
    })
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={start}>⏱ run scenario</DemoButton>
        <span className="text-[11px] text-[var(--color-muted)]">
          parse (40ms) → compute (120ms) → render (60ms)
        </span>
      </DemoRow>

      {run && (
        <div className="space-y-2">
          <div className="flex h-4 overflow-hidden rounded border border-[var(--color-border)]">
            {run.measures.map((m, i) => (
              <div
                key={m.name}
                className="flex items-center justify-center text-[10px] font-medium text-white mix-blend-difference"
                style={{
                  flexGrow: m.duration,
                  background: COLORS[i % COLORS.length],
                }}
                title={`${m.name}: ${m.duration.toFixed(1)}ms`}
              >
                {m.name}
              </div>
            ))}
          </div>

          <ul className="space-y-0.5 font-mono text-[11px]">
            {run.measures.map((m) => (
              <li key={m.name} className="flex justify-between">
                <span className="text-[var(--color-muted)]">{m.name}</span>
                <span>
                  +{(m.startTime - run.start).toFixed(1)}ms · dur{' '}
                  <span className="font-medium text-[var(--color-fg)]">
                    {m.duration.toFixed(1)}ms
                  </span>
                </span>
              </li>
            ))}
            <li className="flex justify-between pt-1 text-[var(--color-muted)]">
              <span>total</span>
              <span>{run.duration.toFixed(1)}ms</span>
            </li>
          </ul>

          <p className="text-[10px] text-[var(--color-muted)]">
            Open DevTools → Performance → record while running this demo. The marks you set
            here will appear as labeled spans in the flame chart, lining up with the call stack.
          </p>
        </div>
      )}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Performance.mark',
  title: 'Performance.mark()',
  Demo: PerformanceDemo,
  snippet: `// Drop named markers wherever you want timing data
performance.mark('parse:start')
parse()
performance.mark('parse:end')

// Compute the span between two marks
performance.measure('parse', 'parse:start', 'parse:end')

// Pull out the timings
for (const m of performance.getEntriesByType('measure')) {
  console.log(m.name, m.startTime, m.duration)
}

// Or observe live (for long-running apps)
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    sendToTelemetry(entry)
  }
}).observe({entryTypes: ['measure', 'paint', 'longtask']})`,
  notes: 'Marks appear in the DevTools Performance flame chart, automatically. Pair with PerformanceObserver to stream timings to your telemetry endpoint.',
}
