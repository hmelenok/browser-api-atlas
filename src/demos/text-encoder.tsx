import {useMemo, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame, DemoInput, DemoRow} from './_ui'

const SAMPLES = ['hello', 'héllo 🌊', '안녕하세요', '𓂀 ⚡ é']

function TextEncoderDemo() {
  const supported = typeof TextEncoder !== 'undefined'
  const [text, setText] = useState('héllo 🌊')

  const analysis = useMemo(() => {
    if (!supported) return null
    const encoded = new TextEncoder().encode(text)
    const decoded = new TextDecoder('utf-8').decode(encoded)
    const codePoints = Array.from(text)
    const codepointBytes = codePoints.map((cp) => new TextEncoder().encode(cp).length)
    return {
      encoded,
      decoded,
      codePoints,
      codepointBytes,
      jsLength: text.length,
      codePointCount: codePoints.length,
      byteLength: encoded.byteLength,
    }
  }, [text, supported])

  if (!supported || !analysis) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          TextEncoder not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setText(s)}
            className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs hover:bg-[var(--color-bg)]"
          >
            {s}
          </button>
        ))}
      </DemoRow>

      <DemoInput value={text} onChange={(e) => setText(e.target.value)} />

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label=".length (JS)">{analysis.jsLength}</Stat>
        <Stat label="code points">{analysis.codePointCount}</Stat>
        <Stat label="UTF-8 bytes">{analysis.byteLength}</Stat>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          per code point
        </p>
        <div className="flex flex-wrap gap-1">
          {analysis.codePoints.map((cp, i) => {
            const bytes = analysis.codepointBytes[i]
            const color =
              bytes === 1
                ? 'var(--color-status-supported)'
                : bytes === 2
                  ? 'var(--color-status-newly)'
                  : bytes === 3
                    ? 'var(--color-accent)'
                    : 'var(--color-status-unsupported)'
            return (
              <div
                key={i}
                className="flex flex-col items-center rounded border bg-[var(--color-bg)] px-2 py-1 font-mono text-[11px]"
                style={{borderColor: color}}
                title={`${bytes} ${bytes === 1 ? 'byte' : 'bytes'} in UTF-8`}
              >
                <span className="text-base leading-none">{cp}</span>
                <span style={{color}}>{bytes}B</span>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          encoded bytes (hex)
        </p>
        <pre className="overflow-x-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[11px]">
          {Array.from(analysis.encoded)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(' ')}
        </pre>
      </div>

      <p className="text-[10px] text-[var(--color-muted)]">
        ASCII = 1 byte. Latin-1 supplements (é) = 2. Most CJK = 3. Emoji ≥ 4. JS{' '}
        <code>.length</code> counts UTF-16 code units — it lies on emoji.
      </p>
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
  bcdKey: 'api.TextEncoder',
  title: 'TextEncoder / TextDecoder',
  Demo: TextEncoderDemo,
  snippet: `// Encode: string → UTF-8 bytes
const bytes = new TextEncoder().encode('héllo 🌊')
// Uint8Array(11) [104, 195, 169, 108, 108, 111, 32, 240, 159, 140, 138]
// (10 = JS .length, but 11 bytes — multi-byte chars cost more)

// Decode: bytes → string
const text = new TextDecoder('utf-8').decode(bytes)

// Stream variant (chunks may end mid-character)
const decoder = new TextDecoder('utf-8', {ignoreBOM: false, fatal: true})
let result = ''
for await (const chunk of stream) {
  result += decoder.decode(chunk, {stream: true})
}
result += decoder.decode()    // flush

// Counting characters correctly
'🌊'.length            // 2  (UTF-16 surrogate pair, misleading)
[...'🌊'].length       // 1  (real character count)
new TextEncoder().encode('🌊').length   // 4  (UTF-8 bytes)`,
  notes: 'A whole class of "why is my string different lengths in JS vs the network vs MySQL?" bugs comes from confusing these three numbers.',
}
