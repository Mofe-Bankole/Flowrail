/**
 * Tempo adapter: the only file in the project that imports viem.
 *
 * Verified first-hand on 2026-10-01 against https://rpc.moderato.tempo.xyz:
 * the deployed `authorizeKey` is the 5-parameter form, which viem's own ABI
 * confirms. Moderato does NOT implement the per-token period window that
 * viem's `limits[].period` type accepts - see SPIKE.md and `probe:period`.
 */

import { createPublicClient, createWalletClient, http, type Address as ViemAddress } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { Account, tempoActions } from 'viem/tempo'
import { tempoModerato } from 'viem/tempo/chains'

import type {
  AuthorizeKeyInput,
  AuthorizedKey,
  ChainPort,
  OnChainKey,
  SetAllowedCallsInput,
  TransferInput,
} from '../../ports/index.js'
import type { Address } from '../../domain/types.js'
import { ACCOUNT_PRECOMPILE, PATH_USD, TEMPO_EXPLORER, TEMPO_RPC } from './config.js'

/** Minimal TIP-20 surface. Only what the spike needs. */
const TIP20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'transferWithMemo',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'memo', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

/** Account precompile read surface, matching the selectors verified in config.ts. */
const PRECOMPILE_ABI = [
  {
    type: 'function',
    name: 'getKey',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'keyId', type: 'address' },
    ],
    outputs: [{ type: 'tuple', components: [] }],
  },
  {
    type: 'function',
    name: 'revokeKey',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'keyId', type: 'address' }],
    outputs: [],
  },
] as const

export type TempoChain = ChainPort & {
  /** Root account, so app code can mint access keys against it. */
  readonly root: Address
}

export function createTempoChain(privateKey: `0x${string}`): TempoChain {
  const rootAccount = privateKeyToAccount(privateKey)
  const root = rootAccount.address as Address

  const transport = http(TEMPO_RPC)
  const publicClient = createPublicClient({ chain: tempoModerato, transport })
  const walletClient = createWalletClient({
    account: rootAccount,
    chain: tempoModerato,
    transport,
  }).extend(tempoActions())

  return {
    chainId: tempoModerato.id,
    root,

    async blockNumber() {
      return publicClient.getBlockNumber()
    },

    async fundAddress(address: Address) {
      // Moderato faucet. Not part of viem's typed surface, so it goes over raw RPC.
      const res = await fetch(TEMPO_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tempo_fundAddress',
          params: [address],
        }),
      })
      const body = (await res.json()) as { result?: unknown; error?: { message: string } }
      if (body.error) throw new Error(`faucet refused: ${body.error.message}`)
      return typeof body.result === 'string' ? body.result : JSON.stringify(body.result)
    },

    async balanceOf(address: Address, token: Address) {
      return publicClient.readContract({
        address: token as ViemAddress,
        abi: TIP20_ABI,
        functionName: 'balanceOf',
        args: [address as ViemAddress],
      })
    },

    async authorizeKey(input: AuthorizeKeyInput): Promise<AuthorizedKey> {
      // A fresh secp256k1 access key, bound to the root account. The caller must
      // learn the id, or the fleet cannot be addressed. Never pass admin: true.
      // The private key is returned only so the spike can sign a probe spend.
      // It is written to gitignored .data/, never to a committed file.
      const accessPrivateKey = generatePrivateKey()
      const accessKey = Account.fromSecp256k1(accessPrivateKey, { access: rootAccount })
      const keyId = accessKey.accessKeyAddress as Address

      const limits = input.limits.map(([token, limit, period]) => ({
        token: token as ViemAddress,
        limit,
        ...(period ? { period } : {}),
      }))

      const hash = await walletClient.accessKey.authorize({
        accessKey,
        account: rootAccount,
        expiry: input.expiry,
        limits,
        ...(input.scopes ? { scopes: [...input.scopes] } : {}),
        ...(input.witness ? { witness: input.witness } : {}),
      })
      return { txHash: hash as `0x${string}`, keyId, privateKey: accessPrivateKey }
    },

    async readKey(_keyId: Address, account: Address) {
      // Deliberately untyped: the 160-byte KeyInfo layout is not published for
      // Moderato. We return the raw words and let the probe decode them rather
      // than assert a struct shape we have not confirmed.
      const data = await publicClient.call({
        to: ACCOUNT_PRECOMPILE,
        data: ('0xbc298553' +
          pad(account) +
          pad(_keyId)) as `0x${string}`,
      })
      const raw = (data.data ?? '0x') as `0x${string}`
      if (raw === '0x') return null
      return { keyId: _keyId, exists: raw.length > 66, raw } as OnChainKey & { raw: string }
    },

    async setAllowedCalls(input: SetAllowedCallsInput) {
      const { encodeFunctionData, getAddress } = await import('viem')
      const hash = await walletClient.sendTransaction({
        to: getAddress(ACCOUNT_PRECOMPILE),
        data: encodeFunctionData({
          abi: [
            {
              type: 'function',
              name: 'setAllowedCalls',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'keyId', type: 'address' },
                {
                  name: 'scopes',
                  type: 'tuple[]',
                  components: [
                    { name: 'address', type: 'address' },
                    {
                      name: 'rules',
                      type: 'tuple[]',
                      components: [
                        { name: 'selector', type: 'bytes4' },
                        { name: 'recipients', type: 'address[]' },
                      ],
                    },
                  ],
                },
              ],
              outputs: [],
            },
          ],
          functionName: 'setAllowedCalls',
          args: [
            input.keyId as ViemAddress,
            input.scopes.map((s) => ({
              address: s.address as ViemAddress,
              rules: [{ selector: s.selector ?? '0x00000000', recipients: [...(s.recipients ?? [])] as ViemAddress[] }],
            })),
          ],
        }),
      })
      return hash
    },

    async revokeKey(account: Address, keyId: Address) {
      void account
      return (await walletClient.writeContract({
        address: ACCOUNT_PRECOMPILE as ViemAddress,
        abi: PRECOMPILE_ABI,
        functionName: 'revokeKey',
        args: [keyId as ViemAddress],
      })) as `0x${string}`
    },

    async transferWithMemo(input: TransferInput) {
      return (await walletClient.writeContract({
        address: input.token as ViemAddress,
        abi: TIP20_ABI,
        functionName: 'transferWithMemo',
        args: [input.to as ViemAddress, input.amount, input.memo],
      })) as `0x${string}`
    },

    async batchTransferWithMemo(inputs) {
      // Tempo batches calls atomically. The SDK owns the envelope shape, so we
      // defer to it rather than hand-rolling the transaction type.
      const sent = await walletClient.sendCalls({
        calls: inputs.map((i) => ({
          to: i.token as ViemAddress,
          data: encodeTransferWithMemo(i.to, i.amount, i.memo),
        })),
      })
      return sent.id as `0x${string}`
    },

    explorerTx(hash) {
      return `${TEMPO_EXPLORER}/tx/${hash}`
    },

    async rawCall(to, data) {
      const result = await publicClient.call({ to, data })
      return (result.data ?? '0x') as `0x${string}`
    },
  }
}

function pad(address: Address): string {
  return address.toLowerCase().replace('0x', '').padStart(64, '0')
}

function encodeTransferWithMemo(to: Address, amount: bigint, memo: `0x${string}`): `0x${string}` {
  return ('0x95777d59' + pad(to) + amount.toString(16).padStart(64, '0') + memo.slice(2)) as `0x${string}`
}

export { PATH_USD }
