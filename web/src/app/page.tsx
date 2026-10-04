import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle";
import { HeroScene } from "@/components/scenes/hero";
import { MechanismScene } from "@/components/scenes/mechanism";
import { SurfacesScene, InspectorScene } from "@/components/scenes/surfaces";
import { FanScene, TraceScene } from "@/components/scenes/trust";
import { FinaleScene } from "@/components/scenes/finale";

export const metadata: Metadata = {
  title: "FlowRail — forty payees, one signature",
  description:
    "FlowRail decides which agency payouts are routine and escalates only the ones that need a person. Built on Tempo.",
};

export default function Landing() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-6 px-5 py-3.5 sm:px-8">
          <a href="#top" className="text-[15px] font-semibold tracking-tight">
            FlowRail
          </a>
          <nav className="ml-auto hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#mechanism" className="transition-colors hover:text-foreground">
              How it decides
            </a>
            <a href="#evidence" className="transition-colors hover:text-foreground">
              Evidence
            </a>
            <a href="/app" className="transition-colors hover:text-foreground">
              Desk
            </a>
          </nav>
          <div className="ml-auto md:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="top">
        <HeroScene />
        <MechanismScene />
        <SurfacesScene />
        <InspectorScene />
        <FanScene />
        <TraceScene />
        <FinaleScene />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm font-medium">FlowRail</p>
          <p className="text-sm text-muted-foreground">
            Moderato testnet · chain 42431 · pathUSD · testnet software, no
            production funds
          </p>
        </div>
      </footer>
    </>
  );
}