/**
 * Domain types. Pure data + invariants. No chain imports, no SDK imports.
 *
 * The rule for this layer: if it needs to ask the chain a question, it does not
 * belong here. Everything here is a value or a total function over values, so
 * it can be unit-tested with no RPC and no keys.
 */

export type Address = `0x${string}`

/** Tempo TIP-20 stablecoins. pathUSD is the demo denomination. */
export const TOKENS = {
  pathUSD: '0x20c0000000000000000000000000000000000000',
  alphaUSD: '0x20c0000000000000000000000000000000000001',
  betaUSD: '0x20c0000000000000000000000000000000000002',
  thetaUSD: '0x20c0000000000000000000000000000000000003',
} as const satisfies Record<string, Address>

export type TokenSymbol = keyof typeof TOKENS

/** All Tempo stablecoins use 6 decimals. */
export const TOKEN_DECIMALS = 6

/**
 * A payee is someone an agency pays. `address` is the on-chain destination;
 * `virtualAddress` is the Tempo virtual address that receives the agency
 * payment and carries the memo that identifies the payee.
 */
export type Payee = {
  id: string
  name: string
  /** Where the money actually goes. */
  address: Address
  /** Virtual address on the agency account that receives inbound payments. */
  virtualAddress?: Address
  /** Days the address has been stable. Below the threshold, a payout is Finance tier. */
  addressStableForDays: number
}

/** One line of an inbound invoice. */
export type InvoiceLine = {
  payeeId: string
  /** Human amount, e.g. "65.00". Parsed to base units by the domain. */
  amount: string
  memo?: string
}

/** The reconciled intent: pay these people these amounts. */
export type Payout = {
  payeeId: string
  to: Address
  amount: bigint
  token: Address
  /** Non-null when this payout needs a human signature before execution. */
  escalation?: Escalation
}

export type Escalation = {
  reason: 'new_payee' | 'address_changed' | 'amount_over_auto_cap' | 'amount_over_dual_cap'
  detail: string
}

/** The three tiers. Deliberately named for what a human has to do, not how it works. */
export type Tier = 'auto' | 'finance' | 'dual'

/** Thresholds. Single source of truth; the UI reads these so it cannot drift. */
export const POLICY = {
  /** Payees stable for at least this many days can ride a standing key. */
  addressStabilityDays: 7,
  /** Amounts above this need a human signature. */
  autoCap: 500_000_000n, // 500.00 in 6dp base units
  /** Anything above this needs a fresh key plus explicit review. Never a standing key. */
  dualCap: 2_000_000_000n, // 2000.00
  /** Lifetime of a standing key. Short on purpose: renewal is the control. */
  standingKeyTtlSeconds: 7 * 24 * 60 * 60,
  /** Lifetime of a one-time key. Hours, not days. */
  oneTimeKeyTtlSeconds: 12 * 60 * 60,
} as const

/** A decision, plus why. The `why` is what the audit trail is made of. */
export type TierDecision = {
  tier: Tier
  reasons: string[]
}

/** One access key in the fleet. Mirrors what the chain stores, plus our bookkeeping. */
export type AccessKeyRecord = {
  keyId: Address
  /** Which payee this key may pay. One key per payee, never shared. */
  payeeId: string
  token: Address
  /** Absolute on-chain cap in base units. Moderato has no rolling window. */
  cap: bigint
  /** Unix seconds. The key is dead after this, enforced by the protocol. */
  expiry: number
  /** Authorizing tx hash. */
  authorizedInTx?: `0x${string}`
  status: 'active' | 'exhausted' | 'expired' | 'revoked'
}
