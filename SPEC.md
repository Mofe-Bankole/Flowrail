# FlowRail — Build Spec (v1)

**WARNING: This spec is partially superseded.** Protocol facts are now authoritative in:

- `docs/PROTOCOL.md` — what is **actually deployed** on Moderato (42431).
- `docs/SECURITY.md` — security and what FlowRail **cannot** do.
- `docs/PRODUCT.md` — honest product claims (reconstruction; needs user confirmation).

Read those first. This file is preserved as the historical agreement; **where it conflicts,
the `docs/` files win.**

**Status:** agreed direction · Team: Daniel Asaboro · Mofe · Pizelxx · **Chain:** Tempo only.
Solana and AI features are out of scope.

---

## 1. What FlowRail is

A payout-operations layer for agencies that pay many people on Tempo. One customer approval
produces a fleet of per-recipient access keys, each capped to that recipient's amount and killed
by a short expiry. Every payout is memo-tagged and linkable to on-chain proof.

The product is **the rules that govern payouts**, not a wallet or a checkout.

---

## 2. Decisions

| Decision | Choice |
|---|---|
| Network | **Moderato testnet**, chain id `42431` (mainnet deferred) |
| Root key custody | **Customer-held passkey** (P256/WebAuthn, domain-bound). For the spike CLI only: a throwaway local secp256k1 key in `.data/` (gitignored). |
| Policy enforcement | Off-chain policy engine that follows fixed rules, plus **protocol-enforced scopes and absolute caps**. |
| Custom Solidity | **None in v1** |
| Stack | TypeScript (`viem@2.57.2`, `accounts@0.19.0`, `ox`). File-backed storage for the spike; Postgres later. |
| Period budgets | **Lifetime absolute caps.** No rolling spend-period window is assumed. See `docs/PROTOCOL.md` §1. |

---

## 3. Network details

| Property | Value |
|---|---|
| RPC | `https://rpc.moderato.tempo.xyz` |
| Explorer | `https://explore.testnet.tempo.xyz` |
| Faucet | `cast rpc tempo_fundAddress <ADDRESS> --rpc-url https://rpc.moderato.tempo.xyz` |

Testnet stablecoins (6 decimals): pathUSD `0x20c0000000000000000000000000000000000000`,
AlphaUSD `0x20c0…0001`, BetaUSD `0x20c0…0002`, ThetaUSD `0x20c0…0003`.

---

## 4. Architecture

| Plane | Contents | Rule |
|---|---|---|
| Control (FlowRail) | Payees, policies, approvals, reconciliation, audit | Never holds key material that can act on its own. |
| Execution (FlowRail) | Scoped access keys, transaction builder | Can only use keys the customer has authorized, and only within their limits. |
| Settlement (Tempo) | TIP-20, Account Keychain | Enforced by the protocol. |

**Core rule:** If the server is compromised, an attacker can misuse an existing authorization, but
cannot create a new one. The root key lives only on the customer's device. Revocation of a live
key is **customer-triggered only**; FlowRail cannot revoke on the customer's behalf.

---

## 5. Tempo primitives used

| Primitive | Purpose in FlowRail |
|---|---|
| TIP-20 `transferWithMemo` (32 bytes) | Tags each payout to its intended payee and invoice reference. |
| Access keys: recipient scopes | A key can only pay listed recipients. Scoping is a **separate** transaction (`setAllowedCalls`). See `docs/SECURITY.md` §3. |
| Access keys: **absolute caps** (per token) | Lifetime cap enforced on-chain. No period window is used on Moderato. |
| Key expiry | Short TTL (12h/7d) enforced on-chain; primary containment mechanism. |
| Witness (TIP-1053) | Binds a signed authorization to context; burning invalidates a *signed-but-unsubmitted* authorization only — **not** a live-key kill switch. |
| Passkeys (P256/WebAuthn) | Customer approves with device credentials. |

**What we explicitly do NOT rely on:** rolling `period` budgets, the canonical
7-parameter `authorizeKey` with scopes-in-one-call, `getRemainingLimitWithPeriod`,
or an admin-controlled runtime kill switch.

### ABI and deployment status (VERIFIED 2026-10-01)

- **Deployed `authorizeKey`:** `0x54063a55` — signature `(address,uint8,uint64,bool,(address,uint256)[])`. No period field. No scopes-in-call.
- **Canonical (not deployed on Moderato):** `0x203e2736` includes period/scopes; **not recognised**.
- Account precompile: `0xAAAAAAAA00000000000000000000000000000000` (code `0xef`).
- Signature types: `0` secp256k1, `1` raw P256, `2` WebAuthn.
- **Do not hand-roll encoding.** Use `viem/tempo`'s first-class actions. See `docs/PROTOCOL.md` for full selector set.

---

## 6. Trust tiers

| Tier | When it applies | Key used | Blast radius if server compromised |
|---|---|---|---|
| **auto** | Payee stable ≥ 7 days, amount ≤ $500 | Standing key | At most its absolute cap, to that single payee only |
| **finance** | Stable address, $500 < amount ≤ $2,000 | One-time key (12h expiry) | Only that payout |
| **dual** | Address new/recently changed **or** amount > $2,000 | One-time key + explicit review (12h expiry) | Only that payout |

**Note:** amount alone never produces `dual` (address-vouching is what determines `dual` vs
`finance`). See `docs/DECISIONS.md` D4.

---

## 7. Payee lifecycle

```
PENDING → VERIFIED → STABLE      (any address change or human demotion → PENDING / SUSPENDED)
```

1. Only `STABLE` addresses (approved and unchanged for N days, default 7) are candidates for
   a standing key.
2. An address change counts as demotion; the next payout uses a one-time key and escalates
   appropriately.
3. Renewal of standing keys is driven by expiry; customer approval is required.

---

## 8. Authorization artifact

`witness = keccak256(canonical(artifact))`, stored in the `KeyAuthorization`.

```text
artifact_version, business_id, policy_id, policy_version,
payee_id, payee_address, amount, token, invoice_ref,
batch_id, leg_id,
approvals[{approver, role, signed_at, sig_hash}],
valid_after, valid_before
```

> Budgets in the artifact omit `period` (not present on deployed Moderato).

---

## 9. Components

| Component | Responsibility |
|---|---|
| **Policy engine** | Pure function over values (no I/O, clock passed as parameter). |
| **Key manager** | Derives key IDs, authorizes keys via `viem/tempo`, and confirms scoping on-chain. |
| **Reconciler** | Matches `transferWithMemo` to payees by memo. |
| **Executor** | Builds atomic batches; never assumes success. |
| **Audit log** | Append-only. Records *why* every decision was made (tier + reason strings). |
| **Approval screen** | Shows every leg and its reason. Discloses that revocation is customer-only. |

---

## 10. Build phases

**Phase 1 — Protocol spike (gate).** In `spike/`, with results in `spike/SPIKE.md`:

1. Get a funded throwaway root, confirm chain id, head, pathUSD balance.
2. **Fix `authorizeKey`** to return the actual key it authorized (see `docs/HANDOFF.md` §4.1).
3. Authorize one key and read it back via `getKey`. Determine `getKey` layout (Q3).
4. **Probe fail-open** (Q1). Is a fresh key unrestricted before `setAllowedCalls`? If yes,
   mandate immediate scoping before treating a key as usable.
5. **Probe period** (Q2). Does an authorization carrying `period` revert/ignore/downgrade?
6. `probe:boundaries`: over-cap, wrong recipient, expired key all revert; record tx hashes.

**Phase 2 — Policy layer.** Unit tests for `domain/policy.test.ts` with zero RPC.

**Phase 3 — Use cases.** `src/app/` composed against ports.

**Phase 4 — Product UI.** See `docs/UI.md`. Do not mix with `web/` (landing).

**Phase 5 — Demo.** `$2,500` invoice → reconciliation → 40 payouts (39 auto, 1 finance for Jane
`$1,850`) → atomic batch → explorer-backed audit trail.

---

## 11. Open items

- **Product confirmation.** The five questions in `docs/PRODUCT.md` §8 remain unanswered.
- **Fail-open default** (Moderato) — unknown until probed.
- **`getKey` populated layout** — unknown until probed.
- **Period handling** — must be ruled out with evidence.

---

## 12. Before mainnet

Revocation drill, sanctions considerations, audit log retention, liability, and passkey
funding/on-ramp. `SECURITY.md` governs the disclosure boundary; never overstate the
"non-custodial" technical control.
