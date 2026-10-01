import Link from "next/link";
import { sampleRun, sampleSummary, statusCopy } from "@/lib/desk";

export const metadata = { title: "Run — FlowRail" };

const steps = [
  ["Reconciled", "Memo matched, or marked unresolved."],
  ["Awaiting approval", "Jane is over the auto cap."],
  ["Keys unscoped", "A new key can pay anyone until the lock lands."],
  ["Ready", "Every live key has a confirmed recipient."],
  ["Settled", "The batch receipt is in the audit."],
] as const;

export default function RunPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sample · {sampleRun.id}</p>
        <h1 className="font-serif text-4xl tracking-tight">{sampleRun.invoice}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{sampleRun.note}</p>
      </header>
      <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
        Status: {statusCopy[sampleRun.status]}
      </p>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Auto" value={String(sampleSummary.auto)} detail="No signature" />
        <Stat label="Finance" value={String(sampleSummary.finance)} detail="Size, not trust" />
        <Stat label="Dual" value={String(sampleSummary.dual)} detail="New or changed address" />
      </section>
      <ol className="grid gap-3">
        {steps.map(([name, detail], index) => (
          <li key={name} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="tabular-nums text-muted-foreground">{index + 1}</span>
            <span className="ml-3 font-medium">{name}</span>
            <span className="mt-1 block text-muted-foreground">{detail}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Link href="/app/reconcile" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          Open reconciliation
        </Link>
        <Link href="/app/approve" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          Open the queue
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
