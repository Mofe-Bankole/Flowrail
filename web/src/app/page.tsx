import { ThemeToggle } from "@/components/theme-toggle";

const PIPELINE = [
  {
    step: "01",
    title: "Client payment lands",
    body: "Funds arrive against a FlowRail virtual address carrying a run memo, so the deposit self-identifies which payroll batch it funds.",
  },
  {
    step: "02",
    title: "Reconcile to the batch",
    body: "The memo maps the deposit to a specific run. No spreadsheet, no matching by amount, no guessing which client paid for which month.",
  },
  {
    step: "03",
    title: "Policy decides each line",
    body: "Every recipient is checked against standing rules: is this payee known, is it inside the period budget, is the address unchanged. Each line resolves to auto, finance, or dual.",
  },
  {
    step: "04",
    title: "You sign once",
    body: "Approve the run summary and sign a single authorization covering the whole batch. One signature per run, not one per payee.",
  },
  {
    step: "05",
    title: "Batched on Tempo",
    body: "Approved lines settle in one atomic transfer batch on a stablecoin rail, with per-transfer memos your finance team can reconcile line by line.",
  },
];

const PROBLEMS = [
  {
    title: "One deposit, fifty-five transfers",
    body: "A mid-size agency run is 40 creators, 12 vendors, and 3 subcontractors. The money arrives as one payment. The settlement is 55 separate sends.",
  },
  {
    title: "Every send is a chance to be wrong",
    body: "One transposed character in an address sends a month's payout to nobody. There is no chargeback, no recall, and no support line that can reverse it.",
  },
  {
    title: "Approval is the bottleneck, not settlement",
    body: "Most runs are routine. The real cost is routing every routine line back to a human because there is no system that can tell routine from not.",
  },
];

const SECURITY = [
  {
    title: "The root key is yours",
    body: "It is created on your device as a domain-bound passkey, or held in a Tempo Wallet. FlowRail never receives it and cannot sign as you outside the scopes you explicitly granted.",
  },
  {
    title: "We hold scopes, not permissions",
    body: "Any key FlowRail holds is bounded by three things you chose: which recipients, how much, and until when. A standing key pays a fixed set of addresses under a period budget. A one-time key pays one amount to one address and then expires.",
  },
  {
    title: "A compromised server cannot widen its own reach",
    body: "Key management is root-only. If our servers are fully taken over, the attacker can spend what you already authorized — not mint a new key, redirect it, raise a limit, or extend an expiry.",
  },
  {
    title: "Expiry is the real containment",
    body: "One-time keys are short-lived by design, so an unused authorization closes itself. Standing keys carry a stability period before they can act on a changed address.",
  },
  {
    title: "You revoke, not us",
    body: "Revocation is a single tap in your wallet against your own root. We deliberately hold no admin key, so we cannot be compelled to keep your access alive.",
  },
];

const TIERS = [
  {
    name: "Auto",
    trigger: "Known payee, stable address, inside period budget",
    needs: "No signature",
    detail:
      "A standing key you authorized once covers this line. It is the point of the standing key — routine pay does not become routine clicks.",
    accent: false,
  },
  {
    name: "Finance",
    trigger: "New payee, or $500–$2,000",
    needs: "One-time signature",
    detail:
      "A single scoped authorization for that exact amount to that exact address, expiring within hours. Signature covers the line, not the run.",
    accent: true,
  },
  {
    name: "Dual",
    trigger: "Above $2,000, or any address change",
    needs: "Two signatures",
    detail:
      "Address changes are the highest-risk event in a payout run, so they never ride on an existing key. Two people, two keys, one run.",
    accent: false,
  },
];

const TEMPO = [
  {
    title: "Stable transfers, not volatile ones",
    body: "Payroll denominated in a volatile asset is a payroll problem twice. Tempo's stable transfers keep the settlement value predictable.",
  },
  {
    title: "Memo on every transfer",
    body: "Memo-tagged transfers mean each payout carries its own reference on-chain, so reconciliation is a query instead of an investigation.",
  },
  {
    title: "Scoped keys are protocol-level",
    body: "Recipient allowlists, spending limits, and periodic budgets are enforced by Tempo, not by a contract we wrote and hope is correct.",
  },
  {
    title: "Built for passkeys",
    body: "An account precompile means the root of trust can be a passkey on your device rather than a seed phrase on a server.",
  },
];

const ROADMAP = [
  {
    status: "Now",
    title: "Protocol spike",
    body: "Prove scoped keys, periodic limits, and revocation actually hold on Moderato testnet before building any control plane on top of them.",
    active: true,
  },
  {
    status: "Next",
    title: "Run engine",
    body: "Virtual-address reconciliation, policy evaluation across the three tiers, and batched transfers on Tempo.",
    active: false,
  },
  {
    status: "Later",
    title: "Control plane",
    body: "Agency dashboard, approval queue, audit trail, and fee sponsorship so payees are not charged to receive.",
    active: false,
  },
];

function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {lede ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {lede}
          </p>
        ) : null}
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-3.5 sm:px-8">
          <a href="#top" className="text-[15px] font-semibold tracking-tight">
            FlowRail
          </a>
          <nav className="ml-auto hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#security" className="transition-colors hover:text-foreground">
              Security
            </a>
            <a href="#tiers" className="transition-colors hover:text-foreground">
              Trust tiers
            </a>
            <a href="#status" className="transition-colors hover:text-foreground">
              Status
            </a>
          </nav>
          <div className="ml-auto md:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-20 sm:px-8 md:pb-28 md:pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Building on Moderato testnet
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.03] tracking-[-0.035em] text-balance sm:text-6xl md:text-7xl">
            Forty payees. One signature.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            FlowRail is payout operations for businesses on Tempo. You define the
            rules once. Every run is checked against them, batched into a single
            transaction, and settled on a stablecoin rail your finance team can
            reconcile.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#how"
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              See how a run works
            </a>
            <a
              href="#security"
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              How the keys work
            </a>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              { k: "Signatures per run", v: "1" },
              { k: "Payees per run", v: "Unbounded" },
              { k: "Keys FlowRail can widen", v: "0" },
            ].map((stat) => (
              <div key={stat.k} className="bg-card px-6 py-7">
                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.v}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{stat.k}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Problem */}
        <Section
          id="problem"
          eyebrow="The problem"
          title="Payroll does not break at settlement. It breaks in the approval queue."
          lede="Moving to a stablecoin rail does not remove the hard part of paying many people. It moves the hard part somewhere with no chargebacks and no support line."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {PROBLEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h3 className="text-base font-medium tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* How it works */}
        <Section
          id="how"
          eyebrow="How it works"
          title="Rules in, one atomic batch out."
          lede="The policy engine is what makes this safe. It is not a confirmation dialog with better copy — it is a deterministic decision about every line before anything is signed."
        >
          <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border">
            {PIPELINE.map((stage) => (
              <li
                key={stage.step}
                className="grid gap-3 bg-card px-6 py-7 sm:grid-cols-[64px_1fr_1.1fr] sm:gap-8 sm:px-8"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {stage.step}
                </span>
                <h3 className="text-base font-medium tracking-tight">
                  {stage.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {stage.body}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Security */}
        <section id="security" className="border-t border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-24">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Security model
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              We never hold the key that can move anything you did not already
              authorize.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              This is a custody question, so here is the precise version rather
              than a slogan. We do hold credentials — that is unavoidable for any
              system that acts on your behalf. What we do not hold is the ability
              to create new ones, redirect them, or change their limits.
            </p>

            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {SECURITY.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border bg-background p-6"
                >
                  <h3 className="text-base font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-lg border border-border bg-background p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Stated honestly:
                </span>{" "}
                a full compromise of FlowRail&rsquo;s servers would let an
                attacker spend the authorization you have already granted, up to
                its recipient, amount, and expiry. It would not let them reach
                anything beyond that. That is a smaller blast radius than a
                hosted custodial wallet, not zero.
              </p>
            </div>
          </div>
        </section>

        {/* Trust tiers */}
        <Section
          id="tiers"
          eyebrow="Trust tiers"
          title="Routine pay should not cost a signature."
          lede="Each line resolves to a tier from fixed rules before you see anything. The signature you give is for a line that genuinely needed a human."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={
                  tier.accent
                    ? "rounded-lg border border-primary/40 bg-card p-6 ring-1 ring-primary/20"
                    : "rounded-lg border border-border bg-card p-6"
                }
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {tier.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {tier.needs}
                  </span>
                </div>
                <p className="mt-4 font-mono text-xs text-foreground">
                  {tier.trigger}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {tier.detail}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Why Tempo */}
        <Section
          id="tempo"
          eyebrow="Why Tempo"
          title="The rail does the enforcing, so we do not have to."
        >
          <div className="grid gap-6 md:grid-cols-2">
            {TEMPO.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h3 className="text-base font-medium tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Status */}
        <Section
          id="status"
          eyebrow="Status"
          title="We are verifying the protocol before we build on it."
          lede="Scoped keys and revocation are the load-bearing assumptions of the entire design. If they do not behave as documented on the testnet we are deploying against, the architecture changes — so that is the first thing being proven."
        >
          <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border">
            {ROADMAP.map((item) => (
              <li
                key={item.status}
                className="grid gap-2 bg-card px-6 py-7 sm:grid-cols-[88px_1fr] sm:gap-8 sm:px-8"
              >
                <span
                  className={
                    item.active
                      ? "text-sm font-medium text-primary"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {item.status}
                </span>
                <div>
                  <h3 className="text-base font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-sm text-muted-foreground">
            Network:{" "}
            <span className="font-mono text-foreground">Moderato</span>{" "}
            &middot; chain ID{" "}
            <span className="font-mono text-foreground">42431</span> &middot;
            settlement asset{" "}
            <span className="font-mono text-foreground">pathUSD</span> (testnet)
          </p>
        </Section>
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
