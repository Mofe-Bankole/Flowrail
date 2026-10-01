# Product — FlowRail

> Confirmed with the user on 2026-10-01. The answers in §8 are the spec. Do not reopen them
> without an explicit correction.

---

## 1. One-paragraph summary

Agencies pay many people — freelancers, creators, vendors — and do it badly. Bank transfers are
slow and unverifiable; token payments are fast and provable but force the agency to either hold
an unlimited hot wallet or make the finance team click through 40 separate on-chain signatures.
FlowRail sits in the middle: the customer approves the payout run **once**, and FlowRail derives
a fleet of per-recipient access keys, each capped at one amount and killed by a short expiry.
Money in is matched to payees by memo; money out goes as one atomic batch; every leg is
traceable to its on-chain proof.

## 2. The problem, concretely

A creative agency invoices a client $2,500 and owes it across 40 contributors.

The naive on-chain approach: the agency holds one hot wallet with the full $2,500, unlocked.
Compromise, key error, or a malicious/buggy payout script drains everything at once. Every
alternative is bad in a different direction:

- **One signature per payee** — 40 signatures. Finance teams abandon this.
- **One unlimited key** — no ceiling. The whole point of on-chain payments is to *not* do this.
- **Off-chain bookkeeping, on-chain lump sum** — fast and cheap, but you cannot prove *who* was
  paid *how much*. No per-payee audit trail.

**FlowRail's position:** a *batch* of *bounded* authorizations. One signature to start the run;
N keys that each mean something narrow and mean it only for a while.

## 3. How it works

```
  client ──$2,500──▶ agency account ──▶ reconciliation (memo → payee)
                                            │
                            ┌───────────────┼───────────────┐
                            ▼               ▼               ▼
                      payee A key      payee B key      payee C key ...
                      cap $65          cap $40          cap $120
                      scope: A only    scope: B only    scope: C only
                      expires in 7d    expires in 12h   expires in 7d
                            │               │               │
                            └───────────────┼───────────────┘
                                            ▼
                                  atomic batch payout
                                            ▼
                                    audit trail → explorer
```

1. **Money in.** The client pays the agency. The payment carries a memo identifying the payee.
2. **Reconcile.** Incoming memos are matched against the payee roster to produce intended payouts.
3. **Classify.** Each payout is assigned a tier (below).
4. **Authorize.** One root signature authorizes a *fleet* of access keys — one per payee, each
   scoped to that payee's address, capped at exactly that payee's amount, expiring soon.
5. **Execute.** Transfers go out in one atomic batch. All succeed or all revert.
6. **Prove.** Every decision and transaction is recorded and linked to the explorer.

## 4. Trust tiers

Thresholds live in `spike/src/domain/types.ts` (`POLICY`) and are the single source of truth;
the UI must read them rather than hardcoding numbers.

| Tier | Trigger | Key lifetime | Human action |
|---|---|---|---|
| **auto** | Payee address stable ≥ 7 days, amount ≤ **$500** | 7 days | None |
| **finance** | Stable address, **$500 < amount ≤ $2,000** | 12 hours | Approve the payout |
| **dual** | Address new or recently changed. Amount never produces this tier. | 12 hours | Fresh key **and** explicit review |

**Design intent in the `dual` rule:** amount alone never escalates to `dual`. A large payment to
a long-known address is a *size* problem, not a *trust* problem. `dual` is reserved for
destinations FlowRail has not vouched for. This distinction is worth defending out loud.

## 5. Claims we can and cannot make

This is the honesty ledger. Landing copy and the pitch **must** respect it.

| Claim | Verdict |
|---|---|
| "Each payout has an on-chain hard cap." | ✅ **True.** Absolute per-token cap, enforced by the protocol. |
| "Each key expires automatically." | ✅ **True.** Enforced on-chain. |
| "A key can only pay one payee." | ⚠️ **True only if scopes are set.** `setAllowedCalls` is a second tx and the default is `OPEN`. |
| "Compromise can't drain the whole invoice." | ⚠️ **True**, given the caps — each key is individually bounded. Say *per key*, not *in aggregate*. |
| "Automatic per-week spend limits." | ❌ **False on Moderato.** No rolling window exists. Don't claim it. |
| "There's a kill switch." | ❌ **False.** Revocation is customer/root-only. We cannot revoke a live key. |
| "One signature." | ⚠️ **True with a caveat** — one signature *per key authorization*. The 39 auto keys should be derivable from one approval; the 1 finance key legitimately needs a human. Don't claim one signature for a run that contains a `dual` payout. |

> The "one signature" line is the heart of the pitch and also the easiest place to overclaim.
> Resolve the interaction between the tiers and the signature count **before** the demo, and make
> the number in the pitch match what the demo actually does.

## 6. Demo script (proposed)

Goal: `$2,500` invoice, 40 payouts, `$1,850` to a payee named Jane.

- 39 payouts to established contributors, all under $500 → **auto**, no human.
- 1 payout of **$1,850** to a stable address → **finance**, needs one approval.

Narrative:

1. Show the inbound payment with memo-tagged lines.
2. Show the tier split appearing automatically, with the reason for each escalation.
3. One approval → watch the fleet get authorized (N keys, each visibly scoped and capped).
4. Approve the finance item → the batch executes.
5. Show the audit trail: every leg, with its reason and its explorer link.

**Demo fragility to plan for:** Moderato may reset, killing funded keys. Build a one-command
reseed so the demo can be recovered live. That script is worth more than any polish.

## 7. Deliberate scope cuts

Agreed during the previous session. Re-open deliberately, not accidentally.

| Cut | Rationale |
|---|---|
| Rolling spend periods | Not deployed on Moderato (§1 of `PROTOCOL.md`). |
| A real kill switch | Impossible: revocation is customer/root-only. |
| True 2-of-2 multisig | Heavy; tiered approval is a simpler honest story. |
| Custom Solidity | `viem/tempo` gives first-class authorization. Don't hand-roll crypto. |
| Mainnet | Testnet is fine for a deadline-bound demo. |
| `PaymentGraph` | Not needed for the demo. |
| Solana / multi-provider RPC | Off the critical path. |
| Database, auth, migrations | File-backed is fine until after the demo. |
| AI features | Decoration. Cut. |

## 8. Confirmed answers

1. **Customer:** the agency paying out.
2. **Where money lands:** the agency's own Tempo account. A virtual address plus a memo identifies
   the invoice. FlowRail reads it and never holds the balance.
3. **Daily screen:** the approval queue. Reconciliation is opened when money arrives. Batch
   execute is a consequence, not a destination.
4. **Day 30:** a vouched roster so the next run is not forty signatures, plus an export an
   accountant can hand to a client. The product is the policy, the roster, and the audit trail.
5. **Reconciliation:** memo match is the happy path. An unmatched line is unresolved and goes to
   a human. It is never dropped. CSV import loads a roster or an invoice when the client set no
   memo. It is a fallback, not the product.
6. **Who signs:** the agency, with a passkey on their device. That is the root key. FlowRail holds
   only the short-lived access keys that result.
7. **Signature count:** one approval covers every standing payee under the auto cap. A new or
   changed address, or an amount over $500, needs a person. The demo is 39 automatic and 1
   finance approval. Do not say "one signature" for that run.