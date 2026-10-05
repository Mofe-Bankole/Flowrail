/**
 * Regenerate `web/src/lib/demo-run.json` from the real policy engine.
 *
 * The landing page renders this file. It is produced by `classifyRun`, not
 * written by hand, so no number shown to a visitor can drift from what the
 * engine actually decides. If the policy changes, this output changes with it.
 *
 * The payload is validated against `domain/artefact.ts` before it is written,
 * so a shape change breaks here instead of in the browser.
 *
 *   npm run demo:export
 */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { classifyRun } from '../app/engine.js'
import { artefactSchema, describeArtefactFailure } from '../domain/artefact.js'
import { fmt } from '../domain/policy.js'
import { POLICY } from '../domain/types.js'
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
  // Shipped so the web app renders the thresholds this run was decided against
  // instead of hardcoding them. If POLICY moves, this moves with it.
  policy: {
    addressStabilityDays: POLICY.addressStabilityDays,
    autoCap: POLICY.autoCap.toString(),
    dualCap: POLICY.dualCap.toString(),
    standingKeyTtlSeconds: POLICY.standingKeyTtlSeconds,
    oneTimeKeyTtlSeconds: POLICY.oneTimeKeyTtlSeconds,
  },
  counts: run.counts,
  unresolved: run.unresolved.map((line) => ({
    payeeId: line.payeeId,
    amount: line.amount,
  })),
  totalPathUsd: run.legs.reduce((sum, leg) => sum + leg.payout.amount, 0n).toString(),
  legs: run.legs.map((leg) => {
    const payee = byId.get(leg.payout.payeeId)
    return {
      legId: leg.legId,
      payeeId: leg.payout.payeeId,
      name: payee?.name ?? leg.payout.payeeId,
      role: roleById[leg.payout.payeeId] ?? 'Payee',
      address: leg.payout.to,
      stableForDays: payee?.addressStableForDays ?? 0,
      amount: fmt(leg.payout.amount),
      tier: leg.tier,
      approved: leg.approved,
      findings: leg.findings,
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

// Leg ids are what a human approves, so they have to be unique. Asserted here
// because a duplicate would make `approve()` ambiguous - and the failure would
// be a signature landing on the wrong invoice line, which is the exact bug the
// per-leg id exists to prevent.
const legIds = new Set(run.legs.map((leg) => leg.legId))
if (legIds.size !== run.legs.length) {
  throw new Error('demo roster drifted: two legs share a legId')
}

// An escalated leg must say why in machine-readable form. Before findings existed
// this was only visible in the prose, so a reworded message could change the
// recorded escalation without anything failing.
for (const leg of run.legs) {
  const escalated = leg.tier !== 'auto'
  if (escalated && leg.findings.length === 0) {
    throw new Error(`leg ${leg.legId} is ${leg.tier} but records no finding code`)
  }
  if (!escalated && leg.findings.length > 0) {
    throw new Error(`leg ${leg.legId} is auto but records findings ${leg.findings.join(',')}`)
  }
}

// Parse before writing, and write the parsed value rather than `payload`. The
// file on disk is then exactly what the schema describes, not what the
// exporter hoped it wrote.
const parsed = artefactSchema.safeParse(payload)
if (!parsed.success) {
  throw new Error(
    `artefact does not match its own schema, refusing to write ${OUT}:\n${describeArtefactFailure(parsed.error)}`,
  )
}

await writeFile(OUT, `${JSON.stringify(parsed.data, null, 2)}\n`, 'utf8')
console.log(
  `wrote ${OUT}\n  ${run.legs.length} legs · ${auto} auto · ${finance} finance · ${dual} dual · ${run.unresolved.length} unresolved`,
)