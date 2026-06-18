import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {cn} from '@/lib/cn'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const ITEMS = [
  {id: 1, emoji: '🗄', name: 'Storage'},
  {id: 2, emoji: '📡', name: 'Network'},
  {id: 3, emoji: '🎨', name: 'Graphics'},
  {id: 4, emoji: '🔌', name: 'Hardware'},
]

type Layout = 'grid' | 'list' | 'stack'

type DocumentWithVT = Document & {
  startViewTransition?: (cb: () => void) => {finished: Promise<void>}
}

function ViewTransitionsDemo() {
  const [layout, setLayout] = useState<Layout>('grid')

  const supported = 'startViewTransition' in document

  const transition = (next: Layout) => {
    const d = document as DocumentWithVT
    if (d.startViewTransition) {
      d.startViewTransition(() => setLayout(next))
    } else {
      setLayout(next)
    }
  }

  return (
    <DemoFrame>
      <DemoRow>
        {(['grid', 'list', 'stack'] as const).map((l) => (
          <DemoButton
            key={l}
            variant={layout === l ? 'primary' : 'ghost'}
            onClick={() => transition(l)}
          >
            {l}
          </DemoButton>
        ))}
      </DemoRow>

      <div
        className={cn(
          'min-h-[140px] rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2',
          layout === 'grid' && 'grid grid-cols-2 gap-2',
          layout === 'list' && 'flex flex-col gap-1',
          layout === 'stack' && 'relative h-32'
        )}
      >
        {ITEMS.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-2 text-xs',
              layout === 'stack' && 'absolute left-2 right-2 shadow-md'
            )}
            style={{
              viewTransitionName: `vt-item-${item.id}`,
              ...(layout === 'stack' && {top: 8 + i * 14, zIndex: ITEMS.length - i}),
            }}
          >
            <span className={layout === 'list' ? 'text-base' : 'text-xl'}>{item.emoji}</span>
            <span className="font-medium">{item.name}</span>
          </div>
        ))}
      </div>

      {!supported && (
        <p className="text-xs text-[var(--color-status-unsupported)]">
          startViewTransition not available — falling back to instant layout change.
        </p>
      )}
      <p className="text-[10px] text-[var(--color-muted)]">
        Each item has its own <code>view-transition-name</code>, so the browser morphs them
        between positions instead of crossfading the whole container.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Document.startViewTransition',
  title: 'View Transitions',
  Demo: ViewTransitionsDemo,
  snippet: `// Wrap the DOM mutation in startViewTransition.
// The browser captures before & after and animates between them.
document.startViewTransition(() => {
  setLayout('list')  // or any state change
})

// Per-element transitions: name elements you want to morph
// individually instead of cross-fading the container.
// CSS:
//   .item-1 { view-transition-name: item-1; }
//   .item-2 { view-transition-name: item-2; }

// Customize the transition with CSS:
// ::view-transition-old(item-1),
// ::view-transition-new(item-1) {
//   animation-duration: 400ms;
//   animation-timing-function: cubic-bezier(.2, 0, 0, 1);
// }`,
  notes: 'Chrome 111+. Multiple items with named transitions look like Apple-style "shared element transitions". Same primitive scales from this 4-item demo to entire SPA navigations.',
}
