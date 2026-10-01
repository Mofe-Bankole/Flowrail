import { probeRecords } from "@/lib/desk";

export const metadata = { title: "Audit — FlowRail" };

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Probe receipts · not the sample run</p>
        <h1 className="font-serif text-4xl tracking-tight">Audit</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          These two rows happened on Moderato. The $2,500 run on the other screens did not.
        </p>
      </header>
      <ol className="flex flex-col gap-3">
        {probeRecords.map((entry) => (
          <li key={entry.tx} className="rounded-lg border border-border bg-card p-5 text-sm">
            <p className="text-muted-foreground">{entry.at}</p>
            <p className="mt-2">{entry.what}</p>
            <p className="mt-2 text-muted-foreground">{entry.why}</p>
            <a
              href={entry.href}
              className="mt-3 inline-flex tabular-nums underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {entry.tx.slice(0, 10)}…{entry.tx.slice(-4)}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
