/**
 * Core types for the Browser API Atlas.
 *
 * The catalog is built at build-time from @mdn/browser-compat-data + web-features
 * and slimmed down to just what the UI needs.
 */
import type {ComponentType, SVGProps} from 'react'

export type CategoryId =
  | 'storage'
  | 'network'
  | 'media-capture'
  | 'audio-video'
  | 'graphics'
  | 'sensors'
  | 'hardware'
  | 'identity'
  | 'platform-ui'
  | 'workers'
  | 'files'
  | 'observation'
  | 'frontier'

export type BaselineStatus = 'widely' | 'newly' | 'limited' | 'none' | 'unknown'

export type ApiStatusKind =
  | 'standard'
  | 'experimental'
  | 'deprecated'
  | 'non-standard'

/** Slim, build-time representation of one API node in the graph. */
export interface ApiEntry {
  /** BCD key, e.g. "api.Notification" — also the React Flow node id. */
  id: string
  /** Display name, e.g. "Notifications API" */
  title: string
  /** Category bucket for graph clustering */
  category: CategoryId
  /** Short, one-line description. Pulled from web-features when available. */
  description: string
  /** The runtime global to check for support, e.g. "Notification" or "navigator.storage" */
  runtimeKey: string
  /** Baseline status from web-features. */
  baseline: BaselineStatus
  /** Standards-track status from BCD. */
  status: ApiStatusKind
  /** MDN documentation URL. */
  mdnUrl?: string
  /** Specification URL. */
  specUrl?: string
  /** web-features id for the "Open in web-features" link. */
  webFeatureId?: string
  /** Year first widely available, if known (Baseline metric). */
  baselineYear?: number
  /** True iff this API has an interactive demo registered. */
  hasDemo: boolean
}

export interface Category {
  id: CategoryId
  title: string
  /** One-line, what this cluster is about. */
  blurb: string
  /** Tailwind/OKLCH color for the cluster accent. */
  color: string
  /** Icon component (Lucide). */
  icon: ComponentType<SVGProps<SVGSVGElement> & {size?: number}>
}

export interface CatalogRelationship {
  from: string
  to: string
  /** Human-readable label for the relationship. */
  label?: string
}

export interface Catalog {
  generatedAt: string
  bcdVersion: string
  webFeaturesVersion: string
  entries: ApiEntry[]
  relationships: CatalogRelationship[]
}

/** Runtime support evaluated client-side. */
export interface RuntimeStatus {
  /** API exists in the current browser. */
  supported: boolean
  /** Reason it's not supported, if known. */
  reason?: string
}

/** Demo module shape — one per src/demos/*.tsx file. */
export interface Demo {
  /** BCD key — must match a catalog entry id. */
  bcdKey: string
  /** Display title. May override the catalog title for the demo card. */
  title?: string
  /** The React component that renders the interactive demo. */
  Demo: ComponentType
  /** Code snippet shown in the detail panel. */
  snippet: string
  /** Optional short paragraph explaining what to look for. */
  notes?: string
}
