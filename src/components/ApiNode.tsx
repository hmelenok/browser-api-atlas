import {Handle, Position, type NodeProps} from '@xyflow/react'
import {Sparkles} from 'lucide-react'

import {CATEGORIES} from '@/data/categories'
import type {ApiEntry, RuntimeStatus} from '@/lib/types'
import {resolveStatus} from '@/lib/status'
import {cn} from '@/lib/cn'

export interface ApiNodeData {
  entry: ApiEntry
  runtime?: RuntimeStatus
  selected?: boolean
}

export function ApiNode({data, selected}: NodeProps & {data: ApiNodeData}) {
  const {entry, runtime} = data
  const status = resolveStatus(entry, runtime)
  const cat = CATEGORIES[entry.category]

  return (
    <div
      className={cn(
        'group relative w-[220px] rounded-lg border bg-[var(--color-bg)] px-3 py-2.5 text-left transition',
        'shadow-[0_1px_0_0_var(--color-border)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]',
        selected
          ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40'
          : 'border-[var(--color-border)]'
      )}
      style={{
        // category accent strip on the left
        boxShadow: selected ? undefined : `inset 3px 0 0 0 ${cat.color}`,
      }}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-[var(--color-border)]" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-[var(--color-border)]" />

      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2 rounded-full"
          style={{background: status.color}}
          aria-label={status.label}
          title={status.label}
        />
        <h3 className="truncate text-sm font-medium leading-none">{entry.title}</h3>
        {entry.hasDemo && (
          <span title="Has interactive demo" className="ml-auto">
            <Sparkles size={12} className="opacity-60" />
          </span>
        )}
      </div>

      <p className="mt-1.5 line-clamp-2 text-xs text-[var(--color-muted)]">
        {entry.description || cat.title}
      </p>

      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
        <span className="opacity-60">{cat.title}</span>
        <span className="opacity-30">·</span>
        <span style={{color: status.color}}>{status.label}</span>
      </div>
    </div>
  )
}
