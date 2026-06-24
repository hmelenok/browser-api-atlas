import {useRef, useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

function DialogDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [result, setResult] = useState<string>('')
  const [name, setName] = useState('')

  const supported = typeof HTMLDialogElement !== 'undefined'

  const showModal = () => dialogRef.current?.showModal()
  const showModeless = () => dialogRef.current?.show()
  const close = (value: string) => {
    setResult(value)
    dialogRef.current?.close(value)
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          &lt;dialog&gt; not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={showModal}>open modal</DemoButton>
        <DemoButton variant="ghost" onClick={showModeless}>
          open modeless
        </DemoButton>
      </DemoRow>

      {result && (
        <p className="rounded border border-[var(--color-status-supported)]/40 bg-[var(--color-status-supported)]/10 p-2 text-xs">
          Dialog returned:{' '}
          <code className="font-mono text-[var(--color-status-supported)]">{result}</code>
        </p>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => {
          // dialog.returnValue is set by the submitting button or method="dialog" form
          if (dialogRef.current?.returnValue) setResult(dialogRef.current.returnValue)
        }}
        className="m-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-0 shadow-2xl shadow-black/20 backdrop:bg-black/30 backdrop:backdrop-blur-sm"
      >
        {/* method="dialog" submits and closes, returnValue = submit button's value */}
        <form method="dialog" className="w-72 p-5">
          <h4 className="text-sm font-semibold">Confirm action</h4>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            The dialog returns its <code>returnValue</code> when a form submits with{' '}
            <code>method="dialog"</code>.
          </p>
          <label className="mt-3 block">
            <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
              your name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-8 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-2 text-sm"
              autoFocus
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => close('cancelled')}
              className="inline-flex h-7 items-center rounded border border-[var(--color-border)] px-3 text-xs text-[var(--color-muted)]"
            >
              cancel
            </button>
            <button
              type="submit"
              value={name ? `confirmed: ${name}` : 'confirmed'}
              className="inline-flex h-7 items-center rounded border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 text-xs font-medium text-[var(--color-accent)]"
            >
              confirm
            </button>
          </div>
        </form>
      </dialog>

      <p className="text-[10px] text-[var(--color-muted)]">
        <code>showModal()</code> renders in the top layer with a <code>::backdrop</code> pseudo,
        Esc-to-close, focus trap. <code>show()</code> is modeless. Pairs with CloseWatcher.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.HTMLDialogElement',
  title: '<dialog>',
  Demo: DialogDemo,
  snippet: `<!-- The platform finally has modals -->
<dialog id="confirm">
  <form method="dialog">
    <p>Are you sure?</p>
    <button value="yes">Yes</button>
    <button value="no">No</button>
  </form>
</dialog>

<script>
  const dlg = document.getElementById('confirm')
  dlg.showModal()                        // top-layer, focus-trapped
  // dlg.show()                          // modeless (inline)

  dlg.addEventListener('close', () => {
    console.log(dlg.returnValue)         // 'yes' or 'no'
  })
</script>

/* Style the backdrop via the ::backdrop pseudo */
dialog::backdrop { background: rgba(0, 0, 0, .3); backdrop-filter: blur(2px); }`,
  notes: 'The native <dialog> is the modal pattern. Replaces about 90% of the homemade React modals you used to install from npm.',
}
