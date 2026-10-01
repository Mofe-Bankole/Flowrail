/**
 * Tempo chain constants. Single place to change network.
 *
 * Values below were verified first-hand against `https://rpc.moderato.tempo.xyz`
 * on 2026-10-01 (chainId 42431, head block ~37.68M). See SPIKE.md for the
 * evidence and for which of these the deployed precompile actually honours.
 */

import { tempoModerato } from 'viem/tempo/chains'

export const TEMPO_RPC = 'https://rpc.moderato.tempo.xyz' as const
export const TEMPO_EXPLORER = 'https://explore.testnet.tempo.xyz' as const
export const MODERATO_CHAIN_ID = 42431 as const
export const TEMPO_MAINNET_CHAIN_ID = 4217 as const

/**
 * The account keychain precompile. Verified present on Moderato: eth_getCode
 * returns 0xef (non-empty).
 */
export const ACCOUNT_PRECOMPILE = '0xAAAAAAAA00000000000000000000000000000000' as const

export const PATH_USD = '0x20c0000000000000000000000000000000000000' as const
export const PATH_USD_DECIMALS = 6

/**
 * Selectors computed with keccak256 over the canonical signatures, then
 * CONFIRMED against the live precompile by probing which ones it recognises.
 * `verified: true` means Moderato answered with selector-specific behaviour.
 */
export const TEMPO_SELECTORS = {
  /** authorizeKey(address,uint8,uint64,bool,(address,uint256)[]) - RECOGNISED on Moderato. */
  authorizeKey: '0x54063a55',
  /** updateSpendingLimit(address,address,uint256) - RECOGNISED. Note: no token arg. */
  updateSpendingLimit: '0xcbbb4480',
  /** getKey(address,address) - RECOGNISED, returns 160-byte KeyInfo. */
  getKey: '0xbc298553',
  /** getAllowedCalls(address,address) - RECOGNISED, returns 96 bytes when empty. */
  getAllowedCalls: '0x0163e7ec',
  /** revokeKey(address) - RECOGNISED, root-only. */
  revokeKey: '0x5ae7ab32',
  /** setAllowedCalls(address,(address,(bytes4,address[])[])[]) - RECOGNISED. */
  setAllowedCalls: '0xf5456703',
  /** removeAllowedCalls(address,address) - RECOGNISED, root-only. */
  removeAllowedCalls: '0xf3941811',
  /** burnKeyAuthorizationWitness(bytes32) - RECOGNISED, admin-only (TIP-1053). */
  burnKeyAuthorizationWitness: '0xcff31c46',
  /** transferWithMemo(address,uint256,bytes32) - standard TIP-20. */
  transferWithMemo: '0x95777d59',
  transfer: '0xa9059cbb',
  approve: '0x095ea7b3',
} as const

/**
 * NOT present on Moderato, despite being canonical in TIP-1011. Recorded so we
 * do not re-derive this every time, and so the gap is auditable.
 */
export const TEMPO_ABSENT_ON_MODERATO = {
  /** authorizeKey(address,uint8,uint64,bool,(address,uint256,uint64)[],bool,(address,(bytes4,address[])[])[]) */
  authorizeKeyWithPeriodAndScopes: '0x203e2736',
  /** getRemainingLimit(address,address,address) - the "richer" read in TIP-1011. */
  getRemainingLimit: '0x63b4290d',
  /** updateSpendingLimit(address,address,address,uint256) - per-token variant. */
  updateSpendingLimitPerToken: '0x2a05ca72',
  getKeyInfo: '0x00e7f223',
} as const

/** Event topic0s confirmed present in Moderato logs. */
export const TEMPO_EVENTS = {
  keyAuthorized: '0x7c46af0758d3eca5e8195833bff1e5153f6249fc0f2968a878fd28544315a03c',
  keyRevoked: '0x14ce4f0c8c12936436b733974fb13d10fc13e8c41c06dc8e19d82001c93d7989',
} as const

export { tempoModerato }
