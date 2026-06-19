import {Check, Copy, ClipboardPaste} from 'lucide-react'
import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

function ClipboardDemo() {
  const supported = typeof navigator !== 'undefined' && 'clipboard' in navigator
  const [text, setText] = useState('Hello from Atlas')
  const [readBack, setReadBack] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const write = async () => {
    setError('')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const read = async () => {
    setError('')
    try {
      setReadBack(await navigator.clipboard.readText())
    } catch (e) {
      setError(`${(e as Error).message} — read requires user gesture + permission.`)
    }
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          navigator.clipboard not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">write</p>
        <DemoRow>
          <DemoInput value={text} onChange={(e) => setText(e.target.value)} />
          <DemoButton onClick={write}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'copied' : 'writeText()'}
          </DemoButton>
        </DemoRow>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">read</p>
        <DemoRow>
          <DemoButton variant="ghost" onClick={read}>
            <ClipboardPaste size={12} />
            readText()
          </DemoButton>
          {readBack && (
            <code className="flex-1 truncate rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-xs">
              {readBack}
            </code>
          )}
        </DemoRow>
      </div>

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}
      <p className="text-[10px] text-[var(--color-muted)]">
        writeText() is unprompted on user gesture. readText() prompts for permission the first time.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Clipboard',
  title: 'Clipboard',
  Demo: ClipboardDemo,
  snippet: `// Write (no permission prompt on user gesture)
await navigator.clipboard.writeText('hello')

// Read (prompts the user, requires HTTPS)
const text = await navigator.clipboard.readText()

// Rich content: HTML + image + plain in one item
await navigator.clipboard.write([
  new ClipboardItem({
    'text/html':  new Blob(['<b>hi</b>'], {type: 'text/html'}),
    'text/plain': new Blob(['hi'],         {type: 'text/plain'}),
  }),
])`,
  notes: 'Async, promise-based. Replaces the synchronous document.execCommand("copy") legacy path.',
}
