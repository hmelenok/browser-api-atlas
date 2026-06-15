import {Check, Copy, Search, Sparkles, X} from 'lucide-react'
import {useMemo, useState} from 'react'

import {cn} from '@/lib/cn'
import type {UnknownGlobal} from '@/lib/introspect'
import {useStore} from '@/store'

type Scope = 'all' | 'window' | 'navigator' | 'document'
type Kind = 'all' | 'constructor' | 'function' | 'object'

const SCOPES: Scope[] = ['all', 'window', 'navigator', 'document']
const KINDS: Kind[] = ['all', 'constructor', 'function', 'object']

export function UnknownApisPanel() {
  const open = useStore((s) => s.unknownPanelOpen)
  const setOpen = useStore((s) => s.setUnknownPanelOpen)
  const unknown = useStore((s) => s.unknown)
  const browser = useStore((s) => s.browser)

  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const [kind, setKind] = useState<Kind>('all')

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex h-full w-full max-w-md flex-col',
        'border-r border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl shadow-black/5',
        'transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
      aria-hidden={!open}
      aria-label="Detected APIs"
    >
      {open && (
        <Contents
          unknown={unknown}
          browser={browser}
          search={search}
          onSearch={setSearch}
          scope={scope}
          onScope={setScope}
          kind={kind}
          onKind={setKind}
          onClose={() => setOpen(false)}
        />
      )}
    </aside>
  )
}

function Contents({
  unknown,
  browser,
  search,
  onSearch,
  scope,
  onScope,
  kind,
  onKind,
  onClose,
}: {
  unknown: UnknownGlobal[]
  browser: {name: string; version?: string; os?: string} | null
  search: string
  onSearch: (s: string) => void
  scope: Scope
  onScope: (s: Scope) => void
  kind: Kind
  onKind: (k: Kind) => void
  onClose: () => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return unknown.filter((u) => {
      if (scope !== 'all' && u.scope !== scope) return false
      if (kind !== 'all' && u.kind !== kind) return false
      if (q && !u.path.toLowerCase().includes(q)) return false
      return true
    })
  }, [unknown, search, scope, kind])

  const groups = useMemo(() => {
    const m = new Map<string, UnknownGlobal[]>()
    for (const u of filtered) {
      const list = m.get(u.scope) ?? []
      list.push(u)
      m.set(u.scope, list)
    }
    return ['window', 'navigator', 'document']
      .map((s) => [s, m.get(s) ?? []] as const)
      .filter(([, list]) => list.length > 0)
  }, [filtered])

  const browserLine = browser
    ? `${browser.name}${browser.version ? ` ${browser.version}` : ''}${browser.os ? ` on ${browser.os}` : ''}`
    : 'this browser'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
            <Sparkles size={12} className="text-[var(--color-accent)]" />
            Self-discovery
          </div>
          <h2 className="mt-1 text-xl font-semibold leading-tight">Detected APIs</h2>
          <p className="mt-1.5 text-sm text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-fg)]">{unknown.length}</span> global{' '}
            {unknown.length === 1 ? 'API is' : 'APIs are'} present in {browserLine} but not in the
            atlas catalog yet.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-fg)]"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </header>

      {/* Controls */}
      <div className="space-y-2 border-b border-[var(--color-border)] px-5 py-3">
        <label className="relative block">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Filter by name…"
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </label>

        <ChipRow label="Scope" values={SCOPES} current={scope} onChange={onScope} />
        <ChipRow label="Kind" values={KINDS} current={kind} onChange={onKind} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-muted)]">
            Nothing matches the current filters.
          </p>
        ) : (
          groups.map(([scopeName, items]) => (
            <Group key={scopeName} title={scopeName} items={items} />
          ))
        )}
      </div>

      {/* Bottom actions */}
      <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] px-5 py-3">
        <BatchCopy items={filtered} browser={browser} />
        <a
          href={`https://github.com/hmelenok/browser-api-atlas/issues/new?title=${encodeURIComponent('Atlas catalog: more APIs to add')}&labels=catalog-refresh&body=${encodeURIComponent(
            `Open this issue with the markdown copied via the "Copy as markdown" button on the Detected APIs panel.`
          )}`}
          target="_blank"
          rel="noreferrer noopener"
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          title="Open a blank issue. Paste the markdown you copied into the body."
        >
          <GithubGlyph />
          New issue
        </a>
      </footer>
    </div>
  )
}

function ChipRow<T extends string>({
  label,
  values,
  current,
  onChange,
}: {
  label: string
  values: readonly T[]
  current: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{label}</span>
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={current === v}
          className={cn(
            'inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] transition',
            current === v
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]'
          )}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

function Group({title, items}: {title: string; items: UnknownGlobal[]}) {
  return (
    <section className="border-b border-[var(--color-border)] last:border-b-0">
      <h3 className="sticky top-0 bg-[var(--color-bg)] px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
        {title} <span className="ml-1 opacity-60">({items.length})</span>
      </h3>
      <ul>
        {items.map((u) => (
          <Row key={u.path} item={u} />
        ))}
      </ul>
    </section>
  )
}

function Row({item}: {item: UnknownGlobal}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.path)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <li className="group flex items-center gap-2 px-5 py-1.5 text-sm hover:bg-[var(--color-bg-soft)]">
      <code className="flex-1 font-mono text-[13px]">{item.path}</code>
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
          item.kind === 'constructor' && 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
          item.kind === 'function' && 'bg-[var(--color-status-newly)]/10 text-[var(--color-status-newly)]',
          item.kind === 'object' && 'bg-[var(--color-muted)]/10 text-[var(--color-muted)]'
        )}
        title={`Runtime kind: ${item.kind}`}
      >
        {item.kind === 'constructor' ? 'class' : item.kind}
      </span>
      <button
        type="button"
        onClick={copy}
        className="rounded p-1 text-[var(--color-muted)] opacity-0 transition hover:text-[var(--color-fg)] group-hover:opacity-100"
        title="Copy path"
        aria-label={`Copy ${item.path}`}
      >
        {copied ? <Check size={13} className="text-[var(--color-status-supported)]" /> : <Copy size={13} />}
      </button>
    </li>
  )
}

function GithubGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function BatchCopy({
  items,
  browser,
}: {
  items: UnknownGlobal[]
  browser: {name: string; version?: string; os?: string} | null
}) {
  const [copied, setCopied] = useState<'md' | 'list' | null>(null)

  const ctx = browser
    ? `${browser.name}${browser.version ? ` ${browser.version}` : ''}${browser.os ? ` (${browser.os})` : ''}`
    : 'this browser'

  const copyMarkdown = async () => {
    const lines = [
      `## Detected ${items.length} APIs in ${ctx} not in the atlas`,
      '',
      ...items.map((u) => `- \`${u.path}\` (${u.kind})`),
      '',
      `Generated by the Browser API Atlas self-discovery panel.`,
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied('md')
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* ignore */
    }
  }

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(items.map((u) => u.path).join('\n'))
      setCopied('list')
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copyMarkdown}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"
      >
        {copied === 'md' ? <Check size={12} /> : <Copy size={12} />}
        {copied === 'md' ? 'Copied!' : 'Copy as markdown'}
      </button>
      <button
        type="button"
        onClick={copyList}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
      >
        {copied === 'list' ? <Check size={12} /> : <Copy size={12} />}
        Copy paths only
      </button>
    </>
  )
}
