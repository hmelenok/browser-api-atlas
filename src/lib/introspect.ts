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
  /^External$/,
  /^NotRestoredReasons?(Details)?$/,

  // DOM node sub-types (Node, Element, Document are the real APIs; the rest
  // are types you receive from DOM walks)
  /^(Attr|Text|Comment|CDATASection|CharacterData|DocumentFragment|DocumentType|ProcessingInstruction)$/,

  // DOM collection / iterator types (not APIs you call directly)
  /^(NodeList|NodeFilter|NamedNodeMap|RadioNodeList|HTMLCollection)$/,

  // Web Audio abstract bases and helper types
  /^(BaseAudioContext|AudioNode|AudioParam(Map)?|AudioListener|AudioBuffer|AudioBufferSourceNode|AudioDestinationNode|AudioScheduledSourceNode|AudioWorklet|AudioProcessingEvent|AudioSinkInfo)$/,

  // Sensor abstract bases
  /^(Sensor|OrientationSensor)$/,

  // Observer payload / entry types (the observer itself is catalogued)
  /^(MutationRecord|IntersectionObserverEntry|ResizeObserverEntry|ResizeObserverSize|PerformancePaintTiming|LayoutShiftAttribution|VisibilityStateEntry|EventCounts|IdleDeadline|FileList|InputDeviceCapabilities|InputDeviceInfo|PermissionStatus|WakeLockSentinel|ValidityState|StaticRange|AbstractRange|GeolocationCoordinates|GeolocationPosition(Error)?|GamepadButton|GamepadHapticActuator)$/,

  // DataTransfer / drag helpers
  /^DataTransferItem(List)?$/,

  // FragmentDirective + scroll-to-text-fragment
  /^(FragmentDirective|DocumentTimeline)$/,

  // Device motion event sub-objects
  /^DeviceMotionEvent(Acceleration|RotationRate)$/,

  // Text track / VTT helpers (HTMLMediaElement covers the use)
  /^(TextTrack(Cue(List)?|List)?|VTTCue|TextMetrics|TextFormat|TimeRanges|VideoColorSpace|VideoPlaybackQuality)$/,

  // Speech recognition / synthesis sub-types
  /^(SpeechGrammar(List)?|SpeechRecognitionPhrase|SpeechSynthesisVoice)$/,

  // WebCodecs internals
  /^(EncodedAudioChunk|EncodedVideoChunk)$/,

  // Canvas helpers
  /^(CanvasGradient|CanvasPattern|CanvasCaptureMediaStreamTrack|BrowserCaptureMediaStreamTrack|CropTarget|RestrictionTarget|CaretPosition|ChapterInformation|ImageTrack(List)?|FontData)$/,

  // Bluetooth GATT helpers (the chain that matters is catalogued)
  /^(BluetoothCharacteristicProperties|BluetoothRemoteGATTDescriptor)$/,

  // Media + MIDI helpers (catalogued surfaces cover the use cases)
  /^(MediaCapabilities|MediaDeviceInfo|MediaDevices|MediaList|MediaMetadata|MediaSourceHandle|MediaStreamTrack(Audio|Video)Stats|SourceBufferList|MIDIPort)$/,

  // Style sheet helpers
  /^(StyleSheet|StyleSheetList)$/,

  // Cache vs CacheStorage — cache instance is a type you receive, not an API
  /^Cache$/,

  // CryptoKey is a type, not an API surface
  /^CryptoKey$/,

  // Trusted Types siblings (TrustedHTML + TrustedTypePolicy[Factory] already catalogued)
  /^(TrustedScript|TrustedScriptURL)$/,

  // XPath / XSLT (legacy)
  /^(XPathEvaluator|XPathExpression|XPathResult|XSLTProcessor)$/,

  // Multi-screen Window Placement helpers
  /^(ScreenDetailed|ScreenDetails|ScreenOrientation)$/,

  // UserActivation + ViewTransitionTypeSet (sub-types)
  /^(UserActivation|ViewTransitionTypeSet)$/,

  // Stream queuing strategies (internal, you pass them to constructors)
  /^(ByteLengthQueuingStrategy|CountQueuingStrategy)$/,

  // Report API bodies (you receive them; not APIs to call)
  /^(ReportBody|CSPViolationReportBody|CrashReportContext|IntegrityViolationReportBody|ReportingObserverEntry)$/,

  // ElementInternals + Custom Element accessory types
  /^(CustomStateSet|ElementInternals)$/,

  // ImageCapture / ImageData / ImageBitmapRenderingContext
  /^(ImageCapture|ImageData|ImageBitmapRenderingContext)$/,

  // CSS rule sub-types (CSS.* APIs cover the surface)
  /^CSS(Style)?Rule$/,
  /^MediaQueryListEvent$/,

  // Window-singleton constructors (Window, Document, Navigator, Location,
  // History, Screen, EventTarget) — not APIs you call.
  /^(Window|Document|Navigator|Location|History|Screen|EventTarget|Option)$/,

  // Privacy Sandbox / Ink (experimental, niche)
  /^(Fence|Ink|DelegatedInkTrailPresenter)$/,

  // Stream readable byte controller (internal, passed to constructors)
  /^ReadableByteStreamController$/,

  // GPU bit-flag objects + WGSL feature object
  /^(GPUBufferUsage|GPUColorWrite|GPUMapMode|GPUShaderStage|GPUTextureUsage|WGSLLanguageFeatures)$/,

  // Sub-types of catalogued APIs
  /^HIDDevice$/,
  /^Lock$/,
  /^Payment(Address|Manager|Response)$/,
  /^RTC(Certificate|DTMFSender|RtpScriptTransform)$/,
  /^SerialPort$/,
  /^ServiceWorker(Container|Registration)$/,
  /^ScriptProcessorNode$/, // deprecated Web Audio
  /^XRWebGLBinding$/,
  /^VisualViewport$/,

  // TimelineTrigger family — spec renamed to AnimationTrigger (catalogued)
  /^TimelineTrigger(Range|RangeList)?$/,

  // WebDriver / automation internals
  /^webdriver/i,
  /^automation/i,
]

/** Specific names to ignore even though they look API-ish. */
const IGNORE_NAMES = new Set([
  // Object.prototype getters that every property walk surfaces
  'constructor',
  'toString',
  'valueOf',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  '__proto__',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  // Common global singletons + interface constructors
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
