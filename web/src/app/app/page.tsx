import { Desk } from "@/components/desk/desk";
import { EXPLORER, readDesk } from "@/lib/chain";
import { classifyInvoice } from "@/lib/engine";

export const metadata = { title: "Desk — FlowRail" };

/**
 * The desk is server-rendered from the engine's own output. `classifyInvoice`
 * currently returns the exported demo run — it takes no input and classifies
 * nothing — so there is deliberately no "classify" button here. The run, its
 * split and its one held line are all derived from the same artefact the
 * landing page renders, and nothing on this screen implies an action the
 * product cannot actually perform.
 */
export default async function DeskPage() {
  const [chainResult, runResult] = await Promise.allSettled([readDesk(), classifyInvoice()]);

  const chain = chainResult.status === "fulfilled" ? chainResult.value : null;
  const chainError =
    chainResult.status === "rejected"
      ? String(chainResult.reason instanceof Error ? chainResult.reason.message : chainResult.reason)
          .split("\n")[0]
      : null;

  if (runResult.status === "rejected") {
    return (
      <div className="panel-raised rounded-panel p-6">
        <h1 className="font-serif text-2xl">The engine did not return a run.</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Regenerate it with{" "}
          <code className="font-mono text-[12px]">npm --prefix ../spike run demo:export</code>
          .
        </p>
      </div>
    );
  }

  return (
    <Desk
      run={{
        id: runResult.value.id,
        legs: runResult.value.legs,
        unresolved: runResult.value.unresolved,
      }}
      chain={
        chain
          ? {
              pathUsd: chain.pathUsd,
              head: chain.head,
              address: chain.address,
              chainId: chain.chainId,
            }
          : null
      }
      chainError={chainError}
    />
  );
}

export { EXPLORER };