import {useEffect, useState} from 'react'
import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoInput, DemoRow} from './_ui'

const DB_NAME = 'atlas-demo-idb'
const STORE = 'notes'

interface Note {
  id: number
  text: string
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, {keyPath: 'id', autoIncrement: true})
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function getAllNotes(db: IDBDatabase): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as Note[])
    req.onerror = () => reject(req.error)
  })
}

function putNote(db: IDBDatabase, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add({text, createdAt: Date.now()})
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function deleteNote(db: IDBDatabase, id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function IndexedDBDemo() {
  const [text, setText] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    const db = await openDb()
    setNotes(await getAllNotes(db))
  }

  useEffect(() => {
    refresh().catch(console.error)
  }, [])

  const add = async () => {
    if (!text) return
    setBusy(true)
    try {
      const db = await openDb()
      await putNote(db, text)
      setText('')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: number) => {
    const db = await openDb()
    await deleteNote(db, id)
    refresh()
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoInput
          placeholder="Type a note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <DemoButton onClick={add} disabled={!text || busy}>
          add note
        </DemoButton>
      </DemoRow>

      {notes.length === 0 ? (
        <p className="text-[11px] italic text-[var(--color-muted)]">(no notes yet — add one)</p>
      ) : (
        <ul className="space-y-1 text-[11px]">
          {notes.map((n) => (
            <li
              key={n.id}
              className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5"
            >
              <span className="font-mono text-[10px] text-[var(--color-muted)]">#{n.id}</span>
              <span className="flex-1 truncate">{n.text}</span>
              <button
                type="button"
                onClick={() => remove(n.id)}
                className="text-[10px] text-[var(--color-status-unsupported)] hover:underline"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Notes are persisted in IndexedDB → survive reloads and tab closes.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.IDBDatabase',
  title: 'IndexedDB',
  Demo: IndexedDBDemo,
  snippet: `// Open the database (creates if missing)
const db = await new Promise<IDBDatabase>((resolve, reject) => {
  const req = indexedDB.open('notes-db', 1)
  req.onupgradeneeded = () => {
    req.result.createObjectStore('notes', {keyPath: 'id', autoIncrement: true})
  }
  req.onsuccess = () => resolve(req.result)
  req.onerror   = () => reject(req.error)
})

// Add a record
const tx = db.transaction('notes', 'readwrite')
tx.objectStore('notes').add({text: 'hello', createdAt: Date.now()})

// Read all records
const all = await new Promise<unknown[]>((resolve, reject) => {
  const r = db.transaction('notes').objectStore('notes').getAll()
  r.onsuccess = () => resolve(r.result)
  r.onerror   = () => reject(r.error)
})`,
  notes: 'Raw IndexedDB is verbose — most apps wrap it (idb-keyval, Dexie). Shown here to demystify.',
}
