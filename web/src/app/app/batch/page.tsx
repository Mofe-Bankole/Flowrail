import { sampleLegs, sampleRun, sampleSummary } from "@/lib/desk";

export const metadata = { title: "Batch — FlowRail" };

export default function BatchPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sample · not submitted</p>
        <h1 className="font-serif text-4xl tracking-tight">Batch</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          {sampleRun.invoice} across {sampleSummary.auto + sampleSummary.finance} legs. All succeed or all revert.
          Maximum exposure is the sum of the live caps, not zero.
        </p>
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {sampleLegs.map((leg) => (
          <li key={leg.id} className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm">
            <span>{leg.name}</span>
            <span className="tabular-nums">{leg.amount}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        Submit stays off until a wallet is connected and every key has a confirmed recipient lock.
      </p>
    </div>
  );
}
