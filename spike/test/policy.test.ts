import { describe, expect, it } from 'vitest'

import { approve, classifyRun } from '../src/app/engine.js'
import { decideTier, fmt, parseAmount, reconcile, ttlForTier } from '../src/domain/policy.js'
import { POLICY, type InvoiceLine, type Payee } from '../src/domain/types.js'
import type { LedgerEntry, LedgerPort, RosterPort } from '../src/ports/index.js'

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

const NOW = 1_700_000_000

describe('approve', () => {
  // The regression this whole change exists for. Ada has two invoice lines: a
  // routine one and one over the dual cap. Both carry payeeId "ada". Matching
  // on payeeId approved both at once, so clearing the $65 line silently
  // authorised the $2,500 one with the same click.
  const twoLines: InvoiceLine[] = [
    { payeeId: 'ada', amount: '65.00' },
    { payeeId: 'ada', amount: '2500.00' },
  ]

  it('gives each invoice line its own leg id', async () => {
    const run = await classifyRun('INV-1', twoLines, roster([ada]), ledger(), NOW)
    expect(run.legs.map((leg) => leg.legId)).toEqual(['ada', 'ada#2'])
    expect(new Set(run.legs.map((leg) => leg.legId)).size).toBe(2)
  })

  it('approving one line does not approve its sibling', async () => {
    const run = await classifyRun('INV-1', twoLines, roster([ada]), ledger(), NOW)
    const approved = approve(run, 'ada')
    const byId = new Map(approved.legs.map((leg) => [leg.legId, leg.approved]))
    expect(byId.get('ada')).toBe(true)
    expect(byId.get('ada#2')).toBe(false)
  })

  it('the escalated line needs its own approval and gets it by leg id', async () => {
    const run = await classifyRun('INV-1', twoLines, roster([ada]), ledger(), NOW)
    expect(run.legs.find((leg) => leg.legId === 'ada#2')?.approved).toBe(false)
    const approved = approve(run, 'ada#2')
    expect(approved.legs.every((leg) => leg.approved)).toBe(true)
  })

  it('throws on an unknown leg id instead of silently doing nothing', async () => {
    const run = await classifyRun('INV-1', twoLines, roster([ada]), ledger(), NOW)
    // A no-op return here would be indistinguishable from a real approval.
    await expect(async () => approve(run, 'ada#3')).rejects.toThrow(/no leg "ada#3"/)
    await expect(async () => approve(run, 'nobody')).rejects.toThrow(/no leg/)
  })

  it('does not mutate the run it was given', async () => {
    const run = await classifyRun('INV-1', twoLines, roster([ada]), ledger(), NOW)
    approve(run, 'ada#2')
    expect(run.legs.find((leg) => leg.legId === 'ada#2')?.approved).toBe(false)
  })
})

describe('decideTier', () => {
  it('auto on a standing payee within the cap, with no findings', () => {
    const decision = decideTier(ada, parseAmount('65.00'), NOW)
    expect(decision.tier).toBe('auto')
    expect(decision.findings).toEqual([])
  })

  it('finance over the auto cap, recorded as a code', () => {
    const decision = decideTier(ada, parseAmount('1850.00'), NOW)
    expect(decision.tier).toBe('finance')
    expect(decision.findings).toEqual(['amount_over_auto_cap'])
  })

  it('a large payment to a long-known address is finance, never dual', () => {
    // The escalation reason is a claim about trust, and this is a claim about
    // size. Merging the two would tell a reviewer a known payee is unvouched for.
    const decision = decideTier(ada, parseAmount('2500.00'), NOW)
    expect(decision.tier).toBe('finance')
    expect(decision.findings).toEqual(['amount_over_dual_cap'])
  })

  it('dual on a new address, whatever the amount', () => {
    const small = decideTier(neo, parseAmount('0.01'), NOW)
    expect(small.tier).toBe('dual')
    expect(small.findings).toEqual(['unstable_address'])

    const large = decideTier(neo, parseAmount('9000.00'), NOW)
    expect(large.tier).toBe('dual')
    // Trust outranks size, so the trust finding is present and the tier does
    // not get relabelled as a size problem.
    expect(large.findings).toContain('unstable_address')
  })

  it('records both findings when a new address is also large', () => {
    const decision = decideTier(neo, parseAmount('9000.00'), NOW)
    expect(decision.findings).toEqual(['unstable_address', 'amount_over_dual_cap'])
  })

  it('treats the cap as exclusive, so exactly at the cap is still auto', () => {
    expect(decideTier(ada, POLICY.autoCap, NOW).tier).toBe('auto')
    expect(decideTier(ada, POLICY.autoCap + 1n, NOW).tier).toBe('finance')
  })
})

describe('reconcile', () => {
  it('refuses to guess at a payee it cannot resolve', () => {
    const result = reconcile([{ payeeId: 'nobody', amount: '10.00' }], [ada], NOW)
    expect(result.payouts).toHaveLength(0)
    expect(result.unresolved).toHaveLength(1)
  })

  it('keeps duplicate lines as separate payouts, each with its own amount', async () => {
    const lines: InvoiceLine[] = [
      { payeeId: 'ada', amount: '10.00' },
      { payeeId: 'ada', amount: '5.00' },
    ]
    const result = reconcile(lines, [ada], NOW)
    // Two payouts to one address. Merging them would hide which invoice line a
    // human actually cleared, and would let a small line authorise a large one.
    expect(result.payouts.map((p) => p.amount)).toEqual([10_000_000n, 5_000_000n])

    const run = await classifyRun('INV-1', lines, roster([ada]), ledger(), NOW)
    expect(run.legs.map((leg) => leg.legId)).toEqual(['ada', 'ada#2'])
    expect(run.legs.every((leg) => leg.tier === 'auto')).toBe(true)
  })
})

describe('amounts', () => {
  it('parses to six decimals and rejects junk rather than paying zero', () => {
    expect(parseAmount('65.00')).toBe(65_000_000n)
    expect(parseAmount('65')).toBe(65_000_000n)
    expect(parseAmount(' 65.5 ')).toBe(65_500_000n)
    expect(parseAmount('0.000001')).toBe(1n)
    for (const junk of ['', '-1', '1.0000001', '1.', 'abc', '1e3', '1,000']) {
      expect(() => parseAmount(junk)).toThrow()
    }
  })

  it('formats without trailing zeros', () => {
    expect(fmt(65_000_000n)).toBe('65')
    expect(fmt(1_850_000_000n)).toBe('1850')
    expect(fmt(1n)).toBe('0.000001')
    expect(fmt(0n)).toBe('0')
  })
})

describe('ttlForTier', () => {
  it('gives auto legs a week and everything escalated half a day', () => {
    expect(ttlForTier('auto')).toBe(POLICY.standingKeyTtlSeconds)
    expect(ttlForTier('finance')).toBe(POLICY.oneTimeKeyTtlSeconds)
    expect(ttlForTier('dual')).toBe(POLICY.oneTimeKeyTtlSeconds)
    expect(ttlForTier('auto')).toBeGreaterThan(ttlForTier('finance'))
  })
})
