import { describe, expect, it } from 'vitest'
import { approve, authorizeFleet, classifyRun, readyToAuthorize } from '../src/app/engine.js'
import type { Address, InvoiceLine, Payee } from '../src/domain/types.js'
import type { ChainPort, LedgerEntry, LedgerPort, RosterPort } from '../src/ports/index.js'

const jane: Payee = {
  id: 'jane',
  name: 'Jane Adeyemi',
  address: '0x1111111111111111111111111111111111111111',
  addressStableForDays: 40,
}
const ada: Payee = {
  id: 'ada',
  name: 'Ada Okonkwo',
  address: '0x2222222222222222222222222222222222222222',
  addressStableForDays: 21,
}
const neo: Payee = {
  id: 'neo',
  name: 'Neo Ade',
  address: '0x3333333333333333333333333333333333333333',
  addressStableForDays: 1,
}

function roster(payees: Payee[]): RosterPort {
  return { all: async () => payees, put: async () => undefined }
}

function ledger(): LedgerPort & { entries: LedgerEntry[] } {
  const entries: LedgerEntry[] = []
  return {
    entries,
    append: async (entry) => { entries.push(entry) },
    all: async () => entries,
    toJsonl: () => entries.map((entry) => JSON.stringify(entry)).join('\n'),
  }
}

const lines: InvoiceLine[] = [
  { payeeId: 'ada', amount: '65.00' },
  { payeeId: 'jane', amount: '1850.00' },
  { payeeId: 'neo', amount: '40.00' },
  { payeeId: 'missing', amount: '10.00' },
]

describe('classifyRun', () => {
  it('keeps unmatched lines unresolved and does not auto-approve exceptions', async () => {
    const book = ledger()
    const run = await classifyRun('INV-2500', lines, roster([jane, ada, neo]), book, 1_700_000_000)
    expect(run.counts).toEqual({ auto: 1, finance: 1, dual: 1 })
    expect(run.unresolved).toHaveLength(1)
    expect(run.legs.find((leg) => leg.payout.payeeId === 'jane')?.approved).toBe(false)
    expect(run.legs.find((leg) => leg.payout.payeeId === 'ada')?.approved).toBe(true)
    expect(book.entries).toHaveLength(1)
  })
})

describe('readyToAuthorize', () => {
  it('refuses a run with an unresolved line or an unapproved payout', async () => {
    const run = await classifyRun('INV-2500', lines, roster([jane, ada, neo]), ledger(), 1_700_000_000)
    expect(readyToAuthorize(run).ok).toBe(false)
    const approved = approve(run, 'jane')
    expect(readyToAuthorize({ ...approved, unresolved: [] }).ok).toBe(false)
  })
})

describe('authorizeFleet', () => {
  it('locks each key to its payee before returning it', async () => {
    const scoped: string[] = []
    const chain = {
      chainId: 42431,
      authorizeKey: async () => ({
        txHash: '0xabc',
        keyId: '0x4444444444444444444444444444444444444444' as Address,
        privateKey: '0x01',
      }),
      setAllowedCalls: async (input: { keyId: Address; scopes: readonly { recipients?: readonly Address[] }[] }) => {
        scoped.push(input.scopes[0]?.recipients?.[0] ?? '')
        return '0xdef'
      },
    } as unknown as ChainPort
    const book = ledger()
    const run = await classifyRun('INV-1', [{ payeeId: 'ada', amount: '65.00' }], roster([ada]), book, 1_700_000_000)
    const keys = await authorizeFleet(run, chain, book, '0x5555555555555555555555555555555555555555')
    expect(keys).toHaveLength(1)
    expect(keys[0]?.lockedTo).toBe(ada.address)
    expect(scoped).toEqual([ada.address])
    expect(book.entries.map((entry) => entry.kind)).toContain('key.scoped')
  })
})
