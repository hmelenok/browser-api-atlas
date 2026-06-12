import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {useEffect, useMemo, useState} from 'react'

import {ApiNode, type ApiNodeData} from './ApiNode'
import {CATEGORIES} from '@/data/categories'
import {layoutWithGroups} from '@/lib/layout'
import {useFilteredEntries, useStore} from '@/store'

const nodeTypes = {api: ApiNode}

function GraphInner() {
  const entries = useFilteredEntries()
  const allEntries = useStore((s) => s.entries)
  const relationships = useStore((s) => s.relationships)
  const runtime = useStore((s) => s.runtime)
  const select = useStore((s) => s.select)

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
      entries.map((e) => ({id: e.id, category: e.category})),
      visibleEdges.map((r, i) => ({id: `e${i}`, source: r.from, target: r.to}))
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
          draggable: false,
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

        // Fit after a frame so nodes are measured
        requestAnimationFrame(() => rf.fitView({padding: 0.1, duration: 400}))
      })
      .catch((err) => {
        console.error('Layout failed', err)
        setLayingOut(false)
      })

    return () => {
      cancelled = true
    }
  }, [entries, visibleEdges, runtime, rf])

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
      nodesDraggable={false}
      panOnScroll
      zoomOnDoubleClick={false}
      minZoom={0.15}
      maxZoom={2.5}
      proOptions={{hideAttribution: false}}
      fitView
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="var(--color-border)" />
      <Controls position="bottom-right" showInteractive={false} />
      <MiniMap
        position="top-right"
        zoomable
        pannable
        nodeStrokeWidth={0}
        maskColor="oklch(0% 0 0 / 0.05)"
        nodeColor={(node) => {
          const data = node.data as unknown as ApiNodeData | undefined
          if (!data?.entry) return 'var(--color-border)'
          return CATEGORIES[data.entry.category].color
        }}
      />

      {layingOut && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--color-muted)]">
          Laying out…
        </div>
      )}
    </ReactFlow>
  )
}

export function Graph() {
  return (
    <ReactFlowProvider>
      <GraphInner />
    </ReactFlowProvider>
  )
}
