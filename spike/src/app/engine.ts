/**
 * The FlowRail engine. Composes ports. Does not import viem or the filesystem.
 *
 * A run moves: classify → approve the exceptions → authorize a key per payee →
 * lock each key to one recipient → batch. A key with no confirmed lock is not
 * usable. That is not a preference. Moderato proved an unlocked key can pay anyone.
 */

import { decideTier, reconcile, ttlForTier } from '../domain/policy.js'
import { POLICY, type Address, type InvoiceLine, type Payout, type Tier } from '../domain/types.js'
import type { ChainPort, LedgerPort, RosterPort, TransferInput } from '../ports/index.js'

export type RunLeg = {
  payout: Payout
  tier: Tier
  reasons: string[]
  approved: boolean
}

export type ClassifiedRun = {
  id: string
  at: number
  legs: RunLeg[]
  unresolved: InvoiceLine[]
  counts: { auto: number; finance: number; dual: number }
}

export type PreparedKey = {
  payeeId: string
  keyId: Address
  txHash: `0x${string}`
  scopeTx: `0x${string}`
  lockedTo: Address
  /** Spike signing material. Never write this to a committed file. */
  privateKey: `0x${string}`
}

export type SettledBatch = {
  runId: string
  txHash: `0x${string}`
  legs: number
}

const TRANSFER = '0xa9059cbb' as const

export async function classifyRun(
  id: string,
  lines: readonly InvoiceLine[],
  roster: RosterPort,
  ledger: LedgerPort,
  now = Math.floor(Date.now() / 1000),
): Promise<ClassifiedRun> {
  const payees = await roster.all()
  const { payouts, unresolved } = reconcile(lines, payees, now)
  const byId = new Map(payees.map((payee) => [payee.id, payee]))

  const legs = payouts.map((payout) => {
    const payee = byId.get(payout.payeeId)
    const decision = payee
      ? decideTier(payee, payout.amount, now)
      : { tier: 'dual' as const, reasons: ['payee missing from roster'] }
    return {
      payout,
      tier: decision.tier,
      reasons: decision.reasons,
      approved: decision.tier === 'auto',
    }
  })

  const run = {
    id,
    at: now,
    legs,
    unresolved,
    counts: {
      auto: legs.filter((leg) => leg.tier === 'auto').length,
      finance: legs.filter((leg) => leg.tier === 'finance').length,
      dual: legs.filter((leg) => leg.tier === 'dual').length,
    },
  }

  await ledger.append({
    at: now,
    kind: 'payout.classified',
    detail: { runId: id, counts: run.counts, unresolved: unresolved.length },
  })
  return run
}

export function approve(run: ClassifiedRun, payeeId: string): ClassifiedRun {
  return {
    ...run,
    legs: run.legs.map((leg) =>
      leg.payout.payeeId === payeeId ? { ...leg, approved: true } : leg,
    ),
  }
}

export function readyToAuthorize(run: ClassifiedRun): { ok: true } | { ok: false; why: string } {
  if (run.unresolved.length > 0) {
    return { ok: false, why: `${run.unresolved.length} invoice lines have no payee` }
  }
  const waiting = run.legs.filter((leg) => !leg.approved)
  if (waiting.length > 0) {
    return { ok: false, why: `${waiting.length} payouts still need a person` }
  }
  return { ok: true }
}

/**
 * Authorize one key per approved leg, then immediately lock it to that payee.
 * The lock is transfer(address,uint256) with a single recipient. A key is not
 * returned until that second transaction has a hash.
 */
export async function authorizeFleet(
  run: ClassifiedRun,
  chain: ChainPort,
  ledger: LedgerPort,
  account: Address,
): Promise<PreparedKey[]> {
  const gate = readyToAuthorize(run)
  if (!gate.ok) throw new Error(gate.why)

  const prepared: PreparedKey[] = []
  for (const leg of run.legs) {
    const expiry = run.at + ttlForTier(leg.tier)
    const authorized = await chain.authorizeKey({
      account,
      chainId: chain.chainId,
      expiry,
      limits: [[leg.payout.token, leg.payout.amount]],
    })
    await ledger.append({
      at: run.at,
      kind: 'key.authorized',
      detail: { runId: run.id, payeeId: leg.payout.payeeId, keyId: authorized.keyId, tx: authorized.txHash },
    })

    const scopeTx = await chain.setAllowedCalls({
      account,
      keyId: authorized.keyId,
      scopes: [{ address: leg.payout.token, selector: TRANSFER, recipients: [leg.payout.to] }],
    })
    await ledger.append({
      at: run.at,
      kind: 'key.scoped',
      detail: { runId: run.id, keyId: authorized.keyId, lockedTo: leg.payout.to, tx: scopeTx },
    })
    prepared.push({
      payeeId: leg.payout.payeeId,
      keyId: authorized.keyId,
      txHash: authorized.txHash,
      scopeTx,
      lockedTo: leg.payout.to,
      privateKey: authorized.privateKey,
    })
  }
  return prepared
}

function memoFor(payeeId: string): `0x${string}` {
  const bytes = Buffer.from(payeeId).subarray(0, 32)
  return `0x${bytes.toString('hex').padEnd(64, '0')}`
}

/**
 * Send every locked leg in one transaction. Refuses a fleet that is missing a
 * lock hash, or whose lock does not match the payee. The memo is the payee id.
 */
export async function executeBatch(
  run: ClassifiedRun,
  keys: readonly PreparedKey[],
  chain: ChainPort,
  ledger: LedgerPort,
  from: Address,
): Promise<SettledBatch> {
  if (keys.length !== run.legs.length) {
    throw new Error(`fleet has ${keys.length} keys for ${run.legs.length} legs`)
  }
  const byPayee = new Map(keys.map((key) => [key.payeeId, key]))
  const transfers: TransferInput[] = run.legs.map((leg) => {
    const key = byPayee.get(leg.payout.payeeId)
    if (!key?.scopeTx) throw new Error(`${leg.payout.payeeId} has no confirmed recipient lock`)
    if (key.lockedTo !== leg.payout.to) throw new Error(`${leg.payout.payeeId} lock does not match the payee`)
    return {
      from,
      to: leg.payout.to,
      token: leg.payout.token,
      amount: leg.payout.amount,
      memo: memoFor(leg.payout.payeeId),
    }
  })
  const txHash = await chain.batchTransferWithMemo(transfers)
  await ledger.append({
    at: run.at,
    kind: 'batch.executed',
    detail: { runId: run.id, tx: txHash, legs: transfers.length },
  })
  return { runId: run.id, txHash, legs: transfers.length }
}

export { POLICY }
