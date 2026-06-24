import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame} from './_ui'

const PERMISSIONS = [
  'geolocation',
  'notifications',
  'camera',
  'microphone',
  'clipboard-read',
  'clipboard-write',
  'persistent-storage',
  'midi',
  'background-sync',
  'screen-wake-lock',
  'storage-access',
  'window-management',
  'idle-detection',
] as const

type Status = PermissionStatus['state'] | 'unavailable' | 'pending'

interface PermissionState {
  state: Status
  error?: string
}

const STATE_COLOR: Record<string, string> = {
  granted: 'var(--color-status-supported)',
  denied: 'var(--color-status-unsupported)',
  prompt: 'var(--color-status-newly)',
  unavailable: 'var(--color-muted)',
  pending: 'var(--color-muted)',
}

function PermissionsDemo() {
  const supported = typeof navigator !== 'undefined' && 'permissions' in navigator

  const [states, setStates] = useState<Record<string, PermissionState>>({})

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    const cleanups: Array<() => void> = []

    const queryAll = async () => {
      for (const name of PERMISSIONS) {
        try {
          const status = await navigator.permissions.query({name} as PermissionDescriptor)
          if (cancelled) return
          setStates((s) => ({...s, [name]: {state: status.state}}))
          const onChange = () => setStates((s) => ({...s, [name]: {state: status.state}}))
          status.addEventListener('change', onChange)
          cleanups.push(() => status.removeEventListener('change', onChange))
        } catch (e) {
          if (cancelled) return
          setStates((s) => ({...s, [name]: {state: 'unavailable', error: (e as Error).message}}))
        }
      }
    }

    queryAll()
    return () => {
      cancelled = true
      cleanups.forEach((c) => c())
    }
  }, [supported])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          navigator.permissions not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <p className="text-[10px] text-[var(--color-muted)]">
        Each row queried at mount. The state updates live if you grant or revoke a permission in
        browser settings — no reload needed.
      </p>
      <ul className="grid grid-cols-2 gap-1.5">
        {PERMISSIONS.map((name) => {
          const s = states[name] ?? {state: 'pending'}
          return (
            <li
              key={name}
              className="flex items-center justify-between gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-xs"
              title={s.error ?? `permission: ${name}`}
            >
              <span className="truncate font-mono text-[11px]">{name}</span>
              <span
                className="rounded-full px-1.5 py-0.5 font-mono text-[10px]"
                style={{
                  background: `${STATE_COLOR[s.state] ?? STATE_COLOR.unavailable}1a`,
                  color: STATE_COLOR[s.state] ?? STATE_COLOR.unavailable,
                }}
              >
                {s.state}
              </span>
            </li>
          )
        })}
      </ul>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Permissions',
  title: 'Permissions',
  Demo: PermissionsDemo,
  snippet: `// Check before asking
const status = await navigator.permissions.query({name: 'geolocation'})
console.log(status.state)        // 'granted' | 'denied' | 'prompt'

// React when the user changes the answer in browser settings
status.addEventListener('change', () => {
  if (status.state === 'granted') hydrateLocation()
  if (status.state === 'denied')  showFallback()
})

// Some permissions need extra parameters
await navigator.permissions.query({
  name: 'camera',
  // panTiltZoom: true   // PTZ subset
})`,
  notes: "The 'state' field doesn't grant anything — just observes. To actually request, call the underlying API (Notification.requestPermission, getUserMedia, etc.).",
}
