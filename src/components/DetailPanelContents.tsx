import {
  BookOpen,
  ExternalLink,
  FileCode2,
  Info,
  Link2,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react'
import {useState} from 'react'

import {CATEGORIES} from '@/data/categories'
import {getDemo} from '@/demos/_registry'
import {resolveStatus, BASELINE_LABEL} from '@/lib/status'
import {useStore} from '@/store'

import {CodeBlock} from './CodeBlock'
import {DemoBoundary} from './DemoBoundary'

export default function DetailPanelContents({
  entryId,
  onClose,
}: {
  entryId: string
  onClose: () => void
}) {
  const entry = useStore((s) => s.entries.find((e) => e.id === entryId))!
  const runtime = useStore((s) => s.runtime[entryId])
  const status = resolveStatus(entry, runtime)
  const cat = CATEGORIES[entry.category]
  const CatIcon = cat.icon
  const demo = getDemo(entry.id)
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}${window.location.pathname}?api=${encodeURIComponent(entry.id)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div
          className="mt-1 size-2.5 shrink-0 rounded-full"
          style={{background: status.color}}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1">
              <CatIcon size={11} strokeWidth={2} style={{color: cat.color}} />
              {cat.title}
            </span>
            <span className="opacity-40">·</span>
            <span style={{color: status.color}}>{status.label}</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold leading-tight">{entry.title}</h2>
          <p className="mt-1 font-mono text-[11px] text-[var(--color-muted)]">{entry.id}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-md p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-fg)]"
            aria-label="Copy share link"
            title={copied ? 'Copied!' : 'Copy share link'}
          >
            <Link2 size={14} className={copied ? 'text-[var(--color-status-supported)]' : ''} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-fg)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Description */}
        {entry.description && (
          <section className="border-b border-[var(--color-border)] px-5 py-4">
            <p className="text-sm leading-relaxed text-[var(--color-fg)]">{entry.description}</p>
          </section>
        )}

        {/* Runtime status */}
        <section className="border-b border-[var(--color-border)] px-5 py-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Stat label="In your browser">
              <span
                style={{
                  color: runtime?.supported
                    ? 'var(--color-status-supported)'
                    : 'var(--color-status-unsupported)',
                }}
              >
                {runtime?.supported ? 'Yes' : 'No'}
              </span>
              {!runtime?.supported && runtime?.reason && (
                <span className="ml-1 text-[10px] text-[var(--color-muted)]">
                  ({runtime.reason})
                </span>
              )}
            </Stat>
            <Stat
              label={
                <span className="inline-flex items-center gap-1">
                  Baseline
                  <a
                    href="https://web.dev/baseline"
                    target="_blank"
                    rel="noreferrer noopener"
                    title="What is Baseline? A W3C / Web Platform DX classification of cross-browser support."
                    className="text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                  >
                    <Info size={9} />
                  </a>
                </span>
              }
            >
              {entry.webFeatureId ? (
                <a
                  href={`https://webstatus.dev/features/${entry.webFeatureId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={`See the source data for this Baseline status on webstatus.dev (web-features id: ${entry.webFeatureId})`}
                  className="inline-flex items-center gap-1 hover:text-[var(--color-accent)] hover:underline"
                >
                  {BASELINE_LABEL[entry.baseline]}
                  {entry.baselineYear ? ` ${entry.baselineYear}` : ''}
                  <ExternalLink size={10} className="opacity-50" />
                </a>
              ) : (
                <span title="No web-features entry for this API yet — Baseline status is unknown.">
                  {BASELINE_LABEL[entry.baseline]}
                  {entry.baselineYear ? ` ${entry.baselineYear}` : ''}
                </span>
              )}
            </Stat>
            <Stat label="Standard status">{entry.status}</Stat>
            <Stat label="Runtime check">
              <code className="font-mono text-[11px]">{entry.runtimeKey}</code>
            </Stat>
          </div>
        </section>

        {/* Demo */}
        <section className="border-b border-[var(--color-border)] px-5 py-4">
          <SectionHeader icon={<Sparkles size={12} />}>Demo</SectionHeader>
          {demo ? (
            <DemoBoundary apiTitle={entry.title}>
              <demo.Demo />
            </DemoBoundary>
          ) : (
            <div className="rounded-md border border-dashed border-[var(--color-border)] p-3 text-xs text-[var(--color-muted)]">
              No interactive demo yet.{' '}
              <a
                href={`https://github.com/hmelenok/browser-api-atlas/issues/new?title=Demo%20wanted%3A%20${encodeURIComponent(entry.title)}&labels=demo-wanted&body=${encodeURIComponent(`Add a demo for \`${entry.id}\`.\n\nSee [ADDING-AN-API.md](https://github.com/hmelenok/browser-api-atlas/blob/main/docs/ADDING-AN-API.md).`)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[var(--color-accent)] hover:underline"
              >
                Open an issue
              </a>{' '}
              or{' '}
              <a
                href="https://github.com/hmelenok/browser-api-atlas/blob/main/docs/ADDING-AN-API.md"
                target="_blank"
                rel="noreferrer noopener"
                className="text-[var(--color-accent)] hover:underline"
              >
                contribute one
              </a>
              .
            </div>
          )}
          {demo?.notes && (
            <p className="mt-2 text-[11px] text-[var(--color-muted)]">{demo.notes}</p>
          )}
        </section>

        {/* Snippet */}
        {demo?.snippet && (
          <section className="border-b border-[var(--color-border)] px-5 py-4">
            <SectionHeader icon={<FileCode2 size={12} />}>Snippet</SectionHeader>
            <CodeBlock code={demo.snippet} lang="typescript" />
          </section>
        )}

        {/* Links */}
        <section className="px-5 py-4">
          <SectionHeader icon={<BookOpen size={12} />}>Resources</SectionHeader>
          <ul className="space-y-1.5 text-xs">
            {entry.mdnUrl && <LinkRow href={entry.mdnUrl}>MDN documentation</LinkRow>}
            {entry.specUrl && <LinkRow href={entry.specUrl}>Specification</LinkRow>}
            {entry.webFeatureId && (
              <LinkRow href={`https://webstatus.dev/features/${entry.webFeatureId}`}>
                Web Platform Status (Baseline)
              </LinkRow>
            )}
            <LinkRow href={`https://caniuse.com/?search=${encodeURIComponent(entry.title)}`}>
              caniuse search
            </LinkRow>
          </ul>
        </section>

        <section className="px-5 pb-6">
          <a
            href={`https://github.com/hmelenok/browser-api-atlas/discussions/new?category=apis&title=${encodeURIComponent(`Discuss: ${entry.title}`)}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          >
            <MessageSquare size={11} /> Discuss this API
          </a>
        </section>
      </div>
    </div>
  )
}

function SectionHeader({icon, children}: {icon: React.ReactNode; children: React.ReactNode}) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
      {icon}
      {children}
    </h3>
  )
}

function Stat({label, children}: {label: React.ReactNode; children: React.ReactNode}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{label}</div>
      <div className="mt-0.5 font-medium">{children}</div>
    </div>
  )
}

function LinkRow({href, children}: {href: string; children: React.ReactNode}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-[var(--color-accent)] hover:underline"
      >
        {children}
        <ExternalLink size={11} className="opacity-60" />
      </a>
    </li>
  )
}
