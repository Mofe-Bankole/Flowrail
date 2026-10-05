"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWallet } from "@/lib/wallet";

/**
 * The shell is deliberately thin: identity, and a theme toggle.
 *
 * There is no sidebar and no navigation, because there is only one screen. The
 * wallet control used to live here, disconnected from anything it affected; it
 * now sits on the held line itself, where it is obviously about signing that
 * line. Technical detail is not here either — it is a disclosure at the bottom
 * of the desk.
 */
export function DeskShell({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            FlowRail
          </Link>
          <span className="text-[13px] text-muted-foreground">Desk</span>
          <div className="ml-auto flex items-center gap-3">
            {wallet.address ? (
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                connected · {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
              </span>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </header>
      {wallet.error ? (
        <p className="border-b border-border bg-card px-5 py-2 text-[13px] text-destructive sm:px-8">
          {wallet.error}
        </p>
      ) : null}
      <main className="mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8 lg:py-14">
        {children}
      </main>
    </div>
  );
}