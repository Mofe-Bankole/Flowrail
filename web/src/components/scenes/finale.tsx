"use client";

import { Reveal, StatusDot, Window } from "./primitives";
import {
  autoTotal,
  exceptionLeg,
  formatUsd,
  run,
  runTotal,
  sumAmount,
} from "@/lib/demo";

/**
 * Scene 07 — the run reaches its end state.
 *
 * Deliberately reports three outcomes rather than a single "done": what left on
 * its own, what a person signed, and what we still cannot match. The CTA reads
 * as the end of the story rather than a banner in the middle of it.
 */
export function FinaleScene() {
  const released = sumAmount(run.legs.filter((l) => l.tier === "auto"));
  const held = exceptionLeg ? Number(exceptionLeg.amount) : 0;
  const unmatched = run.unresolved.reduce((n, u) => n + Number(u.amount), 0);

  const columns = [
    {
      k: "Released on their own key",
      v: `$${formatUsd(released)}`,
      n: run.counts.auto,
      tone: "auto" as const,
    },
    {
      k: "Held for one signature",
      v: `$${formatUsd(held)}`,
      n: run.counts.finance,
      tone: "finance" as const,
    },
    {
      k: "Still unmatched",
      v: `$${formatUsd(unmatched)}`,
      n: run.unresolved.length,
      tone: "idle" as const,
    },
  ];

  return (
    <section className="relative overflow-x-clip pb-28 pt-8 lg:pb-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(90% 70% at 50% 100%, black, transparent 75%)",
        }}
      />

      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            End of run
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[0.98] tracking-[-0.02em] text-balance">
            Nothing here needs a decision it should not have.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-8">
          {/* Outcome board — three tall readouts, not three cards. */}
          <Reveal className="grid gap-4 sm:grid-cols-3">
            {columns.map((col, i) => (
              <div
                key={col.k}
                className={`panel-raised flex flex-col justify-between rounded-panel p-5 ${
                  i === 1 ? "sm:-translate-y-4" : i === 2 ? "sm:translate-y-4" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <StatusDot tone={col.tone} />
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {col.n} {col.n === 1 ? "line" : "lines"}
                  </p>
                </div>
                <p
                  className={`tnum mt-8 font-serif text-3xl sm:text-4xl ${
                    col.tone === "finance"
                      ? "text-amber-600 dark:text-amber-400"
                      : col.tone === "idle"
                        ? "text-muted-foreground"
                        : ""
                  }`}
                >
                  {col.v}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {col.k}
                </p>
              </div>
            ))}
          </Reveal>

          {/* The receipts, closing the loop. */}
          <Reveal delay={140}>
            <Window
              title={`run ${run.id} · closed`}
              meta={
                <span className="tnum text-[10px] text-muted-foreground">
                  ${runTotal}
                </span>
              }
              className="shadow-[var(--shadow-deep)]"
            >
              <div className="px-5 py-4">
                {[
                  ["Auto-approved", autoTotal],
                  ["Awaiting signature", exceptionLeg ? formatUsd(Number(exceptionLeg.amount)) : "—"],
                  [
                    "Unmatched memo",
                    formatUsd(run.unresolved.reduce((n, u) => n + Number(u.amount), 0)),
                  ],
                ].map(([k, v], i) => (
                  <div
                    key={k as string}
                    className="animate-cell-in flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5 last:border-b-0"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="text-[11px] text-muted-foreground">{k}</span>
                    <span className="tnum text-[12px]">${v}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/70 px-5 py-3">
                <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                  40 legs · settled sequentially · one receipt each
                </p>
              </div>
            </Window>
          </Reveal>
        </div>

        {/* The conclusion. */}
        <Reveal delay={200} className="mt-20 flex flex-col items-start gap-8 lg:mt-28 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h3 className="font-serif text-3xl leading-[1.06] tracking-[-0.01em] text-balance sm:text-4xl">
              Bring a month of payouts. Leave with one decision.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              FlowRail sits in front of a Tempo wallet, decides what is routine,
              and escalates only what it should.
            </p>
          </div>
          <a
            href="/app"
            className="inline-flex h-14 shrink-0 items-center gap-3 rounded-pill bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition dur-fast ease-standard hover:bg-primary-strong"
          >
            Open the desk
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}