import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame, DemoInput, DemoRow} from './_ui'

interface TemporalPlainDate {
  toString(): string
  add(opts: {days?: number; months?: number; years?: number}): TemporalPlainDate
  until(other: TemporalPlainDate): {days: number; toString(): string}
  dayOfWeek: number
}

interface TemporalGlobal {
  Now: {
    instant(): {toString(): string; epochMilliseconds: number}
    zonedDateTimeISO(tz?: string): {
      toString(): string
      toLocaleString(locale?: string, opts?: object): string
    }
  }
  PlainDate: {from(s: string | object): TemporalPlainDate}
  Duration: {from(s: string): {toString(): string}}
}

function getTemporal(): TemporalGlobal | null {
  return (window as unknown as {Temporal?: TemporalGlobal}).Temporal ?? null
}

const TIMEZONES = ['UTC', 'America/Los_Angeles', 'Europe/London', 'Europe/Kyiv', 'Asia/Tokyo']
const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function TemporalDemo() {
  const T = getTemporal()
  const [date, setDate] = useState('2026-06-15')
  const [duration, setDuration] = useState('P3M14D')

  if (!T) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          Temporal not available. Chrome 138+ (behind flag #experimental-web-platform-features).
        </p>
      </DemoFrame>
    )
  }

  let parsed: TemporalPlainDate | null = null
  let parseError = ''
  let added = ''
  try {
    parsed = T.PlainDate.from(date)
    const dur = T.Duration.from(duration)
    if (parsed) added = parsed.add({days: 0}).toString() // ensure no exception
    if (dur && parsed) {
      const d = T.PlainDate.from(date).add({
        years: 0,
        months: parseInt(duration.match(/(\d+)M/)?.[1] ?? '0', 10),
        days: parseInt(duration.match(/(\d+)D/)?.[1] ?? '0', 10),
      })
      added = d.toString()
    }
  } catch (e) {
    parseError = (e as Error).message
  }

  return (
    <DemoFrame>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          Time across the world (Temporal.Now.zonedDateTimeISO)
        </p>
        <ul className="space-y-0.5 font-mono text-[11px]">
          {TIMEZONES.map((tz) => (
            <li key={tz} className="flex gap-2">
              <span className="w-44 text-[var(--color-muted)]">{tz}</span>
              <span>
                {T.Now.zonedDateTimeISO(tz).toLocaleString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          Plain dates + Durations
        </p>
        <DemoRow>
          <DemoInput value={date} onChange={(e) => setDate(e.target.value)} className="!flex-[0_0_8rem]" />
          <span className="text-xs text-[var(--color-muted)]">+</span>
          <DemoInput
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="ISO 8601 duration"
          />
          <span className="text-xs text-[var(--color-muted)]">=</span>
          <code className="font-mono text-xs">{parseError || added || '…'}</code>
        </DemoRow>
        {parsed && (
          <p className="mt-1 text-[10px] text-[var(--color-muted)]">
            That's a <span className="font-medium">{WEEKDAY[parsed.dayOfWeek - 1]}</span>.
          </p>
        )}
      </div>

      <p className="text-[10px] text-[var(--color-muted)]">
        Strings like <code>P3M14D</code> = "3 months 14 days" (ISO 8601 duration).
        Immutable, typed, time-zone aware — everything <code>Date</code> wasn't.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'javascript.builtins.Temporal',
  title: 'Temporal',
  Demo: TemporalDemo,
  snippet: `// "What time is it in Tokyo, in 3 months 14 days?"
const target = Temporal.PlainDate.from('2026-06-15')
  .add({months: 3, days: 14})
  .toString()
// '2026-09-29'

const now = Temporal.Now.zonedDateTimeISO('Asia/Tokyo')
// 2026-06-18T18:32:00.000+09:00[Asia/Tokyo]

// Durations between dates (no manual date math)
const a = Temporal.PlainDate.from('2024-01-01')
const b = Temporal.PlainDate.from('2026-06-18')
const diff = a.until(b, {largestUnit: 'years'})
// P2Y5M17D`,
  notes: 'TC39 Stage 4. Chrome behind --enable-experimental-web-platform-features. Immutable, typed, time-zone aware — finally a sane replacement for Date.',
}
