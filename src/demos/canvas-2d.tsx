import {Trash2, Undo2} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const COLORS = ['#0070f3', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#111']
const SIZES = [2, 4, 8, 16]

function Canvas2DDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(4)
  const drawing = useRef(false)
  const last = useRef<{x: number; y: number} | null>(null)
  const snapshots = useRef<ImageData[]>([])
  const [snapshotCount, setSnapshotCount] = useState(0)

  // Set up canvas DPI scaling once
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const cssWidth = c.clientWidth
    const cssHeight = c.clientHeight
    c.width = cssWidth * dpr
    c.height = cssHeight * dpr
    const ctx = c.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    return {x: e.clientX - rect.left, y: e.clientY - rect.top}
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!
    const ctx = c.getContext('2d')!
    // Save undo snapshot before stroke begins
    const dpr = window.devicePixelRatio || 1
    snapshots.current.push(ctx.getImageData(0, 0, c.clientWidth * dpr, c.clientHeight * dpr))
    if (snapshots.current.length > 8) snapshots.current.shift()
    setSnapshotCount(snapshots.current.length)
    drawing.current = true
    last.current = getPos(e)
    c.setPointerCapture(e.pointerId)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const next = getPos(e)
    ctx.beginPath()
    ctx.lineCap = 'round'
    ctx.strokeStyle = color
    ctx.lineWidth = size
    if (last.current) {
      ctx.moveTo(last.current.x, last.current.y)
      ctx.lineTo(next.x, next.y)
      ctx.stroke()
    }
    last.current = next
  }

  const end = () => {
    drawing.current = false
    last.current = null
  }

  const undo = () => {
    const snap = snapshots.current.pop()
    setSnapshotCount(snapshots.current.length)
    if (!snap) return
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.putImageData(snap, 0, 0)
  }

  const clear = () => {
    const c = canvasRef.current!
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    snapshots.current = []
    setSnapshotCount(0)
  }

  return (
    <DemoFrame>
      <DemoRow>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            className="size-6 rounded-full border-2 transition"
            style={{
              background: c,
              borderColor: color === c ? 'var(--color-fg)' : 'transparent',
            }}
          />
        ))}
        <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            aria-label={`Brush ${s}px`}
            className="flex size-6 items-center justify-center rounded-full border transition"
            style={{
              borderColor: size === s ? 'var(--color-fg)' : 'var(--color-border)',
            }}
          >
            <span
              className="rounded-full"
              style={{width: s, height: s, background: 'var(--color-fg)'}}
            />
          </button>
        ))}
      </DemoRow>

      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          width: '100%',
          height: 200,
          touchAction: 'none',
          cursor: 'crosshair',
        }}
        className="rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
      />

      <DemoRow>
        <DemoButton variant="ghost" onClick={undo} disabled={snapshotCount === 0}>
          <Undo2 size={12} />
          undo ({snapshotCount})
        </DemoButton>
        <DemoButton variant="danger" onClick={clear}>
          <Trash2 size={12} />
          clear
        </DemoButton>
      </DemoRow>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.CanvasRenderingContext2D',
  title: 'Canvas 2D',
  Demo: Canvas2DDemo,
  snippet: `// Setup with DPR scaling for crisp lines on high-DPI screens
const canvas = document.querySelector('canvas')
const dpr = window.devicePixelRatio || 1
canvas.width  = canvas.clientWidth  * dpr
canvas.height = canvas.clientHeight * dpr
const ctx = canvas.getContext('2d')
ctx.scale(dpr, dpr)

// Drawing
ctx.strokeStyle = '#0070f3'
ctx.lineWidth = 4
ctx.lineCap = 'round'
ctx.beginPath()
ctx.moveTo(10, 10)
ctx.lineTo(100, 100)
ctx.stroke()

// Undo: snapshot before each stroke
const before = ctx.getImageData(0, 0, canvas.width, canvas.height)
// later:
ctx.putImageData(before, 0, 0)`,
  notes: 'Pointer events (vs mouse + touch) work for mouse, pen, and touch with one handler. Always scale by devicePixelRatio for sharp lines on retina displays.',
}
