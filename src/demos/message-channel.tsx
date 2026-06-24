import {ArrowLeftRight} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

interface PortMessage {
  side: 'A' | 'B'
  text: string
  t: number
}

function MessageChannelDemo() {
  const supported = typeof MessageChannel !== 'undefined'
  const channelRef = useRef<MessageChannel | null>(null)
  const portARef = useRef<MessagePort | null>(null)
  const portBRef = useRef<MessagePort | null>(null)
  const [log, setLog] = useState<PortMessage[]>([])
  const [draft, setDraft] = useState('hello B')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!supported) return
    const channel = new MessageChannel()
    channel.port1.onmessage = (e) => {
      setLog((prev) => [{side: 'A', text: e.data, t: Date.now()}, ...prev.slice(0, 9)])
    }
    channel.port2.onmessage = (e) => {
      // Port B echoes back with an annotation
      const data = String(e.data)
      channel.port2.postMessage(`${data} ← echoed by B`)
      setLog((prev) => [{side: 'B', text: data, t: Date.now()}, ...prev.slice(0, 9)])
    }
    channel.port1.start()
    channel.port2.start()
    channelRef.current = channel
    portARef.current = channel.port1
    portBRef.current = channel.port2
    setConnected(true)

    return () => {
      channel.port1.close()
      channel.port2.close()
      setConnected(false)
    }
  }, [supported])

  const send = () => {
    if (!draft || !portARef.current) return
    portARef.current.postMessage(draft)
    setDraft('')
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          MessageChannel not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <span
          className="rounded-full px-2 py-0.5 text-[11px]"
          style={{
            background: connected ? 'var(--color-status-supported)1a' : 'var(--color-muted)1a',
            color: connected
              ? 'var(--color-status-supported)'
              : 'var(--color-muted)',
          }}
        >
          {connected ? 'channel open' : 'closed'}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-muted)]">
          port A
          <ArrowLeftRight size={11} />
          port B
        </span>
      </DemoRow>

      <DemoRow>
        <DemoInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="A says…"
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <DemoButton onClick={send} disabled={!draft}>
          A → B
        </DemoButton>
      </DemoRow>

      {log.length === 0 ? (
        <p className="text-[11px] italic text-[var(--color-muted)]">(no traffic yet)</p>
      ) : (
        <ul className="max-h-40 space-y-0.5 overflow-auto font-mono text-[11px]">
          {log.map((m, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--color-muted)]">
                {new Date(m.t).toLocaleTimeString([], {hour12: false})}
              </span>
              <span
                className="w-12"
                style={{
                  color: m.side === 'A' ? 'var(--color-accent)' : 'var(--color-status-supported)',
                }}
              >
                {m.side === 'A' ? '← A got' : '→ B got'}
              </span>
              <span className="truncate">{m.text}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Two ports of a single channel. Real use cases: handing port B to a worker (via{' '}
        <code>postMessage(msg, [port])</code>) for typed, two-way comms.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.MessageChannel',
  title: 'MessageChannel',
  Demo: MessageChannelDemo,
  snippet: `// Create a channel — gets two linked ports
const {port1, port2} = new MessageChannel()

// Each port has its own listener
port1.onmessage = (e) => console.log('port1 got', e.data)
port2.onmessage = (e) => console.log('port2 got', e.data)

// Sending from one shows up on the other
port1.postMessage('hello')
// port2 receives 'hello'

// The killer pattern: hand one port to a worker
const worker = new Worker('worker.js')
worker.postMessage({setup: true, port: port2}, [port2])
// transfer port2 — main thread can't use it anymore

// Now you have a typed, two-way RPC channel with the worker
// without polluting the worker's global onmessage`,
  notes: 'Strong fit for "I need multiple isolated comms channels with one worker" — e.g. one channel for control, another for streaming data, another for telemetry.',
}
