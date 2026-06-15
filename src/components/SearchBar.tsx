import {ArrowDownAZ, ChevronDown, Layers, Search, SlidersHorizontal, Sparkle, Workflow, X} from 'lucide-react'
import {useState, type ComponentType, type SVGProps} from 'react'

import {CATEGORIES, CATEGORY_ORDER} from '@/data/categories'
import {cn} from '@/lib/cn'
import {useStore, type SortMode} from '@/store'

const SORT_OPTIONS: Array<{
  id: SortMode
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement> & {size?: number}>
  hint: string
}> = [
  {
    id: 'category',
    label: 'category',
    icon: Layers,
    hint: 'Group nodes by their cluster (Storage, Network, …). The default — best for exploring related APIs.',
  },
  {
    id: 'baseline',
    label: 'baseline',
    icon: Sparkle,
    hint: 'Group by Baseline status (Widely / Newly / Limited) and sort by year within each group. Tells the story of "when did the web platform get X?"',
  },
  {
    id: 'alphabetic',
    label: 'A–Z',
    icon: ArrowDownAZ,
    hint: 'Group by leading letter for quick lookup by API name.',
  },
  {
    id: 'hierarchy',
    label: 'graph',
    icon: Workflow,
    hint: 'Group by connected component and let edges drive the layout. Each API family (Web Audio nodes around AudioContext, credentials around CredentialsContainer, …) becomes its own left-to-right flow. Isolated APIs pack at the side.',
  },
]

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
  const sortMode = useStore((s) => s.sortMode)
  const setSortMode = useStore((s) => s.setSortMode)

  const allOn = CATEGORY_ORDER.every((id) => visible.has(id))

  // Count "active" filters to badge the mobile toggle button.
  const activeCount =
    (onlySupported ? 1 : 0) + (onlyWithDemos ? 1 : 0) + (allOn ? 0 : 1) + (sortMode !== 'category' ? 1 : 0)

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="space-y-2">
      {/* Row 1 — always visible: search input + mobile filter button */}
      <div className="flex items-center gap-2">
        <label className="relative flex-1 md:flex-none">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search APIs…"
            className={cn(
              'h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] md:w-60',
              'pl-9 pr-8 text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'
            )}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </label>

        {/* Mobile-only "Filters" disclosure button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="search-filters"
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm md:hidden',
            mobileOpen
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)]'
          )}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-medium text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown size={14} className={cn('transition', mobileOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Row 2 — filters / sort / categories. Hidden on mobile unless toggled open. */}
      <div
        id="search-filters"
        className={cn(
          'flex flex-wrap items-center gap-2',
          // Mobile: only visible when expanded; desktop: always inline
          mobileOpen ? 'flex' : 'hidden',
          'md:flex'
        )}
      >
        <Toggle
          pressed={onlySupported}
          onPressedChange={setOnlySupported}
          title="Show only APIs that exist in your current browser. APIs missing from your browser will be hidden from the graph."
        >
          Supported here
        </Toggle>
        <Toggle
          pressed={onlyWithDemos}
          onPressedChange={setOnlyWithDemos}
          title="Show only APIs that have an interactive demo registered in src/demos/. Drop in a new file there to add more."
        >
          Has demo
        </Toggle>

        <div className="mx-1 hidden h-5 w-px bg-[var(--color-border)] md:block" />

        {/* Sort mode segmented control */}
        <div
          role="group"
          aria-label="Sort"
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] overflow-hidden"
        >
          <span className="px-2.5 text-[11px] uppercase tracking-wide text-[var(--color-muted)]">Sort</span>
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = sortMode === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortMode(opt.id)}
                aria-pressed={active}
                title={opt.hint}
                className={cn(
                  'inline-flex h-full items-center gap-1.5 border-l border-[var(--color-border)] px-2.5 text-sm transition',
                  active
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                )}
              >
                <Icon size={14} strokeWidth={2} />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mx-1 hidden h-5 w-px bg-[var(--color-border)] md:block" />

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setAll(!allOn)}
            className={cn(
              'inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium transition',
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
            const Icon = cat.icon
            const active = visible.has(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition',
                  active
                    ? 'border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-fg)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] opacity-60'
                )}
                aria-pressed={active}
              >
                <Icon size={12} strokeWidth={2} className="shrink-0" style={{color: cat.color}} />
                {cat.title}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Toggle({
  pressed,
  onPressedChange,
  children,
  title,
}: {
  pressed: boolean
  onPressedChange: (v: boolean) => void
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onPressedChange(!pressed)}
      aria-pressed={pressed}
      title={title}
      className={cn(
        'inline-flex h-9 items-center rounded-md border px-3 text-sm transition',
        pressed
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]'
      )}
    >
      {children}
    </button>
  )
}
