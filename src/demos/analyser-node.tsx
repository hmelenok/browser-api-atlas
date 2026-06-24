import {Pause, Play} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const WAVES: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle']

function AnalyserNodeDemo() {
  const supported = typeof window !== 'undefined' && 'AudioContext' in window

  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  const [playing, setPlaying] = useState(false)
  const [wave, setWave] = useState<OscillatorType>('sawtooth')
  const [freq, setFreq] = useState(220)

  // Draw loop
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const analyser = analyserRef.current
      if (!analyser) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      const bins = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(bins)

      const dpr = window.devicePixelRatio || 1
      const w = c.clientWidth
      const h = c.clientHeight
      if (c.width !== w * dpr || c.height !== h * dpr) {
        c.width = w * dpr
        c.height = h * dpr
        ctx.scale(dpr, dpr)
      }

      ctx.clearRect(0, 0, w, h)

      const barCount = 64
      const step = Math.floor(bins.length / barCount)
      const barWidth = w / barCount - 1

      for (let i = 0; i < barCount; i++) {
        const value = bins[i * step] ?? 0
        const barH = (value / 255) * h
        const hue = 220 - (value / 255) * 220
        ctx.fillStyle = `oklch(60% 0.18 ${hue})`
        ctx.fillRect(i * (barWidth + 1), h - barH, barWidth, barH)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Cleanup
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

  // Live tuning
  useEffect(() => {
    if (oscRef.current) oscRef.current.frequency.value = freq
  }, [freq])
  useEffect(() => {
    if (oscRef.current) oscRef.current.type = wave
  }, [wave])

  const start = async () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      osc.type = wave
      osc.frequency.value = freq
      gain.gain.value = 0.1

      // Patch: osc → gain → analyser → destination
      osc.connect(gain).connect(analyser).connect(ctx.destination)
      osc.start()
      ctxRef.current = ctx
      oscRef.current = osc
      gainRef.current = gain
      analyserRef.current = analyser
    } else if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume()
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
        <p className="text-xs text-[var(--color-status-unsupported)]">Web Audio not available.</p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <canvas
        ref={canvasRef}
        style={{width: '100%', height: 140}}
        className="rounded border border-[var(--color-border)] bg-[var(--color-bg)]"
      />

      <DemoRow>
        <DemoButton onClick={playing ? stop : start}>
          {playing ? <Pause size={12} /> : <Play size={12} />}
          {playing ? 'stop' : 'play'}
        </DemoButton>
        <span className="text-[11px] text-[var(--color-muted)]">
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
          <span>sweep frequency</span>
          <span className="font-mono">{freq} Hz</span>
        </p>
        <input
          type="range"
          min={80}
          max={4000}
          value={freq}
          onChange={(e) => setFreq(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <p className="text-[10px] text-[var(--color-muted)]">
        Watch how the bar position moves with the frequency slider. A sine wave shows one tall
        bar; a sawtooth shows that bar + harmonics fanning to the right.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.AnalyserNode',
  title: 'AnalyserNode',
  Demo: AnalyserNodeDemo,
  snippet: `// Insert an AnalyserNode anywhere in your audio graph
const analyser = ctx.createAnalyser()
analyser.fftSize = 512   // power-of-2, 32..32768

src.connect(analyser).connect(ctx.destination)

// Frequency-domain data (post-FFT) — 0..255 amplitude per bin
const freqBins = new Uint8Array(analyser.frequencyBinCount)
analyser.getByteFrequencyData(freqBins)

// Time-domain data (waveform) — same shape, different meaning
const wave = new Uint8Array(analyser.fftSize)
analyser.getByteTimeDomainData(wave)

// Drive it from a requestAnimationFrame loop and paint to canvas
function draw() {
  analyser.getByteFrequencyData(freqBins)
  // ...render bars...
  requestAnimationFrame(draw)
}`,
  notes: 'Zero-latency, no microphone permission needed when sourced from an oscillator or media element. Common pattern: ctx.createMediaElementSource(audio) → analyser → ctx.destination → visualizer.',
}
