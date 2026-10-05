/**
 * Typed access to the engine-generated demo run.
 *
 * `demo-run.json` is written by `npm --prefix ../spike run demo:export`, which
 * calls the real `classifyRun`. Nothing here is hand-authored, so the counts the
 * landing page renders are the counts the policy engine produces.
 *
 * It is parsed, not cast. A cast would assert a shape the file might not have,
 * and the failure would surface as `undefined` deep inside a component — a
 * headline reading "NaN payees" rather than an error at the boundary. This is
 * the reader half of the schema the exporter writes with; if the two drift, this
 * file refuses to load instead of rendering something untrue.
 */

import { z } from "zod";

import raw from "./demo-run.json";

export type Tier = "auto" | "finance" | "dual";

/** Mirrors `FindingCode` in `spike/src/domain/types.ts`. */
export const findingCodes = [
  "unstable_address",
  "amount_over_auto_cap",
  "amount_over_dual_cap",
] as const;
export type FindingCode = (typeof findingCodes)[number];

const baseUnits = z.string().regex(/^\d+$/, "base-unit amounts are unsigned decimal strings");

export const demoRunSchema = z.object({
  id: z.string().min(1),
  generatedAt: z.iso.datetime(),

  /** The thresholds this run was decided against. Rendered, never re-guessed. */
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

  unresolved: z.array(z.object({ payeeId: z.string().min(1), amount: z.string().min(1) })),
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
        amount: z.string().regex(/^\d+(\.\d{1,6})?$/),
        tier: z.enum(["auto", "finance", "dual"]),
        approved: z.boolean(),
        findings: z.array(z.enum(findingCodes)),
        reason: z.string(),
      }),
    )
    .min(1),
});

export type DemoLeg = z.infer<typeof demoRunSchema>["legs"][number];
export type DemoRun = z.infer<typeof demoRunSchema>;

const parsed = demoRunSchema.safeParse(raw);
if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `demo-run.json does not match the schema this app reads against. Regenerate it:\n` +
      `  npm --prefix ../spike run demo:export\n${detail}`,
  );
}
export const run: DemoRun = parsed.data;

export const autoLegs = run.legs.filter((leg) => leg.tier === "auto");
export const financeLegs = run.legs.filter((leg) => leg.tier === "finance");
export const exceptionLeg = financeLegs[0];
export const roles = run.legs.reduce<Record<string, number>>((acc, leg) => {
  acc[leg.role] = (acc[leg.role] ?? 0) + 1;
  return acc;
}, {});

/** pathUSD base units -> grouped dollars, for the auto-approved total. */
export function sumAmount(legs: DemoLeg[]): number {
  return legs.reduce((total, leg) => total + Number(leg.amount), 0);
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Base units -> dollars. Same 1e6 scale the engine parses with. */
export function baseUnitsToUsd(base: string): number {
  return Number(base) / 1e6;
}

export const autoTotal = formatUsd(sumAmount(autoLegs));
export const exceptionTotal = exceptionLeg ? formatUsd(Number(exceptionLeg.amount)) : "0.00";
export const runTotal = formatUsd(sumAmount(run.legs));

/**
 * Everything the page asserts about the run's size is derived here, never
 * written as a literal. The demo ships 40 payees and one escalation, but a
 * visitor with 20 payees — or 3 — must get a headline and figures that are
 * true for *their* run, not ours.
 */
export const legCount = run.legs.length;
export const financeCount = run.counts.finance;
export const autoCount = run.counts.auto;
export const dualCount = run.counts.dual;

/** The auto cap as dollars, straight from the run that used it. */
export const autoCapUsd = baseUnitsToUsd(run.policy.autoCap);
export const dualCapUsd = baseUnitsToUsd(run.policy.dualCap);
export const addressStabilityDays = run.policy.addressStabilityDays;

export function heldTotal(): number {
  return exceptionLeg ? Number(exceptionLeg.amount) : 0;
}

/** Guards the divide in per-line averages when a run has no automatic legs. */
export function averageAuto(): string {
  return autoCount > 0 ? formatUsd(sumAmount(autoLegs) / autoCount) : "—";
}

export function headline(): { legs: string; decision: string } {
  return {
    legs: `${legCount} payee${legCount === 1 ? "" : "s"}.`,
    decision:
      financeCount === 0
        ? "No signature."
        : financeCount === 1
          ? "One signature."
          : `${financeCount} signatures.`,
  };
}

export function standfirst(): string {
  const opening = "A month of agency payouts, split by one rule.";
  if (financeCount === 0) return `${opening} Every line clears itself.`;
  if (autoCount === 0) {
    return `${opening} None clear themselves — ${financeCount === 1 ? "one waits" : `${financeCount} wait`} for a person.`;
  }
  if (financeCount === 1) return `${opening} All but one clear themselves.`;
  return `${opening} ${autoCount} clear themselves; ${financeCount} wait for a person.`;
}
