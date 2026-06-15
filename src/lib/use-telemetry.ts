import {useEffect, useRef} from 'react'

import {useStore} from '@/store'
import {track} from './analytics'

/**
 * Fires analytics events on meaningful UI state changes. Skips the first
 * render so URL-hydrated state doesn't appear as a user event.
 */
export function useTelemetry() {
  const sortMode = useStore((s) => s.sortMode)
  const onlySupported = useStore((s) => s.onlySupported)
  const onlyWithDemos = useStore((s) => s.onlyWithDemos)
  const search = useStore((s) => s.search)

  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) return
    track('sort:change', {mode: sortMode})
  }, [sortMode])

  useEffect(() => {
    if (firstRender.current) return
    track('filter:toggle', {filter: 'supported', value: onlySupported ? 'on' : 'off'})
  }, [onlySupported])

  useEffect(() => {
    if (firstRender.current) return
    track('filter:toggle', {filter: 'demos', value: onlyWithDemos ? 'on' : 'off'})
  }, [onlyWithDemos])

  // Debounced search tracking — only fire when the user pauses typing
  useEffect(() => {
    if (firstRender.current) return
    if (!search.trim()) return
    const t = setTimeout(() => {
      track('search', {q: search.slice(0, 64)})
    }, 1500)
    return () => clearTimeout(t)
  }, [search])

  // Flip the first-render flag after the very first effect pass
  useEffect(() => {
    firstRender.current = false
  }, [])
}
