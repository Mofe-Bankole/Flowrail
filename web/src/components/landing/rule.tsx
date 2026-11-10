"use client";

import { useState } from "react";

import { Reveal } from "@/components/scenes/primitives";
import { exceptionLeg, formatUsd, run } from "@/lib/demo";
import { decide, policy } from "@/lib/policy";

type Preset = { label: string; tenure: number; amount: number };

const routine = run.legs.find((l) => l.tier === "auto") ?? run.legs[0];

const presets: Preset[] = [
  { label: routine.name, tenure: routine.stableForDays, amount: Number(routine.amount) },
  ...(exceptionLeg
    ? [{ label: exceptionLeg.name, tenure: exceptionLeg.stableForDays, amount: Number(exceptionLeg.amount) }]
    : []),
  { label: "New address", tenure: 2, amount: 240 },
  { label: "Big & new", tenure: 1, amount: 3200 },
];

const tierStyle = {
  auto: {
    chip: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/35",
    dot: "bg-emerald-500",
    label: "Auto",
  },
  finance: {
    chip: "bg-amber-500/14 text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/45",
    dot: "bg-amber-500",
    label: "Finance",
  },
  dual: {
    chip: "bg-destructive/12 text-destructive",
    ring: "ring-destructive/40",
    dot: "bg-destructive",
    label: "Dual",
  },
} as const;

/**
 * The rule, live. Two sliders feed the same decision function (and the same
 * thresholds) the engine used to split the run above.
 */
export function Rule() {
  const [tenure, setTenure] = useState(presets[1]?.tenure ?? 40);
  const [amount, setAmount] = useState(presets[1]?.amount ?? 1850);
  const d = decide(tenure, amount);
  const s = tierStyle[d.tier];

  const lines = [
    { cond: `address tenure < ${policy.stabilityDays} days`, out: "dual", why: "irreversible: unvouched destination" },
    { cond: `amount > $${policy.autoCap}`, out: "finance", why: "a size problem, not a trust problem" },
    { cond: "otherwise", out: "auto", why: "releases on its own key" },
  ];

  return (
    <section id="rule" className="scroll-mt-20 border-t border-border/70 py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">The rule</p>
          <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
            Three lines. Try them.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
            Size is a human question. Trust is a policy one. Move the sliders —
            this runs the same thresholds the engine used on {run.id}.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-14">
          <div className="panel-deep grid grid-cols-1 overflow-hidden rounded-card lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Inputs */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => {
                  const active = p.tenure === tenure && p.amount === amount;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setTenure(p.tenure);
                        setAmount(p.amount);
                      }}
                      aria-pressed={active}
                      className={`h-9 rounded-pill border px-3.5 text-[12px] font-medium transition-[background-color,color,border-color,transform] dur-fast ease-standard active:scale-[0.97] ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <Slider
                id="tenure"
                label="Address tenure"
                value={tenure}
                min={0}
                max={90}
                step={1}
                threshold={policy.stabilityDays}
                display={`${tenure} day${tenure === 1 ? "" : "s"}`}
                thresholdLabel={`${policy.stabilityDays}d`}
                onChange={setTenure}
              />
              <Slider
                id="amount"
                label="Amount"
                value={amount}
                min={0}
                max={4000}
                step={5}
                threshold={policy.autoCap}
                display={`$${formatUsd(amount)}`}
                thresholdLabel={`$${policy.autoCap}`}
                onChange={setAmount}
              />

              <div className="mt-8 space-y-1.5" aria-label="The rule">
                {lines.map((l, i) => {
                  const hit = d.line === i;
                  return (
                    <div
                      key={l.cond}
                      className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 rounded-row px-4 py-2.5 text-[13px] transition-[background-color,opacity] dur-standard ease-standard ${
                        hit ? "bg-secondary opacity-100" : "opacity-50"
                      }`}
                    >
                      <span className="tnum">
                        <span className="text-muted-foreground">{i === 2 ? "" : "if "}</span>
                        {l.cond}
                      </span>
                      <span className="tnum font-semibold">→ {l.out}</span>
                      <span className="col-span-2 text-[12px] text-muted-foreground">{l.why}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col border-t border-border/70 bg-surface-sunken p-6 sm:p-8 lg:border-t-0 lg:border-l">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Decision</p>
              <div
                key={d.tier}
                className={`animate-settle mt-4 rounded-card bg-card p-6 ring-1 ${s.ring}`}
                aria-live="polite"
              >
                <span className={`inline-flex items-center gap-2 rounded-pill px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${s.chip}`}>
                  <span className={`size-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <p className="mt-4 font-serif text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-balance">
                  {d.signature}
                </p>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-row border border-border bg-border">
                <div className="bg-card px-4 py-3.5">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Key lifetime</dt>
                  <dd className="tnum mt-1 text-[17px] font-medium">{d.keyLifetime}</dd>
                </div>
                <div className="bg-card px-4 py-3.5">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Key reaches</dt>
                  <dd className="tnum mt-1 text-[17px] font-medium">1 address, ${formatUsd(amount)}</dd>
                </div>
              </dl>

              <div className="mt-6">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Reasons, as the engine writes them</p>
                <ul className="mt-2 space-y-1.5">
                  {d.reasons.map((r) => (
                    <li key={r} className="tnum flex gap-2 text-[13px]">
                      <span aria-hidden="true" className="text-muted-foreground">—</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-auto pt-8 text-[12px] leading-relaxed text-muted-foreground">
                The ${formatUsd(policy.dualCap)} dual cap is deliberately not a
                tier. A large payment to a long-known address is a size question;
                merging the two would tell a reviewer a standing payee is
                unvouched for.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  threshold,
  display,
  thresholdLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  threshold: number;
  display: string;
  thresholdLabel: string;
  onChange: (n: number) => void;
}) {
  const pct = ((threshold - min) / (max - min)) * 100;
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </label>
        <output htmlFor={id} className="tnum font-serif text-2xl">
          {display}
        </output>
      </div>
      <div className="relative mt-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range w-full"
          style={{
            background: `linear-gradient(to right, var(--primary) ${((value - min) / (max - min)) * 100}%, var(--secondary) 0)`,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-full mt-1 -translate-x-1/2 text-[10px] text-muted-foreground tnum"
          style={{ left: `${pct}%` }}
        >
          ▲ {thresholdLabel}
        </span>
      </div>
    </div>
  );
}
