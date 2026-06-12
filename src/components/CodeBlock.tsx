import {useEffect, useState} from 'react'

interface HighlighterApi {
  codeToHtml: (code: string, opts: object) => string
}

let highlighterPromise: Promise<HighlighterApi> | null = null

async function getHighlighter() {
  if (highlighterPromise) return highlighterPromise
  highlighterPromise = (async () => {
    // Use the fine-grained core + JS regex engine so we don't drag in
    // the full WASM-backed `shiki` bundle (~7MB of language grammars).
    const [{createHighlighterCore}, {createJavaScriptRegexEngine}, light, dark, ts] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
      import('shiki/themes/github-light.mjs'),
      import('shiki/themes/github-dark.mjs'),
      import('shiki/langs/typescript.mjs'),
    ])
    const hl = await createHighlighterCore({
      themes: [light.default, dark.default],
      langs: [ts.default],
      engine: createJavaScriptRegexEngine(),
    })
    return {
      codeToHtml: (code: string, opts: object) => hl.codeToHtml(code, opts as Parameters<typeof hl.codeToHtml>[1]),
    }
  })()
  return highlighterPromise
}

export function CodeBlock({code, lang = 'typescript'}: {code: string; lang?: string}) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getHighlighter()
      .then((hl) =>
        hl.codeToHtml(code, {
          lang,
          themes: {light: 'github-light', dark: 'github-dark'},
          defaultColor: false,
        })
      )
      .then((out) => {
        if (!cancelled) setHtml(out)
      })
      .catch(() => {
        /* fall back to plain text */
      })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  if (!html) {
    return (
      <pre className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-3 font-mono text-[13px] leading-relaxed">
        {code}
      </pre>
    )
  }

  return (
    <div
      className="overflow-x-auto rounded-md border border-[var(--color-border)] [&_pre]:!bg-transparent [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-relaxed"
      dangerouslySetInnerHTML={{__html: html}}
    />
  )
}
