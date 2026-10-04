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
  const ledger = run.legs.slice(0, 4);

  return (
    <section className="relative overflow-x-clip py-24 lg:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            One run, four surfaces
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl">
            The queue, the wallet, the signature, the receipt.
          </h2>
        </Reveal>

        {/* The composition. Overlaps are negative margins, not a grid of cards. */}
        <div className="relative mt-16 lg:mt-20">
          {/* Behind: custody */}
          <div className="panel-float relative z-0 w-full rounded-panel p-4 opacity-100 lg:absolute lg:-left-6 lg:top-10 lg:z-10 lg:w-[15rem]">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Custody
            </p>
            <p className="mt-2 text-[12px] leading-relaxed">
              The agency key stays in the wallet. It signs nothing here.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-[9px] bg-card/70 px-2.5 py-2">
              <StatusDot tone="auto" />
              <span className="font-mono text-[10px]">0x4A19…9C2E</span>
              <span className="ml-auto text-[9px] text-muted-foreground">
                watch
              </span>
            </div>
          </div>

          {/* Centre stage: the ledger */}
          <div className="relative z-20 lg:ml-[8rem]">
            <Window
              title="flowrail · ledger"
              meta={
                <span className="tnum text-[10px] text-muted-foreground">
                  {run.legs.length} legs
                </span>
              }
              className="shadow-[var(--shadow-deep)]"
            >
              <div className="divide-y divide-border/60">
                {ledger.map((leg, i) => (
                  <div
                    key={leg.payeeId}
                    className="animate-cell-in flex items-center gap-3 px-4 py-3 transition dur-standard ease-standard hover:bg-muted/40 sm:px-5"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <StatusDot tone={leg.tier === "finance" ? "finance" : "auto"} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                      {leg.name}
                    </span>
                    <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
                      {shortAddress(leg.address)}
                    </span>
                    <span className="tnum w-20 shrink-0 text-right text-[12px]">
                      ${formatUsd(Number(leg.amount))}
                    </span>
                    <TierChip tier={leg.tier} />
                  </div>
                ))}
                <div className="flex items-center gap-3 px-4 py-3 text-[11px] text-muted-foreground sm:px-5">
                  <span className="flex-1">settled sequentially, one receipt each</span>
                  <span className="tnum">+{run.legs.length - 4} more</span>
                </div>
              </div>
            </Window>
          </div>

          {/* In front: the one signature */}
          {exceptionLeg ? (
            <div className="panel-float relative z-30 mt-5 w-full rounded-panel p-4 lg:absolute lg:-right-4 lg:bottom-24 lg:mt-0 lg:w-[17.5rem]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Signature
                </p>
                <TierChip tier="finance" />
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed">
                One approval unlocks this line only. It cannot be reused.
              </p>
              <div className="mt-3 rounded-[9px] bg-card/70 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Awaiting</p>
                <p className="mt-0.5 text-[12px] font-medium">
                  {exceptionLeg.name} ·{" "}
                  <span className="tnum">
                    ${formatUsd(Number(exceptionLeg.amount))}
                  </span>
                </p>
              </div>
            </div>
          ) : null}

          {/* Foreground: the receipt */}
          <div className="panel-float relative z-30 mt-5 w-full rounded-panel p-4 lg:absolute lg:-left-2 lg:-bottom-16 lg:mt-0 lg:w-[16rem]">
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
              className="mt-2 block truncate font-mono text-[10px] text-muted-foreground underline decoration-dotted underline-offset-2 transition dur-fast ease-standard hover:text-foreground"
            >
              {proofs[3].tx?.slice(0, 18)}…
            </a>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              {proofs[3].detail}
            </p>
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
                Access key · auto · leg 0041
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