import {Download, Mic, Pause, Play, Square} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

type State = 'idle' | 'recording' | 'paused' | 'stopped'

function MediaRecorderDemo() {
  const supported =
    typeof window !== 'undefined' &&
    'MediaRecorder' in window &&
    'mediaDevices' in navigator

  const recRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [state, setState] = useState<State>('idle')
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [blobUrl, setBlobUrl] = useState('')
  const [error, setError] = useState('')

  // Timer
  useEffect(() => {
    if (state !== 'recording') return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [state])

  // Cleanup
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (blobUrl) URL.revokeObjectURL(blobUrl)
  }, [blobUrl])

  const start = async () => {
    setError('')
    setBlob(null)
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlobUrl('')
    chunksRef.current = []
    setSeconds(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const rec = new MediaRecorder(stream, {mimeType: mime})
      recRef.current = rec

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const out = new Blob(chunksRef.current, {type: mime})
        const url = URL.createObjectURL(out)
        setBlob(out)
        setBlobUrl(url)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setState('stopped')
      }
      rec.start(250) // emit chunks every 250ms
      setState('recording')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const togglePause = () => {
    if (state === 'recording') {
      recRef.current?.pause()
      setState('paused')
    } else if (state === 'paused') {
      recRef.current?.resume()
      setState('recording')
    }
  }

  const stop = () => {
    recRef.current?.stop()
  }

  const download = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `recording-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`
    a.click()
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          MediaRecorder not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        {state === 'idle' || state === 'stopped' ? (
          <DemoButton onClick={start}>
            <Mic size={12} />
            {state === 'stopped' ? 'record again' : 'record audio'}
          </DemoButton>
        ) : (
          <>
            <DemoButton variant="ghost" onClick={togglePause}>
              {state === 'paused' ? <Play size={12} /> : <Pause size={12} />}
              {state === 'paused' ? 'resume' : 'pause'}
            </DemoButton>
            <DemoButton variant="danger" onClick={stop}>
              <Square size={12} />
              stop
            </DemoButton>
          </>
        )}
        {(state === 'recording' || state === 'paused') && (
          <span
            className="ml-auto inline-flex items-center gap-1.5 font-mono text-xs"
            style={{
              color:
                state === 'recording'
                  ? 'var(--color-status-unsupported)'
                  : 'var(--color-muted)',
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{
                background:
                  state === 'recording'
                    ? 'var(--color-status-unsupported)'
                    : 'var(--color-muted)',
                animation: state === 'recording' ? 'pulse 1s infinite' : 'none',
              }}
            />
            {Math.floor(seconds / 60)
              .toString()
              .padStart(2, '0')}
            :{(seconds % 60).toString().padStart(2, '0')}
          </span>
        )}
      </DemoRow>

      {blob && blobUrl && (
        <>
          <audio
            src={blobUrl}
            controls
            className="w-full rounded"
            style={{filter: 'invert(0.85) hue-rotate(180deg)'}}
          />
          <DemoRow>
            <span className="text-[10px] text-[var(--color-muted)]">
              {blob.type} · {(blob.size / 1024).toFixed(1)} KB
            </span>
            <DemoButton variant="ghost" onClick={download}>
              <Download size={12} />
              download .webm
            </DemoButton>
          </DemoRow>
        </>
      )}

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Asks for mic permission. Recording stays local — nothing is uploaded.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.MediaRecorder',
  title: 'MediaRecorder',
  Demo: MediaRecorderDemo,
  snippet: `// Get a stream from mic / camera / screen
const stream = await navigator.mediaDevices.getUserMedia({audio: true})

// Pick a codec the browser supports
const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
  ? 'audio/webm;codecs=opus'
  : 'audio/webm'

const rec = new MediaRecorder(stream, {mimeType: mime, audioBitsPerSecond: 128_000})
const chunks = []

rec.ondataavailable = (e) => {
  if (e.data.size > 0) chunks.push(e.data)
  // … or upload e.data here for live streaming
}

rec.onstop = () => {
  const blob = new Blob(chunks, {type: mime})
  audioEl.src = URL.createObjectURL(blob)
}

rec.start(250)   // emit chunk every 250ms — enables live upload
rec.pause()
rec.resume()
rec.stop()       // triggers onstop`,
  notes: 'WebM/Opus is universal; if you need MP4 you usually have to transcode after. The chunk-emission interval (start(250)) is key for live upload — without it, you only get one big blob at stop().',
}
