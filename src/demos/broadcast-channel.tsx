import {useEffect, useRef, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

interface Message {
  from: 'this' | 'other'
  text: string
  at: number
}

function BroadcastChannelDemo() {
  const [text, setText] = useState('')
  const [log, setLog] = useState<Message[]>([])
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const ch = new BroadcastChannel('atlas-demo-bc')
    channelRef.current = ch
    ch.onmessage = (e) => {
      setLog((l) => [...l.slice(-9), {from: 'other', text: String(e.data), at: Date.now()}])
    }
    return () => ch.close()
  }, [])

  const send = () => {
    if (!text || !channelRef.current) return
    channelRef.current.postMessage(text)
    setLog((l) => [...l.slice(-9), {from: 'this', text, at: Date.now()}])
    setText('')
  }

  return (
    <DemoFrame>
      <p className="text-[10px] text-[var(--color-muted)]">
        Open the atlas in another tab in this browser — your messages will appear there in real time.
      </p>
      <DemoRow>
        <DemoInput
          placeholder="message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <DemoButton onClick={send} disabled={!text}>
          broadcast
        </DemoButton>
      </DemoRow>
      <ul className="space-y-1 text-[11px]">
        {log.length === 0 && <li className="italic text-[var(--color-muted)]">(no messages yet)</li>}
        {log.map((m, i) => (
          <li
            key={i}
            className="flex gap-2 font-mono"
            style={{color: m.from === 'this' ? 'var(--color-fg)' : 'var(--color-accent)'}}
          >
            <span className="text-[var(--color-muted)]">[{m.from === 'this' ? 'sent' : 'recv'}]</span>
            <span className="truncate">{m.text}</span>
          </li>
        ))}
      </ul>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.BroadcastChannel',
  title: 'Broadcast Channel',
  Demo: BroadcastChannelDemo,
  snippet: `// Same-origin pub/sub — much friendlier than the storage event
const ch = new BroadcastChannel('app:auth')

ch.postMessage({type: 'login', userId: 42})

ch.onmessage = (e) => {
  if (e.data.type === 'login') hydrate(e.data.userId)
}

// Don't forget to close
ch.close()`,
  notes: 'Works across tabs, windows, iframes, and dedicated workers on the same origin.',
}
