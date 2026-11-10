import { Reveal } from "@/components/scenes/primitives";
import { legCount, runTotal, financeCount } from "@/lib/demo";
import { lifetime, policy } from "@/lib/policy";

/**
 * Why — the two options agencies already have, and the third.
 *
 * Each column answers the same two questions so they can be read across:
 * how many signatures does a run cost, and what does one leaked key reach?
 */
export function Problem() {
  const columns = [
    {
      name: "One hot wallet",
      verdict: "Fast, and exposed",
      sigs: "0",
      sigNote: "a bot pays everyone",
      reach: `$${runTotal}`,
      reachNote: "the whole invoice, to any address",
      bar: 1,
      tone: "bad" as const,
      body: "A server holds a key that can pay anyone, any amount, for as long as it lives. It is convenient until the day it is tomorrow's breach.",
    },
    {
      name: `${legCount} signatures`,
      verdict: "Safe, and slow",
      sigs: String(legCount),
      sigNote: "one person, every line, every month",
      reach: "$0.00",
      reachNote: "nothing is delegated",
      bar: 0,
      tone: "slow" as const,
      body: "Every payout waits for a human. Nothing leaks, and nothing ships on time. Teams quietly drift back to the hot wallet.",
    },
    {
      name: "FlowRail",
      verdict: "The third option",
      sigs: String(1 + financeCount),
      sigNote: "approve the run, sign the exception",
      reach: "One payee",
      reachNote: `up to what they are owed, for at most ${lifetime(policy.standingTtlHours)}`,
      bar: 0.08,
      tone: "good" as const,
      body: "The approval becomes per-recipient keys the chain enforces. A leaked key can only pay the person it was minted for — early, never elsewhere.",
    },
  ];

  return (
    <section id="problem" className="scroll-mt-20 border-t border-border/70 py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">The problem</p>
          <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
            Slow, or exposed. Agencies have lived with those two.
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
            An agency bills a client once, then owes that money across{" "}
            {legCount} freelancers, creators and vendors. Today it picks its
            poison.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {columns.map((col, i) => {
            const good = col.tone === "good";
            return (
              <Reveal
                key={col.name}
                delay={i * 90}
                className={`relative flex flex-col rounded-card p-6 sm:p-7 ${
                  good
                    ? "panel-deep ring-1 ring-primary/40 lg:-translate-y-3"
                    : "border border-border bg-card/60"
                }`}
              >
                {good ? (
                  <span className="absolute -top-3 left-6 rounded-pill bg-primary px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-primary-foreground uppercase">
                    On Tempo
                  </span>
                ) : null}
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {col.verdict}
                </p>
                <h3 className="mt-2 font-serif text-[1.75rem] leading-tight">{col.name}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{col.body}</p>

                <dl className="mt-auto space-y-5 pt-8">
                  <div>
                    <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Signatures per run</dt>
                    <dd className="mt-1 flex items-baseline gap-2">
                      <span className="tnum font-serif text-3xl">{col.sigs}</span>
                      <span className="text-[12px] text-muted-foreground">{col.sigNote}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">One leaked key reaches</dt>
                    <dd className="mt-1">
                      <span
                        className={`tnum font-serif text-3xl ${
                          col.tone === "bad" ? "text-destructive" : good ? "text-primary" : ""
                        }`}
                      >
                        {col.reach}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{col.reachNote}</span>
                    </dd>
                    <dd className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                      <span
                        className={`block h-full rounded-full ${
                          col.tone === "bad" ? "bg-destructive" : "bg-primary"
                        }`}
                        style={{ width: `${Math.max(col.bar * 100, col.bar > 0 ? 3 : 0)}%` }}
                      />
                    </dd>
                  </div>
                </dl>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
