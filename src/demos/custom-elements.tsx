import {useEffect, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoFrame, DemoInput, DemoRow} from './_ui'

const TAG = 'atlas-counter'

// Register the element once
function defineCounterElement() {
  if (customElements.get(TAG)) return
  class AtlasCounter extends HTMLElement {
    static observedAttributes = ['count', 'label']
    static formAssociated = false

    private shadow: ShadowRoot
    private valueSpan: HTMLSpanElement

    constructor() {
      super()
      this.shadow = this.attachShadow({mode: 'open'})
      this.shadow.innerHTML = `
        <style>
          :host { display: inline-flex; align-items: center; gap: 8px;
                  padding: 6px 10px; border-radius: 6px;
                  border: 1px solid #4f46e5; background: #4f46e51a; color: #4f46e5; }
          button { all: unset; cursor: pointer; padding: 0 6px;
                   border: 1px solid currentColor; border-radius: 4px;
                   font-family: ui-monospace, monospace; font-size: 14px; }
          button:hover { background: currentColor; color: white; }
          span { font-family: ui-monospace, monospace; min-width: 1ch; text-align: center; }
        </style>
        <slot></slot>
        <button part="dec">−</button>
        <span></span>
        <button part="inc">+</button>
      `
      const [dec, inc] = this.shadow.querySelectorAll('button')
      this.valueSpan = this.shadow.querySelector('span') as HTMLSpanElement
      inc.addEventListener('click', () => this.bump(1))
      dec.addEventListener('click', () => this.bump(-1))
    }

    get count() {
      return parseInt(this.getAttribute('count') ?? '0', 10)
    }
    set count(v: number) {
      this.setAttribute('count', String(v))
    }

    attributeChangedCallback() {
      if (this.valueSpan) this.valueSpan.textContent = String(this.count)
    }

    connectedCallback() {
      this.attributeChangedCallback()
    }

    bump(delta: number) {
      this.count = this.count + delta
      this.dispatchEvent(new CustomEvent('change', {detail: this.count, bubbles: true}))
    }
  }
  customElements.define(TAG, AtlasCounter)
}

function CustomElementsDemo() {
  const supported = typeof customElements !== 'undefined'
  const [label, setLabel] = useState('clicks')
  const [externalValue, setExternalValue] = useState<number | null>(null)

  useEffect(() => {
    if (!supported) return
    defineCounterElement()
  }, [supported])

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          customElements not available.
        </p>
      </DemoFrame>
    )
  }

  // React renders the custom element exactly like any other tag
  return (
    <DemoFrame>
      <DemoRow>
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
          label slot
        </span>
        <DemoInput value={label} onChange={(e) => setLabel(e.target.value)} />
      </DemoRow>

      <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-center">
        {/* @ts-expect-error custom element JSX */}
        <atlas-counter
          count="3"
          onChange={(e: CustomEvent<number>) => setExternalValue(e.detail)}
        >
          {label}:
          {/* @ts-expect-error */}
        </atlas-counter>
      </div>

      <p className="text-[11px] text-[var(--color-muted)]">
        Listens for{' '}
        <code className="font-mono">change</code> events from the element:{' '}
        <span className="font-mono text-[var(--color-accent)]">
          {externalValue ?? '—'}
        </span>
      </p>

      <p className="text-[10px] text-[var(--color-muted)]">
        The button styles inside the shadow root use unscoped CSS (<code>all: unset</code>,{' '}
        <code>border: 1px solid</code>, etc.) and don't leak to the page. Style + DOM
        encapsulation in two API calls.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.CustomElementRegistry',
  title: 'Custom Elements',
  Demo: CustomElementsDemo,
  snippet: `class Counter extends HTMLElement {
  static observedAttributes = ['count']

  constructor() {
    super()
    const shadow = this.attachShadow({mode: 'open'})  // encapsulation
    shadow.innerHTML = \`
      <style>:host { color: rebeccapurple }</style>
      <button>−</button>
      <span></span>
      <button>+</button>
    \`
    // wire up event handlers, refs, etc.
  }

  attributeChangedCallback(name, oldV, newV) {
    // react to attribute changes
  }

  connectedCallback() { /* mounted */ }
  disconnectedCallback() { /* unmounted */ }
}

customElements.define('app-counter', Counter)

// Now <app-counter count="3"></app-counter> works anywhere
// — including inside JSX (React passes through unknown tags).`,
  notes: 'Built on Shadow DOM (style + DOM encapsulation) and attached lifecycle callbacks. React 19 + understands them natively (passes attributes through, dispatches events as props).',
}
