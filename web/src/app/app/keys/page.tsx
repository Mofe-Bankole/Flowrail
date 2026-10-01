export const metadata = { title: "Keys — FlowRail" };

export default function KeysPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Probe · Moderato</p>
        <h1 className="font-serif text-4xl tracking-tight">Keys</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          setAllowedCalls is the second transaction. It locks a key to one recipient. Until it lands, the key can pay any address. The cap only limits the amount.
        </p>
      </header>
      <article className="rounded-lg border border-border bg-card p-5 text-sm">
        <h2 className="font-semibold">Probe key</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Id</dt>
            <dd className="tabular-nums">0xa3e2736c…0b87</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cap</dt>
            <dd className="tabular-nums">$1.00 pathUSD</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Recipient</dt>
            <dd>Not locked</dd>
          </div>
        </dl>
        <p className="mt-4 text-destructive">Not usable. This key already paid an unlisted address.</p>
      </article>
    </div>
  );
}
