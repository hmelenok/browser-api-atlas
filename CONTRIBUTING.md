# Contributing

Thanks for considering a contribution! The atlas is intentionally easy to extend &mdash; the goal is for community contributors to add demos and new APIs without needing to understand the whole stack.

## Three ways to help

### 1. Add a demo

Many catalog entries don't have demos yet. The detail panel shows "No interactive demo yet" with a "contribute one" link &mdash; that's the cue.

See **[docs/ADDING-AN-API.md](./docs/ADDING-AN-API.md)** for the full walkthrough. The TL;DR:

```tsx
// src/demos/notification.tsx
import type { Demo } from '@/lib/types'
import { DemoFrame, DemoButton } from './_ui'

function NotificationDemo() {
  return (
    <DemoFrame>
      <DemoButton onClick={() => new Notification('Hi!')}>fire notification</DemoButton>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.Notification',
  title: 'Notifications',
  Demo: NotificationDemo,
  snippet: `await Notification.requestPermission()\nnew Notification('Hi!')`,
}
```

Drop the file in `src/demos/`, run `npm run build:catalog && npm run dev`, and your demo appears in the graph.

### 2. Add an API to the catalog

Edit [`src/data/api-selection.ts`](./src/data/api-selection.ts) and add a row:

```ts
{ bcdKey: 'api.LockManager', category: 'workers', runtimeKey: 'navigator.locks', title: 'Web Locks' }
```

Then `npm run build:catalog`. The build script will pull MDN, Baseline, and spec data automatically.

### 3. Curate relationships

[`src/data/relationships.ts`](./src/data/relationships.ts) defines the edges between API nodes. Adding an edge highlights a useful conceptual link ("X is what unlocks Y").

Keep it tasteful &mdash; only add edges that genuinely help a learner. The graph becomes hard to read if everything connects to everything.

## Development setup

```bash
git clone https://github.com/hmelenok/browser-api-atlas.git
cd browser-api-atlas
npm install
npm run build:catalog
npm run dev
```

The dev server runs at `http://localhost:5173/browser-api-atlas/`.

## Conventions

- **Demos are tiny.** Each demo should fit on one screen of code. If you need substantial UI, factor reusable bits into `src/demos/_ui.tsx`.
- **Namespace anything you persist.** Storage demos prefix keys with `atlas-demo-…` so they don't collide with real apps.
- **Use real APIs, not polyfills.** The whole point is to surface real browser support &mdash; never paper over a missing API.
- **Be honest about failure.** If a demo can't run (e.g. requires HTTPS, secure context, a permission), show a friendly message instead of throwing.
- **TypeScript strict mode.** No `any`. No `@ts-ignore` &mdash; use `@ts-expect-error` with an explanation if absolutely needed.
- **Tailwind only.** No CSS modules / stylesheets. Use the theme tokens (`var(--color-fg)` etc.) so dark mode works.

## Code style

- 2-space indentation
- Single quotes for strings, no semicolons (Prettier defaults apply)
- File names: `kebab-case.tsx` for demos, `PascalCase.tsx` for components

## Reporting

If your browser shows an "&#x2728; APIs detected" banner with names that look new, click "Open a contribution issue with these &rarr;" &mdash; it pre-fills an issue with everything we need.

## Code of conduct

Be kind. Critique code, not people. Assume good intent.
