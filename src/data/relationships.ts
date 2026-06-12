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
  {from: 'api.IDBDatabase', to: 'api.IDBObjectStore'},
  {from: 'api.IDBObjectStore', to: 'api.IDBIndex'},
  {from: 'api.IDBObjectStore', to: 'api.IDBTransaction'},
  {from: 'api.IDBKeyRange', to: 'api.IDBObjectStore'},
  {from: 'api.StorageManager', to: 'api.IDBDatabase', label: 'quota'},
  {from: 'api.StorageManager', to: 'api.CacheStorage', label: 'quota'},
  {from: 'api.StorageManager', to: 'api.FileSystemDirectoryHandle', label: 'OPFS root'},
  {from: 'api.StorageBucketManager', to: 'api.StorageManager'},

  // Files
  {from: 'api.FileSystemHandle', to: 'api.File'},
  {from: 'api.Blob', to: 'api.File', label: 'inherits'},
  {from: 'api.FileSystemDirectoryHandle', to: 'api.FileSystemHandle'},
  {from: 'api.FileSystemFileHandle', to: 'api.FileSystemHandle'},
  {from: 'api.FileSystemFileHandle', to: 'api.FileSystemWritableFileStream'},
  {from: 'api.FileReader', to: 'api.Blob'},
  {from: 'api.DataTransfer', to: 'api.File'},

  // Streams
  {from: 'api.TransformStream', to: 'api.ReadableStream'},
  {from: 'api.TransformStream', to: 'api.WritableStream'},
  {from: 'api.CompressionStream', to: 'api.TransformStream', label: 'is a'},
  {from: 'api.DecompressionStream', to: 'api.TransformStream', label: 'is a'},
  {from: 'api.TextEncoderStream', to: 'api.TransformStream', label: 'is a'},
  {from: 'api.TextDecoderStream', to: 'api.TransformStream', label: 'is a'},
  {from: 'api.TextEncoder', to: 'api.TextEncoderStream'},
  {from: 'api.TextDecoder', to: 'api.TextDecoderStream'},
  {from: 'api.ReadableStream', to: 'api.Response', label: 'response.body'},
  {from: 'api.WritableStream', to: 'api.FileSystemWritableFileStream'},

  // Network
  {from: 'api.AbortController', to: 'api.fetch', label: 'abort signal'},
  {from: 'api.AbortController', to: 'api.WebSocket'},
  {from: 'api.AbortSignal.timeout_static', to: 'api.AbortController'},
  {from: 'api.Headers', to: 'api.Request'},
  {from: 'api.Headers', to: 'api.Response'},
  {from: 'api.Request', to: 'api.fetch'},
  {from: 'api.Response', to: 'api.fetch'},
  {from: 'api.URL', to: 'api.URLSearchParams'},
  {from: 'api.URL', to: 'api.URLPattern'},
  {from: 'api.Navigator.sendBeacon', to: 'api.fetch', label: 'alternative'},

  // Workers ↔ Storage / Network
  {from: 'api.ServiceWorker', to: 'api.CacheStorage', label: 'offline'},
  {from: 'api.ServiceWorker', to: 'api.fetch', label: 'intercept'},
  {from: 'api.LockManager', to: 'api.IDBDatabase', label: 'coordinate writes'},
  {from: 'api.MessageChannel', to: 'api.MessagePort'},
  {from: 'api.MessagePort', to: 'api.Worker'},
  {from: 'api.Worklet', to: 'api.AudioWorkletNode'},

  // Components
  {from: 'api.CustomElementRegistry', to: 'api.ShadowRoot'},
  {from: 'api.CustomElementRegistry', to: 'api.ElementInternals'},
  {from: 'api.ShadowRoot', to: 'api.HTMLSlotElement'},
  {from: 'api.HTMLTemplateElement', to: 'api.HTMLSlotElement'},
  {from: 'api.ElementInternals', to: 'api.HTMLElement.attachInternals'},

  // Observation & Performance
  {from: 'api.PerformanceMark', to: 'api.Performance'},
  {from: 'api.PerformanceMeasure', to: 'api.Performance'},
  {from: 'api.PerformanceNavigationTiming', to: 'api.Performance'},
  {from: 'api.PerformanceObserver', to: 'api.Performance'},
  {from: 'api.Window.requestIdleCallback', to: 'api.Scheduler', label: 'predecessor'},

  // Media chain
  {from: 'api.MediaDevices.getUserMedia', to: 'api.MediaRecorder', label: 'record stream'},
  {from: 'api.MediaDevices.getDisplayMedia', to: 'api.MediaRecorder'},
  {from: 'api.MediaDevices.getUserMedia', to: 'api.RTCPeerConnection', label: 'send stream'},
  {from: 'api.AudioContext', to: 'api.MediaDevices.getUserMedia', label: 'mic input'},
  {from: 'api.AudioContext', to: 'api.AnalyserNode'},
  {from: 'api.AudioContext', to: 'api.AudioWorkletNode'},
  {from: 'api.HTMLMediaElement', to: 'api.HTMLVideoElement', label: 'extends'},
  {from: 'api.HTMLMediaElement', to: 'api.MediaSession'},

  // Animation
  {from: 'api.Animation', to: 'api.KeyframeEffect'},
  {from: 'api.Animation', to: 'api.ScrollTimeline'},
  {from: 'api.Animation', to: 'api.ViewTimeline'},

  // Permissions gates many APIs
  {from: 'api.Permissions', to: 'api.Notification'},
  {from: 'api.Permissions', to: 'api.Geolocation'},
  {from: 'api.Permissions', to: 'api.Clipboard'},
  {from: 'api.Permissions', to: 'api.MediaDevices.getUserMedia'},

  // Sensors share a base interface
  {from: 'api.Accelerometer', to: 'api.LinearAccelerationSensor'},
  {from: 'api.Accelerometer', to: 'api.Gyroscope'},
  {from: 'api.Accelerometer', to: 'api.Magnetometer'},
  {from: 'api.RelativeOrientationSensor', to: 'api.Accelerometer'},

  // Identity
  {from: 'api.CredentialsContainer', to: 'api.PublicKeyCredential', label: 'navigator.credentials.create()'},
  {from: 'api.CredentialsContainer', to: 'api.OTPCredential'},
  {from: 'api.CredentialsContainer', to: 'api.IdentityCredential'},
  {from: 'api.SubtleCrypto', to: 'api.Crypto', label: 'crypto.subtle'},
  {from: 'api.SubtleCrypto', to: 'api.PublicKeyCredential', label: 'subtle ops'},

  // Graphics
  {from: 'api.CanvasRenderingContext2D', to: 'api.OffscreenCanvas'},
  {from: 'api.CanvasRenderingContext2D', to: 'api.Path2D'},
  {from: 'api.WebGL2RenderingContext', to: 'api.WebGLRenderingContext', label: 'extends'},
  {from: 'api.OffscreenCanvas', to: 'api.Worker', label: 'render off-thread'},

  // Web Audio nodes
  {from: 'api.OscillatorNode', to: 'api.AudioContext'},
  {from: 'api.GainNode', to: 'api.AudioContext'},
  {from: 'api.BiquadFilterNode', to: 'api.AudioContext'},
  {from: 'api.ConvolverNode', to: 'api.AudioContext'},
  {from: 'api.DelayNode', to: 'api.AudioContext'},
  {from: 'api.DynamicsCompressorNode', to: 'api.AudioContext'},

  // WebCodecs
  {from: 'api.VideoDecoder', to: 'api.VideoFrame', label: 'decodes to'},
  {from: 'api.VideoEncoder', to: 'api.VideoFrame', label: 'encodes from'},
  {from: 'api.AudioDecoder', to: 'api.AudioData', label: 'decodes to'},
  {from: 'api.AudioEncoder', to: 'api.AudioData', label: 'encodes from'},
  {from: 'api.VideoFrame', to: 'api.MediaStreamTrack', label: 'from track'},
  {from: 'api.AudioData', to: 'api.MediaStreamTrack'},
  {from: 'api.ImageDecoder', to: 'api.ImageBitmap'},

  // WebGPU primitives
  {from: 'api.GPUDevice', to: 'api.GPU'},
  {from: 'api.GPUBuffer', to: 'api.GPUDevice'},
  {from: 'api.GPUTexture', to: 'api.GPUDevice'},
  {from: 'api.GPUShaderModule', to: 'api.GPUDevice'},
  {from: 'api.GPURenderPipeline', to: 'api.GPUDevice'},
  {from: 'api.GPUCommandEncoder', to: 'api.GPUDevice'},

  // DOM geometry
  {from: 'api.DOMQuad', to: 'api.DOMRect'},
  {from: 'api.DOMRect', to: 'api.Element.scrollIntoView'},

  // DOM utilities
  {from: 'api.DOMParser', to: 'api.XMLSerializer', label: 'inverse'},
  {from: 'api.NodeIterator', to: 'api.TreeWalker'},
  {from: 'api.Selection', to: 'api.Range', label: 'selection ranges'},
  {from: 'api.Range', to: 'api.Highlight'},

  // Modern CSS
  {from: 'api.CSSContainerRule', to: 'api.CSSLayerBlockRule'},
  {from: 'api.HighlightRegistry', to: 'api.Highlight'},
  {from: 'api.Document.requestStorageAccessFor', to: 'api.Document.requestStorageAccess'},

  // Frontier
  {from: 'api.Document.startViewTransition', to: 'api.HTMLDialogElement', label: 'animate dialog'},
  {from: 'api.Navigation', to: 'api.URLPattern', label: 'route matching'},
]
