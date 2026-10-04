"use client";

import type { ReactNode } from "react";

import { Reveal, StatusDot, TierChip, Window } from "./primitives";
import {
  exceptionLeg,
  formatUsd,
  run,
  shortAddress,
} from "@/lib/demo";
import { explorerTx, proofs } from "@/lib/evidence";

/**
 * Scene 03 — several surfaces of the product at once.
 *
 * Overlapping panels at different offsets and scales: the desk in the middle,
 * a wallet behind it, a signature sheet in front. Not a row of cards.
 */
/** One satellite in the orbit. Uniform so the ring reads as a single system. */
function Orbit({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`panel-float flex min-h-[10.5rem] flex-col rounded-panel p-4 ${className}`}
    >
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {title}
      </p>
      <div className="mt-2.5 flex-1">{children}</div>
    </div>
  );
}

export function SurfacesScene() {
  const ledger = run.legs.slice(0, 11);
  const settled = ledger.filter((l) => l.tier === "auto");

  // Eight satellites, two per side per row, ringing the ledger.
  const ring = [
    "lg:col-start-1 lg:row-start-1",
    "lg:col-start-3 lg:row-start-1",
    "lg:col-start-1 lg:row-start-2",
    "lg:col-start-3 lg:row-start-2",
    "lg:col-start-1 lg:row-start-3",
    "lg:col-start-3 lg:row-start-3",
    "lg:col-start-1 lg:row-start-4",
    "lg:col-start-3 lg:row-start-4",
  ] as const;

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            One run, nine surfaces
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl">
            Everything a payout touches, around one ledger.
          </h2>
        </Reveal>

        {/*
          The ledger owns the middle column and every row, so it is the centre
          of the composition by construction rather than by margin arithmetic.
          The eight satellites sit in the two orbit columns, one per band, each
          vertically centred in its own band. Overlap is produced by pulling each
          satellite 12px into the gutter, which is less than the gutter itself, so
          nothing can escape the container.

          Nothing here animates: every other scene moves the product, and this one
          holding still is what keeps it from reading as a grid of cards.
        */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-5">
          {/* ---------- centre ---------- */}
          <div className="order-1 sm:col-span-2 lg:order-none lg:col-start-2 lg:col-span-1 lg:row-span-4 lg:row-start-1">
            <Window
              title="flowrail · ledger"
              meta={
                <span className="tnum text-[10px] text-muted-foreground">
                  {run.legs.length} legs
                </span>
              }
              className="shadow-[var(--shadow-deep)]"
            >
              <div className="flex items-center gap-6 border-b border-border/70 px-5 py-3">
                <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Settling
                </span>
                <span className="h-3 w-px bg-border" aria-hidden="true" />
                <span className="tnum text-[11px]">
                  {settled.length} of {ledger.length} shown
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <StatusDot tone="auto" />
                  sequential, one receipt each
                </span>
              </div>
              <div className="divide-y divide-border/60">
                {ledger.map((leg) => (
                  <div
                    key={leg.payeeId}
                    className="flex items-center gap-3 px-5 py-2.5 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <StatusDot tone={leg.tier === "finance" ? "finance" : "auto"} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                      {leg.name}
                    </span>
                    <span className="hidden font-mono text-[10px] text-muted-foreground lg:block">
                      {shortAddress(leg.address)}
                    </span>
                    <span className="tnum w-20 shrink-0 text-right text-[12px]">
                      ${formatUsd(Number(leg.amount))}
                    </span>
                    <TierChip tier={leg.tier} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 border-t border-border/70 px-5 py-3 text-[11px] text-muted-foreground">
                <span className="flex-1">no atomic batch on Moderato</span>
                <span className="tnum">+{run.legs.length - ledger.length} more</span>
              </div>
            </Window>
          </div>

          {/* ---------- orbit: left, row 1 ---------- */}
          <Orbit title="Wallet" className={`order-2 self-center ${ring[0]}`}>
            <p className="text-[12px] leading-relaxed">
              The agency key stays in the wallet. It signs nothing.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-[9px] bg-card/70 px-2.5 py-2">
              <StatusDot tone="auto" />
              <span className="font-mono text-[10px]">0x4A19…9C2E</span>
              <span className="ml-auto text-[9px] text-muted-foreground">watch</span>
            </div>
          </Orbit>

          {/* ---------- orbit: right, row 1 ---------- */}
          <Orbit title="Signature" className={`order-3 self-center ${ring[1]}`}>
            {exceptionLeg ? (
              <>
                <p className="text-[12px] leading-relaxed">
                  One approval. This line only, then it is spent.
                </p>
                <div className="mt-3 rounded-[9px] bg-card/70 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-medium">
                      {exceptionLeg.name}
                    </p>
                    <TierChip tier="finance" />
                  </div>
                  <p className="tnum mt-0.5 text-[12px] text-amber-600 dark:text-amber-400">
                    ${formatUsd(Number(exceptionLeg.amount))}
                  </p>
                </div>
              </>
            ) : null}
          </Orbit>

          {/* ---------- orbit: left, row 2 ---------- */}
          <Orbit title="Roster" className={`order-4 self-center ${ring[2]}`}>
            <p className="text-[12px] leading-relaxed">
              An address becomes a person, and a person becomes a tenure.
            </p>
            <dl className="mt-3 space-y-1.5">
              {run.legs.slice(0, 3).map((leg) => (
                <div key={leg.payeeId} className="flex justify-between gap-3 text-[10px]">
                  <dt className="min-w-0 truncate text-muted-foreground">
                    {leg.name}
                  </dt>
                  <dd className="tnum shrink-0">{leg.stableForDays}d</dd>
                </div>
              ))}
            </dl>
          </Orbit>

          {/* ---------- orbit: right, row 2 ---------- */}
          <Orbit title="Receipt" className={`order-5 self-center ${ring[3]}`}>
            <p className="tnum font-serif text-2xl">
              ${formatUsd(Number(run.legs[0].amount))}
            </p>
            <a
              href={explorerTx(proofs[3].tx ?? "")}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 block truncate font-mono text-[10px] text-muted-foreground underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-foreground"
            >
              {proofs[3].tx?.slice(0, 16)}…
            </a>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              {proofs[3].detail}
            </p>
          </Orbit>

          {/* ---------- orbit: left, row 3 ---------- */}
          <Orbit title="Policy" className={`order-6 self-center ${ring[4]}`}>
            <p className="text-[12px] leading-relaxed">
              Two questions per line. Both must pass.
            </p>
            <dl className="mt-3 space-y-1.5">
              {[
                ["auto cap", "$500"],
                ["address tenure", "7 days"],
                ["one-time key", "12 h"],
                ["standing key", "7 d"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[10px]">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tnum">{v}</dd>
                </div>
              ))}
            </dl>
          </Orbit>

          {/* ---------- orbit: right, row 3 ---------- */}
          <Orbit title="Chain" className={`order-7 self-center ${ring[5]}`}>
            <p className="text-[12px] leading-relaxed">
              Three constraints the chain enforces without asking us.
            </p>
            <ul className="mt-3 space-y-1.5">
              {[
                ["recipient", "InvalidCallScope"],
                ["amount", "hard ceiling"],
                ["expiry", "chain-enforced"],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3 text-[10px]">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="truncate font-mono">{v}</span>
                </li>
              ))}
            </ul>
          </Orbit>

          {/* ---------- orbit: left, row 4 ---------- */}
          <Orbit title="Audit" className={`order-8 self-center ${ring[6]}`}>
            <p className="text-[12px] leading-relaxed">
              Every decision is appended, including the ones we refused.
            </p>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
              classify → {run.legs.length} legs
              <br />
              approve → 1 signature
              <br />
              settle → 1 receipt / leg
            </p>
          </Orbit>

          {/* ---------- orbit: right, row 4 ---------- */}
          <Orbit title="Reconcile" className={`order-9 self-center ${ring[7]}`}>
            <p className="text-[12px] leading-relaxed">
              What we will not guess. An unmatched memo is surfaced, not paid.
            </p>
            <div className="mt-3 rounded-[9px] bg-card/70 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <StatusDot tone="idle" />
                <span className="font-mono text-[10px]">
                  {run.unresolved[0]?.payeeId ?? "none"}
                </span>
              </div>
              <p className="tnum mt-1 text-[11px] text-muted-foreground">
                ${formatUsd(
                  run.unresolved.reduce((n, u) => n + Number(u.amount), 0),
                )}{" "}
                unmatched
              </p>
            </div>
          </Orbit>
        </div>
      </div>
    </section>
  );
}

/**
 * Scene 04 — zoom all the way in.
 *
 * Small type, real hashes, real chain errors. This is the detail that makes an
 * interface read as software somebody actually operates.
 */
export function InspectorScene() {
  const accepted = proofs.filter((p) => p.outcome === "accepted");
  const rejected = proofs.filter((p) => p.outcome === "reverted");

  return (
    <section id="evidence" className="scroll-mt-20 py-24 lg:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Underneath
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl">
            What the chain actually did.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-8">
          {/* The key, in full */}
          <Reveal className="panel-deep overflow-hidden rounded-panel">
            <div className="border-b border-border/70 px-5 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Access key · one auto leg
              </p>
            </div>
            <dl className="divide-y divide-border/60 px-5 py-2">
              {[
                ["address", "0x7c41…e90b", true],
                ["payee", "Nia Okonjo · Editor"],
                ["authorised amount", "$500.00 pathUSD"],
                ["lifetime", "12 h · one-time"],
                ["recipient", "locked · 1 address"],
                ["selector", "transfer"],
                ["issued", "2026-10-01 09:14:22 UTC"],
                ["expires", "2026-10-01 21:14:22 UTC"],
                ["spendable now", "$0.00 · not yet settled"],
              ].map(([k, v, mono]) => (
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
                authorizeKey(addr, ONE_TIME, 500e6, true, [])
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                setAllowedCalls([transfer → 0x7c41…e90b])
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
                <span className="text-muted-foreground">held</span>
              </span>
              <span className="flex items-center gap-1.5 text-[10px]">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span className="tnum">{rejected.length}</span>
                <span className="text-muted-foreground">refused</span>
              </span>
            </div>
            <ul className="divide-y divide-border/60">
              {[...accepted, ...rejected].map((p) => (
                <li
                  key={p.id}
                  className="group px-5 py-3 transition dur-fast ease-standard hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold ${
                        p.outcome === "accepted"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {p.outcome === "accepted" ? "✓" : "!"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] leading-snug">{p.claim}</p>
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
                      {p.txLabel} · {p.tx.slice(0, 14)}…
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}