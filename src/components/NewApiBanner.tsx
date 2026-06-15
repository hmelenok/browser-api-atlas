import {Sparkles, X} from 'lucide-react'
import {useState} from 'react'

import {useStore} from '@/store'

export function NewApiBanner() {
  const unknown = useStore((s) => s.unknown)
  const setUnknownPanelOpen = useStore((s) => s.setUnknownPanelOpen)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || unknown.length === 0) return null

  const preview = unknown
    .slice(0, 5)
    .map((u) => u.path)
    .join(', ')

  return (
    <div className="flex items-start gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm">
      <Sparkles size={15} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
      <div className="flex-1">
        <p className="font-medium">
          {unknown.length} {unknown.length === 1 ? 'API' : 'APIs'} detected in your browser that
          aren't in the atlas yet.
        </p>
        <p className="mt-1 hidden text-xs text-[var(--color-muted)] md:block">
          <span className="font-mono">{preview}</span>
          {unknown.length > 5 && <span> · +{unknown.length - 5} more</span>}
        </p>
        <button
          type="button"
          onClick={() => setUnknownPanelOpen(true)}
          className="mt-1.5 inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
        >
          Browse the full list →
        </button>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
        aria-label="Dismiss"
        title="Hide this banner for the current session"
      >
        <X size={16} />
      </button>
    </div>
  )
}
