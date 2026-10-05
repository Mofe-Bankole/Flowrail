/**
 * Local agent keystore + JSONL ledger + roster, all filesystem-backed.
 *
 * These exist so the spike has no server. They are deliberately the *dumbest*
 * possible implementations: swap them for KMS and Postgres after the demo, and
 * nothing above this layer changes.
 */

import { appendFile, chmod, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { LedgerEntry, LedgerPort, RosterPort } from '../../ports/index.js'
import type { Payee } from '../../domain/types.js'

const HERE = dirname(fileURLToPath(import.meta.url))
// store.ts lives at src/adapters/local/, so the package root is three levels up.
export const SPIKE_ROOT = join(HERE, '..', '..', '..')
export const DATA_DIR = join(SPIKE_ROOT, '.data')
export const KEYS_FILE = join(DATA_DIR, 'agent.json')
export const LEDGER_FILE = join(DATA_DIR, 'ledger.jsonl')
export const ROSTER_FILE = join(DATA_DIR, 'roster.json')
/**
 * Addresses of roots we stopped trusting. Never private keys: a retired secret
 * must not outlive its retirement, or "we rotated" is just a note in a file.
 */
export const RETIRED_FILE = join(DATA_DIR, 'retired-agents.json')

export type AgentIdentity = {
  address: string
  privateKey: string
  createdAt: number
  note: string
}

export type RetiredAgent = {
  address: string
  createdAt: number
  retiredAt: number
  why: string
}

export async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function writeAgent(identity: AgentIdentity): Promise<void> {
  await ensureDataDir()
  await writeFile(KEYS_FILE, JSON.stringify(identity, null, 2) + '\n', { mode: 0o600 })
  // `mode` on writeFile only applies when the file is created. Re-assert it so
  // rewriting an existing keystore cannot silently keep looser permissions.
  await chmod(KEYS_FILE, 0o600)
}

/**
 * Refuse to use a root key anyone but the owner can read.
 *
 * The spike stores the key in plaintext on purpose - it exists to get out of the
 * way of the protocol work - so the file mode is the only real protection this
 * key has. It is worth verifying rather than trusting: a permissive umask, a
 * file restored from a backup, or a `chmod` by hand all leave the key readable
 * by everyone else on the machine while every command still reports success.
 *
 * Throws rather than warning, because the safe action - `chmod 600` - is not
 * something the caller can usefully take on the user's behalf.
 */
async function assertKeyPermissions(): Promise<void> {
  const { mode } = await stat(KEYS_FILE)
  const bits = mode & 0o777
  if ((bits & 0o077) !== 0) {
    throw new Error(
      `${KEYS_FILE} is mode ${bits.toString(8).padStart(4, '0')}: readable by users other than you. ` +
        `Fix it with: chmod 600 ${KEYS_FILE}`,
    )
  }
}

export async function readAgent(): Promise<AgentIdentity> {
  await assertKeyPermissions()
  const raw = await readFile(KEYS_FILE, 'utf8')
  return JSON.parse(raw) as AgentIdentity
}

export async function agentExists(): Promise<boolean> {
  try {
    await readAgent()
    return true
  } catch {
    return false
  }
}

export async function readRetired(): Promise<RetiredAgent[]> {
  try {
    return JSON.parse(await readFile(RETIRED_FILE, 'utf8')) as RetiredAgent[]
  } catch {
    return []
  }
}

export async function recordRetired(entry: RetiredAgent): Promise<void> {
  await ensureDataDir()
  const next = [...(await readRetired()), entry]
  await writeFile(RETIRED_FILE, JSON.stringify(next, null, 2) + '\n')
}

export function createJsonlLedger(file = LEDGER_FILE): LedgerPort {
  return {
    async append(entry: LedgerEntry) {
      await ensureDataDir()
      await appendFile(file, JSON.stringify(entry) + '\n', 'utf8')
    },
    async all() {
      try {
        const raw = await readFile(file, 'utf8')
        return raw
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line) as LedgerEntry)
      } catch {
        return []
      }
    },
    toJsonl() {
      // Synchronous by design: this is only used for "print me the trail".
      try {
        return readFileSyncSafe(file)
      } catch {
        return ''
      }
    },
  }
}

function readFileSyncSafe(file: string): string {
  return readFileSync(file, 'utf8')
}

export function createJsonRoster(file = ROSTER_FILE): RosterPort {
  async function all(): Promise<readonly Payee[]> {
    try {
      return JSON.parse(await readFile(file, 'utf8')) as Payee[]
    } catch {
      return []
    }
  }
  return {
    all,
    async put(payee: Payee) {
      await ensureDataDir()
      const current = await all()
      const next = [...current.filter((p) => p.id !== payee.id), payee]
      await writeFile(file, JSON.stringify(next, null, 2) + '\n')
    },
  }
}
