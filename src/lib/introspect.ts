/**
 * Self-discovery: walk the global namespaces and surface things that
 * (a) look like API surfaces (PascalCase globals, navigator/document props)
 * and (b) aren't in our catalog.
 *
 * This is the "✨ new APIs detected in your browser" signal. It catches
 * frontier features that ship in Chrome before our weekly catalog refresh
 * picks them up.
 */

/** Common DOM globals we don't want to flag. */
const NOISE_PATTERNS = [
  /^HTML[A-Z]/, // HTMLElement, HTMLDivElement, etc.
  /^SVG[A-Z]/, // SVG elements
  /^MathML[A-Z]/,
  /^CSS[A-Z]/,
  /^XML/,
  /^DOM/,
  /^Element$/,
  /^Node$/,
  /^Event$/,
  /Event$/,
  /Error$/,
  /^Audio/,
  /^Range$/,
  /^Selection$/,
  /^Performance/,
  /^Animation/,
  /^Keyboard/,
  /^Touch/,
  /^Pointer/,
  /^Web(GL|Audio|Codecs)/,
  /^TextEncoder/,
  /^TextDecoder/,
  /^Stream$/,
  /Stream$/,
  /^Image/,
  /^Storage/,
  /^URL/,
  /^Form/,
  /^FontFace/,
  /^Intl$/,
  /^Reflect$/,
  /^Atomics$/,
  /^WebAssembly$/,
  /^Worker$/,
  /^Worklet$/,
  /^Headers$/,
  /^Request$/,
  /^Response$/,
  /^ReadableStream/,
  /^WritableStream/,
  /^TransformStream/,
  // Vendor-prefixed legacy (Firefox/Safari pre-standard versions)
  /^moz[A-Z]/,
  /^webkit[A-Z]/,
  /^ms[A-Z]/,
  /^Moz[A-Z]/,
  /^WebKit[A-Z]/,
  // Privacy Sandbox / Protected Audience / Topics / Attribution Reporting
  // — these are intentionally not in the educational atlas. They're
  // experimental, ad-industry-specific, and change frequently.
  /adAuction/i,
  /AdInterest/i,
  /^canLoadAd/i,
  /Fenced[A-Z]/,
  /^Fenced$/,
  /^Topics$/,
  /Attribution/i,
  /^deprecated/i,
  /^federated[A-Z]/,
  /^Shared[A-Z]/,
  /^SharedStorage/i,
  /protectedAudience/i,
  /^Protected[A-Z]/,
  /^NavigatorLogin$/,
  /^NavigatorManagedData$/,
  /^NavigationPrecommit/,
  /^CreateMonitor$/,
  /^Subscriber$/,
  /^Origin$/,
  /^Viewport$/,
  /^FetchLater/,

  // WebXR sub-types — top-level XRSystem, XRSession, XRFrame, XRReferenceSpace,
  // XRInputSource, XRRigidTransform, XRHitTestSource, XRWebGLLayer, XRAnchor,
  // XRLightProbe, XRRay, XRPose stay catalogued. Everything else is internals.
  /^XR(Anchor(Set)?|Bounded[A-Z]|Camera|Composition[A-Z]|CPUDepth|Cube[A-Z]|Cylinder[A-Z]|Depth[A-Z]|DOMOverlay|Equirect[A-Z]|Hand$|HitTest(Result)?|InputSourceArray|Joint[A-Z]|Layer$|Light(Estimate|Probe)|Plane(Set)?|Projection[A-Z]|Quad[A-Z]|Render[A-Z]|Space$|SubImage|TransientInput[A-Z]|View(erPose|port)?$|WebGL(Binding|Depth|Sub)[A-Z])/,

  // GPU detail constructors (top-level GPU + GPUDevice / GPUBuffer / GPUTexture
  // / GPUShaderModule / GPURenderPipeline / GPUCommandEncoder are catalogued).
  /^GPU(Adapter(Info)?|Bind[A-Z]|CanvasContext|Color[A-Z]|Command(Buffer)?|Compilation[A-Z]|Compute[A-Z]|DeviceLost|External[A-Z]|Map[A-Z]|Pipeline[A-Z]|QuerySet|Queue|RenderBundle[A-Za-z]*|RenderPass[A-Z]|Sampler|Shader(Stage)?|Supported[A-Z]|Texture(Usage|View)|WGSL)/,

  // USB transfer + endpoint sub-types
  /^USB(Alt|Endpoint|In|Isochronous|Out)[A-Za-z]*$/,

  // Misc legacy / internals
  /^IDB.*Request$/,
  /^IDBRecord$/,
  /^MimeType(Array)?$/,
  /^Plugin(Array)?$/,
  /^FeaturePolicy$/,
  /^BarProp$/,
  /^NotRestoredReasons?(Details)?$/,
  // WebDriver / automation internals
  /^webdriver/i,
  /^automation/i,
]

/** Specific names to ignore even though they look API-ish. */
const IGNORE_NAMES = new Set([
  'globalThis',
  'self',
  'window',
  'document',
  'navigator',
  'location',
  'history',
  'screen',
  'console',
  'Object',
  'Array',
  'Map',
  'Set',
  'Date',
  'Math',
  'JSON',
  'Promise',
  'Symbol',
  'Proxy',
  'WeakMap',
  'WeakSet',
  'WeakRef',
  'FinalizationRegistry',
  'Function',
  'Boolean',
  'Number',
  'String',
  'BigInt',
  'RegExp',
  'ArrayBuffer',
  'SharedArrayBuffer',
  'DataView',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float16Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
  'Iterator',
  'AsyncIterator',
])

export interface UnknownGlobal {
  /** Where it was found: 'window', 'navigator', or 'document'. */
  scope: 'window' | 'navigator' | 'document'
  /** The property name. */
  name: string
  /** Full accessor path, e.g. "navigator.somethingNew". */
  path: string
  /** What kind of value it is. */
  kind: 'function' | 'object' | 'constructor' | 'other'
}

function isInteresting(name: string): boolean {
  if (IGNORE_NAMES.has(name)) return false
  if (name.startsWith('_')) return false
  for (const re of NOISE_PATTERNS) if (re.test(name)) return false
  return true
}

function classify(val: unknown): UnknownGlobal['kind'] {
  if (typeof val === 'function') {
    // PascalCase functions are likely constructors
    return 'constructor'
  }
  if (typeof val === 'object' && val !== null) return 'object'
  return 'other'
}

/**
 * @param catalogRuntimeKeys runtime keys present in our catalog (e.g. ["window.Notification"])
 */
export function findUnknownGlobals(catalogRuntimeKeys: Set<string>): UnknownGlobal[] {
  const found: UnknownGlobal[] = []

  // window.* — interesting only if name starts uppercase (constructor-like)
  for (const name of Object.getOwnPropertyNames(window)) {
    if (!/^[A-Z]/.test(name)) continue
    if (!isInteresting(name)) continue
    const path = `window.${name}`
    if (catalogRuntimeKeys.has(path)) continue
    try {
      const val = (window as unknown as Record<string, unknown>)[name]
      if (val == null) continue
      const kind = classify(val)
      if (kind === 'other') continue
      found.push({scope: 'window', name, path, kind})
    } catch {
      // some accessors throw — ignore
    }
  }

  // navigator.* — interesting if not in catalog and value is non-null
  for (const name of allKeys(navigator)) {
    if (name.startsWith('_')) continue
    if (IGNORE_NAMES.has(name)) continue
    // Apply the noise patterns to navigator properties too
    if (NOISE_PATTERNS.some((re) => re.test(name))) continue
    const path = `navigator.${name}`
    if (catalogRuntimeKeys.has(path)) continue
    try {
      const val = (navigator as unknown as Record<string, unknown>)[name]
      if (val == null) continue
      const kind = typeof val === 'function' ? 'function' : classify(val)
      if (kind === 'other') continue
      // Skip primitive-ish well-known fields
      if (
        [
          'onLine',
          'language',
          'languages',
          'userAgent',
          'platform',
          'cookieEnabled',
          'doNotTrack',
          'product',
          'productSub',
          'vendor',
          'vendorSub',
          'appCodeName',
          'appName',
          'appVersion',
          'hardwareConcurrency',
          'deviceMemory',
          'maxTouchPoints',
          'pdfViewerEnabled',
          'webdriver',
          'mimeTypes',
          'plugins',
          'oscpu',
          'buildID',
          'taintEnabled',
          'javaEnabled',
          // The following used to be filtered but are now in the catalog;
          // listing them here is harmless (catalog covers them).
          // Genuinely-noise navigator getters (legacy / experimental):
          'getUserMedia',
          'registerProtocolHandler',
          'unregisterProtocolHandler',
          'getInstalledRelatedApps',
          'login',
          'managed',
          'protectedAudience',
          'createAuctionNonce',
          'adAuctionComponents',
          'scheduling',
          'ink',
          'keyboard',
          'userActivation',
        ].includes(name)
      )
        continue
      found.push({scope: 'navigator', name, path, kind})
    } catch {
      /* ignore */
    }
  }

  // document.* — only flag truly novel APIs (skip the well-known soup)
  for (const name of allKeys(document)) {
    if (!/^(start|request|exit)/.test(name)) continue // heuristic: API-style verbs
    const path = `document.${name}`
    if (catalogRuntimeKeys.has(path)) continue
    try {
      const val = (document as unknown as Record<string, unknown>)[name]
      if (typeof val !== 'function') continue
      found.push({scope: 'document', name, path, kind: 'function'})
    } catch {
      /* ignore */
    }
  }

  return found.sort((a, b) => a.path.localeCompare(b.path))
}

function allKeys(obj: object): string[] {
  const keys = new Set<string>()
  let cur: object | null = obj
  while (cur && cur !== Object.prototype) {
    for (const k of Object.getOwnPropertyNames(cur)) keys.add(k)
    cur = Object.getPrototypeOf(cur)
  }
  return Array.from(keys)
}
