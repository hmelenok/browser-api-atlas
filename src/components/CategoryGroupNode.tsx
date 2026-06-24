import type {NodeProps} from '@xyflow/react'

import {CATEGORIES} from '@/data/categories'
import type {CategoryId} from '@/lib/types'

export interface CategoryGroupNodeData {
  categoryId: CategoryId
  count: number
}

/**
 * Parent container for a category in `category` sort mode. The actual API
 * nodes are children (via `parentId`); this node provides only the visual
 * grouping chrome — dashed border tinted with the category color and a small
 * label "tab" sticking out at the top-left.
 */
export function CategoryGroupNode({data}: NodeProps & {data: CategoryGroupNodeData}) {
  const cat = CATEGORIES[data.categoryId]
  const Icon = cat.icon

  return (
    <div
      className="pointer-events-none relative h-full w-full rounded-xl border-2 border-dashed"
      style={{
        borderColor: `${cat.color}55`,
        background: `${cat.color}08`,
      }}
    >
      {/* Label "tab" pinned to top-left of the container. pointer-events-auto
          so it can carry hover/click without enabling the entire container. */}
      <div
        className="pointer-events-auto absolute -top-3 left-3 inline-flex items-center gap-1.5 rounded-full border bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium shadow-[0_1px_0_0_var(--color-border)]"
        style={{borderColor: `${cat.color}66`}}
      >
        <Icon size={12} strokeWidth={2.2} style={{color: cat.color}} />
        <span>{cat.title}</span>
        <span className="rounded-full bg-[var(--color-bg-soft)] px-1.5 py-px font-mono text-[10px] text-[var(--color-muted)]">
          {data.count}
        </span>
      </div>
    </div>
  )
}
