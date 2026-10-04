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