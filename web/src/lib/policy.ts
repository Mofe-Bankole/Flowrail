/**
 * The tier rule, mirrored for the landing page's interactive rule.
 *
 * This is a read-only copy of `decideTier` in `spike/src/domain/policy.ts`, run
 * against the thresholds carried in the exported run (`run.policy`) — never
 * against literals typed here. If the engine's thresholds move, the artefact
 * moves, and so does every number this file produces.
 *
 * Precedence matches the engine exactly: an unvouched address is `dual`
 * whatever the amount; amount alone escalates to `finance`, never to `dual`.
 */

import { run, baseUnitsToUsd, type Tier } from "./demo";

export const policy = {
  stabilityDays: run.policy.addressStabilityDays,
  autoCap: baseUnitsToUsd(run.policy.autoCap),
  dualCap: baseUnitsToUsd(run.policy.dualCap),
  standingTtlHours: run.policy.standingKeyTtlSeconds / 3600,
  oneTimeTtlHours: run.policy.oneTimeKeyTtlSeconds / 3600,
};

export type Decision = {
  tier: Tier;
  /** Which line of the rule decided it: 0 = tenure, 1 = amount, 2 = otherwise. */
  line: 0 | 1 | 2;
  reasons: string[];
  keyLifetime: string;
  signature: string;
};

function usd(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function lifetime(hours: number): string {
  return hours >= 24 && hours % 24 === 0 ? `${hours / 24} days` : `${hours} hours`;
}

export function decide(tenureDays: number, amount: number): Decision {
  const reasons: string[] = [];
  const unstable = tenureDays < policy.stabilityDays;

  if (unstable) {
    reasons.push(`address only stable ${tenureDays}d (< ${policy.stabilityDays}d)`);
  }
  if (amount > policy.dualCap) {
    reasons.push(`amount ${usd(amount)} exceeds dual cap ${usd(policy.dualCap)}`);
  } else if (amount > policy.autoCap) {
    reasons.push(`amount ${usd(amount)} exceeds auto cap ${usd(policy.autoCap)}`);
  }

  if (unstable) {
    return {
      tier: "dual",
      line: 0,
      reasons,
      keyLifetime: lifetime(policy.oneTimeTtlHours),
      signature: "Fresh key and explicit review. The destination is not yet vouched for.",
    };
  }
  if (reasons.length > 0) {
    return {
      tier: "finance",
      line: 1,
      reasons,
      keyLifetime: lifetime(policy.oneTimeTtlHours),
      signature: "Finance signs once. A size question, not a trust question.",
    };
  }
  return {
    tier: "auto",
    line: 2,
    reasons: ["standing payee, within auto cap"],
    keyLifetime: lifetime(policy.standingTtlHours),
    signature: "Nobody signs. It releases on its own key.",
  };
}
