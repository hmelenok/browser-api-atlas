import type {ElkNode} from 'elkjs/lib/elk.bundled.js'

import {CATEGORY_ORDER} from '@/data/categories'
import type {CategoryId} from '@/lib/types'

// elkjs is ~1.4MB (GWT-compiled Java) — lazy-load it on first layout.
let elkPromise: Promise<{layout: (g: ElkNode) => Promise<ElkNode>}> | null = null
function getElk() {
  if (!elkPromise) {
    elkPromise = import('elkjs/lib/elk.bundled.js').then(({default: ELK}) => new ELK())
  }
  return elkPromise
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 76

export interface LayoutInputNode {
  id: string
  category: CategoryId
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
      'elk.padding': '[top=44,left=20,bottom=20,right=20]',
      'elk.spacing.nodeNode': '14',
      'elk.aspectRatio': '1.6',
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
      'elk.layered.spacing.nodeNodeBetweenLayers': '120',
      'elk.spacing.nodeNode': '80',
      'elk.padding': '[top=40,left=40,bottom=40,right=40]',
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

/** Also expose category-group rectangles for rendering background "regions". */
export async function layoutWithGroups(
  nodes: LayoutInputNode[],
  edges: LayoutInputEdge[]
): Promise<{
  nodes: Record<string, {x: number; y: number}>
  groups: Array<{id: CategoryId; x: number; y: number; width: number; height: number}>
  width: number
  height: number
}> {
  const byCategory = new Map<CategoryId, LayoutInputNode[]>()
  for (const n of nodes) {
    const list = byCategory.get(n.category) ?? []
    list.push(n)
    byCategory.set(n.category, list)
  }

  const children: ElkNode[] = CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((cat) => ({
    id: `cat:${cat}`,
    layoutOptions: {
      'elk.algorithm': 'rectpacking',
      'elk.padding': '[top=44,left=20,bottom=20,right=20]',
      'elk.spacing.nodeNode': '14',
      'elk.aspectRatio': '1.4',
    },
    children: (byCategory.get(cat) ?? []).map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
  }))

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'rectpacking',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=40,left=40,bottom=40,right=40]',
      'elk.aspectRatio': '1.7',
    },
    children,
    edges: edges.map((e) => ({id: e.id, sources: [e.source], targets: [e.target]})),
  }

  const elk = await getElk()
  const result = await elk.layout(graph)
  const nodePositions: Record<string, {x: number; y: number}> = {}
  const groups: Array<{id: CategoryId; x: number; y: number; width: number; height: number}> = []

  for (const cat of result.children ?? []) {
    if (!cat.id.startsWith('cat:')) continue
    const catId = cat.id.slice('cat:'.length) as CategoryId
    const gx = cat.x ?? 0
    const gy = cat.y ?? 0
    groups.push({
      id: catId,
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
