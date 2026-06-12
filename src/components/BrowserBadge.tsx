import {useStore} from '@/store'
import {Globe2} from 'lucide-react'

export function BrowserBadge() {
  const browser = useStore((s) => s.browser)
  const runtime = useStore((s) => s.runtime)
  const entries = useStore((s) => s.entries)

  const supported = entries.filter((e) => runtime[e.id]?.supported).length

  if (!browser) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs text-[var(--color-muted)]">
        <Globe2 size={13} className="animate-pulse" />
        detecting…
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs">
      <Globe2 size={13} className="text-[var(--color-accent)]" />
      <span className="font-medium">
        {browser.name}
        {browser.version && <span className="ml-1 text-[var(--color-muted)]">{majorVersion(browser.version)}</span>}
      </span>
      {browser.os && (
        <span className="text-[var(--color-muted)] before:mr-2 before:content-['·']">{browser.os}</span>
      )}
      <span className="ml-1 rounded-full bg-[var(--color-accent)]/10 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-accent)]">
        {supported}/{entries.length}
      </span>
    </div>
  )
}

function majorVersion(v: string): string {
  return v.split('.')[0]
}
