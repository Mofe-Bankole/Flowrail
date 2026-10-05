/**
 * The artefact is the only thing crossing from the engine into the web app, so
 * the schema is the only thing standing between a bad export and a render that
 * lies. These tests pin the rejections that matter: the failure modes that
 * produced a plausible-looking screen rather than an error.
 */

import { describe, expect, it } from 'vitest'

import { artefactSchema, describeArtefactFailure } from '../src/domain/artefact.js'

/** The smallest thing that satisfies the schema. */
function valid() {
  return {
    id: 'INV-1',
    generatedAt: '2026-01-01T00:00:00.000Z',
    policy: {
      addressStabilityDays: 7,
      autoCap: '500000000',
      dualCap: '2000000000',
      standingKeyTtlSeconds: 604800,
      oneTimeKeyTtlSeconds: 43200,
    },
    counts: { auto: 1, finance: 0, dual: 0 },
    unresolved: [],
    totalPathUsd: '65000000',
    legs: [
      {
        legId: 'ada',
        payeeId: 'ada',
        name: 'Ada Okonkwo',
        role: 'Creator',
        address: '0x2222222222222222222222222222222222222222',
        stableForDays: 21,
        amount: '65',
        tier: 'auto',
        approved: true,
        findings: [],
        reason: 'standing payee, within auto cap',
      },
    ],
  }
}

describe('artefactSchema', () => {
  it('accepts a well-formed artefact', () => {
    expect(artefactSchema.safeParse(valid()).success).toBe(true)
  })

  it('accepts the real demo artefact, generated and parsed back', async () => {
    const { readFile } = await import('node:fs/promises')
    const path = new URL('../../web/src/lib/demo-run.json', import.meta.url)
    const parsed = artefactSchema.safeParse(JSON.parse(await readFile(path, 'utf8')))
    // The committed artefact and the schema must agree, or the landing page is
    // rendering a shape the engine no longer claims to produce.
    expect(parsed.success).toBe(true)
  })

  it('rejects a finding code it does not know, rather than dropping it', () => {
    const bad = valid()
    ;(bad.legs[0] as { findings: string[] }).findings = ['totally_made_up']
    const result = artefactSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('rejects a malformed address', () => {
    const bad = valid()
    ;(bad.legs[0] as { address: string }).address = '0xnope'
    expect(artefactSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a bigint smuggled in as a number', () => {
    // JSON has no bigint. An amount arriving as 65000000 is a number that
    // already lost precision somewhere, so refuse rather than silently use it.
    const bad = valid()
    ;(bad.legs[0] as { amount: unknown }).amount = 65
    expect(artefactSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a negative amount', () => {
    const bad = valid()
    ;(bad.legs[0] as { amount: string }).amount = '-65'
    expect(artefactSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects an unknown tier', () => {
    const bad = valid()
    ;(bad.legs[0] as { tier: string }).tier = 'probably_fine'
    expect(artefactSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a run with no legs', () => {
    const bad = valid()
    bad.legs = []
    expect(artefactSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a generatedAt that is not a timestamp', () => {
    const bad = valid()
    bad.generatedAt = 'last tuesday'
    expect(artefactSchema.safeParse(bad).success).toBe(false)
  })

  it('strips fields the schema does not declare instead of failing', () => {
    // zod objects are non-strict by default: an unexpected key is dropped, not
    // rejected. Worth pinning, because it is the reason a renamed field can
    // vanish here and resurface as `undefined` in the app.
    const extra = { ...valid(), somethingNew: 1 }
    const parsed = artefactSchema.parse(extra)
    expect('somethingNew' in parsed).toBe(false)
  })

  it('reports which field failed, so a bad export is actionable', () => {
    const bad = valid()
    ;(bad.legs[0] as { address: string }).address = '0xnope'
    const result = artefactSchema.safeParse(bad)
    expect(result.success).toBe(false)
    if (!result.success) {
      const report = describeArtefactFailure(result.error)
      expect(report).toContain('legs.0.address')
    }
  })
})
