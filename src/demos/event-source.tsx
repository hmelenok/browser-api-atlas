import {Radio, RadioReceiver} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const SSE_URL = 'https://sse.dev/test?interval=2'

type State = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface SSEMsg {
  data: string
  at: number
}

function EventSourceDemo() {
  const supported = typeof EventSource !== 'undefined'
  const esRef = useRef<EventSource | null>(null)
  const [state, setState] = useState<State>('idle')
  const [msgs, setMsgs] = useState<SSEMsg[]>([])

  useEffect(() => () => esRef.current?.close(), [])

  const connect = () => {
    if (esRef.current) return
    setState('connecting')
    setMsgs([])
    const es = new EventSource(SSE_URL)
    esRef.current = es
    es.onopen = () => setState('open')
    es.onmessage = (e) => {
      setMsgs((prev) =>
        [{data: e.data, at: Date.now()}, ...prev].slice(0, 10)
      )
    }
    es.onerror = () => {
      // EventSource auto-reconnects unless we close it
      if (es.readyState === EventSource.CLOSED) {
        setState('closed')
      } else {
        setState('error')
      }
    }
  }

  const disconnect = () => {
    esRef.current?.close()
    esRef.current = null
    setState('closed')
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          EventSource not available.
        </p>
      </DemoFrame>
    )
  }

  const stateColor =
    state === 'open'
      ? 'var(--color-status-supported)'
      : state === 'connecting'
        ? 'var(--color-status-newly)'
        : state === 'error'
          ? 'var(--color-status-unsupported)'
          : 'var(--color-muted)'

  return (
    <DemoFrame>
      <DemoRow>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]"
          style={{background: `${stateColor}1a`, color: stateColor}}
        >
          {state === 'open' ? <Radio size={11} /> : <RadioReceiver size={11} />}
          {state}
        </span>
        {state === 'open' || state === 'connecting' ? (
          <DemoButton variant="danger" onClick={disconnect}>
            disconnect
          </DemoButton>
        ) : (
          <DemoButton onClick={connect}>connect to SSE</DemoButton>
        )}
        <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)]">
          sse.dev/test?interval=2
        </span>
      </DemoRow>

      {msgs.length === 0 ? (
        <p className="text-[11px] italic text-[var(--color-muted)]">
          (no events yet — server pushes every 2s)
        </p>
      ) : (
        <ul className="max-h-40 space-y-0.5 overflow-auto font-mono text-[11px]">
          {msgs.map((m, i) => (
            <li
              key={i}
              className="flex gap-2"
              style={{opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.08)}}
            >
              <span className="text-[var(--color-muted)]">
                {new Date(m.at).toLocaleTimeString([], {hour12: false})}
              </span>
              <span style={{color: 'var(--color-status-supported)'}} className="w-12">
                ← event
              </span>
              <span className="truncate">{m.data}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Server-Sent Events: one-way (server → client), HTTP-based, auto-reconnects on disconnect.
        Simpler than WebSocket when you only need push.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.EventSource',
  title: 'EventSource (SSE)',
  Demo: EventSourceDemo,
  snippet: `// One-way push from server, automatic reconnection built in
const es = new EventSource('/events', {withCredentials: true})

es.onopen    = () => console.log('connected')
es.onmessage = (e) => console.log(e.data)             // default 'message' event

// Custom named events: server sends "event: foo\\ndata: bar\\n\\n"
es.addEventListener('order-update', (e) => {
  console.log('order:', JSON.parse(e.data))
})

es.onerror = (e) => {
  // No need to reconnect manually — EventSource does it for you,
  // with the retry interval the server suggested.
}

es.close()  // stops reconnection

// Server format is plain text over HTTP:
//   id: 42                                        ← optional sequence id
//   event: order-update                           ← optional event name
//   data: {"id":1,"status":"shipped"}             ← any string
//   retry: 5000                                   ← optional retry interval (ms)
//                                                 ← blank line ends the message`,
  notes: 'Reconnection respects the server\'s suggested Retry-After. The Last-Event-ID header is sent on reconnect — server can resume from where it left off. WebSocket beats SSE when you need duplex; SSE beats WebSocket when you don\'t.',
}
