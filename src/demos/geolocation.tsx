import {Crosshair, MapPin} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface Pos {
  lat: number
  lng: number
  accuracy: number
  ts: number
  speed: number | null
  heading: number | null
}

function GeolocationDemo() {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [pos, setPos] = useState<Pos | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [watching, setWatching] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  const toPos = (p: GeolocationPosition): Pos => ({
    lat: p.coords.latitude,
    lng: p.coords.longitude,
    accuracy: p.coords.accuracy,
    ts: p.timestamp,
    speed: p.coords.speed,
    heading: p.coords.heading,
  })

  const getOnce = () => {
    setError('')
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos(toPos(p))
        setBusy(false)
      },
      (e) => {
        setError(`${e.code}: ${e.message}`)
        setBusy(false)
      },
      {enableHighAccuracy: true, timeout: 8000}
    )
  }

  const startWatching = () => {
    setError('')
    setWatching(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => setPos(toPos(p)),
      (e) => {
        setError(`${e.code}: ${e.message}`)
        setWatching(false)
      },
      {enableHighAccuracy: true}
    )
  }

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setWatching(false)
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          navigator.geolocation not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={getOnce} disabled={busy}>
          <MapPin size={12} />
          {busy ? 'requesting…' : 'get current position'}
        </DemoButton>
        <DemoButton
          variant={watching ? 'danger' : 'ghost'}
          onClick={watching ? stopWatching : startWatching}
        >
          <Crosshair size={12} />
          {watching ? 'stop watching' : 'watch position'}
        </DemoButton>
      </DemoRow>

      {pos && (
        <>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Stat label="latitude">{pos.lat.toFixed(6)}</Stat>
            <Stat label="longitude">{pos.lng.toFixed(6)}</Stat>
            <Stat label="accuracy">±{Math.round(pos.accuracy)} m</Stat>
            <Stat label="updated">
              {new Date(pos.ts).toLocaleTimeString([], {hour12: false})}
            </Stat>
            {pos.speed !== null && pos.speed !== undefined && (
              <Stat label="speed">{(pos.speed * 3.6).toFixed(1)} km/h</Stat>
            )}
            {pos.heading !== null && pos.heading !== undefined && (
              <Stat label="heading">{Math.round(pos.heading)}°</Stat>
            )}
          </div>

          <a
            href={`https://www.openstreetmap.org/?mlat=${pos.lat}&mlon=${pos.lng}#map=15/${pos.lat}/${pos.lng}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-block text-xs text-[var(--color-accent)] hover:underline"
          >
            See on OpenStreetMap →
          </a>
        </>
      )}

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        First call prompts for permission. <code>enableHighAccuracy: true</code> hits GPS on
        phones; without it you get the IP / Wi-Fi triangulation fallback.
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
  bcdKey: 'api.Geolocation',
  title: 'Geolocation',
  Demo: GeolocationDemo,
  snippet: `// One-shot position
navigator.geolocation.getCurrentPosition(
  (p) => {
    console.log(p.coords.latitude, p.coords.longitude)
    console.log('±', p.coords.accuracy, 'meters')
  },
  (err) => console.error(err.code, err.message),
  {enableHighAccuracy: true, timeout: 8000, maximumAge: 0},
)

// Continuous tracking
const id = navigator.geolocation.watchPosition(
  (p) => updateMarker(p.coords),
  null,
  {enableHighAccuracy: true},
)

// Stop the watch
navigator.geolocation.clearWatch(id)

// Check status without prompting
const status = await navigator.permissions.query({name: 'geolocation'})
if (status.state === 'denied') showFallback()`,
  notes: 'Requires HTTPS (or localhost) and a user gesture. Accuracy varies wildly — phone GPS gets to ~5m outside; laptop on Wi-Fi rarely better than 50m.',
}
