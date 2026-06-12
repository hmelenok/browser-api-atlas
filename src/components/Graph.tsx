import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import {Maximize2} from 'lucide-react'
import '@xyflow/react/dist/style.css'
import {useEffect, useMemo, useState} from 'react'

import {ApiNode, type ApiNodeData} from './ApiNode'
import {layoutWithGroups} from '@/lib/layout'
import {useFilteredEntries, useStore} from '@/store'

const nodeTypes = {api: ApiNode}

function GraphInner() {
  const entries = useFilteredEntries()
  const allEntries = useStore((s) => s.entries)
  const relationships = useStore((s) => s.relationships)
  const runtime = useStore((s) => s.runtime)
  const select = useStore((s) => s.select)
  const sortMode = useStore((s) => s.sortMode)

  const [layoutNodes, setLayoutNodes] = useState<Node[]>([])
  const [layoutEdges, setLayoutEdges] = useState<Edge[]>([])
  const [layingOut, setLayingOut] = useState(true)
  const rf = useReactFlow()

  // Edges: only those whose endpoints are in the filtered view
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(entries.map((e) => e.id))
    return relationships.filter((r) => visibleIds.has(r.from) && visibleIds.has(r.to))
  }, [entries, relationships])

  // Run ELK layout when the visible-node set changes
  useEffect(() => {
    let cancelled = false
    if (entries.length === 0) {
      setLayoutNodes([])
      setLayoutEdges([])
      setLayingOut(false)
      return
    }
    setLayingOut(true)

    layoutWithGroups(
      entries.map((e) => ({
        id: e.id,
        category: e.category,
        title: e.title,
        baseline: e.baseline,
        baselineYear: e.baselineYear,
      })),
      visibleEdges.map((r, i) => ({id: `e${i}`, source: r.from, target: r.to})),
      sortMode
    )
      .then(({nodes: positions}) => {
        if (cancelled) return

        const flowNodes: Node[] = entries.map((entry) => ({
          id: entry.id,
          type: 'api',
          position: positions[entry.id] ?? {x: 0, y: 0},
          data: {
            entry,
            runtime: runtime[entry.id],
          } satisfies ApiNodeData,
          draggable: true,
          selectable: true,
        }))

        const flowEdges: Edge[] = visibleEdges.map((r, i) => ({
          id: `e${i}-${r.from}-${r.to}`,
          source: r.from,
          target: r.to,
          label: r.label,
          type: 'simplebezier',
          labelStyle: {fontSize: 9, fill: 'var(--color-muted)'},
          labelBgStyle: {fill: 'var(--color-bg)'},
          labelBgPadding: [4, 2],
        }))

        setLayoutNodes(flowNodes)
        setLayoutEdges(flowEdges)
        setLayingOut(false)

        // Fit after a frame so nodes are measured. Cap maxZoom so the
        // initial view stays readable even with many nodes — users can
        // zoom out via the controls/minimap to see everything.
        requestAnimationFrame(() =>
          rf.fitView({padding: 0.15, duration: 400, maxZoom: 0.9, minZoom: 0.3})
        )
      })
      .catch((err) => {
        console.error('Layout failed', err)
        setLayingOut(false)
      })

    return () => {
      cancelled = true
    }
  }, [entries, visibleEdges, runtime, rf, sortMode])

  // Update runtime on existing nodes without re-laying-out
  useEffect(() => {
    setLayoutNodes((prev) =>
      prev.map((n) => {
        const entry = allEntries.find((e) => e.id === n.id)
        if (!entry) return n
        return {...n, data: {entry, runtime: runtime[n.id]} satisfies ApiNodeData}
      })
    )
  }, [runtime, allEntries])

  return (
    <ReactFlow
      nodes={layoutNodes}
      edges={layoutEdges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => select(node.id)}
      onPaneClick={() => select(null)}
      nodesConnectable={false}
      nodesDraggable
      panOnScroll
      zoomOnDoubleClick={false}
      minZoom={0.15}
      maxZoom={2.5}
      proOptions={{hideAttribution: false}}
      fitView
      fitViewOptions={{padding: 0.15, maxZoom: 0.9, minZoom: 0.3}}
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="var(--color-border)" />
      <Controls position="bottom-right" showInteractive={false}>
        <ControlButton
          onClick={() => rf.fitView({padding: 0.05, duration: 400, maxZoom: 1.5})}
          title="Fit everything in view"
        >
          <Maximize2 size={12} />
        </ControlButton>
      </Controls>

      {layingOut && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--color-muted)]">
          Laying out…
        </div>
      )}

      {!layingOut && entries.length === 0 && <EmptyState />}
    </ReactFlow>
  )
}

function EmptyState() {
  const resetFilters = useStore((s) => s.resetFilters)
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
      <div className="max-w-xs rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-soft)] px-6 py-5 text-center text-sm">
        <p className="font-medium">No APIs match your filters</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Toggle a category back on, clear the search, or relax the support filter.
        </p>
        <button
          type="button"
          onClick={resetFilters}
          className="mt-3 inline-flex h-7 items-center rounded-md border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2.5 text-xs font-medium text-[var(--color-accent)]"
        >
          Reset filters
        </button>
      </div>
    </div>
  )
}

export function Graph() {
  return (
    <ReactFlowProvider>
      <GraphInner />
    </ReactFlowProvider>
  )
}
