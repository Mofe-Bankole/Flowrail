import {
  autoTotal,
  exceptionLeg,
  formatUsd,
  run,
  runTotal,
  shortAddress,
} from "@/lib/demo";

/**
 * The desk queue, rendered from the engine's real output. This is the same
 * classification the /app desk shows, on the landing page, with nothing
 * re-described in prose.
 */
export function RunQueue() {
  const rows = exceptionLeg
    ? [...run.legs.filter((leg) => leg.payeeId !== exceptionLeg.payeeId), exceptionLeg]
    : run.legs;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4">
        <div className="flex items-baseline gap-3">
          <h3 className="font-serif text-lg tracking-tight">Queue · {run.id}</h3>
          <span className="text-sm text-muted-foreground tabular-nums">{runTotal} pathUSD</span>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground tabular-nums">{run.counts.auto}</span> auto
          <span className="mx-1.5" aria-hidden>
            ·
          </span>
          <span className="text-primary tabular-nums">{run.counts.finance}</span> finance
          <span className="mx-1.5" aria-hidden>
            ·
          </span>
          <span className="tabular-nums">{run.unresolved.length}</span> unresolved
        </p>
      </div>

      <div className="max-h-[26rem] overflow-y-auto">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <caption className="sr-only">
            Every payout line in run {run.id} with the tier the policy engine assigned
          </caption>
          <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-2.5 font-medium">Payee</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Address</th>
              <th scope="col" className="px-5 py-2.5 text-right font-medium">Amount</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Decision</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((leg) => {
              const isException = leg.tier === "finance";
              return (
                <tr
                  key={leg.payeeId}
                  className={
                    isException
                      ? "border-t border-primary/30 bg-primary/[0.06]"
                      : "border-t border-border"
                  }
                >
                  <td className="px-5 py-2.5">
                    <span className="font-medium">{leg.name}</span>
                    <span className="block text-xs text-muted-foreground">{leg.role}</span>
                  </td>
                  <td className="px-5 py-2.5 text-muted-foreground tabular-nums">
                    {shortAddress(leg.address)}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums">
                    {formatUsd(Number(leg.amount))}
                  </td>
                  <td className="px-5 py-2.5">
                    {isException ? (
                      <span className="font-medium text-primary">{leg.reason}</span>
                    ) : (
                      <span className="text-muted-foreground">{leg.reason}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {run.unresolved.map((line) => (
              <tr key={line.payeeId} className="border-t border-dashed border-border">
                <td className="px-5 py-2.5">
                  <span className="font-medium text-muted-foreground">{line.payeeId}</span>
                  <span className="block text-xs text-muted-foreground">
                    not on the roster
                  </span>
                </td>
                <td className="px-5 py-2.5 text-muted-foreground">—</td>
                <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">
                  {line.amount}
                </td>
                <td className="px-5 py-2.5 text-muted-foreground">
                  held for a human, not dropped
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-border bg-muted/50 px-5 py-3.5 text-sm">
        <p className="text-muted-foreground">
          Settles without a new signature
          <span className="ml-2 text-foreground tabular-nums">{autoTotal} pathUSD</span>
        </p>
        <p className="text-muted-foreground">
          Needs one signature
          <span className="ml-2 text-primary tabular-nums">
            {exceptionLeg ? formatUsd(Number(exceptionLeg.amount)) : "0.00"} pathUSD
          </span>
        </p>
      </div>
    </div>
  );
}