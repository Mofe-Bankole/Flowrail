import { Reveal } from "@/components/scenes/primitives";
import { ARCHITECTURE_URL, PITCH_DECK_URL } from "@/lib/demo";
import { EXPLORER } from "@/lib/evidence";
import { Mark } from "./mark";
import { REPO } from "./nav";

export function Demo() {
  return (
    <section id="demo" className="scroll-mt-20 overflow-x-clip border-t border-border/70 py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">Demo</p>
          <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
            Two minutes on the desk.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            The run, the split between what released itself and what is
            waiting, the held line, and the ledger underneath it.
          </p>
        </Reveal>
        <Reveal delay={100} className="relative mx-auto mt-12 max-w-5xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] opacity-70 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--ring-warm), transparent)" }}
          />
          <div className="panel-deep overflow-hidden rounded-card ring-1 ring-border">
            <div className="flex items-center gap-3 border-b border-border/70 px-4 py-2.5">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
              </div>
              <span className="mx-auto rounded-pill bg-secondary px-3 py-0.5 text-[11px] text-muted-foreground">
                flowrail.vercel.app/app
              </span>
            </div>
            <video
              className="block aspect-video w-full bg-card"
              controls
              preload="none"
              playsInline
              poster="/flowrail-demo-poster.jpg"
            >
              <source src="/flowrail-demo.mp4" type="video/mp4" />
              Your browser cannot play this video. <a href="/flowrail-demo.mp4">Download it</a>.
            </video>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Build() {
  const facts = [
    { k: "Chain", v: "Tempo Moderato · 42431" },
    { k: "Token", v: "pathUSD" },
    { k: "Engine tests", v: "32, no network" },
    { k: "Licence", v: "MIT" },
  ];
  const layers = [
    { name: "domain", body: "Pure policy and types. Imports nothing from the project." },
    { name: "ports", body: "Interfaces the domain and app may depend on." },
    { name: "adapters", body: "The only code allowed to know Tempo exists." },
    { name: "app", body: "Use cases: classify, approve, authorise, settle." },
  ];
  return (
    <section className="border-t border-border/70 bg-surface-sunken py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-[12px] font-semibold tracking-[0.18em] text-primary uppercase">Open source</p>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
              Read the engine. Then try to break it.
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
              The dependency rule runs one way. The web app never imports the
              engine — it reads the artefact the engine exports, so the numbers on
              this page are the numbers the policy produced.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-row border border-border bg-border">
              {facts.map((f) => (
                <div key={f.k} className="bg-card px-4 py-3.5">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{f.k}</dt>
                  <dd className="tnum mt-1 text-[14px] font-medium">{f.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={REPO}
                className="inline-flex h-11 items-center gap-2 rounded-pill bg-foreground px-5 text-[13px] font-semibold text-background transition-[opacity,transform] dur-fast ease-standard hover:opacity-90 active:scale-[0.98]"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View on GitHub
              </a>
              <a
                href={PITCH_DECK_URL}
                className="inline-flex h-11 items-center gap-2 rounded-pill border border-border bg-card px-5 text-[13px] font-medium transition-[background-color,transform] dur-fast ease-standard hover:bg-accent active:scale-[0.98]"
              >
                Pitch deck
              </a>
              <a
                href={EXPLORER}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-pill border border-border bg-card px-5 text-[13px] font-medium transition-[background-color,transform] dur-fast ease-standard hover:bg-accent active:scale-[0.98]"
              >
                Tempo explorer <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="space-y-4">
            <div className="panel-deep overflow-hidden rounded-card">
              <div className="border-b border-border/70 px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Run it yourself
              </div>
              <pre className="tnum overflow-x-auto font-sans px-5 py-4 text-[13px] leading-7">
                <code>
                  <span className="text-muted-foreground"># prove the chain does what we claim</span>
                  {"\n"}npm --prefix spike run agent:new
                  {"\n"}npm --prefix spike run faucet
                  {"\n"}npm --prefix spike run <span className="text-primary">probe:chain</span>
                  {"\n\n"}
                  <span className="text-muted-foreground"># regenerate what this page renders</span>
                  {"\n"}npm --prefix spike run demo:export
                  {"\n"}npm --prefix web run dev
                </code>
              </pre>
            </div>
            <ol className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2">
              {layers.map((l, i) => (
                <li key={l.name} className="bg-card px-5 py-4">
                  <p className="tnum text-[12px] font-semibold text-primary">
                    {i + 1} · src/{l.name}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{l.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="relative overflow-hidden border-t border-border/70 py-28 lg:py-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.5,
          maskImage: "radial-gradient(60% 70% at 50% 50%, black, transparent 75%)",
        }}
      />
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-8">
        <Mark className="size-12 text-primary" />
        <h2 className="mt-8 font-serif text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[1.0] tracking-[-0.02em] text-balance">
          Slow, or exposed — agencies have lived with those two.{" "}
          <span className="text-primary italic">FlowRail, on Tempo, is the third.</span>
        </h2>
        <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted-foreground">
          Bring a month of payouts. Leave with one decision.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="/app"
            className="group inline-flex h-14 items-center gap-2.5 rounded-pill bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-[background-color,transform] dur-fast ease-standard hover:bg-primary-strong active:scale-[0.98]"
          >
            Open the desk
            <span aria-hidden="true" className="transition-transform dur-fast group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href={REPO}
            className="inline-flex h-14 items-center rounded-pill border border-border bg-card px-7 text-[15px] font-medium transition-[background-color,transform] dur-fast ease-standard hover:bg-accent active:scale-[0.98]"
          >
            Read the code
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Mark className="size-5 text-primary" />
          <span className="text-sm font-semibold">FlowRail</span>
          <span className="text-sm text-muted-foreground">· payout operations on Tempo</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <a href="/app" className="hover:text-foreground">Desk</a>
          <a href={REPO} className="hover:text-foreground">GitHub</a>
          <a href={EXPLORER} target="_blank" rel="noreferrer" className="hover:text-foreground">Explorer</a>
          <a href="#proof" className="hover:text-foreground">Evidence</a>
          <a href={ARCHITECTURE_URL} className="hover:text-foreground">Architecture</a>
          <a href={PITCH_DECK_URL} className="hover:text-foreground">Pitch deck</a>
        </nav>
        <div className="tnum text-[12px] text-muted-foreground md:text-right">
          <p>Moderato testnet · chain 42431 · no production funds</p>
          <p className="mt-1">
            Page updated after the 12 Oct submission ·{" "}
            <a
              href={`${REPO}/tree/submission-2026-10-12`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              judged version
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
