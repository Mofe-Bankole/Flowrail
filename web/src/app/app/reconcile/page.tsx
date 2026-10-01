import { LegTable } from "@/components/desk/legs";
import { sampleLegs, sampleSummary } from "@/lib/desk";

export const metadata = { title: "Reconcile — FlowRail" };

export default function ReconcilePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sample</p>
        <h1 className="font-serif text-4xl tracking-tight">Reconcile</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Memo match is the happy path. An unmatched line stays unresolved and goes to a person.
          It is never dropped. Showing {sampleSummary.shown} of {sampleSummary.auto + sampleSummary.finance} seeded legs.
        </p>
      </header>
      <LegTable legs={sampleLegs} />
    </div>
  );
}
