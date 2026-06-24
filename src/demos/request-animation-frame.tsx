import {Pause, Play, RotateCcw} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

function RequestAnimationFrameDemo() {
  const [running, setRunning] = useState(true)
  const [fps, setFps] = useState(0)
  const [frames, setFrames] = useState(0)
  const ballRef = useRef<HTMLDivElement>(null)
  const startedAtRef = useRef(0)
  const lastTickRef = useRef(0)
  const fpsBufferRef = useRef<number[]>([])
  const rafRef = useRef(0)

  // Animation loop — only mounted while running
  useEffect(() => {
    if (!running) return
    startedAtRef.current = performance.now()
    lastTickRef.current = performance.now()
    fpsBufferRef.current = []
    let frameCount = 0

    const tick = (t: number) => {
      // Bounce a ball along its container width
      const dt = t - startedAtRef.current
      const periodMs = 2000
      const phase = ((dt % periodMs) / periodMs) * Math.PI * 2
      const x = (Math.sin(phase) + 1) / 2 // 0..1
      if (ballRef.current) {
        ballRef.current.style.transform = `translateX(${x * 100}%) translateX(-${x * 24}px)`
      }

      // Track FPS via rolling average of inter-frame delta
      const delta = t - lastTickRef.current
      lastTickRef.current = t
      if (delta > 0) {
        fpsBufferRef.current.push(1000 / delta)
        if (fpsBufferRef.current.length > 30) fpsBufferRef.current.shift()
      }

      frameCount++
      if (frameCount % 10 === 0) {
        const avg =
          fpsBufferRef.current.reduce((a, b) => a + b, 0) / fpsBufferRef.current.length
        setFps(Math.round(avg))
        setFrames(frameCount)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])

  const reset = () => {
    setFrames(0)
    setFps(0)
    fpsBufferRef.current = []
    startedAtRef.current = performance.now()
  }

  // FPS bar fill: 60fps = full, 0fps = empty
  const fpsPct = Math.min(100, (fps / 60) * 100)
  const fpsColor =
    fps >= 55
      ? 'var(--color-status-supported)'
      : fps >= 30
        ? 'var(--color-status-newly)'
        : 'var(--color-status-unsupported)'

  return (
    <DemoFrame>
      <div className="relative h-12 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
        <div
          ref={ballRef}
          className="size-6 rounded-full bg-[var(--color-accent)] shadow"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="fps">
          <span style={{color: fpsColor}}>{fps}</span>
        </Stat>
        <Stat label="target">
          <span className="text-[var(--color-muted)]">~60</span>
        </Stat>
        <Stat label="frames">{frames.toLocaleString()}</Stat>
      </div>

      {/* FPS bar */}
      <div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg)] ring-1 ring-[var(--color-border)]">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${fpsPct}%`,
              background: fpsColor,
            }}
          />
        </div>
        <p className="mt-1 text-[10px] text-[var(--color-muted)]">
          rAF runs at the screen's refresh rate (60 Hz here, 120 Hz on ProMotion). Throttled to
          1 Hz when the tab is hidden — try switching tabs.
        </p>
      </div>

      <DemoRow>
        <DemoButton onClick={() => setRunning((r) => !r)}>
          {running ? <Pause size={12} /> : <Play size={12} />}
          {running ? 'pause' : 'resume'}
        </DemoButton>
        <DemoButton variant="ghost" onClick={reset}>
          <RotateCcw size={12} />
          reset
        </DemoButton>
      </DemoRow>
    </DemoFrame>
  )
}

function Stat({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-0.5 font-mono font-medium">{children}</p>
    </div>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Window.requestAnimationFrame',
  title: 'requestAnimationFrame',
  Demo: RequestAnimationFrameDemo,
  snippet: `// Synced to display refresh rate (60 Hz / 120 Hz / 144 Hz)
let raf = 0
let last = performance.now()

function tick(now) {
  const delta = now - last
  last = now
  update(delta)              // physics, etc. — delta-time based
  render()                   // paint — uses current state
  raf = requestAnimationFrame(tick)
}
raf = requestAnimationFrame(tick)

// Stop the loop
cancelAnimationFrame(raf)

// Auto-pauses when the tab is hidden — Page Visibility integration is built in.
// Throttled to 1 Hz on hidden tabs to save battery.

// For non-visual heavy work, use requestIdleCallback() instead.`,
  notes: 'Always include the time argument and use delta-based math — otherwise high-refresh-rate monitors run your animations at 2x speed on the same physics.',
}
