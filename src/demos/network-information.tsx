import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame} from './_ui'

interface NetInfo {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  type?: string
  downlink?: number
  downlinkMax?: number
  rtt?: number
  saveData?: boolean
}

interface NavigatorWithConn extends Navigator {
  connection?: NetInfo & {addEventListener: (event: string, cb: () => void) => void; removeEventListener: (event: string, cb: () => void) => void}
  mozConnection?: NetInfo
  webkitConnection?: NetInfo
}

function getConn(): (NetInfo & {addEventListener?: (e: string, cb: () => void) => void; removeEventListener?: (e: string, cb: () => void) => void}) | null {
  const n = navigator as NavigatorWithConn
  return (n.connection ?? n.mozConnection ?? n.webkitConnection) ?? null
}

const ETYPE_COLOR: Record<string, string> = {
  'slow-2g': 'var(--color-status-unsupported)',
  '2g': 'var(--color-status-unsupported)',
  '3g': 'var(--color-status-newly)',
  '4g': 'var(--color-status-supported)',
}

function NetworkInformationDemo() {
  const conn = getConn()
  const [snapshot, setSnapshot] = useState<NetInfo>({})

  useEffect(() => {
    if (!conn) return
    const read = () =>
      setSnapshot({
        effectiveType: conn.effectiveType,
        type: conn.type,
        downlink: conn.downlink,
        downlinkMax: conn.downlinkMax,
        rtt: conn.rtt,
        saveData: conn.saveData,
      })
    read()
    conn.addEventListener?.('change', read)
    return () => conn.removeEventListener?.('change', read)
  }, [conn])

  if (!conn) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          navigator.connection not available. Chrome / Edge / Opera only; Firefox + Safari haven't
          shipped it for privacy reasons.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Stat label="effective type">
          <span style={{color: ETYPE_COLOR[snapshot.effectiveType ?? ''] ?? 'inherit'}}>
            {snapshot.effectiveType ?? '?'}
          </span>
        </Stat>
        <Stat label="type">{snapshot.type ?? '?'}</Stat>
        <Stat label="downlink">
          {snapshot.downlink !== undefined ? `${snapshot.downlink.toFixed(1)} Mbps` : '?'}
        </Stat>
        <Stat label="rtt">
          {snapshot.rtt !== undefined ? `${snapshot.rtt} ms` : '?'}
        </Stat>
        <Stat label="save-data hint">
          <span
            style={{
              color: snapshot.saveData
                ? 'var(--color-status-newly)'
                : 'var(--color-status-supported)',
            }}
          >
            {snapshot.saveData ? 'on (reduce!)' : 'off'}
          </span>
        </Stat>
        <Stat label="downlink max">
          {snapshot.downlinkMax !== undefined && Number.isFinite(snapshot.downlinkMax)
            ? `${snapshot.downlinkMax} Mbps`
            : '∞'}
        </Stat>
      </div>

      <p className="text-[10px] text-[var(--color-muted)]">
        Common pattern: switch to lower-res images, defer non-critical fetches, or skip auto-play
        video when <code>saveData</code> is true or <code>effectiveType</code> is 2g / slow-2g.
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
  bcdKey: 'api.NetworkInformation',
  title: 'Network Information',
  Demo: NetworkInformationDemo,
  snippet: `const conn = navigator.connection

console.log(conn.effectiveType)  // 'slow-2g' | '2g' | '3g' | '4g'
console.log(conn.downlink)       // Mbps, approximate
console.log(conn.rtt)            // ms, approximate
console.log(conn.saveData)       // user toggled Save-Data

// React to changes (cell ↔ wifi, signal change)
conn.addEventListener('change', () => {
  if (conn.saveData || conn.effectiveType === '2g') {
    useTinyAssets()
  } else {
    useFullAssets()
  }
})

// HTTP Save-Data header counterpart for server-side decisions
// Header is sent automatically when the toggle is on:
// Save-Data: on`,
  notes: 'Chrome / Edge / Opera ship this; Firefox and Safari refuse on privacy grounds (fingerprinting). The Save-Data header is the universally-supported alternative.',
}
