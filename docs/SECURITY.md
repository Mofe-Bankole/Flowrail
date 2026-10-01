# Security — threats, invariants, and things we cannot do

This document exists because FlowRail's pitch is a security pitch. Every claim below is either
enforced by the protocol, enforced by FlowRail, or **not true** — and the third category is the
one that gets forgotten until a demo fails.

---

## 1. Custody model

**FlowRail never holds the customer's root key.**

| Key | Who holds it | Lifetime |
|---|---|---|
| **Root** | The **customer**. Passkey / WebAuthn in the product. | Permanent. |
| **Access key** (one per payee) | FlowRail's server, in a file for the spike. | 12 hours – 7 days. |

The spike's local secp256k1 root key is a **test fixture**, not the product architecture. It exists
only because automating a browser passkey flow in a CLI is not worth the time this week.

### What a FlowRail server compromise buys an attacker

Given correctly-scoped keys already exist:

- ✅ Spend up to each key's remaining cap, to that key's scoped recipient(s), until expiry.
- ❌ Cannot create new keys — requires the root signature.
- ❌ Cannot raise an existing cap or extend an expiry.
- ❌ Cannot redirect to a different recipient — the scope forbids it.
- ❌ Cannot revoke the customer's other keys.
- ❌ Cannot recover the root key.

**Phrase this precisely in the pitch:** *per-key* bounded damage, not *"the invoice is safe."*
The mathematical worst case of N independent caps is still their sum. That sum is the **amount of
the payout run** — which is a real reduction, but it is not zero, and we should not pretend
otherwise.

## 2. The `dual`-tier invariant

Amount alone never produces a `dual`-tier key. `dual` is exclusively for **destinations FlowRail
has not vouched for** — a new payee, or a recently changed address.

Rationale: a large payment to a long-known address is a *size* problem, handled by `finance`.
Escalating size to `dual` would make `dual` mean "big" instead of "untrusted," and that dilution
is how trust tiers stop working.

## 3. ⚠️ The fail-open window — highest risk in the design

Moderato's `authorizeKey` has **no scopes parameter**. Scoping is a *second* transaction,
`setAllowedCalls`.

The `accounts` SDK documents the semantics:

| `scopes` value | Meaning |
|---|---|
| `undefined` (omitted) | **UNRESTRICTED** |
| `[]` (empty array) | No calls permitted |
| populated array | Restricted to those contracts/selectors/recipients |

**The open question:** between `authorizeKey` and `setAllowedCalls`, what can a fresh key do?

Three outcomes, three very different products:

1. **Defaults to unrestricted** → there is a real window where a key is fully powerful. Mitigate
   by setting `scopes: []` at authorization if the SDK permits, and always by ordering:
   authorize → immediately scope → only *then* treat the key as usable by any flow.
2. **Defaults to no-calls** → safe by default; scoping only *removes* permissions. Ideal.
3. **Authorization carries scopes off-chain and the chain enforces immediately** → no window.

**Probed 2026-10-01. A fresh key is unrestricted.** An unscoped key spent 1 base unit of
pathUSD to an arbitrary address. Tx `0xa809a8dbf4f0f5df47dabf4c348fa9f98f8cbae53a46ddcf5caab3424b7f4715`.
`getAllowedCalls` returning an empty list does not mean the key is denied. Never mint a key
into a runtime where it can be used before `setAllowedCalls` has been confirmed on-chain.

This is `docs/HANDOFF.md` §6 step 3. Do not reorder the schedule.

## 4. What we cannot do — state it plainly

| Thing | Why not | Where it must be reflected |
|---|---|---|
| **Kill a live key** | `revokeKey` is root/admin-only. The server cannot reach the customer's root key. | UI, pitch, onboarding. **Never imply a panic button.** |
| **Burn a witness to stop money already deployed** | A witness invalidates a *signed-but-unsubmitted* authorization only. | Docs. Not a revocation feature. |
| **Enforce a spend *rate*** | No rolling window on Moderato. | Copy. Use lifetime caps. |
| **Reclaim an expired key's unused allowance** | It is simply dead. | UX: expired ≠ remaining balance. |
| **Guarantee per-period budgets from the protocol** | Not deployed. | Copy. |

## 5. Local hygiene rules — non-negotiable

1. **Never commit key material.** `spike/.data/` is gitignored. Verify with `git status` before
   every commit.
2. **The faucet funds throwaway keys only.** Never fund an address you intend to keep.
3. **Never pass `admin: true`** to key authorization. viem documents that admin keys are
   unrestricted and **ignore `expiry`, `limits`, and `scopes`**. It is precisely the inverse of
   every property FlowRail claims.
4. **Never handle the root key in `app/` or `adapters/tempo`.** Root authorization is a customer
   action. The spike's local signer exists because there is no browser in a CLI.
5. **Memo is not security.** The 32-byte memo tags the intended payee for reconciliation and
   makes rerouting *detectable*. It is not an access control — scoping is. Do not describe it as
   protection against misrouting.
6. **No hand-rolled crypto.** Use `viem/tempo`. Never hand-assemble RLP, digests, or signatures.

## 6. Memo design

`transferWithMemo(to, amount, memo)` — the memo is 32 bytes and encodes the payee id.

Purpose: reconciliation, and making a rerouted payment *detectable* after the fact.

**Not** a control. A key scoped to the correct recipient is what prevents misrouting; the memo
only proves afterwards what should have happened. Conflating the two would be a security
overclaim.

## 7. Invariants worth an assertion

1. **One key per (payee, token).** Never share a key across payees.
2. **`cap ≤ payout amount`.** A key's cap is set to the exact amount owed, never the run total.
3. **`expiry` is bounded.** Standing ≤ 7 days, one-time ≤ 12 hours. No `Infinity`, no 0.
4. **Scoped before usable.** Never surface a key to a payout path before its scope is confirmed
   on-chain.
5. **The protocol is the enforcement point.** `keyUsableAt` is UX greying-out, not security. The
   chain reverts regardless of what FlowRail believes. Never present a green UI state as a
   guarantee that a transfer will succeed.
6. **Unresolvable payee ⇒ `dual`.** Never silently drop an unmatched invoice line
   (`policy.ts:55-84`). Dropping it would pay nobody while looking successful.

## 8. Threat notes

**Attacker obtains a FlowRail access key from the server.**
Bounded by cap, scope, and expiry. Mitigated by per-payee keys rather than one run-wide key.
**Residual:** the sum of all live caps. Mitigated by short TTLs.

**Attacker substitutes a payee address in the roster.**
Caught by the `dual` tier — a new or recently-changed address is never auto-approved.

**Attacker replays an authorization.**
Expiry bounds the window; witness supports binding to a server-issued challenge before submission.

**Moderato resets.**
Not a security event, but destroys demo credibility. Mitigate with a one-command reseed script and
by recording tx hashes in `spike/SPIKE.md`.

**A customer expects to revoke a key immediately.**
They cannot, unless they hold the root key. This must be disclosed *before* they authorize, not
discovered during an incident.