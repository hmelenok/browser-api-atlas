import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const SAMPLES = [
  '<p>Hello <strong>world</strong>!</p>',
  '<a href="javascript:alert(\'xss\')">click me</a>',
  '<img src=x onerror="alert(1)">',
  '<svg><script>alert(\'svg\')</script></svg>',
  '<form action="/login"><input name="pw"></form>',
]

type SetHTMLEl = Element & {setHTML?: (html: string, opts?: {sanitizer?: object}) => void}
type GetHTMLEl = Element & {getHTML?: () => string}

function SanitizerDemo() {
  const [raw, setRaw] = useState(SAMPLES[1])
  const [clean, setClean] = useState('')
  const [error, setError] = useState('')

  const supported = typeof Element !== 'undefined' && 'setHTML' in Element.prototype

  const sanitize = () => {
    setError('')
    if (!supported) {
      setError('Element.setHTML not available')
      return
    }
    try {
      const el = document.createElement('div') as SetHTMLEl
      el.setHTML?.(raw)
      setClean((el as GetHTMLEl).getHTML?.() ?? el.innerHTML)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <DemoFrame>
      <DemoRow>
        {SAMPLES.map((s, i) => (
          <DemoButton
            key={i}
            variant={raw === s ? 'primary' : 'ghost'}
            onClick={() => setRaw(s)}
          >
            sample {i + 1}
          </DemoButton>
        ))}
      </DemoRow>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">input</p>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={3}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-xs"
        />
      </div>

      <DemoRow>
        <DemoButton onClick={sanitize}>🧼 sanitize</DemoButton>
      </DemoRow>

      {clean && (
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            after Element.setHTML()
          </p>
          <pre className="overflow-x-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[11px]">
            {clean}
          </pre>
          <p className="mt-1 text-[10px] text-[var(--color-muted)]">
            Inert HTML rendered:
          </p>
          <div
            className="mt-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-xs"
            // The point of the demo is that setHTML cleaned this
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: clean}}
          />
        </div>
      )}
      {error && (
        <p className="text-xs text-[var(--color-status-unsupported)]">
          {error}. Need Chrome 140+ for the built-in safe baseline.
        </p>
      )}
      {!supported && (
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Element.setHTML() not available — Chrome 140+ ships the safe baseline.
        </p>
      )}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Sanitizer',
  title: 'HTML Sanitizer',
  Demo: SanitizerDemo,
  snippet: `// Built-in, safe-by-default HTML sanitization.
// Strips javascript: URLs, on* attributes, <script>, <form>,
// most embeds — anything that could be a vector.

const el = document.createElement('div')
el.setHTML('<a href="javascript:alert(1)">x</a>')
// Result: <a>x</a>

// Or pass a Sanitizer instance for a custom allowlist:
const s = new Sanitizer({
  allowElements: ['p', 'strong', 'em', 'a'],
  allowAttributes: {a: ['href']},
})
el.setHTML(untrustedHtml, {sanitizer: s})`,
  notes: 'Chrome 140+. Replaces hand-rolled DOMPurify dependencies for most cases. The default config blocks the OWASP XSS cheat-sheet entries.',
}
