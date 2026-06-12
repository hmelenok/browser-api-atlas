import {useEffect} from 'react'

import {useStore} from '@/store'

const DEFAULT_TITLE = 'Browser API Atlas — interactive web platform explorer'
const DEFAULT_DESC =
  'An interactive graph of every web platform API. See which APIs your browser supports, try live demos, and explore the modern web platform.'
const SITE_URL = 'https://hmelenok.github.io/browser-api-atlas/'

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector)
  if (!el) {
    if (selector.startsWith('meta')) {
      el = document.createElement('meta')
      const name = selector.match(/(?:name|property)="([^"]+)"/)?.[1]
      const key = selector.includes('property=') ? 'property' : 'name'
      if (name) el.setAttribute(key, name)
    } else if (selector.startsWith('link')) {
      el = document.createElement('link')
      const rel = selector.match(/rel="([^"]+)"/)?.[1]
      if (rel) el.setAttribute('rel', rel)
    }
    if (el) document.head.appendChild(el)
  }
  if (el) el.setAttribute(attr, value)
}

/**
 * Keeps document title, meta description, OpenGraph and canonical URL in sync
 * with the current selection. Real SEO for an SPA on GH Pages is limited
 * (no SSR), but crawlers that execute JS and the in-app share preview both
 * use these tags, so the lift is real for low effort.
 */
export function useDocumentMeta() {
  const selectedId = useStore((s) => s.selectedId)
  const entries = useStore((s) => s.entries)
  const selected = selectedId ? entries.find((e) => e.id === selectedId) : null

  useEffect(() => {
    if (selected) {
      const title = `${selected.title} — Browser API Atlas`
      const desc =
        selected.description ||
        `${selected.title} — interactive reference and live demo for the ${selected.category} browser API.`
      const url = `${SITE_URL}?api=${encodeURIComponent(selected.id)}`

      document.title = title
      setMeta('meta[name="description"]', 'content', desc)
      setMeta('meta[property="og:title"]', 'content', title)
      setMeta('meta[property="og:description"]', 'content', desc)
      setMeta('meta[property="og:url"]', 'content', url)
      setMeta('meta[property="og:type"]', 'content', 'article')
      setMeta('meta[name="twitter:card"]', 'content', 'summary')
      setMeta('meta[name="twitter:title"]', 'content', title)
      setMeta('meta[name="twitter:description"]', 'content', desc)
      setMeta('link[rel="canonical"]', 'href', url)
    } else {
      document.title = DEFAULT_TITLE
      setMeta('meta[name="description"]', 'content', DEFAULT_DESC)
      setMeta('meta[property="og:title"]', 'content', DEFAULT_TITLE)
      setMeta('meta[property="og:description"]', 'content', DEFAULT_DESC)
      setMeta('meta[property="og:url"]', 'content', SITE_URL)
      setMeta('meta[property="og:type"]', 'content', 'website')
      setMeta('link[rel="canonical"]', 'href', SITE_URL)
    }
  }, [selected])
}
