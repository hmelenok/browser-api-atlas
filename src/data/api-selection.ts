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
  {bcdKey: 'api.Document.requestStorageAccess', category: 'storage', runtimeKey: 'document.requestStorageAccess', title: 'Storage Access'},
  {bcdKey: 'api.Document.hasStorageAccess', category: 'storage', runtimeKey: 'document.hasStorageAccess'},
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
  {bcdKey: 'api.FileSystemSyncAccessHandle', category: 'files', runtimeKey: 'window.FileSystemSyncAccessHandle', title: 'OPFS Sync Access (in Workers)'},
  {bcdKey: 'api.File', category: 'files', runtimeKey: 'window.File', title: 'File'},
  {bcdKey: 'api.FileReader', category: 'files', runtimeKey: 'window.FileReader'},
  {bcdKey: 'api.Blob', category: 'files', runtimeKey: 'window.Blob', title: 'Blob'},
  {bcdKey: 'api.DataTransfer', category: 'files', runtimeKey: 'window.DataTransfer'},
  {bcdKey: 'api.FormData', category: 'files', runtimeKey: 'window.FormData'},

  // ─── Streams ──────────────────────────────────────────────────────────────
  {bcdKey: 'api.ReadableStream', category: 'streams', runtimeKey: 'window.ReadableStream'},
  {bcdKey: 'api.ReadableStreamDefaultReader', category: 'streams', runtimeKey: 'window.ReadableStreamDefaultReader'},
  {bcdKey: 'api.WritableStream', category: 'streams', runtimeKey: 'window.WritableStream'},
  {bcdKey: 'api.WritableStreamDefaultWriter', category: 'streams', runtimeKey: 'window.WritableStreamDefaultWriter'},
  {bcdKey: 'api.TransformStream', category: 'streams', runtimeKey: 'window.TransformStream'},
  {bcdKey: 'api.TextEncoder', category: 'streams', runtimeKey: 'window.TextEncoder'},
  {bcdKey: 'api.TextDecoder', category: 'streams', runtimeKey: 'window.TextDecoder'},
  {bcdKey: 'api.TextEncoderStream', category: 'streams', runtimeKey: 'window.TextEncoderStream'},
  {bcdKey: 'api.TextDecoderStream', category: 'streams', runtimeKey: 'window.TextDecoderStream'},
  {bcdKey: 'api.CompressionStream', category: 'streams', runtimeKey: 'window.CompressionStream'},
  {bcdKey: 'api.DecompressionStream', category: 'streams', runtimeKey: 'window.DecompressionStream'},

  // ─── Network ──────────────────────────────────────────────────────────────
  {bcdKey: 'api.fetch', category: 'network', runtimeKey: 'window.fetch', title: 'Fetch'},
  {bcdKey: 'api.NavigatorUAData', category: 'network', runtimeKey: 'navigator.userAgentData', title: 'UA Client Hints'},
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
  {bcdKey: 'api.URL.canParse_static', category: 'network', runtimeKey: 'window.URL', title: 'URL.canParse()'},
  {bcdKey: 'api.URL.createObjectURL_static', category: 'network', runtimeKey: 'window.URL', title: 'URL.createObjectURL()'},
  {bcdKey: 'api.AbortSignal.any_static', category: 'network', runtimeKey: 'window.AbortSignal', title: 'AbortSignal.any()'},
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
  {bcdKey: 'api.queueMicrotask', category: 'workers', runtimeKey: 'window.queueMicrotask', title: 'queueMicrotask()'},

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
  {bcdKey: 'api.PerformancePaintTiming', category: 'observation', runtimeKey: 'window.PerformancePaintTiming'},
  {bcdKey: 'api.Window.requestIdleCallback', category: 'observation', runtimeKey: 'window.requestIdleCallback', title: 'requestIdleCallback'},
  {bcdKey: 'api.Window.cancelIdleCallback', category: 'observation', runtimeKey: 'window.cancelIdleCallback'},
  {bcdKey: 'api.Window.requestAnimationFrame', category: 'observation', runtimeKey: 'window.requestAnimationFrame', title: 'requestAnimationFrame'},
  {bcdKey: 'api.Window.cancelAnimationFrame', category: 'observation', runtimeKey: 'window.cancelAnimationFrame'},
  {bcdKey: 'api.Performance.mark', category: 'observation', runtimeKey: 'window.performance', title: 'performance.mark()'},
  {bcdKey: 'api.Performance.measure', category: 'observation', runtimeKey: 'window.performance', title: 'performance.measure()'},
  {bcdKey: 'api.Performance.now', category: 'observation', runtimeKey: 'window.performance', title: 'performance.now()'},

  // ─── Platform UI ──────────────────────────────────────────────────────────
  {bcdKey: 'api.Notification', category: 'platform-ui', runtimeKey: 'window.Notification', title: 'Notifications'},
  {bcdKey: 'api.Navigator.share', category: 'platform-ui', runtimeKey: 'navigator.share', title: 'Web Share'},
  {bcdKey: 'api.Navigator.canShare', category: 'platform-ui', runtimeKey: 'navigator.canShare', title: 'canShare()'},
  {bcdKey: 'api.WakeLock', category: 'platform-ui', runtimeKey: 'navigator.wakeLock', title: 'Screen Wake Lock'},
  {bcdKey: 'api.IdleDetector', category: 'platform-ui', runtimeKey: 'window.IdleDetector', title: 'Idle Detection'},
  {bcdKey: 'api.Clipboard', category: 'platform-ui', runtimeKey: 'navigator.clipboard', title: 'Clipboard'},
  {bcdKey: 'api.Navigator.vibrate', category: 'platform-ui', runtimeKey: 'navigator.vibrate', title: 'Vibration'},
  {bcdKey: 'api.Navigator.setAppBadge', category: 'platform-ui', runtimeKey: 'navigator.setAppBadge', title: 'App Badging'},
  {bcdKey: 'api.Navigator.clearAppBadge', category: 'platform-ui', runtimeKey: 'navigator.clearAppBadge', title: 'clearAppBadge()'},
  {bcdKey: 'api.Selection', category: 'platform-ui', runtimeKey: 'window.getSelection'},
  {bcdKey: 'api.Range', category: 'platform-ui', runtimeKey: 'window.Range'},
  {bcdKey: 'api.Document.fullscreenEnabled', category: 'platform-ui', runtimeKey: 'document.fullscreenEnabled', title: 'Fullscreen API'},
  {bcdKey: 'api.Document.exitFullscreen', category: 'platform-ui', runtimeKey: 'document.exitFullscreen', title: 'exitFullscreen()'},
  {bcdKey: 'api.Element.requestFullscreen', category: 'platform-ui', runtimeKey: 'window.Element.prototype.requestFullscreen', title: 'requestFullscreen()'},
  {bcdKey: 'api.Document.exitPointerLock', category: 'platform-ui', runtimeKey: 'document.exitPointerLock', title: 'Pointer Lock'},
  {bcdKey: 'api.Element.requestPointerLock', category: 'platform-ui', runtimeKey: 'window.Element.prototype.requestPointerLock', title: 'requestPointerLock()'},
  {bcdKey: 'api.Document.adoptedStyleSheets', category: 'platform-ui', runtimeKey: 'document.adoptedStyleSheets', title: 'Constructable Stylesheets'},
  {bcdKey: 'api.Document.elementFromPoint', category: 'platform-ui', runtimeKey: 'document.elementFromPoint'},
  {bcdKey: 'api.Element.scrollIntoView', category: 'platform-ui', runtimeKey: 'window.Element.prototype.scrollIntoView'},
  {bcdKey: 'api.Element.toggleAttribute', category: 'platform-ui', runtimeKey: 'window.Element.prototype.toggleAttribute'},
  {bcdKey: 'api.HTMLInputElement.showPicker', category: 'platform-ui', runtimeKey: 'window.HTMLInputElement', title: 'input.showPicker()'},
  {bcdKey: 'api.HTMLInputElement.checkValidity', category: 'platform-ui', runtimeKey: 'window.HTMLInputElement', title: 'checkValidity()'},
  {bcdKey: 'api.HTMLFormElement.requestSubmit', category: 'platform-ui', runtimeKey: 'window.HTMLFormElement', title: 'form.requestSubmit()'},
  {bcdKey: 'api.HTMLImageElement.decode', category: 'platform-ui', runtimeKey: 'window.HTMLImageElement', title: 'img.decode()'},
  {bcdKey: 'api.HTMLImageElement.loading', category: 'platform-ui', runtimeKey: 'window.HTMLImageElement', title: 'img loading="lazy"'},
  {bcdKey: 'api.HTMLDialogElement.showModal', category: 'platform-ui', runtimeKey: 'window.HTMLDialogElement', title: 'dialog.showModal()'},
  {bcdKey: 'api.HTMLElement.dataset', category: 'platform-ui', runtimeKey: 'window.HTMLElement', title: 'element.dataset'},
  {bcdKey: 'api.Document.elementsFromPoint', category: 'platform-ui', runtimeKey: 'document.elementsFromPoint'},
  {bcdKey: 'api.Document.exitPictureInPicture', category: 'platform-ui', runtimeKey: 'document.exitPictureInPicture'},
  {bcdKey: 'api.HTMLElement.inert', category: 'platform-ui', runtimeKey: 'window.HTMLElement', title: 'inert attribute'},
  {bcdKey: 'api.MediaQueryList', category: 'platform-ui', runtimeKey: 'window.matchMedia', title: 'matchMedia'},
  {bcdKey: 'api.Navigator.getAutoplayPolicy', category: 'platform-ui', runtimeKey: 'navigator.getAutoplayPolicy', title: 'getAutoplayPolicy()'},
  {bcdKey: 'api.HTMLDetailsElement', category: 'platform-ui', runtimeKey: 'window.HTMLDetailsElement', title: '<details>'},
  {bcdKey: 'api.PaymentRequest', category: 'platform-ui', runtimeKey: 'window.PaymentRequest'},
  // DOM utilities & events
  {bcdKey: 'api.DOMParser', category: 'platform-ui', runtimeKey: 'window.DOMParser'},
  {bcdKey: 'api.XMLSerializer', category: 'platform-ui', runtimeKey: 'window.XMLSerializer'},
  {bcdKey: 'api.NodeIterator', category: 'platform-ui', runtimeKey: 'window.NodeIterator'},
  {bcdKey: 'api.TreeWalker', category: 'platform-ui', runtimeKey: 'window.TreeWalker'},
  {bcdKey: 'api.PointerEvent', category: 'platform-ui', runtimeKey: 'window.PointerEvent'},
  {bcdKey: 'api.InputEvent', category: 'platform-ui', runtimeKey: 'window.InputEvent'},
  {bcdKey: 'api.SubmitEvent', category: 'platform-ui', runtimeKey: 'window.SubmitEvent'},
  {bcdKey: 'api.HashChangeEvent', category: 'platform-ui', runtimeKey: 'window.HashChangeEvent'},
  {bcdKey: 'api.PopStateEvent', category: 'platform-ui', runtimeKey: 'window.PopStateEvent'},
  {bcdKey: 'api.StorageEvent', category: 'platform-ui', runtimeKey: 'window.StorageEvent'},
  {bcdKey: 'api.PageTransitionEvent', category: 'platform-ui', runtimeKey: 'window.PageTransitionEvent'},
  {bcdKey: 'api.BeforeUnloadEvent', category: 'platform-ui', runtimeKey: 'window.BeforeUnloadEvent'},
  {bcdKey: 'api.PromiseRejectionEvent', category: 'platform-ui', runtimeKey: 'window.PromiseRejectionEvent'},

  // ─── Components (Web Components) ──────────────────────────────────────────
  {bcdKey: 'api.CustomElementRegistry', category: 'components', runtimeKey: 'window.customElements', title: 'Custom Elements'},
  {bcdKey: 'api.ShadowRoot', category: 'components', runtimeKey: 'window.ShadowRoot', title: 'Shadow DOM'},
  {bcdKey: 'api.HTMLTemplateElement', category: 'components', runtimeKey: 'window.HTMLTemplateElement', title: '<template>'},
  {bcdKey: 'api.HTMLSlotElement', category: 'components', runtimeKey: 'window.HTMLSlotElement', title: '<slot>'},
  {bcdKey: 'api.ElementInternals', category: 'components', runtimeKey: 'window.ElementInternals'},
  {bcdKey: 'api.CSSStyleSheet', category: 'components', runtimeKey: 'window.CSSStyleSheet', title: 'Constructable CSSStyleSheet'},
  {bcdKey: 'api.Element.attachShadow', category: 'components', runtimeKey: 'window.Element.prototype.attachShadow', title: 'Element.attachShadow()'},

  // ─── Media Capture ────────────────────────────────────────────────────────
  {bcdKey: 'api.MediaDevices.getUserMedia', category: 'media-capture', runtimeKey: 'navigator.mediaDevices', title: 'getUserMedia'},
  {bcdKey: 'api.MediaDevices.getDisplayMedia', category: 'media-capture', runtimeKey: 'navigator.mediaDevices', title: 'Screen Capture'},
  {bcdKey: 'api.MediaRecorder', category: 'media-capture', runtimeKey: 'window.MediaRecorder'},
  {bcdKey: 'api.PictureInPictureWindow', category: 'media-capture', runtimeKey: 'document.pictureInPictureEnabled', title: 'Picture-in-Picture'},
  {bcdKey: 'api.MediaStream', category: 'media-capture', runtimeKey: 'window.MediaStream'},
  {bcdKey: 'api.MediaStreamTrack', category: 'media-capture', runtimeKey: 'window.MediaStreamTrack'},
  {bcdKey: 'api.HTMLMediaElement', category: 'media-capture', runtimeKey: 'window.HTMLMediaElement'},
  {bcdKey: 'api.HTMLMediaElement.canPlayType', category: 'media-capture', runtimeKey: 'window.HTMLMediaElement', title: 'media.canPlayType()'},
  {bcdKey: 'api.MediaCapabilities', category: 'media-capture', runtimeKey: 'navigator.mediaCapabilities'},
  {bcdKey: 'api.MediaSource', category: 'media-capture', runtimeKey: 'window.MediaSource'},
  {bcdKey: 'api.SourceBuffer', category: 'media-capture', runtimeKey: 'window.SourceBuffer'},

  // ─── Audio & Video ────────────────────────────────────────────────────────
  {bcdKey: 'api.AudioContext', category: 'audio-video', runtimeKey: 'window.AudioContext', title: 'Web Audio'},
  {bcdKey: 'api.AudioWorkletNode', category: 'audio-video', runtimeKey: 'window.AudioWorkletNode'},
  {bcdKey: 'api.AnalyserNode', category: 'audio-video', runtimeKey: 'window.AnalyserNode'},
  {bcdKey: 'api.OscillatorNode', category: 'audio-video', runtimeKey: 'window.OscillatorNode'},
  {bcdKey: 'api.GainNode', category: 'audio-video', runtimeKey: 'window.GainNode'},
  {bcdKey: 'api.BiquadFilterNode', category: 'audio-video', runtimeKey: 'window.BiquadFilterNode'},
  {bcdKey: 'api.ConvolverNode', category: 'audio-video', runtimeKey: 'window.ConvolverNode'},
  {bcdKey: 'api.DelayNode', category: 'audio-video', runtimeKey: 'window.DelayNode'},
  {bcdKey: 'api.DynamicsCompressorNode', category: 'audio-video', runtimeKey: 'window.DynamicsCompressorNode'},
  {bcdKey: 'api.MIDIAccess', category: 'audio-video', runtimeKey: 'navigator.requestMIDIAccess', title: 'Web MIDI'},
  {bcdKey: 'api.SpeechSynthesis', category: 'audio-video', runtimeKey: 'window.speechSynthesis', title: 'Speech Synthesis'},
  {bcdKey: 'api.SpeechSynthesisUtterance', category: 'audio-video', runtimeKey: 'window.SpeechSynthesisUtterance'},
  {bcdKey: 'api.SpeechRecognition', category: 'audio-video', runtimeKey: 'window.SpeechRecognition', title: 'Speech Recognition'},
  {bcdKey: 'api.MediaSession', category: 'audio-video', runtimeKey: 'navigator.mediaSession'},
  {bcdKey: 'api.HTMLVideoElement', category: 'audio-video', runtimeKey: 'window.HTMLVideoElement'},
  // WebCodecs
  {bcdKey: 'api.VideoFrame', category: 'audio-video', runtimeKey: 'window.VideoFrame', title: 'WebCodecs: VideoFrame'},
  {bcdKey: 'api.VideoDecoder', category: 'audio-video', runtimeKey: 'window.VideoDecoder'},
  {bcdKey: 'api.VideoEncoder', category: 'audio-video', runtimeKey: 'window.VideoEncoder'},
  {bcdKey: 'api.AudioData', category: 'audio-video', runtimeKey: 'window.AudioData', title: 'WebCodecs: AudioData'},
  {bcdKey: 'api.AudioDecoder', category: 'audio-video', runtimeKey: 'window.AudioDecoder'},
  {bcdKey: 'api.AudioEncoder', category: 'audio-video', runtimeKey: 'window.AudioEncoder'},
  {bcdKey: 'api.ImageDecoder', category: 'audio-video', runtimeKey: 'window.ImageDecoder', title: 'WebCodecs: ImageDecoder'},

  // ─── Graphics & Animation ─────────────────────────────────────────────────
  {bcdKey: 'api.CanvasRenderingContext2D', category: 'graphics', runtimeKey: 'window.CanvasRenderingContext2D', title: 'Canvas 2D'},
  {bcdKey: 'api.Path2D', category: 'graphics', runtimeKey: 'window.Path2D'},
  {bcdKey: 'api.ImageBitmap', category: 'graphics', runtimeKey: 'window.createImageBitmap'},
  {bcdKey: 'api.OffscreenCanvasRenderingContext2D', category: 'graphics', runtimeKey: 'window.OffscreenCanvasRenderingContext2D'},
  {bcdKey: 'api.WebGLRenderingContext', category: 'graphics', runtimeKey: 'window.WebGLRenderingContext', title: 'WebGL'},
  {bcdKey: 'api.WebGL2RenderingContext', category: 'graphics', runtimeKey: 'window.WebGL2RenderingContext', title: 'WebGL2'},
  {bcdKey: 'api.GPU', category: 'graphics', runtimeKey: 'navigator.gpu', title: 'WebGPU'},
  {bcdKey: 'api.GPUDevice', category: 'graphics', runtimeKey: 'window.GPUDevice'},
  {bcdKey: 'api.GPUBuffer', category: 'graphics', runtimeKey: 'window.GPUBuffer'},
  {bcdKey: 'api.GPUTexture', category: 'graphics', runtimeKey: 'window.GPUTexture'},
  {bcdKey: 'api.GPUShaderModule', category: 'graphics', runtimeKey: 'window.GPUShaderModule'},
  {bcdKey: 'api.GPURenderPipeline', category: 'graphics', runtimeKey: 'window.GPURenderPipeline'},
  {bcdKey: 'api.GPUCommandEncoder', category: 'graphics', runtimeKey: 'window.GPUCommandEncoder'},
  {bcdKey: 'api.OffscreenCanvas', category: 'graphics', runtimeKey: 'window.OffscreenCanvas'},
  {bcdKey: 'api.Animation', category: 'graphics', runtimeKey: 'window.Animation', title: 'Web Animations'},
  {bcdKey: 'api.KeyframeEffect', category: 'graphics', runtimeKey: 'window.KeyframeEffect'},
  {bcdKey: 'api.ScrollTimeline', category: 'graphics', runtimeKey: 'window.ScrollTimeline', title: 'Scroll Timeline'},
  {bcdKey: 'api.ViewTimeline', category: 'graphics', runtimeKey: 'window.ViewTimeline', title: 'View Timeline'},
  // Geometry primitives
  {bcdKey: 'api.DOMRect', category: 'graphics', runtimeKey: 'window.DOMRect'},
  {bcdKey: 'api.DOMMatrix', category: 'graphics', runtimeKey: 'window.DOMMatrix'},
  {bcdKey: 'api.DOMPoint', category: 'graphics', runtimeKey: 'window.DOMPoint'},
  {bcdKey: 'api.DOMQuad', category: 'graphics', runtimeKey: 'window.DOMQuad'},

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
  {bcdKey: 'api.Crypto.randomUUID', category: 'identity', runtimeKey: 'window.crypto.randomUUID', title: 'crypto.randomUUID()'},
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
  {bcdKey: 'api.structuredClone', category: 'frontier', runtimeKey: 'window.structuredClone', title: 'structuredClone()'},
  // Modern CSS
  {bcdKey: 'api.CSSContainerRule', category: 'frontier', runtimeKey: 'window.CSSContainerRule', title: 'CSS Container Queries'},
  {bcdKey: 'api.CSSCounterStyleRule', category: 'frontier', runtimeKey: 'window.CSSCounterStyleRule'},
  {bcdKey: 'api.Highlight', category: 'frontier', runtimeKey: 'window.Highlight', title: 'CSS Custom Highlight'},
  {bcdKey: 'api.HighlightRegistry', category: 'frontier', runtimeKey: 'window.CSS', title: 'CSS.highlights'},
  {bcdKey: 'api.Document.requestStorageAccessFor', category: 'frontier', runtimeKey: 'document.requestStorageAccessFor', title: 'requestStorageAccessFor()'},
  {bcdKey: 'api.crossOriginIsolated', category: 'frontier', runtimeKey: 'window.crossOriginIsolated', title: 'crossOriginIsolated'},
  {bcdKey: 'api.CSS.escape_static', category: 'frontier', runtimeKey: 'window.CSS', title: 'CSS.escape()'},
  {bcdKey: 'api.CSS.paintWorklet_static', category: 'frontier', runtimeKey: 'window.CSS', title: 'CSS Houdini Paint'},
  {bcdKey: 'api.XRSystem', category: 'frontier', runtimeKey: 'navigator.xr', title: 'WebXR'},
  {bcdKey: 'api.XRSession', category: 'frontier', runtimeKey: 'window.XRSession'},
  {bcdKey: 'api.reportError', category: 'frontier', runtimeKey: 'window.reportError', title: 'reportError()'},
  {bcdKey: 'api.atob', category: 'frontier', runtimeKey: 'window.atob', title: 'atob() base64 decode'},
  {bcdKey: 'api.btoa', category: 'frontier', runtimeKey: 'window.btoa', title: 'btoa() base64 encode'},

  // ─── T1 — on-device AI (Chrome built-in AI) ──────────────────────────
  {bcdKey: 'api.LanguageModel', category: 'frontier', runtimeKey: 'window.LanguageModel', title: 'LanguageModel (Prompt API)'},
  {bcdKey: 'api.LanguageDetector', category: 'frontier', runtimeKey: 'window.LanguageDetector'},
  {bcdKey: 'api.Translator', category: 'frontier', runtimeKey: 'window.Translator'},
  {bcdKey: 'api.Summarizer', category: 'frontier', runtimeKey: 'window.Summarizer'},

  // ─── T1 — frontier UI / DOM primitives ────────────────────────────
  {bcdKey: 'api.EyeDropper', category: 'frontier', runtimeKey: 'window.EyeDropper'},
  {bcdKey: 'api.BarcodeDetector', category: 'frontier', runtimeKey: 'window.BarcodeDetector', title: 'Shape Detection: BarcodeDetector'},
  {bcdKey: 'api.CloseWatcher', category: 'frontier', runtimeKey: 'window.CloseWatcher'},
  {bcdKey: 'api.EditContext', category: 'frontier', runtimeKey: 'window.EditContext'},
  {bcdKey: 'api.ViewTransition', category: 'frontier', runtimeKey: 'window.ViewTransition'},
  {bcdKey: 'api.FontData', category: 'frontier', runtimeKey: 'window.FontData', title: 'Local Font Access'},

  // ─── T1 — Scheduler companions + TC39 stage-3/4 globals ───────────────
  {bcdKey: 'api.TaskController', category: 'frontier', runtimeKey: 'window.TaskController'},
  {bcdKey: 'api.TaskSignal', category: 'frontier', runtimeKey: 'window.TaskSignal'},
  {bcdKey: 'javascript.builtins.DisposableStack', category: 'frontier', runtimeKey: 'window.DisposableStack', title: 'Explicit Resource Management'},
  {bcdKey: 'javascript.builtins.AsyncDisposableStack', category: 'frontier', runtimeKey: 'window.AsyncDisposableStack'},
  {bcdKey: 'javascript.builtins.Temporal', category: 'frontier', runtimeKey: 'window.Temporal', title: 'Temporal (TC39)'},
  {bcdKey: 'api.Observable', category: 'frontier', runtimeKey: 'window.Observable', title: 'Observable (TC39)'},

  // ─── T1 — Document PiP (separate from media PiP) ───────────────────
  {bcdKey: 'api.DocumentPictureInPicture', category: 'media-capture', runtimeKey: 'window.documentPictureInPicture', title: 'Document Picture-in-Picture'},

  // ─── T1 — PWA + File Handling platform UI ────────────────────────
  {bcdKey: 'api.LaunchQueue', category: 'platform-ui', runtimeKey: 'window.launchQueue', title: 'File Handling (LaunchQueue)'},
  {bcdKey: 'api.LaunchParams', category: 'platform-ui', runtimeKey: 'window.LaunchParams'},
  {bcdKey: 'api.WindowControlsOverlay', category: 'platform-ui', runtimeKey: 'navigator.windowControlsOverlay', title: 'Window Controls Overlay'},
  {bcdKey: 'api.VirtualKeyboard', category: 'platform-ui', runtimeKey: 'navigator.virtualKeyboard'},
  {bcdKey: 'api.Sanitizer', category: 'platform-ui', runtimeKey: 'window.Sanitizer', title: 'HTML Sanitizer'},

  // ─── T1 — Identity & Security additions ───────────────────────────
  {bcdKey: 'api.TrustedHTML', category: 'identity', runtimeKey: 'window.TrustedHTML', title: 'Trusted Types: TrustedHTML'},
  {bcdKey: 'api.TrustedTypePolicy', category: 'identity', runtimeKey: 'window.TrustedTypePolicy'},
  {bcdKey: 'api.TrustedTypePolicyFactory', category: 'identity', runtimeKey: 'window.trustedTypes', title: 'trustedTypes'},
  {bcdKey: 'api.DigitalCredential', category: 'identity', runtimeKey: 'window.DigitalCredential', title: 'Digital Credentials'},

  // ─── T1 — Observation: Web Vitals + Profiler ───────────────────────
  {bcdKey: 'api.Profiler', category: 'observation', runtimeKey: 'window.Profiler', title: 'JS Self-Profiling'},
  {bcdKey: 'api.LargestContentfulPaint', category: 'observation', runtimeKey: 'window.LargestContentfulPaint', title: 'LCP (Core Web Vital)'},
  {bcdKey: 'api.LayoutShift', category: 'observation', runtimeKey: 'window.LayoutShift', title: 'CLS (Core Web Vital)'},

  // ─── T1 — Files + Graphics frontier additions ───────────────────────
  {bcdKey: 'api.FileSystemObserver', category: 'files', runtimeKey: 'window.FileSystemObserver'},
  // Spec rename: was 'TimelineTrigger', now 'AnimationTrigger' (CSS Animation Trigger).
  // Chrome 149 still exposes it under the old name; this entry follows the BCD/spec.
  {bcdKey: 'api.AnimationTrigger', category: 'graphics', runtimeKey: 'window.AnimationTrigger', title: 'Animation Trigger (scroll-driven)'},

  // ─── T2 — WebRTC primitives ──────────────────────────────────
  {bcdKey: 'api.RTCDataChannel', category: 'network', runtimeKey: 'window.RTCDataChannel'},
  {bcdKey: 'api.RTCSessionDescription', category: 'network', runtimeKey: 'window.RTCSessionDescription'},
  {bcdKey: 'api.RTCIceCandidate', category: 'network', runtimeKey: 'window.RTCIceCandidate'},
  {bcdKey: 'api.RTCRtpReceiver', category: 'network', runtimeKey: 'window.RTCRtpReceiver'},
  {bcdKey: 'api.RTCRtpSender', category: 'network', runtimeKey: 'window.RTCRtpSender'},
  {bcdKey: 'api.RTCRtpTransceiver', category: 'network', runtimeKey: 'window.RTCRtpTransceiver'},
  {bcdKey: 'api.RTCStatsReport', category: 'network', runtimeKey: 'window.RTCStatsReport'},
  {bcdKey: 'api.RTCDtlsTransport', category: 'network', runtimeKey: 'window.RTCDtlsTransport'},
  {bcdKey: 'api.RTCIceTransport', category: 'network', runtimeKey: 'window.RTCIceTransport'},
  {bcdKey: 'api.RTCSctpTransport', category: 'network', runtimeKey: 'window.RTCSctpTransport'},
  {bcdKey: 'api.RTCEncodedAudioFrame', category: 'network', runtimeKey: 'window.RTCEncodedAudioFrame'},
  {bcdKey: 'api.RTCEncodedVideoFrame', category: 'network', runtimeKey: 'window.RTCEncodedVideoFrame'},

  // ─── T2 — Web Audio nodes (more) ──────────────────────────────
  {bcdKey: 'api.OfflineAudioContext', category: 'audio-video', runtimeKey: 'window.OfflineAudioContext'},
  {bcdKey: 'api.MediaElementAudioSourceNode', category: 'audio-video', runtimeKey: 'window.MediaElementAudioSourceNode'},
  {bcdKey: 'api.MediaStreamAudioSourceNode', category: 'audio-video', runtimeKey: 'window.MediaStreamAudioSourceNode'},
  {bcdKey: 'api.MediaStreamAudioDestinationNode', category: 'audio-video', runtimeKey: 'window.MediaStreamAudioDestinationNode'},
  {bcdKey: 'api.MediaStreamTrackAudioSourceNode', category: 'audio-video', runtimeKey: 'window.MediaStreamTrackAudioSourceNode'},
  {bcdKey: 'api.PannerNode', category: 'audio-video', runtimeKey: 'window.PannerNode'},
  {bcdKey: 'api.IIRFilterNode', category: 'audio-video', runtimeKey: 'window.IIRFilterNode'},
  {bcdKey: 'api.StereoPannerNode', category: 'audio-video', runtimeKey: 'window.StereoPannerNode'},
  {bcdKey: 'api.ConstantSourceNode', category: 'audio-video', runtimeKey: 'window.ConstantSourceNode'},
  {bcdKey: 'api.ChannelMergerNode', category: 'audio-video', runtimeKey: 'window.ChannelMergerNode'},
  {bcdKey: 'api.ChannelSplitterNode', category: 'audio-video', runtimeKey: 'window.ChannelSplitterNode'},
  {bcdKey: 'api.WaveShaperNode', category: 'audio-video', runtimeKey: 'window.WaveShaperNode'},
  {bcdKey: 'api.PeriodicWave', category: 'audio-video', runtimeKey: 'window.PeriodicWave'},

  // ─── T2 — WebXR (deep dive) ──────────────────────────────────
  {bcdKey: 'api.XRReferenceSpace', category: 'frontier', runtimeKey: 'window.XRReferenceSpace'},
  {bcdKey: 'api.XRFrame', category: 'frontier', runtimeKey: 'window.XRFrame'},
  {bcdKey: 'api.XRInputSource', category: 'frontier', runtimeKey: 'window.XRInputSource'},
  {bcdKey: 'api.XRRigidTransform', category: 'frontier', runtimeKey: 'window.XRRigidTransform'},
  {bcdKey: 'api.XRHitTestSource', category: 'frontier', runtimeKey: 'window.XRHitTestSource'},
  {bcdKey: 'api.XRWebGLLayer', category: 'frontier', runtimeKey: 'window.XRWebGLLayer'},
  {bcdKey: 'api.XRAnchor', category: 'frontier', runtimeKey: 'window.XRAnchor'},
  {bcdKey: 'api.XRLightProbe', category: 'frontier', runtimeKey: 'window.XRLightProbe'},
  {bcdKey: 'api.XRRay', category: 'frontier', runtimeKey: 'window.XRRay'},
  {bcdKey: 'api.XRPose', category: 'frontier', runtimeKey: 'window.XRPose'},

  // ─── T2 — WebAuthn + Credentials family ───────────────────────
  {bcdKey: 'api.Credential', category: 'identity', runtimeKey: 'window.Credential'},
  {bcdKey: 'api.AuthenticatorAssertionResponse', category: 'identity', runtimeKey: 'window.AuthenticatorAssertionResponse'},
  {bcdKey: 'api.AuthenticatorAttestationResponse', category: 'identity', runtimeKey: 'window.AuthenticatorAttestationResponse'},
  {bcdKey: 'api.AuthenticatorResponse', category: 'identity', runtimeKey: 'window.AuthenticatorResponse'},
  {bcdKey: 'api.PasswordCredential', category: 'identity', runtimeKey: 'window.PasswordCredential'},
  {bcdKey: 'api.FederatedCredential', category: 'identity', runtimeKey: 'window.FederatedCredential'},
  {bcdKey: 'api.IdentityProvider', category: 'identity', runtimeKey: 'window.IdentityProvider', title: 'FedCM IdentityProvider'},

  // ─── T2 — Bluetooth GATT chain ───────────────────────────────
  {bcdKey: 'api.BluetoothDevice', category: 'hardware', runtimeKey: 'window.BluetoothDevice'},
  {bcdKey: 'api.BluetoothRemoteGATTServer', category: 'hardware', runtimeKey: 'window.BluetoothRemoteGATTServer'},
  {bcdKey: 'api.BluetoothRemoteGATTService', category: 'hardware', runtimeKey: 'window.BluetoothRemoteGATTService'},
  {bcdKey: 'api.BluetoothRemoteGATTCharacteristic', category: 'hardware', runtimeKey: 'window.BluetoothRemoteGATTCharacteristic'},
  {bcdKey: 'api.BluetoothUUID', category: 'hardware', runtimeKey: 'window.BluetoothUUID'},

  // ─── T2 — USB device family ──────────────────────────────────
  {bcdKey: 'api.USBDevice', category: 'hardware', runtimeKey: 'window.USBDevice'},
  {bcdKey: 'api.USBConfiguration', category: 'hardware', runtimeKey: 'window.USBConfiguration'},
  {bcdKey: 'api.USBInterface', category: 'hardware', runtimeKey: 'window.USBInterface'},

  // ─── T2 — MIDI ports + maps ──────────────────────────────────
  {bcdKey: 'api.MIDIInput', category: 'audio-video', runtimeKey: 'window.MIDIInput'},
  {bcdKey: 'api.MIDIOutput', category: 'audio-video', runtimeKey: 'window.MIDIOutput'},
  {bcdKey: 'api.MIDIInputMap', category: 'audio-video', runtimeKey: 'window.MIDIInputMap'},
  {bcdKey: 'api.MIDIOutputMap', category: 'audio-video', runtimeKey: 'window.MIDIOutputMap'},

  // ─── T2 — IndexedDB cursor + factory ───────────────────────────
  {bcdKey: 'api.IDBCursor', category: 'storage', runtimeKey: 'window.IDBCursor'},
  {bcdKey: 'api.IDBCursorWithValue', category: 'storage', runtimeKey: 'window.IDBCursorWithValue'},
  {bcdKey: 'api.IDBFactory', category: 'storage', runtimeKey: 'window.IDBFactory'},
  {bcdKey: 'api.IDBRequest', category: 'storage', runtimeKey: 'window.IDBRequest'},
  {bcdKey: 'api.IDBOpenDBRequest', category: 'storage', runtimeKey: 'window.IDBOpenDBRequest'},

  // ─── T2 — EME / DRM ──────────────────────────────────────
  {bcdKey: 'api.MediaKeys', category: 'media-capture', runtimeKey: 'window.MediaKeys', title: 'Encrypted Media (EME)'},
  {bcdKey: 'api.MediaKeySession', category: 'media-capture', runtimeKey: 'window.MediaKeySession'},
  {bcdKey: 'api.MediaKeySystemAccess', category: 'media-capture', runtimeKey: 'window.MediaKeySystemAccess'},
  {bcdKey: 'api.MediaKeyStatusMap', category: 'media-capture', runtimeKey: 'window.MediaKeyStatusMap'},
  {bcdKey: 'api.Navigator.requestMediaKeySystemAccess', category: 'media-capture', runtimeKey: 'navigator.requestMediaKeySystemAccess', title: 'requestMediaKeySystemAccess()'},

  // ─── T2 — Media Stream processing ────────────────────────────
  {bcdKey: 'api.MediaStreamTrackProcessor', category: 'media-capture', runtimeKey: 'window.MediaStreamTrackProcessor'},
  {bcdKey: 'api.MediaStreamTrackGenerator', category: 'media-capture', runtimeKey: 'window.MediaStreamTrackGenerator'},
  {bcdKey: 'api.CaptureController', category: 'media-capture', runtimeKey: 'window.CaptureController'},

  // ─── T2 — Presentation API (Cast) ─────────────────────────────
  {bcdKey: 'api.Presentation', category: 'hardware', runtimeKey: 'navigator.presentation', title: 'Presentation API'},
  {bcdKey: 'api.PresentationAvailability', category: 'hardware', runtimeKey: 'window.PresentationAvailability'},
  {bcdKey: 'api.PresentationConnection', category: 'hardware', runtimeKey: 'window.PresentationConnection'},
  {bcdKey: 'api.PresentationConnectionList', category: 'hardware', runtimeKey: 'window.PresentationConnectionList'},
  {bcdKey: 'api.PresentationReceiver', category: 'hardware', runtimeKey: 'window.PresentationReceiver'},
  {bcdKey: 'api.RemotePlayback', category: 'hardware', runtimeKey: 'window.RemotePlayback'},

  // ─── T2 — Push / Notifications backend ──────────────────────────
  {bcdKey: 'api.PushManager', category: 'workers', runtimeKey: 'window.PushManager'},
  {bcdKey: 'api.PushSubscription', category: 'workers', runtimeKey: 'window.PushSubscription'},
  {bcdKey: 'api.PushSubscriptionOptions', category: 'workers', runtimeKey: 'window.PushSubscriptionOptions'},

  // ─── T2 — Background Fetch / Sync ────────────────────────────
  {bcdKey: 'api.BackgroundFetchManager', category: 'workers', runtimeKey: 'window.BackgroundFetchManager'},
  {bcdKey: 'api.BackgroundFetchRegistration', category: 'workers', runtimeKey: 'window.BackgroundFetchRegistration'},
  {bcdKey: 'api.BackgroundFetchRecord', category: 'workers', runtimeKey: 'window.BackgroundFetchRecord'},
  {bcdKey: 'api.PeriodicSyncManager', category: 'workers', runtimeKey: 'window.PeriodicSyncManager'},
  {bcdKey: 'api.SyncManager', category: 'workers', runtimeKey: 'window.SyncManager', title: 'Background Sync'},

  // ─── T2 — Navigation API extras ────────────────────────────────
  {bcdKey: 'api.NavigationHistoryEntry', category: 'frontier', runtimeKey: 'window.NavigationHistoryEntry'},
  {bcdKey: 'api.NavigationActivation', category: 'frontier', runtimeKey: 'window.NavigationActivation'},
  {bcdKey: 'api.NavigationDestination', category: 'frontier', runtimeKey: 'window.NavigationDestination'},
  {bcdKey: 'api.NavigationTransition', category: 'frontier', runtimeKey: 'window.NavigationTransition'},
  {bcdKey: 'api.NavigationPreloadManager', category: 'frontier', runtimeKey: 'window.NavigationPreloadManager'},

  // ─── T2 — CSSOM Typed Object Model ──────────────────────────────
  {bcdKey: 'api.StylePropertyMap', category: 'frontier', runtimeKey: 'window.StylePropertyMap', title: 'CSS Typed OM'},
  {bcdKey: 'api.StylePropertyMapReadOnly', category: 'frontier', runtimeKey: 'window.StylePropertyMapReadOnly'},

  // ─── T2 — More Sensors ────────────────────────────────────
  {bcdKey: 'api.AbsoluteOrientationSensor', category: 'sensors', runtimeKey: 'window.AbsoluteOrientationSensor'},
  {bcdKey: 'api.GravitySensor', category: 'sensors', runtimeKey: 'window.GravitySensor'},
  {bcdKey: 'api.DevicePosture', category: 'sensors', runtimeKey: 'navigator.devicePosture', title: 'Device Posture'},
  {bcdKey: 'api.PressureRecord', category: 'sensors', runtimeKey: 'window.PressureRecord'},

  // ─── T2 — Cookie Store manager ───────────────────────────────
  {bcdKey: 'api.CookieStoreManager', category: 'storage', runtimeKey: 'window.CookieStoreManager'},

  // ─── T3 — Companion APIs (return / result types you'll actually use) ───────
  {bcdKey: 'api.ClipboardItem', category: 'platform-ui', runtimeKey: 'window.ClipboardItem', title: 'ClipboardItem'},
  {bcdKey: 'api.PermissionStatus', category: 'identity', runtimeKey: 'window.PermissionStatus'},
  {bcdKey: 'api.WakeLockSentinel', category: 'platform-ui', runtimeKey: 'window.WakeLockSentinel'},
  {bcdKey: 'api.IdleDeadline', category: 'observation', runtimeKey: 'window.IdleDeadline', title: 'IdleDeadline (rIC callback)'},
  {bcdKey: 'api.ImageBitmap', category: 'graphics', runtimeKey: 'window.ImageBitmap', title: 'ImageBitmap (constructor)'},

  // ─── T3 — Standalone real APIs ───────────────────────────────────
  {bcdKey: 'api.ScreenOrientation', category: 'platform-ui', runtimeKey: 'window.screen.orientation', title: 'Screen Orientation'},
  {bcdKey: 'api.MediaError', category: 'media-capture', runtimeKey: 'window.MediaError'},
  {bcdKey: 'api.AudioSession', category: 'audio-video', runtimeKey: 'navigator.audioSession', title: 'Audio Session'},
  {bcdKey: 'api.Keyboard', category: 'platform-ui', runtimeKey: 'navigator.keyboard', title: 'Keyboard API'},
  {bcdKey: 'api.Scheduling', category: 'observation', runtimeKey: 'navigator.scheduling', title: 'Scheduling API (legacy)'},

  // ─── T3 — Common Events (the constructors developers listen for) ──────────
  {bcdKey: 'api.NavigateEvent', category: 'frontier', runtimeKey: 'window.NavigateEvent', title: 'Navigation API: NavigateEvent'},
  {bcdKey: 'api.NavigationCurrentEntryChangeEvent', category: 'frontier', runtimeKey: 'window.NavigationCurrentEntryChangeEvent'},
  {bcdKey: 'api.PageRevealEvent', category: 'frontier', runtimeKey: 'window.PageRevealEvent', title: 'Cross-document View Transitions: pagereveal'},
  {bcdKey: 'api.PageSwapEvent', category: 'frontier', runtimeKey: 'window.PageSwapEvent', title: 'Cross-document View Transitions: pageswap'},
  {bcdKey: 'api.ClipboardEvent', category: 'platform-ui', runtimeKey: 'window.ClipboardEvent'},
  {bcdKey: 'api.CookieChangeEvent', category: 'storage', runtimeKey: 'window.CookieChangeEvent'},
  {bcdKey: 'api.BlobEvent', category: 'media-capture', runtimeKey: 'window.BlobEvent', title: 'BlobEvent (MediaRecorder data)'},
  {bcdKey: 'api.FormDataEvent', category: 'platform-ui', runtimeKey: 'window.FormDataEvent'},
  {bcdKey: 'api.MessageEvent', category: 'workers', runtimeKey: 'window.MessageEvent'},
]
