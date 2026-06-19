import {Share2} from 'lucide-react'
import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

function WebShareDemo() {
  const supported = typeof navigator !== 'undefined' && 'share' in navigator
  const canShareSupported = typeof navigator !== 'undefined' && 'canShare' in navigator

  const [title, setTitle] = useState('Browser API Atlas')
  const [text, setText] = useState('Every modern web API in one interactive graph.')
  const [url, setUrl] = useState('https://hmelenok.github.io/browser-api-atlas/')
  const [result, setResult] = useState('')

  const data = {title, text, url}
  const canShareThis = canShareSupported ? navigator.canShare(data) : true

  const share = async () => {
    setResult('')
    try {
      await navigator.share(data)
      setResult('shared ✓')
    } catch (e) {
      const err = e as Error
      if (err.name !== 'AbortError') {
        setResult(err.message)
      } else {
        setResult('dismissed')
      }
    }
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Web Share not available. Mobile browsers and some desktop Safari only.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <span className="w-12 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          title
        </span>
        <DemoInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </DemoRow>
      <DemoRow>
        <span className="w-12 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          text
        </span>
        <DemoInput value={text} onChange={(e) => setText(e.target.value)} />
      </DemoRow>
      <DemoRow>
        <span className="w-12 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          url
        </span>
        <DemoInput value={url} onChange={(e) => setUrl(e.target.value)} />
      </DemoRow>
      <DemoRow>
        <DemoButton onClick={share} disabled={!canShareThis}>
          <Share2 size={12} />
          share
        </DemoButton>
        {canShareSupported && (
          <span className="text-[11px] text-[var(--color-muted)]">
            canShare:{' '}
            <span
              className="font-mono"
              style={{
                color: canShareThis
                  ? 'var(--color-status-supported)'
                  : 'var(--color-status-unsupported)',
              }}
            >
              {String(canShareThis)}
            </span>
          </span>
        )}
        {result && <span className="font-mono text-[11px] text-[var(--color-muted)]">{result}</span>}
      </DemoRow>
      <p className="text-[10px] text-[var(--color-muted)]">
        Opens the OS-native share sheet. File sharing supported too via the
        <code className="ml-1">files</code> field of the share payload.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Navigator.share',
  title: 'Web Share',
  Demo: WebShareDemo,
  snippet: `// Test whether the payload is shareable first (handles files etc.)
const data = {
  title: 'Atlas',
  text: 'Every browser API…',
  url:  'https://example.com',
}

if (navigator.canShare(data)) {
  try {
    await navigator.share(data)
  } catch (e) {
    if (e.name !== 'AbortError') throw e  // user dismissed
  }
}

// Share files too
const file = new File(['hi'], 'note.txt', {type: 'text/plain'})
if (navigator.canShare({files: [file]})) {
  await navigator.share({files: [file]})
}`,
  notes: 'Requires user-gesture + HTTPS. Mobile browsers and recent Safari ship it; desktop Chrome on macOS / Edge support it too.',
}
