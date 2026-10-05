/**
 * The shape of the artefact `cli/export.ts` writes for the web app.
 *
 * Lives in its own module rather than in the exporter because the exporter runs
 * at import time - a test cannot import it without also rewriting the file.
 *
 * The web app validates the same file against its own copy of this shape at its
 * own boundary. Two schemas, one at each end, on purpose: the writer must never
 * emit something the reader cannot parse, and the reader must never trust a file
 * it did not check. If the two ever drift, the exporter refuses to write and the
 * app refuses to render. Neither degrades quietly.
 *
 * This lives in `domain/` because it is a value shape and asks nothing of the
 * chain. zod is a validator, not a client.
 */

import { z } from 'zod'

/** Base units as a decimal string. bigint does not survive JSON, by design. */
const baseUnits = z.string().regex(/^\d+$/, 'base-unit amounts are unsigned decimal strings')

/** Six decimals, trailing zeros stripped - exactly what `fmt` produces. */
const humanAmount = z.string().regex(/^\d+(\.\d{1,6})?$/)

const finding = z.enum([
  'unstable_address',
  'amount_over_auto_cap',
  'amount_over_dual_cap',
])

export const artefactSchema = z.object({
  id: z.string().min(1),
  /** ISO 8601. Fixed by the demo clock, so it is a constant, not a run time. */
  generatedAt: z.string().datetime(),

  /**
   * The thresholds the engine actually applied. The web app reads these instead
   * of hardcoding the cap, so the desk cannot draw a threshold the policy no
   * longer uses.
   */
  policy: z.object({
    addressStabilityDays: z.number().int().positive(),
    autoCap: baseUnits,
    dualCap: baseUnits,
    standingKeyTtlSeconds: z.number().int().positive(),
    oneTimeKeyTtlSeconds: z.number().int().positive(),
  }),

  counts: z.object({
    auto: z.number().int().nonnegative(),
    finance: z.number().int().nonnegative(),
    dual: z.number().int().nonnegative(),
  }),

  /** Lines that matched no payee. Present in the artefact so the UI can name them. */
  unresolved: z.array(
    z.object({ payeeId: z.string().min(1), amount: z.string().min(1) }),
  ),

  totalPathUsd: baseUnits,

  legs: z
    .array(
      z.object({
        legId: z.string().min(1),
        payeeId: z.string().min(1),
        name: z.string().min(1),
        role: z.string().min(1),
        address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
        stableForDays: z.number().int().nonnegative(),
        amount: humanAmount,
        tier: z.enum(['auto', 'finance', 'dual']),
        approved: z.boolean(),
        /** Codes first. `reason` is prose for humans and is not an interface. */
        findings: z.array(finding),
        reason: z.string(),
      }),
    )
    .min(1),
})

export type Artefact = z.infer<typeof artefactSchema>

/** Format zod issues as something a human can act on before writing a file. */
export function describeArtefactFailure(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  ${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('\n')
}
