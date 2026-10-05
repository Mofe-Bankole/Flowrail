/**
 * The desk and the landing page read the same run.
 *
 * `demo-run.json` is produced by the real policy engine via
 * `npm --prefix ../spike run demo:export`. Importing it — rather than shelling
 * out to the spike at request time — means the desk shows exactly what the
 * landing page shows, and it works on Vercel where a sibling checkout and a
 * child process do not exist.
 */

import { run, type DemoLeg, type DemoRun, type Tier } from "./demo";

export type EngineLeg = DemoLeg;

export type EngineRun = {
  id: string;
  counts: Record<Tier, number>;
  /**
   * The thresholds this run was decided against, carried from the artefact.
   *
   * The desk used to hold its own copies of the cap and the stability window.
   * That is a second source of truth: raise the cap in the engine and the desk
   * would keep drawing the old line, showing a reviewer a gate that no longer
   * exists. Every number the desk draws as a threshold comes from here.
   */
  policy: DemoRun["policy"];
  /** The unmatched lines themselves, not a count: the desk has to name them. */
  unresolved: { payeeId: string; amount: string }[];
  legs: EngineLeg[];
};

export async function classifyInvoice(): Promise<EngineRun> {
  return {
    id: run.id,
    counts: run.counts,
    policy: run.policy,
    unresolved: run.unresolved,
    legs: run.legs,
  };
}