import { ThemeToggle } from "@/components/theme-toggle";
import { buttonStyles } from "@/components/ui/button";
import { DotGrid } from "@/components/landing/dotgrid";
import { RunQueue } from "@/components/landing/queue";
import { ScopeCard } from "@/components/landing/scopecard";
import { Faq } from "@/components/landing/faq";
import {
  autoLegs,
  autoTotal,
  exceptionLeg,
  exceptionTotal,
  roles,
  run,
  runTotal,
} from "@/lib/demo";
import { explorerTx, proofs } from "@/lib/evidence";

const TRUTHS = [
  {
    title: "The root key never leaves your device",
    body: "It is a domain-bound passkey or a Tempo Wallet. FlowRail cannot sign as you outside a grant you made.",
  },
  {
    title: "A compromised server cannot widen itself",
    body: "Key management is root-only. An attacker who takes our servers can spend what you already authorised — not mint a key, redirect one, raise a cap, or extend an expiry.",
  },
  {
    title: "Expiry is the containment",
    body: "One-time keys live 12 hours, standing keys 7 days. A changed address never rides an existing key.",
  },
  {
    title: "You revoke, not us",
    body: "Revocation is one tap in your wallet against your own root. We hold no admin key, so we cannot keep your access alive.",
  },
];

const PROTOCOL = [
  ["Network", "Moderato testnet · chain 42431"],
  ["Settlement asset", "pathUSD · 6 decimals"],
  ["Authorisation", "authorizeKey(address, uint8, uint64, bool, (address,uint256)[])"],
  ["Recipient lock", "setAllowedCalls, a separate transaction"],
  ["Caps", "Absolute per token, lifetime total"],
  ["Period budgets", "Not deployed on Moderato"],
  ["Atomic batch", "wallet_sendCalls is not exposed"],
  ["Admin keys", "Never used"],
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-3.5 sm:px-8">
          <a href="#top" className="text-[15px] font-semibold tracking-tight">
            FlowRail
          </a>
          <nav className="ml-auto hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="/app" className="transition-colors hover:text-foreground">Desk</a>
            <a href="#queue" className="transition-colors hover:text-foreground">A run</a>
            <a href="#keys" className="transition-colors hover:text-foreground">The keys</a>
            <a href="#evidence" className="transition-colors hover:text-foreground">Evidence</a>
            <a href="#questions" className="transition-colors hover:text-foreground">Questions</a>
          </nav>
          <div className="ml-auto md:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="top">
        {/* 01 — centred hero, product immediately visible */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 sm:px-8 md:pt-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Live on Moderato testnet
            </div>
            <h1 className="mt-7 font-serif text-5xl leading-[1.04] tracking-[-0.03em] text-balance sm:text-6xl md:text-7xl">
              Forty payees. One signature.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Payout operations for businesses on Tempo. Your rules decide every
              line before you see anything.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="/app" className={buttonStyles({ size: "lg" })}>
                Try the desk
              </a>
              <a href="#queue" className={buttonStyles({ variant: "outline", size: "lg" })}>
                See a real run
              </a>
            </div>
          </div>

          <div className="mt-14 md:mt-16">
            <DotGrid />
          </div>
        </section>

        {/* 02 — the problem, as a comparison rather than three paragraphs */}
        <section className="border-t border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:px-8 md:grid-cols-[22rem_1fr] md:gap-16 md:py-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                The problem
              </p>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
                One deposit. Forty addresses. No reversals.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                The money arrives as a single payment. Settlement is forty separate
                sends, and there is no chargeback on any of them. The cost is not
                settlement — it is deciding which of the forty deserve a human.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-border bg-card p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Without rules
                </p>
                <p className="mt-4 font-serif text-4xl tracking-tight tabular-nums">
                  40
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  sends to review, every run
                </p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <li>39 routine lines, re-approved monthly</li>
                  <li>One transposed character, unrecoverable</li>
                  <li>Nothing distinguishes routine from new</li>
                </ul>
              </div>
              <div className="rounded-card border border-primary/40 bg-card p-6 ring-1 ring-primary/20">
                <p className="text-xs uppercase tracking-[0.14em] text-primary">
                  With FlowRail
                </p>
                <p className="mt-4 font-serif text-4xl tracking-tight tabular-nums">
                  1
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  decision that actually needs you
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  <li>
                    <span className="tabular-nums">{autoLegs.length}</span> standing payees,
                    settled on a key you already granted
                  </li>
                  <li>
                    <span className="tabular-nums">{run.unresolved.length}</span> unmatched
                    line held for a human, never dropped
                  </li>
                  <li>Every key capped, expiring, locked to one recipient</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 03 — full-width product: the queue itself */}
        <section id="queue" className="border-t border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  A run
                </p>
                <h2 className="mt-4 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
                  This is the actual output of the policy engine.
                </h2>
              </div>
              <dl className="flex gap-8 text-sm">
                {Object.entries(roles).map(([role, count]) => (
                  <div key={role}>
                    <dt className="text-muted-foreground">{role}s</dt>
                    <dd className="mt-0.5 font-serif text-2xl tracking-tight tabular-nums">
                      {count}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10">
              <RunQueue />
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Generated by <code>classifyRun</code>, not written by hand. Regenerate
              it with <code>npm run demo:export</code> and every number on this page
              changes with the policy — including the guard that fails if the roster
              stops producing{" "}
              <span className="tabular-nums">{run.counts.auto}</span> automatic and{" "}
              <span className="tabular-nums">{run.counts.finance}</span> escalated.
            </p>
          </div>
        </section>

        {/* 04 — split: the one rule, and the one line it caught */}
        <section className="border-t border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:px-8 md:grid-cols-2 md:gap-16 md:py-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                The rule
              </p>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
                A big payment to a known address is a size question, not a trust
                question.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {exceptionLeg?.name} has paid us for {exceptionLeg?.stableForDays} days.
                Her address is not the risk. The amount is. So she goes to finance —
                never to the new-payee tier, which exists for destinations we have
                not vouched for at all.
              </p>
              <dl className="mt-8 divide-y divide-border border-y border-border">
                {[
                  ["Standing payee, 7+ days", "Settles on a key you already granted"],
                  ["Amount over $500", "One scoped key, that amount, that address"],
                  ["New or changed address", "A fresh approval, every time"],
                ].map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                    <dt className="text-sm font-medium">{k}</dt>
                    <dd className="text-sm text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-card border border-primary/40 bg-card p-6 ring-1 ring-primary/20">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-xl">{exceptionLeg?.name}</h3>
                  <span className="rounded-pill bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    finance
                  </span>
                </div>
                <p className="mt-5 font-serif text-4xl tracking-tight tabular-nums">
                  {exceptionTotal}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">pathUSD</p>
                <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
                  {exceptionLeg?.reason}
                </p>
                <div className="mt-5 grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Key lifetime</span>
                    <span className="tabular-nums">12 hours</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="tabular-nums">locked to her address</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">You sign</span>
                    <span>this line only</span>
                  </div>
                </div>
              </div>
              <div className="rounded-card border border-border bg-card p-6">
                <p className="text-sm font-medium">The rest of the run</p>
                <div className="mt-3 flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <span className="tabular-nums">{autoLegs.length}</span> standing payees
                  </span>
                  <span className="tabular-nums">{autoTotal} pathUSD</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  No new signature. Keys authorised once, capped per payee, expiring
                  in 7 days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 05 — asymmetric: interactive scope proof */}
        <section id="keys" className="border-t border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:px-8 md:grid-cols-[1fr_26rem] md:items-start md:gap-16 md:py-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                The keys
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl tracking-tight text-balance sm:text-4xl">
                We hold the key. You hold the limits.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                FlowRail cannot widen a grant. Moderato&rsquo;s authorisation takes no
                scopes at all, so locking the recipient is a second transaction — and
                until it lands, a key is unrestricted. That is not a footnote in our
                architecture. It is the first thing we tested.
              </p>

              <div className="mt-10 divide-y divide-border border-y border-border">
                {TRUTHS.map((item) => (
                  <div key={item.title} className="grid gap-1 py-4 sm:grid-cols-[18rem_1fr] sm:gap-6">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <ScopeCard />
          </div>
        </section>

        {/* 06 — evidence, full width, real hashes */}
        <section id="evidence" className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Evidence
              </p>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
                We tested the claims instead of asserting them.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Each row is something we ran on Moderato. The last two are failures,
                and they are here because they changed the product.
              </p>
            </div>

            <ol className="mt-10 divide-y divide-border border-y border-border">
              {proofs.map((proof) => (
                <li
                  key={proof.id}
                  className="grid gap-x-8 gap-y-2 py-5 md:grid-cols-[15rem_1fr_auto] md:items-baseline"
                >
                  <div>
                    <h3 className="text-sm font-medium tracking-tight">{proof.claim}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{proof.attempt}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground md:max-w-xl">
                    {proof.detail}
                  </p>
                  <div className="md:text-right">
                    <span
                      className={
                        proof.outcome === "accepted"
                          ? "text-sm font-medium text-primary"
                          : "text-sm font-medium text-destructive"
                      }
                    >
                      {proof.outcome === "accepted" ? "Accepted" : "Reverted"}
                    </span>
                    {proof.tx ? (
                      <a
                        href={explorerTx(proof.tx)}
                        className="mt-1 block text-xs text-muted-foreground tabular-nums underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {proof.tx.slice(0, 10)}…{proof.tx.slice(-4)}
                        <span className="sr-only"> — {proof.txLabel}</span>
                      </a>
                    ) : (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        no transaction produced
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 07 — technical reference */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:px-8 md:grid-cols-[20rem_1fr] md:gap-16 md:py-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Under the hood
              </p>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
                The rail does the enforcing, so we do not have to.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Caps, recipient locks and expiry are protocol-level. We are not asking
                you to trust a contract we wrote.
              </p>
            </div>
            <dl className="divide-y divide-border border-y border-border">
              {PROTOCOL.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-sm font-medium">{k}</dt>
                  <dd className="text-sm text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 08 — the parts we will not claim */}
        <section id="questions" className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Questions
              </p>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-balance sm:text-4xl">
                The parts we will not claim.
              </h2>
            </div>
            <div className="mt-10">
              <Faq />
            </div>
          </div>
        </section>

        {/* 09 — final CTA */}
        <section className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 sm:px-8 md:flex-row md:items-end md:justify-between md:py-28">
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl tracking-tight text-balance sm:text-5xl">
                Set it once. Then get paid.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Run {run.id} classified{" "}
                <span className="tabular-nums text-foreground">{runTotal} pathUSD</span>{" "}
                across <span className="tabular-nums text-foreground">{run.legs.length}</span>{" "}
                payees and asked you for one signature. Open the desk and run it
                yourself against Moderato.
              </p>
            </div>
            <a
              href="/app"
              className={buttonStyles({ size: "lg", className: "shrink-0" })}
            >
              Open the desk
            </a>
          </div>
        </section>

        <p className="mx-auto w-full max-w-6xl px-6 pb-14 text-sm text-muted-foreground sm:px-8">
          Moderato testnet · chain 42431 · settled in pathUSD · no production funds
        </p>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm font-medium">FlowRail</p>
          <p className="text-sm text-muted-foreground">
            Testnet software. No production funds, no real payouts.
          </p>
        </div>
      </footer>
    </>
  );
}