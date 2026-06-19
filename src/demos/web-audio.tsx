import {Pause, Play} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const WAVES: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle']

function WebAudioDemo() {
  const [playing, setPlaying] = useState(false)
  const [freq, setFreq] = useState(440)
  const [volume, setVolume] = useState(0.15)
  const [wave, setWave] = useState<OscillatorType>('sine')

  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const supported = typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window)

  // Apply live changes
  useEffect(() => {
    if (oscRef.current) oscRef.current.frequency.value = freq
  }, [freq])

  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.02)
    }
  }, [volume])

  useEffect(() => {
    if (oscRef.current) oscRef.current.type = wave
  }, [wave])

  // Clean up
  useEffect(() => {
    return () => {
      try {
        oscRef.current?.stop()
        ctxRef.current?.close()
      } catch {
        /* already closed */
      }
    }
  }, [])

  const start = () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = wave
      osc.frequency.value = freq
      gain.gain.value = volume
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      ctxRef.current = ctx
      oscRef.current = osc
      gainRef.current = gain
    } else if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    setPlaying(true)
  }

  const stop = async () => {
    await ctxRef.current?.suspend()
    setPlaying(false)
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Web Audio not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={playing ? stop : start}>
          {playing ? <Pause size={12} /> : <Play size={12} />}
          {playing ? 'stop' : 'play'}
        </DemoButton>
        <span className="font-mono text-[11px] text-[var(--color-muted)]">
          {freq} Hz · {wave}
        </span>
      </DemoRow>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">waveform</p>
        <DemoRow>
          {WAVES.map((w) => (
            <DemoButton
              key={w}
              variant={wave === w ? 'primary' : 'ghost'}
              onClick={() => setWave(w)}
            >
              {w}
            </DemoButton>
          ))}
        </DemoRow>
      </div>

      <div>
        <p className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          <span>frequency</span>
          <span className="font-mono">{freq} Hz</span>
        </p>
        <input
          type="range"
          min={110}
          max={1760}
          value={freq}
          onChange={(e) => setFreq(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <div>
        <p className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          <span>volume</span>
          <span className="font-mono">{Math.round(volume * 100)}%</span>
        </p>
        <input
          type="range"
          min={0}
          max={50}
          value={volume * 100}
          onChange={(e) => setVolume(parseInt(e.target.value, 10) / 100)}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <p className="text-[10px] text-[var(--color-muted)]">
        ⚠️ Capped at 50% — Web Audio + your hardware can get loud.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.AudioContext',
  title: 'Web Audio',
  Demo: WebAudioDemo,
  snippet: `// Patch: oscillator → gain → speakers
const ctx = new AudioContext()

const osc = ctx.createOscillator()
osc.type = 'sine'
osc.frequency.value = 440          // A4

const gain = ctx.createGain()
gain.gain.value = 0.15             // 15%

osc.connect(gain).connect(ctx.destination)
osc.start()

// Modulate parameters smoothly without clicks
gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
setTimeout(() => osc.stop(), 200)`,
  notes: 'AudioContext creation must follow a user gesture (browsers block autoplay). Resume a suspended context with ctx.resume().',
}
