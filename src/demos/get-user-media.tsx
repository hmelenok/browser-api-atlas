import {Camera, CameraOff, Image} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

function GetUserMediaDemo() {
  const supported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    typeof navigator.mediaDevices.getUserMedia === 'function'

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [snap, setSnap] = useState('')
  const [error, setError] = useState('')
  const [resolution, setResolution] = useState('')

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), [])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {width: {ideal: 640}, height: {ideal: 480}, facingMode: 'user'},
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      const [track] = stream.getVideoTracks()
      const s = track.getSettings()
      setResolution(`${s.width ?? '?'}×${s.height ?? '?'} @${Math.round(s.frameRate ?? 0)}fps`)
      track.addEventListener('ended', stop)
      setActive(true)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
    setResolution('')
  }

  const takeSnap = () => {
    if (!videoRef.current) return
    const v = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d')?.drawImage(v, 0, 0)
    setSnap(canvas.toDataURL('image/jpeg', 0.85))
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          getUserMedia not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        {!active ? (
          <DemoButton onClick={start}>
            <Camera size={12} />
            start camera
          </DemoButton>
        ) : (
          <>
            <DemoButton onClick={takeSnap}>
              <Image size={12} />
              snapshot
            </DemoButton>
            <DemoButton variant="danger" onClick={stop}>
              <CameraOff size={12} />
              stop
            </DemoButton>
          </>
        )}
        {resolution && (
          <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)]">
            {resolution}
          </span>
        )}
      </DemoRow>

      <div className="relative overflow-hidden rounded border border-[var(--color-border)] bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full"
          style={{aspectRatio: '4 / 3', objectFit: 'cover'}}
        />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[11px] text-white/60">
            <Camera size={18} />
            <span>preview appears here</span>
          </div>
        )}
      </div>

      {snap && (
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            snapshot via canvas
          </p>
          <img
            src={snap}
            alt="snapshot"
            className="rounded border border-[var(--color-border)]"
            style={{maxHeight: 160}}
          />
        </div>
      )}

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Asks for camera permission. <code>facingMode: 'user'</code> picks the front camera on
        phones; use <code>'environment'</code> for the rear camera.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.MediaDevices.getUserMedia',
  title: 'getUserMedia',
  Demo: GetUserMediaDemo,
  snippet: `// Camera only
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width:  {ideal: 1920, max: 1920},
    height: {ideal: 1080, max: 1080},
    facingMode: 'environment',   // 'user' for front cam on phones
    frameRate: {ideal: 30},
  },
  audio: true,
})

videoEl.srcObject = stream

// Inspect what you actually got
const track = stream.getVideoTracks()[0]
console.log(track.getSettings())   // actual width/height/fps
console.log(track.getCapabilities()) // ranges the device supports

// Snapshot to a canvas → JPEG/PNG
const canvas = new OffscreenCanvas(track.getSettings().width, track.getSettings().height)
canvas.getContext('2d').drawImage(videoEl, 0, 0)
const blob = await canvas.convertToBlob({type: 'image/jpeg', quality: 0.9})

// Always stop tracks when done — the indicator stays on otherwise
stream.getTracks().forEach((t) => t.stop())`,
  notes: 'The constraint object is "ideal, not strict" by default — the browser picks the closest match. Use {exact: 1920} if you really need a specific resolution and are OK with NotAllowedError if unavailable.',
}
