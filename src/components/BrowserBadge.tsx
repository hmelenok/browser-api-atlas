import {Globe2} from 'lucide-react'

import {useStore} from '@/store'

export function BrowserBadge() {
  const browser = useStore((s) => s.browser)
  const runtime = useStore((s) => s.runtime)
  const entries = useStore((s) => s.entries)

  const supported = entries.filter((e) => runtime[e.id]?.supported).length
  const missing = entries.length - supported

  if (!browser) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1 text-sm text-[var(--color-muted)]">
        <Globe2 size={14} className="animate-pulse" />
        detecting…
      </div>
    )
  }

  const browserDetectionMethod =
    browser.source === 'ua-client-hints'
      ? 'Detected via UA Client Hints (high confidence).'
      : 'Detected via User-Agent string (low confidence, UA Client Hints unavailable).'

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1.5 text-sm"
      title={`Your browser, as detected at runtime. ${browserDetectionMethod}`}
    >
      <Globe2 size={14} className="text-[var(--color-accent)]" aria-hidden />
      <span
        className="font-medium"
        title={
          browser.engine
            ? `${browser.name}${browser.version ? ` ${browser.version}` : ''} · ${browser.engine} engine`
            : browser.name
        }
      >
        {browser.name}
        {browser.version && (
          <span className="ml-1 text-[var(--color-muted)]">{majorVersion(browser.version)}</span>
        )}
      </span>
      {browser.os && (
        <span
          className="text-[var(--color-muted)] before:mr-2 before:content-['·']"
          title={`Operating system: ${browser.os}`}
        >
          {browser.os}
        </span>
      )}
      <span
        className="ml-1 rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 font-mono text-xs text-[var(--color-accent)]"
        title={
          missing === 0
            ? `\u{1F389} Your browser supports every API in the atlas (${supported} of ${entries.length}).`
            : `Your browser supports ${supported} of the ${entries.length} APIs in this atlas. ${missing} ${
                missing === 1 ? 'is' : 'are'
              } missing — turn on the “Supported here” filter to hide them.`
        }
        aria-label={`${supported} of ${entries.length} APIs supported in this browser`}
      >
        {supported}/{entries.length}
      </span>
    </div>
  )
}

function majorVersion(v: string): string {
  return v.split('.')[0]
}
