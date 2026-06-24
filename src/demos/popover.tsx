import {useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {cn} from '@/lib/cn'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

type PopoverMode = 'auto' | 'manual' | 'hint'

type HTMLElementWithPopover = HTMLElement & {
  showPopover?: () => void
  hidePopover?: () => void
  togglePopover?: () => boolean
}

function PopoverDemo() {
  const supported = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype

  const [mode, setMode] = useState<PopoverMode>('auto')
  const ref = useRef<HTMLDivElement>(null)

  const toggle = () => {
    (ref.current as HTMLElementWithPopover | null)?.togglePopover?.()
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Popover attribute not available. Chrome 114+, Safari 17+, Firefox 125+.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">mode</p>
        <DemoRow>
          {(['auto', 'manual', 'hint'] as const).map((m) => (
            <DemoButton
              key={m}
              variant={mode === m ? 'primary' : 'ghost'}
              onClick={() => setMode(m)}
            >
              {m}
            </DemoButton>
          ))}
        </DemoRow>
      </div>

      <DemoRow>
        {/* Native invoker — popovertarget attribute */}
        <button
          type="button"
          // @ts-expect-error popovertarget is a fresh HTML attribute
          popovertarget="atlas-popover-demo"
          className="inline-flex h-7 items-center rounded-md border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2.5 text-xs font-medium text-[var(--color-accent)]"
        >
          open via popovertarget
        </button>
        <DemoButton variant="ghost" onClick={toggle}>
          open via .togglePopover()
        </DemoButton>
      </DemoRow>

      {/* The popover itself */}
      <div
        ref={ref}
        popover={mode}
        id="atlas-popover-demo"
        className={cn(
          'm-auto max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]',
          'p-4 shadow-2xl shadow-black/20'
        )}
      >
        <h4 className="text-sm font-semibold">Native popover</h4>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Top layer, light-dismiss (in <code>auto</code> mode), Esc-to-close, no JS needed for the
          basics. Use <code>manual</code> for menus where you control dismiss explicitly, or{' '}
          <code>hint</code> for tooltips that don't dismiss other popovers.
        </p>
        <button
          type="button"
          // @ts-expect-error popovertarget is a fresh HTML attribute
          popovertarget="atlas-popover-demo" popovertargetaction="hide"
          className="mt-3 inline-flex h-7 items-center rounded-md border border-[var(--color-border)] px-2.5 text-xs"
        >
          close
        </button>
      </div>

      <p className="text-[10px] text-[var(--color-muted)]">
        Renders in the browser's top-layer — escapes overflow / transform / z-index parent traps.
        Same primitive powers the native <code>{`<select>`}</code> dropdown.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.HTMLElement.popover',
  title: 'Popover',
  Demo: PopoverDemo,
  snippet: `<!-- The whole API is markup -->
<button popovertarget="menu">Open menu</button>

<div id="menu" popover="auto">
  <p>I render in the top layer.</p>
  <p>Click outside or press Esc to dismiss.</p>
  <button popovertarget="menu" popovertargetaction="hide">close</button>
</div>

<!-- popover values:
     auto    light-dismiss + Esc, closes other popovers when one opens
     manual  explicit hide() only — for menus
     hint    transient (tooltips) — doesn't dismiss other popovers
-->`,
  notes: 'Top-layer rendering means no z-index gymnastics. Pairs with anchor positioning (CSS) to attach to a trigger without JS. Same primitive used by the native <select>.',
}
