"use client";

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
export function SurfacesScene() {
  const ledger = run.legs.slice(0, 7);
  const settled = ledger.filter((l) => l.tier === "auto");

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            One run, four surfaces
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl">
            The queue, the wallet, the signature, the receipt.
          </h2>
        </Reveal>

        {/*
          The ledger is the centre of the composition and the only element that
          spans it. The four surfaces sit in the orbit columns at the corners,
          nudged against the ledger's edges so they overlap its corners without
          escaping the container. Nothing here animates: this is a still life,
          and the stillness is what separates it from the scenes around it.
        */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-[minmax(0,12.5rem)_minmax(0,1fr)_minmax(0,12.5rem)] lg:gap-x-5 lg:gap-y-8">
          {/* ---- centre ---- */}
          <div className="order-1 sm:col-span-2 lg:order-none lg:col-start-2 lg:col-span-1 lg:row-span-3 lg:row-start-1">
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
                  {settled.length} of {ledger.length}
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <StatusDot tone="auto" />
                  sequential
                </span>
              </div>
              <div className="divide-y divide-border/60">
                {ledger.map((leg) => (
                  <div
                    key={leg.payeeId}
                    className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <StatusDot tone={leg.tier === "finance" ? "finance" : "auto"} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                      {leg.name}
                    </span>
                    <span className="hidden font-mono text-[10px] text-muted-foreground md:block">
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
                <span className="flex-1">one receipt per leg</span>
                <span className="tnum">
                  +{run.legs.length - ledger.length} more
                </span>
              </div>
            </Window>
          </div>

          {/* ---- orbit: top left ---- */}
          <div className="panel-float self-start rounded-panel p-4 lg:order-none lg:col-start-1 lg:row-start-1 lg:z-10 lg:mt-6 lg:-mr-2">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Wallet
            </p>
            <p className="mt-2 text-[12px] leading-relaxed">
              The agency key stays here. It signs nothing.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-[9px] bg-card/70 px-2.5 py-2">
              <StatusDot tone="auto" />
              <span className="font-mono text-[10px]">0x4A19…9C2E</span>
            </div>
          </div>

          {/* ---- orbit: top right ---- */}
          <div className="panel-float self-start rounded-panel p-4 lg:order-none lg:col-start-3 lg:row-start-1 lg:z-10 lg:mt-14 lg:-ml-2">
            {exceptionLeg ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Signature
                  </p>
                  <TierChip tier="finance" />
                </div>
                <p className="mt-2.5 text-[12px] leading-relaxed">
                  One approval. This line only.
                </p>
                <div className="mt-3 rounded-[9px] bg-card/70 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground">Awaiting</p>
                  <p className="mt-0.5 truncate text-[12px] font-medium">
                    {exceptionLeg.name}
                  </p>
                  <p className="tnum text-[12px] text-amber-600 dark:text-amber-400">
                    ${formatUsd(Number(exceptionLeg.amount))}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* ---- orbit: bottom left ---- */}
          <div className="panel-float self-start rounded-panel p-4 lg:order-none lg:col-start-1 lg:row-start-3 lg:z-10 lg:mb-6 lg:-mr-2">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Receipt
            </p>
            <p className="tnum mt-2 font-serif text-2xl">
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
          </div>

          {/* ---- orbit: bottom right ---- */}
          <div className="panel-float self-start rounded-panel p-4 lg:order-none lg:col-start-3 lg:row-start-3 lg:z-10 lg:mb-12 lg:-ml-2">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Policy
            </p>
            <dl className="mt-2 space-y-1.5">
              {[
                ["auto cap", "$500"],
                ["auto window", "7 days"],
                ["one-time key", "12 h"],
                ["standing key", "7 d"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[10px]">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tnum">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
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