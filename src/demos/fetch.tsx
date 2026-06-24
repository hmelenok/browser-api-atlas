import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

const PRESETS = [
  {name: 'GitHub Zen', url: 'https://api.github.com/zen'},
  {name: 'Cat fact', url: 'https://catfact.ninja/fact'},
  {name: 'IP info', url: 'https://api.ipify.org?format=json'},
  {name: 'Slow (5s)', url: 'https://httpbin.org/delay/5'},
]

interface Result {
  status: number
  ok: boolean
  ms: number
  ctype: string
  body: string
}

function FetchDemo() {
  const [url, setUrl] = useState(PRESETS[0].url)
  const [timeout, setTimeout] = useState(3000)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setError('')
    setResult(null)
    setBusy(true)
    const t0 = performance.now()
    try {
      const res = await fetch(url, {signal: AbortSignal.timeout(timeout)})
      const ctype = res.headers.get('content-type') ?? ''
      const text = await res.text()
      let body = text
      if (ctype.includes('json')) {
        try {
          body = JSON.stringify(JSON.parse(text), null, 2)
        } catch {
          /* leave raw */
        }
      }
      setResult({
        status: res.status,
        ok: res.ok,
        ms: Math.round(performance.now() - t0),
        ctype,
        body: body.slice(0, 600),
      })
    } catch (e) {
      const err = e as Error
      setError(`${err.name}: ${err.message} (after ${Math.round(performance.now() - t0)}ms)`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <DemoFrame>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">preset</p>
        <DemoRow>
          {PRESETS.map((p) => (
            <DemoButton
              key={p.url}
              variant={url === p.url ? 'primary' : 'ghost'}
              onClick={() => setUrl(p.url)}
            >
              {p.name}
            </DemoButton>
          ))}
        </DemoRow>
      </div>

      <DemoRow>
        <DemoInput value={url} onChange={(e) => setUrl(e.target.value)} />
      </DemoRow>

      <DemoRow>
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          timeout
        </span>
        {[1000, 3000, 10000].map((t) => (
          <DemoButton
            key={t}
            variant={timeout === t ? 'primary' : 'ghost'}
            onClick={() => setTimeout(t)}
          >
            {t / 1000}s
          </DemoButton>
        ))}
        <DemoButton onClick={run} disabled={busy}>
          {busy ? '⏳ fetching…' : '🌐 fetch'}
        </DemoButton>
      </DemoRow>

      {result && (
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px]">
            <span
              className="rounded-full px-2 py-0.5 font-mono"
              style={{
                background: result.ok
                  ? 'var(--color-status-supported)/.1'
                  : 'var(--color-status-unsupported)/.1',
                color: result.ok
                  ? 'var(--color-status-supported)'
                  : 'var(--color-status-unsupported)',
              }}
            >
              {result.status}
            </span>
            <span className="font-mono text-[var(--color-muted)]">{result.ctype}</span>
            <span className="ml-auto font-mono text-[var(--color-muted)]">{result.ms} ms</span>
          </div>
          <pre className="max-h-48 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[11px]">
            {result.body}
          </pre>
        </div>
      )}
      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Try the "Slow (5s)" preset with a 3s timeout → see <code>TimeoutError</code> after 3 seconds.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.fetch',
  title: 'Fetch',
  Demo: FetchDemo,
  snippet: `// The default network primitive
const response = await fetch('https://api.github.com/zen', {
  signal: AbortSignal.timeout(3000),    // cancel after 3 seconds
})

if (!response.ok) {
  throw new Error(\`HTTP \${response.status}\`)
}

const text = await response.text()
// or: response.json(), .blob(), .arrayBuffer(),
// or: response.body.pipeThrough(stream)  for streaming

// POST + JSON body
await fetch('/api/save', {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify(payload),
})`,
  notes: 'Streams-aware (response.body is a ReadableStream). Pairs with AbortController. Pass an AbortSignal.any() to race multiple signals.',
}
