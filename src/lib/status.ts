import type {ApiEntry, BaselineStatus, RuntimeStatus} from './types'

export type NodeStatus =
  | 'supported-widely' // in our browser AND Baseline widely available
  | 'supported-newly' // in our browser AND Baseline newly available
  | 'supported-limited' // in our browser but limited Baseline
  | 'unsupported' // not in our browser
  | 'experimental' // experimental/non-standard
  | 'deprecated'
  | 'unknown'

export interface ResolvedStatus {
  kind: NodeStatus
  color: string
  label: string
}

export function resolveStatus(entry: ApiEntry, runtime: RuntimeStatus | undefined): ResolvedStatus {
  if (entry.status === 'deprecated') {
    return {kind: 'deprecated', color: 'var(--color-status-unknown)', label: 'Deprecated'}
  }
  if (entry.status === 'experimental' || entry.status === 'non-standard') {
    return {kind: 'experimental', color: 'var(--color-status-experimental)', label: 'Experimental'}
  }
  if (!runtime?.supported) {
    return {kind: 'unsupported', color: 'var(--color-status-unsupported)', label: 'Not in your browser'}
  }
  switch (entry.baseline) {
    case 'widely':
      return {
        kind: 'supported-widely',
        color: 'var(--color-status-supported)',
        label: entry.baselineYear ? `Baseline ${entry.baselineYear}` : 'Baseline · widely available',
      }
    case 'newly':
      return {
        kind: 'supported-newly',
        color: 'var(--color-status-newly)',
        label: entry.baselineYear ? `Newly Baseline ${entry.baselineYear}` : 'Newly Baseline',
      }
    case 'limited':
      return {kind: 'supported-limited', color: 'var(--color-status-limited)', label: 'Limited availability'}
    default:
      return {kind: 'unknown', color: 'var(--color-status-unknown)', label: 'Status unknown'}
  }
}

export const BASELINE_LABEL: Record<BaselineStatus, string> = {
  widely: 'Widely available',
  newly: 'Newly available',
  limited: 'Limited availability',
  none: 'Not available',
  unknown: 'Unknown',
}
