export interface BrowserInfo {
  name: string
  version?: string
  os?: string
  engine?: 'Blink' | 'Gecko' | 'WebKit' | 'Unknown'
  source: 'ua-client-hints' | 'user-agent'
}

interface UADataValues {
  brands?: Array<{brand: string; version: string}>
  mobile?: boolean
  platform?: string
  platformVersion?: string
  uaFullVersion?: string
  fullVersionList?: Array<{brand: string; version: string}>
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: {
    brands: Array<{brand: string; version: string}>
    mobile: boolean
    platform: string
    getHighEntropyValues(hints: string[]): Promise<UADataValues>
  }
}

const PREFERRED_BRANDS = ['Google Chrome', 'Microsoft Edge', 'Opera', 'Brave', 'Arc', 'Chromium']

async function detectFromClientHints(nav: NavigatorWithUAData): Promise<BrowserInfo | null> {
  if (!nav.userAgentData) return null
  try {
    const values = await nav.userAgentData.getHighEntropyValues([
      'platform',
      'platformVersion',
      'fullVersionList',
      'uaFullVersion',
    ])

    const brandList = values.fullVersionList ?? nav.userAgentData.brands
    const preferred =
      brandList.find((b) => PREFERRED_BRANDS.includes(b.brand)) ??
      brandList.find((b) => !/Not.A.Brand|Chromium/i.test(b.brand)) ??
      brandList[0]

    return {
      name: preferred?.brand ?? 'Unknown',
      version: preferred?.version,
      os: values.platform
        ? `${values.platform}${values.platformVersion ? ` ${values.platformVersion}` : ''}`.trim()
        : undefined,
      engine: detectEngineFromBrand(preferred?.brand),
      source: 'ua-client-hints',
    }
  } catch {
    return null
  }
}

function detectEngineFromBrand(brand: string | undefined): BrowserInfo['engine'] {
  if (!brand) return 'Unknown'
  if (/firefox|gecko/i.test(brand)) return 'Gecko'
  if (/safari/i.test(brand)) return 'WebKit'
  if (/chrome|edge|opera|brave|chromium|arc/i.test(brand)) return 'Blink'
  return 'Unknown'
}

function detectFromUserAgent(): BrowserInfo {
  const ua = navigator.userAgent
  let name = 'Browser'
  let version: string | undefined
  let engine: BrowserInfo['engine'] = 'Unknown'

  if (/Firefox\/([\d.]+)/.test(ua)) {
    name = 'Firefox'
    version = RegExp.$1
    engine = 'Gecko'
  } else if (/Edg\/([\d.]+)/.test(ua)) {
    name = 'Edge'
    version = RegExp.$1
    engine = 'Blink'
  } else if (/OPR\/([\d.]+)/.test(ua)) {
    name = 'Opera'
    version = RegExp.$1
    engine = 'Blink'
  } else if (/Chrome\/([\d.]+)/.test(ua)) {
    name = 'Chrome'
    version = RegExp.$1
    engine = 'Blink'
  } else if (/Version\/([\d.]+).*Safari/.test(ua)) {
    name = 'Safari'
    version = RegExp.$1
    engine = 'WebKit'
  }

  let os: string | undefined
  if (/Mac OS X ([\d_.]+)/.test(ua)) os = `macOS ${RegExp.$1.replace(/_/g, '.')}`
  else if (/Windows NT ([\d.]+)/.test(ua)) os = `Windows ${RegExp.$1}`
  else if (/Android ([\d.]+)/.test(ua)) os = `Android ${RegExp.$1}`
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${RegExp.$1.replace(/_/g, '.')}`
  else if (/Linux/.test(ua)) os = 'Linux'

  return {name, version, os, engine, source: 'user-agent'}
}

export async function detectBrowser(): Promise<BrowserInfo> {
  const fromHints = await detectFromClientHints(navigator as NavigatorWithUAData)
  return fromHints ?? detectFromUserAgent()
}
