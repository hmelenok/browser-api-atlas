import type {CategoryId} from '@/lib/types'

/**
 * The curated list of APIs that appear in the v1 graph.
 *
 * Each entry maps:
 *  - bcdKey:       the @mdn/browser-compat-data path used to look up support data
 *  - category:     which cluster the node belongs to in the graph
 *  - runtimeKey:   the dotted accessor used at runtime to detect support
 *                  (e.g. "window.Notification" or "navigator.storage")
 *  - title:        optional override of the auto-derived display name
 *
 * The build-catalog script reads BCD + web-features and produces the slim
 * catalog.json shipped with the app.
 *
 * Adding a new API: append a row here, run `npm run build:catalog`, then drop
 * a demo into src/demos/.
 */
export interface ApiSelection {
  bcdKey: string
  category: CategoryId
  runtimeKey: string
  title?: string
}

export const API_SELECTION: ApiSelection[] = [
  // ─── Storage ──────────────────────────────────────────────────────────────
  {bcdKey: 'api.Window.localStorage', category: 'storage', runtimeKey: 'window.localStorage', title: 'localStorage'},
  {bcdKey: 'api.Window.sessionStorage', category: 'storage', runtimeKey: 'window.sessionStorage', title: 'sessionStorage'},
  {bcdKey: 'api.IDBDatabase', category: 'storage', runtimeKey: 'window.indexedDB', title: 'IndexedDB'},
  {bcdKey: 'api.IDBObjectStore', category: 'storage', runtimeKey: 'window.IDBObjectStore'},
  {bcdKey: 'api.IDBTransaction', category: 'storage', runtimeKey: 'window.IDBTransaction'},
  {bcdKey: 'api.IDBIndex', category: 'storage', runtimeKey: 'window.IDBIndex'},
  {bcdKey: 'api.IDBKeyRange', category: 'storage', runtimeKey: 'window.IDBKeyRange'},
  {bcdKey: 'api.CacheStorage', category: 'storage', runtimeKey: 'window.caches', title: 'Cache Storage'},
  {bcdKey: 'api.StorageManager', category: 'storage', runtimeKey: 'navigator.storage', title: 'Storage Manager'},
  {bcdKey: 'api.StorageBucketManager', category: 'storage', runtimeKey: 'navigator.storageBuckets', title: 'Storage Buckets'},
  {bcdKey: 'api.CookieStore', category: 'storage', runtimeKey: 'window.cookieStore', title: 'Cookie Store'},
  {bcdKey: 'api.BroadcastChannel', category: 'storage', runtimeKey: 'window.BroadcastChannel'},

  // ─── Files ────────────────────────────────────────────────────────────────
  {bcdKey: 'api.FileSystemHandle', category: 'files', runtimeKey: 'window.showOpenFilePicker', title: 'File System Access'},
  {bcdKey: 'api.FileSystemDirectoryHandle', category: 'files', runtimeKey: 'navigator.storage', title: 'Origin Private File System'},
  {bcdKey: 'api.FileSystemFileHandle', category: 'files', runtimeKey: 'window.FileSystemFileHandle'},
  {bcdKey: 'api.FileSystemWritableFileStream', category: 'files', runtimeKey: 'window.FileSystemWritableFileStream'},
  {bcdKey: 'api.File', category: 'files', runtimeKey: 'window.File', title: 'File'},
  {bcdKey: 'api.FileReader', category: 'files', runtimeKey: 'window.FileReader'},
  {bcdKey: 'api.Blob', category: 'files', runtimeKey: 'window.Blob', title: 'Blob'},
  {bcdKey: 'api.DataTransfer', category: 'files', runtimeKey: 'window.DataTransfer'},
  {bcdKey: 'api.FormData', category: 'files', runtimeKey: 'window.FormData'},

  // ─── Streams ──────────────────────────────────────────────────────────────
  {bcdKey: 'api.ReadableStream', category: 'streams', runtimeKey: 'window.ReadableStream'},
  {bcdKey: 'api.WritableStream', category: 'streams', runtimeKey: 'window.WritableStream'},
  {bcdKey: 'api.TransformStream', category: 'streams', runtimeKey: 'window.TransformStream'},
  {bcdKey: 'api.TextEncoder', category: 'streams', runtimeKey: 'window.TextEncoder'},
  {bcdKey: 'api.TextDecoder', category: 'streams', runtimeKey: 'window.TextDecoder'},
  {bcdKey: 'api.TextEncoderStream', category: 'streams', runtimeKey: 'window.TextEncoderStream'},
  {bcdKey: 'api.TextDecoderStream', category: 'streams', runtimeKey: 'window.TextDecoderStream'},
  {bcdKey: 'api.CompressionStream', category: 'streams', runtimeKey: 'window.CompressionStream'},
  {bcdKey: 'api.DecompressionStream', category: 'streams', runtimeKey: 'window.DecompressionStream'},

  // ─── Network ──────────────────────────────────────────────────────────────
  {bcdKey: 'api.fetch', category: 'network', runtimeKey: 'window.fetch', title: 'Fetch'},
  {bcdKey: 'api.Headers', category: 'network', runtimeKey: 'window.Headers'},
  {bcdKey: 'api.Request', category: 'network', runtimeKey: 'window.Request'},
  {bcdKey: 'api.Response', category: 'network', runtimeKey: 'window.Response'},
  {bcdKey: 'api.AbortController', category: 'network', runtimeKey: 'window.AbortController'},
  {bcdKey: 'api.WebSocket', category: 'network', runtimeKey: 'window.WebSocket'},
  {bcdKey: 'api.EventSource', category: 'network', runtimeKey: 'window.EventSource', title: 'Server-Sent Events'},
  {bcdKey: 'api.WebTransport', category: 'network', runtimeKey: 'window.WebTransport'},
  {bcdKey: 'api.RTCPeerConnection', category: 'network', runtimeKey: 'window.RTCPeerConnection', title: 'WebRTC'},
  {bcdKey: 'api.URL', category: 'network', runtimeKey: 'window.URL'},
  {bcdKey: 'api.URLSearchParams', category: 'network', runtimeKey: 'window.URLSearchParams'},
  {bcdKey: 'api.URLPattern', category: 'network', runtimeKey: 'window.URLPattern'},
  {bcdKey: 'api.Navigator.sendBeacon', category: 'network', runtimeKey: 'navigator.sendBeacon', title: 'sendBeacon'},
  {bcdKey: 'api.NetworkInformation', category: 'network', runtimeKey: 'navigator.connection', title: 'Network Information'},

  // ─── Workers ──────────────────────────────────────────────────────────────
  {bcdKey: 'api.Worker', category: 'workers', runtimeKey: 'window.Worker', title: 'Web Worker'},
  {bcdKey: 'api.SharedWorker', category: 'workers', runtimeKey: 'window.SharedWorker'},
  {bcdKey: 'api.ServiceWorker', category: 'workers', runtimeKey: 'navigator.serviceWorker', title: 'Service Worker'},
  {bcdKey: 'api.LockManager', category: 'workers', runtimeKey: 'navigator.locks', title: 'Web Locks'},
  {bcdKey: 'api.MessageChannel', category: 'workers', runtimeKey: 'window.MessageChannel'},
  {bcdKey: 'api.MessagePort', category: 'workers', runtimeKey: 'window.MessagePort'},
  {bcdKey: 'api.Worklet', category: 'workers', runtimeKey: 'window.Worklet'},

  // ─── Observation & Performance ────────────────────────────────────────────
  {bcdKey: 'api.IntersectionObserver', category: 'observation', runtimeKey: 'window.IntersectionObserver'},
  {bcdKey: 'api.ResizeObserver', category: 'observation', runtimeKey: 'window.ResizeObserver'},
  {bcdKey: 'api.MutationObserver', category: 'observation', runtimeKey: 'window.MutationObserver'},
  {bcdKey: 'api.PerformanceObserver', category: 'observation', runtimeKey: 'window.PerformanceObserver'},
  {bcdKey: 'api.ReportingObserver', category: 'observation', runtimeKey: 'window.ReportingObserver'},
  {bcdKey: 'api.Performance', category: 'observation', runtimeKey: 'window.performance'},
  {bcdKey: 'api.PerformanceMark', category: 'observation', runtimeKey: 'window.PerformanceMark'},
  {bcdKey: 'api.PerformanceMeasure', category: 'observation', runtimeKey: 'window.PerformanceMeasure'},
  {bcdKey: 'api.PerformanceNavigationTiming', category: 'observation', runtimeKey: 'window.PerformanceNavigationTiming'},
  {bcdKey: 'api.Window.requestIdleCallback', category: 'observation', runtimeKey: 'window.requestIdleCallback', title: 'requestIdleCallback'},
  {bcdKey: 'api.Window.requestAnimationFrame', category: 'observation', runtimeKey: 'window.requestAnimationFrame', title: 'requestAnimationFrame'},

  // ─── Platform UI ──────────────────────────────────────────────────────────
  {bcdKey: 'api.Notification', category: 'platform-ui', runtimeKey: 'window.Notification', title: 'Notifications'},
  {bcdKey: 'api.Navigator.share', category: 'platform-ui', runtimeKey: 'navigator.share', title: 'Web Share'},
  {bcdKey: 'api.WakeLock', category: 'platform-ui', runtimeKey: 'navigator.wakeLock', title: 'Screen Wake Lock'},
  {bcdKey: 'api.IdleDetector', category: 'platform-ui', runtimeKey: 'window.IdleDetector', title: 'Idle Detection'},
  {bcdKey: 'api.Clipboard', category: 'platform-ui', runtimeKey: 'navigator.clipboard', title: 'Clipboard'},
  {bcdKey: 'api.Navigator.vibrate', category: 'platform-ui', runtimeKey: 'navigator.vibrate', title: 'Vibration'},
  {bcdKey: 'api.Navigator.setAppBadge', category: 'platform-ui', runtimeKey: 'navigator.setAppBadge', title: 'App Badging'},
  {bcdKey: 'api.Selection', category: 'platform-ui', runtimeKey: 'window.getSelection'},
  {bcdKey: 'api.Range', category: 'platform-ui', runtimeKey: 'window.Range'},
  {bcdKey: 'api.Document.fullscreenEnabled', category: 'platform-ui', runtimeKey: 'document.fullscreenEnabled', title: 'Fullscreen API'},
  {bcdKey: 'api.HTMLDetailsElement', category: 'platform-ui', runtimeKey: 'window.HTMLDetailsElement', title: '<details>'},
  {bcdKey: 'api.PaymentRequest', category: 'platform-ui', runtimeKey: 'window.PaymentRequest'},

  // ─── Components (Web Components) ──────────────────────────────────────────
  {bcdKey: 'api.CustomElementRegistry', category: 'components', runtimeKey: 'window.customElements', title: 'Custom Elements'},
  {bcdKey: 'api.ShadowRoot', category: 'components', runtimeKey: 'window.ShadowRoot', title: 'Shadow DOM'},
  {bcdKey: 'api.HTMLTemplateElement', category: 'components', runtimeKey: 'window.HTMLTemplateElement', title: '<template>'},
  {bcdKey: 'api.HTMLSlotElement', category: 'components', runtimeKey: 'window.HTMLSlotElement', title: '<slot>'},
  {bcdKey: 'api.ElementInternals', category: 'components', runtimeKey: 'window.ElementInternals'},

  // ─── Media Capture ────────────────────────────────────────────────────────
  {bcdKey: 'api.MediaDevices.getUserMedia', category: 'media-capture', runtimeKey: 'navigator.mediaDevices', title: 'getUserMedia'},
  {bcdKey: 'api.MediaDevices.getDisplayMedia', category: 'media-capture', runtimeKey: 'navigator.mediaDevices', title: 'Screen Capture'},
  {bcdKey: 'api.MediaRecorder', category: 'media-capture', runtimeKey: 'window.MediaRecorder'},
  {bcdKey: 'api.PictureInPictureWindow', category: 'media-capture', runtimeKey: 'document.pictureInPictureEnabled', title: 'Picture-in-Picture'},
  {bcdKey: 'api.HTMLMediaElement', category: 'media-capture', runtimeKey: 'window.HTMLMediaElement'},
  {bcdKey: 'api.MediaCapabilities', category: 'media-capture', runtimeKey: 'navigator.mediaCapabilities'},

  // ─── Audio & Video ────────────────────────────────────────────────────────
  {bcdKey: 'api.AudioContext', category: 'audio-video', runtimeKey: 'window.AudioContext', title: 'Web Audio'},
  {bcdKey: 'api.AudioWorkletNode', category: 'audio-video', runtimeKey: 'window.AudioWorkletNode'},
  {bcdKey: 'api.AnalyserNode', category: 'audio-video', runtimeKey: 'window.AnalyserNode'},
  {bcdKey: 'api.MIDIAccess', category: 'audio-video', runtimeKey: 'navigator.requestMIDIAccess', title: 'Web MIDI'},
  {bcdKey: 'api.SpeechSynthesis', category: 'audio-video', runtimeKey: 'window.speechSynthesis', title: 'Speech Synthesis'},
  {bcdKey: 'api.SpeechRecognition', category: 'audio-video', runtimeKey: 'window.SpeechRecognition', title: 'Speech Recognition'},
  {bcdKey: 'api.MediaSession', category: 'audio-video', runtimeKey: 'navigator.mediaSession'},
  {bcdKey: 'api.HTMLVideoElement', category: 'audio-video', runtimeKey: 'window.HTMLVideoElement'},

  // ─── Graphics & Animation ─────────────────────────────────────────────────
  {bcdKey: 'api.CanvasRenderingContext2D', category: 'graphics', runtimeKey: 'window.CanvasRenderingContext2D', title: 'Canvas 2D'},
  {bcdKey: 'api.Path2D', category: 'graphics', runtimeKey: 'window.Path2D'},
  {bcdKey: 'api.WebGLRenderingContext', category: 'graphics', runtimeKey: 'window.WebGLRenderingContext', title: 'WebGL'},
  {bcdKey: 'api.WebGL2RenderingContext', category: 'graphics', runtimeKey: 'window.WebGL2RenderingContext', title: 'WebGL2'},
  {bcdKey: 'api.GPU', category: 'graphics', runtimeKey: 'navigator.gpu', title: 'WebGPU'},
  {bcdKey: 'api.OffscreenCanvas', category: 'graphics', runtimeKey: 'window.OffscreenCanvas'},
  {bcdKey: 'api.Animation', category: 'graphics', runtimeKey: 'window.Animation', title: 'Web Animations'},
  {bcdKey: 'api.KeyframeEffect', category: 'graphics', runtimeKey: 'window.KeyframeEffect'},
  {bcdKey: 'api.ScrollTimeline', category: 'graphics', runtimeKey: 'window.ScrollTimeline', title: 'Scroll Timeline'},
  {bcdKey: 'api.ViewTimeline', category: 'graphics', runtimeKey: 'window.ViewTimeline', title: 'View Timeline'},

  // ─── Sensors ──────────────────────────────────────────────────────────────
  {bcdKey: 'api.Geolocation', category: 'sensors', runtimeKey: 'navigator.geolocation'},
  {bcdKey: 'api.DeviceOrientationEvent', category: 'sensors', runtimeKey: 'window.DeviceOrientationEvent', title: 'Device Orientation'},
  {bcdKey: 'api.BatteryManager', category: 'sensors', runtimeKey: 'navigator.getBattery', title: 'Battery Status'},
  {bcdKey: 'api.AmbientLightSensor', category: 'sensors', runtimeKey: 'window.AmbientLightSensor', title: 'Ambient Light'},
  {bcdKey: 'api.PressureObserver', category: 'sensors', runtimeKey: 'window.PressureObserver', title: 'Compute Pressure'},
  {bcdKey: 'api.Gamepad', category: 'sensors', runtimeKey: 'navigator.getGamepads', title: 'Gamepad'},
  {bcdKey: 'api.Accelerometer', category: 'sensors', runtimeKey: 'window.Accelerometer'},
  {bcdKey: 'api.Gyroscope', category: 'sensors', runtimeKey: 'window.Gyroscope'},
  {bcdKey: 'api.Magnetometer', category: 'sensors', runtimeKey: 'window.Magnetometer'},
  {bcdKey: 'api.LinearAccelerationSensor', category: 'sensors', runtimeKey: 'window.LinearAccelerationSensor'},
  {bcdKey: 'api.RelativeOrientationSensor', category: 'sensors', runtimeKey: 'window.RelativeOrientationSensor'},

  // ─── Hardware ─────────────────────────────────────────────────────────────
  {bcdKey: 'api.USB', category: 'hardware', runtimeKey: 'navigator.usb', title: 'WebUSB'},
  {bcdKey: 'api.HID', category: 'hardware', runtimeKey: 'navigator.hid', title: 'WebHID'},
  {bcdKey: 'api.Serial', category: 'hardware', runtimeKey: 'navigator.serial', title: 'Web Serial'},
  {bcdKey: 'api.Bluetooth', category: 'hardware', runtimeKey: 'navigator.bluetooth', title: 'Web Bluetooth'},
  {bcdKey: 'api.NDEFReader', category: 'hardware', runtimeKey: 'window.NDEFReader', title: 'Web NFC'},
  {bcdKey: 'api.PresentationRequest', category: 'hardware', runtimeKey: 'window.PresentationRequest', title: 'Presentation API'},

  // ─── Identity & Security ──────────────────────────────────────────────────
  {bcdKey: 'api.PublicKeyCredential', category: 'identity', runtimeKey: 'window.PublicKeyCredential', title: 'WebAuthn'},
  {bcdKey: 'api.CredentialsContainer', category: 'identity', runtimeKey: 'navigator.credentials', title: 'Credential Management'},
  {bcdKey: 'api.Crypto', category: 'identity', runtimeKey: 'window.crypto', title: 'Web Crypto'},
  {bcdKey: 'api.SubtleCrypto', category: 'identity', runtimeKey: 'window.crypto.subtle', title: 'SubtleCrypto'},
  {bcdKey: 'api.Permissions', category: 'identity', runtimeKey: 'navigator.permissions'},
  {bcdKey: 'api.OTPCredential', category: 'identity', runtimeKey: 'window.OTPCredential', title: 'WebOTP'},
  {bcdKey: 'api.IdentityCredential', category: 'identity', runtimeKey: 'window.IdentityCredential', title: 'FedCM'},

  // ─── Frontier ─────────────────────────────────────────────────────────────
  {bcdKey: 'api.Document.startViewTransition', category: 'frontier', runtimeKey: 'document.startViewTransition', title: 'View Transitions'},
  {bcdKey: 'api.HTMLElement.popover', category: 'frontier', runtimeKey: 'window.HTMLElement', title: 'Popover'},
  {bcdKey: 'api.CSS.supports_static', category: 'frontier', runtimeKey: 'window.CSS', title: 'CSS.supports()'},
  {bcdKey: 'api.HTMLDialogElement', category: 'frontier', runtimeKey: 'window.HTMLDialogElement', title: '<dialog>'},
  {bcdKey: 'api.AbortSignal.timeout_static', category: 'frontier', runtimeKey: 'window.AbortSignal', title: 'AbortSignal.timeout()'},
  {bcdKey: 'api.Scheduler', category: 'frontier', runtimeKey: 'window.scheduler', title: 'Scheduler API'},
  {bcdKey: 'api.Navigation', category: 'frontier', runtimeKey: 'window.navigation', title: 'Navigation API'},
  {bcdKey: 'api.CSSLayerBlockRule', category: 'frontier', runtimeKey: 'window.CSSLayerBlockRule', title: 'CSS Cascade Layers'},
  {bcdKey: 'api.CSS.registerProperty_static', category: 'frontier', runtimeKey: 'window.CSS', title: 'CSS.registerProperty()'},
  {bcdKey: 'api.HTMLElement.attachInternals', category: 'frontier', runtimeKey: 'window.HTMLElement', title: 'attachInternals()'},
  {bcdKey: 'api.Element.checkVisibility', category: 'frontier', runtimeKey: 'window.Element.prototype.checkVisibility', title: 'Element.checkVisibility()'},
]
