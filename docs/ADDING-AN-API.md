# Adding an API to the Atlas

This walk-through assumes you've already cloned the repo and run `npm install`.

## Step 1: Pick a BCD key

The atlas uses BCD (Browser Compatibility Data) keys as the canonical ID for every API. You can browse them at:

- [MDN's BCD repo](https://github.com/mdn/browser-compat-data/tree/main/api) &mdash; one folder per interface
- Or just look at the URL in an MDN article: `https://developer.mozilla.org/en-US/docs/Web/API/Notification` &rarr; key is `api.Notification`

The key is always dotted: `api.InterfaceName` for an interface, `api.InterfaceName.methodName` for a method.

## Step 2: Add to the selection list

Open [`src/data/api-selection.ts`](../src/data/api-selection.ts) and add a row:

```ts
{
  bcdKey:     'api.Notification',
  category:   'platform-ui',
  runtimeKey: 'window.Notification',  // dotted path for runtime feature detection
  title:      'Notifications',         // optional — auto-derived if omitted
},
```

The `runtimeKey` is what the runtime detector evaluates at load time to decide whether the user's browser supports the API. It's the dotted path you'd actually type at a console: `window.Notification`, `navigator.storage`, `document.startViewTransition`, etc.

## Step 3: Pick a category

Valid categories live in [`src/data/categories.ts`](../src/data/categories.ts):

```
storage | network | media-capture | audio-video | graphics |
sensors | hardware | identity | platform-ui | workers |
files | observation | frontier
```

If your API doesn't obviously belong anywhere &mdash; it's probably **frontier**. Frontier is for recent additions that fundamentally change how the web works (View Transitions, Speculation Rules, Popover, etc.).

## Step 4: Regenerate the catalog

```bash
npm run build:catalog
```

You should see your new entry in the stats output. The script pulls MDN URLs, Baseline status, and spec links automatically from `@mdn/browser-compat-data` and `web-features`.

If you see a warning like `No BCD entry for api.SomethingThatDoesNotExist`, double-check the key. Common gotchas:

- Some APIs are nested under interfaces: `api.Window.localStorage`, not `api.localStorage`
- Static methods get a `_static` suffix: `api.AbortSignal.timeout_static`
- For "events on an interface", BCD uses `api.Window.error_event`

## Step 5 (optional but encouraged): Add a demo

Drop a file in [`src/demos/`](../src/demos/) following this template:

```tsx
import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

function MyDemo() {
  const [result, setResult] = useState<string>('')

  // Demo logic here…

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={() => setResult('done!')}>do it</DemoButton>
      </DemoRow>
      {result && <pre className="font-mono text-xs">{result}</pre>}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.YourBcdKey', // must match the key you added in step 2
  title: 'Friendly title (optional override)',
  Demo: MyDemo,
  snippet: `// The code shown in the snippet section
do.something()`,
  notes: 'Optional one-paragraph context.', // shown under the demo
}
```

The demo registry is auto-discovered via Vite's `import.meta.glob` &mdash; **no registration step**. Just drop the file in `src/demos/`.

## Step 6: Add relationships (optional)

If your new API is closely related to other catalog entries, add an edge in [`src/data/relationships.ts`](../src/data/relationships.ts):

```ts
{from: 'api.AbortController', to: 'api.YourBcdKey', label: 'abort signal'}
```

Edges show as lines between nodes in the graph. Keep them tasteful &mdash; only add an edge when the relationship is genuinely useful for a learner.

## Step 7: Test

```bash
npm run build:catalog
npm run typecheck
npm run dev
```

Open the dev server, search for your API, click the node, and try the demo. Everything works? &nbsp;&#x2728; Ship it.

## Tips for great demos

- **One concept per demo.** Don't try to show everything an API can do &mdash; pick the most illustrative slice.
- **Real-time feedback.** Buttons should produce visible output immediately.
- **Don't pollute storage.** Namespace anything you persist with `atlas-demo-…` prefixes.
- **Handle the "not supported" path.** If the API isn't available in the visitor's browser, show a friendly fallback rather than throwing &mdash; the `DemoBoundary` will catch raw throws, but a custom message reads nicer.
- **Pair with the snippet.** The code in `snippet` should illustrate the same thing the user just clicked through.
