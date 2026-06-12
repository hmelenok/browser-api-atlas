import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

interface FileRow {
  name: string
  size: number
}

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  return await navigator.storage.getDirectory()
}

async function listFiles(): Promise<FileRow[]> {
  const root = await getRoot()
  const out: FileRow[] = []
  for await (const [name, handle] of (root as unknown as {entries(): AsyncIterable<[string, FileSystemHandle]>}).entries()) {
    if (handle.kind === 'file') {
      const f = await (handle as FileSystemFileHandle).getFile()
      out.push({name, size: f.size})
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

async function writeFile(name: string, contents: string) {
  const root = await getRoot()
  const handle = await root.getFileHandle(name, {create: true})
  const writer = await handle.createWritable()
  await writer.write(contents)
  await writer.close()
}

async function deleteFile(name: string) {
  const root = await getRoot()
  await root.removeEntry(name)
}

function OPFSDemo() {
  const [name, setName] = useState('hello.txt')
  const [contents, setContents] = useState('Hello from OPFS!')
  const [files, setFiles] = useState<FileRow[]>([])
  const [log, setLog] = useState('')

  const refresh = () =>
    listFiles().then(setFiles).catch((e) => setLog((e as Error).message))

  useEffect(() => {
    if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) {
      setLog('OPFS not supported in this browser.')
      return
    }
    refresh()
  }, [])

  const onWrite = async () => {
    try {
      await writeFile(name, contents)
      setLog(`wrote ${name} (${contents.length} bytes)`)
      refresh()
    } catch (e) {
      setLog((e as Error).message)
    }
  }

  const onRemove = async (n: string) => {
    await deleteFile(n)
    refresh()
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoInput placeholder="filename" value={name} onChange={(e) => setName(e.target.value)} className="!flex-[0_0_8rem]" />
        <DemoInput placeholder="contents" value={contents} onChange={(e) => setContents(e.target.value)} />
        <DemoButton onClick={onWrite}>write</DemoButton>
      </DemoRow>

      {files.length === 0 ? (
        <p className="text-[11px] italic text-[var(--color-muted)]">(no files in root)</p>
      ) : (
        <ul className="space-y-1 text-[11px]">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5"
            >
              <span className="flex-1 font-mono">{f.name}</span>
              <span className="font-mono text-[10px] text-[var(--color-muted)]">{f.size}B</span>
              <button
                type="button"
                onClick={() => onRemove(f.name)}
                className="text-[10px] text-[var(--color-status-unsupported)] hover:underline"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {log && <pre className="font-mono text-[10px] text-[var(--color-muted)]">{log}</pre>}
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.FileSystemDirectoryHandle',
  title: 'Origin Private File System',
  Demo: OPFSDemo,
  snippet: `// Per-origin, sandboxed file system that doesn't prompt the user
const root = await navigator.storage.getDirectory()

const file = await root.getFileHandle('hello.txt', {create: true})

// Write
const writer = await file.createWritable()
await writer.write('Hello from OPFS!')
await writer.close()

// Read
const f = await file.getFile()
const text = await f.text()

// Iterate the directory
for await (const [name, handle] of root.entries()) {
  console.log(name, handle.kind)
}`,
  notes: 'OPFS is significantly faster than IndexedDB for large blobs, and Chrome / Safari expose a synchronous variant inside Web Workers.',
}
