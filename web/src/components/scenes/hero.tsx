"use client";

import { Window, StatusDot, TierChip } from "./primitives";
import {
  autoTotal,
  exceptionLeg,
  formatUsd,
  headline,
  heldTotal,
  run,
  runTotal,
  shortAddress,
  standfirst,
  sumAmount,
} from "@/lib/demo";

/**
 * Scene 01 — the product as the hero artwork.
 *
 * The desk is not an illustration below the headline; it is the headline's
 * subject and it bleeds past the viewport edge. Floating surfaces overlap both
 * columns so the composition reads with depth rather than as a stack of cards.
 */
export function HeroScene() {
  const held = heldTotal();
  const released = sumAmount(run.legs) - held;
  const head = headline();

  return (
    <section className="relative overflow-x-clip pt-28 pb-20 sm:pt-32 lg:pb-28">
      {/* Backdrop: a faint ruled field so the panels have something to sit on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(120% 80% at 70% 30%, black, transparent 72%)",
        }}
      />

      <div className="mx-auto grid max-w-[1500px] gap-x-10 gap-y-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.5fr)] lg:items-center">
        {/* Type overlaps the interface rather than sitting above it. */}
        <div className="relative lg:pr-6">
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            <StatusDot tone="auto" />
            Run {run.id}
          </p>
          <h1 className="mt-5 font-serif text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[0.94] font-normal tracking-[-0.02em] text-balance">
            {head.legs}
            <br />
            {head.decision}
          </h1>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            {standfirst()}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/app"
              className="inline-flex h-12 items-center rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-raised)] transition dur-fast ease-standard hover:bg-primary-strong"
            >
              Open the desk
            </a>
            <a
              href="#mechanism"
              className="inline-flex h-12 items-center rounded-pill px-5 text-sm font-medium text-muted-foreground transition dur-fast ease-standard hover:text-foreground"
            >
              Watch it decide
            </a>
          </div>

          {/* Floating: agency custody, sitting on the type column. */}
          <div className="panel-float mt-10 hidden w-[19rem] rounded-card p-4 lg:block">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Signing with
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px]">0x4A19…9C2E</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Delegated, capped, locked to one recipient. Never the root key.
            </p>
          </div>
        </div>

        {/* The desk. Deliberately oversized and edge-bleeding. */}
        <div className="relative lg:-mr-[6vw]">
          <Window
            title={`flowrail · run ${run.id}`}
            meta={
              <span className="tnum text-[11px] text-muted-foreground">
                {new Date(run.generatedAt).toISOString().slice(0, 16).replace("T", " ")} UTC
              </span>
            }
            className="shadow-[var(--shadow-deep)]"
            bodyClassName="relative"
          >
            {/* Balance strip */}
            <div className="grid grid-cols-3 divide-x divide-border/70 border-b border-border/70">
              {[
                { k: "Run total", v: `$${runTotal}`, tone: "neutral" as const },
                {
                  k: "Released",
                  v: `$${formatUsd(released)}`,
                  tone: "auto" as const,
                },
                {
                  k: "Awaiting signature",
                  v: `$${formatUsd(held)}`,
                  tone: "finance" as const,
                },
              ].map((cell) => (
                <div key={cell.k} className="px-4 py-3.5 sm:px-5">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {cell.k}
                  </p>
                  <p
                    className={`tnum mt-1 font-serif text-xl sm:text-2xl ${
                      cell.tone === "finance" ? "text-amber-600 dark:text-amber-400" : ""
                    }`}
                  >
                    {cell.v}
                  </p>
                </div>
              ))}
            </div>

            {/* The wall of payouts. */}
            <div className="surface-sunken p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
                {run.legs.map((leg, i) => {
                  const isException = leg.tier === "finance";
                  return (
                    <div
                      key={leg.payeeId}
                      className="animate-cell-in group relative overflow-hidden rounded-[10px] border border-border/70 bg-card px-3 py-3 transition dur-standard ease-standard hover:z-10 hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]"
                      style={{ animationDelay: `${Math.min(i * 16, 700)}ms` }}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 top-0 h-[3px] ${
                          isException
                            ? "bg-amber-500"
                            : "bg-emerald-500/70"
                        }`}
                      />
                      <p className="truncate text-[11px] font-medium">{leg.name}</p>
                      <p
                        className={`tnum mt-1.5 font-serif text-lg leading-none ${
                          isException
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground/85"
                        }`}
                      >
                        ${formatUsd(Number(leg.amount))}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-[9px] text-muted-foreground">
                          {shortAddress(leg.address)}
                        </span>
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${
                            isException ? "bg-amber-500" : "bg-emerald-500/80"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/70 px-4 py-3 sm:px-5">
              <span className="flex items-center gap-2 text-[11px]">
                <StatusDot tone="auto" />
                <b className="tnum">{run.counts.auto}</b>
                <span className="text-muted-foreground">auto</span>
              </span>
              <span className="flex items-center gap-2 text-[11px]">
                <StatusDot tone="finance" />
                <b className="tnum">{run.counts.finance}</b>
                <span className="text-muted-foreground">finance</span>
              </span>
              <span className="flex items-center gap-2 text-[11px]">
                <StatusDot tone="idle" />
                <b className="tnum">{run.unresolved.length}</b>
                <span className="text-muted-foreground">unmatched memo</span>
              </span>
              <span className="ml-auto tnum text-[11px] text-muted-foreground">
                ${autoTotal} cleared without a human
              </span>
            </div>

            {/* The sweep: a lock landing on the interface. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-primary/8 to-transparent"
            />
          </Window>

          {/* Floating: the one signature, overlapping the window's lower edge. */}
          {exceptionLeg ? (
            <div className="panel-float absolute -bottom-8 left-2 w-[17rem] rounded-card p-4 shadow-[var(--shadow-deep)] sm:-left-6 lg:left-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Escalated
                </p>
                <TierChip tier="finance" />
              </div>
              <p className="mt-2 text-sm font-medium">{exceptionLeg.name}</p>
              <p className="tnum mt-1 font-serif text-2xl text-amber-600 dark:text-amber-400">
                ${formatUsd(Number(exceptionLeg.amount))}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                New address, over the auto cap. A person signs once — the key
                still cannot pay anyone else.
              </p>
              <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3">
                <span className="font-serif text-[13px] italic text-foreground/80">
                  {exceptionLeg.name}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  signed
                </span>
              </div>
            </div>
          ) : null}

          {/* Floating: the delegated key, off the right edge. */}
          <div className="panel-float absolute -top-6 right-4 hidden w-[15rem] rounded-card p-3.5 md:block lg:-right-4">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Auto key
            </p>
            <dl className="mt-1.5 divide-y divide-border/60">
              {[
                ["cap", "$500 / key"],
                ["lifetime", "12 h"],
                ["selector", "transfer"],
                ["recipient", "locked"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 text-[10px]">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tnum">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}