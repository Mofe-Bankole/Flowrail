"use client";

import { useState } from "react";

/**
 * The signature. The run's total divided by the rule that divided it.
 *
 * Not a chart of history — a partition of the run in front of you. The segment
 * widths are the two destinations' share of real value, and the held segment
 * carries the auto cap as a visible threshold it overshot. Clicking a
 * destination hands the selection to the ledger below.
 *
 * One line out of forty holds a fifth of the money. That fact is the product,
 * so it is the largest thing on the screen.
 */

export type Destination = {
  key: "auto" | "held";
  label: string;
  detail: string;
  legs: number;
  value: number;
  share: number;
};

export function Split({
  total,
  totalLegs,
  destinations,
  autoCap,
  selected,
  onSelect,
}: {
  total: number;
  totalLegs: number;
  destinations: [Destination, Destination];
  /** The threshold the held line overshot, in dollars, from the run's policy. */
  autoCap: number;
  selected: Destination["key"] | null;
  onSelect: (k: Destination["key"] | null) => void;
}) {
  const [auto, held] = destinations;
  const heldLine = held.legs === 1;
  /**
   * The cap marker is placed proportionally inside the held segment. That only
   * makes sense when the held segment is actually wider than the cap — i.e. the
   * line really did overshoot it. With no held value, or a held total below the
   * cap, the marker would sit off the end of its own segment (or divide by
   * zero), so it is drawn only when it has something real to point at.
   */
  const showCap = held.value > 0 && held.value >= autoCap;

  return (
    <section aria-labelledby="split-h" className="relative">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <h2 id="split-h" className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Run {heldLine ? "divided" : "divides"} by the rule
          </h2>
          <p className="tnum mt-6 font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.03em]">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-3 text-[13px] text-muted-foreground">
            <span className="tnum">{totalLegs}</span> lines ·{" "}
            <span className="tnum">{auto.share.toFixed(1)}%</span> went without you
          </p>
        </div>

        {/* Selectable destinations, sized by real share. */}
        <div className="flex w-full gap-2 sm:w-auto">
          {destinations.map((d) => {
            const on = selected === d.key;
            const dim = selected !== null && !on;
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(on ? null : d.key)}
                className={`min-w-0 flex-1 rounded-row border px-4 py-3 text-left transition dur-standard ease-standard active:scale-[0.98] sm:flex-none sm:w-56 ${
                  on
                    ? "border-primary/40 bg-primary/8 shadow-[var(--shadow-raised)]"
                    : "border-border bg-card hover:border-border/80 hover:bg-surface-sunken"
                } ${dim ? "opacity-45" : ""}`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      d.key === "auto" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {d.legs} {d.legs === 1 ? "line" : "lines"}
                  </span>
                </span>
                <span className="tnum mt-2 block font-serif text-xl">
                  ${d.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The partition itself. */}
      <div className="mt-7">
        <div className="flex h-16 w-full gap-1.5">
          {destinations.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-label={`${d.label} — $${d.value.toFixed(2)}, ${d.legs} lines`}
              onClick={() => onSelect(selected === d.key ? null : d.key)}
              style={{ flexGrow: d.share, flexBasis: 0 }}
              className={`group relative overflow-hidden rounded-row border text-left transition dur-standard ease-standard active:brightness-95 ${
                d.key === "auto"
                  ? "border-emerald-500/30 bg-emerald-500/12 hover:bg-emerald-500/18"
                  : "border-amber-500/35 bg-amber-500/14 hover:bg-amber-500/20"
              } ${selected === d.key ? "ring-2 ring-primary/45" : ""} ${
                selected !== null && selected !== d.key ? "opacity-40" : ""
              }`}
            >
              {/*
                Below sm the held segment is ~67px wide and cannot hold these
                labels without clipping. They are hidden rather than the segment
                given a minimum width, because the caption underneath claims the
                widths are the real share and that claim has to hold at every
                width. The destination cards above carry the same text.
              */}
              <span className="tnum absolute top-2 left-3 hidden font-mono text-[11px] text-muted-foreground sm:block">
                {d.share.toFixed(1)}%
              </span>
              <span className="absolute bottom-2 left-3 hidden text-[11px] font-medium sm:block">
                {d.detail}
              </span>

              {/* The cap, drawn where the held line crosses it. */}
              {d.key === "held" && showCap ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 w-px bg-amber-600/70"
                  style={{ left: `${(autoCap / d.value) * 100}%` }}
                >
                  <span                   className="tnum absolute top-1.5 -left-1 hidden rounded-surface-sunken bg-amber-500/20 px-1 font-mono text-[10px] text-amber-700 sm:block dark:text-amber-300">
                    ${autoCap} cap
                  </span>
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Proportional counts: 39 of 40 is a hairline. State that plainly. */}
        <p className="mt-2.5 font-mono text-[11px] text-muted-foreground">
          widths are share of value · by line count the split is{" "}
          <span className="tnum">
            {auto.legs}/{totalLegs}
          </span>{" "}
          against{" "}
          <span className="tnum">{held.legs}</span>
        </p>
      </div>
    </section>
  );
}

/** Kept local so the split has no dependency on the shell's selected state shape. */
export function useSplit() {
  return useState<Destination["key"] | null>(null);
}