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
  // ─── Storage (the detailed category) ─────────────────────────────────────
  {bcdKey: 'api.Window.localStorage', category: 'storage', runtimeKey: 'window.localStorage', title: 'localStorage'},
  {bcdKey: 'api.Window.sessionStorage', category: 'storage', runtimeKey: 'window.sessionStorage', title: 'sessionStorage'},
  {bcdKey: 'api.IDBDatabase', category: 'storage', runtimeKey: 'window.indexedDB', title: 'IndexedDB'},
  {bcdKey: 'api.CacheStorage', category: 'storage', runtimeKey: 'window.caches', title: 'Cache Storage'},
  {bcdKey: 'api.StorageManager', category: 'storage', runtimeKey: 'navigator.storage', title: 'Storage Manager'},
  {bcdKey: 'api.CookieStore', category: 'storage', runtimeKey: 'window.cookieStore', title: 'Cookie Store'},
  {bcdKey: 'api.BroadcastChannel', category: 'storage', runtimeKey: 'window.BroadcastChannel'},

  // ─── Files ───────────────────────────────────────────────────────────────
  {bcdKey: 'api.FileSystemHandle', category: 'files', runtimeKey: 'window.showOpenFilePicker', title: 'File System Access'},
  {bcdKey: 'api.FileSystemDirectoryHandle', category: 'files', runtimeKey: 'navigator.storage', title: 'Origin Private File System'},
  {bcdKey: 'api.File', category: 'files', runtimeKey: 'window.File', title: 'File'},
  {bcdKey: 'api.Blob', category: 'files', runtimeKey: 'window.Blob', title: 'Blob'},

  // ─── Network ─────────────────────────────────────────────────────────────
  {bcdKey: 'api.fetch', category: 'network', runtimeKey: 'window.fetch', title: 'Fetch'},
  {bcdKey: 'api.AbortController', category: 'network', runtimeKey: 'window.AbortController'},
  {bcdKey: 'api.WebSocket', category: 'network', runtimeKey: 'window.WebSocket'},
  {bcdKey: 'api.EventSource', category: 'network', runtimeKey: 'window.EventSource', title: 'Server-Sent Events'},
  {bcdKey: 'api.WebTransport', category: 'network', runtimeKey: 'window.WebTransport'},
  {bcdKey: 'api.RTCPeerConnection', category: 'network', runtimeKey: 'window.RTCPeerConnection', title: 'WebRTC'},

  // ─── Workers ─────────────────────────────────────────────────────────────
  {bcdKey: 'api.Worker', category: 'workers', runtimeKey: 'window.Worker', title: 'Web Worker'},
  {bcdKey: 'api.SharedWorker', category: 'workers', runtimeKey: 'window.SharedWorker'},
  {bcdKey: 'api.ServiceWorker', category: 'workers', runtimeKey: 'navigator.serviceWorker', title: 'Service Worker'},
  {bcdKey: 'api.LockManager', category: 'workers', runtimeKey: 'navigator.locks', title: 'Web Locks'},

  // ─── Observation ─────────────────────────────────────────────────────────
  {bcdKey: 'api.IntersectionObserver', category: 'observation', runtimeKey: 'window.IntersectionObserver'},
  {bcdKey: 'api.ResizeObserver', category: 'observation', runtimeKey: 'window.ResizeObserver'},
  {bcdKey: 'api.MutationObserver', category: 'observation', runtimeKey: 'window.MutationObserver'},
  {bcdKey: 'api.PerformanceObserver', category: 'observation', runtimeKey: 'window.PerformanceObserver'},

  // ─── Platform UI ─────────────────────────────────────────────────────────
  {bcdKey: 'api.Notification', category: 'platform-ui', runtimeKey: 'window.Notification', title: 'Notifications'},
  {bcdKey: 'api.Navigator.share', category: 'platform-ui', runtimeKey: 'navigator.share', title: 'Web Share'},
  {bcdKey: 'api.WakeLock', category: 'platform-ui', runtimeKey: 'navigator.wakeLock', title: 'Screen Wake Lock'},
  {bcdKey: 'api.IdleDetector', category: 'platform-ui', runtimeKey: 'window.IdleDetector', title: 'Idle Detection'},
  {bcdKey: 'api.Clipboard', category: 'platform-ui', runtimeKey: 'navigator.clipboard', title: 'Clipboard'},
  {bcdKey: 'api.Navigator.vibrate', category: 'platform-ui', runtimeKey: 'navigator.vibrate', title: 'Vibration'},
  {bcdKey: 'api.Navigator.setAppBadge', category: 'platform-ui', runtimeKey: 'navigator.setAppBadge', title: 'App Badging'},

  // ─── Media Capture ───────────────────────────────────────────────────────
  {bcdKey: 'api.MediaDevices.getUserMedia', category: 'media-capture', runtimeKey: 'navigator.mediaDevices', title: 'getUserMedia'},
  {bcdKey: 'api.MediaDevices.getDisplayMedia', category: 'media-capture', runtimeKey: 'navigator.mediaDevices', title: 'Screen Capture'},
  {bcdKey: 'api.MediaRecorder', category: 'media-capture', runtimeKey: 'window.MediaRecorder'},
  {bcdKey: 'api.PictureInPictureWindow', category: 'media-capture', runtimeKey: 'document.pictureInPictureEnabled', title: 'Picture-in-Picture'},

  // ─── Audio & Video ───────────────────────────────────────────────────────
  {bcdKey: 'api.AudioContext', category: 'audio-video', runtimeKey: 'window.AudioContext', title: 'Web Audio'},
  {bcdKey: 'api.MIDIAccess', category: 'audio-video', runtimeKey: 'navigator.requestMIDIAccess', title: 'Web MIDI'},
  {bcdKey: 'api.SpeechSynthesis', category: 'audio-video', runtimeKey: 'window.speechSynthesis', title: 'Speech Synthesis'},
  {bcdKey: 'api.SpeechRecognition', category: 'audio-video', runtimeKey: 'window.SpeechRecognition', title: 'Speech Recognition'},
  {bcdKey: 'api.MediaSession', category: 'audio-video', runtimeKey: 'navigator.mediaSession'},

  // ─── Graphics ────────────────────────────────────────────────────────────
  {bcdKey: 'api.CanvasRenderingContext2D', category: 'graphics', runtimeKey: 'window.CanvasRenderingContext2D', title: 'Canvas 2D'},
  {bcdKey: 'api.WebGLRenderingContext', category: 'graphics', runtimeKey: 'window.WebGLRenderingContext', title: 'WebGL'},
  {bcdKey: 'api.WebGL2RenderingContext', category: 'graphics', runtimeKey: 'window.WebGL2RenderingContext', title: 'WebGL2'},
  {bcdKey: 'api.GPU', category: 'graphics', runtimeKey: 'navigator.gpu', title: 'WebGPU'},
  {bcdKey: 'api.OffscreenCanvas', category: 'graphics', runtimeKey: 'window.OffscreenCanvas'},

  // ─── Sensors ─────────────────────────────────────────────────────────────
  {bcdKey: 'api.Geolocation', category: 'sensors', runtimeKey: 'navigator.geolocation'},
  {bcdKey: 'api.DeviceOrientationEvent', category: 'sensors', runtimeKey: 'window.DeviceOrientationEvent', title: 'Device Orientation'},
  {bcdKey: 'api.BatteryManager', category: 'sensors', runtimeKey: 'navigator.getBattery', title: 'Battery Status'},
  {bcdKey: 'api.AmbientLightSensor', category: 'sensors', runtimeKey: 'window.AmbientLightSensor', title: 'Ambient Light'},
  {bcdKey: 'api.PressureObserver', category: 'sensors', runtimeKey: 'window.PressureObserver', title: 'Compute Pressure'},
  {bcdKey: 'api.Gamepad', category: 'sensors', runtimeKey: 'navigator.getGamepads', title: 'Gamepad'},

  // ─── Hardware ────────────────────────────────────────────────────────────
  {bcdKey: 'api.USB', category: 'hardware', runtimeKey: 'navigator.usb', title: 'WebUSB'},
  {bcdKey: 'api.HID', category: 'hardware', runtimeKey: 'navigator.hid', title: 'WebHID'},
  {bcdKey: 'api.Serial', category: 'hardware', runtimeKey: 'navigator.serial', title: 'Web Serial'},
  {bcdKey: 'api.Bluetooth', category: 'hardware', runtimeKey: 'navigator.bluetooth', title: 'Web Bluetooth'},
  {bcdKey: 'api.NDEFReader', category: 'hardware', runtimeKey: 'window.NDEFReader', title: 'Web NFC'},

  // ─── Identity & Security ─────────────────────────────────────────────────
  {bcdKey: 'api.PublicKeyCredential', category: 'identity', runtimeKey: 'window.PublicKeyCredential', title: 'WebAuthn'},
  {bcdKey: 'api.CredentialsContainer', category: 'identity', runtimeKey: 'navigator.credentials', title: 'Credential Management'},
  {bcdKey: 'api.Crypto', category: 'identity', runtimeKey: 'window.crypto', title: 'Web Crypto'},
  {bcdKey: 'api.Permissions', category: 'identity', runtimeKey: 'navigator.permissions'},

  // ─── Frontier ────────────────────────────────────────────────────────────
  {bcdKey: 'api.Document.startViewTransition', category: 'frontier', runtimeKey: 'document.startViewTransition', title: 'View Transitions'},
  {bcdKey: 'api.HTMLElement.popover', category: 'frontier', runtimeKey: 'window.HTMLElement', title: 'Popover'},
  {bcdKey: 'api.CSS.supports_static', category: 'frontier', runtimeKey: 'window.CSS', title: 'CSS.supports()'},
  {bcdKey: 'api.HTMLDialogElement', category: 'frontier', runtimeKey: 'window.HTMLDialogElement', title: '<dialog>'},
  {bcdKey: 'api.AbortSignal.timeout_static', category: 'frontier', runtimeKey: 'window.AbortSignal', title: 'AbortSignal.timeout()'},
  {bcdKey: 'api.Scheduler', category: 'frontier', runtimeKey: 'window.scheduler', title: 'Scheduler API'},
]
