import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame, DemoInput, DemoRow} from './_ui'

const TEXT =
  'The Browser API Atlas is a graph of every browser API. The atlas catalogs platform APIs from BCD ' +
  '(browser-compat-data) and shows Baseline status. The graph view groups APIs by category. ' +
  'Highlight any word in the search box and watch the matches glow.'

interface HighlightCtor {
  new (...ranges: Range[]): {add(range: Range): void; clear(): void; size: number}
}

interface HighlightsRegistry {
  set(name: string, h: InstanceType<HighlightCtor>): void
  delete(name: string): boolean
  clear(): void
}

function getRegistry(): HighlightsRegistry | null {
  const c = (window as unknown as {CSS?: {highlights?: HighlightsRegistry}}).CSS
  return c?.highlights ?? null
}

function getHighlight(): HighlightCtor | null {
  const w = window as unknown as {Highlight?: HighlightCtor}
  return w.Highlight ?? null
}

function HighlightRegistryDemo() {
  const [query, setQuery] = useState('atlas')
  const [matchCount, setMatchCount] = useState(0)
  const textRef = useRef<HTMLParagraphElement>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  const registry = getRegistry()
  const Highlight = getHighlight()
  const supported = !!(registry && Highlight)

  // Inject the ::highlight() rule once
  useEffect(() => {
    if (!supported || styleRef.current) return
    const s = document.createElement('style')
    s.textContent = `::highlight(atlas-match) {
      background: oklch(70% 0.18 95);
      color: oklch(15% 0 0);
      border-radius: 3px;
      padding: 0 1px;
    }`
    document.head.appendChild(s)
    styleRef.current = s
    return () => {
      s.remove()
      styleRef.current = null
    }
  }, [supported])

  // Update highlights whenever the query changes
  useEffect(() => {
    if (!supported || !textRef.current || !registry || !Highlight) {
      setMatchCount(0)
      return
    }

    registry.delete('atlas-match')
    if (!query.trim()) {
      setMatchCount(0)
      return
    }

    const ranges: Range[] = []
    const walker = document.createTreeWalker(textRef.current, NodeFilter.SHOW_TEXT)
    let node: Node | null = walker.nextNode()
    const q = query.toLowerCase()

    while (node) {
      const t = node.textContent ?? ''
      const lower = t.toLowerCase()
      let i = 0
      while (i < lower.length) {
        const found = lower.indexOf(q, i)
        if (found === -1) break
        const range = document.createRange()
        range.setStart(node, found)
        range.setEnd(node, found + q.length)
        ranges.push(range)
        i = found + q.length
      }
      node = walker.nextNode()
    }

    if (ranges.length > 0) {
      const h = new Highlight(...ranges)
      registry.set('atlas-match', h)
    }
    setMatchCount(ranges.length)
  }, [query, supported, registry, Highlight])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          CSS Custom Highlight API not available. Chrome 105+ / Safari 17.2+.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="type to highlight…"
        />
        <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--color-accent)]">
          {matchCount}
        </span>
      </DemoRow>
      <p
        ref={textRef}
        className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs leading-relaxed"
      >
        {TEXT}
      </p>
      <p className="text-[10px] text-[var(--color-muted)]">
        Range-backed highlights — no DOM mutation. Selection, copy, and inline events all keep working.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.HighlightRegistry',
  title: 'CSS Custom Highlight',
  Demo: HighlightRegistryDemo,
  snippet: `// 1. Define the style via the new ::highlight() pseudo
::highlight(search-match) {
  background: yellow;
  color: black;
}

// 2. Build Ranges for the text you want to mark
const ranges = []
const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
for (let n = walker.nextNode(); n; n = walker.nextNode()) {
  const idx = n.textContent.toLowerCase().indexOf(query)
  if (idx >= 0) {
    const r = document.createRange()
    r.setStart(n, idx)
    r.setEnd(n, idx + query.length)
    ranges.push(r)
  }
}

// 3. Register a Highlight made from those ranges
CSS.highlights.set('search-match', new Highlight(...ranges))`,
  notes: 'Chrome 105+ / Safari 17.2+. Used by Chrome Find-in-Page itself. Big win: no DOM splitting, so selection / accessibility / events all stay intact.',
}
