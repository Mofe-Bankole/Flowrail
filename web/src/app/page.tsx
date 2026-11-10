import type { Metadata } from "next";

import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { How } from "@/components/landing/how";
import { Rule } from "@/components/landing/rule";
import { RunExplorer } from "@/components/landing/run";
import { Proof, Plainly } from "@/components/landing/proof";
import { Build, Closing, Demo, Footer } from "@/components/landing/close";
import { headline } from "@/lib/demo";

const head = headline();

export const metadata: Metadata = {
  title: `FlowRail — ${head.legs.replace(/\.$/, "")}, ${head.decision.toLowerCase()}`,
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
    description: "Payout ops for agencies on Tempo. One approval becomes per-recipient keys the chain enforces.",
  },
};

/**
 * The landing page. Every figure on it is read from the run the policy engine
 * exported (`src/lib/demo-run.json`) or from on-chain evidence
 * (`src/lib/evidence.ts`); none is typed into a component.
 */
export default function Landing() {
  return (
    <>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-pill focus:bg-card focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Nav />
      <main id="top">
        <Hero />
        <Problem />
        <How />
        <RunExplorer />
        <Rule />
        <Proof />
        <Plainly />
        <Demo />
        <Build />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
