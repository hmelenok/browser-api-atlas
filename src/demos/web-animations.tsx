import {Pause, Play, RotateCcw} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const PRESETS = [
  {
    name: 'bounce',
    keyframes: [
      {transform: 'translateY(0)', easing: 'cubic-bezier(.2, 1, .3, 1)'},
      {transform: 'translateY(-40px)', offset: 0.5},
      {transform: 'translateY(0)'},
    ],
  },
  {
    name: 'spin',
    keyframes: [{transform: 'rotate(0)'}, {transform: 'rotate(360deg)'}],
  },
  {
    name: 'pulse',
    keyframes: [
      {transform: 'scale(1)', opacity: 1},
      {transform: 'scale(1.4)', opacity: 0.4, offset: 0.5},
      {transform: 'scale(1)', opacity: 1},
    ],
  },
  {
    name: 'shake',
    keyframes: [
      {transform: 'translateX(0)'},
      {transform: 'translateX(-8px)', offset: 0.25},
      {transform: 'translateX(8px)', offset: 0.75},
      {transform: 'translateX(0)'},
    ],
  },
] as const

function WebAnimationsDemo() {
  const boxRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const [preset, setPreset] = useState<(typeof PRESETS)[number]['name']>('bounce')
  const [duration, setDuration] = useState(600)
  const [iterations, setIterations] = useState<number | 'Infinity'>(1)
  const [playing, setPlaying] = useState(false)

  // Clean up on unmount
  useEffect(() => () => animationRef.current?.cancel(), [])

  const play = () => {
    if (!boxRef.current) return
    animationRef.current?.cancel()

    const k = (PRESETS.find((p) => p.name === preset)?.keyframes ?? []) as unknown as Keyframe[]
    const anim = boxRef.current.animate(k, {
      duration,
      iterations: iterations === 'Infinity' ? Infinity : iterations,
      easing: 'ease-out',
      fill: 'none',
    })
    animationRef.current = anim
    setPlaying(true)
    anim.finished.then(() => setPlaying(false)).catch(() => setPlaying(false))
  }

  const pause = () => {
    animationRef.current?.pause()
    setPlaying(false)
  }

  const resume = () => {
    animationRef.current?.play()
    setPlaying(true)
  }

  const reset = () => {
    animationRef.current?.cancel()
    setPlaying(false)
  }

  return (
    <DemoFrame>
      <DemoRow>
        {PRESETS.map((p) => (
          <DemoButton
            key={p.name}
            variant={preset === p.name ? 'primary' : 'ghost'}
            onClick={() => setPreset(p.name)}
          >
            {p.name}
          </DemoButton>
        ))}
      </DemoRow>

      <div className="flex h-32 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div
          ref={boxRef}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl"
        >
          ✨
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            <span>duration</span>
            <span className="font-mono">{duration}ms</span>
          </p>
          <input
            type="range"
            min={100}
            max={3000}
            step={50}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">iterations</p>
          <DemoRow>
            {[1, 3, 'Infinity' as const].map((it) => (
              <DemoButton
                key={String(it)}
                variant={iterations === it ? 'primary' : 'ghost'}
                onClick={() => setIterations(it)}
              >
                {String(it)}
              </DemoButton>
            ))}
          </DemoRow>
        </div>
      </div>

      <DemoRow>
        <DemoButton onClick={playing ? pause : animationRef.current ? resume : play}>
          {playing ? <Pause size={12} /> : <Play size={12} />}
          {playing ? 'pause' : animationRef.current ? 'resume' : 'play'}
        </DemoButton>
        <DemoButton variant="ghost" onClick={reset}>
          <RotateCcw size={12} />
          reset
        </DemoButton>
        {!playing && (
          <DemoButton variant="ghost" onClick={play}>
            new run
          </DemoButton>
        )}
      </DemoRow>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Animation',
  title: 'Web Animations',
  Demo: WebAnimationsDemo,
  snippet: `// Imperatively animate any element \u2014 no CSS keyframes file needed
const anim = el.animate(
  [
    {transform: 'translateY(0)'},
    {transform: 'translateY(-40px)', offset: 0.5},
    {transform: 'translateY(0)'},
  ],
  {
    duration: 600,
    iterations: Infinity,
    easing: 'cubic-bezier(.2, 1, .3, 1)',
  },
)

// Control the playback
anim.pause()
anim.play()
anim.currentTime = 200    // scrub to 200ms
anim.playbackRate = 2     // 2x speed
anim.cancel()

// Wait for completion
await anim.finished`,
  notes: 'Same engine as CSS animations but driven from JS. Pairs with the View Transitions API for orchestrated state-change animations.',
}
