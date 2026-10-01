import type { DeskLeg } from "@/lib/desk";

export function LegTable({ legs }: { legs: readonly DeskLeg[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">Sample payout legs. Not chain receipts.</caption>
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Payee</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Tier</th>
            <th className="px-4 py-3 font-medium">Why</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg) => (
            <tr key={leg.id} className="border-t border-border bg-card">
              <td className="px-4 py-3">
                <span className="block font-medium">{leg.name}</span>
                <span className="tabular-nums text-muted-foreground">{leg.address}</span>
              </td>
              <td className="px-4 py-3 tabular-nums">{leg.amount}</td>
              <td className="px-4 py-3 capitalize">{leg.tier}</td>
              <td className="px-4 py-3 text-muted-foreground">{leg.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
