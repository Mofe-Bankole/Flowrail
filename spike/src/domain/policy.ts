/**
 * Pure decision logic. No chain, no IO, no clock reads.
 *
 * Every function takes the clock value as an argument so that time-dependent
 * behaviour is testable and so the caller can prove what time it used.
 */

import { POLICY, type AccessKeyRecord, type FindingCode, type InvoiceLine, type Payee, type Payout, type TierDecision } from './types.js'

/**
 * Decide which tier a payout falls into.
 *
 * The tier answers exactly one question: does a human have to sign before this
 * goes out? It never decides whether the key is *able* to pay - that is the
 * chain's job and it will revert if we get it wrong.
 */
export function decideTier(payee: Payee, amount: bigint, _now: number): TierDecision {
  const findings: FindingCode[] = []
  const reasons: string[] = []

  if (payee.addressStableForDays < POLICY.addressStabilityDays) {
    findings.push('unstable_address')
    reasons.push(
      `address only stable ${payee.addressStableForDays}d (< ${POLICY.addressStabilityDays}d)`,
    )
  }

  if (amount > POLICY.dualCap) {
    findings.push('amount_over_dual_cap')
    reasons.push(`amount ${fmt(amount)} exceeds dual cap ${fmt(POLICY.dualCap)}`)
  } else if (amount > POLICY.autoCap) {
    findings.push('amount_over_auto_cap')
    reasons.push(`amount ${fmt(amount)} exceeds auto cap ${fmt(POLICY.autoCap)}`)
  }

  // "dual" is reserved for the irreversible case: a destination we have not
  // vouched for. Amount alone escalates to finance, never to dual - a large
  // payment to a long-known address is a size problem, not a trust problem.
  if (findings.includes('unstable_address')) {
    return { tier: 'dual', findings, reasons }
  }
  if (findings.length > 0) {
    return { tier: 'finance', findings, reasons }
  }
  return { tier: 'auto', findings, reasons: ['standing payee, within auto cap'] }
}

/** Key lifetime for a tier. A one-time key lives for hours; a standing key for a week. */
export function ttlForTier(tier: TierDecision['tier']): number {
  return tier === 'auto' ? POLICY.standingKeyTtlSeconds : POLICY.oneTimeKeyTtlSeconds
}

/**
 * Turn invoice lines into payouts, attaching the escalation reason.
 *
 * Unknown payees are not silently dropped and not guessed at: they are returned
 * separately as `unresolved`, which produces no leg at all and blocks the whole
 * run. A line naming a payee we cannot resolve is exactly the case a human must
 * see before any key is minted.
 */
export function reconcile(
  lines: readonly InvoiceLine[],
  payees: readonly Payee[],
  now: number,
): { payouts: Payout[]; unresolved: InvoiceLine[] } {
  const byId = new Map(payees.map((p) => [p.id, p]))
  const payouts: Payout[] = []
  const unresolved: InvoiceLine[] = []

  for (const line of lines) {
    const payee = byId.get(line.payeeId)
    if (!payee) {
      unresolved.push(line)
      continue
    }
    const amount = parseAmount(line.amount)
    const decision = decideTier(payee, amount, now)
    payouts.push({
      payeeId: payee.id,
      to: payee.address,
      amount,
      token: payeeAddressTokenFallback(),
      ...(decision.tier === 'auto'
        ? {}
        : { escalation: { reason: escalationReason(decision), detail: decision.reasons.join('; ') } }),
    })
  }

  return { payouts, unresolved }
}

/** Reads the decision's codes. Precedence is trust first, then size. */
function escalationReason(d: TierDecision): NonNullable<Payout['escalation']>['reason'] {
  if (d.findings.includes('unstable_address')) return 'new_payee'
  if (d.findings.includes('amount_over_dual_cap')) return 'amount_over_dual_cap'
  return 'amount_over_auto_cap'
}

/** pathUSD base units. Kept here so the token choice is one line to change. */
function payeeAddressTokenFallback() {
  return '0x20c0000000000000000000000000000000000000' as const
}

/** "65.00" -> 65000000n. Throws on junk rather than silently paying zero. */
export function parseAmount(human: string): bigint {
  const m = /^(\d+)(?:\.(\d{1,6}))?$/.exec(human.trim())
  if (!m) throw new Error(`unparseable amount: ${JSON.stringify(human)}`)
  const whole = m[1]
  const frac = m[2] ?? ''
  if (whole === undefined) throw new Error(`unparseable amount: ${JSON.stringify(human)}`)
  return BigInt(whole) * 10n ** 6n + BigInt(frac.padEnd(6, '0'))
}

/**
 * 65000000n -> "65", 1850000000n -> "1850", 1n -> "0.000001".
 *
 * Trailing zeros are dropped so whole-dollar amounts read as whole dollars.
 * Display only, even though the output does happen to round-trip through
 * `parseAmount` - do not rely on that, it is not the contract.
 */
export function fmt(base: bigint): string {
  const neg = base < 0n
  const v = neg ? -base : base
  const whole = v / 10n ** 6n
  const frac = (v % 10n ** 6n).toString().padStart(6, '0').replace(/0+$/, '')
  return `${neg ? '-' : ''}${whole}${frac ? `.${frac}` : ''}`
}

/**
 * Is this key still usable at `now`?
 *
 * FlowRail is not the enforcement point - the protocol reverts on an expired or
 * over-cap key regardless of what we think. This exists so the UI can grey out
 * a dead key instead of offering a button that will fail.
 */
export function keyUsableAt(key: AccessKeyRecord, now: number): { usable: boolean; why?: string } {
  if (key.status !== 'active') return { usable: false, why: `status ${key.status}` }
  if (key.expiry <= now) return { usable: false, why: `expired at ${new Date(key.expiry * 1000).toISOString()}` }
  return { usable: true }
}
