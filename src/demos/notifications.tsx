import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

const STATUS_COLOR: Record<NotificationPermission, string> = {
  default: 'var(--color-muted)',
  granted: 'var(--color-status-supported)',
  denied: 'var(--color-status-unsupported)',
}

function NotificationsDemo() {
  const supported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'default'
  )
  const [text, setText] = useState('Hi from the Browser API Atlas!')
  const [count, setCount] = useState(0)

  // Re-read permission when window regains focus (user may have changed it in settings)
  useEffect(() => {
    if (!supported) return
    const onFocus = () => setPermission(Notification.permission)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [supported])

  const request = async () => {
    if (!supported) return
    const next = await Notification.requestPermission()
    setPermission(next)
  }

  const fire = () => {
    if (!supported || permission !== 'granted') return
    new Notification('Browser API Atlas', {
      body: text,
      icon: '/browser-api-atlas/atlas.svg',
      tag: 'atlas-demo',
    })
    setCount((c) => c + 1)
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Notifications API not available in this browser.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          permission
        </span>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[11px]"
          style={{
            background: `${STATUS_COLOR[permission]}33`,
            color: STATUS_COLOR[permission],
          }}
        >
          {permission}
        </span>
        {permission !== 'granted' && permission !== 'denied' && (
          <DemoButton variant="ghost" onClick={request}>
            request permission
          </DemoButton>
        )}
      </DemoRow>

      <DemoRow>
        <DemoInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Notification body"
        />
        <DemoButton onClick={fire} disabled={permission !== 'granted'}>
          🔔 fire
        </DemoButton>
      </DemoRow>

      {count > 0 && (
        <p className="text-[11px] text-[var(--color-muted)]">
          Fired{' '}
          <span className="font-mono font-medium text-[var(--color-fg)]">{count}</span>{' '}
          {count === 1 ? 'notification' : 'notifications'} this session
        </p>
      )}
      {permission === 'denied' && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">
          Denied — re-enable in the browser's site settings if you change your mind.
        </p>
      )}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Notification',
  title: 'Notifications',
  Demo: NotificationsDemo,
  snippet: `// 1. Request permission (user gesture required)
const granted = await Notification.requestPermission()
if (granted !== 'granted') return

// 2. Fire one
const n = new Notification('Build complete', {
  body: '12 files changed, 0 errors',
  icon: '/build-icon.png',
  tag: 'build',   // replaces prior notifs with same tag
})

n.onclick = () => {
  window.focus()
  n.close()
}`,
  notes: 'Service-worker-side variant: registration.showNotification() — required for persistent + action buttons.',
}
