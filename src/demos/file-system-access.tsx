import {FileText, Save, Upload} from 'lucide-react'
import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

interface FilePickerOpts {
  multiple?: boolean
  types?: Array<{description: string; accept: Record<string, string[]>}>
  excludeAcceptAllOption?: boolean
}

interface WindowWithFS {
  showOpenFilePicker?: (opts?: FilePickerOpts) => Promise<FileSystemFileHandle[]>
  showSaveFilePicker?: (opts?: {
    suggestedName?: string
    types?: Array<{description: string; accept: Record<string, string[]>}>
  }) => Promise<FileSystemFileHandle>
}

function FileSystemAccessDemo() {
  const w = window as unknown as WindowWithFS
  const supported = typeof w.showOpenFilePicker === 'function'

  const [content, setContent] = useState('')
  const [meta, setMeta] = useState<{name: string; size: number} | null>(null)
  const [error, setError] = useState('')

  const open = async () => {
    setError('')
    try {
      const [handle] = await w.showOpenFilePicker!({
        types: [
          {
            description: 'Text files',
            accept: {'text/plain': ['.txt', '.md', '.json', '.csv', '.log']},
          },
        ],
      })
      const file = await handle.getFile()
      const text = await file.text()
      setMeta({name: file.name, size: file.size})
      setContent(text.slice(0, 4000))
    } catch (e) {
      const err = e as Error
      if (err.name !== 'AbortError') setError(err.message)
    }
  }

  const save = async () => {
    setError('')
    try {
      const handle = await w.showSaveFilePicker!({
        suggestedName: meta?.name ?? 'edited.txt',
        types: [{description: 'Text file', accept: {'text/plain': ['.txt']}}],
      })
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
    } catch (e) {
      const err = e as Error
      if (err.name !== 'AbortError') setError(err.message)
    }
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          File System Access API not available. Chrome 86+, Edge, Opera. Safari + Firefox haven't
          shipped it yet — they have OPFS but not the user-picker side.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={open}>
          <Upload size={12} />
          open file
        </DemoButton>
        <DemoButton variant="ghost" onClick={save} disabled={!content}>
          <Save size={12} />
          save as…
        </DemoButton>
      </DemoRow>

      {meta && (
        <div className="flex items-center gap-2 text-xs">
          <FileText size={14} className="text-[var(--color-muted)]" />
          <span className="font-medium">{meta.name}</span>
          <span className="font-mono text-[10px] text-[var(--color-muted)]">
            {meta.size.toLocaleString()} B
          </span>
        </div>
      )}

      {content && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[11px]"
        />
      )}

      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Real file handles, not Blob copies. Edit + save back goes through the same handle, no
        re-prompting.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.FileSystemHandle',
  title: 'File System Access',
  Demo: FileSystemAccessDemo,
  snippet: `// User picks a file → you get a real, persistent handle
const [handle] = await showOpenFilePicker({
  types: [{description: 'Markdown', accept: {'text/markdown': ['.md']}}],
})

// Read
const file = await handle.getFile()
const text = await file.text()

// Write back to the same file (no re-prompt — same session)
const writable = await handle.createWritable()
await writable.write(updatedText)
await writable.close()

// Save-as flow (new file)
const newHandle = await showSaveFilePicker({
  suggestedName: 'notes.md',
  types: [{description: 'Markdown', accept: {'text/markdown': ['.md']}}],
})

// Directories
const dir = await showDirectoryPicker()
for await (const [name, entry] of dir.entries()) {
  console.log(entry.kind, name) // 'file' or 'directory'
}`,
  notes: 'Handles can be persisted across sessions via IndexedDB — you save the handle, ask the user for permission again on next visit, and resume editing the exact same file.',
}
