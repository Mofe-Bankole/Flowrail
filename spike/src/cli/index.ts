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
import { agentExists, readAgent, recordRetired, writeAgent } from '../adapters/local/store.js'
import { fmt, parseAmount } from '../domain/policy.js'
import { authorizeFleet, classifyRun, executeBatch } from '../app/engine.js'
import type { Address, InvoiceLine, Payee } from '../domain/types.js'
import type { LedgerPort, RosterPort } from '../ports/index.js'

const command = process.argv[2]

async function main(): Promise<void> {
  switch (command) {
    case 'agent:new':
      return agentNew()
    case 'agent:rotate':
      return agentRotate()
    case 'keys:rotate':
      return keysRotate()
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
      console.error(
        [
          'usage:',
          '  agent:new                     create the local root keystore',
          '  agent:rotate                  replace it, creating a NEW account (needs --yes)',
          '  keys:rotate <oldKeyId> <cap> [ttlHours]   replace a live access key',
          '  faucet | classify | probe:*',
        ].join('\n'),
      )
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

/**
 * Replace the root keystore.
 *
 * This is NOT a secret rotation in the usual sense, and the distinction matters
 * enough to require `--yes`. A Tempo account *is* its public key: generating a
 * new one does not move any funds, it produces a different account with a zero
 * balance. Anyone reaching for this command expecting "new secret, same
 * account" will get a stranded balance instead.
 *
 * The real work of changing the root is migrating funds and access keys across,
 * which is a deliberate sequence a human drives. What this does is make step one
 * safe and irreversible-by-accident: the old private key is never written
 * anywhere after this point, and the retired address is recorded so the old
 * account's on-chain access keys can still be found and revoked.
 */
async function agentRotate(): Promise<void> {
  if (!(await agentExists())) {
    console.error('no agent to rotate. run agent:new first.')
    process.exitCode = 1
    return
  }
  if (!process.argv.includes('--yes')) {
    const current = await readAgent()
    console.error(`about to replace the root for ${current.address}.`)
    console.error('')
    console.error('This creates a NEW account with a NEW address and a ZERO balance.')
    console.error('It does not move funds. Migrate to the new address before retiring')
    console.error('the old one, or the old balance is still there and the new one is empty.')
    console.error('')
    console.error('Re-run with --yes if that is what you want.')
    process.exitCode = 1
    return
  }

  const previous = await readAgent()
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  const now = Math.floor(Date.now() / 1000)

  await writeAgent({
    address: account.address,
    privateKey,
    createdAt: now,
    note: 'throwaway Moderato root. not the product key. never commit.',
  })
  // The old private key is deliberately not written here. It survives only in
  // the file we just overwrote - nowhere else - and this address is recorded so
  // its on-chain access keys remain reachable for revocation.
  await recordRetired({
    address: previous.address,
    createdAt: previous.createdAt,
    retiredAt: now,
    why: 'agent:rotate',
  })

  console.log(`retired ${previous.address}`)
  console.log(`new root ${account.address}`)
  console.log(`balance  ${fmt(await chainBalanceFor(privateKey))} pathUSD`)
  console.log('')
  console.log('The old private key is gone from this machine. To finish the migration:')
  console.log(`  1. fund ${account.address} (npm run faucet -- it uses the new root)`)
  console.log(`  2. revoke every access key still authorized on ${previous.address}`)
  console.log('  3. record where the new private key is actually kept')
}

async function chainBalanceFor(privateKey: `0x${string}`): Promise<bigint> {
  const chain = createTempoChain(privateKey)
  return chain.balanceOf(privateKeyToAccount(privateKey).address as Address, PATH_USD)
}

/**
 * Replace a live access key: mint a fresh one with the same shape, then revoke
 * the old one on-chain.
 *
 * This is the rotation that matters. The root key is the one secret that can move
 * the whole balance; access keys are the ones that get handed around, leak, and
 * end up on developer laptops. Revoking the old key only after the replacement is
 * confirmed is the whole point - the order is mint, verify, then revoke, so
 * there is no window where neither key works.
 */
async function keysRotate(): Promise<void> {
  const [, , , oldKeyId, capArg, ttlArg] = process.argv
  if (!oldKeyId || !capArg) {
    console.error('usage: keys:rotate <oldKeyId> <capPathUsd> [ttlHours]')
    process.exitCode = 1
    return
  }
  const cap = parseAmount(capArg)
  const ttlHours = ttlArg ? Number(ttlArg) : 24
  if (ttlHours <= 0) {
    console.error('ttlHours must be positive')
    process.exitCode = 1
    return
  }

  const { agent, chain } = await loadChain()
  const oldInfo = await chain.readKey(oldKeyId as Address, agent.address as Address)
  if (!oldInfo) {
    console.error(`no key ${oldKeyId} on ${agent.address}: nothing to rotate`)
    process.exitCode = 1
    return
  }

  console.log(`replacing ${oldKeyId}`)
  console.log(`  old: still authorized on ${agent.address}`)
  console.log(`  new: cap ${capArg} pathUSD, ttl ${ttlHours}h`)

  const replacement = await chain.authorizeKey({
    account: agent.address as Address,
    chainId: chain.chainId,
    expiry: Math.floor(Date.now() / 1000) + ttlHours * 3600,
    limits: [[PATH_USD, cap]],
  })
  console.log(`  minted ${replacement.keyId}`)
  console.log(`  authTx ${replacement.txHash}`)

  const confirmed = await chain.readKey(replacement.keyId as Address, agent.address as Address)
  if (!confirmed) {
    console.error('replacement not visible on-chain; NOT revoking the old key')
    process.exitCode = 1
    return
  }
  console.log('  replacement confirmed on-chain')

  await chain.revokeKey(agent.address as Address, oldKeyId as Address)
  console.log(`  revoked ${oldKeyId}`)
  console.log('')
  console.log(`new key ${replacement.keyId} is in the chain adapter return value only.`)
  console.log('Hand it to the fleet and persist the secret wherever the fleet is persisted.')
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
