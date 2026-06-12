import {useEffect} from 'react'

import {BrowserBadge} from '@/components/BrowserBadge'
import {DetailPanel} from '@/components/DetailPanel'
import {Graph} from '@/components/Graph'
import {Legend} from '@/components/Legend'
import {NewApiBanner} from '@/components/NewApiBanner'
import {SearchBar} from '@/components/SearchBar'
import {useStore} from '@/store'

function App() {
  const initialize = useStore((s) => s.initialize)
  const bcdVersion = useStore((s) => s.bcdVersion)
  const webFeaturesVersion = useStore((s) => s.webFeaturesVersion)
  const entries = useStore((s) => s.entries)

  useEffect(() => {
    initialize().catch(console.error)
  }, [initialize])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)]">
        <div className="flex flex-wrap items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo />
            <div>
              <h1 className="text-sm font-semibold leading-none">Browser API Atlas</h1>
              <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
                {entries.length} APIs · {entries.filter((e) => e.hasDemo).length} live demos
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <BrowserBadge />
            <a
              href="https://github.com/hmelenok/browser-api-atlas"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              aria-label="GitHub repository"
            >
              <GithubIcon />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] px-4 py-2">
          <SearchBar />
        </div>
      </header>

      <NewApiBanner />

      {/* Main */}
      <main className="relative flex-1 overflow-hidden">
        <Graph />
        <DetailPanel />
      </main>

      {/* Footer */}
      <footer className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] px-4 py-2 text-[10px] text-[var(--color-muted)]">
        <Legend />
        <span className="ml-auto font-mono">
          data: BCD {bcdVersion} · web-features {webFeaturesVersion}
        </span>
      </footer>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function Logo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--color-accent)]"
    >
      <circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="8" />
      <circle cx="16" cy="16" r="13" opacity="0.5" />
      <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="24" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="22" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="24" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default App
