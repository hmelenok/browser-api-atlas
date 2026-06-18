import {Check, Copy} from 'lucide-react'
import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface EyeDropperResult {
  sRGBHex: string
}

interface EyeDropperType {
  open(opts?: {signal?: AbortSignal}): Promise<EyeDropperResult>
}

function getEyeDropper(): {new (): EyeDropperType} | null {
  const w = window as unknown as {EyeDropper?: {new (): EyeDropperType}}
  return w.EyeDropper ?? null
}

function EyeDropperDemo() {
  const [color, setColor] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])
  const [copied, setCopied] = useState(-1)
  const [error, setError] = useState<string>('')

  const ED = getEyeDropper()

  const pick = async () => {
    if (!ED) return
    setError('')
    try {
      const result = await new ED().open()
      setColor(result.sRGBHex)
      setHistory((h) => [result.sRGBHex, ...h.filter((c) => c !== result.sRGBHex).slice(0, 6)])
    } catch (e) {
      const err = e as Error
      if (err.name !== 'AbortError') setError(err.message)
    }
  }

  const copy = async (hex: string, idx: number) => {
    await navigator.clipboard?.writeText(hex)
    setCopied(idx)
    setTimeout(() => setCopied(-1), 1200)
  }

  if (!ED) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          EyeDropper not available in this browser. Try Chrome or Edge.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={pick}>🎯 pick a color</DemoButton>
        {color && (
          <div
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
            title={`Click to copy ${color}`}
          >
            <button
              type="button"
              onClick={() => copy(color, -2)}
              className="size-7 rounded border border-[var(--color-border)]"
              style={{background: color}}
              aria-label={`Color ${color}`}
            />
            <code className="font-mono text-sm">{color}</code>
            {copied === -2 ? (
              <Check size={12} className="text-[var(--color-status-supported)]" />
            ) : (
              <Copy
                size={12}
                className="cursor-pointer text-[var(--color-muted)]"
                onClick={() => copy(color, -2)}
              />
            )}
          </div>
        )}
      </DemoRow>
      {history.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">recent</p>
          <div className="flex flex-wrap gap-1">
            {history.map((c, i) => (
              <button
                key={`${c}-${i}`}
                type="button"
                onClick={() => copy(c, i)}
                title={`Click to copy ${c}`}
                className="size-7 rounded border border-[var(--color-border)] transition hover:scale-110"
                style={{background: c}}
                aria-label={c}
              >
                {copied === i && (
                  <Check size={12} className="text-white mix-blend-difference" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-[var(--color-status-unsupported)]">{error}</p>}
      <p className="text-[10px] text-[var(--color-muted)]">
        Tip: the picker can sample pixels from anywhere on screen, not just this browser.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.EyeDropper',
  title: 'EyeDropper',
  Demo: EyeDropperDemo,
  snippet: `// Pick any color visible on screen
const dropper = new EyeDropper()
const {sRGBHex} = await dropper.open()
console.log(sRGBHex)            // '#ff5733'

// Handle user cancellation (Esc)
try {
  await dropper.open({signal: controller.signal})
} catch (e) {
  if (e.name !== 'AbortError') throw e
}`,
  notes: 'Chrome 95+ / Edge. Returns a sRGB hex string. The picker is OS-level, so it can sample any pixel on screen — useful for design tools.',
}
