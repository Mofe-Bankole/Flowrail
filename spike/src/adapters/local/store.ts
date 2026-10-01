/**
 * Local agent keystore + JSONL ledger + roster, all filesystem-backed.
 *
 * These exist so the spike has no server. They are deliberately the *dumbest*
 * possible implementations: swap them for KMS and Postgres after the demo, and
 * nothing above this layer changes.
 */

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
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

export type AgentIdentity = {
  address: string
  privateKey: string
  createdAt: number
  note: string
}

export async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function writeAgent(identity: AgentIdentity): Promise<void> {
  await ensureDataDir()
  await writeFile(KEYS_FILE, JSON.stringify(identity, null, 2) + '\n', { mode: 0o600 })
}

export async function readAgent(): Promise<AgentIdentity> {
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
