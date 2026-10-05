"use client";

import { useState } from "react";
import { Reveal, StatusDot } from "@/components/scenes/primitives";
import { useWallet } from "@/lib/wallet";
import { probeRecords } from "@/lib/desk";
import { formatUsd, shortAddress, type DemoLeg } from "@/lib/demo";
import { Split, type Destination } from "./split";

/**
 * The desk.
 *
 * Organised around the only question this product answers: of the money that
 * arrived, what left without you and what is still waiting. The split is at the
 * top because it is the answer; the ledger below it is the evidence; the lock
 * proof at the bottom is why the split is worth trusting.
 *
 * Progressive disclosure is deliberate. Addresses, block height and chain id
 * are real but they are level 4 — they live behind a disclosure, not in the
 * top third of the screen.
 */

const AUTO_CAP = 500;
const STABILITY_DAYS = 7;

export function Desk({
  run,
  chain,
  chainError,
}: {
  run: {
    id: string;
    legs: DemoLeg[];
    unresolved: { payeeId: string; amount: string }[];
  };
  chain: { pathUsd: string; head: string; address: string; chainId: number } | null;
  chainError: string | null;
}) {
  const wallet = useWallet();
  const [selected, setSelected] = useState<Destination["key"] | null>(null);
  const [openLeg, setOpenLeg] = useState<string | null>(null);
  const [showLevels, setShowLevels] = useState(false);

  const auto = run.legs.filter((l) => l.tier === "auto");
  const held = run.legs.filter((l) => l.tier !== "auto");
  const value = (legs: DemoLeg[]) => legs.reduce((n, l) => n + Number(l.amount), 0);

  const total = value(run.legs);
  const autoValue = value(auto);
  const heldValue = value(held);
  const unmatched = run.unresolved.reduce((n, u) => n + Number(u.amount), 0);

  const destinations: [Destination, Destination] = [
    {
      key: "auto",
      label: "released on its own key",
      detail: "goes without you",
      legs: auto.length,
      value: autoValue,
      share: (autoValue / total) * 100,
    },
    {
      key: "held",
      label: held.length === 1 ? "held for one signature" : "held for signatures",
      detail: "waits for you",
      legs: held.length,
      value: heldValue,
      share: (heldValue / total) * 100,
    },
  ];

  const showAuto = selected === null || selected === "auto";
  const showHeld = selected === null || selected === "held";
  const oneDecision = held.length === 1 ? held[0] : null;

  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      {/* 1 — the answer */}
      <Reveal>
        <Split
          total={total}
          totalLegs={run.legs.length}
          destinations={destinations}
          selected={selected}
          onSelect={setSelected}
        />
      </Reveal>

      {/* 2 — the one thing that needs a person */}
      {oneDecision && showHeld ? (
        <Reveal delay={80}>
          <section aria-labelledby="decision-h" className="border-t border-border pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <h2
                id="decision-h"
                className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
              >
                Waiting on you · one line
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                {held.length} of {run.legs.length} lines ·{" "}
                <span className="tnum">{((heldValue / total) * 100).toFixed(1)}%</span> of
                the run
              </p>
            </div>

            <div className="panel-raised mt-5 rounded-panel shadow-[var(--shadow-float)]">
              <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5 p-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <StatusDot tone={oneDecision.tier} />
                    <p className="font-serif text-2xl leading-tight">
                      {oneDecision.name}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    {oneDecision.role} · stable{" "}
                    <span className="tnum">{oneDecision.stableForDays}d</span>
                  </p>
                  <p className="tnum mt-5 font-serif text-[clamp(2rem,5vw,3.25rem)] leading-none text-amber-600 dark:text-amber-400">
                    ${formatUsd(Number(oneDecision.amount))}
                  </p>
                </div>

                {/* The gate, drawn. This line stopped here, for these reasons. */}
                <div className="w-full max-w-sm">
                  <Gate
                    label="amount"
                    value={Number(oneDecision.amount)}
                    cap={AUTO_CAP}
                    capLabel={`≤ $${AUTO_CAP}`}
                    over
                  />
                  <Gate
                    label="tenure"
                    value={oneDecision.stableForDays}
                    cap={STABILITY_DAYS}
                    capLabel={`≥ ${STABILITY_DAYS}d`}
                    pass
                  />
                  <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                    {oneDecision.reason}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-6 py-4">
                <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
                  {wallet.address
                    ? "Wallet connected. Signing this line is not wired to a contract yet — settlement is blocked on the transfer policy, not on you."
                    : "One signature releases this line. The other 39 need nothing from you."}
                </p>
                {wallet.address ? (
                  <button
                    type="button"
                    onClick={() => void wallet.disconnect()}
                    className="shrink-0 rounded-pill border border-border px-4 py-2 text-[13px] transition dur-fast ease-standard hover:bg-surface-sunken"
                  >
                    Disconnect {shortAddress(wallet.address)}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={wallet.connecting}
                    onClick={() => void wallet.connect()}
                    className="shrink-0 rounded-pill bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground transition dur-fast ease-standard hover:bg-primary-strong disabled:opacity-60"
                  >
                    {wallet.connecting ? "Opening wallet" : "Connect to sign"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      {/* 3 — the evidence */}
      {showAuto && auto.length > 0 ? (
        <Reveal delay={120}>
          <section aria-labelledby="lines-h" className="border-t border-border pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <h2
                id="lines-h"
                className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
              >
                Released without you · {auto.length} lines
              </h2>
              <p className="tnum font-mono text-[10px] text-muted-foreground">
                ${formatUsd(autoValue)} · largest ${formatUsd(
                  Math.max(...auto.map((l) => Number(l.amount))),
                )}
              </p>
            </div>

            <div className="panel-raised mt-5 rounded-panel shadow-[var(--shadow-panel)]">
              <div className="grid grid-cols-2 divide-x divide-border/50">
                {[auto.slice(0, Math.ceil(auto.length / 2)), auto.slice(Math.ceil(auto.length / 2))].map(
                  (col, c) => (
                    <div key={c} className={c === 1 ? "hidden sm:block" : ""}>
                      {col.map((leg) => (
                        <button
                          key={leg.payeeId}
                          type="button"
                          onClick={() => setOpenLeg(openLeg === leg.payeeId ? null : leg.payeeId)}
                          aria-expanded={openLeg === leg.payeeId}
                          className={`flex w-full items-center gap-2.5 border-b border-border/40 px-3.5 py-2 text-left transition dur-fast ${
                            openLeg === leg.payeeId
                              ? "bg-surface-sunken"
                              : "hover:bg-surface-sunken/60"
                          } ${c === 1 ? "" : ""}`}
                        >
                          <StatusDot tone="auto" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] leading-tight font-medium">
                              {leg.name}
                            </span>
                            <span className="block truncate font-mono text-[10px] leading-tight text-muted-foreground">
                              {leg.role} · {leg.stableForDays}d
                            </span>
                          </span>
                          <span className="tnum shrink-0 text-[12px] text-muted-foreground">
                            ${formatUsd(Number(leg.amount))}
                          </span>
                        </button>
                      ))}
                    </div>
                  ),
                )}
              </div>

              {openLeg ? (
                <div className="animate-cell-in border-t border-border/70 bg-surface-sunken/60 px-3.5 py-3 font-mono text-[10px] text-muted-foreground">
                  {(() => {
                    const leg = auto.find((l) => l.payeeId === openLeg);
                    if (!leg) return null;
                    return (
                      <span className="flex flex-wrap gap-x-6 gap-y-1">
                        <span>reason · {leg.reason}</span>
                        <span>address · {leg.address}</span>
                        <span>stable {leg.stableForDays}d</span>
                      </span>
                    );
                  })()}
                </div>
              ) : null}
            </div>

            <p className="mt-2.5 font-mono text-[10px] text-muted-foreground">
              select a line for its reason and address
            </p>
          </section>
        </Reveal>
      ) : null}

      {/* 4 — money that never entered the run */}
      {run.unresolved.length > 0 && selected === null ? (
        <Reveal delay={160}>
          <section aria-labelledby="unmatched-h" className="border-t border-border pt-8">
            <h2
              id="unmatched-h"
              className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
            >
              Outside the run · {run.unresolved.length} line
            </h2>
            <div className="panel-raised mt-5 rounded-panel px-5 py-4 shadow-[var(--shadow-panel)]">
              {run.unresolved.map((u) => (
                <div key={u.payeeId} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusDot tone="idle" />
                  <span className="font-mono text-[12px]">{u.payeeId}</span>
                  <span className="text-[12px] text-muted-foreground">
                    is not on the roster, so it was never given a key
                  </span>
                  <span className="tnum ml-auto text-[12px] text-muted-foreground">
                    ${formatUsd(Number(u.amount))}
                  </span>
                </div>
              ))}
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                <span className="tnum">${formatUsd(unmatched)}</span> counted here and
                excluded from the split above. A line with no payee is not dropped — it
                is the one thing FlowRail will never guess at.
              </p>
            </div>
          </section>
        </Reveal>
      ) : null}

      {/* 5 — why the split is worth trusting */}
      <Reveal delay={200}>
        <section aria-labelledby="proof-h" className="border-t border-border pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h2
              id="proof-h"
              className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
            >
              What a key can and cannot do
            </h2>
            <p className="font-mono text-[10px] text-muted-foreground">
              {probeRecords.length} transactions · Moderato
            </p>
          </div>

          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {probeRecords.map((r, i) => {
              const held = /rejected|did not hold/.test(r.why);
              return (
                <li
                  key={r.tx}
                  className={`panel-raised rounded-panel p-4 ${
                    held ? "shadow-[var(--shadow-raised)]" : "shadow-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                        held
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : "bg-emerald-500/18 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {held ? "✕" : "✓"}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {i + 1} / {probeRecords.length}
                    </span>
                  </div>
                  <p className="mt-3 text-[12px] leading-snug font-medium">{r.what}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    {r.why}
                  </p>
                  <a
                    href={r.href}
                    className="mt-2.5 block truncate font-mono text-[10px] text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {r.tx.slice(0, 14)}…{r.tx.slice(-6)}
                  </a>
                </li>
              )
            })}
          </ol>

          <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
            An amount cap alone is not a lock. The third transaction spent to a
            recipient that was never allowlisted, and it succeeded. Only{" "}
            <span className="text-foreground/85">setAllowedCalls</span> — naming
            one recipient — made the fourth transaction revert.
          </p>
        </section>
      </Reveal>

      {/* 6 — level 4. Present, but behind a disclosure. */}
      <Reveal delay={240}>
        <section className="border-t border-border pt-8">
          <button
            type="button"
            onClick={() => setShowLevels(v => !v)}
            aria-expanded={showLevels}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Chain detail
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {showLevels ? "hide" : "show"}
            </span>
          </button>

          {showLevels ? (
            <dl className="animate-cell-in mt-4 grid gap-x-8 gap-y-2 font-mono text-[10px] sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["chain id", chain ? String(chain.chainId) : "—"],
                ["block", chain ? chain.head : "—"],
                ["agency account", chain ? chain.address : "—"],
                ["pathUSD balance", chain ? chain.pathUsd : "—"],
                ["run", run.id],
                ["settled", "0 · executeBatch has no batch primitive"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-border/40 pb-1.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tnum truncate text-right">{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {chainError ? (
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">
              chain unreachable · {chainError}
            </p>
          ) : null}
        </section>
      </Reveal>
    </div>
  );
}

/** One rule check, drawn as the value against its threshold. */
function Gate({
  label,
  value,
  cap,
  capLabel,
  over,
  pass,
}: {
  label: string;
  value: number;
  cap: number;
  capLabel: string;
  over?: boolean;
  pass?: boolean;
}) {
  const scale = Math.max(value, cap) * 1.12;
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <span
          className={`absolute inset-y-0 left-0 rounded-full ${
            over ? "bg-amber-500" : pass ? "bg-emerald-500" : "bg-primary/70"
          }`}
          style={{ width: `${(value / scale) * 100}%` }}
        />
        <span
          className="absolute inset-y-0 w-px bg-foreground/40"
          style={{ left: `${(cap / scale) * 100}%` }}
        />
      </span>
      <span className="tnum w-20 shrink-0 text-right font-mono text-[11px]">
        {label === "amount" ? `$${formatUsd(value)}` : `${value}d`}
      </span>
      <span className="w-12 shrink-0 text-right font-mono text-[10px] text-muted-foreground/70">
        {capLabel}
      </span>
    </div>
  );
}