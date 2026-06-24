import {cn} from '@/lib/cn'
import type {ReactNode} from 'react'

/** Visual frame for demo content. */
export function DemoFrame({children}: {children: ReactNode}) {
  return (
    <div className="space-y-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-3">
      {children}
    </div>
  )
}

export function DemoRow({children, className}: {children: ReactNode; className?: string}) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
}

export function DemoInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-8 flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)]',
        'px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
        props.className
      )}
    />
  )
}

export function DemoButton({
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'ghost' | 'danger'}) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded border px-3 text-sm font-medium transition',
        variant === 'primary' &&
          'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20',
        variant === 'ghost' &&
          'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-fg)]',
        variant === 'danger' &&
          'border-[var(--color-status-unsupported)]/40 text-[var(--color-status-unsupported)] hover:bg-[var(--color-status-unsupported)]/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
        props.className
      )}
    />
  )
}

export function DemoOutput({children}: {children: ReactNode}) {
  return (
    <pre className="max-h-40 overflow-y-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 font-mono text-xs leading-relaxed text-[var(--color-muted)]">
      {children}
    </pre>
  )
}

export function DemoKeyValue({pairs}: {pairs: Array<readonly [string, string]>}) {
  if (pairs.length === 0) {
    return (
      <p className="text-xs italic text-[var(--color-muted)]">(empty)</p>
    )
  }
  return (
    <ul className="space-y-1 text-xs">
      {pairs.map(([k, v]) => (
        <li key={k} className="flex gap-2 font-mono">
          <span className="text-[var(--color-muted)]">{k}</span>
          <span className="text-[var(--color-muted)]">=</span>
          <span className="truncate">{v}</span>
        </li>
      ))}
    </ul>
  )
}
