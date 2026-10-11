import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle";
import { HeroScene } from "@/components/scenes/hero";
import { MechanismScene } from "@/components/scenes/mechanism";
import { InspectorScene } from "@/components/scenes/surfaces";
import { FanScene, TraceScene } from "@/components/scenes/trust";
import {
  CtaScene,
  QuoteBand,
  SiteFooter,
  StatsScene,
  ValueScene,
} from "@/components/scenes/story";
import { REPO_URL } from "@/lib/demo";

export const metadata: Metadata = {
  title: "FlowRail — forty payees, one signature",
  description:
    "Slow, or exposed — agencies have lived with those two. FlowRail, on Tempo, is the third. One approval becomes per-recipient payout keys the chain enforces.",
  openGraph: {
    title: "FlowRail — forty payees, one signature",
    description:
      "Payout ops for agencies on Tempo. One approval becomes per-recipient keys capped to each payout, locked to one address, and enforced by the chain.",
    url: "/",
    siteName: "FlowRail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowRail — forty payees, one signature",
    description:
      "Payout ops for agencies on Tempo. One approval becomes per-recipient keys the chain enforces.",
  },
};

export default function Landing() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-6 px-5 py-3.5 sm:px-8">
          <a
            href="#top"
            className="text-[15px] font-semibold tracking-tight transition-colors dur-fast hover:text-primary"
          >
            FlowRail
          </a>
          <nav className="ml-auto hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#product" className="transition-colors hover:text-foreground">
              Product
            </a>
            <a href="#mechanism" className="transition-colors hover:text-foreground">
              How it decides
            </a>
            <a href="#evidence" className="transition-colors hover:text-foreground">
              Evidence
            </a>
            <a href="/app" className="transition-colors hover:text-foreground">
              Desk
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              GitHub
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <details className="group relative md:hidden">
              <summary className="flex h-10 cursor-pointer list-none items-center rounded-pill border border-border px-4 text-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
                Menu
              </summary>
              <nav className="panel-float absolute right-0 mt-2 flex w-48 flex-col rounded-card p-2 text-sm shadow-[var(--shadow-deep)]">
                <a href="#product" className="rounded-[8px] px-3 py-2 hover:bg-muted/50">Product</a>
                <a href="#mechanism" className="rounded-[8px] px-3 py-2 hover:bg-muted/50">How it decides</a>
                <a href="#evidence" className="rounded-[8px] px-3 py-2 hover:bg-muted/50">Evidence</a>
                <a href="/app" className="rounded-[8px] px-3 py-2 hover:bg-muted/50">Desk</a>
                <a href={REPO_URL} target="_blank" rel="noreferrer" className="rounded-[8px] px-3 py-2 hover:bg-muted/50">GitHub</a>
              </nav>
            </details>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="top">
        <HeroScene />
        <ValueScene />
        <MechanismScene />
        <FanScene />
        <StatsScene />
        <QuoteBand />
        <InspectorScene />
        <TraceScene />
        <CtaScene />
      </main>

      <SiteFooter />
    </>
  );
}