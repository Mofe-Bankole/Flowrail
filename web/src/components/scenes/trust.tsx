"use client";

import { Reveal, StatusDot, useInView } from "./primitives";
import { exceptionLeg, financeCount, formatUsd, legCount, run, runTotal } from "@/lib/demo";
import { proofs } from "@/lib/evidence";

/**
 * Scene 05 — one deposit, forty destinations, and exactly one that stops.
 *
 * The whole pitch is a single amber path among thirty-nine green ones, so the
 * visualisation is built to make that one path impossible to miss.
 */
export function FanScene() {
  const [ref, seen] = useInView<HTMLDivElement>(0.25);

  const W = 1000;
  const H = 520;
  const TOP = 26;
  const BOTTOM = H - 26;
  // A one-payee run has no fan: guard the divide rather than emit NaN geometry.
  const step =
    legCount > 1 ? (BOTTOM - TOP) / (legCount - 1) : 0;
  const yAt = (i: number) => (legCount > 1 ? TOP + i * step : H / 2);
  const srcY = H / 2;

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            The shape of a run
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl">
            One deposit. {legCount} exits.{" "}
            {financeCount === 0
              ? "None of them stop."
              : financeCount === 1
                ? "One of them stops."
                : `${financeCount} of them stop.`}
          </h2>
        </Reveal>

        <div ref={ref} className="panel-deep mt-14 overflow-hidden rounded-panel px-4 py-6 sm:px-8">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="tnum font-serif text-2xl">${runTotal}</span>
            <span className="text-[11px] text-muted-foreground">
              received once, unlabelled
            </span>
            <span className="ml-auto flex items-center gap-2 text-[11px]">
              <span className="h-px w-6 bg-emerald-500/70" aria-hidden="true" />
              <span className="tnum">{run.counts.auto}</span>
              <span className="text-muted-foreground">clear themselves</span>
            </span>
            <span className="flex items-center gap-2 text-[11px]">
              <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
              <span className="tnum">{financeCount}</span>
              <span className="text-muted-foreground">
                {financeCount === 1 ? "waits" : "wait"}
              </span>
            </span>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`One deposit of ${runTotal} dollars splitting into ${run.legs.length} payments, ${run.counts.auto} automatic and one held for signature`}
          >
            {/* paths */}
            {run.legs.map((leg, i) => {
              const y = yAt(i);
              const isHeld = leg.tier !== "auto";
              return (
                <path
                  key={leg.payeeId}
                  d={`M 56 ${srcY} C 420 ${srcY} 560 ${y} 916 ${y}`}
                  fill="none"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeWidth={isHeld ? 2.5 : 1.25}
                  stroke={isHeld ? "var(--color-amber-500)" : "var(--color-emerald-500)"}
                  strokeOpacity={isHeld ? 1 : 0.5}
                  style={
                    seen
                      ? {
                          animation: `draw-path 620ms var(--ease-entrance) ${i * 22}ms both`,
                        }
                      : { strokeDashoffset: 1 }
                  }
                />
              );
            })}

            {/* endpoints */}
            {run.legs.map((leg, i) => {
              const y = yAt(i);
              const isHeld = leg.tier !== "auto";
              return (
                <circle
                  key={leg.payeeId}
                  cx={916}
                  cy={y}
                  r={isHeld ? 5 : 2.5}
                  fill={isHeld ? "var(--color-amber-500)" : "var(--color-emerald-500)"}
                  fillOpacity={isHeld ? 1 : 0.65}
                  style={
                    seen
                      ? {
                          animation: `cell-in 400ms var(--ease-entrance) ${300 + i * 22}ms both`,
                        }
                      : { opacity: 0 }
                  }
                />
              );
            })}

            {/* the source */}
            <g>
              <rect
                x={8}
                y={srcY - 26}
                width={48}
                height={52}
                rx={10}
                fill="var(--surface-2)"
                stroke="var(--border)"
              />
              <text
                x={32}
                y={srcY - 4}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted-foreground)"
              >
                in
              </text>
              <text
                x={32}
                y={srcY + 11}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="var(--foreground)"
              >
                1×
              </text>
            </g>

            {/* the one that stops */}
            {exceptionLeg
              ? (() => {
                  const i = run.legs.findIndex((l) => l.tier !== "auto");
                  const y = yAt(i);
                  return (
                    <g style={seen ? { animation: "panel-enter 500ms var(--ease-entrance) 900ms both" } : { opacity: 0 }}>
                      <line
                        x1={924}
                        y1={y}
                        x2={962}
                        y2={y}
                        stroke="var(--color-amber-500)"
                        strokeWidth={1}
                        strokeDasharray="2 3"
                      />
                      <text
                        x={968}
                        y={y - 3}
                        fontSize={12}
                        fontWeight={600}
                        fill="var(--color-amber-600)"
                      >
                        {exceptionLeg.name.split(" ")[0]}
                      </text>
                      <text
                        x={968}
                        y={y + 11}
                        fontSize={11}
                        fill="var(--muted-foreground)"
                      >
                        ${formatUsd(Number(exceptionLeg.amount))} · signature
                      </text>
                    </g>
                  );
                })()
              : null}
          </svg>
        </div>
      </div>
    </section>
  );
}

/**
 * Scene 06 — the interesting failure.
 *
 * A first transfer to an unseen payee dies in the token's transfer policy
 * before the access key is ever consulted. Steps three and four genuinely never
 * run, so the diagram marks them unreached rather than implying they passed.
 */
export function TraceScene() {
  const policy = proofs.find((p) => p.id === "token-policy");
  const noBatch = proofs.find((p) => p.id === "no-batch");

  const stages = [
    { label: "transfer submitted", state: "done" as const },
    { label: "token transfer policy", state: "stop" as const },
    { label: "access keychain", state: "never" as const },
    { label: "authorised amount", state: "never" as const },
    { label: "recipient lock", state: "never" as const },
  ];

  return (
    <section className="pb-24 lg:pb-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Where it fails
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl">
            Three checks the chain runs before FlowRail gets a vote.
          </h2>
        </Reveal>

        <Reveal delay={100} className="panel-deep mt-14 max-w-4xl overflow-hidden rounded-panel">
          <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-5 py-3.5">
            <span className="flex items-center gap-2 text-[11px]">
              <StatusDot tone="finance" />
              <span className="text-amber-600 dark:text-amber-400">
                first transfer to a new payee
              </span>
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              pathUSD · policy 1
            </span>
          </div>

          <ol className="divide-y divide-border/60">
            {stages.map((stage, i) => (
              <li
                key={stage.label}
                className="animate-cell-in relative flex items-center gap-4 px-5 py-3.5"
                style={{ animationDelay: `${i * 110}ms` }}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    stage.state === "done"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : stage.state === "stop"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-foreground/8 text-muted-foreground"
                  }`}
                >
                  {stage.state === "done" ? "✓" : stage.state === "stop" ? "✕" : "·"}
                </span>
                <span
                  className={`text-[12px] ${stage.state === "never" ? "text-muted-foreground/60" : ""}`}
                >
                  {stage.label}
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {stage.state === "done"
                    ? "passed"
                    : stage.state === "stop"
                      ? "PolicyForbids"
                      : "not reached"}
                </span>
              </li>
            ))}
          </ol>

          <div className="grid gap-5 border-t border-border/70 px-5 py-4 sm:grid-cols-2">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {policy?.detail}
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {noBatch?.detail}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}