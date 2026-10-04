"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fires once when the element crosses into view. */
export function useInView<T extends HTMLElement>(
  threshold = 0.35,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [threshold, seen]);

  return [ref, seen];
}

/**
 * Reports which of N scroll steps the reader is currently in. The observer
 * root margin biases the active step toward the middle of the viewport so the
 * state changes where the eye already is.
 */
export function useScrollStep(count: number): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const children = Array.from(
            node.querySelectorAll<HTMLElement>("[data-step]"),
          );
          const mid = window.innerHeight * 0.45;
          let best = 0;
          let bestDist = Infinity;
          children.forEach((child, i) => {
            const box = child.getBoundingClientRect();
            const dist = Math.abs(box.top + box.height / 2 - mid);
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          });
          setStep(Math.min(best, count - 1));
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const child of Array.from(node.querySelectorAll("[data-step]"))) {
      io.observe(child);
    }
    return () => io.disconnect();
  }, [count]);

  return [ref, step];
}

/** Enters once on scroll. Motion is a short rise, never a bare fade. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={
        seen
          ? { animation: `panel-enter 520ms var(--ease-entrance) ${delay}ms backwards` }
          : { opacity: 0 }
      }
    >
      {children}
    </Tag>
  );
}

/** App-window chrome. Used to make a composition read as software, not a card. */
export function Window({
  title,
  meta,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`panel-raised overflow-hidden rounded-panel ${className}`}>
      <div className="flex items-center gap-3 border-b border-border/70 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
        </div>
        <span className="truncate text-[11px] font-medium tracking-wide text-muted-foreground">
          {title}
        </span>
        {meta ? <span className="ml-auto shrink-0">{meta}</span> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function StatusDot({ tone }: { tone: "auto" | "finance" | "idle" }) {
  const toneClass =
    tone === "auto"
      ? "bg-emerald-500"
      : tone === "finance"
        ? "bg-amber-500"
        : "bg-foreground/25";
  return (
    <span className="relative inline-flex size-1.5 shrink-0">
      {tone !== "idle" ? (
        <span className={`absolute inset-0 rounded-full ${toneClass} animate-ping opacity-60`} />
      ) : null}
      <span className={`relative inline-block size-1.5 rounded-full ${toneClass}`} />
    </span>
  );
}

export function TierChip({ tier }: { tier: "auto" | "finance" | "dual" }) {
  const map = {
    auto: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    finance: "text-amber-700 dark:text-amber-400 bg-amber-500/12",
    dual: "text-destructive bg-destructive/10",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${map[tier]}`}
    >
      {tier}
    </span>
  );
}

export function KV({
  k,
  v,
  mono,
}: {
  k: string;
  v: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{k}</dt>
      <dd
        className={`truncate text-[11px] ${mono ? "font-mono" : "tnum"} text-foreground/90`}
      >
        {v}
      </dd>
    </div>
  );
}