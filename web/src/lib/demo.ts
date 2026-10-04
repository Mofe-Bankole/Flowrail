/**
 * Typed access to the engine-generated demo run.
 *
 * `demo-run.json` is written by `npm --prefix ../spike run demo:export`, which
 * calls the real `classifyRun`. Nothing here is hand-authored, so the counts the
 * landing page renders are the counts the policy engine produces.
 */

import raw from "./demo-run.json";

export type Tier = "auto" | "finance" | "dual";

export type DemoLeg = {
  payeeId: string;
  name: string;
  role: string;
  address: string;
  stableForDays: number;
  amount: string;
  tier: Tier;
  approved: boolean;
  reason: string;
};

export type DemoRun = {
  id: string;
  generatedAt: string;
  counts: Record<Tier, number>;
  unresolved: { payeeId: string; amount: string }[];
  totalPathUsd: string;
  legs: DemoLeg[];
};

export const run = raw as DemoRun;

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