"use client";

import type { ReactNode } from "react";

import { Reveal, StatusDot } from "./primitives";
import {
  ARCHITECTURE_URL,
  autoCapUsd,
  autoCount,
  DEMO_VIDEO_URL,
  featuredAutoLeg,
  financeCount,
  formatUsd,
  legCount,
  PITCH_DECK_URL,
  REPO_URL,
  run,
  shortAddress,
  standingKeyTtl,
} from "@/lib/demo";
import { proofs } from "@/lib/evidence";

const kicker =
  "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";
const heading =
  "font-serif text-4xl leading-[1.04] tracking-[-0.01em] text-balance sm:text-5xl";

function ValueCard({
  title,
  body,
  delay,
  children,
}: {
  title: string;
  body: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} className="panel-raised flex flex-col rounded-panel p-6">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
      <div className="surface-sunken mt-6 flex min-h-[7.5rem] flex-1 items-center justify-center rounded-row p-4">
        {children}
      </div>
    </Reveal>
  );
}

/** What FlowRail does, in three sentences a non-crypto reader can follow. */
export function ValueScene() {
  return (
    <section id="product" className="scroll-mt-20 py-20 lg:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <p className={kicker}>What you get</p>
          <h2 className={`mt-4 ${heading}`}>
            Pay everyone fast, without handing anyone the keys.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <ValueCard
            delay={0}
            title="Approve the run once"
            body={`Bring a month of invoices. Two rules you set sort every line; you only sign the ones that break them.`}
          >
            <div className="grid grid-cols-10 gap-1.5" aria-label={`${autoCount} routine, ${financeCount} held`}>
              {run.legs.map((leg) => (
                <span
                  key={leg.payeeId}
                  className={`size-2.5 rounded-full ${
                    leg.tier === "auto" ? "bg-emerald-500/70" : "bg-amber-500"
                  }`}
                />
              ))}
            </div>
          </ValueCard>

          <ValueCard
            delay={100}
            title="Each key pays one person"
            body={`Every payee gets their own key: capped at their exact amount, locked to their address, gone in ${standingKeyTtl}.`}
          >
            {featuredAutoLeg ? (
              <dl className="w-full max-w-[15rem] divide-y divide-border/60 text-[11px]">
                {[
                  ["payee", featuredAutoLeg.name],
                  ["can send", `$${formatUsd(Number(featuredAutoLeg.amount))}`],
                  ["only to", shortAddress(featuredAutoLeg.address)],
                  ["expires", standingKeyTtl],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-1">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="tnum font-mono">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </ValueCard>

          <ValueCard
            delay={200}
            title="Tempo enforces it"
            body="The cap, the recipient and the expiry live on-chain. A key that tries to overpay or pay someone else is reverted by Tempo, not by our code."
          >
            <div className="flex flex-col items-center gap-2 font-mono text-[11px]">
              <span className="rounded-pill bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-400">
                transfer → own payee · ok
              </span>
              <span className="rounded-pill bg-amber-500/12 px-3 py-1 text-amber-700 dark:text-amber-400">
                transfer → anyone else · reverted
              </span>
            </div>
          </ValueCard>
        </div>
      </div>
    </section>
  );
}

/** Three numbers, each from the run or the evidence, nothing else. */
export function StatsScene() {
  const reverted = proofs.filter((p) => p.outcome === "reverted").length;
  const stats = [
    {
      v: `${autoCount} of ${legCount}`,
      k: "paid with no one in the loop",
      note: `every line at or under $${autoCapUsd} to a known address`,
    },
    {
      v: `${financeCount}`,
      k: financeCount === 1 ? "signature for the whole run" : "signatures for the whole run",
      note: "only the line that broke a rule waited for a person",
    },
    {
      v: `${reverted}`,
      k: "unsafe calls Tempo refused",
      note: "each one run and recorded on Moderato testnet",
    },
  ];
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <p className={kicker}>Built on Tempo</p>
          <h2 className={`mt-4 ${heading}`}>Rules that hold even if FlowRail doesn&apos;t.</h2>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.k} delay={i * 100} className="border-t border-border pt-6">
              <p className="tnum font-serif text-[clamp(2.75rem,5vw,4rem)] leading-none">{s.v}</p>
              <p className="mt-3 text-[15px] font-medium">{s.k}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuoteBand() {
  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center px-5 py-24 text-center sm:px-8 lg:py-32">
        <p className="max-w-3xl font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.06] tracking-[-0.01em] text-balance">
          &ldquo;Slow, or exposed — agencies have lived with those two. FlowRail, on
          Tempo, is the third.&rdquo;
        </p>
        <p className="mt-6 text-[13px] opacity-60">Why FlowRail exists, in one line</p>
      </div>
    </section>
  );
}

function CtaCard({
  label,
  title,
  body,
  children,
}: {
  label: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <Reveal className="panel-raised flex flex-col rounded-panel p-7 sm:p-8">
      <p className={kicker}>{label}</p>
      <h3 className="mt-5 font-serif text-3xl leading-tight">{title}</h3>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div>
    </Reveal>
  );
}

const linkPill =
  "inline-flex h-11 items-center rounded-pill border border-border px-5 text-sm font-medium transition dur-fast ease-standard hover:bg-muted/50";

/** Where a reader goes next: use it, or check it. */
export function CtaScene() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className={kicker}>Start here</p>
          <h2 className={`mt-4 ${heading}`}>Bring a month of payouts. Leave with one decision.</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <CtaCard
            label="Demo"
            title="Run the desk yourself"
            body={`Load run ${run.id}, watch ${legCount} lines sort themselves, and sign the one that needs you. Every payout links to its testnet receipt.`}
          >
            <a
              href="/app"
              className="inline-flex h-11 items-center gap-2 rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-raised)] transition dur-fast ease-standard hover:bg-primary-strong active:scale-[0.98]"
            >
              Open the desk <span aria-hidden="true">→</span>
            </a>
            <a href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer" className={linkPill}>
              Watch the demo
            </a>
          </CtaCard>
          <CtaCard
            label="Code"
            title="Read how it's built"
            body="The policy engine, the key lifecycle, and every claim on this page traced to a transaction on Moderato."
          >
            <a href={ARCHITECTURE_URL} target="_blank" rel="noreferrer" className={linkPill}>
              Architecture
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={linkPill}>
              GitHub
            </a>
            <a href={PITCH_DECK_URL} target="_blank" rel="noreferrer" className={linkPill}>
              Pitch deck
            </a>
          </CtaCard>
        </div>
      </div>
    </section>
  );
}

const footerCols: { title: string; links: [string, string][] }[] = [
  {
    title: "Product",
    links: [
      ["Open the desk", "/app"],
      ["What you get", "#product"],
      ["How it decides", "#mechanism"],
      ["Evidence", "#evidence"],
    ],
  },
  {
    title: "Proof",
    links: [
      ["GitHub", REPO_URL],
      ["Architecture", ARCHITECTURE_URL],
      ["Demo video", DEMO_VIDEO_URL],
      ["Pitch deck", PITCH_DECK_URL],
    ],
  },
  {
    title: "Tempo",
    links: [
      ["tempo.xyz", "https://tempo.xyz/"],
      ["Explorer", "https://explore.testnet.tempo.xyz/"],
      ["Docs", "https://docs.tempo.xyz/"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-5 py-14 sm:grid-cols-[1.4fr_repeat(3,1fr)] sm:px-8">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">FlowRail</p>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-muted-foreground">
            <StatusDot tone="auto" />
            Payout operations on Tempo
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <p className="text-[13px] font-medium">{col.title}</p>
            <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
              {col.links.map(([label, href]) => {
                const external = href.startsWith("http");
                return (
                  <li key={label}>
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[1500px] border-t border-border/60 px-5 py-5 text-[12px] text-muted-foreground sm:px-8">
        Moderato testnet · chain 42431 · pathUSD · testnet software, no production funds
      </div>
    </footer>
  );
}
