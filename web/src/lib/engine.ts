/**
 * The desk and the landing page read the same run.
 *
 * `demo-run.json` is produced by the real policy engine via
 * `npm --prefix ../spike run demo:export`. Importing it — rather than shelling
 * out to the spike at request time — means the desk shows exactly what the
 * landing page shows, and it works on Vercel where a sibling checkout and a
 * child process do not exist.
 */

import { run, type DemoLeg, type Tier } from "./demo";

export type EngineLeg = DemoLeg;

export type EngineRun = {
  id: string;
  counts: Record<Tier, number>;
  /** The unmatched lines themselves, not a count: the desk has to name them. */
  unresolved: { payeeId: string; amount: string }[];
  legs: EngineLeg[];
};

export async function classifyInvoice(): Promise<EngineRun> {
  return {
    id: run.id,
    counts: run.counts,
    unresolved: run.unresolved,
    legs: run.legs,
  };
}