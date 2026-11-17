import { Reveal } from "@/components/scenes/primitives";

/**
 * Pilot sign-up. The form itself lives with a hosted form service (Tally,
 * Formspree, …) so the site needs no database. Set NEXT_PUBLIC_WAITLIST_URL in
 * Vercel to the form's public link; until it is set, the section renders
 * nothing rather than a dead button.
 */
const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL;

export function Waitlist() {
  if (!WAITLIST_URL) return null;

  return (
    <section id="pilot" className="scroll-mt-20 border-t border-border/70 py-20 lg:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <Reveal className="panel-deep grid grid-cols-1 items-center gap-8 rounded-card p-7 sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_auto]">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">Pilot</p>
            <h2 className="mt-3 font-serif text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              Pay ten or more people a month in stablecoins?
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              We are running testnet pilots with real payee lists: your run, one
              approval, a key per payee. It is testnet software — no production
              funds move — and it takes about half an hour.
            </p>
          </div>
          <a
            href={WAITLIST_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-raised)] transition-[background-color,transform] dur-fast ease-standard hover:bg-primary-strong active:scale-[0.98]"
          >
            Join the pilot list <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
