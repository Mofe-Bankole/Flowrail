/**
 * Regenerate `web/src/lib/demo-run.json` from the real policy engine.
 *
 * The landing page renders this file. It is produced by `classifyRun`, not
 * written by hand, so no number shown to a visitor can drift from what the
 * engine actually decides. If the policy changes, this output changes with it.
 *
 *   npm run demo:export
 */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { classifyRun } from '../app/engine.js'
import { fmt } from '../domain/policy.js'
import type { LedgerPort, RosterPort } from '../ports/index.js'
import { DEMO_NOW, DEMO_RUN_ID, UNRESOLVED_LINE, demoLines, demoRoster, roleById } from '../demo/roster.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../../web/src/lib/demo-run.json')

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

const run = await classifyRun(DEMO_RUN_ID, demoLines, roster, ledger, DEMO_NOW)
const byId = new Map(demoRoster.map((payee) => [payee.id, payee]))

const payload = {
  id: run.id,
  generatedAt: new Date(DEMO_NOW * 1000).toISOString(),
  counts: run.counts,
  unresolved: run.unresolved.map((line) => ({
    payeeId: line.payeeId,
    amount: line.amount,
  })),
  totalPathUsd: run.legs.reduce((sum, leg) => sum + leg.payout.amount, 0n).toString(),
  legs: run.legs.map((leg) => {
    const payee = byId.get(leg.payout.payeeId)
    return {
      payeeId: leg.payout.payeeId,
      name: payee?.name ?? leg.payout.payeeId,
      role: roleById[leg.payout.payeeId] ?? 'Payee',
      address: leg.payout.to,
      stableForDays: payee?.addressStableForDays ?? 0,
      amount: fmt(leg.payout.amount),
      tier: leg.tier,
      approved: leg.approved,
      reason: leg.reasons[0] ?? '',
    }
  }),
}

const auto = run.counts.auto
const finance = run.counts.finance
const dual = run.counts.dual

if (auto !== 39 || finance !== 1 || dual !== 0) {
  throw new Error(
    `demo roster drifted: expected 39 auto / 1 finance / 0 dual, got ${auto} / ${finance} / ${dual}`,
  )
}
if (run.unresolved.length !== 1 || run.unresolved[0]?.payeeId !== UNRESOLVED_LINE.payeeId) {
  throw new Error('demo roster drifted: the unresolved line must survive reconciliation')
}

await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(
  `wrote ${OUT}\n  ${run.legs.length} legs · ${auto} auto · ${finance} finance · ${dual} dual · ${run.unresolved.length} unresolved`,
)