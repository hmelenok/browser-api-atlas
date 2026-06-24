import {Fingerprint, KeyRound, ShieldCheck} from 'lucide-react'
import {useState} from 'react'

import type {Demo} from '@/lib/types'
import {DemoButton, DemoFrame, DemoRow} from './_ui'

const RP_NAME = 'Browser API Atlas demo'

// Base64URL helpers
function bufferToB64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
function b64urlToBuffer(s: string): ArrayBuffer {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = norm.padEnd(norm.length + ((4 - (norm.length % 4)) % 4), '=')
  const bin = atob(pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out.buffer
}

interface StoredCred {
  id: string // base64url credential id
  created: number
}

const STORAGE_KEY = 'atlas-demo-webauthn-creds'

function loadStored(): StoredCred[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
function saveStored(list: StoredCred[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function WebAuthnDemo() {
  const supported =
    typeof window !== 'undefined' &&
    'PublicKeyCredential' in window &&
    typeof navigator.credentials?.create === 'function'

  const [creds, setCreds] = useState<StoredCred[]>(loadStored())
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const register = async () => {
    setError('')
    setStatus('')
    setBusy(true)
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const userId = crypto.getRandomValues(new Uint8Array(16))
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {name: RP_NAME, id: location.hostname || undefined},
          user: {
            id: userId,
            name: `demo-user-${Date.now()}`,
            displayName: 'Demo User',
          },
          pubKeyCredParams: [
            {type: 'public-key', alg: -7}, // ES256
            {type: 'public-key', alg: -257}, // RS256
          ],
          authenticatorSelection: {
            userVerification: 'preferred',
            residentKey: 'preferred',
          },
          timeout: 60_000,
        },
      })) as PublicKeyCredential | null

      if (!cred) throw new Error('No credential returned')
      const entry: StoredCred = {id: bufferToB64url(cred.rawId), created: Date.now()}
      const next = [entry, ...creds].slice(0, 5)
      setCreds(next)
      saveStored(next)
      setStatus(`✓ passkey created (id ${entry.id.slice(0, 12)}…)`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const authenticate = async () => {
    setError('')
    setStatus('')
    if (creds.length === 0) {
      setError('Register a passkey first.')
      return
    }
    setBusy(true)
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const result = (await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: creds.map((c) => ({
            type: 'public-key',
            id: b64urlToBuffer(c.id),
          })),
          userVerification: 'preferred',
          timeout: 60_000,
        },
      })) as PublicKeyCredential | null

      if (!result) throw new Error('No assertion')
      setStatus(`✓ signed in with passkey id ${bufferToB64url(result.rawId).slice(0, 12)}…`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const clearAll = () => {
    saveStored([])
    setCreds([])
    setStatus('local list cleared (passkey still exists in OS keychain)')
  }

  if (!supported) {
    return (
      <DemoFrame>
        <p className="text-xs text-[var(--color-status-unsupported)]">
          WebAuthn not available.
        </p>
      </DemoFrame>
    )
  }

  return (
    <DemoFrame>
      <DemoRow>
        <DemoButton onClick={register} disabled={busy}>
          <KeyRound size={12} />
          create passkey
        </DemoButton>
        <DemoButton variant="ghost" onClick={authenticate} disabled={busy || creds.length === 0}>
          <Fingerprint size={12} />
          sign in
        </DemoButton>
        {creds.length > 0 && (
          <DemoButton variant="danger" onClick={clearAll}>
            forget
          </DemoButton>
        )}
      </DemoRow>

      <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={18}
            className={
              creds.length > 0 ? 'text-[var(--color-status-supported)]' : 'text-[var(--color-muted)]'
            }
          />
          <p className="text-sm font-medium">
            {creds.length === 0
              ? 'No passkeys yet'
              : `${creds.length} passkey${creds.length > 1 ? 's' : ''} registered`}
          </p>
        </div>
        {creds.length > 0 && (
          <ul className="mt-2 space-y-1 font-mono text-[10px] text-[var(--color-muted)]">
            {creds.map((c, i) => (
              <li key={i}>
                #{i + 1}  id={c.id.slice(0, 16)}…  ·  {new Date(c.created).toLocaleTimeString([], {hour12: false})}
              </li>
            ))}
          </ul>
        )}
      </div>

      {status && (
        <p
          className="text-xs"
          style={{color: 'var(--color-status-supported)'}}
        >
          {status}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-[var(--color-status-unsupported)]">{error}</p>
      )}

      <p className="text-[10px] text-[var(--color-muted)]">
        Browser will prompt Touch ID / Windows Hello / security key / phone. The private key
        never leaves the authenticator; the server only sees the public key + signed challenge.
      </p>
    </DemoFrame>
  )
}

export const demo: Demo = {
  bcdKey: 'api.PublicKeyCredential',
  title: 'WebAuthn / Passkeys',
  Demo: WebAuthnDemo,
  snippet: `// Registration — server sends a challenge, browser prompts the user
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: serverChallenge,   // Uint8Array, 16+ bytes
    rp: {name: 'My App', id: 'myapp.com'},
    user: {
      id: userIdBytes,            // 16 bytes, *not* email
      name: 'alice@example.com',
      displayName: 'Alice',
    },
    pubKeyCredParams: [
      {type: 'public-key', alg: -7},    // ES256
      {type: 'public-key', alg: -257},  // RS256
    ],
    authenticatorSelection: {
      residentKey: 'preferred',         // makes a passkey, not just a key
      userVerification: 'preferred',
    },
  },
})

// Send credential.id + credential.response.publicKey to server for storage.

// Authentication — server sends a fresh challenge
const assertion = await navigator.credentials.get({
  publicKey: {
    challenge: serverChallenge,
    allowCredentials: [{type: 'public-key', id: storedCredentialId}],
    userVerification: 'preferred',
  },
})
// Send assertion.response.signature to server for verification.`,
  notes: 'Passkeys (= resident credentials) sync via the OS keychain (iCloud Keychain, Google Password Manager, etc) so users can sign in from a new device without re-registering.',
}
