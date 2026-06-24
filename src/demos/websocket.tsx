import {Send, Wifi, WifiOff} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

const ECHO_URL = 'wss://echo.websocket.events/'

type ConnState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface Msg {
  dir: 'sent' | 'recv' | 'system'
  text: string
  at: number
}

function WebSocketDemo() {
  const [state, setState] = useState<ConnState>('idle')
  const [draft, setDraft] = useState('hello echo')
  const [log, setLog] = useState<Msg[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const supported = typeof WebSocket !== 'undefined'

  useEffect(() => () => wsRef.current?.close(), [])

  const addMsg = (m: Omit<Msg, 'at'>) => {
    setLog((prev) => [{...m, at: Date.now()}, ...prev.slice(0, 11)])
  }

  const connect = () => {
    if (wsRef.current) return
    setState('connecting')
    addMsg({dir: 'system', text: `→ connecting to ${ECHO_URL}`})
    try {
      const ws = new WebSocket(ECHO_URL)
      wsRef.current = ws
      ws.onopen = () => {
        setState('open')
        addMsg({dir: 'system', text: '✓ connected'})
      }
      ws.onmessage = (e) => {
        addMsg({dir: 'recv', text: typeof e.data === 'string' ? e.data : '(binary frame)'})
      }
      ws.onerror = () => {
        setState('error')
        addMsg({dir: 'system', text: '✗ error'})
      }
      ws.onclose = (e) => {
        setState('closed')
        addMsg({dir: 'system', text: `× closed (code ${e.code})`})
        wsRef.current = null
      }
    } catch (e) {
      setState('error')
      addMsg({dir: 'system', text: `✗ ${(e as Error).message}`})
    }
  }

  const send = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !draft) return
    wsRef.current.send(draft)
    addMsg({dir: 'sent', text: draft})
    setDraft('')
  }

  const disconnect = () => {
    wsRef.current?.close(1000, 'user closed')
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          WebSocket not available.
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
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]"
          style={{
            background: `${stateColor}1a`,
            color: stateColor,
          }}>
          {state === 'open' ? <Wifi size={11} /> : <WifiOff size={11} />}
          {state}
        </span>
        {state !== 'open' ? (
          <DemoButton onClick={connect} disabled={state === 'connecting'}>
            connect
          </DemoButton>
        ) : (
          <DemoButton variant="danger" onClick={disconnect}>
            close
          </DemoButton>
        )}
        <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)]">
          echo.websocket.events
        </span>
      </DemoRow>

      <DemoRow>
        <DemoInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="message"
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={state !== 'open'}
        />
        <DemoButton onClick={send} disabled={state !== 'open' || !draft}>
          <Send size={12} />
          send
        </DemoButton>
      </DemoRow>

      {log.length === 0 ? (
        <p className="text-[11px] italic text-[var(--color-muted)]">(no messages yet)</p>
      ) : (
        <ul className="max-h-40 space-y-0.5 overflow-auto font-mono text-[11px]">
          {log.map((m, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--color-muted)]">
                {new Date(m.at).toLocaleTimeString([], {hour12: false})}
              </span>
              <span
                style={{
                  color:
                    m.dir === 'sent'
                      ? 'var(--color-accent)'
                      : m.dir === 'recv'
                        ? 'var(--color-status-supported)'
                        : 'var(--color-muted)',
                }}
                className="w-12"
              >
                {m.dir === 'sent' ? '→ sent' : m.dir === 'recv' ? '← recv' : 'sys'}
              </span>
              <span className="truncate">{m.text}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Connects to a public echo server — every message you send comes back. The first message
        from the server is a welcome banner.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.WebSocket',
  title: 'WebSocket',
  Demo: WebSocketDemo,
  snippet: `const ws = new WebSocket('wss://example.com/socket')

ws.onopen = () => {
  ws.send(JSON.stringify({type: 'subscribe', topic: 'orders'}))
}

ws.onmessage = (e) => {
  // e.data is either string or ArrayBuffer / Blob (binaryType)
  console.log(e.data)
}

ws.onerror = (e) => console.error(e)
ws.onclose = (e) => console.log('closed', e.code, e.reason)

// Send text
ws.send('hello')

// Send binary (use ws.binaryType = 'arraybuffer' to receive as one)
const buf = new Uint8Array([1, 2, 3])
ws.send(buf)

// Close cleanly
ws.close(1000, 'goodbye')`,
  notes: 'WebSocket is full-duplex but lacks built-in reconnection, heartbeats, or back-pressure. Most production code wraps it (Socket.IO, Phoenix Channels) or sees WebTransport as the modern alternative.',
}
