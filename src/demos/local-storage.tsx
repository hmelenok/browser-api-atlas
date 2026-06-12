import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoKeyValue, DemoRow} from './_ui'

const NS = 'atlas-demo-ls:'

function readAll() {
  const out: Array<readonly [string, string]> = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(NS)) {
      out.push([k.slice(NS.length), localStorage.getItem(k) ?? ''] as const)
    }
  }
  return out
}

function LocalStorageDemo() {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [items, setItems] = useState<Array<readonly [string, string]>>([])

  useEffect(() => {
    setItems(readAll())
    const onStorage = () => setItems(readAll())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const save = () => {
    if (!key) return
    localStorage.setItem(NS + key, value)
    setItems(readAll())
    setKey('')
    setValue('')
  }

  const clearAll = () => {
    items.forEach(([k]) => localStorage.removeItem(NS + k))
    setItems([])
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoInput
          placeholder="key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="!flex-[0_0_5rem]"
        />
        <DemoInput
          placeholder="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <DemoButton onClick={save} disabled={!key}>
          set
        </DemoButton>
      </DemoRow>
      <DemoKeyValue pairs={items} />
      {items.length > 0 && (
        <DemoRow>
          <DemoButton variant="ghost" onClick={() => setItems(readAll())}>
            re-read
          </DemoButton>
          <DemoButton variant="danger" onClick={clearAll}>
            clear all ({items.length})
          </DemoButton>
        </DemoRow>
      )}
      <p className="text-[10px] text-[var(--color-muted)]">
        Tip: open this page in another tab — `storage` events sync across tabs.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Window.localStorage',
  title: 'localStorage',
  Demo: LocalStorageDemo,
  snippet: `// Persistent key/value store, scoped to origin.
// Synchronous, ~5MB quota in most browsers.

localStorage.setItem('greeting', 'hello')
const v = localStorage.getItem('greeting')   // "hello"
localStorage.removeItem('greeting')

// Cross-tab sync via the storage event
window.addEventListener('storage', (e) => {
  console.log(e.key, '→', e.newValue, '(from another tab)')
})`,
  notes: 'Items below are namespaced with `atlas-demo-ls:` so they do not collide with anything else.',
}
