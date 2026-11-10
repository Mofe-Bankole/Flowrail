import { Reveal } from "@/components/scenes/primitives";
import { EXPLORER, explorerTx, proofs } from "@/lib/evidence";

/**
 * Proof — every probe we ran against Moderato, refusals first-class.
 * Then the honest list: what is not true yet, stated in the same breath.
 */
export function Proof() {
  const reverted = proofs.filter((p) => p.outcome === "reverted").length;

  return (
    <section id="proof" className="scroll-mt-20 border-t border-border/70 py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">Evidence</p>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
              {proofs.length} probes. {reverted} refusals. The refusals are the point.
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-muted-foreground">
              A dashboard can say anything. These are transactions we sent to
              Tempo&apos;s Moderato testnet to try to break our own constraints.
              Where the chain said no, that is the control working — enforced by
              a contract, not by FlowRail&apos;s bookkeeping.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="tnum font-serif text-5xl text-primary">{reverted}</p>
                <p className="text-[12px] text-muted-foreground">reverted</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="tnum font-serif text-5xl">{proofs.length - reverted}</p>
                <p className="text-[12px] text-muted-foreground">accepted</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="tnum font-serif text-5xl">0</p>
                <p className="text-[12px] text-muted-foreground">hashes invented</p>
              </div>
            </div>
            <a
              href={EXPLORER}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary underline-offset-4 hover:underline"
            >
              Open the Tempo testnet explorer <span aria-hidden="true">↗</span>
            </a>
          </Reveal>

          <ol className="space-y-2.5">
            {proofs.map((p, i) => {
              const no = p.outcome === "reverted";
              return (
                <Reveal as="li" key={p.id} delay={Math.min(i * 50, 300)}>
                  <article
                    className={`group rounded-row border p-5 transition-[box-shadow,transform] dur-standard ease-standard hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] ${
                      no ? "border-primary/35 bg-card" : "border-border bg-card/60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                          no ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      >
                        {no ? (
                          <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="text-[15px] font-medium tracking-tight">{p.claim}</h3>
                          <span
                            className={`text-[10px] font-semibold tracking-[0.16em] uppercase ${
                              no ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {p.outcome}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] text-foreground/80">{p.attempt}</p>
                        {p.baseline ? (
                          <p className="mt-2 inline-flex rounded-pill bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive">
                            The unsafe default FlowRail exists to close
                          </p>
                        ) : null}
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{p.detail}</p>
                        {p.tx ? (
                          <a
                            href={explorerTx(p.tx)}
                            target="_blank"
                            rel="noreferrer"
                            className="tnum mt-2.5 inline-flex max-w-full items-center gap-1.5 text-[12px] text-primary underline-offset-4 hover:underline"
                          >
                            <span className="truncate">
                              {p.txLabel} · {p.tx.slice(0, 12)}…{p.tx.slice(-6)}
                            </span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          <p className="mt-2.5 text-[12px] text-muted-foreground">
                            Rejected before a transaction existed — no hash to link.
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

const plainly = [
  {
    title: "Nothing in this run has settled.",
    body: "The desk reports its own settled count, and it is zero. The transfers above are probes, not payouts. This is testnet software; it holds no production funds.",
  },
  {
    title: "There is no atomic batch on Moderato.",
    body: "wallet_sendCalls is rejected outright. Legs settle one by one with a receipt each, and we do not claim single-transaction settlement.",
  },
  {
    title: "Tempo's docs promised weekly spending windows.",
    body: "The deployed chain does not have them, so we built to what exists: a key that dies Thursday cannot be spent again on Friday. Expiry and renewal are the control.",
  },
  {
    title: "A server compromise is a smaller blast radius, not zero.",
    body: "Full control of FlowRail's servers would let an attacker spend authorisation already granted — up to each key's recipient, amount and expiry. Nothing beyond that.",
  },
];

export function Plainly() {
  return (
    <section className="border-t border-border/70 bg-foreground py-24 text-background lg:py-28">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[12px] font-semibold tracking-[0.18em] uppercase opacity-60">Stated plainly</p>
          <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
            What is not true yet, in the same breath as what is.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-card bg-background/15 sm:grid-cols-2">
          {plainly.map((p, i) => (
            <Reveal key={p.title} delay={i * 70} className="bg-foreground p-7 sm:p-8">
              <p className="tnum text-[12px] opacity-50">0{i + 1}</p>
              <h3 className="mt-3 font-serif text-2xl leading-snug text-balance">{p.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed opacity-70">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
