"use client";

import { Reveal, StatusDot, Window } from "./primitives";
import {
  exceptionLeg,
  formatUsd,
  run,
  runTotal,
  sumAmount,
} from "@/lib/demo";

/**
 * Scene 07 — the run closes.
 *
 * The previous version of this scene showed three equal outcome cards beside a
 * three-row receipt. It was the least dense moment on the page and the last
 * thing anyone sees, so it now anchors on the real artefact: the run's own
 * ledger, every leg, at the density an operator would actually read it at.
 *
 * The outcome rail is one panel with hairline dividers rather than three cards,
 * and the exception row is nudged off the baseline so the eye lands on the
 * single line that needed a person.
 */
export function FinaleScene() {
  const released = sumAmount(run.legs.filter((l) => l.tier === "auto"));
  const held = exceptionLeg ? Number(exceptionLeg.amount) : 0;
  const unmatched = run.unresolved.reduce((n, u) => n + Number(u.amount), 0);

  // Split the ledger across two columns so forty legs stay a readable block
  // instead of a page-long list. Order is preserved top-left then top-right.
  const half = Math.ceil(run.legs.length / 2);
  const columns = [run.legs.slice(0, half), run.legs.slice(half)];

  const rail = [
    {
      k: "Released on their own key",
      v: formatUsd(released),
      n: run.counts.auto,
      note: "amount ≤ $500 · address tenure ≥ 7d",
      tone: "auto" as const,
    },
    {
      k: "Held for one signature",
      v: formatUsd(held),
      n: run.counts.finance,
      note: exceptionLeg ? exceptionLeg.reason : "—",
      tone: "finance" as const,
    },
    {
      k: "Still unmatched",
      v: formatUsd(unmatched),
      n: run.unresolved.length,
      note: "no payee on the roster",
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
          <p className="text-[12px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            End of run
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[0.98] tracking-[-0.02em] text-balance">
            One run. Forty lines. One of them needed a person.
          </h2>
        </Reveal>

        <div className="mt-12 grid items-start gap-6 lg:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.65fr)] lg:gap-8">
          {/* Outcome rail — one receipt, three rows, not three cards. */}
          <Reveal className="lg:sticky lg:top-0 lg:pt-24">
            <div className="panel-raised overflow-hidden rounded-panel shadow-[var(--shadow-panel)]">
              {rail.map((row, i) => (
                <div
                  key={row.k}
                  className={`flex flex-col gap-2 px-5 py-4 ${
                    i < rail.length - 1 ? "border-b border-border/60" : ""
                  } ${i === 1 ? "surface-sunken lg:-translate-x-3" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      <StatusDot tone={row.tone} />
                      {row.n} {row.n === 1 ? "line" : "lines"}
                    </span>
                    <span
                      className={`tnum font-serif text-2xl ${
                        row.tone === "finance"
                          ? "text-amber-600 dark:text-amber-400"
                          : row.tone === "idle"
                            ? "text-muted-foreground"
                            : ""
                      }`}
                    >
                      ${row.v}
                    </span>
                  </div>
                  <p className="text-[12px] leading-snug text-foreground/80">
                    {row.k}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {row.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Reconciliation footer. */}
            <div className="panel-float mt-4 rounded-panel px-5 py-3.5 shadow-[var(--shadow-float)]">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                  Reconciled
                </span>
                <span className="tnum font-serif text-xl">${runTotal}</span>
              </div>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                settled sequentially · one receipt each
              </p>
            </div>
          </Reveal>

          {/* The run ledger — the artefact itself, every line, dense. */}
          <Reveal delay={120}>
            <Window
              title={`run ${run.id} · closed`}
              meta={
                <span className="tnum font-mono text-[11px] text-muted-foreground">
                  {run.legs.length} legs ·{" "}
                  {new Date(run.generatedAt)
                    .toISOString()
                    .replace("T", " ")
                    .slice(0, 16)}{" "}
                  UTC
                </span>
              }
              className="shadow-[var(--shadow-deep)]"
            >
              <div className="grid grid-cols-2 divide-x divide-border/50">
                {columns.map((legs, c) => (
                  <div key={c} className={c === 1 ? "hidden sm:block" : ""}>
                    {legs.map((leg, i) => (
                      <div
                        key={leg.payeeId}
                        className="animate-cell-in flex items-center gap-2.5 border-b border-border/40 px-3.5 py-[7px] last:border-b-0"
                        style={{
                          animationDelay: `${Math.min(i * 34 + c * 90, 700)}ms`,
                        }}
                      >
                        <StatusDot tone={leg.tier} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] leading-tight font-medium">
                            {leg.name}
                          </span>
                          <span className="block truncate font-mono text-[10px] leading-tight text-muted-foreground">
                            {leg.role} · {leg.stableForDays}d
                          </span>
                        </span>
                        <span
                          className={`tnum shrink-0 text-[12px] ${
                            leg.tier === "finance"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          ${formatUsd(Number(leg.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Unmatched line — outside the ledger, because it never entered it. */}
              <div className="border-t border-border/70 bg-surface-sunken/60 px-3.5 py-2.5">
                {run.unresolved.map((u) => (
                  <div key={u.payeeId} className="flex items-center gap-2.5">
                    <StatusDot tone="idle" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">
                      {u.payeeId} · not on roster
                    </span>
                    <span className="tnum shrink-0 text-[12px] text-muted-foreground">
                      ${formatUsd(Number(u.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </Window>
          </Reveal>
        </div>

        {/* The conclusion. */}
        <Reveal
          delay={200}
          className="mt-20 flex flex-col items-start gap-8 lg:mt-24 lg:flex-row lg:items-end lg:justify-between"
        >
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