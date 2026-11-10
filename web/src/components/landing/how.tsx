import { Reveal } from "@/components/scenes/primitives";
import { autoLegs, formatUsd, run, shortAddress } from "@/lib/demo";
import { explorerTx, proofs } from "@/lib/evidence";
import { lifetime, policy } from "@/lib/policy";

const steps = [
  {
    n: "01",
    title: "Approve once",
    body: "The agency's root key signs the run. It is never handed to a server and never spends a payout itself.",
  },
  {
    n: "02",
    title: "Mint and lock a key per payee",
    body: "authorizeKey sets the cap and expiry; setAllowedCalls binds the key to one recipient and one call. Two transactions, because Moderato's authorizeKey takes no scopes.",
  },
  {
    n: "03",
    title: "Split the run by rule",
    body: "Each line resolves to a tier before anyone looks. Routine lines release. The rest say exactly why they are waiting.",
  },
  {
    n: "04",
    title: "Release with a memo",
    body: "Each leg settles with a memo that ties it to the invoice, and a receipt of its own. Every payout links back to on-chain proof.",
  },
];

/** The median routine payout — a representative key, not the flattering one. */
const sample = [...autoLegs].sort((a, b) => Number(a.amount) - Number(b.amount))[
  Math.floor(autoLegs.length / 2)
];

const proofById = Object.fromEntries(proofs.map((p) => [p.id, p]));

export function How() {
  const constraints = [
    {
      k: "Recipient",
      v: `${shortAddress(sample.address)} only`,
      note: "Any other address reverts with InvalidCallScope.",
      proof: proofById["locked-denied"],
    },
    {
      k: "Amount",
      v: `$${formatUsd(Number(sample.amount))} lifetime`,
      note: "One base unit over the cap reverts.",
      proof: proofById["over-cap"],
    },
    {
      k: "Expiry",
      v: lifetime(policy.standingTtlHours),
      note: "A transfer 70 seconds after expiry reverted.",
      proof: proofById["expired"],
    },
    {
      k: "Call",
      v: "transfer, one address",
      note: "setAllowedCalls is what turns a scoped key from intent into enforcement.",
      proof: proofById["lock"],
    },
  ];

  return (
    <section id="how" className="scroll-mt-20 border-t border-border/70 bg-surface-sunken py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">How it works</p>
              <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
                The policy is not in our code. It is in the key.
              </h2>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
                FlowRail decides what is routine. Tempo&apos;s account keychain
                decides what is possible. If FlowRail gets a line wrong, the chain
                still refuses it.
              </p>
            </Reveal>

            <ol className="relative mt-12 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-border">
              {steps.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 80} className="relative flex gap-5">
                  <span className="tnum relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-[11px] font-semibold text-primary">
                    {s.n}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-base font-medium tracking-tight">{s.title}</h3>
                    <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>

          {/* Anatomy of one key. */}
          <Reveal delay={120} className="lg:sticky lg:top-24 lg:self-start">
            <div className="panel-deep overflow-hidden rounded-card">
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Anatomy of one key · {run.id}
                  </p>
                  <p className="mt-1 font-serif text-2xl">{sample.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {sample.role} · address stable {sample.stableForDays}d
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-emerald-500/12 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  auto
                </span>
              </div>

              <ul className="divide-y divide-border/60">
                {constraints.map((c) => (
                  <li key={c.k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 px-6 py-4">
                    <span className="pt-0.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      {c.k}
                    </span>
                    <div className="min-w-0">
                      <p className="tnum flex items-center gap-2 text-[15px] font-medium">
                        <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-primary" fill="none" aria-hidden="true">
                          <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        {c.v}
                      </p>
                      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{c.note}</p>
                      {c.proof?.tx ? (
                        <a
                          href={explorerTx(c.proof.tx)}
                          target="_blank"
                          rel="noreferrer"
                          className="tnum mt-1.5 inline-flex items-center gap-1 text-[12px] text-primary underline-offset-4 hover:underline"
                        >
                          {c.proof.outcome === "reverted" ? "Refused on-chain" : "Accepted on-chain"} ·{" "}
                          {c.proof.tx.slice(0, 10)}…
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border/70 bg-secondary/50 px-6 py-3.5 text-[12px] leading-relaxed text-muted-foreground">
                Escalated lines get a one-time key that lives{" "}
                {lifetime(policy.oneTimeTtlHours)}, not {lifetime(policy.standingTtlHours)}.
                Renewal is the control.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
