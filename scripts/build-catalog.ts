/**
 * Build the slim API catalog by joining:
 *  - @mdn/browser-compat-data  → support tables, MDN URL, spec URL, status
 *  - web-features              → Baseline status, description
 *  - src/data/api-selection.ts → curated list of APIs to include
 *
 * Output: src/data/catalog.json
 *
 * Run with: npm run build:catalog
 */
import bcd from '@mdn/browser-compat-data'
import {features} from 'web-features'
import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {API_SELECTION} from '../src/data/api-selection.ts'
import {RELATIONSHIPS} from '../src/data/relationships.ts'
import type {ApiEntry, ApiStatusKind, BaselineStatus, Catalog} from '../src/lib/types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

/** Navigate a dotted path through the BCD tree. */
function bcdLookup(key: string): unknown {
  const parts = key.split('.')
  let cur: unknown = bcd as unknown
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return null
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

/** Find the web-features entry whose compat_features array contains this BCD key. */
function findWebFeature(bcdKey: string): [string, (typeof features)[string]] | null {
  for (const [id, feature] of Object.entries(features)) {
    const compatFeatures = (feature as {compat_features?: string[]}).compat_features ?? []
    if (compatFeatures.includes(bcdKey)) return [id, feature]
  }
  return null
}

function deriveTitle(bcdKey: string): string {
  const last = bcdKey.split('.').pop() ?? bcdKey
  return last
    .replace(/_static$/, '')
    .replace(/_/g, ' ')
    .replace(/\bapi\b/i, '')
    .trim()
}

interface CompatStatus {
  experimental?: boolean
  standard_track?: boolean
  deprecated?: boolean
}

interface CompatBlock {
  status?: CompatStatus
  mdn_url?: string
  spec_url?: string | string[]
  description?: string
}

function inferStatus(compat: CompatBlock | undefined): ApiStatusKind {
  const status = compat?.status
  if (!status) return 'standard'
  if (status.deprecated) return 'deprecated'
  if (status.standard_track === false) return 'non-standard'
  if (status.experimental) return 'experimental'
  return 'standard'
}

interface WfStatus {
  baseline?: 'high' | 'low' | false
  baseline_high_date?: string
  baseline_low_date?: string
}

function inferBaseline(wfStatus: WfStatus | undefined): {
  baseline: BaselineStatus
  year?: number
} {
  if (!wfStatus) return {baseline: 'unknown'}
  const b = wfStatus.baseline
  if (b === 'high') {
    const d = wfStatus.baseline_high_date
    return {baseline: 'widely', year: d ? +d.slice(0, 4) : undefined}
  }
  if (b === 'low') {
    const d = wfStatus.baseline_low_date
    return {baseline: 'newly', year: d ? +d.slice(0, 4) : undefined}
  }
  if (b === false) return {baseline: 'limited'}
  return {baseline: 'unknown'}
}

/** Scan src/demos/ for demo modules and return the set of BCD keys they cover. */
async function collectDemoKeys(): Promise<Set<string>> {
  const demosDir = path.join(ROOT, 'src', 'demos')
  const keys = new Set<string>()
  let files: string[]
  try {
    files = await fs.readdir(demosDir)
  } catch {
    return keys
  }
  for (const f of files) {
    if (!f.endsWith('.tsx') || f.startsWith('_')) continue
    const content = await fs.readFile(path.join(demosDir, f), 'utf8')
    const m = content.match(/bcdKey:\s*['"]([^'"]+)['"]/)
    if (m) keys.add(m[1])
  }
  return keys
}

async function main() {
  const demoKeys = await collectDemoKeys()
  const entries: ApiEntry[] = []
  const missing: string[] = []

  for (const sel of API_SELECTION) {
    const node = bcdLookup(sel.bcdKey) as
      | (Record<string, unknown> & {__compat?: CompatBlock})
      | null
    const compat = node?.__compat
    if (!compat) {
      missing.push(sel.bcdKey)
      continue
    }
    const wf = findWebFeature(sel.bcdKey)
    const wfStatus = (wf?.[1] as {status?: WfStatus} | undefined)?.status
    const baseline = inferBaseline(wfStatus)
    const description =
      (wf?.[1] as {description?: string} | undefined)?.description ?? compat.description ?? ''

    entries.push({
      id: sel.bcdKey,
      title: sel.title ?? deriveTitle(sel.bcdKey),
      category: sel.category,
      description: description.replace(/<[^>]*>/g, '').trim(),
      runtimeKey: sel.runtimeKey,
      baseline: baseline.baseline,
      baselineYear: baseline.year,
      status: inferStatus(compat),
      mdnUrl: compat.mdn_url,
      specUrl: Array.isArray(compat.spec_url) ? compat.spec_url[0] : compat.spec_url,
      webFeatureId: wf?.[0],
      hasDemo: demoKeys.has(sel.bcdKey),
    })
  }

  // Validate edges: both endpoints must be in the catalog
  const idSet = new Set(entries.map((e) => e.id))
  const skippedEdges: string[] = []
  const validRels = RELATIONSHIPS.filter((r) => {
    const ok = idSet.has(r.from) && idSet.has(r.to)
    if (!ok) skippedEdges.push(`${r.from} → ${r.to}`)
    return ok
  })

  // Read package versions for provenance
  const bcdPkg = JSON.parse(
    await fs.readFile(path.join(ROOT, 'node_modules/@mdn/browser-compat-data/package.json'), 'utf8')
  )
  const wfPkg = JSON.parse(
    await fs.readFile(path.join(ROOT, 'node_modules/web-features/package.json'), 'utf8')
  )

  const catalog: Catalog = {
    generatedAt: new Date().toISOString(),
    bcdVersion: bcdPkg.version,
    webFeaturesVersion: wfPkg.version,
    entries,
    relationships: validRels,
  }

  const outPath = path.join(ROOT, 'src/data/catalog.json')
  await fs.writeFile(outPath, JSON.stringify(catalog, null, 2) + '\n')

  console.log(`\n✓ wrote ${entries.length} entries, ${validRels.length} edges → src/data/catalog.json`)
  console.log(`  BCD ${bcdPkg.version} · web-features ${wfPkg.version}\n`)

  // Stats
  const byCategory = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {})
  console.log('  by category:')
  for (const [cat, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat.padEnd(16)} ${n}`)
  }

  const byBaseline = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.baseline] = (acc[e.baseline] || 0) + 1
    return acc
  }, {})
  console.log('\n  by Baseline status:')
  for (const [b, n] of Object.entries(byBaseline)) {
    console.log(`    ${b.padEnd(16)} ${n}`)
  }

  console.log(`\n  with demos: ${entries.filter((e) => e.hasDemo).length}/${entries.length}`)

  if (missing.length) {
    console.warn(`\n⚠ ${missing.length} selections had no BCD entry — check the keys:`)
    missing.forEach((k) => console.warn(`    ${k}`))
  }
  if (skippedEdges.length) {
    console.warn(`\n⚠ ${skippedEdges.length} edges skipped (missing endpoint):`)
    skippedEdges.forEach((e) => console.warn(`    ${e}`))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
