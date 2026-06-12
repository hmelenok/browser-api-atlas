import type {CatalogRelationship} from '@/lib/types'

/**
 * Hand-curated relationships between APIs. Shown as edges in the graph.
 *
 * Adding edges: keep it tasteful — only add an edge when the relationship is
 * genuinely useful for a learner ("oh, X is what unlocks Y"). Don't connect
 * everything that touches everything else, or the graph becomes a hairball.
 */
export const RELATIONSHIPS: CatalogRelationship[] = [
  // Storage cluster — internal connections
  {from: 'api.Window.localStorage', to: 'api.BroadcastChannel', label: 'cross-tab sync'},
  {from: 'api.IDBDatabase', to: 'api.BroadcastChannel', label: 'cross-tab sync'},
  {from: 'api.StorageManager', to: 'api.IDBDatabase', label: 'quota'},
  {from: 'api.StorageManager', to: 'api.CacheStorage', label: 'quota'},
  {from: 'api.StorageManager', to: 'api.FileSystemDirectoryHandle', label: 'OPFS root'},

  // Files
  {from: 'api.FileSystemHandle', to: 'api.File'},
  {from: 'api.Blob', to: 'api.File', label: 'inherits'},
  {from: 'api.FileSystemDirectoryHandle', to: 'api.FileSystemHandle'},

  // Network
  {from: 'api.AbortController', to: 'api.fetch', label: 'abort signal'},
  {from: 'api.AbortController', to: 'api.WebSocket'},
  {from: 'api.AbortSignal.timeout_static', to: 'api.AbortController'},

  // Workers ↔ Storage / Network
  {from: 'api.ServiceWorker', to: 'api.CacheStorage', label: 'offline'},
  {from: 'api.ServiceWorker', to: 'api.fetch', label: 'intercept'},
  {from: 'api.LockManager', to: 'api.IDBDatabase', label: 'coordinate writes'},

  // Media chain
  {from: 'api.MediaDevices.getUserMedia', to: 'api.MediaRecorder', label: 'record stream'},
  {from: 'api.MediaDevices.getDisplayMedia', to: 'api.MediaRecorder'},
  {from: 'api.MediaDevices.getUserMedia', to: 'api.RTCPeerConnection', label: 'send stream'},
  {from: 'api.AudioContext', to: 'api.MediaDevices.getUserMedia', label: 'mic input'},

  // Permissions gates many APIs
  {from: 'api.Permissions', to: 'api.Notification'},
  {from: 'api.Permissions', to: 'api.Geolocation'},
  {from: 'api.Permissions', to: 'api.Clipboard'},
  {from: 'api.Permissions', to: 'api.MediaDevices.getUserMedia'},

  // Identity
  {from: 'api.CredentialsContainer', to: 'api.PublicKeyCredential', label: 'navigator.credentials.create()'},
  {from: 'api.Crypto', to: 'api.PublicKeyCredential', label: 'subtle ops'},

  // Graphics
  {from: 'api.CanvasRenderingContext2D', to: 'api.OffscreenCanvas'},
  {from: 'api.WebGL2RenderingContext', to: 'api.WebGLRenderingContext', label: 'extends'},
  {from: 'api.OffscreenCanvas', to: 'api.Worker', label: 'render off-thread'},

  // Frontier
  {from: 'api.Document.startViewTransition', to: 'api.HTMLDialogElement', label: 'animate dialog'},
]
