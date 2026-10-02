import { ClassifyButton } from "@/components/desk/classify";
import { probeRecords } from "@/lib/desk";
import { EXPLORER, readDesk } from "@/lib/chain";
import { classifyInvoice, type EngineRun } from "@/lib/engine";

export const metadata = { title: "Desk — FlowRail" };

export default async function DeskPage() {
  let live: Awaited<ReturnType<typeof readDesk>> | null = null;
  let run: EngineRun | null = null;
  let error: string | null = null;
  try {
    [live, run] = await Promise.all([readDesk(), classifyInvoice()]);
  } catch (err) {
    error = err instanceof Error ? err.message.split("\n")[0] : "The desk could not load.";
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Agency account</p>
        <p className="font-serif text-3xl tracking-tight tabular-nums">{live ? live.pathUsd : "—"}</p>
        <p className="text-sm text-muted-foreground">pathUSD · Moderato {live?.chainId ?? "—"}</p>
        <dl className="mt-2 grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Head</dt>
            <dd className="tabular-nums">{live?.head ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Account</dt>
            <dd className="tabular-nums">{live ? `${live.address.slice(0, 6)}…${live.address.slice(-4)}` : "—"}</dd>
          </div>
        </dl>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Queue · {run?.id ?? "no run"}</h1>
            <p className="text-sm text-muted-foreground">
              {run
                ? `${run.counts.auto} auto · ${run.counts.finance} finance · ${run.counts.dual} dual · ${run.unresolved} unresolved`
                : "The engine has not classified an invoice."}
            </p>
          </div>
          <ClassifyButton />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Classified payouts from the engine</caption>
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Payee</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody>
              {run && run.legs.length > 0 ? (
                run.legs.map((leg) => (
                  <tr key={leg.name} className="border-t border-border bg-card">
                    <td className="px-4 py-3">
                      <span className="block font-medium">{leg.name}</span>
                      <span className="text-muted-foreground">{leg.reason}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{leg.amount}</td>
                    <td className="px-4 py-3 capitalize">{leg.tier}</td>
                    <td className="px-4 py-3">{leg.approved ? "Auto" : "Needs a person"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="bg-card px-4 py-8 text-muted-foreground">
                    Classify an invoice to fill this queue.
                  </td>
                </tr>
              )}
              {run && run.unresolved > 0 ? (
                <tr className="border-t border-border bg-card">
                  <td className="px-4 py-3" colSpan={4}>
                    {run.unresolved} line has no payee. It was not dropped.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="flex flex-col gap-3">
        <article className="rounded-lg border border-border bg-card p-4 text-sm">
          <h2 className="font-semibold">Key lock</h2>
          <p className="mt-2 tabular-nums text-muted-foreground">0xa3e2736c…0b87</p>
          <p className="mt-1">Cap $1.00 pathUSD</p>
          <p className="mt-3 text-muted-foreground">An earlier key was not locked and paid an unlisted address. A later key was locked. The wrong recipient reverted.</p>
        </article>
        <article className="rounded-lg border border-border bg-card p-4 text-sm">
          <h2 className="font-semibold">Receipts</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {probeRecords.map((entry) => (
              <li key={entry.tx}>
                <a href={`${EXPLORER}/tx/${entry.tx}`} className="tabular-nums underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  {entry.tx.slice(0, 10)}…{entry.tx.slice(-4)}
                </a>
                <p className="mt-1 text-muted-foreground">{entry.why}</p>
              </li>
            ))}
          </ul>
        </article>
      </aside>
    </div>
  );
}
