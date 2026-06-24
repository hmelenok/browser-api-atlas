import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface LogEntry {
  t: string
  type: MutationRecord['type']
  detail: string
}

function MutationObserverDemo() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [observing, setObserving] = useState(false)
  const observerRef = useRef<MutationObserver | null>(null)

  useEffect(() => () => observerRef.current?.disconnect(), [])

  const start = () => {
    if (!editorRef.current) return
    const o = new MutationObserver((records) => {
      const t = new Date().toLocaleTimeString([], {hour12: false})
      setLog((prev) => {
        const next = [
          ...records.map((r) => {
            let detail = ''
            switch (r.type) {
              case 'childList':
                detail = `+${r.addedNodes.length} −${r.removedNodes.length}`
                break
              case 'characterData':
                detail = `"${(r.target.nodeValue ?? '').slice(0, 24)}"`
                break
              case 'attributes':
                detail = `${r.attributeName}=${(r.target as Element).getAttribute(r.attributeName ?? '') ?? '∅'}`
                break
            }
            return {t, type: r.type, detail}
          }),
          ...prev,
        ].slice(0, 12)
        return next
      })
    })
    o.observe(editorRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeOldValue: true,
    })
    observerRef.current = o
    setObserving(true)
  }

  const stop = () => {
    observerRef.current?.disconnect()
    observerRef.current = null
    setObserving(false)
  }

  const mutate = (kind: 'add' | 'remove' | 'attr') => {
    const root = editorRef.current
    if (!root) return
    if (kind === 'add') {
      const span = document.createElement('span')
      span.textContent = ` ✨${Math.floor(Math.random() * 99)}`
      span.style.color = `oklch(60% 0.18 ${Math.floor(Math.random() * 360)})`
      root.appendChild(span)
    } else if (kind === 'remove') {
      root.lastElementChild?.remove()
    } else {
      root.setAttribute('data-tick', String(Date.now()))
    }
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={observing ? stop : start} variant={observing ? 'danger' : 'primary'}>
          {observing ? 'disconnect' : 'observe'}
        </DemoButton>
        <DemoButton variant="ghost" onClick={() => mutate('add')}>
          add child
        </DemoButton>
        <DemoButton variant="ghost" onClick={() => mutate('remove')}>
          remove last
        </DemoButton>
        <DemoButton variant="ghost" onClick={() => mutate('attr')}>
          set attribute
        </DemoButton>
      </DemoRow>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-16 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
      >
        Type here. Each keystroke fires <strong>characterData</strong>. Add/remove buttons trigger
        <strong> childList</strong>. Set attribute fires <strong>attributes</strong>.
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          mutation log ({observing ? 'live' : 'paused'})
        </p>
        {log.length === 0 ? (
          <p className="text-[11px] italic text-[var(--color-muted)]">(no mutations yet)</p>
        ) : (
          <ul className="max-h-32 space-y-0.5 overflow-auto font-mono text-[11px]">
            {log.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-muted)]">{e.t}</span>
                <span className="w-24 text-[var(--color-accent)]">{e.type}</span>
                <span className="truncate text-[var(--color-fg)]">{e.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.MutationObserver',
  title: 'MutationObserver',
  Demo: MutationObserverDemo,
  snippet: `// Watch a subtree for DOM changes
const observer = new MutationObserver((records) => {
  for (const r of records) {
    switch (r.type) {
      case 'childList':
        // r.addedNodes, r.removedNodes
        break
      case 'characterData':
        // text node content changed; r.oldValue if oldValue was set
        break
      case 'attributes':
        // r.attributeName, r.oldValue
        break
    }
  }
})

observer.observe(target, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeOldValue: true,
  attributeFilter: ['data-state'],   // only these attributes
})

// Process any pending records right now
observer.takeRecords()
observer.disconnect()`,
  notes: 'Fires asynchronously, batched at the end of a microtask. Used by frameworks to detect external DOM tampering, by syntax highlighters to re-highlight, by SPA routers to track navigation.',
}
