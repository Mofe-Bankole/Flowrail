import { AGENT } from "@/lib/chain";
import { proofs } from "@/lib/evidence";
import {
  autoCount,
  autoTotal,
  exceptionLeg,
  financeCount,
  formatUsd,
  headline,
  legCount,
  run,
  runTotal,
  shortAddress,
} from "@/lib/demo";
import { lifetime, policy } from "@/lib/policy";

/**
 * Hero — the product's one idea drawn as the artwork.
 *
 * One approval on the left; it fans out along rails into one key per payee.
 * Every cell is a real leg from the exported run, coloured by the tier the
 * engine gave it. On narrow screens the fan collapses into a stacked version
 * of the same picture rather than shrinking text to illegibility.
 */

const COLS = 5;
const ROWS = Math.ceil(run.legs.length / COLS);
const W = 1000;
const H = 70 * ROWS + 20;
const SRC = { x: 300, y: H / 2 };
const RAIL_X = 520;
const CELL_W = 82;
const CELL_H = 46;
const rowY = (r: number) => 45 + r * 70;
const colX = (c: number) => RAIL_X + 16 + c * 91;

function initials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export function Hero() {
  const head = headline();
  const reverted = proofs.filter((p) => p.outcome === "reverted").length;

  return (
    <section className="relative overflow-x-clip pt-16 pb-20 sm:pt-24 lg:pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.45,
          maskImage: "radial-gradient(70% 55% at 50% 30%, black, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-10rem] left-1/2 -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--ring-warm), transparent)" }}
      />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <a
            href="#proof"
            className="animate-rise inline-flex items-center gap-2 rounded-pill border border-border bg-card/70 py-1.5 pr-3.5 pl-2 text-[12px] text-muted-foreground transition-colors dur-fast hover:text-foreground"
          >
            <span className="rounded-pill bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
              Tempo
            </span>
            Enforced by the chain, on Moderato testnet
            <span aria-hidden="true">→</span>
          </a>

          <h1
            className="animate-rise mt-7 font-serif text-[clamp(2.9rem,7.4vw,6rem)] leading-[0.95] font-normal tracking-[-0.025em] text-balance"
            style={{ animationDelay: "80ms" }}
          >
            {head.legs}
            <br />
            <span className="text-primary italic">{head.decision}</span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-xl text-[17px] leading-relaxed text-muted-foreground text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            Approve a payout run once. FlowRail turns that approval into one
            access key per payee — locked to that recipient, capped at what they
            are owed, and expired within the week. The chain refuses everything
            else.
          </p>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="/app"
              className="group inline-flex h-12 items-center gap-2 rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-raised)] transition-[background-color,transform] dur-fast ease-standard hover:bg-primary-strong active:scale-[0.98]"
            >
              Open the desk
              <span aria-hidden="true" className="transition-transform dur-fast group-hover:translate-x-0.5">
                →
              </span>
            </a>
            <a
              href="#demo"
              className="inline-flex h-12 items-center gap-2.5 rounded-pill border border-border bg-card px-5 text-sm font-medium transition-[background-color,transform] dur-fast ease-standard hover:bg-accent active:scale-[0.98]"
            >
              <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-foreground text-background">
                <svg viewBox="0 0 10 10" className="ml-px size-2" fill="currentColor">
                  <path d="M2 1.2v7.6L8.6 5z" />
                </svg>
              </span>
              Watch the demo
            </a>
          </div>
        </div>

        {/* The fan — md and up. */}
        <div
          className="animate-rise relative mx-auto mt-16 hidden w-full md:block lg:mt-20"
          style={{ aspectRatio: `${W} / ${H}`, animationDelay: "320ms" }}
          role="img"
          aria-label={`One approval fans out into ${legCount} payout keys: ${autoCount} release on their own, ${financeCount} held for a signature.`}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" fill="none" aria-hidden="true">
            {Array.from({ length: ROWS }, (_, r) => {
              const y = rowY(r);
              const d = `M${SRC.x} ${SRC.y} C ${SRC.x + 120} ${SRC.y}, ${RAIL_X - 110} ${y}, ${RAIL_X} ${y} L ${W - 6} ${y}`;
              const heldRow = run.legs.slice(r * COLS, r * COLS + COLS).some((l) => l.tier !== "auto");
              return (
                <g key={r}>
                  <path d={d} stroke="var(--border)" strokeWidth="1.5" />
                  <path
                    d={d}
                    pathLength={1}
                    stroke={heldRow ? "var(--color-amber-500)" : "var(--primary)"}
                    strokeOpacity={heldRow ? 0.75 : 0.55}
                    strokeWidth="1.5"
                    strokeDasharray="1"
                    className="animate-draw"
                    style={{ animationDelay: `${900 + Math.abs(r - (ROWS - 1) / 2) * 90}ms` }}
                  />
                </g>
              );
            })}
            <circle cx={SRC.x} cy={SRC.y} r="5" fill="var(--primary)" />
            <circle cx={SRC.x} cy={SRC.y} r="11" stroke="var(--primary)" strokeOpacity="0.35" className="animate-halo" />
          </svg>

          {/* The approval. */}
          <div
            className="panel-deep absolute top-1/2 left-0 w-[29%] -translate-y-1/2 rounded-card p-[clamp(0.9rem,1.8vw,1.4rem)] text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Approve run
              </p>
              <span className="tnum rounded-pill bg-secondary px-2 py-0.5 text-[10px] font-medium">{run.id}</span>
            </div>
            <p className="tnum mt-3 font-serif text-[clamp(1.4rem,2.6vw,2.1rem)] leading-none">${runTotal}</p>
            <p className="tnum mt-1.5 text-[11px] text-muted-foreground">
              {legCount} lines · pathUSD
            </p>
            <dl className="mt-3.5 space-y-1 border-t border-border/70 pt-3 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Auto cap</dt>
                <dd className="tnum">${policy.autoCap}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Tenure</dt>
                <dd className="tnum">≥ {policy.stabilityDays}d</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Key life</dt>
                <dd className="tnum">{lifetime(policy.standingTtlHours)}</dd>
              </div>
            </dl>
            <div className="mt-3.5 border-t border-dashed border-border pt-3">
              <svg viewBox="0 0 160 28" className="h-6 w-auto text-foreground/80" fill="none" aria-hidden="true">
                <path
                  d="M4 20c8-14 14-16 15-9s-6 12-3 11 9-16 14-15-3 14 2 13 7-10 11-9-1 8 3 8 6-7 10-6 0 6 4 6 8-5 12-5 6 4 12 3 20-4 30-5 20 1 30 0"
                  pathLength={1}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="1"
                  className="animate-draw"
                  style={{ animationDelay: "450ms", animationDuration: "900ms" }}
                />
              </svg>
              <p className="tnum mt-1 text-[10px] text-muted-foreground">
                signed once · root {shortAddress(AGENT)}
              </p>
            </div>
          </div>

          {/* One key per payee, riding its rail. */}
          {run.legs.map((leg, i) => {
            const r = Math.floor(i / COLS);
            const c = i % COLS;
            const held = leg.tier !== "auto";
            return (
              <div
                key={leg.payeeId}
                className="group absolute"
                style={{
                  left: `${(colX(c) / W) * 100}%`,
                  top: `${((rowY(r) - CELL_H / 2) / H) * 100}%`,
                  width: `${(CELL_W / W) * 100}%`,
                  height: `${(CELL_H / H) * 100}%`,
                }}
              >
                <div
                  tabIndex={0}
                  className={`animate-key-on relative flex size-full flex-col justify-center rounded-[9px] border px-[9%] outline-none transition-[transform,box-shadow] dur-fast ease-standard group-hover:z-10 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-raised)] focus-visible:ring-2 focus-visible:ring-ring ${
                    held
                      ? "animate-held border-amber-500/60 bg-amber-50 dark:bg-amber-950/60"
                      : "border-border bg-card"
                  }`}
                  style={{ animationDelay: `${1500 + (r * COLS + c) * 22}ms` }}
                >
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate text-[clamp(8px,0.95vw,11px)] font-semibold tracking-wide text-muted-foreground">
                      {initials(leg.name)}
                    </span>
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${held ? "bg-amber-500" : "bg-emerald-500"}`}
                    />
                  </span>
                  <span
                    className={`tnum truncate font-serif text-[clamp(10px,1.35vw,15px)] leading-tight ${
                      held ? "text-amber-700 dark:text-amber-400" : ""
                    }`}
                  >
                    ${formatUsd(Number(leg.amount)).replace(/\.00$/, "")}
                  </span>
                </div>

                {/* Hover card */}
                <div
                  className={`pointer-events-none absolute top-[calc(100%+8px)] z-20 w-56 translate-y-1 rounded-row border border-border bg-popover p-3 text-left opacity-0 shadow-[var(--shadow-float)] transition-[opacity,transform] dur-fast ease-standard group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 ${
                    c >= 3 ? "right-0" : "left-0"
                  }`}
                >
                  <p className="text-[12px] font-semibold">{leg.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {leg.role} · stable {leg.stableForDays}d
                  </p>
                  <dl className="mt-2 space-y-0.5 border-t border-border/70 pt-2 text-[11px]">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">recipient</dt>
                      <dd className="tnum">{shortAddress(leg.address)} · locked</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">cap</dt>
                      <dd className="tnum">${formatUsd(Number(leg.amount))}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">expires</dt>
                      <dd className="tnum">
                        {lifetime(held ? policy.oneTimeTtlHours : policy.standingTtlHours)}
                      </dd>
                    </div>
                  </dl>
                  <p
                    className={`mt-2 text-[11px] leading-snug ${
                      held ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {held ? `Held — ${leg.reason}` : "Releases on its own key"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* The fan, stacked — below md. */}
        <div className="animate-rise mt-12 md:hidden" style={{ animationDelay: "320ms" }}>
          <div className="panel-deep rounded-card p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Approve run {run.id}
              </p>
              <p className="tnum font-serif text-2xl">${runTotal}</p>
            </div>
            <p className="tnum mt-1 text-[11px] text-muted-foreground">
              signed once · root {shortAddress(AGENT)}
            </p>
          </div>
          <div className="mx-auto h-8 w-px bg-primary/50" aria-hidden="true" />
          <div className="panel rounded-card p-3">
            <div className="grid grid-cols-8 gap-1.5" aria-hidden="true">
              {run.legs.map((leg, i) => (
                <span
                  key={leg.payeeId}
                  className={`animate-key-on aspect-square rounded-[5px] ${
                    leg.tier === "auto" ? "bg-emerald-500/55" : "animate-held bg-amber-500"
                  }`}
                  style={{ animationDelay: `${600 + i * 22}ms` }}
                />
              ))}
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
              {legCount} keys. {autoCount} release on their own; {financeCount} waits for a signature.
            </p>
          </div>
        </div>

        {/* Facts strip. */}
        <dl className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border lg:mt-24 lg:grid-cols-4">
          {[
            { k: "Released without a person", v: `$${autoTotal}`, s: `${autoCount} of ${legCount} lines` },
            {
              k: "Held, with a reason",
              v: exceptionLeg ? `$${formatUsd(Number(exceptionLeg.amount))}` : "$0.00",
              s: exceptionLeg ? `${exceptionLeg.name} · over $${policy.autoCap}` : "nothing escalated",
            },
            { k: "Signatures for the run", v: String(1 + financeCount), s: "one approval, one exception" },
            { k: "On-chain probes refused", v: `${reverted} / ${proofs.length}`, s: "refusals are the point" },
          ].map((f) => (
            <div key={f.k} className="bg-card px-5 py-5 sm:px-6">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{f.k}</dt>
              <dd className="tnum mt-2 font-serif text-[clamp(1.6rem,3vw,2.2rem)] leading-none">{f.v}</dd>
              <dd className="mt-2 text-[12px] leading-snug text-muted-foreground">{f.s}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
