import {Pause, Play, Square} from 'lucide-react'
import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

function SpeechSynthesisDemo() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [text, setText] = useState('Hello from the Browser API Atlas — try changing the voice.')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState<string>('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [speaking, setSpeaking] = useState(false)

  // Voices populate asynchronously in some browsers
  useEffect(() => {
    if (!supported) return
    const update = () => {
      const v = speechSynthesis.getVoices()
      setVoices(v)
      // Prefer the user's locale, then English, then anything
      const preferred =
        v.find((x) => x.lang.startsWith(navigator.language.slice(0, 2))) ??
        v.find((x) => x.lang.startsWith('en')) ??
        v[0]
      if (preferred) setVoiceURI((cur) => cur || preferred.voiceURI)
    }
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [supported])

  // Watch the speech state
  useEffect(() => {
    if (!supported) return
    const i = setInterval(() => setSpeaking(speechSynthesis.speaking), 200)
    return () => clearInterval(i)
  }, [supported])

  const speak = () => {
    if (!supported) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const v = voices.find((x) => x.voiceURI === voiceURI)
    if (v) utterance.voice = v
    utterance.rate = rate
    utterance.pitch = pitch
    speechSynthesis.speak(utterance)
  }

  const pause = () => speechSynthesis.pause()
  const resume = () => speechSynthesis.resume()
  const stop = () => speechSynthesis.cancel()

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          speechSynthesis not available.
        </p>
      </DemoFrame>
    )
  }

  // Group voices by language for the picker
  const grouped = voices.reduce<Record<string, SpeechSynthesisVoice[]>>((acc, v) => {
    const k = v.lang
    acc[k] = acc[k] ?? []
    acc[k].push(v)
    return acc
  }, {})

  return (
    <DemoFrame>
      <DemoRow>
        <DemoInput value={text} onChange={(e) => setText(e.target.value)} />
      </DemoRow>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          voice ({voices.length} available)
        </p>
        <select
          value={voiceURI}
          onChange={(e) => setVoiceURI(e.target.value)}
          className="h-8 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-sm"
        >
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([lang, vs]) => (
              <optgroup key={lang} label={lang}>
                {vs.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} {v.default ? '(default)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            <span>rate</span>
            <span className="font-mono">{rate.toFixed(2)}×</span>
          </p>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>
        <div>
          <p className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
            <span>pitch</span>
            <span className="font-mono">{pitch.toFixed(2)}</span>
          </p>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>
      </div>

      <DemoRow>
        <DemoButton onClick={speak}>
          <Play size={12} />
          speak
        </DemoButton>
        <DemoButton variant="ghost" onClick={speaking ? pause : resume}>
          <Pause size={12} />
          pause / resume
        </DemoButton>
        <DemoButton variant="danger" onClick={stop}>
          <Square size={12} />
          stop
        </DemoButton>
      </DemoRow>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.SpeechSynthesis',
  title: 'Speech Synthesis',
  Demo: SpeechSynthesisDemo,
  snippet: `// "Make the browser say something"
const u = new SpeechSynthesisUtterance('Hello, world!')

// Pick a voice (voiceschanged fires when the list is ready)
const voices = speechSynthesis.getVoices()
u.voice = voices.find((v) => v.lang === 'en-GB' && v.name.includes('Daniel'))

// Tune the delivery
u.rate  = 1.1   // 0.1 – 10
u.pitch = 1.0   // 0 – 2
u.volume = 0.8  // 0 – 1

// Hooks fire as the utterance plays
u.onstart = () => console.log('started')
u.onend   = () => console.log('finished')
u.onboundary = (e) => console.log('word boundary at', e.charIndex)

speechSynthesis.speak(u)`,
  notes: 'Voice list and quality varies enormously by OS and browser. Chrome on Mac vs Chrome on Android shipping totally different voices is normal.',
}
