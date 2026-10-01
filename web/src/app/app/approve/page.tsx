"use client";

import { sampleLegs } from "@/lib/desk";
import { useWallet } from "@/lib/wallet";

export default function ApprovePage() {
  const wallet = useWallet();
  const waiting = sampleLegs.filter((leg) => leg.tier !== "auto");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sample</p>
        <h1 className="font-serif text-4xl tracking-tight">Approve</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Standing payees under $500 need no signature. This screen is only the ones that do.
          FlowRail cannot revoke a live key after you sign.
        </p>
      </header>
      {waiting.map((leg) => (
        <article key={leg.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">{leg.name}</h2>
            <p className="text-lg tabular-nums">{leg.amount}</p>
          </div>
          <p className="mt-3 max-w-prose text-sm">{leg.reason}</p>
          <button
            type="button"
            disabled={!wallet.address}
            onClick={() => undefined}
            className="mt-5 h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
          >
            {wallet.address ? "Sign this approval" : "Connect Tempo Wallet to sign"}
          </button>
        </article>
      ))}
    </div>
  );
}
