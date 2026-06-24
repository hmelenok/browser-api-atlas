import {Check, X} from 'lucide-react'
import {useMemo, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

const PRESETS = [
  {
    name: 'Posts',
    pattern: '/posts/:id',
    samples: ['/posts/42', '/posts/hello-world', '/posts/', '/posts/42/comments'],
  },
  {
    name: 'GitHub repo',
    pattern: 'https\\://github.com/:owner/:repo',
    samples: [
      'https://github.com/hmelenok/browser-api-atlas',
      'https://github.com/hmelenok',
      'https://gitlab.com/hmelenok/x',
    ],
  },
  {
    name: 'File path',
    pattern: '/files/:rest+',
    samples: ['/files/a/b/c.md', '/files/note.txt', '/files/'],
  },
]

interface PatternGlobal {
  new (init: string | {pathname?: string}): {
    exec(input: string | object): null | {
      pathname: {input: string; groups: Record<string, string | undefined>}
      hostname?: {input: string; groups: Record<string, string | undefined>}
      protocol?: {input: string; groups: Record<string, string | undefined>}
    }
  }
}

function getURLPattern(): PatternGlobal | null {
  return (window as unknown as {URLPattern?: PatternGlobal}).URLPattern ?? null
}

function URLPatternDemo() {
  const URLPattern = getURLPattern()
  const [pattern, setPattern] = useState(PRESETS[0].pattern)
  const [samples, setSamples] = useState<string[]>(PRESETS[0].samples)

  const results = useMemo(() => {
    if (!URLPattern) return []
    let p: ReturnType<typeof getURLPattern> extends null
      ? null
      : InstanceType<NonNullable<ReturnType<typeof getURLPattern>>>
    try {
      const isAbsolute = /^https?:\\?:\/\//.test(pattern) || pattern.includes('://')
      p = new URLPattern(isAbsolute ? pattern : {pathname: pattern})
    } catch (e) {
      return [{error: (e as Error).message}]
    }
    return samples.map((s) => {
      try {
        const isAbsoluteIn = /^https?:\/\//.test(s)
        const m = p!.exec(isAbsoluteIn ? s : {pathname: s})
        if (!m) return {input: s, matched: false}
        const groups: Record<string, string | undefined> = {
          ...(m.protocol?.groups ?? {}),
          ...(m.hostname?.groups ?? {}),
          ...(m.pathname?.groups ?? {}),
        }
        return {input: s, matched: true, groups}
      } catch (e) {
        return {input: s, error: (e as Error).message}
      }
    })
  }, [pattern, samples, URLPattern])

  if (!URLPattern) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          URLPattern not available. Chrome 95+, Safari 17+, Firefox 142+.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        {PRESETS.map((p) => (
          <DemoButton
            key={p.name}
            variant={pattern === p.pattern ? 'primary' : 'ghost'}
            onClick={() => {
              setPattern(p.pattern)
              setSamples(p.samples)
            }}
          >
            {p.name}
          </DemoButton>
        ))}
      </DemoRow>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          pattern
        </p>
        <DemoInput value={pattern} onChange={(e) => setPattern(e.target.value)} />
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          test inputs (one per line)
        </p>
        <textarea
          value={samples.join('\n')}
          onChange={(e) => setSamples(e.target.value.split('\n'))}
          rows={4}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-xs"
        />
      </div>

      <ul className="space-y-1">
        {results.map((r, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-xs"
          >
            {'error' in r ? (
              <>
                <X size={12} className="text-[var(--color-status-unsupported)]" />
                <span className="font-mono text-[var(--color-status-unsupported)]">
                  {r.error}
                </span>
              </>
            ) : r.matched ? (
              <>
                <Check size={12} className="text-[var(--color-status-supported)]" />
                <code className="font-mono">{r.input}</code>
                {r.groups && Object.keys(r.groups).length > 0 && (
                  <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)]">
                    {Object.entries(r.groups)
                      .filter(([, v]) => v !== undefined)
                      .map(([k, v]) => `${k}=${v}`)
                      .join('  ')}
                  </span>
                )}
              </>
            ) : (
              <>
                <X size={12} className="text-[var(--color-status-unsupported)]" />
                <code className="font-mono text-[var(--color-muted)]">{r.input}</code>
                <span className="ml-auto text-[10px] italic text-[var(--color-muted)]">
                  no match
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.URLPattern',
  title: 'URLPattern',
  Demo: URLPatternDemo,
  snippet: `// Same syntax as Express / React Router param strings
const pattern = new URLPattern({pathname: '/posts/:id'})

const result = pattern.exec({pathname: '/posts/42'})
result.pathname.groups.id   // '42'

// Match across the whole URL
const repo = new URLPattern('https://github.com/:owner/:repo')
const m = repo.exec('https://github.com/hmelenok/browser-api-atlas')
m.hostname.groups            // {}
m.pathname.groups            // {owner: 'hmelenok', repo: 'browser-api-atlas'}

// Modifiers: :rest+ (one or more), :rest* (zero or more), :rest? (optional)
new URLPattern({pathname: '/files/:rest+'})
  .exec({pathname: '/files/a/b/c.md'})
  .pathname.groups.rest        // 'a/b/c.md'`,
  notes: 'Powers the Navigation API\'s declarative routing. Cleaner than custom path-matching libraries — and standardized.',
}
