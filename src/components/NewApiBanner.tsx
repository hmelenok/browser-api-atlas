import {Sparkles, X} from 'lucide-react'
import {useState} from 'react'
import {useStore} from '@/store'

const REPO = 'hmelenok/browser-api-atlas'

export function NewApiBanner() {
  const unknown = useStore((s) => s.unknown)
  const browser = useStore((s) => s.browser)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || unknown.length === 0) return null

  const preview = unknown.slice(0, 5).map((u) => u.path).join(', ')
  const issueTitle = encodeURIComponent(
    `New APIs detected: ${unknown.slice(0, 3).map((u) => u.name).join(', ')}…`
  )
  const issueBody = encodeURIComponent(
    [
      `Detected in ${browser?.name ?? 'this browser'} ${browser?.version ?? ''} (${browser?.os ?? 'unknown OS'}):`,
      '',
      ...unknown.map((u) => `- \`${u.path}\` (${u.kind})`),
      '',
      'These globals are present in the current browser but not yet in the catalog. ' +
        'Update `src/data/api-selection.ts` to add them — see [docs/ADDING-AN-API.md](../blob/main/docs/ADDING-AN-API.md).',
    ].join('\n')
  )

  const issueUrl = `https://github.com/${REPO}/issues/new?title=${issueTitle}&body=${issueBody}&labels=new-api`

  return (
    <div className="flex items-start gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-xs">
      <Sparkles size={14} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
      <div className="flex-1">
        <p className="font-medium">
          {unknown.length} {unknown.length === 1 ? 'API' : 'APIs'} detected in your browser that aren't in the
          atlas yet.
        </p>
        <p className="mt-0.5 text-[var(--color-muted)]">
          <span className="font-mono">{preview}</span>
          {unknown.length > 5 && <span> · +{unknown.length - 5} more</span>}
        </p>
        <a
          href={issueUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 inline-block text-[var(--color-accent)] hover:underline"
        >
          Open a contribution issue with these →
        </a>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
