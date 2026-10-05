"use client";

import { Window, StatusDot, TierChip, useScrollStep } from "./primitives";
import {
  averageAuto,
  autoTotal,
  financeCount,
  legCount,
  exceptionLeg,
  formatUsd,
  run,
  runTotal,
  shortAddress,
} from "@/lib/demo";

const sample = [...run.legs.slice(0, 5), exceptionLeg].filter(Boolean);

const STEPS = [
  {
    kicker: "01 — Arrival",
    title: "Money lands with no instructions",
    body: "A deposit arrives. No memo tells us who to pay.",
    fig: "arrival" as const,
  },
  {
    kicker: "02 — Identity",
    title: "Each address is resolved to a person",
    body: "Our roster supplies a name and how long that address has been stable.",
    fig: "identity" as const,
  },
  {
    kicker: "03 — Rule",
    title: "Two questions, asked per line",
    body: "Is this address old enough, and is the amount small enough? Both must pass.",
    fig: "rule" as const,
  },
  {
    kicker: "04 — Result",
    title: "The run divides itself",
    body: `${run.counts.auto} leave${run.counts.auto === 1 ? "s" : ""} on their own key. ${
      financeCount === 0
        ? "Nobody needs to sign anything."
        : financeCount === 1
          ? "One is held for a signature."
          : `${financeCount} are held for signatures.`
    }`,
    fig: "result" as const,
  },
] as const;

/**
 * Scene 02 — INPUT to RULE to OUTPUT as a sticky instrument.
 *
 * The window on the left is the same object in all four states, so the reader
 * watches one machine change mode rather than four separate diagrams.
 */
export function MechanismScene() {
  const [ref, step] = useScrollStep(STEPS.length);

  return (
    <section id="mechanism" className="relative scroll-mt-20 py-24 lg:py-32">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1500px] gap-x-14 gap-y-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]"
      >
        {/* The instrument stays put; only its contents change. */}
        <div className="order-2 lg:order-1">
          {/*
            A sticky wrapper one viewport tall, with the instrument flex-centred
            inside it. Pinning the instrument itself to lg:top-24 left it floating
            near the top of the screen; this keeps it on the vertical centre line
            for the whole scroll instead.
          */}
          <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
            <Window
              title="flowrail · classifier"
              meta={
                <span className="flex items-center gap-1.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                  <StatusDot tone={step === 3 ? "auto" : "idle"} />
                  step {step + 1}/4
                </span>
              }
              className="w-full min-h-[30rem] shadow-[var(--shadow-deep)]"
            >
              <div className="p-5 sm:p-6" key={step}>
                {step === 0 ? <ArrivalState /> : null}
                {step === 1 ? <IdentityState /> : null}
                {step === 2 ? <RuleState /> : null}
                {step === 3 ? <ResultState /> : null}
              </div>
            </Window>
          </div>
        </div>

        {/* The narrative column: four tall steps. */}
        <ol className="order-1 flex flex-col lg:order-2">
          {STEPS.map((s, i) => (
            <li
              key={s.kicker}
              data-step
              className="flex min-h-[68vh] flex-col justify-center border-t border-border/60 py-10 first:border-t-0 lg:min-h-[74vh]"
            >
              <div
                className={`transition dur-standard ease-standard ${
                  i === step ? "opacity-100" : "opacity-35"
                }`}
              >
                <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {s.kicker}
                </p>
                <h2 className="mt-4 max-w-sm font-serif text-3xl leading-[1.06] tracking-[-0.01em] text-balance sm:text-4xl">
                  {s.title}
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>

{/*
  A small real-data figure under each step. Without these the narrative column
  is prose only, which left the tail of the scene — after the instrument has
  scrolled away — as the emptiest stretch of the page. They are annotation
  scale, not a second set of panels: no shadows, no floating offsets.
*/}
                <StepFigure kind={s.fig} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** The representative line the figures quote: a median routine payout. */
const routine = [...run.legs]
  .filter((l) => l.tier === "auto")
  .sort((a, b) => Number(a.amount) - Number(b.amount))[
  Math.floor(run.legs.filter((l) => l.tier === "auto").length / 2)
];

function StepFigure({ kind }: { kind: (typeof STEPS)[number]["fig"] }) {
  const wrap =
    "mt-6 max-w-sm border-l border-border/70 pl-3.5 text-[10px] leading-relaxed";

  if (kind === "arrival") {
    return (
      <div className={wrap}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-muted-foreground">0x91c4…0a3f</span>
          <span className="tnum text-[11px]">${runTotal}</span>
        </div>
        <p className="mt-1 font-mono text-muted-foreground">
          memo — none · 1 tx · unlabelled
        </p>
      </div>
    );
  }

  if (kind === "identity" && routine) {
    return (
      <div className={wrap}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[11px] text-foreground/85">
            {routine.name}
          </span>
          <span className="tnum shrink-0 font-mono text-muted-foreground">
            {routine.stableForDays}d stable
          </span>
        </div>
        <p className="mt-1 truncate font-mono text-muted-foreground">
          {routine.role} · {shortAddress(routine.address)}
        </p>
      </div>
    );
  }

  if (kind === "rule" && routine && exceptionLeg) {
    return (
      <div className={wrap}>
        <Gauge
          label="tenure"
          ratio={routine.stableForDays / 7}
          read={`${routine.stableForDays}d`}
          cap="≥ 7d"
          pass
        />
        <Gauge
          label="routine"
          ratio={Number(routine.amount) / 500}
          read={`$${formatUsd(Number(routine.amount))}`}
          cap="≤ $500"
        />
        <Gauge
          label="held"
          ratio={Number(exceptionLeg.amount) / 500}
          read={`$${formatUsd(Number(exceptionLeg.amount))}`}
          cap="≤ $500"
          ratioCap={1}
        />
      </div>
    );
  }

  const total = run.legs.length;
  const autoPct = (run.counts.auto / total) * 100;
  return (
    <div className={wrap}>
      <div className="flex h-2 overflow-hidden rounded-full bg-surface-sunken">
        <span className="bg-primary-strong" style={{ width: `${autoPct}%` }} />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-3 font-mono text-muted-foreground">
        <span className="tnum">{run.counts.auto} auto</span>
        <span className="tnum">
          {run.counts.finance} held · {run.unresolved.length} unmatched
        </span>
      </div>
    </div>
  );
}

function Gauge({
  label,
  ratio,
  read,
  cap,
  pass,
  ratioCap,
}: {
  label: string;
  ratio: number;
  read: string;
  cap: string;
  pass?: boolean;
  ratioCap?: number;
}) {
  const capped = ratioCap ?? 4;
  const over = ratio > 1;
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 font-mono text-muted-foreground">{label}</span>
      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <span
          className={`absolute inset-y-0 left-0 ${
            over ? "bg-amber-500" : pass ? "bg-primary-strong" : "bg-primary/70"
          }`}
          style={{ width: `${Math.min(ratio / capped, 1) * 100}%` }}
        />
        {/* the threshold itself */}
        <span
          className="absolute inset-y-0 w-px bg-foreground/35"
          style={{ left: `${(1 / capped) * 100}%` }}
        />
      </span>
      <span className="tnum w-16 shrink-0 text-right font-mono text-muted-foreground">
        {read}
      </span>
      <span className="w-10 shrink-0 text-right font-mono text-muted-foreground/70">
        {cap}
      </span>
    </div>
  );
}

function ArrivalState() {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Inbound deposit · 1 tx · no memo
      </p>
      <div className="surface-sunken rounded-row p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">
            0x91c4…0a3f
          </span>
          <span className="tnum font-serif text-3xl">${runTotal}</span>
        </div>
      </div>
      <div className="space-y-1.5 pt-2">
        {run.legs.slice(0, 6).map((leg, i) => (
          <div
            key={leg.payeeId}
            className="animate-cell-in flex items-center gap-3 rounded-[9px] border border-border/60 bg-card px-3 py-2"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="font-mono text-[10px] text-muted-foreground">
              {shortAddress(leg.address)}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="tnum text-[11px]">${formatUsd(Number(leg.amount))}</span>
          </div>
        ))}
        {legCount > 6 ? (
          <p className="pt-1 text-[11px] text-muted-foreground">
            …and {legCount - 6} more, none of them labelled.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function IdentityState() {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Roster match · {run.legs.length}/{run.legs.length} resolved
      </p>
      {sample.map((leg, i) => {
        const isNew = leg.tier !== "auto";
        return (
          <div
            key={leg.payeeId}
            className="animate-cell-in flex items-center gap-3 rounded-[9px] border border-border/60 bg-card px-3 py-2.5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                isNew
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isNew ? "!" : "✓"}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
              {leg.name}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              {leg.stableForDays}d
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RuleState() {
  const overCap = sample.filter((l) => Number(l.amount) > 500);
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Two gates · all must pass
      </p>
      {[
        {
          label: "Address stable for 7+ days",
          pass: sample.filter((l) => l.stableForDays >= 7).length,
          total: sample.length,
        },
        {
          label: "Amount at or under $500",
          pass: sample.length - overCap.length,
          total: sample.length,
        },
      ].map((gate, gi) => (
        <div key={gate.label} className="surface-sunken rounded-row p-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[12px]">{gate.label}</span>
            <span className="tnum shrink-0 text-[11px] text-muted-foreground">
              <b className="text-foreground">{gate.pass}</b>/{gate.total}
            </span>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: gate.total }, (_, i) => (
              <span
                key={i}
                className="animate-cell-in h-1.5 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    i < gate.pass ? "var(--color-emerald-500)" : "var(--color-amber-500)",
                  animationDelay: `${gi * 160 + i * 55}ms`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-row border border-amber-500/30 bg-amber-500/6 p-4">
        <p className="text-[12px] font-medium text-amber-700 dark:text-amber-400">
          {overCap.length} line fails the cap
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {overCap.map((l) => `${l.name} · $${formatUsd(Number(l.amount))}`).join(", ")}{" "}
          cannot be approved by a machine.
        </p>
      </div>
    </div>
  );
}

function ResultState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="animate-cell-in rounded-row border border-emerald-500/25 bg-emerald-500/6 p-4"
          style={{ animationName: "settle" }}
        >
          <div className="flex items-center gap-2">
            <StatusDot tone="auto" />
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Released
            </p>
          </div>
          <p className="tnum mt-2 font-serif text-4xl">{run.counts.auto}</p>
          <p className="tnum mt-1 text-[12px] text-muted-foreground">
            ${autoTotal} · ${averageAuto()} avg
          </p>
        </div>
        <div
          className="animate-cell-in rounded-row border border-amber-500/30 bg-amber-500/8 p-4"
          style={{ animationDelay: "140ms", animationName: "settle" }}
        >
          <div className="flex items-center gap-2">
            <StatusDot tone="finance" />
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Held
            </p>
          </div>
          <p className="tnum mt-2 font-serif text-4xl text-amber-600 dark:text-amber-400">
            {run.counts.finance}
          </p>
          {exceptionLeg ? (
            <div className="mt-1 flex items-center gap-2">
              <TierChip tier="finance" />
              <span className="truncate text-[11px] text-muted-foreground">
                {exceptionLeg.name}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="surface-sunken rounded-row p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          The thirty-nine never touch the agency key. Each spends its own
          delegated key, capped and locked, and expires on its own.
        </p>
      </div>
    </div>
  );
}