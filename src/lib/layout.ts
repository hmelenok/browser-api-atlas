import type {ElkNode} from 'elkjs/lib/elk.bundled.js'

import {CATEGORY_ORDER} from '@/data/categories'
import type {BaselineStatus, CategoryId} from '@/lib/types'
import type {SortMode} from '@/store'

// elkjs is ~1.4MB (GWT-compiled Java) — lazy-load it on first layout.
let elkPromise: Promise<{layout: (g: ElkNode) => Promise<ElkNode>}> | null = null
function getElk() {
  if (!elkPromise) {
    elkPromise = import('elkjs/lib/elk.bundled.js').then(({default: ELK}) => new ELK())
  }
  return elkPromise
}

const NODE_WIDTH = 240
const NODE_HEIGHT = 68

export interface LayoutInputNode {
  id: string
  category: CategoryId
  title: string
  baseline: BaselineStatus
  baselineYear?: number
}

export interface LayoutInputEdge {
  id: string
  source: string
  target: string
}

export interface LayoutResult {
  nodePositions: Record<string, {x: number; y: number}>
  width: number
  height: number
}

/**
 * Lay out nodes by category in a structured grid: each category becomes a
 * "compartment" with its nodes packed inside, and inter-category edges flow
 * through ELK's `layered` algorithm at the top level.
 *
 * This gives a map-like layout where clusters are obvious at a glance.
 */
export async function layoutGraph(
  nodes: LayoutInputNode[],
  edges: LayoutInputEdge[]
): Promise<LayoutResult> {
  // Group nodes by category
  const byCategory = new Map<CategoryId, LayoutInputNode[]>()
  for (const n of nodes) {
    const list = byCategory.get(n.category) ?? []
    list.push(n)
    byCategory.set(n.category, list)
  }

  // Build hierarchical ELK graph: root → category groups → API nodes
  const children: ElkNode[] = CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((cat) => ({
    id: `cat:${cat}`,
    layoutOptions: {
      'elk.algorithm': 'rectpacking',
      'elk.padding': '[top=20,left=12,bottom=12,right=12]',
      'elk.spacing.nodeNode': '10',
      'elk.aspectRatio': '1.3',
    },
    children: (byCategory.get(cat) ?? []).map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
  }))

  // Inter-group edges only (edges within a category we keep as visual links
  // but don't let them constrain the inner-category packing)
  const rootEdges = edges.map((e) => ({
    id: e.id,
    sources: [e.source],
    targets: [e.target],
  }))

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.layered.spacing.nodeNodeBetweenLayers': '60',
      'elk.spacing.nodeNode': '40',
      'elk.padding': '[top=20,left=20,bottom=20,right=20]',
      'elk.layered.crossingMinimization.semiInteractive': 'true',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    },
    children,
    edges: rootEdges,
  }

  const elk = await getElk()
  const result = await elk.layout(graph)
  const positions: Record<string, {x: number; y: number}> = {}

  function walk(node: ElkNode, ox = 0, oy = 0) {
    const x = (node.x ?? 0) + ox
    const y = (node.y ?? 0) + oy
    if (node.id && !node.id.startsWith('cat:') && node.id !== 'root') {
      positions[node.id] = {x, y}
    }
    for (const c of node.children ?? []) walk(c, x, y)
  }
  walk(result)

  return {
    nodePositions: positions,
    width: result.width ?? 1200,
    height: result.height ?? 800,
  }
}

/**
 * Group nodes for the layered ELK layout. Supports three sort modes:
 *  - 'category':   group by category (default visual cluster)
 *  - 'baseline':   group by Baseline status (Widely / Newly / Limited / Unknown)
 *                  with sub-sort by Baseline year within each group
 *  - 'alphabetic': group by leading letter for compact A-Z packing
 */
function makeGroups(nodes: LayoutInputNode[], mode: SortMode): Array<{id: string; nodes: LayoutInputNode[]}> {
  if (mode === 'baseline') {
    const order: BaselineStatus[] = ['widely', 'newly', 'limited', 'unknown', 'none']
    const bucket = new Map<BaselineStatus, LayoutInputNode[]>()
    for (const n of nodes) {
      const list = bucket.get(n.baseline) ?? []
      list.push(n)
      bucket.set(n.baseline, list)
    }
    return order
      .filter((b) => bucket.has(b))
      .map((b) => ({
        id: `b:${b}`,
        nodes: (bucket.get(b) ?? []).sort((a, x) => {
          // sort by year ascending, then alphabetically
          const ay = a.baselineYear ?? Number.MAX_SAFE_INTEGER
          const xy = x.baselineYear ?? Number.MAX_SAFE_INTEGER
          if (ay !== xy) return ay - xy
          return a.title.localeCompare(x.title)
        }),
      }))
  }

  if (mode === 'alphabetic') {
    const sorted = [...nodes].sort((a, b) => a.title.localeCompare(b.title))
    const bucket = new Map<string, LayoutInputNode[]>()
    for (const n of sorted) {
      const letter = (n.title[0] ?? '#').toUpperCase()
      // group digits/punctuation as '#'
      const key = /[A-Z]/.test(letter) ? letter : '#'
      const list = bucket.get(key) ?? []
      list.push(n)
      bucket.set(key, list)
    }
    return [...bucket.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, ns]) => ({id: `a:${letter}`, nodes: ns}))
  }

  // default: category
  const byCategory = new Map<CategoryId, LayoutInputNode[]>()
  for (const n of nodes) {
    const list = byCategory.get(n.category) ?? []
    list.push(n)
    byCategory.set(n.category, list)
  }
  return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
    id: `cat:${c}`,
    nodes: byCategory.get(c) ?? [],
  }))
}

/** Also expose group rectangles for rendering background "regions". */
export async function layoutWithGroups(
  nodes: LayoutInputNode[],
  edges: LayoutInputEdge[],
  sortMode: SortMode = 'category'
): Promise<{
  nodes: Record<string, {x: number; y: number}>
  groups: Array<{id: string; x: number; y: number; width: number; height: number}>
  width: number
  height: number
}> {
  const groupSpecs = makeGroups(nodes, sortMode)

  const children: ElkNode[] = groupSpecs.map((g) => ({
    id: g.id,
    layoutOptions: {
      'elk.algorithm': 'rectpacking',
      'elk.padding': '[top=20,left=12,bottom=12,right=12]',
      'elk.spacing.nodeNode': '10',
      'elk.aspectRatio': '1.3',
    },
    children: g.nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
  }))

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'rectpacking',
      'elk.spacing.nodeNode': '24',
      'elk.padding': '[top=20,left=20,bottom=20,right=20]',
      'elk.aspectRatio': String(typeof window !== 'undefined' ? Math.max(window.innerWidth / Math.max(window.innerHeight - 180, 400), 1) : 1.4),
    },
    children,
    edges: edges.map((e) => ({id: e.id, sources: [e.source], targets: [e.target]})),
  }

  const elk = await getElk()
  const result = await elk.layout(graph)
  const nodePositions: Record<string, {x: number; y: number}> = {}
  const groups: Array<{id: string; x: number; y: number; width: number; height: number}> = []

  for (const cat of result.children ?? []) {
    const gx = cat.x ?? 0
    const gy = cat.y ?? 0
    groups.push({
      id: cat.id,
      x: gx,
      y: gy,
      width: cat.width ?? 0,
      height: cat.height ?? 0,
    })
    for (const child of cat.children ?? []) {
      nodePositions[child.id] = {x: gx + (child.x ?? 0), y: gy + (child.y ?? 0)}
    }
  }

  return {
    nodes: nodePositions,
    groups,
    width: result.width ?? 1200,
    height: result.height ?? 800,
  }
}
