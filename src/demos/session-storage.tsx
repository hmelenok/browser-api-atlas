import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoKeyValue, DemoRow} from './_ui'

const NS = 'atlas-demo-ss:'

function readAll() {
  const out: Array<readonly [string, string]> = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i)
    if (k?.startsWith(NS)) out.push([k.slice(NS.length), sessionStorage.getItem(k) ?? ''] as const)
  }
  return out
}

function SessionStorageDemo() {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [items, setItems] = useState<Array<readonly [string, string]>>([])

  useEffect(() => setItems(readAll()), [])

  const save = () => {
    if (!key) return
    sessionStorage.setItem(NS + key, value)
    setItems(readAll())
    setKey('')
    setValue('')
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoInput placeholder="key" value={key} onChange={(e) => setKey(e.target.value)} className="!flex-[0_0_5rem]" />
        <DemoInput
          placeholder="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <DemoButton onClick={save} disabled={!key}>set</DemoButton>
      </DemoRow>
      <DemoKeyValue pairs={items} />
      <p className="text-[10px] text-[var(--color-muted)]">
        Close this tab and re-open the atlas — these entries will be gone (unlike localStorage).
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Window.sessionStorage',
  title: 'sessionStorage',
  Demo: SessionStorageDemo,
  snippet: `// Same shape as localStorage, but scoped to the current browsing context.
// Closes the tab → data is gone. Opens a new tab to the same origin → fresh store.

sessionStorage.setItem('draft', 'unsaved changes')
sessionStorage.getItem('draft')        // "unsaved changes"
sessionStorage.length                  // number of keys
sessionStorage.clear()                 // wipe`,
}
