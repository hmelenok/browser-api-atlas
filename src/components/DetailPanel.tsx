import {lazy, Suspense} from 'react'

import {useStore} from '@/store'
import {cn} from '@/lib/cn'

// Lazy-load the heavy contents — this chunk includes the demo registry
// (every demo file), CodeBlock, and most of the panel UI. The shell stays
// in the main bundle so the slide-in animation is instant on first click.
const Contents = lazy(() => import('./DetailPanelContents'))

export function DetailPanel() {
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)
  const isOpen = !!selectedId

  return (
    <>
      {/* Backdrop for outside-click close on mobile */}
      <div
        className={cn(
          'fixed inset-0 z-20 bg-transparent transition md:hidden',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        onClick={() => select(null)}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-30 flex h-full w-full max-w-md flex-col',
          'border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl shadow-black/5',
          'transition-transform duration-200',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!isOpen}
      >
        {selectedId && (
          <Suspense fallback={<LoadingSkeleton />}>
            <Contents key={selectedId} entryId={selectedId} onClose={() => select(null)} />
          </Suspense>
        )}
      </aside>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div className="size-2.5 animate-pulse rounded-full bg-[var(--color-border)]" />
        <div className="flex-1 space-y-2">
          <div className="h-2 w-24 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="h-3 w-40 animate-pulse rounded bg-[var(--color-border)]" />
        </div>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-border)]" />
        <div className="h-24 w-full animate-pulse rounded bg-[var(--color-border)]" />
      </div>
    </div>
  )
}
