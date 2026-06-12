const ITEMS: Array<{color: string; label: string}> = [
  {color: 'var(--color-status-supported)', label: 'Baseline widely'},
  {color: 'var(--color-status-newly)', label: 'Newly baseline'},
  {color: 'var(--color-status-limited)', label: 'Limited'},
  {color: 'var(--color-status-experimental)', label: 'Experimental'},
  {color: 'var(--color-status-unsupported)', label: 'Not in your browser'},
]

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
      {ITEMS.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{background: i.color}} />
          {i.label}
        </span>
      ))}
    </div>
  )
}
