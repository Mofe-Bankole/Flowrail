import { ThemeToggle } from "@/components/theme-toggle";
import { REPO_URL } from "@/lib/demo";
import { Mark } from "./mark";

export const REPO = REPO_URL;

const links = [
  { href: "#problem", label: "Why" },
  { href: "#how", label: "How it works" },
  { href: "#rule", label: "The rule" },
  { href: "#proof", label: "Proof" },
  { href: "#demo", label: "Demo" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-6 px-4 py-3 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight transition-colors dur-fast hover:text-primary"
        >
          <Mark className="size-6 text-primary" />
          FlowRail
        </a>
        <nav aria-label="Sections" className="ml-6 hidden items-center gap-6 text-[13px] text-muted-foreground lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors dur-fast hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <a
            href={REPO}
            className="hidden h-10 items-center rounded-pill px-3.5 text-[13px] font-medium text-muted-foreground transition-colors dur-fast hover:text-foreground sm:inline-flex"
          >
            GitHub
          </a>
          <details className="relative lg:hidden">
            <summary className="flex h-10 list-none items-center rounded-pill border border-border px-3.5 text-[13px] text-muted-foreground transition-colors dur-fast hover:text-foreground [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <nav
              aria-label="Sections"
              className="panel-float absolute right-0 mt-2 flex w-52 flex-col rounded-card p-2 text-[14px] shadow-[var(--shadow-deep)]"
            >
              {links.map((l) => (
                <a key={l.href} href={l.href} className="rounded-[8px] px-3 py-2 hover:bg-accent">
                  {l.label}
                </a>
              ))}
              <a href={REPO} className="rounded-[8px] px-3 py-2 hover:bg-accent">
                GitHub
              </a>
            </nav>
          </details>
          <ThemeToggle />
          <a
            href="/app"
            className="hidden h-10 items-center rounded-pill bg-primary px-4 sm:inline-flex text-[13px] font-semibold text-primary-foreground transition-[background-color,transform] dur-fast ease-standard hover:bg-primary-strong active:scale-[0.97]"
          >
            Open the desk
          </a>
        </div>
      </div>
    </header>
  );
}
