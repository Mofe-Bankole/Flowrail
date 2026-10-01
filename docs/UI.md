# UI — product screens and flows

> ⚠️ Depends on unconfirmed product assumptions. See `docs/PRODUCT.md`. Confirm before building.

The marketing landing page under `web/` is **done and separate** from this. This document is the
actual application: the screens a finance operator uses to move money.

---

## Design constraints (settled — do not relitigate)

- **Brand**: Mercury Warm. Tokens already live in `web/src/app/globals.css` as CSS custom
  properties. **Never hardcode a colour** — read the token. Light and dark are both defined.
- **Type**: Instrument Sans for UI/body, Instrument Serif 400 for display. Instrument Serif has
  only weight 400, so **`font-semibold` on it silently does nothing.** There is **no application
  mono font** — tabular numerals come from `font-variant-numeric: tabular-nums`.
- **Copy honesty**: no fake metrics, no testimonials, no period-budget claims, no implied kill
  switch. See `docs/PRODUCT.md` §5.
- **Accessibility**: the landing page already passes WCAG AA. Hold that line.
- **Motion**: respect `prefers-reduced-motion`. The landing hero already does.

## Key tokens

| Token | Light | Role |
|---|---|---|
| `--background` | `oklch(98.5% 0.005 75)` | Page |
| `--foreground` | `oklch(20% 0.015 70)` | Text |
| `--primary` | `oklch(45% 0.14 60)` | Primary action (warm ochre) |
| `--muted` | `oklch(96.5% 0.005 75)` | Secondary surfaces |
| `--muted-foreground` | `oklch(35% 0.014 70)` | Labels |
| `--border` | `oklch(87.5% 0.012 75)` | Dividers |
| `--destructive` | `oklch(50% 0.2 27)` | Errors, revocations |

Dark mode flips lightness, keeps hue. `--radius: 0.5rem`.

---

## Screen 1 — Connect & Approve

**The most important screen. It carries the entire security story.**

What the customer sees before signing anything:

- Total to be authorized, token-denominated, with the decimals right (6dp).
- The **fleet summary**: *N keys, one per payee*, each showing recipient, exact cap, expiry.
- A plain-language scope statement: **"Each key can only pay one person, only that amount, only
  until that time."**
- Whether FlowRail retains anything. It must say **no root key is retained.**
- An honest revocation note: the customer can revoke; FlowRail cannot. See `SECURITY.md` §4.

Design constraints:
- Do **not** render it as a legal-wall consent screen. It is a *summary of what you are about to
  delegate*, and it should read like a receipt.
- Never show a "signed 40 payments" claim. It is N bounded authorizations, and the count of
  *human* signatures may be > 1 when the run contains a `dual` payout.
- Every number on this screen must come from `POLICY` and the derived fleet, not from copy.

## Screen 2 — Invoice & Reconciliation

Money in, matched to people out.

- Inbound payments with their memos, matched against the roster.
- Matched / ambiguous / unresolved states must be visually distinct.
- Unresolved lines route to `dual`. Never silently dropped (`SECURITY.md` §7.6).
- Edit the roster inline; mark an address as verified/unverified.

This is where `docs/PRODUCT.md` §8 question 5 gets answered. If reconciliation is manual (CSV +
confirm), this is the primary screen and needs to be excellent, not a placeholder.

## Screen 3 — Finance Approval Queue

The human-in-the-loop surface. Should be the calmest screen in the product.

- One card per escalated payout: payee, amount, **and the reason string from `TierDecision.reasons`.**
- `finance` (size) and `dual` (unvouched destination) must look *different*. A size problem and a
  trust problem are not the same decision.
- Approve / reject / inspect.
- Show the key that will be used, or that a new one will be minted.

**The reason string is the product.** A rejection a human cannot explain is a rubber stamp.
Render `decision.reasons` verbatim; never flatten it to "needs approval."

## Screen 4 — Batch Preview & Execute

- The full run grouped by tier.
- Per leg: payee, amount, memo, which key pays it, scope.
- One primary action. All-or-nothing, stated as such.
- Post-execution: receipt with the batch tx hash and a per-leg explorer link.

Before confirming, make the blast radius legible: *maximum remaining exposure across all live
keys*. This is the honest version of "this invoice is protected."

## Screen 5 — Key Fleet

- Every live key: recipient, cap, remaining, expiry countdown, scope, status.
- Statuses come from the domain: `active | exhausted | expired | revoked`.
- `keyUsableAt` greys out dead keys rather than offering a button that will revert.
- **No "revoke" button unless the current user holds the root key.** If FlowRail holds only the
  access key, the affordance is "ask the account owner to revoke" — not a dead button.

## Screen 6 — Audit Trail

- Append-only, from `LedgerPort`.
- Each entry: what was decided, why, by which rule, and the tx hash.
- The reason is as important as the hash.
- Exportable. This is what makes the product defensible months later.

---

## Cross-cutting rules

1. **Never show a green state that the chain has not confirmed.** Optimistic UI is fine for
   *intent*; never for *outcome*.
2. **Amounts**: base units internally, formatted at the edge with `tabular-nums`. Six decimals.
3. **Timestamps**: show relative *and* absolute near expiry. "Expires in 6d 4h" plus a date.
4. **Empty states** are real states: no keys yet, nothing to reconcile, no payouts pending.
5. **Keyboard**: full flow must work without a mouse. Approval screens especially.
6. **Accessibility**: AA contrast minimum in both themes.

## Where the code goes

The product UI is **not** in `web/`. `web/` is the marketing landing page only. Start a new app
(or a route group) once `spike` proves the mechanism — do not mix marketing chrome and product
chrome in one tree. `docs/ARCHITECTURE.md` explains the layering the spike establishes.

## Still undecided

- Reconciliation: automatic memo matching, or CSV upload with confirmation?
- Web app or desktop? Passkey flow behaves differently.
- Is the finance team the customer, or an internal role at the agency?
- Does the fleet view need multi-account support, or is it single-customer for v1?