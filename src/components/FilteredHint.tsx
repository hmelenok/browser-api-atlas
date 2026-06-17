import {ArrowRight, EyeOff, Info} from 'lucide-react'

import {findFiltered, REASON_LABEL} from '@/data/filtered-apis'
import {cn} from '@/lib/cn'
import {useStore} from '@/store'

/**
 * Surfaces when the user's search matches an API name that we
 * intentionally don't carry in the catalog. Tells them why, and
 * points at the closest catalog entry when there is one.
 */
export function FilteredHint() {
  const search = useStore((s) => s.search)
  const select = useStore((s) => s.select)
  const setSearch = useStore((s) => s.setSearch)

  const matches = findFiltered(search, 5)
  if (matches.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-md space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <Info size={13} className="text-[var(--color-accent)]" />
        <span>
          Looking for{' '}
          <span className="font-mono text-[var(--color-fg)]">{search.trim()}</span>?
        </span>
      </div>

      <p className="text-sm text-[var(--color-fg)]">
        The atlas intentionally doesn't catalog{' '}
        {matches.length === 1 ? 'this' : 'these'}, but they're real names —
        here's why and what to use instead.
      </p>

      <ul className="space-y-3">
        {matches.map((m) => (
          <li
            key={m.name}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
          >
            <div className="flex items-center gap-2">
              <EyeOff size={12} className="text-[var(--color-muted)]" />
              <code className="font-mono text-sm font-medium">{m.name}</code>
              <span
                className={cn(
                  'ml-auto rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
                  'bg-[var(--color-muted)]/10 text-[var(--color-muted)]'
                )}
                title="Why this is filtered"
              >
                {REASON_LABEL[m.reason]}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-muted)]">
              {m.why}
            </p>
            {m.alternative && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  select(m.alternative!)
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
              >
                See {m.alternativeTitle ?? m.alternative}
                <ArrowRight size={11} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
