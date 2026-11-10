"use client";

import { useState } from "react";

import { Reveal } from "@/components/scenes/primitives";
import { autoCount, exceptionLeg, financeCount, formatUsd, legCount, run, runTotal, type DemoLeg } from "@/lib/demo";
import { lifetime, policy } from "@/lib/policy";

type Filter = "all" | "auto" | "held";

/**
 * The whole run, every leg — browsable. Selecting a line shows what the engine
 * wrote about it, so the "why" is never a summary of a summary.
 */
export function RunExplorer() {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<DemoLeg>(exceptionLeg ?? run.legs[0]);

  const visible = run.legs.filter((l) =>
    filter === "all" ? true : filter === "auto" ? l.tier === "auto" : l.tier !== "auto",
  );
  const held = selected.tier !== "auto";
  const max = Math.max(...run.legs.map((l) => Number(l.amount)));

  const filters: { id: Filter; label: string; n: number }[] = [
    { id: "all", label: "All lines", n: legCount },
    { id: "auto", label: "Released", n: autoCount },
    { id: "held", label: "Held", n: legCount - autoCount },
  ];

  return (
    <section id="run" className="scroll-mt-20 border-t border-border/70 bg-surface-sunken py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">One real run</p>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
              {legCount} lines. {financeCount === 1 ? "One of them needed a person." : `${financeCount} needed a person.`}
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Run {run.id}, ${runTotal}, exactly as the policy engine exported it.
              Nothing on this page is typed in by hand. Pick any line.
            </p>
          </Reveal>
          <div role="tablist" aria-label="Filter lines" className="flex gap-1 self-start rounded-pill border border-border bg-card p-1 lg:self-auto">
            {filters.map((f) => (
              <button
                key={f.id}
                role="tab"
                type="button"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`tnum h-9 rounded-pill px-3.5 text-[12px] font-medium transition-[background-color,color] dur-fast ease-standard ${
                  filter === f.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label} <span className="opacity-60">{f.n}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Reveal className="panel min-w-0 rounded-card p-3 sm:p-4">
            <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-5">
              {visible.map((leg, i) => {
                const isHeld = leg.tier !== "auto";
                const isSel = leg.payeeId === selected.payeeId;
                return (
                  <li key={leg.payeeId} className={!expanded && i >= 8 && !isSel && !isHeld ? "hidden sm:block" : ""}>
                    <button
                      type="button"
                      onClick={() => setSelected(leg)}
                      aria-pressed={isSel}
                      className={`relative w-full overflow-hidden rounded-[10px] border px-3 pt-3 pb-2.5 text-left transition-[transform,box-shadow,background-color,border-color] dur-fast ease-standard hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] ${
                        isSel
                          ? "border-foreground/70 bg-card shadow-[var(--shadow-raised)]"
                          : isHeld
                            ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/50"
                            : "border-border/70 bg-card"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`size-1.5 shrink-0 rounded-full ${isHeld ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <span className="truncate text-[12px] font-medium">{leg.name}</span>
                      </span>
                      <span
                        className={`tnum mt-1.5 block font-serif text-lg leading-none ${
                          isHeld ? "text-amber-700 dark:text-amber-400" : ""
                        }`}
                      >
                        ${formatUsd(Number(leg.amount))}
                      </span>
                      <span className="mt-2 block h-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                        <span
                          className={`block h-full rounded-full ${isHeld ? "bg-amber-500" : "bg-primary/60"}`}
                          style={{ width: `${(Number(leg.amount) / max) * 100}%` }}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {visible.length > 9 ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 h-10 w-full rounded-[10px] border border-border text-[12px] font-medium text-muted-foreground transition-colors dur-fast hover:text-foreground sm:hidden"
              >
                {expanded ? "Show fewer" : `Show all ${visible.length} lines`}
              </button>
            ) : null}
            {filter !== "auto"
              ? run.unresolved.map((u) => (
                  <div
                    key={u.payeeId}
                    className="mt-3 flex items-center gap-3 rounded-[10px] border border-dashed border-border px-3.5 py-3 text-[12px] text-muted-foreground"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span className="min-w-0 flex-1 truncate">
                      <b className="font-medium text-foreground">{u.payeeId}</b> · not on the roster — no key is minted
                      for a line FlowRail cannot name
                    </span>
                    <span className="tnum shrink-0">${formatUsd(Number(u.amount))}</span>
                  </div>
                ))
              : null}
          </Reveal>

          {/* Detail */}
          <Reveal delay={100} className="lg:sticky lg:top-24 lg:self-start">
            <div key={selected.payeeId} className="animate-settle panel-deep overflow-hidden rounded-card">
              <div className="border-b border-border/70 px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {selected.role}
                  </p>
                  <span
                    className={`rounded-pill px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase ${
                      held
                        ? "bg-amber-500/14 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {selected.tier}
                  </span>
                </div>
                <p className="mt-2 font-serif text-3xl">{selected.name}</p>
                <p
                  className={`tnum mt-1 font-serif text-4xl ${held ? "text-amber-700 dark:text-amber-400" : "text-foreground/90"}`}
                >
                  ${formatUsd(Number(selected.amount))}
                </p>
              </div>
              <dl className="divide-y divide-border/60 text-[13px]">
                {[
                  ["Address", selected.address],
                  ["Stable for", `${selected.stableForDays} days (needs ${policy.stabilityDays})`],
                  ["Auto cap", `$${formatUsd(policy.autoCap)}`],
                  ["Key lifetime", lifetime(held ? policy.oneTimeTtlHours : policy.standingTtlHours)],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 px-6 py-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="tnum truncate text-right" title={v}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className={`px-6 py-4 ${held ? "bg-amber-500/8" : "bg-emerald-500/6"}`}>
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Engine reason</p>
                <p className="mt-1 text-[14px] font-medium">{selected.reason}</p>
                {selected.tier === "finance" ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    Held because of size, not trust: the address has been stable for{" "}
                    {selected.stableForDays} days. A person signs once — and the key still
                    cannot pay anyone else.
                  </p>
                ) : selected.tier === "dual" ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    The destination is not yet vouched for: a fresh key and an explicit review.
                  </p>
                ) : (
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    Nobody signs this line. It releases on a key that can only pay this address.
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
