/**
 * Thin CLI over the spike. Argument parsing and printing only.
 * Key material stays in .data/, which is gitignored.
 */

import { createWalletClient, http } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { Account, tempoActions } from 'viem/tempo'
import { tempoModerato } from 'viem/tempo/chains'

import { createTempoChain } from '../adapters/tempo/chain.js'
import { ACCOUNT_PRECOMPILE, PATH_USD, TEMPO_SELECTORS } from '../adapters/tempo/config.js'
import { agentExists, readAgent, writeAgent } from '../adapters/local/store.js'
import { fmt } from '../domain/policy.js'
import type { Address } from '../domain/types.js'

const command = process.argv[2]

async function main(): Promise<void> {
  switch (command) {
    case 'agent:new':
      return agentNew()
    case 'faucet':
      return faucet()
    case 'probe:chain':
      return probeChain()
    case 'probe:key':
      return probeKey()
    case 'probe:spend':
      return probeSpend()
    default:
      console.error('usage: agent:new | faucet | probe:chain | probe:key | probe:spend')
      process.exitCode = 1
  }
}

async function agentNew(): Promise<void> {
  if (await agentExists()) {
    const existing = await readAgent()
    console.log(`agent already exists: ${existing.address}`)
    console.log('refusing to overwrite. delete spike/.data/agent.json to rotate.')
    return
  }
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  await writeAgent({
    address: account.address,
    privateKey,
    createdAt: Math.floor(Date.now() / 1000),
    note: 'throwaway Moderato root. not the product key. never commit.',
  })
  console.log(`agent created: ${account.address}`)
}

async function loadChain() {
  const agent = await readAgent()
  return {
    agent,
    chain: createTempoChain(agent.privateKey as `0x${string}`),
  }
}

async function faucet(): Promise<void> {
  const { agent, chain } = await loadChain()
  const result = await chain.fundAddress(agent.address as Address)
  console.log(`funded ${agent.address}`)
  console.log(result)
}

async function probeChain(): Promise<void> {
  const { agent, chain } = await loadChain()
  const [id, head, balance] = await Promise.all([
    Promise.resolve(chain.chainId),
    chain.blockNumber(),
    chain.balanceOf(agent.address as Address, PATH_USD),
  ])
  console.log(`chainId ${id}`)
  console.log(`head ${head}`)
  console.log(`pathUSD ${fmt(balance)} (${balance})`)
  if (id !== 42431) {
    console.error('expected Moderato chain id 42431')
    process.exitCode = 1
  }
}

async function probeSpend(): Promise<void> {
  const { agent, chain } = await loadChain()
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60
  const authorized = await chain.authorizeKey({
    account: agent.address as Address,
    chainId: chain.chainId,
    expiry,
    limits: [[PATH_USD, 1_000_000n]],
  })
  console.log(`keyId ${authorized.keyId}`)
  console.log(`authTx ${authorized.txHash}`)

  const root = privateKeyToAccount(agent.privateKey as `0x${string}`)
  const spender = Account.fromSecp256k1(authorized.privateKey, { access: root })
  const sink = privateKeyToAccount(generatePrivateKey()).address
  const client = createWalletClient({
    account: spender,
    chain: tempoModerato,
    transport: http('https://rpc.moderato.tempo.xyz'),
  }).extend(tempoActions())

  try {
    const hash = await client.writeContract({
      address: PATH_USD,
      abi: [
        {
          type: 'function',
          name: 'transfer',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ type: 'bool' }],
        },
      ] as const,
      functionName: 'transfer',
      args: [sink, 1n],
    })
    console.log(`spend SUCCEEDED ${hash}`)
    console.log('fresh key is unrestricted before setAllowedCalls')
  } catch (err) {
    const message = err instanceof Error ? err.message.split('\n')[0] : String(err)
    console.log(`spend REJECTED ${message}`)
  }
}

function pad(address: string): string {
  return address.toLowerCase().replace('0x', '').padStart(64, '0')
}

async function probeKey(): Promise<void> {
  const { agent, chain } = await loadChain()
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60
  const authorized = await chain.authorizeKey({
    account: agent.address as Address,
    chainId: chain.chainId,
    expiry,
    limits: [[PATH_USD, 1_000_000n]],
  })
  console.log(`authorized keyId ${authorized.keyId}`)
  console.log(`tx ${authorized.txHash}`)

  const key = await chain.readKey(authorized.keyId, agent.address as Address)
  console.log(`getKey ${JSON.stringify(key)}`)

  const calls = await chain.rawCall(
    ACCOUNT_PRECOMPILE,
    (TEMPO_SELECTORS.getAllowedCalls + pad(agent.address) + pad(authorized.keyId)) as `0x${string}`,
  )
  console.log(`getAllowedCalls ${calls}`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
})
