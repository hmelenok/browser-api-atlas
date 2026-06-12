import {Search, X} from 'lucide-react'
import {useStore} from '@/store'
import {CATEGORIES, CATEGORY_ORDER} from '@/data/categories'
import {cn} from '@/lib/cn'

export function SearchBar() {
  const search = useStore((s) => s.search)
  const setSearch = useStore((s) => s.setSearch)
  const onlySupported = useStore((s) => s.onlySupported)
  const setOnlySupported = useStore((s) => s.setOnlySupported)
  const onlyWithDemos = useStore((s) => s.onlyWithDemos)
  const setOnlyWithDemos = useStore((s) => s.setOnlyWithDemos)
  const visible = useStore((s) => s.visibleCategories)
  const toggle = useStore((s) => s.toggleCategory)
  const setAll = useStore((s) => s.setAllCategories)

  // Bulk toggle: if every category is on, the next click clears them all.
  // Otherwise (any subset is off) the next click turns them all on.
  const allOn = CATEGORY_ORDER.every((id) => visible.has(id))

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search APIs…"
          className={cn(
            'h-8 w-56 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]',
            'pl-8 pr-7 text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </label>

      <Toggle pressed={onlySupported} onPressedChange={setOnlySupported}>
        Supported here
      </Toggle>
      <Toggle pressed={onlyWithDemos} onPressedChange={setOnlyWithDemos}>
        Has demo
      </Toggle>

      <div className="mx-2 hidden h-5 w-px bg-[var(--color-border)] md:block" />

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setAll(!allOn)}
          className={cn(
            'inline-flex h-[22px] items-center rounded-full border px-2 text-[11px] font-medium transition',
            'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]'
          )}
          title={allOn ? 'Hide every category' : 'Show every category'}
          aria-label={allOn ? 'Hide all categories' : 'Show all categories'}
        >
          {allOn ? 'none' : 'all'}
        </button>
        <span className="mx-0.5 h-3 w-px bg-[var(--color-border)]" aria-hidden />
        {CATEGORY_ORDER.map((id) => {
          const cat = CATEGORIES[id]
          const active = visible.has(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition',
                active
                  ? 'border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-fg)]'
                  : 'border-[var(--color-border)] text-[var(--color-muted)] opacity-60'
              )}
              aria-pressed={active}
            >
              <span
                className="inline-block size-2 rounded-full"
                style={{background: cat.color}}
              />
              {cat.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Toggle({
  pressed,
  onPressedChange,
  children,
}: {
  pressed: boolean
  onPressedChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => onPressedChange(!pressed)}
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-8 items-center rounded-md border px-2.5 text-xs transition',
        pressed
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]'
      )}
    >
      {children}
    </button>
  )
}
