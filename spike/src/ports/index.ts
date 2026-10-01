/**
 * Ports. The interfaces the domain and app layers are allowed to depend on.
 *
 * This is the whole point of the layering: `domain/` imports nothing, `app/`
 * imports only these interfaces, and `adapters/` provide the Tempo
 * implementations. Swapping Moderato for mainnet, or a JSONL ledger for Postgres,
 * touches adapters only.
 */

import type { AccessKeyRecord, Address, Payee } from '../domain/types.js'

/** Read + write access to Tempo. The only place that knows Tempo exists. */
export interface ChainPort {
  readonly chainId: number
  blockNumber(): Promise<bigint>

  /** Ask the faucet for test funds. Moderato-only convenience. */
  fundAddress(address: Address): Promise<string>

  balanceOf(address: Address, token: Address): Promise<bigint>

  /**
   * Submit a root-signed access-key authorization.
   * The authorization is signed by the root key; this broadcasts it.
   * Returns the tx hash and the key id the chain will actually store.
   */
  authorizeKey(input: AuthorizeKeyInput): Promise<AuthorizedKey>

  /** What the protocol says about a key. Source of truth for key state. */
  readKey(keyId: Address, account: Address): Promise<OnChainKey | null>

  /** Restrict a live key's callable targets. Root-only on chain. */
  setAllowedCalls(input: SetAllowedCallsInput): Promise<`0x${string}`>

  /** Kill a live key. Root-only on chain - the customer must be the one to act. */
  revokeKey(account: Address, keyId: Address): Promise<`0x${string}`>

  /** Move stablecoin with a 32-byte memo, tagging the intended payee. */
  transferWithMemo(input: TransferInput): Promise<`0x${string}`>

  /** Several transfers in one transaction: all succeed or all revert. */
  batchTransferWithMemo(inputs: readonly TransferInput[]): Promise<`0x${string}`>

  explorerTx(hash: `0x${string}`): string

  /** Raw eth_call. Probes only. Not a product path. */
  rawCall(to: Address, data: `0x${string}`): Promise<`0x${string}`>
}

/** A root-signed authorization, assembled by the SDK, ready to broadcast. */
export type AuthorizeKeyInput = {
  /** Optional. If omitted, the adapter mints a fresh key and returns its id. */
  keyId?: Address
  account: Address
  chainId: number
  expiry: number
  /** (token, cap, periodSeconds). `period` omitted = absolute cap. */
  limits: readonly (readonly [Address, bigint, number?])[]
  /** `undefined` means an unrestricted key. We never intend that. */
  scopes?: readonly { address: Address; selector?: `0x${string}`; recipients?: readonly Address[] }[]
  witness?: `0x${string}`
}

export type AuthorizedKey = {
  txHash: `0x${string}`
  keyId: Address
  /** Spike-only. Gitignored. Never log this into a committed file. */
  privateKey: `0x${string}`
}

export type SetAllowedCallsInput = {
  account: Address
  keyId: Address
  scopes: readonly { address: Address; selector?: `0x${string}`; recipients?: readonly Address[] }[]
}

export type TransferInput = {
  from: Address
  to: Address
  token: Address
  amount: bigint
  /** 32 bytes. Encodes the payee id so a relayer cannot reroute the payment. */
  memo: `0x${string}`
}

/** What the precompile reports. Field names follow the deployed KeyInfo. */
export type OnChainKey = {
  keyId: Address
  exists: boolean
  expiry?: number
  /** Absolute caps per token, base units. */
  limits?: readonly { token: Address; limit: bigint }[]
  /** Absent = unrestricted. This is the field that decides our fail-open risk. */
  scopes?: readonly { address: Address; selector?: `0x${string}`; recipients?: readonly Address[] }[]
  isAdmin?: boolean
}

/** Append-only record of every decision and every transaction. */
export interface LedgerPort {
  append(entry: LedgerEntry): Promise<void>
  all(): Promise<readonly LedgerEntry[]>
  toJsonl(): string
}

export type LedgerEntry = {
  at: number
  kind:
    | 'agent.created'
    | 'agent.funded'
    | 'key.authorized'
    | 'key.scoped'
    | 'key.revoked'
    | 'payout.classified'
    | 'batch.executed'
    | 'probe.result'
  detail: Record<string, unknown>
}

/** Signing. Kept separate from ChainPort so tests can supply a fake signer. */
export interface SignerPort {
  readonly address: Address
  /** Sign an access-key authorization digest with the root key. */
  signAuthorization(digest: `0x${string}`): Promise<`0x${string}`>
  signTransaction(input: SignTransactionInput): Promise<`0x${string}`>
}

export type SignTransactionInput = {
  to: Address
  data: `0x${string}`
  value?: bigint
}

/** Payee roster. A file for the spike; a database later. */
export interface RosterPort {
  all(): Promise<readonly Payee[]>
  put(payee: Payee): Promise<void>
}
