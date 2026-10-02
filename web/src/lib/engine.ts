export type EngineLeg = {
  name: string;
  amount: string;
  tier: "auto" | "finance" | "dual";
  approved: boolean;
  reason: string;
};

export type EngineRun = {
  id: string;
  counts: { auto: number; finance: number; dual: number };
  unresolved: number;
  legs: EngineLeg[];
};

export async function classifyInvoice(): Promise<EngineRun> {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const { stdout } = await run("npm", ["run", "--silent", "classify"], {
    cwd: "/home/mofebanks/Documents/Crypto Worlds Fair/flowrail/spike",
  });
  return JSON.parse(stdout) as EngineRun;
}
