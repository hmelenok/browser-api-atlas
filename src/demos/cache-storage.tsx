import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

const CACHE_NAME = 'atlas-demo-cache-v1'

interface CachedItem {
  url: string
  status: number
  contentType: string
}

async function readCache(): Promise<CachedItem[]> {
  const cache = await caches.open(CACHE_NAME)
  const requests = await cache.keys()
  const items: CachedItem[] = []
  for (const req of requests) {
    const res = await cache.match(req)
    if (!res) continue
    items.push({
      url: req.url,
      status: res.status,
      contentType: res.headers.get('content-type') ?? '',
    })
  }
  return items
}

function CacheStorageDemo() {
  const [url, setUrl] = useState('https://api.github.com/zen')
  const [items, setItems] = useState<CachedItem[]>([])
  const [log, setLog] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    readCache().then(setItems).catch((e) => setLog(String(e)))
  }, [])

  const cacheIt = async () => {
    setBusy(true)
    setLog('')
    try {
      const cache = await caches.open(CACHE_NAME)
      const res = await fetch(url)
      await cache.put(url, res.clone())
      const body = await res.text()
      setLog(`cached ${res.status} · ${body.slice(0, 80)}${body.length > 80 ? '…' : ''}`)
      setItems(await readCache())
    } catch (e) {
      setLog(`Error: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const matchIt = async () => {
    setBusy(true)
    try {
      const res = await caches.match(url)
      if (!res) {
        setLog('cache miss')
      } else {
        const body = await res.text()
        setLog(`hit ${res.status} · ${body.slice(0, 80)}${body.length > 80 ? '…' : ''}`)
      }
    } finally {
      setBusy(false)
    }
  }

  const drop = async () => {
    await caches.delete(CACHE_NAME)
    setItems([])
    setLog(`deleted "${CACHE_NAME}"`)
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      </DemoRow>
      <DemoRow>
        <DemoButton onClick={cacheIt} disabled={busy}>
          fetch + cache.put
        </DemoButton>
        <DemoButton variant="ghost" onClick={matchIt} disabled={busy}>
          caches.match
        </DemoButton>
        <DemoButton variant="danger" onClick={drop} disabled={busy || items.length === 0}>
          delete cache
        </DemoButton>
      </DemoRow>
      {log && (
        <pre className="overflow-x-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[10px] text-[var(--color-muted)]">
          {log}
        </pre>
      )}
      {items.length > 0 && (
        <ul className="space-y-0.5 text-[10px]">
          {items.map((i) => (
            <li key={i.url} className="font-mono">
              <span className="text-[var(--color-status-supported)]">{i.status}</span>{' '}
              <span className="text-[var(--color-muted)]">{i.contentType.split(';')[0]}</span>{' '}
              <span className="truncate">{new URL(i.url).pathname}</span>
            </li>
          ))}
        </ul>
      )}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.CacheStorage',
  title: 'Cache Storage',
  Demo: CacheStorageDemo,
  snippet: `// Open (or create) a named cache
const cache = await caches.open('app-v1')

// Cache a fetch response
const res = await fetch('/api/data')
await cache.put('/api/data', res.clone())

// Retrieve later — even when offline
const hit = await caches.match('/api/data')

// caches.delete drops the whole bucket
await caches.delete('app-v1')`,
  notes: 'Most commonly paired with a service worker for offline-first apps. Each named cache is independent.',
}
