"use client";

import { useState } from "react";
import {
  autoLegs,
  exceptionLeg,
  formatUsd,
  run,
  shortAddress,
  type DemoLeg,
} from "@/lib/demo";

/**
 * The hero product moment: every payee in the run as one cell, coloured by the
 * tier the engine actually assigned. Forty cells, one of them different.
 *
 * It replaces the sentence "39 of 40 need no signature" with something a
 * visitor can count, hover and inspect.
 */
export function DotGrid() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const active: DemoLeg | null =
    run.legs.find((leg) => leg.payeeId === activeId) ?? exceptionLeg ?? null;

  const total = run.legs.length;

  return (
    <div className="w-full">
      <div
        className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 md:gap-2"
        role="group"
        aria-label={`${run.counts.auto} automatic, ${run.counts.finance} needing approval, out of ${total} payees`}
      >
        {run.legs.map((leg, index) => {
          const isActive = active?.payeeId === leg.payeeId;
          const isException = leg.tier === "finance";
          return (
            <button
              key={leg.payeeId}
              type="button"
              aria-label={`${leg.name}, ${formatUsd(Number(leg.amount))} pathUSD, ${leg.tier}`}
              aria-pressed={isActive}
              onClick={() =>
                setActiveId(isActive && !isException ? null : leg.payeeId)
              }
              onMouseEnter={() => setActiveId(leg.payeeId)}
              onFocus={() => setActiveId(leg.payeeId)}
              className={[
                "relative aspect-square rounded-[5px] border transition-all duration-200 ease-standard",
                "animate-cell-in cursor-pointer",
                isException
                  ? "border-primary bg-primary shadow-[0_0_0_3px] shadow-primary/20"
                  : "border-border bg-muted hover:border-primary/50 hover:bg-accent",
                isActive && !isException ? "border-primary/60 bg-accent" : "",
              ].join(" ")}
              style={{ animationDelay: `${Math.min(index * 14, 560)}ms` }}
            >
              <span className="sr-only">{leg.name}</span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-panel border border-border bg-card px-5 py-4">
          <span className="font-serif text-lg tracking-tight">{active.name}</span>
          <span className="text-sm text-muted-foreground">{active.role}</span>
          <span className="text-sm tabular-nums">{formatUsd(Number(active.amount))} pathUSD</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {shortAddress(active.address)}
          </span>
          <span
            className={
              active.tier === "finance"
                ? "ml-auto text-sm font-medium text-primary"
                : "ml-auto text-sm text-muted-foreground"
            }
          >
            {active.tier === "finance" ? "Needs your signature" : "Automatic"}
          </span>
          <p className="w-full text-sm text-muted-foreground">{active.reason}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-[3px] border border-border bg-muted" />
          {autoLegs.length} automatic
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-[3px] bg-primary" />
          {run.counts.finance} needs a person
        </span>
        <span>{total} payees · run {run.id}</span>
      </div>
    </div>
  );
}