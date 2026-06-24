import {Upload, X} from 'lucide-react'
import {useState, type DragEvent} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'
import {cn} from '@/lib/cn'

interface DroppedFile {
  name: string
  size: number
  type: string
  lastModified: number
  preview?: string
}

function format(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function DragAndDropDemo() {
  const [files, setFiles] = useState<DroppedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [types, setTypes] = useState<string[]>([])

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
    // Inspect what's coming WITHOUT reading content
    setTypes(Array.from(new Set(Array.from(e.dataTransfer.items).map((it) => it.type || it.kind))))
  }

  const handleDragLeave = () => {
    setDragOver(false)
    setTypes([])
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    setTypes([])

    const incoming = Array.from(e.dataTransfer.files)
    const next: DroppedFile[] = []

    for (const file of incoming) {
      const entry: DroppedFile = {
        name: file.name,
        size: file.size,
        type: file.type || '(unknown)',
        lastModified: file.lastModified,
      }
      // Build a preview for images
      if (file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) {
        entry.preview = URL.createObjectURL(file)
      }
      next.push(entry)
    }
    setFiles((prev) => [...next, ...prev].slice(0, 8))
  }

  const clear = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
    setFiles([])
  }

  return (
    <DemoFrame>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-lg border-2 border-dashed p-6 text-center transition',
          dragOver
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
            : 'border-[var(--color-border)] bg-[var(--color-bg)]'
        )}
      >
        <Upload
          size={24}
          className={cn(
            'mx-auto mb-2',
            dragOver ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
          )}
        />
        <p className="text-sm font-medium">
          {dragOver ? 'Release to drop' : 'Drag files anywhere on this card'}
        </p>
        {types.length > 0 && (
          <p className="mt-1 font-mono text-[11px] text-[var(--color-muted)]">
            preview: {types.join(' · ')}
          </p>
        )}
        {!dragOver && (
          <p className="mt-1 text-[11px] text-[var(--color-muted)]">
            Names, sizes, types are read locally. Nothing leaves your browser.
          </p>
        )}
      </div>

      {files.length > 0 && (
        <>
          <DemoRow>
            <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
            <DemoButton variant="danger" onClick={clear}>
              <X size={12} />
              clear
            </DemoButton>
          </DemoRow>

          <ul className="space-y-1 text-xs">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.lastModified}-${i}`}
                className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
              >
                {f.preview ? (
                  <img
                    src={f.preview}
                    alt=""
                    className="size-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded bg-[var(--color-bg-soft)] text-lg">
                    📄
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{f.name}</p>
                  <p className="font-mono text-[10px] text-[var(--color-muted)]">
                    {f.type} · {format(f.size)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.DataTransfer',
  title: 'Drag & Drop',
  Demo: DragAndDropDemo,
  snippet: `// Drag-over: inspect WITHOUT reading content
el.addEventListener('dragover', (e) => {
  e.preventDefault()                  // required to allow drop
  // e.dataTransfer.items lets you see metadata before drop
  for (const item of e.dataTransfer.items) {
    console.log(item.kind, item.type) // 'file', 'image/png'
  }
})

// Drop: actually read the files
el.addEventListener('drop', async (e) => {
  e.preventDefault()
  for (const file of e.dataTransfer.files) {
    console.log(file.name, file.size, file.type, file.lastModified)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      imgEl.src = url
      // remember: URL.revokeObjectURL(url) when done
    }
    // or stream it:
    // for await (const chunk of file.stream()) { … }
  }
})`,
  notes: 'dataTransfer.items lets you preview kind + type on dragover without reading content — handy for showing "✓ accepted" vs "✗ wrong type" UI before the user actually releases the mouse.',
}
