/**
 * Thin event-tracking abstraction.
 *
 * Pick a provider by uncommenting its script in `index.html`. The defaults
 * here will auto-detect GoatCounter, Plausible, or umami at runtime — drop
 * in whichever one you set up. Honors Do-Not-Track and never tracks during
 * `npm run dev`.
 */

interface GoatCounterApi {
  count: (opts: {path?: string; title?: string; event?: boolean; referrer?: string}) => void
}

interface PlausibleApi {
  (event: string, options?: {props?: Record<string, string | number>}): void
}

interface UmamiApi {
  track: (event?: string, props?: Record<string, string | number>) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounterApi
    plausible?: PlausibleApi
    umami?: UmamiApi
  }
}

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'

function dntEnabled(): boolean {
  if (typeof navigator === 'undefined') return false
  const dnt = navigator.doNotTrack
  return dnt === '1' || dnt === 'yes'
}

const enabled = !isDev && !dntEnabled()

/**
 * Track a custom event. Silently no-ops if no provider is loaded.
 *
 * Convention: kebab-case event names with a colon to separate domain.
 *   track('api:select', {id: 'api.Notification'})
 *   track('sort:change', {mode: 'baseline'})
 *   track('filter:toggle', {filter: 'supported', value: 'on'})
 */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (!enabled || typeof window === 'undefined') return

  // Stringify props for providers that only take strings
  const stringProps: Record<string, string> = {}
  if (props) {
    for (const [k, v] of Object.entries(props)) stringProps[k] = String(v)
  }

  // GoatCounter — events are paths prefixed with an "event" flag
  if (window.goatcounter?.count) {
    const propPath = Object.entries(stringProps)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    window.goatcounter.count({
      path: propPath ? `${event}?${propPath}` : event,
      title: event,
      event: true,
    })
    return
  }

  // Plausible — first-class custom events with props
  if (typeof window.plausible === 'function') {
    window.plausible(event, props ? {props: stringProps} : undefined)
    return
  }

  // Umami — track(event, props)
  if (window.umami?.track) {
    window.umami.track(event, stringProps)
    return
  }
}

/** Track a virtual pageview, e.g. when the selected API changes. */
export function trackPageView(path: string, title?: string) {
  if (!enabled || typeof window === 'undefined') return

  if (window.goatcounter?.count) {
    window.goatcounter.count({path, title})
    return
  }
  if (typeof window.plausible === 'function') {
    // Plausible auto-tracks pageviews from history changes — this is a manual nudge
    window.plausible('pageview', {props: {path, ...(title ? {title} : {})}})
    return
  }
  if (window.umami?.track) {
    window.umami.track(path)
    return
  }
}
