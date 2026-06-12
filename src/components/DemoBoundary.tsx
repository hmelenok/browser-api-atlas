import {Component, type ReactNode} from 'react'

interface Props {
  children: ReactNode
  apiTitle: string
}

interface State {
  err: Error | null
}

export class DemoBoundary extends Component<Props, State> {
  state: State = {err: null}

  static getDerivedStateFromError(err: Error): State {
    return {err}
  }

  componentDidCatch(err: Error) {
    // eslint-disable-next-line no-console
    console.error('[DemoBoundary]', this.props.apiTitle, err)
  }

  render() {
    if (this.state.err) {
      return (
        <div className="rounded-md border border-dashed border-[var(--color-status-unsupported)]/40 bg-[var(--color-status-unsupported)]/5 p-3 text-xs">
          <p className="font-medium text-[var(--color-status-unsupported)]">Demo crashed</p>
          <p className="mt-1 text-[var(--color-muted)]">
            <code className="font-mono">{this.state.err.message}</code>
          </p>
          <button
            type="button"
            onClick={() => this.setState({err: null})}
            className="mt-2 text-[var(--color-accent)] hover:underline"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
