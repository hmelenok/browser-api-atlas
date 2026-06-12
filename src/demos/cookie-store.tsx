import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoKeyValue, DemoRow} from './_ui'

interface CookieListItem {
  name: string
  value: string
  expires?: number | null
}

interface CookieStoreLike {
  getAll(): Promise<CookieListItem[]>
  set(opts: {name: string; value: string; expires?: number}): Promise<void>
  delete(name: string): Promise<void>
}

function getStore(): CookieStoreLike | null {
  const ws = window as unknown as {cookieStore?: CookieStoreLike}
  return ws.cookieStore ?? null
}

function CookieStoreDemo() {
  const store = getStore()
  const [name, setName] = useState('atlas_demo')
  const [value, setValue] = useState('hello')
  const [items, setItems] = useState<Array<readonly [string, string]>>([])
  const [log, setLog] = useState('')

  const refresh = async () => {
    if (!store) {
      setItems(document.cookie.split(';').map((s) => s.trim()).filter(Boolean).map((c) => {
        const i = c.indexOf('=')
        return [c.slice(0, i), c.slice(i + 1)] as const
      }))
      return
    }
    const all = await store.getAll()
    setItems(all.map((c) => [c.name, c.value] as const))
  }

  useEffect(() => {
    refresh().catch(console.error)
  }, [])

  const setCookie = async () => {
    if (!store) return
    try {
      await store.set({name, value, expires: Date.now() + 60_000})
      setLog(`set ${name}="${value}" · expires in 60s`)
      refresh()
    } catch (e) {
      setLog((e as Error).message)
    }
  }

  const deleteCookie = async (n: string) => {
    if (!store) return
    await store.delete(n)
    refresh()
  }

  return (
    <DemoFrame>
      {!store && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">
          cookieStore not available — falling back to `document.cookie` read-only view below.
        </p>
      )}
      {store && (
        <DemoRow>
          <DemoInput placeholder="name" value={name} onChange={(e) => setName(e.target.value)} className="!flex-[0_0_8rem]" />
          <DemoInput placeholder="value" value={value} onChange={(e) => setValue(e.target.value)} />
          <DemoButton onClick={setCookie}>set (60s)</DemoButton>
        </DemoRow>
      )}
      <DemoKeyValue pairs={items} />
      {store && items.length > 0 && (
        <DemoRow>
          {items.slice(0, 5).map(([n]) => (
            <DemoButton key={n} variant="ghost" onClick={() => deleteCookie(n)}>
              ✕ {n}
            </DemoButton>
          ))}
        </DemoRow>
      )}
      {log && <p className="font-mono text-[10px] text-[var(--color-muted)]">{log}</p>}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.CookieStore',
  title: 'Cookie Store',
  Demo: CookieStoreDemo,
  snippet: `// Async, promise-based — finally
const all = await cookieStore.getAll()
await cookieStore.set({name: 'theme', value: 'dark', expires: Date.now() + 86400000})
await cookieStore.delete('theme')

// React to cookie changes in this document
cookieStore.addEventListener('change', (e) => {
  console.log('changed', e.changed, 'deleted', e.deleted)
})

// Compare with the legacy synchronous API
document.cookie       // "theme=dark; lang=en"`,
  notes: 'cookieStore is async, observable, and doesn\'t require string parsing. Limited Baseline — Safari support is still pending.',
}
