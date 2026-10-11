"use client";

import { useState } from "react";

import { Reveal, StatusDot } from "./primitives";
import {
  featuredAutoLeg,
  formatUsd,
  run,
  shortAddress,
  standingKeyTtl,
} from "@/lib/demo";
import { explorerTx, proofs } from "@/lib/evidence";

/**
 * Scene 04 — zoom all the way in.
 *
 * Small type, real hashes, real chain errors. This is the detail that makes an
 * interface read as software somebody actually operates.
 */
export function InspectorScene() {
  const accepted = proofs.filter((p) => p.outcome === "accepted");
  const rejected = proofs.filter((p) => p.outcome === "reverted");
  // Lead with the gap and the refusals; the setup transactions are one click away.
  const baseline = accepted.filter((p) => p.baseline);
  const setup = accepted.filter((p) => !p.baseline);
  const [showSetup, setShowSetup] = useState(false);
  const shown = [...baseline, ...rejected, ...(showSetup ? setup : [])];

  const leg = featuredAutoLeg;
  const issued = new Date(run.generatedAt);
  const expires = new Date(issued.getTime() + run.policy.standingKeyTtlSeconds * 1000);
  const stamp = (d: Date) => `${d.toISOString().slice(0, 19).replace("T", " ")} UTC`;
  const keyAmount = leg ? formatUsd(Number(leg.amount)) : "—";
  const keyRecipient = leg ? shortAddress(leg.address) : "—";
  const keyRows: [string, string, boolean?][] = [
    ["payee", leg ? `${leg.name} · ${leg.role}` : "—"],
    ["recipient", `${keyRecipient} · locked, 1 address`, true],
    ["authorised amount", `$${keyAmount} pathUSD · exactly this payout`],
    ["lifetime", `${standingKeyTtl} · standing`],
    ["tier", leg ? `${leg.tier} · ${leg.reason}` : "—"],
    ["selector", "transfer"],
    ["issued", stamp(issued)],
    ["expires", stamp(expires)],
  ];

  return (
    <section id="evidence" className="scroll-mt-20 py-20 lg:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Underneath
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl">
            What the chain actually did.
          </h2>
        </Reveal>

        <div className="mt-14 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-8">
          {/* The key, in full */}
          <Reveal className="panel-deep overflow-hidden rounded-panel">
            <div className="border-b border-border/70 px-5 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Access key · one auto leg
              </p>
            </div>
            <dl className="divide-y divide-border/60 px-5 py-2">
              {keyRows.map(([k, v, mono]) => (
                <div key={k as string} className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="shrink-0 text-[11px] text-muted-foreground">{k}</dt>
                  <dd
                    className={`truncate text-right text-[11px] ${mono ? "font-mono" : "tnum"}`}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-border/70 px-5 py-3">
              <p className="font-mono text-[10px] text-muted-foreground">
                authorizeKey(key, expiry: +{standingKeyTtl}, limits: [pathUSD, {keyAmount}])
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                setAllowedCalls(key, [transfer → {keyRecipient}])
              </p>
            </div>
          </Reveal>

          {/* The ledger of what we tried */}
          <Reveal delay={120} className="panel-deep overflow-hidden rounded-panel">
            <div className="flex items-center gap-4 border-b border-border/70 px-5 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Moderato testnet
              </p>
              <span className="ml-auto flex items-center gap-1.5 text-[10px]">
                <StatusDot tone="auto" />
                <span className="tnum">{accepted.length}</span>
                <span className="text-muted-foreground">accepted</span>
              </span>
              <span className="flex items-center gap-1.5 text-[10px]">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span className="tnum">{rejected.length}</span>
                <span className="text-muted-foreground">reverted</span>
              </span>
            </div>
            <ul className="divide-y divide-border/60">
              {shown.map((p) => (
                <li
                  key={p.id}
                  className="group px-5 py-3 transition dur-fast ease-standard hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold ${
                        p.baseline
                          ? "bg-destructive/10 text-destructive"
                          : p.outcome === "accepted"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {p.baseline ? "!" : p.outcome === "accepted" ? "✓" : "✕"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] leading-snug">
                        {p.claim}
                        {p.baseline ? (
                          <span className="ml-2 rounded-pill bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-destructive uppercase">
                            the gap we close
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {p.attempt}
                      </p>
                    </div>
                    <span className="tnum shrink-0 text-[10px] text-muted-foreground">
                      {p.at}
                    </span>
                  </div>
                  {p.tx ? (
                    <a
                      href={explorerTx(p.tx)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 ml-7 inline-block font-mono text-[10px] text-muted-foreground underline decoration-dotted underline-offset-2 transition dur-fast ease-standard group-hover:text-foreground"
                    >
                      {p.outcome === "reverted" ? "reverts leave no hash · constraint: " : ""}
                      {p.txLabel} · {p.tx.slice(0, 14)}…
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
            {setup.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowSetup((v) => !v)}
                className="w-full border-t border-border/70 px-5 py-3 text-left text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {showSetup
                  ? "Hide setup transactions"
                  : `Show the ${setup.length} setup transactions that made these refusals possible`}
              </button>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}