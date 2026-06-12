import type {Demo} from '@/lib/types'

/**
 * Auto-discovery: any `src/demos/*.tsx` file exporting `const demo: Demo` is
 * picked up at build time and added to the registry, keyed by `demo.bcdKey`.
 *
 * Adding a new demo is therefore a single-file change — no registration step.
 */
type DemoModule = {demo?: Demo}
const modules = import.meta.glob<DemoModule>('./*.tsx', {eager: true})

export const demoRegistry: Map<string, Demo> = new Map()

for (const mod of Object.values(modules)) {
  // Some entry files might not export a demo (e.g. shared helpers). Skip those.
  const demo = mod?.demo
  if (!demo?.bcdKey) continue
  demoRegistry.set(demo.bcdKey, demo)
}

export function getDemo(bcdKey: string): Demo | undefined {
  return demoRegistry.get(bcdKey)
}

/** Used by status/UI code to know which BCD keys have demos available. */
export const DEMO_KEYS: ReadonlySet<string> = new Set(demoRegistry.keys())
