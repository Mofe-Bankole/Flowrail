"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet";

export function DeskShell({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            FlowRail
          </Link>
          <p className="text-sm text-muted-foreground">Desk</p>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {wallet.address ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="tabular-nums"
                onClick={() => void wallet.disconnect()}
              >
                {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={wallet.connecting}
                onClick={() => void wallet.connect()}
              >
                {wallet.connecting ? "Opening wallet" : "Connect Tempo Wallet"}
              </Button>
            )}
          </div>
        </div>
      </header>
      {wallet.error ? (
        <p className="border-b border-border bg-card px-6 py-2 text-sm text-destructive">{wallet.error}</p>
      ) : null}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
