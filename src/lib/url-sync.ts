import {useEffect, useRef} from 'react'

import {useStore} from '@/store'

const PARAM = 'api'

function readSelectedFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(PARAM)
}

function writeSelectedToUrl(id: string | null) {
  const params = new URLSearchParams(window.location.search)
  if (id) params.set(PARAM, id)
  else params.delete(PARAM)
  const search = params.toString()
  const next =
    window.location.pathname + (search ? `?${search}` : '') + window.location.hash
  if (next !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(null, '', next)
  }
}

/**
 * Bind store.selectedId to the ?api= query param.
 *
 * - On mount: hydrate the store from the URL (so deep links work)
 * - On store change: replace the URL silently
 * - On popstate (back/forward): re-read the URL
 */
export function useUrlSync() {
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)
  const entriesReady = useStore((s) => s.entries.length > 0)
  const hydratedRef = useRef(false)

  // Hydrate from URL once the catalog is in the store
  useEffect(() => {
    if (hydratedRef.current || !entriesReady) return
    hydratedRef.current = true
    const fromUrl = readSelectedFromUrl()
    if (fromUrl) select(fromUrl)
  }, [entriesReady, select])

  // Push changes to URL
  useEffect(() => {
    if (!hydratedRef.current) return
    writeSelectedToUrl(selectedId)
  }, [selectedId])

  // Pop history → re-read URL
  useEffect(() => {
    const handler = () => select(readSelectedFromUrl())
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [select])
}
