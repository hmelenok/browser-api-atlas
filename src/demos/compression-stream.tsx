import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const SAMPLE_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`.repeat(
  3
)

const FORMATS = ['gzip', 'deflate', 'deflate-raw'] as const
type Format = (typeof FORMATS)[number]

async function compress(text: string, format: Format): Promise<Uint8Array> {
  const stream = new Response(text).body!.pipeThrough(new CompressionStream(format))
  const buf = await new Response(stream).arrayBuffer()
  return new Uint8Array(buf)
}

async function decompress(bytes: Uint8Array, format: Format): Promise<string> {
  const stream = new Response(new Blob([bytes as unknown as BlobPart])).body!.pipeThrough(
    new DecompressionStream(format)
  )
  return await new Response(stream).text()
}

function CompressionStreamDemo() {
  const supported = typeof CompressionStream !== 'undefined'

  const [text, setText] = useState(SAMPLE_TEXT)
  const [format, setFormat] = useState<Format>('gzip')
  const [result, setResult] = useState<{
    original: number
    compressed: number
    decompressed: string
    matches: boolean
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setError('')
    setBusy(true)
    try {
      const originalBytes = new TextEncoder().encode(text).byteLength
      const compressed = await compress(text, format)
      const decompressed = await decompress(compressed, format)
      setResult({
        original: originalBytes,
        compressed: compressed.byteLength,
        decompressed,
        matches: decompressed === text,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          CompressionStream not available. Chrome 80+, Safari 16.4+, Firefox 113+.
        </p>
      </DemoFrame>
    )
  }

  const ratio = result ? (1 - result.compressed / result.original) * 100 : 0

  return (
    <DemoFrame>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-xs"
      />

      <DemoRow>
        {FORMATS.map((f) => (
          <DemoButton
            key={f}
            variant={format === f ? 'primary' : 'ghost'}
            onClick={() => setFormat(f)}
          >
            {f}
          </DemoButton>
        ))}
        <DemoButton onClick={run} disabled={busy}>
          🗜 compress & verify
        </DemoButton>
      </DemoRow>

      {result && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Stat label="original">
              {result.original.toLocaleString()} B
            </Stat>
            <Stat label={`${format}`}>
              {result.compressed.toLocaleString()} B
            </Stat>
            <Stat label="saved">
              <span
                style={{
                  color: ratio > 0 ? 'var(--color-status-supported)' : 'var(--color-status-unsupported)',
                }}
              >
                {ratio.toFixed(1)}%
              </span>
            </Stat>
          </div>
          <p className="rounded bg-[var(--color-bg)] px-2 py-1 text-[11px]">
            roundtrip:{' '}
            <span
              className="font-mono"
              style={{
                color: result.matches
                  ? 'var(--color-status-supported)'
                  : 'var(--color-status-unsupported)',
              }}
            >
              {result.matches ? '✓ identical' : '✗ MISMATCH'}
            </span>
          </p>
        </div>
      )}
      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}
    </DemoFrame>
  )
}

function Stat({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-0.5 font-mono font-medium">{children}</p>
    </div>
  )
}

export const demo: Demo = {
  bcdKey: 'api.CompressionStream',
  title: 'CompressionStream',
  Demo: CompressionStreamDemo,
  snippet: `// Compress without a library
async function gzip(text) {
  const cs = new CompressionStream('gzip')
  const stream = new Response(text).body.pipeThrough(cs)
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gunzip(bytes) {
  const ds = new DecompressionStream('gzip')
  const stream = new Response(bytes).body.pipeThrough(ds)
  return await new Response(stream).text()
}

// Formats: 'gzip', 'deflate', 'deflate-raw'
const small = await gzip('hello world '.repeat(1000))
const big   = await gunzip(small)`,
  notes: 'Built-in gzip in the browser. Used to ship as a 30 KB pako dependency — now zero bytes of JS. Streams API means you can also pipe a Response.body straight through.',
}
