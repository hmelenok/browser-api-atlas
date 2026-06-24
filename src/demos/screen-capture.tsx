import {MonitorOff, ScreenShare} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface TrackInfo {
  label: string
  displaySurface?: string
  width?: number
  height?: number
  frameRate?: number
}

function ScreenCaptureDemo() {
  const supported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [info, setInfo] = useState<TrackInfo | null>(null)
  const [error, setError] = useState('')

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), [])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {frameRate: 30},
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      const [track] = stream.getVideoTracks()
      const settings = track.getSettings() as {
        displaySurface?: string
        width?: number
        height?: number
        frameRate?: number
      }
      setInfo({
        label: track.label,
        displaySurface: settings.displaySurface,
        width: settings.width,
        height: settings.height,
        frameRate: settings.frameRate,
      })
      // Browser stops the stream when user clicks "Stop sharing" — listen for it
      track.addEventListener('ended', stop)
    } catch (e) {
      const err = e as Error
      if (err.name !== 'NotAllowedError') setError(err.message)
    }
  }

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setInfo(null)
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          getDisplayMedia not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        {!info ? (
          <DemoButton onClick={start}>
            <ScreenShare size={12} />
            share a screen / window / tab
          </DemoButton>
        ) : (
          <DemoButton variant="danger" onClick={stop}>
            <MonitorOff size={12} />
            stop sharing
          </DemoButton>
        )}
      </DemoRow>

      <div className="relative overflow-hidden rounded border border-[var(--color-border)] bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full"
          style={{aspectRatio: '16 / 9', objectFit: 'contain'}}
        />
        {!info && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[11px] text-white/60">
            <ScreenShare size={18} />
            <span>preview appears here</span>
          </div>
        )}
      </div>

      {info && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="surface">{info.displaySurface ?? '?'}</Stat>
          <Stat label="resolution">
            {info.width}×{info.height}
          </Stat>
          <Stat label="frame rate">
            {info.frameRate ? `${Math.round(info.frameRate)} fps` : '?'}
          </Stat>
          <Stat label="source">
            <span className="truncate" title={info.label}>
              {info.label.slice(0, 22) || '(unnamed)'}
            </span>
          </Stat>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        The browser shows its own picker — you choose Screen / Window / Tab. Stream is local;
        nothing leaves your machine.
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
  bcdKey: 'api.MediaDevices.getDisplayMedia',
  title: 'Screen Capture',
  Demo: ScreenCaptureDemo,
  snippet: `// Prompts the user to pick a screen, window, or tab to share
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {frameRate: {ideal: 30, max: 60}},
  audio: false,                       // tab-audio is supported in Chromium
})

videoEl.srcObject = stream

// What surface did the user share?
const [track] = stream.getVideoTracks()
console.log(track.getSettings().displaySurface)  // 'monitor' | 'window' | 'browser'

// User clicked "Stop sharing" in the browser chrome
track.addEventListener('ended', () => {
  console.log('user stopped sharing')
})

// Programmatic stop
stream.getTracks().forEach((t) => t.stop())`,
  notes: 'No way to bypass the picker — that\'s a deliberate browser-controlled trust boundary. Use it for screen recording, remote desktop, livestreaming, and "share your screen" patterns.',
}
