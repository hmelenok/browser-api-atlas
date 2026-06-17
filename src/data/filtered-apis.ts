/**
 * Registry of APIs we intentionally don't catalog but want to acknowledge
 * when a user searches for them. Each entry includes a category, a short
 * reason, and (where applicable) a pointer to the API in the atlas that
 * supersedes or covers the same use case.
 *
 * Surfaced by `<FilteredHint>` when the user's search has no graph matches
 * but does match one of these names.
 */

export type FilterReason =
  | 'legacy' // old API, replaced by a modern one
  | 'subtype' // sub-type of a catalogued parent
  | 'internal' // internal/result/payload type, not called directly
  | 'singleton' // constructor of a window-level singleton
  | 'abstract' // abstract base class
  | 'privacy-sandbox' // Privacy Sandbox / ad-tech
  | 'deprecated'
  | 'renamed' // spec rename — catalog uses the new name
  | 'vendor' // vendor-prefixed or vendor-only
  | 'niche' // niche / experimental / rarely used

export interface FilteredApi {
  /** Bare name as it appears at `window.X` or `navigator.x`. */
  name: string
  /** Why we skip it. */
  reason: FilterReason
  /** Short human-readable explanation. */
  why: string
  /** BCD key of an API in the catalog that covers the same domain. */
  alternative?: string
  /** Display name for the alternative. */
  alternativeTitle?: string
}

export const FILTERED_APIS: FilteredApi[] = [
  // ─── Legacy File / Directory Entries API ─────────────────────────────────
  {
    name: 'Directory',
    reason: 'legacy',
    why: 'Legacy Firefox API for the directory-upload extension to <input>. Modern equivalent uses the File System Access API.',
    alternative: 'api.FileSystemHandle',
    alternativeTitle: 'File System Access',
  },
  {
    name: 'FileSystem',
    reason: 'legacy',
    why: 'Legacy File and Directory Entries API (Chrome 8 / Firefox 50). Superseded by the modern File System Access API.',
    alternative: 'api.FileSystemHandle',
    alternativeTitle: 'File System Access',
  },
  {
    name: 'FileSystemEntry',
    reason: 'legacy',
    why: 'Legacy File and Directory Entries API. Modern File System Access API uses `FileSystemHandle` instead.',
    alternative: 'api.FileSystemHandle',
    alternativeTitle: 'File System Access',
  },
  {
    name: 'FileSystemFileEntry',
    reason: 'legacy',
    why: 'Legacy File and Directory Entries API. The modern counterpart is `FileSystemFileHandle`.',
    alternative: 'api.FileSystemFileHandle',
    alternativeTitle: 'FileSystemFileHandle',
  },
  {
    name: 'FileSystemDirectoryEntry',
    reason: 'legacy',
    why: 'Legacy File and Directory Entries API. The modern counterpart is `FileSystemDirectoryHandle`.',
    alternative: 'api.FileSystemDirectoryHandle',
    alternativeTitle: 'FileSystemDirectoryHandle',
  },
  {
    name: 'FileSystemDirectoryReader',
    reason: 'legacy',
    why: 'Legacy File and Directory Entries API. Replaced by async iteration on `FileSystemDirectoryHandle`.',
    alternative: 'api.FileSystemDirectoryHandle',
    alternativeTitle: 'FileSystemDirectoryHandle',
  },

  // ─── Renamed in spec ─────────────────────────────────────────────────────
  {
    name: 'TimelineTrigger',
    reason: 'renamed',
    why: 'Old name for AnimationTrigger (CSS scroll-driven animation triggers). Chrome 149 still ships under the old name; the atlas uses the spec name.',
    alternative: 'api.AnimationTrigger',
    alternativeTitle: 'Animation Trigger',
  },
  {
    name: 'TimelineTriggerRange',
    reason: 'renamed',
    why: 'Sub-type of the old `TimelineTrigger` name. See `AnimationTrigger`.',
    alternative: 'api.AnimationTrigger',
    alternativeTitle: 'Animation Trigger',
  },
  {
    name: 'TimelineTriggerRangeList',
    reason: 'renamed',
    why: 'Sub-type of the old `TimelineTrigger` name. See `AnimationTrigger`.',
    alternative: 'api.AnimationTrigger',
    alternativeTitle: 'Animation Trigger',
  },

  // ─── Privacy Sandbox / Protected Audience / Ad-tech ──────────────────────
  {
    name: 'adAuctionComponents',
    reason: 'privacy-sandbox',
    why: 'Privacy Sandbox / Protected Audience API. Intentionally not in the atlas — experimental, ad-industry-specific, and rapidly changing.',
  },
  {
    name: 'createAuctionNonce',
    reason: 'privacy-sandbox',
    why: 'Privacy Sandbox / Protected Audience API. Intentionally not in the atlas.',
  },
  {
    name: 'protectedAudience',
    reason: 'privacy-sandbox',
    why: 'Privacy Sandbox / Protected Audience API. Intentionally not in the atlas.',
  },
  {
    name: 'ProtectedAudience',
    reason: 'privacy-sandbox',
    why: 'Privacy Sandbox / Protected Audience API. Intentionally not in the atlas.',
  },
  {
    name: 'Fence',
    reason: 'privacy-sandbox',
    why: 'Privacy Sandbox FencedFrame / Fenced API. Intentionally not in the atlas.',
  },
  {
    name: 'SharedStorage',
    reason: 'privacy-sandbox',
    why: 'Privacy Sandbox cross-site storage. Intentionally not in the atlas — ad-tech focus, experimental.',
  },
  {
    name: 'Topics',
    reason: 'privacy-sandbox',
    why: 'Privacy Sandbox Topics API. Intentionally not in the atlas.',
  },

  // ─── Window-level singletons ─────────────────────────────────────────────
  {
    name: 'Window',
    reason: 'singleton',
    why: 'The constructor of the global `window` object — not an API you call. Anything you can do on `window.*` is the API.',
  },
  {
    name: 'Document',
    reason: 'singleton',
    why: 'The constructor of `document`. The API surface is `document.*` methods and properties, each of which is catalogued individually.',
  },
  {
    name: 'Navigator',
    reason: 'singleton',
    why: 'The constructor of `navigator`. The API surface is `navigator.*`, catalogued individually.',
  },
  {
    name: 'Location',
    reason: 'singleton',
    why: 'The constructor of `window.location`. Use `location.href`, `location.search`, etc. directly.',
  },
  {
    name: 'History',
    reason: 'singleton',
    why: 'The constructor of `window.history`. Use the History API or the modern `Navigation` API.',
    alternative: 'api.Navigation',
    alternativeTitle: 'Navigation API',
  },
  {
    name: 'Screen',
    reason: 'singleton',
    why: 'The constructor of `window.screen`. See ScreenOrientation for the actionable surface.',
    alternative: 'api.ScreenOrientation',
    alternativeTitle: 'Screen Orientation',
  },
  {
    name: 'EventTarget',
    reason: 'abstract',
    why: 'The base interface every event-emitting object inherits from. Not constructed directly.',
  },

  // ─── Abstract base classes ───────────────────────────────────────────────
  {
    name: 'BaseAudioContext',
    reason: 'abstract',
    why: 'Abstract base for `AudioContext` and `OfflineAudioContext`. Both are catalogued.',
    alternative: 'api.AudioContext',
    alternativeTitle: 'Web Audio',
  },
  {
    name: 'Sensor',
    reason: 'abstract',
    why: 'Abstract base for the Generic Sensor API. Concrete sensors (Accelerometer, Gyroscope, etc.) are catalogued.',
    alternative: 'api.Accelerometer',
    alternativeTitle: 'Accelerometer',
  },
  {
    name: 'OrientationSensor',
    reason: 'abstract',
    why: 'Abstract base for orientation sensors. See AbsoluteOrientationSensor / RelativeOrientationSensor.',
    alternative: 'api.AbsoluteOrientationSensor',
  },
  {
    name: 'AudioNode',
    reason: 'abstract',
    why: 'Abstract base for every Web Audio node. Concrete nodes are catalogued individually.',
    alternative: 'api.AudioContext',
    alternativeTitle: 'Web Audio',
  },

  // ─── Sub-types of catalogued parent APIs ─────────────────────────────────
  {
    name: 'HIDDevice',
    reason: 'subtype',
    why: 'A device returned by WebHID. The API surface is `navigator.hid`.',
    alternative: 'api.HID',
    alternativeTitle: 'WebHID',
  },
  {
    name: 'SerialPort',
    reason: 'subtype',
    why: 'A port returned by Web Serial. The API surface is `navigator.serial`.',
    alternative: 'api.Serial',
    alternativeTitle: 'Web Serial',
  },
  {
    name: 'Lock',
    reason: 'subtype',
    why: 'A held lock. The API surface is `navigator.locks` (LockManager).',
    alternative: 'api.LockManager',
    alternativeTitle: 'Web Locks',
  },
  {
    name: 'PaymentResponse',
    reason: 'subtype',
    why: 'The promise resolution of a PaymentRequest. The API surface is PaymentRequest itself.',
    alternative: 'api.PaymentRequest',
  },
  {
    name: 'PaymentAddress',
    reason: 'subtype',
    why: 'A field of PaymentResponse — not constructed directly.',
    alternative: 'api.PaymentRequest',
  },
  {
    name: 'PaymentManager',
    reason: 'subtype',
    why: 'Service-worker-side payment handler, not commonly used. PaymentRequest is the standard surface.',
    alternative: 'api.PaymentRequest',
  },
  {
    name: 'ServiceWorkerContainer',
    reason: 'subtype',
    why: '`navigator.serviceWorker` returns one of these. The catalogued API is `api.ServiceWorker`.',
    alternative: 'api.ServiceWorker',
  },
  {
    name: 'ServiceWorkerRegistration',
    reason: 'subtype',
    why: 'Returned by `serviceWorker.register()`. The catalogued API is `api.ServiceWorker`.',
    alternative: 'api.ServiceWorker',
  },
  {
    name: 'XRWebGLBinding',
    reason: 'subtype',
    why: 'Helper for WebXR + WebGL integration. The XR API surface is `XRSystem` and `XRSession`.',
    alternative: 'api.XRSystem',
    alternativeTitle: 'WebXR',
  },
  {
    name: 'VTTRegion',
    reason: 'subtype',
    why: 'WebVTT region — a sub-type of the TextTrack family. The catalogued surface is `HTMLMediaElement`.',
    alternative: 'api.HTMLMediaElement',
  },
  {
    name: 'PaintRequest',
    reason: 'subtype',
    why: 'Firefox-specific paint timing helper. See PerformancePaintTiming.',
    alternative: 'api.PerformancePaintTiming',
  },
  {
    name: 'PaintRequestList',
    reason: 'subtype',
    why: 'Firefox-specific paint timing helper. See PerformancePaintTiming.',
    alternative: 'api.PerformancePaintTiming',
  },

  // ─── Deprecated ──────────────────────────────────────────────────────────
  {
    name: 'ScriptProcessorNode',
    reason: 'deprecated',
    why: 'Deprecated Web Audio node — replaced by AudioWorkletNode.',
    alternative: 'api.AudioWorkletNode',
    alternativeTitle: 'AudioWorkletNode',
  },

  // ─── Niche / experimental / vendor extensions ────────────────────────────
  {
    name: 'Ink',
    reason: 'niche',
    why: 'Ink API (delegated ink trails). Chrome-only, very specialized for stylus apps.',
  },
  {
    name: 'DelegatedInkTrailPresenter',
    reason: 'niche',
    why: 'Ink API helper. Chrome-only, stylus-specific.',
  },
  {
    name: 'GamepadPose',
    reason: 'niche',
    why: 'Firefox-only Gamepad VR extension. WebXR is the modern story for VR/AR.',
    alternative: 'api.XRSystem',
    alternativeTitle: 'WebXR',
  },
  {
    name: 'VisualViewport',
    reason: 'niche',
    why: 'Real but very small API (`window.visualViewport.scale`, `width`, `height`). Could be added on request.',
  },
  {
    name: 'BarProp',
    reason: 'niche',
    why: 'Legacy toolbar/menubar/scrollbars getters (`window.toolbar.visible`, etc.). Almost never useful.',
  },
  {
    name: 'External',
    reason: 'niche',
    why: 'Legacy `window.external` interface. Effectively unused.',
  },
  {
    name: 'FeaturePolicy',
    reason: 'niche',
    why: 'Old name for what is now Permissions Policy. The HTTP-only `Permissions-Policy` header is the way.',
  },

  // ─── Stream internals ────────────────────────────────────────────────────
  {
    name: 'ReadableByteStreamController',
    reason: 'internal',
    why: 'Internal stream controller — you receive it inside the `start()` callback when constructing a custom byte stream.',
    alternative: 'api.ReadableStream',
  },
  {
    name: 'ByteLengthQueuingStrategy',
    reason: 'internal',
    why: 'Strategy object you pass to a stream constructor — not an API you call.',
    alternative: 'api.ReadableStream',
  },
  {
    name: 'CountQueuingStrategy',
    reason: 'internal',
    why: 'Strategy object you pass to a stream constructor — not an API you call.',
    alternative: 'api.ReadableStream',
  },

  // ─── GPU bit-flag objects ────────────────────────────────────────────────
  {
    name: 'GPUBufferUsage',
    reason: 'internal',
    why: 'Bit-flag enum object you OR into the `usage` field of `device.createBuffer({...})`.',
    alternative: 'api.GPUDevice',
  },
  {
    name: 'GPUColorWrite',
    reason: 'internal',
    why: 'Bit-flag enum for the WebGPU color-write mask.',
    alternative: 'api.GPUDevice',
  },
  {
    name: 'GPUTextureUsage',
    reason: 'internal',
    why: 'Bit-flag enum for the WebGPU texture-usage field.',
    alternative: 'api.GPUDevice',
  },
  {
    name: 'GPUShaderStage',
    reason: 'internal',
    why: 'Bit-flag enum for which shader stages a binding is visible to.',
    alternative: 'api.GPUDevice',
  },
  {
    name: 'GPUMapMode',
    reason: 'internal',
    why: 'Bit-flag enum for `buffer.mapAsync(mode)`.',
    alternative: 'api.GPUBuffer',
  },
]

/**
 * Find filtered APIs matching a search query (case-insensitive substring).
 * Used by the empty-state hint to explain why a user's search yielded
 * nothing.
 */
export function findFiltered(query: string, limit = 5): FilteredApi[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  // Prefer exact start matches, fall back to includes
  const startsWith = FILTERED_APIS.filter((f) => f.name.toLowerCase().startsWith(q))
  if (startsWith.length >= limit) return startsWith.slice(0, limit)
  const includes = FILTERED_APIS.filter(
    (f) => !f.name.toLowerCase().startsWith(q) && f.name.toLowerCase().includes(q)
  )
  return [...startsWith, ...includes].slice(0, limit)
}

export const REASON_LABEL: Record<FilterReason, string> = {
  legacy: 'Legacy / replaced',
  subtype: 'Sub-type of a catalogued API',
  internal: 'Internal / result type',
  singleton: 'Window singleton',
  abstract: 'Abstract base class',
  'privacy-sandbox': 'Privacy Sandbox / ad-tech',
  deprecated: 'Deprecated',
  renamed: 'Renamed in spec',
  vendor: 'Vendor-specific',
  niche: 'Niche / experimental',
}
