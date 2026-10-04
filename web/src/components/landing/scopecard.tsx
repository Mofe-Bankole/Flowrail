"use client";

import { useState } from "react";
import { exceptionLeg, shortAddress } from "@/lib/demo";
import { explorerTx } from "@/lib/evidence";

const LOCK_TX = "0x0b156dd779e0c9ffa64c0ef1a019f98018cead856946c0466ed4d7f4d3c29579";
const ALLOWED_TX = "0x09acb34e21bf26df67d68293cff406032bb67dbc6724f9b25008cc231aadf4f4";

/**
 * The security claim, made operable instead of asserted.
 *
 * The addresses here are illustrative — the point is the shape of the rule. The
 * behaviour is not invented: both outcomes below are transactions we executed
 * on Moderato, linked at the foot of the card.
 */
export function ScopeCard() {
  const [target, setTarget] = useState<"allowed" | "other">("other");

  const accepted = target === "allowed";

  return (
    <div className="overflow-hidden rounded-card border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-serif text-lg tracking-tight">One key, three limits</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Every key FlowRail holds is bounded by what you authorised. Try to move
          it.
        </p>
      </div>

      <dl className="divide-y divide-border">
        {[
          { k: "Recipient", v: exceptionLeg ? shortAddress(exceptionLeg.address) : "—", locked: true },
          { k: "Amount", v: `${exceptionLeg ? exceptionLeg.amount : "0.00"} pathUSD, lifetime`, locked: true },
          { k: "Expires", v: "12 hours · 7 days if standing", locked: true },
        ].map((row) => (
          <div key={row.k} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
            <dt className="text-sm text-muted-foreground">{row.k}</dt>
            <dd className="flex items-center gap-2 text-sm tabular-nums">
              {row.v}
              {row.locked ? (
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect x="3.25" y="7" width="9.5" height="6.5" rx="1.5" />
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                </svg>
              ) : null}
              <span className="sr-only">locked</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-border bg-muted/40 px-5 py-4">
        <p className="text-sm font-medium">Attempt a payment</p>
        <div
          className="mt-2.5 inline-flex rounded-pill border border-border bg-card p-0.5"
          role="group"
          aria-label="Choose the destination address"
        >
          {(
            [
              ["allowed", "Allowlisted address"],
              ["other", "Any other address"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTarget(value)}
              aria-pressed={target === value}
              className={[
                "min-h-control-sm rounded-pill px-3.5 text-[0.8125rem] font-medium",
                "transition-colors duration-[--duration-fast] ease-standard",
                target === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={[
            "mt-3.5 flex items-start gap-2.5 rounded-panel border px-4 py-3 text-sm",
            accepted
              ? "border-primary/30 bg-primary/[0.06]"
              : "border-destructive/30 bg-destructive/[0.06]",
          ].join(" ")}
        >
          <span
            className={accepted ? "mt-0.5 text-primary" : "mt-0.5 text-destructive"}
            aria-hidden="true"
          >
            {accepted ? "✓" : "✕"}
          </span>
          <p>
            {accepted ? (
              <>
                <span className="font-medium">Settled.</span> The destination is the one
                you authorised, so the keychain allows it.
              </>
            ) : (
              <>
                <span className="font-medium">Reverted.</span>{" "}
                <code className="text-[0.8125rem]">
                  Account keychain error: InvalidCallScope
                </code>
                . The chain refuses before any funds move.
              </>
            )}
          </p>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Addresses shown are illustrative. Both outcomes are real:{" "}
          <a
            href={explorerTx(ALLOWED_TX)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            allowed transfer
          </a>
          ,{" "}
          <a
            href={explorerTx(LOCK_TX)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            the lock that refused the other
          </a>
          .
        </p>
      </div>
    </div>
  );
}