import {useEffect, useRef} from 'react'

import {CATEGORY_ORDER} from '@/data/categories'
import {useStore, type SortMode} from '@/store'
import type {CategoryId} from '@/lib/types'

const VALID_CATS = new Set<CategoryId>(CATEGORY_ORDER)
const VALID_SORTS: ReadonlySet<SortMode> = new Set(['category', 'baseline', 'alphabetic', 'hierarchy'])

export interface UrlState {
  selectedId: string | null
  search: string
  visibleCategories: Set<CategoryId>
  onlySupported: boolean
  onlyWithDemos: boolean
  sortMode: SortMode
}

/**
 * Read the full UI state from the URL. Falls back to defaults for any
 * missing param. Called at store initialization (for synchronous hydration
 * before first render) and on popstate.
 */
export function readStateFromUrl(): UrlState {
  if (typeof window === 'undefined') {
    return {
      selectedId: null,
      search: '',
      visibleCategories: new Set(CATEGORY_ORDER),
      onlySupported: false,
      onlyWithDemos: false,
      sortMode: 'category',
    }
  }
  const p = new URLSearchParams(window.location.search)

  let cats: Set<CategoryId>
  const catParam = p.get('cat')
  if (catParam !== null) {
    cats = new Set(
      catParam
        .split(',')
        .map((s) => s.trim())
        .filter((s): s is CategoryId => VALID_CATS.has(s as CategoryId))
    )
  } else {
    cats = new Set(CATEGORY_ORDER)
  }

  const rawSort = p.get('sort')
  const sortMode: SortMode =
    rawSort && VALID_SORTS.has(rawSort as SortMode) ? (rawSort as SortMode) : 'category'

  return {
    selectedId: p.get('api') || null,
    search: p.get('q') || '',
    visibleCategories: cats,
    onlySupported: p.get('supported') === '1',
    onlyWithDemos: p.get('demos') === '1',
    sortMode,
  }
}

/** Build a query string from the current UI state, omitting defaults. */
function buildQuery(state: UrlState): string {
  const params = new URLSearchParams()
  if (state.selectedId) params.set('api', state.selectedId)
  if (state.search.trim()) params.set('q', state.search.trim())
  if (state.visibleCategories.size !== CATEGORY_ORDER.length) {
    params.set('cat', CATEGORY_ORDER.filter((c) => state.visibleCategories.has(c)).join(','))
  }
  if (state.onlySupported) params.set('supported', '1')
  if (state.onlyWithDemos) params.set('demos', '1')
  if (state.sortMode !== 'category') params.set('sort', state.sortMode)
  return params.toString()
}

function writeStateToUrl(state: UrlState) {
  const search = buildQuery(state)
  const next = window.location.pathname + (search ? `?${search}` : '') + window.location.hash
  const current = window.location.pathname + window.location.search + window.location.hash
  if (next !== current) {
    window.history.replaceState(null, '', next)
  }
}

/**
 * Bind the store's filter/sort/search/selection state to the URL.
 *
 * - On mount: nothing (the store was already initialized from the URL).
 * - On store change: replace the URL silently (no history pollution).
 * - On popstate (back/forward): re-read the URL and push changes into the store.
 */
export function useUrlSync() {
  const selectedId = useStore((s) => s.selectedId)
  const search = useStore((s) => s.search)
  const visibleCategories = useStore((s) => s.visibleCategories)
  const onlySupported = useStore((s) => s.onlySupported)
  const onlyWithDemos = useStore((s) => s.onlyWithDemos)
  const sortMode = useStore((s) => s.sortMode)

  // Skip writing on the very first effect so we don't race the initial hydration.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    writeStateToUrl({
      selectedId,
      search,
      visibleCategories,
      onlySupported,
      onlyWithDemos,
      sortMode,
    })
  }, [selectedId, search, visibleCategories, onlySupported, onlyWithDemos, sortMode])

  // Back/forward: re-read the URL and push into the store.
  const select = useStore((s) => s.select)
  const setSearch = useStore((s) => s.setSearch)
  const setOnlySupported = useStore((s) => s.setOnlySupported)
  const setOnlyWithDemos = useStore((s) => s.setOnlyWithDemos)
  const setSortMode = useStore((s) => s.setSortMode)
  const setAllCategories = useStore((s) => s.setAllCategories)
  const toggleCategory = useStore((s) => s.toggleCategory)
  useEffect(() => {
    const handler = () => {
      const next = readStateFromUrl()
      select(next.selectedId)
      setSearch(next.search)
      setOnlySupported(next.onlySupported)
      setOnlyWithDemos(next.onlyWithDemos)
      setSortMode(next.sortMode)

      // Reconcile category visibility set
      const current = useStore.getState().visibleCategories
      const wantsAll = next.visibleCategories.size === CATEGORY_ORDER.length
      if (wantsAll) {
        setAllCategories(true)
      } else {
        // Make current match next: toggle entries whose presence differs
        for (const c of CATEGORY_ORDER) {
          if (current.has(c) !== next.visibleCategories.has(c)) toggleCategory(c)
        }
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [select, setSearch, setOnlySupported, setOnlyWithDemos, setSortMode, setAllCategories, toggleCategory])
}
