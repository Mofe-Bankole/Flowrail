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
import { authorizeFleet, classifyRun, executeBatch } from '../app/engine.js'
import { fmt } from '../domain/policy.js'
import type { Address, InvoiceLine, Payee } from '../domain/types.js'
import type { LedgerPort, RosterPort } from '../ports/index.js'

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
    case 'classify':
      return classify()
    case 'probe:lock':
      return probeLock()
    case 'probe:cap':
      return probeCap()
    case 'probe:expiry':
      return probeExpiry()
    case 'probe:batch':
      return probeBatch()
    default:
      console.error('usage: agent:new | faucet | probe:chain | probe:key | probe:spend | classify')
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

async function probeLock(): Promise<void> {
  const { agent, chain } = await loadChain()
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60
  const allowed = privateKeyToAccount(generatePrivateKey()).address
  const denied = privateKeyToAccount(generatePrivateKey()).address
  const authorized = await chain.authorizeKey({
    account: agent.address as Address,
    chainId: chain.chainId,
    expiry,
    limits: [[PATH_USD, 1_000_000n]],
  })
  const { createPublicClient } = await import('viem')
  const reader = createPublicClient({ chain: tempoModerato, transport: http('https://rpc.moderato.tempo.xyz') })
  await reader.waitForTransactionReceipt({ hash: authorized.txHash })
  const scopeTx = await chain.setAllowedCalls({
    account: agent.address as Address,
    keyId: authorized.keyId,
    scopes: [{ address: PATH_USD, selector: '0xa9059cbb', recipients: [allowed] }],
  })
  console.log(`keyId ${authorized.keyId}`)
  console.log(`authTx ${authorized.txHash}`)
  console.log(`scopeTx ${scopeTx}`)
  console.log(`allowed ${allowed}`)
  console.log(`denied ${denied}`)

  const root = privateKeyToAccount(agent.privateKey as `0x${string}`)
  const spender = Account.fromSecp256k1(authorized.privateKey, { access: root })
  const client = createWalletClient({
    account: spender,
    chain: tempoModerato,
    transport: http('https://rpc.moderato.tempo.xyz'),
  }).extend(tempoActions())
  const abi = [{
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  }] as const

  for (const [label, to] of [['allowed', allowed], ['denied', denied]] as const) {
    try {
      const hash = await client.writeContract({
        address: PATH_USD,
        abi,
        functionName: 'transfer',
        args: [to, 1n],
      })
      console.log(`${label} SUCCEEDED ${hash}`)
    } catch (err) {
      const message = err instanceof Error ? err.message.split('\n')[0] : String(err)
      console.log(`${label} REJECTED ${message}`)
    }
  }
}

async function spendAs(privateKey: `0x${string}`, rootKey: `0x${string}`, amount: bigint) {
  const root = privateKeyToAccount(rootKey)
  const spender = Account.fromSecp256k1(privateKey, { access: root })
  const sink = privateKeyToAccount(generatePrivateKey()).address
  const client = createWalletClient({
    account: spender,
    chain: tempoModerato,
    transport: http('https://rpc.moderato.tempo.xyz'),
  }).extend(tempoActions())
  return client.writeContract({
    address: PATH_USD,
    abi: [{
      type: 'function',
      name: 'transfer',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ type: 'bool' }],
    }] as const,
    functionName: 'transfer',
    args: [sink, amount],
  })
}

async function probeCap(): Promise<void> {
  const { agent, chain } = await loadChain()
  const authorized = await chain.authorizeKey({
    account: agent.address as Address,
    chainId: chain.chainId,
    expiry: Math.floor(Date.now() / 1000) + 3600,
    limits: [[PATH_USD, 1_000_000n]],
  })
  console.log(`keyId ${authorized.keyId}`)
  console.log(`authTx ${authorized.txHash}`)
  try {
    const hash = await spendAs(authorized.privateKey, agent.privateKey as `0x${string}`, 1_000_001n)
    console.log(`over-cap SUCCEEDED ${hash}`)
  } catch (err) {
    console.log(`over-cap REJECTED ${err instanceof Error ? err.message.split('\n')[0] : err}`)
  }
}

async function probeExpiry(): Promise<void> {
  const { agent, chain } = await loadChain()
  const expiry = Math.floor(Date.now() / 1000) + 70
  const authorized = await chain.authorizeKey({
    account: agent.address as Address,
    chainId: chain.chainId,
    expiry,
    limits: [[PATH_USD, 1_000_000n]],
  })
  console.log(`keyId ${authorized.keyId}`)
  console.log(`authTx ${authorized.txHash}`)
  console.log(`expires ${expiry}`)
  const waitMs = expiry * 1000 - Date.now() + 5_000
  await new Promise((resolve) => setTimeout(resolve, waitMs))
  try {
    const hash = await spendAs(authorized.privateKey, agent.privateKey as `0x${string}`, 1n)
    console.log(`expired SUCCEEDED ${hash}`)
  } catch (err) {
    console.log(`expired REJECTED ${err instanceof Error ? err.message.split('\n')[0] : err}`)
  }
}

async function probeBatch(): Promise<void> {
  const { agent, chain } = await loadChain()
  const ada = privateKeyToAccount(generatePrivateKey())
  const jane = privateKeyToAccount(generatePrivateKey())
  const payees: Payee[] = [
    { id: 'ada', name: 'Ada', address: ada.address, addressStableForDays: 21 },
    { id: 'jane', name: 'Jane', address: jane.address, addressStableForDays: 40 },
  ]
  const lines: InvoiceLine[] = [
    { payeeId: 'ada', amount: '0.01' },
    { payeeId: 'jane', amount: '0.02' },
  ]
  const roster: RosterPort = { all: async () => payees, put: async () => undefined }
  const entries: unknown[] = []
  const ledger: LedgerPort = {
    append: async (entry) => { entries.push(entry) },
    all: async () => entries as never,
    toJsonl: () => '',
  }
  const { createPublicClient } = await import('viem')
  const reader = createPublicClient({ chain: tempoModerato, transport: http('https://rpc.moderato.tempo.xyz') })
  const now = Math.floor(Date.now() / 1000)
  const classified = await classifyRun('INV-2', lines, roster, ledger, now)
  const approved = { ...classified, legs: classified.legs.map((leg) => ({ ...leg, approved: true })) }
  for (const signer of [ada, jane]) {
    const opted = await createWalletClient({
      account: signer,
      chain: tempoModerato,
      transport: http('https://rpc.moderato.tempo.xyz'),
    }).writeContract({
      address: PATH_USD,
      abi: [{
        type: 'function',
        name: 'optInToPolicy',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'policyId', type: 'uint64' }],
        outputs: [],
      }] as const,
      functionName: 'optInToPolicy',
      args: [1n],
    })
    await reader.waitForTransactionReceipt({ hash: opted })
    console.log(`opted ${signer.address} ${opted}`)
  }
  const before = await Promise.all(payees.map((payee) => chain.balanceOf(payee.address, PATH_USD)))
  const original = chain.authorizeKey.bind(chain)
  chain.authorizeKey = async (input) => {
    const authorized = await original(input)
    await reader.waitForTransactionReceipt({ hash: authorized.txHash })
    return authorized
  }
  const keys = await authorizeFleet(approved, chain, ledger, agent.address as Address)
  for (const key of keys) await reader.waitForTransactionReceipt({ hash: key.scopeTx })
  const root = privateKeyToAccount(agent.privateKey as `0x${string}`)
  const hashes: `0x${string}`[] = []
  for (const leg of approved.legs) {
    const key = keys.find((item) => item.payeeId === leg.payout.payeeId)
    if (!key) throw new Error(`missing key for ${leg.payout.payeeId}`)
    const spender = Account.fromSecp256k1(key.privateKey, { access: root })
    const client = createWalletClient({
      account: spender,
      chain: tempoModerato,
      transport: http('https://rpc.moderato.tempo.xyz'),
    }).extend(tempoActions())
    const hash = await client.writeContract({
      address: PATH_USD,
      abi: [{
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ type: 'bool' }],
      }] as const,
      functionName: 'transfer',
      args: [leg.payout.to, leg.payout.amount],
    })
    const receipt = await reader.waitForTransactionReceipt({ hash })
    hashes.push(hash)
    console.log(`${leg.payout.payeeId} ${hash} ${receipt.status}`)
  }
  const after = await Promise.all(payees.map((payee) => chain.balanceOf(payee.address, PATH_USD)))
  console.log(`legs ${hashes.length}`)
  payees.forEach((payee, index) => {
    console.log(`${payee.id} ${before[index]} -> ${after[index]}`)
  })
}

async function classify(): Promise<void> {
  const roster: RosterPort = {
    all: async () => demoRoster,
    put: async () => undefined,
  }
  const entries: unknown[] = []
  const ledger: LedgerPort = {
    append: async (entry) => { entries.push(entry) },
    all: async () => entries as never,
    toJsonl: () => '',
  }
  const run = await classifyRun('INV-2500', demoLines, roster, ledger, 1_700_000_000)
  console.log(JSON.stringify({
    id: run.id,
    counts: run.counts,
    unresolved: run.unresolved.length,
    legs: run.legs.map((leg) => ({
      name: demoRoster.find((payee) => payee.id === leg.payout.payeeId)?.name ?? leg.payout.payeeId,
      amount: fmt(leg.payout.amount),
      tier: leg.tier,
      approved: leg.approved,
      reason: leg.reasons[0] ?? '',
    })),
  }))
}

const demoRoster: Payee[] = [
  { id: 'ada', name: 'Ada Okonkwo', address: '0x2222222222222222222222222222222222222222', addressStableForDays: 21 },
  { id: 'jane', name: 'Jane Adeyemi', address: '0x1111111111111111111111111111111111111111', addressStableForDays: 40 },
  { id: 'neo', name: 'Neo Ade', address: '0x3333333333333333333333333333333333333333', addressStableForDays: 1 },
]

const demoLines: InvoiceLine[] = [
  { payeeId: 'ada', amount: '65.00' },
  { payeeId: 'jane', amount: '1850.00' },
  { payeeId: 'neo', amount: '40.00' },
  { payeeId: 'missing', amount: '10.00' },
]

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
})
