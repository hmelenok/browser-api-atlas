import {Gamepad2} from 'lucide-react'
import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame} from './_ui'
import {cn} from '@/lib/cn'

interface State {
  id: string
  index: number
  buttons: Array<{pressed: boolean; value: number}>
  axes: number[]
  mapping: string
}

function GamepadDemo() {
  const supported = typeof navigator !== 'undefined' && 'getGamepads' in navigator
  const [pads, setPads] = useState<State[]>([])

  useEffect(() => {
    if (!supported) return
    let raf = 0
    const loop = () => {
      const list = Array.from(navigator.getGamepads()).filter((g): g is Gamepad => g !== null)
      setPads(
        list.map((g) => ({
          id: g.id,
          index: g.index,
          mapping: g.mapping || '(no mapping)',
          buttons: g.buttons.map((b) => ({pressed: b.pressed, value: b.value})),
          axes: [...g.axes],
        }))
      )
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [supported])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Gamepad API not available.
        </p>
      </DemoFrame>
    )
  }

  if (pads.length === 0) {
    return (
      <DemoFrame>
        <div className="rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center text-sm">
          <Gamepad2 size={28} className="mx-auto mb-2 text-[var(--color-muted)]" />
          <p>No gamepads connected.</p>
          <p className="mt-1 text-[11px] text-[var(--color-muted)]">
            Plug one in or pair Bluetooth, then press any button — browsers require a button
            press for first contact.
          </p>
        </div>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      {pads.map((pad) => (
        <div
          key={pad.index}
          className="space-y-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
        >
          <div className="flex items-center gap-2">
            <Gamepad2 size={14} className="text-[var(--color-accent)]" />
            <span className="font-mono text-xs font-medium">[{pad.index}]</span>
            <span className="truncate text-xs">{pad.id}</span>
            <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)]">
              {pad.mapping}
            </span>
          </div>

          {/* Buttons grid */}
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
              buttons ({pad.buttons.length})
            </p>
            <div className="grid grid-cols-8 gap-1">
              {pad.buttons.map((b, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex h-7 items-center justify-center rounded border text-[10px] font-mono transition',
                    b.pressed
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                      : b.value > 0
                        ? 'border-[var(--color-status-newly)] bg-[var(--color-status-newly)]/20 text-[var(--color-status-newly)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted)]'
                  )}
                  title={`Button ${i}: ${b.value.toFixed(2)}`}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>

          {/* Axes (sticks) */}
          {pad.axes.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
                axes ({pad.axes.length})
              </p>
              <div className="grid grid-cols-2 gap-2">
                {/* Pair axes 0-1 and 2-3 as left/right stick */}
                {[0, 2].map((idx) => {
                  const x = pad.axes[idx] ?? 0
                  const y = pad.axes[idx + 1] ?? 0
                  return (
                    <div key={idx} className="rounded border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-2">
                      <div className="relative mx-auto h-16 w-16">
                        <div className="absolute inset-0 rounded-full border border-[var(--color-border)]" />
                        <div className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-muted)]" />
                        <div
                          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] shadow"
                          style={{
                            left: `${50 + x * 40}%`,
                            top: `${50 + y * 40}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-center font-mono text-[10px] text-[var(--color-muted)]">
                        axis {idx}/{idx + 1}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Gamepad',
  title: 'Gamepad',
  Demo: GamepadDemo,
  snippet: `// Polling pattern — Gamepad has no events for buttons/axes
function pollGamepads() {
  const pads = navigator.getGamepads()
  for (const pad of pads) {
    if (!pad) continue
    pad.buttons.forEach((btn, i) => {
      if (btn.pressed) console.log('button', i, 'value', btn.value)
    })
    // axes are -1..1
    const [lx, ly, rx, ry] = pad.axes
  }
  requestAnimationFrame(pollGamepads)
}
requestAnimationFrame(pollGamepads)

// Connection events (these DO fire)
window.addEventListener('gamepadconnected', (e) => {
  console.log(\`connected: \${e.gamepad.id} (\${e.gamepad.mapping})\`)
})

// Vibration (haptic feedback)
pad.vibrationActuator?.playEffect('dual-rumble', {
  startDelay: 0,
  duration: 200,
  strongMagnitude: 1.0,
  weakMagnitude: 0.5,
})`,
  notes: 'Browsers require a button press before exposing the gamepad to the page (privacy). Mapping "standard" means buttons are in PlayStation/Xbox layout; otherwise the layout is device-specific.',
}
