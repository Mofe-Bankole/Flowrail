"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWallet } from "@/lib/wallet";

const links = [
  { href: "/app", label: "Run" },
  { href: "/app/reconcile", label: "Reconcile" },
  { href: "/app/approve", label: "Approve" },
  { href: "/app/batch", label: "Batch" },
  { href: "/app/keys", label: "Keys" },
  { href: "/app/audit", label: "Audit" },
];

export function DeskShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const wallet = useWallet();

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            FlowRail
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {links.map((link) => {
              const active = path === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {wallet.address ? (
              <button
                type="button"
                onClick={() => void wallet.disconnect()}
                className="h-10 rounded-md border border-border px-3 text-sm tabular-nums hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
              </button>
            ) : (
              <button
                type="button"
                disabled={wallet.connecting}
                onClick={() => void wallet.connect()}
                className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
              >
                {wallet.connecting ? "Opening wallet" : "Connect Tempo Wallet"}
              </button>
            )}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 text-sm md:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {wallet.error ? (
        <p className="border-b border-border bg-card px-6 py-2 text-sm text-destructive">{wallet.error}</p>
      ) : null}
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
