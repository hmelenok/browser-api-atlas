import type {Category, CategoryId} from '@/lib/types'

export const CATEGORIES: Record<CategoryId, Category> = {
  storage: {
    id: 'storage',
    title: 'Storage',
    blurb: 'Persisting data on the client — from cookies to OPFS.',
    color: 'oklch(60% 0.14 250)',
  },
  network: {
    id: 'network',
    title: 'Network',
    blurb: 'Talking to servers and peers.',
    color: 'oklch(60% 0.14 180)',
  },
  'media-capture': {
    id: 'media-capture',
    title: 'Media Capture',
    blurb: 'Camera, microphone, screen sharing.',
    color: 'oklch(60% 0.14 30)',
  },
  'audio-video': {
    id: 'audio-video',
    title: 'Audio & Video',
    blurb: 'Synthesis, playback, speech.',
    color: 'oklch(60% 0.14 60)',
  },
  graphics: {
    id: 'graphics',
    title: 'Graphics',
    blurb: '2D canvas, WebGL, WebGPU.',
    color: 'oklch(60% 0.14 295)',
  },
  sensors: {
    id: 'sensors',
    title: 'Sensors',
    blurb: 'Position, orientation, battery, pressure.',
    color: 'oklch(60% 0.14 145)',
  },
  hardware: {
    id: 'hardware',
    title: 'Hardware',
    blurb: 'USB, HID, Serial, Bluetooth, NFC.',
    color: 'oklch(60% 0.14 220)',
  },
  identity: {
    id: 'identity',
    title: 'Identity & Security',
    blurb: 'WebAuthn, credentials, crypto, permissions.',
    color: 'oklch(60% 0.14 0)',
  },
  'platform-ui': {
    id: 'platform-ui',
    title: 'Platform UI',
    blurb: 'Notifications, share, wake lock, clipboard.',
    color: 'oklch(60% 0.14 120)',
  },
  workers: {
    id: 'workers',
    title: 'Workers',
    blurb: 'Background processing & off-main-thread.',
    color: 'oklch(60% 0.14 200)',
  },
  files: {
    id: 'files',
    title: 'Files',
    blurb: 'File API, File System Access.',
    color: 'oklch(60% 0.14 90)',
  },
  observation: {
    id: 'observation',
    title: 'Observation',
    blurb: 'IntersectionObserver, ResizeObserver and friends.',
    color: 'oklch(60% 0.14 160)',
  },
  frontier: {
    id: 'frontier',
    title: 'Frontier',
    blurb: 'Newer additions that change how the web works.',
    color: 'oklch(60% 0.14 320)',
  },
}

export const CATEGORY_ORDER: CategoryId[] = [
  'storage',
  'files',
  'network',
  'workers',
  'observation',
  'platform-ui',
  'media-capture',
  'audio-video',
  'graphics',
  'sensors',
  'hardware',
  'identity',
  'frontier',
]
