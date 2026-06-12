import {useMemo} from 'react'
import {create} from 'zustand'

import type {BrowserInfo} from '@/lib/browser'
import {detectBrowser} from '@/lib/browser'
import {detectAll} from '@/lib/detection'
import {findUnknownGlobals, type UnknownGlobal} from '@/lib/introspect'
import type {ApiEntry, CategoryId, RuntimeStatus} from '@/lib/types'

export type SortMode = 'category' | 'baseline' | 'alphabetic'

import catalogJson from '@/data/catalog.json'

const catalog = catalogJson as {
  entries: ApiEntry[]
  relationships: {from: string; to: string; label?: string}[]
  bcdVersion: string
  webFeaturesVersion: string
  generatedAt: string
}

interface State {
  // catalog
  entries: ApiEntry[]
  relationships: {from: string; to: string; label?: string}[]
  bcdVersion: string
  webFeaturesVersion: string

  // runtime state
  selectedId: string | null
  runtime: Record<string, RuntimeStatus>
  unknown: UnknownGlobal[]
  browser: BrowserInfo | null

  // filters
  search: string
  visibleCategories: Set<CategoryId>
  onlySupported: boolean
  onlyWithDemos: boolean
  sortMode: SortMode

  // actions
  initialize: () => Promise<void>
  select: (id: string | null) => void
  setSearch: (s: string) => void
  toggleCategory: (id: CategoryId) => void
  setAllCategories: (visible: boolean) => void
  setOnlySupported: (v: boolean) => void
  setOnlyWithDemos: (v: boolean) => void
  setSortMode: (m: SortMode) => void
  resetFilters: () => void
}

const allCategories = new Set<CategoryId>(catalog.entries.map((e) => e.category))

export const useStore = create<State>((set, get) => ({
  entries: catalog.entries,
  relationships: catalog.relationships,
  bcdVersion: catalog.bcdVersion,
  webFeaturesVersion: catalog.webFeaturesVersion,
  selectedId: null,
  runtime: {},
  unknown: [],
  browser: null,
  search: '',
  visibleCategories: allCategories,
  onlySupported: false,
  onlyWithDemos: false,
  sortMode: 'category',

  initialize: async () => {
    const runtime = detectAll(catalog.entries)
    const runtimeKeys = new Set(catalog.entries.map((e) => e.runtimeKey))
    const unknown = findUnknownGlobals(runtimeKeys)
    const browser = await detectBrowser()
    set({runtime, unknown, browser})
  },

  select: (id) => set({selectedId: id}),
  setSearch: (s) => set({search: s}),
  toggleCategory: (id) => {
    const next = new Set(get().visibleCategories)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({visibleCategories: next})
  },
  setAllCategories: (visible) => {
    set({visibleCategories: visible ? new Set(allCategories) : new Set()})
  },
  setOnlySupported: (v) => set({onlySupported: v}),
  setOnlyWithDemos: (v) => set({onlyWithDemos: v}),
  setSortMode: (m) => set({sortMode: m}),
  resetFilters: () =>
    set({
      search: '',
      visibleCategories: new Set(allCategories),
      onlySupported: false,
      onlyWithDemos: false,
      sortMode: 'category',
    }),
}))

/**
 * Derive filtered entry list.
 *
 * IMPORTANT: read primitive store fields, then derive with `useMemo`. Returning
 * a fresh `.filter()` result directly from a Zustand selector triggers an
 * infinite re-render loop (React's getSnapshot cache check fails on every
 * call because the array reference is new).
 */
export function useFilteredEntries() {
  const entries = useStore((s) => s.entries)
  const runtime = useStore((s) => s.runtime)
  const search = useStore((s) => s.search)
  const visibleCategories = useStore((s) => s.visibleCategories)
  const onlySupported = useStore((s) => s.onlySupported)
  const onlyWithDemos = useStore((s) => s.onlyWithDemos)

  return useMemo(() => {
    const term = search.trim().toLowerCase()
    return entries.filter((e) => {
      if (!visibleCategories.has(e.category)) return false
      if (onlySupported && !runtime[e.id]?.supported) return false
      if (onlyWithDemos && !e.hasDemo) return false
      if (term) {
        const hay = `${e.title} ${e.id} ${e.description}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })
  }, [entries, runtime, search, visibleCategories, onlySupported, onlyWithDemos])
}
