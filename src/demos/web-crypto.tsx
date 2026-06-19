import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
type Algorithm = (typeof ALGORITHMS)[number]

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function WebCryptoDemo() {
  const supported =
    typeof window !== 'undefined' && 'crypto' in window && 'subtle' in window.crypto

  const [text, setText] = useState('hello world')
  const [algo, setAlgo] = useState<Algorithm>('SHA-256')
  const [hash, setHash] = useState('')
  const [uuid, setUuid] = useState<string>('')

  // Compute hash whenever text/algo change
  useEffect(() => {
    let cancelled = false
    if (!supported || !text) {
      setHash('')
      return
    }
    crypto.subtle
      .digest(algo, new TextEncoder().encode(text))
      .then((buf) => {
        if (!cancelled) setHash(toHex(buf))
      })
      .catch(() => {
        if (!cancelled) setHash('error')
      })
    return () => {
      cancelled = true
    }
  }, [text, algo, supported])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          window.crypto.subtle not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          digest a string
        </p>
        <DemoRow>
          <DemoInput value={text} onChange={(e) => setText(e.target.value)} />
        </DemoRow>
        <DemoRow>
          {ALGORITHMS.map((a) => (
            <DemoButton
              key={a}
              variant={algo === a ? 'primary' : 'ghost'}
              onClick={() => setAlgo(a)}
            >
              {a}
            </DemoButton>
          ))}
        </DemoRow>
        {hash && (
          <pre className="mt-2 overflow-x-auto break-all rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[11px]">
            {hash}
          </pre>
        )}
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          crypto.randomUUID()
        </p>
        <DemoRow>
          <DemoButton onClick={() => setUuid(crypto.randomUUID())}>generate</DemoButton>
          {uuid && (
            <code className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-xs">
              {uuid}
            </code>
          )}
        </DemoRow>
      </div>

      <p className="text-[10px] text-[var(--color-muted)]">
        SubtleCrypto runs in a worker — works in secure contexts (HTTPS / localhost) only.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.SubtleCrypto',
  title: 'SubtleCrypto',
  Demo: WebCryptoDemo,
  snippet: `// Hash a string
const data = new TextEncoder().encode('hello world')
const buf  = await crypto.subtle.digest('SHA-256', data)
const hex  = [...new Uint8Array(buf)]
  .map(b => b.toString(16).padStart(2, '0'))
  .join('')

// Generate a v4 UUID synchronously
crypto.randomUUID()
// 'd2c4b5e6-...'

// Encrypt with AES-GCM
const key = await crypto.subtle.generateKey(
  {name: 'AES-GCM', length: 256},
  true,
  ['encrypt', 'decrypt'],
)
const iv = crypto.getRandomValues(new Uint8Array(12))
const ct = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, data)`,
  notes: 'Secure context (HTTPS) only. The subtle API is the right place for symmetric / asymmetric crypto — do not roll your own.',
}
