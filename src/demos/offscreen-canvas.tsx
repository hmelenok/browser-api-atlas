import {Cpu, Pause, Play} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

// Worker source — kept inline so the demo is self-contained.
const WORKER_SOURCE = /* js */ `
let ctx, w, h, raf = 0, t = 0, last = 0, frames = 0, fpsAcc = 0
function loop(now) {
  if (!ctx) return
  const dt = now - last
  last = now
  fpsAcc = fpsAcc * 0.9 + (1000 / Math.max(dt, 1)) * 0.1
  t += dt * 0.001
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 60; i++) {
    const r = 30 + i * 2
    const phase = t + i * 0.1
    const x = w/2 + Math.cos(phase) * r
    const y = h/2 + Math.sin(phase * 1.3) * r
    ctx.fillStyle = \`hsl(\${(i*6 + t*40) % 360},80%,60%)\`
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI*2)
    ctx.fill()
  }
  frames++
  if (frames % 30 === 0) self.postMessage({type: 'fps', fps: Math.round(fpsAcc)})
  raf = requestAnimationFrame(loop)
}
self.onmessage = (e) => {
  const {type} = e.data
  if (type === 'init') {
    const c = e.data.canvas
    w = c.width; h = c.height
    ctx = c.getContext('2d')
    last = performance.now()
    raf = requestAnimationFrame(loop)
  } else if (type === 'pause') {
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
  } else if (type === 'resume') {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) }
  }
}
`

function OffscreenCanvasDemo() {
  const supported =
    typeof OffscreenCanvas !== 'undefined' &&
    typeof Worker !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function'

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const [running, setRunning] = useState(false)
  const [workerFps, setWorkerFps] = useState(0)
  const [mainFps, setMainFps] = useState(0)
  const [error, setError] = useState('')

  // Track main-thread FPS to show the value of moving work off-main
  useEffect(() => {
    let raf = 0, last = performance.now(), acc = 60
    const tick = (t: number) => {
      const dt = t - last
      last = t
      acc = acc * 0.92 + (1000 / Math.max(dt, 1)) * 0.08
      setMainFps(Math.round(acc))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const start = () => {
    setError('')
    if (!canvasRef.current) return
    try {
      const offscreen = canvasRef.current.transferControlToOffscreen()
      const blob = new Blob([WORKER_SOURCE], {type: 'application/javascript'})
      const worker = new Worker(URL.createObjectURL(blob))
      worker.onmessage = (e) => {
        if (e.data.type === 'fps') setWorkerFps(e.data.fps)
      }
      worker.postMessage({type: 'init', canvas: offscreen}, [offscreen])
      workerRef.current = worker
      setRunning(true)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const togglePause = () => {
    workerRef.current?.postMessage({type: running ? 'pause' : 'resume'})
    setRunning((r) => !r)
  }

  // Stop worker on unmount
  useEffect(() => () => workerRef.current?.terminate(), [])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          OffscreenCanvas not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        {!workerRef.current ? (
          <DemoButton onClick={start}>
            <Cpu size={12} />
            transfer canvas to worker
          </DemoButton>
        ) : (
          <DemoButton variant="ghost" onClick={togglePause}>
            {running ? <Pause size={12} /> : <Play size={12} />}
            {running ? 'pause' : 'resume'}
          </DemoButton>
        )}
        <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)]">
          {workerRef.current ? 'rendering off-main' : 'idle'}
        </span>
      </DemoRow>

      <canvas
        ref={canvasRef}
        width={520}
        height={260}
        className="block w-full rounded border border-[var(--color-border)] bg-black"
        style={{aspectRatio: '2 / 1'}}
      />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Stat label="worker fps">
          <span style={{color: 'var(--color-accent)'}}>{workerFps || '—'}</span>
        </Stat>
        <Stat label="main thread fps">
          <span style={{color: 'var(--color-status-supported)'}}>{mainFps}</span>
        </Stat>
      </div>

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        The canvas is rendered entirely in a worker. Main-thread FPS stays high even when the
        worker is doing per-frame work — try blocking the main thread by scrolling and watch.
      </p>
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
  bcdKey: 'api.OffscreenCanvas',
  title: 'OffscreenCanvas',
  Demo: OffscreenCanvasDemo,
  snippet: `// Main thread: hand the canvas off
const canvas = document.querySelector('canvas')
const offscreen = canvas.transferControlToOffscreen()

// canvas is now "neutered" — you can't draw to it from main any more
const worker = new Worker('./renderer.js')
worker.postMessage({canvas: offscreen}, [offscreen])  // transfer, not copy

// Worker can draw at 60/120 fps without blocking the UI thread
// renderer.js:
self.onmessage = ({data: {canvas}}) => {
  const ctx = canvas.getContext('2d')   // or 'webgl', 'webgpu', 'bitmaprenderer'
  function tick(t) {
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    requestAnimationFrame(tick)         // ← available in workers
  }
  requestAnimationFrame(tick)
}

// Pure off-main rendering (no DOM canvas at all)
const off = new OffscreenCanvas(800, 600)
const bitmap = off.transferToImageBitmap()  // grab pixels`,
  notes: 'requestAnimationFrame in a worker doesn\'t sync to display refresh as tightly as on main — it\'s a worker-local timing primitive. For perfect sync, use the new Scheduled Frame API or a postMessage handshake.',
}
